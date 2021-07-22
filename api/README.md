# LandGriffon API

[![Test Coverage](https://api.codeclimate.com/v1/badges/b46441bdb6b80f3b0094/test_coverage)](https://codeclimate.com/github/Vizzuality/landgriffon/test_coverage)

## Dependencies

- [Node.js](https://nodejs.org/en/) v14.16 or greater
- [Nest](https://nestjs.com/) framework
- [PostgreSQL](https://www.postgresql.org/) v13.2 or greater
- [Postgis](https://postgis.net/) v3.1 or greater
- [PostgreSQL bindings for H3](https://github.com/bytesandbrains/h3-pg) v3.7.1 or greater

## Documentation

API documentation is done using [OpenAPI](https://swagger.io/docs/specification/about/) (formerly known as Swagger) and
is available through the `/swagger` endpoint.


## Installation

### Database setup

Besides vanilla PostgreSQL server, you'll need to install two PostgreSQL extensions:
- [Postgis](https://postgis.net/) v3.1
- [PostgreSQL bindings for H3](https://github.com/bytesandbrains/h3-pg) v3.7.1 or greater

Be sure to review the installation process for both these extensions and follow the respective steps prior to running the API application.
