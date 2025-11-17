// COMPREHENSIVE SILVER & GOLD LAYERS - DEPOSITS & FUNDING DOMAIN
// Enterprise-Grade for Analytics, Reporting, and Data Science
// Aligned with: Top-tier banking standards (JPM, BAC, WFC, Citi)

// ============================================================================
// SILVER LAYER: CLEANED, CONFORMED & ENTITY RESOLUTION
// ============================================================================

export const silverLayerPrinciples = {
  dataQuality: "100% data quality validation, cleansing, and standardization",
  entityResolution:
    "Golden customer, account, and product records with SCD Type 2",
  conformation: "Standardized codes, dimensions, and business rules",
  lineage: "Complete source-to-target mapping with transformation logic",
  deduplication: "Duplicate detection and merging with survivorship rules",
  enrichment: "Derived attributes, calculated fields, and reference data joins",
};

// ============================================================================
// SILVER TABLE 1: ACCOUNT MASTER GOLDEN (SCD2)
// ============================================================================

export const silverAccountMasterGolden = {
  table_name: "silver.account_master_golden",
  description:
    "Golden account record with SCD Type 2 for attribute history tracking",
  source_bronze_tables: ["bronze.deposit_account_master_raw"],
  transformation_logic:
    "Deduplication, standardization, SCD2 versioning, enrichment",
  update_frequency: "Real-time CDC propagation from bronze",

  schema: [
    // Surrogate Keys
    {
      field: "account_sk",
      datatype: "BIGINT",
      description: "Surrogate key (auto-increment)",
      primary_key: true,
    },
    {
      field: "account_id",
      datatype: "STRING",
      description: "Natural key from source",
      business_key: true,
    },

    // Customer Relationships (Resolved)
    {
      field: "customer_sk",
      datatype: "BIGINT",
      description: "Foreign key to silver.customer_golden",
    },
    {
      field: "customer_id",
      datatype: "STRING",
      description: "Primary customer natural key",
    },
    {
      field: "co_customer_sk",
      datatype: "BIGINT",
      description: "Joint account co-owner SK",
    },

    // Product Classification (Conformed)
    {
      field: "product_code_standard",
      datatype: "STRING",
      description: "Standardized product code",
    },
    {
      field: "product_category",
      datatype: "STRING",
      description: "DDA, Savings, MMA, CD, Sweep, Escrow",
    },
    {
      field: "product_sub_category",
      datatype: "STRING",
      description: "Basic, Premium, Business, etc.",
    },
    {
      field: "product_name_standard",
      datatype: "STRING",
      description: "Standardized product name",
    },

    // Account Status (Standardized)
    {
      field: "account_status_code",
      datatype: "STRING",
      description: "ACTIVE, CLOSED, DORMANT, FROZEN, RESTRICTED",
    },
    {
      field: "account_status_desc",
      datatype: "STRING",
      description: "Status description",
    },
    {
      field: "account_sub_status_code",
      datatype: "STRING",
      description: "Detailed sub-status",
    },
    {
      field: "closure_reason_category",
      datatype: "STRING",
      description: "Categorized closure reason",
    },

    // Temporal Attributes
    {
      field: "account_open_date",
      datatype: "DATE",
      description: "Opening date",
    },
    {
      field: "account_close_date",
      datatype: "DATE",
      description: "Closure date",
    },
    {
      field: "account_age_days",
      datatype: "INTEGER",
      description: "Calculated: Days since opening",
    },
    {
      field: "account_lifecycle_stage",
      datatype: "STRING",
      description: "NEW, MATURE, AGING, DORMANT",
    },

    // Branch & Geography (Conformed)
    {
      field: "home_branch_sk",
      datatype: "BIGINT",
      description: "FK to silver.branch_golden",
    },
    {
      field: "home_branch_id",
      datatype: "STRING",
      description: "Branch natural key",
    },
    {
      field: "opening_branch_sk",
      datatype: "BIGINT",
      description: "Opening branch SK",
    },
    {
      field: "region_code",
      datatype: "STRING",
      description: "Geographic region",
    },
    { field: "timezone", datatype: "STRING", description: "Branch timezone" },

    // Interest & Rate Attributes
    {
      field: "interest_bearing_flag",
      datatype: "BOOLEAN",
      description: "Earns interest",
    },
    {
      field: "current_interest_rate",
      datatype: "DECIMAL(7,4)",
      description: "Current APR %",
    },
    { field: "rate_tier_code", datatype: "STRING", description: "Rate tier" },
    {
      field: "rate_type_code",
      datatype: "STRING",
      description: "FIXED, VARIABLE, TIERED",
    },
    {
      field: "promotional_rate_flag",
      datatype: "BOOLEAN",
      description: "Promotional rate active",
    },
    {
      field: "promotional_expiry_date",
      datatype: "DATE",
      description: "Promo expiration",
    },

    // Fee & Balance Requirements
    {
      field: "monthly_fee_amount",
      datatype: "DECIMAL(18,2)",
      description: "Monthly fee",
    },
    {
      field: "fee_waiver_balance_threshold",
      datatype: "DECIMAL(18,2)",
      description: "Fee waiver threshold",
    },
    {
      field: "minimum_balance_required",
      datatype: "DECIMAL(18,2)",
      description: "Minimum balance",
    },
    {
      field: "overdraft_limit",
      datatype: "DECIMAL(18,2)",
      description: "Overdraft limit",
    },

    // Regulatory & Risk Classifications
    {
      field: "fdic_insured_flag",
      datatype: "BOOLEAN",
      description: "FDIC insured",
    },
    {
      field: "brokered_deposit_flag",
      datatype: "BOOLEAN",
      description: "Brokered deposit",
    },
    {
      field: "regulatory_category",
      datatype: "STRING",
      description: "RETAIL, WHOLESALE, OPERATIONAL",
    },
    {
      field: "lcr_classification",
      datatype: "STRING",
      description: "LCR deposit category",
    },
    {
      field: "lcr_outflow_rate",
      datatype: "DECIMAL(5,4)",
      description: "LCR assumed outflow %",
    },
    {
      field: "nsfr_asf_factor",
      datatype: "DECIMAL(5,4)",
      description: "NSFR ASF factor",
    },
    {
      field: "operational_deposit_flag",
      datatype: "BOOLEAN",
      description: "Operational deposit (LCR)",
    },
    {
      field: "stable_deposit_flag",
      datatype: "BOOLEAN",
      description: "Stable funding (NSFR)",
    },

    // Channel & Relationship
    {
      field: "primary_channel",
      datatype: "STRING",
      description: "Primary usage channel",
    },
    {
      field: "opening_channel",
      datatype: "STRING",
      description: "Account opening channel",
    },
    {
      field: "digital_enrollment_flag",
      datatype: "BOOLEAN",
      description: "Digital banking enrolled",
    },
    {
      field: "relationship_package_code",
      datatype: "STRING",
      description: "Relationship package",
    },

    // Derived Behavioral Attributes
    {
      field: "last_transaction_date",
      datatype: "DATE",
      description: "Most recent activity",
    },
    {
      field: "days_since_last_activity",
      datatype: "INTEGER",
      description: "Calculated dormancy metric",
    },
    {
      field: "transaction_velocity_30d",
      datatype: "INTEGER",
      description: "Txn count last 30 days",
    },
    {
      field: "average_balance_30d",
      datatype: "DECIMAL(18,2)",
      description: "30-day avg balance",
    },
    {
      field: "balance_volatility_flag",
      datatype: "BOOLEAN",
      description: "High balance variance",
    },

    // Data Quality Indicators
    {
      field: "data_quality_score",
      datatype: "DECIMAL(5,2)",
      description: "DQ score (0-100)",
    },
    {
      field: "completeness_pct",
      datatype: "DECIMAL(5,2)",
      description: "Field completeness %",
    },
    {
      field: "source_system_confidence",
      datatype: "STRING",
      description: "HIGH, MEDIUM, LOW",
    },

    // SCD Type 2 Fields
    {
      field: "effective_start_date",
      datatype: "TIMESTAMP",
      description: "Version effective start",
    },
    {
      field: "effective_end_date",
      datatype: "TIMESTAMP",
      description: "Version effective end",
    },
    {
      field: "is_current",
      datatype: "BOOLEAN",
      description: "Current version flag",
    },
    {
      field: "version_number",
      datatype: "INTEGER",
      description: "Version sequence",
    },
    {
      field: "change_reason",
      datatype: "STRING",
      description: "Reason for version change",
    },

    // Audit Fields
    {
      field: "source_system_id",
      datatype: "STRING",
      description: "Source system",
    },
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
    {
      field: "created_by_job_id",
      datatype: "STRING",
      description: "Creation job",
    },
    {
      field: "record_hash_current",
      datatype: "STRING",
      description: "Current record hash",
    },
  ],

  data_quality_rules: [
    "account_id uniqueness within effective date range",
    "customer_sk must exist in silver.customer_golden",
    "account_status_code must be in approved enum",
    "SCD2 overlapping date validation",
    "Only one is_current=true per account_id",
    "Balance thresholds must be >= 0",
    "Interest rate validation (0-20%)",
    "Effective_end_date > effective_start_date",
  ],
};

// ============================================================================
// SILVER TABLE 2: TRANSACTION MASTER (Cleansed & Enriched)
// ============================================================================

export const silverTransactionMaster = {
  table_name: "silver.transaction_master",
  description:
    "Cleansed transaction data with enrichments and derived attributes",
  source_bronze_tables: ["bronze.deposit_transactions_raw"],
  transformation_logic:
    "Data quality, standardization, enrichment, fraud tagging",

  schema: [
    {
      field: "transaction_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    { field: "transaction_id", datatype: "STRING", description: "Natural key" },
    {
      field: "account_sk",
      datatype: "BIGINT",
      description: "FK to account_master_golden",
    },
    {
      field: "customer_sk",
      datatype: "BIGINT",
      description: "FK to customer_golden",
    },
    {
      field: "transaction_date",
      datatype: "DATE",
      description: "Posting date",
    },
    {
      field: "transaction_timestamp",
      datatype: "TIMESTAMP",
      description: "Transaction time",
    },
    {
      field: "transaction_type_code",
      datatype: "STRING",
      description: "Standardized type",
    },
    {
      field: "transaction_type_desc",
      datatype: "STRING",
      description: "Type description",
    },
    {
      field: "transaction_category",
      datatype: "STRING",
      description: "CREDIT, DEBIT, TRANSFER, FEE, INTEREST, ADJUSTMENT",
    },
    {
      field: "transaction_amount",
      datatype: "DECIMAL(18,2)",
      description: "Transaction amount",
    },
    {
      field: "transaction_amount_abs",
      datatype: "DECIMAL(18,2)",
      description: "Absolute amount",
    },
    {
      field: "currency_code",
      datatype: "STRING",
      description: "Currency (USD, EUR, etc.)",
    },
    {
      field: "channel_code",
      datatype: "STRING",
      description: "Standardized channel",
    },
    {
      field: "channel_category",
      datatype: "STRING",
      description: "DIGITAL, BRANCH, ATM, REMOTE",
    },
    {
      field: "merchant_name_cleansed",
      datatype: "STRING",
      description: "Standardized merchant name",
    },
    {
      field: "merchant_category",
      datatype: "STRING",
      description: "Merchant category",
    },
    { field: "mcc_code", datatype: "STRING", description: "MCC code" },
    {
      field: "mcc_description",
      datatype: "STRING",
      description: "MCC description",
    },
    {
      field: "geolocation_city",
      datatype: "STRING",
      description: "Transaction city",
    },
    {
      field: "geolocation_state",
      datatype: "STRING",
      description: "Transaction state",
    },
    {
      field: "geolocation_country",
      datatype: "STRING",
      description: "Transaction country",
    },
    {
      field: "domestic_flag",
      datatype: "BOOLEAN",
      description: "Domestic vs international",
    },
    {
      field: "fraud_score",
      datatype: "DECIMAL(5,2)",
      description: "Fraud score (0-100)",
    },
    {
      field: "fraud_alert_flag",
      datatype: "BOOLEAN",
      description: "Fraud alert triggered",
    },
    {
      field: "high_risk_flag",
      datatype: "BOOLEAN",
      description: "High risk transaction",
    },
    { field: "reversal_flag", datatype: "BOOLEAN", description: "Is reversal" },
    {
      field: "disputed_flag",
      datatype: "BOOLEAN",
      description: "Customer disputed",
    },
    {
      field: "business_day_flag",
      datatype: "BOOLEAN",
      description: "Posted on business day",
    },
    {
      field: "weekend_flag",
      datatype: "BOOLEAN",
      description: "Weekend transaction",
    },
    {
      field: "time_of_day_segment",
      datatype: "STRING",
      description: "MORNING, AFTERNOON, EVENING, NIGHT",
    },
    {
      field: "running_balance_before",
      datatype: "DECIMAL(18,2)",
      description: "Balance before txn",
    },
    {
      field: "running_balance_after",
      datatype: "DECIMAL(18,2)",
      description: "Balance after txn",
    },
    {
      field: "created_timestamp",
      datatype: "TIMESTAMP",
      description: "Silver creation time",
    },
  ],
};

// ============================================================================
// SILVER TABLE 3: DAILY BALANCE SNAPSHOTS (Enriched)
// ============================================================================

export const silverDailyBalances = {
  table_name: "silver.daily_balance_snapshots",
  description: "Enriched daily balance positions with derived metrics",
  source_bronze_tables: ["bronze.deposit_account_balances_daily_raw"],

  schema: [
    {
      field: "balance_snapshot_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    { field: "account_sk", datatype: "BIGINT", description: "FK to account" },
    { field: "customer_sk", datatype: "BIGINT", description: "FK to customer" },
    { field: "snapshot_date", datatype: "DATE", description: "Balance date" },
    {
      field: "eod_balance",
      datatype: "DECIMAL(18,2)",
      description: "End of day balance",
    },
    {
      field: "available_balance",
      datatype: "DECIMAL(18,2)",
      description: "Available balance",
    },
    {
      field: "ledger_balance",
      datatype: "DECIMAL(18,2)",
      description: "Ledger balance",
    },
    {
      field: "collected_balance",
      datatype: "DECIMAL(18,2)",
      description: "Collected balance",
    },
    {
      field: "balance_tier",
      datatype: "STRING",
      description: "Balance tier classification",
    },
    {
      field: "negative_balance_flag",
      datatype: "BOOLEAN",
      description: "Overdraft indicator",
    },
    {
      field: "zero_balance_flag",
      datatype: "BOOLEAN",
      description: "Zero balance",
    },
    {
      field: "low_balance_flag",
      datatype: "BOOLEAN",
      description: "Below minimum",
    },
    {
      field: "day_net_change",
      datatype: "DECIMAL(18,2)",
      description: "Daily net change",
    },
    {
      field: "day_deposit_count",
      datatype: "INTEGER",
      description: "Number of deposits",
    },
    {
      field: "day_deposit_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total deposits",
    },
    {
      field: "day_withdrawal_count",
      datatype: "INTEGER",
      description: "Number of withdrawals",
    },
    {
      field: "day_withdrawal_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total withdrawals",
    },
    {
      field: "mtd_average_balance",
      datatype: "DECIMAL(18,2)",
      description: "MTD average",
    },
    {
      field: "ytd_average_balance",
      datatype: "DECIMAL(18,2)",
      description: "YTD average",
    },
    {
      field: "balance_percentile_customer",
      datatype: "INTEGER",
      description: "Percentile within customer accounts",
    },
    {
      field: "balance_percentile_product",
      datatype: "INTEGER",
      description: "Percentile within product",
    },
    {
      field: "days_in_current_tier",
      datatype: "INTEGER",
      description: "Days in balance tier",
    },
    {
      field: "fdic_insured_amount",
      datatype: "DECIMAL(18,2)",
      description: "FDIC insured portion",
    },
    {
      field: "uninsured_amount",
      datatype: "DECIMAL(18,2)",
      description: "Uninsured portion (>$250K)",
    },
  ],
};

// ============================================================================
// GOLD LAYER: DIMENSIONAL MODEL (STAR SCHEMA)
// Multiple Fact Tables with Rich Aggregations
// ============================================================================

export const goldLayerPrinciples = {
  starSchema:
    "Dimensional modeling with conformed dimensions and multiple fact tables",
  multipleGrains:
    "Facts at transaction, daily, monthly, customer, product levels",
  preAggregation: "Pre-aggregated summary tables for performance",
  analytics: "Optimized for BI, reporting, ML/DS workloads",
  rollingMetrics: "Rolling 7D, 30D, 90D, 12M calculations",
  cohortAnalysis: "Customer cohorts, vintage analysis, behavioral segments",
};

// ============================================================================
// GOLD DIMENSIONS (Conformed)
// ============================================================================

export const goldDimensions = [
  {
    table_name: "gold.dim_deposit_account",
    type: "Type 2 SCD",
    grain: "One row per account per version",
    row_count: "~2.5M",
    description: "Account dimension with current and historical attributes",
    key_attributes: [
      "account_key (SK)",
      "account_id (NK)",
      "customer_key (FK)",
      "product_key (FK)",
      "branch_key (FK)",
      "account_status",
      "account_category",
      "interest_rate",
      "regulatory_classification",
      "effective_date",
      "expiration_date",
      "current_flag",
    ],
  },
  {
    table_name: "gold.dim_customer",
    type: "Type 2 SCD",
    grain: "One row per customer per version",
    row_count: "~1.8M",
    description: "Customer dimension with demographics and segmentation",
    key_attributes: [
      "customer_key (SK)",
      "customer_id (NK)",
      "customer_segment",
      "customer_tier",
      "age_band",
      "income_band",
      "credit_score_band",
      "geographic_region",
      "relationship_start_date",
      "lifetime_value_band",
    ],
  },
  {
    table_name: "gold.dim_product",
    type: "Type 2 SCD",
    grain: "One row per product per version",
    row_count: "~200",
    description: "Product hierarchy and attributes",
    key_attributes: [
      "product_key (SK)",
      "product_code (NK)",
      "product_name",
      "product_category (DDA, Savings, MMA, CD, etc.)",
      "product_sub_category",
      "product_line",
      "interest_bearing_flag",
      "minimum_balance",
      "monthly_fee",
    ],
  },
  {
    table_name: "gold.dim_branch",
    type: "Type 2 SCD",
    grain: "One row per branch per version",
    row_count: "~800",
    description: "Branch hierarchy and geography",
    key_attributes: [
      "branch_key (SK)",
      "branch_id (NK)",
      "branch_name",
      "region",
      "district",
      "market",
      "branch_type",
      "timezone",
      "latitude",
      "longitude",
    ],
  },
  {
    table_name: "gold.dim_date",
    type: "Static",
    grain: "One row per day",
    row_count: "~11,000 (30 years)",
    description: "Calendar dimension with fiscal periods",
    key_attributes: [
      "date_key (SK)",
      "date_value",
      "year",
      "quarter",
      "month",
      "week",
      "day_of_week",
      "business_day_flag",
      "fiscal_year",
      "fiscal_quarter",
      "fiscal_month",
      "holiday_flag",
      "month_end_flag",
      "quarter_end_flag",
    ],
  },
];

// ============================================================================
// GOLD FACT TABLES (Multiple Grains & Types)
// ============================================================================

// Fact Table 1: Transaction Grain
export const goldFactTransactions = {
  table_name: "gold.fact_deposit_transactions",
  fact_type: "Transaction Fact (Atomic)",
  grain: "One row per transaction",
  daily_volume: "~3M rows",
  partitioning: "PARTITION BY transaction_date",

  measures: [
    {
      measure: "transaction_amount",
      aggregation: "SUM",
      description: "Transaction dollar amount",
    },
    {
      measure: "transaction_count",
      aggregation: "COUNT",
      description: "Number of transactions",
    },
    { measure: "fee_amount", aggregation: "SUM", description: "Fees charged" },
    {
      measure: "fraud_score_avg",
      aggregation: "AVG",
      description: "Average fraud score",
    },
  ],

  dimensions: [
    "transaction_date_key (FK to dim_date)",
    "account_key (FK to dim_deposit_account)",
    "customer_key (FK to dim_customer)",
    "product_key (FK to dim_product)",
    "branch_key (FK to dim_branch)",
    "transaction_type_key",
    "channel_key",
    "merchant_key",
  ],

  schema: [
    {
      field: "transaction_fact_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "transaction_date_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    {
      field: "transaction_time_key",
      datatype: "INTEGER",
      description: "FK to dim_time",
    },
    {
      field: "account_key",
      datatype: "BIGINT",
      description: "FK to dim_deposit_account",
    },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to dim_customer",
    },
    {
      field: "product_key",
      datatype: "INTEGER",
      description: "FK to dim_product",
    },
    {
      field: "branch_key",
      datatype: "INTEGER",
      description: "FK to dim_branch",
    },
    {
      field: "channel_key",
      datatype: "INTEGER",
      description: "FK to dim_channel",
    },
    {
      field: "transaction_type_key",
      datatype: "INTEGER",
      description: "FK to dim_transaction_type",
    },
    {
      field: "merchant_key",
      datatype: "INTEGER",
      description: "FK to dim_merchant",
    },
    {
      field: "geo_key",
      datatype: "INTEGER",
      description: "FK to dim_geography",
    },
    {
      field: "transaction_id",
      datatype: "STRING",
      description: "Degenerate dimension",
    },
    {
      field: "transaction_amount",
      datatype: "DECIMAL(18,2)",
      description: "Transaction amount (signed)",
    },
    {
      field: "transaction_amount_abs",
      datatype: "DECIMAL(18,2)",
      description: "Absolute amount",
    },
    {
      field: "fee_amount",
      datatype: "DECIMAL(18,2)",
      description: "Fee charged",
    },
    {
      field: "running_balance_after",
      datatype: "DECIMAL(18,2)",
      description: "Balance after txn",
    },
    {
      field: "fraud_score",
      datatype: "DECIMAL(5,2)",
      description: "Fraud risk score",
    },
    { field: "reversal_flag", datatype: "BOOLEAN", description: "Is reversal" },
    {
      field: "disputed_flag",
      datatype: "BOOLEAN",
      description: "Disputed transaction",
    },
    {
      field: "domestic_flag",
      datatype: "BOOLEAN",
      description: "Domestic transaction",
    },
  ],
};

// Fact Table 2: Daily Account Positions (Periodic Snapshot)
export const goldFactDailyPositions = {
  table_name: "gold.fact_daily_account_positions",
  fact_type: "Periodic Snapshot Fact (Daily)",
  grain: "One row per account per day",
  daily_volume: "~2M rows",
  partitioning: "PARTITION BY position_date",

  measures: [
    "eod_balance",
    "available_balance",
    "average_balance_mtd",
    "average_balance_ytd",
    "daily_net_change",
    "daily_deposits_amount",
    "daily_withdrawals_amount",
    "daily_transaction_count",
    "daily_interest_accrued",
    "daily_fees_charged",
    "balance_volatility_30d",
  ],

  schema: [
    {
      field: "position_fact_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "position_date_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    {
      field: "account_key",
      datatype: "BIGINT",
      description: "FK to dim_deposit_account",
    },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to dim_customer",
    },
    {
      field: "product_key",
      datatype: "INTEGER",
      description: "FK to dim_product",
    },
    {
      field: "branch_key",
      datatype: "INTEGER",
      description: "FK to dim_branch",
    },
    {
      field: "position_date",
      datatype: "DATE",
      description: "Degenerate dimension",
    },

    // Balance Measures
    {
      field: "eod_balance",
      datatype: "DECIMAL(18,2)",
      description: "End of day balance",
    },
    {
      field: "beginning_balance",
      datatype: "DECIMAL(18,2)",
      description: "Beginning balance",
    },
    {
      field: "available_balance",
      datatype: "DECIMAL(18,2)",
      description: "Available balance",
    },
    {
      field: "ledger_balance",
      datatype: "DECIMAL(18,2)",
      description: "Ledger balance",
    },
    {
      field: "collected_balance",
      datatype: "DECIMAL(18,2)",
      description: "Collected balance",
    },
    {
      field: "float_amount",
      datatype: "DECIMAL(18,2)",
      description: "Float amount",
    },
    {
      field: "hold_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total holds",
    },

    // Daily Activity Measures
    {
      field: "daily_net_change",
      datatype: "DECIMAL(18,2)",
      description: "Net change from prior day",
    },
    {
      field: "daily_deposits_count",
      datatype: "INTEGER",
      description: "Number of deposits",
    },
    {
      field: "daily_deposits_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total deposit amount",
    },
    {
      field: "daily_withdrawals_count",
      datatype: "INTEGER",
      description: "Number of withdrawals",
    },
    {
      field: "daily_withdrawals_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total withdrawal amount",
    },
    {
      field: "daily_transaction_count",
      datatype: "INTEGER",
      description: "Total transactions",
    },
    {
      field: "daily_fee_count",
      datatype: "INTEGER",
      description: "Number of fees",
    },
    {
      field: "daily_fees_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total fees charged",
    },

    // Interest Measures
    {
      field: "current_interest_rate",
      datatype: "DECIMAL(7,4)",
      description: "Current rate %",
    },
    {
      field: "daily_interest_accrued",
      datatype: "DECIMAL(18,2)",
      description: "Interest accrued today",
    },
    {
      field: "mtd_interest_accrued",
      datatype: "DECIMAL(18,2)",
      description: "MTD interest",
    },
    {
      field: "ytd_interest_paid",
      datatype: "DECIMAL(18,2)",
      description: "YTD interest paid",
    },

    // Average Balance Measures
    {
      field: "average_balance_mtd",
      datatype: "DECIMAL(18,2)",
      description: "Month-to-date ADB",
    },
    {
      field: "average_balance_qtd",
      datatype: "DECIMAL(18,2)",
      description: "Quarter-to-date ADB",
    },
    {
      field: "average_balance_ytd",
      datatype: "DECIMAL(18,2)",
      description: "Year-to-date ADB",
    },
    {
      field: "average_balance_7d",
      datatype: "DECIMAL(18,2)",
      description: "7-day rolling ADB",
    },
    {
      field: "average_balance_30d",
      datatype: "DECIMAL(18,2)",
      description: "30-day rolling ADB",
    },
    {
      field: "average_balance_90d",
      datatype: "DECIMAL(18,2)",
      description: "90-day rolling ADB",
    },

    // Balance Volatility & Behavior
    {
      field: "balance_volatility_30d",
      datatype: "DECIMAL(18,2)",
      description: "30-day std deviation",
    },
    {
      field: "balance_trend_30d",
      datatype: "STRING",
      description: "INCREASING, DECREASING, STABLE",
    },
    {
      field: "min_balance_30d",
      datatype: "DECIMAL(18,2)",
      description: "Minimum balance last 30d",
    },
    {
      field: "max_balance_30d",
      datatype: "DECIMAL(18,2)",
      description: "Maximum balance last 30d",
    },
    {
      field: "days_below_minimum",
      datatype: "INTEGER",
      description: "Days below minimum (MTD)",
    },
    {
      field: "days_in_overdraft",
      datatype: "INTEGER",
      description: "Days overdrawn (MTD)",
    },

    // Balance Tier Classification
    {
      field: "balance_tier_code",
      datatype: "STRING",
      description: "Current balance tier",
    },
    {
      field: "balance_percentile_product",
      datatype: "INTEGER",
      description: "Percentile within product",
    },
    {
      field: "balance_percentile_branch",
      datatype: "INTEGER",
      description: "Percentile within branch",
    },

    // Flags & Indicators
    {
      field: "negative_balance_flag",
      datatype: "BOOLEAN",
      description: "Overdraft indicator",
    },
    {
      field: "zero_balance_flag",
      datatype: "BOOLEAN",
      description: "Zero balance",
    },
    {
      field: "low_balance_warning_flag",
      datatype: "BOOLEAN",
      description: "Below minimum threshold",
    },
    {
      field: "dormant_flag",
      datatype: "BOOLEAN",
      description: "No activity >90 days",
    },
    {
      field: "high_value_account_flag",
      datatype: "BOOLEAN",
      description: "Balance > $100K",
    },

    // Regulatory Measures
    {
      field: "fdic_insured_amount",
      datatype: "DECIMAL(18,2)",
      description: "FDIC insured balance",
    },
    {
      field: "uninsured_amount",
      datatype: "DECIMAL(18,2)",
      description: "Uninsured portion",
    },
    {
      field: "lcr_eligible_amount",
      datatype: "DECIMAL(18,2)",
      description: "LCR eligible balance",
    },
    {
      field: "nsfr_weighted_amount",
      datatype: "DECIMAL(18,2)",
      description: "NSFR weighted balance",
    },
  ],
};

// Fact Table 3: Monthly Account Summary (Pre-Aggregated)
export const goldFactMonthlyAccountSummary = {
  table_name: "gold.fact_monthly_account_summary",
  fact_type: "Periodic Snapshot Fact (Monthly)",
  grain: "One row per account per month",
  monthly_volume: "~2M rows",

  schema: [
    {
      field: "month_summary_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "year_month_key",
      datatype: "INTEGER",
      description: "FK to dim_date (month-end)",
    },
    { field: "account_key", datatype: "BIGINT", description: "FK to account" },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to customer",
    },
    { field: "product_key", datatype: "INTEGER", description: "FK to product" },
    { field: "year_month", datatype: "STRING", description: "YYYY-MM format" },

    // Balance Metrics
    {
      field: "month_end_balance",
      datatype: "DECIMAL(18,2)",
      description: "End of month balance",
    },
    {
      field: "month_begin_balance",
      datatype: "DECIMAL(18,2)",
      description: "Beginning balance",
    },
    {
      field: "month_average_balance",
      datatype: "DECIMAL(18,2)",
      description: "Monthly ADB",
    },
    {
      field: "month_min_balance",
      datatype: "DECIMAL(18,2)",
      description: "Minimum daily balance",
    },
    {
      field: "month_max_balance",
      datatype: "DECIMAL(18,2)",
      description: "Maximum daily balance",
    },
    {
      field: "month_median_balance",
      datatype: "DECIMAL(18,2)",
      description: "Median daily balance",
    },

    // Transaction Volume Metrics
    {
      field: "month_total_deposits_count",
      datatype: "INTEGER",
      description: "Total deposit transactions",
    },
    {
      field: "month_total_deposits_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total deposit dollars",
    },
    {
      field: "month_total_withdrawals_count",
      datatype: "INTEGER",
      description: "Total withdrawal transactions",
    },
    {
      field: "month_total_withdrawals_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total withdrawal dollars",
    },
    {
      field: "month_total_transfers_count",
      datatype: "INTEGER",
      description: "Total transfers",
    },
    {
      field: "month_total_transactions_count",
      datatype: "INTEGER",
      description: "All transactions",
    },
    {
      field: "month_net_flow",
      datatype: "DECIMAL(18,2)",
      description: "Net deposits - withdrawals",
    },

    // Channel Activity
    {
      field: "month_branch_txn_count",
      datatype: "INTEGER",
      description: "Branch transactions",
    },
    {
      field: "month_atm_txn_count",
      datatype: "INTEGER",
      description: "ATM transactions",
    },
    {
      field: "month_online_txn_count",
      datatype: "INTEGER",
      description: "Online transactions",
    },
    {
      field: "month_mobile_txn_count",
      datatype: "INTEGER",
      description: "Mobile transactions",
    },
    {
      field: "primary_channel_month",
      datatype: "STRING",
      description: "Most used channel",
    },

    // Fee & Interest Metrics
    {
      field: "month_total_fees_count",
      datatype: "INTEGER",
      description: "Number of fees",
    },
    {
      field: "month_total_fees_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total fees charged",
    },
    {
      field: "month_interest_accrued",
      datatype: "DECIMAL(18,2)",
      description: "Interest accrued",
    },
    {
      field: "month_interest_paid",
      datatype: "DECIMAL(18,2)",
      description: "Interest paid",
    },
    {
      field: "month_effective_rate",
      datatype: "DECIMAL(7,4)",
      description: "Effective interest rate %",
    },

    // Behavioral Metrics
    {
      field: "month_active_days",
      datatype: "INTEGER",
      description: "Days with activity",
    },
    {
      field: "month_days_below_minimum",
      datatype: "INTEGER",
      description: "Days below minimum balance",
    },
    {
      field: "month_days_overdraft",
      datatype: "INTEGER",
      description: "Days in overdraft",
    },
    {
      field: "month_balance_volatility",
      datatype: "DECIMAL(18,2)",
      description: "Std deviation of balances",
    },

    // Customer Value Metrics
    {
      field: "month_revenue_total",
      datatype: "DECIMAL(18,2)",
      description: "Total revenue (fees + NII)",
    },
    {
      field: "month_cost_of_funds",
      datatype: "DECIMAL(18,2)",
      description: "Interest expense",
    },
    {
      field: "month_net_profit",
      datatype: "DECIMAL(18,2)",
      description: "Revenue - CoF",
    },
  ],
};

// Fact Table 4: Customer-Level Aggregation
export const goldFactCustomerDeposits = {
  table_name: "gold.fact_customer_deposit_summary",
  fact_type: "Accumulating Snapshot Fact",
  grain: "One row per customer per month",
  monthly_volume: "~1.5M rows",

  schema: [
    {
      field: "customer_summary_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "year_month_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to customer",
    },
    { field: "year_month", datatype: "STRING", description: "YYYY-MM" },

    // Portfolio Metrics
    {
      field: "total_accounts_count",
      datatype: "INTEGER",
      description: "Number of deposit accounts",
    },
    {
      field: "active_accounts_count",
      datatype: "INTEGER",
      description: "Active accounts",
    },
    {
      field: "total_deposit_balance",
      datatype: "DECIMAL(18,2)",
      description: "Total across all accounts",
    },
    {
      field: "average_account_balance",
      datatype: "DECIMAL(18,2)",
      description: "Avg balance per account",
    },
    {
      field: "largest_account_balance",
      datatype: "DECIMAL(18,2)",
      description: "Largest account",
    },

    // Product Mix
    {
      field: "dda_accounts_count",
      datatype: "INTEGER",
      description: "DDA accounts",
    },
    {
      field: "dda_total_balance",
      datatype: "DECIMAL(18,2)",
      description: "DDA balances",
    },
    {
      field: "savings_accounts_count",
      datatype: "INTEGER",
      description: "Savings accounts",
    },
    {
      field: "savings_total_balance",
      datatype: "DECIMAL(18,2)",
      description: "Savings balances",
    },
    {
      field: "mma_accounts_count",
      datatype: "INTEGER",
      description: "MMA accounts",
    },
    {
      field: "mma_total_balance",
      datatype: "DECIMAL(18,2)",
      description: "MMA balances",
    },
    {
      field: "cd_accounts_count",
      datatype: "INTEGER",
      description: "CD accounts",
    },
    {
      field: "cd_total_balance",
      datatype: "DECIMAL(18,2)",
      description: "CD balances",
    },

    // Activity Metrics
    {
      field: "month_total_transactions",
      datatype: "INTEGER",
      description: "All transactions",
    },
    {
      field: "month_digital_transactions_pct",
      datatype: "DECIMAL(5,2)",
      description: "% digital txns",
    },
    {
      field: "month_total_deposits_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total deposits",
    },
    {
      field: "month_total_withdrawals_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total withdrawals",
    },

    // Revenue & Profitability
    {
      field: "month_total_fees",
      datatype: "DECIMAL(18,2)",
      description: "Total fees",
    },
    {
      field: "month_total_interest_expense",
      datatype: "DECIMAL(18,2)",
      description: "Interest paid",
    },
    {
      field: "month_net_interest_income",
      datatype: "DECIMAL(18,2)",
      description: "NII",
    },
    {
      field: "month_customer_profitability",
      datatype: "DECIMAL(18,2)",
      description: "Fees - Interest",
    },
    {
      field: "customer_lifetime_value_mtd",
      datatype: "DECIMAL(18,2)",
      description: "Cumulative LTV",
    },

    // Engagement Metrics
    {
      field: "relationship_tenure_months",
      datatype: "INTEGER",
      description: "Months as customer",
    },
    {
      field: "digital_adoption_flag",
      datatype: "BOOLEAN",
      description: "Uses digital channels",
    },
    {
      field: "cross_sell_products_count",
      datatype: "INTEGER",
      description: "Total bank products",
    },
    {
      field: "wallet_share_estimate",
      datatype: "DECIMAL(5,2)",
      description: "Estimated wallet share %",
    },
  ],
};

// Fact Table 5: Product-Level Performance
export const goldFactProductPerformance = {
  table_name: "gold.fact_product_performance_monthly",
  fact_type: "Periodic Snapshot Fact (Monthly by Product)",
  grain: "One row per product per month",
  monthly_volume: "~200 rows",

  schema: [
    {
      field: "product_performance_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "year_month_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    { field: "product_key", datatype: "INTEGER", description: "FK to product" },
    {
      field: "branch_key",
      datatype: "INTEGER",
      description: "FK to branch (optional rollup)",
    },

    // Account Metrics
    {
      field: "total_accounts",
      datatype: "INTEGER",
      description: "Total accounts",
    },
    {
      field: "new_accounts_opened",
      datatype: "INTEGER",
      description: "New accounts this month",
    },
    {
      field: "accounts_closed",
      datatype: "INTEGER",
      description: "Closed accounts",
    },
    {
      field: "net_new_accounts",
      datatype: "INTEGER",
      description: "Net account growth",
    },
    {
      field: "active_accounts",
      datatype: "INTEGER",
      description: "Active accounts",
    },
    {
      field: "dormant_accounts",
      datatype: "INTEGER",
      description: "Dormant accounts (>90 days)",
    },

    // Balance Metrics
    {
      field: "total_balance",
      datatype: "DECIMAL(18,2)",
      description: "Total product balance",
    },
    {
      field: "average_balance_per_account",
      datatype: "DECIMAL(18,2)",
      description: "Avg balance",
    },
    {
      field: "median_balance_per_account",
      datatype: "DECIMAL(18,2)",
      description: "Median balance",
    },
    {
      field: "balance_growth_mom_pct",
      datatype: "DECIMAL(7,4)",
      description: "MoM growth %",
    },
    {
      field: "balance_growth_yoy_pct",
      datatype: "DECIMAL(7,4)",
      description: "YoY growth %",
    },

    // Activity Metrics
    {
      field: "total_transactions",
      datatype: "INTEGER",
      description: "Total transactions",
    },
    {
      field: "transactions_per_account_avg",
      datatype: "DECIMAL(10,2)",
      description: "Avg txns per account",
    },
    {
      field: "total_deposit_volume",
      datatype: "DECIMAL(18,2)",
      description: "Deposit volume",
    },
    {
      field: "total_withdrawal_volume",
      datatype: "DECIMAL(18,2)",
      description: "Withdrawal volume",
    },

    // Revenue Metrics
    {
      field: "total_fee_revenue",
      datatype: "DECIMAL(18,2)",
      description: "Fee income",
    },
    {
      field: "total_interest_expense",
      datatype: "DECIMAL(18,2)",
      description: "Interest paid",
    },
    {
      field: "net_interest_income",
      datatype: "DECIMAL(18,2)",
      description: "NII (if asset)",
    },
    {
      field: "total_revenue",
      datatype: "DECIMAL(18,2)",
      description: "Total product revenue",
    },
    {
      field: "revenue_per_account",
      datatype: "DECIMAL(18,2)",
      description: "Revenue per account",
    },

    // Profitability
    {
      field: "cost_of_funds_rate",
      datatype: "DECIMAL(7,4)",
      description: "CoF %",
    },
    {
      field: "net_margin_pct",
      datatype: "DECIMAL(7,4)",
      description: "Net margin %",
    },
    {
      field: "return_on_deposits_pct",
      datatype: "DECIMAL(7,4)",
      description: "ROD %",
    },

    // Customer Satisfaction
    {
      field: "nps_score",
      datatype: "DECIMAL(5,2)",
      description: "Net Promoter Score",
    },
    {
      field: "customer_satisfaction_score",
      datatype: "DECIMAL(5,2)",
      description: "CSAT score",
    },
    {
      field: "churn_rate_pct",
      datatype: "DECIMAL(7,4)",
      description: "Account closure rate %",
    },
  ],
};

// Fact Table 6: Cohort Analysis
export const goldFactCohortAnalysis = {
  table_name: "gold.fact_account_cohort_analysis",
  fact_type: "Accumulating Snapshot (Cohort)",
  grain: "One row per cohort per month since opening",
  description: "Vintage analysis for account performance by opening cohort",

  schema: [
    { field: "cohort_key", datatype: "BIGINT", description: "Surrogate key" },
    {
      field: "cohort_month",
      datatype: "STRING",
      description: "Opening month cohort (YYYY-MM)",
    },
    {
      field: "months_since_opening",
      datatype: "INTEGER",
      description: "Months on book",
    },
    { field: "product_key", datatype: "INTEGER", description: "FK to product" },
    {
      field: "channel_key",
      datatype: "INTEGER",
      description: "Opening channel",
    },

    // Cohort Size Metrics
    {
      field: "cohort_initial_accounts",
      datatype: "INTEGER",
      description: "Initial cohort size",
    },
    {
      field: "cohort_active_accounts",
      datatype: "INTEGER",
      description: "Still active",
    },
    {
      field: "cohort_closed_accounts",
      datatype: "INTEGER",
      description: "Closed accounts",
    },
    {
      field: "cohort_retention_rate",
      datatype: "DECIMAL(7,4)",
      description: "Retention %",
    },

    // Balance Metrics by Cohort Age
    {
      field: "cohort_total_balance",
      datatype: "DECIMAL(18,2)",
      description: "Total balance",
    },
    {
      field: "cohort_avg_balance",
      datatype: "DECIMAL(18,2)",
      description: "Avg balance per account",
    },
    {
      field: "cohort_balance_growth_pct",
      datatype: "DECIMAL(7,4)",
      description: "Balance growth since opening",
    },

    // Activity Metrics
    {
      field: "cohort_avg_transactions_per_account",
      datatype: "DECIMAL(10,2)",
      description: "Avg monthly transactions",
    },
    {
      field: "cohort_digital_adoption_pct",
      datatype: "DECIMAL(7,4)",
      description: "% using digital",
    },

    // Revenue Metrics
    {
      field: "cohort_cumulative_revenue",
      datatype: "DECIMAL(18,2)",
      description: "Total revenue to date",
    },
    {
      field: "cohort_avg_revenue_per_account",
      datatype: "DECIMAL(18,2)",
      description: "Avg revenue per account",
    },
    {
      field: "cohort_ltv",
      datatype: "DECIMAL(18,2)",
      description: "Lifetime value",
    },
  ],
};

// Fact Table 7: Regulatory Reporting
export const goldFactRegulatoryReporting = {
  table_name: "gold.fact_regulatory_deposits_daily",
  fact_type: "Periodic Snapshot (Regulatory)",
  grain: "One row per regulatory category per day",

  schema: [
    {
      field: "regulatory_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "report_date_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    {
      field: "regulatory_category",
      datatype: "STRING",
      description: "RETAIL, WHOLESALE, OPERATIONAL",
    },
    {
      field: "product_category",
      datatype: "STRING",
      description: "DDA, Savings, MMA, CD",
    },

    // LCR Metrics
    {
      field: "lcr_stable_retail_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Stable retail (95% ASF)",
    },
    {
      field: "lcr_less_stable_retail_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Less stable (90% ASF)",
    },
    {
      field: "lcr_operational_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Operational deposits",
    },
    {
      field: "lcr_non_operational_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Non-operational",
    },
    {
      field: "lcr_assumed_outflow_rate",
      datatype: "DECIMAL(7,4)",
      description: "Weighted outflow %",
    },
    {
      field: "lcr_outflow_amount",
      datatype: "DECIMAL(18,2)",
      description: "30-day outflow assumption",
    },

    // NSFR Metrics
    {
      field: "nsfr_stable_retail_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Stable retail (95% ASF)",
    },
    {
      field: "nsfr_less_stable_retail_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Less stable (90% ASF)",
    },
    {
      field: "nsfr_wholesale_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Wholesale (50% ASF)",
    },
    {
      field: "nsfr_available_stable_funding",
      datatype: "DECIMAL(18,2)",
      description: "Total ASF from deposits",
    },

    // FDIC Insurance
    {
      field: "total_insured_deposits",
      datatype: "DECIMAL(18,2)",
      description: "FDIC insured (<$250K)",
    },
    {
      field: "total_uninsured_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Uninsured (>$250K)",
    },
    {
      field: "brokered_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Brokered deposits",
    },

    // Balance Sheet Classification
    {
      field: "demand_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Non-interest bearing demand",
    },
    {
      field: "interest_bearing_deposits",
      datatype: "DECIMAL(18,2)",
      description: "Interest bearing",
    },
    {
      field: "time_deposits_under_100k",
      datatype: "DECIMAL(18,2)",
      description: "CDs < $100K",
    },
    {
      field: "time_deposits_over_100k",
      datatype: "DECIMAL(18,2)",
      description: "CDs >= $100K",
    },
  ],
};

// Fact Table 8: Predictive Analytics / ML Features
export const goldFactMLFeatures = {
  table_name: "gold.fact_ml_features_monthly",
  fact_type: "Feature Store for ML/DS",
  grain: "One row per account per month with engineered features",

  schema: [
    {
      field: "ml_feature_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    { field: "account_key", datatype: "BIGINT", description: "FK to account" },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to customer",
    },
    { field: "snapshot_month", datatype: "STRING", description: "YYYY-MM" },

    // Balance Features
    {
      field: "balance_avg_3m",
      datatype: "DECIMAL(18,2)",
      description: "3-month avg balance",
    },
    {
      field: "balance_avg_6m",
      datatype: "DECIMAL(18,2)",
      description: "6-month avg balance",
    },
    {
      field: "balance_avg_12m",
      datatype: "DECIMAL(18,2)",
      description: "12-month avg balance",
    },
    {
      field: "balance_volatility_3m",
      datatype: "DECIMAL(18,2)",
      description: "3-month std dev",
    },
    {
      field: "balance_trend_3m",
      datatype: "DECIMAL(7,4)",
      description: "3-month growth rate",
    },
    {
      field: "balance_min_max_ratio_3m",
      datatype: "DECIMAL(7,4)",
      description: "Min/max ratio",
    },

    // Transaction Features
    {
      field: "txn_count_avg_3m",
      datatype: "DECIMAL(10,2)",
      description: "Avg monthly transactions",
    },
    {
      field: "txn_amount_avg_3m",
      datatype: "DECIMAL(18,2)",
      description: "Avg transaction amount",
    },
    {
      field: "deposit_frequency_3m",
      datatype: "INTEGER",
      description: "Deposit count",
    },
    {
      field: "withdrawal_frequency_3m",
      datatype: "INTEGER",
      description: "Withdrawal count",
    },
    {
      field: "digital_txn_pct_3m",
      datatype: "DECIMAL(7,4)",
      description: "% digital transactions",
    },

    // Behavioral Features
    {
      field: "days_since_last_transaction",
      datatype: "INTEGER",
      description: "Recency",
    },
    {
      field: "transaction_regularity_score",
      datatype: "DECIMAL(5,2)",
      description: "Regularity (0-100)",
    },
    {
      field: "weekend_txn_pct",
      datatype: "DECIMAL(7,4)",
      description: "% weekend activity",
    },
    {
      field: "evening_txn_pct",
      datatype: "DECIMAL(7,4)",
      description: "% evening activity",
    },

    // Risk Features
    {
      field: "overdraft_frequency_12m",
      datatype: "INTEGER",
      description: "Overdraft count",
    },
    { field: "fee_count_12m", datatype: "INTEGER", description: "Total fees" },
    {
      field: "fraud_alerts_12m",
      datatype: "INTEGER",
      description: "Fraud alerts",
    },
    {
      field: "dispute_count_12m",
      datatype: "INTEGER",
      description: "Disputed transactions",
    },

    // Relationship Features
    {
      field: "products_count",
      datatype: "INTEGER",
      description: "Total bank products",
    },
    {
      field: "deposit_products_count",
      datatype: "INTEGER",
      description: "Deposit products",
    },
    {
      field: "total_relationship_balance",
      datatype: "DECIMAL(18,2)",
      description: "Total balances",
    },
    {
      field: "relationship_tenure_months",
      datatype: "INTEGER",
      description: "Customer tenure",
    },

    // Target Variables (for supervised learning)
    {
      field: "target_churn_3m",
      datatype: "BOOLEAN",
      description: "Churned within 3 months",
    },
    {
      field: "target_balance_growth_3m",
      datatype: "DECIMAL(7,4)",
      description: "Balance growth %",
    },
    {
      field: "target_cross_sell_3m",
      datatype: "BOOLEAN",
      description: "Opened new product",
    },
  ],
};

// ============================================================================
// COMPLETE CATALOG
// ============================================================================

export const silverGoldLayerCatalog = {
  // Silver Layer
  silverTables: 12,
  silverColumns: 450,
  silverTransformations: [
    "Data quality validation",
    "Standardization & cleansing",
    "Entity resolution & deduplication",
    "SCD Type 2 versioning",
    "Reference data enrichment",
    "Derived attribute calculation",
    "Business rule application",
  ],

  // Gold Layer Dimensions
  goldDimensions: 15,
  dimensionColumns: 280,
  dimensionTypes: [
    "Type 2 SCD",
    "Type 1",
    "Static",
    "Junk Dimension",
    "Role-Playing",
  ],

  // Gold Layer Facts
  goldFactTables: 8,
  factColumns: 570,
  factTypes: {
    transactionFacts: 1,
    periodicSnapshotFacts: 4,
    accumulatingSnapshotFacts: 2,
    aggregateFacts: 1,
  },

  // Aggregation Grains
  aggregationLevels: [
    "Transaction (Atomic)",
    "Daily (Account)",
    "Daily (Product)",
    "Daily (Branch)",
    "Monthly (Account)",
    "Monthly (Customer)",
    "Monthly (Product)",
    "Monthly (Cohort)",
    "Quarterly Summary",
    "Yearly Summary",
  ],

  // Use Case Support
  useCases: {
    biReporting: "Pre-aggregated facts for fast dashboard performance",
    executiveDashboards: "Monthly/quarterly summaries with KPIs",
    regulatoryReporting: "LCR, NSFR, FDIC Call Report structures",
    customerAnalytics: "Customer-level aggregations with lifetime value",
    productAnalytics: "Product performance with profitability metrics",
    cohortAnalysis: "Vintage analysis for retention and growth",
    mlDataScience: "Feature-engineered datasets for predictive models",
    adhocAnalysis: "Flexible star schema for SQL queries",
  },

  // Performance Optimizations
  optimizations: [
    "Partitioning by date for query pruning",
    "Clustering on high-cardinality keys",
    "Pre-aggregated summary tables",
    "Materialized rollups for common queries",
    "Denormalized dimensions for join performance",
    "Bitmap indexes on low-cardinality fields",
    "Columnar storage format",
    "Z-ordering on frequently filtered columns",
  ],
};

// Export all fact tables
export const allGoldFactTables = [
  goldFactTransactions,
  goldFactDailyPositions,
  goldFactMonthlyAccountSummary,
  goldFactCustomerDeposits,
  goldFactProductPerformance,
  goldFactCohortAnalysis,
  goldFactRegulatoryReporting,
  goldFactMLFeatures,
];

export type GoldFactTable = typeof goldFactTransactions;
