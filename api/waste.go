package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"

	models "github.com/mannx/Bluebook/models"
)

type wasteError struct {
	Message string `json:"Message"`
}

// WasteViewItem is  a single item and its total waste amount
type WasteViewItem struct {
	Name   string  `json:"Name"`
	Amount float64 `json:"Amount"`
}

// WasteView for returning to the client
type WasteView struct {
	WeekEnding time.Time `json:"WeekEnding"`
	Data       []WasteViewItem
}

// return a combined waste report for week ending
//		/api/../?month=MONTH&year=YEAR&day=DAY
//		where month and year are 2 and 4 digits each

// GetWasteViewHandler handls the waste report generation
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

	weekEnding := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	weekStart := weekEnding.AddDate(0, 0, -6)

	// make sure we have a tuesday, week ending day
	if weekEnding.Weekday() != time.Tuesday {
		log.Debug().Msg("Request date is not a tuesday")
		return c.JSON(http.StatusOK, "Can only view from a tuesday")
	}

	// retrieve the data
	waste := make([]models.WastageEntry, 10) // 10 init size can be tweaked
	res := db.Order("Date").Find(&waste, "Date >= ? AND Date <= ?", weekStart, weekEnding)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve wastage data")
		return res.Error
	}

	data := map[uint]float64{} // store the running total for each item
	for _, n := range waste {
		data[n.Item] = data[n.Item] + n.Amount
	}

	output := WasteView{WeekEnding: weekEnding}
	for k, n := range data {
		wi := models.WastageItem{}
		err := db.Find(&wi, "ID = ?", k)
		if err.Error != nil {
			log.Error().Err(err.Error).Msgf("unable to find id %v in database.", k)
			return err.Error
		}

		output.Data = append(output.Data, WasteViewItem{Name: wi.Name, Amount: n})
	}

	return c.JSON(http.StatusOK, &output)
}
