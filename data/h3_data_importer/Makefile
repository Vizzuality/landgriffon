#########################
# About this var
# This is a rough controller of how many parallel system threads you'll have
# It does not necessarily represent a max thread count, but it's probably similar to that
# Lower if you are having issues. Increase at your own risk
#########################
PARALLELIZATION_FACTOR=10

WORKDIR_MAPSPAM=data/mapspam
WORKDIR_EARTHSTAT=data/earthstat
WORKDIR_GLW3=data/glw3
WORKDIR_WATER_FOOTPRINT=data/waterFootprint
WORKDIR_BIODIVERSITY=data/biodiversity
WORKDIR_CARBON=data/gfw_carbon
WORKDIR_DEFORESTATION=data/hansen_loss
WORKDIR_SPECIESRICHNESS=data/satelligence/species_richness
WORKDIR_ABOVEGROUNDBIOMASS=data/satelligence/above_ground_biomass
WORKDIR_SATDEFORESTATION=data/satelligence/deforestation
WORKDIR_AQUEDUCT=data/contextual/aqueduct
WORKDIR_HDI=data/contextual/hdi

all:
	make clean
	make -j 2 crop indicators

crop:
	make -j 2 convert-mapspam-crop-production convert-earthstat-crop-production convert-earthstat-crop-harvest convert-mapspam-crop-harvest convert-glw3-livestock

# NOTE: The ingestion below is commented in order to avoid ingesting data, we don't have indicator for in the database yet
# once the new indicators have been defined and ingested we will need to update the indicator code in for each on the indicator commented below and allow the ingestion.
# convert-speciesRichness convert-aboveGroundBiomass convert-satDeforestation
indicators:
	make -j 2 convert-water-footprint convert-biodiversity convert-carbon
	# Processing deforestation data is quite intensive, so we do it separately, so we can allocate all threads to it
		# There is probably a better way to do this, that future me will learn about - in the future.
	make convert-deforestation

contextual-layers:
	make convert-aqueduct-contextual convert-hdi-contextual

############################################
# MapSPAM crop production and harvest area #
############################################

# DOWNLOAD DATASETS
# <zipfile>:
# Download MapSPAM crop production
download-mapspam-crop-production:
	mkdir -p $(WORKDIR_MAPSPAM)
	wget -q -O $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod.geotiff.zip https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_prod.geotiff.zip

#Download MapSPAM crop harvest area
download-mapspam-crop-harvest:
	mkdir -p $(WORKDIR_MAPSPAM)
	wget -q -O $(WORKDIR_MAPSPAM)/spam2010v2r0_global_harv_area.geotiff.zip https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_harv_area.geotiff.zip

#EXTRACT DATASETS:
# <tiff_folder>: <zipfile>
# Unzip to folder
# Only extract the files ending in *_A.tif (all agricultural technology types together)
extract-mapspam-crop-production: download-mapspam-crop-production
	mkdir -p $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod
	unzip -u $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod.geotiff.zip *_A.tif -d $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod

extract-mapspam-crop-harvest: download-mapspam-crop-harvest
	mkdir -p $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha
	unzip -u $(WORKDIR_MAPSPAM)/spam2010v2r0_global_harv_area.geotiff.zip *_A.tif -d $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha

#CONVERT DATASETS:
# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_spam2017v2r0_global_prod"
convert-mapspam-crop-production: extract-mapspam-crop-production
	python tiff_folder_to_h3_table.py $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod h3_grid_spam2010v2r0_global_prod production spam 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

convert-mapspam-crop-harvest: extract-mapspam-crop-harvest
	python tiff_folder_to_h3_table.py $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha h3_grid_spam2010v2r0_global_ha harvest_area spam 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


##############################################
# Earthstat crop production and harvest area #
##############################################

# Download earthstat crop production
download-earthstat-crop-production:
	mkdir -p $(WORKDIR_EARTHSTAT)
	wget -q -O $(WORKDIR_EARTHSTAT)/HarvestedAreaYield175Crops_Geotiff.zip https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Geotiff.zip

# Unzip to folder
# Only extract the files that contain production. Set the no data to 0 as the mapspam datasets.
extract-earthstat-crop-production: download-earthstat-crop-production
	mkdir -p $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod
	rm -rf $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/*
	unzip -j -o -u $(WORKDIR_EARTHSTAT)/HarvestedAreaYield175Crops_Geotiff.zip *_Production.tif -d $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod
	gdal_calc.py --calc "A+B" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/papaya_Production.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/watermelon_Production.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/melonpapaya_Production.tif
	gdal_calc.py --calc "A+B+C+D+E+F+G+H" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/almond_Production.tif --A_band 1 \
	-B $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/brazil_Production.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/cashew_Production.tif -D $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/chestnut_Production.tif -E $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/hazelnut_Production.tif \
	-F $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/nutnes_Production.tif -G $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/pistachio_Production.tif -H $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/walnut_Production.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/allnuts_Production.tif
	gdal_calc.py --calc "A+B+C+D+E+F+G+H+I+J" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/coffee_Production.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/tea_Production.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/mate_Production.tif \
	-D $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/pepper_Production.tif -E $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/vanilla_Production.tif -F $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/cinnamon_Production.tif -G $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/clove_Production.tif \
	-H $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/nutmeg_Production.tif -I $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/aniseetc_Production.tif -J $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/ginger_Production.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/allcoffee_Production.tif
	gdal_calc.py --calc "A+B+C+D+E+F+G+H+I" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/wheat_Production.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/rye_Production.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/barley_Production.tif \
	-D $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/oats_Production.tif -E $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/maize_Production.tif -F $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/rice_Production.tif -G $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/sorghum_Production.tif \
	-H $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/buckwheat_Production.tif -I $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/cerealnes_Production.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/allcereals_Production.tif
	gdal_calc.py --calc "A+B+C+D" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/apricot_Production.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/cherry_Production.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/peachetc_Production.tif \
	-D $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/plum_Production.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/allappricot_Production.tif
	gdal_calc.py --calc "A+B+C" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/apple_Production.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/pear_Production.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/quince_Production.tif \
	--outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/allapple_Production.tif
	gdal_calc.py --calc "A+B+C+D+E+F+G+H+I" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/allnuts_Production.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/banana_Production.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/fig_Production.tif \
	-D $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/citrusnes_Production.tif -E $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/grape_Production.tif -F $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/melonpapaya_Production.tif -G $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/allapple_Production.tif \
	-H $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/allappricot_Production.tif -I $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/fruitnes_Production.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_prod/fruitnuts_Production.tif
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
	rm -rf $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/*
	unzip -j -o -u $(WORKDIR_EARTHSTAT)/HarvestedAreaYield175Crops_Geotiff.zip *_HarvestedAreaHectares.tif -d $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha
	gdal_calc.py --calc "A+B" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/papaya_HarvestedAreaHectares.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/watermelon_HarvestedAreaHectares.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/melonpapaya_HarvestedAreaHectares.tif
	gdal_calc.py --calc "A+B+C+D+E+F+G+H" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/almond_HarvestedAreaHectares.tif --A_band 1 \
	-B $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/brazil_HarvestedAreaHectares.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/cashew_HarvestedAreaHectares.tif -D $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/chestnut_HarvestedAreaHectares.tif -E $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/hazelnut_HarvestedAreaHectares.tif \
	-F $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/nutnes_HarvestedAreaHectares.tif -G $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/pistachio_HarvestedAreaHectares.tif -H $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/walnut_HarvestedAreaHectares.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/allnuts_HarvestedAreaHectares.tif
	gdal_calc.py --calc "A+B+C+D+E+F+G+H+I+J" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/coffee_HarvestedAreaHectares.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/tea_HarvestedAreaHectares.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/mate_HarvestedAreaHectares.tif \
	-D $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/pepper_HarvestedAreaHectares.tif -E $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/vanilla_HarvestedAreaHectares.tif -F $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/cinnamon_HarvestedAreaHectares.tif -G $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/clove_HarvestedAreaHectares.tif \
	-H $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/nutmeg_HarvestedAreaHectares.tif -I $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/aniseetc_HarvestedAreaHectares.tif -J $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/ginger_HarvestedAreaHectares.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/allcoffee_HarvestedAreaHectares.tif
	gdal_calc.py --calc "A+B+C+D+E+F+G+H+I" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/wheat_HarvestedAreaHectares.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/rye_HarvestedAreaHectares.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/barley_HarvestedAreaHectares.tif \
	-D $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/oats_HarvestedAreaHectares.tif -E $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/maize_HarvestedAreaHectares.tif -F $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/rice_HarvestedAreaHectares.tif -G $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/sorghum_HarvestedAreaHectares.tif \
	-H $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/buckwheat_HarvestedAreaHectares.tif -I $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/cerealnes_HarvestedAreaHectares.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/allcereals_HarvestedAreaHectares.tif
	gdal_calc.py --calc "A+B+C+D" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/apricot_HarvestedAreaHectares.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/cherry_HarvestedAreaHectares.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/peachetc_HarvestedAreaHectares.tif \
	-D $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/plum_HarvestedAreaHectares.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/allappricot_HarvestedAreaHectares.tif
	gdal_calc.py --calc "A+B+C" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/apple_HarvestedAreaHectares.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/pear_HarvestedAreaHectares.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/quince_HarvestedAreaHectares.tif \
	--outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/allapple_HarvestedAreaHectares.tif
	gdal_calc.py --calc "A+B+C+D+E+F+G+H+I" --format GTiff --type Float32 -A $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/allnuts_HarvestedAreaHectares.tif --A_band 1 -B $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/banana_HarvestedAreaHectares.tif -C $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/fig_HarvestedAreaHectares.tif \
	-D $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/citrusnes_HarvestedAreaHectares.tif -E $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/grape_HarvestedAreaHectares.tif -F $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/melonpapaya_HarvestedAreaHectares.tif -G $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/allapple_HarvestedAreaHectares.tif \
	-H $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/allappricot_HarvestedAreaHectares.tif -I $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/fruitnes_HarvestedAreaHectares.tif --outfile $(WORKDIR_EARTHSTAT)/earthstat2000_global_ha/fruitnuts_HarvestedAreaHectares.tif
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

# DOWNLOAD PASTURE AND CROPLAND DATASET
 #https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip
download-pasture:
	mkdir -p $(WORKDIR_GLW3)/cattle/harvestArea $(WORKDIR_GLW3)/chickens/harvestArea $(WORKDIR_GLW3)/horses/harvestArea $(WORKDIR_GLW3)/goats/harvestArea $(WORKDIR_GLW3)/sheep/harvestArea $(WORKDIR_GLW3)/pasture/harvestArea $(WORKDIR_GLW3)/pigs/harvestArea
	wget -q -O $(WORKDIR_GLW3)/pasture/harvestArea/CroplandPastureArea2000_Geotiff.zip https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip

#unzip
#remove no data values
extract-pasture: download-pasture
	unzip -j -o -u $(WORKDIR_GLW3)/pasture/harvestArea/CroplandPastureArea2000_Geotiff.zip */Pasture2000_5m.tif -d $(WORKDIR_GLW3)/pasture/harvestArea
	gdal_translate -a_nodata -3.402823e+38 -of GTiff $(WORKDIR_GLW3)/pasture/harvestArea/Pasture2000_5m.tif \
	$(WORKDIR_GLW3)/pasture/harvestArea/es_pasture_global.tif
	rm -f $(WORKDIR_GLW3)/pasture/harvestArea/Pasture2000_5m.tif
	gdal_calc.py --calc "A*10*100" --format GTiff --type Float32 --NoDataValue -3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/es_pasture_global.tif \
	 --A_band 1 --outfile $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif;
	rm -f $(WORKDIR_GLW3)/pasture/harvestArea/es_pasture_global.tif

##########################################
#  Gridded Livestock of the World (GLW3) #
##########################################
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
	gdal_calc.py --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/cattle/6_Ct_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/cattle/production/GLW3_2010_cattle_LSU.tif
	gdal_calc.py --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/chickens/6_Ch_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/chickens/production/GLW3_2010_chickens_LSU.tif
	gdal_calc.py --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/horses/6_Ho_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/horses/production/GLW3_2010_horses_LSU.tif
	gdal_calc.py --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/goats/6_Gt_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/goats/production/GLW3_2010_goats_LSU.tif
	gdal_calc.py --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/sheep/6_Sh_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/sheep/production/GLW3_2010_sheep_LSU.tif
	gdal_calc.py --calc "A*B" --format GTiff --type Float32 --NoDataValue 0 -A $(WORKDIR_GLW3)/pigs/6_Pg_2010_Aw.tif --A_band 1 -B $(WORKDIR_GLW3)/8_AreaKm.tif --outfile $(WORKDIR_GLW3)/pigs/production/GLW3_2010_pigs_LSU.tif
	gdal_calc.py --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/cattle/6_Ct_2010_Aw.tif --outfile $(WORKDIR_GLW3)/cattle/harvestArea/GLW3_2010_cattle_ha.tif
	gdal_calc.py --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/chickens/6_Ch_2010_Aw.tif --outfile $(WORKDIR_GLW3)/chickens/harvestArea/GLW3_2010_chickens_ha.tif
	gdal_calc.py --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/horses/6_Ho_2010_Aw.tif --outfile $(WORKDIR_GLW3)/horses/harvestArea/GLW3_2010_horses_ha.tif
	gdal_calc.py --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/goats/6_Gt_2010_Aw.tif --outfile $(WORKDIR_GLW3)/goats/harvestArea/GLW3_2010_goats_ha.tif
	gdal_calc.py --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/sheep/6_Sh_2010_Aw.tif --outfile $(WORKDIR_GLW3)/sheep/harvestArea/GLW3_2010_sheep_ha.tif
	gdal_calc.py --calc "A*(B>0)" --format GTiff --type Float32 --NoDataValue 3.402823e+38 -A $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif --A_band 1 -B $(WORKDIR_GLW3)/pigs/6_Pg_2010_Aw.tif --outfile $(WORKDIR_GLW3)/pigs/harvestArea/GLW3_2010_pigs_ha.tif
	rm -f $(WORKDIR_GLW3)/cattle/6_Ct_2010_Aw.tif $(WORKDIR_GLW3)/chickens/6_Ch_2010_Aw.tif $(WORKDIR_GLW3)/horses/6_Ho_2010_Aw.tif $(WORKDIR_GLW3)/goats/6_Gt_2010_Aw.tif \
	$(WORKDIR_GLW3)/sheep/6_Sh_2010_Aw.tif $(WORKDIR_GLW3)/8_AreaKm.tif;

rasterize-glw3-livestock-pasture: rasterize-glw3-livestock
	gdal_calc.py --calc "A+B+C+D+E+F" --format GTiff --type Float32 --NoDataValue 0.0 \
	-A $(WORKDIR_GLW3)/cattle/production/GLW3_2010_cattle_LSU.tif --A_band 1 \
	-B $(WORKDIR_GLW3)/chickens/production/GLW3_2010_chickens_LSU.tif \
	-C $(WORKDIR_GLW3)/horses/production/GLW3_2010_horses_LSU.tif \
	-D $(WORKDIR_GLW3)/goats/production/GLW3_2010_goats_LSU.tif \
	-E $(WORKDIR_GLW3)/sheep/production/GLW3_2010_sheep_LSU.tif \
	-F $(WORKDIR_GLW3)/pigs/production/GLW3_2010_pigs_LSU.tif \
	--outfile $(WORKDIR_GLW3)/pasture/production/GLW3_2010_pasture_LSU.tif;

#Ingest livetock data- harvest area and production
convert-glw3-livestock: rasterize-glw3-livestock-pasture
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/cattle/production h3_grid_cattle_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/chickens/production h3_grid_chickens_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/horses/production h3_grid_horses_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/goats/production h3_grid_goats_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/sheep/production h3_grid_sheep_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/pigs/production h3_grid_pigs_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/pasture/production h3_grid_pasture_glo_lsu production glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/cattle/harvestArea h3_grid_cattle_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/chickens/harvestArea h3_grid_chickens_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/horses/harvestArea h3_grid_horses_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/goats/harvestArea h3_grid_goats_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/sheep/harvestArea h3_grid_sheep_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/pigs/harvestArea h3_grid_pigs_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)
	python tiff_folder_to_h3_table.py $(WORKDIR_GLW3)/pasture/harvestArea h3_grid_pasture_glo_ha harvest_area glw3 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


#######################################
# CONTEXTUAL DATASETS FOR INDICATORS  #
#######################################

# WATER FOOTPRINT
# Download generic blue water footprint dataset: https://data.4tu.nl/articles/dataset/The_green_blue_grey_and_total_water_footprint_related_to_production/12675440
download-water-footprint:
	mkdir -p $(WORKDIR_WATER_FOOTPRINT)
	mkdir -p $(WORKDIR_WATER_FOOTPRINT)/spam2010v2r0_global_prod_irr
	wget -q -O $(WORKDIR_WATER_FOOTPRINT)/Report50-WF-of-production-RasterFiles.zip https://data.4tu.nl/ndownloader/files/23992634
	wget -q -O $(WORKDIR_WATER_FOOTPRINT)/spam2010v2r0_global_prod.geotiff.zip https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_prod.geotiff.zip

# # Download crop specific water footprint
# $(WORKDIR_WATER_FOOTPRINT)/Report47-App-IV-CropWaterFootprints-RasterMaps.zip:
# 	mkdir -p $(WORKDIR_WATER_FOOTPRINT)
# 	wget -q -O $@ https://waterfootprint.org/media/downloads/Report47-App-IV-CropWaterFootprints-RasterMaps.zip

#extract generic wf data
#sum all irrigated mapspam production
# devide bwf by the sum of irrigated mapspam production
extract-water-footprint: download-water-footprint
	mkdir -p $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint
	unzip -jn -o -u $(WORKDIR_WATER_FOOTPRINT)/Report50-WF-of-production-RasterFiles.zip -d $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint
	unzip -j -o -u $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/Report50-WF-of-production-RasterFiles.zip */wf_bltot_mmyr/* -d $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint
	unzip -u $(WORKDIR_WATER_FOOTPRINT)/spam2010v2r0_global_prod.geotiff.zip *_I.tif -d $(WORKDIR_WATER_FOOTPRINT)/spam2010v2r0_global_prod_irr
	gdal_translate -of GTiff $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/hdr.adf $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr_m2.tif
	gdal_calc.py --calc "A*10000*10000" --format GTiff --type Float32 --NoDataValue 0.0 -A $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr_m2.tif \
	 --A_band 1 --outfile $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr.tif;
	rm -f $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr_m2.tif

get-bwf_irrigated_prod: extract-water-footprint
	gdal_calc.py --calc "(A>0)*0" --format GTiff --type Float32 --NoDataValue -9999 -A $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr.tif --outfile $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/total_irrigated_production.tif;
	for tiffile in $(WORKDIR_WATER_FOOTPRINT)/spam2010v2r0_global_prod_irr/*.tif; do \
		gdal_translate -projwin -179.99166665 83.08834447 180.00836215 -55.91166665 -of GTiff "$${tiffile}" $(WORKDIR_WATER_FOOTPRINT)/spam2010v2r0_global_prod_irr/irr_prod_new_extent.tif; \
		gdal_calc.py --calc "A+B" --format GTiff --type Float32 --NoDataValue 0.0 -A $(WORKDIR_WATER_FOOTPRINT)/spam2010v2r0_global_prod_irr/irr_prod_new_extent.tif -B $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/total_irrigated_production.tif \
		 --outfile $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/total_irrigated_production.tif;\
		rm -f $(WORKDIR_WATER_FOOTPRINT)/spam2010v2r0_global_prod_irr/irr_prod_new_extent.tif;\
	done;
	gdal_calc.py --calc "(A>0)*A" --format GTiff --type Float32 --NoDataValue 0.0 -A $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/total_irrigated_production.tif \
	--A_band 1 --outfile $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/total_irrigated_production_noZero.tif;
	gdal_calc.py --calc "A/B" --format GTiff --type Float32 --NoDataValue 0.0 -A $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr.tif -B $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/total_irrigated_production_noZero.tif \
	--outfile $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr_t.tif;
	rm -f $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/total_irrigated_production.tif $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/total_irrigated_production_noZero.tif $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint/wf_bltot_mmyr.tif;


# Convert the wf tiffs in the folder to h3indexes at resolution 6
convert-water-footprint: get-bwf_irrigated_prod
	python tiff_folder_to_h3_table.py $(WORKDIR_WATER_FOOTPRINT)/generic_waterfootprint h3_grid_wf_global indicator UWU_T 2005 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR) --contextual

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
	make rasterize-biodiversity-file ATTRIBUTE_NAME=Permanent_ TIF=lcia_psl_r_permanent_crops.tif & \
	wait

rasterize-biodiversity-file:
	gdal_rasterize -l wwf_terr_ecos_m -a $(ATTRIBUTE_NAME) -tr 0.0833333333333286 0.0833333333333286 -a_nodata 0.0 \
    	-te -180.0 -90.0 180.0 90.0 -ot Float32 \
    	-of GTiff $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/wwf_terr_ecos_m.shp $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/lcia_psl_regional/$(TIF)

# convert the biodiversity rasters to h3 tables
convert-biodiversity: rasterize-biodiversity
	python tiff_folder_to_h3_table.py $(WORKDIR_BIODIVERSITY)/6kcchn7e3u_official_teow/lcia_psl_regional h3_grid_bio_global indicator BL_LUC_T 2015 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR) --contextual


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

#todo: change resampling method by sum and ingest density when updating methodology for calculating deforestation
# divide by 111111.1111111111 for getting the density
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
	gdal_calc.py --calc "(A>19)" --format GTiff --type Byte -A $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif --A_band 1 --outfile $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2019.tif
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
	python tiff_folder_to_h3_table.py $(WORKDIR_CARBON)/GHGEmissions h3_grid_carbon_global indicator GHG_LUC_T 2000 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR) --contextual

##################################
#        Satelligence data       #
##################################

# Species richness:
# download species richness data from satelligence bucket
#rasterize-biodiversity
download-speciesRichness:
	mkdir -p $(WORKDIR_SPECIESRICHNESS)
	wget -q -O $(WORKDIR_SPECIESRICHNESS)/SpeciesRichness_IDN_2021-01-01-2022-01-01.tif https://storage.googleapis.com/s11-landgriffon-data/v0/SpeciesRichness/SpeciesRichness_IDN_2021-01-01-2022-01-01.tif

# upsampling data from 30m resolution to 10km resolution using gdal warp
#¶esampling method used based on data number of species per area - sum: compute the weighted sum of all non-NODATA contributing pixels (since GDAL 3.1)
# for more information regarding resampling methods please visit: https://gdal.org/programs/gdalwarp.html
preprocess-speciesRichness: download-speciesRichness
	gdal_calc.py --calc "(A>=264)" --format GTiff --type Float32 --NoDataValue 0.0 -A "$(WORKDIR_SPECIESRICHNESS)/SpeciesRichness_IDN_2021-01-01-2022-01-01.tif" --A_band 1 --outfile "$(WORKDIR_SPECIESRICHNESS)/high_density_of_species_mask.tif"
	gdalwarp -s_srs EPSG:4326 -t_srs EPSG:4326 -dstnodata 0.0 -tr 0.0833333333333286 0.0833333333333286 -r max -te 94.918029685 2.146125243 98.479926218 5.963450309 -te_srs EPSG:4326 -multi -of GTiff \
	"$(WORKDIR_SPECIESRICHNESS)/high_density_of_species_mask.tif" "$(WORKDIR_SPECIESRICHNESS)/SpeciesRichness_IDN_10km_mask.tif";\
	rm -f "$(WORKDIR_SPECIESRICHNESS)/SpeciesRichness_IDN_2021-01-01-2022-01-01.tif"
	rm -f "$(WORKDIR_SPECIESRICHNESS)/high_density_of_species_mask.tif"

#TODO update with the reference of a new satelligence indicator
convert-speciesRichness: preprocess-speciesRichness
	python tiff_folder_to_h3_table.py $(WORKDIR_SPECIESRICHNESS)/ h3_grid_speciesrichness_idn_mask indicator BL_LUC_T 2021 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

# Above ground biomass
download-aboveGroundBiomass:
	mkdir -p $(WORKDIR_ABOVEGROUNDBIOMASS)
	wget -q -O $(WORKDIR_ABOVEGROUNDBIOMASS)/AboveGroundBiomass_GLO_2001-01-01-2002-01-01.tif https://storage.googleapis.com/s11-landgriffon-data/v0/AboveGroundBiomass/AboveGroundBiomass_GLO_2001-01-01-2002-01-01.tif

preprocess-aboveGroundBiomass: download-aboveGroundBiomass
	gdalwarp -s_srs EPSG:4326 -t_srs EPSG:4326 -dstnodata 0.0 -tr 0.0833333333333286 0.0833333333333286 -r sum -te 94.918029685 2.146125243 98.479926218 5.963450309 -te_srs EPSG:4326 -multi -of GTiff \
	"$(WORKDIR_ABOVEGROUNDBIOMASS)/AboveGroundBiomass_GLO_2001-01-01-2002-01-01.tif" "$(WORKDIR_ABOVEGROUNDBIOMASS)/AboveGroundBiomass_GLO_2001_2002_10km.tif";\
	rm -f "$(WORKDIR_ABOVEGROUNDBIOMASS)/AboveGroundBiomass_GLO_2001-01-01-2002-01-01.tif"

#TODO update with the reference of a new satelligence indicator
convert-aboveGroundBiomass: preprocess-aboveGroundBiomass
	python tiff_folder_to_h3_table.py $(WORKDIR_ABOVEGROUNDBIOMASS)/ h3_grid_abovegroundbiomass_glo_tha indicator GHG_LUC_T 2001 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

# Satelligence deforestation
#Download satelligence deforestation
download-satDeforestation:
	mkdir -p $(WORKDIR_SATDEFORESTATION)
	wget -q -O $(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01.tif https://storage.googleapis.com/s11-landgriffon-data/v0/Deforestation/Deforestation_IDN_2021-01-01-2022-01-01.tif

#ingets data as density - This values would need to be multiplied by the hex area in the analysis
#1. multiplies by 1 and remove no data values
#2. downsample to the same resolution used for the otehr datasets ingested using the sum resampling method
#3. divides the sum by the total sum in each pixel to get the density
preprocess-satDeforestation: download-satDeforestation
	gdal_calc.py --calc "A*1" --format GTiff --type Float32 --NoDataValue 0.0 -A $(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01.tif --A_band 1 --outfile $(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01_mask.tif
	gdalwarp -s_srs EPSG:4326 -t_srs EPSG:4326 -dstnodata 0.0 -tr 0.0833333333333286 0.0833333333333286 -r sum  -multi -of GTiff $(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01_mask.tif $(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01_sum.tif
	gdal_calc.py --calc "A/1929012.345678793" --format GTiff --type Float32 --NoDataValue 0.0 -A $(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01_sum.tif --A_band 1 --outfile $(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01_density.tif
	rm -f "$(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01.tif"
	rm -f "$(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01_sum.tif"
	rm -f "$(WORKDIR_SATDEFORESTATION)/Deforestation_IDN_2021-01-01-2022-01-01_mask.tif"

#TODO update with the reference of a new satelligence indicator
convert-satDeforestation: preprocess-satDeforestation
	python tiff_folder_to_h3_table.py $(WORKDIR_SATDEFORESTATION)/ h3_grid_deforestation_ind_density indicator DF_LUC_T 2021 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

###################
# Contextual data #
###################

# Aqueduct Global water risk contextual data
download-aqueduct-contextual:
	mkdir -p $(WORKDIR_AQUEDUCT)
	wget --show-progress -q -O $(WORKDIR_AQUEDUCT)/Y2019M07D12_Aqueduct30_V01.zip https://wri-projects.s3.amazonaws.com/Aqueduct30/finalData/Y2019M07D12_Aqueduct30_V01.zip

extract-aqueduct-contextual: download-aqueduct-contextual
	mkdir -p $(WORKDIR_AQUEDUCT)/Y2019M07D12_Aqueduct30_V01
	unzip -u $(WORKDIR_AQUEDUCT)/Y2019M07D12_Aqueduct30_V01.zip  -d $(WORKDIR_AQUEDUCT)/

convert-aqueduct-contextual: extract-aqueduct-contextual
	python vector_folder_to_h3_table.py $(WORKDIR_AQUEDUCT)/Y2019M07D12_Aqueduct30_V01/baseline/annual h3_grid_aqueduct_global bws_cat aqueduct "Environmental datasets" 2019 --h3-res=6


download-hdi-contextual:
	mkdir -p $(WORKDIR_HDI)
	wget --show-progress -q -O $(WORKDIR_HDI)/IHDI_HDR2020_040722.csv https://hdr.undp.org/sites/default/files/data/2020/IHDI_HDR2020_040722.csv

convert-hdi-contextual: download-hdi-contextual
	python csv_to_h3_table.py $(WORKDIR_HDI)/IHDI_HDR2020_040722.csv h3_grid_hdi_global hdi_2019 2019 iso3

clean:
	rm -rf data/*
