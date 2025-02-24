use diesel::prelude::*;
use diesel::result::Error;
use log::info;

// use crate::api::error::{ApiReturnMessage, NoData};
use crate::api::DbError;
use crate::handlers::auv::AuvFormData;
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
                    return Ok(AUVEntry::new());
                }
                err => return Err(Box::new(err)),
            }
        }
    };

    Ok(AUVEntry::from(&auv))
}

// update the auv data in the db
pub fn set_auv_data(conn: &mut SqliteConnection, data: &AuvFormData) -> Result<(), DbError> {
    Ok(())
}
