#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running web application in development mode"
        exec yarn dev
        ;;
    test)
        echo "Running Tests"
        exec yarn test
        ;;
    build)
        echo "Build web application"
        exec yarn build
        ;;
    start:prod)
        echo "Run previously built application"
        exec yarn start
        ;;
    *)
        echo "Usage: entrypoint.sh {develop|test|build|start:prod}" >&2
        exit 1
        ;;
esac
