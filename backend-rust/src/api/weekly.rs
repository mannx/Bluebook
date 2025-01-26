use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use chrono::NaiveDate;
use diesel::prelude::*;
use log::error;

use crate::api::*;
use crate::models::prelude::*;

#[get("/api/weekly/view/{month}/{day}/{year}")]
pub async fn weekly_test(
    pool: web::Data<DbPool>,
    name: web::Path<(u32, u32, i32)>,
) -> actix_web::Result<impl Responder> {
    let (month, day, year) = name.into_inner();

    let date = NaiveDate::from_ymd_opt(year, month, day).expect("invalid date provided!");

    let result = web::block(move || -> diesel::QueryResult<WeeklyInfo> {
        use crate::schema::weekly_info::dsl::*;

        let mut conn = pool.get().expect("unable to get db connection from pool");

        let results = weekly_info
            .filter(DayDate.eq(date))
            .select(WeeklyInfo::as_select())
            .first::<WeeklyInfo>(&mut conn);

        match results {
            Ok(r) => Ok(r),
            Err(e) => {
                error!(
                    "unable to retrieve weekly information for week of {}.  Returning blank data",
                    date
                );
                error!("{}", e);

                Ok(WeeklyInfo::new(date))
            }
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(result))
}
