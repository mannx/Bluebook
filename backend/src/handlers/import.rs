#![allow(non_snake_case)]
use crate::api::drive::fetch_file_for_import;
use crate::api::drive::{get_control_wisr, get_credentials, get_recent_sheets};
use crate::api::error::ApiReturnMessage;
use crate::api::{DbError, DbPool};
use crate::imports::control::import_control_sheet;
use crate::imports::daily::daily_import;
use crate::imports::wisr::import_wisr_sheet;
use crate::imports::ImportResult;

use actix_web::{error, HttpResponse};
use actix_web::{get, post, web, Responder};
use diesel::SqliteConnection;
use drive_v3::objects::File;
use log::{debug, error};

use serde::Serialize;

// max number of items we will show for each daily,control,or wisr
// TODO: put this in either app settings, environment variable
// or control on import page
const MAX_IMPORT_ITEMS: usize = 5;

#[derive(Serialize)]
#[allow(dead_code)]
enum ImportFileLocation {
    Local,         // file is on  the local system
    Drive(String), // file is on google drive.  file id is provided
}

#[derive(Serialize)]
struct ImportFileList {
    pub Daily: Vec<(ImportFileLocation, String)>,
    pub Control: Vec<(ImportFileLocation, String)>,
    pub Wisr: Vec<(ImportFileLocation, String)>,
}

impl ImportFileList {
    fn from_drive(daily: Vec<File>, control: Vec<File>, wisr: Vec<File>) -> Self {
        let daily = daily
            .iter()
            .map(|file| {
                (
                    ImportFileLocation::Drive(file.id.clone().unwrap()),
                    file.name.clone().unwrap(),
                )
            })
            .collect();

        let control = control
            .iter()
            .map(|file| {
                (
                    ImportFileLocation::Drive(file.id.clone().unwrap()),
                    file.name.clone().unwrap(),
                )
            })
            .collect();

        let wisr = wisr
            .iter()
            .map(|file| {
                (
                    ImportFileLocation::Drive(file.id.clone().unwrap()),
                    file.name.clone().unwrap(),
                )
            })
            .collect();

        Self {
            Daily: daily,
            Control: control,
            Wisr: wisr,
        }
    }
}

#[get("/api2/import/list")]
// test import list function for returning from google drive
pub async fn import_list() -> actix_web::Result<impl Responder> {
    // get our creds than retrieve initial lists
    let creds = match get_credentials() {
        Ok(n) => n,
        Err(err) => {
            error!("Unable to retrieve google drive crediantials.  Error: {err}");
            let msg =
                ApiReturnMessage::<ImportFileList>::error("Unable to retrieve drive crediantials");
            return Ok(HttpResponse::Ok().json(msg));
        }
    };

    let files = match get_recent_sheets(&creds, MAX_IMPORT_ITEMS) {
        Ok(n) => n,
        Err(err) => {
            error!("Unable to retrieve recent sheets.  Error: {err}");
            let msg = ApiReturnMessage::<ImportFileList>::error("Unable to retriev files.");
            return Ok(HttpResponse::Ok().json(msg));
        }
    };

    let (control, wisr) = match get_control_wisr(&creds, MAX_IMPORT_ITEMS) {
        Ok(n) => n,
        Err(err) => {
            error!("Unable to retrieve control and wisr sheets.  Error: {err}");
            let msg = ApiReturnMessage::<ImportFileList>::error(
                "Unable to retriev wisr & control files.",
            );
            return Ok(HttpResponse::Ok().json(msg));
        }
    };

    let lst = ImportFileList::from_drive(files, control, wisr);
    let ret = ApiReturnMessage::<ImportFileList>::ok(lst);
    Ok(HttpResponse::Ok().json(ret))
}

#[post("/api/import/daily")]
pub async fn import_daily(
    pool: web::Data<DbPool>,
    data: web::Json<Vec<String>>,
) -> actix_web::Result<impl Responder> {
    let mut messages: ImportResult = web::block(move || {
        let mut conn = pool.get()?;
        debug!("[import_daily] DUMP");
        debug!("{data:?}");

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

fn get_file(file: &str) -> Result<String, drive_v3::Error> {
    let fname = match std::fs::exists(file) {
        Ok(b) => {
            if b {
                // we found the file locally
                file.to_owned()
            } else {
                // fetch the file
                match fetch_file_for_import(file) {
                    Ok(file) => file,
                    Err(err) => {
                        error!("Unable to retrieve file from drive.  Error: {err}");
                        // skip this file
                        return Err(err);
                    }
                }
            }
        }
        Err(e) => {
            debug!("File not found locally. File: [{file}]. Error: {e}");
            debug!(" Attempting to fetch from drive...");
            // fetch the file
            match fetch_file_for_import(file) {
                Ok(file) => file,
                Err(err) => {
                    error!("Unable to retrieve file from drive(2).  Error: {err}");
                    // skip this file
                    return Err(err);
                }
            }
        }
    };
    Ok(fname)
}

fn do_import_daily(conn: &mut SqliteConnection, data: &[String]) -> Result<ImportResult, DbError> {
    let mut msg = ImportResult::new();

    for f in data.iter() {
        // try to import the given file
        debug!("Checking if file is remote...");

        let file_name = match get_file(f) {
            Err(err) => {
                error!("Skipping file {f}...Error: {err}");
                continue;
            }
            Ok(n) => n,
        };

        debug!("Performing import with filename: {file_name}");
        let mut res = daily_import(conn, &file_name);
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
        debug!("Checking if file is remote...");

        let file_name = match get_file(f) {
            Err(err) => {
                error!("Skipping file {f}...Error: {err}");
                continue;
            }
            Ok(n) => n,
        };

        debug!("Performing import with filename: {file_name}");
        let mut res = import_control_sheet(conn, &file_name);
        msg.combine(&mut res);
    }

    Ok(msg)
}

fn do_wisr_import(conn: &mut SqliteConnection, data: &[String]) -> Result<ImportResult, DbError> {
    let mut msg = ImportResult::new();

    for f in data.iter() {
        debug!("Checking if file is remote...");

        let file_name = match get_file(f) {
            Err(err) => {
                error!("Skipping file {f}...Error: {err}");
                continue;
            }
            Ok(n) => n,
        };

        debug!("Performing import with filename: {file_name}");

        let mut res = import_wisr_sheet(conn, &file_name);
        msg.combine(&mut res);
    }

    Ok(msg)
}
