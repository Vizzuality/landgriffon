checksums_dir=../../../h3_data_importer/data_checksums
data_dir=./data/

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data
export AWS_ACCESS_KEY_ID = $(DATA_S3_ACCESS_KEY)
export AWS_SECRET_ACCESS_KEY = $(DATA_S3_SECRET_KEY)

.PHONY: download_ghg_data compute_aggregated_ghg_data upload_aggregated_ghg_data write_checksums

all: upload_aggregated_ghg_data write_checksums

download_ghg_data:
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/ghg_emissions/ data/

compute_aggregated_ghg_data: download_ghg_data
	python make_aggregates_list.py $(data_dir)

upload_aggregated_ghg_data: compute_aggregated_ghg_data
	aws s3 sync data/ $(AWS_S3_BUCKET_URL)/processed/ghg_emissions/

write_checksums:
	cd $(data_dir) && sha256sum * > $(checksums_dir)/ghg_from_farm_emissions
