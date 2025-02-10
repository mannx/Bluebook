// parse daily spreadsheets into the db

#![allow(non_snake_case)]
use lazy_static::lazy_static;
use log::{debug, error};
use serde::Deserialize;
use std::path::PathBuf;
// use diesel::SqliteConnection;
use crate::ENVIRONMENT;
use umya_spreadsheet::*;
// use chrono::NaiveDate;

#[derive(Deserialize)]
struct Config {
    pub Dates: Vec<Vec<String>>,
}

// List of all messages for the user generated during importing.  errors or status messages
// TODO: indicate error vs status message for clearer messaging
pub struct ImportResult {
    pub Messages: Vec<String>,
}

impl Config {
    fn load() -> Self {
        let fstr = std::fs::read_to_string("src/imports/id.ron").expect("unable to id.ron");
        ron::from_str::<Config>(fstr.as_str()).unwrap()
    }
}

impl ImportResult {
    fn new() -> Self {
        Self {
            Messages: Vec::new(),
        }
    }

    fn add(&mut self, msg: &str) {
        self.Messages.push(msg.to_owned());
    }

    fn error(&mut self, err: &XlsxError) {
        let msg = format!("[ERROR] {err}");
        self.Messages.push(msg);
    }
}

pub fn daily_import(file_name: &String) -> ImportResult {
    // make global so only load once
    debug!("[daily_import] importing file: {file_name}");

    let mut messages = ImportResult::new();

    let config = Config::load();

    // get the path to the file
    let mut path = PathBuf::from(&ENVIRONMENT.ImportPath);
    path.push(file_name);
    debug!("loading daily sheet: {}", path.to_str().unwrap());

    // load the sheet
    // let book = reader::xlsx::read(path.as_path()).expect("unable to read sheet");
    let book_res = reader::xlsx::read(path.as_path());
    let book = match book_res {
        Ok(b) => b,
        Err(e) => {
            error!("Unable to read daily sheet: {}", path.to_str().unwrap());
            messages.error(&e);
            return messages;
        }
    };

    let sheet = book.get_sheet(&0).expect("unable to get sheet to read...");

    // for (i, date) in config.Dates[0].iter().enumerate() {
    //     let val = sheet.get_value(date.as_str());
    //     let fval = val.parse::<f64>().expect("cant convert date to f64");
    //     let dval = umya_spreadsheet::helper::date::excel_to_date_time_object(&fval, None);
    //     debug!("day {} = {dval}", i + 1);
    // }

    ImportResult::new()
}
