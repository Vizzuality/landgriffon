#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Synchronizing database..."
        exec yarn typeorm schema:sync
        echo "Running api application in development mode"
        exec yarn start
        ;;
    test)
        echo "Synchronizing database..."
        exec yarn typeorm schema:sync
        echo "Running Tests"
        exec yarn test
        ;;
    build)
        echo "Build api application"
        exec yarn build
        ;;
    start:watch)
        echo "Synchronizing database..."
        exec yarn typeorm schema:sync
        echo "Running api application in development mode with watch"
        exec yarn start:watch
        ;;
    start:prod)
        echo "Synchronizing database..."
        yarn start:prod
        ;;
    *)
        echo "Usage: service.sh {develop|test|build|start:watch|start:prod}" >&2
        exit 1
        ;;
esac
