package daily

import (
	"errors"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var reWISRWeekEnd = regexp.MustCompile(`Week Ending:\s*(\d\d?)/(\d\d?)/(\d{4})`)

var (
	reCateringSales = regexp.MustCompile(`CATERING SALES\s+(\d+.?\d?)`)          // 1 group -> total catering sales
	reLabourCost    = regexp.MustCompile(`LABOR\s&\sTAXES\s+(\d+,?\d+)\s+(\d+)`) // 2 groups -> [0] dollar value [1] percent
	reFoodCost      = regexp.MustCompile(`COST OF GOODS\s+(\d+,?\d+)\s+(\d+)`)   // 2 groups -> [0] dollar value [1] percent
)

func ImportWISR(fileName string, db *gorm.DB) error {
	txtFile, err := PDFToText(fileName)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to convert [%v] from pdf to text", fileName)
		return err
	}

	contents, err := os.ReadFile(txtFile)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to read file: %v", txtFile)
		return err
	}

	cstr := string(contents[:])

	weekEnding := reWISRWeekEnd.FindStringSubmatch(cstr)
	if weekEnding == nil {
		log.Error().Msgf("Unable to find week ending date in file: %v", fileName)
		return errors.New("unable to find week ending date")
	}

	month, _ := strconv.Atoi(weekEnding[1])
	day, _ := strconv.Atoi(weekEnding[2])
	year, _ := strconv.Atoi(weekEnding[3])

	// get the start and ending days of the week
	endDate := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)

	catering := reCateringSales.FindStringSubmatch(cstr)
	if catering == nil {
		return reFail("wisr.go", "Catering")
	}

	labour := reLabourCost.FindStringSubmatch(cstr)
	if labour == nil {
		return reFail("wisr.go", "labour")
	}

	food := reFoodCost.FindStringSubmatch(cstr)
	if food == nil {
		return reFail("wisr.go", "food")
	}

	lstr := strings.ReplaceAll(labour[1], ",", "")
	labourCost, _ := strconv.ParseFloat(lstr, 64)
	labourPerc, _ := strconv.ParseFloat(labour[2], 64)

	foodCost, _ := strconv.ParseFloat(strings.ReplaceAll(food[1], ",", ""), 64)
	foodPerc, _ := strconv.ParseFloat(food[2], 64)

	// convert net sales to a float, remove all , to get a 1000+ value as just digits
	party, err := strconv.ParseFloat(strings.ReplaceAll(strings.TrimSpace(catering[1]), ",", ""), 64)
	if err != nil {
		return reFail("wisr.go", "catering parse")
	}

	wi := getWeeklyInfoOrNew(endDate, db)
	wi.Date = datatypes.Date(endDate) // make sure the date is correct
	wi.FoodCostAmount = foodCost
	wi.FoodCostPercent = foodPerc
	wi.LabourCostAmount = labourCost
	wi.LabourCostPercent = labourPerc
	wi.PartySales = party

	db.Save(&wi)

	return nil
}
