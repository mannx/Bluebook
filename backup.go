package main

import (
	"os"
	"regexp"

	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
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
	files := make([]string, 0)

	for _, f := range dir {
		// do we have a backup file?
		match, err := regexp.MatchString(`db-\d\d-\d\d-\d\d\d\d.db`, f.Name())
		if err != nil {
			return err
		}

		if match {
			files = append(files, f.Name())
		}
	}

	// check if in db, add if not
	for _, f := range files {
		entry := make([]models.BackupEntry, 0)
		res := db.Where("FileName = ?", f).Find(&entry)
		if res.Error != nil {
			return res.Error
		}

		if len(entry) == 0 {
			log.Debug().Msgf("Adding [%v] to database...", f)

			ent := models.BackupEntry{
				FileName: f,
				Uploaded: false,
			}

			db.Save(&ent)
		} else {
			log.Debug().Msgf("[%v] in database. ID: %v", f, entry[0].ID)
		}
	}

	return nil
}
