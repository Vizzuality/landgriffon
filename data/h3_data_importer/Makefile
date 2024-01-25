#########################
# About this var
# This is a rough controller of how many parallel system threads you'll have
# It does not necessarily represent a max thread count, but it's probably similar to that
# Lower if you are having issues. Increase at your own risk
#########################
PARALLELIZATION_FACTOR=8

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

WORKDIR_MAPSPAM_PROD=data/mapspam_prod
WORKDIR_MAPSPAM_HA=data/mapspam_ha
WORKDIR_GLW3=data/glw3
WORKDIR_WATER_FOOTPRINT=data/waterFootprint
WORKDIR_AQUEDUCT=data/contextual/aqueduct
WORKDIR_HDI=data/contextual/hdi
WORKDIR_DEFORESTATION=data/hansen_loss
WORKDIR_GHG=data/forest_ghg
WORKDIR_NATURAL_CROP_CONVERSION=data/natural_crop_conversion
WORKDIR_NUTRIENT_LOAD_REDUCTION=data/nutrient_load_reduction
WORKDIR_BIODIVERSITY=data/biodiversity
WORKDIR_GHG_FARM=data/ghg_farm
WORKDIR_LIVESTOCK_PROCESSED=data/livestock_processed
WORKDIR_LIVESTOCK_GHG=data/livestock_ghg
WORKDIR_DEFAULT_COMMODITY=data/default_commodity
WORKDIR_EARTHSTAT=data/earthstat


CHECKSUMS_PATH=data_checksums

export AWS_ACCESS_KEY_ID = $(DATA_S3_ACCESS_KEY)
export AWS_SECRET_ACCESS_KEY = $(DATA_S3_SECRET_KEY)

all:
	@aws s3 ls $(AWS_S3_BUCKET_URL) 2>&1 > /dev/null; \
	if [ $$? -ne 0 ]; \
	then \
		echo "Error: Cannot access the expected AWS S3 bucket."; \
		false; \
	fi
	@echo "AWS S3 bucket access confirmed, proceeding with import..."
	make clean
	make crop indicators
	make delete-h3-tables

crop: convert-mapspam-crop-production convert-mapspam-crop-harvest convert-glw3-livestock convert-livestock-processed convert-default-commodity convert-earthstat

indicators: convert-aqueduct convert-deforestation convert-forestGHG convert-naturalCropConversion convert-nutrientLoadReduction convert-biodiversity convert-ghg-farm convert-ghg-farm-livestock

contextual-layers: convert-hdi-contextual convert-blue-water-contextual

###################################
#  Mapspam - commodity production #
###################################

download-mapspam-crop-production:
	mkdir -p $(WORKDIR_MAPSPAM_PROD)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/mapspam/spam2010v2r0_global_prod $(WORKDIR_MAPSPAM_PROD)
	cd $(WORKDIR_MAPSPAM_PROD) && sha256sum --check ../../$(CHECKSUMS_PATH)/mapspam_prod

convert-mapspam-crop-production: download-mapspam-crop-production
	python raster_folder_to_h3_table.py $(WORKDIR_MAPSPAM_PROD) h3_grid_spam2010v2r0_global_prod production spam 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

download-mapspam-crop-harvest:
	mkdir -p $(WORKDIR_MAPSPAM_HA)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/mapspam/spam2010v2r0_global_ha $(WORKDIR_MAPSPAM_HA)
	cd $(WORKDIR_MAPSPAM_HA) && sha256sum --check ../../$(CHECKSUMS_PATH)/mapspam_ha

convert-mapspam-crop-harvest: download-mapspam-crop-harvest
	python raster_folder_to_h3_table.py $(WORKDIR_MAPSPAM_HA) h3_grid_spam2010v2r0_global_ha harvest_area spam 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

# ---------------------------------------------
# EARTHSTAT - production and harvest
# ---------------------------------------------

download-earthstat:
	mkdir -p $(WORKDIR_EARTHSTAT)/production $(WORKDIR_EARTHSTAT)/harvest
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/earthstat/ $(WORKDIR_EARTHSTAT)
	cd $(WORKDIR_EARTHSTAT) && sha256sum --check ../../$(CHECKSUMS_PATH)/earthstat


convert-earthstat: download-earthstat
	python raster_folder_to_h3_table.py $(WORKDIR_EARTHSTAT)/production h3_grid_earthstat_global_prod production earthstat 2000 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_EARTHSTAT)/harvest h3_grid_earthstat_global_ha harvest_area earthstat 2000 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)



###############################################################
#  Gridded Livestock of the World (GLW3) - pasture production #
###############################################################

# DOWNLOAD PASTURE AND CROPLAND DATASET
 #https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip
download-pasture:
	mkdir -p $(WORKDIR_GLW3)/cattle/harvestArea $(WORKDIR_GLW3)/chickens/harvestArea $(WORKDIR_GLW3)/horses/harvestArea $(WORKDIR_GLW3)/goats/harvestArea $(WORKDIR_GLW3)/sheep/harvestArea $(WORKDIR_GLW3)/pasture/harvestArea $(WORKDIR_GLW3)/pigs/harvestArea
	wget -q -O $(WORKDIR_GLW3)/pasture/harvestArea/CroplandPastureArea2000_Geotiff.zip https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip

#unzip
#remove no data values
extract-pasture: download-pasture
	unzip -q -j -o -u $(WORKDIR_GLW3)/pasture/harvestArea/CroplandPastureArea2000_Geotiff.zip */Pasture2000_5m.tif -d $(WORKDIR_GLW3)/pasture/harvestArea

	gdal_calc.py --quiet --calc "(A>0)*(A*10*10*100)" --format GTiff --type Float32 --NoDataValue=0 \
		-A $(WORKDIR_GLW3)/pasture/harvestArea/Pasture2000_5m.tif --A_band 1 \
	 	--outfile $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif;

	rm -f $(WORKDIR_GLW3)/pasture/harvestArea/es_pasture_global.tif

# data sourced from: https://www.livestockdata.org/contributor/gridded-livestock-world-glw3
# download livestock data
# download the area-weighted (AW) data as are free of any influence of spatial predictor variables. MOre information here: https://dataverse.harvard.edu/file.xhtml?persistentId=doi:10.7910/DVN/GIVQ75/3QWTTI&version=3.0
# download area pixel to obtain total number of animals per pixel
download-glw3-data: extract-pasture
	mkdir -p $(WORKDIR_GLW3)/cattle/harvestArea $(WORKDIR_GLW3)/chickens/harvestArea $(WORKDIR_GLW3)/horses/harvestArea $(WORKDIR_GLW3)/goats/harvestArea $(WORKDIR_GLW3)/sheep/harvestArea $(WORKDIR_GLW3)/pasture/harvestArea $(WORKDIR_GLW3)/pigs/harvestArea \
	$(WORKDIR_GLW3)/cattle/production $(WORKDIR_GLW3)/chickens/production $(WORKDIR_GLW3)/horses/production $(WORKDIR_GLW3)/goats/production $(WORKDIR_GLW3)/sheep/production $(WORKDIR_GLW3)/pasture/production $(WORKDIR_GLW3)/pigs/production
	wget -q -O $(WORKDIR_GLW3)/cattle/6_Ct_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/GIVQ75/I5CUJS
	wget -q -O $(WORKDIR_GLW3)/chickens/6_Ch_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/SUFASB/AP1LHN
	wget -q -O $(WORKDIR_GLW3)/horses/6_Ho_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/7Q52MV/UAWH3Z
	wget -q -O $(WORKDIR_GLW3)/goats/6_Gt_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/OCPH42/ZMVOOW
	wget -q -O $(WORKDIR_GLW3)/sheep/6_Sh_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/BLWPZN/XDIRM4
	wget -q -O $(WORKDIR_GLW3)/pigs/6_Pg_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/33N0JG/9LGGBS
	wget -q -O $(WORKDIR_GLW3)/8_AreaKm.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/33N0JG/OMPXVT

# rasterize livetock per aggricultural land from FAO to get harvest area
# multiply glw3 cattle (number of animals per km2) by the raster area to get the total number of animals per pixel (LSU)
rasterize-glw3-livestock: download-glw3-data
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/cattle/6_Ct_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/cattle/production/GLW3_2010_cattle_LSU.tif
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/chickens/6_Ch_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/chickens/production/GLW3_2010_chickens_LSU.tif
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/horses/6_Ho_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/horses/production/GLW3_2010_horses_LSU.tif
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/goats/6_Gt_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/goats/production/GLW3_2010_goats_LSU.tif
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/sheep/6_Sh_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/sheep/production/GLW3_2010_sheep_LSU.tif
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/pigs/6_Pg_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/pigs/production/GLW3_2010_pigs_LSU.tif
	gdal_calc.py --quiet --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/cattle/6_Ct_2010_Aw.tif --outfile $(WORKDIR_GLW3)/cattle/harvestArea/GLW3_2010_cattle_ha.tif
	gdal_calc.py --quiet --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/chickens/6_Ch_2010_Aw.tif --outfile $(WORKDIR_GLW3)/chickens/harvestArea/GLW3_2010_chickens_ha.tif
	gdal_calc.py --quiet --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/horses/6_Ho_2010_Aw.tif --outfile $(WORKDIR_GLW3)/horses/harvestArea/GLW3_2010_horses_ha.tif
	gdal_calc.py --quiet --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/goats/6_Gt_2010_Aw.tif --outfile $(WORKDIR_GLW3)/goats/harvestArea/GLW3_2010_goats_ha.tif
	gdal_calc.py --quiet --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/sheep/6_Sh_2010_Aw.tif --outfile $(WORKDIR_GLW3)/sheep/harvestArea/GLW3_2010_sheep_ha.tif
	gdal_calc.py --quiet --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/pigs/6_Pg_2010_Aw.tif --outfile $(WORKDIR_GLW3)/pigs/harvestArea/GLW3_2010_pigs_ha.tif
	rm -f $(WORKDIR_GLW3)/cattle/6_Ct_2010_Aw.tif $(WORKDIR_GLW3)/chickens/6_Ch_2010_Aw.tif $(WORKDIR_GLW3)/horses/6_Ho_2010_Aw.tif $(WORKDIR_GLW3)/goats/6_Gt_2010_Aw.tif \
	$(WORKDIR_GLW3)/sheep/6_Sh_2010_Aw.tif $(WORKDIR_GLW3)/8_AreaKm.tif;

rasterize-glw3-livestock-pasture: rasterize-glw3-livestock
	gdal_calc.py --quiet --calc "A+B+C+D+E+F" --format GTiff --type Float32 --NoDataValue 0.0 \
	-A $(WORKDIR_GLW3)/cattle/production/GLW3_2010_cattle_LSU.tif --A_band 1 \
	-B $(WORKDIR_GLW3)/chickens/production/GLW3_2010_chickens_LSU.tif \
	-C $(WORKDIR_GLW3)/horses/production/GLW3_2010_horses_LSU.tif \
	-D $(WORKDIR_GLW3)/goats/production/GLW3_2010_goats_LSU.tif \
	-E $(WORKDIR_GLW3)/sheep/production/GLW3_2010_sheep_LSU.tif \
	-F $(WORKDIR_GLW3)/pigs/production/GLW3_2010_pigs_LSU.tif \
	--outfile $(WORKDIR_GLW3)/pasture/production/GLW3_2010_pasture_LSU.tif;

#Ingest livetock data- harvest area and production
convert-glw3-livestock: rasterize-glw3-livestock-pasture
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/cattle/production h3_grid_cattle_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/chickens/production h3_grid_chickens_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/horses/production h3_grid_horses_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/goats/production h3_grid_goats_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/sheep/production h3_grid_sheep_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/pigs/production h3_grid_pigs_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/pasture/production h3_grid_pasture_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/cattle/harvestArea h3_grid_cattle_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/chickens/harvestArea h3_grid_chickens_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/horses/harvestArea h3_grid_horses_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/goats/harvestArea h3_grid_goats_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/sheep/harvestArea h3_grid_sheep_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/pigs/harvestArea h3_grid_pigs_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_GLW3)/pasture/harvestArea h3_grid_pasture_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

###########################
#  Livestock preprocessed #
############################

download-livestock-processed:
	mkdir -p $(WORKDIR_LIVESTOCK_PROCESSED)/production
	mkdir -p $(WORKDIR_LIVESTOCK_PROCESSED)/harvest
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/livestock_processed/production $(WORKDIR_LIVESTOCK_PROCESSED)/production
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/livestock_processed/harvest $(WORKDIR_LIVESTOCK_PROCESSED)/harvest
	cd $(WORKDIR_LIVESTOCK_PROCESSED)/production && sha256sum --check ../../../$(CHECKSUMS_PATH)/livestock_processed_prod
	cd $(WORKDIR_LIVESTOCK_PROCESSED)/harvest && sha256sum --check ../../../$(CHECKSUMS_PATH)/livestock_processed_ha

convert-livestock-processed: download-livestock-processed
	python raster_folder_to_h3_table.py $(WORKDIR_LIVESTOCK_PROCESSED)/production h3_grid_livestock_processed_global_prod production spam 2021 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_LIVESTOCK_PROCESSED)/harvest h3_grid_livestock_processed_global_ha harvest_area spam 2021 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

#####################################
# Deforestation footprint (DF_SLUC) #
#####################################

download-deforestation:
	# download and check
	mkdir -p $(WORKDIR_DEFORESTATION)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/deforestation $(WORKDIR_DEFORESTATION)
	cd $(WORKDIR_DEFORESTATION) && sha256sum --check ../../$(CHECKSUMS_PATH)/deforestation

convert-deforestation: download-deforestation
	@echo "Converting deforestation data... "
	python raster_folder_to_h3_table.py $(WORKDIR_DEFORESTATION) h3_grid_deforestation_global indicator DF_SLUC 2021 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

######################################
#  GHG Deforestation (GHG_DEF_SLUC)  #
######################################

download-forestGHG:
	mkdir -p $(WORKDIR_GHG)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/forestGHG $(WORKDIR_GHG)
	cd $(WORKDIR_GHG) && sha256sum --check ../../$(CHECKSUMS_PATH)/forestGHG

convert-forestGHG: download-forestGHG
	@echo "Converting forest GHG data..."
	python raster_folder_to_h3_table.py $(WORKDIR_GHG) h3_grid_ghg_def_global indicator GHG_DEF_SLUC 2021 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

################################
# Net cropland expansion (NCE) #
###############################

download-naturalCropConversion:
	mkdir -p $(WORKDIR_NATURAL_CROP_CONVERSION)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/natural_crop_conversion $(WORKDIR_NATURAL_CROP_CONVERSION)
	cd $(WORKDIR_NATURAL_CROP_CONVERSION) && sha256sum --check ../../$(CHECKSUMS_PATH)/natural_crop_conversion


convert-naturalCropConversion: download-naturalCropConversion
	@echo "Converting natural crop conversion data... "
	python raster_folder_to_h3_table.py $(WORKDIR_NATURAL_CROP_CONVERSION) h3_grid_natural_crop_conversion_global indicator NCE 2022 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

############################################
#  Forest landscape integrity loss (FLIL)  #
############################################

download-biodiversity:
	# download and check
	mkdir -p $(WORKDIR_BIODIVERSITY)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/biodiversity $(WORKDIR_BIODIVERSITY)
	cd $(WORKDIR_BIODIVERSITY) && sha256sum --check ../../$(CHECKSUMS_PATH)/biodiversity

convert-biodiversity: download-biodiversity
	@echo "Converting biodiversity data... "
	python raster_folder_to_h3_table.py $(WORKDIR_BIODIVERSITY) h3_grid_biodiversity_global indicator FLIL 2022 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


###################################
# Unsustainable water use (UWU)   #
###################################

# Donwload preprocessed excess of water withdrawals
download-aqueduct:
	mkdir -p $(WORKDIR_AQUEDUCT)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/unsustainable_water_use/ $(WORKDIR_AQUEDUCT)

extract-aqueduct: download-aqueduct
	unzip -q -u $(WORKDIR_AQUEDUCT)/excess_withdrawals.zip  -d $(WORKDIR_AQUEDUCT)/
	cd $(WORKDIR_AQUEDUCT) && sha256sum --check ../../../$(CHECKSUMS_PATH)/excess_withdrawals

convert-aqueduct: extract-aqueduct
	@echo "Converting excess withdrawals data... "
	python vector_folder_to_h3_table.py $(WORKDIR_AQUEDUCT) h3_grid_excess_withdrawals_global perc_reduc excess_withdrawals "Environmental datasets" 2023 --indicator=UWU --h3-res=6
	@echo "Including contextual layer... "
	python vector_folder_to_h3_table.py $(WORKDIR_AQUEDUCT) h3_grid_aqueduct_global bws_cat aqueduct "Environmental datasets" 2023


###############################
# Excess nutrient load  (ENL) #
###############################

download-nutrient-load-reduction:
	mkdir -p $(WORKDIR_NUTRIENT_LOAD_REDUCTION)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/nutrients_load_reduction/ $(WORKDIR_NUTRIENT_LOAD_REDUCTION)

extract-nutrient-load-reduction:download-nutrient-load-reduction
	unzip -q -u $(WORKDIR_NUTRIENT_LOAD_REDUCTION)/nutrient_load_reduction.zip  -d $(WORKDIR_NUTRIENT_LOAD_REDUCTION)/
	cd $(WORKDIR_NUTRIENT_LOAD_REDUCTION) && sha256sum --check ../../$(CHECKSUMS_PATH)/nutrient_load_reduction

convert-nutrientLoadReduction: extract-nutrient-load-reduction
	@echo "Converting nutrient load reduction data... "
	python vector_folder_to_h3_table.py $(WORKDIR_NUTRIENT_LOAD_REDUCTION) h3_grid_nutrient_load_global perc_reduc nutrient_load_reduction "Environmental datasets" 2023 --indicator=ENL --h3-res=6
	@echo "Including contextual layer... "
	python vector_folder_to_h3_table.py $(WORKDIR_NUTRIENT_LOAD_REDUCTION) h3_grid_limiting_nutrients_global Cases_v2_1 limiting_nutrient "Environmental datasets" 2023

#################################################
# GHG FARM (GHG_FARM) - agriculture commodities #
#################################################

download-ghg-farm:
	mkdir -p $(WORKDIR_GHG_FARM)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/ghg_emissions $(WORKDIR_GHG_FARM)
	cd $(WORKDIR_GHG_FARM) && sha256sum --check ../../$(CHECKSUMS_PATH)/ghg_from_farm_emissions

convert-ghg-farm: download-ghg-farm
	python raster_folder_to_h3_table.py $(WORKDIR_GHG_FARM) h3_grid_ghg_farm_global material_indicator GHG_FARM 2017 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

###############################################
# GHG FARM (GHG_FARM) - livestock commodities #
###############################################

download-ghg-farm-livestock:
	mkdir -p $(WORKDIR_GHG_FARM)/livestock
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/ghg_emissions_livestock/ $(WORKDIR_GHG_FARM)/livestock
	cd $(WORKDIR_GHG_FARM)/livestock && sha256sum --check ../../../$(CHECKSUMS_PATH)/ghg_from_farm_emissions_livesock

convert-ghg-farm-livestock: download-ghg-farm-livestock
	python raster_folder_to_h3_table.py $(WORKDIR_GHG_FARM)/livestock h3_grid_ghg_farm_livestock_global material_indicator GHG_FARM 2017 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


###################
# Contextual data #
###################

download-hdi-contextual:
	mkdir -p $(WORKDIR_HDI)
	wget --show-progress -q -O $(WORKDIR_HDI)/IHDI_HDR2020_040722.csv https://hdr.undp.org/sites/default/files/data/2020/IHDI_HDR2020_040722.csv

convert-hdi-contextual: download-hdi-contextual
	python csv_to_h3_table.py $(WORKDIR_HDI)/IHDI_HDR2020_040722.csv h3_grid_hdi_global hdi_2019 2019 iso3

convert-blue-water-contextual:
	python cog_to_contextual_layer_linker.py --cog bluewater.tif --name bluewater_footprint --category "Environmental datasets" --tiler_param colormap_name=viridis --tp rescale=-18,832

#####################
# Default commodity #
#####################

download-default-commodity:
	mkdir -p $(WORKDIR_DEFAULT_COMMODITY)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/default_commodity/ $(WORKDIR_DEFAULT_COMMODITY)
	cd $(WORKDIR_DEFAULT_COMMODITY) && sha256sum --check ../../$(CHECKSUMS_PATH)/default_commodity

# as it's a default commodity with value one for equal distribution, we can add it as production and harvest dataset
convert-default-commodity: download-default-commodity
	python raster_folder_to_h3_table.py $(WORKDIR_DEFAULT_COMMODITY) h3_grid_default_commodity_global_p production spam  2021 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python raster_folder_to_h3_table.py $(WORKDIR_DEFAULT_COMMODITY) h3_grid_default_commodity_global_ha harvest_area spam  2021 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


#########
# Utils #
#########

clean:
	rm -rf data/*

delete-h3-tables:
	python delete_h3_tables.py
