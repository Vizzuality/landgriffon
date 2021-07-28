

all: h3_grid_spam2010v2r0_global_prod

#######################################
# MapSPAM crop production 
# vvv

# <zipfile>:
# Download MapSPAM crop production
data/mapspam/spam2010v2r0_global_prod.geotiff.zip:
	mkdir -p data/mapspam
	wget -q -O $@ https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_prod.geotiff.zip

# <tiff_folder>: <zipfile>
# Unzip to folder
# Only extract the files ending in *_A.tif (all agricultural technology types together)
data/mapspam/spam2010v2r0_global_prod: data/mapspam/spam2010v2r0_global_prod.geotiff.zip
	mkdir -p $@
	unzip -u $< *_A.tif -d $@

# <table>: <tiff_folder>
# Convert the tiffs in the folder to h3indexes at resolution 6 
# and import to a table called "h3_grid_spam2017v2r0_global_prod"
h3_grid_spam2010v2r0_global_prod: data/mapspam/spam2010v2r0_global_prod
	python tiff_folder_to_h3_table.py $< $@ --h3-res=6

# ^^^
#######################################

clean:
	rm -rf data/*