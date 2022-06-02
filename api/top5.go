package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
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
	f, err := ioutil.ReadFile("./data/data.json")
	if err == nil {
		return f, nil // read success
	}

	// otherwise try and built in config found at /data.json
	f, err = ioutil.ReadFile("/data.json")
	if err == nil {
		return f, nil
	}

	return nil, err
}

func init() {
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

// GetTop5ViewHandler expects params of none (top all time, year=YYYY for top of year, year=YYYY&month=MM for best of month
func GetTop5ViewHandler(c echo.Context, db *gorm.DB) error {
	log.Debug().Msg("Top5 View Handler()")
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
		log.Error().Err(res.Error).Msg("Unable to retrieve date list (1)")
		return res.Error
	}

	res = db.Order("Date desc").Select("Date").Take(&last)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve date list (2)")
		return res.Error
	}

	// assume we have continous data between all years
	numYear := (time.Time(last.Date).Year() - time.Time(first.Date).Year())
	var years []int

	for i := 0; i <= numYear; i++ {
		years = append(years, time.Time(first.Date).Year()+i)
	}

	data := getTop5Data(month, year, limit, db) // retrieve the data
	if data == nil {
		msg := models.ServerReturnMessage{
			Message: "Unable to retrieve top 5 data",
			Error:   true,
		}

		return c.JSON(http.StatusOK, &msg)
	}

	msg := message{
		Message: fmt.Sprintf("Top 5 of month: %v, year: %v", month, year),
		Years:   years,
		Data:    data,
	}

	return c.JSON(http.StatusOK, &msg)
}

func getTop5Data(month int, year int, limit int, db *gorm.DB) []top5Data {
	log.Debug().Msg("getTop5Data(m,y,l,db) ::")
	if month == 0 && year == 0 {
		// top all time
		return top5All(limit, db)
	}

	if year != 0 && month != 0 {
		// top for a month
		return top5Month(month, year, limit, db)
	}

	if year != 0 && month == 0 {
		// top all year
		return top5Year(year, limit, db)
	}

	log.Debug().Msg("getTop5Data() => return nil.  Shouldnt get here")
	log.Debug().Msgf("  [Year: %v] [Month: %v] [Limit: %v]", month, year, limit)
	return nil
}

func top5All(limit int, db *gorm.DB) []top5Data {
	log.Debug().Msgf("top5All() :: Table Size: %v", len(top5Table))
	var out []top5Data

	for _, n := range top5Table {
		log.Debug().Msgf("  => [Title: %v] [Field: %v]", n.Title, n.Field)
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
	log.Debug().Msg("top5Month() ::")

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
	log.Debug().Msg("top5Year() ::")
	var out []top5Data

	for _, n := range top5Table {
		tbl := top5Data{
			Title:  n.Title,
			Column: n.Column,
			Field:  n.Field,
		}

		start := time.Date(year, time.January, 1, 0, 0, 0, 0, time.UTC)
		end := time.Date(year, time.December, 31, 0, 0, 0, 0, time.UTC)

		log.Debug().Msgf("  [] start: %v", start.String())
		log.Debug().Msgf("  [] end: %v", end.String())

		res := db.Where("Date >= ? AND Date <= ?", start, end).Order(n.Column + " desc").Limit(limit).Find(&tbl.Data)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve data for column: %v", n.Column)
			continue
		}

		log.Debug().Msgf("   [] Found: %v", res.RowsAffected)
		for i, n := range tbl.Data {
			tbl.Data[i].DateString = n.GetDate()
		}

		out = append(out, tbl)
	}

	return out
}
