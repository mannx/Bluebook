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
}
