/**
 * LOANS-COMMERCIAL DOMAIN - SEMANTIC LAYER
 * C&I, CRE, LOC, Term Loans, Participations, Covenants
 */

export const loansCommercialSemanticLayer = {
  domainId: "loans-commercial",
  domainName: "Loans-Commercial",
  
  measures: [
    {
      name: "total_loan_commitments",
      displayName: "Total Loan Commitments",
      formula: "SUM(committed_amount)",
      description: "Total committed loan amount",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_outstanding_balance",
      displayName: "Total Outstanding Balance",
      formula: "SUM(outstanding_balance)",
      description: "Total drawn/outstanding loan balance",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "unfunded_commitments",
      displayName: "Unfunded Commitments",
      formula: "SUM(committed_amount - outstanding_balance)",
      description: "Available but undrawn credit lines",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "utilization_rate",
      displayName: "Line Utilization Rate",
      formula: "(SUM(outstanding_balance) / NULLIF(SUM(committed_amount), 0)) * 100",
      description: "Percentage of committed lines that are drawn",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Portfolio"
    },
    {
      name: "new_loan_originations",
      displayName: "New Loan Originations",
      formula: "COUNT(DISTINCT CASE WHEN origination_date >= DATE_TRUNC('month', CURRENT_DATE) THEN loan_id END)",
      description: "New commercial loans originated in period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Production"
    },
    {
      name: "new_origination_volume",
      displayName: "New Origination Volume",
      formula: "SUM(CASE WHEN origination_date >= DATE_TRUNC('month', CURRENT_DATE) THEN committed_amount END)",
      description: "Dollar volume of new loan originations",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Production"
    },
    {
      name: "weighted_avg_rate",
      displayName: "Weighted Average Rate",
      formula: "SUM(interest_rate * outstanding_balance) / NULLIF(SUM(outstanding_balance), 0)",
      description: "Portfolio weighted average interest rate",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Pricing"
    },
    {
      name: "interest_income",
      displayName: "Interest Income",
      formula: "SUM(interest_earned)",
      description: "Total interest income on commercial loans",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "fee_income",
      displayName: "Fee Income",
      formula: "SUM(fee_amount)",
      description: "Total fee income (origination, commitment, unused line fees)",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "criticized_loans",
      displayName: "Criticized Loans",
      formula: "SUM(CASE WHEN risk_rating IN ('SPECIAL_MENTION', 'SUBSTANDARD', 'DOUBTFUL', 'LOSS') THEN outstanding_balance END)",
      description: "Balance of criticized and classified loans",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Credit Quality"
    },
    {
      name: "npl_balance",
      displayName: "Non-Performing Loans",
      formula: "SUM(CASE WHEN days_past_due >= 90 OR accrual_status = 'NON_ACCRUAL' THEN outstanding_balance END)",
      description: "Balance of non-performing loans (90+ DPD or non-accrual)",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Credit Quality"
    },
    {
      name: "npl_ratio",
      displayName: "NPL Ratio",
      formula: "(SUM(CASE WHEN days_past_due >= 90 OR accrual_status = 'NON_ACCRUAL' THEN outstanding_balance END) / NULLIF(SUM(outstanding_balance), 0)) * 100",
      description: "NPL balance as percentage of total portfolio",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Quality"
    },
    {
      name: "provision_expense",
      displayName: "Provision Expense",
      formula: "SUM(provision_amount)",
      description: "Total CECL provision for credit losses",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Credit Quality"
    },
    {
      name: "alll_balance",
      displayName: "ALLL Balance",
      formula: "SUM(allowance_balance)",
      description: "Allowance for Loan and Lease Losses balance",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Credit Quality"
    },
    {
      name: "reserve_coverage_ratio",
      displayName: "Reserve Coverage Ratio",
      formula: "(SUM(allowance_balance) / NULLIF(SUM(CASE WHEN days_past_due >= 90 THEN outstanding_balance END), 0)) * 100",
      description: "ALLL as percentage of NPLs",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Quality"
    },
    {
      name: "covenant_breaches",
      displayName: "Covenant Breaches",
      formula: "COUNT(DISTINCT CASE WHEN covenant_status = 'BREACH' THEN loan_id END)",
      description: "Number of loans with covenant violations",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Credit Quality"
    },
    {
      name: "avg_ltv_ratio",
      displayName: "Average LTV Ratio",
      formula: "AVG(ltv_ratio)",
      description: "Average loan-to-value ratio for secured loans",
      dataType: "Percentage",
      aggregation: "AVG",
      format: "0.00%",
      category: "Credit Quality"
    },
    {
      name: "concentration_largest_borrower",
      displayName: "Largest Borrower Exposure",
      formula: "MAX(borrower_total_exposure)",
      description: "Largest single borrower exposure",
      dataType: "Currency",
      aggregation: "MAX",
      format: "$#,##0.00",
      category: "Concentration Risk"
    }
  ],

  attributes: [
    {
      name: "loan_type",
      displayName: "Loan Type",
      field: "loan_type_code",
      dataType: "String",
      description: "Type of commercial loan (C&I, CRE, LOC, Term Loan)",
      lookup: "dim_loan_type"
    },
    {
      name: "industry",
      displayName: "Borrower Industry",
      field: "naics_code",
      dataType: "String",
      description: "Borrower industry classification (NAICS)",
      lookup: "dim_industry"
    },
    {
      name: "risk_rating",
      displayName: "Risk Rating",
      field: "risk_rating_code",
      dataType: "String",
      description: "Internal risk rating (1-10 or Pass/Watch/Substandard/Doubtful/Loss)",
      lookup: "dim_risk_rating"
    },
    {
      name: "relationship_manager",
      displayName: "Relationship Manager",
      field: "rm_employee_id",
      dataType: "String",
      description: "Assigned commercial relationship manager",
      lookup: "dim_employee"
    },
    {
      name: "collateral_type",
      displayName: "Collateral Type",
      field: "collateral_type_code",
      dataType: "String",
      description: "Primary collateral type (Real Estate, Equipment, AR, Inventory)",
      lookup: "dim_collateral_type"
    },
    {
      name: "loan_purpose",
      displayName: "Loan Purpose",
      field: "loan_purpose_code",
      dataType: "String",
      description: "Purpose of loan (Working Capital, Acquisition, Expansion)",
      lookup: "dim_loan_purpose"
    },
    {
      name: "rate_type",
      displayName: "Rate Type",
      field: "rate_type_code",
      dataType: "String",
      description: "Interest rate type (Fixed, Variable, Prime-Based)",
      lookup: "dim_rate_type"
    },
    {
      name: "geographic_region",
      displayName: "Geographic Region",
      field: "region_code",
      dataType: "String",
      description: "Geographic region of borrower",
      lookup: "dim_geography"
    },
    {
      name: "company_size",
      displayName: "Company Size",
      field: "CASE WHEN annual_revenue < 5000000 THEN 'Small (<$5M)' WHEN annual_revenue < 50000000 THEN 'Middle Market ($5M-$50M)' ELSE 'Large ($50M+)' END",
      dataType: "String",
      description: "Borrower size by annual revenue"
    },
    {
      name: "loan_status",
      displayName: "Loan Status",
      field: "loan_status_code",
      dataType: "String",
      description: "Current loan status (Active, Paid Off, Charged Off, Non-Accrual)",
      lookup: "dim_loan_status"
    }
  ],

  hierarchies: [
    {
      name: "Loan Product Hierarchy",
      levels: ["Loan Category", "Loan Type", "Loan Subtype"],
      description: "Commercial loan product classification"
    },
    {
      name: "Industry Hierarchy",
      levels: ["NAICS Sector", "NAICS Subsector", "NAICS Industry Group", "NAICS Industry"],
      description: "Borrower industry classification (NAICS)"
    },
    {
      name: "Risk Rating Hierarchy",
      levels: ["Risk Category", "Risk Rating", "Risk Grade"],
      description: "Credit risk classification"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City"],
      description: "Borrower geographic location"
    },
    {
      name: "Time Hierarchy",
      levels: ["Vintage Year", "Vintage Quarter", "Vintage Month"],
      description: "Loan origination time"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_loan_commitments", "total_outstanding_balance", "unfunded_commitments", "utilization_rate"],
      description: "Core portfolio metrics",
      icon: "💼"
    },
    {
      name: "Loan Production",
      measures: ["new_loan_originations", "new_origination_volume"],
      description: "New loan origination activity",
      icon: "📈"
    },
    {
      name: "Revenue",
      measures: ["interest_income", "fee_income", "weighted_avg_rate"],
      description: "Loan revenue and pricing",
      icon: "💰"
    },
    {
      name: "Credit Quality",
      measures: ["criticized_loans", "npl_balance", "npl_ratio", "covenant_breaches", "avg_ltv_ratio"],
      description: "Asset quality and risk metrics",
      icon: "⚠️"
    },
    {
      name: "CECL & Reserves",
      measures: ["provision_expense", "alll_balance", "reserve_coverage_ratio"],
      description: "Allowance and provision metrics",
      icon: "🛡️"
    },
    {
      name: "Concentration Risk",
      measures: ["concentration_largest_borrower"],
      description: "Portfolio concentration metrics",
      icon: "📊"
    }
  ]
};

export default loansCommercialSemanticLayer;
