#![allow(non_snake_case)]
use chrono::{Datelike, Days, NaiveDate, Weekday};
use diesel::prelude::*;
use diesel::result::Error;
use lazy_static::lazy_static;
use log::{debug, error, info};
use std::collections::HashMap;

use serde::Serialize;

use crate::api::DbError;
use crate::models::auv::{AUVData, AUVEntry};
use crate::models::day_data::{DayData, DayDataRaw};
use crate::models::weekly::{WeeklyInfo, WeeklyInfoRaw};

#[derive(Serialize)]
pub struct WeeklyReport {
    pub TargetAUV: i32,
    pub TargetHours: i32,

    pub ProductivityBudget: f32,
    pub ProductivityActual: f32,

    pub FoodCostAmount: f32,
    pub LabourCostAmount: f32,
    pub PartySales: f32,

    pub NetSales: f32,
    pub NetSalesMismatch: bool, // true if net sales calculated from dailies differs from what was taken from wisr
    pub WisrNetSales: f32,      // netsales from the control sheet.  debug for now

    pub CustomerCount: i32,

    pub GiftCardSold: f32,
    pub GiftCardRedeem: f32,

    pub BreadOverShort: f32,

    pub LastYearSales: f32,
    pub LastYearCustomerCount: i32,
    pub UpcomingSales: f32,

    pub PrevWeek: NaiveDate,
    pub WeekEnding: NaiveDate,
}

// sales data for last year
// (LastYearSales, LastYearCustomerCount, UpcomingSales)
struct LastYearSales(f32, i32, f32);

// used to hold data while WeeklyReport is being generated
struct WeekData {
    week_ending: NaiveDate,
    days: Vec<DayData>,
    weekly: Option<WeeklyInfo>,
    auv: Option<AUVEntry>,
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
            WeekEnding: NaiveDate::MIN,
        }
    }
}

impl WeekData {
    fn new(week_ending: NaiveDate) -> Self {
        Self {
            week_ending,
            days: Vec::new(),
            weekly: None,
            auv: None,
        }
    }
}

lazy_static! {
    // Mapping to shift week ending dates to nearest week ending day
    static ref WEEKENDING_OFFSET: HashMap<Weekday, i64> = HashMap::from([
        // Weekday, diff to reach
        (Weekday::Tue, 0),
        (Weekday::Wed, -1),
        (Weekday::Thu, -2),
        (Weekday::Fri, -3),
        (Weekday::Sat, 3),
        (Weekday::Sun, 2),
        (Weekday::Mon, 1),
    ]);
}

pub fn get_weekly_report(
    conn: &mut SqliteConnection,
    week_ending: NaiveDate,
) -> Result<WeeklyReport, DbError> {
    debug!("[get_weekly_report] start...");

    let data = get_week_data(conn, week_ending)?;
    let last_year = get_last_year_upcoming_sales(conn, week_ending)?;

    debug!("   calculating weekly data....");
    Ok(calculate_weekly(&data, last_year))
}

fn get_week_data(conn: &mut SqliteConnection, week_ending: NaiveDate) -> Result<WeekData, DbError> {
    // get the starting day of the week
    let start_day = week_ending.checked_sub_days(Days::new(6)).unwrap();

    debug!("Geting week data between [{start_day}] and [{week_ending}]");

    let mut data = WeekData::new(week_ending);

    // load the day data
    {
        use crate::schema::day_data::dsl::*;

        debug!("Getting daily data...");
        let result = day_data
            .filter(DayDate.ge(start_day).and(DayDate.le(week_ending)))
            .order(DayDate)
            .select(DayDataRaw::as_select())
            .load(conn)?;

        let mut res = result.iter().map(DayData::from).collect();
        data.days.append(&mut res);
        debug!("Done!");
    }

    // get the weekly information
    {
        use crate::schema::weekly_info::dsl::*;

        debug!("Getting weekly info for {week_ending}...");
        let result = weekly_info
            .filter(WeekEnding.eq(week_ending))
            .first::<WeeklyInfoRaw>(conn);

        let wi = match result {
            Err(err) => match err {
                Error::NotFound => {
                    info!("Weekly data not found for {week_ending}");
                    None
                }
                err => return Err(Box::new(err)),
            },
            Ok(n) => Some(WeeklyInfo::from(&n)),
        };

        data.weekly = wi;
        debug!("Done!");
    }

    // get the auv data
    {
        use crate::schema::auv_data::dsl::*;

        debug!("Getting auv info for {week_ending}...");
        let mon = week_ending.month() as i32;
        let yea = week_ending.year();

        debug!("   month: {mon}");
        debug!("   year: {yea}");

        let result = auv_data
            .filter(month.eq(mon).and(year.eq(yea)))
            .first::<AUVData>(conn);
        let auv = match result {
            Err(err) => match err {
                Error::NotFound => {
                    info!("Auv data not found for {week_ending}");
                    None
                }
                err => return Err(Box::new(err)),
            },
            Ok(n) => Some(AUVEntry::from(&n)),
        };

        data.auv = auv;

        debug!("auv: {:?}", data.auv);
        debug!("Done");
    }

    debug!("Returning weekly data");
    Ok(data)
}

fn get_last_year_upcoming_sales(
    conn: &mut SqliteConnection,
    week_ending: NaiveDate,
) -> Result<LastYearSales, DbError> {
    // get last years sales
    let last_year_end = get_ly_weekending(week_ending);
    let last_year = get_week_data(conn, last_year_end)?;

    // get upcoming sales for next week
    let next = last_year_end.checked_add_days(Days::new(7)).unwrap();
    let upcoming = get_week_data(conn, next)?;

    let net = last_year
        .days
        .iter()
        .fold(0., |acc, obj| acc + obj.NetSales);
    let up_net = upcoming.days.iter().fold(0., |acc, obj| acc + obj.NetSales);
    let count = last_year
        .days
        .iter()
        .fold(0, |acc, obj| acc + obj.CustomerCount);

    Ok(LastYearSales(net, count, up_net))
}

// returns the tuesday corresponding to last year of the given date
fn get_ly_weekending(week_ending: NaiveDate) -> NaiveDate {
    use chrono::{Months, TimeDelta};

    let last = week_ending.checked_sub_months(Months::new(12)).unwrap(); // get 1 year ago
    let offset = WEEKENDING_OFFSET.get(&last.weekday()).unwrap(); // get the offset to
                                                                  // the clostest tuesday

    let days = TimeDelta::days(*offset);
    last.checked_add_signed(days).unwrap()
}

fn calculate_weekly(data: &WeekData, last_year: LastYearSales) -> WeeklyReport {
    let mut report = WeeklyReport::new();
    let LastYearSales(ly_netsales, ly_custcount, ly_upcoming) = last_year;

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
        report.NetSalesMismatch = report.WisrNetSales != report.NetSales; // true if they are
                                                                          // not equal

        if report.NetSalesMismatch {
            debug!(" ** Net Sales Mismatch **");
            debug!("  WISR Net Sales: {}", report.WisrNetSales);
            debug!("  Calculated Net Sales: {}", report.NetSales);
        }

        report.FoodCostAmount = wi.FoodCostAmount;
        report.LabourCostAmount = wi.LabourCostAmount;
        report.PartySales = wi.PartySales;

        report.ProductivityActual = wi.Productivity;
    }

    // get auv data for this week ending
    if let Some(auv) = &data.auv {
        // find the index for the week ending that we need
        let mut index = None;
        for (i, date) in auv.dates.iter().enumerate() {
            if *date == data.week_ending {
                debug!("found week ending in auv data!");
                index = Some(i);
                break;
            }
        }

        if index.is_none() {
            error!(
                "[calculate_weekly] Unable to find week ending date {} in auv data!.  Skipping...",
                data.week_ending
            );
        } else {
            let i = index.unwrap();
            report.TargetAUV = auv.auv[i];
            report.TargetHours = auv.hours[i];
            report.ProductivityBudget = auv.productivity[i];
        }
    }

    report.LastYearSales = ly_netsales;
    report.LastYearCustomerCount = ly_custcount;
    report.UpcomingSales = ly_upcoming;

    report.WeekEnding = data.week_ending;
    report.PrevWeek = data.week_ending.checked_sub_days(Days::new(7)).unwrap();

    report
}
