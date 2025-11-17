// COMPREHENSIVE BRONZE LAYER - CREDIT CARDS DOMAIN
// Raw landing zone for all credit card data
// Covers: Authorizations, Transactions, Payments, Rewards, Fraud, Disputes

// ============================================================================
// BRONZE LAYER PRINCIPLES
// ============================================================================

export const creditCardsBronzeLayerPrinciples = {
  purpose: "Raw landing zone with full transaction history",
  characteristics: [
    "Real-time authorization data (sub-second)",
    "Transaction-level granularity",
    "Complete audit trail",
    "Fraud detection integration",
    "Retention: 7 years minimum",
  ],
  dataVolume: "Billions of transactions annually",
};

// ============================================================================
// BRONZE TABLE 1: CARD ACCOUNT MASTER
// ============================================================================

export const bronzeCardAccountMaster = {
  table_name: "bronze.card_account_master_raw",
  description: "Raw credit card account master data",
  source_system: "Card Management System",
  update_frequency: "Real-time CDC",

  ddl: `
CREATE TABLE bronze.card_account_master_raw (
  -- Account Keys
  card_account_id VARCHAR(50) NOT NULL COMMENT 'Card account number',
  primary_card_number VARCHAR(19) COMMENT 'Primary card number (encrypted)',
  
  -- Customer Information
  customer_id VARCHAR(50) COMMENT 'Cardholder customer ID',
  primary_cardholder_name VARCHAR(200),
  
  -- Account Status
  account_status VARCHAR(20) COMMENT 'ACTIVE, CLOSED, SUSPENDED, FROZEN, DELINQUENT',
  account_status_reason VARCHAR(100),
  status_date DATE,
  
  -- Product Information
  card_product_code VARCHAR(50) COMMENT 'Product identifier',
  card_product_name VARCHAR(200),
  card_brand VARCHAR(20) COMMENT 'VISA, MASTERCARD, AMEX, DISCOVER',
  card_type VARCHAR(30) COMMENT 'CREDIT, DEBIT, CHARGE, PREPAID',
  card_tier VARCHAR(30) COMMENT 'PLATINUM, GOLD, REWARDS, CASHBACK',
  
  -- Account Open/Close
  account_open_date DATE,
  account_close_date DATE,
  first_card_issued_date DATE,
  
  -- Credit Limit & Balances
  credit_limit DECIMAL(18,2),
  cash_advance_limit DECIMAL(18,2),
  available_credit DECIMAL(18,2),
  current_balance DECIMAL(18,2),
  statement_balance DECIMAL(18,2),
  minimum_payment_due DECIMAL(18,2),
  
  -- Interest Rates
  purchase_apr DECIMAL(7,4),
  cash_advance_apr DECIMAL(7,4),
  penalty_apr DECIMAL(7,4),
  promotional_apr DECIMAL(7,4),
  promotional_apr_expiration DATE,
  
  -- Payment Information
  payment_due_date DATE,
  last_payment_date DATE,
  last_payment_amount DECIMAL(18,2),
  days_past_due INTEGER,
  delinquency_status VARCHAR(20) COMMENT 'CURRENT, 30DPD, 60DPD, 90DPD, etc.',
  
  -- Rewards
  rewards_program_id VARCHAR(50),
  rewards_balance INTEGER COMMENT 'Points or miles balance',
  rewards_tier VARCHAR(30) COMMENT 'Rewards tier level',
  
  -- Fees
  annual_fee DECIMAL(18,2),
  annual_fee_waived_flag BOOLEAN,
  late_fee_amount DECIMAL(18,2),
  overlimit_fee_amount DECIMAL(18,2),
  foreign_transaction_fee_pct DECIMAL(7,4),
  
  -- Billing
  billing_cycle_day INTEGER COMMENT 'Day of month for statement',
  last_statement_date DATE,
  next_statement_date DATE,
  
  -- Risk & Fraud
  fraud_alert_flag BOOLEAN,
  travel_notification_flag BOOLEAN,
  velocity_limit_exceeded_flag BOOLEAN,
  
  -- Regulatory
  card_act_compliant_flag BOOLEAN COMMENT 'CARD Act compliance',
  opt_in_overlimit_flag BOOLEAN,
  
  -- CDC Metadata
  cdc_operation VARCHAR(10),
  cdc_timestamp TIMESTAMP,
  cdc_sequence_number BIGINT,
  
  -- Audit
  source_system_id VARCHAR(50),
  ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  record_hash VARCHAR(64)
)
PARTITIONED BY (DATE_TRUNC('month', account_open_date))
CLUSTER BY (account_status, card_product_code);
  `,

  row_count_estimate: "50M active cards",
};

// ============================================================================
// BRONZE TABLE 2: CARD AUTHORIZATIONS
// ============================================================================

export const bronzeCardAuthorizations = {
  table_name: "bronze.card_authorizations_raw",
  description: "Real-time authorization requests (approved & declined)",
  source_system: "Authorization Switch",
  update_frequency: "Real-time streaming (sub-second)",

  ddl: `
CREATE TABLE bronze.card_authorizations_raw (
  -- Authorization Keys
  authorization_id VARCHAR(50) NOT NULL COMMENT 'Unique auth ID',
  card_account_id VARCHAR(50),
  card_number_token VARCHAR(64) COMMENT 'Tokenized card number',
  
  -- Authorization Request
  authorization_timestamp TIMESTAMP COMMENT 'Auth request time',
  authorization_date DATE,
  authorization_amount DECIMAL(18,2),
  authorization_currency VARCHAR(3) COMMENT 'USD, EUR, etc.',
  
  -- Authorization Response
  authorization_response VARCHAR(20) COMMENT 'APPROVED, DECLINED',
  authorization_code VARCHAR(10) COMMENT 'Approval code',
  decline_reason_code VARCHAR(10),
  decline_reason_description VARCHAR(200),
  
  -- Merchant Information
  merchant_id VARCHAR(50),
  merchant_name VARCHAR(200),
  merchant_city VARCHAR(100),
  merchant_state VARCHAR(50),
  merchant_country VARCHAR(3),
  merchant_zip VARCHAR(20),
  merchant_category_code VARCHAR(4) COMMENT 'MCC code',
  merchant_category_description VARCHAR(200),
  
  -- Transaction Context
  transaction_type VARCHAR(30) COMMENT 'PURCHASE, CASH_ADVANCE, BALANCE_TRANSFER',
  card_present_flag BOOLEAN COMMENT 'Card physically present',
  card_entry_mode VARCHAR(30) COMMENT 'CHIP, SWIPE, CONTACTLESS, KEYED, ECOMMERCE',
  channel VARCHAR(20) COMMENT 'POS, ATM, ECOMMERCE, MOBILE',
  
  // EMV/Chip Data
  emv_chip_data VARCHAR(500) COMMENT 'EMV cryptogram',
  chip_auth_flag BOOLEAN,
  
  -- Location Data
  pos_terminal_id VARCHAR(50),
  atm_terminal_id VARCHAR(50),
  terminal_location_lat DECIMAL(10,7),
  terminal_location_long DECIMAL(10,7),
  
  -- Risk & Fraud Indicators
  fraud_score DECIMAL(5,2) COMMENT 'Real-time fraud score (0-100)',
  fraud_alert_flag BOOLEAN,
  fraud_reason_codes VARCHAR(200) COMMENT 'Comma-separated codes',
  velocity_check_flag BOOLEAN,
  geolocation_mismatch_flag BOOLEAN,
  unusual_merchant_flag BOOLEAN,
  
  -- 3D Secure
  three_d_secure_flag BOOLEAN,
  three_d_secure_eci VARCHAR(2) COMMENT 'E-commerce indicator',
  
  -- International Flags
  international_transaction_flag BOOLEAN,
  cross_border_flag BOOLEAN,
  
  -- Recurring/Installment
  recurring_transaction_flag BOOLEAN,
  installment_flag BOOLEAN,
  installment_count INTEGER,
  
  -- Authorization Hold
  auth_hold_amount DECIMAL(18,2) COMMENT 'Amount placed on hold',
  auth_hold_expiration TIMESTAMP,
  
  -- Reversal
  reversal_flag BOOLEAN,
  reversal_reason VARCHAR(100),
  original_authorization_id VARCHAR(50) COMMENT 'If reversal, points to original',
  
  -- CDC Metadata
  cdc_operation VARCHAR(10),
  cdc_timestamp TIMESTAMP,
  cdc_sequence_number BIGINT,
  
  -- Audit
  source_system_id VARCHAR(50),
  ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  record_hash VARCHAR(64)
)
PARTITIONED BY (DATE_TRUNC('day', authorization_date))
CLUSTER BY (card_account_id, authorization_response, fraud_alert_flag);
  `,

  row_count_estimate: "500M authorizations/month",
};

// ============================================================================
// BRONZE TABLE 3: CARD TRANSACTIONS (Settled)
// ============================================================================

export const bronzeCardTransactions = {
  table_name: "bronze.card_transactions_raw",
  description: "Settled/posted card transactions",
  source_system: "Transaction Processing System",
  update_frequency: "Daily batch (T+1)",

  ddl: `
CREATE TABLE bronze.card_transactions_raw (
  -- Transaction Keys
  transaction_id VARCHAR(50) NOT NULL,
  authorization_id VARCHAR(50) COMMENT 'FK to authorization',
  card_account_id VARCHAR(50),
  
  -- Transaction Details
  transaction_date DATE COMMENT 'Posting date',
  transaction_timestamp TIMESTAMP,
  settlement_date DATE,
  transaction_amount DECIMAL(18,2),
  transaction_currency VARCHAR(3),
  billing_amount DECIMAL(18,2) COMMENT 'Amount in billing currency',
  billing_currency VARCHAR(3),
  exchange_rate DECIMAL(12,6),
  
  -- Transaction Type
  transaction_type VARCHAR(30) COMMENT 'PURCHASE, CASH_ADVANCE, FEE, INTEREST, PAYMENT, etc.',
  transaction_category VARCHAR(50),
  debit_credit_indicator VARCHAR(10) COMMENT 'DEBIT, CREDIT',
  
  -- Merchant (for purchases)
  merchant_id VARCHAR(50),
  merchant_name VARCHAR(200),
  merchant_category_code VARCHAR(4),
  merchant_category_description VARCHAR(200),
  merchant_city VARCHAR(100),
  merchant_state VARCHAR(50),
  merchant_country VARCHAR(3),
  
  -- Fees & Interest
  fee_amount DECIMAL(18,2),
  fee_type VARCHAR(50),
  interest_amount DECIMAL(18,2),
  interest_type VARCHAR(50),
  foreign_exchange_fee DECIMAL(18,2),
  
  -- Rewards
  rewards_earned INTEGER COMMENT 'Points/miles earned',
  rewards_redeemed INTEGER COMMENT 'Points/miles redeemed',
  rewards_multiplier DECIMAL(5,2) COMMENT 'Earn rate multiplier',
  
  -- Dispute Status
  dispute_flag BOOLEAN,
  dispute_id VARCHAR(50),
  chargeback_flag BOOLEAN,
  
  -- Installment
  installment_plan_flag BOOLEAN,
  installment_number INTEGER COMMENT 'Which installment (1 of N)',
  total_installments INTEGER,
  
  -- Balance Impact
  purchase_balance_impact DECIMAL(18,2),
  cash_advance_balance_impact DECIMAL(18,2),
  promotional_balance_impact DECIMAL(18,2),
  
  -- CDC Metadata
  cdc_operation VARCHAR(10),
  cdc_timestamp TIMESTAMP,
  cdc_sequence_number BIGINT,
  
  -- Audit
  source_system_id VARCHAR(50),
  ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  record_hash VARCHAR(64)
)
PARTITIONED BY (DATE_TRUNC('month', transaction_date))
CLUSTER BY (card_account_id, transaction_type);
  `,

  row_count_estimate: "400M transactions/month",
};

// ============================================================================
// ADDITIONAL BRONZE TABLES (Abbreviated)
// ============================================================================

export const additionalBronzeTables = [
  {
    table_name: "bronze.card_payments_raw",
    description: "Payment transactions (principal, interest, fees)",
    key_fields: [
      "payment_id",
      "card_account_id",
      "payment_amount",
      "payment_date",
    ],
  },
  {
    table_name: "bronze.card_statements_raw",
    description: "Monthly card statements",
    key_fields: [
      "statement_id",
      "card_account_id",
      "statement_date",
      "statement_balance",
    ],
  },
  {
    table_name: "bronze.card_disputes_raw",
    description: "Dispute and chargeback tracking",
    key_fields: [
      "dispute_id",
      "transaction_id",
      "dispute_reason",
      "dispute_status",
    ],
  },
  {
    table_name: "bronze.card_fraud_cases_raw",
    description: "Fraud investigation cases",
    key_fields: [
      "fraud_case_id",
      "card_account_id",
      "fraud_type",
      "investigation_status",
    ],
  },
  {
    table_name: "bronze.card_rewards_transactions_raw",
    description: "Rewards earnings and redemptions",
    key_fields: [
      "rewards_transaction_id",
      "card_account_id",
      "points_earned",
      "points_redeemed",
    ],
  },
  {
    table_name: "bronze.card_fee_assessments_raw",
    description: "Fee assessments and waivers",
    key_fields: ["fee_id", "card_account_id", "fee_type", "fee_amount"],
  },
  {
    table_name: "bronze.card_interest_charges_raw",
    description: "Interest charge calculations",
    key_fields: [
      "interest_id",
      "card_account_id",
      "interest_type",
      "interest_amount",
    ],
  },
  {
    table_name: "bronze.card_credit_limit_changes_raw",
    description: "Credit limit increase/decrease history",
    key_fields: [
      "limit_change_id",
      "card_account_id",
      "old_limit",
      "new_limit",
    ],
  },
  {
    table_name: "bronze.card_applications_raw",
    description: "Credit card application data",
    key_fields: [
      "application_id",
      "customer_id",
      "requested_product",
      "decision",
    ],
  },
  {
    table_name: "bronze.merchant_master_raw",
    description: "Merchant reference data",
    key_fields: [
      "merchant_id",
      "merchant_name",
      "mcc_code",
      "merchant_country",
    ],
  },
  {
    table_name: "bronze.card_product_master_raw",
    description: "Card product catalog",
    key_fields: ["product_code", "product_name", "card_brand", "annual_fee"],
  },
  {
    table_name: "bronze.card_balance_transfers_raw",
    description: "Balance transfer transactions",
    key_fields: [
      "transfer_id",
      "card_account_id",
      "transfer_amount",
      "promotional_rate",
    ],
  },
];

// ============================================================================
// BRONZE LAYER CATALOG
// ============================================================================

export const creditCardsBronzeLayerCatalog = {
  totalTables: 15,
  totalColumns: 400,
  estimatedDailyVolume: "500M rows/day (authorizations + transactions)",

  realTimeStreams: [
    "card_authorizations_raw (sub-second latency)",
    "card_fraud_cases_raw",
  ],

  batchLoads: [
    "card_transactions_raw (T+1)",
    "card_statements_raw (monthly)",
    "card_payments_raw (daily)",
  ],

  keyCharacteristics: [
    "High-velocity transaction data",
    "Real-time fraud detection integration",
    "PCI-DSS compliant data handling",
    "Tokenized card numbers",
    "Complete authorization-to-settlement lifecycle",
  ],
};
