package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
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

		// save it overwritting whats in the daydata table
		db.Save(&dd)

		log.Info().Msgf(" ==> Undid day id [%v] for date [%v]", dd.ID, time.Time(data.Date).Format("01-02-2006"))
	}

	return ReturnServerMessage(c, "Not Yet Implemented", true)
}
