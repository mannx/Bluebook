package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type weeklyInfo struct {
	TargetAUV   int // from the auv tables
	TargetHours int

	FoodCostAmount   float64
	LabourCostAmount float64
	PartySales       float64

	NetSales         float64
	NetSalesMismatch bool // true if net sales calculated from dailies differs from what was taken from wisr
	CustomerCount    int
	GiftCardSold     float64
	GiftCardRedeem   float64
	BreadOverShort   float64

	LastYearSales         float64
	LastYearCustomerCount int
	UpcomingSales         float64
}

// GetWeeklyViewHandler handles the weekly report generation params: /?month=MM&day=DD&year=YYYY
func GetWeeklyViewHandler(c echo.Context, db *gorm.DB) error {
	var month, day, year int

	err := echo.QueryParamsBinder(c).
		Int("month", &month).
		Int("day", &day).
		Int("year", &year).
		BindError()
	if err != nil {
		return err
	}

	err, weekly := getWeeklyData(month, day, year, c, db)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, &weekly)
}

func getWeeklyData(month int, day int, year int, c echo.Context, db *gorm.DB) (error, weeklyInfo) {
	weekEnding := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	weekStart := weekEnding.AddDate(0, 0, -6)

	// make sure a tuesday
	if weekEnding.Weekday() != time.Tuesday {
		return c.JSON(http.StatusOK, "Can only view from a tuesday"), weeklyInfo{}
	}

	weekly := weeklyInfo{}
	err := getAuvData(weekEnding, &weekly, db)
	if err != nil {
		return err, weeklyInfo{}
	}

	// retrieve the data for the week
	data := make([]models.DayData, 9)
	res := db.Find(&data, "Date >= ? AND Date <= ?", weekStart, weekEnding)
	if res.Error != nil {
		return res.Error, weeklyInfo{}

	}

	// calculate the data bits that we need
	calculateWeekly(data, &weekly)

	// retrieve hte information form the weekly table
	endDate := weekEnding
	wi := models.WeeklyInfo{}
	res = db.Find(&wi, "Date = ?", endDate) // we ignore any errors and we use a default strcut anyway
	if res.Error != nil {
		log.Warn().Err(res.Error).Msg("No weekly info, using defaults")
	}

	weekly.FoodCostAmount = wi.FoodCostAmount
	weekly.LabourCostAmount = wi.LabourCostAmount
	weekly.PartySales = wi.PartySales
	weekly.NetSalesMismatch = weekly.NetSales != wi.NetSales

	// retrieve the last years data if available
	lastYear := weekEnding.AddDate(-1, 0, 0)

	// adjust if not a tuesday
	if lastYear.Weekday() != time.Tuesday {
		diff := weekEnding.Weekday() - lastYear.Weekday()
		lastYear = lastYear.AddDate(0, 0, int(diff))
	}

	// compute last years sales data
	lys := lastYear.AddDate(0, 0, -6)
	res = db.Find(&data, "Date >= ? AND Date <= ?", lys, lastYear)
	if res.Error != nil {
		return res.Error, weeklyInfo{}

	}

	for _, n := range data {
		weekly.LastYearSales += n.NetSales
		weekly.LastYearCustomerCount += n.CustomerCount
	}

	// retrieve upcoming sales from last year
	up := lastYear.AddDate(0, 0, 7)

	res = db.Find(&data, "Date >= ? AND Date <= ?", lastYear.AddDate(0, 0, 1), up)
	if res.Error != nil {
		return res.Error, weeklyInfo{}

	}

	for _, n := range data {
		weekly.UpcomingSales += n.NetSales
	}

	return nil, weekly

}

func calculateWeekly(data []models.DayData, wi *weeklyInfo) {
	// retrieve information from daily table
	for _, d := range data {
		wi.NetSales += d.NetSales
		wi.CustomerCount += d.CustomerCount
		wi.GiftCardSold += d.GiftCardSold
		wi.GiftCardRedeem += d.GiftCardRedeem
		wi.BreadOverShort += d.BreadOverShort
	}
}

func getAuvData(weekEnding time.Time, wi *weeklyInfo, db *gorm.DB) error {
	// get the auv data for the month
	start := time.Date(weekEnding.Year(), weekEnding.Month(), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0) // get the next month
	auv := models.AUVEntry{}

	res := db.Find(&auv, "week1_date >= ? AND week1_date < ?", start, end)
	if res.Error != nil {
		return res.Error
	}

	if res.RowsAffected == 0 {
		// no auv data available
		return nil
	}

	we := datatypes.Date(weekEnding)
	// determine which week ending date matches ours, if no match, return error
	if auv.Week1Date == we {
		wi.TargetHours = auv.Week1Hours
		wi.TargetAUV = auv.Week1AUV
	} else if auv.Week2Date == we {
		wi.TargetHours = auv.Week2Hours
		wi.TargetAUV = auv.Week2AUV
	} else if auv.Week3Date == we {
		wi.TargetHours = auv.Week3Hours
		wi.TargetAUV = auv.Week3AUV
	} else if auv.Week4Date == we {
		wi.TargetHours = auv.Week4Hours
		wi.TargetAUV = auv.Week4AUV
	} else if auv.Week5Date == we {
		wi.TargetHours = auv.Week5Hours
		wi.TargetAUV = auv.Week5AUV
	}

	return nil
}
