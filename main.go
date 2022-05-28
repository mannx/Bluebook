package main

import (
	"context"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	env "github.com/mannx/Bluebook/environ"
	imp "github.com/mannx/Bluebook/import"
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

	//log.Info().Msgf("Bluebook Helper v%v.\n\n", Version)
	log.Info().Msgf("Bluebook Helper")
	log.Info().Msgf("  => Version: %v", BuildVersion)
	log.Info().Msgf("  => Build Time: %v", BuildTime)

	log.Info().Msg("Initializing environment...")
	env.Environment.Init()

	dbName = filepath.Join(env.Environment.DataPath, "db.db")

	log.Info().Msg("Initializing database...")
	log.Debug().Msgf("  => Database path: %v", dbName)
	dbo, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	if err != nil {
		log.Fatal().Err(err).Msg("Unable to open database...")
	}

	DB = dbo

	log.Info().Msg("Auto migrating the database...")
	migrateDB()

	convertFlag := flag.Bool("convert", false, "convert date types in all database entries")
	commentFlag := flag.Bool("comment", false, "combine comments into day data table before destroying")
	wasteFlag := flag.Bool("waste", false, "import waste defintion file waste_def.json")

	flag.Parse()

	if *convertFlag {
		log.Info().Msg("Converting old database to current...")
		err = convertDB()
		if err != nil {
			log.Fatal().Err(err).Msg("Unable to convert dates to timestamps")
		}
	}

	if *commentFlag {
		importComments()
	}

	if *wasteFlag {
		importWasteDef()
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

	DB.AutoMigrate(&models.TagList{})
	DB.AutoMigrate(&models.TagData{})
}

// importComments combines the comment table into the day data table
func importComments() {
	log.Debug().Msg("Combining commnets into 1 table")

	var cmt []models.Comments
	res := DB.Find(&cmt)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to read in comments")
		return
	}

	log.Debug().Msgf("Combining %v comment records...", res.RowsAffected)
	for _, n := range cmt {
		dd := models.DayData{}
		res = DB.Find(&dd, "ID = ?", n.LinkedID)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to find day for comment %v", n.LinkedID)
			continue
		}
		if res.RowsAffected == 0 {
			log.Error().Msgf("No data for comment id %v", res.RowsAffected)
			continue
		}

		dd.Comment = n.Comment
		DB.Save(&dd)
	}
}

func importWasteDef() {
	log.Debug().Msg("ImportWasteDef()")
	fname := filepath.Join(env.Environment.DataPath, "waste_def.json")
	imp.ImportWasteDefinition(fname, DB)
}
