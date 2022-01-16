package daily

/* this contains the functions and structures needed to import a daily sheet.
ImportDaily(file string) -> imports a daily sheet from the provided file name
*/

import (
	"strconv"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/xuri/excelize/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	models "github.com/mannx/Bluebook/models"
)

const dateFormat = "2-Jan-06" // format used when parsing time from sheets
const dateFormat2 = "2006-Jan-02"

// ImportDaily is used to import a single sheet into the database
func ImportDaily(fileName string, db *gorm.DB) error {
	log.Info().Msgf("ImportDaily(%v)", fileName)

	f, err := excelize.OpenFile(fileName)
	if err != nil {
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

	log.Debug().Msgf("Sheet version: %v", version)

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
			log.Debug().Msgf("found empty day, leaving after: %v", numDays)
			break
		}

		// validate proper days
		// date format: DD-MMM-YYYY
		const form = "2-Jan-06"
		d, de := time.Parse(form, n)
		if de != nil {
			log.Debug().Err(de).Msgf("Unable to parse time: %v", n)
		} else {
			log.Debug().Msgf("date: %v (%T)", d, d)
		}

		log.Debug().Msgf("another day. value: %v (%T)", n, n)
		numDays = numDays + 1
	}

	log.Debug().Msgf("Processing %v days", numDays)

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
			continue
		}

		dd := extractData(f, i, d, version, db)

		// save to database
		db.Save(&dd)
	}

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

	n, err := strconv.ParseFloat(v, 64)
	if err != nil {
		//log.Error().Err(err).Msgf("unable to get float from %v", cell)
		return 0.0
	}

	return n
}

func extractData(sheet *excelize.File, index int, date time.Time, ver int, db *gorm.DB) models.DayData {
	log.Debug().Msgf("extractData(%v, %v, %v)", index, date, ver)

	// 1) check if we already have an entry, if so, we will update it
	//   otherwise use a fresh copy
	dd := getDataOrNew(date, db)

	// 2) fill in the data from the sheet
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

	log.Debug().Msgf("cash deposit [%v] %v", date, dd.CashDeposit)

	return dd
}

func getDataOrNew(date time.Time, db *gorm.DB) models.DayData {
	n := models.DayData{}

	// TODO:
	//	check if we have an object already in the db

	//res := db.Where("Date = ?", date.Format(dateFormat2)).First(&n)
	res := db.Find(&n, "Date = ?", date)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to load data, using new data")
		return n
	}

	log.Info().Msgf("n: %T", n)
	return n
}