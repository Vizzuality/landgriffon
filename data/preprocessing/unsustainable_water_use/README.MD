# Data Processing Pipeline README

This repository contains a data processing pipeline implemented using a Makefile and Python script to download, preprocess, upload, and generate checksums for data files. The pipeline is designed to work with geospatial data related to unsustainable water use indicator.

## Prerequisites

Before running the pipeline, ensure you have the following prerequisites in place:


1. **Python Dependencies**: The preprocessing script requires Python and the following Python packages:
   - `geopandas`
   - Other dependencies as specified in your `preprocess_data.py` script.

3. **AWS Credentials**: To upload results to an AWS S3 bucket, you should have AWS credentials configured on your machine.

## Usage

### 1. Download and Unzip Data

Use the following command to download and unzip the data:

```bash
make download-aqueduct
```
```bash
make extract-aqueduct
```
This command will download the data and place it in the data/ directory.

### 2. Preprocess Data

Before ingesting the data into your database, preprocess it using the Python script. Run the following command:

``` bash
make process-aqueduct
```
This command will execute the preprocess_data.py script, which performs data preprocessing, including reprojection and calculation of excess of water withdrawals.

### 3. Upload Process Data

To upload the processed data to an AWS S3 bucket, use the following command:

```bash
make upload_results
```
Make sure you have AWS credentials configured to access the specified S3 bucket.

### 4. Generate Checksum

Generate a SHA-256 checksum for the processed data by running the following command:

```bash
make write_checksum
```
This command will calculate the checksum and save it in the data_checksums/ directory.

## Configuration

You can configure the pipeline by modifying the variables at the top of the Makefile:

- `DATA_DIR`: Specify the directory where data files are stored.
- `checksums_dir`: Define the directory where checksum files will be saved.
- `AWS_S3_BUCKET_URL`: Set the AWS S3 bucket URL for uploading results.

Feel free to adapt this pipeline to suit your specific data processing needs and directory structure.

`Note`: Make sure you have the necessary permissions and access to the data sources and AWS resources mentioned in this README before running the pipeline.
