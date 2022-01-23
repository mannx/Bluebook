package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
)

// Version of the current build/release
const Version = 0.04

// DB is the database connection for the entire run
var DB *gorm.DB

// name of the database we are using
const dbName = "./data/db.db"

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	zerolog.SetGlobalLevel(zerolog.DebugLevel)

	log.Info().Msgf("Bluebook Helper v%v.\n\n", Version)

	log.Info().Msg("Initializing database...")
	dbo, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	if err != nil {
		log.Fatal().Err(err).Msg("Unable to open database...")
	}

	DB = dbo

	log.Debug().Msg("Auto migrating the database...")
	migrateDB()

	log.Debug().Msg("Converting old database to current...")
	//_ = convertDB()

	log.Debug().Msg("Initializing environment...")
	env.Environment.Init()
	log.Debug().Msgf("Import Path: %v", env.Environment.ImportPath)

	log.Info().Msg("Initialiing server and middleware")

	e := initServer()

	log.Info().Msg("Starting server...")
	go func() {
		if err := e.Start(":8080"); err != nil && err != http.ErrServerClosed {
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

// this updates every record in the database with a new timestamp that includes
// the time as well (since currently if using datatype.Date, it still contains a time component)
// TODO: fix at some point, or not?
func convertDB() error {
	log.Debug().Msg("convertDB() begin")

	var data []models.DayData
	res := DB.Find(&data)
	if res.Error != nil {
		return res.Error
	}

	log.Debug().Msgf("Starting update of %v records....", res.RowsAffected)
	for _, obj := range data {
		DB.Save(&obj)
	}

	var wi []models.WeeklyInfo
	res = DB.Find(&wi)
	if res.Error != nil {
		return res.Error
	}

	log.Debug().Msgf("starting update of %v records [weeklyinfo]....", res.RowsAffected)
	for _, obj := range wi {
		DB.Save(&obj)
	}

	var auv []models.AUVEntry
	res = DB.Find(&auv)
	if res.Error != nil {
		log.Debug().Err(res.Error).Msg("no auv")
		return res.Error
	}

	log.Debug().Msgf("updating %v [AUVEntry]", res.RowsAffected)
	for _, obj := range auv {
		DB.Save(&obj)
	}

	log.Debug().Msg("Finished")
	return nil
}

func migrateDB() {
	DB.AutoMigrate(&models.DayData{})
	DB.AutoMigrate(&models.WeeklyInfo{})
	DB.AutoMigrate(&models.Comments{})
	DB.AutoMigrate(&models.WastageItem{})
	DB.AutoMigrate(&models.WastageEntry{})
	DB.AutoMigrate(&models.AUVEntry{})
}
