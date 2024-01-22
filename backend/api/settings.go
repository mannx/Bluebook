package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

func HandleSettingsGet(c echo.Context, db *gorm.DB) error {
	var set models.BluebookSettings

	res := db.First(&set)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retreive user settings.  Returning fresh settings")
		return c.JSON(http.StatusOK, &models.BluebookSettings{})
	}

	return c.JSON(http.StatusOK, &set)
}

func HandleSettingsSet(c echo.Context, db *gorm.DB) error {
	var data models.BluebookSettings

	if err := c.Bind(&data); err != nil {
		return LogAndReturnError(c, "Unable to bind data", err)
	}

	// delete the current settings and save the new ones
	// TODO: validate options before saving?
	db.Where("1=1").Delete(&models.BluebookSettings{})
	db.Save(&data)

	log.Debug().Msgf("display: %v", data.DisplayHockeyWeekly)

	return ReturnServerMessage(c, "Success", false)
}
