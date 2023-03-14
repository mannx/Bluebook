package daily

import (
	"errors"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// regular expressions to capture that wanted data

var reWeekEnding = regexp.MustCompile(`WEEK ENDING\s*(\d\d?)/(\d\d?)/(\d{4})`)
var reProductivity = regexp.MustCompile(`PRODUCTIVITY\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)`)
var reFactor = regexp.MustCompile(`FACTOR\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)`)
var reUnitsSold = regexp.MustCompile(`ALL UNITS SOLD\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+`)
var reCustomerCount = regexp.MustCompile(`CUSTOMER COUNT\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+`)
var reHoursWorked = regexp.MustCompile(`HOURS WORKED\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)`)

var reBreadWaste = regexp.MustCompile(`- CREDITS\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+`)

var reBreadOverShort = regexp.MustCompile(`= OVER\/SHORT\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)`)

// this allows us to parse values in the thousands, should only be required rarely, and doesnt seem to work well as the main regex
// find way to fix instead?
var reBreadOverShort2 = regexp.MustCompile(`/= OVER\/SHORT\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+`)

func ImportControl(fileName string, db *gorm.DB) error {
	log.Info().Msgf("ImportControl(%v)", fileName)

	// for now, we are parseing the sheet and outputing to make sure everything works as intended before commiting to the db
	//	1) convert the file from a pdf to a readable text file (saves to a temp file)
	txtFile, err := PDFToText(fileName)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to convert [%v] from pdf to a usuable text file.", fileName)
		return err
	}

	contents, err := os.ReadFile(txtFile)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to read temp text file [%v] for pdf file [%v]", txtFile, fileName)
		return err
	}

	cstr := string(contents[:])

	// find the week ending date
	weekEnding := reWeekEnding.FindStringSubmatch(cstr)
	if weekEnding == nil {
		log.Error().Msgf("Unable to find week ending date in file: %v", fileName)
		return errors.New("Unable to find week ending date")
	}

	month, _ := strconv.Atoi(weekEnding[1])
	day, _ := strconv.Atoi(weekEnding[2])
	year, _ := strconv.Atoi(weekEnding[3])

	// get the start and ending days of the week
	endDate := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	startDate := endDate.Add(-time.Hour * 24 * 6) // remove 6 days to get the correct start of the week

	// extract the relevant information
	prod := reProductivity.FindStringSubmatch(cstr)
	if prod == nil {
		return reFail("control.go", "Productivity")
	}

	factor := reFactor.FindStringSubmatch(cstr)
	if factor == nil {
		return reFail("control.go", "Factor")
	}

	unitSold := reUnitsSold.FindStringSubmatch(cstr)
	if unitSold == nil {
		return reFail("control.go", "Units Sold")
	}

	custCount := reCustomerCount.FindStringSubmatch(cstr)
	if custCount == nil {
		return reFail("control.go", "Customer count")
	}

	hoursWorkd := reHoursWorked.FindStringSubmatch(cstr)
	if hoursWorkd == nil {
		return reFail("control.go", "Hours worked")
	}

	breadCredits := reBreadWaste.FindStringSubmatch(cstr)
	if breadCredits == nil {
		return reFail("control.go", "Bread Credits")
	}

	// multiple possible results, we need the 2nd result
	bos := reBreadOverShort.FindAllStringSubmatch(cstr, -1)
	if bos == nil {
		// try the 2nd regex before fail
		// find way of not having to use 2 regex for this
		bos = reBreadOverShort2.FindAllStringSubmatch(cstr, -1)
		if bos == nil {
			return reFail("control.go", "Bread over short")
		}
	}

	// sometimes we only match with the over/short count we want
	// in that case use it, otherwise it will be the 2nd match
	var breadOverShort []string
	if len(bos) == 1 {
		breadOverShort = bos[0]
	} else {
		breadOverShort = bos[1]
	}

	// if we have data already, retrieve it, otherwise starta new entry
	// loop through either day, update and save back to the db
	for i := 0; i < 7; i++ {
		dur := time.Hour * 24 * time.Duration(i)
		currentDay := startDate.Add(dur)

		dd, _ := getDataOrNew(currentDay, db)

		dd.Date = datatypes.Date(currentDay)                   // make sure the date is correct (only required if new)
		dd.Productivity, _ = strconv.ParseFloat(prod[i+1], 64) // +1 since entry 0 is the full capture
		dd.Factor, _ = strconv.ParseFloat(factor[i+1], 64)
		dd.AdjustedSales, _ = strconv.ParseFloat(unitSold[i+1], 64)
		dd.CustomerCount, _ = strconv.Atoi(custCount[i+1])
		dd.HoursWorked, _ = strconv.ParseFloat(hoursWorkd[i+1], 64)
		dd.BreadCredits, _ = strconv.ParseFloat(breadCredits[i+1], 64)
		dd.BreadOverShort, _ = strconv.ParseFloat(breadOverShort[i+1], 64)

		// save it
		db.Save(&dd)

	}

	return nil
}
