/**
 * DEPOSITS-COMMERCIAL DOMAIN - SEMANTIC LAYER
 * Commercial deposits: DDA, analyzed accounts, sweep accounts, ZBA (Zero Balance Accounts)
 */

export const depositsCommercialSemanticLayer = {
  domainId: "deposits-commercial",
  domainName: "Deposits Commercial",
  
  measures: [
    {
      name: "total_deposit_balance",
      displayName: "Total Commercial Deposits",
      formula: "SUM(current_balance)",
      description: "Total balance across all commercial deposit accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_dda_balance",
      displayName: "Total DDA Balance",
      formula: "SUM(CASE WHEN account_type = 'DDA' THEN current_balance END)",
      description: "Total Demand Deposit Account balances",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_accounts",
      displayName: "Total Commercial Accounts",
      formula: "COUNT(DISTINCT account_id)",
      description: "Total number of commercial deposit accounts",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "avg_account_balance",
      displayName: "Average Account Balance",
      formula: "AVG(current_balance)",
      description: "Average balance per commercial account",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_analyzed_balance",
      displayName: "Total Analyzed Balance",
      formula: "SUM(analysis_balance)",
      description: "Total balance eligible for earnings credit",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Analysis"
    },
    {
      name: "earnings_credit_rate",
      displayName: "Earnings Credit Rate",
      formula: "AVG(ecr_rate)",
      description: "Average earnings credit rate applied",
      dataType: "Percentage",
      aggregation: "AVG",
      format: "0.00%",
      category: "Analysis"
    },
    {
      name: "total_service_charges",
      displayName: "Total Service Charges",
      formula: "SUM(service_charge_amount)",
      description: "Total service charges assessed on accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "total_earnings_credit",
      displayName: "Total Earnings Credit",
      formula: "SUM(earnings_credit_amount)",
      description: "Total earnings credit offset against service charges",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Analysis"
    },
    {
      name: "net_service_charge_revenue",
      displayName: "Net Service Charge Revenue",
      formula: "total_service_charges - total_earnings_credit",
      description: "Service charges after earnings credit offset",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "total_interest_expense",
      displayName: "Total Interest Expense",
      formula: "SUM(interest_paid)",
      description: "Total interest paid on commercial deposits",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Cost"
    },
    {
      name: "avg_interest_rate",
      displayName: "Average Interest Rate",
      formula: "AVG(interest_rate)",
      description: "Weighted average interest rate paid",
      dataType: "Percentage",
      aggregation: "AVG",
      format: "0.00%",
      category: "Cost"
    },
    {
      name: "total_sweep_volume",
      displayName: "Total Sweep Volume",
      formula: "SUM(sweep_amount)",
      description: "Total value swept to investment accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Sweep"
    },
    {
      name: "sweep_participation_rate",
      displayName: "Sweep Participation Rate",
      formula: "(accounts_with_sweep / total_accounts) * 100",
      description: "Percentage of accounts enrolled in sweep",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Sweep"
    },
    {
      name: "zba_accounts",
      displayName: "Total ZBA Accounts",
      formula: "COUNT(DISTINCT CASE WHEN account_type = 'ZBA' THEN account_id END)",
      description: "Number of Zero Balance Accounts",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Cash Management"
    },
    {
      name: "avg_collected_balance",
      displayName: "Average Collected Balance",
      formula: "AVG(collected_balance)",
      description: "Average collected (available) balance",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "new_accounts_opened",
      displayName: "New Accounts Opened",
      formula: "COUNT(DISTINCT CASE WHEN open_date >= DATEADD(month, -1, CURRENT_DATE) THEN account_id END)",
      description: "Number of new commercial deposit accounts opened",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Growth"
    },
    {
      name: "accounts_closed",
      displayName: "Accounts Closed",
      formula: "COUNT(DISTINCT CASE WHEN close_date >= DATEADD(month, -1, CURRENT_DATE) THEN account_id END)",
      description: "Number of accounts closed during period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Attrition"
    },
    {
      name: "net_deposit_growth",
      displayName: "Net Deposit Growth",
      formula: "ending_balance - beginning_balance",
      description: "Net change in total deposits",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Growth"
    }
  ],

  attributes: [
    {
      name: "account_type",
      displayName: "Account Type",
      field: "account_type",
      dataType: "String",
      description: "Type of commercial account (DDA, Analyzed, Sweep, ZBA, MMDA)",
      lookup: "dim_account_type"
    },
    {
      name: "product_name",
      displayName: "Product Name",
      field: "product_name",
      dataType: "String",
      description: "Specific deposit product offering",
      lookup: "dim_product"
    },
    {
      name: "company_size",
      displayName: "Company Size",
      field: "CASE WHEN annual_revenue < 5000000 THEN 'Small Business' WHEN annual_revenue < 500000000 THEN 'Middle Market' ELSE 'Large Corporate' END",
      dataType: "String",
      description: "Revenue-based company size segment"
    },
    {
      name: "industry",
      displayName: "Industry",
      field: "industry_name",
      dataType: "String",
      description: "Customer industry classification",
      lookup: "dim_industry"
    },
    {
      name: "account_status",
      displayName: "Account Status",
      field: "status",
      dataType: "String",
      description: "Account status (Active, Dormant, Closed)",
      lookup: "dim_account_status"
    },
    {
      name: "pricing_tier",
      displayName: "Pricing Tier",
      field: "pricing_tier",
      dataType: "String",
      description: "Fee pricing tier based on relationship value",
      lookup: "dim_pricing_tier"
    },
    {
      name: "relationship_manager",
      displayName: "Relationship Manager",
      field: "rm_name",
      dataType: "String",
      description: "Assigned commercial relationship manager",
      lookup: "dim_relationship_manager"
    },
    {
      name: "has_sweep",
      displayName: "Sweep Enabled",
      field: "CASE WHEN has_sweep = 1 THEN 'Yes' ELSE 'No' END",
      dataType: "String",
      description: "Whether account has sweep feature"
    },
    {
      name: "has_analysis",
      displayName: "Account Analysis",
      field: "CASE WHEN has_analysis = 1 THEN 'Yes' ELSE 'No' END",
      dataType: "String",
      description: "Whether account has earnings credit analysis"
    },
    {
      name: "balance_tier",
      displayName: "Balance Tier",
      field: "CASE WHEN current_balance < 100000 THEN '<$100K' WHEN current_balance < 1000000 THEN '$100K-$1M' WHEN current_balance < 10000000 THEN '$1M-$10M' ELSE '$10M+' END",
      dataType: "String",
      description: "Account balance tier"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis of deposits"
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Type", "Product Name"],
      description: "Deposit product classification"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City", "Branch"],
      description: "Geographic breakdown of deposits"
    },
    {
      name: "Company Size Hierarchy",
      levels: ["Segment", "Revenue Band", "Company Size"],
      description: "Customer size segmentation"
    },
    {
      name: "Industry Hierarchy",
      levels: ["Sector", "Industry Group", "Industry"],
      description: "Industry classification of customers"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_deposit_balance", "total_dda_balance", "total_accounts", "avg_account_balance"],
      description: "Commercial deposit portfolio metrics",
      icon: "💰"
    },
    {
      name: "Account Analysis",
      measures: ["total_analyzed_balance", "earnings_credit_rate", "total_earnings_credit"],
      description: "Account analysis and earnings credit metrics",
      icon: "📊"
    },
    {
      name: "Revenue & Profitability",
      measures: ["total_service_charges", "net_service_charge_revenue", "total_interest_expense"],
      description: "Fee revenue and interest expense",
      icon: "💵"
    },
    {
      name: "Sweep Services",
      measures: ["total_sweep_volume", "sweep_participation_rate"],
      description: "Automated sweep service metrics",
      icon: "🔄"
    },
    {
      name: "Cash Management",
      measures: ["zba_accounts", "avg_collected_balance"],
      description: "Cash management services",
      icon: "🏦"
    },
    {
      name: "Growth",
      measures: ["new_accounts_opened", "accounts_closed", "net_deposit_growth"],
      description: "Account and deposit growth metrics",
      icon: "📈"
    }
  ]
};

export default depositsCommercialSemanticLayer;
