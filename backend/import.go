package main

import (
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/mannx/Bluebook/api"
	env "github.com/mannx/Bluebook/environ"
	daily "github.com/mannx/Bluebook/import"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// File contains all functions related to importing data
func importPostHandler(c echo.Context, handler func(string, *gorm.DB) daily.ImportReport) error {
	arr := make([]string, 0)

	if err := c.Bind(&arr); err != nil {
		log.Error().Err(err).Msg(" -> failed binding to ImportDailyData")
		return err
	}

	reports := make([]daily.ImportReport, 0)

	for _, n := range arr {
		fname := filepath.Join(env.Environment.ImportPath, n)
		log.Info().Msgf("Preparing to parse file: %v", fname)

		rep := handler(fname, DB)
		reports = append(reports, rep)
	}

	// get the number of status messages if any
	// if we have no messages, return false for error otherwise true
	//
	// condense the reports into a single array
	msgs := make([]string, 0)
	count := 0
	for _, r := range reports {
		count += len(r.Messages)
		msgs = append(msgs, r.Messages...)
	}

	return api.ReturnApiRequest(c, count > 0, msgs, "Import Results")
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
