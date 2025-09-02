use actix_cors::Cors;
use actix_web::dev::ServiceResponse;
use actix_web::{middleware::Logger, web, App, HttpServer};
use diesel::r2d2;
use diesel::sqlite::Sqlite;
use diesel::SqliteConnection;
use env_logger::Env;
use enviroment::Environment;
use lazy_static::lazy_static;
use log::{debug, info};
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
    // .env is found at either current directory
    // or in /usr/share/bluebook/.env
    // change when packaging
    let env_file = ".env";

    println!("Loading .env file if present...");
    if dotenvy::from_path(env_file).is_err() {
        println!("[dotenvy] unable to load .env file.  proceeding without");
        println!("[dotenvy] filename: {env_file}");
    }

    env_logger::init_from_env(Env::default().default_filter_or("info"));
    debug!("Logger initialized");

    info!(
        "Logger level: {}",
        env::var("RUST_LOG").unwrap_or_else(|_| "RUST_LOG NOT SET".to_owned())
    );

    info!("Build Commit: {}", env!("VERGEN_GIT_SHA"));
    info!("Build branch: {}", env!("VERGEN_GIT_BRANCH"));

    let url = Environment::var("DATABASE_URL").expect("DATABASE_URL required.");
    debug!("Database URL: {url}");

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
        Err(e) => panic!("error unable to migrate db. Stopping.: {e}"),
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
            .service(handlers::settings::get_bluebook_settings)
            .service(handlers::settings::set_bluebook_settings)
            .service(handlers::day_edit::day_edit_get)
            .service(handlers::day_edit::day_edit_update)
            .service(handlers::import::import_list)
            .service(handlers::import::import_daily)
            .service(handlers::import::import_control)
            .service(handlers::import::import_wisr)
            .service(handlers::auv::get_auv_handler)
            .service(handlers::auv::set_auv_handler)
            .service(handlers::export::export_weekly_handler)
            .service(handlers::tags::get_tag_list_handler)
            .service(handlers::tags::get_tag_data_handler)
            .service(handlers::tags::migrate_tag_handler)
            .service(handlers::backup::get_backup_list)
            .service(handlers::backup::undo_backup_handler)
            .service(handlers::backup::clear_backup_handler)
            .service(handlers::about::get_about_info)
            // return the index on all other paths so react-router works
            .service(
                actix_files::Files::new("/", &ENVIRONMENT.HtmlRoot)
                    .prefer_utf8(true)
                    .index_file("index.html")
                    .default_handler(|req: actix_web::dev::ServiceRequest| {
                        let (http_req, _) = req.into_parts();

                        async {
                            let env = Environment::load();
                            let resp = actix_files::NamedFile::open(format!(
                                "{}/index.html",
                                env.HtmlRoot
                            ))?
                            .into_response(&http_req);
                            Ok(ServiceResponse::new(http_req, resp))
                        }
                    }),
            )
    })
    .bind(("0.0.0.0", 8080))?
    .workers(1) // change to slightly bigger instead of default of 16?
    .run()
    .await
}
