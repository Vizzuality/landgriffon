# Makefile for downloading, processing, and uploading data
# Variables
DATA_DIR=data/
checksums_dir=../../../../h3_data_importer/data_checksums
AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

# Targets
.PHONY: unzip-limiting-nutrient process-limiting-nutrients zip-shapefile upload_results write_checksum:

all: unzip-limiting-nutrient process-limiting-nutrients zip-shapefile upload_results write_checksum:

# First you need to download the data manually from https://figshare.com/articles/figure/DRP_NO3_TN_TP_rasters/14527638/1?file=31154728 and save it in nutrient_load_reduction/data
unzip-limiting-nutrient:
	unzip -q -u $(DATA_DIR)/hybas_l03_v1c_Cases.zip -d $(DATA_DIR)/

# Preprocess the data before ingesting instead of performing these calculations on the database
process-limiting-nutrients:
	mkdir -p $(DATA_DIR)/nutrient_load_reduction
	python process_data.py $(DATA_DIR)/hybas_l03_v1c_Cases $(DATA_DIR)/nutrient_load_reduction

# Create a zip archive of the shapefile and related files
zip-shapefile:
	cd $(DATA_DIR)/nutrient_load_reduction && zip -r nutrient_load_reduction.zip nutrient_load_reduction.*

upload_results:
	aws s3 cp $(DATA_DIR)/nutrient_load_reduction/nutrient_load_reduction.zip ${AWS_S3_BUCKET_URL}/processed/nutrients_load_reduction/

write_checksum:
	cd $(DATA_DIR)/nutrient_load_reduction && sha256sum nutrient_load_reduction.shp > $(checksums_dir)/nutrient_load_reduction

