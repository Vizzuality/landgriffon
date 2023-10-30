# Biodiversity Indicators
## Biodiversity Datasets Processing

This folder contains a set of Makefile targets to download, process and upload the Biodiversity - Forest Landscape Integrity Loss and Biodivertisy Integrity data. The data is downloaded from Google Cloud Storage (GCS), resampled and then uploaded to an Amazon Web Serice (AWS) S3 bucket.


## Prerequisites

Before running the pipeline, ensure you have the following prerequisites in place:

1. **Google Cloud SDK (gsutil)**: You'll need gsutil to download data from Google Cloud Storage. Make sure it's installed and authenticated.

2. **Rasterio (rio)**: You'll need rio (Rasterio) for resampling the raster data. Install it using pip if it's not already installed: `pip install rasterio`.

3. **Amazon Web Services (AWS) CLI**: You must have the AWS CLI installed and configured with the necessary permissions to upload data to your AWS S3 bucket.

## Usage

### 1. Download data

This target downloads the forest landscape integrity loss data from GCS and stores it in a specified data directory.

```
make download_forest_landscape_integrity_loss

```
```
make download_bii_loss
```

### 2. Resample biodiversity data

This target resamples the downloaded data to a different resolution using Rasterio. It takes the input file from the data directory, performs resampling, and overwrites the file in the data directory with the resampled version

```
make resample_forest_landscape_integrity_loss
```

```
make resample_bii_loss
```

### 3. Upload results

This target uploads the processed forest landscape integrity loss and biodiversity integrity data to an AWS S3 bucket. Make sure to set the `AWS_S3_BUCKET_URL` environment variable to the destination S3 bucket URL.

```
make upload_results
```

```
upload_bii_loss
```

### 4. Write checksums

This target generates a SHA256 checksum for the processed data and writes it to a file in the specified checksums directory.

```
make write_checksum
```
```
make write_bii_loss_checksum
```

`Note`: Make sure you have the necessary permissions and access to the data sources and AWS resources mentioned in this README before running the pipeline.
