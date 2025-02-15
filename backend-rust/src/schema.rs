// @generated automatically by Diesel CLI.

diesel::table! {
    day_data (id) {
        id -> Integer,
        DayDate -> Date,
        CashDeposit -> Float,
        DebitCard -> Float,
        MasterCard -> Float,
        Visa -> Float,
        Amex -> Float,
        CreditSales -> Float,
        GiftCardRedeem -> Float,
        SubwayCaters -> Float,
        PayPal -> Float,
        SkipTheDishes -> Float,
        DoorDash -> Float,
        UberEats -> Float,
        PettyCash -> Float,
        Tips -> Float,
        Hst -> Float,
        BottleDeposit -> Float,
        NetSales -> Float,
        CreditSalesRedeemed -> Float,
        CreditFood -> Float,
        GiftCardSold -> Float,
        USFunds -> Float,
        CommentData -> Nullable<Text>,
        HoursWorked -> Float,
        Productivity -> Float,
        Factor -> Float,
        AdjustedSales -> Float,
        CustomerCount -> Integer,
        BreadCredits -> Float,
        BreadOverShort -> Float,
    }
}

diesel::table! {
    hockey_schedule (id) {
        id -> Integer,
        DayDate -> Date,
        Away -> Text,
        Home -> Text,
        GFAway -> Integer,
        GFHome -> Integer,
        Attendance -> Integer,
        Arena -> Text,
        HomeImage -> Text,
        AwayImage -> Text,
    }
}

diesel::table! {
    settings (id) {
        id -> Integer,
        HockeyURL -> Nullable<Text>,
        DisplayHockeyWeekly -> Bool,
        PrintHockeyWeekly -> Bool,
        HockeyHomeTeam -> Nullable<Text>,
        ManagerName -> Nullable<Text>,
        StoreNumber -> Nullable<Text>,
    }
}

diesel::table! {
    tag_data (id) {
        id -> Integer,
        TagID -> Integer,
        DayID -> Integer,
    }
}

diesel::table! {
    tag_list (id) {
        id -> Integer,
        Tag -> Nullable<Text>,
    }
}

diesel::table! {
    weekly_info (id) {
        id -> Integer,
        DayDate -> Date,
        FoodCostAmount -> Float,
        FoodCostPercent -> Float,
        LabourCostAmount -> Float,
        LabourCostPercent -> Float,
        NetSales -> Float,
        PartySales -> Float,
        Productivity -> Float,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    day_data,
    hockey_schedule,
    settings,
    tag_data,
    tag_list,
    weekly_info,
);
