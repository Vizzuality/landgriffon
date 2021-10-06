#!/bin/bash
set -em

docker-entrypoint.sh postgres &
[[ -n $POSTGRES_DB ]] && sleep 10s && pgxn --verbose load -U $POSTGRES_USER -d $POSTGRES_DB h3
fg
