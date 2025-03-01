// parse daily spreadsheets into the db

#![allow(non_snake_case)]
use crate::ENVIRONMENT;
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::result::Error;
use diesel::SqliteConnection;
use log::{debug, error, info};
use serde::Deserialize;
use std::path::PathBuf;
use umya_spreadsheet::*;

use crate::imports::ImportResult;
use crate::models::day_data::{DayData, DayDataInsert};

#[derive(Deserialize)]
struct Config {
    Dates: Vec<Vec<String>>,
    CashDeposit: Vec<Vec<String>>,
    AmexCard: Vec<Vec<String>>,
    CreditSales: Vec<Vec<String>>,
    GiftCardRedeem: Vec<Vec<String>>,
    SubwayCaters: Vec<Vec<String>>,
    SkipTheDishes: Vec<Vec<String>>,
    DoorDash: Vec<Vec<String>>,
    USCash: Vec<Vec<String>>,
    PettyCash: Vec<Vec<String>>,
    UberEats: Vec<Vec<String>>,
    Tips: Vec<Vec<String>>,
    HST: Vec<Vec<String>>,
    BottleDeposit: Vec<Vec<String>>,
    NetSales: Vec<Vec<String>>,
    CreditSalesRcv: Vec<Vec<String>>,
    CreditFood: Vec<Vec<String>>,
    GiftCardSold: Vec<Vec<String>>,
    DebitCard: Vec<Vec<String>>,
    MasterCard: Vec<Vec<String>>,
    VisaCard: Vec<Vec<String>>,
    PayPal: Vec<Vec<String>>,
}

impl Config {
    fn load() -> Self {
        // TODO: adjust path if we are dockerized. Currently stripped to / in dockerfile
        let fstr = std::fs::read_to_string("src/imports/daily_import.ron")
            .expect("unable to daily_import.ron");
        ron::from_str::<Config>(fstr.as_str()).unwrap()
    }
}

pub fn daily_import(conn: &mut SqliteConnection, file_name: &String) -> ImportResult {
    // make global so only load once
    debug!("[daily_import] importing file: {file_name}");

    let mut messages = ImportResult::new();

    let config = Config::load();

    // get the path to the file
    let mut path = PathBuf::from(&ENVIRONMENT.ImportPath);
    path.push(file_name);
    debug!("loading daily sheet: {}", path.to_str().unwrap());

    // load the sheet
    let book_res = reader::xlsx::read(path.as_path());
    let book = match book_res {
        Ok(b) => b,
        Err(e) => {
            error!("Unable to read daily sheet: {}", path.to_str().unwrap());
            messages.error(&e);
            return messages;
        }
    };

    // sheet contains most of the data, sheet2 contains the few fields on the 2nd sheet
    let sheet = match book.get_sheet(&0) {
        None => {
            messages.add(format!("Unable to retrieve first sheet for {file_name}"));
            return messages;
        }
        Some(s) => s,
    };

    let sheet2 = match book.get_sheet(&1) {
        None => {
            messages.add(format!("Unable to retrieve second sheet for {file_name}"));
            return messages;
        }
        Some(s) => s,
    };

    // for each day, parse it and return an DayData object.
    let version = get_daily_version(sheet);

    // up to 4 days per sheet
    for i in 0..4 {
        let res = parse_day(&config, version, sheet, sheet2, i);

        if res.is_none() {
            // error, or not full sheet, we break early
            break;
        }

        let day_data = res.unwrap();

        // insert or update this entry in the db
        if let Err(err) = insert_or_update(conn, &day_data) {
            error!("db error!: {err}");
            messages.db_error(err);
        }

        messages.add(format!("successfully parsed {}", day_data.DayDate));
    }

    messages
}

// extracts a single day and if successfully returns a DayData object with all the data extracted
// all errors are recorded in the messages object to return to the user
fn parse_day(
    config: &Config,
    version: usize, // which version of the daily sheet are we working with
    sheet: &Worksheet,
    sheet2: &Worksheet, // 2nd sheet containing data
    day_index: usize,
) -> Option<DayData> {
    // retrieve the date we are working on
    // if cell is empty, we stop processing early
    let date_cell = &config.Dates[version][day_index];
    let date_val = sheet.get_value(date_cell.as_str());

    if date_val.is_empty() {
        // no date, return
        debug!("[parse_day] date_val is empty for index {day_index}, returning");
        return None;
    }

    // convert date into a useable format.
    // stored as an f64 and needs to get converted
    let date = match date_val.parse::<f64>() {
        Err(e) => {
            error!("Unable to parse date value [{date_val}] for index {day_index}");
            error!("error: {e}");
            return None;
        }
        // convert to a NaiveDateTime.  ignore the time zone
        Ok(n) => NaiveDate::from(umya_spreadsheet::helper::date::excel_to_date_time_object(
            &n, None,
        )),
    };

    debug!("extracting index {day_index} for date {date}");

    let mut data = DayData::new(date);

    // extract the remaining cells from sheet1
    data.CashDeposit = get_value(sheet, &config.CashDeposit[version][day_index]);

    // debit side
    data.Amex = get_value(sheet, &config.AmexCard[version][day_index]);
    data.CreditSales = get_value(sheet, &config.CreditSales[version][day_index]);
    data.GiftCardRedeem = get_value(sheet, &config.GiftCardRedeem[version][day_index]);
    data.SubwayCaters = get_value(sheet, &config.SubwayCaters[version][day_index]);
    data.SkipTheDishes = get_value(sheet, &config.SkipTheDishes[version][day_index]);
    data.DoorDash = get_value(sheet, &config.DoorDash[version][day_index]);
    data.PettyCash = get_value(sheet, &config.PettyCash[version][day_index]);

    // from sheet2
    data.DebitCard = get_value(sheet2, &config.DebitCard[version][day_index]);
    data.Visa = get_value(sheet2, &config.VisaCard[version][day_index]);
    data.MasterCard = get_value(sheet2, &config.MasterCard[version][day_index]);
    data.PayPal = get_value(sheet2, &config.PayPal[version][day_index]);

    // credit side
    data.Tips = get_value(sheet, &config.Tips[version][day_index]);
    data.Hst = get_value(sheet, &config.HST[version][day_index]);
    data.BottleDeposit = get_value(sheet, &config.BottleDeposit[version][day_index]);
    data.NetSales = get_value(sheet, &config.NetSales[version][day_index]);
    data.CreditSalesRedeemed = get_value(sheet, &config.CreditSalesRcv[version][day_index]);
    data.CreditFood = get_value(sheet, &config.CreditFood[version][day_index]);
    data.GiftCardSold = get_value(sheet, &config.GiftCardSold[version][day_index]);

    // if uber contains 'uber', USFunds is uber amount
    let us_cash = get_value(sheet, &config.USCash[version][day_index]);
    let is_uber = sheet.get_value(config.UberEats[version][day_index].as_str());

    if is_uber.contains("uber") {
        data.UberEats = us_cash;
    } else {
        data.USFunds = us_cash;
    }

    Some(data)
}

// checks the sheet and determines which version we are parsing
// used to index itno the config to get proper cell addresses
fn get_daily_version(_sheet: &Worksheet) -> usize {
    // only 1 version right now
    0
}

// gets the value from the cell, returns 0 if cell is empty
fn get_value(sheet: &Worksheet, cell: &str) -> f32 {
    let val = sheet.get_value(cell);
    val.parse::<f32>().unwrap_or(0.)
}

// insert or update the DayData table for the day we just processed
fn insert_or_update(
    conn: &mut SqliteConnection,
    data: &DayData,
) -> Result<(), diesel::result::Error> {
    // try to retrieve the object from the db with the same date
    use crate::schema::day_data::dsl::*;

    let result = day_data
        .filter(DayDate.eq(data.DayDate))
        .first::<DayData>(conn);

    match result {
        Err(_) => {
            error!("retrieval for day date: {} failed.", data.DayDate);
            insert_data(conn, data)?;
        }
        Ok(old) => {
            info!("found data for day: {}", data.DayDate);
            // pass in the current db item since we dont want to update certain fields
            update_data(conn, data, &old)?;
        }
    }

    Ok(())
}

// insert new entry into the db
fn insert_data(conn: &mut SqliteConnection, data: &DayData) -> Result<DayData, Error> {
    // insert into the database and return the new data or error
    let data_insert = DayDataInsert::from(data);

    diesel::insert_into(crate::schema::day_data::table)
        .values(&data_insert)
        .returning(DayData::as_returning())
        .get_result(conn)
}

// update an entry in the db, make sure to copy over any data we don't set from daily sheet
// ie. copy data from control sheet over before updating
fn update_data(
    conn: &mut SqliteConnection,
    data: &DayData,
    old: &DayData,
) -> Result<DayData, Error> {
    // copy any data we dont want ot change
    // could also do this in the update() function below?
    let mut new_data = data.clone();
    new_data.copy_control(old);

    // update the given record
    diesel::update(crate::schema::day_data::table)
        // .set(data)
        .set(new_data)
        .returning(DayData::as_returning())
        .get_result(conn)
}
