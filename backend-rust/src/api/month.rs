#![allow(non_snake_case)]
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use diesel::prelude::*;
use diesel::SqliteConnection;

use crate::models::*;

type DbPool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<SqliteConnection>>;

// endOfWeek provides data totaling the previous week of sales
// type endOfWeek struct {
// 	NetSales          float64
// 	CustomerCount     int
// 	ThirdPartyPercent float64
// 	ThirdPartyTotal   float64
// }
//
// // dayViewData is an expanded DayData object with additional properties
// type dayViewData struct {
// 	models.DayData
//
// 	ThirdPartyDollar  float64
// 	ThirdPartyPercent float64
// 	GrossSales        float64
// 	DayOfMonth        int       // 1-31 for what day of the month it is
// 	DayOfWeek         string    // user friendly name of what day it is
// 	IsEndOfWeek       bool      // is this a tuesday?
// 	EOW               endOfWeek // end of week data if required
// 	Tags              []string  // list of tags on this day
// 	TagID             []uint
// 	SalesLastWeek     int  // 0 if same, -1 if less, 1 if > than last weeks sales for this day
// 	Exists            bool // true if found in db, false if auto filled
//
// 	// below is the extracted date.  Issues parsing date client side in js so this workaround is used for now
// 	Day   int
// 	Month time.Month
// 	Year  int
//
// 	Hockey models.HockeySchedule
// }

struct EndOfWeek {
    NetSales: f32,
    CustomerCount: i32,
    ThirdPartyPercent: f32,
    ThirdPartyTotal: f32,
}

struct MonthData {
    Data: DayData,
    ThirdPartyDollar: f32,
    ThirdPartyPercent: f32,
    GrossSales: f32,
    DayOfMonth: u8,
    DayOfWeek: String,
    IsEndOfWeek: bool,

    Tags: Vec<String>,
    TagID: Vec<u32>,
    SalesLastWeek: i32,
    Exists: bool,

    Day: u8,
    Month: u8,
    Year: i32,
}

#[get("/api/month/{month}/{year}")]
pub async fn get_month_view_handler(
    pool: web::Data<DbPool>,
    params: web::Path<(u8, i32)>,
) -> actix_web::Result<impl Responder> {
    // let (month, day, year) = name.into_inner();
    // // let date_str = format!("{month}-{day}-{year}");
    // let month = time::Month::try_from(month).expect("invalid month provided");
    // let date = time::Date::from_calendar_date(year, month, day).expect("unable to build date");
    // println!("date: {:?}", date);
    //
    // let result = web::block(move || -> diesel::QueryResult<WeeklyInfo> {
    //     use crate::schema::weekly_info::dsl::*;
    //
    //     let mut conn = pool.get().expect("unable to get db connection from pool");
    //
    //     let results = weekly_info
    //         .filter(DayDate.eq(date))
    //         .select(WeeklyInfo::as_select())
    //         // .load(&mut conn)
    //         .first::<WeeklyInfo>(&mut conn)
    //         .expect("unable to retrieve data");
    //
    //     Ok(results)
    // })
    // .await?
    // .map_err(error::ErrorInternalServerError)?;
    //
    // Ok(HttpResponse::Ok().json(result))

    let (month, year) = params.into_inner();

    let results = web::block(move || -> diesel::QueryResult<Vec<DayData>> {
        let mut conn = pool.get().expect("unable to get pool connection!");
        // get_month_data(&mut conn, month, year)
        use crate::schema::day_data::dsl::*;

        let month = time::Month::try_from(month).expect("invalid month provided");
        let start_day =
            time::Date::from_calendar_date(year, month, 1).expect("invalid date provided");
        let end_day = time::Date::from_calendar_date(year, month, month.next().length(year))
            .expect("invalid date provided");

        // retrieve the data from the db
        let results = day_data
            // .filter(DayDate.ge(start_day))
            // .filter(DayDate.le(end_day))
            .filter(DayDate.ge(start_day).and(DayDate.le(end_day)))
            .select(DayData::as_select())
            .load(&mut conn)
            .expect("unable to retrieve data");

        Ok(results)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    for r in &results {
        println!("Date: {}", r.DayDate);
    }

    Ok(HttpResponse::Ok().json(results))
    // Ok(HttpResponse::Ok())
}

async fn get_month_data(
    conn: &mut SqliteConnection,
    month: u8,
    year: i32,
) -> diesel::QueryResult<Vec<DayData>> {
    use crate::schema::day_data::dsl::*;

    let month = time::Month::try_from(month).expect("invalid month provided");
    let start_day = time::Date::from_calendar_date(year, month, 1).expect("invalid date provided");
    let end_day = time::Date::from_calendar_date(year, month, month.next().length(year))
        .expect("invalid date provided");

    // retrieve the data from the db
    let results = day_data
        // .filter(DayDate.ge(start_day))
        // .filter(DayDate.le(end_day))
        .filter(DayDate.ge(start_day).and(DayDate.le(end_day)))
        .select(DayData::as_select())
        .load(conn)
        .expect("unable to retrieve data");

    Ok(results)
}
