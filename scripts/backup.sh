#!/bin/sh

# variables
PREFIX="db"
EXT=".db"
INPUT="$PREFIX$EXT"
BACKUP_LIMIT=3

TIMESTAMP=$(date +%F)
OUTPUT="$PREFIX-$TIMESTAMP.bak"

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

# append to the backup list file
echo $OUTPUT >> backup-list

# get count of backup files
BACKUP_COUNT=$(wc -l < backup-list)
echo "Backup count: $BACKUP_COUNT"

# Clean up old back ups
# we keep up to $BACKUP_LIMIT number of backups
# TODO: find a better way to do this? kinda janky
if [ BACKUP_COUNT > BACKUP_LIMIT ]; then
	echo "Cleaning up backup list"

	# generate list of files to keep
	tail -n 3 backup-list > bl.1

	# get extra files (should only be 1) into a seperate file and diff to get the list of files to remove
	diff -d backup-list bl.1 | tail -n +2 > bl.2

	# remove the starting '> '
	sed -i 's\< \\g' bl.2

	# iterate over each file
	while IFS="" read -r p || [ -n "$p" ]
	do
		echo "Deleting backup file: $OUTPATH/$p"
		rm $OUTPATH/$p
	done < bl.2

	# trim the backup list and cleanup temp files
	tail -n 3 backup-list > backup-list
	rm bl.1 bl.2
fi

exit 0
