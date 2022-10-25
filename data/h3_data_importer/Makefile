#########################
# About this var
# This is a rough controller of how many parallel system threads you'll have
# It does not necessarily represent a max thread count, but it's probably similar to that
# Lower if you are having issues. Increase at your own risk
#########################
PARALLELIZATION_FACTOR=10

WORKDIR_MAPSPAM=data/mapspam
WORKDIR_GLW3=data/glw3
WORKDIR_WATER_FOOTPRINT=data/waterFootprint
WORKDIR_DEFORESTATION=data/hansen_loss
WORKDIR_SPECIESRICHNESS=data/satelligence/species_richness
WORKDIR_ABOVEGROUNDBIOMASS=data/satelligence/above_ground_biomass
WORKDIR_SATDEFORESTATION=data/satelligence/deforestation
WORKDIR_AQUEDUCT=data/contextual/aqueduct
WORKDIR_HDI=data/contextual/hdi
WORKDIR_GHG=data/forest_ghg
WORKDIR_WOODPULP=data/woodpulp

all:
	make clean
	make -j 2 crop indicators

crop:
	make -j 2 convert-mapspam-crop-production convert-mapspam-crop-harvest convert-glw3-livestock convert-woodpulp

# NOTE: The ingestion below is commented in order to avoid ingesting data, we don't have indicator for in the database yet
# once the new indicators have been defined and ingested we will need to update the indicator code in for each on the indicator commented below and allow the ingestion.
# convert-speciesRichness convert-aboveGroundBiomass convert-satDeforestation
indicators:
	make -j 2 convert-water-footprint convert-aqueduct-contextual
	# Processing deforestation data is quite intensive, so we do it separately, so we can allocate all threads to it
	# There is probably a better way to do this, that future me will learn about - in the future.
	make convert-deforestation
	make convert-forestGHG
	make convert-satDeforestation
contextual-layers:
	make convert-hdi-contextual

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
# 1. Unzip to folder. Only extract the files ending in *_A.tif (all agricultural technology types together)
# 2. Calculate combination of crops
extract-mapspam-crop-production: download-mapspam-crop-production
	mkdir -p $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod
	unzip -u $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod.geotiff.zip *_A.tif -d $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod
	gdal_calc.py --quiet --calc "A+B+C+D" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TEMF_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_GROU_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_BANA_A.tif \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TROF_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TemfGrouBanaTrof_A.tif
	gdal_calc.py --quiet --calc "A+B+C" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_ACOF_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TEAS_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_REST_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_AcofTeasRest_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D+E+F+G" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WHEA_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OCER_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_BARL_A.tif \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_MAIZ_A.tif \
		-E $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_RICE_A.tif \
		-F $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SORG_A.tif \
		-G $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SMIL_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WheaOcerBarlMaizRiceSortSmil_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WHEA_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OCER_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_POTA_A.tif \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OPUL_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WheaOcerPotaOpul_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D+E+F+G+H+I" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SOYB_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_GROU_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_CNUT_A.tif \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OOIL_A.tif \
		-E $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_RAPE_A.tif \
		-F $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SUNF_A.tif \
		-G $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_REST_A.tif \
		-H $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OCER_A.tif \
		-I $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SUGB_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SoybGrouCnutOoilRapeSunfRestOcerSugb_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SUGC_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SUGB_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SugcSugb_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OCER_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WHEA_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OcerWhea_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_VEGE_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TEMF_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TROF_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_VegeTemfTrof_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TROF_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TEMF_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TrofTemf_A.tif

extract-mapspam-crop-harvest: download-mapspam-crop-harvest
	mkdir -p $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha
	unzip -u $(WORKDIR_MAPSPAM)/spam2010v2r0_global_harv_area.geotiff.zip *_A.tif -d $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha
	gdal_calc.py --quiet --calc="numpy.sum(A, axis=0)" --format Gtiff \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/*_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_All_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TEMF_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_GROU_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_BANA_A.tif --C_band 1 \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TROF_A.tif --D_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TemfGrouBanaTrof_A.tif
	gdal_calc.py --quiet --calc "A+B+C" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_ACOF_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TEAS_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_REST_A.tif --C_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_AcofTeasRest_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D+E+F+G" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WHEA_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OCER_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_BARL_A.tif --C_band 1 \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_MAIZ_A.tif --D_band 1 \
		-E $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_RICE_A.tif --E_band 1 \
		-F $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SORG_A.tif --F_band 1 \
		-G $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SMIL_A.tif --G_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WheaOcerBarlMaizRiceSortSmil_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WHEA_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OCER_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_POTA_A.tif --C_band 1 \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OPUL_A.tif --D_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WheaOcerPotaOpul_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D+E+F+G+H+I" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SOYB_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_GROU_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_CNUT_A.tif --C_band 1 \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OOIL_A.tif --D_band 1 \
		-E $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_RAPE_A.tif --E_band 1 \
		-F $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SUNF_A.tif --F_band 1 \
		-G $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_REST_A.tif --G_band 1 \
		-H $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OCER_A.tif --H_band 1 \
		-I $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SUGB_A.tif --I_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SoybGrouCnutOoilRapeSunfRestOcerSugb_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SUGC_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SUGB_A.tif --B_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SugcSugb_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OCER_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WHEA_A.tif --B_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OcerWhea_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_VEGE_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TEMF_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TROF_A.tif --C_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_VegeTemfTrof_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TROF_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TEMF_A.tif --B_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TrofTemf_A.tif

#CONVERT DATASETS:
# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_spam2017v2r0_global_prod"
convert-mapspam-crop-production: extract-mapspam-crop-production
	python tiff_folder_to_h3_table.py $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod h3_grid_spam2010v2r0_global_prod production spam 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

convert-mapspam-crop-harvest: extract-mapspam-crop-harvest
	python tiff_folder_to_h3_table.py $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha h3_grid_spam2010v2r0_global_ha harvest_area spam 2010 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

# DOWNLOAD PASTURE AND CROPLAND DATASET
 #https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip
download-pasture:
	mkdir -p $(WORKDIR_GLW3)/cattle/harvestArea $(WORKDIR_GLW3)/chickens/harvestArea $(WORKDIR_GLW3)/horses/harvestArea $(WORKDIR_GLW3)/goats/harvestArea $(WORKDIR_GLW3)/sheep/harvestArea $(WORKDIR_GLW3)/pasture/harvestArea $(WORKDIR_GLW3)/pigs/harvestArea
	wget -q -O $(WORKDIR_GLW3)/pasture/harvestArea/CroplandPastureArea2000_Geotiff.zip https://s3.us-east-2.amazonaws.com/earthstatdata/CroplandPastureArea2000_Geotiff.zip

#unzip
#remove no data values
extract-pasture: download-pasture
	unzip -j -o -u $(WORKDIR_GLW3)/pasture/harvestArea/CroplandPastureArea2000_Geotiff.zip */Pasture2000_5m.tif -d $(WORKDIR_GLW3)/pasture/harvestArea

	gdal_calc.py --calc "(A>0)*(A*10*10*100)" --format GTiff --type Float32 --NoDataValue=0 \
		-A $(WORKDIR_GLW3)/pasture/harvestArea/Pasture2000_5m.tif --A_band 1 \
	 	--outfile $(WORKDIR_GLW3)/pasture/harvestArea/global2000_pasture_ha.tif;

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


# table_name = 00N_000W
# 1st gdal_cal do convert to pixel mask of 2020 deforestation events
# the resampling sums the pixels then divide by the number of original pixels fit in
# resampled pixel to get the % of area afected by deforestation
transform-deforestation-file:
	@echo "Transforming deforestation file $(FILE) ... "
	table_name=`basename -s .tif $(FILE) | tr -d ' \t\n\r' | grep -oP "\d{2}[A-Z]_\d{3}[A-Z]"`; \
 	wget -q -O "$(WORKDIR_DEFORESTATION)/$${table_name}.tif" $(FILE); \
	rm -f "$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif"; \
	gdal_calc.py --quiet --calc "(A>19)" --format GTiff --co NBITS=1 --co compress=PACKBITS --co tiled=YES --co BLOCKXSIZE=400 --co BLOCKYSIZE=400  --NoDataValue 0 --overwrite \
		-A "$(WORKDIR_DEFORESTATION)/$${table_name}.tif" \
		--outfile  "$(WORKDIR_DEFORESTATION)/$${table_name}.tif"; \
	gdalwarp -q -s_srs EPSG:4326 -t_srs EPSG:4326 -r sum -tr 0.0833333333333286 0.0833333333333286 -multi -of GTiff  -ot UInt32 -wo NUM_THREADS=ALL_CPUS \
		"$(WORKDIR_DEFORESTATION)/$${table_name}.tif" \
		"$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif"; \
	gdal_calc.py --quiet --calc "A/111111.11111109848" --format GTiff --type Float32 --NoDataValue 0.0 --overwrite \
		-A "$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif" \
		--outfile  "$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif"
	@echo "Done transforming deforestation file $(FILE)"

preprocess-deforestation: download-deforestation
	@echo "Preprocessing deforestation data... "
	mkdir -p $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles
	gdalbuildvrt $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.vrt $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/*.tif
	gdal_translate -q -of GTiff -co NUM_THREADS=ALL_CPUS -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co ZLEVEL=9 -co BLOCKXSIZE=512 -co BLOCKYSIZE=512 \
		$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.vrt \
		$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif
	python rolling_average.py $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha_buffered.tif

convert-deforestation: preprocess-deforestation
	@echo "Converting deforestation data... "
	python tiff_folder_to_h3_table.py data/hansen_loss/Hansen_GFC_2020_lossyear/merged_tiles h3_grid_deforestation_global \
		indicator DF_LUC_T 2020 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)


download-process-forestGHG-list:
	@echo "Downloading Forest Greenhouse Gas emission tiles list..."
	mkdir -p $(WORKDIR_GHG)
	mkdir -p $(WORKDIR_GHG)/resampled
	wget -q -O $(WORKDIR_GHG)/forest_ghg_sources_list.json https://services2.arcgis.com/g8WusZB13b9OegfU/arcgis/rest/services/Forest_greenhouse_gas_emissions/FeatureServer/0/query\?where\=1%3D1\&outFields\=\*\&outSR\=4326\&f\=json
	python download_and_preprocess_forestGHG.py --processes $(PARALLELIZATION_FACTOR) $(WORKDIR_GHG)/forest_ghg_sources_list.json $(WORKDIR_GHG) $(WORKDIR_DEFORESTATION)

preprocess-forestGHG: download-process-forestGHG-list
	mkdir -p $(WORKDIR_GHG)/resampled/merged_tiles
	gdalbuildvrt $(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020.vrt $(WORKDIR_GHG)/resampled/*.tif
	gdal_translate -q -of GTiff -co NUM_THREADS=ALL_CPUS -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=3 -co ZLEVEL=9 -co BLOCKXSIZE=512 -co BLOCKYSIZE=512 \
		$(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020.vrt \
		$(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020.tif
	python rolling_average.py $(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020.tif $(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020_buffered.tif

convert-forestGHG: preprocess-forestGHG
	@echo "Converting forest GHG data..."
	python tiff_folder_to_h3_table.py $(WORKDIR_GHG)/resampled/merged_tiles h3_grid_ghg_global indicator GHG_LUC_T 2020 --h3-res=6 --thread-count=$(PARALLELIZATION_FACTOR)

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
	
	aws configure set awc_acces_key_id $$AWS_ACCESS_KEY_ID; \
	aws configure set aws_secret_access_key $$AWS_SECRET_ACCESS_KEY; \
	aws s3 sync s3://landgriffon-raw-data/processed/satelligence $(WORKDIR_SATDEFORESTATION);
	
	mkdir $(WORKDIR_SATDEFORESTATION)/mask
	mkdir $(WORKDIR_SATDEFORESTATION)/risk
	mv $(WORKDIR_SATDEFORESTATION)/Deforestation_2021_ha.tif $(WORKDIR_SATDEFORESTATION)/mask
	mv $(WORKDIR_SATDEFORESTATION)/Deforestation_risk.tif $(WORKDIR_SATDEFORESTATION)/risk

convert-satDeforestation: download-satDeforestation
	python	tiff_folder_to_h3_table.py	$(WORKDIR_SATDEFORESTATION)/mask	h3_grid_sat_deforestation		indicator	SAT_DF		2021	--h3-res=11	--thread-count=$(PARALLELIZATION_FACTOR)
	python	tiff_folder_to_h3_table.py	$(WORKDIR_SATDEFORESTATION)/risk	h3_grid_sat_deforestation_risk	indicator	SAT_DF_R	2021	--h3-res=11	--thread-count=$(PARALLELIZATION_FACTOR)


####################
# Woodpulp dataset #
####################
download-woodpulp:
	mkdir -p $(WORKDIR_WOODPULP)
	mkdir -p $(WORKDIR_WOODPULP)/ha
	mkdir -p $(WORKDIR_WOODPULP)/prod
	
	aws configure set awc_acces_key_id $$AWS_ACCESS_KEY_ID; \
	aws configure set aws_secret_access_key $$AWS_SECRET_ACCESS_KEY; \
	aws s3 sync s3://landgriffon-raw-data/processed/woodpulp/ $(WORKDIR_WOODPULP);
	
	mv	$(WORKDIR_WOODPULP)/gfw_plantations_woodpulp_harvest_ha_res.tif	$(WORKDIR_WOODPULP)/ha/gfw_plantations_woodpulp_harvest_ha.tif
	mv	$(WORKDIR_WOODPULP)/gfw_plantations_woodpulp_prod_t_nd_res.tif	$(WORKDIR_WOODPULP)/prod/gfw_plantations_woodpulp_prod_t_nd.tif


convert-woodpulp: download-woodpulp
	python	tiff_folder_to_h3_table.py	$(WORKDIR_WOODPULP)/ha h3_grid_woodpulp_ha		harvest_area	gfw_plantations_woodpulp	2021	--h3-res=6	--thread-count=$(PARALLELIZATION_FACTOR)
	python	tiff_folder_to_h3_table.py	$(WORKDIR_WOODPULP)/ha h3_grid_woodpulp_prod	production		gfw_plantations_woodpulp	2021	--h3-res=6	--thread-count=$(PARALLELIZATION_FACTOR)

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
	python vector_folder_to_h3_table.py $(WORKDIR_AQUEDUCT)/Y2019M07D12_Aqueduct30_V01/baseline/annual h3_grid_aqueduct_global bws_cat aqueduct "Environmental datasets" 2019 --indicator=UWUSR_T --h3-res=6


download-hdi-contextual:
	mkdir -p $(WORKDIR_HDI)
	wget --show-progress -q -O $(WORKDIR_HDI)/IHDI_HDR2020_040722.csv https://hdr.undp.org/sites/default/files/data/2020/IHDI_HDR2020_040722.csv

convert-hdi-contextual: download-hdi-contextual
	python csv_to_h3_table.py $(WORKDIR_HDI)/IHDI_HDR2020_040722.csv h3_grid_hdi_global hdi_2019 2019 iso3

clean:
	rm -rf data/*
