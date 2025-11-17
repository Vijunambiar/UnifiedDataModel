/**
 * TRANSACTIONS DOMAIN - BRONZE LAYER - INGESTION JOBS
 *
 * Data ingestion job specifications from FIS-ADS to Bronze layer
 * Source System: FIS-ADS (Fiserv Core Banking)
 * Target: Snowflake Bronze Layer
 * Orchestration: Matillion / dbt / Airflow
 */

export interface IngestionJob {
  jobId: string;
  jobName: string;
  sourceSystem: string;
  sourceTable: string;
  sourceSchema: string;
  targetTable: string;
  targetSchema: string;
  schedule: IngestionSchedule;
  loadStrategy: "FULL_LOAD" | "INCREMENTAL" | "CDC" | "SNAPSHOT";
  extractionMethod: "SQL_QUERY" | "FILE_EXPORT" | "API" | "KAFKA_STREAM";
  transformations: string[];
  dataQualityChecks: string[];
  errorHandling: ErrorHandling;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface IngestionSchedule {
  frequency: "REAL_TIME" | "HOURLY" | "DAILY" | "WEEKLY";
  time?: string;
  timezone: string;
  dependencies: string[];
}

export interface ErrorHandling {
  onFailure: "ABORT" | "CONTINUE" | "RETRY";
  maxRetries: number;
  errorTable: string;
  alertRecipients: string[];
}

// ============================================================================
// MONEY TRANSACTION INGESTION JOB
// ============================================================================
export const moneyTransactionIngestionJob: IngestionJob = {
  jobId: "FIS_MONEY_TXN_001",
  jobName: "Ingest Money Transactions from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "DP_OZO_MNY_TXN_ARD",
  sourceSchema: "FIS_CORE",
  targetTable: "money_transaction",
  targetSchema: "bronze",

  schedule: {
    frequency: "REAL_TIME",
    timezone: "UTC",
    dependencies: [],
  },

  loadStrategy: "CDC",
  extractionMethod: "KAFKA_STREAM",

  transformations: [
    "Rename columns from FIS naming convention to standardized names",
    "Cast data types to target schema (VARCHAR, DECIMAL, DATE, TIMESTAMP)",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH using MD5 of all source columns for change detection",
    "Map transaction codes to business-friendly descriptions",
    "Standardize transaction type (DEBIT/CREDIT) values",
    "Set TRANSACTION_STATUS to one of (POSTED, PENDING, REVERSED, FAILED)",
    "Extract transaction amount as DECIMAL(15,2) with proper precision",
    "Handle NULL values for optional transaction description fields",
    "Validate transaction dates fall within business operating period",
    "Enrich with account reference information if applicable",
  ],

  dataQualityChecks: [
    "TRANSACTION_ID must not be NULL",
    "TRANSACTION_ID must be unique per PROCESS_DATE",
    "ACCOUNT_NUMBER must not be NULL",
    "ACCOUNT_NUMBER must be valid account number format",
    "TRANSACTION_DATE must not be NULL and must be <= PROCESS_DATE",
    "TRANSACTION_CODE must not be NULL and must be valid FIS code",
    "TRANSACTION_AMOUNT must be a valid DECIMAL(15,2)",
    "TRANSACTION_AMOUNT must be > 0",
    "TRANSACTION_TYPE must be in ('DEBIT', 'CREDIT')",
    "TRANSACTION_STATUS must be in ('POSTED', 'PENDING', 'REVERSED', 'FAILED')",
    "PROCESS_DATE must not be NULL and must be <= current date",
    "Row count must match source stream records within tolerance",
    "No duplicate TRANSACTION_IDs in single load window",
    "REFRESH_TIME must be populated and valid timestamp",
    "FTM_GROUP_ID must be valid if populated",
  ],

  errorHandling: {
    onFailure: "CONTINUE",
    maxRetries: 5,
    errorTable: "bronze.money_transaction_load_errors",
    alertRecipients: [
      "data-engineering@bank.com",
      "transactions-ops@bank.com",
      "compliance@bank.com",
    ],
  },

  priority: "HIGH",
};

// ============================================================================
// MAINTENANCE LOG TRANSACTION INGESTION JOB
// ============================================================================
export const maintenanceLogTransactionIngestionJob: IngestionJob = {
  jobId: "FIS_MAINT_LOG_TXN_002",
  jobName: "Ingest Maintenance Log Transactions from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_DP_OZU_MAINT_ARD",
  sourceSchema: "FIS_CORE",
  targetTable: "maintenance_log_transaction",
  targetSchema: "bronze",

  schedule: {
    frequency: "HOURLY",
    timezone: "UTC",
    dependencies: [],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns from FIS naming convention to standardized names",
    "Cast data types to target schema (VARCHAR, DECIMAL, DATE, TIMESTAMP)",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH for change detection",
    "Map transaction codes to maintenance type (HOLD, STOP_PAYMENT, SUSPENSION, KEYWORD_CHANGE)",
    "Standardize hold types (LEGAL, LEVY, NSF, GARNISHMENT, SUSPENSION, OTHER)",
    "Standardize stop payment types (SINGLE_CHECK, CHECK_RANGE, ALL_CHECKS, AMOUNT_LIMIT)",
    "Extract and validate hold details (type, amount, expiration)",
    "Extract and validate stop payment details (type, amount, serial numbers)",
    "Map keyword changes with old and new values",
    "Validate date sequences (entry date < expiration date)",
    "Partition by transaction date for performance",
  ],

  dataQualityChecks: [
    "TRANSACTION_ID must not be NULL",
    "TRANSACTION_ID must be unique per TRANSACTION_DATE",
    "ACCOUNT_NUMBER must not be NULL",
    "ACCOUNT_NUMBER must be valid account number format",
    "BANK_NUMBER must not be NULL",
    "TRANSACTION_CODE must not be NULL and must be valid",
    "HOLD_TYPE must be valid if populated (LEGAL, LEVY, NSF, GARNISHMENT, SUSPENSION, OTHER)",
    "HOLD_AMOUNT must be > 0 if populated",
    "HOLD_EXPIRATION_DATE must be >= HOLD_ENTRY_DATE if both populated",
    "STOP_PAYMENT_TYPE must be valid if populated",
    "STOP_AMOUNT must be > 0 if populated",
    "CHECK_SERIAL_NUMBER format must be valid if populated",
    "CHECK_END_SERIAL_NUMBER must be >= CHECK_SERIAL_NUMBER if both populated",
    "STOP_EXPIRATION_DATE must be >= STOP_ENTERED_DATE if both populated",
    "KEYWORD_DESCRIPTION must not be empty if keyword change transaction",
    "At least one of (HOLD_ID, STOP_PAYMENT_ID) must be populated",
    "TRANSACTION_DATE must not be in future",
    "Row count must match expected load for time period",
    "REFRESH_TIME must be valid timestamp",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.maintenance_log_transaction_load_errors",
    alertRecipients: [
      "data-engineering@bank.com",
      "transactions-ops@bank.com",
      "compliance@bank.com",
    ],
  },

  priority: "HIGH",
};

// ============================================================================
// STOP PAYMENT DETAILS INGESTION JOB
// ============================================================================
export const stopPaymentDetailsIngestionJob: IngestionJob = {
  jobId: "FIS_STOP_PAYMENT_003",
  jobName: "Ingest Stop Payment Details from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_DP_OZQ_STP_ARD",
  sourceSchema: "FIS_CORE",
  targetTable: "stop_payment_details",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "03:30",
    timezone: "UTC",
    dependencies: ["FIS_MAINT_LOG_TXN_002"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns from FIS naming convention to standardized names",
    "Cast data types to target schema (VARCHAR, DECIMAL, DATE, TIMESTAMP)",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH for SCD Type 2 tracking",
    "Validate stop payment amounts are positive decimals",
    "Handle check serial number ranges (single vs range stops)",
    "Standardize date handling (entered date, expiration date)",
    "Link to account master for validation",
    "Identify expired stops vs active stops",
  ],

  dataQualityChecks: [
    "STOP_PAYMENT_ID must not be NULL",
    "STOP_PAYMENT_ID must be unique",
    "ACCOUNT_NUMBER must not be NULL",
    "ACCOUNT_NUMBER must exist in deposit account master",
    "STOP_AMOUNT must not be NULL and must be > 0",
    "CHECK_SERIAL_NUMBER must match check serial number format if populated",
    "CHECK_END_SERIAL_NUMBER must be >= CHECK_SERIAL_NUMBER if both populated",
    "STOP_ENTERED_DATE must not be NULL and not in future",
    "STOP_EXPIRATION_DATE must be > STOP_ENTERED_DATE if populated",
    "For expired stops, STOP_EXPIRATION_DATE must be <= current date",
    "No duplicate stop payment IDs in single load",
    "Row count variance must be < 5% vs previous load",
    "REFRESH_TIME must be valid timestamp",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.stop_payment_details_load_errors",
    alertRecipients: [
      "data-engineering@bank.com",
      "transactions-ops@bank.com",
      "compliance@bank.com",
    ],
  },

  priority: "HIGH",
};

// ============================================================================
// HOLD TRANSACTION DETAILS INGESTION JOB
// ============================================================================
export const holdTransactionDetailsIngestionJob: IngestionJob = {
  jobId: "FIS_HOLD_DETAILS_004",
  jobName: "Ingest Hold Transaction Details from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_DP_OZV_HLD_ARD",
  sourceSchema: "FIS_CORE",
  targetTable: "hold_transaction_details",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "04:00",
    timezone: "UTC",
    dependencies: ["FIS_MAINT_LOG_TXN_002"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns from FIS naming convention to standardized names",
    "Cast data types to target schema (VARCHAR, DECIMAL, DATE, TIMESTAMP)",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH for SCD Type 2 tracking",
    "Standardize hold types (LEGAL, LEVY, NSF, GARNISHMENT, SUSPENSION, OTHER)",
    "Validate hold amounts are positive decimals with proper precision",
    "Map hold reason codes to business-friendly descriptions",
    "Handle NULL values for expiration dates (open-ended holds)",
    "Identify expired vs active holds based on expiration date",
    "Link to account master for validation",
    "Partition by hold type for analytics efficiency",
  ],

  dataQualityChecks: [
    "HOLD_ID must not be NULL",
    "HOLD_ID must be unique",
    "ACCOUNT_NUMBER must not be NULL",
    "ACCOUNT_NUMBER must exist in deposit account master",
    "HOLD_AMOUNT must not be NULL and must be > 0",
    "HOLD_TYPE must not be NULL and must be valid code",
    "HOLD_TYPE must be in ('LEGAL', 'LEVY', 'NSF', 'GARNISHMENT', 'SUSPENSION', 'OTHER')",
    "HOLD_REASON must not exceed 100 characters if populated",
    "HOLD_ENTERED_DATE must not be NULL and not in future",
    "HOLD_EXPIRATION_DATE must be > HOLD_ENTERED_DATE if populated",
    "For expired holds, HOLD_EXPIRATION_DATE must be <= current date",
    "No duplicate hold IDs in single load",
    "Active holds (not expired) must have valid reason",
    "Row count variance must be < 10% vs previous load",
    "REFRESH_TIME must be valid timestamp",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.hold_transaction_details_load_errors",
    alertRecipients: [
      "data-engineering@bank.com",
      "transactions-ops@bank.com",
      "compliance@bank.com",
    ],
  },

  priority: "HIGH",
};

// ============================================================================
// TRANSACTIONS BRONZE INGESTION CATALOG
// ============================================================================
export const transactionsBronzeIngestionCatalog = {
  domain: "transactions",
  layer: "Bronze",
  sourceSystem: "FIS-ADS",
  targetSchema: "bronze",

  jobs: [
    moneyTransactionIngestionJob,
    maintenanceLogTransactionIngestionJob,
    stopPaymentDetailsIngestionJob,
    holdTransactionDetailsIngestionJob,
  ],

  totalJobs: 4,

  orchestration: {
    tool: "Matillion ETL / Apache Airflow",
    dagName: "transactions_bronze_continuous_load",
    schedule: "Real-time (Money Transactions) + Hourly + Daily for maintenance",
    sla: "Money transactions processed within 15 minutes of FIS posting",
    retryPolicy: "Exponential backoff, max 3-5 retries depending on job type",
    alerting:
      "Email + PagerDuty for HIGH priority failures, Email only for MEDIUM",
  },

  dependencies: {
    upstream: [
      "FIS-ADS data export completion",
      "FIS Kafka stream availability",
      "FIS API availability",
    ],
    downstream: [
      "Silver layer transaction transformation jobs",
      "Gold layer transaction aggregations",
      "Real-time transaction analytics",
      "Compliance and fraud detection pipelines",
    ],
  },

  monitoring: {
    metrics: [
      "Row counts (source vs target) per job",
      "Real-time message lag (for Kafka streams)",
      "Data quality check failures per table",
      "Load latency (extraction to target)",
      "Error table counts and error categories",
      "Hash collision detection for change tracking",
      "Hold and stop payment expiration tracking",
      "Transaction status distribution (POSTED vs PENDING vs REVERSED)",
    ],
    dashboard: "Transactions Bronze Layer - Continuous Load Monitoring",
    slaMetrics: [
      "Job completion time vs SLA",
      "Data freshness (age of most recent load)",
      "DQ check pass rate",
      "Stream processing lag (P50, P95, P99)",
    ],
  },

  dataLineage: {
    source: "FIS-ADS Core Banking System (Fiserv)",
    sourceConnection:
      "Kafka streams for real-time transactions, JDBC for historical and maintenance data",
    extraction:
      "Kafka streaming for money transactions, SQL query extraction for incremental loads based on PRCS_DTE and REFRESH_TIME",
    landing:
      "Snowflake landing zone (staging) with CDC tracking and stream buffering",
    target:
      "Snowflake bronze schema with partitioning by TRANSACTION_DATE/PROCESS_DATE",
    transformation:
      "Minimal transformations - column rename, type casting, audit columns, record hashing",
    dataQuality:
      "Validation rules enforced at load time, error records routed to error tables with detailed error reporting",
  },

  transformationLogic: {
    columnRenaming:
      "FIS naming convention to standardized names (e.g., TRN_TRANS_TME_SEQ → TRANSACTION_ID)",
    typeConversion:
      "Proper casting to Snowflake types (DECIMAL for money, DATE for dates, VARCHAR for text, TIMESTAMP_NTZ for timestamps)",
    auditColumns:
      "_LOAD_ID (batch ID), _LOAD_TIMESTAMP (load time), _SOURCE_SYSTEM (FIS-ADS), _RECORD_HASH (MD5)",
    partitioning:
      "By TRANSACTION_DATE/PROCESS_DATE for most tables, enables efficient querying and incremental loads",
    clustering:
      "By ACCOUNT_NUMBER and TRANSACTION_CODE for query performance on transaction lookups",
  },

  estimatedDataVolumes: {
    moneyTransaction: "500M+ transactions/month",
    maintenanceLogTransaction: "50M+ transactions/month",
    stopPaymentDetails: "10-20M records",
    holdTransactionDetails: "20-50M records",
  },

  estimatedLoadTimes: {
    totalLoadWindow:
      "Real-time streaming for transactions + 2 hours batch for maintenance",
    moneyTransaction: "Real-time (< 15 minutes latency)",
    maintenanceLogTransaction: "60 minutes (hourly increments)",
    stopPaymentDetails: "45 minutes",
    holdTransactionDetails: "50 minutes",
  },

  dataGovernance: {
    pii: [
      "Transaction descriptions may contain account holder names - mask in silver layer",
      "Hold reason codes may contain personal information - restrict access",
    ],
    compliance: [
      "AML/CFT monitoring - flagged transactions routed to compliance queue",
      "Fraud detection - hold and stop payment patterns tracked",
      "Regulatory reporting - transaction records retained per regulatory requirements",
      "SOX compliance - audit trail maintained for all transactions",
    ],
    sensitiveFields: ["ACCOUNT_NUMBER (PII)", "TRANSACTION_DESCRIPTION (PII)"],
  },
};

export default transactionsBronzeIngestionCatalog;
