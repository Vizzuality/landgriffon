"""
The script process and import indicator coefficients from a CSV file into a PostgreSQL database.
The main functionality includes loading data from a CSV file,
retrieving administrative region and material IDs, and copying the processed data into the database.

Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE
"""

import json
import logging
import os
import time
from io import StringIO
from pathlib import Path
from typing import Any

import boto3
import pandas as pd
from dotenv import load_dotenv
from psycopg2.extensions import connection
from psycopg2.pool import ThreadedConnectionPool

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("indicator_coefficient_importer")
load_dotenv("../../.env")

db_host = os.getenv("API_POSTGRES_HOST")
db_port = os.getenv("API_POSTGRES_PORT")
db_user = os.getenv("API_POSTGRES_USERNAME")
db_database = os.getenv("API_POSTGRES_DATABASE")
db_password = os.getenv("API_POSTGRES_PASSWORD")
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
data_bucket_name = os.getenv("DATA_BUCKET_NAME")
path = "import/indicator_coefficients"

postgres_thread_pool = ThreadedConnectionPool(
    1,
    50,
    host=db_host,
    port=db_port,
    database=db_database,
    user=db_user,
    password=db_password,
)


def load_data(filename: Path, year: int) -> pd.DataFrame:
    """Load data from a CSV file and add a year column."""
    dtype_mapping = {"hs_2017_code": str}
    df = pd.read_csv(filename, dtype=dtype_mapping)
    df["year"] = year
    return df


def get_admin_region_ids_from_countries(conn, countries: list) -> pd.DataFrame:
    """Retrieve administrative region IDs from the database based on country names."""
    with conn.cursor() as cur:
        cur.execute(
            """select id, name from admin_region ar where ar.name = any(%s);""",
            (countries,),
        )
        return pd.DataFrame.from_records(cur.fetchall(), columns=["adminRegionId", "country"])


def get_material_ids_from_hs_codes(conn, hs_codes: list) -> pd.DataFrame:
    """Retrieve material IDs from the database based on hscodes."""
    with conn.cursor() as cur:
        cur.execute(
            """select id, "hsCodeId" from material m where m."hsCodeId" = any(%s)""",
            (hs_codes,),
        )
        return pd.DataFrame.from_records(cur.fetchall(), columns=["materialId", "hs_2017_code"])


def copy_data_to_table(conn: connection, df: pd.DataFrame, indicator_id: str):
    """
    Copy data from a string buffer to a database table.
    It deletes all existing rows for the given indicatorId before inserting the new ones.
    """
    # save dataframe to an in memory buffer

    buffer = StringIO()
    df.to_csv(buffer, index=False, header=False, na_rep="NULL")
    buffer.seek(0)
    with conn:
        with conn.cursor() as cursor:
            start_time = time.perf_counter()
            logging.info(f"Deleting existing records for indicator with code {indicator_id}...")
            cursor.execute(
                'delete from indicator_coefficient where "indicatorId" = %s',
                (indicator_id,),
            )
            end_time = time.perf_counter()
            logging.info(f"Deleted existing records in {end_time - start_time:0.4f} seconds")
            log.info(f"Copying {len(df)} records into indicator_coefficient for indicator with ID {indicator_id}...")
            cursor.copy_from(
                buffer,
                "indicator_coefficient",
                sep=",",
                columns=df.columns,
                null="NULL",
            )
    log.info(f"Imported indicator coefficients for indicator with ID {indicator_id}")


# def remove_downloaded_files(downloaded_files: list[str]):


def download_indicator_coefficient_files(files_to_download: list[str]) -> list[str]:
    log.info(f"Downloading files: {files_to_download}")
    s3 = boto3.client("s3", aws_access_key_id=aws_access_key_id, aws_secret_access_key=aws_secret_access_key)
    downloaded_files = []
    try:
        for file in files_to_download:
            log.info(f"Downloading file: {file}")
            s3.download_file(Bucket=data_bucket_name, Key=f"{path}/{file}", Filename=file)
            if os.path.exists(file):
                downloaded_files.append(file)
            else:
                raise Exception(f"Error downloading file: {file}")
        return downloaded_files
    except Exception as e:
        log.error(f"Error downloading files: {e}")
        raise Exception("There was some error downloading the files. Aborting import process") from e
    finally:
        if len(downloaded_files) != len(files_to_download):
            log.info("Cleaning up downloaded files...")
            for downloaded_file in downloaded_files:
                os.remove(downloaded_file)
                log.info(f"Deleted file: {downloaded_file}")
        log.info("All files downloaded successfully")


def load_indicator_config() -> list[dict[str, Any]]:
    try:
        indicator_config_json = os.getenv("INDICATOR_COEFFICIENT_CONFIG")
        logging.info(f"Loading indicator coefficient configuration: {indicator_config_json}")

        if not indicator_config_json:
            raise ValueError("Environment variable 'INDICATOR_COEFFICIENT_CONFIG' is missing or empty. Aborting.")
        parsed_config = json.loads(indicator_config_json)

        if not isinstance(parsed_config, dict):
            raise ValueError("Environment variable 'INDICATOR_COEFFICIENT_CONFIG' does not contain valid JSON data.")
        indicator_config = [{"name": key, **value} for key, value in parsed_config.items()]

        return indicator_config

    except json.JSONDecodeError:
        log.error("Invalid JSON format in 'INDICATOR_COEFFICIENT_CONFIG'.")
        raise ValueError("Environment variable 'INDICATOR_COEFFICIENT_CONFIG' must be a valid JSON string.") from None
    except Exception as e:
        log.error(f"Error loading configuration: {e}")
        raise


def main():
    """Process and ingest csv data with per country data into indicator_coefficient table."""
    indicator_config = load_indicator_config()
    files_to_download = [file_config["file"] for file_config in indicator_config]
    ## TODO: We might want to cleanup downloaded stuff regardless the success of the import. But since IRL
    ##       this runs on a pod that will be wipeout after the job has run, we can skip this for now, we are in a rush
    _ = download_indicator_coefficient_files(files_to_download)

    conn = postgres_thread_pool.getconn()
    for indicator in indicator_config:
        file = indicator["file"]
        year = indicator["year"]
        indicator_code = indicator["indicator_code"]
        data = load_data(filename=file, year=year)
        with conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """select id from indicator where indicator."nameCode" = %s;""",
                    (indicator_code,),
                )
                indicator_id = cursor.fetchone()[0]
            # add admin region ID to dataframe so we can insert all rows at once
            # without having to query for the IDs every time
            admin_region_ids = get_admin_region_ids_from_countries(conn, list(data.country.unique()))
            # same with material ID
            material_ids = get_material_ids_from_hs_codes(conn, data.hs_2017_code.astype(str).to_list())

        data = pd.merge(data, admin_region_ids, on="country", how="left")
        data = pd.merge(data, material_ids, on="hs_2017_code", how="left")
        data["indicatorId"] = indicator_id
        data_to_insert = data[["value", "year", "adminRegionId", "indicatorId", "materialId"]]
        copy_data_to_table(conn, data_to_insert, indicator_id)

    postgres_thread_pool.putconn(conn)
    log.info("Done!!")

    return


if __name__ == "__main__":
    main()
