#!/bin/sh

# cleanup deleted entries
# this script should be called after a backup of the database has been made

# usage:
#   cleanup.sh [BACKUP PATH]
#
# BACKUP PATH -> is provided from the calling script. Usually either /backup or $BLUEBOOK_BACKUP_PATH

# create temp sql file with the instructions to execute
echo "Creating temp sql file..."
