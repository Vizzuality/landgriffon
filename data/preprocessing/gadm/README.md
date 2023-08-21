# GADM preprocessing

This folder contains the scripts to preprocess GADM data and make it ready for import.
It creates:

- a `geo_region` table with the level 0, 1, 2 gadm geometries converted to h3 compacted and flat.
- a `gadm_levels0_2` table with the levels 0, 1, 2 gadm simplified and combined in the same file.

Everything is orchestrated by the Makefile. To run it, you need to have:

- a local instance of landgriffon's db running
- `mapshaper`
- gdal's `ogr2ogr`

## Recreate the data

If you want to update the gadm version used, you need to update the urls and names of the gadm dataset used in the
Makefile.
Then, you can run `make` to start processing. Basically, it will:

- download the data
- simplify the geometries
- combine levels 0, 1, 2 in the same shapefile `gadm36_levels0-2_simp.shp` and imports it as a table `gadm_levels0_2` (
  it is needed to create the `geo_region` table)
- launch [make_geo_region_table.sql](make_geo_region_table.sql) to recreate the `geo_region` table and export it
  to `geo_region.csv`

Once everything is done, computes the sha256 of files in ./data and update it in `gadm_importer/data_checksums`.
