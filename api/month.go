package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

/*
 * Contains all functions that handle incoming api requests
 *
 */

//
//	Returns data for a given month
//	query url: /API_URL?month=MM&year=YYYY
//

// GetMonthViewHandler handles returning data for viewing a given month
func GetMonthViewHandler(c echo.Context, db *gorm.DB) error {

	// endOfWeek provides data totaling the previous week of sales
	type endOfWeek struct {
		NetSales      float64
		CustomerCount int
	}

	// dayViewData is an expanded DayData object with additional properties
	type dayViewData struct {
		models.DayData

		ThirdPartyDollar  float64
		ThirdPartyPercent float64
		GrossSales        float64
		DayOfMonth        int       // 1-31 for what day of the month it is
		DayOfWeek         string    // user friendly name of what day it is
		IsEndOfWeek       bool      // is this a tuesday?
		EOW               endOfWeek // end of week data if required

		Tags []string // list of tags on this day
	}

	// monthlyView holds the monthly day data along with several other bits of info
	type monthlyView struct {
		Data      []dayViewData
		MonthName string // month in a user friendly format
	}
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
	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(year, time.Month(month), endDay, 0, 0, 0, 0, time.UTC)
	data := make([]models.DayData, endDay)

	res := db.Order("Date").Find(&data, "Date >= ? AND Date <= ?", start, end)

	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Error retrieving data")
		return res.Error
	}

	mvd := make([]dayViewData, 0)
	for _, o := range data {
		// compute the gross sales (net+hst+bot dep)
		gs := o.NetSales + o.HST + o.BottleDeposit
		d := time.Time(o.Date)

		eow := endOfWeek{} // initialize the end of week of it is required
		if d.Weekday() == time.Tuesday {
			// end of week, pull in the required data
			pw := d.Add(-time.Hour * 24 * 6) // get previous 7 days
			dat := make([]models.DayData, 7)
			r := db.Find(&dat, "Date >= ? AND Date <= ?", pw, d)
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

		mvd = append(mvd,
			dayViewData{
				DayData:          o,
				ThirdPartyDollar: o.DoorDash + o.SkipTheDishes,
				GrossSales:       gs,
				DayOfMonth:       d.Day(),
				DayOfWeek:        d.Weekday().String(),
				IsEndOfWeek:      d.Weekday() == time.Tuesday,
				EOW:              eow,
				Tags:             getTags(o.ID, db),
			})
	}

	mv := monthlyView{Data: mvd, MonthName: time.Month(month).String()}
	return c.JSON(http.StatusOK, &mv)
}

func getTags(id uint, db *gorm.DB) []string {
	// retrieve all tags for this day
	tags := make([]models.TagData, 0)
	res := db.Find(&tags, "DayID = ?", id)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve tag data")
		return nil
	}

	var tstr []string
	for _, obj := range tags {
		var t models.TagList
		e := db.Find(&t, "ID = ?", obj.TagID)
		if e.Error != nil {
			log.Error().Err(e.Error).Msg("Unable to retrieve tag data")
			continue
		}

		tstr = append(tstr, t.Tag)
	}

	return tstr
}
