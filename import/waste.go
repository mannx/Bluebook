package daily

import (
	"fmt"
	"strconv"
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
	c := rune(int('A') + col)
	return fmt.Sprintf("%v%v", row, c)
}

// Import a waste sheet given its filename
func ImportWaste(fileName string, db *gorm.DB) error {
	log.Info().Msgf("ImportWaste(%v)", fileName)

	f, err := excelize.OpenFile(fileName)
	if err != nil {
		return err
	}

	defer func() {
		if err := f.Close(); err != nil {
			log.Error().Err(err).Msg("Unable to close spreadsheet")
		}
	}()

	var currDate time.Time // keeps track of the last date we saw

	for row := 2; ; row++ {
		// retrieve the date if available
		dat, err := f.GetCellValue("Sheet1", getCell(row, 1))
		if err != nil {
			log.Warn().Err(err).Msg("Unable to read cell")
			continue
		}

		if dat != "" {
			// have a new date
			currDate, err = time.Parse(dateFormat, dat)
			if err != nil {
				log.Error().Err(err).Msg("Bad date format found!")
				return err
			}
		}

		// get the item and quantity
		item, err := f.GetCellValue("Sheet1", getCell(row, 2))
		if err != nil {
			log.Warn().Err(err).Msg("Unable to read cell")
			continue
		}

		if item == "" {
			// empty item means end of list
			break
		}

		quant, err := f.GetCellValue("Sheet1", getCell(row, 3))
		if err != nil {
			log.Warn().Err(err).Msg("Unable to read cell")
			continue
		}

		// save it
		// check if item exists in WastageEntry, otherwise
		// create a new entry and use its ID

		var obj models.WastageItem
		res := db.Find(&obj, "Name = ?", item)
		if res.Error == gorm.ErrRecordNotFound {
			// unable to retrieve the item, create a new entry
			obj.Name = item
			r := db.Save(&obj)
			if r.Error != nil {
				return err
			}
		} else if res.Error != nil {
			// other error
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
