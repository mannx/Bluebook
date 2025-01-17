pub mod month;
pub mod settings;
pub mod weekly;

use diesel::prelude::*;

type DbPool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<SqliteConnection>>;
type DbError = Box<dyn std::error::Error + Send + Sync>;
