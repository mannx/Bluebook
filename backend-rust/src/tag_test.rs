#![allow(non_snake_case)]
use actix_web::{get, web, Responder};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct TagData {
    Tag: String,
    TagCount: u32,
}

#[get("/api/tags/view")]
pub async fn tags_test() -> impl Responder {
    let tags = vec![TagData {
        Tag: String::from("tag1"),
        TagCount: 2,
    }];

    web::Json(tags)
}
