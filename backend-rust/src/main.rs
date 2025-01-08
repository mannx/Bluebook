use actix_cors::Cors;
use actix_web::{
    cookie::time::util::weeks_in_year, get, middleware::Logger, web, App, HttpServer, Responder,
};
use diesel::prelude::*;
use diesel::{Connection, SqliteConnection};
use env_logger::Env;
use std::env;

mod db;
mod models;
mod schema;
mod tag_test;

use tag_test::tags_test;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    dotenvy::dotenv().expect("unable to read .env");
    // let _ = dotenvy::dotenv().expect("unable to read .env");
    // for (key, value) in dotenvy::vars() {
    //     println!("{key}={value}");
    // }

    let url = env::var("DATABASE_URL").expect("DATABASE_URL required");
    let mut conn =
        SqliteConnection::establish(&url).unwrap_or_else(|_| panic!("unable to open db"));
    test_db(&mut conn);

    HttpServer::new(|| {
        let cors = Cors::default().allow_any_origin().allow_any_method();

        App::new()
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .wrap(cors)
            .service(tags_test)

        // .service(actix_files::Files::new("/", "./frontend/dist/").index_file("index.html"))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

fn test_db(conn: &mut SqliteConnection) {
    use crate::schema::weekly_info::dsl::*;

    let results = weekly_info
        .select(models::WeeklyInfo::as_select())
        .load(conn)
        .expect("error");

    for wi in results {
        println!("id: {}", wi.id);
        println!("net sales: {}", wi.NetSales);
        println!();
    }
}
