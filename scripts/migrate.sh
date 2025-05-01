#!/bin/sh

# run migration sql scripts on database before we run
CONFIG_DIR="${BLUEBOOK_CONFIG_PATH:-/config}"
MIGRATE_DIR="${BLUEBOOK_MIGRATE_PATH:-/migrate}" # where the .sql migration files are
DATA_DIR="${BLUEBOOK_DATA_PATH:-/data}"

DB_ORIG="$DATA_DIR/db.db"
DB_NEW="$DATA_DIR/db.orig.db"

echo Migrating database using directory: $CONFIG_DIR
echo Migration directory: $MIGRATE_DIR
echo Original DB: $DB_ORIG
echo Migrated DB: $DB_NEW

echo Checking if database has been already migrated...

echo "select name from sqlite_master where type='table' and name='__diesel_schema_migrations'" >cmd
# echo ".tables" >cmd
MIG_TABLE="$(sqlite3 $DB_ORIG <cmd)"

if [[ -z $MIG_TABLE ]]; then
  echo Database requires migration...
  echo Creating database copy to migrate from...

  mv $DB_ORIG $DB_NEW

  echo Preparing migration scripts
  sed "s|DATABASE_FILE|$DB_ORIG|" $MIGRATE_DIR/weekly_info.sql >wi.sql

  echo Applying migration scripts to the database...

  # run sql migration scripts to copy data
  # sqlite3 $DB_ORIG <$MIGRATE_DIR/weekly_info.sql
  # sqlite3 $DB_ORIG <$MIGRATE_DIR/daydata.sql
  # sqlite3 $DB_ORIG <$MIGRATE_DIR/hockey.sql
  # sqlite3 $DB_ORIG <$MIGRATE_DIR/settings.sql
  # sqlite3 $DB_ORIG <$MIGRATE_DIR/auv.sql

  echo Migrations Applied!
else
  echo Migration Already Done
fi
