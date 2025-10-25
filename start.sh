#!/bin/bash

DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-appuser}

echo "Checking database availability..."
# Wait for 20 seconds for the database to be ready
for i in {1..20}; do
  pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER && DB_READY=true && break
  echo "Waiting for Postgres ($i/20)..."
  sleep 3
done

if [ "$DB_READY" = true ]; then
  echo "Database is ready. Running migrations..."
  python -c "from app.db import init_db; init_db()"
else
  echo "Postgres not reachable."
fi

echo "Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
