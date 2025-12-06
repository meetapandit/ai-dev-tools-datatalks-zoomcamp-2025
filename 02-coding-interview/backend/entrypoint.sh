#!/bin/sh
# Entrypoint script for Railway deployment
# Uvicorn will read PORT from environment automatically

exec uv run uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
