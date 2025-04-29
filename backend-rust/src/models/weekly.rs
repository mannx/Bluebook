#![allow(non_snake_case)]
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::result::Error;
use serde::Serialize;

#[derive(Queryable, Selectable, AsChangeset)]
#[diesel(table_name=crate::schema::weekly_info)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize)]
pub struct WeeklyInfoRaw {
    pub id: i32,
    pub WeekEnding: NaiveDate,

    pub FoodCostAmount: i32,
    pub FoodCostPercent: i32,

    pub LabourCostAmount: i32,
    pub LabourCostPercent: i32,

    pub NetSales: i32,

    pub PartySales: i32,
    pub Productivity: i32,
}

pub struct WeeklyInfo {
    pub id: i32,
    pub WeekEnding: NaiveDate,

    pub FoodCostAmount: f32,
    pub FoodCostPercent: f32,

    pub LabourCostAmount: f32,
    pub LabourCostPercent: f32,

    pub NetSales: f32,

    pub PartySales: f32,
    pub Productivity: f32,
}

#[derive(Insertable)]
#[diesel(table_name=crate::schema::weekly_info)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct WeeklyInfoInsert {
    pub WeekEnding: NaiveDate,
    pub FoodCostAmount: i32,
    pub FoodCostPercent: i32,

    pub LabourCostAmount: i32,
    pub LabourCostPercent: i32,

    pub NetSales: i32,

    pub PartySales: i32,
    pub Productivity: i32,
}

impl WeeklyInfoRaw {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
            id: -1,
            WeekEnding: date,
            // BreadCount: 0,
            FoodCostAmount: 0,
            FoodCostPercent: 0,
            LabourCostAmount: 0,
            LabourCostPercent: 0,
            NetSales: 0,
            PartySales: 0,
            Productivity: 0,
        }
    }

    pub fn from(obj: &WeeklyInfo) -> Self {
        Self {
            id: obj.id,
            WeekEnding: obj.WeekEnding,
            FoodCostAmount: (obj.FoodCostAmount * 100.) as i32,
            FoodCostPercent: (obj.FoodCostPercent * 100.) as i32,
            LabourCostAmount: (obj.LabourCostAmount * 100.) as i32,
            LabourCostPercent: (obj.LabourCostPercent * 100.) as i32,
            NetSales: 0,
            PartySales: 0,
            Productivity: 0,
        }
    }

    pub fn insert_or_update(&self, conn: &mut SqliteConnection) -> Result<(), Error> {
        // if data.id == -1, we insert, otherwise we update
        if self.id == -1 {
            // insert
            let data_insert = WeeklyInfoInsert::from(self);

            diesel::insert_into(crate::schema::weekly_info::table)
                .values(&data_insert)
                .execute(conn)?;
        } else {
            // update
            use crate::schema::weekly_info::dsl::*;

            diesel::update(crate::schema::weekly_info::table)
                .filter(id.eq(self.id))
                .set(self)
                .execute(conn)?;
        }

        Ok(())
    }
}

impl WeeklyInfo {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
            id: -1,
            WeekEnding: date,
            // BreadCount: 0,
            FoodCostAmount: 0.,
            FoodCostPercent: 0.,
            LabourCostAmount: 0.,
            LabourCostPercent: 0.,
            NetSales: 0.,
            PartySales: 0.,
            Productivity: 0.,
        }
    }

    pub fn from(obj: &WeeklyInfoRaw) -> Self {
        Self {
            id: obj.id,
            WeekEnding: obj.WeekEnding,
            FoodCostAmount: (obj.FoodCostAmount as f32) / 100.,
            FoodCostPercent: (obj.FoodCostPercent as f32) / 100.,
            LabourCostAmount: (obj.LabourCostAmount as f32) / 100.,
            LabourCostPercent: (obj.LabourCostPercent as f32) / 100.,
            NetSales: (obj.NetSales as f32) / 100.,
            PartySales: (obj.PartySales as f32) / 100.,
            Productivity: (obj.Productivity as f32) / 100.,
        }
    }
    pub fn insert_or_update(&self, conn: &mut SqliteConnection) -> Result<(), Error> {
        let raw = WeeklyInfoRaw::from(self);
        raw.insert_or_update(conn)
    }
}

impl WeeklyInfoInsert {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
            WeekEnding: date,
            FoodCostAmount: 0,
            FoodCostPercent: 0,
            LabourCostAmount: 0,
            LabourCostPercent: 0,
            NetSales: 0,
            PartySales: 0,
            Productivity: 0,
        }
    }

    pub fn from(data: &WeeklyInfoRaw) -> Self {
        Self {
            WeekEnding: data.WeekEnding,
            FoodCostAmount: data.FoodCostAmount,
            FoodCostPercent: data.FoodCostPercent,
            LabourCostAmount: data.LabourCostAmount,
            LabourCostPercent: data.LabourCostPercent,
            NetSales: data.NetSales,
            PartySales: data.PartySales,
            Productivity: data.Productivity,
        }
    }
}
