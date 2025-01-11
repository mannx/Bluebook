CREATE TABLE IF NOT EXISTS day_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,

  DayDate DATE NOT NULL,

  CashDeposit REAL NOT NULL,
  DebitCard REAL NOT NULL,
  MasterCard REAL NOT NULL,
  Visa REAL NOT NULL,
  Amex REAL NOT NULL,

  CreditSales REAL NOT NULL,
  GiftCardRedeem REAL NOT NULL,
  SubwayCaters REAL NOT NULL,
  PayPal REAL NOT NULL,
  SkipTheDishes REAL NOT NULL,
  DoorDash REAL NOT NULL,
  UberEats REAL NOT NULL,
  PettyCash REAL NOT NULL,

  Tips REAL NOT NULL,
  Hst REAL NOT NULL,
  BottleDeposit REAL NOT NULL,
  NetSales REAL NOT NULL,
  CreditSalesRedeemed REAL NOT NULL,
  CreditSalesRedeemed2 REAL NOT NULL,
  CreditFood REAL NOT NULL,
  GiftCardSold REAL NOT NULL,

  USFunds REAL NOT NULL,
 
  
  WeeklyAverage REAL NOT NULL,
  
  CommentData TEXT
);

-- Table contains information from the weekly sheets
-- split into 2nd table to avoid needing 64-column feature
CREATE TABLE IF NOT EXISTS day_data_extra (
  id INTEGER PRIMARY KEY NOT NULL,
  --
  --  Control Sheet Information
  --
  HoursWorked REAL NOT NULL,
  Productivity REAL NOT NULL,
  Factor REAL NOT NULL,
  AdjustedSales REAL NOT NULL,
  CustomerCount INTEGER NOT NULL,
  BreadCredits REAL NOT NULL,
  BreadOverShort REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS tag_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  Tag TEXT
);

CREATE TABLE IF NOT EXISTS tag_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  TagID INTEGER NOT NULL,
  DayID INTEGER NOT NULL
);
