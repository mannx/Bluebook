# Create a backup of the database and maintain only a certain number of copies
# removing any extra after the newest backup is made

# defaults to 3 backup copies, but can be overriden by setting BLUEBOOK_DB_BACKUP_COUNT to the wanted value

import os

BACKUP_COUNT = os.environ.get("BLUEBOOK_DB_BACKUP_COUNT") if os.environ.get("BLUEBOOK_DB_BACKUP_COUNT") != None else 3
BACKUP_DIR = os.environ.get("BLUEBOOK_BACKUP_PATH") if os.environ.get("BLUEBOOK_BACKUP_PATH") != None else "/backup"

# run the archive script to generate a new backup
