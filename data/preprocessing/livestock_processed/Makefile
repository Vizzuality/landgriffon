checksums_dir=../../../../../h3_data_importer/data_checksums
data_dir=./data/

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data
export AWS_ACCESS_KEY_ID = $(DATA_S3_ACCESS_KEY)
export AWS_SECRET_ACCESS_KEY = $(DATA_S3_SECRET_KEY)

.PHONY: download_pasture_data download_faostats_data_production download_faostats_data_harvest preprocess_faostats_data_production preprocess_faostats_data_harvest calculate_aggregation rasterize_and_calculate_commodities_production rasterize_and_calculate_commodities_harvest upload_livestock_processed_production upload_livestock_processed_harvest write_checksums download_faostats_stocks_data preprocess_faostats_data_stocks rasterize_percentage_stock

all: download_pasture_data download_faostats_data_production download_faostats_data_harvest preprocess_faostats_data_production preprocess_faostats_data_harvest rasterize_and_calculate_commodities_production rasterize_and_calculate_commodities_harvest upload_livestock_processed_production upload_livestock_processed_harvest write_checksums download_faostats_stocks_data preprocess_faostats_data_stocks rasterize_percentage_stock

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

download_faostats_stocks_data:
	mkdir -p $(data_dir)/faostats/stocks
	aws s3 sync $(AWS_S3_BUCKET_URL)/raw/FAOSTAT_livestock/stocks data/faostats/stocks/

# obtain percentage of cattle for dairy and chickens by country for layers and vectorize
preprocess_faostats_data_stocks:
	mkdir -p $(data_dir)/faostats_processed/stocks
	python preprocess_faostats_stocks.py $(data_dir)/faostats/stocks/FAOSTAT_cattle_dairy_2019.csv \
		$(data_dir)/faostats/stocks/FAOSTAT_cattle_non_dairy_2019.csv \
		$(data_dir)/faostats_processed/stocks/FAOSTAT_cattle_dairy_percentage.shp;
	python preprocess_faostats_stocks.py $(data_dir)/faostats/stocks/FAOSTAT_chickens_layers_2019.csv \
		$(data_dir)/faostats/stocks/FAOSTAT_chickens_broilers_2019.csv \
		$(data_dir)/faostats_processed/stocks/FAOSTAT_chickens_eggs_percentage.shp;

# clean and vectorize faostats production data for hens and milk
preprocess_faostats_data_production:
	mkdir -p $(data_dir)/faostats_processed/production
	python preprocess_faostats_ha_prod.py $(data_dir)/faostats/production/FAOSTAT_data_hens_eggs_iso3_2021.csv \
		$(data_dir)/faostats_processed/production/FAOSTAT_data_hens_eggs_iso3_2021_t.shp production;
	python preprocess_faostats_ha_prod.py $(data_dir)/faostats/production/FAOSTAT_data_total_milk_iso3_2021.csv \
		$(data_dir)/faostats_processed/production/FAOSTAT_data_total_milk_iso3_2021_t.shp production;

# clean and vectorize faostats harvest data for hens and milk
preprocess_faostats_data_harvest:
	mkdir -p $(data_dir)/faostats_processed/harvest
	python preprocess_faostats_ha_prod.py $(data_dir)/faostats/harvest/FAOSTAT_data_chickens_LSU_ha.csv \
		$(data_dir)/faostats_processed/harvest/FAOSTAT_data_hens_eggs_iso3_2021_ha.shp harvest;
	python preprocess_faostats_ha_prod.py $(data_dir)/faostats/harvest/FAOSTAT_data_cattle_buffalo_LSU_ha.csv \
		$(data_dir)/faostats_processed/harvest/FAOSTAT_data_total_milk_iso3_2021_ha.shp harvest;

#rasterise and calculate the tonnes of material
rasterize_percentage_stock:
	mkdir -p $(data_dir)/rasterized/stocks
	gdal_rasterize -q -l FAOSTAT_cattle_dairy_percentage -a percentage -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)faostats_processed/stocks/FAOSTAT_cattle_dairy_percentage.shp \
		$(data_dir)/rasterized/stocks/FAOSTAT_cattle_dairy_percentage.tif;
	gdal_rasterize -q -l FAOSTAT_chickens_eggs_percentage -a percentage -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)faostats_processed/stocks/FAOSTAT_chickens_eggs_percentage.shp \
		$(data_dir)/rasterized/stocks/FAOSTAT_chickens_eggs_percentage.tif;

# first we need to rasterize stock data with percentage of dairy cattle and chicken eggs
# We rasterize the production chickens and cattle data
# then we need to multiply the rasterized stock percentage with the chicken and cattle data from glwv3
# and the rasterized production data
rasterize_and_calculate_commodities_production:
	mkdir -p $(data_dir)/rasterized/production
	mkdir -p $(data_dir)/processed_commodities/production
	gdal_rasterize -q -l FAOSTAT_data_hens_eggs_iso3_2021_t -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/production/FAOSTAT_data_hens_eggs_iso3_2021_t.shp \
		$(data_dir)/rasterized/production/FAOSTAT_data_hens_eggs_iso3_2021_t.tif;
	gdal_rasterize -q -l FAOSTAT_data_total_milk_iso3_2021_t -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/production/FAOSTAT_data_total_milk_iso3_2021_t.shp \
		$(data_dir)/rasterized/production/FAOSTAT_data_total_milk_iso3_2021_t.tif;
	gdal_calc.py --quiet --calc "A*(B!=3.40282e+38)*B*C" --format GTiff --type Float32 --NoDataValue 0.0 \
		-A $(data_dir)/rasterized/production/FAOSTAT_data_hens_eggs_iso3_2021_t.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Ch_2010_Aw.tif \
		-C $(data_dir)/rasterized/stocks/FAOSTAT_chickens_eggs_percentage.tif \
		--outfile $(data_dir)/processed_commodities/production/GLO_2021_HensEggs_t.tif;
	gdal_calc.py --NoDataValue=0 --quiet --calc "A*(B!=3.40282e+38)*B*C" --format GTiff --type Float64 \
		-A $(data_dir)/rasterized/production/FAOSTAT_data_total_milk_iso3_2021_t.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Ct_2010_Aw.tif \
		-C $(data_dir)/rasterized/stocks/FAOSTAT_cattle_dairy_percentage.tif \
		--outfile $(data_dir)/processed_commodities/production/GLO_2021_TotalRawMilk_t.tif;

# 3.40282e+38 is the nodata value for the total milk data. We need to set it to 0 for the calculation.
rasterize_and_calculate_commodities_harvest:
	mkdir -p $(data_dir)/rasterized/harvest
	mkdir -p $(data_dir)/processed_commodities/harvest
	gdal_rasterize -q -l FAOSTAT_data_hens_eggs_iso3_2021_ha -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/harvest/FAOSTAT_data_hens_eggs_iso3_2021_ha.shp \
		$(data_dir)/rasterized/harvest/FAOSTAT_data_hens_eggs_iso3_2021_ha.tif;
	gdal_calc.py --quiet --calc "(B*C)/((A!=0)*A)" --format GTiff --type Float32 --NoDataValue 0.0 \
		-A $(data_dir)/rasterized/harvest/FAOSTAT_data_hens_eggs_iso3_2021_ha.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Ch_2010_Aw.tif \
		-C $(data_dir)/rasterized/stocks/FAOSTAT_chickens_eggs_percentage.tif \
		--outfile $(data_dir)/processed_commodities/harvest/GLO_2021_HensEggs_ha.tif;
	gdal_rasterize -q -l FAOSTAT_data_total_milk_iso3_2021_ha -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/harvest/FAOSTAT_data_total_milk_iso3_2021_ha.shp \
		$(data_dir)/rasterized/harvest/FAOSTAT_data_total_milk_iso3_2021_ha.tif;
	gdal_calc.py --NoDataValue=0 --quiet --calc "(((B!=3.40282e+38)*B)*C)/((A!=0)*A)" --format GTiff --type Float64 \
		-A $(data_dir)/rasterized/harvest/FAOSTAT_data_total_milk_iso3_2021_ha.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Tm_2010_Aw.tif \
		-C $(data_dir)/rasterized/stocks/FAOSTAT_cattle_dairy_percentage.tif \
		--outfile $(data_dir)/processed_commodities/harvest/GLO_2021_TotalRawMilk_ha.tif;

upload_livestock_processed_production:
	aws s3 sync $(data_dir)/processed_commodities/production $(AWS_S3_BUCKET_URL)/processed/livestock_processed/production/

upload_livestock_processed_harvest:
	aws s3 sync $(data_dir)/processed_commodities/harvest $(AWS_S3_BUCKET_URL)/processed/livestock_processed/harvest/

write_checksums:
	cd $(data_dir)/processed_commodities/production && sha256sum * > $(checksums_dir)/livestock_processed_prod
	cd $(data_dir)/processed_commodities/harvest && sha256sum * > $(checksums_dir)/livestock_processed_ha
