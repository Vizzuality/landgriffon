checksums_dir=../../../h3_data_importer/data_checksums
data_dir=data
resampling_resolution="0.083333"

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data
GRASSNES_URL=https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Indvidual_Geotiff/grassnes_HarvAreaYield_Geotiff.zip

include ../../../.env

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY

.PHONY: all download_grassnes extract_grassnes_rasters resample_grassnes upload_results write_checksum

all: download_grassnes extract_grassnes_rasters resample_grassnes upload_results write_checksum

download_grassnes:
	wget $(GRASSNES_URL) -O data/grassnes_HarvAreaYield_Geotiff.zip

extract_grassnes_rasters:
	unzip -oj data/grassnes_HarvAreaYield_Geotiff.zip \
		grassnes_HarvAreaYield_Geotiff/grassnes_Production.tif \
		grassnes_HarvAreaYield_Geotiff/grassnes_HarvestedAreaHectares.tif \
		-d data/
	rm data/grassnes_HarvAreaYield_Geotiff.zip

resample_grassnes:
	rio warp \
		$(data_dir)/grassnes_Production.tif \
		$(data_dir)/grassnes_Production_10km.tif \
		--resampling sum \
		--res $(resampling_resolution) \
		--overwrite
	rio warp \
		$(data_dir)/grassnes_HarvestedAreaHectares.tif \
		$(data_dir)/grassnes_HarvestedAreaHectares_10km.tif \
		--resampling sum \
		--res $(resampling_resolution) \
		--overwrite

	rm $(data_dir)/grassnes_Production.tif
	rm $(data_dir)/grassnes_HarvestedAreaHectares.tif


upload_results:
	aws s3 cp $(data_dir)/grassnes_Production_10km.tif ${AWS_S3_BUCKET_URL}/processed/grassnes/
	aws s3 cp $(data_dir)/grassnes_HarvestedAreaHectares_10km.tif ${AWS_S3_BUCKET_URL}/processed/grassnes/

write_checksum:
	cd $(data_dir) && sha256sum * > $(checksums_dir)/grassnes
