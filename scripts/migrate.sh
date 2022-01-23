#!/bin/sh

# migrate the sql3 database from the django version to the current
# run in the directory with teh database named db.db

sqlite3 db.db < ../scripts/tables.sql
sqlite3 db.db < ../scripts/auv.sql
