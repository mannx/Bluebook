#!/bin/sh

# create a quick restore backup point in case automigration fails on startup
INPUT="db.db"
OUTPUT="db.bak"

if [ ! -z "$BLUEBOOK_DATA_PATH" ]; then
	OUTPATH="$BLUEBOOK_DATA_PATH"
else
	OUTPATH="/data"
fi

if [ ! -f "$OUTPATH/$INPUT" ]; then
	echo "[backup.sh] No database file found, skipping backup."
	exit 1
fi

cp $OUTPATH/$INPUT $OUTPATH/$OUTPUT