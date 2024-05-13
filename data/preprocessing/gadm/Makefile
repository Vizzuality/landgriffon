.PHONY: upload_results
SHELL := /bin/bash

WORKDIR=data

all: upload_results
	make clean-workdir

upload_results: checksum
	aws s3 cp $(WORKDIR)/geo_region.zip $(AWS_S3_BUCKET_URL)/processed/geo_region/
	#rm $(WORKDIR)/geo_region.zip $(WORKDIR)/geo_region.csv
	aws s3 sync --exclude="*" --include="gadm36_levels0-2_simp.*" $(WORKDIR) $(AWS_S3_BUCKET_URL)/processed/gadm


checksum: compress-geo_region
	@echo "Generating checksums..."
	cd $(WORKDIR) && sha256sum geo_region.zip > ../../../gadm_importer/data_checksums/geo_region.zip.sha256
	cd $(WORKDIR) && sha256sum gadm36_levels0-2_simp.* > ../../../gadm_importer/data_checksums/gadm36_levels0-2_simp.sha256


compress-geo_region: geo_region_table
	@echo "Compressing geo_region.csv..."
	zip -j $(WORKDIR)/geo_region.zip $(WORKDIR)/geo_region.csv

geo_region_table: combine-gadm-file
	python gadm_h3.py data/gadm36_levels0-2_simp.shp data/geo_region.csv


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
		-merge-layers force -o $(WORKDIR)/gadm36_levels0-2_simp.shp

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
	rm -rf $(WORKDIR)/*
