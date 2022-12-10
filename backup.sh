#!/bin/sh

# variables
PREFIX="db"
EXT=".db"
INPUT="$PREFIX$EXT"
OUTPUT="$PREFIX-$(date +%m-%d-%Y)$EXT"

#set path to /data unless BLUEBOOK_DATA_PATH is set
if [ ! -z "$BLUEBOOK_DATA_PATH" ] 
then
	OUTPATH="$BLUEBOOK_DATA_PATH"
else
	OUTPATH="/data"
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

# create the backup
echo "[INFO] Creating backup of database to: $OUTPATH/$OUTPUT"
cp $OUTPATH/$INPUT $OUTPATH/$OUTPUT

exit 0