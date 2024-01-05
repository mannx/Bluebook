package api

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

// cell mappings for where values are stored
var weekEndingCell = "B4"
var auvTarget = "D7"
var lastYearSales = "D8"
var netSales = "D9"
var upcomingSales = "D12"
var breadCount = "D13"
var foodCost = "D15"
var syscoCost = "D17"
var labourCost = "D21"
var customerCount = "D28"
var customerPrev = "D29"
var partySales = "D31"
var hoursUsed = "D23"
var managerHours = "D24"
var targetHours = "D26"
var gcSold = "D32"
var gcRedeem = "D33"

// mapings for the initial cells for the waste chart
//
//	only noted are columns, and the starting row, since cell name is formed at runtime
var wasteDate = "A"
var wasteItem = "B"
var wasteWeight = "C"
var wasteReason = "D"

var wasteStartRow = 2

func ExportWeeklyHandler(c echo.Context, db *gorm.DB) error {
	type weeklyParams struct {
		Month   string `query:"month"`
		Day     string `query:"day"`
		Year    string `query:"year"`
		Hours   string `query:"hours"`
		Manager string `query:"manager"`
		Sysco   string `query:"sysco"`
	}

	var params weeklyParams
	if err := c.Bind(&params); err != nil {
		return LogAndReturnError(c, "Unable to bind parameters", err)
	}

	// convert from strig to usuable types
	month, err := strconv.Atoi(params.Month)
	if err != nil {
		return LogAndReturnError(c, "Unable to parse [month]", err)
	}

	day, err := strconv.Atoi(params.Day)
	if err != nil {
		return LogAndReturnError(c, "Unable to parse [day]", err)
	}

	year, err := strconv.Atoi(params.Year)
	if err != nil {
		return LogAndReturnError(c, "Unable to parse [year]", err)
	}

	hours, err := strconv.ParseFloat(params.Hours, 64)
	if err != nil {
		return LogAndReturnError(c, "Unable to parse [hours]", err)
	}

	manager, err := strconv.ParseFloat(params.Manager, 64)
	if err != nil {
		return LogAndReturnError(c, "Unable to parse [manager]", err)
	}

	sysco, err := strconv.ParseFloat(params.Sysco, 64)
	if err != nil {
		return LogAndReturnError(c, "Unable to parse [sysco]", err)
	}

	weekly, err := getWeeklyData(month, day, year, c, db)
	if err != nil {
		return LogAndReturnError(c, "unable to retrieve weekly data", err)
	}

	weekEnding := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)

	err = exportWeekly(weekly, weekEnding, hours, manager, sysco)
	if err != nil {
		return LogAndReturnError(c, "Unable to export weekly", err)
	}

	return ReturnServerMessage(c, "Success", false)
}

// Export weekly from given date into excel template
// outputs in Environment.OutputDir
func exportWeekly(weekly weeklyInfo, weekEnding time.Time, hours float64, manager float64, sysco float64) error {
	// open the template and set the fields we need
	path := filepath.Join(env.Environment.DataPath, "weekly.xlsx")
	f, err := excelize.OpenFile(path)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to open weekly template: %v", path)
		return err
	}

	defer f.Close()

	f.SetCellInt("Sheet1", auvTarget, weekly.TargetAUV)
	f.SetCellInt("Sheet1", targetHours, weekly.TargetHours)

	f.SetCellValue("Sheet1", foodCost, weekly.FoodCostAmount)
	f.SetCellValue("Sheet1", labourCost, weekly.LabourCostAmount)
	f.SetCellValue("Sheet1", partySales, weekly.PartySales)

	f.SetCellValue("Sheet1", netSales, weekly.NetSales)
	f.SetCellInt("Sheet1", customerCount, weekly.CustomerCount)
	f.SetCellValue("Sheet1", gcSold, weekly.GiftCardSold)
	f.SetCellValue("Sheet1", gcRedeem, weekly.GiftCardRedeem)
	f.SetCellValue("Sheet1", breadCount, weekly.BreadOverShort)

	f.SetCellValue("Sheet1", lastYearSales, weekly.LastYearSales)
	f.SetCellInt("Sheet1", customerPrev, weekly.LastYearCustomerCount)
	f.SetCellValue("Sheet1", upcomingSales, weekly.UpcomingSales)

	f.SetCellValue("Sheet1", hoursUsed, hours)
	f.SetCellValue("Sheet1", managerHours, manager)
	f.SetCellValue("Sheet1", syscoCost, sysco)

	// set the correct date
	f.SetCellValue("Sheet1", weekEndingCell, weekEnding)

	// generate our output file name and save
	fname := fmt.Sprintf("%v.xlsx", weekEnding.Format("01-02-06"))
	outPath := filepath.Join(env.Environment.OutputPath, fname)
	err = f.SaveAs(outPath)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to save weekly to file: %v", outPath)
		return err
	}

	// adjust ownership to PUID/PGID (container runs as root?)
	os.Chown(outPath, env.Environment.GroupID, env.Environment.UserID)
	return nil
}

// exportWaste creates a new wastage chart with the given wastage entries on it
func exportWaste(waste []models.WastageEntryNamed, weekEnding time.Time) error {
	// get the path to the template
	path := filepath.Join(env.Environment.DataPath, "waste.xlsx")
	f, err := excelize.OpenFile(path)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to open waste template: %v", path)
		return err
	}

	defer f.Close()

	// loop through each entry and add it to the sheet
	for i, e := range waste {
		// generate the required cell values
		date := fmt.Sprintf("%v%v", wasteDate, i+wasteStartRow)
		item := fmt.Sprintf("%v%v", wasteItem, i+wasteStartRow)
		weight := fmt.Sprintf("%v%v", wasteWeight, i+wasteStartRow)
		reason := fmt.Sprintf("%v%v", wasteReason, i+wasteStartRow)

		dateStr := time.Time(e.Date)
		f.SetCellValue("Waste Sheet", date, dateStr)
		f.SetCellValue("Waste Sheet", item, e.Name)
		f.SetCellValue("Waste Sheet", weight, e.Amount)
		f.SetCellValue("Waste Sheet", reason, e.Reason)
	}

	// generate our output file name and save
	fname := fmt.Sprintf("%v Waste Chart.xlsx", weekEnding.Format("01-02-06"))
	outPath := filepath.Join(env.Environment.OutputPath, fname)
	f.SaveAs(outPath)

	// adjust ownership to PUID/PGID (container runs as root?)
	os.Chown(outPath, env.Environment.GroupID, env.Environment.UserID)
	return nil
}
