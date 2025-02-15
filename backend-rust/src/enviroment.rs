#![allow(non_snake_case)]
use std::env;

pub struct Environment {
    pub ImportPath: String,
    pub TempPath: String,
}

impl Environment {
    pub fn default() -> Self {
        Self {
            ImportPath: "/import".to_owned(),
            TempPath: "/tmp".to_owned(),
        }
    }

    // get default values and update if any are set in the env
    pub fn load() -> Self {
        let mut e = Self::default();

        e.ImportPath = env::var("BLUEBOOK_IMPORT_PATH").unwrap_or(e.ImportPath.clone());
        e.TempPath = env::var("BLUEBOOK_TEMP_PATH").unwrap_or(e.TempPath.clone());

        e
    }
}
