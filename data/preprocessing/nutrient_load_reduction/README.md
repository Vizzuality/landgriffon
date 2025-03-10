# Data Processing Pipeline <!-- omit from toc -->

- [1. Prerequisites](#1-prerequisites)
  - [1.1. Data Download](#11-data-download)
  - [1.2. Python Dependencies](#12-python-dependencies)
  - [1.3. AWS Credentials](#13-aws-credentials)
- [2. Usage](#2-usage)
  - [2.1. Download and Unzip Data](#21-download-and-unzip-data)
  - [2.2. Preprocess Data](#22-preprocess-data)
  - [2.3. Upload Process Data](#23-upload-process-data)
  - [2.4. Generate Checksum](#24-generate-checksum)
- [3. Configuration](#3-configuration)

---

This repository contains a data processing pipeline implemented using a Makefile and Python script to download,
preprocess, upload, and generate checksums for data files. The pipeline is designed to work with geospatial data
related to nutrient load reduction.

## 1. Prerequisites

Before running the pipeline, ensure you have the following prerequisites in place:

### 1.1. Data Download

You need to manually download the data from [here](https://figshare.com/articles/figure/DRP_NO3_TN_TP_rasters/14527638/1?file=31154728)
and save it in the `data/` directory.

### 1.2. Python Dependencies

The preprocessing script requires Python and the following Python packages:

- `geopandas`
- Other dependencies as specified in your [`process_data.py`](./process_data.py) script.

### 1.3. AWS Credentials

To upload results to an AWS S3 bucket, you should have AWS credentials configured on your machine.

## 2. Usage

### 2.1. Download and Unzip Data

Use the following command to download and unzip the data:

```bash
make unzip-limiting-nutrient
```

This command will download the data and place it in the data/ directory.

### 2.2. Preprocess Data

Before ingesting the data into your database, preprocess it using the Python script. Run the following command:

``` bash
make process-limiting-nutrients
```

This command will execute the process_data.py script, which performs data preprocessing, including reprojection and
calculation of nutrient reduction percentages.

### 2.3. Upload Process Data

To upload the processed data to an AWS S3 bucket, use the following command:

```bash
make upload_results
```

Make sure you have AWS credentials configured to access the specified S3 bucket.

### 2.4. Generate Checksum

Generate a SHA-256 checksum for the processed data by running the following command:

```bash
make write_checksum
```

This command will calculate the checksum and save it in the data_checksums/ directory.

## 3. Configuration

You can configure the pipeline by modifying the variables at the top of the Makefile:

- `DATA_DIR`: Specify the directory where data files are stored.
- `checksums_dir`: Define the directory where checksum files will be saved.
- `AWS_S3_BUCKET_URL`: Set the AWS S3 bucket URL for uploading results.

Feel free to adapt this pipeline to suit your specific data processing needs and directory structure.

> **NOTE**: Make sure you have the necessary permissions and access to the data sources and AWS resources mentioned in this
`README.MD` before running the pipeline.

---

[**↩️ GO TO `data/preprocessing/` DOC**](../README.md)
