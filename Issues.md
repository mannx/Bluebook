Issues to fix
=============

* Wastage output not converting
	- Example: Roast beef still shows input value instead of gram/kilo conversion
* Implement wastage editing, ability to combine and remove duplicate entries
	- Dialog boxes need implemented to confirm

* Logs:
	+ Notes
		- Echo logger outputs to stdout
		- zerolog outputs to stderr
		- both should get saved by the docker log collector
	+ Find way of saving output to file.  Docker seems to sometimes only store echo logs, and
	  not logs from main logging system.
	+ Switch echo components to use main logging system instead of its own if possible
