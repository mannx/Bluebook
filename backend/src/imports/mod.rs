#![allow(non_snake_case)]
pub mod control;
pub mod daily;
pub mod wisr;

use crate::ENVIRONMENT;
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::result::Error;
use diesel::SqliteConnection;
use log::{debug, error, trace};
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

    fn error_str<S: Into<String>>(&mut self, err: S) {
        self.Messages.push(err.into());
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

    let input_path = ENVIRONMENT.with_import_path(fname);

    debug!("[pdf_to_text] starting to process {file_name}");

    // generate output name
    let path = ENVIRONMENT.with_temp_path(format!("{fname}.txt"));

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
    let result = day_data
        .filter(DayDate.eq(date).and(Updated.eq(false)))
        .first::<DayData>(conn);
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

// converts from a string input to a i32 for db storage
// logs and error if we can't parse, and returns 0
// this should only be used for quick conversion where we don't need
// to pass the error back to the front end
fn ftoi(input: &str) -> i32 {
    trace!("[ftoi] input: {input}");

    // if we have a decimal component:
    //  - remove decimal, convert
    // if we do not
    //  - convert -> multiply by 100

    let i2 = input.replace(",", ""); // remove any thousand seperators

    match i2.split_once('.') {
        None => {
            // no decimal, convert and multiply
            match i2.parse::<i32>() {
                Err(err) => {
                    error!("[ftoi] Unable to convert [{i2}] into an i32.  Error: {err}");
                    0
                }
                Ok(n) => n * 100,
            }
        }
        Some((whole, decimal)) => {
            // have decimal, strip and convert
            // make sure decimal is no more than 2 characters long
            // if only 1, add on a zero first

            let d2 = if decimal.len() == 1 {
                trace!("[ftoi] padding 0 to decimal portion");
                let mut d2 = decimal.to_string();
                d2.push('0');
                d2
            } else {
                trace!("[ftoi] decimal len > 1, capping at 2 positions");
                let mut d2 = decimal.to_string();
                d2.truncate(2);
                d2
            };

            trace!("[ftoi] using decimal portion [{d2}]");

            let mut val_str = whole.to_string();
            val_str.push_str(&d2);

            trace!("[ftoi] convering to i32 using [{val_str}]");

            match val_str.parse::<i32>() {
                Err(err) => {
                    error!(
                        "[ftoi] Unable to convert {i2} into an i32. (Decimal Found). Error: {err}"
                    );
                    0
                }
                Ok(i) => i,
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn init() {
        let _ = env_logger::builder().is_test(true).try_init();
    }

    #[test]
    fn ftoi_test() {
        init();

        let input = ["123", "123.45", "45.6"];
        let expected = [12300, 12345, 4560];

        trace!("checking input lens match...");
        assert!(input.len() == expected.len());

        for (i, n) in input.iter().enumerate() {
            let res = ftoi(n);
            trace!("convert {n} to i32: {res}");

            assert!(res == expected[i]);
        }
    }
}
