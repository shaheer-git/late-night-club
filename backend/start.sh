#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running Database Migrations..."
# Apply the latest Alembic migrations to the remote database
alembic upgrade head

echo "Starting Celery Worker..."
# Run celery worker in the background
celery -A app.tasks.celery worker --loglevel=info &

echo "Starting Celery Beat (Scheduler)..."
# Run celery beat in the background
celery -A app.tasks.celery beat --loglevel=info &

echo "Starting FastAPI Server..."
# Run Uvicorn in the foreground (this keeps the container running)
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
