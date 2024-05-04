package api

import (
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
)

func ReturnServerMessage(c echo.Context, message string, err bool) error {
	return c.JSON(http.StatusOK,
		models.ApiReturnMessage{
			Error:   err,
			Message: message,
			Data:    "",
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

func ReturnApiRequest(c echo.Context, err bool, data interface{}, errMsg string) error {
	b, e := json.Marshal(data)
	if e != nil {
		log.Error().Err(e).Msg("Unable to marshall data for ApiRequest")
		return ReturnServerMessage(c, "Unable to convert data to json", true)
	}

	return c.JSON(http.StatusOK,
		models.ApiReturnMessage{
			Error:   err,
			Message: errMsg,
			Data:    string(b[:]),
		})
}
