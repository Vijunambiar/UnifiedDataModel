/**
 * DIGITAL-RETAIL DOMAIN - SEMANTIC LAYER
 * Mobile banking, online banking, digital wallet, and app engagement analytics
 */

export const digitalRetailSemanticLayer = {
  domainId: "digital-retail",
  domainName: "Digital Retail",
  
  measures: [
    {
      name: "total_digital_users",
      displayName: "Total Digital Users",
      formula: "COUNT(DISTINCT user_id)",
      description: "Total number of active digital banking users",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Users"
    },
    {
      name: "monthly_active_users",
      displayName: "Monthly Active Users (MAU)",
      formula: "COUNT(DISTINCT CASE WHEN last_login_date >= DATEADD(month, -1, CURRENT_DATE) THEN user_id END)",
      description: "Number of users active in the last 30 days",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Engagement"
    },
    {
      name: "daily_active_users",
      displayName: "Daily Active Users (DAU)",
      formula: "COUNT(DISTINCT CASE WHEN last_login_date = CURRENT_DATE THEN user_id END)",
      description: "Number of users active today",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Engagement"
    },
    {
      name: "total_sessions",
      displayName: "Total Sessions",
      formula: "COUNT(session_id)",
      description: "Total number of user sessions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Engagement"
    },
    {
      name: "avg_session_duration",
      displayName: "Average Session Duration",
      formula: "AVG(session_duration_seconds) / 60",
      description: "Average session length in minutes",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Engagement"
    },
    {
      name: "total_transactions",
      displayName: "Total Digital Transactions",
      formula: "COUNT(transaction_id)",
      description: "Total number of transactions via digital channels",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity"
    },
    {
      name: "total_transaction_value",
      displayName: "Total Transaction Value",
      formula: "SUM(transaction_amount)",
      description: "Total value of digital transactions",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Volume"
    },
    {
      name: "mobile_enrollment_rate",
      displayName: "Mobile Enrollment Rate",
      formula: "(mobile_enrolled_users / total_customers) * 100",
      description: "Percentage of customers enrolled in mobile banking",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Adoption"
    },
    {
      name: "online_enrollment_rate",
      displayName: "Online Enrollment Rate",
      formula: "(online_enrolled_users / total_customers) * 100",
      description: "Percentage of customers enrolled in online banking",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Adoption"
    },
    {
      name: "digital_adoption_rate",
      displayName: "Digital Adoption Rate",
      formula: "(digital_transactions / total_transactions) * 100",
      description: "Percentage of transactions completed digitally",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Adoption"
    },
    {
      name: "app_download_count",
      displayName: "App Downloads",
      formula: "COUNT(DISTINCT download_id)",
      description: "Total number of mobile app downloads",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Growth"
    },
    {
      name: "avg_app_rating",
      displayName: "Average App Rating",
      formula: "AVG(app_rating)",
      description: "Average customer rating of mobile app (1-5 scale)",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "0.00",
      category: "Quality"
    },
    {
      name: "bill_pay_volume",
      displayName: "Bill Pay Volume",
      formula: "SUM(bill_payment_amount)",
      description: "Total value of bill payments made digitally",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Payments"
    },
    {
      name: "mobile_check_deposit_volume",
      displayName: "Mobile Check Deposit Volume",
      formula: "SUM(check_deposit_amount)",
      description: "Total value of checks deposited via mobile",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Deposits"
    },
    {
      name: "digital_account_opening_count",
      displayName: "Digital Account Openings",
      formula: "COUNT(DISTINCT account_id WHERE opened_via_digital = 1)",
      description: "Number of accounts opened through digital channels",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Growth"
    },
    {
      name: "session_conversion_rate",
      displayName: "Session Conversion Rate",
      formula: "(sessions_with_transaction / total_sessions) * 100",
      description: "Percentage of sessions that result in a transaction",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Conversion"
    },
    {
      name: "customer_support_tickets",
      displayName: "Digital Support Tickets",
      formula: "COUNT(ticket_id)",
      description: "Number of customer support tickets for digital issues",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Support"
    },
    {
      name: "avg_resolution_time_hours",
      displayName: "Average Resolution Time",
      formula: "AVG(resolution_time_minutes) / 60",
      description: "Average time to resolve digital support tickets",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Support"
    },
    {
      name: "login_success_rate",
      displayName: "Login Success Rate",
      formula: "(successful_logins / total_login_attempts) * 100",
      description: "Percentage of successful login attempts",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    }
  ],

  attributes: [
    {
      name: "channel_type",
      displayName: "Channel Type",
      field: "channel_name",
      dataType: "String",
      description: "Digital channel (Mobile App, Online Banking, API)",
      lookup: "dim_digital_channel"
    },
    {
      name: "device_type",
      displayName: "Device Type",
      field: "device_type",
      dataType: "String",
      description: "Device used (iOS, Android, Desktop, Tablet)",
      lookup: "dim_device"
    },
    {
      name: "platform_version",
      displayName: "Platform Version",
      field: "app_version",
      dataType: "String",
      description: "Version of mobile app or platform"
    },
    {
      name: "feature_name",
      displayName: "Feature Name",
      field: "feature_name",
      dataType: "String",
      description: "Specific digital feature used",
      lookup: "dim_feature"
    },
    {
      name: "transaction_type",
      displayName: "Transaction Type",
      field: "transaction_type",
      dataType: "String",
      description: "Type of digital transaction",
      lookup: "dim_transaction_type"
    },
    {
      name: "user_segment",
      displayName: "User Segment",
      field: "segment_name",
      dataType: "String",
      description: "Customer segment (Mass, Affluent, etc.)",
      lookup: "dim_customer_segment"
    },
    {
      name: "enrollment_status",
      displayName: "Enrollment Status",
      field: "CASE WHEN is_enrolled = 1 THEN 'Enrolled' ELSE 'Not Enrolled' END",
      dataType: "String",
      description: "Digital banking enrollment status"
    },
    {
      name: "authentication_method",
      displayName: "Authentication Method",
      field: "auth_method",
      dataType: "String",
      description: "Method used to authenticate (Biometric, PIN, Password)",
      lookup: "dim_auth_method"
    },
    {
      name: "time_of_day",
      displayName: "Time of Day",
      field: "CASE WHEN HOUR(login_time) < 12 THEN 'Morning' WHEN HOUR(login_time) < 17 THEN 'Afternoon' ELSE 'Evening' END",
      dataType: "String",
      description: "Time period of digital activity"
    },
    {
      name: "day_of_week",
      displayName: "Day of Week",
      field: "DAYNAME(session_date)",
      dataType: "String",
      description: "Day of week for session"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Temporal analysis of digital activity"
    },
    {
      name: "Channel Hierarchy",
      levels: ["Channel Category", "Channel Type", "Device Type", "Platform Version"],
      description: "Digital channel and device breakdown"
    },
    {
      name: "Feature Hierarchy",
      levels: ["Feature Category", "Feature Group", "Feature Name"],
      description: "Digital feature usage analysis"
    },
    {
      name: "Customer Hierarchy",
      levels: ["Segment", "Subsegment", "Customer ID"],
      description: "Customer segmentation for digital users"
    },
    {
      name: "Transaction Hierarchy",
      levels: ["Transaction Category", "Transaction Type", "Transaction Subtype"],
      description: "Digital transaction classification"
    }
  ],

  folders: [
    {
      name: "User Engagement",
      measures: ["total_digital_users", "monthly_active_users", "daily_active_users", "total_sessions", "avg_session_duration"],
      description: "Digital user activity and engagement metrics",
      icon: "👥"
    },
    {
      name: "Transaction Activity",
      measures: ["total_transactions", "total_transaction_value", "session_conversion_rate"],
      description: "Digital transaction volumes and values",
      icon: "💳"
    },
    {
      name: "Digital Adoption",
      measures: ["mobile_enrollment_rate", "online_enrollment_rate", "digital_adoption_rate", "app_download_count"],
      description: "Digital channel adoption and growth",
      icon: "📈"
    },
    {
      name: "Product Usage",
      measures: ["bill_pay_volume", "mobile_check_deposit_volume", "digital_account_opening_count"],
      description: "Digital product and service usage",
      icon: "🛠️"
    },
    {
      name: "Quality & Support",
      measures: ["avg_app_rating", "customer_support_tickets", "avg_resolution_time_hours", "login_success_rate"],
      description: "Digital experience quality and support metrics",
      icon: "⭐"
    }
  ]
};

export default digitalRetailSemanticLayer;
