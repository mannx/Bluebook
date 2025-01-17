-- create the table for holding user settings
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  HockeyURL TEXT,
  DisplayHockeyWeekly BOOL NOT NULL,
  PrintHockeyWeekly BOOL NOT NULL,
  HockeyHomeTeam TEXT,

  ManagerName TEXT,
  StoreNumber TEXT
);
