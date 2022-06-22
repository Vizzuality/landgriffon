"""Reads a folder of vector files, converts to h3 and loads into a PG table

All vector files in the folder must have identical projection, transform, etc.
Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    vector_folder_to_h3_table.py <folder> <table> <column> <dataset> <category> <year> [--h3-res=6]

Arguments:
    <folder>          Folder containing GeoTiffs.
    <table>           Postgresql table to overwrite.
    <column>          Column name of the feature to keep.
    <dataset>         Dataset name
    <category>        Dataset category [Environmental datasets, Business datasets, Food and agriculture, Default]
    <year>            Year of the imported dataset
Options:
    -h                Show help
    --h3-res=<res>    h3 resolution to use [default: 6].
"""
import os
import json
import logging
from io import StringIO
from pathlib import Path
from re import sub

import fiona
import geopandas as gpd
import pandas as pd
import psycopg2
from docopt import docopt
from h3ronpy import vector
from psycopg2.pool import ThreadedConnectionPool

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

postgres_thread_pool = ThreadedConnectionPool(
    1,
    50,
    host=os.getenv('API_POSTGRES_HOST'),
    port=os.getenv('API_POSTGRES_PORT'),
    user=os.getenv('API_POSTGRES_USERNAME'),
    password=os.getenv('API_POSTGRES_PASSWORD')
)


def slugify(s):
    s = sub(r"[_-]+", " ", s).title().replace(" ", "")
    return "".join([s[0].lower(), s[1:]])


def snakify(s):
    return sub(r"(?<!^)(?=[A-Z])", "_", s).lower()


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
    logging.info(f"Reading {str(filename)} and converting geometry to H3...")
    gdf = gpd.GeoDataFrame.from_features(records(filename, [column])).set_crs("EPSG:4326")
    h3df = vector.geodataframe_to_h3(gdf, h3_res).set_index("h3index")
    # check for duplicated h3 indices since the aqueduct data set generates duplicated h3 indices
    # we currently don't know why this happens and further investigation is needed
    # but for now we just drop the duplicates if it is safe to do so (i.e. the dupes have the same value)
    if h3df.index.duplicated().any():
        logging.warning(f"Duplicated H3 indexes found in {filename}. Checking if it safe to drop...")
        dupes = h3df.index.duplicated(keep="first")
        dupe_idx = h3df.index[dupes]
        # check that the duplicated values are the same and drop them if they are
        # if not, raise an error and stop ingestion to encourage manual data validation check
        for idx in dupe_idx:
            values = h3df.loc[idx]
            if any(values[col].is_unique for col in values.columns):
                logging.error(
                    f"Duplicated H3 index {idx} found in {filename} with different values."
                    " Data ingestion will stop. Please check the data."
                )
                raise ValueError(f"Duplicated H3 index {idx} found in {filename} with different values.")
        h3df = h3df[~dupes]  # drop the duplicates
        logging.info(f"Dropped {len(dupe_idx)} duplicated H3 indexes")

    if not h3df.empty:
        # we want h3index as hex, do we?
        h3df.index = pd.Series(h3df.index).apply(lambda x: hex(x))
        return h3df


def create_h3_grid_table(
    table_name: str,
    df: pd.DataFrame,
    connection: psycopg2.extensions.connection,
    drop_if_exists=True,
):
    """Creates the h3 data table (like `h3_grid_nio_global`) with the correct data types"""
    dtypes = df.dtypes.to_dict()
    schema = ", ".join([f'"{col}" {DTYPES_TO_PG[str(dtype)]}' for col, dtype in dtypes.items()])
    cursor = connection.cursor()
    if drop_if_exists:
        cursor.execute(f"DROP TABLE IF EXISTS {table_name};")
        logging.info(f"Dropped table {table_name}")
    cursor.execute(f"CREATE TABLE {table_name} (h3index h3index PRIMARY KEY, {schema});")
    logging.info(f"Created table {table_name} with columns {', '.join(dtypes.keys())}")
    connection.commit()
    cursor.close()


def insert_to_h3_grid_table(
    table_name: str,
    df: pd.DataFrame,
    connection: psycopg2.extensions.connection,
):
    cursor = connection.cursor()
    logging.info(f"Preparing {len(df)} rows buffer...")

    with StringIO() as buffer:  # why are we using this?
        df.to_csv(buffer, na_rep="NULL", header=False, sep="\t")  # use tabs because fields with commas
        buffer.seek(0)
        cursor.copy_from(buffer, table_name, sep="\t", null="NULL")

    connection.commit()
    cursor.close()
    logging.info(f"{len(df)} values written to database.")


def insert_to_h3_data_and_contextual_layer_tables(
    table: str, column: str, h3_res: int, dataset: str, category: str, year: int, connection
):
    cursor = connection.cursor()
    # remove existing entries
    cursor.execute(
        f"""DELETE FROM "contextual_layer" WHERE "h3DataId" IN
         (SELECT id FROM "h3_data" WHERE "h3tableName" = '{table}');"""
    )
    cursor.execute(f"""DELETE FROM "h3_data" WHERE "h3tableName" = '{table}';""")
    connection.commit()

    # insert new entries
    logging.info("Inserting record into h3_data table...")

    cursor.execute(
        f"""INSERT INTO "h3_data" ("h3tableName", "h3columnName", "h3resolution", "year")
         VALUES ('{table}', '{column}', {h3_res}, {year});"""
    )
    cursor.execute(f"""SELECT id FROM "h3_data" WHERE "h3columnName" = '{column}';""")
    h3_data = cursor.fetchall()
    # TODO: Fix description and metadata in script parameters
    logging.info("Inserting record into contextual_layer table...")
    cursor.execute(
        f"""INSERT INTO "contextual_layer"  ("h3DataId", "name", "metadata", "description", "category")
         VALUES ('{h3_data[0][0]}', '{dataset}', '{json.dumps({"place":"holder"})}', '{"<placeholder>"}', '{category}');
        """
    )
    connection.commit()
    cursor.close()


def main(folder, table, column, dataset, category, year, h3_res):
    vec_extensions = "gpkg shp json geojson".split()
    path = Path(folder)
    vectors = []
    for ext in vec_extensions:
        vectors.extend(path.glob(f"*.{ext}"))
    if not vectors:
        logging.error(f"No vectors with extension {vec_extensions} found in {folder}")
        return

    conn = postgres_thread_pool.getconn()
    if len(vectors) == 1:  # folder just contains one vector file
        df = vector_file_to_h3dataframe(vectors[0], column, h3_res)
        create_h3_grid_table(table, df, conn)
        insert_to_h3_grid_table(table, df, conn)  # apply multiprocessing here if needed
        insert_to_h3_data_and_contextual_layer_tables(table, column, h3_res, dataset, category, year, conn)
    else:
        raise NotImplementedError("For now we only support folders with just one vector file")
    postgres_thread_pool.putconn(conn, close=True)


if __name__ == "__main__":
    args = docopt(__doc__)
    main(
        args["<folder>"],
        args["<table>"],
        args["<column>"],
        args["<dataset>"],
        args["<category>"],
        args["<year>"],
        int(args["--h3-res"]),
    )
