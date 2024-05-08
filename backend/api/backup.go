package api

import (
	"net/http"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	env "github.com/mannx/Bluebook/environ"
	"github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

func BackupViewHandler(c echo.Context, db *gorm.DB) error {
	var data []models.DayDataBackup

	res := db.Order("Date").Find(&data)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve day data backup data", res.Error)
	}

	return c.JSON(http.StatusOK, &data)
}

func BackupUndoHandler(c echo.Context, db *gorm.DB) error {
	// recieve post'd list of id's to revert
	ids := make([]string, 0)

	if err := c.Bind(&ids); err != nil {
		return LogAndReturnError(c, "Unable to bind list of ints to BackupUndoHandler", err)
	}

	for _, id := range ids {
		data := models.DayDataBackup{}

		res := db.Where("ID = ?", id).First(&data)
		if res.Error != nil {
			return LogAndReturnError(c, "Unable to find id", res.Error)
		}

		dd := data.DayData
		dd.ID = data.DayID

		// save it overwritting whats in the daydata table
		db.Save(&dd)

		// remove from the undo table
		db.Delete(&data)

		log.Info().Msgf(" ==> Undid day id [%v] for date [%v]", dd.ID, time.Time(data.Date).Format("01-02-2006"))
	}

	return ReturnServerMessage(c, "Not Yet Implemented", true)
}

// Clear out the daily backup table
func DailyBackupClearHandler(c echo.Context, db *gorm.DB) error {
	res := db.Where("1 = 1").Delete(&models.DayDataBackup{})
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to delete day data backup table", res.Error)
	}

	return ReturnServerMessage(c, "Day Data Backup Table Cleared", false)
}

// Run the archive script manually to create a backup archive
func RunArchiveScript(c echo.Context) error {
	log.Info().Msg("Running archive script manually...")

	// get the path to the ghd.sh script in the /scripts directory
	scriptPath := filepath.Join(env.Environment.ScriptsPath, "ar.sh")

	cmd := exec.Command(scriptPath)

	var out strings.Builder
	cmd.Stdout = &out

	err := cmd.Run()
	if err != nil {
		return LogAndReturnError(c, "Unable to run ar.sh", err)
	}

	msg := models.ServerReturnMessage{
		Message: "Unable to run ar.sh",
		Error:   true,
		Data:    out.String(),
	}

	return ReturnServerMessage2(c, msg)
}
