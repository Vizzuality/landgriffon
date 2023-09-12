# Makefile for downloading, processing, and uploading data
# Variables
DATA_DIR=data/
checksums_dir=../../../../h3_data_importer/data_checksums
AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

# Targets
.PHONY: unzip-limiting-nutrient

all: unzip-limiting-nutrient

# First you need to download the data manually from https://figshare.com/articles/figure/DRP_NO3_TN_TP_rasters/14527638/1?file=31154728 and save it in nutrient_assimilation_capacity/data
unzip-limiting-nutrient:
	unzip -q -u $(DATA_DIR)/hybas_l03_v1c_Cases.zip -d $(DATA_DIR)/

# Preprocess the data before ingesting instead of performing these calculations on the database
process-limiting-nutrients:
	python process_data.py $(DATA_DIR)/hybas_l03_v1c_Cases

upload_results:
	aws s3 cp $(DATA_DIR)/hybas_l03_v1c_Cases/nutrient_assimilation_capacity.shp ${AWS_S3_BUCKET_URL}/processed/nutrients_assimilation_capacity/

write_checksum:
	cd $(DATA_DIR)/hybas_l03_v1c_Cases && sha256sum nutrient_assimilation_capacity.shp > $(checksums_dir)/nutrient_assimilation_capacity

