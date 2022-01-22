package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	api "github.com/mannx/Bluebook/api"
)

func initServer() *echo.Echo {
	e := echo.New()

	// middle ware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	e.Use(middleware.Static("./static"))

	// routes
	e.GET("/api/month", func(c echo.Context) error { return api.GetMonthViewHandler(c, DB) })

	// import GET and POST handlers
	e.GET("/api/import/daily", importDailyHandler)
	e.POST("/api/import/daily", importPostDaily)

	e.GET("/api/import/control", importControlHandler)
	e.POST("/api/import/control", importPostControl)

	e.GET("/api/import/wisr", importWISRHandler)
	e.POST("/api/import/wisr", importPostWISR)

	e.GET("/api/import/waste", importWasteHandler)
	e.POST("/api/import/waste", importPostWaste)

	// comment editing
	e.POST("/api/update/comment", func(c echo.Context) error { return api.UpdateCommentHandler(c, DB) })

	// Waste handling
	e.GET("/api/waste/view", func(c echo.Context) error { return api.GetWasteViewHandler(c, DB) })

	// Weekly reports
	e.GET("/api/weekly/view", func(c echo.Context) error { return api.GetWeeklyViewHandler(c, DB) })
	return e
}
