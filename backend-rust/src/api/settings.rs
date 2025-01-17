#![allow(non_snake_case)]
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use diesel::prelude::*;
use diesel::SqliteConnection;

use crate::api::{DbError, DbPool};
use crate::models::settings::Settings;

#[get("/api/settings/get")]
pub async fn get_bluebook_settings(pool: web::Data<DbPool>) -> actix_web::Result<impl Responder> {
    let results = web::block(move || {
        let mut conn = pool.get()?;
        read_settings(&mut conn)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(results))
}

fn read_settings(conn: &mut SqliteConnection) -> Result<Settings, DbError> {
    use crate::schema::settings::dsl::*;

    let result = settings.first::<Settings>(conn);
    match result {
        Err(e) => {
            println!("Error retrieving settings.  Using default values. [{}]", e);
            Ok(Settings::default())
        }
        Ok(set) => Ok(set),
    }
}
