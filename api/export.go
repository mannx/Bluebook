package api

import (
	"fmt"
	"os"
	"path/filepath"
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
var foodCost = "D14"
var labourCost = "D16"
var customerCount = "D18"
var customerPrev = "D19"
var partySales = "D21"
var hoursUsed = "D22"
var managerHours = "D23"
var targetHours = "D25"
var gcSold = "D26"
var gcRedeem = "D27"

// Export weekly from given date into excel template
// outputs in Environment.OutputDir
func ExportWeekly(c echo.Context, db *gorm.DB) error {
	var month, day, year int
	var hours, manager float64 // hours used and manager hours

	err := echo.QueryParamsBinder(c).
		Int("month", &month).
		Int("day", &day).
		Int("year", &year).
		Float64("hours", &hours).
		Float64("manager", &manager).
		BindError()
	if err != nil {
		return err
	}

	log.Info().Msgf("Exporting weekly report %v\\%v\\%v", month, day, year)
	log.Debug().Msgf("  => Hours: %v", hours)
	log.Debug().Msgf("  => Manager: %v", manager)

	// get the weekly data
	err, weekly := getWeeklyData(month, day, year, c, db)
	if err != nil {
		return err
	}

	// open the template and set the fields we need
	path := filepath.Join(env.Environment.DataPath, "weekly.xlsx")
	f, err := excelize.OpenFile(path)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to open weekly template: %v", path)
		return ReturnServerMessage(c, "Unable to open weekly template", true)
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

	// set the correct date
	weekEnding := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	f.SetCellValue("Sheet1", weekEndingCell, weekEnding)

	// generate our output file name and save
	fname := fmt.Sprintf("%v.xlsx", weekEnding.Format("01-02-06"))
	outPath := filepath.Join(env.Environment.OutputPath, fname)
	f.SaveAs(outPath)

	// adjust ownership to PUID/PGID (container runs as root?)
	os.Chown(outPath, env.Environment.GroupID, env.Environment.UserID)
	return ReturnServerMessage(c, "OK", false)
}

func exportWaste(waste []models.WastageEntry) error {
	return nil
}
