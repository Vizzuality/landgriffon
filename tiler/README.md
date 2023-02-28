# Landgriffon Tiler

Tiler is a FastAPI microservice for serving tiled maps.

## Environment Variables

Tiler requires the following environment variables to be set:

- `REQUIRE_AUTH`: (optional) set to `true` to enable authentication against the LandGriffon API (default is `false`)
- `API_HOST`: LandGriffon API host
- `API_PORT`: LandGriffon API port
- `S3_BUCKET_NAME`: the name of the S3 bucket where the tileset is stored
- `ROOT_PATH`: (optional) the root path where the microservice will be listening
- `TITILER_PREFIX`: (optional) the prefix for Tiler service API endpoints (default is `cog`)
- `TITILER_ROUTER_PREFIX`: (optional) the prefix for Tiler service router API endpoints (default is `cog`)


## API Documentation

Once the Tiler service is running, the API documentation can be accessed at `http://localhost/tiler/docs`.


## TODO

- Add more env vars that are required, for deployment and fine-tuning
- Add more tests (there is a basic pipeline set up with a couple of test)
- Investigate caching options to improve performance
- Custom handle TiTiler errors
