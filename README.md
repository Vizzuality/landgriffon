# LandGriffon <!-- omit from toc -->

[![Test Coverage](https://api.codeclimate.com/v1/badges/b46441bdb6b80f3b0094/test_coverage)](https://codeclimate.com/github/Vizzuality/landgriffon/test_coverage)

Homepage: [vizzuality.github.io/landgriffon](https://vizzuality.github.io/landgriffon/)

---

- [1. Project description](#1-project-description)
- [2. Architecture](#2-architecture)
- [3. Folder Structure](#3-folder-structure)
- [4. Environment variables](#4-environment-variables)
- [5. Services](#5-services)
	- [5.1. API Service](#51-api-service)
	- [5.2. Client Service](#52-client-service)
	- [5.3. Marketing site](#53-marketing-site)
	- [5.4. Tiler server (TiTiler)](#54-tiler-server-titiler)
	- [5.5. Database server (Postgresql)](#55-database-server-postgresql)
	- [5.6. Cache and Message Broker server (Redis)](#56-cache-and-message-broker-server-redis)
- [6. Utilities](#6-utilities)
	- [6.1. Data package](#61-data-package)
	- [6.2. Infrastructure package](#62-infrastructure-package)
- [7. Start Up](#7-start-up)
	- [7.1. System requirements](#71-system-requirements)
	- [7.2. Data initialization](#72-data-initialization)
	- [7.3. Configure environment variables](#73-configure-environment-variables)
	- [7.4. Starting all the services](#74-starting-all-the-services)
- [8. Development](#8-development)
- [9. Testing](#9-testing)
	- [9.1. Unit testing](#91-unit-testing)
	- [9.2. Integration testing](#92-integration-testing)
	- [9.3. API testing (backend)](#93-api-testing-backend)
	- [9.4. E2E testing (frontend)](#94-e2e-testing-frontend)
- [10. CI/CD and Deployment](#10-cicd-and-deployment)
	- [10.1. GitHub Actions](#101-github-actions)
	- [10.2. Terraform](#102-terraform)
- [11. Referenced documentation?](#11-referenced-documentation)
- [12. TODO: Documentation/application improvements](#12-todo-documentationapplication-improvements)

## 1. Project description

Deforestation and water stress have a negative impact on agricultural supply chains, preventing agribusiness and food
companies from becoming more sustainable. Advanced technology such as the Copernicus programme provides precise, timely
and easily accessible data that improve environmental management and mitigate climate change effects.

The EU-funded LAND GRIFFON project will develop digital decision-making instruments based on Copernicus data to observe,
prognoses, analyse and follow environmental impacts on the entire agricultural supply chain. These innovative
instruments will support agribusiness and food enterprises in becoming more sustainable and transparent.

**Related Information**:

- [Executive summary](https://bit.ly/3gIJq9n) with an overview of how LandGriffon functions.

## 2. Architecture

This repository is a monorepo that contains all the microservices of the LandGriffon platform, with each microservice
organized in a top-level folder.

All services are packaged as Docker images, ensuring consistency and ease of deployment. For local development, the
microservices are configured to run seamlessly using Docker Compose.

In CI, testing, staging and production environments, microservices are orchestrated via Kubernetes.

> TODO: Add a diagram showing how all components relate to each other.

## 3. Folder Structure

- `./` (**root**): Root folder with configuration, documentation, startup (Docker Compose) and environment variable files.
  - `.editorconfig`: defines consistent formatting rules for different file types.
  - `.gitignore`: excludes files from version control.
  - `.pre-commit-config.yaml`: configures pre-commit hooks to automate code quality checks and formatting before commits.
  - `.python-version`: specifies the Python version to use for the LandGriffon project.
  - `CHANGELOG.md`: (TODO: outdated) track important changes made to LandGriffon over time.
  - `docker-compose.yml`: (TODO: improve) Docker Compose file to start all services in local environment.
  - `ENV_VARS.md`: Document explaining the environment variables needed by service in LandGriffon.
  - `env.default`: Template with placeholders and default values for the environment variables needed for the several
				  services of LandGriffon.
  - `LICENSE`: License file.
  - `Makefile`: Starting point for several processes. (deprecated?)
  - `README.md`: this document.
- `./.github/`: stores GitHub-specific configuration files for testing, publishing, building and deploying workflows.
Also contains a pull request template.
- `./api/`: contains the API service code.
- `./client/`: contains the client (frontend) service code.
- `./cookie-traceability/`: (TODO: deprecated? remove?)
- `./data/`: contains the data and scripts needed to initialize the database.
- `./database/`: contains a `Dockerfile` to build a custom Postgresql image.
- `./infrastructure/`: Terraform files for automatic cloud provisioning.
- `./landing/`: (TODO: deprecated? remove?)
- `./marketing/`: current static site for LandGriffon
- `./redis/`: contains a `Dockerfile` to build a custom Redis image.
- `./tiler/`: necessary files to start up a Tiler service with [TiTiler](https://developmentseed.org/titiler/) including
- a `Dockerfile`.

## 4. Environment variables

> TODO: Not all services are included in the [ENV_VARS.md](./ENV_VARS.md), only the API.

You can find all the environment variables needed for every service in the [ENV_VARS.md](./ENV_VARS.md) file.

## 5. Services

The services that make up LandGriffon are:

- API service ([Nest.js](https://nestjs.com/))
- Client service ([Next.js](https://nextjs.org/))
- Marketing site ([Next.js](https://nextjs.org/))
- Tiler server ([TiTiler](https://developmentseed.org/titiler/))
- Database server ([Postgresql](https://www.postgresql.org/))
- Cache and queue server ([Redis](https://redis.io/))

### 5.1. API Service

The API provides endpoints that the frontend utilizes to retrieve all necessary information and execute the calculations
essential for Landgriffon's proper functionality. It ensures seamless communication between the frontend and backend,
handling data processing, computations, and any required transformations to support the application's features effectively.

Its contents are in the `./api` folder.

More info in the [README.md](./api/README.md) file under the `./api` folder.

### 5.2. Client Service

Web frontend client for the API.

Its contents, including a Dockerfile, are in the `./client` folder.

More info in the [README.md](./client/README.md) file under the `./client` folder.

### 5.3. Marketing site

The marketing service serves as the current static site for LandGriffon.
The live marketing site can be accessed at [landgriffon.com](https://landgriffon.com/).

Its contents are in the `./marketing` folder.

In the [Methodology](https://landgriffon.com/methodology) section of the marketing site, you'll find two key documents:
one providing an overview of how LandGriffon works and another offering a detailed explanation of its features.

- [Executive summary](https://bit.ly/3gIJq9n) with an overview of how LandGriffon works.
- [Full methodology](https://bit.ly/3ONp1MJ) with an in-depth description of every feature.

More info in the specific [README.md](./marketing/README.md) file in the `./marketing` folder.

### 5.4. Tiler server (TiTiler)

Tiler service that uses [TiTiler](https://developmentseed.org/titiler/), _"a modern dynamic tile server built on top of
FastAPI and [Rasterio](https://rasterio.readthedocs.io/en/stable/)/[GDAL](https://gdal.org/en/stable/)"_.

Its contents, including a `Dockerfile`, are in the `./tiler` folder.

More info in the specific [README.md](./tiler/README.md) file in the `./tiler` folder.

### 5.5. Database server (Postgresql)

Database service containing the relational data needed for LandGriffon. It uses [PostgreSQL](https://www.postgresql.org/)
v14 with two additional plugins:

- [PostGIS](https://postgis.net/) v3.5.2
- [PostgreSQL bindings for H3](https://github.com/bytesandbrains/h3-pg) v3.7.2

The `Dockerfile` and the `entrypoint.sh` script are in the `./database` folder.

More information in this [link](./api/README.md#31-database-setup).

### 5.6. Cache and Message Broker server (Redis)

Redis serves as both a message broker and a caching mechanism for certain precomputed results. While caching can be
disabled through configuration environment variables, Redis is essential for message broker functionality and cannot be
turned off.

More information about the use cases where Redis is needed in LandGriffon are explained in the following
[README.md](./redis/README.md) file in the `./redis/` folder.

## 6. Utilities

### 6.1. Data package

This directory contains seed data and scripts required to import essential data into the database,
ensuring that the API has access to the necessary information for proper operation.
These scripts automate the data population process, facilitating a smooth setup and maintenance
of the database while supporting the API’s functionality.

Its contents are in the `./data` folder.

More information about the data process used in LandGriffon are explained in the following
[README.md](./data/README.md) file in the `./data/` folder.

### 6.2. Infrastructure package

The code related to setting up the cloud infrastructure is located in the `./infrastructure` folder.

This setup adheres to the principle of [Infrastructure as Code](https://en.wikipedia.org/wiki/Infrastructure_as_code)
(IaC), which allows for the management and provisioning of computing resources through machine-readable configuration
files. By using IaC, we ensure that our infrastructure is consistent, repeatable, and version-controlled.

We utilize [Terraform](https://www.terraform.io/), a powerful IaC tool, to define and provision our infrastructure on
[AWS](https://aws.amazon.com/). Terraform enables us to create, update, and manage AWS resources efficiently and
reliably, ensuring that our infrastructure is scalable and maintainable.

For more details on how to deploy and manage the infrastructure, please refer to the
[README.md](./infrastructure/README.md) file within the `./infrastructure` folder.

## 7. Start Up

To start the application for the first time you have to import some data into the database, starting just the database
and running the data seed process.

> TODO: review if this is the real way of working.

Once you already have the data imported, you just can start the whole system by running `docker compose up`.

### 7.1. System requirements

> TODO: Complete with more dependencies?

- [Python](https://www.python.org/)
- [Node.js](https://nodejs.org/en)
- [Docker](https://www.docker.com/)

### 7.2. Data initialization

In order to run the application, it first needs to start a database and ingest the needed data.
This is a time consuming process (a one time process for local development) that needs to be run separately, before
starting the application.

How to setup the database is explained in this [`README.md`](./database/README.md) file in the `./database/` folder.

Detailed process on how to import the data [`README.md`](./data/README.md) file under the `data/` folder.

### 7.3. Configure environment variables

> TODO: Explain:
>
> - [ ] what environment variables
> - [ ] templates with default values suitable for local development
> - [ ] where to get values for the different environment variables with _"real"_ credentials for external services
> (Geocoding, email, ...)
> - [ ] explain where the _real_ credentials are stored _per environment_ (staging, production, ...)
> - [ ] explain how the application uses the environment variables (maybe at service level in its corresponding
> `README.md` files)

### 7.4. Starting all the services

After all the previous steps you just start the whole application:

```sh
docker compose up
```

## 8. Development

> TODO: Explain the different possibilities to start specific services for development
> maybe with some environment variables we can tweak the ports exposed by the containers to be usable for debugging and
> hot reloading inside the container.

## 9. Testing

> TODO: Explain the different ways of testing.
>
> SUGGESTION: In a monorepo setup and using some monorepo utilities (Turborepo, Nx, ...) we can test all the services at
> the same time (frontend, backend, data?) with a single command from the root directory.

### 9.1. Unit testing

> TODO: Explain what unit testing is, how to do it in the backend, how to do it in the frontend.

### 9.2. Integration testing

> TODO: Explain what integration testing is, how to do it in the backend, how to do it in the frontend.

### 9.3. API testing (backend)

> TODO: Explain what integration testing is, how to do it.

### 9.4. E2E testing (frontend)

> TODO: Explain what unit testing is, how to do it. How to execute E2E testing from the root of the project.

## 10. CI/CD and Deployment

### 10.1. GitHub Actions

> TODO: Explain the main options taken for the CI/CD pipeline

### 10.2. Terraform

> TODO: Explain the main options taken for the deployment in the cloud:
>
> - [ ] AWS provider options.
> - [ ] GCP provider options.
> - [ ] GitHub Actions secrets.

## 11. Referenced documentation?

> TODO: links to other markdown documents?

## 12. TODO: Documentation/application improvements

- **Environment variables** needed for every service are, incomplete, outdated and dispersed over several files.
- **The process to setup the environment variables** for local development needs some clarification and a way to _"do it
without asking anyone"_ would be a nice thing to have. A template with default values, a guide on how to create a `.env`
file and a reference to LastPass for the sensible values (passwords, users, secrets...) should be enough.
- **Initial data setup** takes too much time so the possiblity to have a _"working relevant subset"_ of the data for
just the minimum local development would also be nice to have.
