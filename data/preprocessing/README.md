# Preprocess datasets for h3_data_importer

This module is the house of all the preprocessing pipelines. Here you can find all what is needed to create the datasets that will be
ingested by h3_data_importer. The idea is to divorce the data ingestion from the data preprocessing. This way we can have a more quick and
efficient data ingestion process. The processed results should be stored in S3 bucked.

## Usage

Create/update the desired dataset by running the corresponding pipeline (should be well documented in the README.md file of each pipeline).

Compute the `sha256sum` of the resulting files and update update/create a file with the dataset name in h3_data_importer/data_checksums/\<dataset_name>. If adding a new dataset, you will need to also add some new make targets in h3_data_importer/Makefile for downloading and ingesting the new dataset. Please follow the same pattern as the other datasets in the Makefile: `download-<dataset_name>` and `ingest-<dataset_name>`. Use this approach to check the checksums of the downloaded files and to download the files from S3:

```make
WORKDIR_<DATASET_NAME> = data/<dataset_name>

download-<dataset_name>:
	mkdir -p $(WORKDIR_<DATASET_NAME>)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/<dataset_s3_path> $(WORKDIR_<DATASET_NAME>)
	cd $(WORKDIR_<DATASET_NAME>) && sha256sum --check ../../$(CHECKSUMS_PATH)/<dataset_name>
```
All this is so that we can check that we are ingesting the wanted dataset version. If the sha256sum of the downloaded files does not match the one in the checksums file, the ingestion will fail. This way we always maintain a relation between the ingested data and the processed data. *Also, this means that is responsibility of the person updating the data to also **update the checksums file!***.


## Pipelines

The folders are home of each dataset preprocessing pipeline. Each folder should have a README.md file with the instructions to run the pipeline and the
all the footguns around.
Nowadays we have the following pipelines:

### Deforestation

It contains the computation of deforestation from the hansen dataset and the forest green house gas emission due to land use change (linked to deforestation).

To run the pipeline, `cd deforestation` and

```bash
make all
```

Read more about this pipeline in the [deforestation/README.md](deforestation/README.md) file.

### Mapspam

It contains the computation of the mapspam datasets. Just `cd mapspam` and

```bash
make all
```

### Natural Crop Conversion

It contains the computation of natural land conversion from the ESRI dataset and the SBTN natural lands .

To run the pipeline, `cd natural_crop_conversion` and

```bash
make all
```

Read more about this pipeline in the [natural_crop_conversion/README.md](natural_crop_conversion/README.md) file.

### Biodiversity

It contains the computation of the biodiversity - forest landscape integrity loss dataset .

To run the pipeline, `cd biodiversity` and

```bash
make all
```

Read more about this pipeline in the [biodiversity/README.md](biodiversity/README.md) file.

### Farm GHG emissions
Aka Greenhouse gas emissions from farm production.

The preprocessing can be found in `farm_ghg/`. It is an R script made by Mike Harfoot.
