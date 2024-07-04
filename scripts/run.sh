#!/bin/sh

# run the init script to initialize any files we might need
/scripts/init.sh

# create a backup before we start
/scripts/ar.sh

# todo:
#	handle any error exits before starting?
/bluebook
