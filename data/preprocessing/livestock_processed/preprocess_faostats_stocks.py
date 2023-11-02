import os
import logging
import argparse

import pandas as pd
import geopandas as gpd
import psycopg2


logging.basicConfig(level=logging.INFO)
log = logging.getLogger("preprocessing_processed_livestock_stock_faostats_file")


def calculate_percentage(df, numerator_col, denominator_col, output_col):
    """
    Calculate the percentage of the numerator column from the total of the numerator and denominator columns.
    """
    df[output_col] = df[numerator_col] / (df[numerator_col] + df[denominator_col])
    return df


def get_country_geometry():
    """
    Get the country geometry from a database.
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
        """SELECT ar."isoA3", gr."theGeom"
                                    FROM admin_region ar
                                    INNER JOIN geo_region gr ON gr.id = ar."geoRegionId"
                                    WHERE ar."level" = 0
                                    """,
        conn,
        geom_col="theGeom",
    )
    return countries_df


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Process livestock preprocessed faostats data.")
    parser.add_argument(
        "input_file_main",
        type=str,
        help="Path to the input file containing vector files of the main value to preprocess",
    )
    parser.add_argument(
        "input_file_secondary",
        type=str,
        help="Path to the input file containing vector files of the secondary value to preproces",
    )
    parser.add_argument("output_file", type=str, help="Path to the output file to save processed data")
    args = parser.parse_args()

    # Open the files and clean the data
    df_main = pd.read_csv(args.input_file_main)
    df_secondary = pd.read_csv(args.input_file_secondary)

    # Clean the data by just keeping the necesary columns
    df_main_clean = df_main["Area Code (ISO3)", "Value", "Unit"]
    df_secondary_clean = df_secondary["Area Code (ISO3)", "Value", "Unit"]

    # Rename the columns
    df_main_renamed = df_main_clean.rename(columns={"Area Code (ISO3)": "isoA3", "Value": "main_value"})
    df_secondary_renamed = df_secondary_clean.rename(columns={"Area Code (ISO3)": "isoA3", "Value": "secondary_value"})

    # Merge the dataframes
    df_merged = df_main_renamed.merge(df_secondary_renamed, on="isoA3")

    # Calculate the percentage
    df_merged = calculate_percentage(df_merged, "main_value", "secondary_value", "percentage")

    # Get the country geometry
    countries_df = get_country_geometry()

    # Merge the percentage dataframe with the country geometry dataframe
    df_merged = df_merged.merge(countries_df, on="isoA3")
    # Set geoeometry and crs
    df_merged = df_merged.set_geometry("theGeom")
    df_merged = df_merged.set_crs("EPSG:4326")
    # Save the dataframe
    df_merged.to_file(args.output_file)


if __name__ == "__main__":
    main()
