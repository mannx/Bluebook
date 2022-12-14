package environ

import (
	"github.com/kelseyhightower/envconfig"
	"github.com/rs/zerolog/log"
)

//
//	This file contains code for managing static paths that might change with environment variables
//	and other data to prevent hard coding in multiple places

type EnvironmentDefinition struct {
	ImportPath string `envconfig:"BLUEBOOK_IMPORT_PATH"`
	OutputPath string `envconfig:"BLUEBOOK_OUTPUT_PATH"` // used when exporting weekly sheets
	TempPath   string `envconfig:"BLUEBOOK_TEMP_PATH"`
	DataPath   string `envconfig:"BLUEBOOK_DATA_PATH"`
	BackupPath string `envconfig:"BLUEBOOK_BACKUP_PATH"` // where to make the db backup on startup

	// UserID and GroupID are used to set the file permissions for all exported files
	UserID  int `envconfig:"PUID"` // userid the container should be running under
	GroupID int `envconfig:"PGID"` // groupid "								"
}

var Environment = EnvironmentDefinition{}

func (e *EnvironmentDefinition) Init() {
	e.Default()

	err := envconfig.Process("", e)
	if err != nil {
		log.Error().Err(err).Msg("Unable to parse local environment")
		return
	}

	log.Debug().Msgf("  => [EnvironmentDefinition] UserID: %v", e.UserID)
	log.Debug().Msgf("  => [EnvironmentDefinition] GroupID: %v", e.GroupID)
}

func (e *EnvironmentDefinition) Default() {
	e.ImportPath = "/import" // default path, unless overriden
	e.OutputPath = "/import" // defaults to the same as the import path
	e.TempPath = "/tmp"
	e.DataPath = "/data"
	e.BackupPath = "/backup"
}
