#!/bin/bash
set -e

COMPOSE_PROJECT_NAME="landgriffon"

docker compose -f ./docker-compose.yml --project-name ${COMPOSE_PROJECT_NAME} build
docker compose -f ./docker-compose.yml --project-name ${COMPOSE_PROJECT_NAME} run --rm landgriffon-seed-data "$@"
