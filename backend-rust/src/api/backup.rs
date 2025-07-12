#![allow(non_snake_case)]
use diesel::prelude::*;
use diesel::SqliteConnection;
use log::debug;

use crate::api::DbError;
use crate::models::day_data::DayData;

pub fn perform_backup_undo(
    conn: &mut SqliteConnection,
    ids: &[i32],
) -> Result<Vec<String>, DbError> {
    // 1) each id in ids contains the entry to revert to
    //  a) find current valid row with the same date
    //  b) remove it
    //  c) set our deleted flag back to false

    let mut msgs = Vec::new();

    for id in ids {
        match do_undo(conn, id) {
            Err(err) => {
                msgs.push(format!("Error undoing id: {id}. [{err}]"));
            }
            Ok(_) => {
                msgs.push(format!("Undid id: {id}"));
            }
        }
    }

    Ok(msgs)
}

fn do_undo(conn: &mut SqliteConnection, undo_id: &i32) -> Result<(), DbError> {
    use crate::schema::day_data::dsl::*;

    // delete the currently valid
    conn.transaction(|conn| {
        // 1) retrieve the entry for the given id
        let day: DayData = day_data.filter(id.eq(undo_id)).first::<DayData>(conn)?;

        // 2) delete the currently active row for the given day
        debug!("Deleting active row for day: {}", day.DayDate);

        diesel::delete(day_data.filter(DayDate.eq(day.DayDate).and(Updated.eq(false))))
            .execute(conn)?;

        // 3) update our entry to be the active one
        debug!("Setting updated for row {undo_id} back to false...");
        diesel::update(day_data)
            .filter(id.eq(undo_id))
            .set(Updated.eq(false))
            .execute(conn)?;

        diesel::result::QueryResult::Ok(())
    })?;

    Ok(())
}
