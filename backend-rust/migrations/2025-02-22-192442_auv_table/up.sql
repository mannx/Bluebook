-- Your SQL goes here
CREATE TABLE IF NOT EXISTS auv_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,

  -- month/year this data is for
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,

  week_1_auv INTEGER NOT NULL,
  week_1_hours INTEGER NOT NULL,
  week_1_productivity REAL NOT NULL,

  week_2_auv INTEGER NOT NULL,
  week_2_hours INTEGER NOT NULL,
  week_2_productivity REAL NOT NULL,


  week_3_auv INTEGER NOT NULL,
  week_3_hours INTEGER NOT NULL,
  week_3_productivity REAL NOT NULL,

  week_4_auv INTEGER NOT NULL,
  week_4_hours INTEGER NOT NULL,
  week_4_productivity REAL NOT NULL,
  
  week_5_auv INTEGER NOT NULL,
  week_5_hours INTEGER NOT NULL,
  week_5_productivity REAL NOT NULL
);
