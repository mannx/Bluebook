package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"gorm.io/gorm"
)

func HandleGetNotification(c echo.Context, db *gorm.DB) error {
	data := make([]models.NotificationData, 0)
	res := db.Find(&data)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to retrieve notification data", res.Error)
	}

	return c.JSON(http.StatusOK, &data)
}
