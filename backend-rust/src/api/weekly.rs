use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use diesel::prelude::*;
use diesel::SqliteConnection;

use crate::models::*;

type DbPool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<SqliteConnection>>;

#[get("/api/weekly/view/{month}/{day}/{year}")]
pub async fn weekly_test(
    pool: web::Data<DbPool>,
    name: web::Path<(u8, u8, i32)>,
) -> actix_web::Result<impl Responder> {
    let (month, day, year) = name.into_inner();
    // let date_str = format!("{month}-{day}-{year}");
    let month = time::Month::try_from(month).expect("invalid month provided");
    let date = time::Date::from_calendar_date(year, month, day).expect("unable to build date");
    println!("date: {:?}", date);

    let result = web::block(move || -> diesel::QueryResult<WeeklyInfo> {
        use crate::schema::weekly_info::dsl::*;

        let mut conn = pool.get().expect("unable to get db connection from pool");

        let results = weekly_info
            .filter(DayDate.eq(date))
            .select(WeeklyInfo::as_select())
            // .load(&mut conn)
            .first::<WeeklyInfo>(&mut conn)
            .expect("unable to retrieve data");

        Ok(results)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(result))
}
