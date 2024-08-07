package api2

import (
	"time"

	"github.com/labstack/echo/v4"
	api "github.com/mannx/Bluebook/api"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

func StatsAverageSalesByDayHandler(c echo.Context, db *gorm.DB) error {
	type statsData struct {
		WeekEnding time.Time    // week ending date for this entry
		Day        time.Weekday // which day was the busiest
		NetSales   float64      // sales for the given day
	}

	// use supplied date range for generating this data
	var year int
	err := echo.QueryParamsBinder(c).Int("year", &year).BindError()
	if err != nil {
		return api.LogAndReturnError(c, "Unable to bind year", err)
	}

	// if year is 0, return an error, otherwise find the first wednesday of the provided year
	if year == 0 {
		return api.ReturnServerMessage(c, "Year must be provided to /api/stats", true)
	}

	wed := 1
	for time.Date(year, time.January, wed, 0, 0, 0, 0, time.UTC).Weekday() != time.Wednesday {
		wed++
	}

	// for now we use the current year and first wednesday (currently hardcoded, TODO)
	start := time.Date(year, time.January, wed, 0, 0, 0, 0, time.UTC)

	// should be a better/faster way of calculating data required?
	data := make([]statsData, 0)

	// retrieve a week at a time
	for i := 0; i < 52; i++ {
		// retrieve the current week starting
		end := start.AddDate(0, 0, 7)

		var dd []models.DayData
		res := db.Where("Date >= ? AND Date <= ?", start, end).Find(&dd)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve records for date: [%v] - [%v]", start, end)
			continue
		}

		if res.RowsAffected == 0 {
			break
		}

		// TODO:
		//	find highest net sales from week just selected (do this with a sql statement instead?)
		//  add to statsData array and keep going
		var day time.Weekday
		var max float64

		for _, d := range dd {
			if d.NetSales > max {
				max = d.NetSales
				day = time.Time(d.Date).Weekday()
			}
		}

		data = append(data, statsData{
			WeekEnding: end,
			Day:        time.Weekday(day),
			NetSales:   max,
		})

		// move the starting day to the next week
		start = start.AddDate(0, 0, 7)
	}

	// compute stats about generated data
	// count how many of each day was the highest day
	counts := make(map[time.Weekday]int)
	totalCounts := 0

	for _, d := range data {
		counts[d.Day]++
		totalCounts++
	}

	type returnData struct {
		Counts map[time.Weekday]int
		Data   []statsData
		Total  int
	}

	rd := returnData{
		Data:   data,
		Counts: counts,
		Total:  totalCounts,
	}

	// return c.JSON(http.StatusOK, &rd)
	return api.ReturnApiRequest(c, false, &rd, "")
}
