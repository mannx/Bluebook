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
	TempPath   string `envconfig:"BLUEBOOK_TEMP_PATH"`
	DataPath   string `envconfig:"BLUEBOOK_DATA_PATH"`
}

//var Environment EnvironmentDefinition{}
var Environment = EnvironmentDefinition{}

func (e *EnvironmentDefinition) Init() {
	e.Default()

	err := envconfig.Process("", e)
	if err != nil {
		log.Error().Err(err).Msg("Unable to parse local environment")
		return
	}
}

func (e *EnvironmentDefinition) Default() {
	e.ImportPath = "/import" // default path, unless overriden
	e.TempPath = "/tmp"
	e.DataPath = "/data"
}
