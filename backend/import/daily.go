package daily

/* this contains the functions and structures needed to import a daily sheet.
ImportDaily(file string) -> imports a daily sheet from the provided file name
*/

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/xuri/excelize/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	models "github.com/mannx/Bluebook/models"
)

const dateFormat = "_2-Jan-06"      // format used when parsing time from sheets
const altDateFormat = "_2-Jan-2006" // possible other variation of the time format

// ImportDaily is used to import a single sheet into the database
func ImportDaily(fileName string, db *gorm.DB) error {
	log.Info().Msgf("ImportDaily(%v)", fileName)

	f, err := excelize.OpenFile(fileName)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to open file: %v", fileName)
		return err
	}

	defer func() {
		// close the sheet
		if err := f.Close(); err != nil {
			log.Error().Err(err).Msg("Unable to close spreadsheet")
		}
	}()

	// retrieve the spreadhseet version we are currently parsing
	// TODO: setup for future, but unliekly to add in support for older versions
	version := getSheetVersion(f) // default to current version

	// determine the number of days we are parsing
	// work right to left, then top down
	numDays := 0

	for _, i := range Dates {
		n, err := f.GetCellValue("Sheet1", i)
		if err != nil {
			log.Error().Err(err).Msgf("Unable to read cell Sheet1.%v", i)
			continue
		}

		if n == "" {
			// empty value, end our search here
			break
		}

		// validate proper days
		// date format: DD-MMM-YYYY
		_, de := time.Parse(dateFormat, n)
		if de != nil {
			_, de = time.Parse(altDateFormat, n)
			if de != nil {
				log.Warn().Err(de).Msgf("Unable to parse time (alt format): %v", n)
				// bad dates should cause a stop
				break
			}
		}

		numDays = numDays + 1
	}

	// loop through all the entries we have
	for i := 0; i < numDays; i++ {
		// get the date for this entry
		date, err := f.GetCellValue("Sheet1", Dates[i])
		if err != nil {
			log.Error().Err(err).Msg("Unable to get date value (2)")
			continue
		}

		// extract the data
		d, err := time.Parse(dateFormat, date)
		if err != nil {
			log.Error().Err(err).Msg("Unable to parse date (2)")
			d, err = time.Parse(altDateFormat, date)
			if err != nil {
				log.Error().Err(err).Msg("Unable to parse alt date (2)")
				continue
			}
		}

		dd, _ := extractData(f, i, d, version, db)

		// add a new entry to the backup table before creating or updating this record
		backup := models.DayDataBackup{
			DayData: dd,
			DayID:   dd.ID,
		}

		// if dd.ID == 0, then we have a fresh entry
		if dd.ID == 0 {
			backup.DayData = models.DayData{
				Date: dd.Date,
			}
		}

		log.Debug().Msgf(" == Backup original ID: %v", dd.ID)

		// save to database
		db.Save(&dd)

		// save the new id to the original id for the backup
		backup.DayID = dd.ID
		db.Save(&backup)

	}

	// create a notification to inform the user it has been imported
	models.NewNotification(fmt.Sprintf("Successfully import %v days from daily.", numDays), true, db)

	return nil
}

// returns which version of the sheet we are using
func getSheetVersion(sheet *excelize.File) int {
	return 0
}

// retruns a floating point number from a given cell
// if its not a floating point, return 0.0 and log an error
func getFloat(file *excelize.File, sheet string, cell string) float64 {
	v, err := file.GetCellValue(sheet, cell)
	if err != nil {
		log.Error().Err(err).Msgf("unable to get value from %v", cell)
		return 0.0
	}

	// strip away any $ in the front
	str := strings.ReplaceAll(strings.Trim(v, "$"), ",", "")
	n, err := strconv.ParseFloat(str, 64)
	if err != nil {
		log.Error().Err(err).Msgf("unable to get float from %v [%v]", cell, v)
		return 0.0
	}

	return n
}

// extractData builds the DayData data from the sheet, returns true if was a new entry, or false if it was updated
func extractData(sheet *excelize.File, index int, date time.Time, ver int, db *gorm.DB) (models.DayData, bool) {
	// 1) check if we already have an entry, if so, we will update it
	//   otherwise use a fresh copy
	dd, blank := getDataOrNew(date, db)

	// 2) fill in the data from the sheet
	//	any entry that uses a formula will automatically get the correct value
	//	instead of having to parse the formula ourselves
	dd.Date = datatypes.Date(date)

	dd.CashDeposit = getFloat(sheet, "Sheet1", CashDeposit[ver][index])

	// from sheet 2
	dd.DebitCard = getFloat(sheet, "Sheet2", DebitCard[ver][index])
	dd.MasterCard = getFloat(sheet, "Sheet2", MasterCard[ver][index])
	dd.Visa = getFloat(sheet, "Sheet2", VisaCard[ver][index])
	dd.PayPal = getFloat(sheet, "Sheet2", PayPal[ver][index])

	dd.Amex = getFloat(sheet, "Sheet1", AmexCard[ver][index])

	dd.CreditSales = getFloat(sheet, "Sheet1", CreditSales[ver][index])
	dd.GiftCardRedeem = getFloat(sheet, "Sheet1", GiftCardRedeem[ver][index])
	dd.SubwayCaters = getFloat(sheet, "Sheet1", SubwayCaters[ver][index])
	dd.SkipTheDishes = getFloat(sheet, "Sheet1", SkipTheDishes[ver][index])
	dd.DoorDash = getFloat(sheet, "Sheet1", DoorDash[ver][index])
	dd.PettyCash = getFloat(sheet, "Sheet1", PettyCash[ver][index])

	// credit side

	dd.Tips = getFloat(sheet, "Sheet1", Tips[ver][index])
	dd.HST = getFloat(sheet, "Sheet1", HST[ver][index])
	dd.BottleDeposit = getFloat(sheet, "Sheet1", BottleDeposit[ver][index])
	dd.NetSales = getFloat(sheet, "Sheet1", NetSales[ver][index])
	dd.CreditSalesRedeemed = getFloat(sheet, "Sheet1", CreditSalesRcv[ver][index])
	dd.CreditSalesRedeemed2 = getFloat(sheet, "Sheet1", CreditBev[ver][index])
	dd.CreditFood = getFloat(sheet, "Sheet1", CreditFood[ver][index])
	dd.GiftCardSold = getFloat(sheet, "Sheet1", GiftCardSold[ver][index])

	return dd, blank
}
