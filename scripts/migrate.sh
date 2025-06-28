#!/bin/bash

# if we are given the build command
#   we are running in the container
#   update the /migration scripts to a replaceable db name
# otherwise
#   perform migrations

# run migration sql scripts on database before we run
MIGRATE_DIR="${BLUEBOOK_MIGRATE_PATH:-/migrate}" # where the .sql migration files are
DATA_DIR="${BLUEBOOK_DATA_PATH:-/data}"

SQL_FILES=("auv.sql" "daydata.sql" "hockey.sql" "settings.sql" "weekly_info.sql")

# database to migrate to is a DATA_DIR/db.db
# if it has a migration_check table, it has already been migrated and we can skip
# copy to db.orig.db, then apply the sql scripts to it

# check if we need to migrate, returns 1 if we need to migrate
check_for_migration() {
  echo Checking to see if database requires migration...

  echo "select name from sqlite_master where type='table' and name='migration_check'" >/tmp/cmd
  MIG_TABLE="$(sqlite3 $DB_ORIG </tmp/cmd)"

  echo "migration check result: "
  echo $MIG_TABLE

  if [[ -z $MIG_TABLE ]]; then
    # we need to migrate
    MIG=1
  fi

  MIG=0
}

# performs the migration
migrate() {
  DB_ORIG="$DATA_DIR/db.orig.db"
  DB_DB="$DATA_DIR/db.db"

  echo Starting Migration...

  for f in ${SQL_FILES[@]}; do
    # update the database name
    echo Updating database name for script $f
    sed "s|db.db|$DB_DB|" $MIGRATE_DIR/$f >/tmp/$f

    echo Apply to database...
    sqlite3 $DB_ORIG </tmp/$f
  done

  echo Finishing data migration scripts...
  sed "s|db.db|$DB_DB|" $MIGRATE_DIR/migrate.sql >/tmp/migrate.sql
  sqlite3 $DB_DB </tmp/migrate.sql
}

echo Checking for migration...
check_for_migration

if [[ -z $MIG ]]; then
  migrate
else
  echo Migration already done...skipping
fi
