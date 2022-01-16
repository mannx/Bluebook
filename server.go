package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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
	e.GET("/api/test", testHandler)
	e.GET("/api/month", getMonthViewHandler)

	// import GET and POST handlers
	e.GET("/api/import/daily", importDailyHandler)
	e.POST("/api/import/daily", importPostDaily)

	e.GET("/api/import/control", importControlHandler)
	e.POST("/api/import/control", importPostControl)

	e.GET("/api/import/wisr", importWISRHandler)
	e.POST("/api/import/wisr", importPostWISR)

	return e
}
