use crate::api::error::ApiReturnMessage;
use crate::api::DbPool;
use crate::models::auv::AUVEntry;
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use log::{debug, info};

use crate::api::auv::get_auv_data;

#[get("/api/auv/view/{month}/{year}")]
pub async fn get_auv_handler(
    pool: web::Data<DbPool>,
    path: web::Path<(u32, i32)>,
) -> actix_web::Result<impl Responder> {
    let (month, year) = path.into_inner();

    debug!("[get_auv_handler] {month}/{year}");

    let auv: AUVEntry = web::block(move || {
        let mut conn = pool.get()?;

        get_auv_data(&mut conn, month, year)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    // let ret = ApiReturnMessage::ok(auv);
    Ok(HttpResponse::Ok().json(auv))
}
