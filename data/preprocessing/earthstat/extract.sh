#!/usr/bin/env bash

set -e

for file in data/*.zip; do
    filename=`basename $file .zip`;
    crop_type="${filename%%_*}"

    unzip -oj $file \
		"${filename}/${crop_type}_Production.tif" \
		"${filename}/${crop_type}_HarvestedAreaHectares.tif" \
		-d data/;

    rm $file;
done
