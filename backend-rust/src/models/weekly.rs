#![allow(non_snake_case)]
use diesel::prelude::*;
use serde::Serialize;

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::weekly_info)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize)]
pub struct WeeklyInfo {
    pub id: i32,
    pub DayDate: time::Date,
    pub BreadCount: i32,

    pub FoodCostAmount: f32,
    pub FoodCostPercent: f32,

    pub LabourCostAmount: f32,
    pub LabourCostPercent: f32,

    pub NetSales: f32,

    pub PartySales: f32,
    pub Productivity: f32,
}
