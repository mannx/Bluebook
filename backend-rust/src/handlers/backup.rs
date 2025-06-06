use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use diesel::prelude::*;
use diesel::SqliteConnection;

use crate::api::DbError;
use crate::api::DbPool;
use crate::models::day_data::DayData;

#[get("/api/backup/get")]
pub async fn get_backup_list(pool: web::Data<DbPool>) -> actix_web::Result<impl Responder> {
    let results = web::block(move || {
        let mut conn = pool.get()?;

        read_backup(&mut conn)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(results))
}

fn read_backup(conn: &mut SqliteConnection) -> Result<Vec<DayData>, DbError> {
    use crate::schema::day_data::dsl::*;
    let res = day_data
        .filter(Updated.eq(true))
        .order(DayDate)
        .select(DayData::as_select())
        .load(conn)?;

    Ok(res)
}
