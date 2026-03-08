#![allow(non_snake_case)]
use std::ffi::OsString;

use crate::api::drive::fetch_file_for_import;
use crate::api::drive::{get_control_wisr, get_credentials, get_recent_sheets};
use crate::api::error::ApiReturnMessage;
use crate::api::settings::read_settings;
use crate::api::{DbError, DbPool};
use crate::imports::control::import_control_sheet;
use crate::imports::daily::daily_import;
use crate::imports::wisr::import_wisr_sheet;
use crate::imports::ImportResult;
use crate::ENVIRONMENT;

use actix_web::{error, HttpResponse};
use actix_web::{get, post, web, Responder};
use diesel::SqliteConnection;
use drive_v3::objects::File;
use log::{debug, error, info};
use regex::{Captures, Regex};

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
    // Control: (Location, OrigFileName, UserFacingFileName)
    pub Control: Vec<(ImportFileLocation, String, String)>,
    pub Wisr: Vec<(ImportFileLocation, String)>,
}

impl ImportFileList {
    // fn from_drive(daily: Vec<File>, control: Vec<File>, wisr: Vec<File>) -> Self {
    //     let daily = daily
    //         .iter()
    //         .map(|file| {
    //             (
    //                 ImportFileLocation::Drive(file.id.clone().unwrap()),
    //                 file.name.clone().unwrap(),
    //             )
    //         })
    //         .collect();
    //
    //     let control = control
    //         .iter()
    //         .map(|file| {
    //             (
    //                 ImportFileLocation::Drive(file.id.clone().unwrap()),
    //                 file.name.clone().unwrap(),
    //                 ImportFileList::control_filename(file.name.clone().unwrap()),
    //             )
    //         })
    //         .collect();
    //
    //     let wisr = wisr
    //         .iter()
    //         .map(|file| {
    //             (
    //                 ImportFileLocation::Drive(file.id.clone().unwrap()),
    //                 file.name.clone().unwrap(),
    //             )
    //         })
    //         .collect();
    //
    //     Self {
    //         Daily: daily,
    //         Control: control,
    //         Wisr: wisr,
    //     }
    // }

    pub fn new() -> Self {
        Self {
            Daily: Vec::new(),
            Control: Vec::new(),
            Wisr: Vec::new(),
        }
    }

    fn control_filename(file_name: String) -> String {
        // file_name should be in the form of:
        //  ControlSheetReport_NNNNN_YYYYMMDD_HHMM.pdf
        //  where   N -> Store number
        //          Y -> Year
        //          M -> Month
        //          D -> Day
        //          H -> Hour
        //          M -> Minute

        // adjust this value if we need to accomodate store number len != 5
        let store_len = 5;
        let reg_str = format!(
            r"ControlSheetReport_{}_(\d\d\d\d)(\d\d)(\d\d)_(\d\d)(\d\d)",
            "\\d".repeat(store_len)
        );
        let data = Regex::new(&reg_str).unwrap().captures(file_name.as_str());

        match data {
            None => {
                info!("Unable to extract control sheet information from file name");
                info!("  File name: {file_name}");
                info!("  Returning input file name instead.");
                file_name
            }
            Some(n) => {
                info!("extracting week ending date from control sheet file name...");
                info!("year: {}", n[1].to_owned());
                file_name
            }
        }
    }

    pub fn add_file(&mut self, file_name: OsString) {
        // check where to place based on file name
        let fstr = match file_name.into_string() {
            Err(err) => {
                error!("Unable to convert OsString into a String. skipping...");
                error!("error: {err:?}");
                return;
            }
            Ok(s) => s,
        };

        if fstr.starts_with("ControlSheetReport_") {
            debug!("Adding control sheet: {fstr}");
            self.Control.push((
                ImportFileLocation::Local,
                fstr.clone(),
                ImportFileList::control_filename(fstr.clone()),
            ));
        }

        if fstr.starts_with("WISRReport_") {
            debug!("Adding wisr file: {fstr}");
            self.Wisr.push((ImportFileLocation::Local, fstr.clone()));
        }

        // create a regex to filter out only daily sheets
        // MM-DD-YY - MM-DD-YY
        let regex = Regex::new(r"\d\d\s*-\d\d\s*-\d\d\s*-\s*\d\d\s*-\d\d\s*-\d\d\s*.xlsx")
            .expect("Unable to build regex for [get_recent_sheets]!");
        if regex.is_match(fstr.clone().as_str()) {
            // found a sheet
            debug!("Found sheet: {fstr}");
            self.Daily.push((ImportFileLocation::Local, fstr.clone()));
        }
    }
}

#[get("/api2/import/list")]
// test import list function for returning from google drive
pub async fn import_list(pool: web::Data<DbPool>) -> actix_web::Result<impl Responder> {
    // get settings to determine if we are using drive or local paths for files
    debug!("[import_list] Retrieving settings...");
    let settings: crate::models::settings::Settings = web::block(move || {
        let mut conn = pool.get()?;
        read_settings(&mut conn)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    // if settings.use_drive {
    //     debug!("use_drive: true, skipping");
    //     let msg = ApiReturnMessage::<ImportFileList>::error("Drive Not currently supported");
    //     return Ok(HttpResponse::Ok().json(msg));
    // }

    // if !settings.use_drive {
    debug!("Retrieving files from local paths");

    // iterate through the import directory for each file type we need
    let dir = std::fs::read_dir(&ENVIRONMENT.ImportPath);

    // sort files into sheets,control, or wisr based on file name
    let mut lst = ImportFileList::new();

    match dir {
        Err(e) => {
            error!("Unable to read import path: {}", ENVIRONMENT.ImportPath);
            error!("error: {e}");
        }
        Ok(n) => {
            for file in n {
                match file {
                    Err(err) => error!("Unable to handle file. error: {err}"),
                    Ok(file) => {
                        debug!("file: {file:?}");
                        lst.add_file(file.file_name());
                    }
                }
            }
        }
    }

    let ret = ApiReturnMessage::<ImportFileList>::ok(lst);
    Ok(HttpResponse::Ok().json(ret))
    // }

    // debug!("Getting list from drive...");
    //
    // // get our creds than retrieve initial lists
    // debug!("[/api2/import/list] retrieving credentials");
    //
    // let creds = match get_credentials() {
    //     Ok(n) => n,
    //     Err(err) => {
    //         error!("Unable to retrieve google drive crediantials.  Error: {err}");
    //         let msg =
    //             ApiReturnMessage::<ImportFileList>::error("Unable to retrieve drive crediantials");
    //         return Ok(HttpResponse::Ok().json(msg));
    //     }
    // };
    //
    // let files = match get_recent_sheets(&creds, MAX_IMPORT_ITEMS) {
    //     Ok(n) => n,
    //     Err(err) => {
    //         error!("Unable to retrieve recent sheets.  Error: {err}");
    //         let msg = ApiReturnMessage::<ImportFileList>::error("Unable to retriev files.");
    //         return Ok(HttpResponse::Ok().json(msg));
    //     }
    // };
    //
    // let (control, wisr) = match get_control_wisr(&creds, MAX_IMPORT_ITEMS) {
    //     Ok(n) => n,
    //     Err(err) => {
    //         error!("Unable to retrieve control and wisr sheets.  Error: {err}");
    //         let msg = ApiReturnMessage::<ImportFileList>::error(
    //             "Unable to retriev wisr & control files.",
    //         );
    //         return Ok(HttpResponse::Ok().json(msg));
    //     }
    // };
    //
    // let lst = ImportFileList::from_drive(files, control, wisr);
    // let ret = ApiReturnMessage::<ImportFileList>::ok(lst);
    // let ret = ApiReturnMessage::<ImportFileList>::error("Not yet implemented");
    // Ok(HttpResponse::Ok().json(ret))
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

// fn get_file(file: &str) -> Result<String, drive_v3::Error> {
//     let fname = match std::fs::exists(file) {
//         Ok(b) => {
//             if b {
//                 // we found the file locally
//                 file.to_owned()
//             } else {
//                 // fetch the file
//                 match fetch_file_for_import(file) {
//                     Ok(file) => file,
//                     Err(err) => {
//                         error!("Unable to retrieve file from drive.  Error: {err}");
//                         // skip this file
//                         return Err(err);
//                     }
//                 }
//             }
//         }
//         Err(e) => {
//             debug!("File not found locally. File: [{file}]. Error: {e}");
//             debug!(" Attempting to fetch from drive...");
//             // fetch the file
//             match fetch_file_for_import(file) {
//                 Ok(file) => file,
//                 Err(err) => {
//                     error!("Unable to retrieve file from drive(2).  Error: {err}");
//                     // skip this file
//                     return Err(err);
//                 }
//             }
//         }
//     };
//     Ok(fname)
// }

fn do_import_daily(conn: &mut SqliteConnection, data: &[String]) -> Result<ImportResult, DbError> {
    let mut msg = ImportResult::new();

    for f in data.iter() {
        // try to import the given file
        // NOTE: all files are currently local under ImportPath once again
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
        // debug!("Checking if file is remote...");
        //
        // let file_name = match get_file(f) {
        //     Err(err) => {
        //         error!("Skipping file {f}...Error: {err}");
        //         continue;
        //     }
        //     Ok(n) => n,
        // };

        let fname = ENVIRONMENT.with_import_path(f);
        let mut res = import_control_sheet(conn, fname);
        msg.combine(&mut res);
    }

    Ok(msg)
}

fn do_wisr_import(conn: &mut SqliteConnection, data: &[String]) -> Result<ImportResult, DbError> {
    let mut msg = ImportResult::new();

    for f in data.iter() {
        // debug!("Checking if file is remote...");
        //
        // let file_name = match get_file(f) {
        //     Err(err) => {
        //         error!("Skipping file {f}...Error: {err}");
        //         continue;
        //     }
        //     Ok(n) => n,
        // };

        let fname = ENVIRONMENT.with_import_path(f);
        let mut res = import_wisr_sheet(conn, fname);
        msg.combine(&mut res);
    }

    Ok(msg)
}
