# Livestock data preprocessing <!-- omit from toc -->

- [1. Prerequisites](#1-prerequisites)
- [2. Directory Structure](#2-directory-structure)
- [3. Usage](#3-usage)
  - [3.1. Download Raw DatA](#31-download-raw-data)
  - [3.2. Preprocess FAO Livestock Data](#32-preprocess-fao-livestock-data)
  - [3.3. Calculate Aggregated Pasture Data](#33-calculate-aggregated-pasture-data)
  - [3.4. Rasterize and Calculate Processed Commodities](#34-rasterize-and-calculate-processed-commodities)
  - [3.5. Rasterize and Calculate Total Milk Data](#35-rasterize-and-calculate-total-milk-data)
  - [3.6. Upload Processed Data to S3](#36-upload-processed-data-to-s3)
  - [3.7. Generate Checksums](#37-generate-checksums)

---

This repository contains code for processing and aggregating livestock-related data, including hens eggs, cattle,
buffalo, camel, goat, sheep, and total milk data. The processed data is stored in raster format and uploaded to an AWS
S3 bucket. Checksums of the processed data are also generated and saved for verification purposes.

## 1. Prerequisites

Before running the code, ensure you have the following prerequisites installed:

- Python
- GDAL
- AWS CLI

## 2. Directory Structure

- `data/`: Directory to store raw and processed data.
- [`Makefile`](./Makefile): Makefile containing targets for downloading, processing, and uploading data.
- `preprocess_faostats.py`: (TODO: outdated, it does not exist) Python script for preprocessing FAO livestock data.
- [`preprocess_faostats_ha_prod.py`](./preprocess_faostats_ha_prod.py): (TODO: add information)
- [`preprocess_faostats_stocks.py`](./preprocess_faostats_stocks.py): (TODO: add information)
- `README.md`: This file, providing an overview of the codebase and instructions.

## 3. Usage

### 3.1. Download Raw DatA

- Run `make download_pasture_data` to download pasture data.
- Run `make download_faostats_data` to download FAO livestock data from the specified S3 bucket.

### 3.2. Preprocess FAO Livestock Data

- Run `make preprocess_faostats_data` to preprocess FAO livestock data.
- This step involves converting raw CSV data to shapefiles.

### 3.3. Calculate Aggregated Pasture Data

- Run `make calculate_aggregation` to aggregate pasture data.
- Aggregated data is stored in raster format.

### 3.4. Rasterize and Calculate Processed Commodities

- Run `make rasterize_and_calculate_commodities` to rasterize FAO livestock data and calculate tonnes of material.
- Processed data for hens eggs, cattle, goat, and sheep raw milk is stored in raster format.

### 3.5. Rasterize and Calculate Total Milk Data

- Run `make rasterize_and_calculate_total_milk` to rasterize total milk data and calculate aggregated values.
- Processed total milk data is stored in raster format.

### 3.6. Upload Processed Data to S3

- Run `make upload_livestock_processed` to upload processed data to the specified AWS S3 bucket.

### 3.7. Generate Checksums

- Run `make write_checksums` to generate checksums of the processed data files
- Checksums are saved in the data_checksums directory.

---

[**↩️ GO TO `data/preprocessing/` DOC**](../README.md)
