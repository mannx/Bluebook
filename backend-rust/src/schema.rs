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
        WeeklyAverage -> Float,
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
    day_data_extra (id) {
        id -> Integer,
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
        BreadCount -> Integer,
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
    day_data_extra,
    tag_data,
    tag_list,
    weekly_info,
);
