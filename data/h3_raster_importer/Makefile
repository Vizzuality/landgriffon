

all:  h3_grid_spam2010v2r0_global_prod h3_grid_earthstat2000_global_prod h3_grid_wf_global

#######################################
# MapSPAM crop production
# vvv

# DOWNLOAD DATASETS
# <zipfile>:
# Download MapSPAM crop production
data/mapspam/spam2010v2r0_global_prod.geotiff.zip:
	mkdir -p data/mapspam
	wget -q -O $@ https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_prod.geotiff.zip

# Download earthstat crop production
data/earthstat/HarvestedAreaYield175Crops_Geotiff.zip:
	mkdir -p data/earthstat
	wget -q -O $@ https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Geotiff.zip

# Download generic blue water footprint dataset: https://data.4tu.nl/articles/dataset/The_green_blue_grey_and_total_water_footprint_related_to_production/12675440
data/waterFootprint/Report50-WF-of-production-RasterFiles.zip:
	mkdir -p data/waterFootprint
	wget -q -O $@ https://data.4tu.nl/ndownloader/files/23992634

# # Download crop specific water footprint
# data/waterFootprint/Report47-App-IV-CropWaterFootprints-RasterMaps.zip:
# 	mkdir -p data/waterFootprint
# 	wget -q -O $@ https://waterfootprint.org/media/downloads/Report47-App-IV-CropWaterFootprints-RasterMaps.zip

# Download net carbon flux:
#https://services2.arcgis.com/g8WusZB13b9OegfU/arcgis/rest/services/Forest_greenhouse_gas_net_flux/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson

#EXTRACT DATASETS:
# <tiff_folder>: <zipfile>
# Unzip to folder
# Only extract the files ending in *_A.tif (all agricultural technology types together)
data/mapspam/spam2010v2r0_global_prod: data/mapspam/spam2010v2r0_global_prod.geotiff.zip
	mkdir -p $@
	unzip -u $< *_A.tif -d $@

# Unzip to folder
# Only extract the files that contain production. Set the no data to -1 as the mapspam datasets.
data/earthstat/earthstat2000_global_prod: data/earthstat/HarvestedAreaYield175Crops_Geotiff.zip
	mkdir -p $@
	unzip -j -o -u $< *_Production.tif -d data/earthstat/earthstat2000_global_prod
	for tiffile in data/earthstat/earthstat2000_global_prod/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="data/earthstat/earthstat2000_global_prod/earthstat2000_global_$${table_name}.tif";\
		gdal_translate -a_nodata -1 -of GTiff "$${tiffile}" "$${output_file}";\
		rm -f "$${tiffile}";\
	done

#extract generic wf data
data/waterFootprint/generic_waterfootprint: data/waterFootprint/Report50-WF-of-production-RasterFiles.zip
	mkdir -p $@
	unzip -jn -o -u $< -d $@
	unzip -j -o -u data/waterFootprint/generic_waterfootprint/Report50-WF-of-production-RasterFiles.zip */wf_bltot_mmyr/* -d $@
	gdal_translate -of GTiff data/waterFootprint/generic_waterfootprint/hdr.adf data/waterFootprint/generic_waterfootprint/wf_bltot_mmyr.tif



#CONVERT DATASETS:
# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_spam2017v2r0_global_prod"
h3_grid_spam2010v2r0_global_prod: data/mapspam/spam2010v2r0_global_prod
	python tiff_folder_to_h3_table.py $< $@ --h3-res=6

# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_earthstat2000_global_prod"
h3_grid_earthstat2000_global_prod: data/earthstat/earthstat2000_global_prod
	python tiff_folder_to_h3_table.py $< $@ --h3-res=6


# Convert the wf tiffs in the folder to h3indexes at resolution 6
h3_grid_wf_global: data/waterFootprint/generic_waterfootprint
	python tiff_folder_to_h3_table.py data/waterFootprint/generic_waterfootprint h3_grid_wf_global --h3-res=6

# ^^^
#######################################

clean:
	rm -rf data/*
