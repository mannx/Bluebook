package environ

import (
	"strings"

	"github.com/kelseyhightower/envconfig"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

//
//	This file contains code for managing static paths that might change with environment variables
//	and other data to prevent hard coding in multiple places

type EnvironmentDefinition struct {
	ImportPath  string `envconfig:"BLUEBOOK_IMPORT_PATH"`
	OutputPath  string `envconfig:"BLUEBOOK_OUTPUT_PATH"` // used when exporting weekly sheets
	TempPath    string `envconfig:"BLUEBOOK_TEMP_PATH"`
	DataPath    string `envconfig:"BLUEBOOK_DATA_PATH"`
	BackupPath  string `envconfig:"BLUEBOOK_BACKUP_PATH"`  // where to make the db backup on startup
	ScriptsPath string `envconfig:"BLUEBOOK_SCRIPTS_PATH"` // path to the scripts directory.

	CronTime   string `envconfig:"BLUEBOOK_IMPORT_TIMER"` // 	cron string when to run auto imports
	BackupTime string `envconfig:"BLUEBOOK_BACKUP_TIMER"` // cron sstring when to create a backup archive

	// UserID and GroupID are used to set the file permissions for all exported files
	UserID  int `envconfig:"PUID"` // userid the container should be running under
	GroupID int `envconfig:"PGID"` // groupid "								"

	LogLevelString string        `envconfig:"BLUEBOOK_LOG_LEVEL"`
	LogLevel       zerolog.Level // set the log level for zerolog once parsed from the env variable

	Port int `envconfig:"BLUEBOOK_PORT"` // port to run the server to listen on

	IgnoreChecks bool `envconfig:"BLUEBOOK_IGNORE"` // ignore some startup checks to speed up testing
}

var Environment = EnvironmentDefinition{}

func (e *EnvironmentDefinition) Init() {
	e.Default()

	err := envconfig.Process("", e)
	if err != nil {
		log.Error().Err(err).Msg("Unable to parse local environment")
		return
	}

	log.Debug().Msgf("Import Path: %v", e.OutputPath)

	// parse the log level
	e.LogLevel = e.parseLogLevel()
}

func (e *EnvironmentDefinition) Default() {
	e.ImportPath = "/import" // default path, unless overriden
	e.OutputPath = "/import" // defaults to the same as the import path
	e.TempPath = "/tmp"
	e.DataPath = "/data"
	e.BackupPath = "/backup"
	e.ScriptsPath = "/scripts"

	e.LogLevelString = "Info"
	e.CronTime = "@daily"
	e.BackupTime = "@daily"

	e.Port = 8080
	e.IgnoreChecks = false
}

// parse the log level string.  Default to INFO if unable to parse
func (e *EnvironmentDefinition) parseLogLevel() zerolog.Level {
	str := strings.ToLower(e.LogLevelString)

	// if str == "debug" {
	// 	return zerolog.DebugLevel
	// } else if str == "info" {
	// 	return zerolog.InfoLevel
	// } else if str == "warn" {
	// 	return zerolog.WarnLevel
	// } else if str == "error" {
	// 	return zerolog.ErrorLevel
	// }

	switch str {
	case "debug":
		return zerolog.DebugLevel
	case "info":
		return zerolog.InfoLevel
	case "warn":
		return zerolog.WarnLevel
	case "error":
		return zerolog.ErrorLevel
	}

	return zerolog.InfoLevel
}
