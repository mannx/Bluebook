// @generated automatically by Diesel CLI.

diesel::table! {
    weekly_info (id) {
        id -> Nullable<Integer>,
        Date -> Date,
        BreadCount -> Nullable<Integer>,
        FoodCostAmount -> Nullable<Float>,
        FoodCostPercent -> Nullable<Float>,
        LabourCostAmount -> Nullable<Float>,
        LabourCostPercent -> Nullable<Float>,
        NetSales -> Nullable<Float>,
        PartySales -> Nullable<Float>,
        Productivity -> Nullable<Float>,
    }
}
