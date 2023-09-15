""" Reads the baseline water stress from aqueduct vector file, reporjects the file to EPSG4326 and estimates the percentage of reduction needed to meet a good water quality conditions.

Usage:
process_data.py <input_folder> <output_folder>

Arguments:
    <folder>     Folder containing the baseline aqueduct data
    <folder>     Folder containing the preprocessed percentage of required reduction data
"""
from http.client import TEMPORARY_REDIRECT
import logging
from pathlib import Path
import argparse

import geopandas as gpd
from shapely.geometry import MultiPolygon

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("preprocessing_limiting_nutrients_file")

def check_and_reproject_to_4326(gdf):
    """
    Checks if a GeoDataFrame is in CRS 4326 (WGS84) and reprojects it if not.

    Parameters:
    - gdf: GeoDataFrame to check and reproject if needed.

    Returns:
    - Reprojected GeoDataFrame (if reprojected) or the original GeoDataFrame (if already in 4326).
    """
    if gdf.crs is None or gdf.crs.to_epsg() != 4326:
        log.info("Reprojecting GeoDataFrame to EPSG:4326 (WGS84)...")
        try:
            # Reproject to EPSG:4326
            gdf = gdf.to_crs(epsg=4326)
            log.info("Reprojection successful.")
        except:
            log.error("Reprojection failed with error")
    else:
        log.info("GeoDataFrame is already in EPSG:4326 (WGS84).")

    return gdf

def fix_invalid_geometries(gdf):
    """
    Identify and fix invalid geometries in a GeoDataFrame.

    Parameters:
    gdf (GeoDataFrame): Input GeoDataFrame.

    Returns:
    GeoDataFrame: A GeoDataFrame with invalid geometries fixed.
    """
    # Step 1: Identify invalid geometries
    invalid_geometries = gdf[~gdf.geometry.is_valid]

    # Step 2: Fix invalid geometries
    if not invalid_geometries.empty:
        fixed_geometries = []
        for geom in invalid_geometries.geometry:
            if geom.geom_type == 'Polygon':
                # Try to fix invalid Polygon geometries using buffer(0)
                fixed_geom = geom.buffer(0)
            elif geom.geom_type == 'MultiPolygon':
                # If it's a MultiPolygon, fix each constituent Polygon
                fixed_polygons = [polygon.buffer(0) for polygon in geom.geoms]
                fixed_geom = MultiPolygon(fixed_polygons)
            else:
                # Skip unsupported geometry types
                fixed_geom = geom

            fixed_geometries.append(fixed_geom)

        # Replace invalid geometries with fixed ones
        gdf.loc[invalid_geometries.index, 'geometry'] = fixed_geometries
    # Step 3: Remove rows with None geometries
    gdf = gdf[~gdf.geometry.is_empty]

    return gdf


# Calculation of the required percentage of reduction.
# This reduction is calculated in all catchment which baseline water stress is above the threshold 0.4.
# More information can be found on the LandGriffon v2.0 methodology under the unsustainable water use indicator.
# NOTE: There are some cases where the basin is categorised as extremely high BWS (>80%) but the raw value is 9999.0
# We are considering in those cases that the bws raw value is equal to 0.8
def calculate_perc_reduction(row):
    if row['bws_cat'] > 2 and row['bws_raw'] != 9999:
        return ((row['bws_raw'] - 0.4) / row['bws_raw']) * 100
    elif row['bws_cat']==4 and row['bws_raw'] == 9999:
        return ((0.8- 0.4) / 0.8) * 100
    else:
        return 0

def process_folder(input_folder, output_folder):
    vec_extensions = "gdb gpkg shp json geojson".split()
    input_path = Path(input_folder)
    output_path = Path(output_folder)
    vectors = []
    for ext in vec_extensions:
        vectors.extend(input_path.glob(f"*.{ext}"))
    if not vectors:
        log.error(f"No vectors with extension {vec_extensions} found in {input_folder}")
        return
    if len(vectors) == 1: #folder just contains one vector file
        # Read the shapefile
        gdf = gpd.read_file(vectors[0])
        # Use dropna() to remove rows with None-type geometries and fix invalid geometries
        log.info('Fixing invalid geometries')
        gdf = fix_invalid_geometries(gdf)
        # Check and reproject to EPSG:4326
        gdf = check_and_reproject_to_4326(gdf)
        # Clean gdf to keep just necessary columns
        gdf = gdf[['bws_cat', 'bws_raw', 'geometry']]
        # Calculate perc_reduction and add it as a new column
        gdf['perc_reduc'] = gdf.apply(calculate_perc_reduction, axis=1)
        # Save the processed data to a new shapefile
        output_file = output_path / 'excess_withdrawals.shp'
        log.info(f"Saving preprocessed file to {output_file}")
        gdf.to_file(output_file)
    else:
        mssg = (
            f"Found more than one vector file in {input_folder}."
            f" For now we only support folders with just one vector file."
        )
        logging.error(mssg)
        return

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Process aqueduct vector files.")
    parser.add_argument("input_folder", type=str, help="Path to the input folder containing vector files")
    parser.add_argument("output_folder", type=str, help="Path to the output folder to save processed data")
    args = parser.parse_args()

    # Process the specified folder
    process_folder(args.input_folder, args.output_folder)

if __name__ == "__main__":
    main()
