# Multi-stage build for Coding Interview Platform

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Runtime
FROM python:3.12-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy backend files
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install Python dependencies
WORKDIR /app/backend
RUN uv sync

# Expose port
EXPOSE 8000

# Copy and use entrypoint script
COPY backend/entrypoint.sh /app/backend/entrypoint.sh
RUN chmod +x /app/backend/entrypoint.sh

# Run the application using entrypoint script
CMD ["/app/backend/entrypoint.sh"]
