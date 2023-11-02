package main

import (
	"net/http"
	"path/filepath"

	"github.com/labstack/echo/v4"
	env "github.com/mannx/Bluebook/environ"
	daily "github.com/mannx/Bluebook/import"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// File contains all functions related to importing data
func importPostHandler(c echo.Context, handler func(string, *gorm.DB) error) error {
	arr := make([]string, 0)

	if err := c.Bind(&arr); err != nil {
		log.Error().Err(err).Msg(" -> failed binding to ImportDailyData")
		return err
	}

	for _, n := range arr {
		fname := filepath.Join(env.Environment.ImportPath, n)
		log.Info().Msgf("Preparing to parse file: %v", fname)

		go handler(fname, DB)
	}

	return c.String(http.StatusOK, "Processing files...")
}

func importPostDaily(c echo.Context) error {
	return importPostHandler(c, daily.ImportDaily)
}

func importPostControl(c echo.Context) error {
	return importPostHandler(c, daily.ImportControl)
}

func importPostWISR(c echo.Context) error {
	return importPostHandler(c, daily.ImportWISR)
}
