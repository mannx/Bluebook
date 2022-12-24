package main

import (
	"os"
	"regexp"
	"strconv"

	env "github.com/mannx/Bluebook/environ"
	models "github.com/mannx/Bluebook/models"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

type fileInfo struct {
	id       int // id into the database if available
	fileName string
	month    int
	day      int
	year     int
}

// UpdateBackupTable catalogs current db backups, removes any entries no longer present or required
func UpdateBackupTable(db *gorm.DB) error {
	log.Debug().Msgf("Updating Backup Table...")

	// retrieve list of all database backups in the /backup directory
	// file mask db-MM-DD-YY.db

	dir, err := os.ReadDir(env.Environment.BackupPath)
	if err != nil {
		return err
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
		log.Debug().Msgf(" - Checking if [%v] already in db...", f.fileName)

		// entry := make([]models.BackupEntry, 0)
		// res := db.Where("file_name = ?", f.fileName).Find(&entry)
		// if res.Error != nil {
		// 	return res.Error
		// }

		// log.Debug().Msgf("Rows Affected [filename: %v] %v", f.fileName, res.RowsAffected)
		// if res.RowsAffected >= 1 {
		// 	log.Debug().Msgf("Backup found. skipping...%v", f.fileName)
		// }

		// if len(entry) == 0 {
		// 	log.Debug().Msgf("Adding [%v] to database...", f)

		// 	ent := models.BackupEntry{
		// 		FileName: f.fileName,
		// 		Uploaded: false,
		// 		Date:     datatypes.Date(time.Date(f.year, time.Month(f.month), f.day, 0, 0, 0, 0, time.UTC)),
		// 	}

		// 	db.Save(&ent)
		// } else {
		// 	log.Debug().Msgf("[%v] in database. ID: %v", f, entry[0].ID)
		// }
	}

	// make sure all entries in the database still exist, remove any that point to files no longer exist
	missing, err := getMissingFiles(files, db)
	if err != nil {
		return err
	}

	if missing == nil {
		// no missing files
		return nil
	}

	log.Debug().Msg("Removing missing backup entries from database...")
	for _, m := range missing {
		log.Debug().Msgf(" =] Removing %v", m)
	}
	// db.Where("1 = 1").Delete(&models.BackupEntry{}, missing)

	return nil
}

// getMisssingFiles return a list of files of database backups that are in the database
//
//	but are no longer found in the filessytem
//	files -> list of found on disk
//
// TODO
func getMissingFiles(files []fileInfo, db *gorm.DB) ([]uint, error) {
	// get the data form the database
	dbe := make([]models.BackupEntry, 0)
	res := db.Find(&dbe)
	if res.Error != nil {
		return nil, res.Error
	}

	if res.RowsAffected == 0 {
		// nothing found,
		return nil, nil
	}

	type missingData struct {
		id       uint
		fileName string
		exist    bool
	}

	data := make(map[string]missingData) // store each db entry as false, mark each actual file as true, remove all false entries
	for _, e := range dbe {
		data[e.FileName] = missingData{
			id:       e.ID,
			fileName: e.FileName,
			exist:    false,
		}
	}

	for _, e := range files {
		// data[e.fileName].exist=true
		o, ok := data[e.fileName]
		if ok {
			o.exist = true
			data[e.fileName] = o
		}
	}

	missing := make([]uint, 0)

	for _, v := range data {
		if v.exist == false {
			log.Debug().Msgf("File %v [%v] no longer exists", v.fileName, v.id)
			missing = append(missing, v.id)
		}
	}

	return missing, nil
}
