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
    pub DayDate: NaiveDate,
    // pub BreadCount: i32,
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
#[derive(Serialize)]
pub struct WeeklyInfoInsert {
    pub DayDate: NaiveDate,
    // pub BreadCount: i32,
    pub FoodCostAmount: f32,
    pub FoodCostPercent: f32,

    pub LabourCostAmount: f32,
    pub LabourCostPercent: f32,

    pub NetSales: f32,

    pub PartySales: f32,
    pub Productivity: f32,
}

impl WeeklyInfo {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
            id: -1,
            DayDate: date,
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
            diesel::update(crate::schema::weekly_info::table)
                .set(self)
                .execute(conn)?;
        }

        Ok(())
    }
}

impl WeeklyInfoInsert {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
            DayDate: date,
            FoodCostAmount: 0.,
            FoodCostPercent: 0.,
            LabourCostAmount: 0.,
            LabourCostPercent: 0.,
            NetSales: 0.,
            PartySales: 0.,
            Productivity: 0.,
        }
    }

    pub fn from(data: &WeeklyInfo) -> Self {
        Self {
            DayDate: data.DayDate,
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
