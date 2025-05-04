-- create an setup a table used to mark that the given database
-- has had its data migrated over from the old version

DROP TABLE IF EXISTS migration_check;

CREATE TABLE migration_check (
  mig_date TEXT NOT NULL
);

-- insert the current migration date
INSERT INTO migration_check (mig_date) VALUES (DATETIME());
