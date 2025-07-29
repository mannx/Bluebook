CREATE TABLE IF NOT EXISTS day_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,

  DayDate DATE NOT NULL,

  CashDeposit INTEGER NOT NULL,
  DebitCard INTEGER NOT NULL,
  MasterCard INTEGER NOT NULL,
  Visa INTEGER NOT NULL,
  Amex INTEGER NOT NULL,

  RemoteOrder INTEGER NOT NULL,
  CreditSales INTEGER NOT NULL,
  GiftCardRedeem INTEGER NOT NULL,
  SubwayCaters INTEGER NOT NULL,
  PayPal INTEGER NOT NULL,
  SkipTheDishes INTEGER NOT NULL,
  DoorDash INTEGER NOT NULL,
  UberEats INTEGER NOT NULL,
  PettyCash INTEGER NOT NULL,

  Tips INTEGER NOT NULL,
  Hst INTEGER NOT NULL,
  BottleDeposit INTEGER NOT NULL,
  NetSales INTEGER NOT NULL,
  CreditSalesRedeemed INTEGER NOT NULL,
  CreditFood INTEGER NOT NULL,
  BevCredit INTEGER NOT NULL,
  GiftCardSold INTEGER NOT NULL,

  USFunds INTEGER NOT NULL,
 
  CommentData TEXT,
  HoursWorked INTEGER NOT NULL,
  Productivity INTEGER NOT NULL,
  Factor INTEGER NOT NULL,
  AdjustedSales INTEGER NOT NULL,
  CustomerCount INTEGER NOT NULL,
  BreadCredits INTEGER NOT NULL,
  BreadOverShort INTEGER NOT NULL,

  Updated BOOLEAN NOT NULL,    -- if true, ignore this row unless we are reverting import data
                      -- when updating from daily sheets, create a new row, and update 'Updated' to true
  Tags TEXT                   -- space seperated list of tags for the given day
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
