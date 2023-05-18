package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	api "github.com/mannx/Bluebook/api"
	api2 "github.com/mannx/Bluebook/api2"
)

func initServer() *echo.Echo {
	e := echo.New()

	// middle ware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	// e.Use(middleware.Static("./static"))
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:  "./static",
		HTML5: true, // redirects all not found requests to the root to let the frontend handle routing
	}))

	// routes
	e.GET("/api/month", func(c echo.Context) error { return api.GetMonthViewHandler(c, DB) })

	// import GET and POST handlers
	e.POST("/api/import/daily", importPostDaily)
	e.POST("/api/import/control", importPostControl)
	e.POST("/api/import/wisr", importPostWISR)

	// Waste handling
	e.GET("/api/waste/view", func(c echo.Context) error { return api.GetWasteViewHandler(c, DB) })
	e.GET("/api/waste/settings", func(c echo.Context) error { return api.GetWasteSettingHandler(c, DB) })

	e.POST("/api/waste/item/new", func(c echo.Context) error { return api.AddNewWasteItemHandler(c, DB) })

	e.GET("/api/waste/names", func(c echo.Context) error { return api.GetWasteNamesHandler(c, DB) })
	e.GET("/api/waste/unused", func(c echo.Context) error { return api.RemoveUnusedWasteItems(c, DB) })
	e.GET("/api/waste/item", func(c echo.Context) error { return api.GetWasteItemInfo(c, DB) })
	e.POST("/api/waste/item/update", func(c echo.Context) error { return api.UpdateWasteSettingHandler(c, DB) })

	e.GET("/api/waste/holding", func(c echo.Context) error { return api.GetWasteHoldingHandler(c, DB) })
	e.POST("/api/waste/holding/add", func(c echo.Context) error { return api.AddWasteHoldingHandler(c, DB) })
	e.POST("/api/waste/holding/confirm", func(c echo.Context) error { return api.WasteHoldingConfirmHandler(c, DB) })
	e.POST("/api/waste/holding/delete", func(c echo.Context) error { return api.WasteHoldingDeleteHandler(c, DB) })

	e.POST("/api/waste/export", func(c echo.Context) error { return api.WasteExport(c, DB) })

	// Weekly reports
	e.GET("/api/weekly/view", func(c echo.Context) error { return api.GetWeeklyViewHandler(c, DB) })

	// Tags
	e.GET("/api/tags/view", func(c echo.Context) error { return api.TagListViewHandler(c, DB) })
	e.GET("/api/tags/data", func(c echo.Context) error { return api.TagDataViewHandler(c, DB) })

	// Top5
	e.GET("/api/top5", func(c echo.Context) error { return api.GetTop5Data(c, DB) })
	e.GET("/api/top5/data", func(c echo.Context) error { return api.GetTop5ViewHandler(c, DB) })

	// Backup

	//
	// VERSION 2
	//
	// API's for the v2 rewrite are found below to keep things organized
	// all v2 functions should be in either a seperate mod or clearly noted as v2
	//

	e.GET("/api2/day/edit", func(c echo.Context) error { return api2.DayDataEdit(c, DB) })
	e.POST("/api2/day/update", func(c echo.Context) error { return api2.DayDataUpdate(c, DB) })

	e.GET("/api2/import/list", func(c echo.Context) error { return api2.GetImportList(c, DB) })

	e.POST("/api2/weekly/export", func(c echo.Context) error { return api.ExportWeeklyHandler(c, DB) })

	e.GET("/api2/auv/view", func(c echo.Context) error { return api2.GetAUVViewHandler(c, DB) })
	e.POST("/api2/auv/update", func(c echo.Context) error { return api2.UpdateAUVHandler(c, DB) })

	return e
}
