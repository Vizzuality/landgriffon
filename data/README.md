# How to load seed data <!-- omit from toc -->

- [1. Run the seed data importer **natively**](#1-run-the-seed-data-importer-natively)
  - [1.1. System requirements](#11-system-requirements)
  - [1.2. Configure environment variables](#12-configure-environment-variables)
  - [1.3. Download dependencies](#13-download-dependencies)
  - [1.4. Execute the process](#14-execute-the-process)
- [2. Run the seed data importer in a **Docker container**](#2-run-the-seed-data-importer-in-a-docker-container)
- [Documentation References to update/review](#documentation-references-to-updatereview)

---

> TODO: Improve the documentation of the whole process to understand what is doing at a high level.

To load seed data for the API, you can use the included `Makefile`. There are two ways to execute it:

## 1. Run the seed data importer **natively**

> TODO: Add some diagrams that explain at a high level the sequence and flow of execution of all the data transformation.

### 1.1. System requirements

- [Python](https://www.python.org/)
- [Docker](https://www.docker.com/)

### 1.2. Configure environment variables

> TODO: Explain:
>
> - what environment variables
> - templates with default values suitable for local development
> - where to get values for environment variables with _"real"_ credentials for external services (Geocoding, email, ...)
> - explain where the _real_ credentials are stored _per environment_ (staging, production, ...)

### 1.3. Download dependencies

> TODO: Install the python dependencies (replace the usage of [`pip`](https://pypi.org/project/pip/) and
> `requirements.txt` with [`uv`](https://docs.astral.sh/uv/) and `pyproject.toml`)

### 1.4. Execute the process

```sh
make seed-data
```

> **Note:** You need to manually set up dependencies such as `python` packages (see `requirements.txt`) and other system
> dependencies (see [`Dockerfile`](https://docs.docker.com/reference/dockerfile/)). Additionally, you must manually set
> several environment variables to connect to the [PostgreSQL](https://www.postgresql.org/) database that will host the data.

## 2. Run the seed data importer in a **Docker container**

```sh
./data.sh seed-data
```

> **Note:** Ensure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
> properly set up. Application dependencies will be automatically installed, and environment variables will be loaded
> from the `.env` file at the root of the project. Refer to the `env.default` file for an example of the required `.env`
> file.

Choose the method that best fits your setup and follow the instructions accordingly.

## Documentation References to update/review

- [`base_data_importer/README.md`](./base_data_importer/README.md)
- `data/`: (TODO: no documentation)
- [`gadm_importer/README.md`](./gadm_importer/README.md)
- [`h3_data_importer/README.md`](./h3_data_importer/README.md)
- `indicator_coefficient_importer/`: (TODO: no documentation)
- `notebooks/`: (TODO: no documentation)
- [`preprocessing/README.md`](./preprocessing/README.md)
- `test/`: (TODO: no documentation)

---

[**↩️ GO TO ROOT DOC**](../README.md)
