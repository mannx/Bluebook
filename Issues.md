Issues to fix
=============

* Implement deletion of item from waste holding (DONE?)

* Include date with items on wastage entry
	- date for each item is stored in db, but shown as 1 day prior to user (timezone issue? manually fix time server side?)
	- allow generation of wastage sheet based off input dates/items/amounts (reverse wastage import)

* Wastage editing
	- Can delete items, but doesn't refresh after doing so
		+ calls both loadData() and forceUpdate() but wont update

* Implement graphing of selected data (ie. net sales, 3pd delivery, tips, etc)
* Calculate weekly total even without a full week of data

* Logs:
	+ Add ability to set log level either via build option or runtime flag instead of hard code
		- ie. Change from DEBUG to INFO
	+ Notes
		- Echo logger outputs to stdout
		- zerolog outputs to stderr
		- both should get saved by the docker log collector (? does? maybe not?)
	+ Find way of saving output to file.  Docker seems to sometimes only store echo logs, and
	  not logs from main logging system.
	+ Switch echo components to use main logging system instead of its own if possible


TO DO
====

* Parse WISR into database table with item name, over/short, price per item, (category?)
* Generate list of items +/- to include on waste sheet (show N, user selects 5)
* Generate wastage report based on user selected items
