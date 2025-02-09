// type EnvironmentDefinition struct {
// 	ImportPath  string `envconfig:"BLUEBOOK_IMPORT_PATH"`
// 	OutputPath  string `envconfig:"BLUEBOOK_OUTPUT_PATH"` // used when exporting weekly sheets
// 	TempPath    string `envconfig:"BLUEBOOK_TEMP_PATH"`
// 	DataPath    string `envconfig:"BLUEBOOK_DATA_PATH"`
// 	BackupPath  string `envconfig:"BLUEBOOK_BACKUP_PATH"`  // where to make the db backup on startup
// 	ScriptsPath string `envconfig:"BLUEBOOK_SCRIPTS_PATH"` // path to the scripts directory.
//
// 	CronTime   string `envconfig:"BLUEBOOK_IMPORT_TIMER"` // 	cron string when to run auto imports
// 	BackupTime string `envconfig:"BLUEBOOK_BACKUP_TIMER"` // cron sstring when to create a backup archive
//
// 	// UserID and GroupID are used to set the file permissions for all exported files
// 	UserID  int `envconfig:"PUID"` // userid the container should be running under
// 	GroupID int `envconfig:"PGID"` // groupid "								"
//
// 	LogLevelString string        `envconfig:"BLUEBOOK_LOG_LEVEL"`
// 	LogLevel       zerolog.Level // set the log level for zerolog once parsed from the env variable
//
// 	Port int `envconfig:"BLUEBOOK_PORT"` // port to run the server to listen on
//
// 	IgnoreChecks bool `envconfig:"BLUEBOOK_IGNORE"` // ignore some startup checks to speed up testing
// }

#![allow(non_snake_case)]
use std::env;

pub struct Environment {
    pub ImportPath: String,
}

impl Environment {
    pub fn default() -> Self {
        Self {
            ImportPath: "/import".to_owned(),
        }
    }

    // get default values and update if any are set in the env
    pub fn load() -> Self {
        let mut e = Self::default();

        e.ImportPath = env::var("BLUEBOOK_IMPORT_PATH").unwrap_or(e.ImportPath.clone());

        e
    }
}
