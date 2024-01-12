#!/bin/sh

# URL="https://chl.ca/lhjmq-seadogs/schedule/8/205/"
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

python3 get-hockey-data.py