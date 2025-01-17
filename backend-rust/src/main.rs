use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use diesel::r2d2;
use diesel::SqliteConnection;
use env_logger::Env;
use std::env;

mod api;
mod db;
mod models;
mod schema;
mod tag_test;

use tag_test::tags_test;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    dotenvy::dotenv().expect("unable to read .env");

    let url = env::var("DATABASE_URL").expect("DATABASE_URL required");
    let manager = r2d2::ConnectionManager::<SqliteConnection>::new(url);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("unable to build pool");

    HttpServer::new(move || {
        let cors = Cors::default().allow_any_origin().allow_any_method();

        App::new()
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(tags_test)
            .service(api::weekly::weekly_test)
            .service(api::month::get_month_view_handler)
            .service(actix_files::Files::new("/", "./dist/").index_file("index.html"))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
