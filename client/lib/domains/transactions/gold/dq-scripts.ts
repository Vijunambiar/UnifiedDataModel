/**
 * TRANSACTIONS DOMAIN - GOLD LAYER - DATA QUALITY SCRIPTS
 */

export interface MetricDQCheck {
  checkId: string;
  checkName: string;
  metricTable: string;
  checkType: "COMPLETENESS" | "BUSINESS_LOGIC";
  severity: "CRITICAL" | "WARNING";
  sqlStatement: string;
  threshold: { passRate: number; action: string };
  description: string;
}

export const transactionGoldDQChecks: MetricDQCheck[] = [
  {
    checkId: "TXN_GOLD_DQ_001",
    checkName: "Transaction Fact - Balanced Debits and Credits",
    metricTable: "ANALYTICS.FCT_DEPOSIT_ACCOUNT_TRANSACTION",
    checkType: "BUSINESS_LOGIC",
    severity: "CRITICAL",
    threshold: { passRate: 99.9, action: "ALERT_FINANCE_TEAM" },
    description:
      "Verify total debits approximately equal total credits (daily)",
    sqlStatement: `
WITH daily_totals AS (
  SELECT 
    SUM(CASE WHEN transaction_type IN ('DEPOSIT', 'INTEREST') THEN transaction_amount ELSE 0 END) AS total_credits,
    SUM(CASE WHEN transaction_type IN ('WITHDRAWAL', 'FEE') THEN transaction_amount ELSE 0 END) AS total_debits
  FROM ANALYTICS.FCT_DEPOSIT_ACCOUNT_TRANSACTION
  WHERE transaction_date = CURRENT_DATE()
)
SELECT 
  'TXN_GOLD_DQ_001' AS check_id,
  total_credits,
  total_debits,
  ABS(total_credits - total_debits) AS imbalance,
  ROUND(100.0 * ABS(total_credits - total_debits) / NULLIF(total_credits + total_debits, 0), 4) AS imbalance_pct,
  CASE WHEN ABS(total_credits - total_debits) / NULLIF(total_credits + total_debits, 0) <= 0.001 THEN 'PASS' ELSE 'FAIL' END AS status
FROM daily_totals;
    `,
  },
];

export const transactionsGoldDQCatalog = {
  domain: "Transactions",
  layer: "Gold",
  totalChecks: 1,
  checks: [...transactionGoldDQChecks],
  execution: {
    schedule: "Daily at 08:00 UTC",
    duration: "3-5 minutes",
    tool: "dbt tests",
    resultTable: "control.dq_results_gold_transactions",
  },
};

export default transactionsGoldDQCatalog;
