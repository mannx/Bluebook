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

// version2 of the auv data
// week ending dates are generated and not stored in the db
type AUVEntry2 struct {
	gorm.Model

	Month int // month/year this data is for
	Year  int

	Week1AUV   int
	Week1Hours int

	Week2AUV   int
	Week2Hours int

	Week3AUV   int
	Week3Hours int

	Week4AUV   int
	Week4Hours int

	Week5AUV   int
	Week5Hours int
}

// Default sets the date fields to the provided date
func (auv *AUVEntry) Default(date datatypes.Date) {
	auv.Week1Date = date
	auv.Week2Date = date
	auv.Week3Date = date
	auv.Week4Date = date
	auv.Week5Date = date
}

// sets the week ending dates to the correct tuesday of the month
// func (auv *AUVEntry) Default(date time.Time) {
// 	// get the week ending days
// 	days := daysInMonth(date)

// 	auv.Week1Date = datatypes.Date(days[0])
// 	auv.Week2Date = datatypes.Date(days[1])
// 	auv.Week3Date = datatypes.Date(days[2])
// 	auv.Week4Date = datatypes.Date(days[3])

// 	if len(days) == 5 {
// 		log.Debug().Msgf("[AUVENTRY-DEFAULT] WEEK 5 FOUND")
// 		auv.Week5Date = datatypes.Date(days[4])
// 	}
// }

// returns a list of all the days in a given month that fall on a tuesday
// func daysInMonth(t time.Time) []time.Time {
// 	// move to the 32nd day which forces a rollover to the next month
// 	t = time.Date(t.Year(), t.Month(), 32, 0, 0, 0, 0, time.UTC)
// 	total := 32 - t.Day()
// 	days := make([]time.Time, 5)
// 	index := 0

// 	// check each day
// 	for i := 1; i <= total; i++ {
// 		d := time.Date(t.Year(), t.Month(), i, 0, 0, 0, 0, time.UTC)
// 		if d.Weekday() == time.Tuesday {
// 			days[index] = d
// 			index += 1
// 		}
// 	}

// 	return days
// }
