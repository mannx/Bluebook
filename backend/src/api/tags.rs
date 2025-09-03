#![allow(non_snake_case)]
use diesel::prelude::*;
use diesel::SqliteConnection;
use log::{debug, error, info};
use serde::{Deserialize, Serialize};

use crate::api::DbError;
use crate::models::day_data::DayData;
use crate::models::tags::TagList;

// Tags is reused else where.  move to another mod with get_tags?
#[derive(Serialize, Deserialize)]
pub struct Tags {
    pub tag: String,
    pub id: i32,
}

#[derive(Serialize)]
pub struct TagInfo {
    id: i32,
    Tag: Option<String>,
    Count: i64,
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

#[derive(Serialize)]
pub struct TagData {
    Day: DayData,
    Tags: Vec<Tags>,
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

pub fn get_tag_data(conn: &mut SqliteConnection, tag_id: i32) -> Result<Vec<TagData>, DbError> {
    use crate::schema::day_data::dsl::*;

    // get this list of days that have this tag associated with it
    let results: Vec<DayData> = day_data
        .filter(Tags.like(format!("%{tag_id}%")))
        .order(DayDate)
        .select(DayData::as_select())
        .load(conn)?;

    let mut output = Vec::new();

    // for each day we have retrieve the tags linked to it
    for day in results {
        let tags = get_tags(conn, &day)?;

        output.push(TagData {
            Day: day,
            Tags: tags,
        })
    }

    Ok(output)
}

// get all tags for a given day based on id
// this is used in serveral locations
pub fn get_tags(conn: &mut SqliteConnection, day: &DayData) -> Result<Vec<Tags>, DbError> {
    // retrieve all tags for this day
    let mut tags = Vec::new();

    // retrieve the list of all the tags for this day
    let tids = match &day.Tags {
        None => return Ok(tags),
        Some(tags) => {
            debug!("[get_tags] processing tags for [{tags}]");

            if tags.is_empty() {
                debug!("tag is empty [day: {}]. returning...", day.id);
                return Ok(Vec::new());
            }

            tags.split(' ')
                .map(|x| x.parse::<i32>().unwrap())
                .collect::<Vec<i32>>()
        }
    };

    for tag_id in tids {
        // get the tag text
        use crate::schema::tag_list::dsl::*;

        let tdata: TagList = tag_list.filter(id.eq(tag_id)).first::<TagList>(conn)?;
        tags.push(Tags {
            id: tdata.id,
            tag: tdata.Tag.unwrap_or_else(|| "".to_owned()),
        });
    }

    Ok(tags)
}

// migrate tags from the tag_data table into the DayData table
// once we are fully running and no longer need to migrate an old db
// this can be removed along with migrate_tags_do()
pub fn migrate_tags(conn: &mut SqliteConnection) -> Result<Vec<String>, DbError> {
    use crate::models::day_data::DayData;
    use crate::schema::day_data::dsl::*;
    use diesel::prelude::*;

    info!("Performing tag migration...");
    let mut messages = Vec::new();
    let results: Vec<DayData> = day_data.select(DayData::as_select()).load(conn)?;

    for r in results {
        info!("Migrating Tags for Date: {}", r.DayDate);
        match migrate_tags_do(conn, &r) {
            Ok(_) => {}
            Err(err) => {
                error!("Unable to update tags for day: {}", r.DayDate);
                error!("\t** {err}");

                messages.push(format!("Unable to update tags for day: {}", r.DayDate));
                messages.push(format!("\t**{err}"));
            }
        }
    }

    messages.push("Pruning unused tags...".to_owned());
    let mut pmsg = prune_tags(conn)?;
    messages.append(&mut pmsg);

    messages.push("Migration Success".to_owned());
    Ok(messages)
}

// migrate the tags for a given day
fn migrate_tags_do(conn: &mut SqliteConnection, data: &DayData) -> Result<(), DbError> {
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

// prune off any tags that are not in use
// currently only done on tag migration, but should be linked to an
// api endpoint
fn prune_tags(conn: &mut SqliteConnection) -> Result<Vec<String>, DbError> {
    let tags = get_tag_list(conn)?;
    let mut msg = Vec::new();

    conn.transaction(|conn| {
        for t in tags {
            if t.Count == 0 {
                msg.push(format!(
                    "Pruning tag: {}",
                    t.Tag.unwrap_or("--NO TAG NAME--".to_owned())
                ));

                use crate::schema::tag_list::dsl::*;

                diesel::delete(tag_list.filter(id.eq(t.id))).execute(conn)?;
            }
        }
        diesel::result::QueryResult::Ok(())
    })?;

    Ok(msg)
}
