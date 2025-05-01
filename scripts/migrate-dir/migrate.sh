#!/bin/sh

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
sqlite3 $DB_ORIG <../scripts/weekly_info.sql
sqlite3 $DB_ORIG <../scripts/daydata.sql
sqlite3 $DB_ORIG <../scripts/hockey.sql
sqlite3 $DB_ORIG <../scripts/settings.sql
sqlite3 $DB_ORIG <../scripts/auv.sql
