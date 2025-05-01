-- Create the tables to holding the hockey scehdule data
CREATE TABLE IF NOT EXISTS hockey_schedule(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  DayDate DATE NOT NULL,
  Away TEXT NOT NULL,
  Home TEXT NOT NULL,
  GFAway INTEGER NOT NULL,
  GFHome INTEGER NOT NULL,
  Attendance INTEGER NOT NULL,
  Arena TEXT NOT NULL,

  HomeImage TEXT NOT NULL,
  AwayImage TEXT NOT NULL
);
