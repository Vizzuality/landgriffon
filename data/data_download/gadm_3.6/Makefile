
.PHONY: import

import: data/gadm/gadm36_levels0-2_simp.shp
#	PGPASSWORD=$$API_POSTGRES_PASSWORD \
	psql -d $$API_POSTGRES_DATABASE -h $$API_POSTGRES_HOST -p $$API_POSTGRES_PORT -U $$API_POSTGRES_USERNAME \
		-c 'DROP TABLE IF EXISTS gadm_levels0_2'

# load shapefile into new `gadm_levels0_2 table
#	ogr2ogr -makevalid -update -append \
		-nln gadm_levels0_2 -nlt PROMOTE_TO_MULTI -geomfield the_geom \
		-t_srs EPSG:4326 -a_srs EPSG:4326 --config OGR_TRUNCATE YES \
		-f PostgreSQL PG:"dbname=$$API_POSTGRES_DATABASE host=$$API_POSTGRES_HOST port=$$API_POSTGRES_PORT user=$$API_POSTGRES_USERNAME password=$$API_POSTGRES_PASSWORD" \
		data/gadm/gadm36_levels0-2_simp.shp
	
# create or update `admin region` and `geo region` entities
	PGPASSWORD=$$API_POSTGRES_PASSWORD \
	psql -d $$API_POSTGRES_DATABASE -h $$API_POSTGRES_HOST -p $$API_POSTGRES_PORT -U $$API_POSTGRES_USERNAME \
		-f populate_admin_regions.sql


data/gadm/gadm36_levels0-2_simp.shp: data/gadm/gadm36_0_simp.shp data/gadm/gadm36_1_simp.shp data/gadm/gadm36_2_simp.shp
	mapshaper -i data/gadm/gadm36_0_simp.shp data/gadm/gadm36_1_simp.shp data/gadm/gadm36_2_simp.shp snap combine-files \
		-each 'level = this.layer_name == "gadm36_0_simp" ? 0 \
				: this.layer_name == "gadm36_1_simp" ? 1 \
				: this.layer_name == "gadm36_2_simp" ? 2 \
				: null' \
		-each 'mpath = level == 0 ? GID_0 \
				: level == 1 ? GID_1 \
				: level == 2 ? GID_2 \
				: null' \
		-each 'name = level == 0 ? NAME_0 \
				: level == 1 ? NAME_1 \
				: level == 2 ? NAME_2 \
				: null' \
		-filter-fields mpath,name,level \
		-merge-layers force -o $@

data/gadm/gadm36_%_simp.shp: data/gadm/gadm36_%.shp
	mapshaper $< -simplify 10% -filter-islands min-vertices=3 -filter-slivers -clean -o $@ force


data/gadm/gadm36_0.shp data/gadm/gadm36_1.shp data/gadm/gadm36_2.shp: data/gadm/gadm36_levels_shp.zip
	unzip -u $< gadm36_0* gadm36_1* gadm36_2* -d data/gadm 

data/gadm/gadm36_levels_shp.zip: | data/gadm
	cd data/gadm && curl -O https://data.biogeo.ucdavis.edu/data/gadm3.6/gadm36_levels_shp.zip

data/gadm:
	mkdir -p $@

clean:
	rm -rf data/gadm/
