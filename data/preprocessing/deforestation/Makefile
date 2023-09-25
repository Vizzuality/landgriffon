# Variables
data_dir=data
resampling_resolution="0.083333"
checksums_dir=../../../h3_data_importer/data_checksums
AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

# Targets
.PHONY: all download-deforestation-and-carbon resample_deforestation resample_carbon upload_results write_checksum

all: download-deforestation-and-carbon resample_deforestation resample_carbon upload_results write_checksum

download-deforestation-and-carbon:
	mkdir -p $(data_dir)
	gsutil -m cp \
		"gs://landgriffon-gee-bucket/landscape_indicators_20230821/deforest_carbon_by_human_lu_50km_1000m.tif" \
		"gs://landgriffon-gee-bucket/landscape_indicators_20230821/deforest_by_human_lu_50km_1000m.tif" \
		$(data_dir)

resample_deforestation:
	rio warp \
		$(data_dir)/deforest_by_human_lu_50km_1000m.tif \
		$(data_dir)/deforest_by_human_lu_50km_10km.tif \
		--resampling average \
		--res $(resampling_resolution) \
		--overwrite

resample_carbon:
	rio warp \
		$(data_dir)/deforest_carbon_by_human_lu_50km_1000m.tif \
		$(data_dir)/deforest_carbon_by_human_lu_50km_10km.tif \
		--resampling average \
		--res $(resampling_resolution) \
		--overwrite

upload_results:
	aws s3 cp $(data_dir)/deforest_by_human_lu_50km_10km.tif ${AWS_S3_BUCKET_URL}/processed/deforestation/
	aws s3 cp $(data_dir)/deforest_carbon_by_human_lu_50km_10km.tif ${AWS_S3_BUCKET_URL}/processed/forestGHG/

write_checksum:
	cd $(data_dir) && sha256sum deforest_by_human_lu_50km_10km.tif > $(checksums_dir)/deforestation
	cd $(data_dir) && sha256sum deforest_carbon_by_human_lu_50km_10km.tif > $(checksums_dir)/forestGHG
