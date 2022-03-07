# Environment variables

This document covers the different [environment
variables](https://en.wikipedia.org/wiki/Environment_variable) supported by
Landgriffon and how these affect the behavior of the platform. These variables
are imported using [node-config](https://www.npmjs.com/package/config) through
[this file](https://github.com/Vizzuality/landgriffon/blob/044ea856536a868e68b786d841f6b73f1859d28b/api/config/custom-environment-variables.json)
for the API app.

* `GEOCODING_CACHE_ENABLED` (boolean): if the geocoding cache is enabled.
* `GEOCODING_TTL` (number): time, in seconds, to keep a geocoding response in cache. Defaults to one day. 
