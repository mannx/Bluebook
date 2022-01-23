
# Bluebook Helper Migration

- Currently working on
	* Importing waste defintion file
		- JSON "generated" with scripts/waste.py
		- Implement command line option to parse? or web ui/api methods
	* Weekly Report
		- AUV/Hours to be implemented
		- (PARTIAL) AUV Front end started
		- Issues:
			~ Unable to change date in date picker
			~ update not yet implemented
	* Wastage
		- Issues / Todo:
			~ Weight conversion todo, custom conversions working
			~ rework sorting for viewing, show category? (after waste defintion file import done)	 

- TODO:
	* be able to read/write from the existing db with little to no modifications to db structure
		+ columns need renamed
	* (PARTIAL) Browse montly data or jump to a specific month/year
	* (MOSTLY) Weekly paperwork calculations, (TODO) file generation
	* Wastage server and front end finishing
		- Datepicker to pick week and error check for non-tuesday
		- server: calculate weight conversions
		- server: json file describing initial batch of common wastage items
	* Tags: not yet started
	* AUV in progress, see above
	* CSS worked on

- Notes:
	* Import script for adjusting database from django project in progress
	* Located in scripts directory along with SQL files with commands to update tables

- Environment Variables:
	* BLUEBOOK\_IMPORT\_PATH	-> directory where files to import are found
	* BLUEBOOK\_TEMP\_PATH -> directory where temp files are stored
