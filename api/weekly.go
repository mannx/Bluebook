package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type WeeklyInfo struct {
	TargetAUV   int // from the auv tables
	TargetHours int

	FoodCostAmount   float64
	LabourCostAmount float64
	PartySales       float64

	NetSales       float64
	CustomerCount  int
	GiftCardSold   float64
	GiftCardRedeem float64
	BreadOverShort float64

	LastYearSales         float64
	LastYearCustomerCount float64
	UpcomingSales         float64
}

// GetWeekylViewHandler handles the weekly report generation params: /?month=MM&day=DD&year=YYYY
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

	log.Debug().Msgf("Weekly report for %v\\%v\\%v", month, day, year)

	weekEnding := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	weekStart := weekEnding.AddDate(0, 0, -7)

	// make sure a tuesday
	if weekEnding.Weekday() != time.Tuesday {
		log.Debug().Msg("Request date is not a tuesday")
		return c.JSON(http.StatusOK, "Can only view from a tuesday")
	}

	log.Debug().Msgf("Start: %v", weekStart)
	log.Debug().Msgf("End: %v", weekEnding)
	weekly := WeeklyInfo{}

	// TODO: retrieve auv information here

	// END todo

	// retrieve the data for the week
	data := make([]models.DayData, 9)
	res := db.Find(&data, "Date >= ? AND Date <= ?", weekStart, weekEnding)
	if res.Error != nil {
		return res.Error
	}

	// calculate the data bits that we need
	calculateWeekly(data, &weekly)

	return c.JSON(http.StatusOK, &weekly)
}

func calculateWeekly(data []models.DayData, wi *WeeklyInfo) {
	for _, d := range data {
		fmt.Printf("[%v] Net Sales: %v\n", time.Time(d.Date).String(), d.NetSales)
		wi.NetSales += d.NetSales
		wi.CustomerCount += d.CustomerCount
		wi.GiftCardSold += d.GiftCardSold
		wi.GiftCardRedeem += d.GiftCardRedeem
		wi.BreadOverShort += d.BreadOverShort
	}
}
