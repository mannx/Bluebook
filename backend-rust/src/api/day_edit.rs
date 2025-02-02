#![allow(non_snake_case)]
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, post, web, Responder};
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::result::Error::NotFound;
use diesel::SqliteConnection;
use log::error;
use serde::Deserialize;
use serde::Serialize;

use crate::api::month::get_tags;
use crate::api::{DbError, DbPool};
use crate::models::day_data::*;
use crate::models::prelude::DayDataInsert;

use crate::api::error::ApiReturnMessage;

#[derive(Serialize)]
struct DayEditData {
    pub Date: NaiveDate,
    pub Comment: Option<String>,
    pub Tags: Vec<String>,
}

#[derive(Deserialize)]
struct DayEditUpdate {
    pub Date: Option<NaiveDate>,
    pub Comment: String,
    pub Tags: String,
    pub ID: i32,
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

// updates the day.  returns the id of the DayData entry for processing tags.  None if error
fn update_day_edit(
    conn: &mut SqliteConnection,
    data: &DayEditUpdate,
) -> Result<Option<i32>, DbError> {
    use crate::schema::day_data::dsl::*;

    if data.ID == 0 {
        // we have a new entry.  populdate
        if data.Date.is_some() {
            let mut day = DayDataInsert::new(data.Date.unwrap());
            day.CommentData = Some(data.Comment.clone());

            let result: DayData = diesel::insert_into(crate::schema::day_data::table)
                .values(&day)
                .returning(DayData::as_returning())
                .get_result(conn)?;

            Ok(Some(result.id))
        } else {
            // no date provided, return an error
            Ok(None)
        }
    } else {
        // update the entry
        let result: DayData = diesel::update(day_data.find(data.ID))
            .set(CommentData.eq(Some(data.Comment.clone())))
            .returning(DayData::as_returning())
            .get_result(conn)?;

        Ok(Some(result.id))
    }
}

// splits tags and saves to the correct tables.  returns true on success, false if an error occured
fn update_tags(
    conn: &mut SqliteConnection,
    tag_id: i32,
    data: &DayEditUpdate,
) -> Result<bool, DbError> {
    // 0) remove all tag_data entries where DayId==tag_id
    // 1) split tags into singular entities
    // 2) remove the '#'
    // 3) add to the tag_list table if not found
    // 4) create a tag_data entry with the tag_list id and tag_id

    // remove all tag_data entries linked to this day
    clear_tag_data(conn, tag_id)?;

    // split and process the tag data into a vector
    let tag_rep = data.Tags.replace("#", " ");
    let tags = tag_rep.split_ascii_whitespace();

    for tag in tags.into_iter() {
        // if this tag isnt in the db, added it and get the id
        let tag_id = get_tag_id(conn, tag)?;

        // create an entry for this day and tag
        let data = TagDataInsert {
            TagID: tag_id,
            DayID: data.ID,
        };

        use crate::schema::tag_data;

        let result = diesel::insert_into(tag_data::table)
            .values(&data)
            .execute(conn);

        if let Err(e) = result {
            // log the error, but conintue on with the remaining tags
            error!("Error inserting tag: [{tag}]...contining");
            error!("{:?}", e);
        }
    }

    Ok(true)
}

// returns the id of the tag if in the databsae, otherwise adds it and returns its id
fn get_tag_id(conn: &mut SqliteConnection, tag: &str) -> Result<i32, DbError> {
    use crate::schema::tag_list::dsl::*;

    // try to find the tag
    let result = tag_list.filter(Tag.eq(tag)).first::<TagList>(conn);
    let data = match result {
        Ok(n) => n,
        Err(e) => match e {
            NotFound => add_new_tag(conn, tag),
            e => return Err(Box::new(e)),
        }?,
    };

    Ok(data.id)
}

// add a new tag to the db and return its id
fn add_new_tag(conn: &mut SqliteConnection, tag: &str) -> Result<TagList, DbError> {
    use crate::schema::tag_list;

    let data = TagListInsert {
        Tag: Some(tag.to_owned()),
    };

    // insert into db and return its id
    let result = diesel::insert_into(tag_list::table)
        .values(&data)
        .returning(TagList::as_returning())
        .get_result(conn)?;

    Ok(result)
}

// remove all tags that might be associated with the given day id
fn clear_tag_data(conn: &mut SqliteConnection, tag_id: i32) -> Result<(), DbError> {
    use crate::schema::tag_data::dsl::*;

    diesel::delete(tag_data.filter(DayID.eq(tag_id))).execute(conn)?;

    Ok(())
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
