import argparse
import csv
import logging
import os
from pathlib import Path

import pandas as pd
import requests
from psycopg2.pool import ThreadedConnectionPool

from vector_folder_to_h3_table import insert_to_h3_data_and_contextual_layer_tables

CSV_URL = "https://hdr.undp.org/sites/default/files/data/2020/IHDI_HDR2020_040722.csv"

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

postgres_thread_pool = ThreadedConnectionPool(
    1,
    50,
    host=os.getenv("API_POSTGRES_HOST"),
    port=os.getenv("API_POSTGRES_PORT"),
    user=os.getenv("API_POSTGRES_USERNAME"),
    password=os.getenv("API_POSTGRES_PASSWORD"),
)


def first_h3_grid_table_query(table_name: str, country_iso3_code: str, hdi_value: float) -> str:
    """Makes a sql query to create a table.

    The table contains the h3 indexes of country code and a hdi column with the given value
    """

    query = f"""
        create table {table_name} (h3index, hdi)
        as
        select
            h3_uncompact(gr."h3Compact"::h3index[], 6) as h3index,
            {hdi_value} as hdi
        from geo_region gr
        join admin_region ar on gr.id = ar."geoRegionId"
        where ar."isoA3"  = '{country_iso3_code}';
        """
    return query


def rest_of_h3_grid_table_query(table_name: str, country_iso3_code: str, hdi_value: float) -> str:
    query = f"""
        insert into {table_name} (h3index, hdi)
        select
            h3_uncompact(gr."h3Compact"::h3index[], 6) as h3index,
            {hdi_value} as hdi
        from geo_region gr
        join admin_region ar on gr.id = ar."geoRegionId"
        where ar."isoA3"  = '{country_iso3_code}';
        """
    return query


def download_data(url: str) -> pd.DataFrame:
    with requests.Session() as s:
        download = s.get(url)
        log.info(f"Downloading HDI data from {url}")
        decoded_content = download.content.decode("utf-8")

    csv_rows = list(csv.reader(decoded_content.splitlines(), delimiter=","))
    return pd.DataFrame(csv_rows[1:], columns=csv_rows[0])


def insert_h3_grid_data(df: pd.DataFrame, table: str, column: str):
    """
    Parameters
    ----------
    df : DataFrame
        data to insert
    table : str
        name of the h3 grid table to populate
    column : str
        column of the dataset to insert into h3 grid table
   """
    df: pd.DataFrame
    df = df.loc[:, ["iso3", column]]
    df[column] = pd.to_numeric(df[column])
    # todo: check no data strategy
    countries_w_na = df[df[column].isna()]["iso3"]
    log.warning(f"Found countries with NA entries and will not be inserted: {', '.join(countries_w_na.tolist())}")
    df = df.dropna(subset=column)

    conn = postgres_thread_pool.getconn()
    with conn.cursor() as cursor:
        log.info(f"Dropping table {table}...")
        cursor.execute(f"drop table if exists {table};")
    for i, row in enumerate(df.itertuples()):
        country_code = getattr(row, "iso3")
        value = getattr(row, column)
        if i == 0:
            query = first_h3_grid_table_query(table, country_code, value)
        else:
            query = rest_of_h3_grid_table_query(table, country_code, value)
        log.info(f"Inserting HDI data for country {country_code} with value {value}...")
        with conn.cursor() as cursor:
            cursor.execute(query)
    conn.commit()
    postgres_thread_pool.putconn(conn, close=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process and ingest Human Development Index (HDI) dataset")
    # parser.add_argument("--file", help="file path to the hdi csv")
    # parser.add_argument("--url", help="url to the hdi csv")
    parser.add_argument("table", help="name of the table to be created")
    parser.add_argument("column", help="label of the column to use")
    parser.add_argument("year", help="label of the column to use")

    args = parser.parse_args()
    data = download_data(CSV_URL)
    insert_h3_grid_data(data, args.table, args.column)
    conn = postgres_thread_pool.getconn()
    insert_to_h3_data_and_contextual_layer_tables(args.table, args.column, 6, "HDI", "Social", args.year, conn)
