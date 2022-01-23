package daily

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"time"

	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"

	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

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

	log.Debug().Msgf("running pdftotext %v %v", fileName, outFile)
	cmd := exec.Command("pdftotext", "-layout", fileName, outFile)
	err := cmd.Run()
	if err != nil {
		log.Error().Err(err).Msgf("Unable to convert from pdf to text: %v", fileName)
		return "", err
	}

	return outFile, nil
}

func getDataOrNew(date time.Time, db *gorm.DB) models.DayData {
	n := models.DayData{}

	log.Debug().Msgf("[getDataOrNew] Checking for object date: %v", date.String())
	res := db.Find(&n, "Date = ?", date)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to load data, using new data")
		return n
	}

	log.Info().Msgf("date: %v [id: %v]", n.Date, n.ID)
	return n
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
