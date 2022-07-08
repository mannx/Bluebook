package api

import (
	"net/http"
	"sort"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	models "github.com/mannx/Bluebook/models"
)

func GetWasteSettingHandler(c echo.Context, db *gorm.DB) error {
	// return all the wastage items
	var data []models.WastageItem
	res := db.Order("Name").Find(&data)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve wastage items")
		return res.Error
	}

	type WastageSetting struct {
		Data      []models.WastageItem // list of items
		Locations []string             // list of all location strings
		Units     []string             // list of all unit types as strings
		Counts    []int64              // count of entries linked by index to this.Data
	}

	wi := models.WastageItem{}
	ws := WastageSetting{
		Locations: wi.Locations(),
		Units:     wi.Units(),
		Data:      make([]models.WastageItem, 0),
		Counts:    make([]int64, 0),
	}

	for _, n := range data {
		n.GenString()
		ws.Data = append(ws.Data, n)

		// retrieve count of all wastage entries for this item
		var data []models.WastageEntry
		res := db.Where("Item = ?", n.ID).Find(&data)

		ws.Counts = append(ws.Counts, res.RowsAffected)
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

	return ReturnServerMessage(c, "Successfully updated", false)
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
		Name           string  `json:"Name"`
		Amount         float64 `json:"Amount"`
		Location       int     `json:"Location"`
		LocationString string  `json:"LocationString"`
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
		m := wi.Convert(n)
		wi.GenString()
		output.Data = append(output.Data, WasteViewItem{Name: wi.Name, Amount: m, Location: wi.Location,
			LocationString: wi.LocationString})
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

func DeleteWasteItemHandler(c echo.Context, db *gorm.DB) error {
	var items []int

	if err := c.Bind(&items); err != nil {
		log.Error().Err(err).Msg("Unable to bind parameters for [DeleteWasteItemHandler]")
		return err
	}

	// delete the items from the db
	db.Delete(&models.WastageItem{}, items)

	return c.JSON(http.StatusOK, models.ServerReturnMessage{
		Message: "Items To Be Deleted NYI",
		Error:   true,
	})
}

func AddNewWasteItemHandler(c echo.Context, db *gorm.DB) error {
	type itemInfo struct {
		Name     string `json:"name"`
		Unit     int    `json:"unit"`
		Location int    `json:"location"`
	}

	var info itemInfo
	if err := c.Bind(&info); err != nil {
		log.Error().Err(err).Msg("Unable to bind paramters. [AddNewWasteItemHandler]")
		return ReturnServerMessage(c, "Unable to bind paramters", true)
	}

	wi := models.WastageItem{
		Name:        info.Name,
		UnitMeasure: info.Unit,
		Location:    info.Location,
	}

	db.Save(&wi)

	return ReturnServerMessage(c, "Item Addedd Successfully", false)
}

func CombineWasteHandler(c echo.Context, db *gorm.DB) error {
	type combineData struct {
		Items  []uint // list of id's to combine to
		Target uint   // target id to combine all ids together to
	}

	var data combineData
	if err := c.Bind(&data); err != nil {
		log.Error().Err(err).Msg("Unable to bind parameters [CombineWasteHandler]")
		return err
	}

	// make sure the target item is not in the list of items to retrieve
	items := make([]uint, 0)
	for _, i := range data.Items {
		if i != data.Target {
			items = append(items, i)
		}
	}

	for _, i := range items {
		var wi []models.WastageEntry

		res := db.Where("Item = ?", i).Find(&wi)
		if res.Error != nil {
			log.Error().Err(res.Error).Msg("Unable to retrieve wastage entries to combine")
			/*return c.JSON(http.StatusOK, models.ServerReturnMessage{
				Message: "Unable to retrieve entries to combine",
				Error:   true,
			})*/
			return ReturnServerMessage(c, "Unable to retrieve entries to combine", true)
		}

		for _, obj := range wi {
			obj.Item = data.Target
			db.Save(&obj)
		}
	}

	return ReturnServerMessage(c, "Items Combined Successfully", false)
}

func GetWasteNamesHandler(c echo.Context, db *gorm.DB) error {
	var items []models.WastageItem
	res := db.Find(&items)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve wastage items for [GetWasteNamesHandler]")
		return c.JSON(http.StatusOK, models.ServerReturnMessage{
			Message: "Unable to retrieve names",
			Error:   true,
		})
	}

	names := make([]string, 0)
	for _, i := range items {
		names = append(names, i.Name)
	}

	return c.JSON(http.StatusOK, names)
}

func GetWasteHoldingHandler(c echo.Context, db *gorm.DB) error {
	var items []models.WastageEntryHolding

	res := db.Find(&items)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve wastage items for [GetWasteHoldingHandler]")
		return ReturnServerMessage(c, "Unable to retrieve names", true)
	}

	return c.JSON(http.StatusOK, items)
}

func AddWasteHoldingHandler(c echo.Context, db *gorm.DB) error {
	type addWasteHolding struct {
		Item   string
		Amount float64
		Date   datatypes.Date
	}

	var data addWasteHolding
	if err := c.Bind(&data); err != nil {
		log.Error().Err(err).Msg("Unable to bind parameters [AddWasteHoldingHandler]")
		return ReturnServerMessage(c, "Unable to bind paramters", true)
	}

	// get the item we are adding to the hold
	// if we dont have it, add it to the db and returns its id
	item := getWastageIdByName(data.Item)
	entry := models.WastageEntryHolding{
		Item:   item,
		Date:   data.Date,
		Amount: data.Amount,
	}

	log.Debug().Msgf("Saving wastage entry: %v (%v) [Amount: %v]", data.Item, item, data.Amount)
	db.Save(&entry)

	return ReturnServerMessage(c, "Holding entry added sucessfully", false)
}

func getWastageIdByName(name string) uint {
	return 0
}

// remove all wastage items with no associated entries
func RemoveUnusedWasteItems(c echo.Context, db *gorm.DB) error {
	// 1) retrieve all items
	// 2) for each item, retrieve all entries for it
	// 3) if 0 found, add item id to remove list
	var items []models.WastageItem

	res := db.Find(&items)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve wastage items")
		return ReturnServerMessage(c, "Unable to retrieve wastage items", true)
	}

	remove := make([]uint, 0)

	for _, i := range items {
		// 2) retrieve all the entries and check the total count
		var entr []models.WastageEntry

		res = db.Find(&entr, "Item = ?", i.ID)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve wastage entries for item: %v [%v]", i.ID, i.Name)
			continue
		}

		if res.RowsAffected == 0 {
			// add to remove list
			log.Debug().Msgf("Removing item [%v] from wastage", i.Name)
			remove = append(remove, i.ID)
		}
	}

	// remove all the empty entries
	db.Delete(&models.WastageItem{}, remove)

	return ReturnServerMessage(c, "Removed unused waste items", false)
}
