data
==============================

# How to load seed data

Seed data for the API can be loaded using the included Makefile. You can execute it in one of two ways:

- To run the seed data importer natively, run `make seed-data`
- To run the seed data importer in a docker container, use the convenient `./data.sh seed-data` script.

When natively executing the import, you need to manually set up dependencies, like `python` packages (see `requirements.txt`) as well as other system dependencies (see `Dockerfile`). You also need to manually set several env vars to allow the application to connect to the Postgres database that will host the data.

If running using a docker container, application dependencies will be automatically installed for you (you do need to have docker and docker-compose properly set up) and env vars will be loaded from the `.env` file at the root of the project - see the `env.default` file for an example/skeleton of the `.env` file you'll need to have.
