# Database [PostgreSQL](https://www.postgresql.org/) <!-- omit from toc -->

- [1. System dependencies](#1-system-dependencies)
- [2. Configure environment variables](#2-configure-environment-variables)
- [3. Start the container](#3-start-the-container)
	- [3.1. Configure environment variables](#31-configure-environment-variables)
	- [3.2. Start the service](#32-start-the-service)

---

The database used in LandGriffon is [PostgreSQL](https://www.postgresql.org/).

To setup it properly first you have to configure some environment variables and then start the [PostgreSQL](https://www.postgresql.org/)
container.

## 1. System dependencies

- [Docker](https://www.docker.com/): used to start [PostgreSQL](https://www.postgresql.org/) so that it does not need to
be installed in the host.

## 2. Configure environment variables

You need to setup some environment variables before starting [PostgreSQL](https://www.postgresql.org/). Using docker
compose and the docker-compose.yml file at the root of the repository, you can start it without manually set the
environment variables in the shell.

Environment variables needed and which service uses it is explained in the [`ENV_VARS.md`](../ENV_VARS.md) file.

## 3. Start the container

### 3.1. Configure environment variables

- `PG_H3_VERSION` Used to set a build argument of the same name (default: `3.7.2`).
- `API_POSTGRES_PORT` Used to set the **exported port** to connect to the database (default: `5432`)
- `API_POSTGRES_PASSWORD` (used to set `POSTGRES_PASSWORD` in the container)
- `API_POSTGRES_USERNAME` (used to set `POSTGRES_USER` in the container)
- `API_POSTGRES_DATABASE` (used to set `POSTGRES_DB` in the container)

### 3.2. Start the service

To start the database service just execute:

```sh
docker compose up postgresql
```

---

[**↩️ GO TO ROOT DOC**](../README.md)
