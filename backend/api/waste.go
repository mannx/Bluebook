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
		return LogAndReturnError(c, "Unable to retrieve wastage items", res.Error)
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

func UpdateWasteSettingHandler(c echo.Context, db *gorm.DB) error {
	type itemUpdate struct {
		Name         string
		ID           int
		Unit         int
		HasCustom    bool
		Conversion   float64
		Location     int
		PackSize     float64
		PackSizeUnit int
	}

	update := itemUpdate{}
	if err := c.Bind(&update); err != nil {
		return LogAndReturnError(c, "Failed to bind data for UpdateWasteSettings", err)
	}

	var data models.WastageItem
	res := db.Where("ID = ?", update.ID).Find(&data)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to find waste item", res.Error)
	}

	// update the required fields
	if data.Name != update.Name {
		data.Name = update.Name
	}

	data.Location = update.Location
	data.UnitMeasure = update.Unit
	data.CustomConversion = update.HasCustom
	data.PackSize = update.PackSize
	data.PackSizeUnit = update.PackSizeUnit

	log.Debug().Msgf("pack Size unit: %v", data.PackSizeUnit)
	if data.CustomConversion {
		data.UnitWeight = update.Conversion
	}

	db.Save(&data)

	return ReturnServerMessage(c, "Success", false)
}

// return a combined waste report for week ending
//		/api/../?month=MONTH&year=YEAR&day=DAY
//		where month and year are 2 and 4 digits each

// WasteViewItem is  a single item and its total waste amount
type WasteViewItem struct {
	Name           string  // `json:"Name"`
	LocationString string  // `json:"LocationString"`
	UnitOfMeasure  string  // `json:"UnitOfMeasure"` // unit of measure in string form
	Amount         float64 // `json:"Amount"`
	Location       int     // `json:"Location"`
}

// GetWasteViewHandler handls the waste report generation
func GetWasteViewHandler(c echo.Context, db *gorm.DB) error {
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

	// make sure we have a tuesday, week ending day
	if weekEnding.Weekday() != time.Tuesday {
		return ReturnServerMessage(c, "Can only view from a tuesday", true)
	}

	// retrieve the data
	waste := make([]models.WastageEntry, 0)
	res := db.Order("Date").Find(&waste, "Date >= ? AND Date <= ?", weekStart, weekEnding)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve wastage data", res.Error)
	}

	// total same units together
	data := map[uint]float64{} // store the running total for each item
	for _, n := range waste {
		data[n.Item] = data[n.Item] + n.Amount
	}

	// output := WasteView{WeekEnding: weekEnding}
	output := WasteView{}
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

	sorted := sortWasteOutput(output.Data)
	loc := 0
	final := make([]WasteViewItem, 0)

	for _, v := range sorted {
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

// sort the data by category, then alphabetically
func sortWasteOutput(data []WasteViewItem) []WasteViewItem {
	// add all items to a map given its location
	col := make(map[int][]WasteViewItem)

	// sort by location
	for _, obj := range data {
		col[obj.Location] = append(col[obj.Location], obj)
	}

	// sort by name within location
	for key, val := range col {
		sort.Slice(val, func(i, j int) bool {
			return val[i].Name < val[j].Name
		})

		col[key] = val
	}

	// collapse back into a single slice
	out := make([]WasteViewItem, 0)
	for i := models.WasteMAX; i >= 0; i-- {
		out = append(out, col[i]...)
	}

	return out
}

func DeleteWasteItemHandler(c echo.Context, db *gorm.DB) error {
	var items []int

	if err := c.Bind(&items); err != nil {
		return LogAndReturnError(c, "Unable to bind parameters for [DeleteWasteItemHandler]", err)
	}

	// delete the items from the db
	db.Delete(&models.WastageItem{}, items)

	return ReturnServerMessage(c, "Items deleted successfully", false)
}

// Add new item to the db and return its ID for editing
func AddNewWasteItemHandler(c echo.Context, db *gorm.DB) error {
	item := models.WastageItem{}
	db.Save(&item)

	type returnData struct {
		ID uint
	}

	return c.JSON(http.StatusOK, &returnData{
		ID: item.ID,
	})
}

func CombineWasteHandler(c echo.Context, db *gorm.DB) error {
	type combineData struct {
		Items  []uint // list of id's to combine to
		Target uint   // target id to combine all ids together to
	}

	var data combineData
	if err := c.Bind(&data); err != nil {
		return LogAndReturnError(c, "Unable to bind parameters [CombineWasteHandler]", err)
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
			return LogAndReturnError(c, "Unable to retrieve entries to combine", res.Error)
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
		return LogAndReturnError(c, "Unable to retrieve names", res.Error)
	}

	names := make([]string, 0)
	for _, i := range items {
		names = append(names, i.Name)
	}

	return c.JSON(http.StatusOK, names)
}

type wasteHoldingJSON struct {
	Name     string // name of the item
	Reason   string
	Quantity float64 // amount
	ID       uint    // id of the entry
	Year     int
	Month    int
	Day      int
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
		date := time.Time(i.Date)

		out = append(out,
			wasteHoldingJSON{
				Name:     name,
				Quantity: i.Amount,
				ID:       i.ID,
				Year:     date.Year(),
				Month:    int(date.Month()),
				Day:      date.Day(),
				Reason:   i.Reason,
			})
	}

	return out
}

func GetWasteHoldingHandler(c echo.Context, db *gorm.DB) error {
	return c.JSON(http.StatusOK, getWasteHoldingEntries(db))
}

func AddWasteHoldingHandler(c echo.Context, db *gorm.DB) error {
	type addWasteHolding struct {
		Date     string
		Name     string
		Quantity string
		Reason   string
	}

	var data addWasteHolding
	if err := c.Bind(&data); err != nil {
		return LogAndReturnError(c, "Unable to bind paramters", err)
	}

	date, err := time.Parse("01-02-2006", data.Date)
	if err != nil {
		return LogAndReturnError(c, fmt.Sprintf("Unable to parse input time [%v]", data.Date), err)
	}

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
		Reason: data.Reason,
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
		return LogAndReturnError(c, "Unable to bind parameters", err)
	}

	var entry models.WastageEntryHolding
	res := db.Find(&entry, input.ID)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve item from id", res.Error)
	}

	db.Delete(&entry)

	type returnData struct {
		Message string
		Items   []wasteHoldingJSON
		Error   bool
	}

	ret := returnData{
		Error:   false,
		Message: "",
		Items:   getWasteHoldingEntries(db),
	}

	return c.JSON(http.StatusOK, &ret)
}

// WasteHoldingConfirmHandler confirms the holding table and merges it into the waste table.
//
//	expects a week ending date POST'd to the Date field
func WasteHoldingConfirmHandler(c echo.Context, db *gorm.DB) error {
	// get all the holding entries
	var holding []models.WastageEntryHolding
	res := db.Find(&holding)
	if res.Error != nil {
		return LogAndReturnError(c, "[WastageHoldingConfirm] Unable to retrieve wastage holding data", res.Error)
	}

	// convert to wastage entries
	var waste []models.WastageEntry

	for _, i := range holding {
		waste = append(waste,
			models.WastageEntry{
				Item:   i.Item,
				Date:   i.Date,
				Amount: i.Amount,
				Reason: i.Reason,
			})
	}

	// save the wastage
	db.Save(&waste)

	// clear the holding table
	//	need Where() to force the delete of the table
	db.Where("1 = 1").Delete(&models.WastageEntryHolding{})

	return ReturnServerMessage(c, "Merge Success", false)
}

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

		db.Save(&entry)
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
		return LogAndReturnError(c, "Unable to retrieve wastage items", res.Error)
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

// export waste report for given end of week date POST'd to us
func WasteExport(c echo.Context, db *gorm.DB) error {
	type inputDate struct {
		Year  int
		Month int
		Day   int
	}

	var input inputDate

	if err := c.Bind(&input); err != nil {
		return LogAndReturnError(c, "[WasteExport] Unable to bind parameters", err)
	}

	// build the end date, and determine the start of the week
	endDate := time.Date(input.Year, time.Month(input.Month), input.Day, 0, 0, 0, 0, time.UTC)
	startDate := endDate.AddDate(0, 0, -6)

	// retrieve the data
	waste := make([]models.WastageEntry, 0)
	res := db.Order("Date").Find(&waste, "Date >= ? AND Date <= ?", startDate, endDate)
	if res.Error != nil {
		return LogAndReturnError(c, "[WasteExport] Unable to retrieve wastage data", res.Error)
	}

	// retrieve all entry item names to prepare for export
	names := make(map[uint]string)
	output := make([]models.WastageEntryNamed, 0)

	for _, e := range waste {
		// retrieve the entry name
		n, ok := names[e.Item]
		if !ok {
			// not found, lookup and store
			var item models.WastageItem
			res = db.Find(&item, "ID = ?", e.Item)
			if res.Error != nil {
				return LogAndReturnError(c, "[WasteExport] Unable to retrieve item data", res.Error)
			}

			// store and return the name
			names[e.Item] = item.Name
			n = item.Name
		}

		output = append(output, models.WastageEntryNamed{
			Name:         n,
			WastageEntry: e,
		})
	}

	// perform the actual export of the data
	err := exportWaste(output, endDate)
	if err != nil {
		return LogAndReturnError(c, "[WasteExport] Unable to export data", err)
	}

	return ReturnServerMessage(c, "Success", false)
}

// Return the information about a single waste entry to be used to edit
func GetWasteItemInfo(c echo.Context, db *gorm.DB) error {
	// combined data we will be returning
	type returnData struct {
		Units     map[int]string
		Locations map[int]string
		Item      models.WastageItem
		Count     uint // total number of wastage entries
	}

	var id uint

	err := echo.QueryParamsBinder(c).
		Uint("id", &id).
		BindError()
	if err != nil {
		return LogAndReturnError(c, "Unable to bind paramter: id", err)
	}

	var entry models.WastageItem
	res := db.Where("ID = ?", id).First(&entry)
	if res.Error != nil {
		return LogAndReturnError(c, "ID not found for wastage item", res.Error)
	}

	obj := returnData{
		Item:      entry,
		Count:     0,
		Units:     models.GetWasteUnitMapping(),
		Locations: models.GetWasteLocationMapping(),
	}

	return c.JSON(http.StatusOK, &obj)
}
