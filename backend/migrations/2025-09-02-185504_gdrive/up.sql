-- insert a new column into the settings table
ALTER TABLE settings
ADD use_drive BOOL NOT NULL DEFAULT false;
