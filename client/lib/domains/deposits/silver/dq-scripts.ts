/**
 * DEPOSITS DOMAIN - SILVER LAYER - DATA QUALITY SCRIPTS
 *
 * Data quality validation checks for Silver layer deposit tables
 * Executed: Post-transformation, daily at 05:30 UTC
 * Purpose: Ensure data quality after cleansing and conformation
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

export const depositAccountDQChecks: DQCheck[] = [
  {
    checkId: "DEP_SILVER_DQ_001",
    checkName: "Deposit Account - PK Uniqueness",
    tableName: "silver.deposit_account",
    checkType: "UNIQUENESS",
    severity: "CRITICAL",
    threshold: { passRate: 100.0, action: "ALERT_AND_BLOCK_GOLD_LOAD" },
    description: "Verify account_sk is unique",
    sqlStatement: `
SELECT 
  'DEP_SILVER_DQ_001' AS check_id,
  COUNT(*) AS total_records,
  COUNT(DISTINCT account_sk) AS unique_keys,
  CASE WHEN COUNT(*) = COUNT(DISTINCT account_sk) THEN 'PASS' ELSE 'FAIL' END AS status
FROM silver.deposit_account WHERE is_current = TRUE;
    `,
  },
  {
    checkId: "DEP_SILVER_DQ_002",
    checkName: "Deposit Account - SCD Type 2 Integrity",
    tableName: "silver.deposit_account",
    checkType: "CONSISTENCY",
    severity: "CRITICAL",
    threshold: { passRate: 100.0, action: "ALERT_AND_BLOCK_GOLD_LOAD" },
    description: "Verify no overlapping effective dates",
    sqlStatement: `
WITH overlaps AS (
  SELECT a.account_id FROM silver.deposit_account a
  JOIN silver.deposit_account b ON a.account_id = b.account_id AND a.account_sk != b.account_sk
  WHERE (a.effective_start_date BETWEEN b.effective_start_date AND COALESCE(b.effective_end_date, '9999-12-31'))
)
SELECT 
  'DEP_SILVER_DQ_002' AS check_id,
  COUNT(*) AS overlapping_records,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM overlaps;
    `,
  },
];

export const depositBalanceDQChecks: DQCheck[] = [
  {
    checkId: "DEP_SILVER_DQ_003",
    checkName: "Deposit Balance - Referential Integrity",
    tableName: "silver.deposit_balance",
    checkType: "CONSISTENCY",
    severity: "CRITICAL",
    threshold: { passRate: 100.0, action: "ALERT_AND_BLOCK_GOLD_LOAD" },
    description: "Verify all account_ids exist in deposit_account",
    sqlStatement: `
WITH orphaned AS (
  SELECT db.account_id FROM silver.deposit_balance db
  LEFT JOIN silver.deposit_account da ON db.account_id = da.account_id AND da.is_current = TRUE
  WHERE db.balance_date = CURRENT_DATE() AND da.account_id IS NULL
)
SELECT 
  'DEP_SILVER_DQ_003' AS check_id,
  COUNT(*) AS orphaned_records,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM orphaned;
    `,
  },
];

export const depositsSilverDQCatalog = {
  domain: "Deposits",
  layer: "Silver",
  totalChecks: 3,
  checks: [...depositAccountDQChecks, ...depositBalanceDQChecks],
  execution: {
    schedule: "Daily at 05:30 UTC",
    duration: "5-8 minutes",
    tool: "dbt tests / Snowflake Tasks",
    resultTable: "control.dq_results_silver_deposits",
  },
};

export default depositsSilverDQCatalog;
