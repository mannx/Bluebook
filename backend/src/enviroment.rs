#![allow(non_snake_case)]
use shellexpand::full;
use std::env;
use std::env::VarError;
use std::path::PathBuf;

#[derive(Debug)]
pub struct Environment {
    ImportPath: String,
    TempPath: String,
    OutputPath: String,
    DataPath: String,
    ConfigPath: String, // path for .ron config files -- can be mapped to DataPath
    pub HtmlRoot: String, // path to html/js files.  defaults to /dist
}

impl Environment {
    pub fn default() -> Self {
        Self {
            ImportPath: "/import".to_owned(),
            TempPath: "/tmp".to_owned(),
            OutputPath: "/output".to_owned(),
            DataPath: "/data".to_owned(),
            ConfigPath: "/config".to_owned(),
            HtmlRoot: "/dist".to_owned(),
        }
    }

    // reads input as an env var, then parses its value to expand
    fn var(input: &str) -> Result<String, VarError> {
        let expr = env::var(input)?;
        let val = full(&expr).unwrap();

        Ok(val.to_string())
    }

    // get default values and update if any are set in the env
    pub fn load() -> Self {
        let mut e = Self::default();

        e.ImportPath = Environment::var("BLUEBOOK_IMPORT_PATH").unwrap_or(e.ImportPath.clone());
        e.TempPath = Environment::var("BLUEBOOK_TEMP_PATH").unwrap_or(e.TempPath.clone());
        e.OutputPath = Environment::var("BLUEBOOK_OUTPUT_PATH").unwrap_or(e.OutputPath.clone());
        e.DataPath = Environment::var("BLUEBOOK_DATA_PATH").unwrap_or(e.DataPath.clone());
        e.ConfigPath = Environment::var("BLUEBOOK_CONFIG_PATH").unwrap_or(e.ConfigPath.clone());
        e.HtmlRoot = Environment::var("BLUEBOOK_HTML_ROOT").unwrap_or(e.HtmlRoot.clone());

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
