package models

import "gorm.io/gorm"

// This table contains a series of global settings for the front and backend configurable by the user
type BluebookSettings struct {
	gorm.Model

	HockeyURL string // url used to fetch the hockey schedule
}
