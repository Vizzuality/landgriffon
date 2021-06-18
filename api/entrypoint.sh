#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running web application in development mode"
        exec yarn start
        ;;
    test)
        echo "Running Tests"
        exec yarn test
        ;;
    start:watch)
        echo "Running web application in development mode with watch"
        exec yarn start:watch
        ;;
    start:prod)
        echo "Running web application in production mode"
        exec yarn start:prod
        ;;
    *)
        echo "Usage: service.sh {develop|test|start:watch|start:prod}" >&2
        exit 1
        ;;
esac
