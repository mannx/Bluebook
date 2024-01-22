package api2

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/mannx/Bluebook/api"
	"github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// we can recieve several query parameters to limit the results we return
// minYear, maxYear	=>	return data between min and max years
// limit => number of entries to return
func HandleRawDayData(c echo.Context, db *gorm.DB) error {
	type queryData struct {
		MinYear int `query:"minYear"`
		MaxYear int `query:"maxYear"`
		Limit   int `query:"limit"`
	}

	var query queryData
	err := c.Bind(&query)
	if err != nil {
		return api.LogAndReturnError(c, "Unable to bind query paramters /raw/sql", err)
	}

	// if we have either minYear or maxYear, we need the other, we do not currently allow only specifing 1
	if (query.MinYear != 0) != (query.MaxYear != 0) {
		log.Warn().Msgf("[/ddview] if using (Min/Max)Year need both in query")
		return api.ReturnServerMessage(c, "Bad query parameters", true)
	}

	var data []models.DayData

	where := db
	if query.MinYear != 0 && query.MaxYear != 0 {
		min := time.Date(query.MinYear, time.January, 1, 0, 0, 0, 0, time.UTC)
		max := time.Date(query.MaxYear, time.December, 31, 0, 0, 0, 0, time.UTC)

		where = where.Where("Date >= ? AND Date <= ?", min, max)
	}

	if query.Limit != 0 {
		where = where.Limit(query.Limit)
	}

	res := where.Find(&data)
	if res.Error != nil {
		return api.LogAndReturnError(c, "Unable to retrieve daydata", res.Error)
	}

	return c.JSON(http.StatusOK, &data)
}
