use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{post, web, Responder};
use log::debug;

use crate::api::export::{export_weekly, WeeklyParams};
use crate::api::DbPool;

#[post("/api/weekly/export")]
pub async fn export_weekly_handler(
    pool: web::Data<DbPool>,
    data: web::Json<WeeklyParams>,
) -> actix_web::Result<impl Responder> {
    debug!("[weekly export] data: {:?}", data);

    web::block(move || {
        let mut conn = pool.get()?;

        export_weekly(&mut conn, &data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok())
}
