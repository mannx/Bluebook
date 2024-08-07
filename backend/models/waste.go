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
	WasteOunce     = 4 // item is counted in ounces
	WastePack      = 5 // item is a portion of a pack (needs pack size set, WasteageEntry.Amount / pack_size to get output weight)

	WasteLocationOther      = 0 // item is located inan unspecificed area
	WasteLocationProtein    = 1 // item is a protein
	WasteLocationVegetable  = 2
	WasteLocationCookieChip = 3 // item is either cookies or chips
	WasteLocationBread      = 4 // item is a type of bread
	WasteMAX                = 4 // max Location value
)

var unitStringTable = map[int]string{
	WasteUnitCount: "Count",
	WastePounds:    "lbs",
	WasteKilo:      "kilo",
	WasteGram:      "gram",
	WasteOunce:     "ounce",
	// WasteFrac:      "Frac",
	WastePack: "Pack",
}

var locationStringTable = map[int]string{
	WasteLocationOther:      "Other",
	WasteLocationProtein:    "Protein",
	WasteLocationVegetable:  "Vegetable",
	WasteLocationCookieChip: "Cookie/Chips",
	WasteLocationBread:      "Bread",
}

// Contains description of a single item and how it is counted
type WastageItem struct {
	gorm.Model

	Name             string  `gorm:"column:Name"`
	UnitMeasure      int     `gorm:"column:UnitMeasure"`      // how is this item measured (WasteUnitCount/Pounds/Kilo/etc)
	Location         int     `gorm:"column:Location"`         // where is the found
	CustomConversion bool    `gorm:"column:CustomConversion"` // do we havea custom conversion in use? if so, Weight*CustomConversion => UnitMeasure => Ouput value
	UnitWeight       float64 `gorm:"column:UnitWeight"`       // what we multiple the items weight/count by if custom
	// also what we divide by if Frac

	PackSize float64 `gorm:"column:PackSize"` // size of a pack to divide WasteageEntry.Amount by if UnitMeasure==WastePack

	// input waste is first converted to this measure unit before being divided by the pack size
	PackSizeUnit int `gorm:"column:PackSizeUnit"` // unit measurement for PackSize if UnitMeasure == WastePack.  This cannot be WastePack

	// the remaing fields are not stored in the db, and only provide data generated at runtime
	UnitString     string `gorm:"-"` // string version of the unit measure
	LocationString string `gorm:"-"` // string version of the location
}

// Contains 1 item that has been wasted
type WastageEntry struct {
	gorm.Model

	Item   uint           `gorm:"column:Item"` // item ID for an entry in the WastageItem table
	Date   datatypes.Date `gorm:"column:Date"`
	Amount float64        `gorm:"column:Amount"`
	Reason string         `gorm:"column:Reason"`
}

// WastageEntry but with the Item name instead of the index.  Not stored in DB, only used to pass data along
type WastageEntryNamed struct {
	// Name   string
	// Date   datatypes.Date
	// Amount float64
	WastageEntry

	Name string
}

// Contains a WastageEntry entry while editing.  Once all entries have been added,
// will get moved into WastageEntry table and these entries cleared out.
// This lets us start entering data, but dont have to submit until ready to the main tables
type WastageEntryHolding struct {
	gorm.Model

	Date   datatypes.Date `gorm:"column:Date"`
	Item   uint           `gorm:"column:Item"`
	Amount float64        `gorm:"column:Amount"`
	Reason string         `gorm:"column:Reason"`
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

func GetWasteUnitMapping() map[int]string {
	return unitStringTable
}

func GetWasteLocationMapping() map[int]string {
	return locationStringTable
}

// Convert the weight to custom weight type or conversion factor
func (wi *WastageItem) Convert(n float64) float64 {
	if wi.CustomConversion {
		return n * wi.UnitWeight
	}

	// convert to kilo/gram if required
	switch wi.UnitMeasure {
	case WasteKilo:
		return n * 0.45359237
	case WasteGram:
		return n * 453.59237
	case WasteOunce:
		// convert from ounce to pounds
		return n / 16
	case WastePack:
		if wi.PackSize != 0.0 {
			// convert n to the proper unit first, then divide
			x := do_convert(n, wi.PackSizeUnit)
			if x != 0. {
				return x / wi.PackSize
			} else {
				log.Warn().Msgf("[WastageItem 2] Trying to convert to pack size with no pack size set for item %v [x=%v]", wi.Name, x)
				return 0.
			}
		} else {
			log.Warn().Msgf("[WastageItem] Trying to convert to pack size with no pack size set for item %v", wi.Name)
			return 0.
		}
	}

	return n
}

// called when needing to convert the WastageItem amount before dividing by PackSize
// redo to avoid duplicate code between here and Convert()?
func do_convert(n float64, unit int) float64 {
	switch unit {
	case WasteKilo:
		return n * 0.45359237
	case WasteGram:
		return n * 453.59237
	case WasteOunce:
		// convert from ounce to pounds
		return n / 16
	case WasteUnitCount:
	case WastePounds:
		return n
	}

	if unit == WastePack {
		log.Error().Msgf("[do_convert] Unable to convert to type WastePack.  Returning 0.!")
		return 0.
	}

	log.Error().Msgf("[do_convert] Reached end with no conversion, returning 0.!")
	return 0.
}
