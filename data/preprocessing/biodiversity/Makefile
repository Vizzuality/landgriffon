# Variables
data_dir=data
resampling_resolution="0.083333"
checksums_dir=../../../h3_data_importer/data_checksums
AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

# Targets
.PHONY: all download_forest_landscape_integrity_loss resample_forest_landscape_integrity_loss upload_results write_checksum

all: download_forest_landscape_integrity_loss resample_forest_landscape_integrity_loss upload_results write_checksum

download_forest_landscape_integrity_loss:
	mkdir -p $(data_dir)
	gsutil -m cp \
		"gs://landgriffon-gee-bucket/landscape_indicators_20230821/natural_crop_flii_loss_by_human_lu_50km_1000m.tif" \
		$(data_dir)

resample_forest_landscape_integrity_loss:
	rio warp \
		$(data_dir)/natural_crop_flii_loss_by_human_lu_50km_1000m.tif \
		$(data_dir)/natural_crop_flii_loss_by_human_lu_50km_10km.tif \
		--resampling average \
		--res $(resampling_resolution) \
		--overwrite

upload_results:
	aws s3 cp $(data_dir)/natural_crop_flii_loss_by_human_lu_50km_10km.tif ${AWS_S3_BUCKET_URL}/processed/biodiversity/

write_checksum:
	cd $(data_dir) && sha256sum natural_crop_flii_loss_by_human_lu_50km_10km.tif > $(checksums_dir)/biodiversity
