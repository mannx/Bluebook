package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// GetAUVViewHandler returns the data for a given month or empty data if none found
func GetAUVViewHandler(c echo.Context, db *gorm.DB) error {
	var month, year int

	err := echo.QueryParamsBinder(c).
		Int("month", &month).
		Int("year", &year).
		BindError()
	if err != nil {
		log.Debug().Msg("AUV() => Unable to bind parameters")
		return err
	}

	// if either month or year is 0, return a new auv object
	auv := models.AUVEntry{}
	if month == 0 || year == 0 {
		log.Debug().Msg("AUV() => Month || Year == 0")
		return c.JSON(http.StatusOK, &auv)
	}

	// get the starting date to look for
	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0) // get the next month
	res := db.Find(&auv, "week1_date >= ? AND week1_date < ?", start, end)
	if res.Error != nil {
		log.Debug().Msg("Unable to find auv data")
		return res.Error
	}

	log.Debug().Msgf("ID: %v [AUV: %v]", auv.ID, auv.Week1AUV)

	return c.JSON(http.StatusOK, &auv)
}

func UpdateAUVPostHandler(c echo.Context, db *gorm.DB) error {
	return nil
}
