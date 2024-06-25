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

logging.basicConfig(level=logging.INFO)


def load_csvs_into_tables(csv_file_list):
    conn = psycopg2.connect(
        host=os.getenv('API_POSTGRES_HOST'),
        port=os.getenv('API_POSTGRES_PORT'),
        database=os.getenv('API_POSTGRES_DATABASE'),
        user=os.getenv('API_POSTGRES_USERNAME'),
        password=os.getenv('API_POSTGRES_PASSWORD')
    )
    cursor = conn.cursor()
    for csv_file in csv_file_list:
        cursor.execute("TRUNCATE TABLE \"public\".\"%s\" CASCADE" % (csv_file["table"]))
        with open(csv_file["path"], 'r') as f:
            try:
                reader = csv.reader(f)
                cols = []
                for row in reader:
                    if not cols:
                        cols = ['"{}"'.format(cell) for cell in row]
                        psycopg_marks = ','.join(['%s' for s in cols])
                        insert_statement = "INSERT INTO \"public\".\"%s\" (%s) VALUES (%s)" % (
                        csv_file["table"], ','.join(cols), psycopg_marks)
                        # print(insert_statement)
                    else:
                        # print(row)
                        cursor.execute(insert_statement, [cell if cell != '' else None for cell in row])
                        print(cursor.query.decode())
            finally:
                f.close()
                conn.commit()
    cursor.close()


def main(folder, table):
    csvs = [
        {
            "path": os.path.join(folder, f),
            "file": f,
            "table": f.split('.')[1],
        }
        for f in sorted(os.listdir(folder))
        if os.path.splitext(f)[1] == '.csv' and (table is None or f.split('.')[1] == table)
    ]
    logging.info(f'Found {len(csvs)} CSVs')
    load_csvs_into_tables(csvs)
    logging.info('Done')


if __name__ == "__main__":
    args = docopt(__doc__)
    main(
        args['<folder>'],
        args['--table'],
    )
