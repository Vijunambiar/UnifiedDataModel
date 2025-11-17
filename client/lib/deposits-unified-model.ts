// Deposits & Funding Unified Data Model
// Comprehensive Bronze → Silver → Gold → Semantic layer definitions

// ============================================================================
// BRONZE LAYER: Raw & Immutable Landing Zone
// ============================================================================

export const bronzeDepositsTables = [
  {
    table_name: "bronze.account_master_raw",
    description: "Raw account master data from core banking system",
    source_system: "Core Banking Platform",
    refresh_frequency: "Real-time CDC",
    row_count_daily: "~50K updates",
    retention_period: "7 years",
  },
  {
    table_name: "bronze.account_transactions_raw",
    description: "Raw transaction data (deposits, withdrawals, transfers)",
    source_system: "Core Banking Platform",
    refresh_frequency: "Real-time CDC",
    row_count_daily: "~3M transactions",
    retention_period: "7 years",
  },
  {
    table_name: "bronze.account_balances_raw",
    description: "Raw end-of-day balance snapshots",
    source_system: "Core Banking Platform",
    refresh_frequency: "Daily EOD",
    row_count_daily: "~2M positions",
    retention_period: "7 years",
  },
  {
    table_name: "bronze.interest_rates_raw",
    description: "Raw interest rate schedules and tier structures",
    source_system: "Interest Rate Management System",
    refresh_frequency: "Hourly",
    row_count_daily: "~5K rate updates",
    retention_period: "Indefinite",
  },
  {
    table_name: "bronze.cd_master_raw",
    description: "Raw certificate of deposit (CD) master data",
    source_system: "Core Banking Platform",
    refresh_frequency: "Real-time CDC",
    row_count_daily: "~10K updates",
    retention_period: "7 years",
  },
  {
    table_name: "bronze.fee_schedules_raw",
    description: "Raw fee schedules and pricing structures",
    source_system: "Core Banking Platform",
    refresh_frequency: "Daily",
    row_count_daily: "~1K updates",
    retention_period: "Indefinite",
  },
];

export const bronzeAccountMasterFields = [
  { field: "account_id", datatype: "STRING", description: "Unique account identifier from source system", mandatory: true },
  { field: "customer_id", datatype: "STRING", description: "Customer identifier", mandatory: true },
  { field: "account_number", datatype: "STRING", description: "Customer-facing account number", mandatory: true },
  { field: "product_code", datatype: "STRING", description: "Product type code (DDA, SAV, MMA, CD, etc.)", mandatory: true },
  { field: "account_status", datatype: "STRING", description: "Account status (ACTIVE, CLOSED, DORMANT, FROZEN)", mandatory: true },
  { field: "open_date", datatype: "DATE", description: "Account opening date", mandatory: true },
  { field: "close_date", datatype: "DATE", description: "Account closure date (if closed)", mandatory: false },
  { field: "branch_id", datatype: "STRING", description: "Home branch identifier", mandatory: true },
  { field: "interest_bearing_flag", datatype: "BOOLEAN", description: "Whether account earns interest", mandatory: true },
  { field: "overdraft_protection_flag", datatype: "BOOLEAN", description: "Whether overdraft protection is enabled", mandatory: false },
  { field: "source_system_id", datatype: "STRING", description: "Source system identifier", mandatory: true },
  { field: "ingestion_timestamp", datatype: "TIMESTAMP", description: "Time of data ingestion into bronze", mandatory: true },
  { field: "record_hash", datatype: "STRING", description: "MD5 hash for data integrity verification", mandatory: true },
];

export const bronzeAccountTransactionsFields = [
  { field: "transaction_id", datatype: "STRING", description: "Unique transaction identifier", mandatory: true },
  { field: "account_id", datatype: "STRING", description: "Account identifier", mandatory: true },
  { field: "transaction_date", datatype: "DATE", description: "Transaction posting date", mandatory: true },
  { field: "transaction_timestamp", datatype: "TIMESTAMP", description: "Transaction timestamp", mandatory: true },
  { field: "transaction_type", datatype: "STRING", description: "Type (DEPOSIT, WITHDRAWAL, TRANSFER, FEE, INTEREST)", mandatory: true },
  { field: "transaction_amount", datatype: "DECIMAL(18,2)", description: "Transaction amount (+ for credits, - for debits)", mandatory: true },
  { field: "transaction_description", datatype: "STRING", description: "Transaction description", mandatory: false },
  { field: "channel", datatype: "STRING", description: "Transaction channel (BRANCH, ATM, ONLINE, MOBILE, ACH)", mandatory: true },
  { field: "reference_number", datatype: "STRING", description: "External reference number", mandatory: false },
  { field: "running_balance", datatype: "DECIMAL(18,2)", description: "Balance after transaction", mandatory: false },
  { field: "source_system_id", datatype: "STRING", description: "Source system identifier", mandatory: true },
  { field: "ingestion_timestamp", datatype: "TIMESTAMP", description: "Time of data ingestion into bronze", mandatory: true },
  { field: "record_hash", datatype: "STRING", description: "MD5 hash for data integrity verification", mandatory: true },
];

export const bronzeAccountMasterDDL = `
-- Bronze Layer: Raw Account Master
CREATE TABLE bronze.account_master_raw (
  account_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  account_number STRING NOT NULL,
  product_code STRING NOT NULL,
  account_status STRING NOT NULL,
  open_date DATE NOT NULL,
  close_date DATE,
  branch_id STRING NOT NULL,
  interest_bearing_flag BOOLEAN NOT NULL,
  overdraft_protection_flag BOOLEAN,
  source_system_id STRING NOT NULL,
  ingestion_timestamp TIMESTAMP NOT NULL,
  record_hash STRING NOT NULL,
  PRIMARY KEY (account_id, ingestion_timestamp)
)
PARTITION BY DATE(ingestion_timestamp)
CLUSTER BY account_id;

-- Bronze Layer: Raw Account Transactions
CREATE TABLE bronze.account_transactions_raw (
  transaction_id STRING NOT NULL,
  account_id STRING NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_timestamp TIMESTAMP NOT NULL,
  transaction_type STRING NOT NULL,
  transaction_amount DECIMAL(18,2) NOT NULL,
  transaction_description STRING,
  channel STRING NOT NULL,
  reference_number STRING,
  running_balance DECIMAL(18,2),
  source_system_id STRING NOT NULL,
  ingestion_timestamp TIMESTAMP NOT NULL,
  record_hash STRING NOT NULL,
  PRIMARY KEY (transaction_id)
)
PARTITION BY transaction_date
CLUSTER BY account_id;

-- Bronze Layer: Raw Account Balances
CREATE TABLE bronze.account_balances_raw (
  account_id STRING NOT NULL,
  as_of_date DATE NOT NULL,
  eod_balance DECIMAL(18,2) NOT NULL,
  available_balance DECIMAL(18,2) NOT NULL,
  hold_amount DECIMAL(18,2),
  overdraft_amount DECIMAL(18,2),
  currency_code STRING NOT NULL DEFAULT 'USD',
  source_system_id STRING NOT NULL,
  ingestion_timestamp TIMESTAMP NOT NULL,
  record_hash STRING NOT NULL,
  PRIMARY KEY (account_id, as_of_date)
)
PARTITION BY as_of_date
CLUSTER BY account_id;
`;

export const bronzeSampleAccountMaster = [
  {
    account_id: "ACC-DDA-001",
    customer_id: "CUST-12345",
    account_number: "1234567890",
    product_code: "DDA",
    account_status: "ACTIVE",
    open_date: "2023-01-15",
    close_date: null,
    branch_id: "BR-001",
    interest_bearing_flag: false,
    overdraft_protection_flag: true,
    source_system_id: "CORE_BANKING",
    ingestion_timestamp: "2024-01-15 08:00:00",
    record_hash: "a1b2c3d4e5f6",
  },
  {
    account_id: "ACC-SAV-002",
    customer_id: "CUST-12345",
    account_number: "1234567891",
    product_code: "SAV",
    account_status: "ACTIVE",
    open_date: "2023-01-15",
    close_date: null,
    branch_id: "BR-001",
    interest_bearing_flag: true,
    overdraft_protection_flag: false,
    source_system_id: "CORE_BANKING",
    ingestion_timestamp: "2024-01-15 08:00:00",
    record_hash: "b2c3d4e5f6a1",
  },
];

// ============================================================================
// SILVER LAYER: Cleaned, Conformed & SCD2
// ============================================================================

export const silverDepositsTables = [
  {
    table_name: "silver.account_master_conformed",
    description: "Cleansed and conformed account master with SCD Type 2 for attribute changes",
    source_bronze_tables: ["bronze.account_master_raw"],
    transformation_complexity: "Medium",
    scd_type: "SCD2",
  },
  {
    table_name: "silver.account_transactions_conformed",
    description: "Cleansed transaction data with standardized codes and derived fields",
    source_bronze_tables: ["bronze.account_transactions_raw"],
    transformation_complexity: "Medium",
    scd_type: "Append-only",
  },
  {
    table_name: "silver.account_balances_daily",
    description: "Daily balance snapshots with data quality checks and reconciliation",
    source_bronze_tables: ["bronze.account_balances_raw"],
    transformation_complexity: "Low",
    scd_type: "Snapshot",
  },
  {
    table_name: "silver.customer_deposit_golden",
    description: "Golden customer record for deposit relationships with SCD2",
    source_bronze_tables: ["bronze.account_master_raw", "silver.customer_master_conformed"],
    transformation_complexity: "High",
    scd_type: "SCD2",
  },
  {
    table_name: "silver.interest_calculations",
    description: "Interest accrual calculations with rate tier logic",
    source_bronze_tables: ["bronze.interest_rates_raw", "bronze.account_balances_raw"],
    transformation_complexity: "High",
    scd_type: "Append-only",
  },
];

export const silverAccountMasterSourceToTarget = [
  { source_field: "account_id", target_field: "account_id", rule: "Direct mapping", data_quality: "Unique, Not Null" },
  { source_field: "customer_id", target_field: "customer_ger_key", rule: "Lookup to silver.customer_deposit_golden", data_quality: "Foreign key validation" },
  { source_field: "product_code", target_field: "product_type", rule: "Map to standard product taxonomy (DDA, Savings, MMA, CD)", data_quality: "Reference data validation" },
  { source_field: "account_status", target_field: "account_status_code", rule: "Standardize status codes", data_quality: "Enum validation" },
  { source_field: "open_date", target_field: "account_open_date", rule: "Date validation and format standardization", data_quality: "Valid date, not future" },
  { source_field: "branch_id", target_field: "home_branch_key", rule: "Lookup to dim_branch", data_quality: "Foreign key validation" },
  { source_field: "interest_bearing_flag", target_field: "interest_bearing_indicator", rule: "Boolean standardization", data_quality: "True/False/Null" },
];

export const silverSCD2SQL = `
-- Silver Layer: Account Master with SCD Type 2
-- Tracks historical changes to account attributes

MERGE INTO silver.account_master_conformed AS target
USING (
  SELECT 
    account_id,
    customer_ger_key,
    account_number,
    product_type,
    account_status_code,
    account_open_date,
    account_close_date,
    home_branch_key,
    interest_bearing_indicator,
    overdraft_protection_indicator,
    effective_start_timestamp,
    effective_end_timestamp,
    is_current,
    record_hash,
    source_system_id,
    processed_timestamp
  FROM (
    SELECT 
      account_id,
      COALESCE(c.customer_ger_key, customer_id) as customer_ger_key,
      account_number,
      CASE product_code
        WHEN 'CHK' THEN 'DDA'
        WHEN 'SAV' THEN 'Savings'
        WHEN 'MM' THEN 'MMA'
        WHEN 'CD' THEN 'CD'
        ELSE product_code
      END as product_type,
      UPPER(TRIM(account_status)) as account_status_code,
      open_date as account_open_date,
      close_date as account_close_date,
      b.branch_key as home_branch_key,
      COALESCE(interest_bearing_flag, FALSE) as interest_bearing_indicator,
      COALESCE(overdraft_protection_flag, FALSE) as overdraft_protection_indicator,
      ingestion_timestamp as effective_start_timestamp,
      CAST('9999-12-31 23:59:59' AS TIMESTAMP) as effective_end_timestamp,
      TRUE as is_current,
      record_hash,
      source_system_id,
      CURRENT_TIMESTAMP() as processed_timestamp,
      ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY ingestion_timestamp DESC) as rn
    FROM bronze.account_master_raw a
    LEFT JOIN silver.customer_deposit_golden c ON a.customer_id = c.source_customer_id AND c.is_current = TRUE
    LEFT JOIN gold.dim_branch b ON a.branch_id = b.branch_id
    WHERE DATE(ingestion_timestamp) = CURRENT_DATE()
  ) WHERE rn = 1
) AS source
ON target.account_id = source.account_id AND target.is_current = TRUE

-- When hash changes (attribute update), close current record and insert new
WHEN MATCHED AND target.record_hash != source.record_hash THEN
  UPDATE SET 
    effective_end_timestamp = source.effective_start_timestamp,
    is_current = FALSE,
    processed_timestamp = CURRENT_TIMESTAMP()

WHEN NOT MATCHED THEN
  INSERT (
    account_id, customer_ger_key, account_number, product_type, account_status_code,
    account_open_date, account_close_date, home_branch_key, interest_bearing_indicator,
    overdraft_protection_indicator, effective_start_timestamp, effective_end_timestamp,
    is_current, record_hash, source_system_id, processed_timestamp
  ) VALUES (
    source.account_id, source.customer_ger_key, source.account_number, source.product_type,
    source.account_status_code, source.account_open_date, source.account_close_date,
    source.home_branch_key, source.interest_bearing_indicator, source.overdraft_protection_indicator,
    source.effective_start_timestamp, source.effective_end_timestamp, source.is_current,
    source.record_hash, source.source_system_id, source.processed_timestamp
  );

-- Insert new version for updated records
INSERT INTO silver.account_master_conformed
SELECT * FROM source
WHERE record_hash IN (
  SELECT source.record_hash 
  FROM silver.account_master_conformed target
  JOIN source ON target.account_id = source.account_id AND target.is_current = FALSE
);
`;

export const silverSampleAccountMaster = [
  {
    account_id: "ACC-DDA-001",
    customer_ger_key: "GER-CUST-12345",
    account_number: "1234567890",
    product_type: "DDA",
    account_status_code: "ACTIVE",
    account_open_date: "2023-01-15",
    account_close_date: null,
    home_branch_key: "BK-001",
    interest_bearing_indicator: false,
    overdraft_protection_indicator: true,
    effective_start_timestamp: "2023-01-15 00:00:00",
    effective_end_timestamp: "9999-12-31 23:59:59",
    is_current: true,
  },
  {
    account_id: "ACC-SAV-002",
    customer_ger_key: "GER-CUST-12345",
    account_number: "1234567891",
    product_type: "Savings",
    account_status_code: "ACTIVE",
    account_open_date: "2023-01-15",
    account_close_date: null,
    home_branch_key: "BK-001",
    interest_bearing_indicator: true,
    overdraft_protection_indicator: false,
    effective_start_timestamp: "2023-01-15 00:00:00",
    effective_end_timestamp: "9999-12-31 23:59:59",
    is_current: true,
  },
];

// ============================================================================
// GOLD LAYER: Dimensional Model (Star Schema)
// ============================================================================

export const goldDepositsTables = [
  {
    table_name: "gold.dim_deposit_account",
    table_type: "Dimension",
    description: "Conformed dimension for deposit accounts with current attributes",
    grain: "One row per unique account",
    row_count: "~2M accounts",
    refresh_frequency: "Daily",
  },
  {
    table_name: "gold.dim_deposit_product",
    table_type: "Dimension",
    description: "Product hierarchy and attributes (DDA, Savings, MMA, CD, etc.)",
    grain: "One row per product type",
    row_count: "~50 products",
    refresh_frequency: "Ad-hoc",
  },
  {
    table_name: "gold.dim_customer",
    table_type: "Dimension",
    description: "Customer dimension with deposit relationship attributes",
    grain: "One row per unique customer",
    row_count: "~1.5M customers",
    refresh_frequency: "Daily",
  },
  {
    table_name: "gold.dim_branch",
    table_type: "Dimension",
    description: "Branch hierarchy and geographic attributes",
    grain: "One row per branch",
    row_count: "~500 branches",
    refresh_frequency: "Weekly",
  },
  {
    table_name: "gold.dim_date",
    table_type: "Dimension",
    description: "Date dimension with fiscal calendar and business day flags",
    grain: "One row per day",
    row_count: "~10K days (30 years)",
    refresh_frequency: "Annual",
  },
  {
    table_name: "gold.fact_deposit_positions",
    table_type: "Fact (Periodic Snapshot)",
    description: "Daily end-of-day account balance positions",
    grain: "One row per account per day",
    row_count: "~2M daily",
    refresh_frequency: "Daily EOD",
  },
  {
    table_name: "gold.fact_deposit_transactions",
    table_type: "Fact (Transaction)",
    description: "Individual deposit account transactions",
    grain: "One row per transaction",
    row_count: "~3M daily",
    refresh_frequency: "Real-time",
  },
  {
    table_name: "gold.fact_deposit_interest",
    table_type: "Fact (Accumulating Snapshot)",
    description: "Interest accrual and payment activity",
    grain: "One row per account per accrual period",
    row_count: "~500K monthly",
    refresh_frequency: "Monthly",
  },
  {
    table_name: "gold.fact_account_lifecycle",
    table_type: "Fact (Accumulating Snapshot)",
    description: "Account lifecycle events (opened, funded, dormant, closed)",
    grain: "One row per account",
    row_count: "~2M accounts",
    refresh_frequency: "Daily",
  },
  {
    table_name: "gold.fact_deposit_fees",
    table_type: "Fact (Transaction)",
    description: "Fee transactions (maintenance, overdraft, wire, etc.)",
    grain: "One row per fee event",
    row_count: "~200K daily",
    refresh_frequency: "Daily",
  },
];

export const goldDimDepositAccountColumns = [
  { column: "account_key", datatype: "STRING", description: "Surrogate key for deposit account dimension" },
  { column: "account_id", datatype: "STRING", description: "Natural key from source system" },
  { column: "account_number", datatype: "STRING", description: "Customer-facing account number" },
  { column: "customer_key", datatype: "STRING", description: "Foreign key to dim_customer" },
  { column: "product_key", datatype: "STRING", description: "Foreign key to dim_deposit_product" },
  { column: "branch_key", datatype: "STRING", description: "Foreign key to dim_branch (home branch)" },
  { column: "account_status", datatype: "STRING", description: "Current status (ACTIVE, CLOSED, DORMANT)" },
  { column: "account_open_date_key", datatype: "INTEGER", description: "Foreign key to dim_date (open date)" },
  { column: "account_close_date_key", datatype: "INTEGER", description: "Foreign key to dim_date (close date)" },
  { column: "interest_bearing_flag", datatype: "BOOLEAN", description: "Whether account earns interest" },
  { column: "overdraft_protection_flag", datatype: "BOOLEAN", description: "Whether overdraft protection enabled" },
  { column: "current_rate", datatype: "DECIMAL(7,4)", description: "Current interest rate (%)" },
  { column: "rate_tier", datatype: "STRING", description: "Current rate tier level" },
  { column: "account_age_days", datatype: "INTEGER", description: "Days since account opening" },
  { column: "last_transaction_date", datatype: "DATE", description: "Most recent transaction date" },
  { column: "effective_date", datatype: "DATE", description: "Effective date of current attributes" },
  { column: "end_date", datatype: "DATE", description: "End date of validity (9999-12-31 if current)" },
  { column: "is_current", datatype: "BOOLEAN", description: "Flag indicating current version" },
];

export const goldFactDepositPositionsColumns = [
  { column: "position_key", datatype: "STRING", description: "Surrogate key for fact record" },
  { column: "as_of_date_key", datatype: "INTEGER", description: "Foreign key to dim_date" },
  { column: "account_key", datatype: "STRING", description: "Foreign key to dim_deposit_account" },
  { column: "customer_key", datatype: "STRING", description: "Foreign key to dim_customer" },
  { column: "product_key", datatype: "STRING", description: "Foreign key to dim_deposit_product" },
  { column: "branch_key", datatype: "STRING", description: "Foreign key to dim_branch" },
  { column: "as_of_date", datatype: "DATE", description: "Balance snapshot date" },
  { column: "eod_balance", datatype: "DECIMAL(18,2)", description: "End-of-day balance amount" },
  { column: "available_balance", datatype: "DECIMAL(18,2)", description: "Available balance (excluding holds)" },
  { column: "hold_amount", datatype: "DECIMAL(18,2)", description: "Total hold amount" },
  { column: "overdraft_amount", datatype: "DECIMAL(18,2)", description: "Overdraft amount (if negative)" },
  { column: "interest_rate", datatype: "DECIMAL(7,4)", description: "Applied interest rate (%)" },
  { column: "daily_interest_accrual", datatype: "DECIMAL(18,2)", description: "Interest accrued for the day" },
  { column: "ytd_interest_paid", datatype: "DECIMAL(18,2)", description: "Year-to-date interest paid" },
  { column: "mtd_transaction_count", datatype: "INTEGER", description: "Month-to-date transaction count" },
  { column: "adb_mtd", datatype: "DECIMAL(18,2)", description: "Month-to-date average daily balance" },
  { column: "currency_code", datatype: "STRING", description: "Currency code (USD, EUR, etc.)" },
  { column: "fdic_insured_flag", datatype: "BOOLEAN", description: "Whether balance is FDIC insured" },
  { column: "operational_deposit_flag", datatype: "BOOLEAN", description: "LCR operational deposit classification" },
  { column: "nsfr_asf_factor", datatype: "DECIMAL(5,4)", description: "NSFR Available Stable Funding factor" },
];

export const goldStarSchemaDDL = `
-- Gold Layer: Dimensional Model for Deposits & Funding

-- Dimension: Deposit Account
CREATE TABLE gold.dim_deposit_account (
  account_key STRING NOT NULL,
  account_id STRING NOT NULL,
  account_number STRING NOT NULL,
  customer_key STRING NOT NULL,
  product_key STRING NOT NULL,
  branch_key STRING NOT NULL,
  account_status STRING NOT NULL,
  account_open_date_key INTEGER,
  account_close_date_key INTEGER,
  interest_bearing_flag BOOLEAN,
  overdraft_protection_flag BOOLEAN,
  current_rate DECIMAL(7,4),
  rate_tier STRING,
  account_age_days INTEGER,
  last_transaction_date DATE,
  effective_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL,
  PRIMARY KEY (account_key),
  FOREIGN KEY (customer_key) REFERENCES gold.dim_customer(customer_key),
  FOREIGN KEY (product_key) REFERENCES gold.dim_deposit_product(product_key),
  FOREIGN KEY (branch_key) REFERENCES gold.dim_branch(branch_key)
)
CLUSTER BY account_id;

-- Dimension: Deposit Product
CREATE TABLE gold.dim_deposit_product (
  product_key STRING NOT NULL,
  product_code STRING NOT NULL,
  product_name STRING NOT NULL,
  product_type STRING NOT NULL, -- DDA, Savings, MMA, CD, Sweep
  product_category STRING NOT NULL,
  interest_bearing_flag BOOLEAN NOT NULL,
  rate_type STRING, -- Fixed, Variable, Tiered
  minimum_balance DECIMAL(18,2),
  monthly_fee DECIMAL(18,2),
  withdrawal_limit INTEGER,
  fdic_insured_flag BOOLEAN NOT NULL,
  regulatory_category STRING, -- For LCR/NSFR classification
  effective_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL,
  PRIMARY KEY (product_key)
);

-- Fact Table: Deposit Positions (Periodic Snapshot)
CREATE TABLE gold.fact_deposit_positions (
  position_key STRING NOT NULL,
  as_of_date_key INTEGER NOT NULL,
  account_key STRING NOT NULL,
  customer_key STRING NOT NULL,
  product_key STRING NOT NULL,
  branch_key STRING NOT NULL,
  as_of_date DATE NOT NULL,
  eod_balance DECIMAL(18,2) NOT NULL,
  available_balance DECIMAL(18,2),
  hold_amount DECIMAL(18,2),
  overdraft_amount DECIMAL(18,2),
  interest_rate DECIMAL(7,4),
  daily_interest_accrual DECIMAL(18,2),
  ytd_interest_paid DECIMAL(18,2),
  mtd_transaction_count INTEGER,
  adb_mtd DECIMAL(18,2),
  currency_code STRING DEFAULT 'USD',
  fdic_insured_flag BOOLEAN,
  operational_deposit_flag BOOLEAN,
  nsfr_asf_factor DECIMAL(5,4),
  PRIMARY KEY (position_key),
  FOREIGN KEY (as_of_date_key) REFERENCES gold.dim_date(date_key),
  FOREIGN KEY (account_key) REFERENCES gold.dim_deposit_account(account_key),
  FOREIGN KEY (customer_key) REFERENCES gold.dim_customer(customer_key),
  FOREIGN KEY (product_key) REFERENCES gold.dim_deposit_product(product_key),
  FOREIGN KEY (branch_key) REFERENCES gold.dim_branch(branch_key)
)
PARTITION BY as_of_date
CLUSTER BY account_key;

-- Fact Table: Deposit Transactions
CREATE TABLE gold.fact_deposit_transactions (
  transaction_key STRING NOT NULL,
  transaction_date_key INTEGER NOT NULL,
  account_key STRING NOT NULL,
  customer_key STRING NOT NULL,
  product_key STRING NOT NULL,
  branch_key STRING NOT NULL,
  transaction_id STRING NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_timestamp TIMESTAMP NOT NULL,
  transaction_type STRING NOT NULL,
  transaction_amount DECIMAL(18,2) NOT NULL,
  channel STRING NOT NULL,
  running_balance DECIMAL(18,2),
  PRIMARY KEY (transaction_key),
  FOREIGN KEY (transaction_date_key) REFERENCES gold.dim_date(date_key),
  FOREIGN KEY (account_key) REFERENCES gold.dim_deposit_account(account_key)
)
PARTITION BY transaction_date
CLUSTER BY account_key;

-- Fact Table: Interest Calculations
CREATE TABLE gold.fact_deposit_interest (
  interest_key STRING NOT NULL,
  accrual_date_key INTEGER NOT NULL,
  account_key STRING NOT NULL,
  customer_key STRING NOT NULL,
  product_key STRING NOT NULL,
  accrual_date DATE NOT NULL,
  average_balance DECIMAL(18,2) NOT NULL,
  interest_rate DECIMAL(7,4) NOT NULL,
  daily_accrual DECIMAL(18,2) NOT NULL,
  interest_paid DECIMAL(18,2),
  payment_date DATE,
  PRIMARY KEY (interest_key)
)
PARTITION BY accrual_date
CLUSTER BY account_key;
`;

export const goldSampleDepositPositions = [
  {
    position_key: "POS-20240115-ACC-DDA-001",
    as_of_date_key: 20240115,
    account_key: "AK-DDA-001",
    customer_key: "CK-12345",
    product_key: "PK-DDA-BASIC",
    branch_key: "BK-001",
    as_of_date: "2024-01-15",
    eod_balance: 12500.75,
    available_balance: 12000.75,
    hold_amount: 500.00,
    overdraft_amount: 0,
    interest_rate: 0.0000,
    daily_interest_accrual: 0,
    ytd_interest_paid: 0,
    mtd_transaction_count: 15,
    adb_mtd: 11800.50,
    currency_code: "USD",
    fdic_insured_flag: true,
    operational_deposit_flag: true,
    nsfr_asf_factor: 0.95,
  },
  {
    position_key: "POS-20240115-ACC-SAV-002",
    as_of_date_key: 20240115,
    account_key: "AK-SAV-002",
    customer_key: "CK-12345",
    product_key: "PK-SAV-PREMIUM",
    branch_key: "BK-001",
    as_of_date: "2024-01-15",
    eod_balance: 50000.00,
    available_balance: 50000.00,
    hold_amount: 0,
    overdraft_amount: 0,
    interest_rate: 2.5000,
    daily_interest_accrual: 3.42,
    ytd_interest_paid: 51.37,
    mtd_transaction_count: 2,
    adb_mtd: 49500.00,
    currency_code: "USD",
    fdic_insured_flag: true,
    operational_deposit_flag: true,
    nsfr_asf_factor: 0.95,
  },
];

// ============================================================================
// SEMANTIC LAYER: Business-Friendly Definitions
// ============================================================================

export const semanticDepositsLayer = {
  measures: [
    {
      name: "Total Deposits",
      technical_name: "total_deposit_balances",
      aggregation: "SUM",
      format: "currency",
      description: "Sum of all deposit account end-of-day balances",
      sql: "SUM(fact_deposit_positions.eod_balance)",
      folder: "Balances",
    },
    {
      name: "Average Daily Balance",
      technical_name: "average_daily_balance",
      aggregation: "AVG",
      format: "currency",
      description: "Average deposit balance across all accounts",
      sql: "AVG(fact_deposit_positions.eod_balance)",
      folder: "Balances",
    },
    {
      name: "Total Interest Paid",
      technical_name: "total_interest_paid",
      aggregation: "SUM",
      format: "currency",
      description: "Total interest paid to depositors",
      sql: "SUM(fact_deposit_interest.interest_paid)",
      folder: "Interest",
    },
    {
      name: "Cost of Funds",
      technical_name: "cost_of_funds_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Interest expense as percentage of average balances (annualized)",
      sql: "(SUM(fact_deposit_interest.interest_paid) * 365 / 30 / AVG(fact_deposit_positions.eod_balance)) * 100",
      folder: "Profitability",
    },
    {
      name: "Account Count",
      technical_name: "active_account_count",
      aggregation: "COUNT DISTINCT",
      format: "number",
      description: "Number of active deposit accounts",
      sql: "COUNT(DISTINCT dim_deposit_account.account_key) WHERE dim_deposit_account.account_status = 'ACTIVE'",
      folder: "Accounts",
    },
    {
      name: "Transaction Volume",
      technical_name: "transaction_count",
      aggregation: "COUNT",
      format: "number",
      description: "Total number of deposit transactions",
      sql: "COUNT(fact_deposit_transactions.transaction_key)",
      folder: "Activity",
    },
    {
      name: "Net Deposit Flow",
      technical_name: "net_deposit_flow",
      aggregation: "SUM",
      format: "currency",
      description: "Net change in deposit balances (inflows minus outflows)",
      sql: "SUM(CASE WHEN fact_deposit_transactions.transaction_type IN ('DEPOSIT', 'CREDIT') THEN transaction_amount ELSE -1 * transaction_amount END)",
      folder: "Flow",
    },
  ],
  attributes: [
    {
      name: "Product Name",
      technical_name: "product_name",
      field: "dim_deposit_product.product_name",
      description: "Deposit product name (Checking, Savings, etc.)",
    },
    {
      name: "Product Type",
      technical_name: "product_type",
      field: "dim_deposit_product.product_type",
      description: "Product category (DDA, Savings, MMA, CD)",
    },
    {
      name: "Branch Name",
      technical_name: "branch_name",
      field: "dim_branch.branch_name",
      description: "Branch location name",
    },
    {
      name: "Customer Segment",
      technical_name: "customer_segment",
      field: "dim_customer.customer_segment",
      description: "Customer segment (Retail, Small Business, Commercial)",
    },
    {
      name: "Account Status",
      technical_name: "account_status",
      field: "dim_deposit_account.account_status",
      description: "Account status (ACTIVE, CLOSED, DORMANT)",
    },
  ],
};

// ============================================================================
// KEY METRIC CALCULATIONS
// ============================================================================

export const keyMetricSQL = {
  costOfFunds: `
-- Cost of Funds (CoF) Calculation
-- Interest expense as % of average balances, annualized

SELECT 
  DATE_TRUNC('month', accrual_date) as month,
  SUM(interest_paid) as total_interest_expense,
  AVG(average_balance) as avg_deposit_balance,
  (SUM(interest_paid) * 12 / AVG(average_balance)) * 100 as cost_of_funds_pct
FROM gold.fact_deposit_interest
WHERE accrual_date >= DATE_TRUNC('month', CURRENT_DATE()) - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', accrual_date)
ORDER BY month DESC;
`,
  
  depositBeta: `
-- Deposit Beta Calculation
-- Measures deposit rate sensitivity to market rate changes
-- Uses regression analysis over trailing 12 months

WITH monthly_rates AS (
  SELECT
    DATE_TRUNC('month', accrual_date) as month,
    AVG(interest_rate) as deposit_rate,
    LAG(AVG(interest_rate)) OVER (ORDER BY DATE_TRUNC('month', accrual_date)) as prior_deposit_rate
  FROM gold.fact_deposit_interest
  GROUP BY DATE_TRUNC('month', accrual_date)
),
market_rates AS (
  SELECT
    month,
    fed_funds_rate,
    LAG(fed_funds_rate) OVER (ORDER BY month) as prior_fed_funds_rate
  FROM gold.dim_date
  WHERE day_of_month = 1
),
rate_changes AS (
  SELECT
    m.month,
    (m.deposit_rate - m.prior_deposit_rate) as deposit_rate_change,
    (mr.fed_funds_rate - mr.prior_fed_funds_rate) as market_rate_change
  FROM monthly_rates m
  JOIN market_rates mr ON m.month = mr.month
  WHERE m.prior_deposit_rate IS NOT NULL
    AND mr.prior_fed_funds_rate IS NOT NULL
)
SELECT
  REGR_SLOPE(deposit_rate_change, market_rate_change) as deposit_beta,
  REGR_R2(deposit_rate_change, market_rate_change) as r_squared,
  COUNT(*) as observation_count
FROM rate_changes;
`,

  lcrOperationalDeposits: `
-- LCR Operational Deposits Calculation
-- Identifies stable deposits for Liquidity Coverage Ratio

SELECT
  as_of_date,
  SUM(CASE WHEN operational_deposit_flag = TRUE THEN eod_balance ELSE 0 END) as operational_deposits,
  SUM(eod_balance) as total_deposits,
  (SUM(CASE WHEN operational_deposit_flag = TRUE THEN eod_balance ELSE 0 END) / SUM(eod_balance)) * 100 as operational_pct,
  SUM(eod_balance * nsfr_asf_factor) as available_stable_funding
FROM gold.fact_deposit_positions
WHERE as_of_date = CURRENT_DATE() - 1
GROUP BY as_of_date;
`,
};

export const depositsUnifiedModelStats = {
  totalTables: bronzeDepositsTables.length + silverDepositsTables.length + goldDepositsTables.length,
  bronzeTables: bronzeDepositsTables.length,
  silverTables: silverDepositsTables.length,
  goldTables: goldDepositsTables.length,
  semanticMeasures: semanticDepositsLayer.measures.length,
  semanticAttributes: semanticDepositsLayer.attributes.length,
};
