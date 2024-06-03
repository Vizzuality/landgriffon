#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running api application in development mode"
        exec pnpm start
        ;;
    test)
        echo "Synchronizing database..."
        exec pnpm typeorm schema:sync
        echo "Running Tests"
        exec pnpm test
        ;;
    build)
        echo "Build api application"
        exec pnpm build
        ;;
    start:watch)
        echo "Synchronizing database..."
        exec pnpm typeorm schema:sync
        echo "Running api application in development mode with watch"
        exec pnpm start:watch
        ;;
    start:prod)
        echo "Synchronizing database..."
        pnpm start:prod
        ;;
    *)
        echo "Usage: service.sh {develop|test|build|start:watch|start:prod}" >&2
        exit 1
        ;;
esac
