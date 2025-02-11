#![allow(non_snake_case)]
pub mod daily;

use crate::api::DbError;
use serde::Serialize;
use umya_spreadsheet::XlsxError;

// List of all messages for the user generated during importing.  errors or status messages
// TODO: indicate error vs status message for clearer messaging
#[derive(Serialize)]
pub struct ImportResult {
    pub Messages: Vec<String>,
    pub Error: Option<String>, // Some if we encountered an error
}

impl ImportResult {
    pub fn new() -> Self {
        Self {
            Messages: Vec::new(),
            Error: None,
        }
    }

    pub fn add(&mut self, msg: String) {
        self.Messages.push(msg);
    }

    fn error(&mut self, err: &XlsxError) {
        let msg = format!("[ERROR] {err}");
        self.Messages.push(msg);
    }

    pub fn combine(&mut self, ir: &mut ImportResult) {
        self.Messages.append(&mut ir.Messages);
    }

    #[allow(dead_code)]
    // TODO: remove if we decide against using this
    fn db_error(&mut self, err: DbError) {
        self.Error = Some(format!("Database error occurred: {err}"));
    }
}
