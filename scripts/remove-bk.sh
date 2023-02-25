#!/bin/sh

#
# This script is used to remove all the startup database backups
# It moves db.db to a temp file, and then rm *.db in the data directory
# and move db.db back.

#
# Only run this script once a backup of the data folder has been made
#

DBNAME="db.db"
TEMPNAME="db.db.bak"

if [ ! -z "$BLUEBOOK_DATA_PATH" ]
then
	INPATH="$BLUEBOOK_DATA_PATH"
else
	INPATH="/data"
fi

DBPATH=$INPATH/$DBNAME
TMPPATH=$INPATH/$TEMPNAME

echo "Creating temp backup of database..."
mv $DBPATH $TMPPATH

echo "Removing all backups..."
rm $INPATH/*.db

echo "Restoring temp backup..."
mv $TMPPATH $DBPATH
