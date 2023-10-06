package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"gorm.io/gorm"
)

func CommentSearchHandler(c echo.Context, db *gorm.DB) error {
	var search string

	err := echo.QueryParamsBinder(c).String("q", &search).BindError()
	if err != nil {
		return LogAndReturnError(c, "Unable to bind to parameter: q", err)
	}

	var data []models.DayData

	res := db.Where("Comment LIKE ?", fmt.Sprintf("%%%v%%", search)).Find(&data)
	if res.Error != nil {
		return LogAndReturnError(c, "Error searchin db", res.Error)
	}

	type CommentData struct {
		Day  models.DayData
		Date string // user friendly string for the date
	}

	var out []CommentData

	for _, d := range data {
		cd := CommentData{
			Day:  d,
			Date: (time.Time(d.Date)).Format("Mon Jan _2 2006"),
		}

		out = append(out, cd)
	}

	return c.JSON(http.StatusOK, &out)
}
