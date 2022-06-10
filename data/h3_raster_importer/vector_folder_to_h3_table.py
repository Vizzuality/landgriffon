"""Reads a folder of .tif, converts to h3 and loads into a PG table

All GeoTiffs in the folder must have identical projection, transform, etc.
The resulting table will contain a column for each GeoTiff.
Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    tiff_folder_to_h3_table.py <folder> <table> <dataType> <dataset> <year> [--h3-res=6] [--thread-count=4]

Arguments:
    <folder>          Folder containing GeoTiffs.
    <table>           Postgresql table to overwrite.
    <dataType>        Type of the data imported
    <dataset>         Dataset information for mapping commodities and indicators
    <year>            Year of the imported dataset
Options:
    -h                Show help
    --h3-res=<res>    h3 resolution to use [default: 6].
"""

import logging
import os
from functools import partial
from io import StringIO
from math import ceil
from multiprocessing.pool import ThreadPool
from pathlib import Path
from re import sub

import geopandas as gpd
import h3ronpy.raster
import pandas as pd
from docopt import docopt
from h3ronpy import util, vector
from psycopg2.pool import ThreadedConnectionPool
from tqdm import tqdm

DTYPES_TO_PG = {
    "boolean": "bool",
    "uint8": "smallint",
    "uint16": "int",
    "uint32": "bigint",
    "uint64": "bigint",
    "int8": "smallint",
    "int16": "smallint",
    "int32": "int",
    "int64": "bigint",
    "float32": "real",
    "float64": "double precision",
}
BLOCK_SIZE = 512

logging.basicConfig(level=logging.INFO)

postgres_thread_pool = ThreadedConnectionPool(
    1,
    50,
    host=os.getenv("API_POSTGRES_HOST"),
    port=os.getenv("API_POSTGRES_PORT"),
    user=os.getenv("API_POSTGRES_USERNAME"),
    password=os.getenv("API_POSTGRES_PASSWORD"),
)


def slugify(s):
    s = sub(r"[_-]+", " ", s).title().replace(" ", "")
    return "".join([s[0].lower(), s[1:]])


def snakify(s):
    return sub(r"(?<!^)(?=[A-Z])", "_", s).lower()


def vector_to_h3(file: Path, h3_resolution: int=6) -> gpd.GeoDataFrame:
    """Converts a vector file to a GeoDataFrame"""
    gdf = gpd.read_file(file)
    h3gdf = util.h3index_column_to_geodataframe(vector.geodataframe_to_h3(gdf, h3_resolution))
    return 

# TODO : Get geometry value for h3 index
# TODO : Insert gdf to database (start from modifying the following functions)

def create_table(h3_res, raster_list, table):
    conn = postgres_thread_pool.getconn()
    cursor = conn.cursor()

    base = rio.open(raster_list[0])

    logging.debug(f"Loading first rows to build table {table}")
    names = [slugify(os.path.splitext(os.path.basename(r))[0]) for r in raster_list]
    readers = [rio.open(r) for r in raster_list]

    found_columns = False
    while not found_columns:
        for row in range(ceil(base.width / BLOCK_SIZE)):
            column_data = gen_raster_h3_for_row_and_column(
                row, 0, names, readers, h3_res
            )
            if column_data is not None:
                found_columns = True
                break
    for reader in readers:
        reader.close()

    cols = zip(column_data.columns, column_data.dtypes)
    schema = ", ".join([f'"{col}" {DTYPES_TO_PG[str(dtype)]}' for col, dtype in cols])
    cursor.execute(f"CREATE TABLE {table} (h3index h3index PRIMARY KEY, {schema});")
    logging.debug(
        f"Created table {table} with columns {', '.join(column_data.columns)}"
    )
    conn.commit()
    postgres_thread_pool.putconn(conn, close=True)
    return column_data


def write_data_to_database_table(table, results, row):
    conn = postgres_thread_pool.getconn()

    cursor = conn.cursor()
    counter = 0

    logging.info(f"Preparing row {row} buffer...")

    for data in results:
        if data is not None:
            with StringIO() as buffer:
                counter += len(data)
                data.to_csv(buffer, na_rep="NULL", header=False)
                buffer.seek(0)
                cursor.copy_from(buffer, table, sep=",", null="NULL")

    conn.commit()
    logging.info(
        f"{counter} values for row {row} written to database, ending row iteration"
    )
    postgres_thread_pool.putconn(conn, close=True)


def load_raster_list_to_h3_table(
    raster_list, table, data_type, dataset, year, h3_res, thread_count
):
    conn = postgres_thread_pool.getconn()

    cursor = conn.cursor()
    logging.info(f"Dropping table {table}...")
    cursor.execute(f"DROP TABLE IF EXISTS {table};")
    cursor.execute(
        f"""DELETE FROM "material_to_h3" WHERE "h3DataId" IN (SELECT id FROM "h3_data" WHERE "h3tableName" = '{table}');"""
    )
    cursor.execute(f"""DELETE FROM "h3_data" WHERE "h3tableName" = '{table}';""")
    conn.commit()

    postgres_thread_pool.putconn(conn)

    column_data = create_table(h3_res, raster_list, table)

    gen_raster_h3(raster_list, h3_res, table, thread_count)

    conn = postgres_thread_pool.getconn()
    cursor = conn.cursor()
    # add rows to master table for each column
    for column in column_data:
        cursor.execute(
            f"""
            INSERT INTO "h3_data" ("h3tableName", "h3columnName", "h3resolution", "year")
            VALUES ('{table}', '{column}', {h3_res}, {year});
        """
        )
        # inter id in material entity
        if data_type == "indicator":
            cursor.execute(
                f"""select id from "indicator" where "nameCode" = '{dataset}'"""
            )
            indicator_data = cursor.fetchall()
            cursor.execute(
                f"""update "h3_data"  set "indicatorId" = '{indicator_data[0][0]}' where  "h3columnName" = '{column}'"""
            )
        else:
            cursor.execute(
                f"""select id from "h3_data" where "h3columnName" = '{column}'"""
            )
            h3_data = cursor.fetchall()
            dataset_id = dataset + "_" + snakify(column).split("_")[-2]
            cursor.execute(
                f"""select id from "material" where "datasetId" = '{dataset_id}'"""
            )
            material_data = cursor.fetchall()
            for material_id in material_data:
                if data_type == "production":
                    cursor.execute(
                        f"""DELETE FROM "material_to_h3" WHERE "materialId" = '{material_id[0]}' AND "type" = 'producer'"""
                    )
                    cursor.execute(
                        f"""INSERT INTO "material_to_h3" ("materialId", "h3DataId", "type") VALUES ('{material_id[0]}', '{h3_data[0][0]}', 'producer')"""
                    )
                if data_type == "harvest_area":
                    cursor.execute(
                        f"""DELETE FROM "material_to_h3" WHERE "materialId" = '{material_id[0]}' AND "type" = 'harvest'"""
                    )
                    cursor.execute(
                        f"""INSERT INTO "material_to_h3" ("materialId", "h3DataId", "type") VALUES ('{material_id[0]}', '{h3_data[0][0]}', 'harvest')"""
                    )

    conn.commit()
    cursor.close()


def main(folder, table, data_type, dataset, year, h3_res, thread_count):
    tiffs = [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if os.path.splitext(f)[1] == ".tif"
    ]
    logging.info(f"Starting h3 import with {thread_count} threads")
    logging.info(f"Found {len(tiffs)} tiffs")
    load_raster_list_to_h3_table(
        tiffs, table, data_type, dataset, year, h3_res, thread_count
    )
    logging.info("Done")


if __name__ == "__main__":
    args = docopt(__doc__)
    main(
        args["<folder>"],
        args["<table>"],
        args["<dataType>"],
        args["<dataset>"],
        args["<year>"],
        int(args["--h3-res"]),
        int(args["--thread-count"] if args["--thread-count"] else "4"),
    )
