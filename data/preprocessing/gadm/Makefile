.PHONY: geo_region_table combine-gadm-file

# results of data processing
DATADIR=data
# intermediate files
WORKDIR=data/tmp

all: checksum
	make clean-workdir

checksum: compress-geo_region
	@echo "Generating checksums..."
	cd $(DATADIR) && sha256sum geo_region.zip > geo_region.zip.sha256
	cd $(DATADIR) && sha256sum gadm36_levels0-2_simp.* > gadm36_levels0-2_simp.sha256

compress-geo_region: geo_region_table
	@echo "Compressing geo_region.csv..."
	zip -j $(DATADIR)/geo_region.zip $(DATADIR)/geo_region.csv

geo_region_table: combine-gadm-file
	@echo "Importing GADM data to database..."
	# load shapefile into `gadm_levels0_2 table
	ogr2ogr -makevalid -update -append \
		-nln gadm_levels0_2 -nlt PROMOTE_TO_MULTI -geomfield the_geom \
		-t_srs EPSG:4326 -a_srs EPSG:4326 --config OGR_TRUNCATE YES \
		-f PostgreSQL PG:"dbname=$$API_POSTGRES_DATABASE host=$$API_POSTGRES_HOST port=$$API_POSTGRES_PORT user=$$API_POSTGRES_USERNAME password=$$API_POSTGRES_PASSWORD" \
		$(DATADIR)/gadm36_levels0-2_simp.shp

	# create or update `geo region` entity table
	PGPASSWORD=$$API_POSTGRES_PASSWORD && \
	psql -d $$API_POSTGRES_DATABASE -h $$API_POSTGRES_HOST -p $$API_POSTGRES_PORT -U $$API_POSTGRES_USERNAME -f make_geo_region_table.sql

combine-gadm-file: gadm36_0_simp.shp gadm36_1_simp.shp gadm36_2_simp.shp
	@echo "Combining GADM files..."
	mapshaper -i $(WORKDIR)/gadm36_0_simp.shp $(WORKDIR)/gadm36_1_simp.shp $(WORKDIR)/gadm36_2_simp.shp snap combine-files \
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
		-each 'gid_0 = GID_0' \
		-filter-fields mpath,name,level,gid_0 \
		-merge-layers force -o $(DATADIR)/gadm36_levels0-2_simp.shp

gadm36_%_simp.shp: decompress-gadm
	@echo "Simplifying $@ ..."
	mapshaper $(WORKDIR)/gadm36_$*.shp -simplify 10% -filter-islands min-vertices=3 -filter-slivers -clean -o $(WORKDIR)/$@ force

decompress-gadm: download-gadm
	@echo "Decompressing GADM file..."
	unzip -u $(WORKDIR)/gadm36_levels_shp.zip gadm36_0* gadm36_1* gadm36_2* -d $(WORKDIR)
	rm $(WORKDIR)/gadm36_levels_shp.zip

download-gadm:
	@echo "Downloading GADM file..."
	mkdir -p $(WORKDIR)
	cd $(WORKDIR) && curl -O https://data.biogeo.ucdavis.edu/data/gadm3.6/gadm36_levels_shp.zip

clean-workdir:
	rm -rf $(WORKDIR)
