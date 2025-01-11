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
