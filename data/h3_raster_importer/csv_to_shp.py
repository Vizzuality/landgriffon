
"""Merges a shapefile with a csv by a attribute field.

Usage:
    csv_to_shp.py <csv_path> <shp_path> <field> <output_path>

Arguments:
    <csv_path>          Path to csv file to merge.
    <shp_path>          Path to shpafile to merge.
    <field>             Field that would be used for merging the csv and the shp.
    <output_path>       Path for output.

"""

import pandas as pd
import geopandas as gpd
import logging
from docopt import docopt

def merge_files(csv_path, shp_path, field, output_path):
    """
    Function for merging csv with shp
    """
    vector_file = gpd.read_file(shp_path)
    csv_file = gpd.read_file(csv_path)

    merged_file = pd.merge(
    csv_file,
    vector_file,
    how= 'inner',
    on=field)

    merged_file = merged_file.set_geometry('geometry')

    # export
    return merged_file.to_file(
            output_path,
            driver='ESRI Shapefile')

def main(csv_path, shp_path, field, output_path):
    logging.info(f'Merging files ...')
    merge_files(csv_path, shp_path, field, output_path)
    logging.info('Done!')

if __name__ == "__main__":
    args = docopt(__doc__)
    main(
        args['<csv_path>'],
        args['<shp_path>'],
        args['<field>'],
        args['<output_path>']
    )

