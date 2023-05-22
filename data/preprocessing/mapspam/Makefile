############################################
# MapSPAM crop production and harvest area #
############################################
WORKDIR_MAPSPAM=data

.SILENT: download-mapspam-crop-production download-mapspam-crop-harvest extract-mapspam-crop-production extract-mapspam-crop-harvest

# Download IS BROKEN
# ZIPs obtained from https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/PRFF8V
download-mapspam-crop-production:
	mkdir -p $(WORKDIR_MAPSPAM)
	wget -q -O $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod.geotiff.zip https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_prod.geotiff.zip

download-mapspam-crop-harvest:
	mkdir -p $(WORKDIR_MAPSPAM)
	wget -q -O $(WORKDIR_MAPSPAM)/spam2010v2r0_global_harv_area.geotiff.zip https://s3.amazonaws.com/mapspam/2010/v2.0/geotiff/spam2010v2r0_global_harv_area.geotiff.zip


# 1. Unzip to folder. Only extract the files ending in *_A.tif (all agricultural technology types together)
# 2. Calculate combination of crops
extract-mapspam-crop-production:
	mkdir -p $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod
	unzip -q -u $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod.geotiff.zip *_A.tif -d $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod
	gdal_calc.py --quiet --calc "A+B+C+D" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TEMF_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_GROU_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_BANA_A.tif \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TROF_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TemfGrouBanaTrof_A.tif
	gdal_calc.py --quiet --calc "A+B+C" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_ACOF_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TEAS_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_REST_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_AcofTeasRest_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D+E+F+G" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WHEA_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OCER_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_BARL_A.tif \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_MAIZ_A.tif \
		-E $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_RICE_A.tif \
		-F $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SORG_A.tif \
		-G $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SMIL_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WheaOcerBarlMaizRiceSorgSmil_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WHEA_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OCER_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_POTA_A.tif \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OPUL_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WheaOcerPotaOpul_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D+E+F+G+H+I" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SOYB_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_GROU_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_CNUT_A.tif \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OOIL_A.tif \
		-E $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_RAPE_A.tif \
		-F $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SUNF_A.tif \
		-G $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_REST_A.tif \
		-H $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OCER_A.tif \
		-I $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SUGB_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SoybGrouCnutOoilRapeSunfRestOcerSugb_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SUGC_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SUGB_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_SugcSugb_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OCER_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_WHEA_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_OcerWhea_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_VEGE_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TEMF_A.tif \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TROF_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_VegeTemfTrof_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TROF_A.tif \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TEMF_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_TrofTemf_A.tif
	# Compress all files since they come uncompressed
	for file in $(WORKDIR_MAPSPAM)/spam2010v2r0_global_prod/spam2010V2r0_global_P_*.tif; do \
		gdal_translate -co COMPRESS=DEFLATE -co PREDICTOR=3 $$file $$file.tmp.tif;\
		mv $$file.tmp.tif $$file;\
	done

extract-mapspam-crop-harvest:
	mkdir -p $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha
	unzip -q -u $(WORKDIR_MAPSPAM)/spam2010v2r0_global_harv_area.geotiff.zip *_A.tif -d $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha
	gdal_calc.py --quiet --calc="numpy.sum(A, axis=0)" --format Gtiff \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/*_A.tif \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_All_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TEMF_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_GROU_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_BANA_A.tif --C_band 1 \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TROF_A.tif --D_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TemfGrouBanaTrof_A.tif
	gdal_calc.py --quiet --calc "A+B+C" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_ACOF_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TEAS_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_REST_A.tif --C_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_AcofTeasRest_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D+E+F+G" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WHEA_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OCER_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_BARL_A.tif --C_band 1 \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_MAIZ_A.tif --D_band 1 \
		-E $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_RICE_A.tif --E_band 1 \
		-F $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SORG_A.tif --F_band 1 \
		-G $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SMIL_A.tif --G_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WheaOcerBarlMaizRiceSorgSmil_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WHEA_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OCER_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_POTA_A.tif --C_band 1 \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OPUL_A.tif --D_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WheaOcerPotaOpul_A.tif
	gdal_calc.py --quiet --calc "A+B+C+D+E+F+G+H+I" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SOYB_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_GROU_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_CNUT_A.tif --C_band 1 \
		-D $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OOIL_A.tif --D_band 1 \
		-E $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_RAPE_A.tif --E_band 1 \
		-F $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SUNF_A.tif --F_band 1 \
		-G $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_REST_A.tif --G_band 1 \
		-H $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OCER_A.tif --H_band 1 \
		-I $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SUGB_A.tif --I_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SoybGrouCnutOoilRapeSunfRestOcerSugb_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SUGC_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SUGB_A.tif --B_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_SugcSugb_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OCER_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_WHEA_A.tif --B_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_OcerWhea_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_VEGE_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TEMF_A.tif --B_band 1 \
		-C $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TROF_A.tif --C_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_VegeTemfTrof_A.tif
	gdal_calc.py --quiet --calc "A+B" --format GTiff --type Float32 \
		-A $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TROF_A.tif --A_band 1 \
		-B $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TEMF_A.tif --B_band 1 \
		--outfile $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_TrofTemf_A.tif
	for file in $(WORKDIR_MAPSPAM)/spam2010v2r0_global_ha/spam2010V2r0_global_H_*.tif; do \
		gdal_translate -co COMPRESS=DEFLATE -co PREDICTOR=3 $$file $$file.tmp.tif;\
		mv $$file.tmp.tif $$file;\
	done

all:
	make -j 2 extract-mapspam-crop-production extract-mapspam-crop-harvest
