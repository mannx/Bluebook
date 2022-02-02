
# Bluebook Helper Migration

- Currently working on
	* Wastage
		- Issues / Todo:
			~ (PARTIAL) rework sorting for viewing, show category? 

- TODO:
	* (MOSTLY) Weekly paperwork calculations, (TODO) file generation
	* CSS worked on -- themes? or other easier way of chaning colouring
	* Daily color highlight based on average sales +/-

- Issues:
	* Import: No feedback after pressing button. Should show progress or other status information
	* [FIXED?] Docker: run.sh isn't creating the READY file to prevent database migrations after the first run

- Notes:
	* Import script for adjusting database from django project in progress
	* Located in scripts directory along with SQL files with commands to update tables
	* Redo several front end data fetching mechanisms (see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change)
	* Top5 is generated for a config file found the the BLUEBOOK\_DATA\_PATH directory (see below)

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

	{"Data": [
		{"Title": "Title to show",
		"Column": "Database column",
		"Field: "Model field to get data"}
	]}
