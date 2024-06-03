#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running web application in development mode"
        exec pnpm dev
        ;;
    test)
        echo "Running Tests"
        exec pnpm cypress:run
        ;;
    build)
        echo "Build web application"
        exec pnpm build
        ;;
    start:prod)
        echo "Run previously built application"
        exec pnpm start
        ;;
    *)
        echo "Usage: entrypoint.sh {develop|test|build|start:prod}" >&2
        exit 1
        ;;
esac
