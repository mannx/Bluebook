package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// TagListViewHandler returns a list of all tags paired with their id
func TagListViewHandler(c echo.Context, db *gorm.DB) error {
	var tl []models.TagList

	res := db.Order("Tag").Find(&tl)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve tag list")
		return res.Error
	}

	return c.JSON(http.StatusOK, &tl)
}

// TagDataViewHandler returns all the days that use the given tag. Provided by parameter ID
func TagDataViewHandler(c echo.Context, db *gorm.DB) error {
	type TagList struct {
		Day  models.DayData //data for day with the tag
		Date string         // friendly string for the date
		Tags []string       // list of all other tags associated with this day
	}

	var id uint

	err := echo.QueryParamsBinder(c).
		Uint("id", &id).
		BindError()
	if err != nil {
		log.Error().Err(err).Msg("Unable to bind to parameter: id")
		return err
	}

	log.Debug().Msgf("TagDataViewHandler(%v) => start", id)

	var vd []models.TagData
	res := db.Find(&vd, "TagID = ?", id) // get all the days with this tag
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve tag data (1)")
		return res.Error
	}

	var data []TagList

	for _, i := range vd {
		var d models.DayData

		err := db.Find(&d, "ID = ?", i.DayID) // get the day data
		if err.Error != nil {
			log.Warn().Err(err.Error).Msgf("Unable to get daydata [%v] from tagdata [%v]", i.DayID, i.ID)
			continue // skip if bad
		}

		tstr, _ := getTags(d.ID, db)

		tl := TagList{
			Day:  d,
			Date: (time.Time(d.Date)).Format("Mon Jan _2 2006"),
			Tags: tstr,
		}

		data = append(data, tl)
	}

	return c.JSON(http.StatusOK, &data)

}
