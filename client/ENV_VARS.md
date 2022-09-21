# Environment variables

This document covers the different [environment variables](https://en.wikipedia.org/wiki/Environment_variable) supported
by Landgriffon client application.

* `NEXT_PUBLIC_MAPBOX_API_TOKEN`: Mapbox API token for the frontend app.
* `NEXT_PUBLIC_API_URL`: URL including protocol of the api application.
* `NEXTAUTH_URL`: URL including protocol of the client application.
* `NEXTAUTH_SECRET`: Secret used for cryptographic operations in the client application. Generate using `openssl rand -base64 32`

* `CYPRESS_USERNAME`: email for login in the test tasks
* `CYPRESS_PASSWORD`: password for login in the test tasks
* `CYPRESS_API_URL`: URL including protocol of the api application, only for testing.
