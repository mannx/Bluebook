#![allow(non_snake_case)]
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::result::Error;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, AsChangeset)]
#[diesel(table_name=crate::schema::day_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize, Deserialize, Clone)]
pub struct DayData {
    pub id: i32,

    // Debit Side
    pub DayDate: NaiveDate,
    pub CashDeposit: i32,
    pub DebitCard: i32,
    pub MasterCard: i32,
    pub Visa: i32,
    pub Amex: i32,
    pub CreditSales: i32,
    pub GiftCardRedeem: i32,
    pub SubwayCaters: i32,
    pub PayPal: i32,
    pub SkipTheDishes: i32,
    pub DoorDash: i32,
    pub UberEats: i32,
    pub PettyCash: i32,

    // Credit Side
    pub Tips: i32,
    pub Hst: i32,
    pub BottleDeposit: i32,
    pub NetSales: i32,
    pub CreditSalesRedeemed: i32,
    pub CreditFood: i32,
    pub GiftCardSold: i32,
    pub USFunds: i32,
    pub CommentData: Option<String>,

    // Control Sheet
    pub HoursWorked: i32,
    pub Productivity: i32,
    pub Factor: i32,
    pub AdjustedSales: i32,
    pub CustomerCount: i32,
    pub BreadCredits: i32,
    pub BreadOverShort: i32,
}

///
/// Have a 2nd copy identical to DayData except for missing id, to allow for
/// autoincrememintg id.  any other fields that don't need to get inserted
/// can also be removed from this struct
///
#[derive(Insertable)]
#[diesel(table_name=crate::schema::day_data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct DayDataInsert {
    pub DayDate: NaiveDate,
    pub CashDeposit: i32,
    pub DebitCard: i32,
    pub MasterCard: i32,
    pub Visa: i32,
    pub Amex: i32,
    pub CreditSales: i32,
    pub GiftCardRedeem: i32,
    pub SubwayCaters: i32,
    pub PayPal: i32,
    pub SkipTheDishes: i32,
    pub DoorDash: i32,
    pub UberEats: i32,
    pub PettyCash: i32,
    pub Tips: i32,
    pub Hst: i32,
    pub BottleDeposit: i32,
    pub NetSales: i32,
    pub CreditSalesRedeemed: i32,
    pub CreditFood: i32,
    pub GiftCardSold: i32,
    pub USFunds: i32,
    pub CommentData: Option<String>,
    pub HoursWorked: i32,
    pub Productivity: i32,
    pub Factor: i32,
    pub AdjustedSales: i32,
    pub CustomerCount: i32,
    pub BreadCredits: i32,
    pub BreadOverShort: i32,
}

impl DayData {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
            id: -1,
            DayDate: date,
            CashDeposit: 0,
            DebitCard: 0,
            MasterCard: 0,
            Visa: 0,
            Amex: 0,
            CreditSales: 0,
            GiftCardRedeem: 0,
            SubwayCaters: 0,
            PayPal: 0,
            SkipTheDishes: 0,
            DoorDash: 0,
            UberEats: 0,
            PettyCash: 0,
            Tips: 0,
            Hst: 0,
            BottleDeposit: 0,
            NetSales: 0,
            CreditSalesRedeemed: 0,
            CreditFood: 0,
            GiftCardSold: 0,
            USFunds: 0,
            CommentData: None,
            HoursWorked: 0,
            Productivity: 0,
            Factor: 0,
            AdjustedSales: 0,
            CustomerCount: 0,
            BreadCredits: 0,
            BreadOverShort: 0,
        }
    }

    // copy controlsheet data from one object to this one
    // used before updating after a daily sheet import
    pub fn copy_control(&mut self, data: &DayData) {
        self.HoursWorked = data.HoursWorked;
        self.Productivity = data.Productivity;
        self.Factor = data.Factor;
        self.AdjustedSales = data.AdjustedSales;
        self.CustomerCount = data.CustomerCount;
        self.BreadCredits = data.BreadCredits;
        self.BreadOverShort = data.BreadOverShort;
    }

    pub fn insert_or_update(&self, conn: &mut SqliteConnection) -> Result<(), Error> {
        // if data.id == -1, we insert, otherwise we update
        if self.id == -1 {
            // insert
            let data_insert = DayDataInsert::from(self);

            diesel::insert_into(crate::schema::day_data::table)
                .values(&data_insert)
                .execute(conn)?;
        } else {
            // update
            use crate::schema::day_data::dsl::*;

            diesel::update(crate::schema::day_data::table)
                .filter(id.eq(self.id)) // make sure to only update the record we are
                .set(self)
                .execute(conn)?;
        }
        Ok(())
    }
}

impl DayDataInsert {
    pub fn new(date: chrono::NaiveDate) -> Self {
        Self {
            DayDate: date,
            CashDeposit: 0,
            DebitCard: 0,
            MasterCard: 0,
            Visa: 0,
            Amex: 0,
            CreditSales: 0,
            GiftCardRedeem: 0,
            SubwayCaters: 0,
            PayPal: 0,
            SkipTheDishes: 0,
            DoorDash: 0,
            UberEats: 0,
            PettyCash: 0,
            Tips: 0,
            Hst: 0,
            BottleDeposit: 0,
            NetSales: 0,
            CreditSalesRedeemed: 0,
            CreditFood: 0,
            GiftCardSold: 0,
            USFunds: 0,
            CommentData: None,
            HoursWorked: 0,
            Productivity: 0,
            Factor: 0,
            AdjustedSales: 0,
            CustomerCount: 0,
            BreadCredits: 0,
            BreadOverShort: 0,
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
