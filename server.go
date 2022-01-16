package main

import (
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	daily "github.com/mannx/Bluebook/import"
	"github.com/rs/zerolog/log"
)

func initServer() *echo.Echo {
	e := echo.New()

	// middle ware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	e.Use(middleware.Static("./static"))

	// routes
	e.GET("/api/test", testHandler)
	e.GET("/api/month", getMonthViewHandler)
	e.GET("/api/import", importHandler)
	e.GET("/api/import/daily", importDailyHandler)

	e.POST("/api/import/daily", importPostDaily)

	return e
}

func importHandler(c echo.Context) error {
	daily.ImportDaily("daily.xlsx", DB)
	return c.String(http.StatusOK, "importing...")
}

// returns a list of all files in the BB_IMPORT_?? enviromnet variable that are
// available for import
func importDailyHandler(c echo.Context) error {
	log.Info().Msg("importDailyhandler()")

	//files := make([]string, 0)

	// .. retrieve files list

	// retrieve files from the specified import directory given by the BB_IMPORT_PATH environment variable
	/*files = append(files, "file1.txt")
	files = append(files, "file2.txt")
	files = append(files, "file3.txt")*/

	path := os.Getenv("BLUEBOOK_IMPORT_PATH")
	if path == "" {
		// unable to import, return a warning
		log.Error().Msg("BLUEBOOK_IMPORT_PATH is not configured, unable to import")
		return c.String(http.StatusOK, "BLUEBOOK_IMPORT_PATH not configured. Unable to import")
	}

	files, err := ioutil.ReadDir(path)
	if err != nil {
		log.Error().Err(err).Msg("Unable to read directory provided by BLUEBOOK_IMPORT_PATH")
		return c.String(http.StatusInternalServerError, "Unable to retrieve import directory")
	}

	output := make([]string, 0)
	for _, f := range files {
		output = append(output, f.Name())
	}

	log.Info().Msg("returning 3 random files")
	return c.JSON(http.StatusOK, &output)
}

func importPostDaily(c echo.Context) error {
	log.Info().Msg("Import daily start")

	arr := make([]string, 0)

	if err := c.Bind(&arr); err != nil {
		log.Error().Err(err).Msg(" -> failed binding to ImportDailyData")
		return err
	}

	log.Info().Msgf("data: %v (%T)", arr, arr)
	log.Info().Msgf("data length: %v", len(arr))

	base := os.Getenv("BLUEBOOK_IMPORT_PATH")
	for _, n := range arr {
		fname := filepath.Join(base, n)
		log.Info().Msgf("Preparing to parse file: %v", fname)

		daily.ImportDaily(fname, DB)
	}

	return c.JSON(http.StatusOK, arr)
}
