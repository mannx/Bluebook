package daily

// Dates is the list of cells were dates are found
var Dates = []string{"A3", "E3", "A26", "E26"}

var (
	CashDeposit    = [][]string{{"B4", "F4", "B27", "F27"}, {"B4", "F4", "B27", "F27"}}
	AmexCard       = [][]string{{"B6", "F6", "B29", "F29"}, {"B6", "F6", "B29", "F29"}}
	CreditSales    = [][]string{{"B7", "F7", "B30", "F30"}, {"B7", "F7", "B30", "F30"}}
	GiftCardRedeem = [][]string{{"B8", "F8", "B31", "F31"}, {"B8", "F8", "B31", "F31"}}
	SubwayCaters   = [][]string{{"B9", "F9", "B32", "F32"}, {"B9", "F9", "B32", "F32"}}
	SkipTheDishes  = [][]string{{"B10", "F10", "B33", "F33"}, {"B10", "F10", "B33", "F33"}}
	DoorDash       = [][]string{{"B11", "F11", "B34", "F34"}, {"B11", "F11", "B34", "F34"}}
	USCash         = [][]string{{"B12", "F12", "B35", "F35"}, {"B12", "F12", "B35", "F35"}}
	PettyCash      = [][]string{{"B13", "F13", "B36", "F36"}, {"B13", "F13", "B36", "F36"}}
)

// used to check for the word "uber"
var UberEats = [][]string{{"C12", "G12", "C35", "G35"}}

// Credit Side
var (
	Tips           = [][]string{{"C14", "G14", "C37", "G37"}, {"C14", "G14", "C37", "G37"}}
	HST            = [][]string{{"C15", "G15", "C38", "G38"}, {"C15", "G15", "C38", "G38"}}
	BottleDeposit  = [][]string{{"C16", "G16", "C39", "G39"}, {"C16", "G16", "C39", "G39"}}
	NetSales       = [][]string{{"C17", "G17", "C40", "G40"}, {"C17", "G17", "C40", "G40"}}
	CreditSalesRcv = [][]string{{"C18", "G18", "C41", "G41"}, {"C18", "G18", "C41", "G41"}}
	CreditBev      = [][]string{{"C19", "G19", "C42", "G42"}, {"C19", "G19", "C42", "G42"}}
	CreditFood     = [][]string{{"C20", "G20", "C43", "G43"}, {"C20", "G20", "C43", "G43"}}
	GiftCardSold   = [][]string{{"C21", "G21", "C44", "G44"}, {"C21", "G21", "C44", "G44"}}
)

// Debit/Visa/MC/PayPal all appear on sheet 2
var (
	DebitCard  = [][]string{{"B3", "C3", "D3", "E3"}}
	MasterCard = [][]string{{"B4", "C4", "D4", "E4"}}
	VisaCard   = [][]string{{"B5", "C5", "D5", "E5"}}
	PayPal     = [][]string{{"B6", "C6", "D6", "E6"}}
)
