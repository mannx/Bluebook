use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use chrono::NaiveDate;

use crate::api::weekly::get_weekly_report;
use crate::api::DbPool;

///
/// Retrieve the combined weekly data to confirm before generating weekly report
///
#[get("/api/weekly/view/{month}/{day}/{year}")]
pub async fn weekly_handler(
    pool: web::Data<DbPool>,
    data: web::Path<(u32, u32, i32)>,
) -> actix_web::Result<impl Responder> {
    let result = web::block(move || {
        let mut conn = pool.get()?;
        let (month, day, year) = data.into_inner();

        let week_ending = NaiveDate::from_ymd_opt(year, month, day).unwrap();

        get_weekly_report(&mut conn, week_ending)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(result))
}
