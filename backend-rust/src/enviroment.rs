#![allow(non_snake_case)]
use log::warn;
use std::env;
use std::path::PathBuf;

#[derive(Debug)]
pub struct Environment {
    ImportPath: String,
    TempPath: String,
    OutputPath: String,
    DataPath: String,
    ConfigPath: String, // path for .ron config files -- can be mapped to DataPath
}

impl Environment {
    // returns a environment variable or a default alternative incase its not set
    pub fn var(var: &str, default: &str) -> String {
        match env::var(var) {
            Ok(v) => v,
            Err(_) => {
                warn!("Environment variable {var} not set, using default option: {default}");
                default.to_owned()
            }
        }
    }

    pub fn default() -> Self {
        Self {
            ImportPath: "/import".to_owned(),
            TempPath: "/tmp".to_owned(),
            OutputPath: "/output".to_owned(),
            DataPath: "/data".to_owned(),
            ConfigPath: "/config".to_owned(),
        }
    }

    // get default values and update if any are set in the env
    pub fn load() -> Self {
        let mut e = Self::default();

        e.ImportPath = env::var("BLUEBOOK_IMPORT_PATH").unwrap_or(e.ImportPath.clone());
        e.TempPath = env::var("BLUEBOOK_TEMP_PATH").unwrap_or(e.TempPath.clone());
        e.OutputPath = env::var("BLUEBOOK_OUTPUT_PATH").unwrap_or(e.OutputPath.clone());
        e.DataPath = env::var("BLUEBOOK_DATA_PATH").unwrap_or(e.DataPath.clone());
        e.ConfigPath = env::var("BLUEBOOK_CONFIG_PATH").unwrap_or(e.ConfigPath.clone());

        e
    }

    pub fn with_data_path<S: Into<String>>(&self, file_name: S) -> PathBuf {
        let mut path = PathBuf::from(&self.DataPath);
        path.push(file_name.into());

        path
    }

    pub fn with_config_path<S: Into<String>>(&self, file_name: S) -> PathBuf {
        let mut path = PathBuf::from(&self.ConfigPath);
        path.push(file_name.into());

        path
    }

    pub fn with_import_path<S: Into<String>>(&self, file_name: S) -> PathBuf {
        let mut path = PathBuf::from(&self.ImportPath);
        path.push(file_name.into());

        path
    }

    pub fn with_output_path<S: Into<String>>(&self, file_name: S) -> PathBuf {
        let mut path = PathBuf::from(&self.OutputPath);
        path.push(file_name.into());

        path
    }

    pub fn with_temp_path<S: Into<String>>(&self, file_name: S) -> PathBuf {
        let mut path = PathBuf::from(&self.TempPath);
        path.push(file_name.into());

        path
    }
}
