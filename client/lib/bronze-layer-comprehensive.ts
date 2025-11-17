// COMPREHENSIVE BRONZE LAYER - DEPOSITS & FUNDING DOMAIN
// Plug-and-Play Module for Enterprise Banking
// Aligned with: JPMorgan Chase, Bank of America, Wells Fargo, Citibank standards

// ============================================================================
// BRONZE LAYER ARCHITECTURE PRINCIPLES
// ============================================================================

export const bronzeLayerPrinciples = {
  immutability: "All records are append-only, never updated or deleted",
  rawSchema: "Preserve exact source system schema and data types",
  technicalMetadata:
    "Mandatory fields: source_system_id, ingestion_timestamp, record_hash, partition_key",
  dataIntegrity: "MD5/SHA256 hash for data integrity verification",
  auditTrail: "Complete lineage from source to bronze with CDC watermarks",
  retention: "7-year retention for regulatory compliance (SOX, GLBA)",
  compression: "Snappy/Zstandard compression for storage optimization",
  partitioning: "Date-based partitioning for query performance",
};

// ============================================================================
// TABLE 1: ACCOUNT MASTER
// Source: Core Banking Platform (Finacle, T24, Temenos, Oracle FSS)
// ============================================================================

export const bronzeAccountMaster = {
  table_name: "bronze.deposit_account_master_raw",
  description:
    "Raw account master data from core banking system - all account types (DDA, Savings, MMA, CD, Sweep, Escrow)",
  source_system: "Core Banking Platform",
  source_tables: ["ACCOUNT_MASTER", "ACCOUNT_INFO", "CUSTOMER_ACCOUNT_LINK"],
  ingestion_method: "Change Data Capture (CDC) - Real-time",
  ingestion_tool: "Debezium / Oracle GoldenGate / Kafka Connect",
  refresh_frequency: "Real-time CDC (< 5 second latency)",
  average_volume_daily: "~50,000 inserts/updates",
  average_volume_total: "~2,000,000 active accounts",
  retention_period: "7 years (regulatory requirement)",
  partition_strategy: "PARTITION BY DATE(ingestion_timestamp)",
  clustering_keys: ["account_id", "customer_id"],
  compression: "SNAPPY",
  data_quality_rules: [
    "account_id must be unique and not null",
    "customer_id must exist in customer master",
    "account_number must match format validation",
    "open_date cannot be future date",
    "product_code must exist in reference data",
    "account_status must be in (ACTIVE, CLOSED, DORMANT, FROZEN, RESTRICTED)",
  ],

  schema: [
    {
      field: "account_id",
      datatype: "STRING",
      length: 50,
      nullable: false,
      pii: false,
      description: "Unique account identifier (surrogate key from source)",
    },
    {
      field: "account_number",
      datatype: "STRING",
      length: 20,
      nullable: false,
      pii: true,
      description: "Customer-facing account number (may be masked)",
    },
    {
      field: "customer_id",
      datatype: "STRING",
      length: 50,
      nullable: false,
      pii: false,
      description: "Primary account holder customer ID",
    },
    {
      field: "co_customer_id",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description: "Joint account co-owner customer ID",
    },
    {
      field: "product_code",
      datatype: "STRING",
      length: 20,
      nullable: false,
      pii: false,
      description:
        "Product type code (DDA_BASIC, SAV_PREMIUM, MMA_TIERED, CD_12M, etc.)",
    },
    {
      field: "product_name",
      datatype: "STRING",
      length: 100,
      nullable: true,
      pii: false,
      description: "Product marketing name",
    },
    {
      field: "account_status",
      datatype: "STRING",
      length: 20,
      nullable: false,
      pii: false,
      description:
        "Account status (ACTIVE, CLOSED, DORMANT, FROZEN, RESTRICTED)",
    },
    {
      field: "account_sub_status",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description:
        "Detailed status reason (FRAUD_HOLD, GARNISHMENT, ESCHEATMENT, etc.)",
    },
    {
      field: "open_date",
      datatype: "DATE",
      length: null,
      nullable: false,
      pii: false,
      description: "Account opening date",
    },
    {
      field: "open_timestamp",
      datatype: "TIMESTAMP",
      length: null,
      nullable: true,
      pii: false,
      description: "Account opening timestamp (if available)",
    },
    {
      field: "close_date",
      datatype: "DATE",
      length: null,
      nullable: true,
      pii: false,
      description: "Account closure date (null if active)",
    },
    {
      field: "close_reason_code",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description:
        "Closure reason code (CUSTOMER_REQUEST, DORMANCY, FRAUD, etc.)",
    },
    {
      field: "branch_id",
      datatype: "STRING",
      length: 20,
      nullable: false,
      pii: false,
      description: "Home branch identifier",
    },
    {
      field: "opening_branch_id",
      datatype: "STRING",
      length: 20,
      nullable: true,
      pii: false,
      description: "Branch where account was opened",
    },
    {
      field: "region_code",
      datatype: "STRING",
      length: 10,
      nullable: true,
      pii: false,
      description: "Geographic region code",
    },
    {
      field: "interest_bearing_flag",
      datatype: "BOOLEAN",
      length: null,
      nullable: false,
      pii: false,
      description: "Whether account earns interest (TRUE/FALSE)",
    },
    {
      field: "current_interest_rate",
      datatype: "DECIMAL",
      length: "(7,4)",
      nullable: true,
      pii: false,
      description: "Current annual interest rate (%)",
    },
    {
      field: "rate_tier",
      datatype: "STRING",
      length: 20,
      nullable: true,
      pii: false,
      description: "Interest rate tier level",
    },
    {
      field: "rate_type",
      datatype: "STRING",
      length: 20,
      nullable: true,
      pii: false,
      description: "Rate type (FIXED, VARIABLE, TIERED)",
    },
    {
      field: "overdraft_protection_flag",
      datatype: "BOOLEAN",
      length: null,
      nullable: true,
      pii: false,
      description: "Overdraft protection enabled",
    },
    {
      field: "overdraft_limit",
      datatype: "DECIMAL",
      length: "(18,2)",
      nullable: true,
      pii: false,
      description: "Overdraft limit amount",
    },
    {
      field: "linked_savings_account_id",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description: "Linked savings for overdraft protection",
    },
    {
      field: "sweep_flag",
      datatype: "BOOLEAN",
      length: null,
      nullable: true,
      pii: false,
      description: "Automatic sweep enabled",
    },
    {
      field: "sweep_destination_account_id",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description: "Target account for sweep",
    },
    {
      field: "minimum_balance_required",
      datatype: "DECIMAL",
      length: "(18,2)",
      nullable: true,
      pii: false,
      description: "Minimum balance requirement",
    },
    {
      field: "monthly_fee_amount",
      datatype: "DECIMAL",
      length: "(18,2)",
      nullable: true,
      pii: false,
      description: "Monthly maintenance fee",
    },
    {
      field: "fee_waiver_balance",
      datatype: "DECIMAL",
      length: "(18,2)",
      nullable: true,
      pii: false,
      description: "Balance threshold for fee waiver",
    },
    {
      field: "statement_cycle",
      datatype: "STRING",
      length: 10,
      nullable: true,
      pii: false,
      description: "Statement cycle (MONTHLY, QUARTERLY)",
    },
    {
      field: "statement_delivery_method",
      datatype: "STRING",
      length: 20,
      nullable: true,
      pii: false,
      description: "Delivery method (PAPER, ELECTRONIC, BOTH)",
    },
    {
      field: "currency_code",
      datatype: "STRING",
      length: 3,
      nullable: false,
      pii: false,
      description: "ISO 4217 currency code (USD, EUR, GBP, etc.)",
    },
    {
      field: "tax_reporting_flag",
      datatype: "BOOLEAN",
      length: null,
      nullable: true,
      pii: false,
      description: "Subject to tax reporting (1099-INT)",
    },
    {
      field: "brokered_deposit_flag",
      datatype: "BOOLEAN",
      length: null,
      nullable: true,
      pii: false,
      description: "Brokered deposit indicator",
    },
    {
      field: "fdic_insured_flag",
      datatype: "BOOLEAN",
      length: null,
      nullable: false,
      pii: false,
      description: "FDIC insurance coverage",
    },
    {
      field: "regulatory_category",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description: "Regulatory classification (RETAIL, WHOLESALE, OPERATIONAL)",
    },
    {
      field: "lcr_classification",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description: "LCR deposit classification",
    },
    {
      field: "nsfr_asf_factor",
      datatype: "DECIMAL",
      length: "(5,4)",
      nullable: true,
      pii: false,
      description: "NSFR Available Stable Funding factor",
    },
    {
      field: "last_activity_date",
      datatype: "DATE",
      length: null,
      nullable: true,
      pii: false,
      description: "Last transaction/activity date",
    },
    {
      field: "dormancy_date",
      datatype: "DATE",
      length: null,
      nullable: true,
      pii: false,
      description: "Date account became dormant",
    },
    {
      field: "escheatment_date",
      datatype: "DATE",
      length: null,
      nullable: true,
      pii: false,
      description: "Escheatment processing date",
    },
    {
      field: "channel_opened",
      datatype: "STRING",
      length: 20,
      nullable: true,
      pii: false,
      description:
        "Account opening channel (BRANCH, ONLINE, MOBILE, CALL_CENTER)",
    },
    {
      field: "source_system_id",
      datatype: "STRING",
      length: 50,
      nullable: false,
      pii: false,
      description: "MANDATORY: Source system identifier",
    },
    {
      field: "source_record_id",
      datatype: "STRING",
      length: 100,
      nullable: true,
      pii: false,
      description: "Source system record identifier",
    },
    {
      field: "source_update_timestamp",
      datatype: "TIMESTAMP",
      length: null,
      nullable: true,
      pii: false,
      description: "Source system last update timestamp",
    },
    {
      field: "cdc_operation",
      datatype: "STRING",
      length: 10,
      nullable: true,
      pii: false,
      description: "CDC operation type (INSERT, UPDATE, DELETE)",
    },
    {
      field: "cdc_lsn",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description: "CDC Log Sequence Number",
    },
    {
      field: "ingestion_timestamp",
      datatype: "TIMESTAMP",
      length: null,
      nullable: false,
      pii: false,
      description: "MANDATORY: Bronze layer ingestion timestamp (UTC)",
    },
    {
      field: "ingestion_batch_id",
      datatype: "STRING",
      length: 50,
      nullable: true,
      pii: false,
      description: "Batch/job identifier for ingestion run",
    },
    {
      field: "record_hash",
      datatype: "STRING",
      length: 64,
      nullable: false,
      pii: false,
      description: "MANDATORY: SHA256 hash for data integrity",
    },
    {
      field: "partition_date",
      datatype: "DATE",
      length: null,
      nullable: false,
      pii: false,
      description: "MANDATORY: Partition key (DATE(ingestion_timestamp))",
    },
  ],

  sample_data: [
    {
      account_id: "ACC_DDA_0001234567",
      account_number: "****7890",
      customer_id: "CUST_0000123456",
      co_customer_id: null,
      product_code: "DDA_BASIC",
      product_name: "Basic Checking",
      account_status: "ACTIVE",
      account_sub_status: null,
      open_date: "2023-01-15",
      open_timestamp: "2023-01-15 09:30:15",
      close_date: null,
      close_reason_code: null,
      branch_id: "BR_001",
      opening_branch_id: "BR_001",
      region_code: "NORTHEAST",
      interest_bearing_flag: false,
      current_interest_rate: 0.0,
      rate_tier: null,
      rate_type: null,
      overdraft_protection_flag: true,
      overdraft_limit: 500.0,
      linked_savings_account_id: "ACC_SAV_0001234568",
      sweep_flag: false,
      sweep_destination_account_id: null,
      minimum_balance_required: 0.0,
      monthly_fee_amount: 10.0,
      fee_waiver_balance: 1500.0,
      statement_cycle: "MONTHLY",
      statement_delivery_method: "ELECTRONIC",
      currency_code: "USD",
      tax_reporting_flag: false,
      brokered_deposit_flag: false,
      fdic_insured_flag: true,
      regulatory_category: "RETAIL",
      lcr_classification: "OPERATIONAL_RETAIL",
      nsfr_asf_factor: 0.95,
      last_activity_date: "2024-01-14",
      dormancy_date: null,
      escheatment_date: null,
      channel_opened: "BRANCH",
      source_system_id: "CORE_BANKING_PROD",
      source_record_id: "ACT-12345",
      source_update_timestamp: "2024-01-15 08:00:00",
      cdc_operation: "UPDATE",
      cdc_lsn: "00000123:00000456:0001",
      ingestion_timestamp: "2024-01-15 08:00:05",
      ingestion_batch_id: "BATCH_20240115_080000",
      record_hash:
        "a1b2c3d4e5f6789012345678901234567890123456789012345678901234",
      partition_date: "2024-01-15",
    },
    {
      account_id: "ACC_SAV_0001234568",
      account_number: "****7891",
      customer_id: "CUST_0000123456",
      co_customer_id: null,
      product_code: "SAV_PREMIUM",
      product_name: "Premium Savings",
      account_status: "ACTIVE",
      account_sub_status: null,
      open_date: "2023-01-15",
      open_timestamp: "2023-01-15 09:30:15",
      close_date: null,
      close_reason_code: null,
      branch_id: "BR_001",
      opening_branch_id: "BR_001",
      region_code: "NORTHEAST",
      interest_bearing_flag: true,
      current_interest_rate: 2.5,
      rate_tier: "TIER_3",
      rate_type: "TIERED",
      overdraft_protection_flag: false,
      overdraft_limit: null,
      linked_savings_account_id: null,
      sweep_flag: false,
      sweep_destination_account_id: null,
      minimum_balance_required: 10000.0,
      monthly_fee_amount: 0.0,
      fee_waiver_balance: null,
      statement_cycle: "MONTHLY",
      statement_delivery_method: "ELECTRONIC",
      currency_code: "USD",
      tax_reporting_flag: true,
      brokered_deposit_flag: false,
      fdic_insured_flag: true,
      regulatory_category: "RETAIL",
      lcr_classification: "STABLE_RETAIL",
      nsfr_asf_factor: 0.95,
      last_activity_date: "2024-01-10",
      dormancy_date: null,
      escheatment_date: null,
      channel_opened: "ONLINE",
      source_system_id: "CORE_BANKING_PROD",
      source_record_id: "ACT-12346",
      source_update_timestamp: "2024-01-15 08:00:00",
      cdc_operation: "UPDATE",
      cdc_lsn: "00000123:00000456:0002",
      ingestion_timestamp: "2024-01-15 08:00:05",
      ingestion_batch_id: "BATCH_20240115_080000",
      record_hash:
        "b2c3d4e5f67890123456789012345678901234567890123456789012345",
      partition_date: "2024-01-15",
    },
  ],

  ddl: `
-- Bronze Layer: Deposit Account Master (Comprehensive Schema)
-- Storage: Delta Lake / Iceberg / Hudi for ACID transactions
-- Compression: Snappy for balance between speed and size
-- Retention: 7 years for regulatory compliance

CREATE TABLE IF NOT EXISTS bronze.deposit_account_master_raw (
  -- Primary Identifiers
  account_id STRING NOT NULL COMMENT 'Unique account identifier from source system',
  account_number STRING NOT NULL COMMENT 'Customer-facing account number (may be masked)',
  customer_id STRING NOT NULL COMMENT 'Primary account holder customer ID',
  co_customer_id STRING COMMENT 'Joint account co-owner customer ID',
  
  -- Product Information
  product_code STRING NOT NULL COMMENT 'Product type code',
  product_name STRING COMMENT 'Product marketing name',
  
  -- Account Status
  account_status STRING NOT NULL COMMENT 'Account status',
  account_sub_status STRING COMMENT 'Detailed status reason',
  open_date DATE NOT NULL COMMENT 'Account opening date',
  open_timestamp TIMESTAMP COMMENT 'Account opening timestamp',
  close_date DATE COMMENT 'Account closure date',
  close_reason_code STRING COMMENT 'Closure reason code',
  
  -- Branch & Geography
  branch_id STRING NOT NULL COMMENT 'Home branch identifier',
  opening_branch_id STRING COMMENT 'Opening branch identifier',
  region_code STRING COMMENT 'Geographic region code',
  
  -- Interest & Rates
  interest_bearing_flag BOOLEAN NOT NULL COMMENT 'Interest earning flag',
  current_interest_rate DECIMAL(7,4) COMMENT 'Current annual interest rate',
  rate_tier STRING COMMENT 'Interest rate tier',
  rate_type STRING COMMENT 'Rate type (FIXED, VARIABLE, TIERED)',
  
  -- Overdraft Protection
  overdraft_protection_flag BOOLEAN COMMENT 'Overdraft protection enabled',
  overdraft_limit DECIMAL(18,2) COMMENT 'Overdraft limit amount',
  linked_savings_account_id STRING COMMENT 'Linked savings account',
  
  -- Sweep Functionality
  sweep_flag BOOLEAN COMMENT 'Automatic sweep enabled',
  sweep_destination_account_id STRING COMMENT 'Sweep destination account',
  
  -- Fees & Balance Requirements
  minimum_balance_required DECIMAL(18,2) COMMENT 'Minimum balance requirement',
  monthly_fee_amount DECIMAL(18,2) COMMENT 'Monthly maintenance fee',
  fee_waiver_balance DECIMAL(18,2) COMMENT 'Balance for fee waiver',
  
  -- Statement Configuration
  statement_cycle STRING COMMENT 'Statement cycle frequency',
  statement_delivery_method STRING COMMENT 'Statement delivery method',
  
  -- Currency & Tax
  currency_code STRING NOT NULL DEFAULT 'USD' COMMENT 'ISO 4217 currency code',
  tax_reporting_flag BOOLEAN COMMENT '1099-INT reporting flag',
  
  -- Regulatory Classifications
  brokered_deposit_flag BOOLEAN COMMENT 'Brokered deposit indicator',
  fdic_insured_flag BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'FDIC insurance flag',
  regulatory_category STRING COMMENT 'Regulatory classification',
  lcr_classification STRING COMMENT 'LCR deposit classification',
  nsfr_asf_factor DECIMAL(5,4) COMMENT 'NSFR ASF factor',
  
  -- Activity Tracking
  last_activity_date DATE COMMENT 'Last transaction date',
  dormancy_date DATE COMMENT 'Dormancy start date',
  escheatment_date DATE COMMENT 'Escheatment date',
  channel_opened STRING COMMENT 'Account opening channel',
  
  -- Source System Metadata (MANDATORY)
  source_system_id STRING NOT NULL COMMENT 'Source system identifier',
  source_record_id STRING COMMENT 'Source record ID',
  source_update_timestamp TIMESTAMP COMMENT 'Source update timestamp',
  cdc_operation STRING COMMENT 'CDC operation type',
  cdc_lsn STRING COMMENT 'CDC log sequence number',
  
  -- Ingestion Metadata (MANDATORY)
  ingestion_timestamp TIMESTAMP NOT NULL COMMENT 'Bronze ingestion timestamp UTC',
  ingestion_batch_id STRING COMMENT 'Ingestion batch identifier',
  record_hash STRING NOT NULL COMMENT 'SHA256 hash for integrity',
  partition_date DATE NOT NULL COMMENT 'Partition key'
)
USING DELTA
PARTITIONED BY (partition_date)
CLUSTERED BY (account_id, customer_id) INTO 32 BUCKETS
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true',
  'delta.logRetentionDuration' = '2555 days', -- 7 years
  'delta.deletedFileRetentionDuration' = '2555 days',
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true',
  'delta.dataSkippingNumIndexedCols' = '10',
  'description' = 'Bronze layer deposit account master - immutable raw data'
);

-- Optimize for query performance
OPTIMIZE bronze.deposit_account_master_raw ZORDER BY (account_id, customer_id, account_status);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_account_status 
  ON bronze.deposit_account_master_raw (partition_date, account_status);

CREATE INDEX IF NOT EXISTS idx_customer_lookup 
  ON bronze.deposit_account_master_raw (customer_id, partition_date);
`,
};

// ============================================================================
// TABLE 2: ACCOUNT TRANSACTIONS
// Source: Core Banking Platform + Payment Processing System
// ============================================================================

export const bronzeAccountTransactions = {
  table_name: "bronze.deposit_transactions_raw",
  description:
    "All deposit account transactions (deposits, withdrawals, transfers, fees, interest)",
  source_system: "Core Banking Platform, Payment Processing System",
  ingestion_method: "Real-time streaming via Kafka",
  refresh_frequency: "Real-time (< 1 second latency)",
  average_volume_daily: "~3,000,000 transactions",
  partition_strategy: "PARTITION BY transaction_date",

  schema: [
    {
      field: "transaction_id",
      datatype: "STRING",
      nullable: false,
      description: "Unique transaction identifier",
    },
    {
      field: "account_id",
      datatype: "STRING",
      nullable: false,
      description: "Account identifier",
    },
    {
      field: "related_account_id",
      datatype: "STRING",
      nullable: true,
      description: "Related account (for transfers)",
    },
    {
      field: "transaction_date",
      datatype: "DATE",
      nullable: false,
      description: "Transaction posting date",
    },
    {
      field: "transaction_timestamp",
      datatype: "TIMESTAMP",
      nullable: false,
      description: "Transaction execution timestamp",
    },
    {
      field: "value_date",
      datatype: "DATE",
      nullable: true,
      description: "Value/effective date for interest calculation",
    },
    {
      field: "transaction_type",
      datatype: "STRING",
      nullable: false,
      description: "DEPOSIT, WITHDRAWAL, TRANSFER, FEE, INTEREST, ADJUSTMENT",
    },
    {
      field: "transaction_subtype",
      datatype: "STRING",
      nullable: true,
      description: "Detailed transaction category",
    },
    {
      field: "transaction_amount",
      datatype: "DECIMAL(18,2)",
      nullable: false,
      description: "Transaction amount (+ credit, - debit)",
    },
    {
      field: "currency_code",
      datatype: "STRING",
      nullable: false,
      description: "ISO 4217 currency code",
    },
    {
      field: "running_balance",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Balance after transaction",
    },
    {
      field: "available_balance",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Available balance after transaction",
    },
    {
      field: "channel",
      datatype: "STRING",
      nullable: false,
      description: "BRANCH, ATM, ONLINE, MOBILE, ACH, WIRE, CHECK",
    },
    {
      field: "channel_device_id",
      datatype: "STRING",
      nullable: true,
      description: "Device/terminal identifier",
    },
    {
      field: "reference_number",
      datatype: "STRING",
      nullable: true,
      description: "External reference (check #, wire ref)",
    },
    {
      field: "description",
      datatype: "STRING",
      nullable: true,
      description: "Transaction description",
    },
    {
      field: "memo",
      datatype: "STRING",
      nullable: true,
      description: "Customer memo field",
    },
    {
      field: "merchant_name",
      datatype: "STRING",
      nullable: true,
      description: "Merchant name (if applicable)",
    },
    {
      field: "merchant_category_code",
      datatype: "STRING",
      nullable: true,
      description: "MCC code",
    },
    {
      field: "merchant_id",
      datatype: "STRING",
      nullable: true,
      description: "Merchant identifier",
    },
    {
      field: "authorization_code",
      datatype: "STRING",
      nullable: true,
      description: "Authorization code",
    },
    {
      field: "reversal_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Is this a reversal transaction",
    },
    {
      field: "reversed_transaction_id",
      datatype: "STRING",
      nullable: true,
      description: "Original transaction if reversal",
    },
    {
      field: "hold_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Transaction creates hold",
    },
    {
      field: "hold_amount",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Hold amount",
    },
    {
      field: "hold_release_date",
      datatype: "DATE",
      nullable: true,
      description: "Expected hold release date",
    },
    {
      field: "fee_amount",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Fee charged for transaction",
    },
    {
      field: "fee_type",
      datatype: "STRING",
      nullable: true,
      description: "Fee type code",
    },
    {
      field: "posted_flag",
      datatype: "BOOLEAN",
      nullable: false,
      description: "Transaction posted vs pending",
    },
    {
      field: "posting_timestamp",
      datatype: "TIMESTAMP",
      nullable: true,
      description: "Actual posting timestamp",
    },
    {
      field: "initiated_by_customer_id",
      datatype: "STRING",
      nullable: true,
      description: "Customer initiating transaction",
    },
    {
      field: "initiated_by_user_id",
      datatype: "STRING",
      nullable: true,
      description: "User/teller initiating transaction",
    },
    {
      field: "ip_address",
      datatype: "STRING",
      nullable: true,
      description: "IP address (for online/mobile)",
    },
    {
      field: "geolocation",
      datatype: "STRING",
      nullable: true,
      description: "Lat/long or city (for fraud detection)",
    },
    {
      field: "fraud_score",
      datatype: "DECIMAL(5,2)",
      nullable: true,
      description: "Real-time fraud score",
    },
    {
      field: "fraud_alert_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Fraud alert triggered",
    },
    {
      field: "source_system_id",
      datatype: "STRING",
      nullable: false,
      description: "Source system identifier",
    },
    {
      field: "ingestion_timestamp",
      datatype: "TIMESTAMP",
      nullable: false,
      description: "Bronze ingestion timestamp",
    },
    {
      field: "record_hash",
      datatype: "STRING",
      nullable: false,
      description: "SHA256 hash",
    },
    {
      field: "partition_date",
      datatype: "DATE",
      nullable: false,
      description: "Partition key",
    },
  ],

  ddl: `CREATE TABLE bronze.deposit_transactions_raw (...) PARTITION BY transaction_date;`,
};

// ============================================================================
// TABLE 3: DAILY ACCOUNT BALANCES
// ============================================================================

export const bronzeAccountBalances = {
  table_name: "bronze.deposit_account_balances_daily_raw",
  description: "End-of-day balance snapshots for all accounts",
  source_system: "Core Banking Platform",
  ingestion_method: "Batch EOD",
  refresh_frequency: "Daily (after EOD processing)",
  average_volume_daily: "~2,000,000 positions",

  schema: [
    {
      field: "account_id",
      datatype: "STRING",
      nullable: false,
      description: "Account identifier",
    },
    {
      field: "snapshot_date",
      datatype: "DATE",
      nullable: false,
      description: "Balance snapshot date",
    },
    {
      field: "opening_balance",
      datatype: "DECIMAL(18,2)",
      nullable: false,
      description: "Beginning of day balance",
    },
    {
      field: "closing_balance",
      datatype: "DECIMAL(18,2)",
      nullable: false,
      description: "End of day balance",
    },
    {
      field: "available_balance",
      datatype: "DECIMAL(18,2)",
      nullable: false,
      description: "Available balance (ex. holds)",
    },
    {
      field: "ledger_balance",
      datatype: "DECIMAL(18,2)",
      nullable: false,
      description: "Ledger balance (incl pending)",
    },
    {
      field: "hold_amount",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Total holds",
    },
    {
      field: "pending_credits",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Pending deposit amount",
    },
    {
      field: "pending_debits",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Pending withdrawal amount",
    },
    {
      field: "float_amount",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Float amount (unavailable funds)",
    },
    {
      field: "overdraft_amount",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Overdraft amount (if negative)",
    },
    {
      field: "collected_balance",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Collected/cleared balance",
    },
    {
      field: "day_deposits_count",
      datatype: "INTEGER",
      nullable: true,
      description: "Number of deposits today",
    },
    {
      field: "day_deposits_amount",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Total deposits amount today",
    },
    {
      field: "day_withdrawals_count",
      datatype: "INTEGER",
      nullable: true,
      description: "Number of withdrawals today",
    },
    {
      field: "day_withdrawals_amount",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Total withdrawals amount today",
    },
    {
      field: "day_net_change",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Net balance change today",
    },
    {
      field: "mtd_average_balance",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Month-to-date average balance",
    },
    {
      field: "ytd_average_balance",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Year-to-date average balance",
    },
    {
      field: "mtd_interest_accrued",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "MTD interest accrued",
    },
    {
      field: "ytd_interest_paid",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "YTD interest paid",
    },
    {
      field: "mtd_fees_charged",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "MTD fees charged",
    },
    {
      field: "ytd_fees_charged",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "YTD fees charged",
    },
    {
      field: "currency_code",
      datatype: "STRING",
      nullable: false,
      description: "Currency code",
    },
    {
      field: "source_system_id",
      datatype: "STRING",
      nullable: false,
      description: "Source system",
    },
    {
      field: "ingestion_timestamp",
      datatype: "TIMESTAMP",
      nullable: false,
      description: "Ingestion timestamp",
    },
    {
      field: "record_hash",
      datatype: "STRING",
      nullable: false,
      description: "Hash",
    },
  ],

  ddl: `CREATE TABLE bronze.deposit_account_balances_daily_raw (...) PARTITION BY snapshot_date;`,
};

// ============================================================================
// TABLE 4: INTEREST RATES & SCHEDULES
// ============================================================================

export const bronzeInterestRates = {
  table_name: "bronze.deposit_interest_rates_raw",
  description: "Interest rate schedules, tiers, and pricing matrices",
  source_system: "Interest Rate Management System, Treasury",
  ingestion_method: "Event-driven (rate changes) + Daily batch",
  refresh_frequency: "Real-time for changes, daily for full refresh",
  average_volume_daily: "~5,000 rate records",

  schema: [
    {
      field: "rate_id",
      datatype: "STRING",
      nullable: false,
      description: "Rate schedule identifier",
    },
    {
      field: "product_code",
      datatype: "STRING",
      nullable: false,
      description: "Product type code",
    },
    {
      field: "rate_type",
      datatype: "STRING",
      nullable: false,
      description: "FIXED, VARIABLE, TIERED, PROMOTIONAL",
    },
    {
      field: "rate_tier",
      datatype: "STRING",
      nullable: true,
      description: "Tier level (for tiered rates)",
    },
    {
      field: "tier_min_balance",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Minimum balance for tier",
    },
    {
      field: "tier_max_balance",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Maximum balance for tier",
    },
    {
      field: "annual_percentage_rate",
      datatype: "DECIMAL(7,4)",
      nullable: false,
      description: "APR (%)",
    },
    {
      field: "annual_percentage_yield",
      datatype: "DECIMAL(7,4)",
      nullable: true,
      description: "APY (%)",
    },
    {
      field: "effective_date",
      datatype: "DATE",
      nullable: false,
      description: "Rate effective date",
    },
    {
      field: "expiration_date",
      datatype: "DATE",
      nullable: true,
      description: "Rate expiration date",
    },
    {
      field: "promotional_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Promotional rate indicator",
    },
    {
      field: "promotional_period_months",
      datatype: "INTEGER",
      nullable: true,
      description: "Promotional period",
    },
    {
      field: "index_rate",
      datatype: "STRING",
      nullable: true,
      description: "Index (for variable rates)",
    },
    {
      field: "spread_bps",
      datatype: "DECIMAL(7,4)",
      nullable: true,
      description: "Spread over index (basis points)",
    },
    {
      field: "compounding_frequency",
      datatype: "STRING",
      nullable: true,
      description: "DAILY, MONTHLY, QUARTERLY",
    },
    {
      field: "accrual_method",
      datatype: "STRING",
      nullable: true,
      description: "ACTUAL_365, 30_360, etc.",
    },
    {
      field: "minimum_deposit_amount",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Minimum deposit for rate",
    },
    {
      field: "region_code",
      datatype: "STRING",
      nullable: true,
      description: "Geographic region (if regional pricing)",
    },
    {
      field: "customer_segment",
      datatype: "STRING",
      nullable: true,
      description: "Customer segment (if segmented)",
    },
    {
      field: "relationship_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Requires relationship",
    },
    {
      field: "source_system_id",
      datatype: "STRING",
      nullable: false,
      description: "Source system",
    },
    {
      field: "ingestion_timestamp",
      datatype: "TIMESTAMP",
      nullable: false,
      description: "Ingestion timestamp",
    },
    {
      field: "record_hash",
      datatype: "STRING",
      nullable: false,
      description: "Hash",
    },
  ],
};

// ============================================================================
// TABLE 5: CD (Certificate of Deposit) MASTER
// ============================================================================

export const bronzeCDMaster = {
  table_name: "bronze.cd_master_raw",
  description:
    "Certificate of Deposit detailed attributes and maturity tracking",
  source_system: "Core Banking Platform",
  ingestion_method: "CDC Real-time",
  refresh_frequency: "Real-time CDC",
  average_volume_daily: "~10,000 updates",

  schema: [
    {
      field: "cd_id",
      datatype: "STRING",
      nullable: false,
      description: "CD identifier",
    },
    {
      field: "account_id",
      datatype: "STRING",
      nullable: false,
      description: "Account identifier",
    },
    {
      field: "customer_id",
      datatype: "STRING",
      nullable: false,
      description: "Customer identifier",
    },
    {
      field: "cd_number",
      datatype: "STRING",
      nullable: false,
      description: "CD certificate number",
    },
    {
      field: "cd_type",
      datatype: "STRING",
      nullable: false,
      description: "TRADITIONAL, JUMBO, IRA, CALLABLE, BUMP_UP",
    },
    {
      field: "principal_amount",
      datatype: "DECIMAL(18,2)",
      nullable: false,
      description: "Original principal amount",
    },
    {
      field: "current_balance",
      datatype: "DECIMAL(18,2)",
      nullable: false,
      description: "Current balance",
    },
    {
      field: "accrued_interest",
      datatype: "DECIMAL(18,2)",
      nullable: true,
      description: "Accrued interest to date",
    },
    {
      field: "interest_rate",
      datatype: "DECIMAL(7,4)",
      nullable: false,
      description: "Fixed interest rate %",
    },
    {
      field: "apy",
      datatype: "DECIMAL(7,4)",
      nullable: true,
      description: "Annual percentage yield",
    },
    {
      field: "term_months",
      datatype: "INTEGER",
      nullable: false,
      description: "Term length in months",
    },
    {
      field: "opening_date",
      datatype: "DATE",
      nullable: false,
      description: "CD opening date",
    },
    {
      field: "maturity_date",
      datatype: "DATE",
      nullable: false,
      description: "Maturity date",
    },
    {
      field: "grace_period_days",
      datatype: "INTEGER",
      nullable: true,
      description: "Grace period after maturity",
    },
    {
      field: "auto_renewal_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Auto-renewal enabled",
    },
    {
      field: "renewal_term_months",
      datatype: "INTEGER",
      nullable: true,
      description: "Renewal term",
    },
    {
      field: "maturity_instruction",
      datatype: "STRING",
      nullable: true,
      description: "RENEW, TRANSFER, CLOSE",
    },
    {
      field: "transfer_account_id",
      datatype: "STRING",
      nullable: true,
      description: "Transfer destination account",
    },
    {
      field: "early_withdrawal_penalty_rate",
      datatype: "DECIMAL(7,4)",
      nullable: true,
      description: "EWP rate",
    },
    {
      field: "early_withdrawal_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Early withdrawal occurred",
    },
    {
      field: "callable_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Bank callable CD",
    },
    {
      field: "call_protection_months",
      datatype: "INTEGER",
      nullable: true,
      description: "Call protection period",
    },
    {
      field: "bump_up_option_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Rate bump-up allowed",
    },
    {
      field: "bump_up_exercised_flag",
      datatype: "BOOLEAN",
      nullable: true,
      description: "Bump-up used",
    },
    {
      field: "ira_type",
      datatype: "STRING",
      nullable: true,
      description: "IRA type (TRADITIONAL, ROTH, SEP)",
    },
    {
      field: "source_system_id",
      datatype: "STRING",
      nullable: false,
      description: "Source system",
    },
    {
      field: "ingestion_timestamp",
      datatype: "TIMESTAMP",
      nullable: false,
      description: "Ingestion timestamp",
    },
    {
      field: "record_hash",
      datatype: "STRING",
      nullable: false,
      description: "Hash",
    },
  ],
};

// ============================================================================
// ADDITIONAL CRITICAL TABLES (Summary)
// ============================================================================

export const additionalBronzeTables = [
  {
    table_name: "bronze.customer_master_raw",
    description: "Customer demographic and KYC data",
    key_fields: [
      "customer_id",
      "ssn_encrypted",
      "name",
      "address",
      "kyc_status",
      "customer_segment",
    ],
  },
  {
    table_name: "bronze.branch_master_raw",
    description: "Branch locations and attributes",
    key_fields: ["branch_id", "branch_name", "address", "region", "timezone"],
  },
  {
    table_name: "bronze.fee_schedules_raw",
    description: "Fee pricing and schedules",
    key_fields: [
      "fee_code",
      "fee_amount",
      "fee_type",
      "product_code",
      "effective_date",
    ],
  },
  {
    table_name: "bronze.statement_history_raw",
    description: "Customer statement generation history",
    key_fields: [
      "statement_id",
      "account_id",
      "statement_date",
      "delivery_method",
    ],
  },
  {
    table_name: "bronze.escheatment_tracking_raw",
    description: "Dormant account escheatment tracking",
    key_fields: [
      "account_id",
      "dormancy_date",
      "escheat_state",
      "escheat_amount",
    ],
  },
  {
    table_name: "bronze.regulatory_reporting_raw",
    description: "Regulatory data extracts (LCR, NSFR, FDIC Call Reports)",
    key_fields: ["report_type", "report_date", "account_id", "classification"],
  },
];

// ============================================================================
// COMPREHENSIVE BRONZE LAYER CATALOG
// ============================================================================

export const bronzeLayerCatalog = {
  totalTables: 15,
  coreTransactionalTables: 5,
  masterDataTables: 4,
  referenceDataTables: 3,
  regulatoryTables: 3,
  totalColumns: 650,
  averageDailyVolume: "~15M records",
  storageSize: "~500GB daily (compressed)",
  retentionPeriod: "7 years",
  compressionRatio: "5:1 (Snappy compression)",

  tables: [
    bronzeAccountMaster,
    bronzeAccountTransactions,
    bronzeAccountBalances,
    bronzeInterestRates,
    bronzeCDMaster,
    ...additionalBronzeTables,
  ],

  ingestionPatterns: {
    realTimeCDC: ["account_master", "transactions", "cd_master"],
    batchEOD: ["daily_balances", "statement_history"],
    eventDriven: ["interest_rates", "fee_schedules"],
    periodic: ["regulatory_reporting"],
  },

  dataQualityFramework: {
    mandatoryFields: [
      "source_system_id",
      "ingestion_timestamp",
      "record_hash",
      "partition_date",
    ],
    nullChecks: "All NOT NULL fields validated at ingestion",
    formatValidation: "Date, currency, enum field validation",
    referentialIntegrity: "Customer_id, branch_id foreign key validation",
    duplicateDetection: "Primary key uniqueness check",
    hashVerification: "SHA256 hash comparison for data integrity",
  },

  monitoringAndAlerting: {
    ingestionLatency: "Alert if > 5 minutes for real-time CDC",
    dataVolume: "Alert if daily volume deviates > 20% from baseline",
    dataQuality: "Alert on quality rule violations > 1%",
    schemaChanges: "Alert on source schema drift",
    CDCBacklog: "Alert if CDC lag > 10 minutes",
  },
};

// Export all bronze tables
export const allBronzeTables = [
  bronzeAccountMaster,
  bronzeAccountTransactions,
  bronzeAccountBalances,
  bronzeInterestRates,
  bronzeCDMaster,
];

export type BronzeTable = typeof bronzeAccountMaster;
