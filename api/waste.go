package api

import (
	"net/http"
	"sort"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"

	models "github.com/mannx/Bluebook/models"
)

func GetWasteSettingHandler(c echo.Context, db *gorm.DB) error {
	// return all the wastage items
	var data []models.WastageItem
	res := db.Find(&data)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve wastage items")
		return res.Error
	}

	type WastageSetting struct {
		Data      []models.WastageItem // list of items
		Locations []string             // list of all location strings
		Units     []string             // list of all unit types as strings
	}

	wi := models.WastageItem{}
	ws := WastageSetting{
		Locations: wi.Locations(),
		Units:     wi.Units(),
		Data:      make([]models.WastageItem, 0),
	}

	for _, n := range data {
		n.GenString()
		ws.Data = append(ws.Data, n)
	}

	return c.JSON(http.StatusOK, &ws)
}

// UpdateWasteSettingHandler handles waste setting updates. Only items that have changed are POST'd in
func UpdateWasteSettingHandler(c echo.Context, db *gorm.DB) error {
	log.Debug().Msg("[UpdateWasteSettingHandler]")
	data := make([]models.WastageItem, 0)

	if err := c.Bind(&data); err != nil {
		log.Error().Err(err).Msg("Failed to bind data for UpdateWasteSetting")
		return err
	}

	// process changes
	for _, n := range data {
		// get the item from the db
		//	can use the passed item as it should be a direct copy
		//	from the db, but do this to prevent any issues from appearing
		var obj models.WastageItem

		res := db.First(&obj, n.ID)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve item [ID: %v] [Name: %v]", n.ID, n.Name)
			continue
		} else if res.RowsAffected == 0 {
			log.Debug().Msgf("Unable to find any objects id: %v", n.ID)
			continue
		}

		obj.UnitMeasure = n.UnitMeasure
		obj.Location = n.Location
		obj.CustomConversion = n.CustomConversion
		obj.UnitWeight = n.UnitWeight

		// save the obj
		db.Save(&obj)
	}

	return c.JSON(http.StatusOK, models.ServerReturnMessage{
		Message: "Successfully updated",
		Error:   false,
	})
}

// return a combined waste report for week ending
//		/api/../?month=MONTH&year=YEAR&day=DAY
//		where month and year are 2 and 4 digits each

// GetWasteViewHandler handls the waste report generation
func GetWasteViewHandler(c echo.Context, db *gorm.DB) error {
	log.Debug().Msg("GetWasteViewHandler()")

	type wasteError struct {
		Message string `json:"Message"`
	}

	// WasteViewItem is  a single item and its total waste amount
	type WasteViewItem struct {
		Name     string  `json:"Name"`
		Amount   float64 `json:"Amount"`
		Location int     `json:"Location"`
	}

	// WasteView for returning to the client
	type WasteView struct {
		WeekEnding time.Time `json:"WeekEnding"`
		Data       []WasteViewItem
	}
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
	weekStart := weekEnding.AddDate(0, 0, -7)

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

	// total same units together
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

		// process the weight conversion if required
		log.Debug().Msgf("GetWasteViewHandler() => Converting %v to => %v", wi.Name, wi.UnitMeasure)
		m := wi.Convert(n)
		output.Data = append(output.Data, WasteViewItem{Name: wi.Name, Amount: m, Location: wi.Location})
	}

	// sort output by location insert an empty entry between location switches
	sort.Slice(output.Data, func(i, j int) bool {
		return output.Data[i].Location > output.Data[j].Location
	})

	loc := 0
	final := make([]WasteViewItem, 0)
	for _, v := range output.Data {
		if loc == 0 {
			loc = v.Location
		} else if loc != v.Location {
			// insert blank entry
			final = append(final, WasteViewItem{Name: "", Amount: 0, Location: 0})
			loc = v.Location
		}
		final = append(final, v)
	}

	return c.JSON(http.StatusOK, &WasteView{WeekEnding: weekEnding, Data: final})
}
