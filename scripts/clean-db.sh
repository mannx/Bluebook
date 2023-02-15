#!/bin/sh

# clean up deleted entries from the database
DBNAME="db.db"

if [ ! -z "$BLUEBOOK_DATA_PATH" ]
then
	INPATH="$BLUEBOOK_DATA_PATH"
else
	INPATH="/data"
fi

DBPATH=$INPATH/$DBNAME

echo "Cleaning up deleted entries from database: $DBPATH"
sqlite3 $DBPATH < /scripts/clean-db-sql.sql
