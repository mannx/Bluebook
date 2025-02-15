// import the control sheet to the database
#![allow(non_snake_case)]
// use crate::api::DbError;
use crate::imports::load_or_new_day;
use crate::imports::load_or_new_week;
use chrono::{Days, NaiveDate};
use diesel::result::Error;
use diesel::SqliteConnection;
use lazy_static::lazy_static;
use log::{debug, error, info};
use regex::Regex;

use crate::imports::pdf_to_text;
use crate::imports::ImportResult;
use crate::models::day_data::DayData;
use crate::models::weekly::WeeklyInfo;

// compile all the regex's we will use one time
lazy_static! {
    static ref RE_WEEK_ENDING: Regex = Regex::new(r"WEEK ENDING\s*(\d\d?)/(\d\d?)/(\d{4})")
        .expect("Unable to compile regex RE_WEEK_ENDING");

    static ref RE_PRODUCTIVITY:Regex=Regex::new(r"PRODUCTIVITY\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)")
    .expect("Unable to compile regex RE_PRODUCTIVITY");

    static ref RE_FACTOR       :Regex=Regex::new(r"FACTOR\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)")
        .expect("Unable to compile regex: RE_FACTOR ");
    static ref RE_UNITS_SOLD     :Regex=Regex::new(r"ALL UNITS SOLD\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+")
        .expect("Unable to compile regex: RE_UNITS_SOLD     ");
    static ref RE_CUSTOMER_COUNT :Regex=Regex::new(r"CUSTOMER COUNT\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+")
        .expect("Unable to compile regex: RE_CUSTOMER_COUNT ");
    static ref RE_HOURS_WORKED   :Regex=Regex::new(r"HOURS WORKED\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)")
        .expect("Unable to compile regex: RE_HOURS_WORKED   ");

    static ref RE_TOTAL_PROD :Regex=Regex::new(r"PRODUCTIVITY\s+(\d+\.\d+)")
        .expect("Unable to compile regex: RE_TOTAL_PROD ");
    static ref RE_BREAD_WASTE :Regex=Regex::new(r"- CREDITS\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+")
        .expect("Unable to compile regex: RE_BREAD_WASTE ");

    static ref RE_BREAD_OVERSHORT :Regex=Regex::new(r"= OVER\/SHORT\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)")
        .expect("Unable to compile regex: RE_BREAD_OVERSHORT ");

    // this allows us to parse values in the thousands, should only be required rarely, and doesnt seem to work well as the main regex
    // find way to fix instead?
    static ref RE_BREAD_OVERSHORT2 :Regex=Regex::new(r"/= OVER\/SHORT\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+")
        .expect("Unable to compile regex: RE_BREAD_OVERSHORT2 ");

    static ref RE_NETSALES :Regex=Regex::new(r"NET SUBWAY SALES\s+(\d+,?\d+[.]\d+)") // 1 group -> weekly net sales
        .expect("Unable to compile regex: RE_NETSALES ");
}

// holds the data we are parseing
#[allow(dead_code)]
#[derive(Debug)]
pub struct ControlSheetData {
    week_ending: NaiveDate,
    productivity: Vec<f32>,
    factor: Vec<f32>,
    units_sold: Vec<f32>,
    customer_count: Vec<i32>,
    hours_worked: Vec<f32>,

    total_prod: f32,

    bread_waste: Vec<f32>,
    bread_over_short: Vec<f32>,

    net_sales: f32,
}

impl ControlSheetData {
    fn new() -> Self {
        Self {
            week_ending: NaiveDate::MIN,
            productivity: Vec::new(),
            factor: Vec::new(),
            units_sold: Vec::new(),
            customer_count: Vec::new(),
            hours_worked: Vec::new(),
            total_prod: 0.,
            bread_waste: Vec::new(),
            bread_over_short: Vec::new(),
            net_sales: 0.,
        }
    }
}

pub fn import_control_sheet(conn: &mut SqliteConnection, file_name: &String) -> ImportResult {
    let mut messages = ImportResult::new();

    info!("begining control sheet parse...");

    let control_sheet = match parse_control_sheet(file_name) {
        Err(err) => {
            messages.add(err);
            return messages;
        }
        Ok(cs) => cs,
    };

    // save the control sheet data
    match save_control_sheet(conn, &control_sheet, &mut messages) {
        Ok(_) => {}
        Err(e) => {
            messages.add(format!("Unable to save control sheet: {e}"));
        }
    }

    info!("control sheet parse complete");

    messages
}

fn parse_control_sheet(file_name: &String) -> Result<ControlSheetData, String> {
    let mut control_sheet = ControlSheetData::new();

    debug!("importing control sheet...");

    let control_filename = match pdf_to_text(file_name) {
        None => {
            return Err("unable to convert control sheet".to_owned());
        }
        Some(fname) => fname,
    };

    let control_data =
        std::fs::read_to_string(control_filename.as_path()).expect("unable to read control input");

    let Some(week_ending) = RE_WEEK_ENDING.captures(control_data.as_str()) else {
        error!("Unable to get week ending date!");
        return Err("Unable to get week ending date from control sheet".to_owned());
    };

    let month = week_ending[1].parse::<u32>().unwrap();
    let day = week_ending[2].parse::<u32>().unwrap();
    let year = week_ending[3].parse::<i32>().unwrap();

    control_sheet.week_ending = NaiveDate::from_ymd_opt(year, month, day).unwrap();

    // parse and convert remaining data
    let Some(productivity) = RE_PRODUCTIVITY.captures(control_data.as_str()) else {
        return Err("Unable to parse productivity".to_owned());
    };

    let Some(factor) = RE_FACTOR.captures(control_data.as_str()) else {
        return Err("Unable to parse factor".to_owned());
    };

    let Some(units_sold) = RE_UNITS_SOLD.captures(control_data.as_str()) else {
        return Err("Unable to parse units sold".to_owned());
    };

    let Some(customer_count) = RE_CUSTOMER_COUNT.captures(control_data.as_str()) else {
        return Err("Unable to parse customer count".to_owned());
    };

    let Some(hours_workd) = RE_HOURS_WORKED.captures(control_data.as_str()) else {
        return Err("Unable to parse hours workd".to_owned());
    };

    let Some(total_prod) = RE_TOTAL_PROD.captures(control_data.as_str()) else {
        return Err("Uanble to parse total productivity".to_owned());
    };

    let Some(bread_waste) = RE_BREAD_WASTE.captures(control_data.as_str()) else {
        return Err("Unable to parse bread waste".to_owned());
    };

    let Some(net_sales) = RE_NETSALES.captures(control_data.as_str()) else {
        return Err("Unable to parse net sales".to_owned());
    };

    // check for bread over short.
    // if first capture fails, try the 2nd.
    // find a way not to have to use 2 regex for this?
    let bos = RE_BREAD_OVERSHORT.captures(control_data.as_str());
    let bread_over_short = match bos {
        Some(bos) => bos, // first match was success
        None => match RE_BREAD_OVERSHORT2.captures(control_data.as_str()) {
            None => return Err("Unable to parse bread over/short".to_owned()),
            Some(bos2) => {
                debug!("control sheet: bread over/short v2 used.");
                bos2
            }
        },
    };

    debug!("bread over/short: {:?}", bread_over_short);

    // convert and build the output data
    // loop through each day and convert and store
    for i in 1..=7 {
        control_sheet.productivity.push(
            productivity[i]
                .parse::<f32>()
                .expect("unable to convert productivity"),
        );

        control_sheet
            .factor
            .push(factor[i].parse::<f32>().expect("unable to convert factor"));

        control_sheet.units_sold.push(
            units_sold[i]
                .parse::<f32>()
                .expect("unable to convert units_sold"),
        );
        control_sheet.customer_count.push(
            customer_count[i]
                .parse::<i32>()
                .expect("unable to convert customer count"),
        );
        control_sheet.hours_worked.push(
            hours_workd[i]
                .parse::<f32>()
                .expect("unable to convert customer count"),
        );
        control_sheet.bread_waste.push(
            bread_waste[i]
                .parse::<f32>()
                .expect("unable to convert bread waste"),
        );

        control_sheet.bread_over_short.push(
            bread_over_short[i]
                .parse::<f32>()
                .expect("unable to convert bread/overshort"),
        );
    }

    // update the single items
    control_sheet.total_prod = total_prod[1]
        .parse::<f32>()
        .expect("unable to convert total prod");

    // for netsales, strip away any and all ,
    let ns = net_sales[1].replace(",", "");
    control_sheet.net_sales = ns.parse::<f32>().expect("unable to parse net sales");

    Ok(control_sheet)
}

fn save_control_sheet(
    conn: &mut SqliteConnection,
    sheet: &ControlSheetData,
    messages: &mut ImportResult,
) -> Result<(), Error> {
    // 1) for each daily item, update the day records or create new ones

    // get the date ofthe start of the week
    let start_date = sheet.week_ending.checked_sub_days(Days::new(6)).unwrap();
    debug!("week start date: {start_date}");

    for i in 0..7 {
        // get the date for this entry
        let date = start_date.checked_add_days(Days::new(i as u64)).unwrap();

        // retrieve the data if in the db, or a new entry
        let mut day_data: DayData = match load_or_new_day(conn, date) {
            Err(err) => {
                error!("Unable to retrieve or create daydata for control sheet import");
                error!("Error: {err}");
                error!("Date: {date}");
                error!("skipping to next date...");
                continue;
            }
            Ok(dd) => dd,
        };

        day_data.HoursWorked = sheet.hours_worked[i];
        day_data.Productivity = sheet.productivity[i];
        day_data.Factor = sheet.factor[i];
        day_data.AdjustedSales = sheet.units_sold[i];
        day_data.CustomerCount = sheet.customer_count[i];
        day_data.BreadCredits = sheet.bread_waste[i];
        day_data.BreadOverShort = sheet.bread_over_short[i];

        // save it
        day_data.insert_or_update(conn)?;
        messages.add(format!("Imported Control Data for {date}"));
    }

    // save the remaining weekly information
    let mut weekly: WeeklyInfo = load_or_new_week(conn, sheet.week_ending)?;

    weekly.NetSales = sheet.net_sales;
    weekly.Productivity = sheet.total_prod;

    // save or update the info
    weekly.insert_or_update(conn)?;
    messages.add(format!("Weekly data saved for {}", sheet.week_ending));

    Ok(())
}
