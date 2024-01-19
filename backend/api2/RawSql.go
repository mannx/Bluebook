package api2

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mannx/Bluebook/api"
	"github.com/mannx/Bluebook/models"
	"gorm.io/gorm"
)

// we can recieve several query parameters to limit the results we return
// minYear, maxYear	=>	return data between min and max years
// limit => number of entries to return
// TODO:
func HandleRawDayData(c echo.Context, db *gorm.DB) error {
	var data []models.DayData

	res := db.Find(&data)
	if res.Error != nil {
		return api.LogAndReturnError(c, "Unable to retrieve daydata", res.Error)
	}

	return c.JSON(http.StatusOK, &data)
}
