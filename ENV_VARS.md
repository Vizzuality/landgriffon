# Environment variables

This document covers the different [environment
variables](https://en.wikipedia.org/wiki/Environment_variable) supported by
Landgriffon and how these affect the behavior of the platform. These variables
are imported using [node-config](https://www.npmjs.com/package/config) through
[this file](https://github.com/Vizzuality/landgriffon/blob/044ea856536a868e68b786d841f6b73f1859d28b/api/config/custom-environment-variables.json)
for the API app.

### Database

* `DB_HOST` (string): hostname in which the database server can be reached.
* `DB_PORT` (number): port in which the database server can be reached.
* `DB_USERNAME` (string): username to use when connecting to the database.
* `DB_PASSWORD` (string): password to use when connecting to the database.
* `DB_DATABASE` (string): database name to use.
* `CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS` (number): when batch-saving data, determines how many records are saved per operation. Defaults to "50".
* `DB_DEBUG_LOGGING` (boolean): if the database debug logging should be enabled. Defaults to "false".
* `DB_CACHE_ENABLED` (boolean): if the database cache is enabled. Defaults to "true".
* `DB_CACHE_HOST` (string): hostname in which the Redis server can be reached.
* `DB_CACHE_PORT` (number): port in which the Redis server can be reached.
* `DB_CACHE_DATABASE` (number): Redis logical database number to be used for caching. Defaults to "3".
* `DB_SLOW_QUERY_LOG_THRESHOLD` (number): Threshold, in milliseconds, past which a query will be logged asa "slow query". Defaults to "null".


### Geocoding cache config

* `GEOCODING_CACHE_ENABLED` (boolean): if the geocoding cache is enabled.
* `GEOCODING_CACHE_HOST` (string): hostname in which the Redis server can be reached.
* `GEOCODING_CACHE_PORT` (number): port in which the Redis server can be reached.
* `GEOCODING_CACHE_DATABASE` (number): Redis logical database number to be used for caching. Defaults to "2".
* `GEOCODING_TTL` (number): time, in seconds, to keep a geocoding response in cache. Defaults to one day. 


### Asynchronous task handling config (message broker)

* `QUEUE_HOST` (string): hostname in which the Redis server can be reached.
* `QUEUE_PORT` (number): port in which the Redis server can be reached.
* `QUEUE_DATABASE` (number): Redis logical database number to be used for caching. Defaults to "1".
* `IMPORT_QUEUE_NAME` (string): name of the Redis queue to use for data import related messages. Defaults to "excel-import"
