#![allow(non_snake_case)]
use crate::api::error::ApiReturnMessage;
use crate::imports::control::import_control_sheet;
use crate::imports::daily::daily_import;
use crate::imports::wisr::import_wisr_sheet;
use crate::imports::ImportResult;
use crate::ENVIRONMENT;
use actix_web::{error, HttpResponse};
use actix_web::{get, post, web, Responder};
use diesel::SqliteConnection;
use log::error;

use glob::glob;
use serde::Serialize;

use crate::api::{DbError, DbPool};

#[derive(Serialize)]
struct ImportFileList {
    pub Daily: Vec<String>,
    pub Control: Vec<String>,
    pub Wisr: Vec<String>,
}

impl ImportFileList {
    fn new(daily: Vec<String>, control: Vec<String>, wisr: Vec<String>) -> Self {
        Self {
            Daily: daily,
            Control: control,
            Wisr: wisr,
        }
    }
}

#[get("/api2/import/list")]
pub async fn import_list() -> actix_web::Result<impl Responder> {
    // return a combined list of all files that can be imported from the import directory

    // get all files or return an error if occured
    let files = get_file_list();
    let res = match files {
        Err(e) => {
            error!("Error occurred getting import file list: {e}");
            ApiReturnMessage::<ImportFileList>::error("unable to get files")
        }
        Ok(f) => ApiReturnMessage::<ImportFileList>::ok(f),
    };

    Ok(HttpResponse::Ok().json(res))
}

#[post("/api/import/daily")]
pub async fn import_daily(
    pool: web::Data<DbPool>,
    data: web::Json<Vec<String>>,
) -> actix_web::Result<impl Responder> {
    let mut messages: ImportResult = web::block(move || {
        let mut conn = pool.get()?;
        do_import_daily(&mut conn, &data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    messages.add("Import Complete".to_owned());

    Ok(HttpResponse::Ok().json(messages))
}

#[post("/api/import/control")]
pub async fn import_control(
    pool: web::Data<DbPool>,
    data: web::Json<Vec<String>>,
) -> actix_web::Result<impl Responder> {
    let mut messages: ImportResult = web::block(move || {
        let mut conn = pool.get()?;
        do_import_control(&mut conn, &data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    messages.add("Import Complete".to_owned());

    Ok(HttpResponse::Ok().json(messages))
}

#[post("/api/import/wisr")]
pub async fn import_wisr(
    pool: web::Data<DbPool>,
    data: web::Json<Vec<String>>,
) -> actix_web::Result<impl Responder> {
    let mut messages: ImportResult = web::block(move || {
        let mut conn = pool.get()?;

        do_wisr_import(&mut conn, &data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    messages.add("Wisr Import Complete".to_owned());

    Ok(HttpResponse::Ok().json(messages))
}

fn do_import_daily(conn: &mut SqliteConnection, data: &[String]) -> Result<ImportResult, DbError> {
    let mut msg = ImportResult::new();

    for f in data.iter() {
        // try to import the given file
        let mut res = daily_import(conn, f);
        msg.combine(&mut res);
    }

    Ok(msg)
}

fn do_import_control(
    conn: &mut SqliteConnection,
    data: &[String],
) -> Result<ImportResult, DbError> {
    let mut msg = ImportResult::new();

    for f in data.iter() {
        let mut res = import_control_sheet(conn, f);
        msg.combine(&mut res);
    }

    Ok(msg)
}

fn do_wisr_import(conn: &mut SqliteConnection, data: &[String]) -> Result<ImportResult, DbError> {
    let mut msg = ImportResult::new();

    for f in data.iter() {
        let mut res = import_wisr_sheet(conn, f);
        msg.combine(&mut res);
    }

    Ok(msg)
}

// get the list of files possible to import to the db
fn get_file_list() -> std::io::Result<ImportFileList> {
    let daily = get_files("*.xlsx")?;
    let control = get_files("ControlSheetReport_*.pdf")?;
    let wisr = get_files("WISRReport_*.pdf")?;

    Ok(ImportFileList::new(daily, control, wisr))
}

// get all files from the BLUEBOOK_IMPORT_DIR using the given file mask
fn get_files(mask: &str) -> std::io::Result<Vec<String>> {
    let base_dir = ENVIRONMENT.with_import_path(mask);

    let glob_path = match base_dir.to_str() {
        None => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Invalid path",
            ))
        }
        Some(p) => p,
    };

    let mut files = Vec::new();

    for e in glob(glob_path).unwrap().flatten() {
        let fname = e.as_path().file_name().unwrap().to_str().unwrap();
        files.push(fname.to_owned());
    }

    Ok(files)
}
