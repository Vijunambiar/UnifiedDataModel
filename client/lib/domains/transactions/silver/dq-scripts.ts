/**
 * TRANSACTIONS DOMAIN - SILVER LAYER - DATA QUALITY SCRIPTS
 */

export interface DQCheck {
  checkId: string;
  checkName: string;
  tableName: string;
  checkType: "COMPLETENESS" | "UNIQUENESS" | "CONSISTENCY";
  severity: "CRITICAL" | "WARNING";
  sqlStatement: string;
  threshold: { passRate: number; action: string };
  description: string;
}

export const transactionSilverDQChecks: DQCheck[] = [
  {
    checkId: "TXN_SILVER_DQ_001",
    checkName: "Transaction - Referential Integrity",
    tableName: "silver.transaction_fact",
    checkType: "CONSISTENCY",
    severity: "CRITICAL",
    threshold: { passRate: 100.0, action: "ALERT_AND_BLOCK_GOLD" },
    description: "Verify all account_ids exist in deposit_account",
    sqlStatement: `
WITH orphaned AS (
  SELECT tf.account_id FROM silver.transaction_fact tf
  LEFT JOIN silver.deposit_account da ON tf.account_id = da.account_id AND da.is_current = TRUE
  WHERE tf.transaction_date = CURRENT_DATE() AND da.account_id IS NULL
)
SELECT 
  'TXN_SILVER_DQ_001' AS check_id,
  COUNT(*) AS orphaned_txns,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM orphaned;
    `,
  },
];

export const transactionsSilverDQCatalog = {
  domain: "Transactions",
  layer: "Silver",
  totalChecks: 1,
  checks: [...transactionSilverDQChecks],
  execution: {
    schedule: "Hourly",
    duration: "2-3 minutes",
    tool: "dbt tests",
    resultTable: "control.dq_results_silver_transactions",
  },
};

export default transactionsSilverDQCatalog;
