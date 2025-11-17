/**
 * INVESTMENT-RETAIL DOMAIN - SEMANTIC LAYER
 * Investment accounts, brokerage services, portfolio management, and retirement accounts
 */

export const investmentRetailSemanticLayer = {
  domainId: "investment-retail",
  domainName: "Investment Retail",
  
  measures: [
    {
      name: "total_aum",
      displayName: "Total Assets Under Management",
      formula: "SUM(account_balance)",
      description: "Total value of all investment accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_investment_accounts",
      displayName: "Total Investment Accounts",
      formula: "COUNT(DISTINCT account_id)",
      description: "Total number of investment accounts",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "avg_account_balance",
      displayName: "Average Account Balance",
      formula: "AVG(account_balance)",
      description: "Average balance per investment account",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "new_accounts_opened",
      displayName: "New Accounts Opened",
      formula: "COUNT(DISTINCT CASE WHEN open_date >= DATEADD(month, -1, CURRENT_DATE) THEN account_id END)",
      description: "Number of new investment accounts opened",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Growth"
    },
    {
      name: "total_contributions",
      displayName: "Total Contributions",
      formula: "SUM(contribution_amount)",
      description: "Total deposits/contributions to investment accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Activity"
    },
    {
      name: "total_withdrawals",
      displayName: "Total Withdrawals",
      formula: "SUM(withdrawal_amount)",
      description: "Total withdrawals from investment accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Activity"
    },
    {
      name: "net_flows",
      displayName: "Net Investment Flows",
      formula: "total_contributions - total_withdrawals",
      description: "Net cash flow into investment accounts",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Growth"
    },
    {
      name: "total_advisory_fees",
      displayName: "Total Advisory Fees",
      formula: "SUM(advisory_fee_amount)",
      description: "Total fees collected from advisory services",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "total_trading_revenue",
      displayName: "Total Trading Revenue",
      formula: "SUM(commission_amount + transaction_fee_amount)",
      description: "Revenue from trading commissions and fees",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "avg_advisory_fee_bps",
      displayName: "Average Advisory Fee (bps)",
      formula: "(total_advisory_fees / total_aum) * 10000",
      description: "Average advisory fee in basis points",
      dataType: "Number",
      aggregation: "CALCULATED",
      format: "#,##0",
      category: "Pricing"
    },
    {
      name: "total_trades",
      displayName: "Total Trades",
      formula: "COUNT(trade_id)",
      description: "Total number of trades executed",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity"
    },
    {
      name: "avg_trade_size",
      displayName: "Average Trade Size",
      formula: "AVG(trade_amount)",
      description: "Average value per trade",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Activity"
    },
    {
      name: "portfolio_return",
      displayName: "Portfolio Return %",
      formula: "((ending_value - beginning_value - net_flows) / beginning_value) * 100",
      description: "Time-weighted return on investment portfolio",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    },
    {
      name: "asset_allocation_equity_pct",
      displayName: "Equity Allocation %",
      formula: "(equity_value / total_aum) * 100",
      description: "Percentage of portfolio allocated to equities",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Allocation"
    },
    {
      name: "asset_allocation_fixed_income_pct",
      displayName: "Fixed Income Allocation %",
      formula: "(fixed_income_value / total_aum) * 100",
      description: "Percentage of portfolio allocated to fixed income",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Allocation"
    },
    {
      name: "total_retirement_accounts",
      displayName: "Total Retirement Accounts",
      formula: "COUNT(DISTINCT CASE WHEN account_type IN ('IRA', '401k', 'Roth IRA') THEN account_id END)",
      description: "Number of retirement accounts (IRA, 401k, Roth)",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Retirement"
    },
    {
      name: "retirement_aum",
      displayName: "Retirement AUM",
      formula: "SUM(CASE WHEN account_type IN ('IRA', '401k', 'Roth IRA') THEN account_balance END)",
      description: "Total assets in retirement accounts",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Retirement"
    },
    {
      name: "client_retention_rate",
      displayName: "Client Retention Rate",
      formula: "((beginning_clients - closed_accounts) / beginning_clients) * 100",
      description: "Percentage of clients retained during period",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Retention"
    }
  ],

  attributes: [
    {
      name: "account_type",
      displayName: "Account Type",
      field: "account_type",
      dataType: "String",
      description: "Type of investment account (Brokerage, IRA, 401k, Roth IRA, Managed)",
      lookup: "dim_account_type"
    },
    {
      name: "investment_objective",
      displayName: "Investment Objective",
      field: "objective",
      dataType: "String",
      description: "Client's investment objective (Growth, Income, Balanced, Conservative)",
      lookup: "dim_objective"
    },
    {
      name: "risk_tolerance",
      displayName: "Risk Tolerance",
      field: "risk_tolerance",
      dataType: "String",
      description: "Client risk tolerance (Conservative, Moderate, Aggressive)",
      lookup: "dim_risk_tolerance"
    },
    {
      name: "asset_class",
      displayName: "Asset Class",
      field: "asset_class",
      dataType: "String",
      description: "Asset class (Equity, Fixed Income, Cash, Alternative)",
      lookup: "dim_asset_class"
    },
    {
      name: "security_type",
      displayName: "Security Type",
      field: "security_type",
      dataType: "String",
      description: "Type of security (Stock, Bond, ETF, Mutual Fund, Option)",
      lookup: "dim_security_type"
    },
    {
      name: "advisor_name",
      displayName: "Financial Advisor",
      field: "advisor_name",
      dataType: "String",
      description: "Assigned financial advisor",
      lookup: "dim_advisor"
    },
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "segment_name",
      dataType: "String",
      description: "Client wealth segment (Mass Affluent, Affluent, HNW, UHNW)",
      lookup: "dim_customer_segment"
    },
    {
      name: "account_status",
      displayName: "Account Status",
      field: "status",
      dataType: "String",
      description: "Account status (Active, Inactive, Closed)",
      lookup: "dim_account_status"
    },
    {
      name: "fee_schedule",
      displayName: "Fee Schedule",
      field: "fee_schedule_name",
      dataType: "String",
      description: "Fee schedule tier",
      lookup: "dim_fee_schedule"
    },
    {
      name: "age_group",
      displayName: "Client Age Group",
      field: "CASE WHEN client_age < 35 THEN '<35' WHEN client_age < 50 THEN '35-49' WHEN client_age < 65 THEN '50-64' ELSE '65+' END",
      dataType: "String",
      description: "Age grouping of account holder"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis of investment activity"
    },
    {
      name: "Account Hierarchy",
      levels: ["Account Category", "Account Type", "Account Subtype"],
      description: "Investment account classification"
    },
    {
      name: "Asset Hierarchy",
      levels: ["Asset Category", "Asset Class", "Security Type", "Security"],
      description: "Asset allocation breakdown"
    },
    {
      name: "Advisor Hierarchy",
      levels: ["Region", "Branch", "Team", "Advisor"],
      description: "Financial advisor organizational structure"
    },
    {
      name: "Client Hierarchy",
      levels: ["Segment", "Subsegment", "Client ID"],
      description: "Client wealth segmentation"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_aum", "total_investment_accounts", "avg_account_balance"],
      description: "High-level portfolio metrics",
      icon: "💼"
    },
    {
      name: "Growth & Flows",
      measures: ["new_accounts_opened", "total_contributions", "total_withdrawals", "net_flows"],
      description: "Account growth and cash flow metrics",
      icon: "📈"
    },
    {
      name: "Revenue",
      measures: ["total_advisory_fees", "total_trading_revenue", "avg_advisory_fee_bps"],
      description: "Fee and revenue metrics",
      icon: "💰"
    },
    {
      name: "Trading Activity",
      measures: ["total_trades", "avg_trade_size"],
      description: "Trading volume and activity",
      icon: "📊"
    },
    {
      name: "Performance & Allocation",
      measures: ["portfolio_return", "asset_allocation_equity_pct", "asset_allocation_fixed_income_pct"],
      description: "Portfolio performance and asset allocation",
      icon: "📉"
    },
    {
      name: "Retirement",
      measures: ["total_retirement_accounts", "retirement_aum"],
      description: "Retirement account metrics",
      icon: "🏦"
    },
    {
      name: "Client Retention",
      measures: ["client_retention_rate"],
      description: "Client retention and satisfaction",
      icon: "🤝"
    }
  ]
};

export default investmentRetailSemanticLayer;
