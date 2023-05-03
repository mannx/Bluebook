package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"path/filepath"
	"sort"
	"time"

	"github.com/labstack/echo/v4"
	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type top5Data struct {
	Title  string           // title to give the table
	Column string           // column name in the database
	Field  string           // name of the field used in the client
	Data   []models.DayData // the sorted data for this request
}

var top5Table []top5Data

func readConfig() ([]byte, error) {
	// try and read the user supplied config file
	fname := filepath.Join(env.Environment.DataPath, "top5.json")
	f, err := ioutil.ReadFile(fname)
	if err == nil {
		return f, nil // read success
	}

	// otherwise try and built in config found at /data.json
	f, err = ioutil.ReadFile("/top5.json")
	if err == nil {
		return f, nil
	}

	return nil, err
}

// func init() {
func InitTop5() {
	f, err := readConfig()
	if err != nil {
		log.Error().Msg("Unable to read user config or default config file for top5 api")
		return
	}

	type jsonData struct {
		Data []top5Data
	}

	var obj jsonData

	err = json.Unmarshal(f, &obj)
	if err != nil {
		log.Error().Err(err).Msg("Unable to unmarshal config")
		return
	}

	top5Table = obj.Data
}

func GetTop5Data(c echo.Context, db *gorm.DB) error {

	var first, last models.DayData

	res := db.Select("Date").Order("Date").Take(&first)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve date list (1)", res.Error)
	}

	res = db.Order("Date desc").Select("Date").Take(&last)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve date list (2)", res.Error)
	}

	// assume we have continous data between all years
	numYear := (time.Time(last.Date).Year() - time.Time(first.Date).Year())
	var years []int

	for i := 0; i <= numYear; i++ {
		years = append(years, time.Time(first.Date).Year()+i)
	}

	// make sure years is sorted current to earliest
	sort.Sort(sort.Reverse(sort.IntSlice(years)))

	return c.JSON(http.StatusOK, years)
}

// GetTop5ViewHandler expects params of none (top all time, year=YYYY for top of year, year=YYYY&month=MM for best of month
func GetTop5ViewHandler(c echo.Context, db *gorm.DB) error {
	var month, year, limit int

	err := echo.QueryParamsBinder(c).
		Int("month", &month).
		Int("year", &year).
		Int("limit", &limit).
		BindError()
	if err != nil {
		return err
	}

	if limit < 1 {
		log.Warn().Msgf("GetTop5ViewHandler() => Limit < 1 [%v]. Setting default 5", limit)
		limit = 5
	}

	type message struct {
		Message string
		Years   []int // list of the years we have data for
		Data    []top5Data
	}

	var first, last models.DayData

	res := db.Select("Date").Order("Date").Take(&first)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve date list (1)", res.Error)
	}

	res = db.Order("Date desc").Select("Date").Take(&last)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve date list (2)", res.Error)
	}

	// assume we have continous data between all years
	numYear := (time.Time(last.Date).Year() - time.Time(first.Date).Year())
	var years []int

	for i := 0; i <= numYear; i++ {
		years = append(years, time.Time(first.Date).Year()+i)
	}

	// make sure years is sorted current to earliest
	sort.Sort(sort.Reverse(sort.IntSlice(years)))

	data := getTop5Data(month, year, limit, db) // retrieve the data, if none, handled in frontend
	msg := message{
		Message: fmt.Sprintf("Top 5 of month: %v, year: %v", month, year),
		Years:   years,
		Data:    data,
	}

	return c.JSON(http.StatusOK, &msg)
}

func getTop5Data(month int, year int, limit int, db *gorm.DB) []top5Data {
	if month == 0 && year == 0 {
		// top all time
		return top5All(limit, db)
	}

	if year != 0 && month != 0 {
		// top for a month of a given year
		return top5Month(month, year, limit, db)
	}

	if year != 0 && month == 0 {
		// top all year
		return top5Year(year, limit, db)
	}

	log.Warn().Msg("getTop5Data() => return nil.  Shouldnt get here")
	log.Warn().Msgf("  [Year: %v] [Month: %v] [Limit: %v]", month, year, limit)
	return nil
}

func top5All(limit int, db *gorm.DB) []top5Data {
	var out []top5Data

	for _, n := range top5Table {
		tbl := top5Data{
			Title:  n.Title,
			Column: n.Column,
			Field:  n.Field,
		}

		res := db.Order(n.Column + " desc").Limit(limit).Find(&tbl.Data)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve data for column: %v", n.Column)
			continue
		}

		for i, n := range tbl.Data {
			tbl.Data[i].DateString = n.GetDate()
		}

		out = append(out, tbl)
	}

	return out
}

func top5Month(month int, year int, limit int, db *gorm.DB) []top5Data {
	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(year, time.Month(month+1), 1, 0, 0, 0, 0, time.UTC)

	var out []top5Data

	for _, n := range top5Table {
		tbl := n

		res := db.Order(n.Column+" desc").Where("Date >= ? AND Date < ?", start, end).Limit(limit).Find(&tbl.Data)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to get data for: %v", n.Title)
			continue
		}

		for i, n := range tbl.Data {
			tbl.Data[i].DateString = n.GetDate()
		}

		out = append(out, tbl)
	}

	return out
}

func top5Year(year int, limit int, db *gorm.DB) []top5Data {
	var out []top5Data

	for _, n := range top5Table {
		tbl := top5Data{
			Title:  n.Title,
			Column: n.Column,
			Field:  n.Field,
		}

		start := time.Date(year, time.January, 1, 0, 0, 0, 0, time.UTC)
		end := time.Date(year, time.December, 31, 0, 0, 0, 0, time.UTC)

		res := db.Where("Date >= ? AND Date <= ?", start, end).Order(n.Column + " desc").Limit(limit).Find(&tbl.Data)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve data for column: %v", n.Column)
			continue
		}

		for i, n := range tbl.Data {
			tbl.Data[i].DateString = n.GetDate()
		}

		out = append(out, tbl)
	}

	return out
}
