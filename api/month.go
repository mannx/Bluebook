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
		NetSales          float64
		CustomerCount     int
		ThirdPartyPercent float64
		ThirdPartyTotal   float64
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
		Tags              []string  // list of tags on this day
		TagID             []uint
		SalesLastWeek     int // 0 if same, -1 if less, 1 if > than last weeks sales for this day
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
				tps := 0.0 //3rd party sales
				gsw := 0.0 //gross sales for hte week

				for _, n := range dat {
					net += n.NetSales
					cc += n.CustomerCount
					tps += n.DoorDash + n.SkipTheDishes
					gsw += n.NetSales + n.BottleDeposit + n.HST
				}

				eow.NetSales = net
				eow.CustomerCount = cc
				eow.ThirdPartyTotal = tps

				if gsw > 0 {
					eow.ThirdPartyPercent = (tps / gsw) * 100.0
				}

			}
		}

		// calculate the weekly average of previous weeks if we havent already done so
		if o.WeeklyAverage == 0 {
			o.WeeklyAverage = calculateWeeklyAverage(d, 4, db)
			//db.Save(&o)
		}

		tags, ids := getTags(o.ID, db)

		// caluclate the % of 3rd party sales
		tp := o.DoorDash + o.SkipTheDishes
		tpp := 0.0

		if gs > 0.0 {
			tpp = (tp / gs) * 100.0
		}

		slw := 0
		if o.NetSales > o.WeeklyAverage {
			slw = 1
		} else if o.NetSales < o.WeeklyAverage {
			slw = -1
		}

		mvd = append(mvd,
			dayViewData{
				DayData:           o,
				ThirdPartyDollar:  tp,
				ThirdPartyPercent: tpp,
				GrossSales:        gs,
				DayOfMonth:        d.Day(),
				DayOfWeek:         d.Weekday().String(),
				IsEndOfWeek:       d.Weekday() == time.Tuesday,
				EOW:               eow,
				Tags:              tags,
				TagID:             ids,
				SalesLastWeek:     slw,
			})
	}

	mv := monthlyView{Data: mvd, MonthName: time.Month(month).String()}
	return c.JSON(http.StatusOK, &mv)
}

// returns a list of tags and their id's in seperate lists
func getTags(id uint, db *gorm.DB) ([]string, []uint) {
	// retrieve all tags for this day
	tags := make([]models.TagData, 0)
	res := db.Find(&tags, "DayID = ?", id)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve tag data")
		return nil, nil
	}

	var tstr []string
	var tids []uint

	for _, obj := range tags {
		var t models.TagList
		e := db.Find(&t, "ID = ?", obj.TagID)
		if e.Error != nil {
			log.Error().Err(e.Error).Msg("Unable to retrieve tag data")
			continue
		}

		tstr = append(tstr, t.Tag)
		tids = append(tids, t.ID) // also save the id of the tag for easier searching
	}

	return tstr, tids
}

// computes the average of a number of weeks starting at the given date
func calculateWeeklyAverage(date time.Time, numWeeks int, db *gorm.DB) float64 {
	log.Debug().Msg("calculateWeeklyAverage() ==> ")
	var dates []time.Time

	for i := 0; i < numWeeks; i++ {
		dates = append(dates, date.AddDate(0, 0, -7))
	}

	var total float64
	for _, d := range dates {
		var obj models.DayData
		res := db.Find(&obj, "Date = ?", d)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve data for: %v", time.Time(d).String())
			continue
		}

		total = total + obj.NetSales
	}

	return total / float64(numWeeks)
}
