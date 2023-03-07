import logging
import multiprocessing
import os
from functools import partial
from io import StringIO
from pathlib import Path

import click
import h3ronpy.raster
import pandas as pd
import psycopg
import rasterio as rio
from psycopg import sql
from rasterio import DatasetReader

from utils import DTYPES_TO_PG, slugify, snakify

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("raster_to_h3")


def check_srs(reference_raster: DatasetReader, raster: DatasetReader):
    """Checks that raster has same projection as reference"""
    if reference_raster.crs != raster.crs:
        message = (
            f"Raster files have different CRS: {reference_raster.name} {reference_raster.crs} "
            f"vs {raster.name} {raster.crs}"
        )
        log.error(message)
        raise ValueError(message)


def check_transform(reference_raster: DatasetReader, raster: DatasetReader):
    """Checks that raster has same transform as reference"""
    if reference_raster.transform != raster.transform:
        message = (
            f"Raster files have different Transform: {reference_raster.name} {reference_raster.transform} "
            f"vs {raster.name} {raster.transform}"
        )
        log.error(message)
        raise ValueError(message)


def raster_to_h3(reference_raster: Path, h3_resolution: int, raster_file: Path) -> pd.DataFrame:
    """Convert a raser to a dataframe with h3index -> value

    Uses `h3ronpy.raster.raster_to_dataframe()` which uses already multiprocessing under the hood
    so there's no need to iterate over the raster windows anymore.
    """
    log.info(f"Converting {raster_file.name} to H3 dataframe")
    with rio.open(raster_file) as raster:
        with rio.open(reference_raster) as ref:
            check_srs(ref, raster)
            check_transform(ref, raster)

        h3 = h3ronpy.raster.raster_to_dataframe(
            raster.read(1),
            transform=raster.transform,
            nodata_value=raster.nodata,
            h3_resolution=h3_resolution,
            compacted=False,
            geo=False,
        ).set_index("h3index")
        # we need the h3 index in the hexadecimal form for the DB
        h3.index = pd.Series(h3.index).apply(lambda x: hex(x)[2:])
        return h3.rename(columns={"value": slugify(Path(raster.name).stem)})


def create_h3_grid_table(connection: psycopg.Connection, table: str, df: pd.DataFrame):
    index = [sql.SQL("h3index h3index PRIMARY KEY")]
    extra = [
        sql.SQL("{} {}").format(sql.Identifier(col), sql.SQL(DTYPES_TO_PG[str(dtype)]))
        for col, dtype in zip(df.columns, df.dtypes)
    ]
    schema = sql.SQL(", ").join(index + extra)
    with connection.cursor() as cur:
        cur.execute(sql.SQL("DROP TABLE IF EXISTS {}").format(sql.Identifier(table)))
        query = sql.SQL("CREATE TABLE {} ({})").format(sql.Identifier(table), schema)
        log.info(f"Creating table {table}")
        cur.execute(query)


def write_data_to_h3_grid_table(connection: psycopg.Connection, table: str, data: pd.DataFrame):
    with connection.cursor() as cur:
        log.info(f"Writing H3 data to {table}")
        with StringIO() as buffer:
            data.to_csv(buffer, na_rep="NULL", header=False)
            buffer.seek(0)
            copy_query = sql.SQL("COPY {} FROM STDIN DELIMITER ',' CSV NULL 'NULL';").format(sql.Identifier(table))
            with cur.copy(copy_query) as copy:
                copy.write(buffer.read())


def clean_before_insert(connection: psycopg.Connection, table: str):
    with connection.cursor() as cur:
        cur.execute(
            'DELETE FROM "material_to_h3" ' 'WHERE "h3DataId" IN (SELECT id FROM "h3_data" WHERE "h3tableName" = %s);',
            (table,),
        )
        cur.execute('delete from "h3_data" where "h3tableName" = %s', (table,))


def insert_to_h3_master_table(
    connection: psycopg.Connection, table: str, df: pd.DataFrame, h3_res: int, year: int, data_type: str, dataset: str
):
    with connection.cursor() as cur:
        log.info(f"Inserting data for {table} into h3_data master table.")
        for column_name in df.columns:
            cur.execute(
                'INSERT INTO "h3_data" ("h3tableName", "h3columnName", "h3resolution", "year")'
                "VALUES (%s, %s, %s, %s)",
                (table, column_name, h3_res, year),
            )
            if data_type == "indicator":
                update_for_indicator(cur, dataset, column_name)
            else:
                update_for_material(cur, dataset, column_name, data_type)


def update_for_indicator(cursor: psycopg.Cursor, dataset: str, column_name: str):
    query = sql.SQL('select id from "indicator" where "nameCode" = {}').format(sql.Literal(dataset))
    cursor.execute(query)
    indicator_id = cursor.fetchone()
    if not indicator_id:
        log.error(f"Query result of {query.as_string(cursor)} returned nothing.")
        raise ValueError(f"Indicator with 'nameCode' {dataset} does not exists")

    cursor.execute(
        'update "h3_data"  set "indicatorId" = %s where  "h3columnName" = %s', (indicator_id[0], column_name)
    )
    log.info(f"Updated indicatorId '{indicator_id[0]}' in h3_data for {column_name}")


def update_for_material(cursor: psycopg.Cursor, dataset: str, column_name: str, data_type: str):
    select_query = sql.SQL('SELECT id FROM "h3_data" WHERE "h3columnName" = {}').format(sql.Literal(column_name))
    cursor.execute(select_query)
    h3_data_id = cursor.fetchone()
    if not h3_data_id:
        log.error(f"Query result of {select_query.as_string(cursor)} returned nothing.")
        raise ValueError(f"h3_data with 'h3columnName' {column_name} does not exists")
    # FIXME: the current solution for naming a material datasets is hard to follow and easy to mess up.
    dataset_id = dataset + "_" + snakify(column_name).split("_")[-2]
    type_map = {"harvest_area": "harvest", "production": "producer"}
    delete_query = sql.SQL(
        'DELETE FROM "material_to_h3" WHERE "materialId" = {material_id} AND "type" = {data_type}'
    ).format(
        material_id=sql.Placeholder(),
        data_type=sql.Literal(type_map[data_type]),
    )
    insert_query = sql.SQL(
        'INSERT INTO "material_to_h3" ("materialId", "h3DataId", "type") '
        "VALUES ({materialid}, {h3dataid}, {datatype})"
    ).format(
        materialid=sql.Placeholder(),
        h3dataid=sql.Literal(h3_data_id[0]),
        datatype=sql.Literal(type_map[data_type]),
    )
    cursor.execute('SELECT id FROM "material" WHERE "datasetId" = %s', (dataset_id,))
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
    with psycopg.connect(conn_info, autocommit=True) as conn:
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
# @click.option("contextual", is_flag=True, help="If the data has to be referenced in contextual_layers table.")
@click.option("--h3-res", "h3_res", type=int, default=6, help="h3 resolution to use [default=6]")
@click.option("--thread-count", "thread_count", type=int, default=4, help="Number of threads to use [default=4]")
def main(folder: Path, table: str, data_type: str, dataset: str, year: int, h3_res: int, thread_count: int):
    """Reads a folder of .tif, converts to h3 and loads into a PG table

    \b
    FOLDER is the path to the folder containing the raster files to be ingested.
    TABLE is the h3_grid_* style DB table name that will contain the actual H3 index and data.
    DATA_TYPE can be "production" "harvest_area" or "indicator".
    DATASET is the name of the reference in the indicator "nameCode" or material "datasetID".
        For the latter case it will be constructed dynamically using DATASET + filename.split("_")[-2]
    YEAR is the last year of the dataset.
    """
    # Part 1: Convert Raster to h3 index -> value map (or dataframe in this case)
    raster_files = list(folder.glob("*.tif"))
    partial_raster_to_h3 = partial(raster_to_h3, raster_files[0], h3_res)
    with multiprocessing.Pool(thread_count) as pool:
        h3s = pool.map(partial_raster_to_h3, raster_files)
    log.info(f"Joining H3 data of each raster into single dataframe for table {table}")
    df = h3s[0].join(h3s[1:]) if len(raster_files) > 1 else h3s[0]

    # Part 2: Ingest h3 index into the database
    to_the_db(df, table, data_type, dataset, year, h3_res)


if __name__ == "__main__":
    main()
