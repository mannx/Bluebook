package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
)

func ReturnServerMessage(c echo.Context, message string, err bool) error {
	return c.JSON(http.StatusOK,
		models.ServerReturnMessage{
			Message: message,
			Error:   err,
		})
}
