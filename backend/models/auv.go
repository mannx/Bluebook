package models

import (
	"time"

	"gorm.io/gorm"
)

// version2 of the auv data
// week ending dates are generated and not stored in the db
type AUVEntry2 struct {
	gorm.Model

	Month int // month/year this data is for
	Year  int

	Week1AUV   int
	Week1Hours int
	Week1Prod  float64

	Week2AUV   int
	Week2Hours int
	Week2Prod  float64

	Week3AUV   int
	Week3Hours int
	Week3Prod  float64

	Week4AUV   int
	Week4Hours int
	Week4Prod  float64

	Week5AUV   int
	Week5Hours int
	Week5Prod  float64
}

// Holds an AUVEntry2 but stored in arrays instead of Week?__ fields
// this is not stored in the db and is only used by converting an
// AUVEntry2 struct
type AUVEntryArray struct {
	Month int
	Year  int

	Dates        []time.Time
	AUV          []int
	Hours        []int
	Productivity []float64
}

func (entry *AUVEntry2) ToArray() AUVEntryArray {
	auv := AUVEntryArray{
		Month: entry.Month,
		Year:  entry.Year,
		Dates: daysInMonth(time.Month(entry.Month), entry.Year),
	}

	auv.Hours = make([]int, len(auv.Dates))
	auv.AUV = make([]int, len(auv.Dates))
	auv.Productivity = make([]float64, len(auv.Dates))

	auv.Hours[0] = entry.Week1Hours
	auv.Hours[1] = entry.Week2Hours
	auv.Hours[2] = entry.Week3Hours
	auv.Hours[3] = entry.Week4Hours
	if len(auv.Dates) > 4 {
		auv.Hours[4] = entry.Week5Hours
	}

	auv.AUV[0] = entry.Week1AUV
	auv.AUV[1] = entry.Week2AUV
	auv.AUV[2] = entry.Week3AUV
	auv.AUV[3] = entry.Week4AUV
	if len(auv.Dates) > 4 {
		auv.AUV[4] = entry.Week5AUV
	}

	auv.Productivity[0] = entry.Week1Prod
	auv.Productivity[1] = entry.Week2Prod
	auv.Productivity[2] = entry.Week3Prod
	auv.Productivity[3] = entry.Week4Prod
	if len(auv.Dates) > 4 {
		auv.Productivity[4] = entry.Week5Prod
	}

	return auv
}

func (entry *AUVEntryArray) Blank(month time.Month, year int) {
	entry.Month = int(month)
	entry.Year = year

	entry.Dates = daysInMonth(month, year)
	entry.AUV = make([]int, len(entry.Dates))
	entry.Hours = make([]int, len(entry.Dates))
	entry.Productivity = make([]float64, len(entry.Dates))
}

func daysInMonth(month time.Month, year int) []time.Time {
	// move to the 32nd day which forces a rollover to the next month
	t := time.Date(year, month, 32, 0, 0, 0, 0, time.UTC)
	total := 32 - t.Day()
	days := make([]time.Time, 0)

	// check each day
	for i := 1; i <= total; i++ {
		d := time.Date(year, month, i, 0, 0, 0, 0, time.UTC)
		if d.Weekday() == time.Tuesday {
			days = append(days, d)
		}
	}

	return days
}
