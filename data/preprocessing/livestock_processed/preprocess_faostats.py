import os
import logging
import argparse

import psycopg2
import pandas as pd
import geopandas as gpd

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("preprocessing_processed_livestock_faostats_file")


# Define the function to get the country geometry from gadm database
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
        """SELECT ar."isoA3", gr."theGeom"
                                    FROM admin_region ar
                                    INNER JOIN geo_region gr ON gr.id = ar."geoRegionId"
                                    WHERE ar."level" = 0
                                    """,
        conn,
        geom_col="theGeom",
    )

    return countries_df


def open_clean(file):
    # Define the units available for conversion
    units_to_tonnes = {"100 g/An": 100000, "100 mg/An": 1000000}

    # Open the file
    df = pd.read_csv(file)

    # check the units from the dataframe and the conversionneeded
    unit_list = list(df["Unit"].unique())
    # check the conversion from the unit_to_tonnes dictionary
    if len(unit_list) == 1:
        conversion = units_to_tonnes[unit_list[0]]
        unit = unit_list[0]
    else:
        log.info("There is more than one unit in the dataframe")
        # check which of my units of the dataframe exist in the units_to_tonnes dictionary
        conversion_list = [units_to_tonnes[unit] for unit in unit_list if unit in units_to_tonnes.keys()]
        unit_list = [unit for unit in unit_list if unit in units_to_tonnes.keys()]
        if len(conversion_list) == 1:
            conversion = conversion_list[0]
            unit = unit_list[0]
        else:
            log.info("There is more than one conversion in the dictionary")
            conversion = None
            unit = None
    # Clean file and get just the 100 mg by animal value
    df = df[["Area Code (ISO3)", "Year", "Unit", "Value"]]
    df = df[df["Unit"] == unit]

    # Convert the 100mg /Animal to T/Animal
    df["Value"] = df["Value"] / conversion
    df["Unit"] = df["Unit"].replace(unit, "T/An")

    return df


# Define the fuction to merge the FAOSTAT data with the country geometry
def merge_faostat_country(df, countries_df, output_file):
    # Merge the data with the country geometry
    df = df.merge(countries_df, left_on="Area Code (ISO3)", right_on="isoA3")
    # Set geoeometry and crs
    df = df.set_geometry("theGeom")
    df = df.set_crs("EPSG:4326")

    # Save to file
    df.to_file(output_file)

    return df


def process_faostats_data(input_file, output_file):
    # Get the country geometry
    countries_df = get_country_geometry()

    # Open and clean the file
    df = open_clean(input_file)

    # create a preprocess directory if it does not exist
    if not os.path.exists("./data/faostats_processed"):
        os.makedirs("./data/faostats_processed")

    # Merge the data with the country geometry
    df = merge_faostat_country(df, countries_df, output_file)

    return df


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Process livestock preprocessed faostats data.")
    parser.add_argument("input_file", type=str, help="Path to the input file containing vector files")
    parser.add_argument("output_file", type=str, help="Path to the output file to save processed data")
    args = parser.parse_args()

    # Process the specified folder
    process_faostats_data(args.input_file, args.output_file)


if __name__ == "__main__":
    main()
