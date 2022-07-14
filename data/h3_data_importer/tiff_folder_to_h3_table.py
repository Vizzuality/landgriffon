"""Reads a folder of .tif, converts to h3 and loads into a PG table

All GeoTiffs in the folder must have identical projection, transform, etc.
The resulting table will contain a column for each GeoTiff.
Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    tiff_folder_to_h3_table.py <folder> <table> <dataType> <dataset> <year> [--contextual] [--h3-res=6] [--thread-count=4]

Arguments:
    <folder>          Folder containing GeoTiffs.
    <table>           Postgresql table to overwrite.
    <dataType>        Type of the data imported
    <dataset>         Dataset information for mapping commodities and indicators
    <year>            Year of the imported dataset
Options:
    -h                Show help
    --contextual      If the data has to be referenced in contextual_layers table.
    --h3-res=<res>    h3 resolution to use [default: 6].
    --thread-count=<thread_count>    Number of threads to use [default: 4].
"""
import json
import os
from io import StringIO
from re import sub
from math import ceil

from psycopg2.pool import ThreadedConnectionPool
import h3ronpy.raster
import pandas as pd
import rasterio as rio
import logging
from docopt import docopt
from multiprocessing.pool import ThreadPool
from functools import partial
from tqdm import tqdm

from utils import get_metadata

DTYPES_TO_PG = {
    'boolean': 'bool',
    'uint8': 'smallint',
    'uint16': 'int',
    'uint32': 'bigint',
    'uint64': 'bigint',
    'int8': 'smallint',
    'int16': 'smallint',
    'int32': 'int',
    'int64': 'bigint',
    'float32': 'real',
    'float64': 'double precision'
}
BLOCK_SIZE = 512

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("tif_folder_to_h3_table")

postgres_thread_pool = ThreadedConnectionPool(1, 50,
                                              host=os.getenv('API_POSTGRES_HOST'),
                                              port=os.getenv('API_POSTGRES_PORT'),
                                              user=os.getenv('API_POSTGRES_USERNAME'),
                                              password=os.getenv('API_POSTGRES_PASSWORD')
                                              )


def slugify(s):
    s = sub(r"[_-]+", " ", s).title().replace(" ", "")
    return ''.join([s[0].lower(), s[1:]])


def snakify(s):
    return sub(r'(?<!^)(?=[A-Z])', '_', s).lower()


def gen_raster_h3_for_row_and_column(row, column, names, readers, h3_res):
    base = readers[0]

    window = rio.windows.Window(column * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
    w_transform = rio.windows.transform(window, base.transform)
    dfs = []
    for src in readers:
        if src.transform != base.transform:
            raise ValueError("Transforms do not match")
        arr = src.read(1, window=window)
        _df = h3ronpy.raster.raster_to_dataframe(arr, w_transform, h3_res,
                                                 nodata_value=int(src.profile['nodata']) if src.profile[
                                                                                                'nodata'] is not None else
                                                 src.profile['nodata'],
                                                 compacted=False, geo=False)
        dfs.append(_df.set_index('h3index')['value'])
    df = pd.concat(dfs, axis=1)
    log.debug(f'Reading block {row}, {column}: h3index count {len(df)}')
    if len(df):
        df.columns = names
        df.index = pd.Series(df.index).apply(lambda x: hex(x)[2:])
        return df


def gen_raster_h3_for_row(raster_list, h3_res, table_name, row):
    readers = [rio.open(r) for r in raster_list]

    names = [slugify(os.path.splitext(os.path.basename(r))[0]) for r in raster_list]
    base = rio.open(raster_list[0])
    results = []

    log.debug(f'Starting iterating over row {row}')

    column_range = range(ceil(base.width / BLOCK_SIZE))
    progress_bar = tqdm(column_range)
    for column in progress_bar:
        results.append(gen_raster_h3_for_row_and_column(row, column, names, readers, h3_res))
        progress_bar.set_description(f"Processing column {column} for row {row}")

    log.debug(f'Done iterating over row {row}')

    write_data_to_database_table(table_name, results, row)

    for reader in readers:
        reader.close()


def gen_raster_h3(raster_list, h3_res, table_name, thread_count):
    """Convert a list of identically formatted rasters to H3

    A function for efficiently turning a set of rasters into an H3 table.

    Takes a list of 1-band rasters with identical projection/transform.
    Reads each raster in blocks, and converts to h3 (nearest to centroid).
    Yields a dataframe with a h3index and one column for each raster's value.

    Args:
        :param raster_list: list of paths to rasters
        :param h3_res: h3 resolution to use for resampling
        :param table_name:
        :param thread_count:

    Yields:
        A Pandas dataframe for each raster block (usu. 512x512) with a
        h3index and one column for each raster's value.
    """
    base = rio.open(raster_list[0])

    pool = ThreadPool(thread_count)

    height = ceil(base.height / BLOCK_SIZE)
    width = ceil(base.width / BLOCK_SIZE)

    log.info(f"Generating h3 data from raster with {height} x {width} for table {table_name}")

    partial_gen_raster_h3_for_row = partial(gen_raster_h3_for_row, raster_list, h3_res, table_name)
    row_progress_bar = tqdm(pool.imap_unordered(func=partial_gen_raster_h3_for_row, iterable=range(height)),
                            total=height)
    result_list_tqdm = []
    row_progress_bar.set_description(f"Processed {len(result_list_tqdm)} rows of {height} for table {table_name}")
    for row in row_progress_bar:
        result_list_tqdm.append(row)
        row_progress_bar.set_description(f"Processed {len(result_list_tqdm)} rows of {height} for table {table_name}")

    base.close()


def create_table(h3_res, raster_list, table):
    conn = postgres_thread_pool.getconn()
    cursor = conn.cursor()

    base = rio.open(raster_list[0])

    log.debug(f"Loading first rows to build table {table}")
    names = [slugify(os.path.splitext(os.path.basename(r))[0]) for r in raster_list]
    readers = [rio.open(r) for r in raster_list]

    found_columns = False
    while not found_columns:
        for row in range(ceil(base.width / BLOCK_SIZE)):
            column_data = gen_raster_h3_for_row_and_column(row, 0, names, readers, h3_res)
            if column_data is not None:
                found_columns = True
                break
    for reader in readers:
        reader.close()

    cols = zip(column_data.columns, column_data.dtypes)
    schema = ', '.join([f"\"{col}\" {DTYPES_TO_PG[str(dtype)]}" for col, dtype in cols])
    cursor.execute(f"CREATE TABLE {table} (h3index h3index PRIMARY KEY, {schema});")
    log.info(f"Created table {table} with columns {', '.join(column_data.columns)}")
    conn.commit()
    postgres_thread_pool.putconn(conn, close=True)
    return column_data


def write_data_to_database_table(table, results, row):
    conn = postgres_thread_pool.getconn()

    cursor = conn.cursor()
    counter = 0

    log.info(f"Preparing row {row} buffer...")

    for data in results:
        if data is not None:
            with StringIO() as buffer:
                counter += len(data)
                data.to_csv(buffer, na_rep="NULL", header=False)
                buffer.seek(0)
                cursor.copy_from(buffer, table, sep=',', null="NULL")

    conn.commit()
    log.info(f"{counter} values for row {row} written to database table {table}, ending row iteration")
    postgres_thread_pool.putconn(conn, close=True)


def load_raster_list_to_h3_table(raster_list, table, data_type, dataset, year, h3_res, thread_count, is_contextual):
    conn = postgres_thread_pool.getconn()

    cursor = conn.cursor()
    log.info(f"Dropping table {table}...")
    cursor.execute(f"DROP TABLE IF EXISTS {table};")
    cursor.execute(
        f"""DELETE FROM "material_to_h3" WHERE "h3DataId" IN (SELECT id FROM "h3_data" WHERE "h3tableName" = '{table}');""")
    cursor.execute(f"""DELETE FROM "h3_data" WHERE "h3tableName" = '{table}';""")
    conn.commit()

    postgres_thread_pool.putconn(conn)

    column_data = create_table(h3_res, raster_list, table)

    gen_raster_h3(raster_list, h3_res, table, thread_count)

    conn = postgres_thread_pool.getconn()
    cursor = conn.cursor()
    # add rows to master table for each column
    for column in column_data:
        cursor.execute(f"""
            INSERT INTO "h3_data" ("h3tableName", "h3columnName", "h3resolution", "year")
            VALUES ('{table}', '{column}', {h3_res}, {year});
        """)
        log.info(f"Inserted('{table}', '{column}', {h3_res}, {year}) into h3_data table.")
        if is_contextual:
            insert_in_contextual_layer(table, dataset, cursor)
        # inter id in material entity
        if data_type == 'indicator':
            cursor.execute(f"""select id from "indicator" where "nameCode" = '{dataset}'""")
            indicator_data = cursor.fetchall()
            cursor.execute(
                f"""update "h3_data"  set "indicatorId" = '{indicator_data[0][0]}' where  "h3columnName" = '{column}'""")
            log.info(f"Updated indicatorId '{indicator_data[0][0]}' in h3_data for {column}")
        else:
            cursor.execute(f"""select id from "h3_data" where "h3columnName" = '{column}'""")
            h3_data = cursor.fetchall()
            dataset_id = dataset + '_' + snakify(column).split('_')[-2]
            cursor.execute(f"""select id from "material" where "datasetId" = '{dataset_id}'""")
            material_data = cursor.fetchall()
            for material_id in material_data:
                if data_type == 'production':
                    cursor.execute(
                        f"""DELETE FROM "material_to_h3" WHERE "materialId" = '{material_id[0]}' AND "type" = 'producer'""")
                    cursor.execute(
                        f"""INSERT INTO "material_to_h3" ("materialId", "h3DataId", "type") VALUES ('{material_id[0]}', '{h3_data[0][0]}', 'producer')""")
                if data_type == 'harvest_area':
                    cursor.execute(
                        f"""DELETE FROM "material_to_h3" WHERE "materialId" = '{material_id[0]}' AND "type" = 'harvest'""")
                    cursor.execute(
                        f"""INSERT INTO "material_to_h3" ("materialId", "h3DataId", "type") VALUES ('{material_id[0]}', '{h3_data[0][0]}', 'harvest')""")
                log.info(f"Updated materialId '{material_id[0]}' in material_to_h3 for {column}")

    conn.commit()
    cursor.close()


def insert_in_contextual_layer(table, dataset, cursor):
    """Inserts table into contextual layer and updates h3_table with contextual layer id"""
    cursor.execute(
        f"""DELETE FROM "contextual_layer" WHERE "name" = '{dataset}'"""
    )
    log.info(f"Inserting '{dataset}' into contextual_layer table...")
    cursor.execute(
        f"""INSERT INTO "contextual_layer"  ("name", "metadata", "category")
         VALUES ('{dataset}', '{json.dumps(get_metadata(table))}', 'Environmental datasets')
         RETURNING id;
        """
    )
    contextual_data_id = cursor.fetchall()[0][0]
    # insert contextual_layer id into h3_table
    cursor.execute(
        f"""update "h3_data"  set "contextualLayerId" = '{contextual_data_id}' where  "h3tableName" = '{table}';"""
    )
    log.info(f"Updated contextualLayerId '{contextual_data_id}' in h3_data for {table}")


def main(folder, table, data_type, dataset, year, h3_res, thread_count, is_contextual):
    tiffs = [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if os.path.splitext(f)[1] == '.tif'
    ]
    log.info(f'Starting h3 import with {thread_count} threads for table {table}')
    log.info(f'Found {len(tiffs)} tiffs')
    load_raster_list_to_h3_table(tiffs, table, data_type, dataset, year, h3_res, thread_count, is_contextual)
    log.info(f'Done with table {table}')


if __name__ == "__main__":
    args = docopt(__doc__)
    main(
        args['<folder>'],
        args['<table>'],
        args['<dataType>'],
        args['<dataset>'],
        args['<year>'],
        int(args['--h3-res']),
        int(args['--thread-count'] if args['--thread-count'] else "4"),
        args['--contextual'],
    )
