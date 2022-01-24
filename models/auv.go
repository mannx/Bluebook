package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// AUVEntry holds data for a given month for auv and hours
type AUVEntry struct {
	gorm.Model

	Week1Date  datatypes.Date
	Week1AUV   int
	Week1Hours int

	Week2Date  datatypes.Date
	Week2AUV   int
	Week2Hours int

	Week3Date  datatypes.Date
	Week3AUV   int
	Week3Hours int

	Week4Date  datatypes.Date
	Week4AUV   int
	Week4Hours int

	Week5Date     datatypes.Date
	Week5AUV      int
	Week5Hours    int
	Week5Required bool // true if this month has 5 weeks of data
}

// Default sets the date fields to the provided date
func (auv *AUVEntry) Default(date datatypes.Date) {
	auv.Week1Date = date
	auv.Week2Date = date
	auv.Week3Date = date
	auv.Week4Date = date
	auv.Week5Date = date
}
