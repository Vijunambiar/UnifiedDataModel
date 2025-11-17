/**
 * DEPOSITS DOMAIN - GOLD LAYER - DATA QUALITY SCRIPTS
 *
 * Data quality validation for gold layer deposit facts and aggregations
 * Executed: Post-aggregation, daily at 07:30 UTC
 */

export interface MetricDQCheck {
  checkId: string;
  checkName: string;
  metricTable: string;
  checkType: "ACCURACY" | "COMPLETENESS" | "CONSISTENCY" | "BUSINESS_LOGIC";
  severity: "CRITICAL" | "WARNING";
  sqlStatement: string;
  threshold: { passRate: number; action: string };
  description: string;
}

export const depositDailyBalanceFactDQChecks: MetricDQCheck[] = [
  {
    checkId: "DEP_GOLD_DQ_001",
    checkName: "Daily Balance Fact - Completeness",
    metricTable: "ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE",
    checkType: "COMPLETENESS",
    severity: "CRITICAL",
    threshold: { passRate: 99.0, action: "ALERT_AND_INVESTIGATE" },
    description: "Verify all active accounts have daily balance records",
    sqlStatement: `
WITH active_accounts AS (
  SELECT DISTINCT account_id FROM silver.deposit_account WHERE is_current = TRUE AND account_status = 'ACTIVE'
),
gold_accounts AS (
  SELECT DISTINCT account_id FROM ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE WHERE balance_date = CURRENT_DATE()
)
SELECT 
  'DEP_GOLD_DQ_001' AS check_id,
  (SELECT COUNT(*) FROM active_accounts) AS total_active,
  (SELECT COUNT(*) FROM gold_accounts) AS accounts_in_gold,
  CASE WHEN (SELECT COUNT(*) FROM gold_accounts) >= (SELECT COUNT(*) FROM active_accounts) * 0.99 THEN 'PASS' ELSE 'FAIL' END AS status
FROM dual;
    `,
  },
  {
    checkId: "DEP_GOLD_DQ_002",
    checkName: "Daily Balance Fact - Non-Negative Balances",
    metricTable: "ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE",
    checkType: "BUSINESS_LOGIC",
    severity: "WARNING",
    threshold: { passRate: 95.0, action: "ALERT_DATA_STEWARD" },
    description:
      "Verify balance amounts are reasonable (allow some overdrafts)",
    sqlStatement: `
SELECT 
  'DEP_GOLD_DQ_002' AS check_id,
  COUNT(*) AS total_records,
  SUM(CASE WHEN ending_balance >= -10000 THEN 1 ELSE 0 END) AS acceptable_balances,
  ROUND(100.0 * SUM(CASE WHEN ending_balance >= -10000 THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate_pct,
  CASE WHEN ROUND(100.0 * SUM(CASE WHEN ending_balance >= -10000 THEN 1 ELSE 0 END) / COUNT(*), 2) >= 95.0 THEN 'PASS' ELSE 'WARNING' END AS status
FROM ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE
WHERE balance_date = CURRENT_DATE();
    `,
  },
];

export const depositsGoldDQCatalog = {
  domain: "Deposits",
  layer: "Gold",
  totalChecks: 2,
  checks: [...depositDailyBalanceFactDQChecks],
  execution: {
    schedule: "Daily at 07:30 UTC",
    duration: "4-6 minutes",
    tool: "dbt tests / Snowflake Tasks",
    resultTable: "control.dq_results_gold_deposits",
  },
};

export default depositsGoldDQCatalog;
