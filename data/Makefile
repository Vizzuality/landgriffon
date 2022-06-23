.PHONY: do-nothing

#################################################################################
# GLOBALS                                                                       #
#################################################################################

PROJECT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
BUCKET = [OPTIONAL] your-bucket-for-syncing-data (do not include 's3://')
PROFILE = default
PROJECT_NAME = data

do-nothing:
	@echo "Doing nothing... "

# ## Make Dataset
seed-data: seed-source-data seed-gadm seed-h3-tables

seed-source-data:
	@echo "Importing source data... "
	cd ./base_data_importer && make -j 4

seed-gadm:
	@echo "Importing GADM data... "
	cd ./data_download && make -j 4

seed-h3-tables:
	@echo "Starting seeding h3 tables... "
	cd ./h3_raster_importer && make

seed-contextual-layers:
	@echo "Starting seeding contextual layers... "
	cd ./h3_raster_importer && make contextual-layers
