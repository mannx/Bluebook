use actix_cors::Cors;
use actix_web::dev::ServiceResponse;
use actix_web::{middleware::Logger, web, App, HttpServer};
use diesel::r2d2;
use diesel::sqlite::Sqlite;
use diesel::SqliteConnection;
use env_logger::Env;
use enviroment::Environment;
use lazy_static::lazy_static;
use log::{debug, error, info};
use std::{env, error::Error};

use crate::api::DbError;

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
        Err(e) => panic!("error unable to migrate db. Stopping.: {:?}", e),
    }

    // run tag migration only if we need to
    match env::var("BLUEBOOK_MIG_TAG") {
        Ok(_) => {
            info!("Migrating tags...");
            match migrate_tags(&mut conn) {
                Ok(_) => info!("Success."),
                Err(err) => error!("Tag Migration Failed: {err}"),
            }
        }
        Err(_) => info!("Skipping tag migration..."),
    }

    // if we have an argument given to us, we exit after running migrations
    // startup script will use this to do the db migration, then
    // exit, so data copy scripts can be ran, then we can run full
    if std::env::args().len() > 1 {
        info!("Argument provided. Exiting after database migrations.");
        return Ok(());
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
            .service(handlers::backup::get_backup_list)
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

// migrate tags from the tag_data table into the DayData table
// once we are fully running and no longer need to migrate an old db
// this can be removed along with migrate_tags_do()
fn migrate_tags(conn: &mut SqliteConnection) -> Result<(), DbError> {
    use crate::models::day_data::DayData;
    use crate::schema::day_data::dsl::*;
    use diesel::prelude::*;

    info!("Performing tag migration...");
    let results: Vec<DayData> = day_data.select(DayData::as_select()).load(conn)?;
    for r in results {
        info!("Migrating Tags for Date: {}", r.DayDate);
        match migrate_tags_do(conn, &r) {
            Ok(_) => {}
            Err(err) => {
                error!("Unable to update tags for day: {}", r.DayDate);
                error!("\t** {err}");
            }
        }
    }

    Ok(())
}

// migrate the tags for a given day
fn migrate_tags_do(
    conn: &mut SqliteConnection,
    data: &models::day_data::DayData,
) -> Result<(), DbError> {
    use crate::models::tags::TagData;
    use diesel::prelude::*;

    // retrieve any tags from tag_data associated with this id
    use crate::schema::tag_data::dsl::*;

    let tags: Vec<TagData> = tag_data
        .filter(DayID.eq(data.id))
        .select(TagData::as_select())
        .load(conn)?;

    let tlist: String = tags
        .iter()
        .map(|t| t.TagID.to_string())
        .collect::<Vec<String>>()
        .join(" ");

    if !tlist.is_empty() {
        // update the tags
        use crate::schema::day_data::dsl::*;

        info!("  Updating tag list...");
        diesel::update(day_data)
            .filter(id.eq(data.id))
            .set(Tags.eq(Some(tlist)))
            .execute(conn)?;
    }

    Ok(())
}
