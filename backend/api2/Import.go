package api2

import (
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
	api "github.com/mannx/Bluebook/api"
	env "github.com/mannx/Bluebook/environ"
	"github.com/rs/zerolog/log"
)

// This function returns the list of files that can be imported
// uses fileMask to only return files types that match
func importFileHandler(fileMask string) ([]string, error) {
	files, err := os.ReadDir(env.Environment.ImportPath)
	if err != nil {
		log.Error().Err(err).Msg("Unable to read directory provided by BLUEBOOK_IMPORT_PATH")
		return nil, err
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

	return output, nil
}

// return a list of all the possible files we can import as seperate lists
func GetImportList(c echo.Context) error {
	type importList struct {
		Daily   []string // list of all daily sheets (*.xlsx)
		Control []string // list of all control sheets
		WISR    []string // list of all wisr sheets
	}

	// get all the files we need
	daily, err := importFileHandler("*.xlsx")
	if err != nil {
		return api.LogAndReturnError(c, "Unable to fetch daily sheets", err)
	}

	control, err := importFileHandler("ControlSheetReport_*.pdf")
	if err != nil {
		return api.LogAndReturnError(c, "Unable to fetch control sheets", err)
	}

	wisr, err := importFileHandler("WISRReport_*.pdf")
	if err != nil {
		return api.LogAndReturnError(c, "Unable to fetch wisr sheets", err)
	}

	return api.ReturnApiRequest(c, false, &importList{
		daily,
		control,
		wisr,
	}, "")
}
