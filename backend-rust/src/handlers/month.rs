use crate::api::DbPool;
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};

use crate::api::month::get_month_data;

#[get("/api/month/{month}/{year}")]
pub async fn get_month_view_handler(
    pool: web::Data<DbPool>,
    params: web::Path<(u32, i32)>,
) -> actix_web::Result<impl Responder> {
    let (month, year) = params.into_inner();

    let results = web::block(move || {
        let mut conn = pool.get()?;
        get_month_data(&mut conn, month, year)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(results))
}
