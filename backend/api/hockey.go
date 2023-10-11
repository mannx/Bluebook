package api

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
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
var reMainData = regexp.MustCompile(`(\d+)\t(\d{4}-\d{2}-\d{2})\t(\D+)\t(\d+)\t(\D+)\t(\d+)\t(.+)`)

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
var reExtraData = regexp.MustCompile(`((Final(\s[SOT]{2})?)|(\d:\d\d pm \w{3}))\s(\d+)?`)

// receive the import data via post. process and add to db
func ImportHockeyScheduleHandler(c echo.Context, db *gorm.DB) error {
	log.Debug().Msgf("Import Hockey Schedule")

	type Body struct {
		Data string `form:"Data"`
	}

	var data Body
	err := c.Bind(&data)
	if err != nil {
		return LogAndReturnError(c, "Unable to bind data", err)
	}

	// parse each line
	scanner := bufio.NewScanner(strings.NewReader(data.Data))
	for scanner.Scan() {
		match := reMainData.FindStringSubmatch(scanner.Text())
		if match == nil {
			log.Error().Msgf("Unable to parse schedule line")
			log.Error().Msgf("  => %v", scanner.Text())
			continue
		}

		date, err := time.Parse("2006-01-02", match[2])
		if err != nil {
			log.Error().Msgf("Unable to parse date: [%v]", match[2])
			continue
		}

		away, err := strconv.Atoi(match[4])
		if err != nil {
			log.Error().Err(err).Msgf("Unable to parse away goals: [%v]", match[4])
			continue
		}

		home, err := strconv.Atoi(match[6])
		if err != nil {
			log.Error().Err(err).Msgf("Unable to parse home goals: [%v]", match[6])
			continue
		}

		// parse the extra data
		extra := reExtraData.FindStringSubmatch(match[7])
		at := uint(0) // attendance, update for past games

		// if 0 matches, we should have a future game and can skip attendence
		if len(extra) != 0 {
			if strings.Contains(extra[2], "Final") {
				iat, err := strconv.Atoi(extra[5])
				if err != nil {
					log.Error().Err(err).Msgf("Unable to convert attendence from match: [%v]", extra[5])
				} else {
					at = uint(iat)
				}
			}
		}

		// check if date is already in the database
		// if so, retrieve it and update instead of creating new
		model := models.HockeySchedule{}

		res := db.Find(&model, "Date = ?", date)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to check db for duplicate entries")
			continue
		}

		if res.RowsAffected == 0 {
			model = models.HockeySchedule{
				Date: datatypes.Date(date),

				Away: getTeamName(match[3]),
				Home: getTeamName(match[5]),

				GFAway: uint(away),
				GFHome: uint(home),

				Attendance: at,
			}
		} else {
			model.GFAway = uint(away)
			model.GFHome = uint(home)
			model.Attendance = at
		}

		db.Save(&model)
	}

	return ReturnServerMessage(c, "Import Done", false)
}

type TeamNameData struct {
	Raw     string `json:"Raw"`
	Correct string `json:"Correct"`
	Image   string // image name in /public to display for this team
}

// var teamNameData map[string]string
var teamNameData map[string]TeamNameData
var HomeTeamName string // todo: have this configured by user and stored in db

func getTeamName(name string) string {
	n, ok := teamNameData[name]
	if !ok {
		// team not found, log and return
		log.Info().Msgf("Hockey Team [%v] Not Found In Substitution Table", name)
		return name
	}

	return n.Correct
}

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
