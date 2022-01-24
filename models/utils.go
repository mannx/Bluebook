package models

import (
	"gorm.io/gorm"
)

// ServerReturnMessage is used to return a simple message from a post for error or success
type ServerReturnMessage struct {
	Message string `json:"Message"`
}

//
//	Retrieves a comment block based on LinkedID,
//	if not found, returns a fresh comment object
func getCommentsOrNew(linkedID int, db *gorm.DB) Comments {
	c := Comments{}

	// ignore any errors since will return a default object
	// on fail anyway
	_ = db.Find(&c, "LinkedID = ?", linkedID)
	return c
}
