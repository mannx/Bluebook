# Bluebook Helper

- Notes:

  - 4 week daily average is calculated each time page loads and is not stored in the db.

- Environment Variables:

  - Environment variables are used only to override default locations. See Environ.go
  - BLUEBOOK_IMPORT_PATH -> directory where files to import are found
  - BLUEBOOK_TEMP_PATH -> directory where temp files are stored
  - BLUEBOOK_DATA_PATH -> directory where the database is stored
  - BLUEBOOK_OUTPUT_PATH -> Directory for export files to go
  - BLUEBOOK_BACKUP_PATH -> Directory where the db is backed up upon startup

- Volume Binds/Mounts:

  - /data -> Where the database and other configuration files are found
  - /import -> Where files for import are located (daily sheets, control sheets, etc), also where generated output files are stored by default
  - /backup -> DB Backup location

- Ports:
  - Port 8080 is used by default
