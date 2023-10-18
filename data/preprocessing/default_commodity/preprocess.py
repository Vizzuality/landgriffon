import os
import logging
import argparse

import psycopg2
import geopandas as gpd


logging.basicConfig(level=logging.INFO)
log = logging.getLogger("preprocessing_country_default_raster")


def get_country_geometry():
    """
    Get the geometry and the iso3 code from the database
    This geometry is used to spatalised the faostat data
    """
    # Connect to the database
    conn = psycopg2.connect(
        host=os.getenv("API_POSTGRES_HOST"),
        port=os.getenv("API_POSTGRES_PORT"),
        database=os.getenv("API_POSTGRES_DATABASE"),
        user=os.getenv("API_POSTGRES_USERNAME"),
        password=os.getenv("API_POSTGRES_PASSWORD"),
    )

    # Get the countries geometries
    countries_df = gpd.read_postgis(
        """SELECT ar."level", gr."theGeom"
                                    FROM admin_region ar
                                    INNER JOIN geo_region gr ON gr.id = ar."geoRegionId"
                                    WHERE ar."level" = 0
                                    """,
        conn,
        geom_col="theGeom",
    )

    return countries_df


def get_country_default_raster(output_file):
    # extract the country geometry from the database
    countries_df = get_country_geometry()
    # save counry geodataframe to file
    countries_df.to_file(output_file)


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Process ghg farm livestock emissions.")
    parser.add_argument("output_file", type=str, help="Path to the output file to save processed data")
    args = parser.parse_args()

    # Process the specified folder
    get_country_default_raster(args.output_file)


if __name__ == "__main__":
    main()
