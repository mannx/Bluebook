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
)

// Version of the current build/release
const Version = 0.01

// DB is the database connection for the entire run
var DB *gorm.DB

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	zerolog.SetGlobalLevel(zerolog.DebugLevel)

	log.Info().Msgf("Bluebook Helper v%v.\n\n", Version)

	log.Info().Msg("Initializing database...")
	dbo, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		log.Fatal().Err(err).Msg("Unable to open database...")
	}

	DB = dbo

	DB.AutoMigrate(&DayData{})

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

/*	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	db.AutoMigrate(&DayData{})

	// retrieve the past 30 days
	start := time.Date(2021, time.December, 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(2021, time.December, 31, 0, 0, 0, 0, time.UTC)

	fmt.Printf("from: %v\n", start)
	fmt.Printf("now: %v\n", end)

	sql := "Date >= ? AND Date <= ?"
	data := make([]DayData, 31)

	db.Find(&data, sql, start, end)
	for _, d := range data {
		str, _ := d.Date.Value()
		fmt.Printf("Date: %v\n", str)
		fmt.Printf("Cash Deposit: %v\n", d.CashDeposit)
	}*/
