#!/bin/bash
set -e

docker-compose -f ./docker-compose.yml build
docker-compose -f ./docker-compose.yml run --rm landgriffon-seed-data "$@"
