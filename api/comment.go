package api

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type CommentPost struct {
	Comment  string `json:"Comment" query:"Comment"`
	LinkedID int    `json:"LinkedID" query:"LinkedID"` // id of the day we are adding the comment to, 0 if we dont have a linked day
	Date     string `json:"Date" query:"Date"`         // if LinkedID is valid, this is nil, otherwise form of MMDDYYYY used when there is no daydata
}

const dateFormat = "02012006"

// we are expecting 3 values in the post
//   comment:	the comment we are updating/creating
//	 linkedid:	the id of the day we are linked to
func UpdateCommentHandler(c echo.Context, db *gorm.DB) error {
	var cp CommentPost

	if err := c.Bind(&cp); err != nil {
		log.Error().Err(err).Msg("Unable to bind from POST")
		return err
	}

	// do we have a valid linkedID?
	if cp.LinkedID != 0 {
		log.Debug().Msgf("Adding comment to linked day: %v", cp.LinkedID)

		cm := models.Comments{LinkedID: cp.LinkedID, Comment: cp.Comment}
		res := db.Save(&cm)
		if res.Error != nil {
			return c.String(http.StatusInternalServerError,
				fmt.Sprintf("Unable to save comment: %v", res.Error))
		}
	}

	return c.String(http.StatusOK, "Update Success")
}
