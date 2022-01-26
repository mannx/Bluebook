package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// DayData contains the basic data for a given day
type DayData struct {
	gorm.Model

	Date datatypes.Date `gorm:"column:Date"`

	CashDeposit float64 `gorm:"column:CashDeposit"`
	DebitCard   float64 `gorm:"column:DebitCard"`
	MasterCard  float64 `gorm:"column:MasterCard"`
	Visa        float64 `gorm:"column:Visa"`
	Amex        float64 `gorm:"column:Amex"`

	CreditSales    float64 `gorm:"column:CreditSales"`
	GiftCardRedeem float64 `gorm:"column:GiftCardRedeem"`
	SubwayCaters   float64 `gorm:"column:SubwayCaters"`
	PayPal         float64 `gorm:"column:PayPal"`
	SkipTheDishes  float64 `gorm:"column:SkipTheDishes"`
	DoorDash       float64 `gorm:"column:DoorDash"`
	PettyCash      float64 `gorm:"column:PettyCash"`

	Tips                 float64 `gorm:"column:Tips"`
	HST                  float64 `gorm:"column:HST"`
	BottleDeposit        float64 `gorm:"column:BottleDeposit"`
	NetSales             float64 `gorm:"column:NetSales"`
	CreditSalesRedeemed  float64 `gorm:"column:CreditSalesRedeemed"`
	CreditSalesRedeemed2 float64 `gorm:"column:CreditSalesRedeemed2"`
	CreditFood           float64 `gorm:"column:CreditFood"`
	GiftCardSold         float64 `gorm:"column:GiftCardSold"`

	USFunds float64 `gorm:"column:USFunds"`

	//
	//	Control Sheet Information
	//

	HoursWorked    float64 `gorm:"column:HoursWorked"`
	Productivity   float64 `gorm:"column:Productivity"`
	Factor         float64 `gorm:"column:Factor"`
	AdjustedSales  float64 `gorm:"column:AdjustedSales"`
	CustomerCount  int     `gorm:"column:CustomerCount"`
	BreadCredits   float64 `gorm:"column:BreadCredits"`
	BreadOverShort float64 `gorm:"column:BreadOverShort"`

	// holds average of previous 4 weeks
	WeeklyAverage float64 `gorm:"column:WeeklyAverage"`

	Comment string `gorm:"column:Comment"` // comment for the given day
}

// TODO:
//	This structure can be removed along with any code relant on it
//	once the need to convert a django version of the db has passed
//
// Comments contains day id and the comment linked to it
type Comments struct {
	gorm.Model

	LinkedID int    `gorm:"column:LinkedID"`
	Comment  string `gorm:"column:Comment"`
}

// TagInfo simply provides a name to the given tag
type TagList struct {
	gorm.Model

	Tag string `gorm:"column:Tag"`
}

// TagData keeps track of which days have what tags
type TagData struct {
	gorm.Model

	TagID uint `gorm:"column:TagID"` // ID of the TagInfo structure for this entry
	DayID uint `gorm:"column:DayID"`
}
