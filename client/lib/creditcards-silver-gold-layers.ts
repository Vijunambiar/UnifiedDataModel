// SILVER & GOLD LAYERS - CREDIT CARDS DOMAIN
// Enterprise dimensional model for credit card analytics

// ============================================================================
// SILVER LAYER
// ============================================================================

export const creditCardsSilverLayer = {
  tables: 12,

  silverCardAccountGolden: {
    table_name: "silver.card_account_golden",
    description: "Golden record for credit card accounts with SCD Type 2",
    schema: [
      {
        field: "card_account_sk",
        datatype: "BIGINT",
        description: "Surrogate key",
      },
      {
        field: "card_account_id",
        datatype: "STRING",
        description: "Natural key",
      },
      {
        field: "customer_sk",
        datatype: "BIGINT",
        description: "FK to customer",
      },
      {
        field: "card_product_sk",
        datatype: "BIGINT",
        description: "FK to product",
      },
      {
        field: "account_status",
        datatype: "STRING",
        description: "ACTIVE, CLOSED, etc.",
      },
      {
        field: "credit_limit",
        datatype: "DECIMAL(18,2)",
        description: "Credit limit",
      },
      {
        field: "current_balance",
        datatype: "DECIMAL(18,2)",
        description: "Current balance",
      },
      {
        field: "available_credit",
        datatype: "DECIMAL(18,2)",
        description: "Available credit",
      },
      {
        field: "purchase_apr",
        datatype: "DECIMAL(7,4)",
        description: "Purchase APR",
      },
      {
        field: "rewards_program_id",
        datatype: "STRING",
        description: "Rewards program",
      },
      {
        field: "delinquency_status",
        datatype: "STRING",
        description: "DPD status",
      },
      {
        field: "effective_start_timestamp",
        datatype: "TIMESTAMP",
        description: "SCD2 start",
      },
      {
        field: "effective_end_timestamp",
        datatype: "TIMESTAMP",
        description: "SCD2 end",
      },
      { field: "is_current", datatype: "BOOLEAN", description: "Current flag" },
    ],
  },

  additionalSilverTables: [
    "silver.card_authorization_master (cleansed authorizations)",
    "silver.card_transaction_master (settled transactions)",
    "silver.card_balance_snapshots_daily (daily positions)",
    "silver.card_fraud_events (fraud cases)",
    "silver.card_disputes (dispute lifecycle)",
    "silver.merchant_golden (merchant master with SCD2)",
    "silver.card_rewards_ledger (rewards activity)",
    "silver.card_statement_summary (monthly statements)",
    "silver.customer_golden (shared dimension)",
    "silver.card_payment_history (payment transactions)",
    "silver.card_interest_fee_charges (charges)",
  ],
};

// ============================================================================
// GOLD LAYER - DIMENSIONS
// ============================================================================

export const creditCardsGoldDimensions = [
  {
    table_name: "gold.dim_card_account",
    description: "Card account dimension with SCD Type 2",
    row_count: "50M cards",
    key_attributes: [
      "card_account_id",
      "customer_key",
      "product_key",
      "account_status",
      "credit_limit",
      "account_open_date",
      "rewards_program",
    ],
  },
  {
    table_name: "gold.dim_card_product",
    description: "Card product catalog",
    row_count: "200 products",
    key_attributes: [
      "product_code",
      "product_name",
      "card_brand",
      "card_tier",
      "annual_fee",
      "rewards_rate",
    ],
  },
  {
    table_name: "gold.dim_merchant",
    description: "Merchant dimension",
    row_count: "50M merchants",
    key_attributes: [
      "merchant_id",
      "merchant_name",
      "mcc_code",
      "merchant_country",
      "merchant_category",
    ],
  },
  {
    table_name: "gold.dim_customer",
    description: "Cardholder dimension (shared)",
    row_count: "40M customers",
  },
  {
    table_name: "gold.dim_date",
    description: "Date dimension (shared)",
    row_count: "3,650 days",
  },
  {
    table_name: "gold.dim_mcc_category",
    description: "Merchant category code reference",
    row_count: "500 categories",
  },
  {
    table_name: "gold.dim_rewards_program",
    description: "Rewards program details",
    row_count: "50 programs",
  },
  {
    table_name: "gold.dim_fraud_reason",
    description: "Fraud reason code reference",
    row_count: "100 reasons",
  },
];

// ============================================================================
// GOLD LAYER - FACT TABLES
// ============================================================================

export const creditCardsGoldFacts = [
  {
    table_name: "gold.fact_card_authorizations",
    description: "Authorization transactions (transaction grain)",
    grain: "One row per authorization",
    row_count: "500M rows/month",
    schema: [
      { field: "authorization_key", description: "Surrogate key" },
      { field: "authorization_date_key", description: "FK to dim_date" },
      { field: "card_account_key", description: "FK to dim_card_account" },
      { field: "customer_key", description: "FK to dim_customer" },
      { field: "merchant_key", description: "FK to dim_merchant" },
      { field: "authorization_amount", description: "Authorization amount" },
      { field: "authorization_response", description: "APPROVED/DECLINED" },
      { field: "fraud_score", description: "Fraud score" },
      { field: "decline_reason_code", description: "Decline reason" },
      { field: "international_flag", description: "International txn" },
      { field: "card_present_flag", description: "Card present" },
    ],
  },
  {
    table_name: "gold.fact_card_transactions",
    description: "Settled card transactions (transaction grain)",
    grain: "One row per posted transaction",
    row_count: "400M rows/month",
    schema: [
      { field: "transaction_key", description: "Surrogate key" },
      { field: "transaction_date_key", description: "FK to dim_date" },
      { field: "card_account_key", description: "FK to dim_card_account" },
      { field: "customer_key", description: "FK to dim_customer" },
      { field: "merchant_key", description: "FK to dim_merchant" },
      { field: "transaction_amount", description: "Transaction amount" },
      {
        field: "transaction_type",
        description: "PURCHASE, CASH_ADVANCE, etc.",
      },
      { field: "rewards_earned", description: "Rewards points earned" },
      { field: "fee_amount", description: "Fees charged" },
      { field: "interest_amount", description: "Interest charged" },
    ],
  },
  {
    table_name: "gold.fact_card_balances_daily",
    description: "Daily card account positions (periodic snapshot)",
    grain: "One row per card per day",
    row_count: "1.5B rows/month (50M cards x 30 days)",
    schema: [
      { field: "balance_key", description: "Surrogate key" },
      { field: "balance_date_key", description: "FK to dim_date" },
      { field: "card_account_key", description: "FK to dim_card_account" },
      { field: "customer_key", description: "FK to dim_customer" },
      { field: "total_balance", description: "Total balance" },
      { field: "purchase_balance", description: "Purchase balance" },
      { field: "cash_advance_balance", description: "Cash advance balance" },
      { field: "available_credit", description: "Available credit" },
      { field: "utilization_rate", description: "Balance / Limit" },
      { field: "days_past_due", description: "DPD" },
      { field: "daily_purchase_amount", description: "Purchases today" },
      { field: "daily_payment_amount", description: "Payments today" },
    ],
  },
  {
    table_name: "gold.fact_card_statements_monthly",
    description: "Monthly statement summary (periodic snapshot)",
    grain: "One row per card per month",
    metrics: [
      "statement_balance",
      "minimum_payment_due",
      "total_purchases",
      "total_payments",
      "interest_charged",
      "fees_charged",
      "rewards_earned",
    ],
  },
  {
    table_name: "gold.fact_card_fraud_events",
    description: "Fraud cases and investigations (transaction grain)",
    grain: "One row per fraud case",
    metrics: [
      "fraud_amount",
      "fraud_type",
      "fraud_detection_method",
      "cardholder_liable_amount",
      "merchant_chargeback_amount",
    ],
  },
  {
    table_name: "gold.fact_card_disputes",
    description: "Dispute lifecycle tracking (accumulating snapshot)",
    grain: "One row per dispute",
    metrics: [
      "disputed_amount",
      "dispute_outcome",
      "resolution_time_days",
      "chargeback_amount",
    ],
  },
  {
    table_name: "gold.fact_card_rewards",
    description: "Rewards earnings and redemptions (transaction grain)",
    grain: "One row per rewards transaction",
    metrics: [
      "points_earned",
      "points_redeemed",
      "redemption_value",
      "rewards_multiplier",
    ],
  },
  {
    table_name: "gold.fact_card_profitability_monthly",
    description: "Card-level profitability (periodic snapshot)",
    grain: "One row per card per month",
    metrics: [
      "interchange_income",
      "interest_income",
      "fee_income",
      "total_revenue",
      "credit_loss_provision",
      "fraud_losses",
      "net_profit",
    ],
  },
];

// ============================================================================
// SUMMARY
// ============================================================================

export const creditCardsSilverGoldSummary = {
  silver: {
    tables: 12,
    features: [
      "SCD Type 2 for accounts and merchants",
      "Authorization-to-settlement reconciliation",
      "Fraud event enrichment",
      "Rewards ledger consolidation",
    ],
  },
  gold: {
    dimensions: 8,
    facts: 8,
    features: [
      "Star schema optimized for BI",
      "Pre-aggregated monthly summaries",
      "Real-time authorization facts",
      "Comprehensive fraud analytics",
    ],
  },
  totalDataVolume: "50TB annually (high-velocity transactions)",
};
