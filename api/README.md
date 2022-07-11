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

You also need to manually create a database prior to the first execution of this API, and both extensions above need to be enabled for said database.

Once that's in place, you can start the application, which will populate the database structure.

### Application setup

The API application uses Nodejs (see the `.nvmrc` file for the exact version) and Nest+ TypeORM. For dependency management, it uses `yarn`.

Start by installing all dependencies using `yarn`. You then have two options:

- Start the application in development mode by running `yarn start`
- Start the application in production mode by running `yarn build` followed by `yarn start:prod`

Configuration is done using [Config](https://www.npmjs.com/package/config) based on the `/config` folder. Be sure to set the correct values to match your database configuration.

On its initial execution, provided everything is configured correctly, the application will automatically connect to the database and create the necessary table structure.

You should now be able to reach the API on the configured port on your server

### Seed data

By default, the database for a new application has structure but no seed data. However, the application requires seed data for many of its operations. You need to import this data before using the API.

This seed data is managed inside the `/data` folder at the root of the project. Refer to its documentation for more info on how to import said data. 

### Creating user with cli

To create user via cli, use the following command `yarn nestjs-command create:user <email> <password>`
For more details use `yarn nestjs-command create:user --help`

## Configuration

- `IMPORT_MISSING_DATA_FALLBACK_STRATEGY`: When calculating impact data as part of a spreadsheet import, how to handle scenarios where a given material does not have impact data for a given year:
  - `error`: Fail the import process.
  - `fallback`: Use the impact data for the same material and most recent year.
  - `ignore`:  Do not calculate impact values for these material/year pairs.
- `PASSWORD_MIN_LENGTH` (number, optional, default 6): Minimal password length accepted by the api.
- `PASSWORD_INCLUDE_NUMERICS` (boolean, optional, default false): if `true`, password will be required to contain at least one digit. 
- `PASSWORD_INCLUDE_UPPER_CASE` (boolean, optional, default false): if `true`, password will be required to contain at least one upper case character.
- `PASSWORD_INCLUDE_SPECIAL_CHARACTERS` (boolean, optional, default false): if `true`, password will be required to contain at least one special character.
- `SIGN_UP_IS_PUBLIC` (boolean, optional, default true): if `true`, non-authenticated users will be able to sign up for a new account. Otherwise, new user accounts can only be created by existing users.
- `REQUIRE_USER_AUTH` (boolean, optional, default true): if `true`, most endpoints will require user authentication. `false` disables user authentication requirement on all endpoints. Using `false` is deprecated.
