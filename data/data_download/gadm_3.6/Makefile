.PHONY: import

import: data/gadm/gadm36_0_simp.shp data/gadm/gadm36_1_simp.shp data/gadm/gadm36_2_simp.shp
	ogr2ogr -makevalid -update -append --config OGR_TRUNCATE YES -nln gadm_admin0 -nlt PROMOTE_TO_MULTI -geomfield the_geom -t_srs EPSG:4326 -a_srs EPSG:4326 -f PostgreSQL PG:"dbname=$$API_POSTGRES_DATABASE  host='landgriffon-postgresql' port=5432 user=$$API_POSTGRES_USERNAME password=$$API_POSTGRES_PASSWORD" data/gadm/gadm36_0_simp.shp
	ogr2ogr -makevalid -update -append --config OGR_TRUNCATE YES -nln gadm_admin1 -nlt PROMOTE_TO_MULTI -geomfield the_geom -t_srs EPSG:4326 -a_srs EPSG:4326 -f PostgreSQL PG:"dbname=$$API_POSTGRES_DATABASE  host='landgriffon-postgresql' port=5432 user=$$API_POSTGRES_USERNAME password=$$API_POSTGRES_PASSWORD" data/gadm/gadm36_1_simp.shp
	ogr2ogr -makevalid -update -append --config OGR_TRUNCATE YES -nln gadm_admin2 -nlt PROMOTE_TO_MULTI -geomfield the_geom -t_srs EPSG:4326 -a_srs EPSG:4326 -f PostgreSQL PG:"dbname=$$API_POSTGRES_DATABASE  host='landgriffon-postgresql' port=5432 user=$$API_POSTGRES_USERNAME password=$$API_POSTGRES_PASSWORD" data/gadm/gadm36_2_simp.shp

data/gadm/gadm36_%_simp.shp: data/gadm/gadm36_%.shp
	mapshaper $< -simplify 10% -filter-islands min-vertices=3 -filter-slivers -clean -o $@ force


data/gadm/gadm36_0.shp data/gadm/gadm36_1.shp data/gadm/gadm36_2.shp: data/gadm/gadm36_levels_shp.zip
	unzip -u $< -d data/gadm

data/gadm/gadm36_levels_shp.zip: | data/gadm
	cd data/gadm && curl -O https://data.biogeo.ucdavis.edu/data/gadm3.6/gadm36_levels_shp.zip

data/gadm:
	mkdir -p $@

clean:
	rm -rf data/gadm/
