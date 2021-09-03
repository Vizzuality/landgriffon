

all: h3_grid_spam2010v2r0_global_prod h3_grid_earthstat2000_global_prod

#######################################
# MapSPAM crop production
# vvv

# <zipfile>:
# Download MapSPAM crop production
data/mapspam/spam2010v2r0_global_prod.geotiff.zip:
	mkdir -p data/mapspam
	wget -q -O $@ https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_prod.geotiff.zip

# Download earthstat crop production
data/earthstat/HarvestedAreaYield175Crops_Geotiff.zip:
	mkdir -p data/earthstat
	wget -q -O $@ https://s3.us-east-2.amazonaws.com/earthstatdata/HarvestedAreaYield175Crops_Geotiff.zip


# <tiff_folder>: <zipfile>
# Unzip to folder
# Only extract the files ending in *_A.tif (all agricultural technology types together)
data/mapspam/spam2010v2r0_global_prod: data/mapspam/spam2010v2r0_global_prod.geotiff.zip
	mkdir -p $@
	unzip -u $< *_A.tif -d $@


data/earthstat/earthstat2000_global_prod: data/earthstat/HarvestedAreaYield175Crops_Geotiff.zip
	mkdir -p $@
	unzip -j -o -u $< *_Production.tif -d data/earthstat/earthstat2000_global_prod
	for tiffile in data/earthstat/earthstat2000_global_prod/*.tif; do \
		table_name=`basename -s .tif "$$tiffile" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		output_file="data/earthstat/earthstat2000_global_prod/$${table_name}_noData.tif";\
		gdal_translate -a_nodata -9999 -of GTiff "$${tiffile}" "$${output_file}";\
		rm -f "$${tiffile}";\
	done

# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6
# and import to a table called "h3_grid_spam2017v2r0_global_prod"
h3_grid_spam2010v2r0_global_prod: data/mapspam/spam2010v2r0_global_prod
	python tiff_folder_to_h3_table.py $< $@ --h3-res=6

h3_grid_earthstat2000_global_prod: data/earthstat/earthstat2000_global_prod
	python tiff_folder_to_h3_table.py data/earthstat/earthstat2000_global_prod h3_grid_earthstat2000_global_prod --h3-res=6


# ^^^
#######################################

clean:
	rm -rf data/*
