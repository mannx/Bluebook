
# Bluebook Helper Migration

- Currently working on
	* [PARTIAL?] Tags & Comments when edited don't reflect new changes until refresh
	* AUV Number inputs / loading data after changing date

- TODO:
	* (MOSTLY) Weekly paperwork calculations, (TODO) file generation
	* CSS worked on -- themes? or other easier way of chaning colouring
	* Redo several front end data fetching mechanisms (see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change)

- Issues:
	* Import: No feedback after pressing button. Should show progress or other status information
	* AUV: Unable to save editing auv or create new auv entries
	* AUV: Changing dates doesn't reload data to view another month

- Notes:
	* Import script for adjusting database from django project in progress
	* Located in scripts directory along with SQL files with commands to update tables
	* Top5 is generated for a config file found the the BLUEBOOK\_DATA\_PATH directory (see below)
	* 4 week daily average is calculated each time page loads and is not stored in the db.  no performance hit seen so far?

- Environment Variables:
	* Environment variables are used only to override default locations. See Environ.go
	* BLUEBOOK\_IMPORT\_PATH	-> directory where files to import are found
	* BLUEBOOK\_TEMP\_PATH -> directory where temp files are stored 
	* BLUEBOOK\_DATA\_PATH -> directory where the database is stored


- Migration Steps:
	* Copy current database into /data (BLUEBOOK\_DATA\_PATH)
	* Copy migrate.sh into the /data directory
	* Run migrate.sh and everything *SHOULD* get migrated over correctly
	* On first start of a container:
		- Dates get updated to the currnet date/time model
		- Comment Table gets merged into the day data table
		- a file named READY is created at in the data directory
			~ If this file is present the first two steps are ignored, and can be pre placed if required
	* Notes/Issues:
		- Waste data is not preserved during the migration due to several changes
		- Extra column in weekly_infos needs to be manually deleted or the model updated to include it (currently unused, unsure of original purpose)

## Top5 Config Path

	* Simple JSON file structure containg the tables title, the column name in the database, and the field it is stored in

```json
	{"Data": [
		{"Title": "Title to show",
		"Column": "Database column",
		"Field: "Model field to get data"}
	]}
```

## Docker Compose Example

```dockerfile
version: "3.8"

services:
  bluebook:
    image: mannx/bluebook:beta
    container_name: bluebook
    ports:
      - 8080:8080
    environment:
      - TZ=Europe/London
    volumes:
      - <Data directory>:/data
      - <Import Direcotyr>:/import
      - /etc/localtime:/etc/localtime:ro
    deploy:
      restart_policy:
        condition: on-failure
```
