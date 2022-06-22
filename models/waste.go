package models

import (
	"sort"

	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

//////////////////////
//		Wastage		//
//////////////////////

// Various wastage constants
const (
	WasteUnitCount = 0 // item is counted as a unit
	WastePounds    = 1 // item is counted in pounds (almost same as unit)
	WasteKilo      = 2 // item is counted in kilos
	WasteGram      = 3 // item is counted in grams

	WasteLocationOther      = 0 // item is located inan unspecificed area
	WasteLocationProtein    = 1 // item is a protein
	WasteLocationVegetable  = 2
	WasteLocationCookieChip = 3 // item is either cookies or chips
	WasteLocationBread      = 4 // item is a type of bread
)

var unitStringTable = map[int]string{
	WasteUnitCount: "Count",
	WastePounds:    "lbs",
	WasteKilo:      "kilo",
	WasteGram:      "gram",
}

var locationStringTable = map[int]string{
	WasteLocationOther:      "Other",
	WasteLocationProtein:    "Protein",
	WasteLocationVegetable:  "Vegetable",
	WasteLocationCookieChip: "Cookie/Chips",
	WasteLocationBread:      "Bread",
}

//
//	Contains description of a single item and how it is counted
//
type WastageItem struct {
	gorm.Model

	Name             string  `gorm:"column:Name"`
	UnitMeasure      int     `gorm:"column:UnitMeasure"`      // how is this item measured (WasteUnitCount/Pounds/Kilo/etc)
	Location         int     `gorm:"column:Location"`         // where is the found
	CustomConversion bool    `gorm:"column:CustomConversion"` // do we havea custom conversion in use? if so, Weight*CustomConversion => UnitMeasure => Ouput value
	UnitWeight       float64 `gorm:"column:UnitWeight"`       // what we multiple the items weight/count by if custom

	// the remaing fields are not stored in the db, and only provide data generated at runtime
	UnitString     string `gorm:"-"` // string version of the unit measure
	LocationString string `gorm:"-"` // string version of the location
}

//
//	Contains 1 item that has been wasted
//
type WastageEntry struct {
	gorm.Model

	Item   uint           `gorm:"column:Item"` // item ID for an entry in the WastageItem table
	Date   datatypes.Date `gorm:"column:Date"`
	Amount float64        `gorm:"column:Amount"`
}

//
//	Contains a WastageEntry entry while editing.  Once all entries have been added,
//	will get moved into WastageEntry table and these entries cleared out.
//	This lets us start entering data, but dont have to submit until ready to the main tables
type WastageEntryHolding struct {
	gorm.Model

	Item   uint           `gorm:"column:Item"`
	Date   datatypes.Data `gorm:"column:Date"`
	Amount float64        `gorm:"column:Amount"`
}

//
//	MEMBER FUNCTIONS
//

//
// WastageItem
//

// GenString generates the strings for the string version of unit, location, etc
func (wi *WastageItem) GenString() {
	(*wi).UnitString = unitStringTable[wi.UnitMeasure]
	(*wi).LocationString = locationStringTable[wi.Location]
}

func (wi *WastageItem) Locations() []string {
	d := make([]string, 0, len(locationStringTable))
	keys := make([]int, 0, len(locationStringTable))

	// extract the keys first, so we can sort then assemble the output array
	for k := range locationStringTable {
		keys = append(keys, k)
	}
	sort.Ints(keys)

	for _, k := range keys {
		d = append(d, locationStringTable[k])
	}

	return d
}

func (wi *WastageItem) Units() []string {
	d := make([]string, 0, len(unitStringTable))
	keys := make([]int, 0, len(unitStringTable))

	// extract the keys first, so we can sort then assemble the output array
	for k := range unitStringTable {
		keys = append(keys, k)
	}
	sort.Ints(keys)

	for _, k := range keys {
		d = append(d, unitStringTable[k])
	}

	return d
}

// Convert the weight to custom weight type or conversion factor
func (wi *WastageItem) Convert(n float64) float64 {
	if wi.CustomConversion == true {
		log.Debug().Msg("WastageItem::Convert() => custom conversion")
		return n * wi.UnitWeight
	}

	// convert to kilo/gram if required
	switch wi.UnitMeasure {
	case WasteKilo:
		log.Debug().Msgf("WastageItem::Convert() %v => Kilos", wi.Name)
		return n * 0.45359237
	case WasteGram:
		log.Debug().Msgf("WastageItem::Convert() %v => Grams", wi.Name)
		return n * 453.59237
	}

	return n
}
