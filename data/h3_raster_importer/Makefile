MAKEFLAGS += -j8

all: h3_grid_carbon_global h3_grid_deforestation_global h3_grid_pasture #h3_grid_spam2010v2r0_global_prod h3_grid_earthstat2000_global_prod h3_grid_earthstat2000_global_ha h3_grid_spam2010v2r0_global_ha h3_grid_wf_global h3_grid_bio_global

crop: h3_grid_spam2010v2r0_global_prod h3_grid_earthstat2000_global_prod h3_grid_earthstat2000_global_ha h3_grid_spam2010v2r0_global_ha

indicators: h3_grid_wf_global h3_grid_bio_global h3_grid_carbon_global h3_grid_deforestation_global

#######################################
# MapSPAM crop production and harvest area
#
# DOWNLOAD DATASETS
# <zipfile>:
# Download MapSPAM crop production
data/mapspam/spam2010v2r0_global_prod.geotiff.zip:
	mkdir -p data/mapspam
	wget -q -O $@ https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_prod.geotiff.zip

#Download MapSPAM crop harvest area
data/mapspam/spam2010v2r0_global_harv_area.geotiff.zip:
	mkdir -p data/mapspam
	wget -q -O $@ https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_harv_area.geotiff.zip

#EXTRACT DATASETS:
# <tiff_folder>: <zipfile>
# Unzip to folder
# Only extract the files ending in *_A.tif (all agricultural technology types together)
data/mapspam/spam2010v2r0_global_prod: data/mapspam/spam2010v2r0_global_prod.geotiff.zip
	mkdir -p $@
	unzip -u $< *_A.tif -d $@

data/mapspam/spam2010v2r0_global_ha: data/mapspam/spam2010v2r0_global_harv_area.geotiff.zip
	mkdir -p $@
	unzip -u $< *_A.tif -d $@

#CONVERT DATASETS:
# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_spam2017v2r0_global_prod"
h3_grid_spam2010v2r0_global_prod: data/mapspam/spam2010v2r0_global_prod
	python tiff_folder_to_h3_table.py $< $@ production spam --h3-res=6

h3_grid_spam2010v2r0_global_ha: data/mapspam/spam2010v2r0_global_ha
	python tiff_folder_to_h3_table.py $< $@ harvest_area spam --h3-res=6


#######################################
# Earthstat crop production and harvest area

# Download earthstat crop production
data/earthstat/HarvestedAreaYield175Crops_Geotiff.zip:
	mkdir -p data/earthstat
	wget -q -O $@ https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Geotiff.zip

# Unzip to folder
# Only extract the files that contain production. Set the no data to 0 as the mapspam datasets.
data/earthstat/earthstat2000_global_prod: data/earthstat/HarvestedAreaYield175Crops_Geotiff.zip
	mkdir -p $@
	unzip -j -o -u $< *_Production.tif -d data/earthstat/earthstat2000_global_prod
	for tiffile in data/earthstat/earthstat2000_global_prod/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="data/earthstat/earthstat2000_global_prod/earthstat2000_global_$${table_name}.tif";\
		gdal_translate -a_nodata 0 -of GTiff "$${tiffile}" "$${output_file}";\
		rm -f "$${tiffile}";\
	done

# Unzip to folder
# Only extract the files that contain harvest area fraction. Set the no data to 0 as the mapspam datasets.
data/earthstat/earthstat2000_global_ha: data/earthstat/HarvestedAreaYield175Crops_Geotiff.zip
	mkdir -p $@
	unzip -j -o -u $< *_HarvestedAreaHectares.tif -d data/earthstat/earthstat2000_global_ha
	for tiffile in data/earthstat/earthstat2000_global_ha/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="data/earthstat/earthstat2000_global_ha/earthstat2000_global_$${table_name}.tif";\
		gdal_translate -a_nodata 0 -of GTiff "$${tiffile}" "$${output_file}";\
		rm -f "$${tiffile}";\
	done

# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_earthstat2000_global_prod"
h3_grid_earthstat2000_global_prod: data/earthstat/earthstat2000_global_prod
	python tiff_folder_to_h3_table.py $< $@ production es --h3-res=6

# and import to a table called "h3_grid_earthstat2000_global_ha"
h3_grid_earthstat2000_global_ha: data/earthstat/earthstat2000_global_ha
	python tiff_folder_to_h3_table.py $< $@ harvest_area es --h3-res=6

#########################################
# CONTEXTUAL DATASETS FOR INDICATORS
# WATER FOOTPRINT
# Download generic blue water footprint dataset: https://data.4tu.nl/articles/dataset/The_green_blue_grey_and_total_water_footprint_related_to_production/12675440
data/waterFootprint/Report50-WF-of-production-RasterFiles.zip:
	mkdir -p data/waterFootprint
	wget -q -O $@ https://data.4tu.nl/ndownloader/files/23992634

# # Download crop specific water footprint
# data/waterFootprint/Report47-App-IV-CropWaterFootprints-RasterMaps.zip:
# 	mkdir -p data/waterFootprint
# 	wget -q -O $@ https://waterfootprint.org/media/downloads/Report47-App-IV-CropWaterFootprints-RasterMaps.zip

#extract generic wf data
data/waterFootprint/generic_waterfootprint: data/waterFootprint/Report50-WF-of-production-RasterFiles.zip
	mkdir -p $@
	unzip -jn -o -u $< -d $@
	unzip -j -o -u data/waterFootprint/generic_waterfootprint/Report50-WF-of-production-RasterFiles.zip */wf_bltot_mmyr/* -d $@
	gdal_translate -of GTiff data/waterFootprint/generic_waterfootprint/hdr.adf data/waterFootprint/generic_waterfootprint/wf_bltot_mmyr.tif

# Convert the wf tiffs in the folder to h3indexes at resolution 6
h3_grid_wf_global: data/waterFootprint/generic_waterfootprint
	python tiff_folder_to_h3_table.py data/waterFootprint/generic_waterfootprint h3_grid_wf_global indicator UWU_T --h3-res=6

# BIODIVERSITY
#Download biodiversity datasets
data/biodiversity/6kcchn7e3u_official_teow.zip:
	mkdir -p data/biodiversity
	wget -q -O $@ https://files.worldwildlife.org/wwfcmsprod/files/Publication/file/6kcchn7e3u_official_teow.zip?_ga=2.147270832.688271325.1631720232-1851544340.1631720232

#extract wwf ecoregions and merge with lcia biodiversity indicators
data/biodiversity/6kcchn7e3u_official_teow: data/biodiversity/6kcchn7e3u_official_teow.zip
	mkdir -p $@
	unzip -jn -o -u $< -d $@

# join attributes of csv and ecoregions to get the biodiversity risk values
data/biodiversity/6kcchn7e3u_official_teow/wwf_terr_ecos_m.shp: data/biodiversity/6kcchn7e3u_official_teow
	mapshaper data/biodiversity/6kcchn7e3u_official_teow/wwf_terr_ecos.shp -simplify 10% planar keep-shapes \
	-clean \
	-join ./LCIA_UNEP_SETAC/Ch6_PSL_regional_ecoregions_v01.csv keys=eco_code,eco_code \
	-o $@ force

# rasterize biodiversity dataset
 data/biodiversity/6kcchn7e3u_official_teow/lcia_psl_regional: data/biodiversity/6kcchn7e3u_official_teow/wwf_terr_ecos_m.shp
	mkdir -p $@
	gdal_rasterize -l wwf_terr_ecos_m -a Annual_cro -tr 0.0833333333333286 0.0833333333333286 -a_nodata 0.0 \
	-te -180.0 -90.0 180.0 90.0 -ot Float32 \
	-of GTiff $< data/biodiversity/6kcchn7e3u_official_teow/lcia_psl_regional/lcia_psl_r_annual_crops.tif; \
	gdal_rasterize -l wwf_terr_ecos_m -a Permanent_ -tr 0.0833333333333286 0.0833333333333286 -a_nodata 0.0 \
	-te -180.0 -90.0 180.0 90.0 -ot Float32 \
	-of GTiff $< data/biodiversity/6kcchn7e3u_official_teow/lcia_psl_regional/lcia_psl_r_permanent_crops.tif; \
	gdal_rasterize -l wwf_terr_ecos_m -a Pasture -tr 0.0833333333333286 0.0833333333333286 -a_nodata 0.0 \
	-te -180.0 -90.0 180.0 90.0 -ot Float32 \
	-of GTiff $< data/biodiversity/6kcchn7e3u_official_teow/lcia_psl_regional/lcia_psl_r_pasture.tif; \
	gdal_rasterize -l wwf_terr_ecos_m -a Urban -tr 0.0833333333333286 0.0833333333333286 -a_nodata 0.0 \
	-te -180.0 -90.0 180.0 90.0 -ot Float32 \
	-of GTiff $< data/biodiversity/6kcchn7e3u_official_teow/lcia_psl_regional/lcia_psl_r_urban.tif; \
	gdal_rasterize -l wwf_terr_ecos_m -a Extensive_ -tr 0.0833333333333286 0.0833333333333286 -a_nodata 0.0 \
	-te -180.0 -90.0 180.0 90.0 -ot Float32 \
	-of GTiff $< data/biodiversity/6kcchn7e3u_official_teow/lcia_psl_regional/lcia_psl_r_extensive_forestry.tif; \
	gdal_rasterize -l wwf_terr_ecos_m -a Intensive_ -tr 0.0833333333333286 0.0833333333333286 -a_nodata 0.0 \
	-te -180.0 -90.0 180.0 90.0 -ot Float32 \
	-of GTiff $< data/biodiversity/6kcchn7e3u_official_teow/lcia_psl_regional/lcia_psl_r_intensive_forestry.tif;

# convert the biodiversity rasters to h3 tables
h3_grid_bio_global: data/biodiversity/6kcchn7e3u_official_teow/lcia_psl_regional
	python tiff_folder_to_h3_table.py $< $@ indicator BL_LUC_T --h3-res=6


# DEFORESTATION
#text: https://storage.googleapis.com/earthenginepartners-hansen/GFC-2020-v1.8/lossyear.txt
data/hansen_loss/Hansen_GFC_2020_lossyear.txt:
	mkdir -p data/hansen_loss
	wget -O $@ "https://storage.googleapis.com/earthenginepartners-hansen/GFC-2020-v1.8/lossyear.txt"

data/hansen_loss/Hansen_GFC_2020_lossyear: data/hansen_loss/Hansen_GFC_2020_lossyear.txt
	mkdir -p $@
	for id in $$(cat $<); do \
	table_name=`basename -s .tif "$$id" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
	output_file="data/hansen_loss/$${table_name}.tif";\
	wget -O "$$output_file" "$$id"; \
	done

data/hansen_loss/Hansen_GFC_2020_lossyear/merged_tiles: data/hansen_loss/Hansen_GFC_2020_lossyear
	for tiffile in data/hansen_loss/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="data/hansen_loss/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif";\
		gdalwarp -s_srs EPSG:4326 -t_srs EPSG:4326 -r average -multi -of GTiff "$${tiffile}" "$${output_file}"; \
		rm -f "$${tiffile}";\
	done
	mkdir -p $@
	gdalbuildvrt data/hansen_loss/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.vrt data/hansen_loss/Hansen_GFC_2020_lossyear/*.tif
	for tifffile in data/hansen_loss/Hansen_GFC_2020_lossyear/*.tiff; do rm -f "$${tiffile}"; done
	gdal_translate -of GTiff -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co ZLEVEL=9 \
	data/hansen_loss/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.vrt data/hansen_loss/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif

h3_grid_deforestation_global: data/hansen_loss/Hansen_GFC_2020_lossyear/merged_tiles
	python tiff_folder_to_h3_table.py $< $@ indicator DF_LUC_T --h3-res=6


# CARBON EMISSIONS
# Download net carbon flux:
#https://services2.arcgis.com/g8WusZB13b9OegfU/arcgis/rest/services/Forest_greenhouse_gas_net_flux/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson
data/gfw_carbon/forest_greenhouse_gas_net_flux.csv:
	mkdir -p data/gfw_carbon
	wget -O $@ "https://opendata.arcgis.com/api/v3/datasets/66eafb4f16f9478c828c3225d26b4989_0/downloads/data?format=csv&spatialRefId=4326"

# # download individual data
data/gfw_carbon/forest_greenhouse_gas_net_flux_simp.txt: data/gfw_carbon/forest_greenhouse_gas_net_flux.csv
	mkdir -p data/gfw_carbon
	sed -i 1d $<
	cut -d',' -f2 $< | head -271 > $@
	for id in $$(cat $@); do \
	table_name=`basename -s .tif "$$id" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
	output_file="data/gfw_carbon/$${table_name}.tif";\
	wget -O "$$output_file" "$$id"; \
	done

# upsample downloaded data to 10km res
data/gfw_carbon/merged_tiles: data/gfw_carbon/forest_greenhouse_gas_net_flux_simp.txt
	mkdir -p data/gfw_carbon/merged_tiles
	for tiffile in data/gfw_carbon/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="data/gfw_carbon/forest_greenhouse_gas_net_flux_$${table_name}_10km.tif";\
		gdalwarp -s_srs EPSG:4326 -t_srs EPSG:4326 -r average -multi -of GTiff "$${tiffile}" "$${output_file}"; \
		rm -f "$${tiffile}";\
	done
	gdalbuildvrt data/gfw_carbon/forest_greenhouse_gas_net_flux_2001_2020_tCO2eq.vrt data/gfw_carbon/*.tif
	for tifffile in data/gfw_carbon//*.tiff; do rm -f "$${tiffile}"; done
	gdal_translate -of GTiff -co COMPRESS=DEFLATE -co PREDICTOR=2 -co ZLEVEL=9 \
	data/gfw_carbon/forest_greenhouse_gas_net_flux_2001_2020_tCO2eq.vrt data/gfw_carbon/merged_tiles/forest_greenhouse_gas_net_flux_2001_2020_tCO2eq.tif
	for tiffile in in data/gfw_carbon/*.tif; do rm -f "$${tiffile}"; done

h3_grid_carbon_global: data/gfw_carbon/merged_tiles
	python tiff_folder_to_h3_table.py $< $@ indicator GHG_LUC_T --h3-res=6

## DOWNLOAD PASTURE AND CROPLAND DATASET
#https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip
data/earthstat/CroplandPastureArea2000_Geotiff.zip:
	mkdir -p data/earthstat
	wget -q -O $@ https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip

#unzip
data/earthstat/CroplandPastureArea2000_global_ha: data/earthstat/CroplandPastureArea2000_Geotiff.zip
	mkdir -p $@
	unzip -j -o -u $< */Pasture2000_5m.tif -d $@
	gdal_translate -a_nodata 0 -of GTiff data/earthstat/CroplandPastureArea2000_global_ha/Pasture2000_5m.tif \
	data/earthstat/CroplandPastureArea2000_global_ha/es_pasture_global.tif


# and import to a table called "h3_grid_earthstat2000_global_ha"
h3_grid_pasture: data/earthstat/CroplandPastureArea2000_global_ha
	python tiff_folder_to_h3_table.py $< $@ harvest_area es --h3-res=6


# ^^^
#######################################

clean:
	rm -rf data/*
