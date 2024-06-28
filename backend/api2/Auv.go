package api2

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	api "github.com/mannx/Bluebook/api"
	models "github.com/mannx/Bluebook/models"
	"gorm.io/gorm"
)

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

	if res.RowsAffected != 0 {
		// found an entry
		auv := entry.ToArray()
		return c.JSON(http.StatusOK, &auv)
	} else {
		// return a blank entry
		auv := models.AUVEntryArray{}
		auv.Blank(time.Month(month), year)

		return c.JSON(http.StatusOK, &auv)
	}
}

// get data POST'd to us and save to the db
func UpdateAUVHandler(c echo.Context, db *gorm.DB) error {
	var data models.AUVEntryArray

	if err := c.Bind(&data); err != nil {
		return api.LogAndReturnError(c, "Unable to bind from POST", err)
	}

	var auv models.AUVEntry2

	// are we updating an existing entry?
	res := db.Where("Month = ? AND Year = ?", data.Month, data.Year).First(&auv)

	if res.RowsAffected == 0 {
		// new entry
		auv.Month = data.Month
		auv.Year = data.Year
	}

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

	auv.Week1Prod = data.Productivity[0]
	auv.Week2Prod = data.Productivity[1]
	auv.Week3Prod = data.Productivity[2]
	auv.Week4Prod = data.Productivity[3]
	if len(data.AUV) > 4 {
		auv.Week5Prod = data.Productivity[4]
	}

	// update the db
	db.Save(&auv)

	return api.ReturnServerMessage(c, "Sucess", false)
}
