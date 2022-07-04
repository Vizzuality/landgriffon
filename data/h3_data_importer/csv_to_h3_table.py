"""Downloads the Human Development Index data in csv and imports it to a PostgreSQL database.

The script converts the hdi country data to H3 grid cells using the already populated geo_region and admin_region tables
to get the h3 hexes for each country. This way it only uses a sql join and avoid doing geo-spatial operations and
querys.

Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    insert_hdi_dataset.py <table> <column> <year>

Arguments:
    <file>            Path to the csv file with the hdi data.
    <table>           Postgresql table to create or overwrite.
    <column>          Column to insert HDI data into.
    <year>            Year of the data used.
"""

import argparse
import csv
import logging
import os
from pathlib import Path

import pandas as pd
import requests
from psycopg2 import extensions
from psycopg2.pool import ThreadedConnectionPool

from utils import slugify, insert_to_h3_data_and_contextual_layer_tables

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


def insert_h3_grid_table_query(table_name: str, column: str, country_iso3_code: str, hdi_value: float) -> str:
    query = f"""
        insert into {table_name} (h3index, "{column}")
        select
            h3_uncompact(gr."h3Compact"::h3index[], 6) as h3index,
            {hdi_value} as "{column}"
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
    # using csv reader because pandas was raising some weird decoding errors for the hdi csv
    csv_rows = list(csv.reader(decoded_content.splitlines(), delimiter=","))
    return pd.DataFrame(csv_rows[1:], columns=csv_rows[0])


def load_data(filename: Path) -> pd.DataFrame:
    return pd.read_csv(filename)


def insert_h3_grid_data(df: pd.DataFrame, table: str, column: str, iso3_column: str, connection: extensions.connection) -> None:
    """
    Parameters
    ----------
    df : DataFrame
        data to insert
    table : str
        name of the h3 grid table to populate
    column : str
        column of the dataset to insert into h3 grid table
    connection : ThreadedConnectionPool
        postgres connection pool
   """
    df: pd.DataFrame
    df = df.loc[:, ["iso3", column]]
    df[column] = pd.to_numeric(df[column])
    # todo: check no data strategy
    countries_w_na = df[df[column].isna()][iso3_column]
    log.warning(f"Found {len(countries_w_na)} countries with NA entries and"
                f" will not be inserted: {', '.join(countries_w_na.tolist())}")
    df = df.dropna(subset=column)

    with connection:
        with connection.cursor() as cursor:
            log.info(f"Dropping table {table}...")
            cursor.execute(f"drop table if exists {table};")
            log.info(f"Creating table {table}...")
            cursor.execute(f'create table {table} (h3index h3index PRIMARY KEY, "{column}" real);')

        for row in df.itertuples():
            country_code, value = getattr(row, iso3_column), getattr(row, column)
            query = insert_h3_grid_table_query(table, column, country_code, value)
            log.info(f"Inserting data for country {country_code} with value {value}...")
            with connection.cursor() as cursor:
                cursor.execute(query)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process and ingest csv dataset with per country data.")
    parser.add_argument("file", help="file path to the csv")
    parser.add_argument("table", help="name of the table to be created")
    parser.add_argument("column", help="label of the column to use")
    parser.add_argument("year", help="label of the column to use")
    parser.add_argument("iso3_column", help="label of the column that contains the country iso3 code")
    args = parser.parse_args()

    # data = download_data(CSV_URL)
    data = load_data(Path(args.file))
    data = data.rename(columns={args.column: slugify(args.column)})
    column = slugify(args.column)

    conn = postgres_thread_pool.getconn()

    insert_h3_grid_data(data, args.table, column, args.iso3_column, conn)
    insert_to_h3_data_and_contextual_layer_tables(args.table, column, 6, "HDI", "Social", args.year, conn)

    postgres_thread_pool.putconn(conn, close=True)
