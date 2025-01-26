#![allow(non_snake_case)]
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::SqliteConnection;
use serde::Serialize;

use crate::api::month::get_tags;
use crate::api::{DbError, DbPool};
use crate::models::day_data::DayData;

#[derive(Serialize)]
struct DayEditData {
    pub Date: NaiveDate,
    pub Comment: Option<String>,
    pub Tags: Vec<String>,
}

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

fn get_day_edit(
    conn: &mut SqliteConnection,
    day_id: i32,
    date: NaiveDate,
) -> Result<DayEditData, DbError> {
    use crate::schema::day_data::dsl::*;

    // if we have a valid id, return the data for that day
    // otherwise, return a new object set for the given day
    if day_id == 0 {
        // empty day, return new object
        Ok(DayEditData {
            Date: date,
            Comment: None,
            Tags: Vec::new(),
        })
    } else {
        // get the data
        let result: DayData = day_data.find(day_id).first::<DayData>(conn)?;

        // get the tags
        let tags = get_tags(conn, day_id)?;
        let mut tag_string = Vec::new();

        for t in tags {
            tag_string.push(t.tag);
        }

        Ok(DayEditData {
            Date: result.DayDate,
            Comment: result.CommentData,
            Tags: tag_string,
        })
    }
}
