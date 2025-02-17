#![allow(non_snake_case)]
pub mod control;
pub mod daily;
pub mod wisr;

use crate::ENVIRONMENT;
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::result::Error;
use diesel::SqliteConnection;
use log::{debug, error};
use serde::Serialize;
use umya_spreadsheet::XlsxError;

use std::path::{Path, PathBuf};
use std::process::Command;

use crate::models::day_data::DayData;
use crate::models::weekly::WeeklyInfo;

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

    // TODO: remove if we decide against using this
    fn db_error(&mut self, err: Error) {
        self.Error = Some(format!("Database error occurred: {err}"));
    }
}

// Convert file_name.pdf to a text file using pdftotext
// returns the path to the output file which should be a temp file
// returns None on error
fn pdf_to_text(file_name: &String) -> Option<PathBuf> {
    // get the filename from the provided path
    let fname = match Path::new(file_name).file_name() {
        Some(p) => p.to_str().unwrap(),
        None => {
            error!("[pdf_to_text] filename was invalid [{file_name}]");
            return None;
        }
    };

    let mut input_path = PathBuf::from(&ENVIRONMENT.ImportPath);
    input_path.push(fname);

    debug!("[pdf_to_text] starting to process {file_name}");

    // generate output name
    let mut path = PathBuf::from(&ENVIRONMENT.TempPath);
    path.push(format!("{}.txt", fname));

    let output_fname = path.to_str().unwrap();

    // execute the command
    let output = Command::new("pdftotext")
        .arg("-layout")
        .arg(input_path)
        .arg(output_fname)
        .output();
    match output {
        Err(err) => {
            error!("unable to complete pdftotext conversion...");
            error!("error: {err}");
            None
        }
        Ok(status) => {
            if !status.status.success() {
                error!("error whne processing pdftotext conversion...");
                error!("{:?}", status.stderr);
                return None;
            }

            Some(path)
        }
    }
}

///
/// If there is a record for DayData in the db with the given date, return it
/// otherwise return a new Day
fn load_or_new_day(conn: &mut SqliteConnection, date: NaiveDate) -> Result<DayData, Error> {
    use crate::schema::day_data::dsl::*;

    // try to retrieve the data
    let result = day_data.filter(DayDate.eq(date)).first::<DayData>(conn);
    match result {
        Ok(d) => Ok(d),
        Err(err) => {
            match err {
                Error::NotFound => {
                    // return a new data object
                    Ok(DayData::new(date))
                }
                e => Err(e),
            }
        }
    }
}

/// load weekly data if found to update, or return a new empty object
/// searches by week ending date
fn load_or_new_week(conn: &mut SqliteConnection, date: NaiveDate) -> Result<WeeklyInfo, Error> {
    use crate::schema::weekly_info::dsl::*;

    // try to retrieve the data
    let result = weekly_info
        .filter(WeekEnding.eq(date))
        .first::<WeeklyInfo>(conn);
    match result {
        Ok(d) => Ok(d),
        Err(err) => {
            match err {
                Error::NotFound => {
                    // return a new data object
                    Ok(WeeklyInfo::new(date))
                }
                e => Err(e),
            }
        }
    }
}
