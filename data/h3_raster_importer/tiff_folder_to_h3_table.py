"""Reads a folder of .tif, converts to h3 and loads into a PG table

All GeoTiffs in the folder must have identical projection, transform, etc.
The resulting table will contain a column for each GeoTiff.
Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    tiff_folder_to_h3_table.py <folder> <table> [--h3-res=6]

Arguments:
    <folder>          Folder containing GeoTiffs.
    <table>           Postgresql table to overwrite.

Options:
    -h                Show help
    --h3-res=<res>    h3 resolution to use [default: 6].
"""

import os
from io import StringIO
import re
from math import ceil

import psycopg2
import h3ronpy.raster
import numpy as np
import pandas as pd
import rasterio as rio
import logging
from docopt import docopt


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
BLOCKSIZE=512
H3_TABLE_PREFIX = 'h3_grid'
H3_MASTER_TABLE = 'h3_data'

logging.basicConfig(level=logging.INFO)


def slugify(s):
    return re.sub("[^0-9a-z_]+", "_", s.lower())


def gen_raster_h3(raster_list, h3_res, geo=False):
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
    readers = [rio.open(r) for r in raster_list]
    names = [slugify(os.path.splitext(os.path.basename(r))[0]) for r in raster_list]
    
    base = readers[0]
    for j in range(ceil(base.height/BLOCKSIZE)):
        for i in range(ceil(base.width/BLOCKSIZE)):
            window = rio.windows.Window(i*BLOCKSIZE, j*BLOCKSIZE, BLOCKSIZE, BLOCKSIZE)
            w_transform = rio.windows.transform(window, base.transform)
            dfs = []
            for src in readers:
                if src.transform != base.transform:
                    raise ValueError("Transforms do not match")
                arr = src.read(1, window=window)
                _df = h3ronpy.raster.raster_to_dataframe(arr, w_transform, h3_res, nodata_value=src.profile['nodata'], compacted=False, geo=geo)
                dfs.append(_df.set_index('h3index')['value'])
            df = pd.concat(dfs, axis=1)
            logging.info(f'Reading block {j}, {i}: h3index count {len(df)}')
            if len(df):
                df.columns = names
                df.index = pd.Series(df.index).apply(lambda x: hex(x)[2:])
                # cast h3index from int64 to hex string
                yield df
    for src in readers:
        src.close()


def load_raster_list_to_h3_table(raster_list, table, h3_res):
    conn = psycopg2.connect(
        host=os.getenv('API_POSTGRES_HOST'),
        port=os.getenv('API_POSTGRES_PORT'),
        user=os.getenv('API_POSTGRES_USERNAME'),
        password=os.getenv('API_POSTGRES_PASSWORD')
    )
    cursor = conn.cursor()
    cursor.execute(f"DROP TABLE IF EXISTS {table};")
    cursor.execute(f"""DELETE FROM {H3_MASTER_TABLE} WHERE "h3tableName" = '{table}'""")
    
    first = True

    for block_df in gen_raster_h3(raster_list, h3_res):
        if first:
            cols = zip(block_df.columns, block_df.dtypes)
            schema = ', '.join([f"{col} {DTYPES_TO_PG[str(dtype)]}" for col, dtype in cols])            
            cursor.execute(f"CREATE TABLE {table} (h3index h3index PRIMARY KEY, {schema});")
            conn.commit()
            logging.info(f"Created table {table} with columns {', '.join(block_df.columns)}")
            first = False

        # efficiently copy as file blob
        with StringIO() as buffer:
            block_df.to_csv(buffer, header=False)
            buffer.seek(0)
            cursor.copy_from(buffer, table, sep=',')
            conn.commit()
    
    for column in block_df.columns:
        cursor.execute(f"""
            INSERT INTO {H3_MASTER_TABLE} ("h3tableName", "h3columnName", "h3resolution")
            ('{table}', '{column}', {h3_res})
        """)

    cursor.close()


def main(folder, table, h3_res):
    tiffs = [
        os.path.join(folder, f) 
        for f in os.listdir(folder)
        if os.path.splitext(f)[1] == '.tif'
    ]
    logging.info(f'Found {len(tiffs)} tiffs')
    load_raster_list_to_h3_table(tiffs, table, h3_res)
    logging.info('Done')


if __name__ == "__main__":
    args = docopt(__doc__)
    main(
        args['<folder>'],
        args['<table>'],
        int(args['--h3-res'])
    )