#!/bin/sh
# Entrypoint script for Railway deployment
# This properly handles the PORT environment variable

PORT=${PORT:-8000}
exec uv run fastapi run main.py --host 0.0.0.0 --port "$PORT"
