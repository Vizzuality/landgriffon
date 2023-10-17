checksums_dir=../../../../../h3_data_importer/data_checksums
data_dir=./data/

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data
export AWS_ACCESS_KEY_ID = $(DATA_S3_ACCESS_KEY)
export AWS_SECRET_ACCESS_KEY = $(DATA_S3_SECRET_KEY)

.PHONY: download_pasture_data download_faostats_data_production download_faostats_data_harvest preprocess_faostats_data_production preprocess_faostats_data_harvest calculate_aggregation rasterize_and_calculate_commodities_production rasterize_and_calculate_commodities_harvest upload_livestock_processed_production upload_livestock_processed_harvest write_checksums

all: download_pasture_data download_faostats_data_production download_faostats_data_harvest preprocess_faostats_data_production preprocess_faostats_data_harvest calculate_aggregation rasterize_and_calculate_commodities_production rasterize_and_calculate_commodities_harvest upload_livestock_processed_production upload_livestock_processed_harvest write_checksums

download_pasture_data:
	mkdir -p $(data_dir)/pasture
	wget -q -O $(data_dir)/pasture/6_Ct_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/GIVQ75/I5CUJS
	wget -q -O $(data_dir)/pasture/6_Ch_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/SUFASB/AP1LHN
	wget -q -O $(data_dir)/pasture/6_Gt_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/OCPH42/ZMVOOW
	wget -q -O $(data_dir)/pasture/6_Sh_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/BLWPZN/XDIRM4

download_faostats_data_production:
	mkdir -p $(data_dir)/faostats/production
	aws s3 sync $(AWS_S3_BUCKET_URL)/raw/FAOSTAT_livestock/production data/faostats/production/

download_faostats_data_harvest:
	mkdir -p $(data_dir)/faostats/harvest
	aws s3 sync $(AWS_S3_BUCKET_URL)/raw/FAOSTAT_livestock/harvest data/faostats/harvest/

# preprocess hens eggs and total milk production equivalent
preprocess_faostats_data_production:
	mkdir -p $(data_dir)/faostats_processed/production
	python preprocess_faostats.py $(data_dir)/faostats/production/FAOSTAT_data_hens_eggs_iso3_2021.csv \
		$(data_dir)/faostats_processed/production/FAOSTAT_data_hens_eggs_iso3_2021_t.shp production;
	python preprocess_faostats.py $(data_dir)/faostats/production/FAOSTAT_data_total_milk_iso3_2021.csv \
		$(data_dir)/faostats_processed/production/FAOSTAT_data_total_milk_iso3_2021_t.shp production;

# preprocess hens eggs and total milk harvest equivalent
preprocess_faostats_data_harvest:
	mkdir -p $(data_dir)/faostats_processed/harvest
	python preprocess_faostats.py $(data_dir)/faostats/harvest/FAOSTAT_data_chickens_LSU_ha.csv \
		$(data_dir)/faostats_processed/harvest/FAOSTAT_data_hens_eggs_iso3_2021_ha.shp harvest;
	python preprocess_faostats.py $(data_dir)/faostats/harvest/FAOSTAT_data_cattle_buffalo_LSU_ha.csv \
		$(data_dir)/faostats_processed/harvest/FAOSTAT_data_total_milk_iso3_2021_ha.shp harvest;

# aggregate the pasture data to get the totals that we will need to the total milk calculation
calculate_aggregation:
	gdal_calc.py --NoDataValue=0 --quiet --calc "(A!=-1.7e+308)*A+(B!=-1.7e+308)*B+(C!=-1.7e+308)*C" --format GTiff --type Float64 \
		-A $(data_dir)/pasture/6_Ct_2010_Aw.tif \
		-B $(data_dir)/pasture/6_Gt_2010_Aw.tif \
		-C $(data_dir)/pasture/6_Sh_2010_Aw.tif \
		--outfile $(data_dir)/pasture/6_Tm_2010_Aw.tif

#rasterise and calculate the tonnes of material
rasterize_and_calculate_commodities_production:
	mkdir -p $(data_dir)/rasterized/production
	mkdir -p $(data_dir)/processed_commodities/production
	gdal_rasterize -q -l FAOSTAT_data_hens_eggs_iso3_2021_t -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/production/FAOSTAT_data_hens_eggs_iso3_2021_t.shp \
		$(data_dir)/rasterized/production/FAOSTAT_data_hens_eggs_iso3_2021_t.tif;
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0.0 \
		-A $(data_dir)/rasterized/production/FAOSTAT_data_hens_eggs_iso3_2021_t.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Ch_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/production/GLO_2021_HensEggs_t.tif;
	gdal_rasterize -q -l FAOSTAT_data_total_milk_iso3_2021_t -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/production/FAOSTAT_data_total_milk_iso3_2021_t.shp \
		$(data_dir)/rasterized/production/FAOSTAT_data_total_milk_iso3_2021_t.tif;
	gdal_calc.py --NoDataValue=0 --quiet --calc "A*(B!=3.40282e+38)*B" --format GTiff --type Float64 \
		-A $(data_dir)/rasterized/production/FAOSTAT_data_total_milk_iso3_2021_t.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Tm_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/production/GLO_2021_TotalRawMilk_t.tif;

rasterize_and_calculate_commodities_harvest:
	mkdir -p $(data_dir)/rasterized/harvest
	mkdir -p $(data_dir)/processed_commodities/harvest
	gdal_rasterize -q -l FAOSTAT_data_hens_eggs_iso3_2021_ha -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/harvest/FAOSTAT_data_hens_eggs_iso3_2021_ha.shp \
		$(data_dir)/rasterized/harvest/FAOSTAT_data_hens_eggs_iso3_2021_ha.tif;
	gdal_calc.py --quiet --calc "B/((A!=0)*A)" --format GTiff --type Float32 --NoDataValue 0.0 \
		-A $(data_dir)/rasterized/harvest/FAOSTAT_data_hens_eggs_iso3_2021_ha.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Ch_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/harvest/GLO_2021_HensEggs_ha.tif;
	gdal_rasterize -q -l FAOSTAT_data_total_milk_iso3_2021_ha -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/harvest/FAOSTAT_data_total_milk_iso3_2021_ha.shp \
		$(data_dir)/rasterized/harvest/FAOSTAT_data_total_milk_iso3_2021_ha.tif;
	gdal_calc.py --NoDataValue=0 --quiet --calc "((B!=3.40282e+38)*B)/((A!=0)*A)" --format GTiff --type Float64 \
		-A $(data_dir)/rasterized/harvest/FAOSTAT_data_total_milk_iso3_2021_ha.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Tm_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/harvest/GLO_2021_TotalRawMilk_ha.tif;

upload_livestock_processed_production:
	aws s3 sync $(data_dir)/processed_commodities/production $(AWS_S3_BUCKET_URL)/processed/livestock_processed/production/

upload_livestock_processed_harvest:
	aws s3 sync $(data_dir)/processed_commodities/harvest $(AWS_S3_BUCKET_URL)/processed/livestock_processed/harvest/

write_checksums:
	cd $(data_dir)/processed_commodities/production && sha256sum * > $(checksums_dir)/livestock_processed_prod
	cd $(data_dir)/processed_commodities/harvest && sha256sum * > $(checksums_dir)/livestock_processed_ha
