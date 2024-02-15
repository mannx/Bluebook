package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type HockeySchedule struct {
	gorm.Model

	Date       datatypes.Date
	Away       string
	Home       string
	GFAway     uint
	GFHome     uint
	Attendance uint
	Arena      string

	Valid bool `gorm:"-"` // true if we have an entry, false if no data was found for this day.  not stored in db.
	// find better option than checking for zero'd struct?
	HomeGame  bool   `gorm:"-"` // true if this is a home game for a set home team (used to simplify frontend logic)
	HomeImage string // url of image to use for this team
	AwayImage string // url of image to use for this team
}

// This table is used by the fetch script to add everything in
// after its updated, we merge into the main HockeySchedule table
// everything is stored as strings since this table is filled out by the python script
// and currently will insert an empty string instead of a 0 for score/attendance
type HockeyScheduleImport struct {
	gorm.Model

	Date       datatypes.Date
	Away       string
	Home       string
	GFAway     string
	GFHome     string
	Attendance string
	Arena      string
	HomeImage  string
	AwayImage  string
}

// This table should only contain 1 entry which is the URL to fetch data from
// type HockeyFetchURL struct {
// 	gorm.Model
//
// 	URL string
// }
