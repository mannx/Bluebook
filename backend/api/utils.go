package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
)

func ReturnServerMessage(c echo.Context, message string, err bool) error {
	return c.JSON(http.StatusOK,
		models.ServerReturnMessage{
			Message: message,
			Error:   err,
		})
}

func LogAndReturnError(c echo.Context, message string, err error) error {
	log.Error().Err(err).Msg(message)
	return ReturnServerMessage(c, message, true)
}

func ReturnServerOK(c echo.Context) error {
	return ReturnServerMessage(c, "Success", false)
}

func ReturnServerMessage2(c echo.Context, msg models.ServerReturnMessage) error {
	return c.JSON(http.StatusOK, msg)
}
