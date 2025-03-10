# Preprocess datasets for h3_data_importer <!-- omit from toc -->

- [1. Usage](#1-usage)
- [2. Pipelines](#2-pipelines)
  - [2.1. Deforestation](#21-deforestation)
  - [2.2. Mapspam](#22-mapspam)
  - [2.3. Natural Crop Conversion](#23-natural-crop-conversion)
  - [2.4. Biodiversity](#24-biodiversity)
  - [2.5. Farm GHG emissions](#25-farm-ghg-emissions)
  - [2.6. Livestock processed](#26-livestock-processed)
  - [2.7. Natural crop conversion](#27-natural-crop-conversion)
  - [2.8. Nutrient load reduction](#28-nutrient-load-reduction)
  - [2.9. Unsustainable water use](#29-unsustainable-water-use)

---

This module is the house of all the preprocessing pipelines. Here you can find all what is needed to create the datasets
that will be ingested by h3_data_importer. The idea is to divorce the data ingestion from the data preprocessing. This
way we can have a more quick and efficient data ingestion process. The processed results should be stored in S3 bucked.

## 1. Usage

Create/update the desired dataset by running the corresponding pipeline (should be well documented in the README.md file
of each pipeline).

Compute the `sha256sum` of the resulting files and update update/create a file with the dataset name in
`h3_data_importer/data_checksums/\<dataset_name>`. If adding a new dataset, you will need to also add some new make targets
in [`h3_data_importer/Makefile`](../h3_data_importer/Makefile) for downloading and ingesting the new dataset. Please
follow the same pattern as the other datasets in the Makefile: `download-<dataset_name>` and `ingest-<dataset_name>`.
Use this approach to check the checksums of the downloaded files and to download the files from S3:

```makefile
WORKDIR_<DATASET_NAME> = data/<dataset_name>

download-<dataset_name>:
	mkdir -p $(WORKDIR_<DATASET_NAME>)
	aws s3 sync $(AWS_S3_BUCKET_URL)/processed/<dataset_s3_path> $(WORKDIR_<DATASET_NAME>)
	cd $(WORKDIR_<DATASET_NAME>) && sha256sum --check ../../$(CHECKSUMS_PATH)/<dataset_name>
```

All this is so that we can check that we are ingesting the wanted dataset version. If the sha256sum of the downloaded
files does not match the one in the checksums file, the ingestion will fail. This way we always maintain a relation
between the ingested data and the processed data. *Also, this means that is responsibility of the person updating the
data to also **update the checksums file!***.

## 2. Pipelines

The folders are home of each dataset preprocessing pipeline. Each folder should have a `README.md` file with the
instructions to run the pipeline and the all the footguns around.
Nowadays we have the following pipelines:

### 2.1. Deforestation

It contains the computation of deforestation from the hansen dataset and the forest green house gas emission due to land
use change (linked to deforestation).

To run the pipeline:

```bash
cd deforestation
make all
```

Read more about this pipeline in the [`./deforestation/README.md`](./deforestation/README.md) file.

> TODO: The [`./deforestation/README.md`](./deforestation/README.md) file is empty.

### 2.2. Mapspam

It contains the computation of the mapspam datasets.

To run the pipeline:

```bash
cd mapspam
make all
```

> TODO: mapspam does not contain documentation.

### 2.3. Natural Crop Conversion

It contains the computation of natural land conversion from the ESRI dataset and the SBTN natural lands.

To run the pipeline:

```bash
cd natural_crop_conversion
make all
```

Read more about this pipeline in the [`./natural_crop_conversion/README.md`](./natural_crop_conversion/README.md) file.

> TODO: The [`./natural_crop_conversion/README.md`](./natural_crop_conversion/README.md) file is empty.

### 2.4. Biodiversity

It contains the computation of the biodiversity - forest landscape integrity loss dataset.

To run the pipeline:

```bash
cd biodiversity
make all
```

Read more about this pipeline in the [`./biodiversity/README.md`](./biodiversity/README.md) file.

### 2.5. Farm GHG emissions

Aka **Greenhouse gas emissions** from farm production.

The preprocessing can be found in [`./farm_ghg/`](./farm_ghg/). It is an R script made by Mike Harfoot.

Read more about this pipeline in the [`./farm_ghg/README.md`](./farm_ghg/README.md) file.

### 2.6. Livestock processed

This folder contains the preprocessing for the livestock preprocessed products (e.g. eggs, cattle, goat, sheep and total
milk).

The preprocessing can be found in [`livestock_processed/`](./livestock_processed/).

To run the pipeline:

```bash
cd livestock_processed
make all
```

Read more about this pipeline in the [`./livestock_processed/README.md`](./livestock_processed/README.md) file.

### 2.7. Natural crop conversion

> TODO: This seems duplicated with section [`2.3`](#23-natural-crop-conversion)

This folder contains the computation of the natural crop conversion dataset.

To run the pipeline:

```bash
cd natural_crop_conversion
make all
```

Read more about this pipeline in the [`./natural_crop_conversion/README.md`](./natural_crop_conversion/README.md) file.

> TODO: The [`./natural_crop_conversion/README.md`](./natural_crop_conversion/README.md) file is empty.

### 2.8. Nutrient load reduction

This folder contains the computation of the nutrient load reduction dataset.

To run the pipeline:

```bash
cd nutrient_load_reduction
make all
```

Read more about this pipeline in the [`./nutrient_load_reduction/README.md`](./nutrient_load_reduction/README.md) file.

### 2.9. Unsustainable water use

This folder contains the computation of the unsustainable water use dataset.

To run the pipeline:

```bash
cd unsustainable_water_use
make all
```

Read more about this pipeline in the [`./unsustainable_water_use/README.md`](./unsustainable_water_use/README.md) file.

---

[**↩️ GO TO `data/` DOC**](../README.md)
