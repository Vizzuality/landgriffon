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

import os
from io import StringIO
import re
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
BLOCKSIZE = 512
H3_TABLE_PREFIX = 'h3_grid'
H3_MASTER_TABLE = 'h3_data'
MATERIALS_TABLE = 'material'
INDICATORS_SOURCE_TABLE = 'indicator_source'
INDICATORS_TABLE = 'indicator'

logging.basicConfig(level=logging.INFO)

postgres_thread_pool = ThreadedConnectionPool(1, 50,
                                              host=os.getenv('API_POSTGRES_HOST'),
                                              port=os.getenv('API_POSTGRES_PORT'),
                                              user=os.getenv('API_POSTGRES_USERNAME'),
                                              password=os.getenv('API_POSTGRES_PASSWORD')
                                              )


def slugify(s):
    return re.sub("[^0-9a-z_]+", "_", s.lower())


def gen_raster_h3_for_row_and_column(row, column, names, readers, h3_res):
    base = readers[0]

    window = rio.windows.Window(column * BLOCKSIZE, row * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE)
    w_transform = rio.windows.transform(window, base.transform)
    dfs = []
    for src in readers:
        if src.transform != base.transform:
            raise ValueError("Transforms do not match")
        arr = src.read(1, window=window)
        _df = h3ronpy.raster.raster_to_dataframe(arr, w_transform, h3_res,
                                                 nodata_value=int(src.profile['nodata']) if src.profile['nodata'] is not None else src.profile['nodata'],
                                                 compacted=False, geo=False)
        dfs.append(_df.set_index('h3index')['value'])
    df = pd.concat(dfs, axis=1)
    logging.debug(f'Reading block {row}, {column}: h3index count {len(df)}')
    if len(df):
        df.columns = names
        df.index = pd.Series(df.index).apply(lambda x: hex(x)[2:])
        return df


def gen_raster_h3_for_row(raster_list, h3_res, table_name, row):
    readers = [rio.open(r) for r in raster_list]

    names = [slugify(os.path.splitext(os.path.basename(r))[0]) for r in raster_list]
    base = rio.open(raster_list[0])
    results = []

    logging.debug(f'Starting iterating over row {row}')

    column_range = range(ceil(base.width / BLOCKSIZE))
    progress_bar = tqdm(column_range)
    for column in progress_bar:
        results.append(gen_raster_h3_for_row_and_column(row, column, names, readers, h3_res))
        progress_bar.set_description("Processing column %s for row %s " % (column, row))

    logging.debug(f'Done iterating over row {row}')

    write_data_to_database_table(table_name, results, row)

    for reader in readers:
        reader.close()


def gen_raster_h3(raster_list, h3_res, table_name, thread_count):
    """Convert a list of identically formatted rasters to H3

    A function for efficiently turning a set of rasters into an H3 table.

    Takes a list of 1-band rasters with identical projection/transform.
    Reads each raster in blocks, and converts to h3 (nearest to centroid).
    Yields a dataframe with an h3index and one column for each raster's value.

    Args:
        raster_list: list of paths to rasters
        h3_res: h3 resolution to use for resampling

    Yields:
        A Pandas dataframe for each raster block (usu. 512x512) with an
        h3index and one column for each raster's value.
    """
    base = rio.open(raster_list[0])

    pool = ThreadPool(thread_count)

    height = ceil(base.height / BLOCKSIZE)
    width = ceil(base.width / BLOCKSIZE)

    logging.info(f"Generating h3 data from raster with {height} x {width}")

    partial_gen_raster_h3_for_row = partial(gen_raster_h3_for_row, raster_list, h3_res, table_name)
    row_progress_bar = tqdm(pool.imap_unordered(func=partial_gen_raster_h3_for_row, iterable=range(height)),
                            total=height)
    result_list_tqdm = []
    row_progress_bar.set_description("Processed %s rows of %s " % (len(result_list_tqdm), height))
    for row in row_progress_bar:
        result_list_tqdm.append(row)
        row_progress_bar.set_description("Processed %s rows of %s " % (len(result_list_tqdm), height))

    base.close()


def create_table(h3_res, raster_list, table):
    conn = postgres_thread_pool.getconn()
    cursor = conn.cursor()

    base = rio.open(raster_list[0])

    logging.debug(f"Loading first rows to build table {table}")
    names = [slugify(os.path.splitext(os.path.basename(r))[0]) for r in raster_list]
    readers = [rio.open(r) for r in raster_list]

    found_columns = False
    while not found_columns:
        for row in range(ceil(base.width / BLOCKSIZE)):
            column_data = gen_raster_h3_for_row_and_column(row, 0, names, readers, h3_res)
            if column_data is not None:
                found_columns = True
                break
    for reader in readers:
        reader.close()

    cols = zip(column_data.columns, column_data.dtypes)
    schema = ', '.join([f"{col} {DTYPES_TO_PG[str(dtype)]}" for col, dtype in cols])
    cursor.execute(f"CREATE TABLE {table} (h3index h3index PRIMARY KEY, {schema});")
    logging.debug(f"Created table {table} with columns {', '.join(column_data.columns)}")
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
                counter += len(data);
                data.to_csv(buffer, na_rep="NULL", header=False)
                buffer.seek(0)
                cursor.copy_from(buffer, table, sep=',', null="NULL")

    conn.commit()
    logging.info(f"{counter} values for row {row} written to database, ending row iteration")
    postgres_thread_pool.putconn(conn, close=True)


def load_raster_list_to_h3_table(raster_list, table, dataType, dataset, year, h3_res, thread_count):
    conn = postgres_thread_pool.getconn()

    cursor = conn.cursor()
    # remove link from materials entity for dropping h3 master table
    if dataset == 'es':
        if dataType == 'production':
            cursor.execute(f"""update {MATERIALS_TABLE} set "producerId" = NULL where "datasetId" like 'es_%'""")
        if dataType == 'harvest_area':
            cursor.execute(f"""update {MATERIALS_TABLE} set "harvestId" = NULL where "datasetId" like 'es_%'""")
    if dataset == 'spam':
        if dataType == 'production':
            cursor.execute(f"""update {MATERIALS_TABLE} set "producerId" = NULL where "datasetId" like 'spam_%'""")
        if dataType == 'harvest_area':
            cursor.execute(f"""update {MATERIALS_TABLE} set "harvestId" = NULL where "datasetId" like 'spam_%'""")
    logging.info(f"Dropping table {table}...")
    cursor.execute(f"DROP TABLE IF EXISTS {table};")
    cursor.execute(f"""DELETE FROM {H3_MASTER_TABLE} WHERE "h3tableName" = '{table}';""")
    conn.commit()

    postgres_thread_pool.putconn(conn)

    column_data = create_table(h3_res, raster_list, table)

    gen_raster_h3(raster_list, h3_res, table, thread_count)

    conn = postgres_thread_pool.getconn()
    cursor = conn.cursor()
    # add rows to master table for each column
    for column in column_data:
        cursor.execute(f"""
            INSERT INTO {H3_MASTER_TABLE} ("h3tableName", "h3columnName", "h3resolution", "year")
            VALUES ('{table}', '{column}', {h3_res}, {year});
        """)
        # inter id in material entity
        if dataType == 'indicator':
            cursor.execute(f"""select id from {INDICATORS_TABLE} where "nameCode" = '{dataset}'""")
            indicator_data = cursor.fetchall()
            cursor.execute(
                f"""update {H3_MASTER_TABLE}  set "indicatorId" = '{indicator_data[0][0]}' where  "h3columnName" = '{column}'""")
        else:
            cursor.execute(f"""select id from {H3_MASTER_TABLE} where "h3columnName" = '{column}'""")
            data = cursor.fetchall()
            materialId = dataset + '_' + column.split('_')[-2]
            if dataType == 'production':
                cursor.execute(
                    f""" update {MATERIALS_TABLE} set "producerId" = '{data[0][0]}' where "datasetId" = '{materialId}'""")
            if dataType == 'harvest_area':
                cursor.execute(
                    f""" update {MATERIALS_TABLE} set "harvestId" = '{data[0][0]}' where "datasetId" = '{materialId}'""")

    conn.commit()
    cursor.close()


def main(folder, table, data_type, dataset, year, h3_res, thread_count):
    tiffs = [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if os.path.splitext(f)[1] == '.tif'
    ]
    logging.info(f'Starting h3 import with {thread_count} threads')
    logging.info(f'Found {len(tiffs)} tiffs')
    load_raster_list_to_h3_table(tiffs, table, data_type, dataset, year, h3_res, thread_count)
    logging.info('Done')


if __name__ == "__main__":
    args = docopt(__doc__)
    main(
        args['<folder>'],
        args['<table>'],
        args['<dataType>'],
        args['<dataset>'],
        args['<year>'],
        int(args['--h3-res']),
        int(args['--thread-count'] if args['--thread-count'] else "4")
    )
