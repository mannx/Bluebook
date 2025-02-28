use chrono::{Datelike, NaiveDate, Weekday};
use diesel::prelude::*;
use diesel::result::Error;
use log::error;
use serde::Serialize;

use std::fmt;

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

    pub week_5_auv: Option<i32>,
    pub week_5_hours: Option<i32>,
    pub week_5_productivity: Option<f32>,
}

#[derive(Insertable)]
#[diesel(table_name=crate::schema::auv_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct AUVDataInsert {
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

    pub week_5_auv: Option<i32>,
    pub week_5_hours: Option<i32>,
    pub week_5_productivity: Option<f32>,
}

// a more usuable structure than the database
#[derive(Serialize)]
pub struct AUVEntry {
    pub dates: Vec<NaiveDate>, // week ending date of each entry
    pub auv: Vec<i32>,
    pub hours: Vec<i32>,
    pub productivity: Vec<f32>,
}

#[derive(Debug)]
pub struct AUVConversionError;

impl fmt::Display for AUVConversionError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "AUVEntry -> AUVData conversion error")
    }
}

impl std::error::Error for AUVConversionError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

impl AUVData {
    pub fn insert_or_update(&self, conn: &mut SqliteConnection) -> Result<(), Error> {
        // if data.id == -1, we insert, otherwise we update
        if self.id == -1 {
            // insert
            let data_insert = AUVDataInsert::from(self);

            diesel::insert_into(crate::schema::auv_data::table)
                .values(&data_insert)
                .execute(conn)?;
        } else {
            // update
            use crate::schema::auv_data::dsl::*;

            diesel::update(crate::schema::auv_data::table)
                .filter(id.eq(self.id)) // make sure to only update the record we are
                .set(self)
                .execute(conn)?;
        }
        Ok(())
    }

    /// Convert from an AUVEntry.  Returns None if
    pub fn from(data: &AUVEntry) -> Result<Self, AUVConversionError> {
        // month/year we take from first date entry
        if data.dates.is_empty() {
            error!("[AUVData::from] Unable to convert from AUVEntry.  Dates empty");
            return Err(AUVConversionError {});
        }

        // check that rest of data has atleast 4 entries
        if data.auv.len() < 4 {
            error!(
                "[AUVData::from] AUV count less than 4 (len: {})",
                data.auv.len()
            );
            return Err(AUVConversionError {});
        }

        if data.hours.len() < 4 {
            error!(
                "[AUVData::from] Hour count less than 4 (len: {})",
                data.hours.len()
            );
            return Err(AUVConversionError {});
        }

        if data.productivity.len() < 4 {
            error!(
                "[AUVData::from] Productivity count less than 4 (len: {})",
                data.productivity.len()
            );
            return Err(AUVConversionError {});
        }

        let month = data.dates[0].month() as i32;
        let year = data.dates[0].year();

        // retrieve the 5th week data if available
        // otherwise set to 0
        let auv = data.auv.get(4).copied();
        let hours = data.hours.get(4).copied();
        let prod = data.productivity.get(4).copied();

        Ok(Self {
            id: -1,
            month,
            year,

            week_1_auv: data.auv[0],
            week_1_hours: data.hours[0],
            week_1_productivity: data.productivity[0],

            week_2_auv: data.auv[1],
            week_2_hours: data.hours[1],
            week_2_productivity: data.productivity[1],

            week_3_auv: data.auv[2],
            week_3_hours: data.hours[2],
            week_3_productivity: data.productivity[2],

            week_4_auv: data.auv[3],
            week_4_hours: data.hours[3],
            week_4_productivity: data.productivity[3],

            week_5_auv: auv,
            week_5_hours: hours,
            week_5_productivity: prod,
        })
    }
}

impl AUVDataInsert {
    fn from(data: &AUVData) -> Self {
        Self {
            month: data.month,
            year: data.year,

            week_1_auv: data.week_1_auv,
            week_1_hours: data.week_1_hours,
            week_1_productivity: data.week_1_productivity,

            week_2_auv: data.week_2_auv,
            week_2_hours: data.week_2_hours,
            week_2_productivity: data.week_2_productivity,

            week_3_auv: data.week_3_auv,
            week_3_hours: data.week_3_hours,
            week_3_productivity: data.week_3_productivity,

            week_4_auv: data.week_4_auv,
            week_4_hours: data.week_4_hours,
            week_4_productivity: data.week_4_productivity,

            week_5_auv: data.week_5_auv,
            week_5_hours: data.week_5_hours,
            week_5_productivity: data.week_5_productivity,
        }
    }
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
        if data.week_5_auv.is_some() {
            n.auv.push(data.week_5_auv.unwrap());
        }

        n.hours.push(data.week_1_hours);
        n.hours.push(data.week_2_hours);
        n.hours.push(data.week_3_hours);
        n.hours.push(data.week_4_hours);
        if data.week_5_hours.is_some() {
            n.hours.push(data.week_5_hours.unwrap());
        }

        n.productivity.push(data.week_1_productivity);
        n.productivity.push(data.week_2_productivity);
        n.productivity.push(data.week_3_productivity);
        n.productivity.push(data.week_4_productivity);
        if data.week_5_productivity.is_some() {
            n.productivity.push(data.week_5_productivity.unwrap());
        }

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

    /// Create a new entry with the given month/year combo and fill out
    /// arrays to appropriate size
    pub fn empty(month: u32, year: i32) -> Self {
        let mut dates = Vec::new();

        for i in 1..=5 {
            // do we have a valid week ending date?
            if let Some(date) = NaiveDate::from_weekday_of_month_opt(year, month, Weekday::Tue, i) {
                dates.push(date);
            } else {
                // invalid date, we are done early
                break;
            }
        }

        Self {
            dates,
            auv: Vec::new(),
            hours: Vec::new(),
            productivity: Vec::new(),
        }
    }
}
