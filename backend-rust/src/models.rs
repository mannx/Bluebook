// type WeeklyInfo struct {
// 	gorm.Model
//
// 	Date       datatypes.Date `gorm:"column:Date"`
// 	BreadCount int            `gorm:"column:BreadCount"`
//
// 	FoodCostAmount  float64 `gorm:"column:FoodCostAmount"`
// 	FoodCostPercent float64 `gorm:"column:FoodCostPercent"`
//
// 	LabourCostAmount  float64 `gorm:"column:LabourCostAmount"`
// 	LabourCostPercent float64 `gorm:"column:LabourCostPercent"`
//
// 	NetSales float64 `gorm:"column:NetSales"`
//
// 	PartySales   float64 `gorm:"column:PartySales"`
// 	Productivity float64 // total productivity for the week
// }

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
