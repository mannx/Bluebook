use actix_web::HttpResponse;
use actix_web::{post, web, Responder};
use log::info;

use crate::api::error::ApiReturnMessage;
use crate::api::export::{export_weekly, WeeklyParams};
use crate::api::DbPool;

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
        let _path = match export_weekly(&mut conn, &data) {
            Ok(path) => path,
            Err(err) => return ApiReturnMessage::<String>::error(format!("Error: {err}").as_str()),
        };

        ApiReturnMessage::<String>::ok("Export Success".to_owned())
    })
    .await?;

    Ok(HttpResponse::Ok().json(result))
}
