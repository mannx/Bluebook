#!/bin/sh

OUTPUT="/tmp/index.html"

# url to pull from is passed in $1
# make sure we have arguments
if [ $# -eq 0 ]; then
	echo "URL not supplied"
	exit 1
fi

if [ ! -f $OUTPUT ]; then
	wget -q -O $OUTPUT $1
fi

# get the path to the scripts directory (either /scripts or BLUEBOOK_SCRIPTS_PATH)
SP="/scripts"
if [[ -z BLUEBOOK_SCRIPTS_PATH ]]; then
	SP=$BLUEBOOK_SCRIPTS_PATH
fi

python3 $SP/get-hockey-data.py $2

