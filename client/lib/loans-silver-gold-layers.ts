// SILVER & GOLD LAYERS - LOANS & LENDING DOMAIN
// Enterprise-grade dimensional model with SCD Type 2 and star schema

// ============================================================================
// SILVER LAYER - CONFORMED GOLDEN RECORDS
// ============================================================================

export const loansSilverLayer = {
  description: "Cleansed, conformed loan data with SCD Type 2 tracking",
  tables: 12,
  characteristics: [
    "Entity resolution and deduplication",
    "Data quality rules enforced",
    "SCD Type 2 for historical tracking",
    "Surrogate keys for dimensional modeling",
    "Business rules applied",
  ],
};

// Silver Table 1: Loan Account Golden Record
export const silverLoanAccountGolden = {
  table_name: "silver.loan_account_golden",
  description: "Golden record for loan accounts with full history (SCD Type 2)",

  schema: [
    // Surrogate Key
    {
      field: "loan_account_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
      primary_key: true,
    },
    {
      field: "loan_account_id",
      datatype: "STRING",
      description: "Natural key",
    },

    // Customer Links
    {
      field: "customer_sk",
      datatype: "BIGINT",
      description: "FK to customer_golden",
    },
    {
      field: "co_borrower_sk",
      datatype: "BIGINT",
      description: "FK to customer_golden (co-borrower)",
    },

    // Loan Classification
    {
      field: "loan_type",
      datatype: "STRING",
      description: "MORTGAGE, AUTO, PERSONAL, COMMERCIAL, HELOC",
    },
    {
      field: "loan_sub_type",
      datatype: "STRING",
      description: "Detailed loan classification",
    },
    {
      field: "loan_purpose",
      datatype: "STRING",
      description: "PURCHASE, REFINANCE, CONSOLIDATION",
    },
    {
      field: "regulatory_loan_type",
      datatype: "STRING",
      description: "Regulatory classification",
    },

    // Account Status
    {
      field: "account_status",
      datatype: "STRING",
      description: "ACTIVE, PAID_OFF, CHARGED_OFF, etc.",
    },
    {
      field: "account_status_date",
      datatype: "DATE",
      description: "Status change date",
    },
    {
      field: "delinquency_status",
      datatype: "STRING",
      description: "CURRENT, 30DPD, 60DPD, etc.",
    },
    { field: "days_past_due", datatype: "INTEGER", description: "Current DPD" },

    // Loan Terms
    {
      field: "origination_date",
      datatype: "DATE",
      description: "Booking date",
    },
    { field: "maturity_date", datatype: "DATE", description: "Maturity date" },
    {
      field: "original_principal",
      datatype: "DECIMAL(18,2)",
      description: "Original amount",
    },
    {
      field: "current_principal",
      datatype: "DECIMAL(18,2)",
      description: "Current balance",
    },
    {
      field: "original_term_months",
      datatype: "INTEGER",
      description: "Original term",
    },
    {
      field: "remaining_term_months",
      datatype: "INTEGER",
      description: "Remaining term",
    },

    // Interest Rate
    {
      field: "interest_rate",
      datatype: "DECIMAL(7,4)",
      description: "Current rate",
    },
    {
      field: "original_rate",
      datatype: "DECIMAL(7,4)",
      description: "Original rate",
    },
    {
      field: "rate_type",
      datatype: "STRING",
      description: "FIXED, VARIABLE, HYBRID",
    },
    {
      field: "payment_amount",
      datatype: "DECIMAL(18,2)",
      description: "Regular payment",
    },

    // Collateral
    {
      field: "collateral_sk",
      datatype: "BIGINT",
      description: "FK to collateral_golden",
    },
    {
      field: "collateral_value",
      datatype: "DECIMAL(18,2)",
      description: "Current collateral value",
    },
    {
      field: "ltv_ratio",
      datatype: "DECIMAL(7,4)",
      description: "Current LTV",
    },
    {
      field: "lien_position",
      datatype: "INTEGER",
      description: "1=First lien, 2=Second",
    },

    // Risk & Performance
    {
      field: "risk_rating",
      datatype: "STRING",
      description: "PASS, SPECIAL_MENTION, etc.",
    },
    {
      field: "credit_score_at_origination",
      datatype: "INTEGER",
      description: "FICO at booking",
    },
    {
      field: "dti_ratio_at_origination",
      datatype: "DECIMAL(7,4)",
      description: "DTI at booking",
    },
    {
      field: "probability_of_default",
      datatype: "DECIMAL(7,4)",
      description: "PD estimate",
    },
    {
      field: "loss_given_default",
      datatype: "DECIMAL(7,4)",
      description: "LGD estimate",
    },

    // Servicing
    {
      field: "servicing_branch_sk",
      datatype: "BIGINT",
      description: "FK to branch",
    },
    {
      field: "loan_officer_sk",
      datatype: "BIGINT",
      description: "FK to employee",
    },
    {
      field: "servicing_status",
      datatype: "STRING",
      description: "PORTFOLIO, SOLD, etc.",
    },

    // Loss Mitigation
    {
      field: "forbearance_flag",
      datatype: "BOOLEAN",
      description: "In forbearance",
    },
    {
      field: "modification_flag",
      datatype: "BOOLEAN",
      description: "Modified loan",
    },
    {
      field: "bankruptcy_flag",
      datatype: "BOOLEAN",
      description: "In bankruptcy",
    },

    // SCD Type 2 Fields
    {
      field: "effective_start_timestamp",
      datatype: "TIMESTAMP",
      description: "Version start",
    },
    {
      field: "effective_end_timestamp",
      datatype: "TIMESTAMP",
      description: "Version end",
    },
    {
      field: "is_current",
      datatype: "BOOLEAN",
      description: "Current record flag",
    },
    {
      field: "version_number",
      datatype: "INTEGER",
      description: "Version sequence",
    },

    // Audit
    {
      field: "created_timestamp",
      datatype: "TIMESTAMP",
      description: "Record creation",
    },
    {
      field: "updated_timestamp",
      datatype: "TIMESTAMP",
      description: "Last update",
    },
  ],

  partitioning: "PARTITION BY DATE_TRUNC('year', origination_date)",
  clustering: "CLUSTER BY (account_status, loan_type, is_current)",
};

// Additional Silver Tables (abbreviated)
export const additionalSilverTables = [
  {
    table_name: "silver.loan_application_golden",
    description: "Golden record for loan applications with SCD2",
    key_features: [
      "Application lifecycle tracking",
      "Underwriting decisions",
      "Adverse action notices",
    ],
  },
  {
    table_name: "silver.loan_transaction_master",
    description: "Cleansed payment transactions",
    key_features: ["Payment allocation", "NSF handling", "Reversal tracking"],
  },
  {
    table_name: "silver.loan_balance_snapshots_daily",
    description: "Daily loan balance positions",
    key_features: [
      "Principal/interest/escrow balances",
      "Accruals",
      "Payment history",
    ],
  },
  {
    table_name: "silver.collateral_golden",
    description: "Collateral/property golden record with SCD2",
    key_features: ["Appraisal history", "Property details", "Lien positions"],
  },
  {
    table_name: "silver.customer_golden",
    description: "Borrower golden record (shared with deposits)",
    key_features: ["Customer demographics", "Credit profile", "SCD2 tracking"],
  },
  {
    table_name: "silver.collections_activity_log",
    description: "Collections contacts and actions",
    key_features: [
      "Contact attempts",
      "Promises to pay",
      "Right party contact",
    ],
  },
  {
    table_name: "silver.loan_modifications",
    description: "Loan modification history",
    key_features: ["Modification terms", "NPV test results", "Trial periods"],
  },
  {
    table_name: "silver.underwriting_decisions",
    description: "Underwriting decision audit trail",
    key_features: ["Credit policies", "Exceptions", "Override tracking"],
  },
  {
    table_name: "silver.escrow_analysis",
    description: "Escrow account analysis and adjustments",
    key_features: ["Escrow projections", "Shortage/surplus", "Payment changes"],
  },
  {
    table_name: "silver.credit_bureau_scores",
    description: "Credit bureau data and scores",
    key_features: ["FICO scores", "Tradelines", "Inquiries"],
  },
  {
    table_name: "silver.foreclosure_pipeline",
    description: "Foreclosure process tracking",
    key_features: ["Foreclosure stages", "Legal milestones", "REO transitions"],
  },
];

// ============================================================================
// GOLD LAYER - DIMENSIONAL STAR SCHEMA
// ============================================================================

export const loansGoldLayer = {
  description: "Dimensional model optimized for analytics and reporting",
  dimensions: 15,
  facts: 8,
  schema_type: "Star Schema",
};

// ========== DIMENSIONS ==========

export const goldDimLoan = {
  table_name: "gold.dim_loan",
  description: "Loan dimension with SCD Type 2",
  type: "Slowly Changing Dimension (Type 2)",

  schema: [
    { field: "loan_key", datatype: "BIGINT", description: "Surrogate key" },
    {
      field: "loan_account_id",
      datatype: "STRING",
      description: "Natural key",
    },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to dim_customer",
    },
    {
      field: "product_key",
      datatype: "INTEGER",
      description: "FK to dim_loan_product",
    },
    {
      field: "collateral_key",
      datatype: "BIGINT",
      description: "FK to dim_collateral",
    },
    {
      field: "branch_key",
      datatype: "INTEGER",
      description: "FK to dim_branch",
    },

    // Loan Attributes
    { field: "loan_type", datatype: "STRING", description: "Product type" },
    { field: "loan_purpose", datatype: "STRING", description: "Use of funds" },
    {
      field: "account_status",
      datatype: "STRING",
      description: "Current status",
    },
    {
      field: "delinquency_status",
      datatype: "STRING",
      description: "DPD status",
    },
    {
      field: "rate_type",
      datatype: "STRING",
      description: "Fixed vs Variable",
    },
    {
      field: "risk_rating",
      datatype: "STRING",
      description: "Credit risk rating",
    },

    // Origination Details
    {
      field: "origination_date",
      datatype: "DATE",
      description: "Booking date",
    },
    {
      field: "origination_channel",
      datatype: "STRING",
      description: "Origination channel",
    },
    {
      field: "original_principal",
      datatype: "DECIMAL(18,2)",
      description: "Original amount",
    },
    {
      field: "original_term_months",
      datatype: "INTEGER",
      description: "Original term",
    },
    {
      field: "original_rate",
      datatype: "DECIMAL(7,4)",
      description: "Original rate",
    },

    // Current State
    {
      field: "current_principal",
      datatype: "DECIMAL(18,2)",
      description: "Current balance",
    },
    {
      field: "current_rate",
      datatype: "DECIMAL(7,4)",
      description: "Current rate",
    },
    {
      field: "current_ltv",
      datatype: "DECIMAL(7,4)",
      description: "Current LTV",
    },

    // Flags
    {
      field: "government_guaranteed_flag",
      datatype: "BOOLEAN",
      description: "FHA/VA/SBA",
    },
    {
      field: "subprime_flag",
      datatype: "BOOLEAN",
      description: "Subprime indicator",
    },
    {
      field: "forbearance_flag",
      datatype: "BOOLEAN",
      description: "In forbearance",
    },

    // SCD2
    {
      field: "effective_date",
      datatype: "TIMESTAMP",
      description: "Version start",
    },
    {
      field: "expiration_date",
      datatype: "TIMESTAMP",
      description: "Version end",
    },
    { field: "current_flag", datatype: "BOOLEAN", description: "Is current" },
  ],
};

export const goldDimensions = [
  {
    table_name: "gold.dim_customer",
    description: "Customer/borrower dimension (shared with deposits)",
    row_count: "10M customers",
  },
  {
    table_name: "gold.dim_loan_product",
    description: "Loan product catalog",
    row_count: "500 products",
  },
  {
    table_name: "gold.dim_collateral",
    description: "Collateral/property dimension",
    row_count: "2M properties",
  },
  {
    table_name: "gold.dim_branch",
    description: "Branch dimension (shared)",
    row_count: "3K branches",
  },
  {
    table_name: "gold.dim_date",
    description: "Date dimension (shared)",
    row_count: "10 years = 3,650 days",
  },
  {
    table_name: "gold.dim_loan_officer",
    description: "Loan officer/originator dimension",
    row_count: "5K officers",
  },
  {
    table_name: "gold.dim_underwriter",
    description: "Underwriter dimension",
    row_count: "1K underwriters",
  },
  {
    table_name: "gold.dim_servicer",
    description: "Loan servicer dimension",
    row_count: "100 servicers",
  },
  {
    table_name: "gold.dim_investor",
    description: "Secondary market investor dimension",
    row_count: "500 investors",
  },
  {
    table_name: "gold.dim_property_type",
    description: "Property type classification",
    row_count: "50 types",
  },
  {
    table_name: "gold.dim_denial_reason",
    description: "Application denial reason codes",
    row_count: "200 reasons",
  },
];

// ========== FACT TABLES ==========

export const goldFactLoanBalancesDaily = {
  table_name: "gold.fact_loan_balances_daily",
  description: "Daily loan balance positions (periodic snapshot)",
  grain: "One row per loan per day",
  fact_type: "Periodic Snapshot",

  schema: [
    // Keys
    { field: "balance_key", datatype: "BIGINT", description: "Surrogate key" },
    {
      field: "balance_date_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    { field: "loan_key", datatype: "BIGINT", description: "FK to dim_loan" },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to dim_customer",
    },
    {
      field: "product_key",
      datatype: "INTEGER",
      description: "FK to dim_loan_product",
    },

    // Balance Facts
    {
      field: "principal_balance",
      datatype: "DECIMAL(18,2)",
      description: "Principal balance",
    },
    {
      field: "interest_balance",
      datatype: "DECIMAL(18,2)",
      description: "Interest balance",
    },
    {
      field: "escrow_balance",
      datatype: "DECIMAL(18,2)",
      description: "Escrow balance",
    },
    {
      field: "fees_balance",
      datatype: "DECIMAL(18,2)",
      description: "Unpaid fees",
    },
    {
      field: "total_balance",
      datatype: "DECIMAL(18,2)",
      description: "Total balance",
    },

    // Daily Activity
    {
      field: "daily_principal_change",
      datatype: "DECIMAL(18,2)",
      description: "Principal change",
    },
    {
      field: "daily_interest_accrued",
      datatype: "DECIMAL(18,2)",
      description: "Interest accrued",
    },
    {
      field: "daily_payment_received",
      datatype: "DECIMAL(18,2)",
      description: "Payment amount",
    },

    // MTD/YTD Aggregates
    {
      field: "mtd_principal_paid",
      datatype: "DECIMAL(18,2)",
      description: "MTD principal",
    },
    {
      field: "mtd_interest_paid",
      datatype: "DECIMAL(18,2)",
      description: "MTD interest",
    },
    {
      field: "ytd_principal_paid",
      datatype: "DECIMAL(18,2)",
      description: "YTD principal",
    },
    {
      field: "ytd_interest_paid",
      datatype: "DECIMAL(18,2)",
      description: "YTD interest",
    },

    // Performance Metrics
    { field: "days_past_due", datatype: "INTEGER", description: "DPD" },
    {
      field: "missed_payments_count",
      datatype: "INTEGER",
      description: "Missed payments",
    },
    {
      field: "current_ltv",
      datatype: "DECIMAL(7,4)",
      description: "Current LTV",
    },
    { field: "months_on_book", datatype: "INTEGER", description: "Loan age" },

    // Risk Metrics
    {
      field: "probability_of_default",
      datatype: "DECIMAL(7,4)",
      description: "PD",
    },
    {
      field: "expected_loss",
      datatype: "DECIMAL(18,2)",
      description: "Expected loss",
    },
    {
      field: "allowance_allocation",
      datatype: "DECIMAL(18,2)",
      description: "CECL allowance",
    },
  ],

  partitioning: "PARTITION BY balance_date_key",
  clustering: "CLUSTER BY (loan_key, product_key)",
  estimated_rows: "50M rows/day (2M loans x 25 days/month avg)",
};

export const additionalFactTables = [
  {
    table_name: "gold.fact_loan_applications",
    description: "Loan application funnel (transaction grain)",
    grain: "One row per application",
    metrics: [
      "application_count",
      "approval_rate",
      "denial_rate",
      "time_to_decision",
    ],
  },
  {
    table_name: "gold.fact_loan_originations",
    description: "Loan bookings/originations (transaction grain)",
    grain: "One row per originated loan",
    metrics: [
      "origination_volume",
      "avg_loan_size",
      "avg_rate",
      "pull_through_rate",
    ],
  },
  {
    table_name: "gold.fact_loan_payments",
    description: "Payment transactions (transaction grain)",
    grain: "One row per payment",
    metrics: [
      "payment_amount",
      "principal_paid",
      "interest_paid",
      "on_time_payment_rate",
    ],
  },
  {
    table_name: "gold.fact_loan_delinquency",
    description: "Delinquency roll rates (periodic snapshot)",
    grain: "One row per loan per month",
    metrics: ["roll_rate", "cure_rate", "charge_off_rate", "recovery_rate"],
  },
  {
    table_name: "gold.fact_loan_profitability",
    description: "Loan-level profitability (periodic snapshot)",
    grain: "One row per loan per month",
    metrics: ["interest_income", "fee_income", "cost_of_funds", "net_profit"],
  },
  {
    table_name: "gold.fact_cecl_calculations",
    description: "CECL allowance calculations (periodic snapshot)",
    grain: "One row per loan per month",
    metrics: ["expected_credit_loss", "allowance", "charge_offs", "recoveries"],
  },
  {
    table_name: "gold.fact_collections_activity",
    description: "Collections activities (transaction grain)",
    grain: "One row per collections contact",
    metrics: ["contact_count", "promise_to_pay", "right_party_contact_rate"],
  },
];

// ============================================================================
// LAYER SUMMARY
// ============================================================================

export const loansSilverGoldSummary = {
  silver: {
    tables: 12,
    totalColumns: 400,
    scd2Tables: 5,
    features: [
      "Entity resolution",
      "Data quality enforcement",
      "Historical tracking (SCD2)",
      "Business rule application",
    ],
  },

  gold: {
    dimensions: 15,
    facts: 8,
    totalColumns: 350,
    starSchemaCompliant: true,
    features: [
      "Kimball-style dimensional model",
      "Pre-aggregated fact tables",
      "Conformed dimensions",
      "BI tool optimized",
    ],
  },

  estimatedDataVolume: {
    silverDaily: "10M rows/day",
    goldDaily: "60M rows/day (across all facts)",
    totalStorage: "5TB (3 years retention)",
  },
};
