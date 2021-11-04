#########################
# About this var
# This is a rough controller of how many parallel system threads you'll have
# It does not necessarily represent a max thread count, but it's probably similar to that
# Lower if you are having issues. Increase at your own risk
#########################
PARALLELIZATION_FACTOR=10

WORKDIR_GADM=data/gadm
WORKDIR_MAPSPAM=data/mapspam
WORKDIR_EARTHSTAT=data/earthstat
WORKDIR_WATER_FOOTPRINT=data/waterFootprint
WORKDIR_BIODIVERSITY=data/biodiversity
WORKDIR_CARBON=data/gfw_carbon
WORKDIR_DEFORESTATION=data/hansen_loss

all:
	make clean
	make -j 2 crop indicators

crop:
	make -j 2 convert-mapspam-crop-production convert-earthstat-crop-production convert-earthstat-crop-harvest convert-mapspam-crop-harvest convert-cropland convert-pasture

indicators:
	make -j 2 convert-water-footprint convert-biodiversity convert-carbon
	# Processing deforestation data is quite intensive, so we do it separately, so we can allocate all threads to it
	# There is probably a better way to do this, that future me will learn about - in the future.
	make convert-deforestation

#######################################
# MapSPAM crop production and harvest area
#
# DOWNLOAD DATASETS
# <zipfile>:
# Download MapSPAM crop production
download-mapspam-crop-production:
	mkdir -p $(WORKDIR_MAPSPAM)
	wget -q -O $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod.geotiff.zip https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_prod.geotiff.zip

#Download MapSPAM crop harvest area
download-mapspam-crop-harvest:
	mkdir -p $(WORKDIR_MAPSPAM)
	wget -q -O $(WORKDIR_MAPSPAM)/spam2010v2r0_global_phys_area.geotiff.zip https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_phys_area.geotiff.zip

#EXTRACT DATASETS:
# <tiff_folder>: <zipfile>
# Unzip to folder
# Only extract the files ending in *_A.tif (all agricultural technology types together)
extract-mapspam-crop-production: download-mapspam-crop-production
	mkdir -p $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod
	unzip -u $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod.geotiff.zip *_A.tif -d $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod

extract-mapspam-crop-harvest: download-mapspam-crop-harvest
	mkdir -p $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha
	unzip -u $(WORKDIR_MAPSPAM)/spam2010v2r0_global_phys_area.geotiff.zip *_A.tif -d $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha
	for tiffile in $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="$(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010_global_$${table_name}.tif";\
		gdal_calc.py --calc "A/10000" --format GTiff --type Float32 -A "$${tiffile}" --A_band 1 --outfile "$${output_file}"; \
		rm -f "$${tiffile}";\
	done

#CONVERT DATASETS:
# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_spam2017v2r0_global_prod"
convert-mapspam-crop-production: extract-mapspam-crop-production
	python tiff_folder_to_h3_table.py $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod h3_grid_spam2010v2r0_global_prod production spam 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

convert-mapspam-crop-harvest: extract-mapspam-crop-harvest
	python tiff_folder_to_h3_table.py $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha h3_grid_spam2010v2r0_global_ha harvest_area spam 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


#######################################
# Earthstat crop production and harvest area

# Download earthstat crop production
download-earthstat-crop-production:
	mkdir -p $(WORKDIR_EARTHSTAT)
	wget -q -O $(WORKDIR_EARTHSTAT)/HarvestedAreaYield175Crops_Geotiff.zip https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Geotiff.zip

# Unzip to folder
# Only extract the files that contain production. Set the no data to 0 as the mapspam datasets.
extract-earthstat-crop-production: download-earthstat-crop-production
	mkdir -p $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod
	unzip -j -o -u $(WORKDIR_EARTHSTAT)/HarvestedAreaYield175Crops_Geotiff.zip *_Production.tif -d $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod
	for tiffile in $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="$(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/earthstat2000_global_$${table_name}.tif";\
		gdal_translate -a_nodata 0 -of GTiff "$${tiffile}" "$${output_file}";\
		rm -f "$${tiffile}";\
	done

# Unzip to folder
# Only extract the files that contain harvest area fraction. Set the no data to 0 as the mapspam datasets.
extract-earthstat-crop-harvest: download-earthstat-crop-production
	mkdir -p $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha
	unzip -j -o -u $(WORKDIR_EARTHSTAT)/HarvestedAreaYield175Crops_Geotiff.zip *_HarvestedAreaFraction.tif -d $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha
	for tiffile in $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="$(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/earthstat2000_global_$${table_name}.tif";\
		gdal_translate -a_nodata 0 -of GTiff "$${tiffile}" "$${output_file}";\
		rm -f "$${tiffile}";\
	done

# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_earthstat2000_global_prod"
convert-earthstat-crop-production: extract-earthstat-crop-production
	python tiff_folder_to_h3_table.py $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod h3_grid_earthstat2000_global_prod production es 2000 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

# and import to a table called "h3_grid_earthstat2000_global_ha"
convert-earthstat-crop-harvest: extract-earthstat-crop-harvest
	python tiff_folder_to_h3_table.py $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha h3_grid_earthstat2000_global_ha harvest_area es 2000 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

#########################################
# CONTEXTUAL DATASETS FOR INDICATORS
# WATER FOOTPRINT
# Download generic blue water footprint dataset: https://data.4tu.nl/articles/dataset/The_green_blue_grey_and_total_water_footprint_related_to_production/12675440
download-water-footprint:
	mkdir -p $(WORKDIR_WATER_FOOTPRINT)
	wget -q -O $(WORKDIR_WATER_FOOTPRINT)/Report50-WF-of-production-RasterFiles.zip https://data.4tu.nl/ndownloader/files/23992634

# # Download crop specific water footprint
# $(WORKDIR_WATER_FOOTPRINT)/Report47-App-IV-CropWaterFootprints-RasterMaps.zip:
# 	mkdir -p $(WORKDIR_WATER_FOOTPRINT)
# 	wget -q -O $@ https://waterfootprint.org/media/downloads/Report47-App-IV-CropWaterFootprints-RasterMaps.zip

#extract generic wf data
extract-water-footprint: download-water-footprint
	mkdir -p $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint
	unzip -jn -o -u $(WORKDIR_WATER_FOOTPRINT)/Report50-WF-of-production-RasterFiles.zip -d $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint
	unzip -j -o -u $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/Report50-WF-of-production-RasterFiles.zip */wf_bltot_mmyr/* -d $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint
	gdal_translate -of GTiff $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/hdr.adf $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr.tif

# Convert the wf tiffs in the folder to h3indexes at resolution 6
convert-water-footprint: extract-water-footprint
	python tiff_folder_to_h3_table.py $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint h3_grid_wf_global indicator UWU_T 2005 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

# BIODIVERSITY
#Download biodiversity datasets
download-biodiversity:
	mkdir -p $(WORKDIR_BIODIVERSITY)
	wget -q -O $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow.zip https://files.worldwildlife.org/wwfcmsprod/files/Publication/file/6kcchn7e3u_official_teow.zip?_ga=2.147270832.688271325.1631720232-1851544340.1631720232

#extract wwf ecoregions and merge with lcia biodiversity indicators
extract-biodiversity: download-biodiversity
	mkdir -p $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow
	unzip -jn -o -u $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow.zip -d $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow

# join attributes of csv and ecoregions to get the biodiversity risk values
preprocess-biodiversity: extract-biodiversity
	mapshaper $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/wwf_terr_ecos.shp -simplify 10% planar keep-shapes \
	-clean \
	-join ./LCIA_UNEP_SETAC/Ch6_PSL_regional_ecoregions_v01.csv keys=eco_code,eco_code \
	-o $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/wwf_terr_ecos_m.shp force

# rasterize biodiversity dataset
rasterize-biodiversity: preprocess-biodiversity
	mkdir -p $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/lcia_psl_regional
	make rasterize-biodiversity-file ATTRIBUTE_NAME=Annual_cro TIF=lcia_psl_r_annual_crops.tif & \
	make rasterize-biodiversity-file ATTRIBUTE_NAME=Permanent_ TIF=lcia_psl_r_permanent_crops.tif & \
	make rasterize-biodiversity-file ATTRIBUTE_NAME=Pasture TIF=lcia_psl_r_pasture.tif & \
	make rasterize-biodiversity-file ATTRIBUTE_NAME=Urban TIF=lcia_psl_r_urban.tif & \
	make rasterize-biodiversity-file ATTRIBUTE_NAME=Extensive_ TIF=lcia_psl_r_extensive_forestry.tif & \
	make rasterize-biodiversity-file ATTRIBUTE_NAME=Intensive_ TIF=lcia_psl_r_intensive_forestry.tif & \
	wait

rasterize-biodiversity-file:
	gdal_rasterize -l wwf_terr_ecos_m -a $(ATTRIBUTE_NAME) -tr 0.0833333333333286 0.0833333333333286 -a_nodata 0.0 \
    	-te -180.0 -90.0 180.0 90.0 -ot Float32 \
    	-of GTiff $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/wwf_terr_ecos_m.shp $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/lcia_psl_regional/$(TIF)

# convert the biodiversity rasters to h3 tables
convert-biodiversity: rasterize-biodiversity
	python tiff_folder_to_h3_table.py $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/lcia_psl_regional h3_grid_bio_global indicator BL_LUC_T 2015 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


# DEFORESTATION
#text: https://storage.googleapis.com/earthenginepartners-hansen/GFC-2020-v1.8/lossyear.txt
download-deforestation-list:
	@echo "Downloading deforestation file list... "
	mkdir -p $(WORKDIR_DEFORESTATION)
	wget -q -O $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear.txt "https://storage.googleapis.com/earthenginepartners-hansen/GFC-2020-v1.8/lossyear.txt"

download-deforestation: download-deforestation-list
	@echo "Iterating deforestation files... "
	mkdir -p $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear
	cat $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear.txt | xargs -P $(PARALLELIZATION_FACTOR) -I {} /bin/bash -c 'make transform-deforestation-file FILE={}'

transform-deforestation-file:
	@echo "Transforming deforestation file $(FILE) ... "
	table_name=`basename -s .tif $(FILE) | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
	wget -q -O "$(WORKDIR_DEFORESTATION)/$${table_name}.tif" $(FILE) ; \
	rm -f "$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif"; \
	gdalwarp -s_srs EPSG:4326 -t_srs EPSG:4326 -r max -tr 0.0833333333333286 0.0833333333333286 -multi -of GTiff -wo NUM_THREADS=ALL_CPUS \
	"$(WORKDIR_DEFORESTATION)/$${table_name}.tif" "$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif"; \
	rm -f "$(WORKDIR_DEFORESTATION)/$${table_name}.tif"

preprocess-deforestation: download-deforestation
	@echo "Preprocessing deforestation data... "
	mkdir -p $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles
	gdalbuildvrt $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.vrt $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/*.tif
	gdal_translate -of GTiff -co NUM_THREADS=ALL_CPUS -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co ZLEVEL=9 -co BLOCKXSIZE=512 -co BLOCKYSIZE=512 \
	$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.vrt $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif
	gdal_calc.py --calc "(A>18)" --format GTiff --type Byte -A $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif --A_band 1 --outfile $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2019.tif
	rm -f $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif

convert-deforestation: preprocess-deforestation
	@echo "Converting deforestation data... "
	python tiff_folder_to_h3_table.py data/hansen_loss/Hansen_GFC_2020_lossyear/merged_tiles h3_grid_deforestation_global \
	indicator DF_LUC_T 2019 --h3-res=6 --thread-count=$$(( $(PARALLELIZATION_FACTOR) ))

# CARBON EMISSIONS
# Download net carbon flux:
# @todo update with net flux from gfw - issues accessing the raw data in terms of permissions
#https://services2.arcgis.com/g8WusZB13b9OegfU/arcgis/rest/services/Forest_greenhouse_gas_net_flux/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson
#"https://opendata.arcgis.com/api/v3/datasets/d33587b6aee248faa2f388aaac96f92c_0/downloads?spatialRefId=4326&formats=csv"
download-carbon:
	mkdir -p $(WORKDIR_CARBON)
	wget -O $(WORKDIR_CARBON)/GHGEmissions_Geotiff.zip https://s3.us-east-2.amazonaws.com/earthstatdata/GHGEmissions_Geotiff.zip

#unzip to folder
preprocess-carbon: download-carbon
	mkdir -p $(WORKDIR_CARBON)/GHGEmissions
	rm -rf $(WORKDIR_CARBON)/GHGEmissions/*
	unzip -j -o -u $(WORKDIR_CARBON)/GHGEmissions_Geotiff.zip */hectare_emissions.tif -d $(WORKDIR_CARBON)/GHGEmissions
	for tiffile in $(WORKDIR_CARBON)/GHGEmissions/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="$(WORKDIR_CARBON)/GHGEmissions/earthstat2000_global_$${table_name}.tif";\
		gdal_translate -a_nodata 0 -of GTiff "$${tiffile}" "$${output_file}";\
		rm -f "$${tiffile}";\
	done

# translate to h3 and import
convert-carbon: preprocess-carbon
	python tiff_folder_to_h3_table.py $(WORKDIR_CARBON)/GHGEmissions h3_grid_carbon_global indicator GHG_LUC_T 2000 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

## DOWNLOAD PASTURE AND CROPLAND DATASET
#https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip
download-cropland:
	mkdir -p $(WORKDIR_EARTHSTAT)
	wget -q -O $(WORKDIR_EARTHSTAT)/CroplandPastureArea2000_Geotiff.zip https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip

#unzip
extract-cropland: download-cropland
	mkdir -p $(WORKDIR_EARTHSTAT)/CroplandPastureArea2000_global_ha
	unzip -j -o -u $(WORKDIR_EARTHSTAT)/CroplandPastureArea2000_Geotiff.zip */Pasture2000_5m.tif -d $(WORKDIR_EARTHSTAT)/CroplandPastureArea2000_global_ha
	gdal_translate -a_nodata 0 -of GTiff $(WORKDIR_EARTHSTAT)/CroplandPastureArea2000_global_ha/Pasture2000_5m.tif \
	$(WORKDIR_EARTHSTAT)/CroplandPastureArea2000_global_ha/es_pasture_global.tif
	rm -f $(WORKDIR_EARTHSTAT)/CroplandPastureArea2000_global_ha/Pasture2000_5m.tif

# and import to a table called "h3_grid_earthstat2000_global_ha"
convert-cropland: extract-cropland
	python tiff_folder_to_h3_table.py $(WORKDIR_EARTHSTAT)/CroplandPastureArea2000_global_ha h3_grid_pasture_ha harvest_area es 2000 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


#download gadm data
download-gadm:
	mkdir -p $(WORKDIR_GADM)
	wget -q -O $(WORKDIR_GADM)/gadm36_levels_shp.zip https://data.biogeo.ucdavis.edu/data/gadm3.6/gadm36_levels_shp.zip

extract-gadm: download-gadm
	unzip -u $(WORKDIR_GADM)/gadm36_levels_shp.zip gadm36_0* -d $(WORKDIR_GADM)

#PASTURE PRODUCTION - value for 2010
#merge with admin areas country level -join $< keys=NAME_0,Area
preprocess-pasture: extract-gadm
	mapshaper $(WORKDIR_GADM)/gadm36_0.shp -simplify 10% planar keep-shapes \
	-clean \
	-each 'COUNT=this.area/100000000' \
	-join ./FAOSTATS/FAOSTAT_cattle_production.csv keys=NAME_0,Area \
	-o $(WORKDIR_EARTHSTAT)/FAOSTATS/FAOSTAT_data.shp force

rasterize-pasture: preprocess-pasture
	gdal_rasterize -l FAOSTAT_data -a Value -tr 0.083333 0.083333 -a_nodata -1.0 -te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff $(WORKDIR_EARTHSTAT)/FAOSTATS/FAOSTAT_data.shp $(WORKDIR_EARTHSTAT)/FAOSTATS/pasture_contry_production_t.tif
	gdal_rasterize -l FAOSTAT_data -a COUNT -tr 0.083333 0.083333 -a_nodata -1.0 -te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff $(WORKDIR_EARTHSTAT)/FAOSTATS/FAOSTAT_data.shp $(WORKDIR_EARTHSTAT)/FAOSTATS/pasture_contry_count.tif
	gdal_calc.py --calc "A/B" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/FAOSTATS/pasture_contry_production_t.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/FAOSTATS/pasture_contry_count.tif --outfile $(WORKDIR_EARTHSTAT)/FAOSTATS/FAOSTAT_pasture_production.tif
	rm -f $(WORKDIR_EARTHSTAT)/FAOSTATS/pasture_contry_production_t.tif
	rm -f $(WORKDIR_EARTHSTAT)/FAOSTATS/pasture_contry_count.tif

convert-pasture: rasterize-pasture
	python tiff_folder_to_h3_table.py $(WORKDIR_EARTHSTAT)/FAOSTATS h3_grid_pasture_production production es 2000 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

clean:
	rm -rf data/*
