// LOANS & LENDING - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Portfolio Management, Credit Risk, CECL, Origination, Servicing, Profitability

export type SemanticMeasure = {
  name: string;
  technical_name: string;
  aggregation:
    | "SUM"
    | "AVG"
    | "COUNT"
    | "COUNT DISTINCT"
    | "MIN"
    | "MAX"
    | "CALCULATED";
  format: "currency" | "percent" | "number" | "integer" | "date" | "datetime";
  description: string;
  sql: string;
  folder: string;
  type?: "additive" | "semi-additive" | "non-additive";
  hidden?: boolean;
};

export type SemanticAttribute = {
  name: string;
  technical_name: string;
  field: string;
  description: string;
  datatype?: "string" | "number" | "date" | "boolean";
  folder?: string;
  hidden?: boolean;
};

export type SemanticFolder = {
  name: string;
  description: string;
  measures: string[];
  icon?: string;
};

export type SemanticDrillPath = {
  name: string;
  levels: string[];
  description: string;
};

export const semanticLoansLayer = {
  domain: "loans",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Loans & Lending domain - supporting portfolio management, credit risk, CECL, and profitability analytics",

  measures: [
    // ========== PORTFOLIO METRICS ==========
    {
      name: "Total Loan Balances",
      technical_name: "total_loan_balances",
      aggregation: "SUM",
      format: "currency",
      description: "Sum of all outstanding loan principal balances",
      sql: "SUM(fact_loan_positions.principal_balance)",
      folder: "Portfolio Metrics",
      type: "additive",
    },
    {
      name: "Total Outstanding Principal",
      technical_name: "total_outstanding_principal",
      aggregation: "SUM",
      format: "currency",
      description:
        "Total principal balance outstanding across all active loans",
      sql: "SUM(fact_loan_positions.principal_balance) WHERE dim_loan_status.status_code = 'ACTIVE'",
      folder: "Portfolio Metrics",
      type: "additive",
    },
    {
      name: "Total Loan Count",
      technical_name: "total_loan_count",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Number of active loans in portfolio",
      sql: "COUNT(DISTINCT fact_loan_positions.loan_sk) WHERE dim_loan_status.status_code = 'ACTIVE'",
      folder: "Portfolio Metrics",
    },
    {
      name: "Average Loan Balance",
      technical_name: "avg_loan_balance",
      aggregation: "AVG",
      format: "currency",
      description: "Average loan balance across all active loans",
      sql: "AVG(fact_loan_positions.principal_balance)",
      folder: "Portfolio Metrics",
    },
    {
      name: "Unfunded Commitments",
      technical_name: "unfunded_commitments",
      aggregation: "SUM",
      format: "currency",
      description:
        "Total unfunded loan commitments (credit lines not yet drawn)",
      sql: "SUM(fact_loan_positions.unfunded_commitment_amount)",
      folder: "Portfolio Metrics",
      type: "additive",
    },

    // ========== CREDIT RISK METRICS ==========
    {
      name: "Non-Performing Loans (NPL)",
      technical_name: "non_performing_loans",
      aggregation: "SUM",
      format: "currency",
      description: "Total balance of loans with 90+ days past due",
      sql: "SUM(fact_loan_positions.principal_balance) WHERE fact_loan_delinquency.days_past_due >= 90",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "NPL Ratio",
      technical_name: "npl_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Non-performing loans as % of total loan balances",
      sql: "(SUM(CASE WHEN fact_loan_delinquency.days_past_due >= 90 THEN fact_loan_positions.principal_balance ELSE 0 END) / NULLIF(SUM(fact_loan_positions.principal_balance), 0)) * 100",
      folder: "Credit Risk",
      type: "non-additive",
    },
    {
      name: "Total CECL Allowance",
      technical_name: "total_cecl_allowance",
      aggregation: "SUM",
      format: "currency",
      description: "Total Current Expected Credit Loss allowance (CECL/IFRS 9)",
      sql: "SUM(fact_loan_credit_loss.allowance_amount)",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "Coverage Ratio",
      technical_name: "coverage_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "CECL allowance as % of non-performing loans",
      sql: "(SUM(fact_loan_credit_loss.allowance_amount) / NULLIF(SUM(CASE WHEN fact_loan_delinquency.days_past_due >= 90 THEN fact_loan_positions.principal_balance END), 0)) * 100",
      folder: "Credit Risk",
      type: "non-additive",
    },
    {
      name: "Net Charge-Offs",
      technical_name: "net_charge_offs",
      aggregation: "SUM",
      format: "currency",
      description: "Total charge-offs minus recoveries",
      sql: "SUM(fact_loan_credit_loss.chargeoff_amount - fact_loan_credit_loss.recovery_amount)",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "Charge-Off Rate",
      technical_name: "charge_off_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Net charge-offs as % of average loan balances (annualized)",
      sql: "(SUM(fact_loan_credit_loss.chargeoff_amount - fact_loan_credit_loss.recovery_amount) * 12 / AVG(fact_loan_positions.principal_balance)) * 100",
      folder: "Credit Risk",
      type: "non-additive",
    },
    {
      name: "Provision Expense",
      technical_name: "provision_expense",
      aggregation: "SUM",
      format: "currency",
      description: "Total CECL provision expense for the period",
      sql: "SUM(fact_loan_credit_loss.provision_expense)",
      folder: "Credit Risk",
      type: "additive",
    },

    // ========== PROFITABILITY METRICS ==========
    {
      name: "Total Interest Income",
      technical_name: "total_interest_income",
      aggregation: "SUM",
      format: "currency",
      description: "Total interest earned on loan portfolio",
      sql: "SUM(fact_loan_profitability.interest_income)",
      folder: "Profitability",
      type: "additive",
    },
    {
      name: "Loan Yield",
      technical_name: "loan_yield",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Interest income as % of average balances (annualized)",
      sql: "(SUM(fact_loan_profitability.interest_income) * 12 / AVG(fact_loan_positions.principal_balance)) * 100",
      folder: "Profitability",
      type: "non-additive",
    },
    {
      name: "Net Interest Margin (NIM)",
      technical_name: "net_interest_margin",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Interest income minus funding cost, as % of balances",
      sql: "((SUM(fact_loan_profitability.interest_income) - SUM(fact_loan_profitability.funding_cost)) * 12 / AVG(fact_loan_positions.principal_balance)) * 100",
      folder: "Profitability",
      type: "non-additive",
    },
    {
      name: "Total Fee Income",
      technical_name: "total_fee_income",
      aggregation: "SUM",
      format: "currency",
      description:
        "Total fees collected (origination, servicing, late fees, etc.)",
      sql: "SUM(fact_loan_profitability.fee_income)",
      folder: "Profitability",
      type: "additive",
    },
    {
      name: "Net Loan Revenue",
      technical_name: "net_loan_revenue",
      aggregation: "SUM",
      format: "currency",
      description: "Total revenue (interest + fees - provision expense)",
      sql: "SUM(fact_loan_profitability.interest_income + fact_loan_profitability.fee_income - fact_loan_credit_loss.provision_expense)",
      folder: "Profitability",
      type: "additive",
    },

    // ========== ORIGINATION METRICS ==========
    {
      name: "Loan Origination Volume",
      technical_name: "loan_origination_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total funded loan amount for new originations",
      sql: "SUM(fact_loan_originations.funded_amount)",
      folder: "Origination",
      type: "additive",
    },
    {
      name: "Origination Count",
      technical_name: "origination_count",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of loans originated in period",
      sql: "COUNT(fact_loan_originations.loan_sk)",
      folder: "Origination",
    },
    {
      name: "Average FICO Score",
      technical_name: "avg_fico_score",
      aggregation: "AVG",
      format: "integer",
      description: "Average credit score at origination",
      sql: "AVG(fact_loan_originations.fico_score)",
      folder: "Origination",
    },
    {
      name: "Average LTV",
      technical_name: "avg_ltv",
      aggregation: "AVG",
      format: "percent",
      description: "Average loan-to-value ratio at origination",
      sql: "AVG(fact_loan_originations.ltv)",
      folder: "Origination",
    },
    {
      name: "Average DTI",
      technical_name: "avg_dti",
      aggregation: "AVG",
      format: "percent",
      description: "Average debt-to-income ratio at origination",
      sql: "AVG(fact_loan_originations.dti)",
      folder: "Origination",
    },

    // ========== DELINQUENCY METRICS ==========
    {
      name: "Delinquency Rate (30+ DPD)",
      technical_name: "delinquency_rate_30",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Loans 30+ days past due as % of total loans",
      sql: "(SUM(CASE WHEN fact_loan_delinquency.days_past_due >= 30 THEN fact_loan_positions.principal_balance ELSE 0 END) / NULLIF(SUM(fact_loan_positions.principal_balance), 0)) * 100",
      folder: "Delinquency",
      type: "non-additive",
    },
    {
      name: "Delinquency Rate (60+ DPD)",
      technical_name: "delinquency_rate_60",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Loans 60+ days past due as % of total loans",
      sql: "(SUM(CASE WHEN fact_loan_delinquency.days_past_due >= 60 THEN fact_loan_positions.principal_balance ELSE 0 END) / NULLIF(SUM(fact_loan_positions.principal_balance), 0)) * 100",
      folder: "Delinquency",
      type: "non-additive",
    },
    {
      name: "Delinquency Rate (90+ DPD)",
      technical_name: "delinquency_rate_90",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Loans 90+ days past due as % of total loans (NPL rate)",
      sql: "(SUM(CASE WHEN fact_loan_delinquency.days_past_due >= 90 THEN fact_loan_positions.principal_balance ELSE 0 END) / NULLIF(SUM(fact_loan_positions.principal_balance), 0)) * 100",
      folder: "Delinquency",
      type: "non-additive",
    },

    // ========== SERVICING METRICS ==========
    {
      name: "Total Payments Received",
      technical_name: "total_payments_received",
      aggregation: "SUM",
      format: "currency",
      description: "Total loan payments received in period",
      sql: "SUM(fact_loan_payments.payment_amount)",
      folder: "Servicing",
      type: "additive",
    },
    {
      name: "Prepayment Amount",
      technical_name: "prepayment_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Total prepayments (payments above scheduled amount)",
      sql: "SUM(fact_loan_payments.prepayment_amount)",
      folder: "Servicing",
      type: "additive",
    },
  ],

  attributes: [
    {
      name: "Loan Product",
      technical_name: "loan_product",
      field: "dim_loan_product.product_name",
      description:
        "Loan product type (Mortgage, Auto, Personal, Commercial, etc.)",
      datatype: "string",
      folder: "Product & Purpose",
    },
    {
      name: "Product Category",
      technical_name: "product_category",
      field: "dim_loan_product.product_category",
      description:
        "High-level product category (Consumer, Commercial, Real Estate)",
      datatype: "string",
      folder: "Product & Purpose",
    },
    {
      name: "Loan Purpose",
      technical_name: "loan_purpose",
      field: "dim_loan_purpose.purpose_desc",
      description:
        "Purpose of the loan (Purchase, Refinance, Home Improvement, Business Expansion, etc.)",
      datatype: "string",
      folder: "Product & Purpose",
    },
    {
      name: "Risk Rating",
      technical_name: "risk_rating",
      field: "dim_risk_rating.rating_desc",
      description:
        "Internal risk rating (Pass, Special Mention, Substandard, Doubtful, Loss)",
      datatype: "string",
      folder: "Risk & Credit",
    },
    {
      name: "Borrower Segment",
      technical_name: "borrower_segment",
      field: "dim_borrower.customer_segment",
      description:
        "Borrower segment (Retail, Small Business, Middle Market, Commercial)",
      datatype: "string",
      folder: "Customer",
    },
    {
      name: "Loan Officer",
      technical_name: "loan_officer",
      field: "dim_loan_officer.officer_name",
      description: "Loan officer or originator name",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Branch",
      technical_name: "branch",
      field: "dim_branch.branch_name",
      description: "Originating branch name",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Region",
      technical_name: "region",
      field: "dim_geography.region_name",
      description: "Geographic region",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Loan Status",
      technical_name: "loan_status",
      field: "dim_loan_status.status_desc",
      description:
        "Loan status (Active, Paid Off, Charged Off, In Modification, etc.)",
      datatype: "string",
      folder: "Status",
    },
    {
      name: "Delinquency Bucket",
      technical_name: "delinquency_bucket",
      field: "dim_delinquency_bucket.bucket_desc",
      description:
        "Delinquency aging bucket (Current, 30-59 DPD, 60-89 DPD, 90+ DPD)",
      datatype: "string",
      folder: "Risk & Credit",
    },
    {
      name: "Industry",
      technical_name: "industry",
      field: "dim_industry.industry_name",
      description:
        "Borrower industry (for commercial loans) - NAICS classification",
      datatype: "string",
      folder: "Customer",
    },
    {
      name: "Collateral Type",
      technical_name: "collateral_type",
      field: "dim_collateral_type.collateral_desc",
      description:
        "Type of collateral securing the loan (Real Estate, Equipment, Inventory, etc.)",
      datatype: "string",
      folder: "Collateral",
    },
  ],

  folders: [
    {
      name: "Portfolio Metrics",
      description: "Overall loan portfolio size, composition, and growth",
      measures: [
        "total_loan_balances",
        "total_outstanding_principal",
        "total_loan_count",
        "avg_loan_balance",
        "unfunded_commitments",
      ],
      icon: "💼",
    },
    {
      name: "Credit Risk",
      description:
        "Credit quality, delinquency, loss metrics, and CECL allowance",
      measures: [
        "non_performing_loans",
        "npl_ratio",
        "total_cecl_allowance",
        "coverage_ratio",
        "net_charge_offs",
        "charge_off_rate",
        "provision_expense",
      ],
      icon: "⚠️",
    },
    {
      name: "Profitability",
      description: "Interest income, fees, yield, and net interest margin",
      measures: [
        "total_interest_income",
        "loan_yield",
        "net_interest_margin",
        "total_fee_income",
        "net_loan_revenue",
      ],
      icon: "💰",
    },
    {
      name: "Origination",
      description:
        "New loan origination volume, credit quality metrics, and underwriting",
      measures: [
        "loan_origination_volume",
        "origination_count",
        "avg_fico_score",
        "avg_ltv",
        "avg_dti",
      ],
      icon: "📝",
    },
    {
      name: "Delinquency",
      description: "Delinquency rates across aging buckets",
      measures: [
        "delinquency_rate_30",
        "delinquency_rate_60",
        "delinquency_rate_90",
      ],
      icon: "📉",
    },
    {
      name: "Servicing",
      description: "Loan servicing, payment, and prepayment metrics",
      measures: ["total_payments_received", "prepayment_amount"],
      icon: "🔄",
    },
  ],

  drillPaths: [
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Type", "Product Name"],
      description:
        "Drill down from high-level product category to specific loan products",
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Region", "State", "Branch"],
      description: "Drill down by geographic location",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Date"],
      description: "Drill down by time period for trend analysis",
    },
    {
      name: "Risk Hierarchy",
      levels: ["Risk Rating Category", "Risk Rating", "Delinquency Bucket"],
      description: "Drill down by credit risk profile",
    },
    {
      name: "Customer Hierarchy",
      levels: ["Borrower Segment", "Industry", "Borrower"],
      description: "Drill down by customer segmentation",
    },
  ],

  // Key metric SQL for complex calculations and executive dashboards
  keyMetricSQL: {
    nplRatio: `
-- Non-Performing Loan Ratio
-- 90+ DPD balances as % of total balances
SELECT 
  DATE_TRUNC('month', position_date) as month,
  SUM(CASE WHEN dpd.days_past_due >= 90 THEN pos.principal_balance ELSE 0 END) as npl_balance,
  SUM(pos.principal_balance) as total_balance,
  (SUM(CASE WHEN dpd.days_past_due >= 90 THEN pos.principal_balance ELSE 0 END) / 
   NULLIF(SUM(pos.principal_balance), 0)) * 100 as npl_ratio_pct
FROM gold.fact_loan_positions pos
LEFT JOIN gold.fact_loan_delinquency dpd 
  ON pos.loan_sk = dpd.loan_sk AND pos.date_sk = dpd.date_sk
JOIN gold.dim_loan_status ls ON pos.loan_status_sk = ls.loan_status_sk
WHERE ls.status_code = 'ACTIVE'
GROUP BY DATE_TRUNC('month', position_date)
ORDER BY month DESC;
`,

    ceclCoverage: `
-- CECL Coverage Ratio
-- Allowance as % of NPL balances
SELECT 
  DATE_TRUNC('month', acl.reporting_date) as month,
  SUM(acl.allowance_amount) as total_allowance,
  SUM(CASE WHEN dpd.days_past_due >= 90 THEN pos.principal_balance ELSE 0 END) as npl_balance,
  (SUM(acl.allowance_amount) / 
   NULLIF(SUM(CASE WHEN dpd.days_past_due >= 90 THEN pos.principal_balance END), 0)) * 100 as coverage_ratio_pct
FROM gold.fact_loan_credit_loss acl
JOIN gold.fact_loan_positions pos 
  ON acl.loan_sk = pos.loan_sk AND acl.date_sk = pos.date_sk
LEFT JOIN gold.fact_loan_delinquency dpd 
  ON pos.loan_sk = dpd.loan_sk AND pos.date_sk = dpd.date_sk
GROUP BY DATE_TRUNC('month', acl.reporting_date)
ORDER BY month DESC;
`,

    loanYieldByProduct: `
-- Loan Yield by Product Category
-- Annualized yield for each loan product
SELECT 
  lp.product_category,
  lp.product_name,
  SUM(prof.interest_income) as total_interest,
  AVG(pos.principal_balance) as avg_balance,
  (SUM(prof.interest_income) * 12 / AVG(pos.principal_balance)) * 100 as annualized_yield_pct
FROM gold.fact_loan_profitability prof
JOIN gold.fact_loan_positions pos 
  ON prof.loan_sk = pos.loan_sk AND prof.date_sk = pos.date_sk
JOIN gold.dim_loan l ON pos.loan_sk = l.loan_sk
JOIN gold.dim_loan_product lp ON l.product_sk = lp.product_sk
WHERE prof.reporting_date >= DATE_TRUNC('year', CURRENT_DATE())
GROUP BY lp.product_category, lp.product_name
ORDER BY annualized_yield_pct DESC;
`,

    originationTrends: `
-- Loan Origination Trends with Credit Quality
-- Monthly origination volume and average credit metrics
SELECT 
  DATE_TRUNC('month', orig.origination_date) as month,
  COUNT(DISTINCT orig.loan_sk) as loan_count,
  SUM(orig.funded_amount) as total_volume,
  AVG(orig.funded_amount) as avg_loan_size,
  AVG(orig.fico_score) as avg_fico,
  AVG(orig.ltv) as avg_ltv,
  AVG(orig.dti) as avg_dti,
  lp.product_category
FROM gold.fact_loan_originations orig
JOIN gold.dim_loan l ON orig.loan_sk = l.loan_sk
JOIN gold.dim_loan_product lp ON l.product_sk = lp.product_sk
WHERE orig.origination_date >= DATE_TRUNC('year', CURRENT_DATE()) - INTERVAL '2 years'
GROUP BY DATE_TRUNC('month', orig.origination_date), lp.product_category
ORDER BY month DESC, product_category;
`,
  },
};

// Export for use in BI tools, data catalogs, and reporting frameworks
export default semanticLoansLayer;
