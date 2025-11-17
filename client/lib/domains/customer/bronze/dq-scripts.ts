/**
 * CUSTOMER DOMAIN - BRONZE LAYER - DATA QUALITY SCRIPTS
 * 
 * Data quality validation checks for Bronze layer customer tables
 * Executed: Post-load, daily at 03:00 UTC
 * Purpose: Ensure data integrity before Silver layer transformation
 */

export interface DQCheck {
  checkId: string;
  checkName: string;
  tableName: string;
  checkType: "COMPLETENESS" | "UNIQUENESS" | "VALIDITY" | "CONSISTENCY" | "TIMELINESS";
  severity: "CRITICAL" | "WARNING" | "INFO";
  sqlStatement: string;
  threshold: {
    passRate: number;
    action: string;
  };
  description: string;
}

// ============================================================================
// CUSTOMER MASTER DQ CHECKS
// ============================================================================
export const customerMasterDQChecks: DQCheck[] = [
  {
    checkId: "CUST_BRONZE_DQ_001",
    checkName: "Customer Master - Completeness Check",
    tableName: "bronze.customer_master",
    checkType: "COMPLETENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 99.5,
      action: "ALERT_AND_BLOCK_SILVER_LOAD"
    },
    description: "Verify all mandatory fields are populated in customer master",
    sqlStatement: `
-- Customer Master Completeness Check
-- Validates that critical fields are not NULL

SELECT 
  'CUST_BRONZE_DQ_001' AS check_id,
  'Completeness - Customer Master' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN CUSTOMER_ID IS NOT NULL 
      AND CUSTOMER_STATUS IS NOT NULL
      AND PRCS_DTE IS NOT NULL
      AND _LOAD_ID IS NOT NULL
    THEN 1 ELSE 0 
  END) AS passed_records,
  SUM(CASE 
    WHEN CUSTOMER_ID IS NULL 
      OR CUSTOMER_STATUS IS NULL
      OR PRCS_DTE IS NULL
      OR _LOAD_ID IS NULL
    THEN 1 ELSE 0 
  END) AS failed_records,
  ROUND(100.0 * SUM(CASE 
    WHEN CUSTOMER_ID IS NOT NULL 
      AND CUSTOMER_STATUS IS NOT NULL
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE WHEN CUSTOMER_ID IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) >= 99.5 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status
FROM bronze.customer_master
WHERE PRCS_DTE = CURRENT_DATE()
  AND IS_CURRENT = TRUE;
    `
  },
  {
    checkId: "CUST_BRONZE_DQ_002",
    checkName: "Customer Master - Uniqueness Check",
    tableName: "bronze.customer_master",
    checkType: "UNIQUENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_SILVER_LOAD"
    },
    description: "Verify no duplicate CUSTOMER_IDs exist within same load date",
    sqlStatement: `
-- Customer Master Uniqueness Check
-- Detects duplicate CUSTOMER_IDs

WITH duplicates AS (
  SELECT 
    CUSTOMER_ID,
    COUNT(*) AS occurrence_count
  FROM bronze.customer_master
  WHERE PRCS_DTE = CURRENT_DATE()
    AND IS_CURRENT = TRUE
  GROUP BY CUSTOMER_ID
  HAVING COUNT(*) > 1
)
SELECT 
  'CUST_BRONZE_DQ_002' AS check_id,
  'Uniqueness - Customer Master' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(DISTINCT CUSTOMER_ID) FROM bronze.customer_master WHERE PRCS_DTE = CURRENT_DATE()) AS total_customers,
  COALESCE(SUM(occurrence_count), 0) AS duplicate_records,
  COUNT(*) AS unique_customers_with_duplicates,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM duplicates;
    `
  },
  {
    checkId: "CUST_BRONZE_DQ_003",
    checkName: "Customer Master - Valid Status Codes",
    tableName: "bronze.customer_master",
    checkType: "VALIDITY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_QUARANTINE_INVALID_RECORDS"
    },
    description: "Verify CUSTOMER_STATUS contains only valid codes",
    sqlStatement: `
-- Customer Master Status Validity Check

SELECT 
  'CUST_BRONZE_DQ_003' AS check_id,
  'Validity - Customer Status' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN CUSTOMER_STATUS IN ('ACTIVE', 'INACTIVE', 'DECEASED', 'CLOSED') 
    THEN 1 ELSE 0 
  END) AS valid_status_count,
  SUM(CASE 
    WHEN CUSTOMER_STATUS NOT IN ('ACTIVE', 'INACTIVE', 'DECEASED', 'CLOSED') 
      OR CUSTOMER_STATUS IS NULL
    THEN 1 ELSE 0 
  END) AS invalid_status_count,
  ROUND(100.0 * SUM(CASE 
    WHEN CUSTOMER_STATUS IN ('ACTIVE', 'INACTIVE', 'DECEASED', 'CLOSED') 
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN SUM(CASE WHEN CUSTOMER_STATUS NOT IN ('ACTIVE', 'INACTIVE', 'DECEASED', 'CLOSED') THEN 1 ELSE 0 END) = 0
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status,
  LISTAGG(DISTINCT CUSTOMER_STATUS, ', ') AS invalid_status_values
FROM bronze.customer_master
WHERE PRCS_DTE = CURRENT_DATE()
  AND IS_CURRENT = TRUE;
    `
  },
  {
    checkId: "CUST_BRONZE_DQ_004",
    checkName: "Customer Master - Date Logic Validation",
    tableName: "bronze.customer_master",
    checkType: "CONSISTENCY",
    severity: "WARNING",
    threshold: {
      passRate: 98.0,
      action: "ALERT_ONLY"
    },
    description: "Verify CUSTOMER_SINCE_DATE is not in future",
    sqlStatement: `
-- Customer Master Date Logic Check

SELECT 
  'CUST_BRONZE_DQ_004' AS check_id,
  'Consistency - Customer Since Date' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN CUSTOMER_SINCE_DATE IS NULL OR CUSTOMER_SINCE_DATE <= CURRENT_DATE() 
    THEN 1 ELSE 0 
  END) AS valid_dates,
  SUM(CASE 
    WHEN CUSTOMER_SINCE_DATE > CURRENT_DATE() 
    THEN 1 ELSE 0 
  END) AS future_dates,
  ROUND(100.0 * SUM(CASE 
    WHEN CUSTOMER_SINCE_DATE IS NULL OR CUSTOMER_SINCE_DATE <= CURRENT_DATE() 
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN SUM(CASE WHEN CUSTOMER_SINCE_DATE > CURRENT_DATE() THEN 1 ELSE 0 END) = 0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM bronze.customer_master
WHERE PRCS_DTE = CURRENT_DATE()
  AND IS_CURRENT = TRUE;
    `
  }
];

// ============================================================================
// CUSTOMER IDENTIFIERS DQ CHECKS
// ============================================================================
export const customerIdentifiersDQChecks: DQCheck[] = [
  {
    checkId: "CUST_BRONZE_DQ_005",
    checkName: "Customer Identifiers - Referential Integrity",
    tableName: "bronze.customer_identifiers",
    checkType: "CONSISTENCY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_SILVER_LOAD"
    },
    description: "Verify all CUSTOMER_IDs exist in customer_master",
    sqlStatement: `
-- Customer Identifiers Referential Integrity Check

WITH orphaned_ids AS (
  SELECT ci.CUSTOMER_ID
  FROM bronze.customer_identifiers ci
  LEFT JOIN bronze.customer_master cm 
    ON ci.CUSTOMER_ID = cm.CUSTOMER_ID 
    AND cm.IS_CURRENT = TRUE
  WHERE ci.PRCS_DTE = CURRENT_DATE()
    AND ci.IS_CURRENT = TRUE
    AND cm.CUSTOMER_ID IS NULL
)
SELECT 
  'CUST_BRONZE_DQ_005' AS check_id,
  'Referential Integrity - Customer IDs' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(*) FROM bronze.customer_identifiers WHERE PRCS_DTE = CURRENT_DATE()) AS total_id_records,
  COUNT(*) AS orphaned_records,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  LISTAGG(CUSTOMER_ID, ', ') WITHIN GROUP (ORDER BY CUSTOMER_ID) AS orphaned_customer_ids
FROM orphaned_ids;
    `
  }
];

// ============================================================================
// ROW COUNT RECONCILIATION
// ============================================================================
export const customerBronzeReconciliation: DQCheck = {
  checkId: "CUST_BRONZE_DQ_999",
  checkName: "Bronze Layer - Row Count Reconciliation",
  tableName: "bronze.*",
  checkType: "TIMELINESS",
  severity: "CRITICAL",
  threshold: {
    passRate: 99.0,
    action: "ALERT_IF_VARIANCE_EXCEEDS_1_PERCENT"
  },
  description: "Compare row counts between source and bronze tables",
  sqlStatement: `
-- Row Count Reconciliation: FIS Source vs Bronze

WITH source_counts AS (
  SELECT 
    'TB_CI_OZ6_CUST_ARD' AS source_table,
    COUNT(*) AS source_count
  FROM FIS_RAW.TB_CI_OZ6_CUST_ARD
  WHERE PRCS_DTE = CURRENT_DATE()
),
bronze_counts AS (
  SELECT 
    'bronze.customer_master' AS bronze_table,
    COUNT(*) AS bronze_count
  FROM bronze.customer_master
  WHERE PRCS_DTE = CURRENT_DATE()
    AND IS_CURRENT = TRUE
)
SELECT 
  'CUST_BRONZE_DQ_999' AS check_id,
  'Row Count Reconciliation' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  sc.source_table,
  bc.bronze_table,
  sc.source_count,
  bc.bronze_count,
  sc.source_count - bc.bronze_count AS row_difference,
  ROUND(100.0 * ABS(sc.source_count - bc.bronze_count) / NULLIF(sc.source_count, 0), 2) AS variance_pct,
  CASE 
    WHEN ABS(sc.source_count - bc.bronze_count) <= (sc.source_count * 0.01) THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM source_counts sc
CROSS JOIN bronze_counts bc;
  `
};

// ============================================================================
// DQ CHECK CATALOG
// ============================================================================
export const customerBronzeDQCatalog = {
  domain: "Customer Core",
  layer: "Bronze",
  totalChecks: 6,
  
  checks: [
    ...customerMasterDQChecks,
    ...customerIdentifiersDQChecks,
    customerBronzeReconciliation
  ],
  
  execution: {
    schedule: "Daily at 03:00 UTC (post-load)",
    duration: "5-10 minutes",
    tool: "dbt tests / Great Expectations / custom SQL",
    resultTable: "control.dq_results_bronze_customer"
  },
  
  alerting: {
    critical: "PagerDuty + Email to Data Engineering",
    warning: "Email to Data Stewards",
    info: "Dashboard only"
  },
  
  remediation: {
    failedChecks: "Quarantine failed records, block Silver load",
    warningChecks: "Log for manual review, allow Silver load to proceed",
    autoRemediation: "Retry load for transient failures"
  }
};

export default customerBronzeDQCatalog;
