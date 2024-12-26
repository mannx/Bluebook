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
    pub id: i32,
    pub Date: DateTime<Utc>,

    pub BreadCount: i32,

    pub FoodCostAmount: f64,
    pub FoodCostPercent: f64,

    pub LabourCostAmount: f64,
    pub LabourCostPercent: f64,

    pub NetSales: f64,

    pub PartySales: f64,
    pub Productivity: f64,
}
