Issues to fix
=============

* Control sheet import fails if:
	+ Bread over/short contains any number in any field in the thousands
		- Fix regex to parse large number correctly if required)
* Adding a comnent to a day without sales data (from a daily sheet import), creates a 2nd day entry
  and won't get updated during an import, the comment is never visible.
  	+ Fix by preventing creating a new day, make sure to find the current day
	+ If unable, create log entry with new day id for easier debugging
* Logs:
	+ Find way of saving output to file.  Docker seems to sometimes only store echo logs, and
	  not logs from main logging system.
	+ Switch echo components to use main logging system instead of its own if possible
