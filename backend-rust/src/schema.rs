// @generated automatically by Diesel CLI.

diesel::table! {
    auv_entries (id) {
        id -> Integer,
        week1_date -> Nullable<Date>,
        week1_auv -> Nullable<Integer>,
        week1_hours -> Nullable<Integer>,
        week2_date -> Nullable<Date>,
        week2_auv -> Nullable<Integer>,
        week2_hours -> Nullable<Integer>,
        week3_date -> Nullable<Date>,
        week3_auv -> Nullable<Integer>,
        week3_hours -> Nullable<Integer>,
        week4_date -> Nullable<Date>,
        week4_auv -> Nullable<Integer>,
        week4_hours -> Nullable<Integer>,
        week5_auv -> Nullable<Integer>,
        week5_hours -> Nullable<Integer>,
        week5_date -> Nullable<Date>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        week5_required -> Nullable<Double>,
    }
}

diesel::table! {
    auv_entry2 (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        month -> Nullable<Integer>,
        year -> Nullable<Integer>,
        week1_auv -> Nullable<Integer>,
        week1_hours -> Nullable<Integer>,
        week2_auv -> Nullable<Integer>,
        week2_hours -> Nullable<Integer>,
        week3_auv -> Nullable<Integer>,
        week3_hours -> Nullable<Integer>,
        week4_auv -> Nullable<Integer>,
        week4_hours -> Nullable<Integer>,
        week5_auv -> Nullable<Integer>,
        week5_hours -> Nullable<Integer>,
        week1_prod -> Nullable<Float>,
        week2_prod -> Nullable<Float>,
        week3_prod -> Nullable<Float>,
        week4_prod -> Nullable<Float>,
        week5_prod -> Nullable<Float>,
    }
}

diesel::table! {
    backup_entries (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        date -> Nullable<Date>,
        FileName -> Nullable<Text>,
        uploaded -> Nullable<Double>,
        file_name -> Nullable<Text>,
    }
}

diesel::table! {
    bluebook_settings (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        hockey_url -> Nullable<Text>,
        display_hockey_weekly -> Nullable<Double>,
        print_hockey_weekly -> Nullable<Double>,
        hockey_home_team -> Nullable<Text>,
        run_hockey_fetch -> Nullable<Double>,
        manager_name -> Nullable<Text>,
        store_number -> Nullable<Text>,
    }
}

diesel::table! {
    comments (id) {
        id -> Integer,
        LinkedID -> Nullable<Integer>,
        Comment -> Text,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    day_data (id) {
        id -> Integer,
        Date -> Date,
        CashDeposit -> Nullable<Float>,
        Amex -> Nullable<Float>,
        BottleDeposit -> Nullable<Float>,
        CreditFood -> Nullable<Float>,
        CreditSales -> Nullable<Float>,
        CreditSalesRedeemed -> Nullable<Float>,
        DebitCard -> Nullable<Float>,
        GiftCardRedeem -> Nullable<Float>,
        GiftCardSold -> Nullable<Float>,
        HST -> Nullable<Float>,
        MasterCard -> Nullable<Float>,
        NetSales -> Nullable<Float>,
        PayPal -> Nullable<Float>,
        SubwayCaters -> Nullable<Float>,
        CreditSalesRedeemed2 -> Nullable<Float>,
        CustomerCount -> Integer,
        Factor -> Nullable<Float>,
        HoursWorked -> Nullable<Float>,
        Productivity -> Nullable<Float>,
        AdjustedSales -> Nullable<Float>,
        USFunds -> Nullable<Float>,
        BreadCredits -> Nullable<Float>,
        BreadOverShort -> Nullable<Float>,
        SkipTheDishes -> Nullable<Float>,
        PettyCash -> Nullable<Float>,
        DoorDash -> Nullable<Float>,
        Tips -> Nullable<Float>,
        WeeklyAverage -> Nullable<Float>,
        Visa -> Nullable<Float>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        Comment -> Nullable<Text>,
        UberEats -> Nullable<Float>,
    }
}

diesel::table! {
    day_data_backups (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        Date -> Nullable<Date>,
        CashDeposit -> Nullable<Float>,
        DebitCard -> Nullable<Float>,
        MasterCard -> Nullable<Float>,
        Visa -> Nullable<Float>,
        Amex -> Nullable<Float>,
        CreditSales -> Nullable<Float>,
        GiftCardRedeem -> Nullable<Float>,
        SubwayCaters -> Nullable<Float>,
        PayPal -> Nullable<Float>,
        SkipTheDishes -> Nullable<Float>,
        DoorDash -> Nullable<Float>,
        PettyCash -> Nullable<Float>,
        Tips -> Nullable<Float>,
        HST -> Nullable<Float>,
        BottleDeposit -> Nullable<Float>,
        NetSales -> Nullable<Float>,
        CreditSalesRedeemed -> Nullable<Float>,
        CreditSalesRedeemed2 -> Nullable<Float>,
        CreditFood -> Nullable<Float>,
        GiftCardSold -> Nullable<Float>,
        USFunds -> Nullable<Float>,
        HoursWorked -> Nullable<Float>,
        Productivity -> Nullable<Float>,
        Factor -> Nullable<Float>,
        AdjustedSales -> Nullable<Float>,
        CustomerCount -> Nullable<Integer>,
        BreadCredits -> Nullable<Float>,
        BreadOverShort -> Nullable<Float>,
        WeeklyAverage -> Nullable<Float>,
        Comment -> Nullable<Text>,
        day_id -> Nullable<Integer>,
        UberEats -> Nullable<Float>,
    }
}

diesel::table! {
    day_data_import_lists (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        entry_id -> Nullable<Integer>,
    }
}

diesel::table! {
    hockey_schedule_imports (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        date -> Nullable<Date>,
        away -> Nullable<Text>,
        home -> Nullable<Text>,
        gf_away -> Nullable<Text>,
        gf_home -> Nullable<Text>,
        attendance -> Nullable<Text>,
        arena -> Nullable<Text>,
        home_image -> Nullable<Text>,
        away_image -> Nullable<Text>,
    }
}

diesel::table! {
    hockey_schedules (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        date -> Nullable<Date>,
        away -> Nullable<Text>,
        home -> Nullable<Text>,
        gf_away -> Nullable<Integer>,
        gf_home -> Nullable<Integer>,
        attendance -> Nullable<Integer>,
        arena -> Nullable<Text>,
        home_image -> Nullable<Text>,
        away_image -> Nullable<Text>,
    }
}

diesel::table! {
    notification_data (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        message -> Nullable<Text>,
        show_once -> Nullable<Double>,
        shown -> Nullable<Double>,
    }
}

diesel::table! {
    tag_data (id) {
        id -> Integer,
        TagID -> Integer,
        DayID -> Integer,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    tag_lists (id) {
        id -> Integer,
        Tag -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    wastage_entries (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        Item -> Nullable<Integer>,
        Date -> Nullable<Date>,
        Amount -> Nullable<Float>,
        Reason -> Nullable<Text>,
    }
}

diesel::table! {
    wastage_entry_holdings (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        Item -> Nullable<Integer>,
        Date -> Nullable<Date>,
        Amount -> Nullable<Float>,
        Reason -> Nullable<Text>,
    }
}

diesel::table! {
    wastage_items (id) {
        id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        Name -> Nullable<Text>,
        UnitMeasure -> Nullable<Integer>,
        Location -> Nullable<Integer>,
        CustomConversion -> Nullable<Double>,
        UnitWeight -> Nullable<Float>,
        PackSize -> Nullable<Float>,
        PackSizeUnit -> Nullable<Integer>,
    }
}

diesel::table! {
    weekly_info (id) {
        id -> Nullable<Integer>,
        DayDate -> Date,
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

diesel::table! {
    weekly_infos (id) {
        id -> Integer,
        Date -> Date,
        BreadCount -> Integer,
        FoodCostAmount -> Nullable<Float>,
        FoodCostPercent -> Nullable<Float>,
        LabourCostAmount -> Nullable<Float>,
        LabourCostPercent -> Nullable<Float>,
        PartySales -> Nullable<Float>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
        NetSales -> Nullable<Float>,
        productivity -> Nullable<Float>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    auv_entries,
    auv_entry2,
    backup_entries,
    bluebook_settings,
    comments,
    day_data,
    day_data_backups,
    day_data_import_lists,
    hockey_schedule_imports,
    hockey_schedules,
    notification_data,
    tag_data,
    tag_lists,
    wastage_entries,
    wastage_entry_holdings,
    wastage_items,
    weekly_info,
    weekly_infos,
);
