package models

import "gorm.io/gorm"

// This table contains a series of global settings for the front and backend configurable by the user
type BluebookSettings struct {
	gorm.Model

	HockeyURL           string // url used to fetch the hockey schedule
	DisplayHockeyWeekly bool   `json:"DisplayHockey"` // do we display hockey information on the /today view?
	PrintHockeyWeekly   bool   `json:"PrintHockey"`   // do we print the hockey info on the /today view?
	HockeyHomeTeam      string // name of home hockey team to show which games to display on month view
}
