#!/bin/bash
set -e

DATABASES=(
  auth_db
  booking_db
  house_db
  notification_db
)

echo "Création des bases PostgreSQL..."

for db in "${DATABASES[@]}"; do
  echo "Création de la base : $db"

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE $db'
    WHERE NOT EXISTS (
      SELECT FROM pg_database WHERE datname = '$db'
    )\gexec

    GRANT ALL PRIVILEGES ON DATABASE $db TO $POSTGRES_USER;
EOSQL

done

echo "Bases créées avec succès."
