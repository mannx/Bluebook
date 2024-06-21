#!/bin/bash

# init script to unpack init files and copy over any updated files

# set paths depending if certrain variable are set
if [ ! -z "$BLUEBOOK_INIT_PATH" ] 
then
	INIT_PATH="$BLUEBOOK_INIT_PATH"
else
	INIT_PATH="/init"
fi

if [ ! -z "$BLUEBOOK_DATA_PATH" ]; then
    DATA_PATH="$BLUEBOOK_DATA_PATH"
else
    DATA_PATH="/data"
fi

tar -zxf $INIT_PATH/init.bin -C $INIT_PATH

files=("weekly.xlsx" "waste_def.json" "waste.xlsx")

echo Updating or initializing init files...

for file in ${files[@]}; do
    cmp -s $DATA_PATH/$file $INIT_PATH/$file
    if [ $? -eq 1 ]; then
        # update the file
        echo Updating file $file...
        cp $INIT_PATH/$file $DATA_PATH/$file
    fi
done