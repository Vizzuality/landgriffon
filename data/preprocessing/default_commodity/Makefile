checksums_dir=../../../../h3_data_importer/data_checksums
data_dir=./data/

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data
export AWS_ACCESS_KEY_ID = $(DATA_S3_ACCESS_KEY)
export AWS_SECRET_ACCESS_KEY = $(DATA_S3_SECRET_KEY)

.PHONY: extract-countries rasterize-geometries upload-data write_checksums

all:  upload-data write_checksums

extract-countries:
	mkdir -p $(data_dir)/countries
	python preprocess.py $(data_dir)/countries/gadm_level1.shp

rasterize-geometries: extract-countries
	mkdir -p $(data_dir)/default_commodity
	gdal_rasterize -ot Byte -tr 0.083333 0.083333 -te -180.0 -90 180 90.0 \
    -l gadm_level1 -burn 1 -of GTiff $(data_dir)/countries/gadm_level1.shp $(data_dir)/default_commodity/DEFAULT_commodity.tif

upload-data: rasterize-geometries
	aws s3 sync $(data_dir)/default_commodity $(AWS_S3_BUCKET_URL)/processed/default_commodity/

write_checksums:
	cd $(data_dir)/default_commodity  && sha256sum * > $(checksums_dir)/default_commodity
