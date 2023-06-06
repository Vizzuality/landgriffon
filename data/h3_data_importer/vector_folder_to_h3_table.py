"""Reads a folder of vector files, converts to h3 and loads into a PG table

All vector files in the folder must have identical projection, transform, etc.
Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    vector_folder_to_h3_table.py <folder> <table> <column> <dataset> <category> <year> [--indicator] [--h3-res=6]
Arguments:
    <folder>          Folder containing vector file.
    <table>           Postgresql table to overwrite.
    <column>          Column name of the feature to keep.
    <dataset>         Dataset name
    <category>        Dataset category [Environmental datasets, Business datasets, Food and agriculture, Default]
    <year>            Year of the imported dataset
Options:
    -h                Show help
    --indicator=<indicator_code>    Indicator nameCode
    --h3-res=<res>    h3 resolution to use [default: 6].
"""
import argparse
import logging
import os
from io import StringIO
from pathlib import Path

import fiona
import geopandas as gpd
import pandas as pd
import psycopg2
from h3ronpy import vector
from psycopg2 import sql
from psycopg2.pool import ThreadedConnectionPool

from utils import insert_to_h3_data_and_contextual_layer_tables, link_to_indicator_table, slugify, h3_table_schema

DTYPES_TO_PG = {
    "object": "text",
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

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("vector_folder_to_h3_table")

postgres_thread_pool = ThreadedConnectionPool(
    1,
    50,
    host=os.getenv("API_POSTGRES_HOST"),
    port=os.getenv("API_POSTGRES_PORT"),
    user=os.getenv("API_POSTGRES_USERNAME"),
    password=os.getenv("API_POSTGRES_PASSWORD"),
)


def records(filename, usecols, **kwargs):
    """Generator to subset of columns from vector files"""
    with fiona.open(filename, **kwargs) as source:
        for feature in source:
            f = {k: feature[k] for k in ["id", "geometry"]}
            f["properties"] = {k: feature["properties"][k] for k in usecols}
            yield f


def vector_file_to_h3dataframe(
    filename: Path,
    column: str,
    h3_res: int = 6,
) -> gpd.GeoDataFrame:
    """Converts a vector file to a GeoDataFrame"""
    log.info(f"Reading {str(filename)} and converting geometry to H3...")
    gdf = gpd.GeoDataFrame.from_features(records(filename, [column])).set_crs("EPSG:4326")
    h3df = vector.geodataframe_to_h3(gdf, h3_res).set_index("h3index")
    # check for duplicated h3 indices since the aqueduct data set generates duplicated h3 indices
    # we currently don't know why this happens and further investigation is needed
    # but for now we just drop the duplicates if it is safe to do so (i.e. the dupes have the same value)
    if h3df.index.duplicated().any():
        log.warning(f"Duplicated H3 indexes found in {filename}. Checking if it safe to drop...")
        dupes_mask = h3df.index.duplicated(keep="first")
        dupe_idx = h3df.index[dupes_mask]
        # check that the duplicated values are the same and drop them if they are
        # if not, raise an error and stop ingestion to encourage manual data validation check
        for idx in dupe_idx:
            values = h3df.loc[idx]
            if any(values[col].is_unique for col in values.columns):
                log.error(
                    f"Duplicated H3 index {idx} found in {filename} with different values."
                    " Data ingestion will stop. Please check the data."
                )
                raise ValueError(f"Duplicated H3 index {idx} found in {filename} with different values.")
        h3df = h3df[~dupes_mask]  # drop the duplicates
        log.info(f"Dropped {len(dupe_idx)} duplicated H3 indexes")

    if not h3df.empty:
        # we want h3index as hex, do we?
        h3df.index = pd.Series(h3df.index).apply(lambda x: hex(x))
        # slugify column name to be ColumnName as everywhere else
        h3df = h3df.rename(columns={column: slugify(column)})
        return h3df


def create_h3_grid_table(
    table_name: str,
    df: pd.DataFrame,
    connection: psycopg2.extensions.connection,
    drop_if_exists=True,
):
    """Creates the h3 data table (like `h3_grid_nio_global`) with the correct data types"""
    dtypes = df.dtypes.to_dict()
    cursor = connection.cursor()
    if drop_if_exists:
        cursor.execute(sql.SQL("DROP TABLE IF EXISTS {};").format(sql.Identifier(table_name)))
        log.info(f"Dropped table {table_name}")
    cursor.execute(sql.SQL("CREATE TABLE {} ({})").format(sql.Identifier(table_name), h3_table_schema(df)))
    log.info(f"Created table {table_name} with columns {', '.join(dtypes.keys())}")
    connection.commit()
    cursor.close()


def insert_to_h3_grid_table(
    table_name: str,
    df: pd.DataFrame,
    connection: psycopg2.extensions.connection,
):
    cursor = connection.cursor()
    log.info(f"Preparing {len(df)} rows buffer...")

    with StringIO() as buffer:  # why are we using this?
        df.to_csv(buffer, na_rep="NULL", header=False, sep="\t")  # use tabs because fields with commas
        buffer.seek(0)
        cursor.copy_from(buffer, table_name, sep="\t", null="NULL")

    connection.commit()
    cursor.close()
    log.info(f"{len(df)} values written to database.")


def main(
    folder: str,
    table: str,
    column: str,
    dataset: str,
    category: str,
    year: int,
    h3_res: str,
    indicator_code: str,
):
    vec_extensions = "gpkg shp json geojson".split()
    path = Path(folder)
    vectors = []
    for ext in vec_extensions:
        vectors.extend(path.glob(f"*.{ext}"))
    if not vectors:
        log.error(f"No vectors with extension {vec_extensions} found in {folder}")
        return

    conn = postgres_thread_pool.getconn()
    if len(vectors) == 1:  # folder just contains one vector file
        df = vector_file_to_h3dataframe(vectors[0], column, h3_res)
        create_h3_grid_table(table, df, conn)
        insert_to_h3_grid_table(table, df, conn)
        # slugify the column name to follow the convention of db column naming
        column = slugify(column)
        insert_to_h3_data_and_contextual_layer_tables(table, column, h3_res, dataset, category, year, conn)
    else:
        mssg = (
            f"Found more than one vector file in {folder}."
            f" For now we only support folders with just one vector file."
        )
        logging.error(mssg)
        return  # gracefully exit without exception

    if indicator_code:  # if given, consider layer as indicator update h3_table
        link_to_indicator_table(conn, indicator_code, column)

    postgres_thread_pool.putconn(conn, close=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", help="Folder containing vector file.")
    parser.add_argument("table", help="postgresql table to overwrite.")
    parser.add_argument("column", help="Column name of the feature to keep.")
    parser.add_argument("dataset", help="Dataset name")
    parser.add_argument(
        "category",
        help="Dataset category",
        choices=["Environmental datasets", "Business datasets", "Food and agriculture", "Default"],
    )
    parser.add_argument("year", type=int, help="Year of the imported dataset")
    parser.add_argument("--indicator", help="Indicator nameCode", default=None)
    parser.add_argument("--h3-res", help="h3 resolution to use", dest="h3res", default=6, type=int)
    args = parser.parse_args()

    main(
        args.folder,
        args.table,
        args.column,
        args.dataset,
        args.category,
        args.year,
        args.h3res,
        args.indicator,
    )
