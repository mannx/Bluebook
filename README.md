
# Bluebook Helper Migration

- Currently working on
	* Importing waste defintion file
		- JSON "generated" with scripts/waste.py
		- Implement command line option to parse? or web ui/api methods
	* Wastage
		- Issues / Todo:
			~ (DONE | TESTING REQUIRED) Weight conversion todo, custom conversions working
			~ (PARTIAL) rework sorting for viewing, show category? (after waste defintion file import done)	 

- TODO:
	* be able to read/write from the existing db with little to no modifications to db structure
		+ columns need renamed
		+ script started to auto adjust tables and column names as needed
	* (MOSTLY) Weekly paperwork calculations, (TODO) file generation
	* Wastage server and front end finishing
		- server: calculate weight conversions
		- server: json file describing initial batch of common wastage items
	* Tags: need to implement tag searching
	* CSS worked on

- Notes:
	* Import script for adjusting database from django project in progress
	* Located in scripts directory along with SQL files with commands to update tables

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
		- a file named READY is created at the root directory
			~ If this file is present the first two steps are ignored, and can be pre placed if required
