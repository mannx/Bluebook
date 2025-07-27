#![allow(non_snake_case)]
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::result::Error;
use serde::Serialize;

#[derive(Queryable, Selectable, AsChangeset)]
#[diesel(table_name=crate::schema::weekly_info)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize)]
pub struct WeeklyInfo {
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

impl WeeklyInfo {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
            id: -1,
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

    pub fn from(data: &WeeklyInfo) -> Self {
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
