/**
 * LOANS-RETAIL DOMAIN - SEMANTIC LAYER
 * Personal loans, auto loans, student loans, home equity loans
 */

export const loansRetailSemanticLayer = {
  domainId: "loans-retail",
  domainName: "Loans-Retail",
  
  measures: [
    {
      name: "total_loan_balance",
      displayName: "Total Loan Balance",
      formula: "SUM(principal_balance + interest_balance)",
      description: "Total outstanding loan balance including principal and interest",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio Metrics"
    },
    {
      name: "total_loans",
      displayName: "Total Loans",
      formula: "COUNT(DISTINCT loan_id)",
      description: "Total number of retail loans",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Volume Metrics"
    },
    {
      name: "average_loan_size",
      displayName: "Average Loan Size",
      formula: "AVG(original_loan_amount)",
      description: "Average loan amount at origination",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio Metrics"
    },
    {
      name: "new_loan_originations",
      displayName: "New Loan Originations",
      formula: "COUNT(DISTINCT CASE WHEN origination_date >= DATE_TRUNC('month', CURRENT_DATE) THEN loan_id END)",
      description: "Number of new loans originated in current period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Growth Metrics"
    },
    {
      name: "total_origination_volume",
      displayName: "Total Origination Volume",
      formula: "SUM(CASE WHEN origination_date >= DATE_TRUNC('month', CURRENT_DATE) THEN loan_amount END)",
      description: "Dollar volume of loans originated in current period",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Growth Metrics"
    },
    {
      name: "loan_payoffs",
      displayName: "Loan Payoffs",
      formula: "COUNT(DISTINCT CASE WHEN payoff_date IS NOT NULL THEN loan_id END)",
      description: "Number of loans paid off in current period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Attrition Metrics"
    },
    {
      name: "delinquency_rate",
      displayName: "Delinquency Rate",
      formula: "(COUNT(DISTINCT CASE WHEN days_past_due >= 30 THEN loan_id END) / NULLIF(COUNT(DISTINCT loan_id), 0)) * 100",
      description: "Percentage of loans 30+ days past due",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Quality"
    },
    {
      name: "npl_ratio",
      displayName: "Non-Performing Loan Ratio",
      formula: "(SUM(CASE WHEN days_past_due >= 90 THEN principal_balance END) / NULLIF(SUM(principal_balance), 0)) * 100",
      description: "NPL balance as percentage of total portfolio",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Quality"
    },
    {
      name: "chargeoff_rate",
      displayName: "Charge-off Rate",
      formula: "(SUM(chargeoff_amount) / NULLIF(AVG(total_balance), 0)) * 100",
      description: "Charge-offs as percentage of average balance",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Quality"
    },
    {
      name: "weighted_avg_interest_rate",
      displayName: "Weighted Average Interest Rate",
      formula: "SUM(interest_rate * principal_balance) / NULLIF(SUM(principal_balance), 0)",
      description: "Portfolio weighted average interest rate",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Pricing"
    },
    {
      name: "total_interest_income",
      displayName: "Total Interest Income",
      formula: "SUM(interest_earned)",
      description: "Total interest income earned on loan portfolio",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Profitability"
    },
    {
      name: "provision_expense",
      displayName: "Provision Expense",
      formula: "SUM(provision_amount)",
      description: "Total provision for credit losses",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Credit Quality"
    },
    {
      name: "net_chargeoff_amount",
      displayName: "Net Charge-offs",
      formula: "SUM(chargeoff_amount - recovery_amount)",
      description: "Charge-offs net of recoveries",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Credit Quality"
    },
    {
      name: "average_fico_score",
      displayName: "Average FICO Score",
      formula: "AVG(fico_score)",
      description: "Average borrower FICO score",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Credit Quality"
    },
    {
      name: "loan_to_value_ratio",
      displayName: "Loan-to-Value Ratio",
      formula: "(SUM(loan_amount) / NULLIF(SUM(collateral_value), 0)) * 100",
      description: "Weighted average LTV ratio for secured loans",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Quality"
    }
  ],

  attributes: [
    {
      name: "loan_type",
      displayName: "Loan Type",
      field: "loan_type_code",
      dataType: "String",
      description: "Type of retail loan (Personal, Auto, Student, HELOC, Home Equity)",
      lookup: "dim_loan_type"
    },
    {
      name: "loan_status",
      displayName: "Loan Status",
      field: "loan_status_code",
      dataType: "String",
      description: "Current status of loan (Active, Paid Off, Charged Off, Delinquent)",
      lookup: "dim_loan_status"
    },
    {
      name: "delinquency_bucket",
      displayName: "Delinquency Bucket",
      field: "CASE WHEN days_past_due = 0 THEN 'Current' WHEN days_past_due <= 30 THEN '1-30 DPD' WHEN days_past_due <= 60 THEN '31-60 DPD' WHEN days_past_due <= 90 THEN '61-90 DPD' ELSE '90+ DPD' END",
      dataType: "String",
      description: "Delinquency aging bucket"
    },
    {
      name: "origination_channel",
      displayName: "Origination Channel",
      field: "origination_channel_code",
      dataType: "String",
      description: "Channel where loan was originated (Branch, Online, Mobile, Call Center)",
      lookup: "dim_channel"
    },
    {
      name: "rate_type",
      displayName: "Rate Type",
      field: "rate_type_code",
      dataType: "String",
      description: "Interest rate type (Fixed, Variable)",
      lookup: "dim_rate_type"
    },
    {
      name: "term_bucket",
      displayName: "Term Bucket",
      field: "CASE WHEN term_months <= 24 THEN '0-2 years' WHEN term_months <= 60 THEN '2-5 years' WHEN term_months <= 120 THEN '5-10 years' ELSE '10+ years' END",
      dataType: "String",
      description: "Loan term length bucket"
    },
    {
      name: "credit_tier",
      displayName: "Credit Tier",
      field: "CASE WHEN fico_score >= 740 THEN 'Prime' WHEN fico_score >= 670 THEN 'Near Prime' ELSE 'Subprime' END",
      dataType: "String",
      description: "Borrower credit quality tier based on FICO"
    },
    {
      name: "vintage_year",
      displayName: "Vintage Year",
      field: "YEAR(origination_date)",
      dataType: "Number",
      description: "Year loan was originated",
      format: "####"
    },
    {
      name: "collateral_type",
      displayName: "Collateral Type",
      field: "collateral_type_code",
      dataType: "String",
      description: "Type of collateral securing the loan",
      lookup: "dim_collateral_type"
    },
    {
      name: "geographic_region",
      displayName: "Geographic Region",
      field: "region_code",
      dataType: "String",
      description: "Geographic region of borrower",
      lookup: "dim_geography"
    }
  ],

  hierarchies: [
    {
      name: "Loan Product Hierarchy",
      levels: ["Loan Category", "Loan Type", "Loan Product"],
      description: "Loan product classification from category to specific product"
    },
    {
      name: "Time Hierarchy",
      levels: ["Vintage Year", "Vintage Quarter", "Vintage Month"],
      description: "Loan origination time hierarchy"
    },
    {
      name: "Credit Quality Hierarchy",
      levels: ["Credit Tier", "FICO Range", "Delinquency Status"],
      description: "Credit quality classification and performance"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City"],
      description: "Borrower geographic location"
    },
    {
      name: "Loan Lifecycle",
      levels: ["Loan Status", "Delinquency Bucket", "Days Past Due"],
      description: "Loan lifecycle and delinquency progression"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_loan_balance", "total_loans", "average_loan_size"],
      description: "High-level portfolio metrics",
      icon: "📊"
    },
    {
      name: "Loan Originations",
      measures: ["new_loan_originations", "total_origination_volume"],
      description: "New loan production metrics",
      icon: "📈"
    },
    {
      name: "Credit Quality",
      measures: ["delinquency_rate", "npl_ratio", "chargeoff_rate", "average_fico_score", "loan_to_value_ratio"],
      description: "Asset quality and risk metrics",
      icon: "⚠️"
    },
    {
      name: "Profitability",
      measures: ["total_interest_income", "provision_expense", "weighted_avg_interest_rate"],
      description: "Revenue and profitability metrics",
      icon: "💰"
    },
    {
      name: "Portfolio Runoff",
      measures: ["loan_payoffs", "net_chargeoff_amount"],
      description: "Portfolio attrition and losses",
      icon: "📉"
    }
  ]
};

export default loansRetailSemanticLayer;
