#!/bin/sh

# variables
PREFIX="db"
EXT=".db"
INPUT="$PREFIX$EXT"
OUTPUT="$PREFIX$EXT.bak"

#set path to /data unless BLUEBOOK_BACKUP_PATH is set
if [ ! -z "$BLUEBOOK_BACKUP_PATH" ] 
then
	OUTPATH="$BLUEBOOK_BACKUP_PATH"
else
	OUTPATH="/backup"
fi

# check to make sure input exists and output doesn't
# if output already exists, log an error and return
if [ ! -f "$OUTPATH/$INPUT" ]; then
	echo "[ERROR]: NO DB FOUND"
	exit 1
fi

if [ -f "$OUTPATH/$OUTPUT" ]; then
	echo "[WARN]: db already backed up for this day"
	exit 1
fi

if [ ! -z "$BLUEBOOK_DATA_PATH" ]
then
	INPATH="$BLUEBOOK_DATA_PATH"
else
	INPATH="/data"
fi

# create the backup
echo "[INFO] Creating backup of database to: $OUTPATH/$OUTPUT"
cp $INPATH/$INPUT $OUTPATH/$OUTPUT

exit 0
