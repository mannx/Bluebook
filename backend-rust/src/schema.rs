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
        WeekEnding -> Date,
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
    auv_data,
    day_data,
    hockey_schedule,
    settings,
    tag_data,
    tag_list,
    weekly_info,
);
