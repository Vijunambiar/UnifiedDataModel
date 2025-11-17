/**
 * CUSTOMER DOMAIN - BRONZE LAYER - INGESTION JOBS
 *
 * Data ingestion job specifications from FIS to Bronze layer
 * Source System: FIS
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
// CUSTOMER MASTER INGESTION JOB
// ============================================================================
export const customerMasterIngestionJob: IngestionJob = {
  jobId: "FIS_CUST_MASTER_001",
  jobName: "Ingest Customer Master from FIS",
  sourceSystem: "FIS",
  sourceTable: "TB_CI_OZ6_CUST_ARD",
  sourceSchema: "FIS_RAW",
  targetTable: "customer_master",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "02:00",
    timezone: "UTC",
    dependencies: [],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns from FIS naming convention to standardized names",
    "Cast data types to target schema",
    "Add audit columns (_LOAD_ID, _LOAD_TIMESTAMP, _SOURCE_SYSTEM)",
    "Generate _RECORD_HASH using MD5 of all source columns",
    "Set PRCS_DTE to current business date",
    "Set IS_CURRENT = TRUE for new records",
  ],

  dataQualityChecks: [
    "CUSTOMER_ID must not be NULL",
    "CUSTOMER_ID must be unique per PRCS_DTE",
    "CUSTOMER_STATUS must be in ('ACTIVE', 'INACTIVE', 'DECEASED', 'CLOSED')",
    "CUSTOMER_SINCE_DATE must be <= current date",
    "Row count must match source extract count",
    "No duplicate CUSTOMER_IDs in single load",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.customer_master_load_errors",
    alertRecipients: ["data-engineering@bank.com", "customer-ops@bank.com"],
  },

  priority: "HIGH",
};

// ============================================================================
// CUSTOMER IDENTIFIERS INGESTION JOB
// ============================================================================
export const customerIdentifiersIngestionJob: IngestionJob = {
  jobId: "FIS_CUST_ID_002",
  jobName: "Ingest Customer Identifiers from FIS",
  sourceSystem: "FIS",
  sourceTable: "TB_CI_OZ4_CUST_ID_ARD",
  sourceSchema: "FIS_RAW",
  targetTable: "customer_identifiers",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "02:15",
    timezone: "UTC",
    dependencies: ["FIS_CUST_MASTER_001"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming",
    "Cast data types",
    "Add audit columns",
    "Generate _RECORD_HASH",
    "Keep ID_NUMBER in plaintext (encryption in Silver layer)",
    "Set PRCS_DTE and IS_CURRENT flags",
  ],

  dataQualityChecks: [
    "CUSTOMER_ID must exist in bronze.customer_master",
    "ID_TYPE must not be NULL",
    "ID_NUMBER must not be NULL",
    "ID_TYPE must be valid code",
    "EXPIRATION_DATE must be >= ISSUE_DATE if both populated",
    "No duplicate (CUSTOMER_ID, ID_TYPE) combinations per PRCS_DTE",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.customer_identifiers_load_errors",
    alertRecipients: ["data-engineering@bank.com", "compliance@bank.com"],
  },

  priority: "HIGH",
};

// ============================================================================
// CUSTOMER NAMES AND ADDRESSES INGESTION JOB
// ============================================================================
export const customerNamesAddressesIngestionJob: IngestionJob = {
  jobId: "FIS_CUST_NAAD_003",
  jobName: "Ingest Customer Names and Addresses from FIS",
  sourceSystem: "FIS",
  sourceTable: "TB_CI_OZ5_CUST_NAAD_ARD",
  sourceSchema: "FIS_RAW",
  targetTable: "customer_names_addresses",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "02:20",
    timezone: "UTC",
    dependencies: ["FIS_CUST_MASTER_001"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming",
    "Cast data types",
    "Add audit columns",
    "Generate _RECORD_HASH",
    "Keep names and addresses in plaintext (encryption/standardization in Silver)",
    "Set PRCS_DTE and IS_CURRENT flags",
  ],

  dataQualityChecks: [
    "CUSTOMER_ID must exist in bronze.customer_master",
    "NAME_ADDRESS_ID must not be NULL",
    "At least one of (FULL_NAME, ADDRESS_LINE1) must be populated",
    "EMAIL_ADDRESS must match email pattern if populated",
    "COUNTRY_CODE must be valid ISO code if populated",
    "No duplicate NAME_ADDRESS_IDs per PRCS_DTE",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.customer_names_addresses_load_errors",
    alertRecipients: ["data-engineering@bank.com"],
  },

  priority: "HIGH",
};

// ============================================================================
// CUSTOMER EMAIL INGESTION JOB
// ============================================================================
export const customerEmailIngestionJob: IngestionJob = {
  jobId: "FIS_CUST_EMAIL_004",
  jobName: "Ingest Customer Email Addresses from FIS",
  sourceSystem: "FIS",
  sourceTable: "TB_CI_OZ3_EMAIL_ARD",
  sourceSchema: "FIS_RAW",
  targetTable: "customer_email",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "02:25",
    timezone: "UTC",
    dependencies: ["FIS_CUST_MASTER_001"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming",
    "Cast data types",
    "Add audit columns",
    "Generate _RECORD_HASH",
    "Lowercase email addresses for consistency",
    "Set PRCS_DTE and IS_CURRENT flags",
  ],

  dataQualityChecks: [
    "CUSTOMER_ID must exist in bronze.customer_master",
    "EMAIL_ADDRESS must not be NULL",
    "EMAIL_ADDRESS must match valid email pattern",
    "EMAIL_TYPE must be valid code",
    "No duplicate (CUSTOMER_ID, EMAIL_ADDRESS) per PRCS_DTE",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.customer_email_load_errors",
    alertRecipients: ["data-engineering@bank.com"],
  },

  priority: "MEDIUM",
};

// ============================================================================
// CUSTOMER TO ACCOUNT RELATIONSHIP INGESTION JOB
// ============================================================================
export const customerAccountRelationshipIngestionJob: IngestionJob = {
  jobId: "FIS_CUST_ACCT_REL_005",
  jobName: "Ingest Customer-Account Relationships from FIS",
  sourceSystem: "FIS",
  sourceTable: "TB_CI_OZW_CUST_ACCT_RLT_ARD",
  sourceSchema: "FIS_RAW",
  targetTable: "customer_account_relationship",
  targetSchema: "bronze",

  schedule: {
    frequency: "DAILY",
    time: "02:30",
    timezone: "UTC",
    dependencies: ["FIS_CUST_MASTER_001", "FIS_DEP_ACCOUNT_001"],
  },

  loadStrategy: "INCREMENTAL",
  extractionMethod: "SQL_QUERY",

  transformations: [
    "Rename columns to standard naming",
    "Cast data types",
    "Add audit columns",
    "Generate _RECORD_HASH",
    "Validate ownership percentages sum to 100 for joint accounts",
    "Set PRCS_DTE and IS_CURRENT flags",
  ],

  dataQualityChecks: [
    "CUSTOMER_ID must exist in bronze.customer_master",
    "ACCOUNT_NUMBER must exist in bronze.deposit_account_master",
    "RELATIONSHIP_TYPE must be valid code",
    "RELATIONSHIP_START_DATE must be <= current date",
    "RELATIONSHIP_END_DATE must be > RELATIONSHIP_START_DATE if populated",
    "OWNERSHIP_PERCENTAGE must be between 0 and 100",
    "For each account, sum of OWNERSHIP_PERCENTAGE should equal 100",
    "No duplicate RELATIONSHIP_IDs per PRCS_DTE",
  ],

  errorHandling: {
    onFailure: "RETRY",
    maxRetries: 3,
    errorTable: "bronze.customer_account_relationship_load_errors",
    alertRecipients: ["data-engineering@bank.com", "customer-ops@bank.com"],
  },

  priority: "HIGH",
};

// ============================================================================
// INGESTION JOB CATALOG
// ============================================================================
export const customerBronzeIngestionCatalog = {
  domain: "Customer Core",
  layer: "Bronze",
  sourceSystem: "FIS",
  targetSchema: "bronze",

  jobs: [
    customerMasterIngestionJob,
    customerIdentifiersIngestionJob,
    customerNamesAddressesIngestionJob,
    customerEmailIngestionJob,
    customerAccountRelationshipIngestionJob,
  ],

  totalJobs: 5,

  orchestration: {
    tool: "Matillion ETL / Airflow",
    dagName: "customer_bronze_daily_load",
    schedule: "Daily at 02:00 UTC",
    sla: "Complete by 04:00 UTC",
    retryPolicy: "Exponential backoff, max 3 retries",
    alerting: "Email + PagerDuty for failures",
  },

  dependencies: {
    upstream: ["FIS data export completion"],
    downstream: ["Silver layer customer transformation jobs"],
  },

  monitoring: {
    metrics: [
      "Row counts (source vs target)",
      "Error counts",
      "Data quality check failures",
      "Hash collision detection",
    ],
    dashboard: "Customer Bronze Layer - Daily Load Monitoring",
  },

  dataLineage: {
    source: "FIS Core Banking System",
    extraction: "JDBC connection to FIS_RAW schema",
    landing: "S3 staging bucket (optional intermediate)",
    target: "Snowflake bronze schema",
    transformation: "Minimal - column rename and type cast only",
  },
};

export default customerBronzeIngestionCatalog;
