package main

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
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

	var dd models.DayData
	res := DB.Last(&dd)
	if res.Error != nil {
		return res.Error
	}

	return c.JSON(http.StatusOK, &dd)
}

// EndOfWeek provides data totaling the previous week of sales
type EndOfWeek struct {
	NetSales      float64
	CustomerCount int
}

// DayViewData is an expanded DayData object with additional properties
type DayViewData struct {
	models.DayData

	ThirdPartyDollar  float64
	ThirdPartyPercent float64
	GrossSales        float64
	DayOfMonth        int       // 1-31 for what day of the month it is
	DayOfWeek         string    // user friendly name of what day it is
	IsEndOfWeek       bool      // is this a tuesday?
	EOW               EndOfWeek // end of week data if required
	Comment           string    // contains the comment if any
}

// MonthlyView holds the monthly day data along with several other bits of info
type MonthlyView struct {
	Data      []DayViewData
	MonthName string // month in a user friendly format
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
	/*	loc, e2 := time.LoadLocation("Canada/Atlantic")
		if e2 != nil {
			log.Fatal().Err(e2).Msg("Unable to load timezone")
		}*/

	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(year, time.Month(month), endDay, 0, 0, 0, 0, time.UTC)
	data := make([]models.DayData, endDay)

	log.Debug().Msgf("Start Time: [%v] End Time: [%v]", start, end)

	res := DB.Order("Date").Find(&data, "Date >= ? AND Date <= ?", start, end)

	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Error retrieving data")
		return res.Error
	}

	mvd := make([]DayViewData, 0)
	for _, o := range data {
		// compute the gross sales (net+hst+bot dep)
		gs := o.NetSales + o.HST + o.BottleDeposit
		d := time.Time(o.Date)

		eow := EndOfWeek{} // initialize the end of week of it is required
		if d.Weekday() == time.Tuesday {
			// end of week, pull in the required data
			pw := d.Add(-time.Hour * 24 * 6) // get previous 7 days
			log.Debug().Msgf("[EOW] start[%v] end=[%v]", pw.String(), d.String())
			dat := make([]models.DayData, 7)
			r := DB.Find(&dat, "Date >= ? AND Date <= ?", pw, d)
			if r.Error != nil {
				log.Error().Err(res.Error).Msg("Unable to retrieve data to compute end of week calculations")
			} else {
				net := 0.0
				cc := 0
				for _, n := range dat {
					net += n.NetSales
					cc += n.CustomerCount
				}

				eow.NetSales = net
				eow.CustomerCount = cc
			}
		}

		// check to see if we have any comment with this day
		comm := models.Comments{}
		r := DB.Find(&comm, "LinkedID = ?", o.ID)
		if r.Error != nil {
			log.Warn().Msgf("Unable to get comment for day %v", o.ID)
		} else {
			log.Debug().Msgf("[%v] Comment retrieved: %v (%T)", r.RowsAffected, comm.Comment, comm.Comment)
		}

		mvd = append(mvd,
			DayViewData{
				DayData:          o,
				ThirdPartyDollar: o.DoorDash + o.SkipTheDishes,
				GrossSales:       gs,
				DayOfMonth:       d.Day(),
				DayOfWeek:        d.Weekday().String(),
				IsEndOfWeek:      d.Weekday() == time.Tuesday,
				EOW:              eow,
				Comment:          comm.Comment,
			})
	}

	mv := MonthlyView{Data: mvd, MonthName: time.Month(month).String()}
	return c.JSON(http.StatusOK, &mv)
}
