package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
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

func HockeyManualImportHandler(c echo.Context, db *gorm.DB) error {
	// we have a url to use to fetch been post'd to us
	type urlData struct {
		Data string `json:"Data"`
	}

	var data urlData
	if err := c.Bind(&data); err != nil {
		return LogAndReturnError(c, "Unable to get fetch url for manual hockey import", err)
	}

	// start a goroutine to call the scripts to perform the import
	go runImportScript(data.Data, db)

	return ReturnServerMessage(c, "Success?", false)
}

func runImportScript(url string, db *gorm.DB) {
	log.Info().Msg("Running hockey import script...")

	// get the path to the ghd.sh script in the /scripts directory
	scriptPath := filepath.Join(env.Environment.ScriptsPath, "ghd.sh")
	dbPath := filepath.Join(env.Environment.DataPath, "db.db")

	cmd := exec.Command(scriptPath, url, dbPath)

	var out strings.Builder
	cmd.Stdout = &out

	err := cmd.Run()
	if err != nil {
		log.Error().Err(err).Msg("Unable to run ghd.sh script!")
		return
	}

	if len(out.String()) > 0 {
		log.Info().Msg(out.String())
	}

	err = mergeHockeyTables(db)
	if err != nil {
		log.Error().Err(err).Msg("Error merging hockey tables")
	}
}

func HockeyDebugMerge(db *gorm.DB) error {
	err := mergeHockeyTables(db)
	if err != nil {
		log.Error().Err(err).Msg("Error merging hockey tables")
	}

	return err
}

// merge the hockey import table to the schedule table.  update the schedule table if an entry already exists
func mergeHockeyTables(db *gorm.DB) error {
	var data []models.HockeyScheduleImport

	res := db.Find(&data)
	if res.Error != nil {
		log.Error().Err(res.Error).Msgf("Unable to retrieve records from HockeyScheduleImports table")
		return res.Error
	}

	for _, e := range data {
		// if the current date already exists, update it otherwise we create a new entry
		obj := models.HockeySchedule{}

		res = db.Find(&obj, "Date = ?", e.Date)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve hockey schedule for date check...skipping")
			continue
		}

		if res.RowsAffected == 0 {
			// copy everything over
			obj.Home = e.Home
			obj.Away = e.Away
			obj.Date = e.Date
			obj.Arena = e.Arena
			obj.HomeImage = e.HomeImage
			obj.AwayImage = e.AwayImage
		}

		// convert since the python script might store them as a string instead of an integer
		// TODO: fix the script so we don't have to convert here and just store them as uints
		home, _ := strconv.Atoi(e.GFHome)
		away, _ := strconv.Atoi(e.GFAway)
		att, _ := strconv.Atoi(e.Attendance)

		obj.GFHome = uint(home)
		obj.GFAway = uint(away)
		obj.Attendance = uint(att)

		db.Save(&obj)
	}

	return nil
}

func HockeyImportCronJob(db *gorm.DB) {
	log.Info().Msgf("Running Hockey Import Cron Job!")

	// retrieve the url from the settings table and run the script
	var settings models.BluebookSettings

	res := db.Find(&settings)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve settings table.  Aborting hockey schedule import")
		return
	}

	// only continue if we are set to run
	if !settings.RunHockeyFetch {
		return
	}
	// make sure we have a non-empty url string
	if len(settings.HockeyURL) == 0 {
		log.Warn().Msg("Aborting hockey schedule import.  HockeyURL is empty")
		return
	}

	go runImportScript(settings.HockeyURL, db)
}

func HockeyJSONTest(db *gorm.DB) error {
	data, err := getRawHockeyFile()
	if err != nil {
		log.Error().Err(err).Msgf("Unable to rad index.html for JSONTest")
		return err
	}

	var jData []interface{}
	err = json.Unmarshal([]byte(data), &jData)
	if err != nil {
		log.Error().Err(err).Msgf("unable to unmarshall data")
		return err
	}

	// for i, n := range jData {
	// 	fmt.Println("Game #%v", n[0])

	// }

	return nil
}

func getRawHockeyFile() (string, error) {
	// read in the cached index.html from /data
	fname := filepath.Join(env.Environment.DataPath, "index.html")
	f, err := os.ReadFile(fname)
	if err != nil {
		return "", err
	}

	// convert to a string and extract the json data we want
	datastr := string(f[:])
	lines := strings.Split(datastr, "\n")

	// find the line we want
	for _, l := range lines {
		if strings.Contains(l, "data:") {
			// found it, split and return
			data := l[10 : len(l)-3]
			return data, nil
		}
	}

	return "", errors.New("Unable to parse data from /data/index.html")
}
