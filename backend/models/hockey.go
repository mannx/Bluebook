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
	HomeImage string `gorm:"-"` // url of image to use for this team
	AwayImage string `gorm:"-"` // url of image to use for this team
}

// This table is used by the fetch script to add everything in
// after its updated, we merge into the main HockeySchedule table
type HockeyScheduleImport struct {
	gorm.Model

	Date       datatypes.Date
	Away       string
	Home       string
	GFAway     uint
	GFHome     uint
	Attendance uint
	Arena      string
}
