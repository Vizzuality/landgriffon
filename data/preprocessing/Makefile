# DEFORESTATION
#text: https://storage.googleapis.com/earthenginepartners-hansen/GFC-2020-v1.8/lossyear.txt
download-deforestation-list:
	@echo "Downloading deforestation file list... "
	mkdir -p $(WORKDIR_DEFORESTATION)
	wget -q -O $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear.txt "https://storage.googleapis.com/earthenginepartners-hansen/GFC-2020-v1.8/lossyear.txt"

# Managed forest Mask from Lesiv(2022) - to be used with deforestation and forest ghg.
# data download from https://zenodo.org/record/5879022
# After downloading the mask layer, we will make use of it in the command transform
# deforestation file
download-managed-forests:
	@echo "Downloading managed forests file... "
	mkdir -p $(WORKDIR_DEFORESTATION)/Lesiv_2015_managed_forests
	wget -q -O $(WORKDIR_DEFORESTATION)/Lesiv_2015_managed_forests/managed_forests.tif "https://zenodo.org/record/5879022/files/FML_v3-2_with-colorbar.tif?download=1"

download-deforestation: download-deforestation-list | download-managed-forests
	@echo "Iterating deforestation files... "
	mkdir -p $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear
	cat $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear.txt | xargs -P $(PARALLELIZATION_FACTOR) -I {} /bin/bash -c 'make transform-deforestation-file FILE={}'

# table_name = 00N_000W
# mask_table_name = 00N_000W_mask
# 1st download the lost file
# 2nd remove the final file if it exists
# 3rd clip the mask to the extent of the deforestation file
# 4th gdal_warp to resample the mask to the same resolution of the deforestation file
# 5th gdal_calc to multiply the mask by the deforestation file and convert to pixel mask (5 years) for 2020 deforestation events
# the resampling sums the pixels then divide by the number of original pixels fit in
# 6th resampled pixel to get the % of area afected by deforestation
# 7th remove the mask files that are intermediate files.
transform-deforestation-file:
	@echo "Transforming deforestation file $(FILE) ... "
	table_name=`basename -s .tif $(FILE) | tr -d ' \t\n\r' | grep -oP "\d{2}[A-Z]_\d{3}[A-Z]"`; \
	mask_path="$(WORKDIR_DEFORESTATION)/Lesiv_2015_managed_forests/managed_forests.tif"; \
	mask_table_name="$${table_name}_mask"; \
 	wget -q -O "$(WORKDIR_DEFORESTATION)/$${table_name}.tif" $(FILE); \
	rm -f "$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif"; \
	rm -f "$(WORKDIR_DEFORESTATION)/$${mask_table_name}_clip.tif"; \
	rm -f "$(WORKDIR_DEFORESTATION)/$${mask_table_name}.tif"; \
	rio clip "$${mask_path}" "$(WORKDIR_DEFORESTATION)/$${mask_table_name}_clip.tif" \
		--like "$(WORKDIR_DEFORESTATION)/$${table_name}.tif"; \
	rio warp --resampling "nearest" --overwrite "$(WORKDIR_DEFORESTATION)/$${mask_table_name}_clip.tif" \
		-o "$(WORKDIR_DEFORESTATION)/$${mask_table_name}.tif" \
		--like "$(WORKDIR_DEFORESTATION)/$${table_name}.tif"; \
	gdal_calc.py --quiet --calc "(A>16)*(B<12)" \
		--format GTiff --co NBITS=1 --co compress=PACKBITS --co tiled=YES --co BLOCKXSIZE=400 --co BLOCKYSIZE=400  --NoDataValue 0 --overwrite --extent=intersect \
		-A "$(WORKDIR_DEFORESTATION)/$${table_name}.tif" \
		-B "$(WORKDIR_DEFORESTATION)/$${mask_table_name}.tif" \
		--outfile  "$(WORKDIR_DEFORESTATION)/$${table_name}.tif"; \
	gdalwarp -q -s_srs EPSG:4326 -t_srs EPSG:4326 -r sum -tr 0.0833333333333286 0.0833333333333286 -multi -of GTiff  -ot UInt32 -wo NUM_THREADS=ALL_CPUS \
		"$(WORKDIR_DEFORESTATION)/$${table_name}.tif" \
		"$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif"; \
	gdal_calc.py --quiet --calc "A/111111.11111109848" --format GTiff --type Float32 --NoDataValue 0.0 --overwrite \
		-A "$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif" \
		--outfile  "$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/Loss_$${table_name}_10km.tif"; \
	rm -f "$(WORKDIR_DEFORESTATION)/$${mask_table_name}_clip.tif"; \
	rm -f "$(WORKDIR_DEFORESTATION)/$${mask_table_name}.tif";
	@echo "Done transforming deforestation file $(FILE)"

preprocess-deforestation: download-deforestation
	@echo "Preprocessing deforestation data... "
	mkdir -p $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles
	gdalbuildvrt $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.vrt $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/*.tif
	gdal_translate -q -of GTiff -co NUM_THREADS=ALL_CPUS -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co ZLEVEL=9 -co BLOCKXSIZE=512 -co BLOCKYSIZE=512 \
		$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.vrt \
		$(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif
	python rolling_average.py $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha.tif $(WORKDIR_DEFORESTATION)/Hansen_GFC_2020_lossyear/merged_tiles/hansen_loss_2020_ha_buffered.tif


download-process-forestGHG-list:
	@echo "Downloading Forest Greenhouse Gas emission tiles list..."
	mkdir -p $(WORKDIR_GHG)
	mkdir -p $(WORKDIR_GHG)/resampled
	wget -q -O $(WORKDIR_GHG)/forest_ghg_sources_list.json https://services2.arcgis.com/g8WusZB13b9OegfU/arcgis/rest/services/Forest_greenhouse_gas_emissions/FeatureServer/0/query\?where\=1%3D1\&outFields\=\*\&outSR\=4326\&f\=json
	python download_and_preprocess_forestGHG.py --processes $(PARALLELIZATION_FACTOR) $(WORKDIR_GHG)/forest_ghg_sources_list.json $(WORKDIR_GHG) $(WORKDIR_DEFORESTATION)

preprocess-forestGHG: download-process-forestGHG-list
	mkdir -p $(WORKDIR_GHG)/resampled/merged_tiles
	gdalbuildvrt $(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020.vrt $(WORKDIR_GHG)/resampled/*.tif
	gdal_translate -q -of GTiff -co NUM_THREADS=ALL_CPUS -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=3 -co ZLEVEL=9 -co BLOCKXSIZE=512 -co BLOCKYSIZE=512 \
		$(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020.vrt \
		$(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020.tif
	python rolling_average.py $(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020.tif $(WORKDIR_GHG)/resampled/merged_tiles/forest_GHG_2020_buffered.tif
