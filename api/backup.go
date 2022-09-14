package api

import (
	"net/http"
	"time"

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

	bkp := make([]models.DayDataBackup, len(backup))

	// update the date string for each backup data item
	for i, obj := range backup {
		obj.DateString = time.Time(obj.Date).Format("Jan 02, 2006")
		bkp[i] = obj
	}
	log.Debug().Msg("Returning backup data to client...")
	return c.JSON(http.StatusOK, &data{
		Backup: bkp,
		List:   lst,
	})
}

func BackupRevertHandler(c echo.Context, db *gorm.DB) error {
	var idList []uint // list of id's to copy back

	if err := c.Bind(&idList); err != nil {
		log.Error().Err(err).Msg("Unable to retrieve id list for [BackupRevertHandler]")
		return ReturnServerMessage(c, "Unable to retrieve id list for [BackupRevertHandler]", true)
	}

	for _, id := range idList {
		var dd models.DayDataBackup

		res := db.Find(&dd, "ID = ?", id)
		if res.Error != nil {
			return LogAndReturnError(c, "Unable to retrieve ID from db for pBackupRevertHandler]", res.Error)
		}

		if res.RowsAffected == 0 {
			log.Warn().Msgf("Unable to find record to revert for [BackupRevertHandler] ID = ", id)
			continue
		}

		log.Debug().Msgf("Reverting id={} for day {}", id, dd.DayData.GetDate())
	}

	return ReturnServerMessage(c, "Success", false)
}
