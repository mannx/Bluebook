use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, post, web, Responder};

use log::debug;

use crate::api::error::{ApiReturnMessage, NoData};
use crate::api::settings::{read_settings, write_settings, SettingsUpdate};
use crate::api::DbPool;

#[get("/api/settings/get")]
pub async fn get_bluebook_settings(pool: web::Data<DbPool>) -> actix_web::Result<impl Responder> {
    let results = web::block(move || {
        let mut conn = pool.get()?;
        read_settings(&mut conn)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(results))
}

#[post("/api/settings/set")]
pub async fn set_bluebook_settings(
    pool: web::Data<DbPool>,
    data: web::Json<SettingsUpdate>,
) -> actix_web::Result<impl Responder> {
    debug!("set_bluebook_settings");
    web::block(move || {
        let mut conn = pool.get()?;

        write_settings(&mut conn, &data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    let msg = ApiReturnMessage::<NoData>::ok_none();

    Ok(HttpResponse::Ok().json(msg))
}
