/**
 * COLLECTIONS-RETAIL DOMAIN - SEMANTIC LAYER
 * Debt recovery, delinquency management, payment arrangements, and charge-offs
 */

export const collectionsRetailSemanticLayer = {
  domainId: "collections-retail",
  domainName: "Collections Retail",
  
  measures: [
    {
      name: "total_delinquent_balance",
      displayName: "Total Delinquent Balance",
      formula: "SUM(delinquent_balance)",
      description: "Total outstanding balance in collections",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_delinquent_accounts",
      displayName: "Total Delinquent Accounts",
      formula: "COUNT(DISTINCT account_id WHERE is_delinquent = 1)",
      description: "Number of accounts in collections",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "delinquency_rate",
      displayName: "Delinquency Rate",
      formula: "(delinquent_accounts / total_accounts) * 100",
      description: "Percentage of accounts that are delinquent",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Risk"
    },
    {
      name: "30_dpd_balance",
      displayName: "30+ Days Past Due Balance",
      formula: "SUM(CASE WHEN days_past_due >= 30 THEN delinquent_balance END)",
      description: "Balance of accounts 30+ days delinquent",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Aging"
    },
    {
      name: "60_dpd_balance",
      displayName: "60+ Days Past Due Balance",
      formula: "SUM(CASE WHEN days_past_due >= 60 THEN delinquent_balance END)",
      description: "Balance of accounts 60+ days delinquent",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Aging"
    },
    {
      name: "90_dpd_balance",
      displayName: "90+ Days Past Due Balance",
      formula: "SUM(CASE WHEN days_past_due >= 90 THEN delinquent_balance END)",
      description: "Balance of accounts 90+ days delinquent",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Aging"
    },
    {
      name: "total_collections",
      displayName: "Total Collections",
      formula: "SUM(collected_amount)",
      description: "Total amount collected during period",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Recovery"
    },
    {
      name: "collection_rate",
      displayName: "Collection Rate",
      formula: "(total_collections / total_delinquent_balance) * 100",
      description: "Percentage of delinquent balance collected",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    },
    {
      name: "avg_days_past_due",
      displayName: "Average Days Past Due",
      formula: "AVG(days_past_due)",
      description: "Average number of days accounts are past due",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Aging"
    },
    {
      name: "total_charge_offs",
      displayName: "Total Charge-Offs",
      formula: "SUM(charge_off_amount)",
      description: "Total amount charged off as uncollectible",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Loss"
    },
    {
      name: "charge_off_rate",
      displayName: "Charge-Off Rate",
      formula: "(charge_off_amount / total_portfolio_balance) * 100",
      description: "Percentage of portfolio charged off",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Loss"
    },
    {
      name: "total_payment_arrangements",
      displayName: "Total Payment Arrangements",
      formula: "COUNT(DISTINCT arrangement_id)",
      description: "Number of payment arrangements established",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Workout"
    },
    {
      name: "arrangement_success_rate",
      displayName: "Arrangement Success Rate",
      formula: "(successful_arrangements / total_arrangements) * 100",
      description: "Percentage of payment arrangements successfully completed",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Workout"
    },
    {
      name: "total_collection_calls",
      displayName: "Total Collection Calls",
      formula: "COUNT(call_id)",
      description: "Number of collection calls made",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity"
    },
    {
      name: "contact_rate",
      displayName: "Contact Rate",
      formula: "(successful_contacts / total_attempts) * 100",
      description: "Percentage of collection attempts with successful contact",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Efficiency"
    },
    {
      name: "promise_to_pay_count",
      displayName: "Promises to Pay",
      formula: "COUNT(DISTINCT promise_id)",
      description: "Number of payment promises received",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity"
    },
    {
      name: "promise_kept_rate",
      displayName: "Promise Kept Rate",
      formula: "(promises_kept / total_promises) * 100",
      description: "Percentage of payment promises honored",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "roll_rate_30_to_60",
      displayName: "Roll Rate 30 to 60 DPD",
      formula: "(accounts_rolled_to_60 / accounts_at_30) * 100",
      description: "Percentage of 30 DPD accounts that roll to 60 DPD",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Risk"
    },
    {
      name: "cure_rate",
      displayName: "Cure Rate",
      formula: "(cured_accounts / delinquent_accounts) * 100",
      description: "Percentage of delinquent accounts that become current",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    }
  ],

  attributes: [
    {
      name: "delinquency_bucket",
      displayName: "Delinquency Bucket",
      field: "CASE WHEN days_past_due < 30 THEN '0-29 DPD' WHEN days_past_due < 60 THEN '30-59 DPD' WHEN days_past_due < 90 THEN '60-89 DPD' ELSE '90+ DPD' END",
      dataType: "String",
      description: "Delinquency aging bucket"
    },
    {
      name: "account_type",
      displayName: "Account Type",
      field: "account_type",
      dataType: "String",
      description: "Type of account (Loan, Credit Card, Line of Credit)",
      lookup: "dim_account_type"
    },
    {
      name: "collection_strategy",
      displayName: "Collection Strategy",
      field: "strategy_name",
      dataType: "String",
      description: "Collection strategy applied (Early, Standard, Intensive)",
      lookup: "dim_strategy"
    },
    {
      name: "collection_status",
      displayName: "Collection Status",
      field: "status",
      dataType: "String",
      description: "Current collection status (Active, On Hold, Closed, Charged Off)",
      lookup: "dim_status"
    },
    {
      name: "collector_id",
      displayName: "Collector",
      field: "collector_name",
      dataType: "String",
      description: "Assigned collector",
      lookup: "dim_collector"
    },
    {
      name: "contact_method",
      displayName: "Contact Method",
      field: "contact_method",
      dataType: "String",
      description: "Method of contact (Phone, Email, Letter, SMS)",
      lookup: "dim_contact_method"
    },
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "segment_name",
      dataType: "String",
      description: "Customer segment classification",
      lookup: "dim_customer_segment"
    },
    {
      name: "hardship_indicator",
      displayName: "Hardship Indicator",
      field: "CASE WHEN has_hardship = 1 THEN 'Yes' ELSE 'No' END",
      dataType: "String",
      description: "Whether customer is experiencing financial hardship"
    },
    {
      name: "workout_type",
      displayName: "Workout Type",
      field: "workout_type",
      dataType: "String",
      description: "Type of payment arrangement (Forbearance, Modification, Settlement)",
      lookup: "dim_workout_type"
    },
    {
      name: "legal_status",
      displayName: "Legal Status",
      field: "legal_status",
      dataType: "String",
      description: "Legal status (Pre-Legal, Legal, Bankruptcy)",
      lookup: "dim_legal_status"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis of collections"
    },
    {
      name: "Delinquency Hierarchy",
      levels: ["Delinquency Category", "Delinquency Bucket", "Days Past Due"],
      description: "Delinquency aging classification"
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Type", "Product"],
      description: "Product breakdown for delinquent accounts"
    },
    {
      name: "Collector Hierarchy",
      levels: ["Team", "Supervisor", "Collector"],
      description: "Collections team organizational structure"
    },
    {
      name: "Strategy Hierarchy",
      levels: ["Strategy Category", "Strategy", "Action"],
      description: "Collection strategy and tactics"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_delinquent_balance", "total_delinquent_accounts", "delinquency_rate"],
      description: "Overall delinquency portfolio metrics",
      icon: "📊"
    },
    {
      name: "Aging Analysis",
      measures: ["30_dpd_balance", "60_dpd_balance", "90_dpd_balance", "avg_days_past_due"],
      description: "Delinquency aging breakdown",
      icon: "📅"
    },
    {
      name: "Recovery Performance",
      measures: ["total_collections", "collection_rate", "cure_rate"],
      description: "Collection recovery and performance metrics",
      icon: "💰"
    },
    {
      name: "Loss & Charge-Offs",
      measures: ["total_charge_offs", "charge_off_rate"],
      description: "Charge-off and loss metrics",
      icon: "📉"
    },
    {
      name: "Payment Arrangements",
      measures: ["total_payment_arrangements", "arrangement_success_rate", "promise_to_pay_count", "promise_kept_rate"],
      description: "Payment workout and arrangement metrics",
      icon: "🤝"
    },
    {
      name: "Collection Activity",
      measures: ["total_collection_calls", "contact_rate"],
      description: "Collection activity and efficiency",
      icon: "📞"
    },
    {
      name: "Risk Indicators",
      measures: ["roll_rate_30_to_60", "delinquency_rate"],
      description: "Risk and roll rate metrics",
      icon: "⚠️"
    }
  ]
};

export default collectionsRetailSemanticLayer;
