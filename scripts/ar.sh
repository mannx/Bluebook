#!/bin/sh

TIMESTAMP=$(date +%F)
OUTPUT="Bluebook-$TIMESTAMP.tar.gz"
DB_FILE="db.db"

#set path to /data unless BLUEBOOK_BACKUP_PATH is set
INPATH="${BLUEBOOK_DATA_PATH:-/data}"
OUTPATH="${BLUEBOOK_BACKUP_PATH:-/backup}"

DEST_FILE="$OUTPATH/$OUTPUT"
INPUT_FILE="$INPATH/$DB_FILE"

echo Backing up database from $INPUT_FILE to $DEST_FILE

# make sure we have a db to archive
if [ ! -f $INPUT_FILE ]; then
  echo "[BACKUP] No DB File to archive....exiting"
  exit 1
fi

# change to the directory first to avoid absolute paths
cd $INPATH
tar -zcvf $DEST_FILE $DB_FILE

