package api2

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	api "github.com/mannx/Bluebook/api"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// auvData is the js form of the database data and includes the dates
type auvData struct {
	Month int
	Year  int

	Dates []time.Time
	AUV   []int
	Hours []int
}

// return empty data or saved data for a given month
// url: /api/view/:month/:year
func GetAUVViewHandler(c echo.Context, db *gorm.DB) error {

	var month, year int

	err := echo.QueryParamsBinder(c).
		Int("month", &month).
		Int("year", &year).
		BindError()
	if err != nil {
		return api.LogAndReturnError(c, "Unable to bind auv parameters", err)
	}

	// make sure month/year are value
	if month < 1 || month > 12 {
		return api.LogAndReturnError(c, fmt.Sprintf("Invalid month: %v", month), nil)
	}

	// do we already have saved data?
	var entry models.AUVEntry2
	res := db.Where("Month = ? AND Year = ?", month, year).First(&entry)
	// if res.Error != nil {
	// 	return api.LogAndReturnError(c, "Unable to retrieve auv data", err)
	// }

	auv := auvData{
		Month: month,
		Year:  year,
		Dates: daysInMonth(time.Month(month), year),
	}

	// if res.RowsAffected == 0 {
	// 	// no data found, generate dates for the current month
	// } else {
	if res.RowsAffected != 0 {
		// convert db data to output struct
		auv.Hours = make([]int, len(auv.Dates))
		auv.AUV = make([]int, len(auv.Dates))

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
	}

	return c.JSON(http.StatusOK, &auv)
}

// get data POST'd to us and save to the db
func UpdateAUVHandler(c echo.Context, db *gorm.DB) error {
	log.Debug().Msgf("{UpdateAUVHandler]")
	var data auvData

	if err := c.Bind(&data); err != nil {
		return api.LogAndReturnError(c, "Unable to bind from POST", err)
	}

	var auv models.AUVEntry2

	// are we updating an existing entry?
	res := db.Where("Month = ? AND Year = ?", data.Month, data.Year).First(&auv)
	// if res.Error != nil {
	// 	return api.LogAndReturnError(c, "Unable to retrieve auv data", res.Error)
	// }

	if res.RowsAffected == 0 {
		// new entry
		auv.Month = data.Month
		auv.Year = data.Year
	}

	log.Debug().Msgf("[UpdateAUVHandler] Month: %v", auv.Month)
	log.Debug().Msgf("[UpdateAUVHandler] Year: %v", auv.Year)

	auv.Week1AUV = data.AUV[0]
	auv.Week2AUV = data.AUV[1]
	auv.Week3AUV = data.AUV[2]
	auv.Week4AUV = data.AUV[3]
	if len(data.AUV) > 4 {
		auv.Week5AUV = data.AUV[4]
	}

	auv.Week1Hours = data.Hours[0]
	auv.Week2Hours = data.Hours[1]
	auv.Week3Hours = data.Hours[2]
	auv.Week4Hours = data.Hours[3]
	if len(data.AUV) > 4 {
		auv.Week5Hours = data.Hours[4]
	}

	// update the db
	db.Save(&auv)

	return api.ReturnServerMessage(c, "Sucess", false)
}

func daysInMonth(month time.Month, year int) []time.Time {
	// move to the 32nd day which forces a rollover to the next month
	t := time.Date(year, month, 32, 0, 0, 0, 0, time.UTC)
	total := 32 - t.Day()
	days := make([]time.Time, 0)
	// index := 0

	// check each day
	for i := 1; i <= total; i++ {
		d := time.Date(year, month, i, 0, 0, 0, 0, time.UTC)
		if d.Weekday() == time.Tuesday {
			// days[index] = d
			// index += 1
			days = append(days, d)
		}
	}

	return days
}
