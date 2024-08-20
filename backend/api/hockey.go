package api

import (
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Returns the home team name from the settings table, returns an empty string on error or if not set
func GetHomeTeamName(db *gorm.DB) string {
	settings := models.BluebookSettings{}
	res := db.Find(&settings)
	if res.Error != nil {
		return ""
	}

	return settings.HockeyHomeTeam
}

func HockeyDataYearsHandler(c echo.Context, db *gorm.DB) error {
	var data models.HockeySchedule
	res := db.Order("date").First(&data)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve hockey data years", res.Error)
	}

	start := time.Time(data.Date).Year()

	var d2 models.HockeySchedule
	res = db.Order("date desc").Take(&d2)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve hockey data years", res.Error)
	}

	end := time.Time(d2.Date).Year()

	// generate list of years between max & min
	lst := make([]int, 0)
	for i := start; i <= end; i++ {
		lst = append(lst, i)
	}

	return c.JSON(http.StatusOK, &lst)
}

// download the html file for the hockey data, we are provided the URL inthe post as URL
func HockeyGetData(c echo.Context) error {
	var url string

	if err := c.Bind(&url); err != nil {
		return LogAndReturnError(c, "Unable to bind parameters for url fetch for hockey data", err)
	}

	resp, err := http.Get(url)
	if err != nil {
		return LogAndReturnError(c, "Unable to fetch data for hockey data", err)
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return LogAndReturnError(c, "Unable to read body for hockey data", err)
	}

	// convert to a string and extract the json data we want
	datastr := string(body[:])
	lines := strings.Split(datastr, "\n")

	// find the line we want
	for _, l := range lines {
		if strings.Contains(l, "data:") {
			// found it, split and return
			data := l[10 : len(l)-3]
			return ReturnApiRequest(c, false, data, "")
		}
	}

	return ReturnApiRequest(c, true, nil, "Unable to get data to parse")
}

func HockeyDataHandler(c echo.Context, db *gorm.DB) error {
	type hockeyData struct {
		Date     string  // date of the game
		HomeWin  bool    // did the home team win this game?
		NetSales float64 // net sales for the day
		Average  float64 // average sales for the given week day
		AwayTeam string  // name of the away team
		GFHome   uint
		GFAway   uint
	}

	// 1) get the list of hockey games for the date range provided
	// 2) for each game, get the day sales, compute the weekly average of that day

	// we might be given a year, if so, return all games for that given year
	var year int
	err := echo.QueryParamsBinder(c).
		Int("year", &year).BindError()
	if err != nil {
		return LogAndReturnError(c, "Unable to bind to year parameter", err)
	}

	var hschedule []models.HockeySchedule
	op := db.Where("Home = ?", GetHomeTeamName(db))

	// if year!=0, add in a year filter
	if year != 0 {
		start := time.Date(year, time.January, 1, 0, 0, 0, 0, time.UTC)
		end := time.Date(year, time.December, 31, 0, 0, 0, 0, time.UTC)
		op = op.Where("Date >= ? AND Date < ?", start, end)
	}

	res := op.Find(&hschedule)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve hockey data", res.Error)
	}

	hdata := make([]hockeyData, 0)

	for _, i := range hschedule {
		var dd models.DayData
		res = db.Where("Date = ?", i.Date).Find(&dd)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve day data for hockey date: [%v] in /hockey/data, skipping", i.Date)
			continue
		}

		if res.RowsAffected == 0 {
			// no data found, skip
			continue
		}

		// compute the weekly average
		avg := calculateWeeklyAverage(time.Time(i.Date), 4, db)

		hdata = append(hdata, hockeyData{
			Date:     (time.Time(i.Date)).Format("Mon Jan _2 2006"),
			HomeWin:  i.GFHome > i.GFAway,
			NetSales: dd.NetSales,
			Average:  avg,
			AwayTeam: i.Away,
			GFAway:   i.GFAway,
			GFHome:   i.GFHome,
		})

	}

	return c.JSON(http.StatusOK, &hdata)
}

func HockeyImport(c echo.Context, db *gorm.DB) error {
	type HockeyScheduleImport struct {
		Date       string
		Away       string
		Home       string
		GFAway     string
		GFHome     string
		Attendance string
		Arena      string
		HomeImage  string
		AwayImage  string
	}

	var data []HockeyScheduleImport

	if err := c.Bind(&data); err != nil {
		return LogAndReturnError(c, "Unable to bind hockey scheudle data", err)
	}

	for _, d := range data {
		// convert to proper struct and store in db
		date, err := time.Parse("2006-01-02", d.Date)
		if err != nil {
			log.Error().Err(err).Msgf("Unable to parse date [%v], exiting early", d.Date)
			return ReturnApiRequest(c, true, nil, "Unabe to parse date")
		}

		gfaway, err := strconv.ParseUint(d.GFAway, 10, 32)
		if err != nil {
			// if d.GFAway is "" then game hasnt been played
			// if d.GFAway != "" {
			if d.GFAway != " " {
				log.Error().Msgf("Unable to parse away score: [%v]", d.GFAway)
				log.Error().Msgf("  for date: %v", d.Date)
				return LogAndReturnError(c, "Unable to parse away score", err)
			} else {
				log.Info().Msgf("away score empty...setting to 0")
				gfaway = 0
			}
		}

		gfhome, err := strconv.ParseUint(d.GFHome, 10, 32)
		if err != nil {
			if d.GFHome != " " {
				log.Error().Msgf("Unable to parse home score: [%v]", d.GFHome)
				log.Error().Msgf("  for date: %v", d.Date)
				return LogAndReturnError(c, "Unable to parse home score", err)
			} else {
				log.Info().Msgf("home score empty...setting to 0")
				gfhome = 0
			}
		}

		atten, err := strconv.ParseUint(d.Attendance, 10, 32)
		if err != nil {
			if d.Attendance != "" {
				return LogAndReturnError(c, "Unable to parse attendance", err)
			} else {
				log.Info().Msgf("attendance empty...setting to 0")
				atten = 0
			}
		}

		// extract the image filename
		himage, err := extractFilename(d.HomeImage)
		if err != nil {
			log.Error().Err(err).Msgf("Unable to extract home image for team %v .... skipping", d.Home)
		}

		aimage, err := extractFilename(d.AwayImage)
		if err != nil {
			log.Error().Err(err).Msgf("Unable to extract away image for team %v .... skipping", d.Away)
		}

		hs := models.HockeySchedule{
			Date:       datatypes.Date(date),
			Away:       d.Away,
			Home:       d.Home,
			GFAway:     uint(gfaway),
			GFHome:     uint(gfhome),
			Attendance: uint(atten),
			Arena:      d.Arena,
			HomeImage:  himage,
			AwayImage:  aimage,
		}

		log.Info().Msgf("Import game data for date [%v]", d.Date)
		db.Save(&hs)
	}

	return ReturnApiRequest(c, false, nil, "")
}

// extract the image file name from the home/away image fields
func extractFilename(fname string) (string, error) {
	idx := strings.LastIndex(fname, "/")
	if idx == -1 {
		return "", errors.New("Unable to extract image filename")
	} else {
		hi := fname[idx+1:]

		// fix several filenames
		switch hi {
		case "3.jpg":
			hi = "3.png"
		}

		return hi, nil
	}
}
