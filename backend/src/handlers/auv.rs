#![allow(non_snake_case)]
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, post, web, Responder};
use chrono::{NaiveDate, Weekday};
use log::{debug, info};
use serde::Deserialize;

use crate::api::auv::{get_auv_data, set_auv_data};
use crate::api::DbPool;
use crate::models::auv::AUVEntry;

// form data we get from the frontend to update the db with
#[derive(Deserialize, Debug)]
pub struct AuvFormData {
    pub Month: u32,
    pub Year: i32,
    pub AUV: Vec<i32>,
    pub Hours: Vec<i32>,
    pub Productivity: Vec<i32>,
}

impl AuvFormData {
    pub fn convert_to(&mut self) -> AUVEntry {
        let mut auv = AUVEntry::new();

        for i in 1..=5 {
            // do we have a valid week ending date?
            if let Some(date) =
                NaiveDate::from_weekday_of_month_opt(self.Year, self.Month, Weekday::Tue, i)
            {
                auv.dates.push(date);
            } else {
                // invalid date, we are done early
                break;
            }
        }

        auv.auv.append(&mut self.AUV);
        auv.hours.append(&mut self.Hours);
        auv.productivity.append(&mut self.Productivity);

        auv
    }
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

    Ok(HttpResponse::Ok().json(auv))
}

#[post("/api/auv/update")]
pub async fn set_auv_handler(
    pool: web::Data<DbPool>,
    mut data: web::Json<AuvFormData>,
) -> actix_web::Result<impl Responder> {
    info!("[set_auv_handler] setting auv...");

    web::block(move || {
        let mut conn = pool.get()?;

        let auv_data = data.convert_to();
        set_auv_data(&mut conn, &auv_data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok())
}
