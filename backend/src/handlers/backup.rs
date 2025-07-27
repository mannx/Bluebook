use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, post, web, Responder};
use diesel::prelude::*;
use diesel::SqliteConnection;

use crate::api::backup::{clear_backup_list, perform_backup_undo};
use crate::api::error::ApiReturnMessage;
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

#[post("/api/backup/undo")]
pub async fn undo_backup_handler(
    pool: web::Data<DbPool>,
    data: web::Json<Vec<i32>>,
) -> actix_web::Result<impl Responder> {
    let results = web::block(move || {
        let mut conn = pool.get()?;
        perform_backup_undo(&mut conn, &data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(results))
}

#[post("/api/backup/clear")]
pub async fn clear_backup_handler(pool: web::Data<DbPool>) -> actix_web::Result<impl Responder> {
    let rows = web::block(move || {
        let mut conn = pool.get()?;
        clear_backup_list(&mut conn)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    let api = ApiReturnMessage::<String>::ok(format!("Cleared {rows} rows."));

    Ok(HttpResponse::Ok().json(api))
}
