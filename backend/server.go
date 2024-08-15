package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	api "github.com/mannx/Bluebook/api"
	api2 "github.com/mannx/Bluebook/api2"
	env "github.com/mannx/Bluebook/environ"
	"github.com/mannx/Bluebook/models"
)

func initServer() *echo.Echo {
	e := echo.New()

	// middle ware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:  "./static",
		HTML5: true, // redirects all not found requests to the root to let the frontend handle routing
	}))

	// routes
	e.GET("/api/month", func(c echo.Context) error { return api.GetMonthViewHandler(c, DB) })
	e.GET("/api/hockey/data", func(c echo.Context) error { return api.HockeyDataHandler(c, DB) })
	e.GET("/api/hockey/data/years", func(c echo.Context) error { return api.HockeyDataYearsHandler(c, DB) })

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
	e.GET("/api/backup/daydata/get", func(c echo.Context) error { return api.BackupViewHandler(c, DB) })
	e.POST("/api/backup/daydata/action", func(c echo.Context) error { return api.BackupUndoHandler(c, DB) })
	e.GET("/api/backup/daydata/clear", func(c echo.Context) error { return api.DailyBackupClearHandler(c, DB) })
	e.GET("/api/backup/archive", func(c echo.Context) error { return api.RunArchiveScript(c) })

	//
	// VERSION 2
	//
	// API's for the v2 rewrite are found below to keep things organized
	// all v2 functions should be in either a seperate mod or clearly noted as v2
	//

	e.GET("/api2/day/edit", func(c echo.Context) error { return api2.DayDataEdit(c, DB) })
	e.POST("/api2/day/update", func(c echo.Context) error { return api2.DayDataUpdate(c, DB) })

	e.GET("/api2/import/list", func(c echo.Context) error { return api2.GetImportList(c) })

	e.POST("/api2/weekly/export", func(c echo.Context) error { return api.ExportWeeklyHandler(c, DB) })

	e.GET("/api2/auv/view", func(c echo.Context) error { return api2.GetAUVViewHandler(c, DB) })
	e.POST("/api2/auv/update", func(c echo.Context) error { return api2.UpdateAUVHandler(c, DB) })

	e.GET("/api/comment/search", func(c echo.Context) error { return api.CommentSearchHandler(c, DB) })

	e.GET("/api/stats/average", func(c echo.Context) error { return api2.StatsAverageSalesByDayHandler(c, DB) })

	// e.POST("/api/hockey/import", func(c echo.Context) error { return api.HockeyManualImportHandler(c, DB) })
	// e.GET("/api/hockey/merge", func(c echo.Context) error { return api.HockeyDebugMerge(DB) })
	e.POST("/api/hockey/import2", func(c echo.Context) error { return api.HockeyImport(c, DB) })

	// test api function
	// delete once no longer required
	// retunrs the index.html file locally cached instead of fetching each time
	e.GET("/api/hockey/raw", getRawHockeyFile)

	e.POST("/api/settings/set", func(c echo.Context) error { return api.HandleSettingsSet(c, DB) })
	e.GET("/api/settings/get", func(c echo.Context) error { return api.HandleSettingsGet(c, DB) })

	e.GET("/api/raw/daydata", func(c echo.Context) error { return api2.HandleRawDayData(c, DB) })

	e.GET("/api/about", aboutPage)

	// typescript frontend dev api points -- Delete after conversion complete
	e.GET("/api/test/ok", testApiOK)
	e.GET("/api/test/fail", testApiFail)
	e.GET("/api/test/bad", testApiBad)
	return e
}

func aboutPage(c echo.Context) error {
	type AboutInfo struct {
		Commit string
		Branch string
	}

	info := AboutInfo{
		Commit,
		Branch,
	}

	return c.JSON(http.StatusOK, &info)
}

func testApiOK(c echo.Context) error {
	type TestInfo struct {
		Number int
		Msg    string
	}

	ti := TestInfo{
		Number: 42,
		Msg:    "This is a test message",
	}

	rmsg := models.ApiTestMessage{
		Error:   false,
		Message: "",
		Data:    ti,
	}

	return c.JSON(http.StatusOK, &rmsg)
}

func testApiFail(c echo.Context) error {
	r := models.ApiTestMessage{
		Error:   true,
		Message: "Failure success",
	}

	return c.JSON(http.StatusOK, &r)
}

func testApiBad(c echo.Context) error {
	type BadApi struct {
		Float  float64
		ApiVal string
	}

	r := BadApi{
		Float:  3.14,
		ApiVal: "Api Val String",
	}

	return c.JSON(http.StatusOK, &r)
}

func getRawHockeyFile(c echo.Context) error {
	// read in the cached index.html from /data
	fname := filepath.Join(env.Environment.DataPath, "index.html")
	f, err := os.ReadFile(fname)
	if err != nil {
		return api.LogAndReturnError(c, "Unable to read /data/index.html", err)
	}

	// convert to a string and extract the json data we want
	datastr := string(f[:])
	lines := strings.Split(datastr, "\n")

	// find the line we want
	for _, l := range lines {
		if strings.Contains(l, "data:") {
			// found it, split and return
			data := l[10 : len(l)-3]
			return api.ReturnApiRequest(c, false, data, "")
		}
	}

	return api.ReturnApiRequest(c, true, nil, "Unable to get data to parse")
}
