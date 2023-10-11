package api

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
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

		model := models.HockeySchedule{
			Date: datatypes.Date(date),
			Away: getTeamName(match[3]),
			Home: getTeamName(match[5]),
		}

		res := db.Create(&model)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to create new entry from hockey schedule")
			continue
		}
	}

	return ReturnServerMessage(c, "Import Done", false)
}

var teamNameData map[string]string
var HomeTeamName string // todo: have this configured by user and stored in db

func getTeamName(name string) string {
	n, ok := teamNameData[name]
	if !ok {
		// team not found, log and return
		log.Info().Msgf("Hockey Team [%v] Not Found In Substitution Table", name)
		return name
	}

	return n
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

	type TeamNameData struct {
		Raw     string
		Correct string
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

	teamNameData = make(map[string]string)
	for _, i := range data.Data {
		teamNameData[i.Raw] = i.Correct
	}
}
