// Banking Data Blueprint: shared types, data dictionaries, SQL, and metrics catalog

export type RetailTransactionRaw = {
  transaction_id: string;
  account_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  transaction_type: "DEBIT" | "CREDIT";
  merchant_name?: string;
  merchant_category_code?: string;
  transaction_timestamp: string; // ISO
  source_system_id: string; // mandatory
  ingestion_timestamp: string; // mandatory, ISO
  record_hash: string; // mandatory, integrity hash
};

export type RawCustomer = {
  source_customer_id: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  kyc_status: "PENDING" | "VERIFIED" | "FAILED";
  source_system_id: string;
  ingestion_timestamp: string; // ISO
};

export type GoldenCustomerSCD2 = {
  customer_ger_key: string; // Global Entity Resolution key (stable id)
  source_customer_id: string;
  full_name: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  kyc_status: "PENDING" | "VERIFIED" | "FAILED";
  effective_start_ts: string; // SCD2 start
  effective_end_ts: string | null; // SCD2 end (null = current)
  is_current: 0 | 1;
};

export type DimCustomerConformed = {
  customer_sk: number;
  customer_ger_key: string;
  full_name: string;
  birth_year?: number | null;
  country?: string | null;
  kyc_status: string;
  current_flag: 0 | 1;
};

export type FactDailyPosition = {
  as_of_date: string; // YYYY-MM-DD
  account_id: string;
  product_type: "DEPOSIT" | "CREDIT_CARD" | "LOAN";
  customer_ger_key: string;
  eod_balance: number; // acts as EAD
  currency: string;
  pd: number; // 0..1
  lgd: number; // 0..1
  ecl: number; // computed: eod_balance * pd * lgd
  interest_rate_apr?: number; // annual rate (e.g., 0.05 = 5%)
  interest_direction?: "income" | "expense"; // loan => income, deposit => expense
  interest_amount_daily?: number; // signed daily interest in currency
  delinquency_days?: number; // days past due for loans
  npl_flag?: 0 | 1; // non-performing loan flag
  stage?: "STAGE_1" | "STAGE_2" | "STAGE_3"; // IFRS9 stage
  writeoff_amount?: number; // daily charge-offs
};

// Bronze layer: field dictionary for retail transactions
export const bronzeRetailTransactionsFields = [
  { field: "transaction_id", datatype: "STRING", description: "Unique transaction id from source" },
  { field: "account_id", datatype: "STRING", description: "Account identifier" },
  { field: "customer_id", datatype: "STRING", description: "Owning customer id" },
  { field: "amount", datatype: "NUMERIC(18,2)", description: "Transaction amount" },
  { field: "currency", datatype: "STRING", description: "ISO 4217 currency code" },
  { field: "transaction_type", datatype: "STRING", description: "DEBIT or CREDIT" },
  { field: "merchant_name", datatype: "STRING", description: "Merchant name (optional)" },
  { field: "merchant_category_code", datatype: "STRING", description: "MCC code (optional)" },
  { field: "transaction_timestamp", datatype: "TIMESTAMP", description: "Event timestamp" },
  { field: "source_system_id", datatype: "STRING", description: "MANDATORY: Source system identifier" },
  { field: "ingestion_timestamp", datatype: "TIMESTAMP", description: "MANDATORY: Ingestion load time" },
  { field: "record_hash", datatype: "STRING", description: "MANDATORY: Data integrity SHA256 hash" },
];

export const sourceToTarget_RetailTxn_Bronze = bronzeRetailTransactionsFields.map((c) => ({
  source_field: c.field,
  source_datatype: c.datatype,
  target_table: "bronze.retail_transactions",
  target_field: c.field,
  target_datatype: c.datatype,
  transformation: c.field === "record_hash" ? "sha256 of canonical row concat" : "none",
}));

export const sampleBronzeTransactions: RetailTransactionRaw[] = [
  {
    transaction_id: "T1001",
    account_id: "A-001",
    customer_id: "C-001",
    amount: 125.55,
    currency: "USD",
    transaction_type: "DEBIT",
    merchant_name: "Fresh Market",
    merchant_category_code: "5411",
    transaction_timestamp: "2025-01-08T14:33:12Z",
    source_system_id: "CORE_BANKING",
    ingestion_timestamp: "2025-01-08T14:35:00Z",
    record_hash: "f1a0e0c7c-000001",
  },
  {
    transaction_id: "T1002",
    account_id: "A-002",
    customer_id: "C-002",
    amount: 2000.0,
    currency: "USD",
    transaction_type: "CREDIT",
    merchant_name: "Payroll Co",
    merchant_category_code: "6011",
    transaction_timestamp: "2025-01-08T15:05:02Z",
    source_system_id: "PAYMENTS_GATEWAY",
    ingestion_timestamp: "2025-01-08T15:06:00Z",
    record_hash: "a0b19d99-000002",
  },
];

// Silver: mappings and SCD2 customer examples
export const silverCustomerSourceToTarget = [
  { source_field: "source_customer_id", target_field: "source_customer_id", rule: "direct" },
  { source_field: "first_name + last_name", target_field: "full_name", rule: "concat(trim(first_name),' ',trim(last_name))" },
  { source_field: "birth_date", target_field: "birth_date", rule: "standardize date" },
  { source_field: "email", target_field: "email", rule: "lowercase, validate format" },
  { source_field: "phone", target_field: "phone", rule: "E.164 normalization" },
  { source_field: "address_*", target_field: "address_*", rule: "standardize casing & abbreviations" },
  { source_field: "kyc_status", target_field: "kyc_status", rule: "map to {PENDING,VERIFIED,FAILED}" },
  { source_field: "source fields", target_field: "customer_ger_key", rule: "entity resolution across systems" },
  { source_field: "system clock", target_field: "effective_*", rule: "SCD2 start/end timestamps" },
];

export const sampleRawCustomers: RawCustomer[] = [
  {
    source_customer_id: "C-001",
    first_name: "Alex",
    last_name: "Rivera",
    birth_date: "1989-03-10",
    email: "alex.r@example.com",
    phone: "+1 415 555 1000",
    address_line1: "10 Bay St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94105",
    country: "US",
    kyc_status: "VERIFIED",
    source_system_id: "CRM",
    ingestion_timestamp: "2025-01-07T10:00:00Z",
  },
  {
    source_customer_id: "C-001",
    first_name: "Alex",
    last_name: "Rivera",
    birth_date: "1989-03-10",
    email: "alex.r@example.com",
    phone: "+1 415 555 1000",
    address_line1: "99 Ocean Ave",
    city: "Oakland",
    state: "CA",
    postal_code: "94607",
    country: "US",
    kyc_status: "VERIFIED",
    source_system_id: "CRM",
    ingestion_timestamp: "2025-03-01T08:00:00Z",
  },
];

export const sampleGoldenCustomersSCD2: GoldenCustomerSCD2[] = [
  {
    customer_ger_key: "GER-0001",
    source_customer_id: "C-001",
    full_name: "Alex Rivera",
    birth_date: "1989-03-10",
    email: "alex.r@example.com",
    phone: "+1 415 555 1000",
    address_line1: "10 Bay St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94105",
    country: "US",
    kyc_status: "VERIFIED",
    effective_start_ts: "2025-01-07T10:00:00Z",
    effective_end_ts: "2025-03-01T08:00:00Z",
    is_current: 0,
  },
  {
    customer_ger_key: "GER-0001",
    source_customer_id: "C-001",
    full_name: "Alex Rivera",
    birth_date: "1989-03-10",
    email: "alex.r@example.com",
    phone: "+1 415 555 1000",
    address_line1: "99 Ocean Ave",
    city: "Oakland",
    state: "CA",
    postal_code: "94607",
    country: "US",
    kyc_status: "VERIFIED",
    effective_start_ts: "2025-03-01T08:00:00Z",
    effective_end_ts: null,
    is_current: 1,
  },
];

// Gold: dimension and fact definitions and samples
export const goldDimCustomerColumns = [
  { column: "customer_sk", datatype: "BIGINT", description: "Surrogate key" },
  { column: "customer_ger_key", datatype: "STRING", description: "Global Entity Resolution key" },
  { column: "full_name", datatype: "STRING", description: "Customer full name" },
  { column: "birth_year", datatype: "INT", description: "Derived birth year" },
  { column: "country", datatype: "STRING", description: "Country of residence" },
  { column: "kyc_status", datatype: "STRING", description: "KYC Status" },
  { column: "current_flag", datatype: "TINYINT", description: "Current record flag" },
];

export const sampleDimCustomerConformed: DimCustomerConformed[] = [
  { customer_sk: 1, customer_ger_key: "GER-0001", full_name: "Alex Rivera", birth_year: 1989, country: "US", kyc_status: "VERIFIED", current_flag: 1 },
  { customer_sk: 2, customer_ger_key: "GER-0002", full_name: "Priya Nambiar", birth_year: 1991, country: "US", kyc_status: "VERIFIED", current_flag: 1 },
];

export const goldFactDailyPositionColumns = [
  { column: "as_of_date", datatype: "DATE", description: "Snapshot date (EOD)" },
  { column: "account_id", datatype: "STRING", description: "Account identifier" },
  { column: "product_type", datatype: "STRING", description: "DEPOSIT/CREDIT_CARD/LOAN" },
  { column: "customer_ger_key", datatype: "STRING", description: "Customer GER key" },
  { column: "eod_balance", datatype: "NUMERIC(18,2)", description: "EOD balance (acts as EAD)" },
  { column: "currency", datatype: "STRING", description: "ISO currency" },
  { column: "pd", datatype: "DECIMAL(5,4)", description: "Probability of Default (0..1)" },
  { column: "lgd", datatype: "DECIMAL(5,4)", description: "Loss Given Default (0..1)" },
  { column: "ecl", datatype: "NUMERIC(18,2)", description: "Expected Credit Loss (EAD*PD*LGD)" },
  { column: "interest_rate_apr", datatype: "DECIMAL(9,6)", description: "Annual interest rate as decimal" },
  { column: "interest_direction", datatype: "STRING", description: "income or expense" },
  { column: "interest_amount_daily", datatype: "NUMERIC(18,6)", description: "Signed daily interest amount" },
  { column: "delinquency_days", datatype: "INT", description: "Days past due (loans)" },
  { column: "npl_flag", datatype: "TINYINT", description: "Non-performing loan flag" },
  { column: "stage", datatype: "STRING", description: "IFRS9 stage" },
  { column: "writeoff_amount", datatype: "NUMERIC(18,2)", description: "Charge-off amount" },
];

export const sampleFactDailyPosition: FactDailyPosition[] = [
  { as_of_date: "2025-01-08", account_id: "A-001", product_type: "DEPOSIT", customer_ger_key: "GER-0001", eod_balance: 3200.25, currency: "USD", pd: 0.0100, lgd: 0.4500, ecl: parseFloat((3200.25 * 0.01 * 0.45).toFixed(2)), interest_rate_apr: 0.0125, interest_direction: "expense", interest_amount_daily: parseFloat((3200.25 * 0.0125 / 365).toFixed(6)) * -1, delinquency_days: 0, npl_flag: 0, stage: "STAGE_1", writeoff_amount: 0 },
  { as_of_date: "2025-01-08", account_id: "L-100", product_type: "LOAN", customer_ger_key: "GER-0002", eod_balance: 12500.00, currency: "USD", pd: 0.0350, lgd: 0.5500, ecl: parseFloat((12500 * 0.035 * 0.55).toFixed(2)), interest_rate_apr: 0.0899, interest_direction: "income", interest_amount_daily: parseFloat((12500.0 * 0.0899 / 365).toFixed(6)), delinquency_days: 35, npl_flag: 1, stage: "STAGE_3", writeoff_amount: 0 },
];

// DDL SQL
export const bronzeDDL_SQL = `-- Bronze Layer: Raw immutable landing zone
CREATE SCHEMA IF NOT EXISTS bronze;

CREATE TABLE IF NOT EXISTS bronze.retail_transactions (
  transaction_id STRING,
  account_id STRING,
  customer_id STRING,
  amount NUMERIC(18,2),
  currency STRING,
  transaction_type STRING,
  merchant_name STRING,
  merchant_category_code STRING,
  transaction_timestamp TIMESTAMP,
  source_system_id STRING NOT NULL,
  ingestion_timestamp TIMESTAMP NOT NULL,
  record_hash STRING NOT NULL
);

-- Recommended canonical hash (compute during ingestion)
-- record_hash = SHA256( concat_ws('|', transaction_id, account_id, customer_id, amount, currency, transaction_type, coalesce(merchant_name,''), coalesce(merchant_category_code,''), transaction_timestamp, source_system_id) );
`;

export const silverSCD2_SQL = `-- Silver Layer: Cleaned & Conformed - Golden Customer with SCD Type 2
CREATE SCHEMA IF NOT EXISTS silver;

CREATE TABLE IF NOT EXISTS silver.customer_golden_scd2 (
  customer_ger_key STRING,
  source_customer_id STRING,
  full_name STRING,
  birth_date DATE,
  email STRING,
  phone STRING,
  address_line1 STRING,
  address_line2 STRING,
  city STRING,
  state STRING,
  postal_code STRING,
  country STRING,
  kyc_status STRING,
  effective_start_ts TIMESTAMP,
  effective_end_ts TIMESTAMP,
  is_current TINYINT
);

-- Pseudo-SQL for SCD2 merge
MERGE INTO silver.customer_golden_scd2 t
USING staging.cleaned_customer s
ON t.customer_ger_key = s.customer_ger_key AND t.is_current = 1
WHEN MATCHED AND (
  COALESCE(t.address_line1,'') <> COALESCE(s.address_line1,'') OR
  COALESCE(t.city,'') <> COALESCE(s.city,'') OR
  COALESCE(t.state,'') <> COALESCE(s.state,'') OR
  COALESCE(t.postal_code,'') <> COALESCE(s.postal_code,'') OR
  COALESCE(t.country,'') <> COALESCE(s.country,'') OR
  COALESCE(t.kyc_status,'') <> COALESCE(s.kyc_status,'')
) THEN
  UPDATE SET t.effective_end_ts = s.effective_start_ts, t.is_current = 0
WHEN NOT MATCHED THEN
  INSERT (
    customer_ger_key, source_customer_id, full_name, birth_date, email, phone,
    address_line1, address_line2, city, state, postal_code, country,
    kyc_status, effective_start_ts, effective_end_ts, is_current
  )
  VALUES (
    s.customer_ger_key, s.source_customer_id, s.full_name, s.birth_date, s.email, s.phone,
    s.address_line1, s.address_line2, s.city, s.state, s.postal_code, s.country,
    s.kyc_status, s.effective_start_ts, NULL, 1
  );
`;

export const goldStarSchema_SQL = `-- Gold Layer: Star schema
CREATE SCHEMA IF NOT EXISTS gold;

CREATE TABLE IF NOT EXISTS gold.dim_customer_conformed (
  customer_sk BIGINT GENERATED BY DEFAULT AS IDENTITY,
  customer_ger_key STRING,
  full_name STRING,
  birth_year INT,
  country STRING,
  kyc_status STRING,
  current_flag TINYINT,
  PRIMARY KEY (customer_sk)
);

CREATE TABLE IF NOT EXISTS gold.fact_daily_position (
  as_of_date DATE,
  account_id STRING,
  product_type STRING,
  customer_ger_key STRING,
  eod_balance NUMERIC(18,2),
  currency STRING,
  pd DECIMAL(5,4),
  lgd DECIMAL(5,4),
  ecl NUMERIC(18,2),
  interest_rate_apr DECIMAL(9,6),
  interest_direction STRING,
  interest_amount_daily NUMERIC(18,6),
  delinquency_days INT,
  npl_flag TINYINT,
  stage STRING,
  writeoff_amount NUMERIC(18,2),
  FOREIGN KEY (customer_ger_key) REFERENCES gold.dim_customer_conformed(customer_ger_key)
);
`;

// Metric SQL snippets
export const eclSQL = `-- Expected Credit Loss (simplified)
-- ECL = EAD * PD * LGD
-- Here we use EOD balance as a proxy for EAD.
SELECT
  as_of_date, account_id, customer_ger_key,
  eod_balance AS ead,
  pd,
  lgd,
  ROUND(eod_balance * pd * lgd, 2) AS ecl
FROM gold.fact_daily_position;
`;

export const adbSQL = `-- Average Daily Balance (monthly)
SELECT
  DATE_TRUNC('month', as_of_date) AS month,
  customer_ger_key,
  product_type,
  AVG(eod_balance) AS average_daily_balance
FROM gold.fact_daily_position
GROUP BY 1,2,3
ORDER BY 1,2,3;
`;

export const niiSQL = `-- Net Interest Income (daily)
-- interest_amount_daily is signed (+income for loans, -expense for deposits)
SELECT
  as_of_date,
  SUM(interest_amount_daily) AS net_interest_income
FROM gold.fact_daily_position
GROUP BY 1
ORDER BY 1;
`;

export const nplRatioSQL = `-- NPL Ratio (daily)
SELECT
  as_of_date,
  CASE WHEN SUM(CASE WHEN product_type = 'LOAN' THEN eod_balance ELSE 0 END) = 0 THEN NULL
       ELSE SUM(CASE WHEN product_type = 'LOAN' AND npl_flag = 1 THEN eod_balance ELSE 0 END)
            / SUM(CASE WHEN product_type = 'LOAN' THEN eod_balance ELSE 0 END)
  END AS npl_ratio
FROM gold.fact_daily_position
GROUP BY 1
ORDER BY 1;
`;

export const yieldOnLoansSQL = `-- Yield on Loans (monthly)
WITH monthly AS (
  SELECT DATE_TRUNC('month', as_of_date) AS month,
         SUM(CASE WHEN product_type='LOAN' THEN interest_amount_daily ELSE 0 END) AS interest_income,
         AVG(CASE WHEN product_type='LOAN' THEN eod_balance END) AS avg_loan_balance
  FROM gold.fact_daily_position
  GROUP BY 1
)
SELECT month,
       CASE WHEN avg_loan_balance = 0 THEN NULL ELSE (interest_income * 30) / avg_loan_balance END AS monthly_yield_estimate
FROM monthly
ORDER BY 1;
`;

export const cofSQL = `-- Cost of Funds (monthly, deposits)
WITH monthly AS (
  SELECT DATE_TRUNC('month', as_of_date) AS month,
         -SUM(CASE WHEN product_type='DEPOSIT' THEN interest_amount_daily ELSE 0 END) AS interest_expense,
         AVG(CASE WHEN product_type='DEPOSIT' THEN eod_balance END) AS avg_deposit_balance
  FROM gold.fact_daily_position
  GROUP BY 1
)
SELECT month,
       CASE WHEN avg_deposit_balance = 0 THEN NULL ELSE (interest_expense * 30) / avg_deposit_balance END AS monthly_cost_of_funds_estimate
FROM monthly
ORDER BY 1;
`;

export const chargeOffRateSQL = `-- Charge-off Rate (monthly)
WITH monthly AS (
  SELECT DATE_TRUNC('month', as_of_date) AS month,
         SUM(writeoff_amount) AS charge_offs,
         AVG(CASE WHEN product_type='LOAN' THEN eod_balance END) AS avg_loan_balance
  FROM gold.fact_daily_position
  GROUP BY 1
)
SELECT month,
       CASE WHEN avg_loan_balance = 0 THEN NULL ELSE charge_offs / avg_loan_balance END AS charge_off_rate
FROM monthly
ORDER BY 1;
`;

export const stageExposureSQL = `-- Exposure by IFRS9 Stage (daily)
SELECT as_of_date, stage, SUM(eod_balance) AS exposure
FROM gold.fact_daily_position
GROUP BY 1,2
ORDER BY 1,2;
`;

// Semantic layer: business-friendly names
export const semanticDictionary = {
  measures: [
    { name: "EOD Balance", technical_name: "eod_balance", format: "currency", aggregation: "sum", description: "End-of-day account balance (proxy for EAD)" },
    { name: "Expected Credit Loss", technical_name: "ecl", format: "currency", aggregation: "sum", description: "EAD * PD * LGD" },
  ],
  attributes: [
    { name: "Date", technical_name: "as_of_date", description: "Snapshot date" },
    { name: "Account ID", technical_name: "account_id", description: "Unique account identifier" },
    { name: "Product Type", technical_name: "product_type", description: "DEPOSIT / CREDIT_CARD / LOAN" },
    { name: "Customer GER Key", technical_name: "customer_ger_key", description: "Global entity resolution key" },
    { name: "KYC Status", technical_name: "kyc_status", description: "Customer KYC status from Dim Customer" },
  ],
};

export const semanticFriendlyNames = [
  { business_name: "EOD Balance", dataset: "Fact Daily Position", field: "eod_balance", notes: "Currency format" },
  { business_name: "Expected Credit Loss", dataset: "Fact Daily Position", field: "ecl", notes: "Computed measure" },
  { business_name: "Customer", dataset: "Dim Customer Conformed", field: "full_name", notes: "Customer full name" },
  { business_name: "Country", dataset: "Dim Customer Conformed", field: "country", notes: "Country of residence" },
];

// Import domain-specific metrics catalog
export type MetricDef = {
  id: string;
  domain: string;
  subdomain: string;
  name: string;
  technical_name: string;
  grain: string;
  aggregation: string;
  data_type: string;
  source_silver_table: string;
  source_silver_column: string;
  source_gold_table: string;
  source_gold_column: string;
  metric_type: "operational" | "insight" | "analytics" | "model_driven";
  definition: string;
  sql: string;
};

export { goldMetricsCatalog } from "./domain-metrics";

// Domain-specific metrics are now imported from domain-metrics.ts
