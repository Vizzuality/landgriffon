""" Reads the limiting nutrients equal area vector file, reporjects the file to EPSG4326 and estimates the percentage of reduction needed to meet a good water quality conditions.

Usage:
process_data.py <folder>

Arguments:
    <folder>     Folder containing the limiting nutrients shapefile
"""
import os
import logging
from pathlib import Path
import argparse

import geopandas as gpd

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

# Define the function to calculate perc_reduction
def calculate_perc_reduction(row):
    if row['Cases_v2_1'] == 4 and row['TP_con_V2_']:
        return ((row['TP_con_V2_'] - 0.046) / row['TP_con_V2_']) * 100
    elif row['Cases_v2_1'] == 2 and row['TN_con_V2_']:
        return ((row['TN_con_V2_'] - 0.7) / row['TN_con_V2_']) * 100
    else:
        return 0

def process_folder(folder):
    vec_extensions = "gdb gpkg shp json geojson".split()
    path = Path(folder)
    vectors = []
    for ext in vec_extensions:
        vectors.extend(path.glob(f"*.{ext}"))
    if not vectors:
        log.error(f"No vectors with extension {vec_extensions} found in {folder}")
        return
    if len(vectors) == 1: #folder just contains one vector file
        # Read the shapefile
        gdf = gpd.read_file(vectors[0])
        # Check and reproject to EPSG:4326
        gdf = check_and_reproject_to_4326(gdf)
        # Calculate perc_reduction and add it as a new column
        gdf['perc_reduc'] = gdf.apply(calculate_perc_reduction, axis=1)
        # Save the processed data to a new shapefile
        gdf = gdf[['Cases_v2_1', 'perc_reduc', 'geometry']]
        output_file = os.path.join(folder, 'nutrient_assimilation_capacity.shp')
        log.info(f"Saving preprocessed file to {output_file}")
        gdf.to_file(output_file)
    else:
        mssg = (
            f"Found more than one vector file in {folder}."
            f" For now we only support folders with just one vector file."
        )
        logging.error(mssg)
        return

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Process limiting nutrients vector files.")
    parser.add_argument("folder", type=str, help="Path to the folder containing vector files")
    args = parser.parse_args()

    # Process the specified folder
    process_folder(args.folder)

if __name__ == "__main__":
    main()
