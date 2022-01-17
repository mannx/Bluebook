package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type CommentPost struct {
	Comment  string
	LinkedID int
}

// we are expecting 3 values in the post
//   comment:	the comment we are updating/creating
//	 linkedid:	the id of the day we are linked to
func UpdateCommentHandler(c echo.Context, db *gorm.DB) error {
	arr := make([]string, 2)
	//var arr CommentPost

	if err := c.Bind(&arr); err != nil {
		log.Error().Err(err).Msg("Unable to bind from POST")
		return err
	}

	log.Debug().Msg("updateCommentHandler")

	//log.Debug().Msgf("  comment updated: [%v] %v", arr.LinkedID, arr.Comment)
	for i, n := range arr {
		log.Debug().Msgf("  [%v] %v]", i, n)
	}
	return c.String(http.StatusOK, "Update Success")
}
