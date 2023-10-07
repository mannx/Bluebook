#!/bin/sh

DB=../backend/data/db.db

# run several sql queries against the db to get a list of all raw team names
echo "SELECT DISTINCT Home FROM hockey_schedules" > team-name-sql.sql
sqlite3 $DB < team-name-sql.sql > team-names.data

echo "SELECT DISTINCT Away FROM hockey_schedules" > team-name-sql.sql
sqlite3 $DB < team-name-sql.sql > team-names.data

# generate the json template file to hand fill in after
python team-name-sort.py > team-names.json

# clean up
rm team-name-sql.sql
rm team-names.data
