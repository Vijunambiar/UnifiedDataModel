/**
 * DEPOSITS DOMAIN - SEMANTIC LAYER
 * Business-friendly measures, attributes, hierarchies, and folders for BI reporting
 */

export const depositsSemanticLayer = {
  domainId: "deposits",
  domainName: "Deposits & Funding",
  
  // MEASURES - Pre-calculated KPIs ready for BI tools
  measures: [
    {
      name: "total_deposits",
      displayName: "Total Deposits",
      formula: "SUM(account_balance)",
      description: "Total balance across all deposit accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio Metrics"
    },
    {
      name: "average_balance",
      displayName: "Average Account Balance",
      formula: "AVG(account_balance)",
      description: "Average balance per deposit account",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio Metrics"
    },
    {
      name: "total_accounts",
      displayName: "Total Accounts",
      formula: "COUNT(DISTINCT account_id)",
      description: "Total number of deposit accounts",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Volume Metrics"
    },
    {
      name: "new_accounts",
      displayName: "New Accounts",
      formula: "COUNT(DISTINCT CASE WHEN account_open_date >= DATE_TRUNC('month', CURRENT_DATE) THEN account_id END)",
      description: "Number of accounts opened in current period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Growth Metrics"
    },
    {
      name: "closed_accounts",
      displayName: "Closed Accounts",
      formula: "COUNT(DISTINCT CASE WHEN account_status = 'CLOSED' THEN account_id END)",
      description: "Number of closed accounts in current period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Attrition Metrics"
    },
    {
      name: "net_growth",
      displayName: "Net Account Growth",
      formula: "new_accounts - closed_accounts",
      description: "Net change in number of accounts (new minus closed)",
      dataType: "Number",
      aggregation: "CALCULATED",
      format: "#,##0",
      category: "Growth Metrics"
    },
    {
      name: "total_interest_paid",
      displayName: "Total Interest Paid",
      formula: "SUM(interest_paid_amount)",
      description: "Total interest expense paid to customers",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Profitability Metrics"
    },
    {
      name: "total_fees_collected",
      displayName: "Total Fees Collected",
      formula: "SUM(fee_amount)",
      description: "Total fee revenue collected from customers",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Profitability Metrics"
    },
    {
      name: "net_interest_margin",
      displayName: "Net Interest Margin",
      formula: "(interest_earned - interest_paid) / average_balance",
      description: "Net interest income as percentage of average balances",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Profitability Metrics"
    },
    {
      name: "cost_per_account",
      displayName: "Cost Per Account",
      formula: "total_operating_cost / total_accounts",
      description: "Average operating cost per deposit account",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Efficiency Metrics"
    },
    {
      name: "dormant_accounts",
      displayName: "Dormant Accounts",
      formula: "COUNT(DISTINCT CASE WHEN account_status = 'DORMANT' THEN account_id END)",
      description: "Number of accounts with no activity in 12+ months",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Account Quality"
    },
    {
      name: "average_daily_balance",
      displayName: "Average Daily Balance (ADB)",
      formula: "SUM(daily_balance) / COUNT(DISTINCT balance_date)",
      description: "Average of daily ending balances for the period",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio Metrics"
    },
    {
      name: "transaction_volume",
      displayName: "Transaction Volume",
      formula: "COUNT(transaction_id)",
      description: "Total number of deposit transactions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity Metrics"
    },
    {
      name: "transaction_value",
      displayName: "Transaction Value",
      formula: "SUM(transaction_amount)",
      description: "Total dollar value of all transactions",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Activity Metrics"
    },
    {
      name: "retention_rate",
      displayName: "Account Retention Rate",
      formula: "(beginning_accounts - closed_accounts) / beginning_accounts * 100",
      description: "Percentage of accounts retained from beginning of period",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Retention Metrics"
    }
  ],

  // ATTRIBUTES - Business-friendly dimensional attributes
  attributes: [
    {
      name: "account_type",
      displayName: "Account Type",
      field: "account_type_code",
      dataType: "String",
      description: "Type of deposit account (Checking, Savings, Money Market, CD)",
      lookup: "dim_account_type",
      format: "Text"
    },
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "customer_segment_code",
      dataType: "String",
      description: "Customer segmentation (Mass Market, Mass Affluent, Affluent, Private)",
      lookup: "dim_customer_segment",
      format: "Text"
    },
    {
      name: "branch_name",
      displayName: "Branch",
      field: "branch_id",
      dataType: "String",
      description: "Branch where account was opened",
      lookup: "dim_branch",
      format: "Text"
    },
    {
      name: "product_name",
      displayName: "Product Name",
      field: "product_code",
      dataType: "String",
      description: "Specific deposit product offering",
      lookup: "dim_product",
      format: "Text"
    },
    {
      name: "account_status",
      displayName: "Account Status",
      field: "status_code",
      dataType: "String",
      description: "Current status of account (Active, Dormant, Closed, Frozen)",
      lookup: "dim_account_status",
      format: "Text"
    },
    {
      name: "region",
      displayName: "Geographic Region",
      field: "region_code",
      dataType: "String",
      description: "Geographic region of the branch",
      lookup: "dim_geography",
      format: "Text"
    },
    {
      name: "interest_rate_tier",
      displayName: "Interest Rate Tier",
      field: "rate_tier",
      dataType: "String",
      description: "Interest rate tier based on balance",
      lookup: "dim_rate_tier",
      format: "Text"
    },
    {
      name: "relationship_manager",
      displayName: "Relationship Manager",
      field: "rm_id",
      dataType: "String",
      description: "Assigned relationship manager for the account",
      lookup: "dim_employee",
      format: "Text"
    },
    {
      name: "account_age_months",
      displayName: "Account Age (Months)",
      field: "DATEDIFF(month, account_open_date, CURRENT_DATE)",
      dataType: "Number",
      description: "Number of months since account was opened",
      format: "#,##0"
    },
    {
      name: "balance_tier",
      displayName: "Balance Tier",
      field: "CASE WHEN balance < 1000 THEN 'Under $1K' WHEN balance < 10000 THEN '$1K-$10K' WHEN balance < 100000 THEN '$10K-$100K' ELSE '$100K+' END",
      dataType: "String",
      description: "Account balance tier grouping",
      format: "Text"
    }
  ],

  // HIERARCHIES - Drill-down paths for analysis
  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Standard time-based hierarchy for temporal analysis"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City", "Branch"],
      description: "Geographic drill-down from country to individual branch"
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Line", "Product Type", "Product SKU"],
      description: "Product classification hierarchy from broad category to specific SKU"
    },
    {
      name: "Customer Hierarchy",
      levels: ["Segment", "Subsegment", "Household", "Customer"],
      description: "Customer segmentation hierarchy from segment to individual customer"
    },
    {
      name: "Organization Hierarchy",
      levels: ["Division", "Region", "District", "Branch", "Team"],
      description: "Organizational structure from division to team level"
    },
    {
      name: "Account Lifecycle",
      levels: ["Lifecycle Stage", "Account Age Bucket", "Account Status"],
      description: "Account lifecycle stages and aging buckets"
    }
  ],

  // FOLDERS - Organized measure groupings
  folders: [
    {
      name: "Portfolio Overview",
      measures: [
        "total_deposits",
        "average_balance",
        "total_accounts",
        "average_daily_balance"
      ],
      description: "High-level portfolio metrics for executive dashboards",
      icon: "📊"
    },
    {
      name: "Growth & Acquisition",
      measures: [
        "new_accounts",
        "net_growth",
        "transaction_volume",
        "transaction_value"
      ],
      description: "Metrics for tracking account growth and customer acquisition",
      icon: "📈"
    },
    {
      name: "Retention & Attrition",
      measures: [
        "closed_accounts",
        "dormant_accounts",
        "retention_rate"
      ],
      description: "Customer retention and attrition analytics",
      icon: "🔄"
    },
    {
      name: "Profitability",
      measures: [
        "total_interest_paid",
        "total_fees_collected",
        "net_interest_margin",
        "cost_per_account"
      ],
      description: "Financial performance and profitability metrics",
      icon: "💰"
    },
    {
      name: "Operational Efficiency",
      measures: [
        "cost_per_account",
        "transaction_volume",
        "dormant_accounts"
      ],
      description: "Operational efficiency and cost management metrics",
      icon: "⚙️"
    }
  ]
};

export default depositsSemanticLayer;
