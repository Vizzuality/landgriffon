"""Reads a folder of .csv, imports them to a PostgreSQL database

Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    csv_to_table.py <folder> [--table=<table>]

Arguments:
    <folder>          Folder containing csvs.
Options:
    --table=<table>   If provided, only import the csv for this table
"""

import os
import csv
import psycopg2
from docopt import docopt
import logging
import boto3
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("base_data_importer")
load_dotenv('../../.env')


def load_csvs_into_tables(csv_file_list: list[dict]):
    conn = psycopg2.connect(
        host=os.getenv('API_POSTGRES_HOST'),
        port=os.getenv('API_POSTGRES_PORT'),
        database=os.getenv('API_POSTGRES_DATABASE'),
        user=os.getenv('API_POSTGRES_USERNAME'),
        password=os.getenv('API_POSTGRES_PASSWORD')
    )
    log.info('Loading base data CSVs into Database...')
    cursor = conn.cursor()
    for csv_file in csv_file_list:
        log.info(f"Truncating table {csv_file['table']}")
        cursor.execute("TRUNCATE TABLE \"public\".\"%s\" CASCADE" % (csv_file["table"]))
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, csv_file["path"])
        with open(file_path, 'r') as f:
            try:
                reader = csv.reader(f)
                cols = []
                log.info(f"Inserting data into table {csv_file['table']}")
                for row in reader:
                    if not cols:
                        cols = ['"{}"'.format(cell) for cell in row]
                        psycopg_marks = ','.join(['%s' for s in cols])
                        insert_statement = "INSERT INTO \"public\".\"%s\" (%s) VALUES (%s)" % (
                            csv_file["table"], ','.join(cols), psycopg_marks)
                    else:
                        cursor.execute(insert_statement, [cell if cell != '' else None for cell in row])
            finally:
                f.close()
                conn.commit()
                log.info(f"Data inserted into table {csv_file['table']}")
    cursor.close()
    log.info('All CSVs loaded into Database')


def download_base_data(files_to_download: list[str]) -> list[str]:
    downloaded_files = []
    log.info(f"Downloading files base data files...")
    aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    s3 = boto3.client('s3', aws_access_key_id=aws_access_key_id, aws_secret_access_key=aws_secret_access_key)
    try:
        for file_name in files_to_download:
            log.info(f"Downloading file: {file_name}")
            s3.download_file(Bucket='landgriffon-raw-data', Key=f'import/base_data/{file_name}', Filename=file_name)
            if os.path.exists(file_name):
                downloaded_files.append(file_name)
            else:
                raise Exception(f"Error downloading file: {file_name}")
        return downloaded_files
    except Exception as e:
        log.error(f"Error downloading files: {e}")
        raise Exception('There was some error downloading the files. Aborting import process')
    finally:
        if len(downloaded_files) != len(files_to_download):
            log.info('Cleaning up downloaded files...')
            for downloaded_file in downloaded_files:
                os.remove(downloaded_file)
                log.info(f"Deleted file: {downloaded_file}")
        log.info('All files downloaded successfully')


def main():
    ## TODO: Add some point we might want to configure this, similarly as we do it with coefficients
    ##       Adding the conf for target table and more, instead of relying on the file naming for everything
    files_to_download = ['1.units.csv', '2.indicator.csv', '3.unit_conversion.csv', '4.material.csv']
    downloaded_files = download_base_data(files_to_download)
    config = [
        {
            "path": f,
            "file": f,
            "table": f.split('.')[1],
        }
        for f in sorted(downloaded_files)
        if os.path.splitext(f)[1] == '.csv'
    ]
    print(config)

    load_csvs_into_tables(config)


if __name__ == "__main__":
    main()
