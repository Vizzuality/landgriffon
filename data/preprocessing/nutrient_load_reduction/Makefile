checksums_dir=../../../../h3_data_importer/data_checksums
AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

.PHONY: unzip-limiting-nutrient process-limiting-nutrients zip-shapefile upload_results write_checksum

all: write_checksum

download-data:
	mkdir -p data/
	wget -q -O data/sbtn_son_water_v1_1_shp.zip https://zenodo.org/records/12702055/files/sbtn_son_water_v1_1_shp.zip

unzip-limiting-nutrient: download-data
	unzip -q -u data/sbtn_son_water_v1_1_shp.zip -d data/sbtn_son_water_v1_1_shp

process-limiting-nutrients: unzip-limiting-nutrient
	mkdir -p data/nutrient_load_reduction
	python process_data.py data/sbtn_son_water_v1_1_shp data/nutrient_load_reduction

zip-shapefile: process-limiting-nutrients
	zip -rj data/nutrient_load_reduction.zip data/nutrient_load_reduction/*

write_checksum: zip-shapefile
	cd data/nutrient_load_reduction && sha256sum nutrient_load_reduction.* > $(checksums_dir)/nutrient_load_reduction

# TODO: Upload resulting data manually!
