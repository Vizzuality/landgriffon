PARALLELIZATION_FACTOR=12

WORKDIR_DEFORESTATION=data/hansen_loss
WORKDIR_DEFORESTATION_RESULTS=$(WORKDIR_DEFORESTATION)/results
WORKDIR_GHG=data/forest_ghg
WORKDIR_GHG_RESULTS=$(WORKDIR_GHG)/results
HANSEN_LOSSYEAR_URL = "https://storage.googleapis.com/earthenginepartners-hansen/GFC-2021-v1.9/lossyear.txt"
# Year to fiter the deforestation data from. format: YY, i.e. 16 and 21 for using only 2016 - 20XX deforestation data
# END_YEAR also depends on the dataset version used (check url above) it will be caped to the hansen dataset version.
HANSEN_START_YEAR = 16
HANSEN_END_YEAR = 21

.SILENT: transform-deforestation-file
download-deforestation-list:
	@echo "Downloading deforestation file list... "
	mkdir -p $(WORKDIR_DEFORESTATION)
	wget -q -O $(WORKDIR_DEFORESTATION)/Hansen_GFC_lossyear.txt $(HANSEN_LOSSYEAR_URL)

# Managed forest Mask from Lesiv(2022) - to be used with deforestation and forest ghg.
# data download from https://zenodo.org/record/5879022
# After downloading the mask layer, we will make use of it in the command transform
# deforestation file
download-managed-forests:
	@echo "Downloading managed forests file... "
	mkdir -p $(WORKDIR_DEFORESTATION)/Lesiv_2015_managed_forests
	wget -c -O $(WORKDIR_DEFORESTATION)/Lesiv_2015_managed_forests/managed_forests.tif "https://zenodo.org/record/5879022/files/FML_v3-2_with-colorbar.tif?download=1"

download-deforestation: download-deforestation-list | download-managed-forests
	@echo "Iterating deforestation files... "
	mkdir -p $(WORKDIR_DEFORESTATION)/Hansen_GFC_lossyear
	cat $(WORKDIR_DEFORESTATION)/Hansen_GFC_lossyear.txt | xargs -P $(PARALLELIZATION_FACTOR) -I {} /bin/bash -c 'make transform-deforestation-file FILE={}'

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
	mkdir -p "$(WORKDIR_DEFORESTATION)/tiles"; \
 	wget -q -O "$(WORKDIR_DEFORESTATION)/tiles/$${table_name}.tif" $(FILE); \
	# remove the final files if they exists \
	rm -f "$(WORKDIR_DEFORESTATION)/Hansen_GFC_lossyear/Loss_$${table_name}_10km.tif"; \
	rm -f "$(WORKDIR_DEFORESTATION)/$${mask_table_name}.tif"; \
	rio warp --resampling "nearest" "$${mask_path}" \
		-o "$(WORKDIR_DEFORESTATION)/$${mask_table_name}.tif" \
		--like "$(WORKDIR_DEFORESTATION)/tiles/$${table_name}.tif"; \
	gdal_calc.py --quiet --calc "((A>=$(HANSEN_START_YEAR)) & (A<=$(HANSEN_END_YEAR)))*(B<12)" \
		--format GTiff --co compress=DEFLATE --co tiled=YES --co BLOCKXSIZE=512 --co BLOCKYSIZE=512  --NoDataValue 0 --overwrite --extent=intersect \
		-A "$(WORKDIR_DEFORESTATION)/tiles/$${table_name}.tif" \
		-B "$(WORKDIR_DEFORESTATION)/$${mask_table_name}.tif" \
		--outfile  "$(WORKDIR_DEFORESTATION)/tiles/$${table_name}.tif"; \
	gdalwarp -q -s_srs EPSG:4326 -t_srs EPSG:4326 -r sum -tr 0.0833333333333286 0.0833333333333286 -multi -of GTiff  -ot UInt32 -wo NUM_THREADS=ALL_CPUS \
		"$(WORKDIR_DEFORESTATION)/tiles/$${table_name}.tif" \
		"$(WORKDIR_DEFORESTATION)/Hansen_GFC_lossyear/Loss_$${table_name}_10km.tif"; \
	# Calculate the % of area affected by deforestation (111111.11111109848 original pixels in a 0.0833333333333286 degrees pixel) \
	gdal_calc.py --quiet --calc "A/111111.11111109848" --format GTiff --type Float32 --NoDataValue 0.0 --overwrite \
		-A "$(WORKDIR_DEFORESTATION)/Hansen_GFC_lossyear/Loss_$${table_name}_10km.tif" \
		--outfile  "$(WORKDIR_DEFORESTATION)/Hansen_GFC_lossyear/Loss_$${table_name}_10km.tif"; \
	rm -f "$(WORKDIR_DEFORESTATION)/$${mask_table_name}_clip.tif"; \
	rm -f "$(WORKDIR_DEFORESTATION)/$${mask_table_name}.tif";
	@echo "Done transforming deforestation file $(FILE)"

preprocess-deforestation: download-deforestation
	@echo "Preprocessing deforestation data... "
	mkdir -p $(WORKDIR_DEFORESTATION_RESULTS)
	gdalbuildvrt $(WORKDIR_DEFORESTATION_RESULTS)/hansen_loss.vrt $(WORKDIR_DEFORESTATION)/Hansen_GFC_lossyear/*.tif
	gdal_translate -q -of GTiff -co NUM_THREADS=ALL_CPUS -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co BLOCKXSIZE=512 -co BLOCKYSIZE=512 \
		$(WORKDIR_DEFORESTATION_RESULTS)/hansen_loss.vrt \
		$(WORKDIR_DEFORESTATION_RESULTS)/hansen_loss_20$(HANSEN_END_YEAR).tif
	python rolling_average.py $(WORKDIR_DEFORESTATION_RESULTS)/hansen_loss_20$(HANSEN_END_YEAR).tif $(WORKDIR_DEFORESTATION_RESULTS)/hansen_loss_buffered_20$(HANSEN_END_YEAR).tif
	cd $(WORKDIR_DEFORESTATION_RESULTS) && sha256sum *.tif > checksums



download-process-forestGHG-list: preprocess-deforestation
	@echo "Downloading Forest Greenhouse Gas emission tiles list..."
	mkdir -p $(WORKDIR_GHG)
	mkdir -p $(WORKDIR_GHG)/resampled
	wget -q -O $(WORKDIR_GHG)/forest_ghg_sources_list.json https://services2.arcgis.com/g8WusZB13b9OegfU/arcgis/rest/services/Forest_greenhouse_gas_emissions/FeatureServer/0/query\?where\=1%3D1\&outFields\=\*\&outSR\=4326\&f\=json
	python download_and_preprocess_forestGHG.py --processes $(PARALLELIZATION_FACTOR) $(WORKDIR_GHG)/forest_ghg_sources_list.json $(WORKDIR_GHG) $(WORKDIR_DEFORESTATION)

preprocess-forestGHG: download-process-forestGHG-list
	mkdir -p $(WORKDIR_GHG)/resampled/merged_tiles
	gdalbuildvrt $(WORKDIR_GHG_RESULTS)/forest_GHG.vrt $(WORKDIR_GHG)/resampled/*.tif
	gdal_translate -q -of GTiff -co COMPRESS=DEFLATE -co PREDICTOR=3 -co BLOCKXSIZE=512 -co BLOCKYSIZE=512 \
		$(WORKDIR_GHG_RESULTS)/forest_GHG.vrt \
		$(WORKDIR_GHG_RESULTS)/forest_GHG_20$(HANSEN_END_YEAR).tif
	python rolling_average.py $(WORKDIR_GHG_RESULTS)/forest_GHG_20$(HANSEN_END_YEAR).tif $(WORKDIR_GHG_RESULTS)/forest_GHG_buffered_20$(HANSEN_END_YEAR).tif
	cd $(WORKDIR_GHG_RESULTS) && sha256sum *.tif > checksums

all: preprocess-forestGHG
	@echo "Done"
