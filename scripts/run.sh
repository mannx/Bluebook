#!/bin/bash

# make sure our templates are in place
# cp /init/* /data/

# create a backup before we start
/scripts/ar.sh

# make sure db has had migrations applied
/bluebook migrate

# if we have a previously used database, migrate the data over if found
if [[ -f /data/db.mig ]]; then
  cp /data/db.mig /data/db.orig.db

  # migrate data
  /scripts/migrate.sh
fi

# todo:
#	handle any error exits before starting?
/bluebook
