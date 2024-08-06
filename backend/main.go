package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/robfig/cron/v3"

	api "github.com/mannx/Bluebook/api"
	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
)

// commit hash set during linking for version display
var (
	Commit string
	Branch string
)

// DB is the database connection for the entire run
var DB *gorm.DB

// name of the database we are using
var dbName string

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	log.Info().Msgf("Bluebook Helper")
	log.Info().Msg("Initializing environment...")
	log.Info().Msgf("Version: %v-%v", Branch, Commit)

	env.Environment.Init()

	log.Info().Msgf("Setting log level to: %v", env.Environment.LogLevelString)
	zerolog.SetGlobalLevel(env.Environment.LogLevel)

	log.Info().Msg("Initializing top5 list...")
	api.InitTop5()

	dbName = filepath.Join(env.Environment.DataPath, "db.db")

	log.Info().Msg("Initializing database...")
	dbo, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	if err != nil {
		log.Fatal().Err(err).Msg("Unable to open database...")
	}

	DB = dbo

	log.Info().Msg("Auto migrating the database...")
	migrateDB()

	// check for any duplicate day entries
	if !env.Environment.IgnoreChecks {
		err = checkDuplicateEntries()
		if err != nil {
			log.Error().Err(err).Msg("Error checking for duplicate days")
		}
	} else {
		log.Info().Msg("Skipping duplicate day check...")
	}

	log.Info().Msg("Starting cron jobs...")
	startJobs()

	log.Info().Msg("Initialiing server and middleware")
	e := initServer()

	log.Info().Msg("Starting server...")
	go func() {
		port := fmt.Sprintf(":%v", env.Environment.Port)

		if err := e.Start(port); err != nil && err != http.ErrServerClosed {
			log.Error().Err(err).Msg("Unable to start server!")
			e.Logger.Fatal("shutting server down")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
}

func migrateDB() {
	DB.AutoMigrate(&models.DayData{})
	DB.AutoMigrate(&models.WeeklyInfo{})
	DB.AutoMigrate(&models.WastageItem{})
	DB.AutoMigrate(&models.WastageEntry{})
	DB.AutoMigrate(&models.WastageEntryHolding{})

	DB.AutoMigrate(&models.AUVEntry2{})

	DB.AutoMigrate(&models.TagList{})
	DB.AutoMigrate(&models.TagData{})

	DB.AutoMigrate(&models.BackupEntry{})
	DB.AutoMigrate(&models.DayDataBackup{})

	DB.AutoMigrate(&models.HockeySchedule{})
	DB.AutoMigrate(&models.HockeyScheduleImport{})

	DB.AutoMigrate(&models.BluebookSettings{})
}

// check to see if we have any duplicated day_data entries
// if we have more than 1 entry with the same date, log id of both
// to fix: TODO
func checkDuplicateEntries() error {
	log.Info().Msg("Checking for duplicate day entries...")

	// get the first and last date in the database
	var first, last models.DayData

	res := DB.Select("Date").Order("Date").Take(&first)
	if res.Error != nil {
		return res.Error
	}

	res = DB.Order("Date desc").Select("Date").Take(&last)
	if res.Error != nil {
		return res.Error
	}

	// get start/end date
	start := time.Time(first.Date)
	end := time.Time(last.Date)

	log.Info().Msgf(" => Starting at: %v", start)
	log.Info().Msgf(" => Ending at: %v", end)

	// for each day, check if we can retrieve multiple entries
	currDate := start
	for !currDate.After(end) {
		// check for multiple days with the current date
		var data []models.DayData
		res := DB.Where("Date = ?", currDate).Find(&data)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve entries for day %v", currDate)
		}

		if len(data) > 1 {
			log.Warn().Msgf(" => [Date: %v] Has entry count: %v", currDate, len(data))
			for _, d := range data {
				log.Warn().Msgf("   => [ID: %v]", d.ID)
			}
		}

		// move to the next day
		currDate = currDate.AddDate(0, 0, 1)
	}

	return nil
}

func startJobs() {
	c := cron.New()

	_, err := c.AddFunc(env.Environment.CronTime, func() { api.HockeyImportCronJob(DB) })
	if err != nil {
		log.Error().Err(err).Msgf("Unable to add cron job for hockey import.  cron string [%v]", env.Environment.CronTime)
	}

	_, err = c.AddFunc(env.Environment.BackupTime, archiveCronJob)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to add cron job for archive script. cron string [%v]", env.Environment.BackupTime)
	}

	c.Start()
}

func archiveCronJob() {
	scriptPath := filepath.Join(env.Environment.ScriptsPath, "ar.sh")
	cmd := exec.Command(scriptPath)

	var out strings.Builder
	cmd.Stdout = &out

	err := cmd.Run()
	if err != nil {
		log.Error().Err(err).Msg("Unable to run archive script")
	}

	if len(out.String()) > 0 {
		log.Info().Msg(out.String())
	}
}
