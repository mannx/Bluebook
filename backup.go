package main

import (
	"os"
	"regexp"
	"strconv"
	"time"

	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// UpdateBackupTable catalogs current db backups, removes any entries no longer present or required
func UpdateBackupTable(db *gorm.DB) error {
	log.Debug().Msgf("Updating Backup Table...")

	// retrieve list of all database backups in the /backup directory
	// file mask db-MM-DD-YY.db

	dir, err := os.ReadDir(env.Environment.BackupPath)
	if err != nil {
		return err
	}

	log.Debug().Msg("Contents of /backup:")
	type fileInfo struct {
		fileName string
		month    int
		day      int
		year     int
	}

	files := make([]fileInfo, 0)

	re := regexp.MustCompile(`db-(\d\d)-(\d\d)-(\d\d\d\d).db`)

	for _, f := range dir {
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

		files = append(files, fileInfo{
			fileName: f.Name(),
			month:    month,
			day:      day,
			year:     year,
		})
	}

	// check if in db, add if not
	for _, f := range files {
		entry := make([]models.BackupEntry, 0)
		res := db.Where("FileName = ?", f.fileName).Find(&entry)
		if res.Error != nil {
			return res.Error
		}

		if len(entry) == 0 {
			log.Debug().Msgf("Adding [%v] to database...", f)

			ent := models.BackupEntry{
				FileName: f.fileName,
				Uploaded: false,
				Date:     datatypes.Date(time.Date(f.year, time.Month(f.month), f.day, 0, 0, 0, 0, time.UTC)),
			}

			db.Save(&ent)
		} else {
			log.Debug().Msgf("[%v] in database. ID: %v", f, entry[0].ID)
		}
	}

	// make sure all entries in the database still exist, remove any that point to files no longer exist
	// TODO:
	// entry:=make([]models.BackupEntry,0)
	// res:=db.Find(&entry)
	// if res.Error!=nil{
	// 	return res.Error
	// }
	return nil
}
