/**
 * DEPOSITS DOMAIN - BRONZE LAYER - INGESTION JOBS
 *
 * Data ingestion job specifications from FIS to Bronze layer
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
// DEPOSIT ACCOUNT MASTER INGESTION JOB
// ============================================================================
export const depositAccountMasterIngestionJob: IngestionJob = {
  jobId: "FIS_ACCT_MASTER_001",
  jobName: "Ingest Deposit Account Master from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_DP_OZZ_ACCT_ARD",
  sourceSchema: "FIS_CORE",
  targetTable: "deposit_account_master",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "02:30",
    timezone: "UTC",
    dependencies: [],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns from FIS naming convention to standardized names",
    "Cast data types to target schema (VARCHAR, DECIMAL, DATE, TIMESTAMP)",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH using MD5 of all source columns for change detection",
    "Set PROCESS_DATE to current business date from PRCS_DTE",
    "Set IS_CURRENT = TRUE for active records",
    "Map FIS account status codes to business-friendly status values",
    "Extract interest rate as DECIMAL(8,6) with proper precision",
    "Standardize fee amounts to DECIMAL(10,2)",
    "Handle NULL values for optional fields (close date, renewal code, etc)",
  ],

  dataQualityChecks: [
    "ACCOUNT_NUMBER must not be NULL",
    "ACCOUNT_NUMBER must be unique per PROCESS_DATE",
    "BANK_NUMBER must not be NULL",
    "BRANCH_NUMBER must not be NULL and must be valid",
    "ACCOUNT_TYPE must be in valid FIS code list",
    "ACCOUNT_NAME must not be NULL and not exceed 100 characters",
    "ACCOUNT_OPEN_DATE must not be NULL and must be <= PROCESS_DATE",
    "ACCOUNT_CLOSE_DATE must be > ACCOUNT_OPEN_DATE if populated",
    "CURRENT_INTEREST_RATE must be between 0 and 100 if populated",
    "MONTHLY_FEE_AMOUNT must be >= 0 if populated",
    "Row count must match source extract count",
    "No duplicate ACCOUNT_NUMBERs in single load",
    "REFRESH_TIME must be populated and valid timestamp",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.deposit_account_master_load_errors",
    alertRecipients: ["data-engineering@bank.com", "deposits-ops@bank.com"],
  },

  priority: "HIGH",
};

// ============================================================================
// DEPOSIT ACCOUNT BALANCE INGESTION JOB
// ============================================================================
export const depositAccountBalanceIngestionJob: IngestionJob = {
  jobId: "FIS_ACCT_BALANCE_002",
  jobName: "Ingest Deposit Account Balances from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_DP_OZX_BAL_ARD",
  sourceSchema: "FIS_CORE",
  targetTable: "account_balance",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "03:00",
    timezone: "UTC",
    dependencies: ["FIS_ACCT_MASTER_001"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming convention",
    "Cast balance amounts to DECIMAL(18,2) for proper financial precision",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH for change detection",
    "Map balance date from PRCS_DTE",
    "Separate current balance, available balance, and pending amounts",
    "Null out pending credits/debits if not applicable",
    "Validate service charge code against reference tables",
  ],

  dataQualityChecks: [
    "ACCOUNT_NUMBER must not be NULL",
    "BALANCE_DATE must not be NULL and must be <= current date",
    "CURRENT_BALANCE must be a valid DECIMAL(18,2)",
    "AVAILABLE_BALANCE must be <= CURRENT_BALANCE",
    "AVAILABLE_BALANCE must be >= 0",
    "PENDING_DEBIT_AMOUNT must be >= 0 if populated",
    "PENDING_CREDIT_AMOUNT must be >= 0 if populated",
    "Balance date must match business date logic",
    "No NULL values in primary balance fields",
    "SERVICE_CHARGE_CODE must be valid if provided",
    "Row count must match source extract for date range",
    "REFRESH_TIME must be valid and populated",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.account_balance_load_errors",
    alertRecipients: ["data-engineering@bank.com", "deposits-ops@bank.com"],
  },

  priority: "HIGH",
};

// ============================================================================
// DEPOSIT DAILY BALANCE FACT INGESTION JOB
// ============================================================================
export const depositDailyBalanceFactIngestionJob: IngestionJob = {
  jobId: "FIS_DAILY_BAL_FACT_003",
  jobName: "Ingest Deposit Daily Balance Facts from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_DP_SZ9_DP_ACCT_D_FACT",
  sourceSchema: "FIS_CORE",
  targetTable: "account_daily_balance_fact",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "03:30",
    timezone: "UTC",
    dependencies: ["FIS_ACCT_BALANCE_002"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming",
    "Cast all balance amounts to DECIMAL(18,6) for analytics precision",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH for change detection",
    "Map PRCS_DTE to both CALENDAR_DATE and BALANCE_DATE",
    "Calculate YTD and MTD balances from source columns",
    "Handle NULL values for prior day/month balances",
    "Convert interest paid amounts to proper decimals",
    "Calculate time deposit principal if applicable",
    "Partition by calendar date for performance",
  ],

  dataQualityChecks: [
    "ACCOUNT_NUMBER must not be NULL",
    "CALENDAR_DATE and BALANCE_DATE must match",
    "CALENDAR_DATE must not be in future",
    "CURRENT_BALANCE_AMOUNT must be valid DECIMAL(18,6)",
    "AVAILABLE_BALANCE_AMOUNT must be <= CURRENT_BALANCE_AMOUNT",
    "AVAILABLE_BALANCE_AMOUNT must be >= 0",
    "PREVIOUS_DAY_LEDGER_BALANCE must be >= 0 if populated",
    "AVERAGE_LEDGER_BALANCE_YTD must be >= 0 if populated",
    "INTEREST_PAID_YTD must be >= INTEREST_PAID_MTD if both populated",
    "Interest paid amounts must not decrease YTD",
    "No NULL values in primary balance amounts",
    "Row count must match expected daily loads",
    "REFRESH_TIME must be valid timestamp",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.account_daily_balance_fact_load_errors",
    alertRecipients: ["data-engineering@bank.com", "deposits-ops@bank.com"],
  },

  priority: "HIGH",
};

// ============================================================================
// DEPOSIT ACCOUNT MAINTENANCE TRANSACTION INGESTION JOB
// ============================================================================
export const depositAccountMaintenanceIngestionJob: IngestionJob = {
  jobId: "FIS_ACCT_MAINT_TRANS_004",
  jobName: "Ingest Account Maintenance Transactions from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_DP_OZU_MAINT_ARD",
  sourceSchema: "FIS_CORE",
  targetTable: "account_maintenance_transaction",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "04:00",
    timezone: "UTC",
    dependencies: ["FIS_ACCT_MASTER_001"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming convention",
    "Cast amounts to DECIMAL(15,2) for transaction precision",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH for change tracking",
    "Map PRCS_DTE to TRANSACTION_DATE",
    "Standardize transaction code mapping",
    "Extract hold details (type, amount, expiration, reason)",
    "Extract stop payment details (type, amount)",
    "Map keyword changes (old to new values)",
    "Handle time deposit specific fields",
  ],

  dataQualityChecks: [
    "TRANSACTION_ID must not be NULL and must be unique",
    "ACCOUNT_NUMBER must not be NULL",
    "BANK_NUMBER must not be NULL",
    "TRANSACTION_CODE must be valid FIS code",
    "TRANSACTION_CODE must not be NULL",
    "TRANSACTION_AMOUNT must be >= 0 if populated",
    "HOLD_TYPE must be in ('LEGAL', 'LEVY', 'NSF', 'OTHER') if populated",
    "HOLD_AMOUNT must be >= 0 if populated",
    "HOLD_EXPIRATION_DATE must be >= HOLD_ENTERED_DATE if both populated",
    "STOP_AMOUNT must be >= 0 if populated",
    "TRANSACTION_DATE must not be in future",
    "No duplicate TRANSACTION_IDs per day",
    "REFRESH_TIME must be valid timestamp",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.account_maintenance_transaction_load_errors",
    alertRecipients: [
      "data-engineering@bank.com",
      "deposits-ops@bank.com",
      "compliance@bank.com",
    ],
  },

  priority: "HIGH",
};

// ============================================================================
// DEPOSIT ACCOUNT PACKAGE INGESTION JOB
// ============================================================================
export const depositAccountPackageIngestionJob: IngestionJob = {
  jobId: "FIS_ACCT_PKG_005",
  jobName: "Ingest Account Package Enrollment from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_ACCT_PKG_ARD_RAW",
  sourceSchema: "FIS_CORE",
  targetTable: "account_package",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "04:30",
    timezone: "UTC",
    dependencies: ["FIS_ACCT_MASTER_001"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming convention",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH for SCD Type 2 tracking",
    "Map PRCS_DTE to PROCESS_DATE",
    "Standardize package names and descriptions",
    "Map tier names (Gold, Platinum, Standard, etc)",
    "Convert enrollment role code to standard values",
    "Map forced enrollment indicator (Y/N to boolean)",
    "Set effective date based on load timestamp",
  ],

  dataQualityChecks: [
    "ACCOUNT_NUMBER must not be NULL",
    "PACKAGE_ID must not be NULL",
    "PACKAGE_NAME must not be NULL",
    "TIER_ID must not be NULL or blank",
    "TIER_NAME must be valid (Gold, Platinum, Standard)",
    "ENROLLMENT_ROLE_CODE must be valid if populated",
    "FORCED_ENROLLMENT_IND must be in ('Y', 'N') if populated",
    "No duplicate (ACCOUNT_NUMBER, PACKAGE_ID) combinations per PROCESS_DATE",
    "PROCESS_DATE must not be in future",
    "Each account-package must have exactly one active record",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.account_package_load_errors",
    alertRecipients: ["data-engineering@bank.com", "deposits-ops@bank.com"],
  },

  priority: "MEDIUM",
};

// ============================================================================
// DEBIT CARD INGESTION JOB
// ============================================================================
export const depositDebitCardIngestionJob: IngestionJob = {
  jobId: "FIS_DEBIT_CARD_006",
  jobName: "Ingest Debit Card Information from FIS",
  sourceSystem: "FIS-ADS",
  sourceTable: "TB_DEBIT_CARD_RAW",
  sourceSchema: "FIS_CORE",
  targetTable: "debit_card",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "05:00",
    timezone: "UTC",
    dependencies: ["FIS_ACCT_MASTER_001"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming convention",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH for SCD Type 2 tracking",
    "Map PRCS_DTE to PROCESS_DATE",
    "Mask debit card number (keep last 4 digits only in bronze)",
    "Standardize card status values (ACTIVE, BLOCKED, EXPIRED, CLOSED)",
    "Map primary/secondary card indicator",
    "Validate card issue and expiration dates",
    "Partition by PROCESS_DATE for performance",
  ],

  dataQualityChecks: [
    "ACCOUNT_NUMBER must not be NULL",
    "DEBIT_CARD_NUMBER must not be NULL",
    "CARD_ISSUE_DATE must not be NULL",
    "CARD_EXPIRATION_DATE must not be NULL",
    "CARD_EXPIRATION_DATE must be >= CARD_ISSUE_DATE",
    "CARD_STATUS must be in ('ACTIVE', 'BLOCKED', 'EXPIRED', 'CLOSED')",
    "PRIMARY_SECONDARY_CODE must be in ('P', 'S') if populated",
    "CARD_ISSUE_DATE must not be in future",
    "CARD_EXPIRATION_DATE must not be in past for ACTIVE cards",
    "No duplicate card numbers per account",
    "Card number must be properly masked",
    "PROCESS_DATE must not be in future",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.debit_card_load_errors",
    alertRecipients: [
      "data-engineering@bank.com",
      "deposits-ops@bank.com",
      "security@bank.com",
    ],
  },

  priority: "MEDIUM",
};

// ============================================================================
// DEPOSITS BRONZE INGESTION CATALOG
// ============================================================================
export const depositsBronzeIngestionCatalog = {
  domain: "deposits",
  layer: "Bronze",
  sourceSystem: "FIS-ADS",
  targetSchema: "bronze",

  jobs: [
    depositAccountMasterIngestionJob,
    depositAccountBalanceIngestionJob,
    depositDailyBalanceFactIngestionJob,
    depositAccountMaintenanceIngestionJob,
    depositAccountPackageIngestionJob,
    depositDebitCardIngestionJob,
  ],

  totalJobs: 6,

  orchestration: {
    tool: "Matillion ETL / Apache Airflow",
    dagName: "deposits_bronze_daily_load",
    schedule: "Daily at 02:30 UTC",
    sla: "Complete by 06:00 UTC",
    retryPolicy: "Exponential backoff, max 3 retries per job",
    alerting:
      "Email + PagerDuty for HIGH priority failures, Email only for MEDIUM",
  },

  dependencies: {
    upstream: ["FIS-ADS data export completion", "FIS API availability"],
    downstream: [
      "Silver layer deposit transformation jobs",
      "Gold layer deposit aggregations",
      "Real-time balance analytics",
    ],
  },

  monitoring: {
    metrics: [
      "Row counts (source vs target) per job",
      "Data quality check failures per table",
      "Load latency (extraction to target)",
      "Error table counts and error categories",
      "Hash collision detection for SCD Type 2 tables",
      "Balance variance analysis (YTD consistency)",
    ],
    dashboard: "Deposits Bronze Layer - Daily Load Monitoring",
    slaMetrics: [
      "Job completion time vs SLA",
      "Data freshness (age of most recent load)",
      "DQ check pass rate",
    ],
  },

  dataLineage: {
    source: "FIS-ADS Core Banking System (Fiserv)",
    sourceConnection: "JDBC connection to FIS_CORE schema",
    extraction:
      "SQL query extraction with incremental loads based on PRCS_DTE and REFRESH_TIME",
    landing: "Snowflake landing zone (staging) with CDC tracking",
    target: "Snowflake bronze schema with partitioning by PROCESS_DATE",
    transformation:
      "Minimal transformations - column rename, type casting, audit columns, record hashing",
    dataQuality:
      "Validation rules enforced at load time, error records routed to error tables",
  },

  transformationLogic: {
    columnRenaming:
      "FIS naming convention to standardized names (e.g., AC_ACCT_NBR → ACCOUNT_NUMBER)",
    typeConversion:
      "Proper casting to Snowflake types (DECIMAL for money, DATE for dates, VARCHAR for text)",
    auditColumns:
      "_LOAD_ID (batch ID), _LOAD_TIMESTAMP (load time), _SOURCE_SYSTEM (FIS-ADS), _RECORD_HASH (MD5)",
    partitioning:
      "By PROCESS_DATE for most tables, enables efficient querying and incremental loads",
    clustering: "By account-related columns for query performance",
  },

  estimatedDataVolumes: {
    depositAccountMaster: "20-50M records",
    accountBalance: "100M+ records/month",
    dailyBalanceFact: "50M+ records",
    accountMaintenance: "50M+ records/month",
    accountPackage: "10-20M records",
    debitCard: "30-50M records",
  },

  estimatedLoadTimes: {
    totalLoadWindow: "3.5 hours (02:30 - 06:00 UTC)",
    depositAccountMaster: "45 minutes",
    accountBalance: "60 minutes",
    dailyBalanceFact: "50 minutes",
    accountMaintenance: "40 minutes",
    accountPackage: "30 minutes",
    debitCard: "25 minutes",
  },
};

export default depositsBronzeIngestionCatalog;
