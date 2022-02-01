package api

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// GetTop5ViewHandler expects params of none (top all time, year=YYYY for top of year, year=YYYY&month=MM for best of month
func GetTop5ViewHandler(c echo.Context, db *gorm.DB) error {
	log.Debug().Msg("Top5 View Handler()")
	var month, year int

	err := echo.QueryParamsBinder(c).
		Int("month", &month).
		Int("year", &year).
		BindError()
	if err != nil {
		return err
	}

	type message struct {
		Message string
	}

	msg := message{
		Message: fmt.Sprintf("Top 5 of month: %v, year: %v", month, year),
	}

	return c.JSON(http.StatusOK, &msg)
}
