package api

import (
	"fmt"
	"net/http"
	"sort"
	"strconv"
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
	type wasteError struct {
		Message string `json:"Message"`
	}

	// WasteViewItem is  a single item and its total waste amount
	type WasteViewItem struct {
		Name           string  `json:"Name"`
		Amount         float64 `json:"Amount"`
		Location       int     `json:"Location"`
		LocationString string  `json:"LocationString"`
		UnitOfMeasure  string  `json:"UnitOfMeasure"` // unit of measure in string form
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
	weekStart := weekEnding.AddDate(0, 0, -6)

	log.Debug().Msgf("Retrieving waste from %v/%v - %v/%v",
		weekStart.Day(), weekStart.Month(), weekEnding.Day(), weekEnding.Month())
	// make sure we have a tuesday, week ending day
	if weekEnding.Weekday() != time.Tuesday {
		return ReturnServerMessage(c, "Can only view from a tuesday", true)
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
		output.Data = append(output.Data, WasteViewItem{
			Name:           wi.Name,
			Amount:         m,
			Location:       wi.Location,
			LocationString: wi.LocationString,
			UnitOfMeasure:  wi.UnitString,
		})
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

	return ReturnServerMessage(c, "Items deleted successfully", false)
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
		return ReturnServerMessage(c, "Unable to retrieve names", true)
	}

	names := make([]string, 0)
	for _, i := range items {
		names = append(names, i.Name)
	}

	return c.JSON(http.StatusOK, names)
}

type wasteHoldingJSON struct {
	Date     string
	Name     string  // name of the item
	Quantity float64 // amount
	ID       uint    // id of the entry
}

func getWasteHoldingEntries(db *gorm.DB) []wasteHoldingJSON {
	var items []models.WastageEntryHolding

	res := db.Find(&items)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve wastage items for [GetWasteHoldingHandler]")
		return nil
	}

	var out []wasteHoldingJSON
	for _, i := range items {
		// get the item name from the id
		var waste models.WastageItem
		name := "INVALID ID"

		res = db.First(&waste, i.Item)
		if res.Error != nil {
			log.Error().Msgf("Unable to find item id...")
		} else {
			name = waste.Name
		}

		// format the date to the expected type
		dateStr := time.Time(i.Date)
		log.Debug().Msgf("dateStr: [%v]", dateStr)

		out = append(out,
			wasteHoldingJSON{
				Name:     name,
				Quantity: i.Amount,
				ID:       i.ID,
				Date:     dateStr.Format(time.RFC3339),
			})
	}

	return out
}

func GetWasteHoldingHandler(c echo.Context, db *gorm.DB) error {
	return c.JSON(http.StatusOK, getWasteHoldingEntries(db))
}

func AddWasteHoldingHandler(c echo.Context, db *gorm.DB) error {
	log.Debug().Msg("[AddWasteHoldingHandler]")

	type addWasteHolding struct {
		Date     string
		Name     string
		Quantity string
	}

	var data addWasteHolding
	if err := c.Bind(&data); err != nil {
		log.Error().Err(err).Msg("Unable to bind parameters [AddWasteHoldingHandler]")
		return ReturnServerMessage(c, "Unable to bind paramters", true)
	}

	date, err := time.Parse(time.RFC3339, data.Date)
	if err != nil {
		return LogAndReturnError(c, fmt.Sprintf("Unable to parse input time [%v]", data.Date), err)
	}

	log.Debug().Msgf("Date: [%v]", date)

	// get the item we are adding to the hold
	// if we dont have it, add it to the db and returns its id
	item := getWastageIdByName(db, data.Name)

	// convert the quantity into a float64, return error if unable
	amount, err := strconv.ParseFloat(data.Quantity, 64)
	if err != nil {
		log.Error().Err(err).Msgf("[AddWasteHoldingHandler] Unable to convert string to float [%v]", data.Quantity)
		return ReturnServerMessage(c, "Unable to convert quanity to float", true)
	}

	entry := models.WastageEntryHolding{
		Item:   item,
		Amount: amount,
		Date:   datatypes.Date(date),
	}

	db.Save(&entry)

	return ReturnServerMessage(c, "Holding entry added sucessfully", false)
}

func WasteHoldingDeleteHandler(c echo.Context, db *gorm.DB) error {
	type holdingInput struct {
		ID int
	}

	var input holdingInput
	if err := c.Bind(&input); err != nil {
		log.Error().Err(err).Msg("[WasteHoldingDeleteHandler] Unable to bind paramters")
		return ReturnServerMessage(c, "Unable to bind parameters", true)
	}

	var entry models.WastageEntryHolding
	res := db.Find(&entry, input.ID)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve holding entry for [WasteHoldingDeleteHandler]")
		return ReturnServerMessage(c, "Unable to retrieve item from id", true)
	}

	db.Delete(&entry)

	type returnData struct {
		Error   bool
		Message string
		Items   []models.WastageEntryHolding
	}

	ret := returnData{
		Error:   false,
		Message: "",
	}

	// return a blank error message (allows front end to process result same either way)
	// along with the current holding table
	res = db.Find(&ret.Items)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve holding table (2) for [WasteHoldingDeleteHandler]")
		return ReturnServerMessage(c, "Unable to retrieve holding table", true)
	}

	return c.JSON(http.StatusOK, &ret)
}

//
//
//

// WasteHoldingConfirmHandler confirms the holding table and merges it into the waste table.
//
//	expects a week ending date POST'd to the Date field
func WasteHoldingConfirmHandler(c echo.Context, db *gorm.DB) error {
	type wasteConfirm struct {
		Month int
		Day   int
		Year  int
	}

	var data wasteConfirm

	if err := c.Bind(&data); err != nil {
		log.Error().Err(err).Msg("[WasteHoldingConfirm] Unable to bind week ending date")
		return ReturnServerMessage(c, "Unable to bind week ending date", true)
	}

	// build the date object for each item
	date := time.Date(data.Year, time.Month(data.Month), data.Day, 0, 0, 0, 0, time.UTC)

	// get all the holding entries
	var holding []models.WastageEntryHolding
	res := db.Find(&holding)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("[WastageHoldingConfirm] Unable to retrieve wastage holding data")
		return ReturnServerMessage(c, "DB Error", true)
	}

	// convert to wastage entries
	var waste []models.WastageEntry

	for _, i := range holding {
		waste = append(waste,
			models.WastageEntry{
				Item:   i.Item,
				Date:   datatypes.Date(date),
				Amount: i.Amount,
				//
				//
				//
			})
	}

	// save the wastage
	db.Save(&waste)

	// clear the holding table
	//	need Where() to force the delete of the table
	db.Where("1 = 1").Delete(&models.WastageEntryHolding{})

	//
	return ReturnServerMessage(c, "Merge Success", false)
}

//

// return the id of a wastage item given its name,
//
//	if the item is not found, add it to the db with default values and return its id
func getWastageIdByName(db *gorm.DB, name string) uint {
	// retruns the first id that matches
	var entry models.WastageItem

	res := db.Where("Name = ?", name).First(&entry)
	if res.Error != nil {
		// attempt to create the entry
		entry = models.WastageItem{
			Name: name,
		}

		log.Debug().Msgf("Creating new waste item: %v", name)
		db.Save(&entry)

		log.Debug().Msgf("New ID: %v", entry.ID)
		return entry.ID
	}

	return entry.ID
}

// remove all wastage items with no associated entries
func RemoveUnusedWasteItems(c echo.Context, db *gorm.DB) error {
	// 1) retrieve all items
	// 2) for each item, retrieve all entries for it
	// 3) if 0 found, add item id to remove list
	var items []models.WastageItem

	res := db.Find(&items)
	if res.Error != nil {
		//
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
			remove = append(remove, i.ID)
		}
	}

	// remove all the empty entries
	db.Delete(&models.WastageItem{}, remove)

	return ReturnServerMessage(c, "Removed unused waste items", false)
}
