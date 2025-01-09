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
use chrono::prelude::*;
use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::weekly_info)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct WeeklyInfo {
    pub id: Option<i32>,
    // pub DayDate: DateTime<Utc>,
    pub BreadCount: Option<i32>,

    pub FoodCostAmount: Option<f32>,
    pub FoodCostPercent: Option<f32>,

    pub LabourCostAmount: Option<f32>,
    pub LabourCostPercent: Option<f32>,

    pub NetSales: Option<f32>,

    pub PartySales: Option<f32>,
    pub Productivity: Option<f32>,
}
