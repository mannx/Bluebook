use actix_cors::Cors;
use actix_web::{get, middleware::Logger, web, App, HttpServer, Responder};
use env_logger::Env;

mod db;
mod models;
mod schema;
mod tag_test;

use tag_test::tags_test;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    let _ = dotenvy::dotenv().expect("unable to read .env");
    for (key, value) in dotenvy::vars() {
        println!("{key}={value}");
    }

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
