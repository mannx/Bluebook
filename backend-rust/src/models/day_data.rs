#![allow(non_snake_case)]
use chrono::NaiveDate;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::day_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize, Deserialize, Clone)]
pub struct DayData {
    pub id: i32,
    pub DayDate: NaiveDate,
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

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::tag_list)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TagList {
    pub id: i32,
    pub Tag: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name=crate::schema::tag_list)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TagListInsert {
    pub Tag: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::tag_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[allow(dead_code)]
pub struct TagData {
    pub id: i32,
    pub TagID: i32,
    pub DayID: i32,
}

#[derive(Insertable)]
#[diesel(table_name=crate::schema::tag_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TagDataInsert {
    pub TagID: i32,
    pub DayID: i32,
}

///
/// Have a 2nd copy identical to DayData except for missing id, to allow for
/// autoincrememintg id.  any other fields that don't need to get inserted
/// can also be removed from this struct
///
#[derive(Insertable)]
#[diesel(table_name=crate::schema::day_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize, Deserialize, Clone)]
pub struct DayDataInsert {
    pub DayDate: NaiveDate,
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
    pub fn new(date: chrono::NaiveDate) -> Self {
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

impl DayDataInsert {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
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

    // create an insertable entry from the main entry
    pub fn from(data: &DayData) -> Self {
        Self {
            DayDate: data.DayDate,
            CashDeposit: data.CashDeposit,
            DebitCard: data.DebitCard,
            MasterCard: data.MasterCard,
            Visa: data.Visa,
            Amex: data.Amex,
            CreditSales: data.CreditSales,
            GiftCardRedeem: data.GiftCardRedeem,
            SubwayCaters: data.SubwayCaters,
            PayPal: data.PayPal,
            SkipTheDishes: data.SkipTheDishes,
            DoorDash: data.DoorDash,
            UberEats: data.UberEats,
            PettyCash: data.PettyCash,
            Tips: data.Tips,
            Hst: data.Hst,
            BottleDeposit: data.BottleDeposit,
            NetSales: data.NetSales,
            CreditSalesRedeemed: data.CreditSalesRedeemed,
            CreditFood: data.CreditFood,
            GiftCardSold: data.GiftCardSold,
            USFunds: data.USFunds,
            WeeklyAverage: data.WeeklyAverage,
            CommentData: data.CommentData.clone(),
            HoursWorked: data.HoursWorked,
            Productivity: data.Productivity,
            Factor: data.Factor,
            AdjustedSales: data.AdjustedSales,
            CustomerCount: data.CustomerCount,
            BreadCredits: data.BreadCredits,
            BreadOverShort: data.BreadOverShort,
        }
    }
}
