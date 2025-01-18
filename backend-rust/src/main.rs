use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use diesel::r2d2;
use diesel::sqlite::Sqlite;
use diesel::SqliteConnection;
use env_logger::Env;
use std::{env, error::Error};

mod api;
mod models;
mod schema;

const MIGRATIONS: diesel_migrations::EmbeddedMigrations = diesel_migrations::embed_migrations!();

fn run_migrations(
    conn: &mut impl diesel_migrations::MigrationHarness<Sqlite>,
) -> Result<(), Box<dyn Error + Send + Sync + 'static>> {
    conn.run_pending_migrations(MIGRATIONS)?;

    Ok(())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    // dotenvy::dotenv().expect("unable to read .env");
    println!("loading .env file if present...");
    if dotenvy::dotenv().is_err() {
        println!("[dotenvy] unable to load .env file.  proceeding without");
    }

    let url = env::var("DATABASE_URL").expect("DATABASE_URL required");
    let manager = r2d2::ConnectionManager::<SqliteConnection>::new(url);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("unable to build pool");

    // run the migrations on the database if required
    let mut conn = match pool.get() {
        Err(e) => panic!("Unable to get pool connection to migrate db! [{e}]"),
        Ok(con) => con,
    };

    match run_migrations(&mut conn) {
        Ok(_) => println!("migrations run successfully!"),
        Err(e) => println!("error unable to migrate db.: {:?}", e),
    }

    HttpServer::new(move || {
        let cors = Cors::default().allow_any_origin().allow_any_method();

        App::new()
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(api::weekly::weekly_test)
            .service(api::month::get_month_view_handler)
            .service(api::settings::get_bluebook_settings)
            .service(actix_files::Files::new("/", "./dist/").index_file("index.html"))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
