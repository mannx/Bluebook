package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// return a combined waste report for week ending
//		/api/../?month=MONTH&year=YEAR&day=DAY
//		where month and year are 2 and 4 digits each
func GetWasteViewHandler(c echo.Context, db *gorm.DB) error {
	log.Debug().Msg("GetWasteViewHandler()")
	var month, year, day int

	err := echo.QueryParamsBinder(c).
		Int("month", &month).
		Int("year", &year).
		Int("day", &day).
		BindError()
	if err != nil {
		return err
	}

	weekEnding := time.Date(year, time.Month(month+1), day, 0, 0, 0, 0, time.UTC)
	weekStart := weekEnding.AddDate(0, 0, -6)

	log.Debug().Msgf("waste report [%v] -> [%v]", weekStart, weekEnding)

	// make sure we have a tuesday, week ending day
	return c.String(http.StatusOK, "waste report")
}
