package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

func HandleGetNotification(c echo.Context, db *gorm.DB) error {
	data := make([]models.NotificationData, 0)
	res := db.Find(&data, "shown = ?", false)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve notification data", res.Error)
	}

	return c.JSON(http.StatusOK, &data)
}

func HandleClearNotifications(c echo.Context, db *gorm.DB) error {
	var ids []uint
	if err := c.Bind(&ids); err != nil {
		return LogAndReturnError(c, "Unable to bind POST params for ClearNotifications", err)
	}

	data := models.NotificationData{}
	for _, i := range ids {
		log.Debug().Msgf(" == Clearing ID [%v]", i)

		res := db.Find(&data, "ID = ?", i)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to clear notification with ID %v ... ID not found", i)
			continue
		}

		data.Shown = true
		db.Save(&data)
	}

	return ReturnServerMessage(c, "Success", false)
}
