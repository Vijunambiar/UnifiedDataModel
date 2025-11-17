/**
 * CUSTOMER DOMAIN - SILVER LAYER - DATA QUALITY SCRIPTS
 *
 * Data quality validation checks for Silver layer customer tables
 * Executed: Post-transformation, daily at 05:00 UTC
 * Purpose: Ensure data quality after deduplication and standardization
 */

export interface DQCheck {
  checkId: string;
  checkName: string;
  tableName: string;
  checkType:
    | "COMPLETENESS"
    | "UNIQUENESS"
    | "VALIDITY"
    | "CONSISTENCY"
    | "TIMELINESS"
    | "ACCURACY";
  severity: "CRITICAL" | "WARNING" | "INFO";
  sqlStatement: string;
  threshold: {
    passRate: number;
    action: string;
  };
  description: string;
}

// ============================================================================
// CUSTOMER MASTER GOLDEN DQ CHECKS
// ============================================================================
export const customerMasterGoldenDQChecks: DQCheck[] = [
  {
    checkId: "CUST_SILVER_DQ_001",
    checkName: "Customer Master Golden - PK Uniqueness",
    tableName: "silver.customer_master_golden",
    checkType: "UNIQUENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_GOLD_LOAD",
    },
    description: "Verify customer_sk is unique for current records",
    sqlStatement: `
-- Customer Master Golden - PK Uniqueness Check
SELECT 
  'CUST_SILVER_DQ_001' AS check_id,
  'PK Uniqueness - customer_sk' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_current_records,
  COUNT(DISTINCT customer_sk) AS unique_customer_sks,
  COUNT(*) - COUNT(DISTINCT customer_sk) AS duplicate_count,
  CASE 
    WHEN COUNT(*) = COUNT(DISTINCT customer_sk) THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM silver.customer_master_golden
WHERE is_current = TRUE
  AND effective_end_date IS NULL;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_002",
    checkName: "Customer Master Golden - Business Key Uniqueness",
    tableName: "silver.customer_master_golden",
    checkType: "UNIQUENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_GOLD_LOAD",
    },
    description: "Verify only one current record per customer_id",
    sqlStatement: `
-- Business Key Uniqueness Check
WITH duplicate_customers AS (
  SELECT 
    customer_id,
    COUNT(*) AS current_record_count
  FROM silver.customer_master_golden
  WHERE is_current = TRUE
    AND effective_end_date IS NULL
  GROUP BY customer_id
  HAVING COUNT(*) > 1
)
SELECT 
  'CUST_SILVER_DQ_002' AS check_id,
  'Business Key Uniqueness - customer_id' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(DISTINCT customer_id) FROM silver.customer_master_golden WHERE is_current = TRUE) AS total_unique_customers,
  COALESCE(COUNT(*), 0) AS customers_with_duplicates,
  COALESCE(SUM(current_record_count), 0) AS total_duplicate_records,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  LISTAGG(customer_id, ', ') WITHIN GROUP (ORDER BY customer_id) AS duplicate_customer_ids
FROM duplicate_customers;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_003",
    checkName: "Customer Master Golden - Mandatory Fields Completeness",
    tableName: "silver.customer_master_golden",
    checkType: "COMPLETENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 99.9,
      action: "ALERT_AND_QUARANTINE",
    },
    description: "Verify critical fields are populated",
    sqlStatement: `
-- Mandatory Fields Completeness Check
SELECT 
  'CUST_SILVER_DQ_003' AS check_id,
  'Completeness - Mandatory Fields' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN customer_id IS NOT NULL
      AND customer_sk IS NOT NULL
      AND customer_type IS NOT NULL
      AND customer_status IS NOT NULL
      AND effective_start_date IS NOT NULL
      AND is_current IS NOT NULL
      AND created_timestamp IS NOT NULL
    THEN 1 ELSE 0 
  END) AS complete_records,
  SUM(CASE 
    WHEN customer_id IS NULL THEN 1 ELSE 0 
  END) AS missing_customer_id,
  SUM(CASE 
    WHEN customer_type IS NULL THEN 1 ELSE 0 
  END) AS missing_customer_type,
  SUM(CASE 
    WHEN customer_status IS NULL THEN 1 ELSE 0 
  END) AS missing_customer_status,
  ROUND(100.0 * SUM(CASE 
    WHEN customer_id IS NOT NULL AND customer_sk IS NOT NULL 
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN customer_id IS NOT NULL AND customer_sk IS NOT NULL 
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 99.9
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status
FROM silver.customer_master_golden
WHERE is_current = TRUE;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_004",
    checkName: "Customer Master Golden - PII Encryption Validation",
    tableName: "silver.customer_master_golden",
    checkType: "VALIDITY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_SECURITY_TEAM",
    },
    description: "Verify PII fields are properly encrypted/hashed",
    sqlStatement: `
-- PII Encryption Validation
SELECT 
  'CUST_SILVER_DQ_004' AS check_id,
  'Validity - PII Encryption' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN ssn_hash IS NOT NULL 
      AND LENGTH(ssn_hash) = 64  -- SHA-256 produces 64 hex characters
    THEN 1 ELSE 0 
  END) AS properly_hashed_ssn,
  SUM(CASE 
    WHEN ssn_hash IS NOT NULL 
      AND LENGTH(ssn_hash) != 64
    THEN 1 ELSE 0 
  END) AS improperly_hashed_ssn,
  SUM(CASE 
    WHEN ssn_hash REGEXP '[0-9]{3}-[0-9]{2}-[0-9]{4}'  -- Detect unhashed SSN pattern
    THEN 1 ELSE 0 
  END) AS unencrypted_ssn_detected,
  CASE 
    WHEN SUM(CASE WHEN ssn_hash REGEXP '[0-9]{3}-[0-9]{2}-[0-9]{4}' THEN 1 ELSE 0 END) = 0
    THEN 'PASS' 
    ELSE 'FAIL - SECURITY VIOLATION' 
  END AS status
FROM silver.customer_master_golden
WHERE is_current = TRUE
  AND ssn_hash IS NOT NULL;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_005",
    checkName: "Customer Master Golden - Email Format Validation",
    tableName: "silver.customer_master_golden",
    checkType: "VALIDITY",
    severity: "WARNING",
    threshold: {
      passRate: 95.0,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify email addresses match valid format",
    sqlStatement: `
-- Email Format Validation
SELECT 
  'CUST_SILVER_DQ_005' AS check_id,
  'Validity - Email Format' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records_with_email,
  SUM(CASE 
    WHEN email_primary REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
    THEN 1 ELSE 0 
  END) AS valid_email_format,
  SUM(CASE 
    WHEN email_primary NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
    THEN 1 ELSE 0 
  END) AS invalid_email_format,
  ROUND(100.0 * SUM(CASE 
    WHEN email_primary REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN email_primary REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 95.0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM silver.customer_master_golden
WHERE is_current = TRUE
  AND email_primary IS NOT NULL;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_006",
    checkName: "Customer Master Golden - Phone Format Validation",
    tableName: "silver.customer_master_golden",
    checkType: "VALIDITY",
    severity: "WARNING",
    threshold: {
      passRate: 90.0,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify phone numbers are in E.164 format",
    sqlStatement: `
-- Phone Format Validation (E.164)
SELECT 
  'CUST_SILVER_DQ_006' AS check_id,
  'Validity - Phone Format' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records_with_phone,
  SUM(CASE 
    WHEN phone_mobile REGEXP '^\\+[1-9]\\d{1,14}$'
    THEN 1 ELSE 0 
  END) AS valid_e164_format,
  SUM(CASE 
    WHEN phone_mobile NOT REGEXP '^\\+[1-9]\\d{1,14}$'
    THEN 1 ELSE 0 
  END) AS invalid_phone_format,
  ROUND(100.0 * SUM(CASE 
    WHEN phone_mobile REGEXP '^\\+[1-9]\\d{1,14}$'
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN phone_mobile REGEXP '^\\+[1-9]\\d{1,14}$'
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 90.0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM silver.customer_master_golden
WHERE is_current = TRUE
  AND phone_mobile IS NOT NULL;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_007",
    checkName: "Customer Master Golden - SCD Type 2 Integrity",
    tableName: "silver.customer_master_golden",
    checkType: "CONSISTENCY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_GOLD_LOAD",
    },
    description:
      "Verify SCD Type 2 logic integrity (no overlapping effective dates)",
    sqlStatement: `
-- SCD Type 2 Integrity Check
WITH overlapping_records AS (
  SELECT 
    a.customer_id,
    a.customer_sk AS sk_1,
    a.effective_start_date AS start_1,
    a.effective_end_date AS end_1,
    b.customer_sk AS sk_2,
    b.effective_start_date AS start_2,
    b.effective_end_date AS end_2
  FROM silver.customer_master_golden a
  JOIN silver.customer_master_golden b
    ON a.customer_id = b.customer_id
    AND a.customer_sk != b.customer_sk
  WHERE (a.effective_start_date BETWEEN b.effective_start_date AND COALESCE(b.effective_end_date, '9999-12-31'))
    OR (b.effective_start_date BETWEEN a.effective_start_date AND COALESCE(a.effective_end_date, '9999-12-31'))
)
SELECT 
  'CUST_SILVER_DQ_007' AS check_id,
  'Consistency - SCD Type 2 Integrity' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(DISTINCT customer_id) FROM silver.customer_master_golden) AS total_customers,
  COUNT(DISTINCT customer_id) AS customers_with_overlapping_dates,
  COUNT(*) AS total_overlapping_records,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  LISTAGG(DISTINCT customer_id, ', ') WITHIN GROUP (ORDER BY customer_id) AS affected_customer_ids
FROM overlapping_records;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_008",
    checkName: "Customer Master Golden - Data Quality Score Distribution",
    tableName: "silver.customer_master_golden",
    checkType: "ACCURACY",
    severity: "WARNING",
    threshold: {
      passRate: 80.0,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify adequate data quality scores (>= 70)",
    sqlStatement: `
-- Data Quality Score Distribution
SELECT 
  'CUST_SILVER_DQ_008' AS check_id,
  'Accuracy - Data Quality Score' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  AVG(data_quality_score) AS avg_dq_score,
  MIN(data_quality_score) AS min_dq_score,
  MAX(data_quality_score) AS max_dq_score,
  SUM(CASE WHEN data_quality_score >= 70 THEN 1 ELSE 0 END) AS records_above_threshold,
  SUM(CASE WHEN data_quality_score < 70 THEN 1 ELSE 0 END) AS records_below_threshold,
  ROUND(100.0 * SUM(CASE WHEN data_quality_score >= 70 THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE WHEN data_quality_score >= 70 THEN 1 ELSE 0 END) / COUNT(*), 2) >= 80.0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM silver.customer_master_golden
WHERE is_current = TRUE
  AND data_quality_score IS NOT NULL;
    `,
  },
];

// ============================================================================
// CUSTOMER RELATIONSHIPS DQ CHECKS
// ============================================================================
export const customerRelationshipsDQChecks: DQCheck[] = [
  {
    checkId: "CUST_SILVER_DQ_009",
    checkName: "Customer Relationships - Referential Integrity to Master",
    tableName: "silver.customer_relationships",
    checkType: "CONSISTENCY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_GOLD_LOAD",
    },
    description: "Verify all customer_ids exist in customer_master_golden",
    sqlStatement: `
-- Referential Integrity Check
WITH orphaned_relationships AS (
  SELECT cr.customer_id
  FROM silver.customer_relationships cr
  LEFT JOIN silver.customer_master_golden cmg
    ON cr.customer_id = cmg.customer_id
    AND cmg.is_current = TRUE
  WHERE cr.is_current = TRUE
    AND cmg.customer_id IS NULL
)
SELECT 
  'CUST_SILVER_DQ_009' AS check_id,
  'Referential Integrity - customer_id' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(*) FROM silver.customer_relationships WHERE is_current = TRUE) AS total_relationships,
  COUNT(*) AS orphaned_relationships,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  LISTAGG(DISTINCT customer_id, ', ') WITHIN GROUP (ORDER BY customer_id) AS orphaned_customer_ids
FROM orphaned_relationships;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_010",
    checkName: "Customer Relationships - Valid Relationship Types",
    tableName: "silver.customer_relationships",
    checkType: "VALIDITY",
    severity: "WARNING",
    threshold: {
      passRate: 100.0,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify relationship_type contains only valid values",
    sqlStatement: `
-- Relationship Type Validation
SELECT 
  'CUST_SILVER_DQ_010' AS check_id,
  'Validity - Relationship Types' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_relationships,
  SUM(CASE 
    WHEN relationship_type IN ('OWNER', 'JOINT_OWNER', 'AUTHORIZED_USER', 'BENEFICIARY', 'POA', 'TRUSTEE')
    THEN 1 ELSE 0 
  END) AS valid_types,
  SUM(CASE 
    WHEN relationship_type NOT IN ('OWNER', 'JOINT_OWNER', 'AUTHORIZED_USER', 'BENEFICIARY', 'POA', 'TRUSTEE')
      OR relationship_type IS NULL
    THEN 1 ELSE 0 
  END) AS invalid_types,
  CASE 
    WHEN SUM(CASE 
      WHEN relationship_type NOT IN ('OWNER', 'JOINT_OWNER', 'AUTHORIZED_USER', 'BENEFICIARY', 'POA', 'TRUSTEE')
      THEN 1 ELSE 0 
    END) = 0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status,
  LISTAGG(DISTINCT relationship_type, ', ') WITHIN GROUP (ORDER BY relationship_type) AS invalid_type_values
FROM silver.customer_relationships
WHERE is_current = TRUE;
    `,
  },
];

// ============================================================================
// CUSTOMER CONTACT HISTORY DQ CHECKS
// ============================================================================
export const customerContactHistoryDQChecks: DQCheck[] = [
  {
    checkId: "CUST_SILVER_DQ_011",
    checkName: "Contact History - Change Type Validation",
    tableName: "silver.customer_contact_history",
    checkType: "VALIDITY",
    severity: "WARNING",
    threshold: {
      passRate: 100.0,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify change_type contains only valid values",
    sqlStatement: `
-- Change Type Validation
SELECT 
  'CUST_SILVER_DQ_011' AS check_id,
  'Validity - Change Types' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_changes,
  SUM(CASE 
    WHEN change_type IN ('NEW', 'UPDATE', 'DELETE', 'CORRECTION')
    THEN 1 ELSE 0 
  END) AS valid_change_types,
  SUM(CASE 
    WHEN change_type NOT IN ('NEW', 'UPDATE', 'DELETE', 'CORRECTION')
      OR change_type IS NULL
    THEN 1 ELSE 0 
  END) AS invalid_change_types,
  CASE 
    WHEN SUM(CASE 
      WHEN change_type NOT IN ('NEW', 'UPDATE', 'DELETE', 'CORRECTION')
      THEN 1 ELSE 0 
    END) = 0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM silver.customer_contact_history
WHERE is_current = TRUE;
    `,
  },
  {
    checkId: "CUST_SILVER_DQ_012",
    checkName: "Contact History - Tokenization Validation",
    tableName: "silver.customer_contact_history",
    checkType: "VALIDITY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_SECURITY_TEAM",
    },
    description: "Verify contact values are tokenized (not plain text)",
    sqlStatement: `
-- Tokenization Validation for PII
SELECT 
  'CUST_SILVER_DQ_012' AS check_id,
  'Validity - PII Tokenization' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_contact_changes,
  SUM(CASE 
    WHEN contact_value_new NOT REGEXP '@.*\\.(com|org|net|gov)'  -- Not a plain email
      AND contact_value_new NOT REGEXP '^\\+?[0-9]{10,15}$'       -- Not a plain phone
    THEN 1 ELSE 0 
  END) AS properly_tokenized,
  SUM(CASE 
    WHEN contact_value_new REGEXP '@.*\\.(com|org|net|gov)'
      OR contact_value_new REGEXP '^\\+?[0-9]{10,15}$'
    THEN 1 ELSE 0 
  END) AS potentially_plain_text,
  CASE 
    WHEN SUM(CASE 
      WHEN contact_value_new REGEXP '@.*\\.(com|org|net|gov)'
      THEN 1 ELSE 0 
    END) = 0
    THEN 'PASS' 
    ELSE 'FAIL - SECURITY VIOLATION' 
  END AS status
FROM silver.customer_contact_history
WHERE is_current = TRUE
  AND contact_type IN ('EMAIL', 'PHONE')
  AND contact_value_new IS NOT NULL;
    `,
  },
];

// ============================================================================
// CROSS-TABLE RECONCILIATION
// ============================================================================
export const customerSilverReconciliation: DQCheck = {
  checkId: "CUST_SILVER_DQ_999",
  checkName: "Silver Layer - Bronze to Silver Reconciliation",
  tableName: "silver.*",
  checkType: "CONSISTENCY",
  severity: "CRITICAL",
  threshold: {
    passRate: 99.0,
    action: "ALERT_IF_VARIANCE_EXCEEDS_1_PERCENT",
  },
  description:
    "Compare row counts between bronze and silver after deduplication",
  sqlStatement: `
-- Bronze to Silver Reconciliation
WITH bronze_counts AS (
  SELECT COUNT(DISTINCT CUSTOMER_ID) AS bronze_unique_customers
  FROM bronze.customer_master
  WHERE IS_CURRENT = TRUE
),
silver_counts AS (
  SELECT COUNT(DISTINCT customer_id) AS silver_unique_customers
  FROM silver.customer_master_golden
  WHERE is_current = TRUE
)
SELECT 
  'CUST_SILVER_DQ_999' AS check_id,
  'Bronze to Silver Reconciliation' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  bc.bronze_unique_customers,
  sc.silver_unique_customers,
  bc.bronze_unique_customers - sc.silver_unique_customers AS deduplication_reduction,
  ROUND(100.0 * (bc.bronze_unique_customers - sc.silver_unique_customers) / bc.bronze_unique_customers, 2) AS dedup_rate_pct,
  CASE 
    WHEN sc.silver_unique_customers >= bc.bronze_unique_customers * 0.70  -- Allow up to 30% deduplication
      AND sc.silver_unique_customers <= bc.bronze_unique_customers
    THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM bronze_counts bc
CROSS JOIN silver_counts sc;
  `,
};

// ============================================================================
// DQ CHECK CATALOG
// ============================================================================
export const customerSilverDQCatalog = {
  domain: "Customer Core",
  layer: "Silver",
  totalChecks: 13,

  checks: [
    ...customerMasterGoldenDQChecks,
    ...customerRelationshipsDQChecks,
    ...customerContactHistoryDQChecks,
    customerSilverReconciliation,
  ],

  checksByTable: {
    "silver.customer_master_golden": customerMasterGoldenDQChecks.length,
    "silver.customer_relationships": customerRelationshipsDQChecks.length,
    "silver.customer_contact_history": customerContactHistoryDQChecks.length,
  },

  execution: {
    schedule: "Daily at 05:00 UTC (post-silver transformation)",
    duration: "8-15 minutes",
    tool: "dbt tests / Great Expectations / Snowflake Tasks",
    resultTable: "control.dq_results_silver_customer",
  },

  alerting: {
    critical:
      "PagerDuty + Email to Data Engineering + Security Team (for PII violations)",
    warning: "Email to Data Stewards",
    info: "Dashboard only",
  },

  remediation: {
    failedChecks:
      "Quarantine failed records, block Gold load, investigate MDM rules",
    warningChecks: "Log for data steward review, allow Gold load",
    autoRemediation: "Rerun transformation for transient failures",
  },
};

export default customerSilverDQCatalog;
