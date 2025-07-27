#![allow(non_snake_case)]
use chrono::NaiveDate;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::hockey_schedule)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize, Deserialize, Clone)]
pub struct HockeySchedule {
    pub id: i32,
    pub DayDate: NaiveDate,
    pub Away: String,
    pub Home: String,
    pub GFAway: i32,
    pub GFHome: i32,
    pub Attendance: i32,
    pub Arena: String,
    pub HomeImage: String,
    pub AwayImage: String,
}
