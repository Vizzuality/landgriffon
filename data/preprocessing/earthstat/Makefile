checksums_dir=../../../h3_data_importer/data_checksums
resampling_resolution="0.083333"

AWS_S3_BUCKET_URL=s3://landgriffon-raw-data

include ../../../.env

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY

.PHONY: all download_grassnes extract_grassnes_rasters resample_grassnes upload_results write_checksum

all: clean download extract resample aggregate upload_results write_checksum

download:
	for url in `cat urls.txt`; do \
		wget -P data/ $$url; \
	done

extract:
	bash extract.sh

resample:
	mkdir -p data/harvest data/production
	bash resample.sh

aggregate:
	python aggregate.py data/harvest harvest
	python aggregate.py data/production production

upload_results:
	aws s3 sync data ${AWS_S3_BUCKET_URL}/processed/earthstat/

write_checksum:
	cd data && sha256sum harvest/* > $(checksums_dir)/earthstat
	cd data && sha256sum production/* >> $(checksums_dir)/earthstat

clean:
	rm -rf data/*
