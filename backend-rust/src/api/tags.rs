#![allow(non_snake_case)]
use diesel::prelude::*;
use diesel::SqliteConnection;
use serde::Serialize;

use crate::api::DbError;
use crate::models::tags::TagList;

#[derive(Serialize)]
pub struct TagInfo {
    pub id: i32,
    pub Tag: Option<String>,
    pub Count: i64,
}

impl TagInfo {
    fn new(tag: &TagList) -> Self {
        Self {
            id: tag.id,
            Tag: tag.Tag.clone(),
            Count: 0,
        }
    }
}

pub fn get_tag_list(conn: &mut SqliteConnection) -> Result<Vec<TagInfo>, DbError> {
    use crate::schema::tag_list::dsl::*;

    let results = tag_list
        .order(Tag)
        .select(TagList::as_select())
        .load(conn)?;

    let mut tags = Vec::new();

    for tag in &results {
        let mut t = TagInfo::new(tag);
        t.Count = get_tag_count(conn, t.id)?;
        tags.push(t);
    }

    Ok(tags)
}

// return the number of days that have used this tag
fn get_tag_count(conn: &mut SqliteConnection, tag_id: i32) -> Result<i64, DbError> {
    use crate::schema::tag_data::dsl::*;

    let count = tag_data
        .filter(TagID.eq(tag_id))
        .count()
        .get_result::<i64>(conn)?;

    Ok(count)
}
