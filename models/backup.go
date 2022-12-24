package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// BackupEntry contains all data about a given backup
type BackupEntry struct {
	gorm.Model

	Date     datatypes.Date // date this backup was made
	FileName string         //`gorm:"column:FileName"` // name of the file in the /backups dir
	Uploaded bool           // has this db been upload to the cloud?
}
