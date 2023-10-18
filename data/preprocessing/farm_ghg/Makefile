checksums_dir=../../../h3_data_importer/data_checksums
data_dir=./data/

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data
export AWS_ACCESS_KEY_ID = $(DATA_S3_ACCESS_KEY)
export AWS_SECRET_ACCESS_KEY = $(DATA_S3_SECRET_KEY)

.PHONY: download_ghg_data compute_aggregated_ghg_data upload_aggregated_ghg_data write_checksums download_ghg_farm_livestock download_faostats_data_production preprocess_faostats_data_production rasterize_and_calculate_emissions_tonne upload_livestock_ghg_data write_checksums_livestock

all: upload_aggregated_ghg_data write_checksums upload_livestock_ghg_data write_checksums_livestock

###################################################
# GHG from farm data - agricultural commodities   #
###################################################


download_ghg_data:
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/ghg_emissions/ data/

compute_aggregated_ghg_data: download_ghg_data
	python make_aggregates_list.py $(data_dir)

upload_aggregated_ghg_data: compute_aggregated_ghg_data
	aws s3 sync data/ $(AWS_S3_BUCKET_URL)/processed/ghg_emissions/

write_checksums:
	cd $(data_dir) && sha256sum * > $(checksums_dir)/ghg_from_farm_emissions

############################
# GHG from farm livestock  #
############################

# download ghg livestock data to preprocess (ghg by head of livestock)
download_ghg_farm_livestock:
	mkdir -p $(data_dir)/farm_ghg_livestock
	aws s3 sync $(AWS_S3_BUCKET_URL)/raw/ghg_farm_livestock $(data_dir)/farm_ghg_livestock/

# download faostats pasture data to preprocess (Tonnes / LSU(heads of livestock))
download_faostats_data_production: download_ghg_farm_livestock
	mkdir -p $(data_dir)/faostats_prod
	aws s3 sync $(AWS_S3_BUCKET_URL)/raw/FAOSTAT_livestock/production data/faostats_prod

# preprocess eggs and milk
preprocess_faostats_data_production: download_faostats_data_production
	mkdir -p $(data_dir)/faostats_prod/production
	python preprocess_faostats.py $(data_dir)/faostats_prod/FAOSTAT_data_hens_eggs_iso3_2021.csv \
		$(data_dir)/faostats_prod/production/FAOSTAT_data_hens_eggs_iso3_2021_t.shp;
	python preprocess_faostats.py $(data_dir)/faostats_prod/FAOSTAT_data_total_milk_iso3_2021.csv \
		$(data_dir)/faostats_prod/production/FAOSTAT_data_total_milk_iso3_2021_t.shp;

#rasterise the faostats data
# download the ghg emissions by LSU / faostat t/LSU
rasterize_and_calculate_emissions_tonne: preprocess_faostats_data_production
	mkdir -p $(data_dir)/rasterized
	mkdir -p $(data_dir)/ghg_by_tonne
	gdal_rasterize -q -l FAOSTAT_data_hens_eggs_iso3_2021_t -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -90 180 90.0 -ts 4320 2160 -ot Float32 -of GTiff \
		$(data_dir)/faostats_prod/production/FAOSTAT_data_hens_eggs_iso3_2021_t.shp \
		$(data_dir)/rasterized/FAOSTAT_data_hens_eggs_iso3_2021_t.tif;
	gdal_calc.py --NoDataValue=0 --quiet --calc "B/((A!=0)*A)" --format GTiff --type Float64  \
		-A $(data_dir)/rasterized/FAOSTAT_data_hens_eggs_iso3_2021_t.tif --A_band 1 \
		-B $(data_dir)/farm_ghg_livestock/chicken_eggs_per_head.tif \
		--outfile $(data_dir)/ghg_by_tonne/HENSEGGS_per_t_production.tif --NoDataValue=0;
	gdal_rasterize -q -l FAOSTAT_data_total_milk_iso3_2021_t -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -90 180 90.0 -ts 4320 2160 -ot Float32 -of GTiff \
		$(data_dir)/faostats_prod/production/FAOSTAT_data_total_milk_iso3_2021_t.shp \
		$(data_dir)/rasterized/FAOSTAT_data_total_milk_iso3_2021_t.tif;
	gdal_calc.py --NoDataValue=0 --quiet --calc "B/((A!=0)*A)" --format GTiff --type Float64 \
		-A $(data_dir)/rasterized/FAOSTAT_data_total_milk_iso3_2021_t.tif --A_band 1 \
		-B $(data_dir)/farm_ghg_livestock/cows_milk_per_head.tif \
		--outfile $(data_dir)/ghg_by_tonne/TOTALRAWMILK_per_t_production.tif --NoDataValue=0;

# upload to s3 bucket
upload_livestock_ghg_data: rasterize_and_calculate_emissions_tonne
	aws s3 sync $(data_dir)/ghg_by_tonne/ $(AWS_S3_BUCKET_URL)/processed/ghg_emissions_livestock/

write_checksums_livestock:
	cd $(data_dir)/ghg_by_tonne/ && sha256sum * > ../$(checksums_dir)/ghg_from_farm_emissions_livesock
