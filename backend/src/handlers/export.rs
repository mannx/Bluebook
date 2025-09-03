use actix_web::HttpResponse;
use actix_web::{post, web, Responder};
use log::{debug, error, info};

use crate::api::drive::upload_to_drive;
use crate::api::error::ApiReturnMessage;
use crate::api::export::{export_weekly, WeeklyParams};
use crate::api::settings::read_settings;
use crate::api::DbPool;
use crate::models::settings::Settings;

#[post("/api/weekly/export")]
pub async fn export_weekly_handler(
    pool: web::Data<DbPool>,
    data: web::Json<WeeklyParams>,
) -> actix_web::Result<impl Responder> {
    let result = web::block(move || {
        let mut conn = match pool.get() {
            Ok(c) => c,
            Err(err) => {
                return ApiReturnMessage::<String>::error(
                    format!("Unable to get database connection from pool. Error: {err}").as_str(),
                );
            }
        };

        info!("Exporting weekly...");
        let path=match export_weekly(&mut conn, &data) {
            Ok(path) => {path}
            Err(err) => return ApiReturnMessage::<String>::error(format!("Error: {err}").as_str()),
        };

        // do we need to upload the file to gdrive?
        let settings = match read_settings(&mut conn){
            Ok(n)=>n,
            Err(_)=>{
                error!("[export_weekly_handler] unable to read settings. using defaults");
                Settings::default()
            }
        };

        debug!("Checking if we need to upload.  [use_drive: {}]",settings.use_drive);
        if settings.use_drive{
            // upload to gdrive
            info!("Uploading to google drive...");
            match upload_to_drive(path.as_path()){
                Ok(_)=>{},
                Err(err)=>{
                    error!("[export_weekly_handler] Failed to upload to google drive.  Error: {err}");
                    return ApiReturnMessage::<String>::error(format!("Generated weekly, but unable to upload to drive.  File found at {path:?}. Error: {err}").as_str());
                }
            }
        }

        ApiReturnMessage::<String>::ok("Export Success".to_owned())
    })
    .await?;

    Ok(HttpResponse::Ok().json(result))
}
