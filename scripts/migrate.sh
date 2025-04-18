#!/bin/sh

# run migration sql scripts on database before we run
CONFIG_DIR="${BLUEBOOK_CONFIG_PATH:-/config}"
MIGRATE_DIR="${BLUEBOOK_MIGRATE_PATH:-/migrate}" # where the .sql migration files are
DATA_DIR="${BLUEBOOK_DATA_PATH:-/data}"

DB_ORIG="$DATA_DIR/db.db"
DB_NEW="$DATA_DIR/db.orig.db"

echo Migrating database using directory: $CONFIG_DIR
echo Migration directory: $MIGRATE_DIR

echo Checking if database has been already migrated...
