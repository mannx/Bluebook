#!/bin/sh

# create a backup before we start
/scripts/backup.sh

# cleanup any deleted entries
/scripts/clean-db.sh

# todo:
#	handle any error exits before starting?
/bluebook
