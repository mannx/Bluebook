use actix_web::{middleware::Logger, App, HttpServer};
use env_logger::Env;

mod env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    let env = env::Environment::default();

    HttpServer::new(|| {
        App::new()
            // .app_data(web::Data::new(AppState {
            //     app_name: String::from("actix demo"),
            // }))
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .service(actix_files::Files::new("/", "./frontend/dist/").index_file("index.html"))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
