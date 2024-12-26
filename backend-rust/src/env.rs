#![allow(non_snake_case)]
use std::env;

#[allow(dead_code)]
pub struct Environment {
    ImportPath: String,
    OutputPath: String,
    // // BackupPath: String,
    // UserID: u32,
    // GroupID: u32,
    //
    Port: u32,
    // IgnoreChecks: bool,
}

impl Environment {
    pub fn default() -> Self {
        let ImportPath = env::var("BLUEBOOK_IMPORT_PATH").unwrap_or(String::from("/import"));
        let OutputPath = env::var("BLUEBOOK_OUTPUT_PATH").unwrap_or(String::from("/output"));
        let Port = env::var("BLUEBOOK_PORT")
            .unwrap_or(String::from("8080"))
            .parse()
            .expect("Unable to parse BLUEBOOK_PORT");

        Self {
            ImportPath,
            OutputPath,
            Port,
            // UserID: env::var("PUID").or_else(1000),
            // GroupID: env::var("PGID").or_else(1000),
            // Port: env::var("BLUEBOOK_PORT").or_else(8080),
            // IgnoreChecks: env::var("BLUEBOOK_IGNORE_CHECKS").or_else(false),
        }
    }
}
