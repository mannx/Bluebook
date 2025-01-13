#![allow(non_snake_case)]
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

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

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::day_data_extra)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize)]
pub struct DayDataExtra {
    pub id: i32,
    pub HoursWorked: f32,
    pub Productivity: f32,
    pub Factor: f32,
    pub AdjustedSales: f32,
    pub CustomerCount: i32,
    pub BreadCredits: f32,
    pub BreadOverShort: f32,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::day_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize, Deserialize, Clone)]
pub struct DayData {
    pub id: i32,
    pub DayDate: time::Date,
    pub CashDeposit: f32,
    pub DebitCard: f32,
    pub MasterCard: f32,
    pub Visa: f32,
    pub Amex: f32,
    pub CreditSales: f32,
    pub GiftCardRedeem: f32,
    pub SubwayCaters: f32,
    pub PayPal: f32,
    pub SkipTheDishes: f32,
    pub DoorDash: f32,
    pub UberEats: f32,
    pub PettyCash: f32,
    pub Tips: f32,
    pub Hst: f32,
    pub BottleDeposit: f32,
    pub NetSales: f32,
    pub CreditSalesRedeemed: f32,
    // pub CreditSalesRedeemed2: f32,
    pub CreditFood: f32,
    pub GiftCardSold: f32,
    pub USFunds: f32,
    pub WeeklyAverage: f32,
    pub CommentData: Option<String>,
    pub HoursWorked: f32,
    pub Productivity: f32,
    pub Factor: f32,
    pub AdjustedSales: f32,
    pub CustomerCount: i32,
    pub BreadCredits: f32,
    pub BreadOverShort: f32,
}

impl DayData {
    pub fn new(date: time::Date) -> Self {
        Self {
            id: 0,
            DayDate: date,
            CashDeposit: 0.,
            DebitCard: 0.,
            MasterCard: 0.,
            Visa: 0.,
            Amex: 0.,
            CreditSales: 0.,
            GiftCardRedeem: 0.,
            SubwayCaters: 0.,
            PayPal: 0.,
            SkipTheDishes: 0.,
            DoorDash: 0.,
            UberEats: 0.,
            PettyCash: 0.,
            Tips: 0.,
            Hst: 0.,
            BottleDeposit: 0.,
            NetSales: 0.,
            CreditSalesRedeemed: 0.,
            // CreditSalesRedeemed2: 0.,
            CreditFood: 0.,
            GiftCardSold: 0.,
            USFunds: 0.,
            WeeklyAverage: 0.,
            CommentData: None,
            HoursWorked: 0.,
            Productivity: 0.,
            Factor: 0.,
            AdjustedSales: 0.,
            CustomerCount: 0,
            BreadCredits: 0.,
            BreadOverShort: 0.,
        }
    }
}
