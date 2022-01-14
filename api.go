package main

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

/*
 * Contains all functions that handle incoming api requests
 *
 */

func testHandler(c echo.Context) error {
	return c.String(http.StatusOK, "TEST HANDLER")
}

func lastDayHandler(c echo.Context) error {
	if DB == nil {
		log.Fatal().Msg("DB is null lastDayHandler")
	}

	var dd DayData
	res := DB.Last(&dd)
	if res.Error != nil {
		return res.Error
	}

	return c.JSON(http.StatusOK, &dd)
}

// DayViewData is object type retruned by api
type DayViewData struct {
	DayData

	GrossSales float64
}

// MonthlyView holds the monthly day data along with several other bits of info
type MonthlyView struct {
	Data []DayViewData
}

//
//	Returns data for a given month
//	query url: /API_URL?month=MM&year=YYYY
//
func getMonthViewHandler(c echo.Context) error {
	var month, year int

	err := echo.QueryParamsBinder(c).
		Int("month", &month).
		Int("year", &year).
		BindError()
	if err != nil {
		return err
	}

	// get the ending day for the month
	xmonth := month
	if month == 12 {
		// wrap around
		xmonth = xmonth + 1
	}

	endDay := time.Date(year, time.Month(xmonth+1), 0, 0, 0, 0, 0, time.UTC).Day()

	// retrieve the objects in the given range
	loc, e2 := time.LoadLocation("Canada/Atlantic")
	if e2 != nil {
		log.Fatal().Err(e2).Msg("Unable to load timezone")
	}

	start := time.Date(year, time.Month(month), 0, 0, 0, 0, 0, loc)
	end := time.Date(year, time.Month(month), endDay, 0, 0, 0, 0, loc)
	data := make([]DayData, endDay)

	log.Debug().Msgf("Start Time: [%v] End Time: [%v]", start, end)

	res := DB.Order("Date").Find(&data, "Date >= ? AND Date <= ?", start, end)

	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Error retrieving data")
		return res.Error
	}

	mvd := make([]DayViewData, 0)
	for _, o := range data {
		mvd = append(mvd, DayViewData{DayData: o, GrossSales: 1123})
	}

	mv := MonthlyView{Data: mvd}
	return c.JSON(http.StatusOK, &mv)
}
