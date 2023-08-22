.DEFAULT_GOAL := seed-gadm-data
.PHONY: seed-gadm-data clean import_geo_and_admin_region import_gadm

seed-gadm-data: import_gadm import_geo_and_admin_region
	make clean

geo_region.zip:
	aws s3 sync s3://$(S3_BUCKET_NAME)/processed/geo_region .
	sha256sum --check data_checksums/geo_region.zip.sha256

geo_region.csv: geo_region.zip
	unzip -u geo_region.zip

import_geo_and_admin_region: geo_region.csv
	psql "dbname=$$API_POSTGRES_DATABASE host=$$API_POSTGRES_HOST port=$$API_POSTGRES_PORT user=$$API_POSTGRES_USERNAME password=$$API_POSTGRES_PASSWORD" \
		-f "./populate_geo_and_admin_regions.sql"

import_gadm: gadm36_levels0-2_simp.shp
	@echo "Importing GADM data to database..."
	# load shapefile into new `gadm_levels0_2 table
	ogr2ogr -makevalid -update -append \
		-nln gadm_levels0_2 -nlt PROMOTE_TO_MULTI -geomfield the_geom \
		-t_srs EPSG:4326 -a_srs EPSG:4326 --config OGR_TRUNCATE YES \
		-f PostgreSQL PG:"dbname=$$API_POSTGRES_DATABASE host=$$API_POSTGRES_HOST port=$$API_POSTGRES_PORT user=$$API_POSTGRES_USERNAME password=$$API_POSTGRES_PASSWORD" \
		gadm36_levels0-2_simp.shp

gadm36_levels0-2_simp.shp:
	aws s3 sync s3://$(S3_BUCKET_NAME)/processed/gadm .
	sha256sum --check data_checksums/gadm36_levels0-2_simp.sha256

clean:
	rm -f geo_region.zip geo_region.csv gadm36_levels0-2_simp.*


