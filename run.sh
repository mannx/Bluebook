#!/bin/sh

#
#	Script is the entry point to the docker container
#	several files are check to exists and are used to set initial runtime flags
#	for database migration and some imports

#Comment=
#Convert=
#Waste=

Data=/data

if test -f "$Data/COMMENT"; then
	Comment=
else
	Comment=-comment
	touch $Data/COMMENT
fi

if test -f "$Data/CONVERT"; then
	Convert=
else
	Convert=-convert
	touch $Data/CONVERT
fi

if test -f "$Data/WASTE"; then
	Waste=
else
	Waste=-waste
	touch $Data/WASTE
fi

/bluebook $Comment $Convert $Waste
