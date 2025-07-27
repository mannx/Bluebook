#![allow(non_snake_case)]
use diesel::prelude::*;
use diesel::SqliteConnection;
use log::error;
use serde::Deserialize;

use crate::api::DbError;
use crate::models::settings::Settings;

#[derive(Debug, Deserialize)]
pub struct SettingsUpdate {
    pub HockeyURL: String,
    pub DisplayHockey: bool,
    pub PrintHockey: bool,
    pub HockeyHomeTeam: String,
    pub ManagerName: String,
    pub StoreNumber: String,
}

impl SettingsUpdate {
    fn to_settings(&self, id: i32) -> Settings {
        let HockeyURL = if !self.HockeyURL.is_empty() {
            Some(self.HockeyURL.clone())
        } else {
            None
        };

        let HockeyHomeTeam = if !self.HockeyHomeTeam.is_empty() {
            Some(self.HockeyHomeTeam.clone())
        } else {
            None
        };

        let ManagerName = if !self.ManagerName.is_empty() {
            Some(self.ManagerName.clone())
        } else {
            None
        };
        let StoreNumber = if !self.StoreNumber.is_empty() {
            Some(self.StoreNumber.clone())
        } else {
            None
        };

        Settings {
            id,
            DisplayHockeyWeekly: self.DisplayHockey,
            PrintHockeyWeekly: self.PrintHockey,
            HockeyHomeTeam,
            HockeyURL,
            ManagerName,
            StoreNumber,
        }
    }
}

pub fn read_settings(conn: &mut SqliteConnection) -> Result<Settings, DbError> {
    use crate::schema::settings::dsl::*;

    let result = settings.first::<Settings>(conn);
    match result {
        Err(e) => {
            error!("Error retrieving settings.  Using default values. [{}]", e);
            Ok(Settings::default())
        }
        Ok(set) => Ok(set),
    }
}

pub fn write_settings(
    conn: &mut SqliteConnection,
    data: &SettingsUpdate,
) -> Result<usize, DbError> {
    // retrieve the current set of settings to get its id
    let setting_id = match read_settings(conn) {
        Ok(n) => n.id,
        Err(_) => 1,
    };

    let val = data.to_settings(setting_id);
    let res = diesel::update(crate::schema::settings::table)
        .set(val)
        .execute(conn)?;

    Ok(res)
}
