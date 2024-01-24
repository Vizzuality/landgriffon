checksums_dir=../../../h3_data_importer/data_checksums
data_dir=data
resampling_resolution="0.083333"

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data
GRASSNES_URL=https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Indvidual_Geotiff/grassnes_HarvAreaYield_Geotiff.zip
CLOVER_URL=https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Indvidual_Geotiff/clover_HarvAreaYield_Geotiff.zip
MAIZEFOR_URL=https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Indvidual_Geotiff/maizefor_HarvAreaYield_Geotiff.zip
ALFA_URL=https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Indvidual_Geotiff/alfalfa_HarvAreaYield_Geotiff.zip
TRITICALE_URL=https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Indvidual_Geotiff/triticale_HarvAreaYield_Geotiff.zip

include ../../../.env

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY

.PHONY: all download_grassnes extract_grassnes_rasters resample_grassnes upload_results write_checksum

all: clean download extract resample upload_results write_checksum

download:
	wget $(GRASSNES_URL) -O data/grassnes_HarvAreaYield_Geotiff.zip
	wget $(CLOVER_URL) -O data/clover_HarvAreaYield_Geotiff.zip
	wget $(MAIZEFOR_URL) -O data/maizefor_HarvAreaYield_Geotiff.zip
	wget $(ALFA_URL) -O data/alfalfa_HarvAreaYield_Geotiff.zip
	wget $(TRITICALE_URL) -O data/triticale_HarvAreaYield_Geotiff.zip

extract:
	unzip -oj data/grassnes_HarvAreaYield_Geotiff.zip \
		grassnes_HarvAreaYield_Geotiff/grassnes_Production.tif \
		grassnes_HarvAreaYield_Geotiff/grassnes_HarvestedAreaHectares.tif \
		-d data/
	rm data/grassnes_HarvAreaYield_Geotiff.zip

	unzip -oj data/clover_HarvAreaYield_Geotiff.zip \
		clover_HarvAreaYield_Geotiff/clover_Production.tif \
		clover_HarvAreaYield_Geotiff/clover_HarvestedAreaHectares.tif \
		-d data/
	rm data/clover_HarvAreaYield_Geotiff.zip

	unzip -oj data/maizefor_HarvAreaYield_Geotiff.zip \
		maizefor_HarvAreaYield_Geotiff/maizefor_Production.tif \
		maizefor_HarvAreaYield_Geotiff/maizefor_HarvestedAreaHectares.tif \
		-d data/
	rm data/maizefor_HarvAreaYield_Geotiff.zip

	unzip -oj data/alfalfa_HarvAreaYield_Geotiff.zip \
		alfalfa_HarvAreaYield_Geotiff/alfalfa_Production.tif \
		alfalfa_HarvAreaYield_Geotiff/alfalfa_HarvestedAreaHectares.tif \
		-d data/
	rm data/alfalfa_HarvAreaYield_Geotiff.zip

	unzip -oj data/triticale_HarvAreaYield_Geotiff.zip \
		triticale_HarvAreaYield_Geotiff/triticale_Production.tif \
		triticale_HarvAreaYield_Geotiff/triticale_HarvestedAreaHectares.tif \
		-d data/
	rm data/triticale_HarvAreaYield_Geotiff.zip

resample:
	mkdir -p $(data_dir)/harvest $(data_dir)/production
	bash resample.sh

upload_results:
	aws s3 sync $(data_dir) ${AWS_S3_BUCKET_URL}/processed/earthstat/

write_checksum:
	cd $(data_dir) && sha256sum harvest/* > $(checksums_dir)/earthstat
	cd $(data_dir) && sha256sum production/* >> $(checksums_dir)/earthstat

clean:
	rm -rf $(data_dir)/*
