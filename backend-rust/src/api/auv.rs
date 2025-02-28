use diesel::prelude::*;
use diesel::result::Error;
use log::{debug, info};

use crate::api::DbError;
use crate::models::auv::{AUVData, AUVEntry};

pub fn get_auv_data(conn: &mut SqliteConnection, mon: u32, yea: i32) -> Result<AUVEntry, DbError> {
    use crate::schema::auv_data::dsl::*;

    let result = auv_data
        .filter(month.eq(mon as i32).and(year.eq(yea)))
        .first::<AUVData>(conn);

    let auv: AUVData = match result {
        Ok(auv) => auv,
        Err(err) => {
            match err {
                Error::NotFound => {
                    // no entry set, just return an empty object
                    info!("No auv data for {mon}/{yea} found...returning empty values");
                    return Ok(AUVEntry::empty(mon, yea));
                }
                err => return Err(Box::new(err)),
            }
        }
    };

    Ok(AUVEntry::from(&auv))
}

// update the auv data in the db
pub fn set_auv_data(conn: &mut SqliteConnection, data: &AUVEntry) -> Result<(), DbError> {
    let auv_data = AUVData::from(data)?;

    debug!("[set_auv_data] successfully converted auv data...");

    // insert or update
    auv_data.insert_or_update(conn)?;

    Ok(())
}
