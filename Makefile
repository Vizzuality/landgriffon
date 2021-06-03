.PHONY: start

# Read values as needed from .env
# If using the same variables in recipes that need to use a dotenv file other
# than .env, remember to check that no values from .env are being used
# inadvertently.
ENVFILE := $(if $(environment), .env-test-e2e, .env)
CIENV := $(if $(filter $(environment), ci), -f docker-compose-test-e2e.ci.yml , -f docker-compose-test-e2e.local.yml)
API_DB_INSTANCE := $(if $(environment), test-e2e-postgresql-api, postgresql-api)
API_POSTGRES_USER := $(if $(filter $(environment), ci),${API_POSTGRES_USER},$(shell grep -e API_POSTGRES_USER ${ENVFILE} | sed 's/^.*=//'))
API_POSTGRES_DB := $(if $(filter $(environment), ci),${API_POSTGRES_DB},$(shell grep -e API_POSTGRES_DB ${ENVFILE} | sed 's/^.*=//'))

DOCKER_COMPOSE_FILE := $(if $(environment), -f docker-compose-test-e2e.yml $(CIENV), -f docker-compose.yml )
COMPOSE_PROJECT_NAME := "landgriffon"

## some color to give live to the outputs
RED :=\033[1;32m
NC :=\033[0m # No Color
# Start only API and Geoprocessing services
#
# Useful when developing on API components only, to avoid spinning up services
# which may not be needed.
test-commands:
	@echo $(ENVFILE)
	@echo $(DOCKER_COMPOSE_FILE)
	@echo $(CIENV)
	@echo $(API_POSTGRES_DB)
	@echo $(GEO_POSTGRES_USER)

# Starts the API application
start-api:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} up --build api

# Start all the services.
start:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} up --build api

stop:
	docker-compose $(DOCKER_COMPOSE_FILE) stop

# Stop all containers and remove the postgresql-api container and the named
# Docker volume used to persists PostgreSQL data
#
# The use of `-f` flags in the `docker-compose rm` and `docker volume rm`
# commands is to ignore errors if the container or volume being deleted
# don't actually exist.
#
# @debt We should ideally avoid hardcoding volume name so that
# any changes here or in `docker-compose.yml` will not get things out of sync.
# Or add a CI test that could catch this.
clean-slate: stop
	docker-compose $(DOCKER_COMPOSE_FILE) down --volumes --remove-orphans
	docker-compose $(DOCKER_COMPOSE_FILE) rm -f -v
	docker system prune --volumes -f

# Runs the test suite of the API application
test-api:
	@echo "$(RED)Running test suite:$(NC)"
	# start from clean slate, in case anything was left around from previous runs (mostly relevant locally, not in CI) and spin the instances (geoprocessing, api and the DBs)
	docker-compose $(DOCKER_COMPOSE_FILE) --project-name ${COMPOSE_PROJECT_NAME} up -d --build api
	docker-compose $(DOCKER_COMPOSE_FILE) --project-name ${COMPOSE_PROJECT_NAME} up -d --build api
	docker-compose $(DOCKER_COMPOSE_FILE) exec -T api ./entrypoint.sh test
	$(MAKE) clean-slate

# Runs all test suites
# This is meant to be an aggregator of smaller test run tasks
# For now, it just runs the API tests, but more will probably be added in the future.
test: test-api
