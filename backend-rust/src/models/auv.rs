use chrono::{NaiveDate, Weekday};
use diesel::prelude::*;
use log::debug;
use serde::Serialize;

#[derive(Queryable, Selectable, AsChangeset)]
#[diesel(table_name=crate::schema::auv_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct AUVData {
    pub id: i32,

    pub month: i32,
    pub year: i32,

    pub week_1_auv: i32,
    pub week_1_hours: i32,
    pub week_1_productivity: f32,

    pub week_2_auv: i32,
    pub week_2_hours: i32,
    pub week_2_productivity: f32,

    pub week_3_auv: i32,
    pub week_3_hours: i32,
    pub week_3_productivity: f32,

    pub week_4_auv: i32,
    pub week_4_hours: i32,
    pub week_4_productivity: f32,

    pub week_5_auv: i32,
    pub week_5_hours: i32,
    pub week_5_productivity: f32,
}

// a more usuable structure than the database
#[derive(Serialize)]
pub struct AUVEntry {
    pub dates: Vec<NaiveDate>, // week ending date of each entry
    pub auv: Vec<i32>,
    pub hours: Vec<i32>,
    pub productivity: Vec<f32>,
}

impl AUVEntry {
    // convert from an AUVData into the AUVEntry
    pub fn from(data: &AUVData) -> Self {
        let mut n = Self::new();

        for i in 1..=5 {
            // do we have a valid week ending date?
            if let Some(date) =
                NaiveDate::from_weekday_of_month_opt(data.year, data.month as u32, Weekday::Tue, i)
            {
                n.dates.push(date);
            } else {
                // invalid date, we are done early
                break;
            }
        }

        n.auv.push(data.week_1_auv);
        n.auv.push(data.week_2_auv);
        n.auv.push(data.week_3_auv);
        n.auv.push(data.week_4_auv);
        n.auv.push(data.week_5_auv);

        n.hours.push(data.week_1_hours);
        n.hours.push(data.week_2_hours);
        n.hours.push(data.week_3_hours);
        n.hours.push(data.week_4_hours);
        n.hours.push(data.week_5_hours);

        n.productivity.push(data.week_1_productivity);
        n.productivity.push(data.week_2_productivity);
        n.productivity.push(data.week_3_productivity);
        n.productivity.push(data.week_4_productivity);
        n.productivity.push(data.week_5_productivity);

        n
    }

    pub fn new() -> Self {
        Self {
            dates: Vec::new(),
            auv: Vec::new(),
            hours: Vec::new(),
            productivity: Vec::new(),
        }
    }
}
