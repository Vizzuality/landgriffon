import logging
import os
import sys
from contextlib import ExitStack
from io import StringIO
from pathlib import Path

import click
import h3ronpy.raster
import pandas as pd
import psycopg
import rasterio as rio
from psycopg import sql
from rasterio import DatasetReader
from tqdm import tqdm

from data.h3_data_importer.utils import DTYPES_TO_PG, slugify, snakify

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("tif_folder_to_h3_table")


def check_srs(reference_raster: DatasetReader, raster: DatasetReader, _raise: bool = True):
    """Checks that raster has same projection as reference"""
    if reference_raster.crs != raster.crs:
        message = (
            f"Rasters have different CRS: {reference_raster.name} {reference_raster.crs} "
            f"vs {raster.name} {raster.crs}"
        )
        if _raise:
            raise ValueError(message)
        log.error(message)
        sys.exit(1)


def check_transform(reference_raster: DatasetReader, raster: DatasetReader, _raise: bool = True):
    """Checks that raster has same transform as reference"""
    if reference_raster.transform != raster.transform:
        message = (
            f"Rasters have different Transform: {reference_raster.name} {reference_raster.transform} "
            f"vs {raster.name} {raster.transform}"
        )
        if _raise:
            raise ValueError(message)
        log.error(message)
        sys.exit(1)


def raster_to_h3(raster: DatasetReader, h3_resolution: int) -> pd.DataFrame:
    """Convert a raser to a dataframe with h3index -> value

    Uses `h3ronpy.raster.raster_to_dataframe()` which uses already multiprocessing under the hood
    so there's no need to iterate over the raster windows anymore.
    """
    h3 = h3ronpy.raster.raster_to_dataframe(
        raster.read(1),
        transform=raster.transform,
        nodata_value=raster.nodata,
        h3_resolution=h3_resolution,
        compacted=False,
        geo=False,
    )
    return h3


def create_h3_grid_table(connection: psycopg.Connection, table: str, df: pd.DataFrame):
    index = [sql.SQL("h3index h3index PRIMARY KEY")]
    extra = [
        sql.SQL("{} {}").format(sql.Identifier(col), sql.SQL(DTYPES_TO_PG[str(dtype)]))
        for col, dtype in zip(df.columns, df.dtypes)
    ]
    schema = sql.SQL(", ").join(index + extra)
    with connection.cursor() as cur:
        query = sql.SQL("create table {table_name} ({fields})").format(table_name=table, fields=schema)
        log.info(f"Creating table {table}")
        cur.execute(query)


def write_data_to_h3_grid_table(connection: psycopg.Connection, table: str, data: pd.DataFrame):
    with connection.cursor() as cur:
        log.info(f"Writing data to {table}")
        with StringIO() as buffer:
            data.to_csv(buffer, na_rep="NULL", header=False)
            buffer.seek(0)
            cur.copy_from(buffer, table, sep=",", null="NULL")


def clean_before_insert(connection: psycopg.Connection, table: str):
    with connection.cursor() as cur:
        cur.execute(sql.SQL("DROP TABLE IF EXISTS {}").format(sql.Identifier(table)))
        cur.execute(
            'DELETE FROM "material_to_h3" ' 'WHERE "h3DataId" IN (SELECT id FROM "h3_data" WHERE "h3tableName" = %s);',
            (table,),
        )
        cur.execute('delete from "h3_data" where "h3tableName" = %s', (table,))


def insert_to_h3_master_table(
    connection: psycopg.Connection, table: str, df: pd.DataFrame, h3_res: int, year: int, data_type: str, dataset: str
):
    with connection.cursor() as cur:
        for column_name in df.columns():
            cur.execute(
                'INSERT INTO "h3_data" ("h3tableName", "h3columnName", "h3resolution", "year")'
                "VALUES (%s, %s, %s, %s)",
                (table, column_name, h3_res, year),
            )
            log.info(f"Inserted('{table}', '{column_name}', {h3_res}, {year}) into h3_data table.")
            if data_type == "indicator":
                update_for_indicator(cur, dataset, column_name)
            else:
                update_for_material(cur, dataset, column_name, data_type)


def update_for_indicator(cursor: psycopg.Cursor, dataset: str, column_name: str):
    cursor.execute('select id from "indicator" where "nameCode" = %s', (dataset,))
    indicator_id = cursor.fetchone()[0]
    cursor.execute('update "h3_data"  set "indicatorId" = %s where  "h3columnName" = %s', (indicator_id, column_name))
    log.info(f"Updated indicatorId '{indicator_id}' in h3_data for {column_name}")


def update_for_material(cursor: psycopg.Cursor, dataset: str, column_name: str, data_type: str):
    cursor.execute('SELECT id FROM "h3_data" WHERE "h3columnName" = %s', (column_name,))
    h3_data_id = cursor.fetchone()[0]
    # FIXME: the current solution for naming a material datasets is hard to follow and easy to mess up.
    dataset_id = dataset + "_" + snakify(column_name).split("_")[-2]
    cursor.execute('SELECT id FROM "material" WHERE "datasetId" = %s', (dataset_id,))

    type_map = {"harvest_area": "harvest", "production": "producer"}

    delete_query = sql.SQL(
        'DELETE FROM "material_to_h3" WHERE "materialId" = {material_id} AND "type" = {data_type}'
    ).format(
        material_id=sql.Placeholder(),
        data_type=sql.Literal(type_map[data_type]),
    )

    insert_query = sql.SQL(
        'INSERT INTO "material_to_h3" ("materialId", "h3DataId", "type") '
        "VALUES ({material_id}, {h3_data_id}, {data_type})"
    ).format(
        material_id=sql.Placeholder(),
        h3_data_id=sql.Literal(h3_data_id),
        data_type=sql.Literal(type_map[data_type]),
    )
    for material_id in cursor:
        cursor.execute(delete_query, (material_id[0],))
        cursor.execute(insert_query, (material_id[0],))

        log.info(f"Updated materialId '{material_id[0]}' in material_to_h3 for {column_name}")


def to_the_db(df: pd.DataFrame, table: str, data_type: str, dataset: str, year: int, h3_res: int):
    """all the database insertion and manipulation happens here

    This way if we need to separate db stuff from actual data processing it can be done easily
    """
    conn_info = psycopg.conninfo.make_conninfo(
        host=os.getenv("API_POSTGRES_HOST"),
        port=os.getenv("API_POSTGRES_PORT"),
        user=os.getenv("API_POSTGRES_USERNAME"),
        password=os.getenv("API_POSTGRES_PASSWORD"),
    )

    with psycopg.connect(conn_info) as conn:
        create_h3_grid_table(conn, table, df)
        write_data_to_h3_grid_table(conn, table, df)
        clean_before_insert(conn, table)
        insert_to_h3_master_table(conn, table, df, h3_res, year, data_type, dataset)


@click.command()
@click.argument("folder", type=click.Path(exists=True, path_type=Path))
@click.argument("table", type=str)
@click.argument("data_type", type=str)
@click.argument("dataset", type=str)
@click.argument("year", type=int)
@click.option("contextual", is_flag=True, help="If the data has to be referenced in contextual_layers table.")
@click.option("h3-res", "h3_res", type=int, default=6, help="h3 resolution to use")
@click.option("thread-count", "thread_count", type=int, default=4, help="Number of threads to use")
def main(folder: Path, table: str, data_type: str, dataset: str, year: int, h3_res: int):
    """Reads a folder of .tif, converts to h3 and loads into a PG table

    All GeoTiffs in the folder must have identical projection, transform, etc.
    The resulting table will contain a column for each GeoTiff.


    """
    rasters = list(folder.glob("*.tif"))
    with ExitStack() as cm:
        raster_readers = [cm.enter_context(rio.open(raster)) for raster in rasters]
        reference_raster = raster_readers[0]
        h3s = []
        pbar = tqdm(raster_readers)
        for raster_reader in pbar:
            pbar.set_description(raster_reader.name)
            check_srs(reference_raster, raster_reader)
            check_transform(reference_raster, raster_reader)
            h3 = raster_to_h3(raster_reader, h3_res).set_index("h3index")
            h3 = h3.rename(columns={"value": slugify(raster_reader.filename)})
            h3s.append(h3)

    df = h3s[0].join(h3s[1:]) if len(raster_reader) > 1 else h3s[0]
    to_the_db(df, table, data_type, dataset, year, h3_res)


if __name__ == "__main__":
    main()
