
# Bluebook Helper 

- Known Issues

- Notes:
	* Top5 is generated for a config file found the the BLUEBOOK\_DATA\_PATH directory (see below)
	* 4 week daily average is calculated each time page loads and is not stored in the db.

- Environment Variables:
	* Environment variables are used only to override default locations. See Environ.go
	* BLUEBOOK\_IMPORT\_PATH	-> directory where files to import are found
	* BLUEBOOK\_TEMP\_PATH 		-> directory where temp files are stored 
	* BLUEBOOK\_DATA\_PATH 		-> directory where the database is stored
	* BLUEBOOK\_OUTPUT\_PATH	-> Directory for export files to go
	* BLUEBOOK\_BACKUP\_PATH	-> Directory where the db is backed up upon startup
	* BLUEBOOK\_CRON\_JOB		-> Cron tab string for when to run auto imports

- Volume Binds/Mounts:
	* /data	->	Where the database and other configuration files are found
	* /import -> Where files for import are located (daily sheets, control sheets, etc), also where generated output files are stored by default
	* /backup -> DB Backup location

- Ports:
	* Port 8080 is used by default

## Top5 Config Path

	* Simple JSON file structure containg the tables title, the column name in the database, and the field it is stored in
	* An example file can be found in /top5.json

```json
	{"Data": [
		{"Title": "Title to show",
		"Column": "Database column",
		"Field": "Model field to get data"}
	]}
```

## Docker Compose Example

```dockerfile
version: "3.3"

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
      - <Import directory>:/import
      - /etc/localtime:/etc/localtime:ro
    deploy:
      restart_policy:
        condition: on-failure
```
