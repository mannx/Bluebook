#![allow(non_snake_case)]
use chrono::NaiveDate;
use diesel::SqliteConnection;
use log::debug;
use serde::Deserialize;
use umya_spreadsheet::*;

use crate::api::settings::read_settings;
use crate::api::weekly::{get_weekly_report, WeeklyReport};
use crate::api::DbError;
use crate::models::settings::Settings;
use crate::ENVIRONMENT;

#[derive(Deserialize, Debug)]
pub struct WeeklyParams {
    week_ending: NaiveDate,
    hours: f32,
    manager: f32,
    sysco: f32,
    netsales: bool,
}

// Holds data on which cells data is outputed to on the spreadsheet
#[derive(Deserialize)]
struct Config {
    managerName: String,
    storeNumber: String,
    weekEndingCell: String,

    auvTarget: String,
    lastYearSales: String,
    netSales: String,
    upcomingSales: String,
    breadCount: String,
    foodCost: String,
    syscoCost: String,
    labourCost: String,
    customerCount: String,
    customerPrev: String,
    partySales: String,
    hoursUsed: String,
    managerHours: String,
    targetHours: String,
    gcSold: String,
    gcRedeem: String,
    prodActual: String,
    prodBudget: String,
}

impl Config {
    fn load() -> Self {
        let path = ENVIRONMENT.with_config_path("export.ron");
        let fstr = std::fs::read_to_string(path).expect("Unable to open export.ron.");
        ron::from_str::<Config>(fstr.as_str()).unwrap()
    }
}

pub fn export_weekly(conn: &mut SqliteConnection, data: &WeeklyParams) -> Result<(), DbError> {
    debug!("[export_weekly] params: {:?}", data);

    // read in the config for output locations
    let config = Config::load();

    // recalculate the weekly report so we can export it out
    debug!("Calculating weekly data...");
    let weekly = get_weekly_report(conn, data.week_ending)?;

    debug!("Retrieving settings...");
    let settings = read_settings(conn)?;

    // open weekly sheet
    let path = ENVIRONMENT.with_data_path("weekly.xlsx");

    debug!("Reading template weeekly...");
    let mut book = reader::xlsx::read(path.as_path())?;
    let sheet = book.get_sheet_mut(&0).unwrap();

    set_sheet_info(sheet, data, &config, &settings);
    set_weekly_data(sheet, data, &weekly, &config, &settings);

    // get output path
    let path = ENVIRONMENT.with_output_path(format!("{}.xlsx", data.week_ending));

    debug!("saving to output file...");
    writer::xlsx::write(&book, path.as_path())?;

    Ok(())
}

// set store number, manager name, date and any other relevent info
fn set_sheet_info(
    sheet: &mut Worksheet,
    data: &WeeklyParams,
    config: &Config,
    settings: &Settings,
) {
    let manager_name = match &settings.ManagerName {
        Some(n) => n,
        None => &("NO NAME".to_string()),
    };

    let store_number = match &settings.StoreNumber {
        Some(n) => n,
        None => &("NO STORE NUMBER".to_string()),
    };

    // set manager+store # and week ending date
    sheet
        .get_cell_mut(config.managerName.as_str())
        .set_value(manager_name);

    sheet
        .get_cell_mut(config.storeNumber.as_str())
        .set_value(store_number);

    sheet
        .get_cell_mut(config.weekEndingCell.as_str())
        .set_value(data.week_ending.to_string());
}

fn set_weekly_data(
    sheet: &mut Worksheet,
    data: &WeeklyParams,
    weekly: &WeeklyReport,
    config: &Config,
    _settings: &Settings,
) {
    // TODO: confirm returning correct value for true
    let net_sales = if data.netsales {
        weekly.NetSales
    } else {
        weekly.WisrNetSales
    };

    sheet
        .get_cell_mut(config.auvTarget.as_str())
        .set_value(weekly.TargetAUV.to_string());

    sheet
        .get_cell_mut(config.lastYearSales.as_str())
        .set_value((weekly.LastYearSales as f32 / 100.).to_string());
    sheet
        .get_cell_mut(config.netSales.as_str())
        .set_value((net_sales as f32 / 100.).to_string());

    sheet
        .get_cell_mut(config.upcomingSales.as_str())
        .set_value((weekly.UpcomingSales as f32 / 100.).to_string());
    sheet
        .get_cell_mut(config.breadCount.as_str())
        .set_value((weekly.BreadOverShort as f32/100.).to_string());
    sheet
        .get_cell_mut(config.foodCost.as_str())
        .set_value((weekly.FoodCostAmount as f32 / 100.).to_string());
    sheet
        .get_cell_mut(config.syscoCost.as_str())
        .set_value(data.sysco.to_string());
    sheet
        .get_cell_mut(config.labourCost.as_str())
        .set_value((weekly.LabourCostAmount as f32 / 100.).to_string());
    sheet
        .get_cell_mut(config.customerCount.as_str())
        .set_value(weekly.CustomerCount.to_string());
    sheet
        .get_cell_mut(config.customerPrev.as_str())
        .set_value(weekly.LastYearCustomerCount.to_string());

    sheet
        .get_cell_mut(config.partySales.as_str())
        .set_value(weekly.PartySales.to_string());
    sheet
        .get_cell_mut(config.hoursUsed.as_str())
        .set_value(data.hours.to_string());
    sheet
        .get_cell_mut(config.managerHours.as_str())
        .set_value(data.manager.to_string());
    sheet
        .get_cell_mut(config.targetHours.as_str())
        .set_value(weekly.TargetHours.to_string());
    sheet
        .get_cell_mut(config.gcSold.as_str())
        .set_value((weekly.GiftCardSold as f32 / 100.).to_string());
    sheet
        .get_cell_mut(config.gcRedeem.as_str())
        .set_value((weekly.GiftCardRedeem as f32 / 100.).to_string());
    sheet
        .get_cell_mut(config.prodBudget.as_str())
        .set_value(weekly.ProductivityBudget.to_string());
    sheet
        .get_cell_mut(config.prodActual.as_str())
        .set_value((weekly.ProductivityActual as f32 / 100.).to_string());
}
