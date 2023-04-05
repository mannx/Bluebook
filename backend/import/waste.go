package daily

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
	"time"

	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"github.com/xuri/excelize/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type wasteData struct {
	date   time.Time
	item   int
	amount float64
}

// needs fixing
func getCell(row int, col int) string {
	c := int('A') + col
	return fmt.Sprintf("%c%v", rune(c), row)
}

// Import a waste sheet given its filename
func ImportWaste(fileName string, db *gorm.DB) error {
	f, err := excelize.OpenFile(fileName)
	if err != nil {
		return err
	}

	defer func() {
		if err := f.Close(); err != nil {
			log.Error().Err(err).Msg("Unable to close spreadsheet")
		}
	}()

	for i, n := range f.GetSheetMap() {
		fmt.Printf("[%v] %v\n", i, n)
	}

	var currDate time.Time // keeps track of the last date we saw

	const wasteDateFormat = "_2-Jan-2006"

	for row := 2; ; row++ {
		// retrieve the date if available
		dat, err := f.GetCellValue("Waste Sheet", getCell(row, 0))
		if err != nil {
			log.Warn().Err(err).Msg("Unable to read cell (1)")
			break
		}

		if dat != "" {
			// have a new date
			currDate, err = time.Parse(wasteDateFormat, dat)
			if err != nil {
				log.Error().Err(err).Msg("Bad date format found!")
				return err
			}
		}

		// get the item and quantity
		item, err := f.GetCellValue("Waste Sheet", getCell(row, 1))
		if err != nil {
			log.Warn().Err(err).Msg("Unable to read cell (2)")
			break
		}

		if item == "" {
			// empty item means end of list
			break
		}

		item = strings.ToLower(item) //force lowercase to minimize having to combine later

		quant, err := f.GetCellValue("Waste Sheet", getCell(row, 2))
		if err != nil {
			log.Warn().Err(err).Msg("Unable to read cell (3)")
			break
		}

		// save it
		// check if item exists in WastageEntry, otherwise
		// create a new entry and use its ID

		obj := models.WastageItem{}
		res := db.Find(&obj, "Name = ?", item)
		if res.RowsAffected == 0 {
			// unable to retrieve the item, create a new entry
			obj.Name = item
			r := db.Save(&obj)
			if r.Error != nil {
				return err
			}
		} else if res.Error != nil {
			// other error
			log.Error().Err(res.Error).Msg("Error")
			return res.Error
		}

		amount, err := strconv.ParseFloat(quant, 64)
		if err != nil {
			return err
		}

		wi := models.WastageEntry{
			Item:   obj.ID,
			Date:   datatypes.Date(currDate),
			Amount: amount,
		}

		res = db.Save(&wi)
		if res.Error != nil {
			return err
		}
	}

	return nil
}

// ImportWasteDefinition imports waste entries give a simple JSON config
func ImportWasteDefinition(fileName string, db *gorm.DB) error {
	f, err := ioutil.ReadFile(fileName)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to read file: %v", fileName)
		return err
	}

	type WasteData struct {
		Name      string
		UnitCount int
		Location  int
	}

	type WasteInfo struct {
		Data []WasteData
	}

	var obj WasteInfo

	err = json.Unmarshal(f, &obj)
	if err != nil {
		log.Error().Err(err).Msg("Unable to parse waste data...")
		return err
	}

	for _, n := range obj.Data {
		wi := models.WastageItem{
			Name:        strings.ToLower(n.Name),
			UnitMeasure: n.UnitCount,
			Location:    n.Location,
		}

		db.Save(&wi)

	}

	return nil
}
