
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
		- Datepicker to pick week and error check for non-tuesday
		- server: calculate weight conversions
		- server: json file describing initial batch of common wastage items
	* Tags: not yet started
	* CSS worked on

- Notes:
	* Import script for adjusting database from django project in progress
	* Located in scripts directory along with SQL files with commands to update tables

- Environment Variables:
	* Environment variables are used only to override default locations. See Environ.go
	* BLUEBOOK\_IMPORT\_PATH	-> directory where files to import are found
	* BLUEBOOK\_TEMP\_PATH -> directory where temp files are stored


- Migration Steps:
	* Copy current database into /data (BLUEBOOK\_DATA\_PATH)
	* Copy migrate.sh into the /data directory
	* Run migrate.sh and everything *SHOULD* get migrated over correctly
	* TODO:
		- Provide a runtime option to update the time stamps on all entries
			~ This adds the time (0:00UTC) to all entries to make searching currently work
		- Dockerfile build todo
			~ use a runtime script that initializes the server with the update flag on first run
			~ but not for future runs
