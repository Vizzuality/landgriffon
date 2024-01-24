#!/bin/bash
set -e

data_dir="data"
resampling_resolution="0.083333"

for file in $data_dir/*.tif; do
  filename=$(basename "$file")
  crop_type="${filename%%_*}"
  if [[ $file == *"HarvestedAreaHectares"* ]]; then
   harv_or_prod="harvest"
   unit="ha"
  elif [[ $file == *"Production"* ]]; then
   harv_or_prod="production"
   unit="t"
  fi
  outfile="earthstat_global_${crop_type}_${harv_or_prod}_${unit}.tif"
  echo "Resampling $file to $outfile"
  rio warp \
   $file \
   $data_dir/$harv_or_prod/"$outfile" \
   --resampling sum \
   --res $resampling_resolution \
   --src-nodata nan \
   --dst-nodata -1 \
   --co compress=deflate \
   --co predictor=3 \
   --overwrite
  rm "$file"
done
