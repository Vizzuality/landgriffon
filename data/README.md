# How to load seed data <!-- omit from toc -->

- [1. Run the seed data importer **natively**](#1-run-the-seed-data-importer-natively)
  - [System requirements](#system-requirements)
  - [Configure environment variables](#configure-environment-variables)
  - [Download dependencies](#download-dependencies)
  - [Execute the process](#execute-the-process)
- [2. Run the seed data importer in a **Docker container**](#2-run-the-seed-data-importer-in-a-docker-container)

---

To load seed data for the API, you can use the included `Makefile`. There are two ways to execute it:

## 1. Run the seed data importer **natively**

### System requirements

- [Python](https://www.python.org/)
- [Docker](https://www.docker.com/)

### Configure environment variables

> TODO: Explain:
>
> - what environment variables
> - templates with default values suitable for local development
> - where to get values for environment variables with _"real"_ credentials for external services (Geocoding, email, ...)
> - explain where the _real_ credentials are stored _per environment_ (staging, production, ...)

### Download dependencies

> TODO: Install the python dependencies (replace the usage of [`pip`](https://pypi.org/project/pip/) and
> `requirements.txt` with [`uv`](https://docs.astral.sh/uv/) and `pyproject.toml`)

### Execute the process

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

> **Note:** Ensure you have Docker and Docker Compose properly set up. Application dependencies will be automatically
> installed, and environment variables will be loaded from the `.env` file at the root of the project. Refer to the
> `env.default` file for an example of the required `.env` file.

Choose the method that best fits your setup and follow the instructions accordingly.

---

[**↩️ GO TO ROOT DOC**](../README.md)
