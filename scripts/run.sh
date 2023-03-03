#!/bin/sh

# copy over the remove-bk.sh script into the /data directory allowing user to cleanup previous backups
cp /scripts/remove-bk.sh /data/remove-bk.sh

# create a backup before we start
/scripts/backup.sh

# cleanup any deleted entries
/scripts/clean-db.sh

# todo:
#	handle any error exits before starting?
/bluebook
