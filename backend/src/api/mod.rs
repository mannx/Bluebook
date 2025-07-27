pub mod auv;
pub mod backup;
pub mod day_edit;
pub mod error;
pub mod export;
pub mod month;
pub mod settings;
pub mod tags;
pub mod weekly;

use chrono::NaiveDate;
use diesel::prelude::*;

pub type DbPool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<SqliteConnection>>;
pub type DbError = Box<dyn std::error::Error + Send + Sync>;

pub fn get_days_in_month(year: i32, month: u32) -> u32 {
    NaiveDate::from_ymd_opt(
        match month {
            12 => year + 1,
            _ => year,
        },
        match month {
            12 => 1,
            _ => month + 1,
        },
        1,
    )
    .expect("[get_days_in_month] bad year/month provided")
    .signed_duration_since(NaiveDate::from_ymd_opt(year, month, 1).unwrap())
    .num_days()
    .try_into()
    .expect("[get_days_in_month] duration too large for u32")
}
