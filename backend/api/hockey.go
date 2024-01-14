package api

import (
	"encoding/json"
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

// Main component for a given line in the schedule
// a secondary match is used to extract the game time or result and location if needed
// Index Descriptions
// 0 - Entire Match
// 1 - Game Number (? unsure of what this number is a reference to)
// 2 - Date
// 3 - Away Team (Name is doubled and needs to be remapped)
// 4 - Goals For Away Team
// 5 - Home Team (see Away Team note)
// 6 - Goals For Home Team
// 7 - Rest of data (game time, final, ot/so, attendance, and arena name)
// var reMainData = regexp.MustCompile(`(\d+)\t(\d{4}-\d{2}-\d{2})\t(\D+)\t(\d+)\t(\D+)\t(\d+)\t(.+)`)

// Parse for secondary infomation
// 0 - Entire Match
// 1 -
//
//		   Final
//	    Time (HH:MM pm ZZZ)
//
// 2 - Final, Final OT, or Final SO
// 3 - SO / OT (has leading tab)
// 4 - Game Time for future games
// 5 - Attendence (for past games)
// var reExtraData = regexp.MustCompile(`((Final(\s[SOT]{2})?)|(\d:\d\d pm \w{3}))\s(\d+)?`)

// receive the import data via post. process and add to db
// func ImportHockeyScheduleHandler(c echo.Context, db *gorm.DB) error {
// 	type Body struct {
// 		Data string `form:"Data"`
// 	}
//
// 	var data Body
// 	err := c.Bind(&data)
// 	if err != nil {
// 		return LogAndReturnError(c, "Unable to bind data", err)
// 	}
//
// 	// parse each line
// 	scanner := bufio.NewScanner(strings.NewReader(data.Data))
// 	for scanner.Scan() {
// 		match := reMainData.FindStringSubmatch(scanner.Text())
// 		if match == nil {
// 			log.Error().Msgf("Unable to parse schedule line")
// 			log.Error().Msgf("  => %v", scanner.Text())
// 			continue
// 		}
//
// 		date, err := time.Parse("2006-01-02", match[2])
// 		if err != nil {
// 			log.Error().Msgf("Unable to parse date: [%v]", match[2])
// 			continue
// 		}
//
// 		away, err := strconv.Atoi(match[4])
// 		if err != nil {
// 			log.Error().Err(err).Msgf("Unable to parse away goals: [%v]", match[4])
// 			continue
// 		}
//
// 		home, err := strconv.Atoi(match[6])
// 		if err != nil {
// 			log.Error().Err(err).Msgf("Unable to parse home goals: [%v]", match[6])
// 			continue
// 		}
//
// 		// parse the extra data
// 		extra := reExtraData.FindStringSubmatch(match[7])
// 		at := uint(0) // attendance, update for past games
//
// 		// if 0 matches, we should have a future game and can skip attendence
// 		if len(extra) != 0 {
// 			if strings.Contains(extra[2], "Final") {
// 				iat, err := strconv.Atoi(extra[5])
// 				if err != nil {
// 					log.Error().Err(err).Msgf("Unable to convert attendence from match: [%v]", extra[5])
// 				} else {
// 					at = uint(iat)
// 				}
// 			}
// 		}
//
// 		// check if date is already in the database
// 		// if so, retrieve it and update instead of creating new
// 		model := models.HockeySchedule{}
//
// 		res := db.Find(&model, "Date = ?", date)
// 		if res.Error != nil {
// 			log.Error().Err(res.Error).Msgf("Unable to check db for duplicate entries")
// 			continue
// 		}
//
// 		if res.RowsAffected == 0 {
// 			model = models.HockeySchedule{
// 				Date: datatypes.Date(date),
//
// 				Away: getTeamName(match[3]),
// 				Home: getTeamName(match[5]),
//
// 				GFAway: uint(away),
// 				GFHome: uint(home),
//
// 				Attendance: at,
// 			}
// 		} else {
// 			model.GFAway = uint(away)
// 			model.GFHome = uint(home)
// 			model.Attendance = at
// 		}
//
// 		db.Save(&model)
// 	}
//
// 	return ReturnServerMessage(c, "Import Done", false)
// }

type TeamNameData struct {
	Raw     string `json:"Raw"`
	Correct string `json:"Correct"`
	Image   string // image name in /public to display for this team
}

var (
	teamNameData map[string]TeamNameData
	HomeTeamName string // todo: have this configured by user and stored in db
)

// func getTeamName(name string) string {
// 	n, ok := teamNameData[name]
// 	if !ok {
// 		// team not found, log and return
// 		log.Info().Msgf("Hockey Team [%v] Not Found In Substitution Table", name)
// 		return name
// 	}
//
// 	return n.Correct
// }

// return the image string for a given team. uses the Correct team name
func getTeamImage(name string) string {
	for _, i := range teamNameData {
		if i.Correct == name {
			return i.Image
		}
	}

	return "error.png"
}

func readHockeyConfig() ([]byte, error) {
	HomeTeamName = "Saint John"
	// try and read the user supplied config file
	fname := filepath.Join(env.Environment.DataPath, "hockey.json")
	f, err := os.ReadFile(fname)
	if err == nil {
		return f, nil // read success
	}

	return nil, err
}

func InitHockeySchedule() {
	f, err := readHockeyConfig()
	if err != nil {
		log.Error().Err(err).Msg("Unable to read user config file for hockey team name substitution")
		return
	}

	type jsonData struct {
		Data []TeamNameData
	}

	var data jsonData
	err = json.Unmarshal(f, &data)
	if err != nil {
		log.Error().Err(err).Msg("Unable to parse hockey team file")
		return
	}

	teamNameData = make(map[string]TeamNameData)
	for _, i := range data.Data {
		teamNameData[i.Raw] = i
	}
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

	log.Debug().Msgf("[hockey data] year: %v", year)

	var hschedule []models.HockeySchedule
	// res := db.Where("Home = ?", HomeTeamName).Find(&hschedule)
	op := db.Where("Home = ?", HomeTeamName)

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
	log.Debug().Msgf("Running Hockey Import Cron Job!")

	// retrieve the url from the settings table and run the script
	var settings models.BluebookSettings

	res := db.Find(&settings)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve settings table.  Aborting hockey schedule import")
		return
	}

	// make sure we have a non-empty url string
	if len(settings.HockeyURL) == 0 {
		log.Warn().Msg("Aborting hockey schedule import.  HockeyURL is empty")
		return
	}

	go runImportScript(settings.HockeyURL, db)
}
