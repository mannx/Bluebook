package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"

	models "github.com/mannx/Bluebook/models"
)

func BackupHandler(c echo.Context, db *gorm.DB) error {
	var backup []models.DayDataBackup
	var list []models.DayDataImportList

	// read all backup data
	res := db.Find(&backup)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve backup data, skipping...")
	}

	res = db.Find(&list)
	if res.Error != nil {
		log.Error().Err(res.Error).Msg("Unable to retrieve backup import listdata, skipping...")
	}

	type importList struct {
		EntryID uint // id of the item
		Item    models.DayData
	}

	type data struct {
		Backup []models.DayDataBackup
		List   []importList
	}

	lst := make([]importList, 0)
	for _, i := range list {
		// get the data that was imported
		var dd models.DayData

		res = db.Find(&dd, "ID = ?", i.EntryID)
		if res.Error != nil {
			log.Error().Err(res.Error).Msgf("Unable to retrieve DayData object with ID %v found in DayDataImportList", i.EntryID)
			continue
		}

		lst = append(lst, importList{
			EntryID: i.EntryID,
			Item:    dd,
		})
	}

	log.Debug().Msg("Returning backup data to client...")
	return c.JSON(http.StatusOK, &data{
		Backup: backup,
		List:   lst,
	})
}
