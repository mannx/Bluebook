package models

import "gorm.io/gorm"

// NOTE:
//	Scrap and use push notifcations?

// Contains data about notifications to display to the user, and wether its to be shown 1 time only, or repeat until cleared
type NotificationData struct {
	gorm.Model

	Message  string // message to display to the user
	ShowOnce bool   // if true, only show once and then delete
	Shown    bool   // has this notification been shown?
}

// Add a new notfication to the db
func NewNotification(message string, onetime bool, db *gorm.DB) error {
	data := NotificationData{
		Message:  message,
		ShowOnce: onetime,
		Shown:    false,
	}

	res := db.Create(&data)
	return res.Error
}
