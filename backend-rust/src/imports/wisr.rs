// import the control sheet to the database
#![allow(non_snake_case)]
use crate::imports::load_or_new_week;
use chrono::NaiveDate;
use diesel::result::Error;
use diesel::SqliteConnection;
use lazy_static::lazy_static;
use log::{debug, error, info};
use regex::Regex;

use crate::imports::pdf_to_text;
use crate::imports::ImportResult;
use crate::models::weekly::WeeklyInfo;

lazy_static! {
static ref RE_WEEK_ENDING :Regex=Regex::new(r"Week Ending:\s*(\d\d?)/(\d\d?)/(\d{4})").unwrap();

static ref RE_CATERING_SALES :Regex=Regex::new(r"CATERING SALES\s+(\d+.?\d?)").unwrap();          // 1 group -> total catering sales;
static ref RE_LABOUR_COST    :Regex=Regex::new(r"LABOR\s&\sTAXES\s+(\d+,?\d+)\s+(\d+)").unwrap(); // 2 groups -> [0] dollar value [1] percent
static ref RE_FOOD_COST      :Regex=Regex::new(r"COST OF GOODS\s+(\d+,?\d+)\s+(\d+)").unwrap();   // 2 groups -> [0] dollar value [1] percent
}

pub struct WisrData {
    week_ending: NaiveDate,

    catering_sales: f32,
    labour_cost_dollar: f32,
    labour_cost_percent: f32,

    food_cost_dollar: f32,
    food_cost_percent: f32,
}

impl WisrData {
    fn new() -> Self {
        Self {
            week_ending: NaiveDate::MIN,
            catering_sales: 0.,
            labour_cost_dollar: 0.,
            labour_cost_percent: 0.,
            food_cost_dollar: 0.,
            food_cost_percent: 0.,
        }
    }
}

pub fn import_wisr_sheet(conn: &mut SqliteConnection, file_name: &String) -> ImportResult {
    let mut messages = ImportResult::new();

    info!("starting parse of wisr sheet");
    let wisr = match parse_wisr(file_name) {
        Err(err) => {
            messages.add(format!("Unable to parse wisr: {err}"));
            return messages;
        }
        Ok(w) => w,
    };

    // save to db
    if let Err(err) = save_wisr(conn, &wisr, &mut messages) {
        messages.add(format!("Unable to save wisr: {err}"));
    }

    messages
}

fn parse_wisr(file_name: &String) -> Result<WisrData, String> {
    let mut wisr = WisrData::new();

    debug!("importing wisr sheet...");

    let wisr_filename = match pdf_to_text(file_name) {
        None => {
            return Err("unable to convert wisr sheet".to_owned());
        }
        Some(fname) => fname,
    };

    let wisr_data =
        std::fs::read_to_string(wisr_filename.as_path()).expect("unable to read wisr input");

    let Some(week_ending) = RE_WEEK_ENDING.captures(wisr_data.as_str()) else {
        error!("Unable to parse week ending date");
        return Err("Unable to parse week ending date for wisr.".to_owned());
    };

    let Some(catering) = RE_CATERING_SALES.captures(wisr_data.as_str()) else {
        error!("Unable to parse catering data.");
        return Err("Unable to parse catering data.".to_owned());
    };

    let Some(food_cost) = RE_FOOD_COST.captures(wisr_data.as_str()) else {
        return Err("Unable to parse food cost".to_owned());
    };

    let Some(labour_cost) = RE_LABOUR_COST.captures(wisr_data.as_str()) else {
        return Err("Unable to parse labour cost".to_owned());
    };

    let month = week_ending[1].parse::<u32>().unwrap();
    let day = week_ending[2].parse::<u32>().unwrap();
    let year = week_ending[3].parse::<i32>().unwrap();

    wisr.week_ending = NaiveDate::from_ymd_opt(year, month, day).unwrap();

    wisr.catering_sales = catering[1].parse::<f32>().unwrap();

    wisr.food_cost_dollar = food_cost[1].parse::<f32>().unwrap();
    wisr.food_cost_percent = food_cost[2].parse::<f32>().unwrap();

    wisr.labour_cost_dollar = labour_cost[1].parse::<f32>().unwrap();
    wisr.labour_cost_percent = labour_cost[2].parse::<f32>().unwrap();

    Ok(wisr)
}

fn save_wisr(
    conn: &mut SqliteConnection,
    wisr: &WisrData,
    messages: &mut ImportResult,
) -> Result<(), Error> {
    // save the remaining weekly information
    let mut weekly: WeeklyInfo = load_or_new_week(conn, wisr.week_ending)?;

    weekly.DayDate = wisr.week_ending;

    weekly.FoodCostAmount = wisr.food_cost_dollar;
    weekly.FoodCostPercent = wisr.food_cost_percent;

    weekly.LabourCostAmount = wisr.labour_cost_dollar;
    weekly.LabourCostPercent = wisr.labour_cost_percent;

    // save or update the info
    weekly.insert_or_update(conn)?;
    messages.add(format!("Weekly data saved for {}", wisr.week_ending));
    Ok(())
}
