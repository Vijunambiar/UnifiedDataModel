/**
 * DEPOSITS-RETAIL DOMAIN - SEMANTIC LAYER
 * Retail deposits including checking, savings, money market, and CDs
 */

export const depositsRetailSemanticLayer = {
  domainId: "deposits-retail",
  domainName: "Deposits Retail",
  
  measures: [
    {
      name: "total_deposit_balance",
      displayName: "Total Deposit Balance",
      formula: "SUM(current_balance)",
      description: "Total balance across all retail deposit accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_accounts",
      displayName: "Total Accounts",
      formula: "COUNT(DISTINCT account_id)",
      description: "Total number of retail deposit accounts",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "avg_account_balance",
      displayName: "Average Account Balance",
      formula: "AVG(current_balance)",
      description: "Average balance per deposit account",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "new_accounts",
      displayName: "New Accounts Opened",
      formula: "COUNT(DISTINCT CASE WHEN open_date >= DATEADD(month, -1, CURRENT_DATE) THEN account_id END)",
      description: "Number of new accounts opened in the period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Growth"
    },
    {
      name: "closed_accounts",
      displayName: "Closed Accounts",
      formula: "COUNT(DISTINCT CASE WHEN close_date >= DATEADD(month, -1, CURRENT_DATE) THEN account_id END)",
      description: "Number of accounts closed in the period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Attrition"
    },
    {
      name: "net_account_growth",
      displayName: "Net Account Growth",
      formula: "new_accounts - closed_accounts",
      description: "Net change in number of accounts",
      dataType: "Number",
      aggregation: "CALCULATED",
      format: "#,##0",
      category: "Growth"
    },
    {
      name: "total_interest_paid",
      displayName: "Total Interest Paid",
      formula: "SUM(interest_paid_ytd)",
      description: "Total interest expense paid to depositors",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Cost"
    },
    {
      name: "avg_interest_rate",
      displayName: "Average Interest Rate",
      formula: "AVG(current_rate)",
      description: "Weighted average interest rate paid",
      dataType: "Percentage",
      aggregation: "AVG",
      format: "0.00%",
      category: "Cost"
    },
    {
      name: "total_fees_collected",
      displayName: "Total Fees Collected",
      formula: "SUM(fee_amount)",
      description: "Total fees collected from deposit accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "net_interest_margin",
      displayName: "Net Interest Margin",
      formula: "(interest_earned - interest_paid) / avg_balance * 100",
      description: "Net interest margin on deposit portfolio",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Profitability"
    },
    {
      name: "dormant_accounts",
      displayName: "Dormant Accounts",
      formula: "COUNT(DISTINCT CASE WHEN is_dormant = 1 THEN account_id END)",
      description: "Number of accounts with no activity in 90+ days",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Quality"
    },
    {
      name: "dormancy_rate",
      displayName: "Dormancy Rate",
      formula: "(dormant_accounts / total_accounts) * 100",
      description: "Percentage of accounts that are dormant",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "avg_account_tenure_months",
      displayName: "Average Account Tenure",
      formula: "AVG(DATEDIFF(month, open_date, CURRENT_DATE))",
      description: "Average age of deposit accounts in months",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Retention"
    },
    {
      name: "retention_rate",
      displayName: "Retention Rate",
      formula: "((beginning_accounts - closed_accounts) / beginning_accounts) * 100",
      description: "Percentage of accounts retained during period",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Retention"
    },
    {
      name: "total_transactions",
      displayName: "Total Transactions",
      formula: "COUNT(transaction_id)",
      description: "Total number of deposit transactions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity"
    },
    {
      name: "avg_monthly_transactions",
      displayName: "Average Monthly Transactions",
      formula: "AVG(monthly_transaction_count)",
      description: "Average transactions per account per month",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Activity"
    },
    {
      name: "overdraft_count",
      displayName: "Overdraft Count",
      formula: "COUNT(CASE WHEN transaction_type = 'Overdraft' THEN transaction_id END)",
      description: "Number of overdraft occurrences",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Risk"
    },
    {
      name: "overdraft_fee_revenue",
      displayName: "Overdraft Fee Revenue",
      formula: "SUM(CASE WHEN fee_type = 'Overdraft' THEN fee_amount END)",
      description: "Revenue from overdraft fees",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    }
  ],

  attributes: [
    {
      name: "account_type",
      displayName: "Account Type",
      field: "account_type",
      dataType: "String",
      description: "Type of deposit account (Checking, Savings, Money Market, CD)",
      lookup: "dim_account_type"
    },
    {
      name: "product_name",
      displayName: "Product Name",
      field: "product_name",
      dataType: "String",
      description: "Specific product offering",
      lookup: "dim_product"
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
      name: "branch_name",
      displayName: "Branch Name",
      field: "branch_name",
      dataType: "String",
      description: "Branch where account was opened",
      lookup: "dim_branch"
    },
    {
      name: "account_status",
      displayName: "Account Status",
      field: "status",
      dataType: "String",
      description: "Current status (Active, Dormant, Closed, Frozen)",
      lookup: "dim_account_status"
    },
    {
      name: "interest_tier",
      displayName: "Interest Tier",
      field: "tier_name",
      dataType: "String",
      description: "Interest rate tier based on balance",
      lookup: "dim_interest_tier"
    },
    {
      name: "account_age_group",
      displayName: "Account Age Group",
      field: "CASE WHEN months_open < 6 THEN '0-6 months' WHEN months_open < 12 THEN '6-12 months' WHEN months_open < 24 THEN '1-2 years' ELSE '2+ years' END",
      dataType: "String",
      description: "Age grouping of account"
    },
    {
      name: "balance_range",
      displayName: "Balance Range",
      field: "CASE WHEN current_balance < 1000 THEN '<$1K' WHEN current_balance < 10000 THEN '$1K-$10K' WHEN current_balance < 50000 THEN '$10K-$50K' ELSE '$50K+' END",
      dataType: "String",
      description: "Account balance range"
    },
    {
      name: "overdraft_protection",
      displayName: "Overdraft Protection",
      field: "CASE WHEN has_overdraft_protection = 1 THEN 'Yes' ELSE 'No' END",
      dataType: "String",
      description: "Whether account has overdraft protection"
    },
    {
      name: "statement_delivery",
      displayName: "Statement Delivery",
      field: "delivery_method",
      dataType: "String",
      description: "How statements are delivered (Paper, Electronic)",
      lookup: "dim_delivery_method"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis of deposits"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City", "Branch"],
      description: "Geographic breakdown of deposit portfolio"
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Line", "Product Type", "Product SKU"],
      description: "Deposit product classification"
    },
    {
      name: "Customer Hierarchy",
      levels: ["Segment", "Subsegment", "Customer ID"],
      description: "Customer segmentation analysis"
    },
    {
      name: "Account Status Hierarchy",
      levels: ["Status Category", "Status", "Substatus"],
      description: "Account status classification"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_deposit_balance", "total_accounts", "avg_account_balance"],
      description: "High-level deposit portfolio metrics",
      icon: "💰"
    },
    {
      name: "Growth & Acquisition",
      measures: ["new_accounts", "closed_accounts", "net_account_growth"],
      description: "Account growth and acquisition metrics",
      icon: "📈"
    },
    {
      name: "Profitability",
      measures: ["total_interest_paid", "total_fees_collected", "net_interest_margin", "overdraft_fee_revenue"],
      description: "Revenue and cost metrics",
      icon: "💵"
    },
    {
      name: "Quality & Retention",
      measures: ["dormant_accounts", "dormancy_rate", "retention_rate", "avg_account_tenure_months"],
      description: "Portfolio quality and customer retention",
      icon: "⭐"
    },
    {
      name: "Activity",
      measures: ["total_transactions", "avg_monthly_transactions", "overdraft_count"],
      description: "Transaction activity metrics",
      icon: "🔄"
    }
  ]
};

export default depositsRetailSemanticLayer;
