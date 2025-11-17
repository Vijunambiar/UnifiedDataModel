/**
 * DEPOSITS DOMAIN - BRONZE LAYER - DATA QUALITY SCRIPTS
 *
 * Data quality validation checks for Bronze layer deposit tables
 * Executed: Post-load, daily at 03:30 UTC
 * Purpose: Ensure data integrity before Silver layer transformation
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
    | "TIMELINESS";
  severity: "CRITICAL" | "WARNING" | "INFO";
  sqlStatement: string;
  threshold: {
    passRate: number;
    action: string;
  };
  description: string;
}

// ============================================================================
// ACCOUNT MASTER DQ CHECKS
// ============================================================================
export const accountMasterDQChecks: DQCheck[] = [
  {
    checkId: "DEP_BRONZE_DQ_001",
    checkName: "Account Master - Completeness Check",
    tableName: "bronze.account_master",
    checkType: "COMPLETENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 99.5,
      action: "ALERT_AND_BLOCK_SILVER_LOAD",
    },
    description: "Verify all mandatory fields are populated in account master",
    sqlStatement: `
-- Account Master Completeness Check
SELECT 
  'DEP_BRONZE_DQ_001' AS check_id,
  'Completeness - Account Master' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN ACCOUNT_ID IS NOT NULL 
      AND ACCOUNT_STATUS IS NOT NULL
      AND ACCOUNT_TYPE IS NOT NULL
      AND CUSTOMER_ID IS NOT NULL
      AND PRCS_DTE IS NOT NULL
    THEN 1 ELSE 0 
  END) AS passed_records,
  SUM(CASE 
    WHEN ACCOUNT_ID IS NULL 
      OR ACCOUNT_STATUS IS NULL
      OR ACCOUNT_TYPE IS NULL
      OR CUSTOMER_ID IS NULL
    THEN 1 ELSE 0 
  END) AS failed_records,
  ROUND(100.0 * SUM(CASE 
    WHEN ACCOUNT_ID IS NOT NULL AND ACCOUNT_STATUS IS NOT NULL 
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE WHEN ACCOUNT_ID IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) >= 99.5 
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status
FROM bronze.account_master
WHERE PRCS_DTE = CURRENT_DATE()
  AND IS_CURRENT = TRUE;
    `,
  },
  {
    checkId: "DEP_BRONZE_DQ_002",
    checkName: "Account Master - Uniqueness Check",
    tableName: "bronze.account_master",
    checkType: "UNIQUENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_SILVER_LOAD",
    },
    description: "Verify no duplicate ACCOUNT_IDs exist",
    sqlStatement: `
-- Account Master Uniqueness Check
WITH duplicates AS (
  SELECT 
    ACCOUNT_ID,
    COUNT(*) AS occurrence_count
  FROM bronze.account_master
  WHERE PRCS_DTE = CURRENT_DATE()
    AND IS_CURRENT = TRUE
  GROUP BY ACCOUNT_ID
  HAVING COUNT(*) > 1
)
SELECT 
  'DEP_BRONZE_DQ_002' AS check_id,
  'Uniqueness - Account Master' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(DISTINCT ACCOUNT_ID) FROM bronze.account_master WHERE PRCS_DTE = CURRENT_DATE()) AS total_accounts,
  COALESCE(SUM(occurrence_count), 0) AS duplicate_records,
  COUNT(*) AS unique_accounts_with_duplicates,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM duplicates;
    `,
  },
  {
    checkId: "DEP_BRONZE_DQ_003",
    checkName: "Account Master - Valid Account Types",
    tableName: "bronze.account_master",
    checkType: "VALIDITY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_QUARANTINE_INVALID_RECORDS",
    },
    description: "Verify ACCOUNT_TYPE contains only valid codes",
    sqlStatement: `
-- Account Type Validity Check
SELECT 
  'DEP_BRONZE_DQ_003' AS check_id,
  'Validity - Account Type' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN ACCOUNT_TYPE IN ('CHECKING', 'SAVINGS', 'CD', 'MONEY_MARKET', 'IRA') 
    THEN 1 ELSE 0 
  END) AS valid_type_count,
  SUM(CASE 
    WHEN ACCOUNT_TYPE NOT IN ('CHECKING', 'SAVINGS', 'CD', 'MONEY_MARKET', 'IRA') 
      OR ACCOUNT_TYPE IS NULL
    THEN 1 ELSE 0 
  END) AS invalid_type_count,
  CASE 
    WHEN SUM(CASE WHEN ACCOUNT_TYPE NOT IN ('CHECKING', 'SAVINGS', 'CD', 'MONEY_MARKET', 'IRA') THEN 1 ELSE 0 END) = 0
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status
FROM bronze.account_master
WHERE PRCS_DTE = CURRENT_DATE();
    `,
  },
  {
    checkId: "DEP_BRONZE_DQ_004",
    checkName: "Account Master - Customer Referential Integrity",
    tableName: "bronze.account_master",
    checkType: "CONSISTENCY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_SILVER_LOAD",
    },
    description: "Verify all CUSTOMER_IDs exist in customer_master",
    sqlStatement: `
-- Customer Referential Integrity Check
WITH orphaned_accounts AS (
  SELECT am.ACCOUNT_ID, am.CUSTOMER_ID
  FROM bronze.account_master am
  LEFT JOIN bronze.customer_master cm 
    ON am.CUSTOMER_ID = cm.CUSTOMER_ID 
    AND cm.IS_CURRENT = TRUE
  WHERE am.PRCS_DTE = CURRENT_DATE()
    AND am.IS_CURRENT = TRUE
    AND cm.CUSTOMER_ID IS NULL
)
SELECT 
  'DEP_BRONZE_DQ_004' AS check_id,
  'Referential Integrity - Customer IDs' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(*) FROM bronze.account_master WHERE PRCS_DTE = CURRENT_DATE()) AS total_accounts,
  COUNT(*) AS orphaned_accounts,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM orphaned_accounts;
    `,
  },
];

// ============================================================================
// ACCOUNT BALANCE DQ CHECKS
// ============================================================================
export const accountBalanceDQChecks: DQCheck[] = [
  {
    checkId: "DEP_BRONZE_DQ_005",
    checkName: "Account Balance - Non-Negative Balances",
    tableName: "bronze.account_balance",
    checkType: "VALIDITY",
    severity: "WARNING",
    threshold: {
      passRate: 98.0,
      action: "ALERT_DATA_STEWARD",
    },
    description:
      "Verify account balances are non-negative (allow some overdrafts)",
    sqlStatement: `
-- Balance Validation Check
SELECT 
  'DEP_BRONZE_DQ_005' AS check_id,
  'Validity - Non-Negative Balances' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_balance_records,
  SUM(CASE WHEN CURRENT_BALANCE >= 0 THEN 1 ELSE 0 END) AS non_negative_balances,
  SUM(CASE WHEN CURRENT_BALANCE < 0 THEN 1 ELSE 0 END) AS negative_balances,
  SUM(CASE WHEN CURRENT_BALANCE < -10000 THEN 1 ELSE 0 END) AS excessive_overdrafts,
  ROUND(100.0 * SUM(CASE WHEN CURRENT_BALANCE >= -10000 THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE WHEN CURRENT_BALANCE >= -10000 THEN 1 ELSE 0 END) / COUNT(*), 2) >= 98.0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM bronze.account_balance
WHERE PRCS_DTE = CURRENT_DATE();
    `,
  },
  {
    checkId: "DEP_BRONZE_DQ_006",
    checkName: "Account Balance - Account Referential Integrity",
    tableName: "bronze.account_balance",
    checkType: "CONSISTENCY",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_SILVER_LOAD",
    },
    description: "Verify all ACCOUNT_IDs exist in account_master",
    sqlStatement: `
-- Account Referential Integrity Check
WITH orphaned_balances AS (
  SELECT ab.ACCOUNT_ID
  FROM bronze.account_balance ab
  LEFT JOIN bronze.account_master am 
    ON ab.ACCOUNT_ID = am.ACCOUNT_ID 
    AND am.IS_CURRENT = TRUE
  WHERE ab.PRCS_DTE = CURRENT_DATE()
    AND am.ACCOUNT_ID IS NULL
)
SELECT 
  'DEP_BRONZE_DQ_006' AS check_id,
  'Referential Integrity - Account IDs' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(*) FROM bronze.account_balance WHERE PRCS_DTE = CURRENT_DATE()) AS total_balance_records,
  COUNT(*) AS orphaned_balance_records,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM orphaned_balances;
    `,
  },
];

// ============================================================================
// TRANSACTION DQ CHECKS
// ============================================================================
export const accountTransactionDQChecks: DQCheck[] = [
  {
    checkId: "DEP_BRONZE_DQ_007",
    checkName: "Account Transaction - Completeness Check",
    tableName: "bronze.account_transaction",
    checkType: "COMPLETENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 99.0,
      action: "ALERT_AND_QUARANTINE",
    },
    description: "Verify mandatory transaction fields are populated",
    sqlStatement: `
-- Transaction Completeness Check
SELECT 
  'DEP_BRONZE_DQ_007' AS check_id,
  'Completeness - Transaction Fields' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_transactions,
  SUM(CASE 
    WHEN TRANSACTION_ID IS NOT NULL 
      AND ACCOUNT_ID IS NOT NULL
      AND TRANSACTION_DATE IS NOT NULL
      AND TRANSACTION_AMOUNT IS NOT NULL
      AND TRANSACTION_TYPE IS NOT NULL
    THEN 1 ELSE 0 
  END) AS complete_transactions,
  SUM(CASE 
    WHEN TRANSACTION_ID IS NULL 
      OR ACCOUNT_ID IS NULL
      OR TRANSACTION_AMOUNT IS NULL
    THEN 1 ELSE 0 
  END) AS incomplete_transactions,
  ROUND(100.0 * SUM(CASE 
    WHEN TRANSACTION_ID IS NOT NULL AND ACCOUNT_ID IS NOT NULL 
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN TRANSACTION_ID IS NOT NULL AND ACCOUNT_ID IS NOT NULL 
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 99.0
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status
FROM bronze.account_transaction
WHERE PRCS_DTE = CURRENT_DATE();
    `,
  },
  {
    checkId: "DEP_BRONZE_DQ_008",
    checkName: "Account Transaction - Non-Zero Amounts",
    tableName: "bronze.account_transaction",
    checkType: "VALIDITY",
    severity: "WARNING",
    threshold: {
      passRate: 99.5,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify transaction amounts are not zero",
    sqlStatement: `
-- Non-Zero Transaction Amounts
SELECT 
  'DEP_BRONZE_DQ_008' AS check_id,
  'Validity - Non-Zero Amounts' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_transactions,
  SUM(CASE WHEN TRANSACTION_AMOUNT != 0 THEN 1 ELSE 0 END) AS non_zero_amounts,
  SUM(CASE WHEN TRANSACTION_AMOUNT = 0 THEN 1 ELSE 0 END) AS zero_amounts,
  ROUND(100.0 * SUM(CASE WHEN TRANSACTION_AMOUNT != 0 THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE WHEN TRANSACTION_AMOUNT != 0 THEN 1 ELSE 0 END) / COUNT(*), 2) >= 99.5
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM bronze.account_transaction
WHERE PRCS_DTE = CURRENT_DATE();
    `,
  },
];

// ============================================================================
// ROW COUNT RECONCILIATION
// ============================================================================
export const depositsBronzeReconciliation: DQCheck = {
  checkId: "DEP_BRONZE_DQ_999",
  checkName: "Bronze Layer - Row Count Reconciliation",
  tableName: "bronze.*",
  checkType: "TIMELINESS",
  severity: "CRITICAL",
  threshold: {
    passRate: 99.0,
    action: "ALERT_IF_VARIANCE_EXCEEDS_1_PERCENT",
  },
  description: "Compare row counts between source and bronze tables",
  sqlStatement: `
-- Row Count Reconciliation: FIS Source vs Bronze
WITH source_counts AS (
  SELECT 
    'TB_ACCOUNT_MASTER' AS source_table,
    COUNT(*) AS source_count
  FROM FIS_RAW.TB_ACCOUNT_MASTER
  WHERE PRCS_DTE = CURRENT_DATE()
),
bronze_counts AS (
  SELECT 
    'bronze.account_master' AS bronze_table,
    COUNT(*) AS bronze_count
  FROM bronze.account_master
  WHERE PRCS_DTE = CURRENT_DATE()
    AND IS_CURRENT = TRUE
)
SELECT 
  'DEP_BRONZE_DQ_999' AS check_id,
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
  `,
};

// ============================================================================
// DQ CHECK CATALOG
// ============================================================================
export const depositsBronzeDQCatalog = {
  domain: "Deposits",
  layer: "Bronze",
  totalChecks: 9,

  checks: [
    ...accountMasterDQChecks,
    ...accountBalanceDQChecks,
    ...accountTransactionDQChecks,
    depositsBronzeReconciliation,
  ],

  checksByTable: {
    "bronze.account_master": accountMasterDQChecks.length,
    "bronze.account_balance": accountBalanceDQChecks.length,
    "bronze.account_transaction": accountTransactionDQChecks.length,
  },

  execution: {
    schedule: "Daily at 03:30 UTC (post-load)",
    duration: "6-12 minutes",
    tool: "dbt tests / Great Expectations / custom SQL",
    resultTable: "control.dq_results_bronze_deposits",
  },

  alerting: {
    critical: "PagerDuty + Email to Data Engineering",
    warning: "Email to Data Stewards",
    info: "Dashboard only",
  },

  remediation: {
    failedChecks: "Quarantine failed records, block Silver load",
    warningChecks: "Log for manual review, allow Silver load to proceed",
    autoRemediation: "Retry load for transient failures",
  },
};

export default depositsBronzeDQCatalog;
