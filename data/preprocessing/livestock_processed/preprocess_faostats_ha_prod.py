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


def open_clean(file, data_type):
    # Define the units available for conversion
    units_to_tonnes = {"100 g/An": 100000, "100 mg/An": 1000000, "LSU/ha": 1}

    # Open the file
    df = pd.read_csv(file)

    # Check unique units from the dataframe
    unit_list = list(df["Unit"].unique())

    # Check if there is a single unit and it exists in the conversion dictionary
    if len(unit_list) == 1 and unit_list[0] in units_to_tonnes:
        unit = unit_list[0]
        conversion = units_to_tonnes[unit]
    else:
        # Check which units from the dataframe exist in the conversion dictionary
        valid_units = [unit for unit in unit_list if unit in units_to_tonnes]
        if len(valid_units) == 1:
            unit = valid_units[0]
            conversion = units_to_tonnes[unit]
        else:
            log.info("Multiple valid units or conversions found.")
            return None

    # Clean file and get just the specified unit value
    df = df.loc[df["Unit"] == unit, ["Area Code (ISO3)", "Year", "Unit", "Value"]]

    # Convert the 100mg /Animal to T/Animal
    df["Value"] = df["Value"] / conversion
    if data_type == "production":
        df["Unit"] = "T/An"
    elif data_type == "harvest":
        df["Unit"] = "LSU/ha"
    else:
        log.warning("Invalid data type specified.")
        return None

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


def process_faostats_data(input_file, output_file, data_type):
    # Get the country geometry
    countries_df = get_country_geometry()

    # Open and clean the file
    df = open_clean(input_file, data_type)

    # create a preprocess directory if it does not exist
    if not os.path.exists("./data/faostats_processed") and data_type == "production":
        os.makedirs("./data/faostats_processed/production")
    elif not os.path.exists("./data/faostats_processed") and data_type == "harvest":
        os.makedirs("./data/faostats_processed/harvest")

    # Merge the data with the country geometry
    df = merge_faostat_country(df, countries_df, output_file)

    return df


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Process livestock preprocessed faostats data.")
    parser.add_argument("input_file", type=str, help="Path to the input file containing vector files")
    parser.add_argument("output_file", type=str, help="Path to the output file to save processed data")
    parser.add_argument("data_type", type=str, help="Type of data to process")
    args = parser.parse_args()

    # Process the specified folder
    process_faostats_data(args.input_file, args.output_file, args.data_type)


if __name__ == "__main__":
    main()
