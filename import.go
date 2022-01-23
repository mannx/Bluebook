package main

import (
	"io/ioutil"
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

//
// This function returns the list of files that can be imported
// uses fileMask to only return files types that match
func importFileHandler(c echo.Context, fileMask string) error {
	log.Debug().Msg("importFileHandler")

	files, err := ioutil.ReadDir(env.Environment.ImportPath)
	if err != nil {
		log.Error().Err(err).Msg("Unable to read directory provided by BLUEBOOK_IMPORT_PATH")
		return c.String(http.StatusInternalServerError, "Unable to retrieve import directory")
	}

	output := make([]string, 0)
	for _, f := range files {
		// check if file matches our file mask
		match, err := filepath.Match(fileMask, f.Name())
		if err != nil {
			log.Error().Err(err).Msg("Bad file mask detected") // only possible error, stop after first encounter
			break
		}

		if match {
			// match, save it, otherwise ignore
			output = append(output, f.Name())
		}
	}

	return c.JSON(http.StatusOK, &output)
}

func importPostHandler(c echo.Context, handler func(string, *gorm.DB) error) error {
	log.Debug().Msg("import post handler start")

	arr := make([]string, 0)

	if err := c.Bind(&arr); err != nil {
		log.Error().Err(err).Msg(" -> failed binding to ImportDailyData")
		return err
	}

	for _, n := range arr {
		fname := filepath.Join(env.Environment.ImportPath, n)
		log.Info().Msgf("Preparing to parse file: %v", fname)

		//go daily.ImportDaily(fname, DB)
		log.Debug().Msg("Running go function to handle import...")
		go handler(fname, DB)
	}

	return c.JSON(http.StatusOK, arr)
}

// returns a list of all files in the BB_IMPORT_?? enviromnet variable that are
// available for import
func importDailyHandler(c echo.Context) error {
	return importFileHandler(c, "*.xlsx")
}

func importPostDaily(c echo.Context) error {
	return importPostHandler(c, daily.ImportDaily)
}

func importControlHandler(c echo.Context) error {
	return importFileHandler(c, "ControlSheetReport_*.pdf")
}

func importWISRHandler(c echo.Context) error {
	return importFileHandler(c, "WISRReport_*.pdf")
}

func importPostControl(c echo.Context) error {
	return importPostHandler(c, daily.ImportControl)
}

func importPostWISR(c echo.Context) error {
	return importPostHandler(c, daily.ImportWISR)
}

func importWasteHandler(c echo.Context) error {
	return importFileHandler(c, "*.xlsx")
}

func importPostWaste(c echo.Context) error {
	return importPostHandler(c, daily.ImportWaste)
}
