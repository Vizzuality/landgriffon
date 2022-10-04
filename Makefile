.PHONY: start

# Read values as needed from .env
# If using the same variables in recipes that need to use a dotenv file other
# than .env, remember to check that no values from .env are being used
# inadvertently.
ENVFILE := $(if $(environment),.env.$(environment),.env)
ifneq (,$(wildcard $(ENVFILE)))
    include $(ENVFILE)
    export
endif
COMPOSE_PROJECT_NAME := "landgriffon"

## some color to give live to the outputs
RED :=\033[1;32m
NC :=\033[0m # No Color

# Starts the API application
start-api:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} up --build api

# Starts the CLIENT application
start-client:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} up --build client

# Start all the services.
start:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} up --build

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
test-api: start setup-api-db run-api-tests
	@echo "$(RED)Running test suite:$(NC)"

# Runs all test suites
# This is meant to be an aggregator of smaller test run tasks
# For now, it just runs the API tests, but more will probably be added in the future.
test: test-api
