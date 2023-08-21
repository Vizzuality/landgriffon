# GADM importer

importer populates tables `geo_region`, `admin_region` and from precomputed data stored in s3 bucket.

## `geo_region`

`geo_region` consists in gadm levels 0, 1 and 2 with the geometries converted to h3 compacted and flat. It takes a
while to compute, so it is stored in s3 bucket. To recreate/update it, go to `../preprocessing/gadm` and follow the
instructions in `make`.
Then upload the resulting files to the s3 location `landgriffon-raw-data/processed/geo_region` and update the checksums
in `data_checksums`.

## `gadm_levels0_2`

This entity is created from raw gadm dataset after preprocessing. The cleaned result is also stored in s3 location
`landgriffon-raw-data/processed/gadm`.
It is recreated/update with the same pipeline as `geo_region`.

## `admin_region`

`admin_region` is created from `geo_region` and `gadm_levels0_2` when this importer runs. It is not stored in s3.
