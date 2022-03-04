



# Changelog

- Add Migration to create stored procedures required to calculate impacts based on ingested sourcing
  records
- Add new field in dotenv and docker-compose yaml to run the migration at init


- Add `IMPORT_MISSING_DATA_FALLBACK_STRATEGY` config option.
- Refactor relationship between `material` and `h3Data`
- Add optional filters to the impact map API endpoint (`originIds`, `supplierIds` and `materialIds`).
- Add optional resolution parameter to impact map API endpoint.
- Add Redis infrastructure and basic BullMQ config

## v0.1.0

2021-11-18

- Initial MVP demo version
