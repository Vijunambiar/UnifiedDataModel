/**
 * TRANSACTIONS DOMAIN - BRONZE LAYER - DATA QUALITY SCRIPTS
 *
 * Data quality validation checks for Bronze layer transaction tables
 * Executed: Post-load, hourly for real-time feeds
 */

export interface DQCheck {
  checkId: string;
  checkName: string;
  tableName: string;
  checkType: "COMPLETENESS" | "UNIQUENESS" | "VALIDITY" | "CONSISTENCY";
  severity: "CRITICAL" | "WARNING";
  sqlStatement: string;
  threshold: { passRate: number; action: string };
  description: string;
}

export const transactionBronzeDQChecks: DQCheck[] = [
  {
    checkId: "TXN_BRONZE_DQ_001",
    checkName: "Transaction - Completeness Check",
    tableName: "bronze.account_transaction",
    checkType: "COMPLETENESS",
    severity: "CRITICAL",
    threshold: { passRate: 99.5, action: "ALERT_AND_QUARANTINE" },
    description: "Verify mandatory transaction fields",
    sqlStatement: `
SELECT 
  'TXN_BRONZE_DQ_001' AS check_id,
  COUNT(*) AS total_txns,
  SUM(CASE WHEN transaction_id IS NOT NULL AND account_id IS NOT NULL AND transaction_amount IS NOT NULL THEN 1 ELSE 0 END) AS complete_txns,
  ROUND(100.0 * SUM(CASE WHEN transaction_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate_pct,
  CASE WHEN ROUND(100.0 * SUM(CASE WHEN transaction_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) >= 99.5 THEN 'PASS' ELSE 'FAIL' END AS status
FROM bronze.account_transaction
WHERE transaction_date = CURRENT_DATE();
    `,
  },
  {
    checkId: "TXN_BRONZE_DQ_002",
    checkName: "Transaction - Valid Types",
    tableName: "bronze.account_transaction",
    checkType: "VALIDITY",
    severity: "CRITICAL",
    threshold: { passRate: 100.0, action: "ALERT_AND_QUARANTINE" },
    description: "Verify transaction_type contains valid values",
    sqlStatement: `
SELECT 
  'TXN_BRONZE_DQ_002' AS check_id,
  COUNT(*) AS total_txns,
  SUM(CASE WHEN transaction_type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'FEE', 'INTEREST', 'ADJUSTMENT') THEN 1 ELSE 0 END) AS valid_types,
  CASE WHEN SUM(CASE WHEN transaction_type NOT IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'FEE', 'INTEREST', 'ADJUSTMENT') THEN 1 ELSE 0 END) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM bronze.account_transaction
WHERE transaction_date = CURRENT_DATE();
    `,
  },
];

export const transactionsBronzeDQCatalog = {
  domain: "Transactions",
  layer: "Bronze",
  totalChecks: 2,
  checks: [...transactionBronzeDQChecks],
  execution: {
    schedule: "Hourly (real-time feed)",
    duration: "2-4 minutes",
    tool: "Streaming validation / dbt tests",
    resultTable: "control.dq_results_bronze_transactions",
  },
};

export default transactionsBronzeDQCatalog;
