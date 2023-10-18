# Data Processing and Analysis

This repository contains scripts and workflows for processing greenhouse gas (GHG) emissions from farm data related to agricultural commodities and livestock. The data is sourced from various datasets and stored in Amazon S3 buckets. The repository provides tools to download, process, and upload the data to the specified S3 bucket.

## Prerequisites

Before running the scripts, ensure you have the following dependencies installed:

- Python
- GDAL
- AWS CLI

## Directory Structure

- `data/`: Directory to store processed data files.
- `make_aggregates_list.py`: Python script for aggregating GHG emissions data.
- `preprocess_faostats.py`: Python script for preprocessing FAOSTAT data.
- `checksums_dir/`: Directory to store checksum files for data integrity verification.

## Configuration

- `checksums_dir`: Path to the directory where checksum files are stored.
- `data_dir`: Path to the directory where processed data is stored.
- `AWS_S3_BUCKET_URL`: URL of the Amazon S3 bucket where data is uploaded.
- `AWS_ACCESS_KEY_ID`: AWS access key ID for authentication.
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key for authentication.

## Usage

### Download and Aggregate GHG Emissions Data

#### Download GHG Data
```bash
make download_ghg_data
```
This command downloads GHG emissions data from the specified S3 bucket and stores it in the `data/` directory.

#### Aggregate GHG Data

```bash
make compute_aggregated_ghg_data
```
This command processes the downloaded GHG data and generates aggregated data files.

#### Upload Aggregated GHG Data

```bash
make upload_aggregated_ghg_data
```
This command uploads the aggregated GHG data files to the specified S3 bucket.

#### Generate Checksums for GHG Data

```bash
make write_checksums
```
This command calculates checksums for the processed GHG data files and saves them in the `checksums_dir/` directory.

### Process Livestock GHG Emissions Data

#### Download Livestock GHG Data

```bash
make download_ghg_farm_livestock
```

This command downloads livestock GHG emissions data from the specified S3 bucket and preprocesses it.

#### Download FAOSTAT Production Data

```bash
make download_faostats_data_production
```

This command downloads FAOSTAT production data related to livestock from the specified S3 bucket and preprocesses it.

#### Preprocess FAOSTAT Data

```bash
make preprocess_faostats_data_production
```

This command preprocesses FAOSTAT data for specific agricultural commodities such as eggs and milk.

#### Rasterize and Calculate Emissions per Tonne

```bash
make upload_livestock_ghg_data
```

This command uploads processed livestock GHG data files to the specified S3 bucket.

####  Generate Checksums for Livestock GHG Data

```bash
make write_checksums_livestock
```

This command calculates checksums for the processed livestock GHG data files and saves them in the `checksums_dir/` directory.
