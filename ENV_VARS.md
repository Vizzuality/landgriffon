# Environment variables <!-- omit from toc -->

- [1. API (backend)](#1-api-backend)
 	- [1.1. Database](#11-database)
 	- [1.2. Geocoding cache config](#12-geocoding-cache-config)
 	- [1.3. Asynchronous task handling config (message broker)](#13-asynchronous-task-handling-config-message-broker)
- [2. Database (PostgreSQL)](#2-database-postgresql)
- [3. Message broker \& cache (Redis)](#3-message-broker--cache-redis)
- [4. Client (frontend)](#4-client-frontend)
- [5. Data processing (science)](#5-data-processing-science)
- [6. Tiler](#6-tiler)
- [7. Marketing](#7-marketing)

---

> TODO:
>
> - Make sure all this variables are up to date.
> - Indicate the type or possible values (boolean, number, integer, string, enumerated...)
> - Indicate a brief explanation of what they are for.
> - Indicate the default value, if any.
> - If it is a sensible value, it must be provided via [LastPass](https://www.lastpass.com/).

## 1. API (backend)

This document covers the different [environment variables](https://en.wikipedia.org/wiki/Environment_variable) supported
by LandGriffon and how these affect the behavior of the platform. These variables are imported using
[node-config](https://www.npmjs.com/package/config) through the
[custom-environment-variables.json](./api/config/custom-environment-variables.json) file for the API app.

> TODO:
>
> The following environment variables are used in the code but not documented.
>
> SERVER_PORT
> CLIENT_URL
> CLIENT_PORT
>
> REQUIRE_USER_AUTH
> REQUIRE_USER_ACCOUNT_ACTIVATION
> SIGN_UP_IS_PUBLIC
>
> JWT_EXPIRES_IN
> JWT_SECRET
> JWT_ACCOUNT_ACTIVATION_SECRET
> JWT_PASSWORD_RESET_SECRET
>
> PASSWORD_MIN_LENGTH
> PASSWORD_INCLUDE_NUMERICS
> PASSWORD_INCLUDE_UPPER_CASE
> PASSWORD_INCLUDE_SPECIAL_CHARACTERS
> PASSWORD_RESET_URL
>
> IMPORT_MISSING_DATA_FALLBACK_STRATEGY
>
> GEOCODING_CACHE_TTL
>
> TILER_HOST
> TILER_PORT
>
> FILE_SIZE_LIMIT
> FILE_STORAGE_PATH
>
> GMAPS_API_KEY
>
> DISTRIBUTED_MAP
>
> SENDGRID_API_KEY
>
> CARTO_API_KEY
> CARTO_BASE_URL
> EUDR_CREDENTIALS
> EUDR_DATASET
>
> FLAGS_USE_DISTRIBUTED_IMPACT
> NODE_ENV
> PORT

### 1.1. Database

- `DB_HOST` (string): hostname in which the database server can be reached.
- `DB_PORT` (number): port in which the database server can be reached.
- `DB_USERNAME` (string): username to use when connecting to the database.
- `DB_PASSWORD` (string): password to use when connecting to the database.
- `DB_DATABASE` (string): database name to use.
- `CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS` (number): when batch-saving data, determines how many records are saved per
operation. Defaults to `50`.
- `DB_DEBUG_LOGGING` (boolean): if the database debug logging should be enabled. Defaults to `false`.
- `DB_CACHE_ENABLED` (boolean): if the database cache is enabled. Defaults to `true`.
- `DB_CACHE_HOST` (string): hostname in which the Redis server can be reached.
- `DB_CACHE_PORT` (number): port in which the Redis server can be reached.
- `DB_CACHE_DATABASE` (number): Redis logical database number to be used for caching. Defaults to `3`.
- `DB_SLOW_QUERY_LOG_THRESHOLD` (number): Threshold, in milliseconds, past which a query will be logged as a `"slow query"`.
Defaults to `null`.

### 1.2. Geocoding cache config

- `GEOCODING_CACHE_ENABLED` (boolean): if the geocoding cache is enabled.
- `GEOCODING_CACHE_HOST` (string): hostname in which the Redis server can be reached.
- `GEOCODING_CACHE_PORT` (number): port in which the Redis server can be reached.
- `GEOCODING_CACHE_DATABASE` (number): Redis logical database number to be used for caching. Defaults to `2`.
- `GEOCODING_TTL` (number): time, in seconds, to keep a geocoding response in cache. Defaults to one day.

### 1.3. Asynchronous task handling config (message broker)

- `QUEUE_HOST` (string): hostname in which the Redis server can be reached.
- `QUEUE_PORT` (number): port in which the Redis server can be reached.
- `QUEUE_DATABASE` (number): Redis logical database number to be used for caching. Defaults to `1`.
- `IMPORT_QUEUE_NAME` (string): name of the Redis queue to use for data import related messages. Defaults to `"excel-import"`

## 2. Database (PostgreSQL)

> TODO: Complete the info for env vars for the database (backend)

- `API_POSTGRES_PORT` (number): Port where the database listens for connections (Default: `5432`)
- `API_POSTGRES_USERNAME` (string): User to access the databese
- `API_POSTGRES_PASSWORD` (string): Password to access the databese
- `API_POSTGRES_DATABASE` (string): Name of the database to access

See the `postgresql` service in the [`./docker-compose.yml`](./docker-compose.yml) file.

## 3. Message broker & cache (Redis)

> TODO: Complete the info for env vars for redis (backend)

- `API_REDIS_SERVICE_PORT` (number): Port for the Redis service (default: `6379`)

See the `redis` service in the [`./docker-compose.yml`](./docker-compose.yml) file.

## 4. Client (frontend)

> TODO: Add the info for env vars for the client (frontend)
>
> Use [`env.mjs`](./client/src/env.mjs) to document the environment variables?

See [`README.md`](./client/README.md#12-environmental-variables) for the client app.
See [`env.mjs`](./client/src/env.mjs) to see how environment variables are used in configuring the application.

## 5. Data processing (science)

> TODO: Add the info for env vars for the data processing (science)

## 6. Tiler

> TODO: Add the info for env vars for the tiler (science? backend?)

## 7. Marketing

- `SENDGRID_API_KEY_CONTACT`: (string) (TODO: add information)
- `SENDGRID_API_KEY_SUBSCRIPTION`: (string) (TODO: add information)
- `NEXT_PUBLIC_GOOGLE_ANALYTICS`: (string) (TODO: add information)

See this [`README.md`](./marketing/README.md#3-environment-variables-required) file for the marketing site.

---

[**↩️ GO TO ROOT DOC**](./README.md)
