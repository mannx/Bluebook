package api

// import (
// 	"fmt"
// 	"net/http"
// 	"time"

// 	"github.com/labstack/echo/v4"
// 	models "github.com/mannx/Bluebook/models"
// 	"gorm.io/datatypes"
// 	"gorm.io/gorm"
// )

// // GetAUVViewHandler returns the data for a given month or empty data if none found
// func GetAUVViewHandler(c echo.Context, db *gorm.DB) error {
// 	// format the auventry into a form easier to handle with js (timezone causes date to shift 1 day too early, fix?)
// 	type auvViewData struct {
// 		// Week1Date     string
// 		// Week2Date     string
// 		// Week3Date     string
// 		// Week4Date     string
// 		// Week5Date     string
// 		Dates         []string
// 		AUV           []int
// 		Hours         []int
// 		Week5Required bool
// 	}

// 	var month, year int

// 	err := echo.QueryParamsBinder(c).
// 		Int("month", &month).
// 		Int("year", &year).
// 		BindError()
// 	if err != nil {
// 		return LogAndReturnError(c, "AUV() => Unable to bind parameters", err)
// 	}

// 	// if either month or year is 0, return a new auv object
// 	auv := models.AUVEntry{}
// 	if month == 0 || year == 0 {
// 		return c.JSON(http.StatusOK, &auv)
// 	}

// 	// get the starting date to look for
// 	start := time.Date(year, time.Month(month), 0, 0, 0, 0, 0, time.UTC)
// 	end := start.AddDate(0, 1, 0) // get the next month
// 	res := db.Find(&auv, "week1_date >= ? AND week1_date < ?", start, end)
// 	if res.Error != nil {
// 		return LogAndReturnError(c, "Unable to find auv data", res.Error)
// 	}

// 	if res.RowsAffected == 0 {
// 		// no auv data found, make sure to set the default fields to the month/year
// 		// d := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
// 		// auv.Default(datatypes.Date(d))
// 		// auv.Default(d)
// 	}

// 	// convert the auventry to the output
// 	ret := auvViewData{
// 		Dates:         make([]string, 5),
// 		AUV:           make([]int, 5),
// 		Hours:         make([]int, 5),
// 		Week5Required: auv.Week5Required,
// 	}

// 	ret.Dates[0] = time.Time(auv.Week1Date).Format("2006-01-02")
// 	ret.Dates[1] = time.Time(auv.Week2Date).Format("2006-01-02")
// 	ret.Dates[2] = time.Time(auv.Week3Date).Format("2006-01-02")
// 	ret.Dates[3] = time.Time(auv.Week4Date).Format("2006-01-02")
// 	ret.Dates[4] = time.Time(auv.Week5Date).Format("2006-01-02")

// 	return c.JSON(http.StatusOK, &ret)
// }

// // UpdateAUVPostHandler updates auv data from user form
// func UpdateAUVPostHandler(c echo.Context, db *gorm.DB) error {
// 	type auvData struct {
// 		Week1Date string `json:"week1date"`
// 		Week2Date string `json:"week2date"`
// 		Week3Date string `json:"week3date"`
// 		Week4Date string `json:"week4date"`
// 		Week5Date string `json:"week5date"`

// 		Week1Hours int `json:"week1hours"`
// 		Week2Hours int `json:"week2hours"`
// 		Week3Hours int `json:"week3hours"`
// 		Week4Hours int `json:"week4hours"`
// 		Week5Hours int `json:"week5hours"`

// 		Week1Auv int `json:"week1auv"`
// 		Week2Auv int `json:"week2auv"`
// 		Week3Auv int `json:"week3auv"`
// 		Week4Auv int `json:"week4auv"`
// 		Week5Auv int `json:"week5auv"`

// 		Id int `json:"id"`
// 	}

// 	var auv auvData
// 	if err := c.Bind(&auv); err != nil {
// 		return LogAndReturnError(c, "Unable to bind auv data", err)
// 	}

// 	w1d, _ := time.Parse(time.RFC3339, auv.Week1Date)
// 	w2d, _ := time.Parse(time.RFC3339, auv.Week2Date)
// 	w3d, _ := time.Parse(time.RFC3339, auv.Week3Date)
// 	w4d, _ := time.Parse(time.RFC3339, auv.Week4Date)
// 	w5d, _ := time.Parse(time.RFC3339, auv.Week5Date)

// 	e := models.AUVEntry{}

// 	// retrieve the entry if we already have one using the id if not 0
// 	if auv.Id != 0 {
// 		res := db.Find(&e, "ID = ?", auv.Id)
// 		if res.Error != nil {
// 			return LogAndReturnError(c, fmt.Sprintf("Unable to find AUV with ID=%v", auv.Id), res.Error)
// 		}
// 	}

// 	e.Week1Date = datatypes.Date(w1d)
// 	e.Week2Date = datatypes.Date(w2d)
// 	e.Week3Date = datatypes.Date(w3d)
// 	e.Week4Date = datatypes.Date(w4d)
// 	e.Week5Date = datatypes.Date(w5d)

// 	e.Week1AUV = auv.Week1Auv
// 	e.Week2AUV = auv.Week2Auv
// 	e.Week3AUV = auv.Week3Auv
// 	e.Week4AUV = auv.Week4Auv
// 	e.Week5AUV = auv.Week5Auv

// 	e.Week1Hours = auv.Week1Hours
// 	e.Week2Hours = auv.Week2Hours
// 	e.Week3Hours = auv.Week3Hours
// 	e.Week4Hours = auv.Week4Hours
// 	e.Week5Hours = auv.Week5Hours

// 	// save/update the entries
// 	db.Save(&e)

// 	return c.JSON(http.StatusOK, &models.ServerReturnMessage{Message: "AUV Record Updated"})
// }
