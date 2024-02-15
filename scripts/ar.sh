#!/bin/sh

TIMESTAMP=$(date +%F)
OUTPUT="Bluebook-$TIMESTAMP.tar.gz"

#set path to /data unless BLUEBOOK_BACKUP_PATH is set
if [ ! -z "$BLUEBOOK_BACKUP_PATH" ] 
then
	OUTPATH="$BLUEBOOK_BACKUP_PATH"
else
	OUTPATH="/backup"
fi

if [ ! -z "$BLUEBOOK_DATA_PATH" ]; then
    INPATH="$BLUEBOOK_DATA_PATH"
else
    INPATH="/data"
fi

DEST_FILE="$OUTPATH/$OUTPUT"
INPUT_FILE="$INPATH/db.db"

# make sure we have a db to archive
if [ ! -f $INPUT_FILE ]; then
    echo "[BACKUP] No DB File to archive....exiting"
    exit 1
fi

tar -zcvf $DEST_FILE $INPUT_FILE