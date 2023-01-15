package api

import (
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"

	env "github.com/mannx/Bluebook/environ"
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

		dd.DateString = dd.GetDate()

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

	return c.JSON(http.StatusOK, &data{
		Backup: bkp,
		List:   lst,
	})
}

func BackupRevertHandler(c echo.Context, db *gorm.DB) error {
	var idList []uint // list of id's to copy back

	if err := c.Bind(&idList); err != nil {
		return LogAndReturnError(c, "Unable to retrieve id list for [BackupRevertHandler]", err)
	}

	for _, id := range idList {
		var dd models.DayDataBackup

		res := db.Find(&dd, "id = ?", id)
		if res.Error != nil {
			return LogAndReturnError(c, "Unable to retrieve ID from db for pBackupRevertHandler]", res.Error)
		}

		if res.RowsAffected == 0 {
			log.Warn().Msgf("Unable to find record to revert for [BackupRevertHandler] ID = %v", id)
			continue
		}

		// get the original data
		data := dd.DayData

		db.Save(&data) // update it
	}

	return ReturnServerMessage(c, "Success", false)
}

func BackupUndoHandler(c echo.Context, db *gorm.DB) error {
	var idList []uint // list of id's to copy back

	if err := c.Bind(&idList); err != nil {
		return LogAndReturnError(c, "Unable to retrieve id list for [BackupUndoHandler]", err)
	}

	// list of id's points to DayData objects
	res := db.Delete(&models.DayData{}, idList)
	if res.Error != nil {
		return LogAndReturnError(c, "Unable to delete records for [BackupUndoHandler]", res.Error)
	}

	return ReturnServerMessage(c, "Success", false)
}

// BackupEmptyTables is used to clear out both undo tables
func BackupEmptyHandler(c echo.Context, db *gorm.DB) error {
	// 1 = 1 is used since a condition is required
	db.Where("1 = 1").Delete(&models.DayDataBackup{})
	db.Where("1 = 1").Delete(&models.DayDataImportList{})

	return ReturnServerMessage(c, "Success", false)
}

// FileInfo is used to store the information about a given db file
type FileInfo struct {
	ID       int
	FileName string
	Month    int
	Day      int
	Year     int
}

var dbListing []FileInfo

func InitializeDBListing() error {
	dir, err := os.ReadDir(env.Environment.BackupPath)
	if err != nil {
		return err
	}

	dbListing = make([]FileInfo, 0)
	re := regexp.MustCompile(`db-(\d\d)-(\d\d)-(\d\d\d\d).db`)

	for i, f := range dir {
		// do we have a backup file?
		match := re.FindStringSubmatch(f.Name())
		if len(match) == 0 {
			// no matches found, skip file
			continue
		}

		// extract the date information
		month, _ := strconv.Atoi(match[1])
		day, _ := strconv.Atoi(match[2])
		year, _ := strconv.Atoi(match[3])

		dbListing = append(dbListing, FileInfo{
			ID:       i - 1,
			FileName: f.Name(),
			Month:    month,
			Day:      day,
			Year:     year,
		})

		log.Debug().Msgf("Adding db backup to dbListing: %v", f.Name())
	}

	return nil
}

// Return list of databases to revert to or remove
func BackupDBView(c echo.Context, db *gorm.DB) error {
	log.Debug().Msgf("dbListing len: %v", len(dbListing))
	return c.JSON(http.StatusOK, &dbListing)
}

func BackupDBRemove(c echo.Context, db *gorm.DB) error {
	type inputData struct {
		ID     int
		Remove bool
	}

	var input inputData
	if err := c.Bind(&input); err != nil {
		return LogAndReturnError(c, "Failed to bind data for BackupDBRemove", err)
	}

	// get the file name we are removing
	fname := dbListing[input.ID].FileName
	path := fmt.Sprintf("%v/%v", env.Environment.BackupPath, fname)
	log.Debug().Msgf("Removing file: %v", path)

	// remove the file
	err := os.Remove(path)
	if err != nil {
		return LogAndReturnError(c, fmt.Sprintf("Unable to remove file: %v", path), err)
	}

	return ReturnServerOK(c)
}

func BackupDBRestore(c echo.Context, db *gorm.DB) error {
	type inputData struct {
		ID int
	}

	var input inputData
	if err := c.Bind(&input); err != nil {
		return LogAndReturnError(c, "Unable to bind data for BackupDBRestore", err)
	}

	// get the file name
	fname := dbListing[input.ID].FileName
	path := fmt.Sprintf("%v/%v", env.Environment.BackupPath, fname)

	log.Debug().Msgf("Restoring db: %v", path)

	// todo:
	//	setup script/timer to copy db to correct location once exited
	//	exit program
	//	once script is run, restart app

	return ReturnServerOK(c)
}
