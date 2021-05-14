#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running Development Server"
        exec yarn start:dev
        ;;
    test)
        echo "Running Tests"
        exec yarn test
        ;;
    start:dev)
        echo "Running web application for develop"
        exec yarn start
        ;;
    start:prod)
        echo "Running web application for production"
        exec yarn start:prod
        ;;
    *)
        exec "$@"
esac
