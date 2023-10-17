checksums_dir=../../../../h3_data_importer/data_checksums
data_dir=./data/

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data
export AWS_ACCESS_KEY_ID = $(DATA_S3_ACCESS_KEY)
export AWS_SECRET_ACCESS_KEY = $(DATA_S3_SECRET_KEY)

.PHONY: download_pasture_data download_faostats_data preprocess_faostats_data calculate_aggregation rasterize_and_calculate_commodities rasterize_and_calculate_total_milk upload_livestock_processed write_checksums

all: download_pasture_data download_faostats_data preprocess_faostats_data calculate_aggregation rasterize_and_calculate_commodities rasterize_and_calculate_total_milk upload_livestock_processed write_checksums

download_pasture_data:
	mkdir -p $(data_dir)/pasture
	wget -q -O $(data_dir)/pasture/6_Ct_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/GIVQ75/I5CUJS
	wget -q -O $(data_dir)/pasture/6_Ch_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/SUFASB/AP1LHN
	wget -q -O $(data_dir)/pasture/6_Gt_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/OCPH42/ZMVOOW
	wget -q -O $(data_dir)/pasture/6_Sh_2010_Aw.tif https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/BLWPZN/XDIRM4

download_faostats_data:
	mkdir -p $(data_dir)/faostats
	aws s3 sync $(AWS_S3_BUCKET_URL)/raw/FAOSTAT_livestock/ data/faostats/

# preprocess hens eggs, cattle, buffalo, camel, goat, sheep and total milk
preprocess_faostats_data:
	mkdir -p $(data_dir)/faostats_processed
	python preprocess_faostats.py $(data_dir)/faostats/FAOSTAT_data_hens_eggs_iso3_2021.csv \
		$(data_dir)/faostats_processed/FAOSTAT_data_hens_eggs_iso3_2021.shp;
	python preprocess_faostats.py $(data_dir)/faostats/FAOSTAT_data_cattle_raw_milk_iso3_2021.csv \
		$(data_dir)/faostats_processed/FAOSTAT_data_cattle_raw_milk_iso3_2021.shp;
	python preprocess_faostats.py $(data_dir)/faostats/FAOSTAT_data_goat_raw_milk_iso3_2021.csv \
		$(data_dir)/faostats_processed/FAOSTAT_data_goat_raw_milk_iso3_2021.shp;
	python preprocess_faostats.py $(data_dir)/faostats/FAOSTAT_data_sheep_raw_milk_iso_2021.csv \
		$(data_dir)/faostats_processed/FAOSTAT_data_sheep_raw_milk_iso_2021.shp;
	python preprocess_faostats.py $(data_dir)/faostats/FAOSTAT_data_total_milk_iso3_2021.csv \
		$(data_dir)/faostats_processed/FAOSTAT_data_total_milk_iso3_2021.shp;

calculate_aggregation:
	gdal_calc.py --NoDataValue=0 --quiet --calc "(A!=-1.7e+308)*A+(B!=-1.7e+308)*B+(C!=-1.7e+308)*C" --format GTiff --type Float64 \
		-A $(data_dir)/pasture/6_Ct_2010_Aw.tif \
		-B $(data_dir)/pasture/6_Gt_2010_Aw.tif \
		-C $(data_dir)/pasture/6_Sh_2010_Aw.tif \
		--outfile $(data_dir)/pasture/6_Tm_2010_Aw.tif

#rasterise and calculate the tonnes of material
rasterize_and_calculate_commodities:
	mkdir -p $(data_dir)/rasterized
	mkdir -p $(data_dir)/processed_commodities
	gdal_rasterize -q -l FAOSTAT_data_hens_eggs_iso3_2021 -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/FAOSTAT_data_hens_eggs_iso3_2021.shp \
		$(data_dir)/rasterized/FAOSTAT_data_hens_eggs_iso3_2021.tif;
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0.0 \
		-A $(data_dir)/rasterized/FAOSTAT_data_hens_eggs_iso3_2021.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Ch_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/GLO_hens_eggs_2021_t.tif;
	gdal_rasterize -q -l FAOSTAT_data_cattle_raw_milk_iso3_2021 -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/FAOSTAT_data_cattle_raw_milk_iso3_2021.shp \
		$(data_dir)/rasterized/FAOSTAT_data_cattle_raw_milk_iso3_2021.tif;
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0.0 \
		-A $(data_dir)/rasterized/FAOSTAT_data_cattle_raw_milk_iso3_2021.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Ct_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/GLO_cattle_raw_milk_2021_t.tif;
	gdal_rasterize -q -l FAOSTAT_data_goat_raw_milk_iso3_2021 -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/FAOSTAT_data_goat_raw_milk_iso3_2021.shp \
		$(data_dir)/rasterized/FAOSTAT_data_goat_raw_milk_iso3_2021.tif;
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0.0 \
		-A $(data_dir)/rasterized/FAOSTAT_data_goat_raw_milk_iso3_2021.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Gt_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/GLO_goat_raw_milk_2021_t.tif;
	gdal_rasterize -q -l FAOSTAT_data_sheep_raw_milk_iso_2021 -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/FAOSTAT_data_sheep_raw_milk_iso_2021.shp \
		$(data_dir)/rasterized/FAOSTAT_data_sheep_raw_milk_iso_2021.tif;
	gdal_calc.py --quiet --calc "A*B" --format GTiff --type Float32 --NoDataValue 0.0 \
		-A $(data_dir)/rasterized/FAOSTAT_data_sheep_raw_milk_iso_2021.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Sh_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/GLO_sheep_raw_milk_2021_t.tif;

rasterize_and_calculate_total_milk:
	gdal_rasterize -q -l FAOSTAT_data_total_milk_iso3_2021 -a Value -tr 0.083333 0.083333 -a_nodata 0 \
		-te -180.0 -89.99928 179.99856 90.0 -ot Float32 -of GTiff \
		$(data_dir)/faostats_processed/FAOSTAT_data_total_milk_iso3_2021.shp \
		$(data_dir)/rasterized/FAOSTAT_data_total_milk_iso3_2021.tif;
	gdal_calc.py --NoDataValue=0 --quiet --calc "A*(B!=3.40282e+38)*B" --format GTiff --type Float64 \
		-A $(data_dir)/rasterized/FAOSTAT_data_total_milk_iso3_2021.tif --A_band 1 \
		-B $(data_dir)/pasture/6_Tm_2010_Aw.tif \
		--outfile $(data_dir)/processed_commodities/GLO_total_raw_milk_2021_t.tif;

upload_livestock_processed:
	aws s3 sync $(data_dir)/processed_commodities $(AWS_S3_BUCKET_URL)/processed/livestock_processed/

write_checksums:
	cd $(data_dir)/processed_commodities && sha256sum * > $(checksums_dir)/livestock_processed
