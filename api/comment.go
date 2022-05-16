package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

const dateFormat = "02012006"

// we are expecting 3 values in the post
//   comment:	the comment we are updating/creating
//	 linkedid:	the id of the day we are linked to

// UpdateCommentHandler is used to handle comments
func UpdateCommentHandler(c echo.Context, db *gorm.DB) error {
	type CommentPost struct {
		Comment  string    `json:"Comment" query:"Comment"`
		LinkedID int       `json:"LinkedID" query:"LinkedID"` // id of the day we are adding the comment to, 0 if we dont have a linked day
		Date     time.Time `json:"Date" query:"Date"`
	}

	var cp CommentPost

	if err := c.Bind(&cp); err != nil {
		log.Error().Err(err).Msg("Unable to bind from POST")
		return err
	}

	// do we have a valid linkedID?
	// check to see if we have an entry already
	if cp.LinkedID == 0 {
		log.Debug().Msgf("Linked id == 0, checking for existing day...[date: %v]", cp.Date)

		dd := models.DayData{}
		res := db.Where("Date = ?", cp.Date).Find(&dd)
		if res.Error == nil && res.RowsAffected != 0 {
			// save the comment to this day
			log.Debug().Msgf("  => Day found, date [%v] id [%v]", dd.Date, dd.ID)
			log.Debug().Msgf("  => Rows Affected: %v", res.RowsAffected)

			dd.Comment = cp.Comment
			db.Save(&dd)

			return c.String(http.StatusOK, "Update Success")
		}

		// otherwise fall through
	}

	if cp.LinkedID != 0 {
		log.Debug().Msgf("Adding comment to linked day: %v", cp.LinkedID)

		dd := models.DayData{}
		res := db.Find(&dd, "ID = ?", cp.LinkedID)
		if res.Error != nil {
			return c.String(http.StatusInternalServerError, "Unable to find linked day")
		}

		dd.Comment = cp.Comment
		db.Save(&dd)
	} else {
		// use the provided date to generate a new database entry for this date
		log.Debug().Msg("UpdateCommentHandler() => No DayData found, generating new entry...")
		dd := models.DayData{
			Date:    datatypes.Date(cp.Date),
			Comment: cp.Comment,
		}

		db.Save(&dd)
	}

	return c.String(http.StatusOK, "Update Success")
}
