// import the control sheet to the database
#![allow(non_snake_case)]
use crate::api::DbError;
use crate::ENVIRONMENT;
// use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::SqliteConnection;
use diesel::result::Error;
use log::{debug, error, info};
use serde::Deserialize;
use std::path::PathBuf;

use crate::imports::ImportResult;
use crate::models::day_data::{DayData, DayDataInsert};

pub fn import_control_sheet(_conn:&mut SqliteConnection,file_name:&String)->ImportResult{
    //
    let mut messages=ImportResult::new();

    debug!("importing control sheet...");

    messages
}