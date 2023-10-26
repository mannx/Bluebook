package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mannx/Bluebook/models"
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
