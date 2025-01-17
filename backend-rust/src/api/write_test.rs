#![allow(non_snake_case)]
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use diesel::prelude::*;
use diesel::SqliteConnection;
use serde::{Deserialize, Serialize};

use crate::api::{DbError, DbPool};
use crate::models::*;
use crate::schema::day_data;

#[get("/api/write_test")]
async fn write_test_handler(pool: web::Data<DbPool>) -> actix_web::Result<impl Responder> {
    web::block(move || {
        use crate::schema::day_data::dsl::*;

        let mut conn = pool.get().expect("unable to get pool");

        let mut dd = DayDataInsert::new(
            time::Date::from_calendar_date(2025, time::Month::February, 2)
                .expect("invalid write test date"),
        );

        dd.NetSales = 1234.56;

        println!("inserting into db");
        diesel::insert_into(day_data)
            .values(&dd)
            .execute(&mut conn)
            .expect("unable to save write test");
    })
    .await?;
    // .map_err(error::ErrorInternalServerError)?;

    println!("[write_test] done");
    Ok(HttpResponse::Ok())
}
