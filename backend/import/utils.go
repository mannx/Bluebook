package daily

import (
	"errors"
	"fmt"
	"os/exec"
	"path/filepath"
	"time"

	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"

	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type ImportReport struct {
	Messages []string // any status messages generated during the import
}

func (report *ImportReport) Add(msg string) {
	report.Messages = append(report.Messages, msg)
}

func NewImportReport() ImportReport {
	return ImportReport{
		Messages: make([]string, 0),
	}
}

// PDFToText takes a filename, and returns a new file name
// of a temporary file that has been converted to text
// returns an error if anything failed during the conversion, nil otherwise
//
// We use the environment variable BLUEBOOK_TEMP_PATH to indicate where temporary
// files should go
func PDFToText(fileName string) (string, error) {
	// execute: pdftotext fileName BLUEBOOK_TEMP_PATH/tempFileName
	_, rawfname := filepath.Split(fileName) // extract just the file name
	outFile := filepath.Join(env.Environment.TempPath, fmt.Sprintf("%v.txt", rawfname))

	cmd := exec.Command("pdftotext", "-layout", fileName, outFile)
	err := cmd.Run()
	if err != nil {
		var exit *exec.ExitError
		if errors.As(err, &exit) {
			// exit error
			log.Debug().Msgf("[PDFToText -- Exit Error] Exit Code: %v", exit.ExitCode())
			log.Debug().Msgf("[PDFToText -- Error Message] %v", string(exit.Stderr[:]))
		}
		log.Error().Err(err).Msgf("Unable to convert from pdf to text: %v", fileName)
		return "", err
	}

	return outFile, nil
}

// getDataOrNew returns either a blank DayData or an already filled in one, if blank, returns true, otherwise false
func getDataOrNew(date time.Time, db *gorm.DB) (models.DayData, bool) {
	n := models.DayData{}

	res := db.Find(&n, "Date = ?", date)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to load data, using new data")
		return n, true
	}

	if res.RowsAffected == 0 {
		// no data available, creating a blank entry
		return n, true
	}

	return n, false
}

func getWeeklyInfoOrNew(date time.Time, db *gorm.DB) models.WeeklyInfo {
	n := models.WeeklyInfo{}

	res := db.Find(&n, "Date = ?", date)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("unable to load weekly info, using new data")
		return n
	}

	return n
}

// reFail will display an error message noting the function and which item failed its regex check
// func reFail(from string, item string, msg ImportReport) ImportReport {
// 	log.Error().Msgf("[%v]{reFail} Unable to parse data for: %v", from, item)
// 	// return fmt.Errorf("unable to parse data for: %v", item)
// 	// return fmt.Sprintf("unable to parse data for: %v", item)

// 	msg.Messages = append(msg.Messages, fmt.Sprintf("Unable to parse data for: %v", item))
// 	return msg
// }
