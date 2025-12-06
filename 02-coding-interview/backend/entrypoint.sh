#!/bin/sh
# Entrypoint script for Railway deployment
# Use uvicorn directly for better environment variable handling

PORT=${PORT:-8000}
exec uv run uvicorn main:app --host 0.0.0.0 --port "$PORT"
