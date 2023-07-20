# H3 Data Importer

## H3 Raster Importer

Download, convert, and import rasters into PGSQL H3 tables

### Run

Import raster data sources into the Landgriffon DB.

From the root directory:

1. Make sure your `.env` is set up with the `API_POSTGRES...` variables.
2. `make start-api` - Make sure the LandGriffon DB is running.
3. `cd data && ./data.sh seed-h3-tables` - Run the h3 tables import script.

Currently this will download the following data sources and create tables in the database
<folder> <table> <dataType> <dataset> <year> [--h3-res=6] [--thread-count=4]

| dataset                               | table                              | dataType | year | h3_res | columns                         |
| ------------------------------------- | ---------------------------------- | -------- | ---- |
| MapSPAM v2 global production for 2010 | `h3_grid_spam2010v2r0_global_prod` | producer | 2010 | 6      | One column for each of 42 crops |

Check the DB to see that the table(s) have been imported.

### Develop

The main file for loading data is the `Makefile`. Within the makefile you will find rules for:

- Creating a directory for each data source
- Downloading the data
- Unzipping the data
- Running ./tiff_folder_to_h3_table.py to load the folder into the database

To add additional raster data sources copy the makefile patterns to download, extract, and import additional datasets.

The hard work is done by `tiff_folder_to_h3_table.py`.

```
Reads a folder of .tif, converts to h3 and loads into a PG table

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
```

## H3 Vector Importer

Download, convert, and import vectors into PGSQL H3 tables

This module is mainly used for importing contextual layers into the H3 tables.

The contextual layer ingestion has its own rule *contextual-layers* in `data/h3_data_importer/Makefile` and **it is not set in the `all` rule**. This way the contextual layers ingestion can be done separately from the whole H3 ingestion. In the "master" makefile (`data/Makefile`) the `seed-contextual-layers` rule is set to run the contextual layers ingestion. In order to add new vector contextual layers to the system you need to add the new rule to the *contextual-layers* rules in the `data/h3_data_importer/Makefile`.

The vector conversion and DB insertions are done in `vector_folder_to_h3_table.py`.

```
Reads a folder of vector files, converts to h3 and loads into a PG table

All vector files in the folder must have identical projection, transform, etc.
Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    vector_folder_to_h3_table.py <folder> <table> <column> <dataset> <category> <year> [--h3-res=6]

Arguments:
    <folder>          Folder containing GeoTiffs.
    <table>           Postgresql table to overwrite.
    <column>          Column name of the feature to keep.
    <dataset>         Dataset name
    <category>        Dataset category [Environmental datasets, Business datasets, Food and agriculture, Default]
    <year>            Year of the imported dataset
Options:
    -h                Show help
    --h3-res=<res>    h3 resolution to use [default: 6].
```

## H3 CSV Importer

Module to import table format data into H3 tables. Mainly used to import contextual layers that are at country level and in CSV format. The **CSV must have a column with the iso3 country codes**.

The make rules for this module must be in `data/h3_data_importer/Makefile` and added to the `contextual-layers` rule as we do in H3 Vector Importer.

```
The script converts the csv with country data to H3 grid cells using the already populated geo_region and admin_region
tables to get the h3 hexes for each country. This way it only uses a sql join and avoid doing geo-spatial operations and
querys.

Postgres connection params read from environment:
 - API_POSTGRES_HOST
 - API_POSTGRES_USER
 - API_POSTGRES_PASSWORD
 - API_POSTGRES_DATABASE

Usage:
    csv_to_h3_table.py <table> <column> <year>

Arguments:
    <file>            Path to the csv file with the hdi data.
    <table>           Postgresql table to create or overwrite.
    <column>          Column to insert HDI data into.
    <year>            Year of the data used.
    <iso3_column>     Column with the country iso3 code.
```
