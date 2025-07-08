#!/bin/bash

# if we are given the build command
#   we are running in the container
#   update the /migration scripts to a replaceable db name
# otherwise
#   perform migrations

# run migration sql scripts on database before we run
MIGRATE_DIR="${BLUEBOOK_MIGRATE_PATH:-/migrate}" # where the .sql migration files are
DATA_DIR="${BLUEBOOK_DATA_PATH:-/data}"

DB_ORIG="$DATA_DIR/db.orig.db"
DB_DB="$DATA_DIR/db.db"

SQL_FILES=("auv.sql" "daydata.sql" "hockey.sql" "settings.sql" "weekly_info.sql")

# performs the migration
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
