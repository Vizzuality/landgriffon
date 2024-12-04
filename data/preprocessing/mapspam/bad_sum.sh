gdal_calc.py  --calc "A+B+C+D+E+F+G" --hideNoData --NoDataValue 0 \
                -A spam2020_v1r0_global_P_OILP_A.tif \
                -B spam2020_v1r0_global_P_SOYB_A.tif \
                -C spam2020_v1r0_global_P_GROU_A.tif \
                -D spam2020_v1r0_global_P_OOIL_A.tif \
                -E spam2020_v1r0_global_P_SUNF_A.tif \
                -F spam2020_v1r0_global_P_CNUT_A.tif \
                -G spam2020_v1r0_global_P_RAPE_A.tif \
                --outfile test.tif
