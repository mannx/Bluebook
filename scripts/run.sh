#!/bin/sh

# copy over the remove-bk.sh script into the /data directory allowing user to cleanup previous backups
cp /scripts/remove-bk.sh /data/remove-bk.sh

# create a backup before we start
/scripts/backup.sh

# cleanup any deleted entries
/scripts/clean-db.sh

# check if /data/hockey.json exists
# if not, copy out team-names.json
if [ ! -f /data/hockey.json ]; then
    cp /team-names.json /data/hockey.json
fi

# todo:
#	handle any error exits before starting?
/bluebook
