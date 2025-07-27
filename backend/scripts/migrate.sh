#!/bin/sh

# This script is only used during development to migrate
# and old database to the new model

# run this script from the /scripts/ directory

# move the original db, to $DB_ORIG
# run diesel migration scripts to create a new fresh db
# then run scripts on original db

# ideally, this should be rewritten to take into account .env for the database file

# database directory needs to be located at
# ../data/db.db

DB_ORIG="db.orig.db"
DB="db.db"

mv ../data/$DB ../data/$DB_ORIG

# run migration
cd ..
diesel migration run
cd data

# run sql migration scripts to copy data
echo "** Migrating Weekly Data **"
sqlite3 $DB_ORIG <../scripts/weekly_info.sql

echo "** Migrating Daily Data **"
sqlite3 $DB_ORIG <../scripts/daydata.sql

echo "** Migration Hockey Data **"
sqlite3 $DB_ORIG <../scripts/hockey.sql

echo "** Migrating Settings **"
sqlite3 $DB_ORIG <../scripts/settings.sql

echo "** Migrating AUV **"
sqlite3 $DB_ORIG <../scripts/auv.sql

# add the migration data to the new database
echo "** Running final migration script **"
sqlite3 $DB <../scripts/migrate.sql
