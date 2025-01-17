#![allow(non_snake_case)]
use actix_web::error;
use actix_web::HttpResponse;
use actix_web::{get, web, Responder};
use diesel::prelude::*;
use diesel::SqliteConnection;
use serde::{Deserialize, Serialize};

use crate::api::{DbError, DbPool};
use crate::models::hockey::HockeySchedule;
use crate::models::prelude::*;

#[derive(Serialize, Deserialize)]
struct EndOfWeek {
    NetSales: f32,
    CustomerCount: i32,
    ThirdPartyPercent: f32,
    ThirdPartyTotal: f32,
}

#[derive(Serialize, Deserialize)]
struct Tags {
    tag: String,
    id: i32,
}

#[derive(Serialize, Deserialize)]
struct MonthData {
    Data: DayData,
    ThirdPartyDollar: f32,
    ThirdPartyPercent: f32,
    GrossSales: f32,
    DayOfWeek: String,
    EndOfWeek: Option<EndOfWeek>,
    Tags: Vec<Tags>,

    // How last 4 week average compares to this day.
    // 1 -> Greater sales this week
    // 0 -> same sales
    // -1 -> Sales less than last week
    SalesLastWeek: i32,
    WeeklyAverage: f32, // 4 week average of this day

    // split out as DayData.DayDate gets serialized as [year, day_in_year] with no month
    Day: u8,
    Month: time::Month,
    Year: i32,
    Hockey: Option<HockeySchedule>,
}

impl MonthData {
    fn new(data: &DayData) -> Self {
        let tpd = data.SkipTheDishes + data.DoorDash + data.UberEats;
        let tpp = (tpd / data.NetSales) * 100.;

        Self {
            Data: data.clone(),
            ThirdPartyDollar: tpd,
            ThirdPartyPercent: tpp,
            GrossSales: data.NetSales + data.Hst + data.BottleDeposit,
            DayOfWeek: data.DayDate.weekday().to_string(),
            EndOfWeek: None,
            Tags: Vec::new(),
            SalesLastWeek: 0,
            WeeklyAverage: 0.,
            Day: data.DayDate.day(),
            Month: data.DayDate.month(),
            Year: data.DayDate.year(),
            Hockey: None,
        }
    }
}
#[get("/api/month/{month}/{year}")]
pub async fn get_month_view_handler(
    pool: web::Data<DbPool>,
    params: web::Path<(u8, i32)>,
) -> actix_web::Result<impl Responder> {
    let (month, year) = params.into_inner();

    let results = web::block(move || {
        let mut conn = pool.get()?;
        get_month_data(&mut conn, month, year)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(results))
}

fn get_month_data(
    conn: &mut SqliteConnection,
    month: u8,
    year: i32,
) -> Result<Vec<MonthData>, DbError> {
    use crate::schema::day_data::dsl::*;

    let month = time::Month::try_from(month).expect("invalid month provided");
    let start_day = time::Date::from_calendar_date(year, month, 1).expect("invalid date provided");
    let end_day = time::Date::from_calendar_date(year, month, month.length(year))
        .expect("invalid date provided");

    // retrieve the data from the db
    let results = day_data
        .filter(DayDate.ge(start_day).and(DayDate.le(end_day)))
        .order(DayDate)
        .select(DayData::as_select())
        .load(conn)?;

    // build the output month data and the extra calculations we need to do
    let mut data = Vec::new();

    for r in &results {
        let mut md = MonthData::new(r);

        // calculate various fields
        // calculate the week ending information if required
        if md.Data.DayDate.weekday() == time::Weekday::Tuesday {
            md.EndOfWeek = Some(calculate_week_ending(conn, &md.Data)?);
        }

        md.WeeklyAverage = calculate_weekly_average(conn, r.DayDate)?;
        if r.NetSales > md.WeeklyAverage {
            md.SalesLastWeek = 1;
        } else if r.NetSales < md.WeeklyAverage {
            md.SalesLastWeek = -1;
        } else {
            md.SalesLastWeek = 0;
        }

        // get any tags
        md.Tags = get_tags(conn, r.id)?;

        // get hockey schedule information if any
        md.Hockey = get_hockey_data(conn, r.DayDate).ok();

        data.push(md);
    }

    // do we have missing days to pad out?
    if data.len() != month.length(year) as usize {
        let missing = month.length(year) as usize - data.len();
        let date = match data.last() {
            None => {
                // no entries for the month, set date to end of previous month
                time::Date::from_calendar_date(year, month, month.length(year))?
                    .saturating_add(time::Duration::days(1))
            }
            Some(date) => date.Data.DayDate,
        };

        for i in 0..missing {
            let new_date = date.saturating_add(time::Duration::days((i + 1) as i64));
            data.push(MonthData::new(&DayData::new(new_date)));
        }
    }

    Ok(data)
}

fn calculate_week_ending(
    conn: &mut SqliteConnection,
    data: &DayData,
) -> Result<EndOfWeek, DbError> {
    use crate::schema::day_data::dsl::*;

    // get the previous 7 days
    let start_date = data.DayDate.saturating_sub(time::Duration::days(6));

    let results: Vec<DayData> = day_data
        .filter(DayDate.ge(start_date).and(DayDate.le(data.DayDate)))
        .select(DayData::as_select())
        .load(conn)?;

    let gross = results
        .iter()
        .map(|x| x.NetSales + x.Hst + x.BottleDeposit)
        .sum::<f32>();
    let net = results.iter().map(|x| x.NetSales).sum::<f32>();
    let tpt = results
        .iter()
        .map(|x| x.SkipTheDishes + x.DoorDash + x.UberEats)
        .sum::<f32>();
    let customer_count = results.iter().map(|x| x.CustomerCount).sum::<i32>();

    let tpp = (tpt / gross) * 100.;

    Ok(EndOfWeek {
        NetSales: net,
        ThirdPartyTotal: tpt,
        ThirdPartyPercent: tpp,
        CustomerCount: customer_count,
    })
}

/// Calculates the weekly average of the past 4 weeks to compare to this one
/// TODO: have number of weeks a changable setting?
fn calculate_weekly_average(conn: &mut SqliteConnection, date: time::Date) -> Result<f32, DbError> {
    use crate::schema::day_data::dsl::*;

    let start_date = date.saturating_sub(time::Duration::weeks(4));

    let results: Vec<DayData> = day_data
        .filter(DayDate.ge(start_date).and(DayDate.le(date)))
        .order(DayDate)
        .select(DayData::as_select())
        .load(conn)?;

    let mut total = 0.;
    for r in &results {
        // ignore all but the same day
        if r.DayDate.weekday() == date.weekday() {
            total += r.NetSales;
        }
    }

    Ok(total / 4.)
}

// get all tags for a given day based on id
fn get_tags(conn: &mut SqliteConnection, day_id: i32) -> Result<Vec<Tags>, DbError> {
    use crate::schema::tag_data::dsl::*;

    // retrieve all tags for this day
    let mut tags = Vec::new();

    // retrieve the list of all the tags for this day
    let data: Vec<TagData> = tag_data
        .filter(DayID.eq(day_id))
        .select(TagData::as_select())
        .load(conn)?;

    // look up the tag
    for d in &data {
        // find better way to do this
        use crate::schema::tag_list::dsl::*;

        let taglist: Vec<TagList> = tag_list
            .filter(id.eq(d.TagID))
            .select(TagList::as_select())
            .load(conn)?;
        for t in taglist {
            tags.push(Tags {
                id: t.id,
                tag: t.Tag.unwrap_or_else(|| "".to_owned()),
            });
        }
    }

    Ok(tags)
}

fn get_hockey_data(
    conn: &mut SqliteConnection,
    date: time::Date,
) -> Result<HockeySchedule, DbError> {
    use crate::schema::hockey_schedule::dsl::*;

    let result = hockey_schedule
        .filter(DayDate.eq(date))
        .first::<HockeySchedule>(conn)?;

    Ok(result)
}
