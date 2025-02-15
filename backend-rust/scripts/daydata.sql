-- copy over the day data data from the old table to the new one
-- Run on the original database to prepare to copy over
-- CREATE TABLE IF NOT EXISTS day_data (
--   id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
-- 
--   DayDate DATE NOT NULL,
-- 
--   CashDeposit REAL NOT NULL,
--   DebitCard REAL NOT NULL,
--   MasterCard REAL NOT NULL,
--   Visa REAL NOT NULL,
--   Amex REAL NOT NULL,
-- 
--   CreditSales REAL NOT NULL,
--   GiftCardRedeem REAL NOT NULL,
--   SubwayCaters REAL NOT NULL,
--   PayPal REAL NOT NULL,
--   SkipTheDishes REAL NOT NULL,
--   DoorDash REAL NOT NULL,
--   UberEats REAL NOT NULL,
--   PettyCash REAL NOT NULL,
-- 
--   Tips REAL NOT NULL,
--   Hst REAL NOT NULL,
--   BottleDeposit REAL NOT NULL,
--   NetSales REAL NOT NULL,
--   CreditSalesRedeemed REAL NOT NULL,
--   CreditSalesRedeemed2 REAL NOT NULL,
--   CreditFood REAL NOT NULL,
--   GiftCardSold REAL NOT NULL,
-- 
--   USFunds REAL NOT NULL,
--  
--   
--   WeeklyAverage REAL NOT NULL,
--   
--   CommentData TEXT
-- );

-- make sure all fields have a value (NOT NULL is for all items)
UPDATE day_data SET CashDeposit=0 WHERE CashDeposit IS NULL;
UPDATE day_data SET DebitCard=0 WHERE DebitCard IS NULL;
UPDATE day_data SET MasterCard=0 WHERE MasterCard IS NULL;
UPDATE day_data SET Visa=0 WHERE Visa IS NULL;
UPDATE day_data SET Amex=0 WHERE Amex IS NULL;
UPDATE day_data SET CreditSales=0 WHERE CreditSales IS NULL;
UPDATE day_data SET GiftCardRedeem=0 WHERE GiftCardRedeem IS NULL;
UPDATE day_data SET SubwayCaters=0 WHERE SubwayCaters IS NULL;
UPDATE day_data SET PayPal=0 WHERE PayPal IS NULL;
UPDATE day_data SET SkipTheDishes=0 WHERE SkipTheDishes IS NULL;
UPDATE day_data SET DoorDash=0 WHERE DoorDash IS NULL;
UPDATE day_data SET UberEats=0 WHERE UberEats IS NULL;
UPDATE day_data SET PettyCash=0 WHERE PettyCash IS NULL;
UPDATE day_data SET Tips=0 WHERE Tips IS NULL;
UPDATE day_data SET HST=0 WHERE HST IS NULL;
UPDATE day_data SET BottleDeposit=0 WHERE BottleDeposit IS NULL;
UPDATE day_data SET NetSales=0 WHERE NetSales IS NULL;
UPDATE day_data SET CreditSalesRedeemed=0 WHERE CreditSalesRedeemed IS NULL;
UPDATE day_data SET CreditSalesRedeemed2=0 WHERE CreditSalesRedeemed2 IS NULL;
UPDATE day_data SET CreditFood=0 WHERE CreditFood IS NULL;
UPDATE day_data SET GiftCardSold=0 WHERE GiftCardSold IS NULL;
UPDATE day_data SET USFunds=0 WHERE USFunds IS NULL;

-- update the date field to strip off the useless time component
UPDATE day_data set Date=substr(Date,0,11);

-- attach to new db and copy everything over
ATTACH DATABASE 'db.db' AS db;

-- Copy main data over
INSERT INTO db.day_data (
  id, DayDate,CashDeposit,DebitCard,MasterCard,Visa,Amex,CreditSales,GiftCardRedeem,SubwayCaters,PayPal,
  SkipTheDishes,DoorDash,UberEats,PettyCash,Tips,Hst,BottleDeposit,NetSales,CreditSalesRedeemed,
  CreditFood,GiftCardSold,USFunds,CommentData,
  HoursWorked,Productivity,Factor,AdjustedSales,CustomerCount,BreadCredits,BreadOverShort
)
SELECT 
  id, Date,CashDeposit,DebitCard,MasterCard,Visa,Amex,CreditSales,GiftCardRedeem,SubwayCaters,PayPal,
  SkipTheDishes,DoorDash,UberEats,PettyCash,Tips,Hst,BottleDeposit,NetSales,CreditSalesRedeemed+
  CreditSalesRedeemed,CreditFood,GiftCardSold,USFunds,Comment,
  HoursWorked,Productivity,Factor,AdjustedSales,CustomerCount,BreadCredits,BreadOverShort
FROM day_data;

-- copy tag data over
INSERT INTO db.tag_list (id, Tag) SELECT id, Tag FROM tag_lists;
INSERT INTO db.tag_data (id, DayID, TagID) SELECT id,DayID,TagID FROM tag_data;
