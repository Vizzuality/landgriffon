# Variables
data_dir=./data/
resampling_resolution="0.083333"
checksums_dir=../../../h3_data_importer/data_checksums
AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

# Targets
.PHONY: download-natural-crop-conversion resample_natural_crop_conversion upload_results write_checksum

all: download-natural-crop-conversion resample_natural_crop_conversion upload_results write_checksum

download-natural-crop-conversion:
	mkdir -p $(data_dir)
	gsutil -m cp \
		"gs://landgriffon-gee-bucket/deforestation/natural_crop_conversion_by_human_lu_2022_1000m.tif" \
		$(data_dir)

resample_natural_crop_conversion:
	rio warp \
		$(data_dir)/natural_crop_conversion_by_human_lu_2022_1000m.tif \
		$(data_dir)/natural_crop_conversion_by_human_lu_2022_10km.tif \
		--resampling average \
		--res $(resampling_resolution) \
		--overwrite

upload_results:
	aws s3 cp $(data_dir)/natural_crop_conversion_by_human_lu_2022_10km.tif ${AWS_S3_BUCKET_URL}/processed/natural_crop_conversion/

write_checksum:
	cd $(data_dir) && sha256sum natural_crop_conversion_by_human_lu_2022_10km.tif > $(checksums_dir)/natural_crop_conversion
