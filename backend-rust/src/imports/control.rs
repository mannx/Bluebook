// import the control sheet to the database
#![allow(non_snake_case)]

use crate::imports::load_or_new_day;
use crate::imports::load_or_new_week;
use chrono::{Days, NaiveDate};
use diesel::result::Error;
use diesel::SqliteConnection;
use log::{debug, error, info};
use regex::Regex;

use crate::imports::pdf_to_text;
use crate::imports::ImportResult;
use crate::models::day_data::DayData;
use crate::models::weekly::WeeklyInfo;

// TODO: RE_BREAD_OVERSHORT will match cash over/short first before bread over/short
// lazy_static! {
//     static ref RE_BREAD_OVERSHORT :Regex=Regex::new(r"= OVER\/SHORT\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)\s+(-?\d+[.]\d+)")
//         .expect("Unable to compile regex: RE_BREAD_OVERSHORT ");
//
//     // this allows us to parse values in the thousands, should only be required rarely, and doesnt seem to work well as the main regex
//     // find way to fix instead?
//     static ref RE_BREAD_OVERSHORT2 :Regex=Regex::new(r"/= OVER\/SHORT\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+(-?\d*,?\d+[.]\d+)\s+")
//         .expect("Unable to compile regex: RE_BREAD_OVERSHORT2 ");
// }

static DIGIT: &str = r"(\d+)";
static WHOLE: &str = r"(\d+\.\d+)";
static WS: &str = r"\s+";

// Test to build regex's easier to read.
// if works, can get rid of lazy_static
fn ReProductivity() -> Regex {
    let mut reg = format!(r"PRODUCTIVITY{WS}");

    // 7 days to match, plus the total
    for _ in 0..8 {
        reg.push_str(&format!("{WHOLE}{WS}"));
    }

    Regex::new(reg.as_str()).unwrap()
}

fn ReFactor() -> Regex {
    let mut reg = format!("FACTOR{WS}");
    // 8 -> 7 days + total
    for _ in 0..8 {
        reg.push_str(&format!("{WHOLE}{WS}"));
    }
    Regex::new(reg.as_str()).unwrap()
}

fn ReUnitsSold() -> Regex {
    let mut reg = format!("UNITS SOLD{WS}");
    for _ in 0..7 {
        reg.push_str(&format!("{DIGIT}{WS}"));
    }
    Regex::new(reg.as_str()).unwrap()
}

fn ReCustomerCount() -> Regex {
    let mut reg = format!("CUSTOMER COUNT{WS}");
    for _ in 0..7 {
        reg.push_str(&format!("{DIGIT}{WS}"));
    }
    Regex::new(reg.as_str()).unwrap()
}

fn ReHoursWorked() -> Regex {
    let mut reg = format!("HOURS WORKED{WS}");
    for _ in 0..8 {
        reg.push_str(&format!("{WHOLE}{WS}"));
    }
    Regex::new(reg.as_str()).unwrap()
}

fn ReBreadWaste() -> Regex {
    let mut reg = format!("- CREDITS{WS}");
    for _ in 0..8 {
        reg.push_str(&format!(r"(-?\d+\.\d+){WS}"));
    }
    Regex::new(reg.as_str()).unwrap()
}

fn ReNetSales() -> Regex {
    let reg = format!(r"NET SUBWAY SALES{WS}(\d+,?\d+\.\d+)");
    Regex::new(reg.as_str()).unwrap()
}

fn ReWeekEnding() -> Regex {
    Regex::new(r"WEEK ENDING\s*(\d\d?)/(\d\d?)/(\d{4})").unwrap()
}

// holds the data we are parseing
pub struct ControlSheetData {
    week_ending: NaiveDate,
    productivity: Vec<i32>,
    factor: Vec<i32>,
    units_sold: Vec<i32>,
    customer_count: Vec<i32>,
    hours_worked: Vec<i32>,

    total_prod: i32,

    bread_waste: Vec<i32>,
    bread_over_short: Vec<i32>,
    net_sales: i32,
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
            total_prod: 0,
            bread_waste: Vec::new(),
            bread_over_short: Vec::new(),
            net_sales: 0,
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

    let Some(week_ending) = ReWeekEnding().captures(control_data.as_str()) else {
        error!("Unable to get week ending date!");
        return Err("Unable to get week ending date from control sheet".to_owned());
    };

    let month = week_ending[1].parse::<u32>().unwrap();
    let day = week_ending[2].parse::<u32>().unwrap();
    let year = week_ending[3].parse::<i32>().unwrap();

    control_sheet.week_ending = NaiveDate::from_ymd_opt(year, month, day).unwrap();

    // parse and convert remaining data
    let Some(productivity) = ReProductivity().captures(control_data.as_str()) else {
        return Err("Unable to parse prod".to_owned());
    };

    let Some(factor) = ReFactor().captures(control_data.as_str()) else {
        return Err("Unable to parse factor".to_owned());
    };

    let Some(units_sold) = ReUnitsSold().captures(control_data.as_str()) else {
        return Err("Unable to parse units sold".to_owned());
    };

    let Some(customer_count) = ReCustomerCount().captures(control_data.as_str()) else {
        return Err("Unable to parse customer count".to_owned());
    };

    let Some(hours_workd) = ReHoursWorked().captures(control_data.as_str()) else {
        return Err("Unable to parse hours workd".to_owned());
    };

    let Some(bread_waste) = ReBreadWaste().captures(control_data.as_str()) else {
        return Err("Unable to parse bread waste".to_owned());
    };

    let Some(net_sales) = ReNetSales().captures(control_data.as_str()) else {
        return Err("Unable to parse net sales".to_owned());
    };

    // check for bread over short.
    // if first capture fails, try the 2nd.
    // find a way not to have to use 2 regex for this?
    // let bos = RE_BREAD_OVERSHORT.captures(control_data.as_str());
    // let bread_over_short = match bos {
    //     Some(bos) => bos, // first match was success
    //     None => match RE_BREAD_OVERSHORT2.captures(control_data.as_str()) {
    //         None => return Err("Unable to parse bread over/short".to_owned()),
    //         Some(bos2) => {
    //             debug!("control sheet: bread over/short v2 used.");
    //             bos2
    //         }
    //     },
    // };

    // convert and build the output data
    // loop through each day and convert and store
    for i in 1..=7 {
        control_sheet.productivity.push(
            productivity[i]
                .replace(".", "")
                .parse::<i32>()
                .expect("unable to convert productivity"),
        );

        control_sheet.factor.push(
            factor[i]
                .replace(".", "")
                .parse::<i32>()
                .expect("unable to convert factor"),
        );

        control_sheet.units_sold.push(
            units_sold[i]
                .parse::<i32>()
                .expect("unable to convert units_sold"),
        );
        control_sheet.customer_count.push(
            customer_count[i]
                .parse::<i32>()
                .expect("unable to convert customer count"),
        );
        control_sheet.hours_worked.push(
            hours_workd[i]
                .replace(".", "")
                .parse::<i32>()
                .expect("unable to convert customer count"),
        );
        control_sheet.bread_waste.push(
            bread_waste[i]
                .replace(".", "")
                .parse::<i32>()
                .expect("unable to convert bread waste"),
        );

        // control_sheet.bread_over_short.push(
        //     bread_over_short[i]
        //         .replace(".", "")
        //         .parse::<i32>()
        //         .expect("unable to convert bread/overshort"),
        // );
    }

    // update the single items
    control_sheet.total_prod = productivity[8]
        .replace(".", "")
        .parse::<i32>()
        .expect("Unable to parse total prod");

    // for netsales, strip away any and all ,
    let ns = net_sales[1].replace(",", "");
    control_sheet.net_sales = ns
        .replace(".", "")
        .parse::<i32>()
        .expect("unable to parse net sales");

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
        debug!("loading or creating day data for {date}...");

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
