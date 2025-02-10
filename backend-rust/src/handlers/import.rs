#![allow(non_snake_case)]
use crate::api::error::ApiReturnMessage;
use crate::ENVIRONMENT;
use actix_web::HttpResponse;
use actix_web::{get, post, web, Responder};
use log::{debug, error};

use glob::glob;
use serde::Serialize;
use std::path::PathBuf;

use crate::api::DbPool;

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
    debug!("[import_daily]");

    for f in data.iter() {
        // debug!("file: {f}");
        crate::imports::daily::daily_import(f);
    }

    Ok(HttpResponse::Ok())
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
    let mut base_dir = PathBuf::from(&ENVIRONMENT.ImportPath);
    base_dir.push(mask);

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
