#![allow(non_snake_case)]
use std::env;

use actix_web::get;
use actix_web::HttpResponse;
use actix_web::Responder;

use serde::Serialize;

use crate::api::error::ApiReturnMessage;

#[derive(Serialize)]
struct AboutInfo {
    pub Branch: String,
    pub Commit: String,
}

#[get("/api/about")]
pub async fn get_about_info() -> actix_web::Result<impl Responder> {
    let info = AboutInfo {
        Branch: env!("VERGEN_GIT_BRANCH").to_owned(),
        Commit: env!("VERGEN_GIT_SHA").to_owned(),
    };

    let result = ApiReturnMessage::<AboutInfo>::ok(info);

    Ok(HttpResponse::Ok().json(result))
}
