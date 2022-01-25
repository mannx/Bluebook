#!/bin/sh

#
#	Script is the entry point to the docker container
#	if a file called READY is not found, the migration functions
#	are first run and the file created.  If it does exist,
#	the server launches normally

if test -f "READY"; then
		./Bluebook
		touch READY
else
		./Bluebook -comment -convert
fi