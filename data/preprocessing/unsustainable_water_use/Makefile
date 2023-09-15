# Makefile for downloading, processing, and uploading data
# Variables
DATA_DIR=data/
checksums_dir=../../../../h3_data_importer/data_checksums
AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

# Targets
.PHONY: unzip-aqueduct extract-aqueduct process-aqueduct upload_results write_checksum

all: unzip-aqueduct extract-aqueduct process-aqueduct upload_results write_checksum

# Aqueduct Global water risk contextual data
download-aqueduct:
	mkdir -p $(DATA_DIR)
	wget -q -O $(DATA_DIR)/aqueduct-4-0-water-risk-data.zip https://files.wri.org/aqueduct/aqueduct-4-0-water-risk-data.zip

extract-aqueduct: download-aqueduct
	unzip -q -u $(DATA_DIR)/aqueduct-4-0-water-risk-data.zip  -d $(DATA_DIR)/

# Preprocess the aqueduct data to obtain the required percentage of excess withdrawals (SBTN targets)
# More information can be found on the Landgriffon methodology v2.0 under the unsustainable water use
process-aqueduct:
	mkdir -p $(DATA_DIR)/excess_withdrawals
	python preprocess_data.py $(DATA_DIR)/Aqueduct40_waterrisk_download_Y2023M07D05/GDB $(DATA_DIR)/excess_withdrawals

# Create a zip archive of the shapefile and related files
# Upload preprocessed results to s3 bucket
upload_results:
	cd $(DATA_DIR)/excess_withdrawals && zip -r excess_withdrawals.zip excess_withdrawals.*
	aws s3 cp $(DATA_DIR)/excess_withdrawals/excess_withdrawals.zip ${AWS_S3_BUCKET_URL}/processed/unsustainable_water_use/

write_checksum:
	cd $(DATA_DIR)/excess_withdrawals && sha256sum excess_withdrawals.shp > $(checksums_dir)/excess_withdrawals
