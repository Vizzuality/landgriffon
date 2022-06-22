# H3 Raster Importer

Download, convert, and import rasters into PGSQL H3 tables

### Run

Import raster data sources into the Landgriffon DB.

From the root directory:
1. Make sure your `.env` is set up with the `API_POSTGRES...` variables.
2. `make start-api` - Make sure the LandGriffon DB is running.
3. `cd data && ./data.sh seed-h3-tables` - Run the h3 tables import script.

Currently this will download the following data sources and create tables in the database
<folder> <table> <dataType> <dataset> <year> [--h3-res=6] [--thread-count=4]

| dataset | table | dataType| year | h3_res | columns |
| --- | --- | --- | --- |
| MapSPAM v2 global production for 2010 | `h3_grid_spam2010v2r0_global_prod` | producer | 2010 | 6 | One column for each of 42 crops |

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
python tiff_folder_to_h3_table.py

Read a folder of .tif, converts to h3 and loads into a PG table

All GeoTiffs in the folder must have identical projection, transform, etc.
The resulting table will contain a column for each GeoTiff.
Postgres connection params are read from the environment.

Usage:
    tiff_folder_to_h3_table.py <folder> <table> [--h3-res=6]

Arguments:
    <folder>          Folder containing GeoTiffs.
    <table>           Postgresql table to overwrite (must be lower case).

Options:
    -h                Show help
    --h3-res=<res>    h3 resolution to use [default: 6].
```
