#![allow(non_snake_case)]
use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::tag_list)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TagList {
    pub id: i32,
    pub Tag: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name=crate::schema::tag_list)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TagListInsert {
    pub Tag: Option<String>,
}

//
// TagData is only used for tag migration.
// once fully complete, this can be removed once no longer needed
//
#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::tag_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[allow(dead_code)]
pub struct TagData {
    pub id: i32,
    pub TagID: i32,
    pub DayID: i32,
}

#[derive(Insertable)]
#[diesel(table_name=crate::schema::tag_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TagDataInsert {
    pub TagID: i32,
    pub DayID: i32,
}
