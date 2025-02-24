#![allow(non_snake_case)]
// use crate::api::error::ApiReturnMessage;
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, post, web, Responder};
use log::{debug, info};
use serde::Deserialize;

use crate::api::auv::{get_auv_data, set_auv_data};
use crate::api::DbPool;
use crate::models::auv::AUVEntry;

// form data we get from the frontend to update the db with
#[derive(Deserialize, Debug)]
#[allow(dead_code)]
pub struct AuvFormData {
    pub Month: u32,
    pub Year: i32,
    pub AUV: Vec<i32>,
    pub Hours: Vec<i32>,
    pub Productivity: Vec<f32>,
}

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

#[post("/api/auv/update")]
pub async fn set_auv_handler(
    pool: web::Data<DbPool>,
    data: web::Json<AuvFormData>,
) -> actix_web::Result<impl Responder> {
    info!("[set_auv_handler] setting auv...");
    debug!("data: {:?}", data);

    let result = web::block(move || {
        let mut conn = pool.get()?;

        set_auv_data(&mut conn, &data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(result))
}
