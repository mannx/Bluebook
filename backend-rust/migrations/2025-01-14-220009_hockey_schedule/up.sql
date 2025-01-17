-- Create the tables to holding the hockey scehdule data

-- type HockeySchedule struct {
-- 	gorm.Model
-- 
-- 	Date       datatypes.Date
-- 	Away       string
-- 	Home       string
-- 	GFAway     uint
-- 	GFHome     uint
-- 	Attendance uint
-- 	Arena      string
-- 
-- 	Valid bool `gorm:"-"` // true if we have an entry, false if no data was found for this day.  not stored in db.
-- 	// find better option than checking for zero'd struct?
-- 	HomeGame  bool   `gorm:"-"` // true if this is a home game for a set home team (used to simplify frontend logic)
-- 	HomeImage string // url of image to use for this team
-- 	AwayImage string // url of image to use for this team
-- }

-- Crate the hockey schedule table
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
