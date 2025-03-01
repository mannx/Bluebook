#![allow(non_snake_case)]
use chrono::NaiveDate;
// use diesel::prelude::*;
use diesel::SqliteConnection;
use log::debug;
use serde::Deserialize;
use std::path::PathBuf;
use umya_spreadsheet::*;

use crate::api::settings::read_settings;
use crate::api::weekly::get_weekly_report;
use crate::api::DbError;
use crate::ENVIRONMENT;

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
pub struct WeeklyParams {
    week_ending: NaiveDate,
    hours: f32,
    manager: f32,
    sysco: f32,
    netsales: bool,
}

// Holds data on which cells data is outputed to on the spreadsheet
#[derive(Deserialize)]
#[allow(dead_code)]
struct Config {
    managerName: String,
    storeNumber: String,
    weekEndingCell: String,

    auvTarget: String,
    lastYearSales: String,
    netSales: String,
    upcomingSales: String,
    breadCount: String,
    foodCost: String,
    syscoCost: String,
    labourCost: String,
    customerCount: String,
    customerPrev: String,
    partySales: String,
    hoursUsed: String,
    managerHours: String,
    targetHours: String,
    gcSold: String,
    gcRedeem: String,
    prodActual: String,
    prodBudget: String,
}

impl Config {
    fn load() -> Self {
        // TODO: adjust path if we are dockerized. Currently stripped to / in dockerfile
        let fstr = std::fs::read_to_string("src/api/export.ron").expect("unable to export.ron");
        ron::from_str::<Config>(fstr.as_str()).unwrap()
    }
}

pub fn export_weekly(conn: &mut SqliteConnection, data: &WeeklyParams) -> Result<(), DbError> {
    debug!("[export_weekly] params: {:?}", data);

    // read in the config for output locations
    let config = Config::load();

    // recalculate the weekly report so we can export it out
    debug!("Calculating weekly data...");
    let weekly = get_weekly_report(conn, data.week_ending)?;

    debug!("Retrieving settings...");
    let settings = read_settings(conn)?;

    // open weekly sheet
    let mut path = PathBuf::from(&ENVIRONMENT.DataPath);
    path.push("weekly.xlsx");

    debug!("Reading template weeekly...");
    let mut book = reader::xlsx::read(path.as_path())?;
    let sheet = book.get_sheet_mut(&0).unwrap();

    // set manager+store # and week ending date
    sheet
        .get_cell_mut(config.managerName.as_str())
        .set_value(settings.ManagerName.unwrap_or("NO NAME".to_owned()));

    sheet
        .get_cell_mut(config.storeNumber.as_str())
        .set_value(settings.StoreNumber.unwrap_or("NO STORE".to_owned()));

    sheet
        .get_cell_mut(config.weekEndingCell.as_str())
        .set_value(data.week_ending.to_string());

    // get output path
    let mut path = PathBuf::from(&ENVIRONMENT.DataPath);
    path.push(format!("{}.xlsx", data.week_ending));

    debug!("saving to output file...");
    writer::xlsx::write(&book, path.as_path())?;

    Ok(())
}
