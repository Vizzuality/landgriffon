# Data Processing and Analysis <!-- omit from toc -->

- [1. Prerequisites](#1-prerequisites)
- [2. Directory Structure](#2-directory-structure)
- [3. Configuration](#3-configuration)
- [4. Usage](#4-usage)
  - [4.1. Download and Aggregate GHG Emissions Data](#41-download-and-aggregate-ghg-emissions-data)
    - [4.1.1. Download GHG Data](#411-download-ghg-data)
    - [4.1.2. Aggregate GHG Data](#412-aggregate-ghg-data)
    - [4.1.3. Upload Aggregated GHG Data](#413-upload-aggregated-ghg-data)
    - [4.1.4. Generate Checksums for GHG Data](#414-generate-checksums-for-ghg-data)
  - [4.2. Process Livestock GHG Emissions Data](#42-process-livestock-ghg-emissions-data)
    - [4.2.1. Download Livestock GHG Data](#421-download-livestock-ghg-data)
    - [4.2.2. Download FAOSTAT Production Data](#422-download-faostat-production-data)
    - [4.2.3. Preprocess FAOSTAT Data](#423-preprocess-faostat-data)
    - [4.2.4. Rasterize and Calculate Emissions per Tonne](#424-rasterize-and-calculate-emissions-per-tonne)
    - [4.2.5. Generate Checksums for Livestock GHG Data](#425-generate-checksums-for-livestock-ghg-data)

---

This repository contains scripts and workflows for processing greenhouse gas (GHG) emissions from farm data related to
agricultural commodities and livestock. The data is sourced from various datasets and stored in Amazon S3 buckets. The
repository provides tools to download, process, and upload the data to the specified S3 bucket.

## 1. Prerequisites

Before running the scripts, ensure you have the following dependencies installed:

- Python
- GDAL
- AWS CLI

## 2. Directory Structure

- `data/`: Directory to store processed data files.
- [`make_aggregates_list.py`](./make_aggregates_list.py): Python script for aggregating GHG emissions data.
- [`preprocess_faostats.py`](./preprocess_faostats.py): Python script for preprocessing FAOSTAT data.
- `checksums_dir/`: Directory to store checksum files for data integrity verification.

## 3. Configuration

- `checksums_dir`: Path to the directory where checksum files are stored.
- `data_dir`: Path to the directory where processed data is stored.
- `AWS_S3_BUCKET_URL`: URL of the Amazon S3 bucket where data is uploaded.
- `AWS_ACCESS_KEY_ID`: AWS access key ID for authentication.
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key for authentication.

## 4. Usage

### 4.1. Download and Aggregate GHG Emissions Data

#### 4.1.1. Download GHG Data

```bash
make download_ghg_data
```

This command downloads GHG emissions data from the specified S3 bucket and stores it in the `data/` directory.

#### 4.1.2. Aggregate GHG Data

```bash
make compute_aggregated_ghg_data
```

This command processes the downloaded GHG data and generates aggregated data files.

#### 4.1.3. Upload Aggregated GHG Data

```bash
make upload_aggregated_ghg_data
```

This command uploads the aggregated GHG data files to the specified S3 bucket.

#### 4.1.4. Generate Checksums for GHG Data

```bash
make write_checksums
```

This command calculates checksums for the processed GHG data files and saves them in the `checksums_dir/` directory.

### 4.2. Process Livestock GHG Emissions Data

#### 4.2.1. Download Livestock GHG Data

```bash
make download_ghg_farm_livestock
```

This command downloads livestock GHG emissions data from the specified S3 bucket and preprocesses it.

#### 4.2.2. Download FAOSTAT Production Data

```bash
make download_faostats_data_production
```

This command downloads FAOSTAT production data related to livestock from the specified S3 bucket and preprocesses it.

#### 4.2.3. Preprocess FAOSTAT Data

```bash
make preprocess_faostats_data_production
```

This command preprocesses FAOSTAT data for specific agricultural commodities such as eggs and milk.

#### 4.2.4. Rasterize and Calculate Emissions per Tonne

```bash
make upload_livestock_ghg_data
```

This command uploads processed livestock GHG data files to the specified S3 bucket.

#### 4.2.5. Generate Checksums for Livestock GHG Data

```bash
make write_checksums_livestock
```

This command calculates checksums for the processed livestock GHG data files and saves them in the `checksums_dir/` directory.

---

[**↩️ GO TO `data/preprocessing/` DOC**](../README.md)
