use actix_cors::Cors;
use actix_web::dev::ServiceResponse;
use actix_web::{middleware::Logger, web, App, HttpServer};
use diesel::r2d2;
use diesel::sqlite::Sqlite;
use diesel::SqliteConnection;
use env_logger::Env;
use enviroment::Environment;
use lazy_static::lazy_static;
use log::debug;
use std::{env, error::Error};

mod api;
mod enviroment;
mod handlers;
mod imports;
mod models;
mod schema;

const MIGRATIONS: diesel_migrations::EmbeddedMigrations = diesel_migrations::embed_migrations!();

lazy_static! {
    static ref ENVIRONMENT: Environment = Environment::load();
}

fn run_migrations(
    conn: &mut impl diesel_migrations::MigrationHarness<Sqlite>,
) -> Result<(), Box<dyn Error + Send + Sync + 'static>> {
    conn.run_pending_migrations(MIGRATIONS)?;

    Ok(())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("loading .env file if present...");
    if dotenvy::dotenv().is_err() {
        println!("[dotenvy] unable to load .env file.  proceeding without");
    }

    env_logger::init_from_env(Env::default().default_filter_or("info"));
    debug!("Logger initialized");

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
        // let cors = Cors::default().allow_any_origin().allow_any_method();
        let cors = Cors::permissive();

        App::new()
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(handlers::weekly::weekly_handler)
            .service(handlers::month::get_month_view_handler)
            .service(api::settings::get_bluebook_settings)
            .service(handlers::day_edit::day_edit_get)
            .service(handlers::day_edit::day_edit_update)
            .service(handlers::import::import_list)
            .service(handlers::import::import_daily)
            .service(handlers::import::import_control)
            .service(handlers::import::import_wisr)
            .service(handlers::auv::get_auv_handler)
            .service(handlers::auv::set_auv_handler)
            .service(handlers::export::export_weekly_handler)
            // return the index on all other paths so react-router works
            .service(
                actix_files::Files::new("/", "./dist/")
                    .prefer_utf8(true)
                    .index_file("index.html")
                    .default_handler(|req: actix_web::dev::ServiceRequest| {
                        let (http_req, _) = req.into_parts();

                        async {
                            let resp = actix_files::NamedFile::open("./dist/index.html")?
                                .into_response(&http_req);
                            Ok(ServiceResponse::new(http_req, resp))
                        }
                    }),
            )
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
