#!/bin/sh

# make sure our templates are in place
cp /init/* /data/

# create a backup before we start
/scripts/ar.sh

# todo:
#	handle any error exits before starting?
/bluebook
