
# Bluebook Helper Migration

- Currently working on
	* Importing waste defintion file
		- JSON "generated" with scripts/waste.py
		- Implement command line option to parse? or web ui/api methods
	* Weekly Report
		- AUV/Hours to be implemented

- TODO:
	* be able to read/write from the existing db with little to no modifications to db structure
		+ columns need renamed
	* (PARTIAL) Browse montly data or jump to a specific month/year
	* (MOSTLY) Weekly paperwork calculations, (TODO) file generation
	* Wastage server and front end finishing
		- Datepicker to pick week and error check for non-tuesday
		- server: combine similar items for total weights, calculate weight conversions
		- server: Wastage Import needs item combining implemented
		- server: json file describing initial batch of common wastage items
	* Tags: not yet started
	* AUV and Weekly: not yet started
	* CSS worked on



- Environment Variables:
	* BLUEBOOK\_IMPORT\_PATH	-> directory where files to import are found
	* BLUEBOOK\_TEMP\_PATH -> directory where temp files are stored
