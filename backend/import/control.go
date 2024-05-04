package daily

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// regular expressions to capture that wanted data

var (
	reWeekEnding    = regexp.MustCompile(`WEEK ENDING\s*(\d\d?)/(\d\d?)/(\d{4})`)
	reProductivity  = regexp.MustCompile(`PRODUCTIVITY\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)`)
	reFactor        = regexp.MustCompile(`FACTOR\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)`)
	reUnitsSold     = regexp.MustCompile(`ALL UNITS SOLD\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+`)
	reCustomerCount = regexp.MustCompile(`CUSTOMER COUNT\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+`)
	reHoursWorked   = regexp.MustCompile(`HOURS WORKED\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)`)
)

var reBreadWaste = regexp.MustCompile(`- CREDITS\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+`)

var reBreadOverShort = regexp.MustCompile(`= OVER\/SHORT\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)`)

// this allows us to parse values in the thousands, should only be required rarely, and doesnt seem to work well as the main regex
// find way to fix instead?
var reBreadOverShort2 = regexp.MustCompile(`/= OVER\/SHORT\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+`)

var reNetSales = regexp.MustCompile(`NET SUBWAY SALES\s+(\d+,?\d+[.]\d+)`) // 1 group -> weekly net sales

func ImportControl(fileName string, db *gorm.DB) ImportReport {
	log.Info().Msgf("ImportControl(%v)", fileName)
	report := ImportReport{
		Messages: make([]string, 0),
	}

	// for now, we are parseing the sheet and outputing to make sure everything works as intended before commiting to the db
	//	1) convert the file from a pdf to a readable text file (saves to a temp file)
	txtFile, err := PDFToText(fileName)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to convert [%v] from pdf to a usuable text file.", fileName)
		// return ImportReport{}
		report.Add(fmt.Sprintf("Unable to convert [%v] from pdf to a usuable text file.", fileName))
		return report
	}

	contents, err := os.ReadFile(txtFile)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to read temp text file [%v] for pdf file [%v]", txtFile, fileName)
		// return ImportReport{}
		report.Add(fmt.Sprintf("Unable to read temp text file [%v] for pdf file [%v]", txtFile, fileName))
		return report
	}

	cstr := string(contents[:])

	// find the week ending date
	weekEnding := reWeekEnding.FindStringSubmatch(cstr)
	if weekEnding == nil {
		log.Error().Msgf("Unable to find week ending date in file: %v", fileName)
		// return errors.New("unable to find week ending date")
		// return ImportReport{}
		report.Add(fmt.Sprintf("Unable to find week ending date in file: %v", fileName))
		return report
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
		// return reFail("control.go", "Productivity")
		// _ = reFail("control.go", "Productivity")
		// return ImportReport{}
		report.Add("[control] Unable to parse Productivity")
	}

	factor := reFactor.FindStringSubmatch(cstr)
	if factor == nil {
		// return reFail("control.go", "Factor")
		// _ = reFail("control.go", "Factor")
		// return ImportReport{}
		report.Add("[control] Unable to parse Factor")
	}

	unitSold := reUnitsSold.FindStringSubmatch(cstr)
	if unitSold == nil {
		// return reFail("control.go", "Units Sold")
		// _ = reFail("control.go", "Units Sold")
		// return ImportReport{}
		report.Add("[control] Unable to parse Units Sold")
	}

	custCount := reCustomerCount.FindStringSubmatch(cstr)
	if custCount == nil {
		// return reFail("control.go", "Customer count")
		// _ = reFail("control.go", "Customer count")
		// return ImportReport{}
		report.Add("[control] Unable to parse Customer Count")
	}

	hoursWorkd := reHoursWorked.FindStringSubmatch(cstr)
	if hoursWorkd == nil {
		// return reFail("control.go", "Hours worked")
		// _ = reFail("control.go", "Hours worked")
		// return ImportReport{}
		report.Add("[control] Unable to parse Hours Workd")
	}

	breadCredits := reBreadWaste.FindStringSubmatch(cstr)
	if breadCredits == nil {
		// return reFail("control.go", "Bread Credits")
		// _ = reFail("control.go", "Bread Credits")
		// return ImportReport{}
		report.Add("[control] Unable to parse Bread Credits")
	}

	netSales := reNetSales.FindStringSubmatch(cstr)
	if netSales == nil {
		// return reFail("control.go", "Net Sales")
		// _ = reFail("control.go", "Net Sales")
		// return ImportReport{}
		report.Add("[control] Unable to parse Net Sales")
	}

	// multiple possible results, we need the 2nd result
	bos := reBreadOverShort.FindAllStringSubmatch(cstr, -1)
	if bos == nil {
		// try the 2nd regex before fail
		// find way of not having to use 2 regex for this
		bos = reBreadOverShort2.FindAllStringSubmatch(cstr, -1)
		if bos == nil {
			// return reFail("control.go", "Bread over short")
			// _ = reFail("control.go", "Bread over short")
			// return ImportReport{}
			report.Add("[control] Unable to parse Bread over short")
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

	// save the netsales in the weeklyinfo table
	// check if we have a current entry
	wi := models.WeeklyInfo{}

	// get the weekly info table entry, or create a new one if not already in db
	res := db.Where("Date = ?", endDate).Find(&wi)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("DB Error")
		// return reFail("control.go", "Unable to retrieve weekly information for netsales")
		// _ = reFail("control.go", "Unable to retrieve weekly information for netsales")
		// return ImportReport{}
		report.Add("[control] Unable to retrieve weekly information for netsales")
	}

	if res.RowsAffected == 0 {
		// nothing found, make sure we set the date
		wi.Date = datatypes.Date(endDate)
	}

	// update the netsales value and save
	ns, err := strconv.ParseFloat(strings.ReplaceAll(netSales[1], ",", ""), 64)
	if err != nil {
		// return reFail("control.go", "Unable to convert net sales to float")
		// _ = reFail("control.go", "Unable to convert net sales to float")
		// return ImportReport{}
		report.Add("[control] Unable to convert net sales to float")
	}

	wi.NetSales = ns
	res = db.Save(&wi)
	if res.Error != nil {
		log.Error().Err(res.Error).Msgf("Unable to save weekly info")
		// return reFail("control.go", "weekly info save")
		// _ = reFail("control.go", "weekly info save")
		// return ImportReport{}
		report.Add("[control] Unable to save weekly info")
	}

	if res.RowsAffected == 0 {
		log.Warn().Msgf("Unable to save WEEKLY_INFO record for date: %v", time.Time(endDate).Format("2006-01-02"))
	}

	return report
}
