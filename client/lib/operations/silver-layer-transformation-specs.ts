/**
 * SILVER LAYER TRANSFORMATION & INGESTION SPECIFICATIONS
 * 
 * Comprehensive specifications for transforming Bronze Layer data to Silver Layer
 * Includes ETL patterns, transformation logic, scheduling, error handling, and reconciliation
 * 
 * Architecture:
 * Bronze Layer (raw, 1:1 mapping)
 *   ↓ Daily/Real-time ETL
 * Silver Layer (cleansed, conformed, deduplicated)
 *   ↓ Weekly/Monthly business rules
 * Gold Layer (aggregated, business metrics)
 * 
 * Refresh Frequencies:
 * - Customer Master: Daily (SCD2 with full history)
 * - Deposit Accounts: Daily (SCD2)
 * - Account Balances: Real-time (daily snapshots)
 * - Transactions: Real-time (posted daily)
 * - Aggregations: Daily (early morning)
 * 
 * Technology Stack:
 * - Data Warehouse: Snowflake (configured)
 * - Orchestration: Airflow or dbt Cloud
 * - Processing: SQL (dbt models) for transformations
 * - PII Handling: Tokenization service + Key management
 */

export interface TransformationStep {
  stepName: string;
  stepNumber: number;
  sourceTable: string;
  targetTable: string;
  transformationType: "CLEANSE" | "ENRICH" | "DEDUPLICATE" | "AGGREGATE" | "ENCRYPT";
  refreshFrequency: "REAL_TIME" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  incrementalCapability: boolean;
  estimatedDuration: string;
  dependencies: string[];
  errorHandling: string;
  description: string;
}

export interface IngestionSpecification {
  domain: string;
  sourceTables: string[];
  silverTargetTables: string[];
  refreshSchedule: string;
  incrementalStrategy?: string;
  scd2Tracking: boolean;
  deduplicationMethod?: string;
  encryptionFields: string[];
  dataValidationRules: string[];
  reconciliationApproach: string;
}

// ============================================================================
// CUSTOMER DOMAIN TRANSFORMATION SPECIFICATIONS
// ============================================================================

export const customerDomainTransformationSteps: TransformationStep[] = [
  {
    stepName: "Customer Master - PII Encryption",
    stepNumber: 1,
    sourceTable: "bronze.customer_master",
    targetTable: "silver.customer_master_encrypted (Matillion: CUST_PII_ENC)",
    transformationType: "ENCRYPT",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "15-30 minutes",
    dependencies: [],
    errorHandling:
      "On encryption failure, reject row and log error code. Do not pass unencrypted data to Silver. Retry with exponential backoff (max 3 attempts). Alert security team on final failure.",
    description:
      "Encrypt PII fields (SSN via SHA256 hashing, names/addresses/contact via AES-256 tokenization) from bronze.customer_master using Snowflake KMS and external tokenization service",
  },
  {
    stepName: "Customer Names - Standardization",
    stepNumber: 2,
    sourceTable: "bronze.customer_names_addresses",
    targetTable: "silver.customer_names_standardized (Matillion: CUST_NAME_STD)",
    transformationType: "CLEANSE",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "10-20 minutes",
    dependencies: [],
    errorHandling:
      "Standardization failures (invalid accent removal): log with original value and row ID, apply fallback TRIM/UPPER processing, escalate to data steward for manual review",
    description:
      "Standardize names (INITCAP, accent removal via UNACCENT, trimming), standardize addresses (USPS ZIP+4 validation, street normalization, city standardization)",
  },
  {
    stepName: "Customer Identifiers - Tokenization",
    stepNumber: 3,
    sourceTable: "bronze.customer_identifiers",
    targetTable: "silver.customer_identifiers_tokenized (Matillion: CUST_ID_TOK)",
    transformationType: "ENCRYPT",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "5-10 minutes",
    dependencies: [],
    errorHandling:
      "Failed tokenization: use fallback generated token (RAND_), log incident with timestamp/customer_id, alert to security team. Maintain audit trail in secure audit table.",
    description:
      "Tokenize identification numbers (DL, Passport, State ID, Military ID) via external tokenization service, maintain encrypted token-to-ID mapping securely in token vault",
  },
  {
    stepName: "Customer Email - Validation & Deduplication",
    stepNumber: 4,
    sourceTable: "bronze.customer_email",
    targetTable: "silver.customer_email_validated (Matillion: CUST_EMAIL_VAL)",
    transformationType: "CLEANSE",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "5-10 minutes",
    dependencies: [],
    errorHandling:
      "Invalid email format: apply pattern correction (remove spaces, lowercase), validate RFC format, mark invalid as unverified. Track correction ratio in DQ metrics.",
    description:
      "Validate email format (RFC 5322), deduplicate multiple emails per customer (keep primary/verified), tokenize email values, validate delivery via ping/verification flags",
  },
  {
    stepName: "Customer Master - Deduplication & MDM",
    stepNumber: 5,
    sourceTable: "silver.customer_master_encrypted + silver.customer_names_standardized + silver.customer_identifiers_tokenized + silver.customer_email_validated",
    targetTable: "silver.customer_master_deduped (Matillion: CUST_MDM_DEDUP)",
    transformationType: "DEDUPLICATE",
    refreshFrequency: "DAILY",
    incrementalCapability: false,
    estimatedDuration: "30-60 minutes",
    dependencies: [
      "Customer Master - PII Encryption",
      "Customer Names - Standardization",
      "Customer Identifiers - Tokenization",
      "Customer Email - Validation & Deduplication",
    ],
    errorHandling:
      "Deduplication conflicts (equal confidence scores): log all candidates to manual review table, assign to data steward, notify via alert. Retain previous winner until manual approval.",
    description:
      "Apply MDM deduplication: match on SSN_HASH + full_name_cleansed + date_of_birth + address_line1_std with confidence scoring. Apply survivorship rules (priority: FIS_CORE > PROFILE > THIRD_PARTY). Generate confidence score (0-100).",
  },
  {
    stepName: "Customer Master - SCD Type 2 Implementation",
    stepNumber: 6,
    sourceTable: "silver.customer_master_deduped",
    targetTable: "silver.customer_master_golden (Matillion: CUST_SCD2_FINAL)",
    transformationType: "AGGREGATE",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "10-20 minutes",
    dependencies: ["Customer Master - Deduplication & MDM"],
    errorHandling:
      "SCD2 logic errors: log discrepancy with customer_id and change details, retain previous version, alert to data engineering team. Block insert on constraint violation.",
    description:
      "Implement SCD Type 2: detect changes via source hash comparison, expire previous records (set expiration_date=yesterday, is_current=FALSE), insert new versions (effective_date=today, is_current=TRUE). Track changed_attributes.",
  },
];

export const customerIngestionSpecification: IngestionSpecification = {
  domain: "Customer",
  sourceTables: [
    "bronze.customer_master",
    "bronze.customer_identifiers",
    "bronze.customer_names_addresses",
    "bronze.customer_email",
    "bronze.customer_account_relationships",
  ],
  silverTargetTables: [
    "silver.customer_master_golden",
    "silver.customer_relationships",
    "silver.customer_contact_history",
  ],
  refreshSchedule: "Daily at 01:00 UTC (after FIS EOD feed at 00:30 UTC)",
  incrementalStrategy: "Incremental by LAST_MODIFIED_DATE from bronze layer, full rebuild weekly",
  scd2Tracking: true,
  deduplicationMethod:
    "MDM matching on SSN_HASH + full_name_cleansed + date_of_birth + address_line1_std, confidence score >= 0.85",
  encryptionFields: [
    "TAX_ID (SHA256 hash)",
    "first_name_cleansed (AES-256)",
    "last_name_cleansed (AES-256)",
    "full_name_cleansed (AES-256)",
    "email_primary (Tokenization)",
    "phone_mobile (Tokenization)",
    "date_of_birth (AES-256)",
    "IDENTIFICATION_NUMBER (Tokenization)",
  ],
  dataValidationRules: [
    "customer_id: NOT NULL, unique per effective_date",
    "customer_since_date: <= CURRENT_DATE()",
    "date_of_birth: > 1900-01-01 AND < CURRENT_DATE() - 18 years",
    "email_primary: valid email format if NOT NULL",
    "phone_mobile: valid E.164 format if NOT NULL",
    "customer_status: IN (ACTIVE, INACTIVE, CLOSED, DECEASED)",
    "ssn_hash: 64 char SHA256 if NOT NULL",
  ],
  reconciliationApproach:
    "Daily record count comparison (bronze vs silver +- 5%), hash comparison of deduplicated records, manual review of low confidence matches (< 0.85)",
};

// ============================================================================
// DEPOSITS DOMAIN TRANSFORMATION SPECIFICATIONS
// ============================================================================

export const depositsDomainTransformationSteps: TransformationStep[] = [
  {
    stepName: "Deposit Accounts - Standardization",
    stepNumber: 1,
    sourceTable: "bronze.deposit_account_master",
    targetTable: "silver.deposit_accounts_standardized (Matillion: DEP_ACCT_STD)",
    transformationType: "CLEANSE",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "10-15 minutes",
    dependencies: [],
    errorHandling:
      "Standardization errors (invalid account type, status): log with account_id and error reason, apply previous valid value if available, flag for data steward review. Reject if no valid fallback.",
    description:
      "Standardize account types (DDA, SAVINGS, MONEY_MARKET, CD, IRA, HSA), status codes (ACTIVE, INACTIVE, DORMANT, CLOSED, SUSPENDED), product codes. Validate dates: account_open_date <= CURRENT_DATE() AND (account_close_date IS NULL OR account_close_date >= account_open_date). Standardize account names and descriptions (TRIM, INITCAP).",
  },
  {
    stepName: "Deposit Accounts - Rate & Fee Normalization",
    stepNumber: 2,
    sourceTable: "bronze.deposit_account_master",
    targetTable: "silver.deposit_accounts_normalized (Matillion: DEP_ACCT_NORM)",
    transformationType: "CLEANSE",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "5-10 minutes",
    dependencies: ["Deposit Accounts - Standardization"],
    errorHandling:
      "Invalid rates/fees (negative or > 10%/1000): apply bounds checking (clamp to valid range or NULL), log anomaly with account_id and original value, alert to rates team for investigation",
    description:
      "Normalize interest rates (ensure 0-10% range, round to 6 decimals), validate fee amounts (0-1000 or NULL), map rate plan codes to standard plans, track rate change dates for historical analysis",
  },
  {
    stepName: "Deposit Balances - Daily Snapshot",
    stepNumber: 3,
    sourceTable: "bronze.deposit_account_balances_daily",
    targetTable: "silver.deposit_balances_daily (Matillion: DEP_BAL_DAILY)",
    transformationType: "CLEANSE",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "15-30 minutes",
    dependencies: ["Deposit Accounts - Standardization"],
    errorHandling:
      "Balance reconciliation failures: log discrepancy with account_id, balance_date, expected vs actual amount/percentage, create exception record in DQ exception table, notify operations team. Implement retry with exponential backoff.",
    description:
      "Validate daily balances: verify closing_balance = opening_balance + net_change (tolerance: ±0.01), validate available_balance <= collected_balance. Aggregate transaction counts by type (deposits, withdrawals). Calculate interest accrued and fees charged. Flag imbalanced records for reconciliation.",
  },
  {
    stepName: "Deposit Transactions - Categorization & Enrichment",
    stepNumber: 4,
    sourceTable: "bronze.money_transaction",
    targetTable: "silver.deposit_transactions_enriched (Matillion: DEP_TXN_ENRICH)",
    transformationType: "ENRICH",
    refreshFrequency: "REAL_TIME",
    incrementalCapability: true,
    estimatedDuration: "10-20 minutes",
    dependencies: ["Deposit Accounts - Standardization"],
    errorHandling:
      "Categorization failures (unmapped codes): log transaction_id and code, apply DEFAULT_OTHER category, flag for manual review. Maintain mapping update queue for new codes.",
    description:
      "Categorize transaction types (CHECK, ACH, WIRE, ATM, DEBIT_CARD, DEPOSIT, INTEREST, FEE, ADJUSTMENT, STOP_PAYMENT, HOLD, RELEASE), derive transaction channel (TELLER, ATM, ONLINE, MOBILE, ACH, WIRE). Validate amounts (> 0, DECIMAL(18,2) format). Calculate running balances (balance_after = previous_balance + signed_amount). Detect overdrafts.",
  },
  {
    stepName: "Deposit Account Master - SCD Type 2 Implementation",
    stepNumber: 5,
    sourceTable: "silver.deposit_accounts_normalized",
    targetTable: "silver.deposit_account_master_golden (Matillion: DEP_SCD2_FINAL)",
    transformationType: "AGGREGATE",
    refreshFrequency: "DAILY",
    incrementalCapability: true,
    estimatedDuration: "10-15 minutes",
    dependencies: ["Deposit Accounts - Rate & Fee Normalization"],
    errorHandling:
      "SCD2 logic errors: detect via hash comparison failure, retain previous version as current, log issue with account_id and change details, alert data engineering team. Manual investigation required before override.",
    description:
      "Implement SCD Type 2: detect changes via source hash (MD5 of account_id + account_type + interest_rate + monthly_fee + status). Expire old records (set expiration_date to yesterday, is_current=FALSE). Insert new version (set effective_date=today, expiration_date=9999-12-31, is_current=TRUE). Track changed_attributes (comma-separated list of column names that changed).",
  },
];

export const depositsIngestionSpecification: IngestionSpecification = {
  domain: "Deposits",
  sourceTables: [
    "bronze.deposit_account_master",
    "bronze.deposit_account_balances_daily",
    "bronze.money_transaction",
  ],
  silverTargetTables: [
    "silver.deposit_account_master_golden",
    "silver.deposit_account_daily_balances",
    "silver.deposit_transaction_detail",
  ],
  refreshSchedule: "Daily at 02:00 UTC for master/balances, Real-time for transactions",
  incrementalStrategy:
    "Account master: incremental by REFRESH_TIME, full rebuild monthly. Balances: daily load. Transactions: incremental by posting time.",
  scd2Tracking: true,
  deduplicationMethod: "None (account_id is unique natural key)",
  encryptionFields: ["account_name (optional - customer display, masked)"],
  dataValidationRules: [
    "account_id: NOT NULL, unique",
    "account_open_date: <= CURRENT_DATE()",
    "account_close_date: NULL or >= account_open_date",
    "interest_rate_current: 0-10% or NULL",
    "monthly_fee_amount: 0-1000 or NULL",
    "account_status: IN (ACTIVE, INACTIVE, DORMANT, CLOSED, SUSPENDED)",
    "balance fields: valid DECIMAL(18,2), >= 0",
    "transaction_amount: > 0",
  ],
  reconciliationApproach:
    "Daily account count (bronze vs silver), balance totals by account type, transaction count by type, manual review of exceptions",
};

// ============================================================================
// TRANSACTIONS DOMAIN TRANSFORMATION SPECIFICATIONS
// ============================================================================

export const transactionsDomainTransformationSteps: TransformationStep[] = [
  {
    stepName: "Transactions - Source Consolidation",
    stepNumber: 1,
    sourceTable: "bronze.money_transaction + bronze.ach_transaction + bronze.wire_transfer_transaction",
    targetTable: "silver.transactions_consolidated (Matillion: TRX_CONSOL)",
    transformationType: "CLEANSE",
    refreshFrequency: "REAL_TIME",
    incrementalCapability: true,
    estimatedDuration: "5-15 minutes",
    dependencies: [],
    errorHandling:
      "Source mapping errors (unmapped codes): log transaction_id, source system, code value. Apply fallback categorization to 'OTHER'. Escalate to data steward for mapping update. Maintain mapping change log.",
    description:
      "Consolidate transaction data from 3 sources: FIS deposit (money_transaction), ACH (ach_transaction), Wire (wire_transfer). Standardize transaction codes across sources to common types: CHECK, ACH, WIRE, TRANSFER, ATM, DEBIT_CARD, DEPOSIT, INTEREST, FEE, ADJUSTMENT.",
  },
  {
    stepName: "Transactions - Type Categorization",
    stepNumber: 2,
    sourceTable: "silver.transactions_consolidated",
    targetTable: "silver.transactions_categorized (Matillion: TRX_CATEG)",
    transformationType: "ENRICH",
    refreshFrequency: "REAL_TIME",
    incrementalCapability: true,
    estimatedDuration: "5-10 minutes",
    dependencies: ["Transactions - Source Consolidation"],
    errorHandling:
      "Categorization edge cases (ambiguous transactions): log transaction_id and classification candidates, apply highest-priority rule, mark for manual review. Notify analytics team of pattern.",
    description:
      "Apply hierarchical transaction type rules: CHECK (transaction_code like CHK), ACH (source=ACH_TRANSACTION), WIRE (source=WIRE), etc. Derive category (OUTGOING for debits, INCOMING for credits, INTERNAL for transfers). Derive channel (TELLER, ATM, ONLINE, MOBILE, ACH, WIRE).",
  },
  {
    stepName: "Transactions - Counterparty Enrichment",
    stepNumber: 3,
    sourceTable: "silver.transactions_categorized + bronze.ach_transaction",
    targetTable: "silver.transactions_enriched_counterparty (Matillion: TRX_CPTY)",
    transformationType: "ENRICH",
    refreshFrequency: "REAL_TIME",
    incrementalCapability: true,
    estimatedDuration: "10-20 minutes",
    dependencies: ["Transactions - Type Categorization"],
    errorHandling:
      "Counterparty lookup failures (routing unknown): log transaction_id, routing_number, account. Use masked counterparty name (e.g., 'EXTERNAL BANK XXXXX'). Enable manual enrichment queue. Implement retry for known routing numbers.",
    description:
      "Identify counterparty from ACH routing number and account number. Classify: INTERNAL (routing matches own bank routing 123456789), EXTERNAL (unknown routing), BENEFICIARY (pre-enrolled). Tokenize external account numbers. Lookup counterparty names from ACH originator/receiver fields.",
  },
  {
    stepName: "Transactions - Compliance & Screening",
    stepNumber: 4,
    sourceTable: "silver.transactions_enriched_counterparty + OFAC API + AML rules",
    targetTable: "silver.transactions_compliance_screened (Matillion: TRX_COMPLY)",
    transformationType: "ENRICH",
    refreshFrequency: "REAL_TIME",
    incrementalCapability: true,
    estimatedDuration: "20-60 minutes",
    dependencies: ["Transactions - Counterparty Enrichment"],
    errorHandling:
      "OFAC screening API failures: hold transaction (set status=HELD_COMPLIANCE_REVIEW), log error with transaction_id and API error code, alert compliance team immediately. Implement exponential backoff retry (max 3 attempts). Escalate to manual review after retries exhausted.",
    description:
      "Call OFAC API for all transactions >= $10,000 AND international OR new counterparty. Flag if counterparty name matches OFAC SDN list (PASS/FAIL/REVIEW). Evaluate AML rules: amount > threshold, velocity (transactions/hour) exceeds limit, new counterparty, country risk. Calculate ctc_reportable (TRUE if amount >= $10K AND not exempt). Set OFAC screening status (PASS, FAIL, REVIEW).",
  },
  {
    stepName: "Transactions - Fraud Detection Scoring",
    stepNumber: 5,
    sourceTable: "silver.transactions_compliance_screened + fraud ML model + historical data",
    targetTable: "silver.transactions_fraud_scored (Matillion: TRX_FRAUD)",
    transformationType: "ENRICH",
    refreshFrequency: "REAL_TIME",
    incrementalCapability: true,
    estimatedDuration: "10-30 minutes",
    dependencies: ["Transactions - Compliance & Screening"],
    errorHandling:
      "ML scoring API failures: use baseline fraud_risk_score = 50, log error with transaction_id and model error details, mark is_suspicious=TRUE for manual review. Implement retry with exponential backoff. Alert fraud team of model failures.",
    description:
      "Call fraud detection ML model with features: amount, merchant_category, time_of_day, customer_velocity, new_counterparty, geographic_anomaly, account_tenure. Return fraud_risk_score (0-100, higher=riskier). Apply fraud rules: unusual_amount (top 5% of account), high_velocity (>50 txns/hour), new_counterparty (opened in last 30 days), is_suspicious=(fraud_risk_score>70 OR rule_hits>0).",
  },
  {
    stepName: "Transactions - Balance Impact Calculation",
    stepNumber: 6,
    sourceTable: "silver.transactions_fraud_scored + silver.deposit_balances_daily",
    targetTable: "silver.transactions_detail_enriched (Matillion: TRX_FINAL)",
    transformationType: "ENRICH",
    refreshFrequency: "REAL_TIME (intra-day), reconciled DAILY",
    incrementalCapability: true,
    estimatedDuration: "15-30 minutes",
    dependencies: ["Transactions - Fraud Detection Scoring", "Deposit Balances - Daily Snapshot"],
    errorHandling:
      "Balance calculation errors (balance_after != balance_before + signed_amount): log discrepancy with transaction_id, calculated vs expected balance, percentage variance. Flag for reconciliation. Use previous balance as fallback for downstream calculations.",
    description:
      "Calculate balance_before (opening balance from daily snapshot at transaction time, OR from previous transaction in sequence). Calculate signed_amount = CASE WHEN debit_or_credit='D' THEN -transaction_amount ELSE transaction_amount END. Calculate balance_after = balance_before + signed_amount. Detect overdraft (balance_after < 0 AND balance_before >= 0). Verify daily reconciliation: SUM(signed_amount for day) = daily_closing_balance - daily_opening_balance (tolerance ±0.01).",
  },
  {
    stepName: "Transactions - Daily Aggregates",
    stepNumber: 7,
    sourceTable: "silver.transactions_detail_enriched",
    targetTable: "silver.transaction_daily_aggregates (Matillion: TRX_DAILY_AGG)",
    transformationType: "AGGREGATE",
    refreshFrequency: "DAILY (03:00 UTC after EOD)",
    incrementalCapability: true,
    estimatedDuration: "10-20 minutes",
    dependencies: ["Transactions - Balance Impact Calculation"],
    errorHandling:
      "Aggregation errors (COUNT/SUM mismatches): log discrepancy with account_id, transaction_date, rule_id. Alert and use previous day as fallback. Trigger manual reconciliation meeting.",
    description:
      "Group by (account_id, transaction_date, transaction_type_standard). Aggregate: COUNT(transaction_id) as total_transactions, SUM(CASE WHEN debit='D' THEN 1 END) as debit_count, SUM(transaction_amount) as total_amount by direction, AVG(transaction_amount), MIN/MAX amounts, COUNT(CASE WHEN is_suspicious THEN 1 END) as high_risk_count, COUNT(CASE WHEN aml_alert THEN 1 END) as aml_alerts. Enable trend analysis and daily monitoring.",
  },
  {
    stepName: "Transactions - Monthly Counterparty Summary",
    stepNumber: 8,
    sourceTable: "silver.transactions_detail_enriched",
    targetTable: "silver.transaction_counterparty_summary (Matillion: TRX_CPTY_MTH)",
    transformationType: "AGGREGATE",
    refreshFrequency: "DAILY (03:30 UTC, covers previous month + current MTD)",
    incrementalCapability: true,
    estimatedDuration: "15-30 minutes",
    dependencies: ["Transactions - Balance Impact Calculation"],
    errorHandling:
      "Summary calculation errors (missing counterparties, count mismatches): log with summary_month, counterparty_name. Use previous month data as fallback. Implement manual data quality check.",
    description:
      "Group by (account_id, YEAR_MONTH(transaction_date), counterparty_name, counterparty_type). Aggregate: COUNT(transaction_id), SUM(ABS(signed_amount)) total_amount, SUM(CASE WHEN debit THEN ABS(signed_amount) ELSE 0 END) as outgoing, SUM(CASE WHEN credit THEN ABS(signed_amount) ELSE 0 END) as incoming, MIN(transaction_date) as first_txn_date, MAX(transaction_date) as last_txn_date, COUNT(CASE WHEN aml_alert THEN 1 END) as aml_alerts, is_new_counterparty=(DATEDIFF(month, first_txn_date, summary_month) <= 1).",
  },
];

export const transactionsIngestionSpecification: IngestionSpecification = {
  domain: "Transactions",
  sourceTables: [
    "bronze.money_transaction",
    "bronze.ach_transaction",
    "bronze.wire_transfer_transaction",
  ],
  silverTargetTables: [
    "silver.transaction_detail_enriched",
    "silver.transaction_daily_aggregates",
    "silver.transaction_counterparty_summary",
  ],
  refreshSchedule: "Real-time ingestion with daily batch aggregations at 03:00 UTC",
  incrementalStrategy: "Event-driven for detail (streaming), daily incremental for aggregations",
  scd2Tracking: false,
  deduplicationMethod: "None (transaction_id is unique identifier)",
  encryptionFields: ["counterparty_account (Tokenization)"],
  dataValidationRules: [
    "transaction_id: NOT NULL, unique",
    "transaction_amount: > 0, DECIMAL(18,2)",
    "debit_or_credit: IN (D, C)",
    "transaction_date: <= CURRENT_DATE()",
    "transaction_status: IN (POSTED, PENDING, REVERSED, FAILED, REJECTED)",
    "account_id: NOT NULL, references deposit_account_master",
    "balance_after: balance_before + signed_amount",
    "fraud_risk_score: 0-100 or NULL",
  ],
  reconciliationApproach:
    "Daily transaction count by type, amount totals by account, balance reconciliation (sum(signed_amount) = balance_after - balance_before), high-value transaction verification",
};

// ============================================================================
// SILVER LAYER INGESTION PATTERNS
// ============================================================================

export interface SilverIngestionPattern {
  patternName: string;
  applicableTo: string[];
  refreshFrequency: string;
  incrementalApproach: string;
  parallelization: string;
  errorRecovery: string;
  monitoring: string[];
}

export const scd2ImplementationPattern: SilverIngestionPattern = {
  patternName: "SCD Type 2 - Slowly Changing Dimensions",
  applicableTo: ["Customer Master", "Deposit Account Master"],
  refreshFrequency: "Daily",
  incrementalApproach:
    "Detect changes via source hash or LAST_MODIFIED_DATE. For new customers: insert new record with is_current=true. For changed customers: expire old (set expiration_date=yesterday, is_current=false), insert new (set effective_date=today, is_current=true). Track changed_attributes.",
  parallelization:
    "Partition by business key (customer_id, account_id). Run 4-8 parallel streams processing different key ranges.",
  errorRecovery:
    "On failure: rollback transaction, log error with business key, retry with exponential backoff (max 3 attempts). Alert to data engineering if final retry fails.",
  monitoring: [
    "Record count: new vs changed vs unchanged",
    "Processing time",
    "Error rate (failed keys)",
    "Expired vs current record ratio",
    "Avg effective_date - previous expiration_date delta",
  ],
};

export const deduplicationPattern: SilverIngestionPattern = {
  patternName: "Deduplication & MDM Matching",
  applicableTo: ["Customer Master"],
  refreshFrequency: "Daily",
  incrementalApproach:
    "Full deduplication (cannot be incremental due to match dependencies). Load all bronze records. Apply matching rules (SSN_HASH + name + DOB + address). For duplicate groups: apply survivorship rules, select winner, flag losers.",
  parallelization:
    "Partition by first char of name (A-Z). Run 26 parallel jobs. Final consolidation in single-threaded merge.",
  errorRecovery:
    "Matching conflicts (equal confidence): create exception record for manual review. Escalate to data steward. Do not auto-select.",
  monitoring: [
    "Total input records",
    "Deduplicated records output",
    "Dedup ratio (input/output)",
    "Match confidence distribution",
    "Exception rate (manual review needed)",
  ],
};

export const encryptionPattern: SilverIngestionPattern = {
  patternName: "PII Encryption & Tokenization",
  applicableTo: ["Customer Master", "Transaction Detail"],
  refreshFrequency: "Daily (before other transformations)",
  incrementalApproach:
    "Encrypt all PII fields on ingestion. SHA256 for hashes (SSN). AES-256 with KMS rotation for sensitive strings. Tokenize via external tokenization service. Maintain token-to-value mapping (encrypted, in secure store).",
  parallelization:
    "Partition by row ID. Run 10-16 parallel encryption streams. Call tokenization service in batches.",
  errorRecovery:
    "Encryption failure: log error code, reject row, store unencrypted original in secure archive for retry. Alert security team. Do not allow unencrypted data in Silver.",
  monitoring: [
    "Encryption success rate",
    "Tokenization API latency",
    "Failed encryptions (by field)",
    "Key rotation audit log",
    "Decrypt access logs (for audit)",
  ],
};

export const realTimeTransactionPattern: SilverIngestionPattern = {
  patternName: "Real-Time Transaction Processing",
  applicableTo: ["Transaction Detail Enriched"],
  refreshFrequency: "Real-time (event-driven)",
  incrementalApproach:
    "Event streaming from FIS transaction source (Kafka/Pub-Sub). Process each transaction: standardize, categorize, enrich counterparty, compliance screening, fraud score. Insert into silver with 5-10 second latency target.",
  parallelization:
    "Partition topic by account_id (1000s of partitions). Process in parallel, order guaranteed per partition.",
  errorRecovery:
    "On processing failure: move to dead-letter queue, log error with transaction_id. Retry with exponential backoff. Manual review and replay after failure fixed.",
  monitoring: [
    "End-to-end latency (source to silver)",
    "Throughput (txns/sec)",
    "Error rate",
    "Dead-letter queue size",
    "Processing lag (for recovery)",
  ],
};

export const batchAggregationPattern: SilverIngestionPattern = {
  patternName: "Daily Batch Aggregations",
  applicableTo: ["Transaction Daily Aggregates", "Counterparty Summary"],
  refreshFrequency: "Daily (early morning, after transaction detail loaded)",
  incrementalApproach:
    "Full recalculation of previous day's transactions. Group by (account_id, transaction_date, transaction_type). Aggregate counts, amounts, risk metrics.",
    parallelization:
    "Partition by account_id. Process 10,000 accounts per parallel job.",
  errorRecovery:
    "Aggregation failure: use previous day's numbers as fallback. Log failure and alert. Manual reconciliation in morning meeting.",
  monitoring: [
    "Total aggregates created",
    "Processing time",
    "Row count changes (detect data quality issues)",
    "Amount totals reconciliation",
  ],
};

export const allIngestionPatterns: SilverIngestionPattern[] = [
  scd2ImplementationPattern,
  deduplicationPattern,
  encryptionPattern,
  realTimeTransactionPattern,
  batchAggregationPattern,
];

// ============================================================================
// SILVER LAYER INGESTION SUMMARY
// ============================================================================

export const silverLayerIngestionSummary = {
  totalDomains: 3,
  totalSourceTables: 12,
  totalSilverTables: 9,
  ingestionPatterns: 5,
  transformationSteps: 19,
  
  domainSpecifications: {
    Customer: customerIngestionSpecification,
    Deposits: depositsIngestionSpecification,
    Transactions: transactionsIngestionSpecification,
  },
  
  transformationSteps: {
    Customer: customerDomainTransformationSteps,
    Deposits: depositsDomainTransformationSteps,
    Transactions: transactionsDomainTransformationSteps,
  },
  
  ingestionPatterns: allIngestionPatterns,

  estimatedTotalProcessingTime: {
    customerDomain: "45-90 minutes",
    depositsDomain: "30-60 minutes",
    transactionsDomain: "Real-time (detail) + 25-50 minutes (aggregates)",
  },

  refreshSchedule: {
    description: "Orchestrated daily pipeline in UTC timezone",
    sequence: [
      "00:30 UTC - FIS EOD feed arrival (complete)",
      "01:00 UTC - Customer domain ingestion starts",
      "02:00 UTC - Deposits domain ingestion starts",
      "02:30 UTC - Transactions real-time streaming starts (continuous)",
      "03:00 UTC - Daily aggregation batch starts",
      "04:00 UTC - All Silver layer updates complete, ready for Gold layer",
      "04:30 UTC - Gold layer aggregations and metrics calculation",
    ],
  },

  dataGovernance: {
    qualityTargets: {
      completeness: "95%+ non-null in key fields",
      accuracy: "99%+ validation rule pass rate",
      timeliness: "< 4 hour latency from bronze to silver",
      consistency: "100% reconciliation to bronze totals (within 0.01%)",
    },

    auditRequirements: {
      allTransformations: "Log every transformation with timestamp, counts, errors",
      piiHandling: "Encrypt all audit logs containing lineage info",
      changeMgmt: "Track schema changes, transformation logic changes with versions",
      compliance: "GDPR/CCPA audit logs for PII access, retention policies enforced",
    },

    sla: {
      customerMaster: "99.9% availability, 4 hour RTO, 1 hour RPO",
      depositAccounts: "99.95% availability, 2 hour RTO, 1 hour RPO",
      transactions: "99.99% availability, 15 min RTO, real-time RPO",
    },
  },

  description:
    "Comprehensive Silver Layer transformation and ingestion specifications for Customer, Deposits, and Transactions domains with full details on ETL patterns, scheduling, error handling, and reconciliation",
};

export default silverLayerIngestionSummary;
