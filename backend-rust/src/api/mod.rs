pub mod month;
pub mod weekly;

// pub mod write_test;

use diesel::prelude::*;

type DbPool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<SqliteConnection>>;
type DbError = Box<dyn std::error::Error + Send + Sync>;
