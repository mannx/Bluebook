#![allow(non_snake_case)]
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, post, web, Responder};
use chrono::NaiveDate;

use crate::api::day_edit::*;
use crate::api::error::ApiReturnMessage;
use crate::api::DbPool;

#[get("/api2/day/edit/{id}/{date}")]
pub async fn day_edit_get(
    pool: web::Data<DbPool>,
    req: web::Path<(i32, NaiveDate)>,
) -> actix_web::Result<impl Responder> {
    let (id, date) = req.into_inner();

    let result = web::block(move || {
        let mut conn = pool.get()?;

        get_day_edit(&mut conn, id, date)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(result))
}

#[post("/api2/day/update")]
pub async fn day_edit_update(
    pool: web::Data<DbPool>,
    data: web::Json<DayEditUpdate>,
) -> actix_web::Result<impl Responder> {
    // update the record, or create an save a new one
    // return an error message if something goes wrong
    let result = web::block(move || {
        let mut conn = pool.get()?;

        // update comment and tags
        let tag_id = update_day_edit(&mut conn, &data)?;

        // process tags
        match tag_id {
            Some(id) => update_tags(&mut conn, id, &data),
            None => Ok(true),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    // using i32 as we need a type, but aren't returning any data
    let msg: ApiReturnMessage<i32> = match result {
        true => ApiReturnMessage::ok_none(),
        false => ApiReturnMessage::error("Unable to"),
    };

    Ok(HttpResponse::Ok().json(msg))
}
