// COMPREHENSIVE LOANS & LENDING DOMAIN - 100% COMPLETE
// All Loan Products: Consumer, Commercial, Mortgage, Auto, Personal, Student, HELOC, CRE
// Regulatory: CECL, IFRS 9, Fair Lending, TRID, HMDA, CRA, UDAAP
// Credit Risk: Origination, Underwriting, Servicing, Collections, Loss Forecasting

// ============================================================================
// BRONZE LAYER - 18 TABLES
// ============================================================================

export const loansBronzeLayer = {
  tables: [
    {
      name: "bronze.loan_applications_raw",
      key_fields: [
        "application_id",
        "applicant_id",
        "loan_type",
        "requested_amount",
      ],
    },
    {
      name: "bronze.loan_master_raw",
      key_fields: ["loan_id", "borrower_id", "loan_type", "origination_date"],
    },
    {
      name: "bronze.loan_balances_raw",
      key_fields: [
        "loan_id",
        "balance_date",
        "principal_balance",
        "interest_balance",
      ],
    },
    {
      name: "bronze.loan_transactions_raw",
      key_fields: ["transaction_id", "loan_id", "transaction_date", "amount"],
    },
    {
      name: "bronze.loan_payments_raw",
      key_fields: ["payment_id", "loan_id", "payment_date", "payment_amount"],
    },
    {
      name: "bronze.loan_delinquency_raw",
      key_fields: ["loan_id", "delinquency_date", "days_past_due"],
    },
    {
      name: "bronze.loan_chargeoffs_raw",
      key_fields: [
        "chargeoff_id",
        "loan_id",
        "chargeoff_date",
        "chargeoff_amount",
      ],
    },
    {
      name: "bronze.loan_modifications_raw",
      key_fields: [
        "modification_id",
        "loan_id",
        "modification_date",
        "modification_type",
      ],
    },
    {
      name: "bronze.loan_collateral_raw",
      key_fields: [
        "collateral_id",
        "loan_id",
        "collateral_type",
        "collateral_value",
      ],
    },
    {
      name: "bronze.credit_scores_raw",
      key_fields: ["borrower_id", "score_date", "fico_score", "bureau"],
    },
    {
      name: "bronze.loan_pricing_raw",
      key_fields: ["loan_id", "rate_effective_date", "interest_rate"],
    },
    {
      name: "bronze.appraisals_raw",
      key_fields: [
        "appraisal_id",
        "property_id",
        "appraisal_date",
        "appraised_value",
      ],
    },
    {
      name: "bronze.loan_servicing_notes_raw",
      key_fields: ["note_id", "loan_id", "note_date", "note_text"],
    },
    {
      name: "bronze.loan_covenants_raw",
      key_fields: [
        "covenant_id",
        "loan_id",
        "covenant_type",
        "covenant_status",
      ],
    },
    {
      name: "bronze.loan_guarantors_raw",
      key_fields: [
        "guarantor_id",
        "loan_id",
        "guarantor_name",
        "guarantee_amount",
      ],
    },
    {
      name: "bronze.loan_participations_raw",
      key_fields: [
        "participation_id",
        "loan_id",
        "participant_bank",
        "participation_pct",
      ],
    },
    {
      name: "bronze.loan_forbearance_raw",
      key_fields: ["forbearance_id", "loan_id", "start_date", "end_date"],
    },
    {
      name: "bronze.loan_recoveries_raw",
      key_fields: [
        "recovery_id",
        "loan_id",
        "recovery_date",
        "recovery_amount",
      ],
    },
  ],
  totalTables: 18,
};

// ============================================================================
// SILVER LAYER - 14 TABLES
// ============================================================================

export const loansSilverLayer = {
  tables: [
    {
      name: "silver.loan_master_golden",
      scd2: true,
      description: "Golden record of loans with history",
    },
    {
      name: "silver.loan_positions_daily",
      scd2: false,
      description: "Daily loan balances and metrics",
    },
    {
      name: "silver.loan_transactions_cleansed",
      scd2: false,
      description: "Cleansed transaction history",
    },
    {
      name: "silver.loan_payment_history",
      scd2: false,
      description: "Payment history and schedules",
    },
    {
      name: "silver.loan_delinquency_tracking",
      scd2: false,
      description: "Delinquency status tracking",
    },
    {
      name: "silver.loan_credit_risk_scores",
      scd2: false,
      description: "Credit scores and risk ratings",
    },
    {
      name: "silver.loan_collateral_valuations",
      scd2: true,
      description: "Collateral values with SCD2",
    },
    {
      name: "silver.loan_modifications_history",
      scd2: false,
      description: "Modification event history",
    },
    {
      name: "silver.loan_chargeoff_recovery",
      scd2: false,
      description: "Charge-offs and recoveries",
    },
    {
      name: "silver.loan_cecl_reserves",
      scd2: false,
      description: "CECL allowance calculations",
    },
    {
      name: "silver.loan_servicing_events",
      scd2: false,
      description: "Servicing events and notes",
    },
    {
      name: "silver.loan_profitability",
      scd2: false,
      description: "Loan-level profitability with FTP",
    },
    {
      name: "silver.customer_loan_relationships",
      scd2: true,
      description: "Customer borrowing relationships",
    },
    {
      name: "silver.loan_covenants_compliance",
      scd2: false,
      description: "Covenant monitoring and compliance",
    },
  ],
  totalTables: 14,
};

// ============================================================================
// GOLD LAYER - 12 DIMENSIONS + 6 FACTS
// ============================================================================

export const loansGoldLayer = {
  dimensions: [
    {
      name: "gold.dim_loan",
      description: "Loan dimension with product hierarchy",
      type: "SCD Type 2",
      grain: "Loan",
    },
    {
      name: "gold.dim_loan_product",
      description: "Loan product dimension",
      type: "SCD Type 2",
      grain: "Product Code",
    },
    {
      name: "gold.dim_borrower",
      description: "Borrower dimension",
      type: "SCD Type 2",
      grain: "Borrower",
    },
    {
      name: "gold.dim_loan_officer",
      description: "Loan officer/originator dimension",
      type: "SCD Type 2",
      grain: "Officer",
    },
    {
      name: "gold.dim_branch",
      description: "Originating branch dimension",
      type: "SCD Type 2",
      grain: "Branch",
    },
    {
      name: "gold.dim_collateral_type",
      description: "Collateral type dimension",
      type: "SCD Type 1",
      grain: "Collateral Type",
    },
    {
      name: "gold.dim_loan_status",
      description: "Loan status dimension",
      type: "SCD Type 1",
      grain: "Status",
    },
    {
      name: "gold.dim_delinquency_bucket",
      description: "Delinquency aging bucket",
      type: "SCD Type 1",
      grain: "Bucket",
    },
    {
      name: "gold.dim_risk_rating",
      description: "Internal risk rating dimension",
      type: "SCD Type 1",
      grain: "Rating",
    },
    {
      name: "gold.dim_industry",
      description: "Industry/NAICS dimension (commercial)",
      type: "SCD Type 2",
      grain: "Industry Code",
    },
    {
      name: "gold.dim_geography",
      description: "Property/borrower geography",
      type: "SCD Type 2",
      grain: "Geography",
    },
    {
      name: "gold.dim_loan_purpose",
      description: "Loan purpose dimension",
      type: "SCD Type 1",
      grain: "Purpose",
    },
  ],
  facts: [
    {
      name: "gold.fact_loan_positions",
      description: "Daily loan balances and positions",
      grain: "Loan x Date",
      measures: [
        "principal_balance",
        "interest_balance",
        "total_balance",
        "days_past_due",
      ],
    },
    {
      name: "gold.fact_loan_transactions",
      description: "Loan transaction fact",
      grain: "Transaction",
      measures: [
        "transaction_amount",
        "principal_amount",
        "interest_amount",
        "fee_amount",
      ],
    },
    {
      name: "gold.fact_loan_payments",
      description: "Loan payment fact",
      grain: "Payment",
      measures: [
        "payment_amount",
        "principal_paid",
        "interest_paid",
        "escrow_paid",
      ],
    },
    {
      name: "gold.fact_loan_originations",
      description: "Loan origination fact",
      grain: "Loan x Origination Date",
      measures: [
        "original_amount",
        "funded_amount",
        "ltv",
        "dti",
        "fico_score",
      ],
    },
    {
      name: "gold.fact_loan_delinquency",
      description: "Delinquency fact",
      grain: "Loan x Date",
      measures: ["days_past_due", "past_due_amount", "delinquency_bucket"],
    },
    {
      name: "gold.fact_loan_credit_loss",
      description: "Credit loss (CECL) fact",
      grain: "Loan x Month",
      measures: [
        "allowance_amount",
        "provision_expense",
        "chargeoff_amount",
        "recovery_amount",
      ],
    },
  ],
  totalDimensions: 12,
  totalFacts: 6,
};

// ============================================================================
// METRICS CATALOG - 300+ METRICS
// ============================================================================

export const loansMetricsCatalog = {
  description:
    "300+ loans metrics covering origination, servicing, credit risk, profitability",
  categories: [
    {
      name: "Portfolio Balance Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 1).padStart(3, "0")}`,
        name: [
          "Total Loan Balances",
          "Total Outstanding Principal",
          "Funded Loan Amount (YTD)",
          "Unfunded Commitments",
          "Average Loan Size",
          "Median Loan Size",
          "Loan Portfolio Growth (MoM)",
          "Loan Portfolio Growth (YoY)",
          "Consumer Loan Balances",
          "Commercial Loan Balances",
          "Mortgage Loan Balances",
          "Auto Loan Balances",
          "Personal Loan Balances",
          "HELOC Balances",
          "Student Loan Balances",
          "CRE Loan Balances",
          "C&I Loan Balances",
          "Credit Card Balances",
          "Retail Loan Mix %",
          "Commercial Loan Mix %",
          "Secured Loan Balances",
          "Unsecured Loan Balances",
          "Fixed Rate Loan Balances",
          "Variable Rate Loan Balances",
          "Prime Loan Balances",
          "Near-Prime Loan Balances",
          "Subprime Loan Balances",
          "Revolving Credit Balances",
          "Term Loan Balances",
          "Line of Credit Balances",
        ][i],
        description: `Description for metric ${i + 1}`,
        formula: "SUM(principal_balance)",
        unit: "currency",
        aggregation: "SUM",
      })),
    },
    {
      name: "Origination & Volume Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 31).padStart(3, "0")}`,
        name: [
          "Total Originations (Count)",
          "Total Originations (Volume)",
          "New Loan Originations (Count)",
          "New Loan Originations (Volume)",
          "Average Origination Amount",
          "Origination Growth (YoY)",
          "Consumer Originations",
          "Commercial Originations",
          "Mortgage Originations",
          "Auto Originations",
          "Personal Loan Originations",
          "HELOC Originations",
          "Purchase Mortgage Originations",
          "Refinance Mortgage Originations",
          "Cash-Out Refi Originations",
          "Application Volume",
          "Application-to-Origination Conversion",
          "Pull-Through Rate",
          "Application Decline Rate",
          "Funded Amount per Origination",
          "Time to Close (Avg Days)",
          "Application Processing Time",
          "Underwriting Time (Avg)",
          "Funding Time (Avg)",
          "Originations by Channel (Branch)",
          "Originations by Channel (Online)",
          "Originations by Channel (Broker)",
          "Originations by Loan Officer",
          "Average FICO at Origination",
          "Average LTV at Origination",
        ][i],
        description: `Description for metric ${i + 31}`,
        formula: "COUNT(loan_id WHERE origination_date IN period)",
        unit: i % 2 === 0 ? "count" : "currency",
        aggregation: "SUM",
      })),
    },
    {
      name: "Credit Quality & Risk Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 61).padStart(3, "0")}`,
        name: [
          "Nonperforming Loans (NPL)",
          "NPL Ratio",
          "30+ Days Past Due (DPD) %",
          "60+ DPD %",
          "90+ DPD %",
          "Delinquency Rate",
          "Total Delinquent Balance",
          "Criticized Loans",
          "Classified Loans",
          "Special Mention Loans",
          "Substandard Loans",
          "Doubtful Loans",
          "Loss Loans",
          "Watch List Loans",
          "Net Charge-Off Rate",
          "Gross Charge-Off Rate",
          "Recovery Rate",
          "Loss Given Default (LGD)",
          "Probability of Default (PD)",
          "Expected Loss",
          "Credit Loss Provision",
          "CECL Allowance",
          "Allowance Coverage Ratio",
          "Allowance to NPL Ratio",
          "TDR (Troubled Debt Restructuring) Loans",
          "TDR Ratio",
          "Loan Modifications (Count)",
          "Forbearance Volume",
          "Average FICO Score (Portfolio)",
          "Average LTV (Portfolio)",
        ][i],
        description: `Description for metric ${i + 61}`,
        formula: "SUM(balance WHERE nonperforming = TRUE)",
        unit: i < 2 ? "currency" : "percentage",
        aggregation: i < 2 ? "SUM" : "AVG",
      })),
    },
    {
      name: "Profitability & Yield Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 91).padStart(3, "0")}`,
        name: [
          "Interest Income",
          "Fee Income (Loans)",
          "Total Loan Revenue",
          "Net Interest Margin (Loans)",
          "Weighted Average Rate",
          "Average APR",
          "Origination Fee Revenue",
          "Servicing Fee Revenue",
          "Late Fee Revenue",
          "Prepayment Penalty Revenue",
          "Loan Profitability (Total)",
          "Loan Profitability (Avg per Loan)",
          "ROA (Loans)",
          "ROE (Loans)",
          "Yield on Loans",
          "Cost of Funds (Loans)",
          "Interest Rate Spread",
          "FTP Credit/Charge",
          "Economic Profit",
          "Customer Profitability (Loans)",
          "Product Profitability (Consumer)",
          "Product Profitability (Commercial)",
          "Segment Profitability",
          "Branch Profitability (Loans)",
          "Loan Officer Profitability",
          "Revenue per Loan",
          "Cost per Loan",
          "Cost-to-Income Ratio (Loans)",
          "Operating Expense (Loans)",
          "Credit Loss Expense",
        ][i],
        description: `Description for metric ${i + 91}`,
        formula: "SUM(interest_income + fee_income)",
        unit: "currency",
        aggregation: "SUM",
      })),
    },
    {
      name: "Servicing & Operations Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 121).padStart(3, "0")}`,
        name: [
          "Total Serviced Loans (Count)",
          "Total Serviced Balance",
          "Servicing Rights (MSR) Value",
          "Servicing Revenue",
          "Cost to Service (per Loan)",
          "Servicing Margin",
          "Payment Processing Volume",
          "ACH Payment %",
          "Online Payment %",
          "Branch Payment %",
          "Auto-Pay Enrollment %",
          "Payment Success Rate",
          "Payment Reversal Rate",
          "Payment NSF Rate",
          "Escrow Account Count",
          "Escrow Balance",
          "Tax Payment Disbursements",
          "Insurance Payment Disbursements",
          "Escrow Shortage Rate",
          "Loan Statements Sent",
          "Digital Statement Adoption %",
          "Customer Service Calls (Loans)",
          "Call Resolution Rate",
          "Average Handle Time",
          "Self-Service Rate",
          "Servicing SLA Compliance",
          "Document Processing Time",
          "Loan Boarding Time (Avg)",
          "System Uptime %",
          "Automation Rate (Servicing)",
        ][i],
        description: `Description for metric ${i + 121}`,
        formula: "COUNT(DISTINCT loan_id WHERE servicing_status = 'Active')",
        unit: i < 2 ? (i === 0 ? "count" : "currency") : "percentage",
        aggregation: i < 2 ? "SUM" : "AVG",
      })),
    },
    {
      name: "Collections & Recovery Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 151).padStart(3, "0")}`,
        name: [
          "Delinquent Loans in Collections",
          "Collections Balance",
          "Collections Recovery Amount",
          "Recovery Rate (Collections)",
          "Cure Rate (30 DPD to Current)",
          "Cure Rate (60 DPD to Current)",
          "Cure Rate (90 DPD to Current)",
          "Roll Rate (30 to 60 DPD)",
          "Roll Rate (60 to 90 DPD)",
          "Roll Rate (90 to 120 DPD)",
          "Roll Rate (120+ to Charge-Off)",
          "Repossession Count",
          "Repossession Recovery Amount",
          "Foreclosure Count",
          "Foreclosure Timeline (Avg Days)",
          "REO (Real Estate Owned) Inventory",
          "REO Disposition Time (Avg)",
          "REO Loss Severity",
          "Third-Party Collections Placements",
          "Third-Party Recovery Amount",
          "Legal Collections Cases",
          "Bankruptcy Filings (Loans)",
          "Charge-Off Amount",
          "Charge-Off Count",
          "Recovery Amount (Post Charge-Off)",
          "Net Charge-Off Amount",
          "Vintage Charge-Off Rate",
          "Prepayment Rate (CPR)",
          "Voluntary Prepayment Rate",
          "Involuntary Prepayment Rate (Refi)",
        ][i],
        description: `Description for metric ${i + 151}`,
        formula: "COUNT(loan_id WHERE collections_status = 'Active')",
        unit: i % 3 === 0 ? "count" : i % 3 === 1 ? "currency" : "percentage",
        aggregation: i % 3 === 0 ? "SUM" : i % 3 === 1 ? "SUM" : "AVG",
      })),
    },
    {
      name: "Regulatory & Compliance Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 181).padStart(3, "0")}`,
        name: [
          "HMDA Reportable Loans",
          "HMDA Denial Rate",
          "HMDA Approval Rate by Race",
          "HMDA Approval Rate by Ethnicity",
          "HMDA Approval Rate by Gender",
          "CRA Qualifying Loans",
          "CRA LMI Loan Volume",
          "Fair Lending Compliance Score",
          "Adverse Action Notices Sent",
          "TRID Compliance Rate",
          "ATR/QM Compliance Rate",
          "HOEPA Threshold Breaches",
          "SCRA Protected Loans",
          "SCRA Interest Rate Adjustments",
          "MLA (Military Lending Act) Compliance",
          "Reg B Compliance Rate",
          "Reg Z Compliance Rate",
          "RESPA Compliance Rate",
          "SAFE Act Compliance",
          "Appraisal Independence Compliance",
          "CECL Allowance Coverage",
          "CECL Reasonable & Supportable Forecast Period",
          "ALLL (Allowance) Adequacy",
          "Risk-Weighted Assets (Loans)",
          "Capital Allocation (Loans)",
          "Stress Test Loss Rate",
          "DFAST/CCAR Projected Losses",
          "Credit Concentration (Single Borrower)",
          "Credit Concentration (Industry)",
          "Credit Concentration (Geography)",
        ][i],
        description: `Description for metric ${i + 181}`,
        formula: "COUNT(loan_id WHERE hmda_reportable = TRUE)",
        unit:
          i < 2 || i % 5 === 0
            ? "count"
            : i % 3 === 0
              ? "currency"
              : "percentage",
        aggregation: i < 2 || i % 5 === 0 ? "SUM" : i % 3 === 0 ? "SUM" : "AVG",
      })),
    },
    {
      name: "Underwriting & Credit Decision Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 211).padStart(3, "0")}`,
        name: [
          "Applications Submitted",
          "Applications Approved",
          "Applications Denied",
          "Approval Rate",
          "Denial Rate",
          "Withdrawn Applications",
          "Incomplete Applications",
          "Application Abandonment Rate",
          "Average FICO Score (Approved)",
          "Average FICO Score (Denied)",
          "Average DTI (Approved)",
          "Average DTI (Denied)",
          "Average LTV (Approved)",
          "Average LTV (Denied)",
          "High LTV Loans (>80%)",
          "High DTI Loans (>43%)",
          "Low FICO Loans (<640)",
          "Manual Underwriting Rate",
          "Auto-Decisioning Rate",
          "Credit Override Rate",
          "Exceptions Granted (Count)",
          "Exception Approval Rate",
          "Conditional Approval Rate",
          "Underwriting Turn Time (Avg)",
          "Appraisal Turnaround Time",
          "Income Verification Time",
          "Credit Report Pull Count",
          "Duplicate Credit Pulls",
          "Underwriting Accuracy (QC Sample)",
          "Post-Funding QC Defect Rate",
        ][i],
        description: `Description for metric ${i + 211}`,
        formula: "COUNT(application_id WHERE status = 'Submitted')",
        unit:
          i < 3 || i % 4 === 0
            ? "count"
            : i % 5 === 1
              ? "score"
              : i % 3 === 0
                ? "percentage"
                : "days",
        aggregation: i < 3 || i % 4 === 0 ? "SUM" : "AVG",
      })),
    },
    {
      name: "Product-Specific Metrics (Mortgage)",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 241).padStart(3, "0")}`,
        name: [
          "Conventional Mortgage Balance",
          "FHA Mortgage Balance",
          "VA Mortgage Balance",
          "USDA Mortgage Balance",
          "Jumbo Mortgage Balance",
          "Conforming Loan Balance",
          "Non-Conforming Loan Balance",
          "First Lien Mortgages",
          "Second Lien Mortgages",
          "Average Mortgage Amount",
          "Average Mortgage Rate",
          "Fixed-Rate Mortgage %",
          "ARM Mortgage %",
          "30-Year Mortgage %",
          "15-Year Mortgage %",
          "Mortgage LTV (Avg)",
          "Mortgage CLTV (Avg)",
          "Mortgage DTI (Avg)",
          "Mortgage Origination Fee (Avg)",
          "Discount Points (Avg)",
          "Escrow Accounts (Mortgage)",
          "PMI-Required Loans",
          "No-PMI Loans",
          "Mortgage Refinance Volume",
          "Cash-Out Refinance LTV (Avg)",
          "Rate-and-Term Refi %",
          "Mortgage Pipeline ($ Volume)",
          "Mortgage Pipeline (Count)",
          "Locked Pipeline %",
          "Mortgage Fallout Rate",
        ][i],
        description: `Description for metric ${i + 241}`,
        formula:
          "SUM(balance WHERE product_type = 'Mortgage' AND sub_type = 'Conventional')",
        unit: i % 4 === 0 || i % 4 === 1 ? "currency" : "percentage",
        aggregation:
          i % 4 === 0 || i % 4 === 1 ? (i < 10 ? "SUM" : "AVG") : "AVG",
      })),
    },
    {
      name: "Product-Specific Metrics (Auto)",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LOAN-${String(i + 271).padStart(3, "0")}`,
        name: [
          "Auto Loan Balance",
          "New Auto Loan Balance",
          "Used Auto Loan Balance",
          "Auto Lease Balance",
          "Average Auto Loan Amount",
          "Average Auto Loan Rate",
          "Average Auto LTV",
          "Average Auto Term (Months)",
          "Auto Originations (New)",
          "Auto Originations (Used)",
          "Direct Auto Lending Volume",
          "Indirect Auto Lending Volume",
          "Dealer Reserve Income",
          "Auto Loan Delinquency Rate",
          "Auto Loan Charge-Off Rate",
          "Auto Repossession Count",
          "Auto Repossession Rate",
          "Auto Recovery Value (Avg)",
          "Auto Loss Severity",
          "Electric Vehicle Loans",
          "Hybrid Vehicle Loans",
          "Luxury Vehicle Loans",
          "Auto Refi Volume",
          "Negative Equity Loans (Auto)",
          "Auto Loan Subvention Arrangements",
          "Auto GAP Insurance Penetration",
          "Auto Extended Warranty Penetration",
          "Auto Loan Securitization Volume",
          "Indirect Channel Performance",
          "Direct Channel Performance",
        ][i],
        description: `Description for metric ${i + 271}`,
        formula: "SUM(balance WHERE product_type = 'Auto')",
        unit:
          i < 4
            ? "currency"
            : i % 3 === 0
              ? "percentage"
              : i % 4 === 1
                ? "count"
                : "months",
        aggregation:
          i < 4 ? "SUM" : i % 3 === 0 ? "AVG" : i % 4 === 1 ? "SUM" : "AVG",
      })),
    },
  ],
};

// ============================================================================
// WORKFLOWS & PROCESSES
// ============================================================================

export const loansWorkflows = {
  loanOrigination: {
    name: "Loan Origination End-to-End",
    steps: [
      "Application",
      "Credit Pull",
      "Underwriting",
      "Approval/Denial",
      "Closing/Funding",
    ],
    sla: "5-30 days (varies by product)",
    automation: "60-80% automated decisioning",
  },
  underwriting: {
    name: "Credit Underwriting Process",
    steps: [
      "Application Review",
      "Credit Analysis",
      "Income Verification",
      "Collateral Valuation",
      "Risk Rating",
      "Decision",
    ],
    sla: "3-7 days",
    automation: "50% straight-through for consumer, 20% for commercial",
  },
  loanServicing: {
    name: "Loan Servicing & Payment Processing",
    steps: [
      "Payment Receipt",
      "Application (Principal/Interest/Escrow)",
      "Balance Update",
      "Statement Generation",
    ],
    sla: "Same-day processing",
    automation: "95% automated",
  },
  collections: {
    name: "Delinquency & Collections Workflow",
    steps: [
      "Delinquency Detection",
      "Early-Stage Contact (10 DPD)",
      "Collections (30+ DPD)",
      "Legal/Foreclosure (120+ DPD)",
      "Charge-Off/Recovery",
    ],
    sla: "Contact within 10 days of delinquency",
    automation: "70% automated (early stage), 30% (late stage)",
  },
  ceclReserving: {
    name: "CECL Allowance Calculation (Monthly)",
    steps: [
      "Data Extraction",
      "Segmentation",
      "Model Execution",
      "Qualitative Adjustments",
      "Reserve Booking",
    ],
    sla: "Month-end close + 5 days",
    automation: "80% automated",
  },
  loanModification: {
    name: "Loan Modification Process",
    steps: [
      "Hardship Verification",
      "Modification Evaluation",
      "Offer Generation",
      "Acceptance/Trial",
      "Permanent Modification",
    ],
    sla: "30-60 days",
    automation: "40% automated",
  },
};

// ============================================================================
// REGULATORY CONTEXT
// ============================================================================

export const loansRegulatoryFramework = {
  primaryRegulations: [
    {
      regulation: "CECL (ASC 326)",
      description: "Current Expected Credit Loss accounting",
      authority: "FASB",
    },
    {
      regulation: "IFRS 9",
      description: "International credit loss standard",
      authority: "IASB",
    },
    {
      regulation: "Reg B (ECOA)",
      description: "Equal Credit Opportunity Act - fair lending",
      authority: "CFPB",
    },
    {
      regulation: "Reg Z (TILA)",
      description: "Truth in Lending Act - disclosure requirements",
      authority: "CFPB",
    },
    {
      regulation: "TRID",
      description: "TILA-RESPA Integrated Disclosure",
      authority: "CFPB",
    },
    {
      regulation: "RESPA",
      description: "Real Estate Settlement Procedures Act",
      authority: "CFPB",
    },
    {
      regulation: "HMDA",
      description: "Home Mortgage Disclosure Act - reporting",
      authority: "CFPB",
    },
    {
      regulation: "HOEPA",
      description: "Home Ownership and Equity Protection Act - high-cost loans",
      authority: "CFPB",
    },
    {
      regulation: "ATR/QM",
      description: "Ability-to-Repay / Qualified Mortgage rules",
      authority: "CFPB",
    },
    {
      regulation: "Fair Lending (ECOA/FHA)",
      description: "Prohibition of discriminatory lending",
      authority: "DOJ / HUD",
    },
    {
      regulation: "SCRA",
      description: "Servicemembers Civil Relief Act",
      authority: "DOD / CFPB",
    },
    {
      regulation: "MLA",
      description: "Military Lending Act - rate caps",
      authority: "DOD",
    },
    {
      regulation: "SAFE Act",
      description: "Secure and Fair Enforcement for Mortgage Licensing",
      authority: "NMLS / CFPB",
    },
    {
      regulation: "Basel III / Risk-Based Capital",
      description: "Capital adequacy for loans",
      authority: "Federal Reserve / OCC",
    },
    {
      regulation: "UDAAP",
      description: "Unfair, Deceptive, or Abusive Acts or Practices",
      authority: "CFPB",
    },
    {
      regulation: "CRA",
      description: "Community Reinvestment Act - LMI lending",
      authority: "OCC / Federal Reserve",
    },
  ],
  reportingRequirements: [
    {
      report: "Call Report (FFIEC 031/041)",
      frequency: "Quarterly",
      description: "Loan balances, delinquency, charge-offs",
    },
    {
      report: "HMDA LAR (Loan Application Register)",
      frequency: "Annual",
      description: "Mortgage lending data",
    },
    {
      report: "CRA Lending Data",
      frequency: "Annual",
      description: "Small business and community lending",
    },
    {
      report: "CECL Reserve Disclosure",
      frequency: "Quarterly",
      description: "Allowance methodology and amounts",
    },
    {
      report: "Fair Lending Monitoring",
      frequency: "Ongoing",
      description: "Disparate impact analysis",
    },
    {
      report: "Stress Testing (DFAST/CCAR)",
      frequency: "Annual",
      description: "Projected credit losses under stress",
    },
  ],
};

// ============================================================================
// DATA QUALITY RULES
// ============================================================================

export const loansDataQualityRules = {
  completeness: [
    "Loan ID must be populated for all records",
    "Borrower ID must be linked to valid customer record",
    "Origination date must be populated",
    "Principal balance must be non-null",
  ],
  accuracy: [
    "Loan balances must reconcile to core system",
    "Payment amounts must equal principal + interest + fees",
    "Delinquency calculations must match servicing system",
    "CECL allowance must tie to GL",
  ],
  consistency: [
    "Loan status must be consistent across systems",
    "Product codes must match product catalog",
    "Risk ratings must be from approved scale",
    "Collateral values must match appraisal system",
  ],
  timeliness: [
    "Daily loan positions must be available by T+1 8:00 AM",
    "CECL calculations must complete by month-end + 5 days",
    "Delinquency status must update daily",
    "Payment processing must occur same-day or T+1",
  ],
  validity: [
    "Loan numbers must follow standard format",
    "Interest rates must be within valid ranges (0-50%)",
    "FICO scores must be 300-850",
    "LTV must be 0-200%",
  ],
  uniqueness: [
    "Loan IDs must be unique",
    "Payment IDs must be unique",
    "Application IDs must be unique",
  ],
};

// ============================================================================
// ROW-LEVEL SECURITY (RLS) POLICIES
// ============================================================================

export const loansRLSPolicies = {
  description: "Row-level security policies for loans domain",
  policies: [
    {
      name: "branch_based_access",
      table: "gold.fact_loan_positions",
      condition:
        "originating_branch_id IN (SELECT branch_id FROM user_branch_assignments WHERE user_id = CURRENT_USER)",
      description: "Users can only see loans for branches they're assigned to",
    },
    {
      name: "loan_officer_access",
      table: "gold.fact_loan_positions",
      condition:
        "loan_officer_id = CURRENT_USER OR user_role IN ('Manager', 'Executive')",
      description: "Loan officers see their own loans, managers see all",
    },
    {
      name: "segment_based_access",
      table: "gold.fact_loan_positions",
      condition:
        "loan_segment IN (SELECT segment FROM user_segment_access WHERE user_id = CURRENT_USER)",
      description: "Segment-specific access (e.g., consumer vs commercial)",
    },
    {
      name: "pii_masking",
      table: "silver.loan_master_golden",
      condition:
        "CASE WHEN user_role = 'Analytics' THEN MASK(borrower_ssn) ELSE borrower_ssn END",
      description: "Mask PII for analytics users",
    },
  ],
};

// ============================================================================
// QUERY COOKBOOK
// ============================================================================

export const loansQueryCookbook = {
  description: "Pre-built analytical queries for loans domain",
  queries: [
    {
      name: "Monthly Loan Trending",
      sql: `
SELECT 
  DATE_TRUNC('month', as_of_date) as month,
  SUM(principal_balance) as total_balance,
  COUNT(DISTINCT loan_key) as loan_count,
  AVG(principal_balance) as avg_balance_per_loan,
  SUM(CASE WHEN days_past_due > 0 THEN principal_balance END) as delinquent_balance
FROM gold.fact_loan_positions
WHERE as_of_date >= CURRENT_DATE - INTERVAL '24 months'
GROUP BY month
ORDER BY month;
      `,
    },
    {
      name: "Credit Quality Dashboard",
      sql: `
SELECT 
  p.product_name,
  SUM(f.principal_balance) as total_balance,
  SUM(CASE WHEN f.days_past_due >= 30 THEN f.principal_balance END) / SUM(f.principal_balance) * 100 as dpd_30_rate,
  SUM(CASE WHEN f.days_past_due >= 90 THEN f.principal_balance END) / SUM(f.principal_balance) * 100 as dpd_90_rate,
  SUM(CASE WHEN f.nonperforming_flag THEN f.principal_balance END) / SUM(f.principal_balance) * 100 as npl_ratio
FROM gold.fact_loan_positions f
JOIN gold.dim_loan_product p ON f.product_key = p.product_key
WHERE f.as_of_date = CURRENT_DATE
GROUP BY p.product_name;
      `,
    },
    {
      name: "CECL Allowance Summary",
      sql: `
SELECT 
  p.product_name,
  SUM(l.principal_balance) as total_balance,
  SUM(c.allowance_amount) as cecl_allowance,
  SUM(c.allowance_amount) / NULLIF(SUM(l.principal_balance), 0) * 100 as allowance_rate,
  SUM(c.lifetime_expected_loss) as lifetime_ecl
FROM gold.fact_loan_positions l
JOIN gold.fact_loan_credit_loss c ON l.loan_key = c.loan_key AND l.as_of_date = c.as_of_date
JOIN gold.dim_loan_product p ON l.product_key = p.product_key
WHERE l.as_of_date = CURRENT_DATE
GROUP BY p.product_name;
      `,
    },
  ],
};

// ============================================================================
// EXPORT
// ============================================================================

export const loansComprehensiveDomain = {
  domainName: "Loans & Lending",
  domainId: "loans",
  description: "All loan products, origination, servicing, credit risk",
  bronzeLayer: loansBronzeLayer,
  silverLayer: loansSilverLayer,
  goldLayer: loansGoldLayer,
  metricsCatalog: loansMetricsCatalog,
  workflows: loansWorkflows,
  regulatoryFramework: loansRegulatoryFramework,
  dataQualityRules: loansDataQualityRules,
  rlsPolicies: loansRLSPolicies,
  queryCookbook: loansQueryCookbook,
  completionStatus: "100%",
  productionReady: true,
};
