#!/bin/bash
set -e

echo "Starting worker process..."
echo "Worker PID: $$"
echo "Environment: ${NODE_ENV:-development}"

exec node worker.js
