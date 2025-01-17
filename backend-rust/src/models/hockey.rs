#![allow(non_snake_case)]
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

// -- type HockeySchedule struct {
// -- 	gorm.Model
// --
// -- 	Date       datatypes.Date
// -- 	Away       string
// -- 	Home       string
// -- 	GFAway     uint
// -- 	GFHome     uint
// -- 	Attendance uint
// -- 	Arena      string
// --
// -- 	Valid bool `gorm:"-"` // true if we have an entry, false if no data was found for this day.  not stored in db.
// -- 	// find better option than checking for zero'd struct?
// -- 	HomeGame  bool   `gorm:"-"` // true if this is a home game for a set home team (used to simplify frontend logic)
// -- 	HomeImage string // url of image to use for this team
// -- 	AwayImage string // url of image to use for this team
// -- }

#[derive(Queryable, Selectable)]
#[diesel(table_name=crate::schema::hockey_schedule)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Serialize, Deserialize, Clone)]
pub struct HockeySchedule {
    pub id: i32,
    pub DayDate: time::Date,
    pub Away: String,
    pub Home: String,
    pub GFAway: i32,
    pub GFHome: i32,
    pub Attendance: i32,
    pub Arena: String,
    pub HomeImage: String,
    pub AwayImage: String,
}
