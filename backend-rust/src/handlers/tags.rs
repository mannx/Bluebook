#![allow(non_snake_case)]
use crate::api::DbPool;
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};

use crate::api::tags::get_tag_list;

#[get("/api/tags/view")]
pub async fn get_tag_list_handler(pool: web::Data<DbPool>) -> actix_web::Result<impl Responder> {
    let results = web::block(move || {
        let mut conn = pool.get()?;
        get_tag_list(&mut conn)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(results))
}
