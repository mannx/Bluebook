package api2

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
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
	// for now we use the current year and first wednesday (currently hardcoded, TODO)
	start := time.Date(2023, time.January, 4, 0, 0, 0, 0, time.UTC)

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
			log.Debug().Msgf(" -- SASBDH -- RowsAffected == 0 [%v] - [%v]", start, end)
			break
		}

		// TODO:
		//	find highest net sales from week just selected (do this with a sql statement instead?)
		//  add to statsData array and keep going
		day := 0
		var max float64

		for index, d := range dd {
			if d.NetSales > max {
				max = d.NetSales
				day = index
			}
		}

		data = append(data, statsData{
			WeekEnding: end,
			Day:        time.Weekday(day),
			NetSales:   max,
		})

		break
	}

	// for i := 0; i < 7; i++ {
	// 	data = append(data, statsData{})
	// }

	return c.JSON(http.StatusOK, &data)
}
