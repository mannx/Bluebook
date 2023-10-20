package main

import (
	"net/http"
	"path/filepath"

	"github.com/labstack/echo/v4"
	env "github.com/mannx/Bluebook/environ"
	daily "github.com/mannx/Bluebook/import"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

//
// File contains all functions related to importing data
//

// NOTE
//  THIS FUNCTION IS NOW FOUND IN api2/import.go

// This function returns the list of files that can be imported
// uses fileMask to only return files types that match
// func importFileHandler(c echo.Context, fileMask string) error {
// 	files, err := ioutil.ReadDir(env.Environment.ImportPath)
// 	if err != nil {
// 		log.Error().Err(err).Msg("Unable to read directory provided by BLUEBOOK_IMPORT_PATH")
// 		return c.String(http.StatusInternalServerError, "Unable to retrieve import directory")
// 	}

// 	output := make([]string, 0)
// 	for _, f := range files {
// 		// check if file matches our file mask
// 		match, err := filepath.Match(fileMask, f.Name())
// 		if err != nil {
// 			log.Error().Err(err).Msg("Bad file mask detected") // only possible error, stop after first encounter
// 			break
// 		}

// 		if match {
// 			// match, save it, otherwise ignore
// 			output = append(output, f.Name())
// 		}
// 	}

// 	return c.JSON(http.StatusOK, &output)
// }

func importPostHandler(c echo.Context, handler func(string, *gorm.DB) error) error {
	arr := make([]string, 0)

	if err := c.Bind(&arr); err != nil {
		log.Error().Err(err).Msg(" -> failed binding to ImportDailyData")
		return err
	}

	for _, n := range arr {
		fname := filepath.Join(env.Environment.ImportPath, n)
		log.Info().Msgf("Preparing to parse file: %v", fname)

		go handler(fname, DB)
	}

	return c.String(http.StatusOK, "Processing files...")
}

func importPostDaily(c echo.Context) error {
	return importPostHandler(c, daily.ImportDaily)
}

func importPostControl(c echo.Context) error {
	return importPostHandler(c, daily.ImportControl)
}

func importPostWISR(c echo.Context) error {
	return importPostHandler(c, daily.ImportWISR)
}
