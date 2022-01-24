package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

const dateFormat = "02012006"

// we are expecting 3 values in the post
//   comment:	the comment we are updating/creating
//	 linkedid:	the id of the day we are linked to

// UpdateCommentHandler is used to handle comments
func UpdateCommentHandler(c echo.Context, db *gorm.DB) error {
	type CommentPost struct {
		Comment  string `json:"Comment" query:"Comment"`
		LinkedID int    `json:"LinkedID" query:"LinkedID"` // id of the day we are adding the comment to, 0 if we dont have a linked day
	}
	var cp CommentPost

	if err := c.Bind(&cp); err != nil {
		log.Error().Err(err).Msg("Unable to bind from POST")
		return err
	}

	// do we have a valid linkedID?
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
		log.Warn().Msg("UpdateCommentHandler() => Adding comment with no linked day not yet supported")
	}

	return c.String(http.StatusOK, "Update Success")
}
