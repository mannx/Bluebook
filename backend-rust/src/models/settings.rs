#![allow(non_snake_case)]
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::settings)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize, Deserialize, Clone)]
pub struct Settings {
    pub id: i32,
    pub HockeyURL: Option<String>,
    pub DisplayHockeyWeekly: bool,
    pub PrintHockeyWeekly: bool,

    pub HockeyHomeTeam: Option<String>,
    pub ManagerName: Option<String>,
    pub StoreNumber: Option<String>,
}

impl Settings {
    pub fn default() -> Self {
        Self {
            id: 0,
            HockeyURL: None,
            DisplayHockeyWeekly: true,
            PrintHockeyWeekly: false,
            HockeyHomeTeam: None,
            ManagerName: None,
            StoreNumber: None,
        }
    }
}
