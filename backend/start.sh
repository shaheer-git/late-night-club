#!/bin/bash
set -e

echo "Running Database Migrations..."
alembic upgrade head

echo "Starting Celery Worker..."
celery -A app.tasks.celery worker --loglevel=info &

echo "Starting Celery Beat..."
celery -A app.tasks.celery beat --loglevel=info &

echo "Starting FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}