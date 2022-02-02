
# Bluebook Helper Migration

- Currently working on
	* Importing waste defintion file
		- JSON "generated" with scripts/waste.py
		- Implement command line option to parse? or web ui/api methods
	* Wastage
		- Issues / Todo:
			~ (DONE | TESTING REQUIRED) Weight conversion todo, custom conversions working
			~ (PARTIAL) rework sorting for viewing, show category? (after waste defintion file import done)	 
	* Top5
		- Basic backend down, front end in similar stage as django version
		- Place data to view in a config file and load at startup?

- TODO:
	* (MOSTLY) Weekly paperwork calculations, (TODO) file generation
	* Wastage server and front end finishing
		- server: calculate weight conversions
		- server: json file describing initial batch of common wastage items
	* CSS worked on -- themes? or other easier way of chaning colouring
	* Daily color highlight based on average sales +/-

- Issues:
	* Import: No feedback after pressing button. Should show progress or other status information

- Notes:
	* Import script for adjusting database from django project in progress
	* Located in scripts directory along with SQL files with commands to update tables
	* Redo several front end data fetching mechanisms (see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change)

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
