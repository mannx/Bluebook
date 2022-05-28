package models

import (
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

// GenString generates the strings for the string version of unit, location, etc
func (wi *WastageItem) GenString() {
	(*wi).UnitString = unitStringTable[wi.UnitMeasure]
	(*wi).LocationString = locationStringTable[wi.Location]

	log.Debug().Msgf("[WastageItem::GenString]Unit String: %v", wi.UnitString)
}

func (wi *WastageItem) Locations() map[int]string {
	return locationStringTable
}

func (wi *WastageItem) Units() map[int]string {
	return unitStringTable
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
