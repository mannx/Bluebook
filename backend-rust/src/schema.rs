// @generated automatically by Diesel CLI.

diesel::table! {
    auv_data (id) {
        id -> Integer,
        month -> Integer,
        year -> Integer,
        week_1_auv -> Integer,
        week_1_hours -> Integer,
        week_1_productivity -> Float,
        week_2_auv -> Integer,
        week_2_hours -> Integer,
        week_2_productivity -> Float,
        week_3_auv -> Integer,
        week_3_hours -> Integer,
        week_3_productivity -> Float,
        week_4_auv -> Integer,
        week_4_hours -> Integer,
        week_4_productivity -> Float,
        week_5_auv -> Nullable<Integer>,
        week_5_hours -> Nullable<Integer>,
        week_5_productivity -> Nullable<Float>,
    }
}

diesel::table! {
    day_data (id) {
        id -> Integer,
        DayDate -> Date,
        CashDeposit -> Integer,
        DebitCard -> Integer,
        MasterCard -> Integer,
        Visa -> Integer,
        Amex -> Integer,
        CreditSales -> Integer,
        GiftCardRedeem -> Integer,
        SubwayCaters -> Integer,
        PayPal -> Integer,
        SkipTheDishes -> Integer,
        DoorDash -> Integer,
        UberEats -> Integer,
        PettyCash -> Integer,
        Tips -> Integer,
        Hst -> Integer,
        BottleDeposit -> Integer,
        NetSales -> Integer,
        CreditSalesRedeemed -> Integer,
        CreditFood -> Integer,
        GiftCardSold -> Integer,
        USFunds -> Integer,
        CommentData -> Nullable<Text>,
        HoursWorked -> Integer,
        Productivity -> Integer,
        Factor -> Integer,
        AdjustedSales -> Integer,
        CustomerCount -> Integer,
        BreadCredits -> Integer,
        BreadOverShort -> Integer,
        Updated -> Bool,
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
        WeekEnding -> Date,
        FoodCostAmount -> Integer,
        FoodCostPercent -> Integer,
        LabourCostAmount -> Integer,
        LabourCostPercent -> Integer,
        NetSales -> Integer,
        PartySales -> Integer,
        Productivity -> Integer,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    auv_data,
    day_data,
    hockey_schedule,
    settings,
    tag_data,
    tag_list,
    weekly_info,
);
