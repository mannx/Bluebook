package api

import (
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type tagData struct {
	models.TagList

	TagCount int
}

func getTagDataWithCount(db *gorm.DB) ([]tagData, error) {
	var tl []models.TagList

	res := db.Order("Tag").Find(&tl)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve tag list")
		//return res.Error
		return nil, res.Error
	}

	var td []tagData
	for _, i := range tl {
		// get the number of entries using this tag
		var data []models.TagData

		res = db.Where("TagID = ?", i.ID).Find(&data)
		if res.Error != nil {
			//return LogAndReturnError(c, "Unable to retrieve tag counts", res.Error)
			return nil, res.Error
		}

		td = append(td, tagData{
			TagList:  i,
			TagCount: len(data),
		})
	}

	return td, nil
}

// TagListViewHandler returns a list of all tags paired with their id
func TagListViewHandler(c echo.Context, db *gorm.DB) error {
	/*var tl []models.TagList

	res := db.Order("Tag").Find(&tl)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve tag list")
		return res.Error
	}

	var td []tagData
	for _, i := range tl {
		// get the number of entries using this tag
		var data []models.TagData

		res = db.Where("TagID = ?", i.ID).Find(&data)
		if res.Error != nil {
			return LogAndReturnError(c, "Unable to retrieve tag counts", res.Error)
		}

		td = append(td, tagData{
			TagList:  i,
			TagCount: len(data),
		})
	}*/

	td, err := getTagDataWithCount(db)
	if err != nil {
		return LogAndReturnError(c, "Unable to retrieve tag counts", err)
	}

	return c.JSON(http.StatusOK, &td)
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

	// sort data by Day.Date
	sort.Slice(data, func(i, j int) bool {
		d1 := time.Time(data[i].Day.Date)
		d2 := time.Time(data[j].Day.Date)
		return d1.Before(d2)
	})

	return c.JSON(http.StatusOK, &data)

}

// TagUpdateViewHandler handles the POST'd data to update a day's tags
func TagUpdateViewHandler(c echo.Context, db *gorm.DB) error {
	type tagUpdate struct {
		Tag      string    `json:"Tag" query:"Tag"`
		LinkedID uint      `json:"LinkedID" query:"LinkedID"`
		Date     time.Time `json:"Date" query:"Date"`
	}

	var tu tagUpdate
	if err := c.Bind(&tu); err != nil {
		log.Error().Err(err).Msg("Unable to bind from POST")
		return err
	}

	// are we updating tags on a linked day?
	if tu.LinkedID != 0 {
		// update tags linked to this day
		log.Debug().Msg("Updating tags linked to id")

		updateTags(tu.LinkedID, tu.Tag, db)

	} else {
		// attempt to generate an empty day and then try and link again
		id, err := genEmptyDay(db, tu.Date)
		if err != nil {
			log.Warn().Err(err).Msg("Unable to add tag to empty day")
			return c.String(http.StatusInternalServerError, "Error")
		}

		log.Debug().Msg("Updating tags linked to new day")
		updateTags(id, tu.Tag, db)
	}

	return nil
}

// generate the empty day, save it to the database and return its id
//
//	check to see if a day already exists and return its id instead of creating a new entry
//	if only a comment is present, no linked id will be sent and we end up here
func genEmptyDay(db *gorm.DB, date time.Time) (uint, error) {
	var data models.DayData
	res := db.Find(&data, "Date = ?", date)
	if res.Error != nil {
		return 0, res.Error
	}

	if res.RowsAffected != 0 {
		// found an entry, return its id
		return data.ID, nil
	}

	dd := models.DayData{
		Date: datatypes.Date(date),
	}

	res = db.Create(&dd)
	if res.Error != nil {
		return 0, res.Error
	}

	return dd.ID, nil
}

// parse and update the tags for a given day
func updateTags(id uint, tags string, db *gorm.DB) {

	// 0) Delete any tag data for the given day if currently present
	// 1) split tagStr into seperate tags
	//	a) remove any spaces and convert to lower case
	//	b) split string on each hash tag
	// 2) if found in the tag table, retrieve its id
	//	else add to the table and retrieve its new id
	// 3) add each tag id with the day id to the tag table

	// delete any tags currently linked to this day
	db.Delete(&models.TagData{}, "DayID = ?", id)

	tstr := strings.Split(tags, "#")
	for _, s := range tstr {
		if len(s) == 0 {
			continue // skip empty tags
		}

		// 2) remove any excess whitespace and check if in table
		str := strings.TrimSpace(s)

		var td models.TagList

		res := db.Find(&td, "Tag = ?", str)
		if res.Error != nil {
			log.Error().Err(res.Error).Msg("Unable to find tag")
			continue
		}

		if res.RowsAffected == 0 {
			// tag not found, add it and grab its id
			td.Tag = str
			db.Save(&td)
		}

		log.Debug().Msgf("Adding tag id %v to day id %v", td.ID, id)

		go func() {
			td := models.TagData{
				TagID: td.ID,
				DayID: id,
			}

			db.Save(&td)
		}()
	}
}

// TagCleanHandler removes all unused tags
func TagCleanHandler(c echo.Context, db *gorm.DB) error {
	// get list of all tags and their counts
	td, err := getTagDataWithCount(db)
	if err != nil {
		return LogAndReturnError(c, "Unable to retrieve tag data", err)
	}

	ids := make([]uint, 0)
	for _, i := range td {
		if i.TagCount == 0 {
			// add id to list
			ids = append(ids, i.ID)
		}
	}

	// remove all ids from the db
	log.Debug().Msg("Removing all unused tags")
	db.Delete(&models.TagList{}, ids)

	return ReturnServerMessage(c, "Success", false)
}
