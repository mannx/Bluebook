use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;

#[allow(dead_code)]
pub fn establish_db_connection() -> SqliteConnection {
    dotenv().ok();

    let url = env::var("DATABASE_URL").expect("unable to find db url");
    SqliteConnection::establish(&url).unwrap_or_else(|_| panic!("error connecting to db"))
}
