#![allow(non_snake_case)]
// use chrono::{Days, NaiveDate};
use chrono::{Datelike, Days, NaiveDate};
use diesel::prelude::*;
use diesel::result::Error;
use log::{debug, info};

use serde::Serialize;

use crate::api::DbError;
use crate::models::day_data::DayData;
use crate::models::weekly::WeeklyInfo;

#[derive(Serialize)]
pub struct WeeklyReport {
    TargetAUV: u32,
    TargetHours: u32,

    ProductivityBudget: f32,
    ProductivityActual: f32,

    FoodCostAmount: f32,
    LabourCostAmount: f32,
    PartySales: f32,

    NetSales: f32,
    NetSalesMismatch: bool, // true if net sales calculated from dailies differs from what was taken from wisr
    WisrNetSales: f32,      // netsales from the control sheet.  debug for now

    CustomerCount: i32,

    GiftCardSold: f32,
    GiftCardRedeem: f32,

    BreadOverShort: f32,

    LastYearSales: f32,
    LastYearCustomerCount: u32,
    UpcomingSales: f32,

    PrevWeek: NaiveDate,
}

// used to hold data while WeeklyReport is being generated
struct WeekData {
    days: Vec<DayData>,
    weekly: Option<WeeklyInfo>,
    //todo: auv information here
}

impl WeeklyReport {
    fn new() -> Self {
        Self {
            TargetAUV: 0,
            TargetHours: 0,
            ProductivityActual: 0.,
            ProductivityBudget: 0.,
            FoodCostAmount: 0.,
            LabourCostAmount: 0.,
            PartySales: 0.,
            NetSales: 0.,
            NetSalesMismatch: false,
            WisrNetSales: 0.,
            CustomerCount: 0,
            GiftCardSold: 0.,
            GiftCardRedeem: 0.,
            BreadOverShort: 0.,
            LastYearSales: 0.,
            LastYearCustomerCount: 0,
            UpcomingSales: 0.,
            PrevWeek: NaiveDate::MIN,
        }
    }
}

impl WeekData {
    fn new() -> Self {
        Self {
            days: Vec::new(),
            weekly: None,
        }
    }
}

pub fn get_weekly_report(
    conn: &mut SqliteConnection,
    week_ending: NaiveDate,
) -> Result<WeeklyReport, DbError> {
    let data = get_week_data(conn, week_ending)?;
    let last_year=get_last_year_sales(conn,week_ending)?;

    Ok(calculate_weekly(&data))
}

fn get_week_data(conn: &mut SqliteConnection, week_ending: NaiveDate) -> Result<WeekData, DbError> {
    // get the starting day of the week
    let start_day = week_ending.checked_sub_days(Days::new(6)).unwrap();

    debug!("Geting week data between [{start_day}] and [{week_ending}]");

    let mut data = WeekData::new();

    // load the day data
    {
        use crate::schema::day_data::dsl::*;

        debug!("Getting daily data...");
        let mut result = day_data
            .filter(DayDate.ge(start_day).and(DayDate.le(week_ending)))
            .order(DayDate)
            .select(DayData::as_select())
            .load(conn)?;

        data.days.append(&mut result);
        debug!("Done!");
    }

    // get the weekly information
    {
        use crate::schema::weekly_info::dsl::*;

        debug!("Getting weekly info for {week_ending}...");
        let result = weekly_info
            .filter(WeekEnding.eq(week_ending))
            .first::<WeeklyInfo>(conn);

        let wi = match result {
            Err(err) => match err {
                Error::NotFound => {
                    info!("Weekly data not found for {week_ending}");
                    None
                }
                err => return Err(Box::new(err)),
            },
            Ok(n) => Some(n),
        };

        data.weekly = wi;
        debug!("Done!");
    }

    debug!("Returning weekly data");
    Ok(data)
}

fn get_last_year_sales(conn:&mut SqliteConnection,this_week_ending:NaiveDate)->Result<WeeklyReport,DbError>{
    // get last years week ending
    let mut last_year_end=this_week_ending.checked_sub_months(chrono::Months::new(12)).unwrap();
    // let last_year_start=last_year_end.checked_sub_days(Days::new(6)).unwrap();

    // adjust the week ending date to fall on a tuesday
    if last_year_end.weekday()!=chrono::Weekday::Tue{
        debug!("last year not a tuesday, adjusting...");

        // ajudst backwards until tuesday
        // TODO: do this better
        while last_year_end.weekday()==chrono::Weekday::Tue{
            last_year_end=last_year_end.checked_sub_days(Days::new(1)).unwrap();
        }

        debug!("new last year {last_year_end}");
    }

    // debug!("calculating last year sales from [{last_year_start}] - [{last_year_end}]");

    let report=get_week_data(conn,last_year_end)?;
    let ns = report.days.iter().fold(0.,|acc,obj|acc+obj.NetSales);

    debug!(" net sales: {ns}");

    Ok(WeeklyReport::new())
}

fn calculate_weekly(data: &WeekData) -> WeeklyReport {
    let mut report = WeeklyReport::new();

    // calcuate fields from the daily data
    for i in &data.days {
        report.NetSales += i.NetSales;
        report.CustomerCount += i.CustomerCount;
        report.GiftCardSold += i.GiftCardSold;
        report.GiftCardRedeem += i.GiftCardRedeem;
        report.BreadOverShort += i.BreadOverShort;
    }

    // calculate information from the weekly if we have it
    if let Some(wi) = &data.weekly {
        report.WisrNetSales = wi.NetSales;
        report.NetSalesMismatch = report.WisrNetSales == report.NetSales;
    }

    report
}
