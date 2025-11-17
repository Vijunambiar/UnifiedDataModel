/**
 * MATILLION JOB SPECIFICATIONS
 * 
 * Complete Matillion job definitions for all Silver Layer transformations
 * Includes job architecture, components, scheduling, error handling, and monitoring
 * 
 * Job Structure:
 * - Parent jobs (domain-level orchestration)
 * - Child jobs (transformation components)
 * - Reusable components (shared logic)
 * 
 * Execution Flow:
 * FIS Source → Bronze Layer → Matillion Jobs → Silver Layer (Snowflake)
 * 
 * Scheduling:
 * - Customer Domain: Daily at 01:00 UTC
 * - Deposits Domain: Daily at 02:00 UTC
 * - Transactions Domain: Real-time + Daily aggregations at 03:00 UTC
 */

export interface MatillionComponent {
  componentName: string;
  componentType: "Extract" | "Tran" | "Load" | "Control" | "Query" | "Script";
  sourceConnector?: string;
  targetConnector?: string;
  sqlLogic?: string;
  errorHandling?: string;
  description: string;
}

export interface MatillionJob {
  jobId: string;
  jobName: string;
  jobType: "Parent" | "Child" | "Reusable";
  domain: "Customer" | "Deposits" | "Transactions";
  purpose: string;
  sourceTable: string | string[];
  targetTable: string;
  refreshFrequency: string;
  scheduleCron?: string;
  estimatedDuration: string;
  components: MatillionComponent[];
  errorHandling: string;
  notificationOnError?: {
    email: string[];
    severity: "CRITICAL" | "ERROR" | "WARNING";
    slackChannel?: string;
  };
  successMetrics?: {
    recordCount?: string;
    recordCountTolerance?: number;
    dataQualityRules?: string[];
  };
  prerequisites?: string[];
  childJobs?: string[];
  allowRerunOnFailure?: boolean;
  maxRetries?: number;
  retryDelayMinutes?: number;
}

// ============================================================================
// CUSTOMER DOMAIN - MATILLION JOBS
// ============================================================================

export const CUST_PII_ENC_Job: MatillionJob = {
  jobId: "CUST_PII_ENC",
  jobName: "Customer Master - PII Encryption",
  jobType: "Child",
  domain: "Customer",
  purpose: "Encrypt PII fields (SSN, names, contact info) from bronze layer",
  sourceTable: "bronze.customer_master",
  targetTable: "silver.customer_master_encrypted",
  refreshFrequency: "DAILY",
  scheduleCron: "0 1 * * *",
  estimatedDuration: "15-30 minutes",

  components: [
    {
      componentName: "Extract_CustomerMaster",
      componentType: "Extract",
      sourceConnector: "Snowflake_FIS",
      sqlLogic:
        "SELECT * FROM bronze.customer_master WHERE DATEDIFF(day, REFRESH_TIME, CURRENT_DATE()) <= 1 ORDER BY CUSTOMER_ID",
      description: "Extract customer master records modified in last day",
    },
    {
      componentName: "Hash_SSN",
      componentType: "Tran",
      sqlLogic:
        "SELECT *, SHA2(TAX_ID, 256) as ssn_hash FROM input WHERE TAX_ID IS NOT NULL",
      description: "Generate SHA256 hash of SSN for secure matching (non-reversible)",
    },
    {
      componentName: "Validate_Data",
      componentType: "Query",
      sqlLogic:
        "SELECT COUNT(*) as null_count FROM input WHERE customer_id IS NULL OR customer_status NOT IN ('ACTIVE','INACTIVE','CLOSED','DECEASED')",
      description: "Validate critical fields before encryption",
    },
    {
      componentName: "Load_EncryptedData",
      componentType: "Load",
      targetConnector: "Snowflake_Silver",
      sqlLogic:
        "INSERT INTO silver.customer_master_encrypted (customer_id, ssn_hash, encrypted_fields, load_timestamp) SELECT CUSTOMER_ID, ssn_hash, TO_VARCHAR(OBJECT_CONSTRUCT('TAX_ID', ssn_hash)), CURRENT_TIMESTAMP() FROM input",
      description: "Load encrypted customer data to silver layer",
    },
    {
      componentName: "ErrorHandler",
      componentType: "Control",
      errorHandling: "ON_ERROR: Send alert email to security team, log to audit table, HALT job",
      description: "Handle encryption failures with audit logging",
    },
  ],

  errorHandling:
    "On encryption failure: reject row, log error to silver.dq_exceptions, DO NOT pass unencrypted data to Silver. Alert security team. Max retries: 3 with 5-minute backoff.",
  notificationOnError: {
    email: ["data-engineering@bank.com", "security@bank.com"],
    severity: "CRITICAL",
    slackChannel: "#data-alerts",
  },
  successMetrics: {
    recordCount: "SELECT COUNT(*) FROM bronze.customer_master WHERE REFRESH_TIME >= DATEADD(day, -1, CURRENT_DATE())",
    recordCountTolerance: 5,
    dataQualityRules: ["CUST_COMP_001", "CUST_VALID_001"],
  },
  allowRerunOnFailure: true,
  maxRetries: 3,
  retryDelayMinutes: 5,
};

export const CUST_NAME_STD_Job: MatillionJob = {
  jobId: "CUST_NAME_STD",
  jobName: "Customer Names - Standardization",
  jobType: "Child",
  domain: "Customer",
  purpose: "Standardize names and addresses (USPS validation, accent removal)",
  sourceTable: "bronze.customer_names_addresses",
  targetTable: "silver.customer_names_standardized",
  refreshFrequency: "DAILY",
  scheduleCron: "0 1 * * *",
  estimatedDuration: "10-20 minutes",

  components: [
    {
      componentName: "Extract_NamesAddresses",
      componentType: "Extract",
      sourceConnector: "Snowflake_FIS",
      sqlLogic:
        "SELECT * FROM bronze.customer_names_addresses WHERE DATEDIFF(day, REFRESH_TIME, CURRENT_DATE()) <= 1",
      description: "Extract customer names and addresses modified in last day",
    },
    {
      componentName: "Standardize_Names",
      componentType: "Tran",
      sqlLogic:
        "SELECT CUSTOMER_ID, INITCAP(TRIM(REGEXP_REPLACE(FIRST_NAME, '[^A-Za-z\\s]', ''))) as first_name_std, INITCAP(TRIM(REGEXP_REPLACE(LAST_NAME, '[^A-Za-z\\s]', ''))) as last_name_std FROM input",
      description: "Standardize names: proper case, trim, remove accents and special chars",
    },
    {
      componentName: "Standardize_Addresses",
      componentType: "Tran",
      sqlLogic:
        "SELECT CUSTOMER_ID, UPPER(TRIM(ADDRESS_LINE_1)) as address_std, INITCAP(CITY) as city_std, UPPER(STATE_CODE) as state_code, CONCAT(ZIP_CODE_1, '-', ZIP_CODE_2) as postal_code FROM input WHERE ZIP_CODE_1 IS NOT NULL",
      description: "Standardize addresses: USPS format, ZIP+4 formatting",
    },
    {
      componentName: "Validate_Addresses",
      componentType: "Query",
      sqlLogic:
        "SELECT CUSTOMER_ID, address_std FROM input WHERE LENGTH(address_std) < 5 OR state_code NOT REGEXP '^[A-Z]{2}$'",
      description: "Identify invalid addresses for manual review",
    },
    {
      componentName: "Load_StandardizedData",
      componentType: "Load",
      targetConnector: "Snowflake_Silver",
      sqlLogic:
        "INSERT INTO silver.customer_names_standardized SELECT CUSTOMER_ID, first_name_std, last_name_std, address_std, city_std, state_code, postal_code, CURRENT_TIMESTAMP() FROM input",
      description: "Load standardized names and addresses",
    },
  ],

  errorHandling: "On standardization failure: log with original value, apply fallback processing, mark as requires_review",
  notificationOnError: {
    email: ["data-steward@bank.com"],
    severity: "WARNING",
  },
  successMetrics: {
    recordCount: "SELECT COUNT(*) FROM bronze.customer_names_addresses WHERE REFRESH_TIME >= DATEADD(day, -1, CURRENT_DATE())",
    recordCountTolerance: 5,
  },
  allowRerunOnFailure: true,
  maxRetries: 2,
  retryDelayMinutes: 5,
};

export const CUST_ID_TOK_Job: MatillionJob = {
  jobId: "CUST_ID_TOK",
  jobName: "Customer Identifiers - Tokenization",
  jobType: "Child",
  domain: "Customer",
  purpose: "Tokenize government ID numbers via external service",
  sourceTable: "bronze.customer_identifiers",
  targetTable: "silver.customer_identifiers_tokenized",
  refreshFrequency: "DAILY",
  scheduleCron: "0 1 * * *",
  estimatedDuration: "5-10 minutes",

  components: [
    {
      componentName: "Extract_Identifiers",
      componentType: "Extract",
      sourceConnector: "Snowflake_FIS",
      sqlLogic:
        "SELECT CUSTOMER_ID, IDENTIFICATION_TYPE, IDENTIFICATION_NUMBER, ID_ISSUE_DATE, ID_EXPIRATION_DATE FROM bronze.customer_identifiers WHERE DATEDIFF(day, REFRESH_TIME, CURRENT_DATE()) <= 1",
      description: "Extract identification documents",
    },
    {
      componentName: "Tokenize_ID",
      componentType: "Script",
      sqlLogic:
        "CALL TOKENIZATION_SERVICE_CALL(IDENTIFICATION_NUMBER) RETURNS token_id; MAP token_id to customer_id in secure vault",
      description: "Call external tokenization service (REST API integration)",
    },
    {
      componentName: "Validate_Tokens",
      componentType: "Query",
      sqlLogic:
        "SELECT COUNT(*) FROM input WHERE token_id IS NULL OR LENGTH(token_id) < 8",
      description: "Validate token generation success",
    },
    {
      componentName: "Load_TokenizedData",
      componentType: "Load",
      targetConnector: "Snowflake_Silver",
      sqlLogic:
        "INSERT INTO silver.customer_identifiers_tokenized SELECT CUSTOMER_ID, IDENTIFICATION_TYPE, token_id, ID_ISSUE_DATE, ID_EXPIRATION_DATE, CURRENT_TIMESTAMP() FROM input",
      description: "Load tokenized ID data",
    },
  ],

  errorHandling: "On tokenization failure: use fallback generated token, log incident, alert security team, maintain audit trail",
  notificationOnError: {
    email: ["data-engineering@bank.com", "security@bank.com"],
    severity: "CRITICAL",
    slackChannel: "#security-alerts",
  },
  successMetrics: {
    recordCount: "SELECT COUNT(*) FROM bronze.customer_identifiers WHERE DATEDIFF(day, REFRESH_TIME, CURRENT_DATE()) <= 1",
    recordCountTolerance: 3,
  },
  allowRerunOnFailure: true,
  maxRetries: 3,
  retryDelayMinutes: 10,
};

export const CUST_EMAIL_VAL_Job: MatillionJob = {
  jobId: "CUST_EMAIL_VAL",
  jobName: "Customer Email - Validation & Deduplication",
  jobType: "Child",
  domain: "Customer",
  purpose: "Validate email format and deduplicate multiple emails per customer",
  sourceTable: "bronze.customer_email",
  targetTable: "silver.customer_email_validated",
  refreshFrequency: "DAILY",
  scheduleCron: "0 1 * * *",
  estimatedDuration: "5-10 minutes",

  components: [
    {
      componentName: "Extract_Emails",
      componentType: "Extract",
      sourceConnector: "Snowflake_FIS",
      sqlLogic:
        "SELECT CUSTOMER_ID, EMAIL_ADDRESS, EMAIL_TYPE_CODE FROM bronze.customer_email WHERE DATEDIFF(day, REFRESH_TIME, CURRENT_DATE()) <= 1",
      description: "Extract customer email records",
    },
    {
      componentName: "Validate_EmailFormat",
      componentType: "Tran",
      sqlLogic:
        "SELECT CUSTOMER_ID, LOWER(TRIM(EMAIL_ADDRESS)) as email_validated, CASE WHEN EMAIL_ADDRESS REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Z|a-z]{2,}$' THEN TRUE ELSE FALSE END as is_valid FROM input",
      description: "Validate email format (RFC 5322 compliance)",
    },
    {
      componentName: "Deduplicate_Emails",
      componentType: "Tran",
      sqlLogic:
        "SELECT CUSTOMER_ID, email_validated, ROW_NUMBER() OVER (PARTITION BY CUSTOMER_ID ORDER BY is_valid DESC, EMAIL_TYPE_CODE ASC) as email_rank FROM input WHERE is_valid = TRUE",
      description: "Deduplicate: keep primary (rank=1) verified email per customer",
    },
    {
      componentName: "Load_ValidatedEmails",
      componentType: "Load",
      targetConnector: "Snowflake_Silver",
      sqlLogic:
        "INSERT INTO silver.customer_email_validated SELECT CUSTOMER_ID, email_validated as email_primary, is_valid, CURRENT_TIMESTAMP() FROM input WHERE email_rank = 1",
      description: "Load validated primary email",
    },
  ],

  errorHandling: "On validation failure: log invalid emails, mark as unverified, track correction ratio",
  notificationOnError: {
    email: ["data-steward@bank.com"],
    severity: "WARNING",
  },
  allowRerunOnFailure: true,
  maxRetries: 2,
  retryDelayMinutes: 5,
};

export const CUST_MDM_DEDUP_Job: MatillionJob = {
  jobId: "CUST_MDM_DEDUP",
  jobName: "Customer Master - Deduplication & MDM",
  jobType: "Child",
  domain: "Customer",
  purpose: "Apply MDM deduplication logic with survivorship rules",
  sourceTable: [
    "silver.customer_master_encrypted",
    "silver.customer_names_standardized",
    "silver.customer_identifiers_tokenized",
    "silver.customer_email_validated",
  ],
  targetTable: "silver.customer_master_deduped",
  refreshFrequency: "DAILY",
  scheduleCron: "0 2 * * *",
  estimatedDuration: "30-60 minutes",
  prerequisites: [
    "CUST_PII_ENC",
    "CUST_NAME_STD",
    "CUST_ID_TOK",
    "CUST_EMAIL_VAL",
  ],
  childJobs: [],

  components: [
    {
      componentName: "Join_EncryptedAndStandardized",
      componentType: "Tran",
      sqlLogic:
        "SELECT m.CUSTOMER_ID, m.ssn_hash, n.first_name_std, n.last_name_std, n.address_std, i.token_id, e.email_primary FROM silver.customer_master_encrypted m LEFT JOIN silver.customer_names_standardized n USING (CUSTOMER_ID) LEFT JOIN silver.customer_identifiers_tokenized i USING (CUSTOMER_ID) LEFT JOIN silver.customer_email_validated e USING (CUSTOMER_ID)",
      description: "Join all encrypted and standardized data",
    },
    {
      componentName: "ApplyMDMMatching",
      componentType: "Script",
      sqlLogic:
        "CALL MDM_MATCHING_MODEL(ssn_hash, first_name_std, last_name_std, address_std) RETURNS match_group_id, confidence_score; GROUP records with confidence >= 0.85",
      description: "Apply ML-based MDM matching on 4 key attributes",
    },
    {
      componentName: "ApplySurvivorshipRules",
      componentType: "Tran",
      sqlLogic:
        "FOR EACH match_group: SELECT customer_id FROM group WITH HIGHEST confidence_score; FOR TIE: SELECT customer with most recent update FROM FIS_CORE",
      description: "Apply survivorship rules: select 'winner' from duplicate group",
    },
    {
      componentName: "IdentifyMDMExceptions",
      componentType: "Query",
      sqlLogic:
        "SELECT match_group_id, COUNT(*) as group_size, MIN(confidence_score) as min_conf, MAX(confidence_score) as max_conf FROM deduplicated WHERE confidence_score BETWEEN 0.75 AND 0.85",
      description: "Identify low-confidence matches for manual review",
    },
    {
      componentName: "Load_DedupedRecords",
      componentType: "Load",
      targetConnector: "Snowflake_Silver",
      sqlLogic:
        "INSERT INTO silver.customer_master_deduped SELECT CUSTOMER_ID, first_name_std, last_name_std, address_std, email_primary, token_id, match_group_id, confidence_score, ROW_NUMBER() OVER (ORDER BY CUSTOMER_ID) as record_count, CURRENT_TIMESTAMP() FROM deduplicated WHERE is_winner = TRUE",
      description: "Load deduplicated golden records",
    },
  ],

  errorHandling:
    "Deduplication conflicts: log all candidates to silver.mdm_exceptions, assign to data steward, notify via alert. Retain previous winner until manual approval.",
  notificationOnError: {
    email: ["data-engineering@bank.com", "mdm-steward@bank.com"],
    severity: "ERROR",
    slackChannel: "#mdm-alerts",
  },
  successMetrics: {
    recordCount: "SELECT COUNT(*) FROM silver.customer_master_deduped WHERE is_current = TRUE",
    recordCountTolerance: 3,
    dataQualityRules: ["CUST_UNIQUE_001"],
  },
  allowRerunOnFailure: false,
  maxRetries: 1,
  retryDelayMinutes: 30,
};

export const CUST_SCD2_FINAL_Job: MatillionJob = {
  jobId: "CUST_SCD2_FINAL",
  jobName: "Customer Master - SCD Type 2 Implementation",
  jobType: "Child",
  domain: "Customer",
  purpose: "Implement SCD Type 2: track changes and maintain history",
  sourceTable: "silver.customer_master_deduped",
  targetTable: "silver.customer_master_golden",
  refreshFrequency: "DAILY",
  scheduleCron: "0 3 * * *",
  estimatedDuration: "10-20 minutes",
  prerequisites: ["CUST_MDM_DEDUP"],

  components: [
    {
      componentName: "LoadNewRecords",
      componentType: "Load",
      targetConnector: "Snowflake_Silver",
      sqlLogic:
        "INSERT INTO silver.customer_master_golden (customer_sk, customer_id, ..., effective_date, expiration_date, is_current) SELECT row_number() over (ORDER BY CUSTOMER_ID), CUSTOMER_ID, ..., CURRENT_DATE(), '9999-12-31', TRUE FROM silver.customer_master_deduped WHERE CUSTOMER_ID NOT IN (SELECT DISTINCT CUSTOMER_ID FROM silver.customer_master_golden WHERE is_current = TRUE)",
      description: "Insert new customer records",
    },
    {
      componentName: "DetectChanges",
      componentType: "Tran",
      sqlLogic:
        "SELECT n.CUSTOMER_ID, MD5(CONCAT(n.first_name_std, n.last_name_std, n.address_std, n.email_primary)) as new_hash, c.source_system_row_hash FROM silver.customer_master_deduped n JOIN silver.customer_master_golden c ON n.CUSTOMER_ID = c.CUSTOMER_ID AND c.is_current = TRUE WHERE n.new_hash != c.source_system_row_hash",
      description: "Detect changed records via hash comparison",
    },
    {
      componentName: "ExpireOldRecords",
      componentType: "Load",
      targetConnector: "Snowflake_Silver",
      sqlLogic:
        "UPDATE silver.customer_master_golden SET expiration_date = DATEADD(day, -1, CURRENT_DATE()), is_current = FALSE WHERE CUSTOMER_ID IN (SELECT CUSTOMER_ID FROM changed_records) AND is_current = TRUE",
      description: "Expire old records (set is_current=FALSE)",
    },
    {
      componentName: "InsertNewVersions",
      componentType: "Load",
      targetConnector: "Snowflake_Silver",
      sqlLogic:
        "INSERT INTO silver.customer_master_golden SELECT row_number() over (ORDER BY CUSTOMER_ID), CUSTOMER_ID, ..., CURRENT_DATE(), '9999-12-31', TRUE, changed_attributes_list FROM silver.customer_master_deduped WHERE CUSTOMER_ID IN (SELECT CUSTOMER_ID FROM changed_records)",
      description: "Insert new versions of changed records",
    },
  ],

  errorHandling:
    "SCD2 logic errors: log with customer_id and change details, retain previous version, alert to data engineering. Manual investigation required.",
  notificationOnError: {
    email: ["data-engineering@bank.com"],
    severity: "ERROR",
  },
  successMetrics: {
    recordCount: "SELECT COUNT(*) FROM silver.customer_master_golden WHERE is_current = TRUE",
    recordCountTolerance: 5,
  },
  allowRerunOnFailure: false,
  maxRetries: 0,
};

// ============================================================================
// CUSTOMER DOMAIN - PARENT JOB
// ============================================================================

export const CUST_ORCHESTRATOR_Job: MatillionJob = {
  jobId: "CUST_ORCHESTRATOR",
  jobName: "Customer Domain - Master Orchestrator",
  jobType: "Parent",
  domain: "Customer",
  purpose: "Orchestrate all customer transformation jobs",
  sourceTable: "bronze.customer_master",
  targetTable: "silver.customer_master_golden",
  refreshFrequency: "DAILY",
  scheduleCron: "0 1 * * *",
  estimatedDuration: "2-3 hours",
  childJobs: [
    "CUST_PII_ENC",
    "CUST_NAME_STD",
    "CUST_ID_TOK",
    "CUST_EMAIL_VAL",
    "CUST_MDM_DEDUP",
    "CUST_SCD2_FINAL",
  ],

  components: [
    {
      componentName: "StartCustomerPipeline",
      componentType: "Control",
      description: "Initialize customer transformation pipeline",
    },
    {
      componentName: "ExecutePIIEncryption",
      componentType: "Control",
      description: "Execute CUST_PII_ENC job, wait for completion",
    },
    {
      componentName: "ExecuteNameStandardization",
      componentType: "Control",
      description: "Execute CUST_NAME_STD job, wait for completion",
    },
    {
      componentName: "ExecuteIDTokenization",
      componentType: "Control",
      description: "Execute CUST_ID_TOK job, wait for completion",
    },
    {
      componentName: "ExecuteEmailValidation",
      componentType: "Control",
      description: "Execute CUST_EMAIL_VAL job, wait for completion",
    },
    {
      componentName: "ExecuteMDMDeduplication",
      componentType: "Control",
      description: "Execute CUST_MDM_DEDUP job (depends on all above)",
    },
    {
      componentName: "ExecuteSCD2",
      componentType: "Control",
      description: "Execute CUST_SCD2_FINAL job (depends on MDM)",
    },
    {
      componentName: "ValidateResults",
      componentType: "Query",
      sqlLogic:
        "SELECT COUNT(*) FROM silver.customer_master_golden WHERE is_current = TRUE; COMPARE with expected record count ±5%",
      description: "Final validation of golden records",
    },
    {
      componentName: "SendSuccessNotification",
      componentType: "Control",
      description: "Send completion alert to data team",
    },
  ],

  errorHandling:
    "On any child job failure: halt pipeline, alert data engineering team, log to alert system. Do not proceed to next stage.",
  notificationOnError: {
    email: ["data-engineering@bank.com"],
    severity: "CRITICAL",
    slackChannel: "#data-pipeline-alerts",
  },
  allowRerunOnFailure: true,
  maxRetries: 1,
  retryDelayMinutes: 60,
};

// ============================================================================
// DEPOSITS & TRANSACTIONS JOBS - SUMMARY
// ============================================================================

export const DEPOSITS_JOBS: MatillionJob[] = [
  {
    jobId: "DEP_ACCT_STD",
    jobName: "Deposit Accounts - Standardization",
    jobType: "Child",
    domain: "Deposits",
    purpose: "Standardize account types, statuses, product codes",
    sourceTable: "bronze.deposit_account_master",
    targetTable: "silver.deposit_accounts_standardized",
    refreshFrequency: "DAILY",
    scheduleCron: "0 2 * * *",
    estimatedDuration: "10-15 minutes",
    components: [],
    errorHandling: "Log with account_id and error reason, apply fallback, flag for review",
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 5,
  },
  {
    jobId: "DEP_ACCT_NORM",
    jobName: "Deposit Accounts - Rate & Fee Normalization",
    jobType: "Child",
    domain: "Deposits",
    purpose: "Normalize interest rates and validate fees",
    sourceTable: "bronze.deposit_account_master",
    targetTable: "silver.deposit_accounts_normalized",
    refreshFrequency: "DAILY",
    scheduleCron: "0 2 * * *",
    estimatedDuration: "5-10 minutes",
    components: [],
    errorHandling: "Apply bounds checking, log anomaly, alert rates team",
    prerequisites: ["DEP_ACCT_STD"],
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 5,
  },
  {
    jobId: "DEP_BAL_DAILY",
    jobName: "Deposit Balances - Daily Snapshot",
    jobType: "Child",
    domain: "Deposits",
    purpose: "Validate daily balances and aggregate transaction summaries",
    sourceTable: "bronze.deposit_account_balances_daily",
    targetTable: "silver.deposit_balances_daily",
    refreshFrequency: "DAILY",
    scheduleCron: "0 2 * * *",
    estimatedDuration: "15-30 minutes",
    components: [],
    errorHandling: "Log discrepancy with account_id, create exception record, notify operations",
    prerequisites: ["DEP_ACCT_STD"],
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 10,
  },
  {
    jobId: "DEP_TXN_ENRICH",
    jobName: "Deposit Transactions - Categorization & Enrichment",
    jobType: "Child",
    domain: "Deposits",
    purpose: "Categorize transaction types and enrich with channel/balance info",
    sourceTable: "bronze.money_transaction",
    targetTable: "silver.deposit_transactions_enriched",
    refreshFrequency: "REAL_TIME",
    estimatedDuration: "10-20 minutes",
    components: [],
    errorHandling: "Apply default category, log with transaction_id, flag for review",
    prerequisites: ["DEP_ACCT_STD"],
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 5,
  },
  {
    jobId: "DEP_SCD2_FINAL",
    jobName: "Deposit Account Master - SCD Type 2",
    jobType: "Child",
    domain: "Deposits",
    purpose: "Implement SCD Type 2 for account master history",
    sourceTable: "silver.deposit_accounts_normalized",
    targetTable: "silver.deposit_account_master_golden",
    refreshFrequency: "DAILY",
    scheduleCron: "0 3 * * *",
    estimatedDuration: "10-15 minutes",
    components: [],
    errorHandling: "Retain previous version, log issue, alert data engineering",
    prerequisites: ["DEP_ACCT_NORM"],
    allowRerunOnFailure: false,
    maxRetries: 0,
  },
];

export const TRANSACTIONS_JOBS: MatillionJob[] = [
  {
    jobId: "TRX_CONSOL",
    jobName: "Transactions - Source Consolidation",
    jobType: "Child",
    domain: "Transactions",
    purpose: "Consolidate transaction data from FIS, ACH, and Wire sources",
    sourceTable: ["bronze.money_transaction", "bronze.ach_transaction", "bronze.wire_transfer_transaction"],
    targetTable: "silver.transactions_consolidated",
    refreshFrequency: "REAL_TIME",
    estimatedDuration: "5-15 minutes",
    components: [],
    errorHandling: "Log unmapped codes, apply fallback, escalate to data steward",
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 5,
  },
  {
    jobId: "TRX_CATEG",
    jobName: "Transactions - Type Categorization",
    jobType: "Child",
    domain: "Transactions",
    purpose: "Categorize transaction types and channels",
    sourceTable: "silver.transactions_consolidated",
    targetTable: "silver.transactions_categorized",
    refreshFrequency: "REAL_TIME",
    estimatedDuration: "5-10 minutes",
    components: [],
    errorHandling: "Log ambiguous cases, apply priority rule, mark for review",
    prerequisites: ["TRX_CONSOL"],
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 5,
  },
  {
    jobId: "TRX_CPTY",
    jobName: "Transactions - Counterparty Enrichment",
    jobType: "Child",
    domain: "Transactions",
    purpose: "Identify and tokenize counterparty information",
    sourceTable: "silver.transactions_categorized",
    targetTable: "silver.transactions_enriched_counterparty",
    refreshFrequency: "REAL_TIME",
    estimatedDuration: "10-20 minutes",
    components: [],
    errorHandling: "Use masked counterparty, log unmapped value, enable manual enrichment",
    prerequisites: ["TRX_CATEG"],
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 5,
  },
  {
    jobId: "TRX_COMPLY",
    jobName: "Transactions - Compliance & Screening",
    jobType: "Child",
    domain: "Transactions",
    purpose: "OFAC screening and AML compliance checks",
    sourceTable: "silver.transactions_enriched_counterparty",
    targetTable: "silver.transactions_compliance_screened",
    refreshFrequency: "REAL_TIME",
    estimatedDuration: "20-60 minutes",
    components: [],
    errorHandling: "Hold transaction, log API error, alert compliance team, implement retry",
    prerequisites: ["TRX_CPTY"],
    allowRerunOnFailure: true,
    maxRetries: 3,
    retryDelayMinutes: 10,
  },
  {
    jobId: "TRX_FRAUD",
    jobName: "Transactions - Fraud Detection Scoring",
    jobType: "Child",
    domain: "Transactions",
    purpose: "Apply ML-based fraud detection model",
    sourceTable: "silver.transactions_compliance_screened",
    targetTable: "silver.transactions_fraud_scored",
    refreshFrequency: "REAL_TIME",
    estimatedDuration: "10-30 minutes",
    components: [],
    errorHandling: "Use baseline score, log error, mark for review, retry with backoff",
    prerequisites: ["TRX_COMPLY"],
    allowRerunOnFailure: true,
    maxRetries: 3,
    retryDelayMinutes: 5,
  },
  {
    jobId: "TRX_FINAL",
    jobName: "Transactions - Final Enrichment & Balance Impact",
    jobType: "Child",
    domain: "Transactions",
    purpose: "Calculate balance impact and final transaction detail",
    sourceTable: "silver.transactions_fraud_scored",
    targetTable: "silver.transaction_detail_enriched",
    refreshFrequency: "REAL_TIME",
    estimatedDuration: "15-30 minutes",
    components: [],
    errorHandling: "Log discrepancy, use fallback, flag for reconciliation",
    prerequisites: ["TRX_FRAUD"],
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 5,
  },
  {
    jobId: "TRX_DAILY_AGG",
    jobName: "Transactions - Daily Aggregates",
    jobType: "Child",
    domain: "Transactions",
    purpose: "Create daily aggregates by account and transaction type",
    sourceTable: "silver.transaction_detail_enriched",
    targetTable: "silver.transaction_daily_aggregates",
    refreshFrequency: "DAILY",
    scheduleCron: "0 3 * * *",
    estimatedDuration: "10-20 minutes",
    components: [],
    errorHandling: "Log discrepancy, alert, use previous day as fallback",
    prerequisites: ["TRX_FINAL"],
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 10,
  },
  {
    jobId: "TRX_CPTY_MTH",
    jobName: "Transactions - Monthly Counterparty Summary",
    jobType: "Child",
    domain: "Transactions",
    purpose: "Create monthly counterparty relationship summaries",
    sourceTable: "silver.transaction_detail_enriched",
    targetTable: "silver.transaction_counterparty_summary",
    refreshFrequency: "DAILY",
    scheduleCron: "0 3 * * *",
    estimatedDuration: "15-30 minutes",
    components: [],
    errorHandling: "Log calculation errors, use previous month as fallback",
    prerequisites: ["TRX_FINAL"],
    allowRerunOnFailure: true,
    maxRetries: 2,
    retryDelayMinutes: 10,
  },
];

// ============================================================================
// MATILLION JOB ORCHESTRATION SUMMARY
// ============================================================================

export const matillionJobRegistry = {
  customerDomain: {
    childJobs: [
      CUST_PII_ENC_Job,
      CUST_NAME_STD_Job,
      CUST_ID_TOK_Job,
      CUST_EMAIL_VAL_Job,
      CUST_MDM_DEDUP_Job,
      CUST_SCD2_FINAL_Job,
    ],
    parentJob: CUST_ORCHESTRATOR_Job,
    refreshSchedule: "Daily at 01:00 UTC",
    estimatedTotalDuration: "2-3 hours",
  },

  depositsDomain: {
    childJobs: DEPOSITS_JOBS,
    refreshSchedule: "Daily at 02:00 UTC",
    estimatedTotalDuration: "1-1.5 hours",
  },

  transactionsDomain: {
    childJobs: TRANSACTIONS_JOBS,
    refreshSchedule: "Real-time (streaming) + Daily aggregations at 03:00 UTC",
    estimatedTotalDuration: "Real-time: 5-30 min per transaction; Daily: 1-2 hours for aggregations",
  },

  totalJobs: 1 + 6 + 5 + 8,
  executionSequence: [
    "01:00 UTC - Customer domain orchestrator starts (6 child jobs in sequence)",
    "02:00 UTC - Deposits domain jobs start (5 jobs, can run in parallel)",
    "02:30 UTC - Transactions real-time streaming starts (continuous)",
    "03:00 UTC - Daily transaction aggregations start (2 jobs)",
    "04:00 UTC - All Silver layer updates complete, ready for Gold layer",
  ],

  errorHandling: {
    customerCritical: "HALT pipeline, alert data engineering immediately",
    depositsError: "Continue with caution, flag for manual review",
    transactionsRealTime: "Hold transaction, log error, retry with backoff. Manual review if exhausted.",
  },

  monitoring: {
    metrics: [
      "Job start/end times",
      "Record counts (input vs output)",
      "Error rates and failure reasons",
      "Data quality rule pass rates",
      "Processing latency (source to target)",
      "Resource utilization (CPU, memory, I/O)",
    ],
    alertThresholds: {
      recordCountVariance: "±5% tolerance",
      errorRate: "> 0.1% triggers alert",
      latency: "> SLA triggers warning",
      dqRuleFailure: "CRITICAL failures halt job, ERROR failures alert team",
    },
    dashboards: [
      "Matillion job execution dashboard",
      "Silver layer data quality dashboard",
      "Latency and throughput dashboard",
      "Error and exception dashboard",
    ],
  },
};

export default matillionJobRegistry;
