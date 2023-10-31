package api2

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	api "github.com/mannx/Bluebook/api"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func DayDataEdit(c echo.Context, db *gorm.DB) error {
	type dayData struct {
		models.DayData

		Tags []string
	}

	var id uint     // id of the day we want
	var date string // YYYYMMDD format of the date for a new entry

	err := echo.QueryParamsBinder(c).
		Uint("id", &id).
		String("date", &date).
		BindError()

	if err != nil {
		return err
	}

	// get the day data object
	var obj models.DayData
	var tags []string

	// retrieve the object if we have an id != 0, otherwise
	// extract the date and return an empty object with the correct date set
	if id == 0 {
		t, err := extractDate(date)
		if err != nil {
			return api.LogAndReturnError(c, fmt.Sprintf("Unable to parse date: %v", date), err)
		}

		obj.Date = datatypes.Date(t)
		tags = nil
	} else {
		res := db.Where("ID = ?", id).Find(&obj)
		if res.Error != nil {
			return api.LogAndReturnError(c, "Error retrieving data", res.Error)
		}

		tags, _ = api.GetTags(id, db)
	}

	ret := dayData{
		DayData: obj,
		Tags:    tags,
	}

	return c.JSON(http.StatusOK, &ret)
}

func extractDate(d string) (time.Time, error) {
	// parse the date format of YYYYMMDD
	t, err := time.Parse("20060102", d)
	if err != nil {
		log.Error().Err(err).Msgf("Unable to parse time!")
		return time.Now(), err
	}

	return t, nil
}

// Update the given day data record with the provided information
// tags may or maynot have a # before them that needs to be removed
func DayDataUpdate(c echo.Context, db *gorm.DB) error {
	type updateData struct {
		ID      uint   `json:"ID"`
		Date    string `json:"Date"`
		Comment string `json:"Comment"`
		Tags    string `json:"Tags"`
	}

	var update updateData

	if err := c.Bind(&update); err != nil {
		return api.LogAndReturnError(c, "Unable to bind from POST", err)
	}

	// retrieve the daydata if we have a valid id
	dd := models.DayData{}
	id := update.ID

	if update.ID != 0 {
		res := db.Find(&dd, "ID = ?", update.ID)
		if res.Error != nil {
			return api.LogAndReturnError(c, "Unable to find linked day", res.Error)
		}

		if res.RowsAffected == 0 {
			return api.LogAndReturnError(c, "Linked day not found", nil)
		}
	} else {
		// no data yet, generate and save a new day and grab its id
		date, err := extractDate(update.Date)
		if err != nil {
			return api.LogAndReturnError(c, "Unable to parse date", err)
		}

		dd.Date = datatypes.Date(date)
	}

	// update the comment and save
	dd.Comment = update.Comment
	db.Save(&dd)

	// update the id if we created a new entry
	if update.ID == 0 {
		id = dd.ID
	}

	// process the tags
	err := processTags(id, update.Tags, db)
	if err != nil {
		return api.LogAndReturnError(c, "Error processing tags", err)
	}

	return api.ReturnServerMessage(c, "Update Success", false)
}

// process the raw list of tags for this day
func splitTags(tags string) []string {
	// tags optionally start with a # and may be seperated with a space
	// #tag1 tag2#tag3

	// 1) replace all # with a space
	// 2) split on spaces, trim excess whitespace
	t1 := strings.ReplaceAll(tags, "#", " ")
	t2 := strings.TrimSpace(t1)
	t3 := strings.Split(t2, " ")

	return t3
}

func processTags(id uint, tags string, db *gorm.DB) error {
	if len(tags) == 0 {
		// empty tag, ignore
		return nil
	}

	// delete any tags currently linked to this day
	//	? required? better way to prevent adding it twice?
	db.Delete(&models.TagData{}, "DayID = ?", id)

	for _, s := range splitTags(tags) {
		// check if in the tag table
		var tl models.TagList

		res := db.Find(&tl, "Tag = ?", s)
		if res.Error != nil {
			// db error, try again if we have other tags still (??)
			log.Error().Err(res.Error).Msgf("Unable to find tag: %v", s)
			continue
		}

		if res.RowsAffected == 0 {
			// tag not found, add it and save its id
			tl.Tag = s
			db.Save(&tl)
		}

		// update the tag entries
		go func() {
			td := models.TagData{
				TagID: tl.ID,
				DayID: id,
			}

			db.Save(&td)
		}()
	}

	return nil
}
