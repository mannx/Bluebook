package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	api "github.com/mannx/Bluebook/api"
	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
)

// Version of the current build/release
var (
	BuildVersion string = ""
	BuildTime    string = ""
)

// DB is the database connection for the entire run
var DB *gorm.DB

// name of the database we are using
var dbName string

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	zerolog.SetGlobalLevel(zerolog.DebugLevel)

	log.Info().Msgf("Bluebook Helper")
	log.Info().Msgf("  => Version: %v", BuildVersion)
	log.Info().Msgf("  => Build Time: %v", BuildTime)

	log.Info().Msg("Initializing environment...")
	env.Environment.Init()

	log.Info().Msg("Initializing top5 list...")
	api.InitTop5()

	dbName = filepath.Join(env.Environment.DataPath, "db.db")

	log.Info().Msg("Initializing database backup list...")
	err := api.InitializeDBListing()
	if err != nil {
		log.Error().Err(err).Msgf("Unable to generate listing of backed up database files...")
	}

	log.Info().Msg("Initializing database...")
	dbo, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	if err != nil {
		log.Fatal().Err(err).Msg("Unable to open database...")
	}

	DB = dbo

	log.Info().Msg("Auto migrating the database...")
	migrateDB()

	log.Info().Msg("Updating database backup list...")
	err = UpdateBackupTable(DB)
	if err != nil {
		log.Error().Err(err).Msg("Unable to manage database backup...")
	}

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

func migrateDB() {
	DB.AutoMigrate(&models.DayData{})
	DB.AutoMigrate(&models.DayDataBackup{})
	DB.AutoMigrate(&models.DayDataImportList{})

	DB.AutoMigrate(&models.WeeklyInfo{})
	DB.AutoMigrate(&models.WastageItem{})
	DB.AutoMigrate(&models.WastageEntry{})
	DB.AutoMigrate(&models.WastageEntryHolding{})

	DB.AutoMigrate(&models.AUVEntry{})

	DB.AutoMigrate(&models.TagList{})
	DB.AutoMigrate(&models.TagData{})

	DB.AutoMigrate(&models.BackupEntry{})
}
