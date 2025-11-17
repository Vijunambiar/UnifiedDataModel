/**
 * CUSTOMER DOMAIN - GOLD LAYER - DATA QUALITY SCRIPTS
 *
 * Data quality validation for gold layer aggregations and metrics
 * Purpose: Ensure metric accuracy, completeness, and business logic correctness
 * Executed: Post-aggregation, daily at 07:00 UTC
 */

export interface MetricDQCheck {
  checkId: string;
  checkName: string;
  metricTable: string;
  checkType:
    | "ACCURACY"
    | "COMPLETENESS"
    | "CONSISTENCY"
    | "TIMELINESS"
    | "BUSINESS_LOGIC";
  severity: "CRITICAL" | "WARNING" | "INFO";
  sqlStatement: string;
  threshold: {
    passRate: number;
    action: string;
  };
  description: string;
}

// ============================================================================
// CUSTOMER_DEPOSIT_AGGR DQ CHECKS
// ============================================================================
export const customerDepositAggrDQChecks: MetricDQCheck[] = [
  {
    checkId: "CUST_GOLD_DQ_001",
    checkName: "Customer Deposit Aggr - Completeness Check",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "COMPLETENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 99.0,
      action: "ALERT_AND_BLOCK_BI_REFRESH",
    },
    description: "Verify all active customers have aggregation records",
    sqlStatement: `
-- Completeness: All active customers should have aggregation records
WITH active_customers AS (
  SELECT DISTINCT customer_id
  FROM silver.customer_master_golden
  WHERE is_current = TRUE
    AND customer_status = 'ACTIVE'
),
gold_customers AS (
  SELECT DISTINCT CUSTOMER_NUMBER
  FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
  WHERE PRCS_DTE = CURRENT_DATE()
)
SELECT 
  'CUST_GOLD_DQ_001' AS check_id,
  'Completeness - Customer Coverage' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(*) FROM active_customers) AS total_active_customers,
  (SELECT COUNT(*) FROM gold_customers) AS customers_in_gold,
  (SELECT COUNT(*) FROM active_customers) - (SELECT COUNT(*) FROM gold_customers) AS missing_customers,
  ROUND(100.0 * (SELECT COUNT(*) FROM gold_customers) / (SELECT COUNT(*) FROM active_customers), 2) AS coverage_pct,
  CASE 
    WHEN ROUND(100.0 * (SELECT COUNT(*) FROM gold_customers) / (SELECT COUNT(*) FROM active_customers), 2) >= 99.0
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status;
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_002",
    checkName: "Customer Deposit Aggr - No Negative Account Counts",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "BUSINESS_LOGIC",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_QUARANTINE",
    },
    description: "Verify account counts are non-negative",
    sqlStatement: `
-- Business Logic: Account counts must be >= 0
SELECT 
  'CUST_GOLD_DQ_002' AS check_id,
  'Business Logic - Non-Negative Account Counts' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN ACC_TOTAL_ACCOUNTS >= 0
      AND ACC_SAVINGS_ACC_CNT >= 0
      AND ACC_CHECKING_ACC_CNT >= 0
      AND ACC_CD_ACC_CNT >= 0
    THEN 1 ELSE 0 
  END) AS valid_records,
  SUM(CASE 
    WHEN ACC_TOTAL_ACCOUNTS < 0
      OR ACC_SAVINGS_ACC_CNT < 0
      OR ACC_CHECKING_ACC_CNT < 0
      OR ACC_CD_ACC_CNT < 0
    THEN 1 ELSE 0 
  END) AS invalid_records,
  CASE 
    WHEN SUM(CASE 
      WHEN ACC_TOTAL_ACCOUNTS < 0 THEN 1 ELSE 0 
    END) = 0
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status
FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
WHERE PRCS_DTE = CURRENT_DATE();
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_003",
    checkName: "Customer Deposit Aggr - Balance Amounts Validation",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "BUSINESS_LOGIC",
    severity: "CRITICAL",
    threshold: {
      passRate: 99.9,
      action: "ALERT_AND_INVESTIGATE",
    },
    description: "Verify balance amounts are within reasonable ranges",
    sqlStatement: `
-- Business Logic: Balance amounts validation
SELECT 
  'CUST_GOLD_DQ_003' AS check_id,
  'Business Logic - Balance Validation' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN BAL_TOTAL_BALANCE >= 0
      AND BAL_TOTAL_BALANCE <= 100000000  -- $100M max per customer (reasonable limit)
    THEN 1 ELSE 0 
  END) AS valid_balances,
  SUM(CASE 
    WHEN BAL_TOTAL_BALANCE < 0 THEN 1 ELSE 0 
  END) AS negative_balances,
  SUM(CASE 
    WHEN BAL_TOTAL_BALANCE > 100000000 THEN 1 ELSE 0 
  END) AS excessive_balances,
  ROUND(100.0 * SUM(CASE 
    WHEN BAL_TOTAL_BALANCE >= 0 AND BAL_TOTAL_BALANCE <= 100000000 
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN BAL_TOTAL_BALANCE >= 0 AND BAL_TOTAL_BALANCE <= 100000000 
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 99.9
    THEN 'PASS' 
    ELSE 'FAIL' 
  END AS status
FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
WHERE PRCS_DTE = CURRENT_DATE();
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_004",
    checkName: "Customer Deposit Aggr - Total vs Sum Components Check",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "CONSISTENCY",
    severity: "WARNING",
    threshold: {
      passRate: 95.0,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify total account count equals sum of account type counts",
    sqlStatement: `
-- Consistency: Total accounts = sum of account types
SELECT 
  'CUST_GOLD_DQ_004' AS check_id,
  'Consistency - Account Count Rollup' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN ACC_TOTAL_ACCOUNTS = (
      COALESCE(ACC_SAVINGS_ACC_CNT, 0) + 
      COALESCE(ACC_CHECKING_ACC_CNT, 0) + 
      COALESCE(ACC_CD_ACC_CNT, 0) + 
      COALESCE(ACC_MONEY_MARKET_ACC_CNT, 0)
    )
    THEN 1 ELSE 0 
  END) AS consistent_records,
  SUM(CASE 
    WHEN ACC_TOTAL_ACCOUNTS != (
      COALESCE(ACC_SAVINGS_ACC_CNT, 0) + 
      COALESCE(ACC_CHECKING_ACC_CNT, 0) + 
      COALESCE(ACC_CD_ACC_CNT, 0) + 
      COALESCE(ACC_MONEY_MARKET_ACC_CNT, 0)
    )
    THEN 1 ELSE 0 
  END) AS inconsistent_records,
  ROUND(100.0 * SUM(CASE 
    WHEN ACC_TOTAL_ACCOUNTS = (
      COALESCE(ACC_SAVINGS_ACC_CNT, 0) + 
      COALESCE(ACC_CHECKING_ACC_CNT, 0) + 
      COALESCE(ACC_CD_ACC_CNT, 0) + 
      COALESCE(ACC_MONEY_MARKET_ACC_CNT, 0)
    )
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN ACC_TOTAL_ACCOUNTS = (
        COALESCE(ACC_SAVINGS_ACC_CNT, 0) + 
        COALESCE(ACC_CHECKING_ACC_CNT, 0) + 
        COALESCE(ACC_CD_ACC_CNT, 0) + 
        COALESCE(ACC_MONEY_MARKET_ACC_CNT, 0)
      )
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 95.0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
WHERE PRCS_DTE = CURRENT_DATE();
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_005",
    checkName: "Customer Deposit Aggr - Transaction Count Validation",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "BUSINESS_LOGIC",
    severity: "WARNING",
    threshold: {
      passRate: 98.0,
      action: "ALERT_DATA_STEWARD",
    },
    description:
      "Verify transaction counts are reasonable (not excessively high)",
    sqlStatement: `
-- Business Logic: Transaction count validation
SELECT 
  'CUST_GOLD_DQ_005' AS check_id,
  'Business Logic - Transaction Count' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  AVG(TXN_TOTAL_TRANSACTIONS_30D) AS avg_txn_30d,
  MAX(TXN_TOTAL_TRANSACTIONS_30D) AS max_txn_30d,
  SUM(CASE 
    WHEN TXN_TOTAL_TRANSACTIONS_30D >= 0
      AND TXN_TOTAL_TRANSACTIONS_30D <= 10000  -- Max 10K txns per month per customer
    THEN 1 ELSE 0 
  END) AS reasonable_txn_counts,
  SUM(CASE 
    WHEN TXN_TOTAL_TRANSACTIONS_30D > 10000 THEN 1 ELSE 0 
  END) AS excessive_txn_counts,
  ROUND(100.0 * SUM(CASE 
    WHEN TXN_TOTAL_TRANSACTIONS_30D >= 0 AND TXN_TOTAL_TRANSACTIONS_30D <= 10000 
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN TXN_TOTAL_TRANSACTIONS_30D >= 0 AND TXN_TOTAL_TRANSACTIONS_30D <= 10000 
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 98.0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
WHERE PRCS_DTE = CURRENT_DATE()
  AND TXN_TOTAL_TRANSACTIONS_30D IS NOT NULL;
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_006",
    checkName: "Customer Deposit Aggr - Tenure Calculation Accuracy",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "ACCURACY",
    severity: "WARNING",
    threshold: {
      passRate: 99.0,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify average tenure calculation is accurate",
    sqlStatement: `
-- Accuracy: Tenure validation
SELECT 
  'CUST_GOLD_DQ_006' AS check_id,
  'Accuracy - Average Tenure' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  AVG(ACC_AVERAGE_TENURE_YEARS) AS avg_tenure_years,
  SUM(CASE 
    WHEN ACC_AVERAGE_TENURE_YEARS >= 0
      AND ACC_AVERAGE_TENURE_YEARS <= 100  -- Max 100 years
    THEN 1 ELSE 0 
  END) AS valid_tenure,
  SUM(CASE 
    WHEN ACC_AVERAGE_TENURE_YEARS < 0
      OR ACC_AVERAGE_TENURE_YEARS > 100
    THEN 1 ELSE 0 
  END) AS invalid_tenure,
  ROUND(100.0 * SUM(CASE 
    WHEN ACC_AVERAGE_TENURE_YEARS >= 0 AND ACC_AVERAGE_TENURE_YEARS <= 100 
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN ACC_AVERAGE_TENURE_YEARS >= 0 AND ACC_AVERAGE_TENURE_YEARS <= 100 
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 99.0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
WHERE PRCS_DTE = CURRENT_DATE()
  AND ACC_AVERAGE_TENURE_YEARS IS NOT NULL;
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_007",
    checkName: "Customer Deposit Aggr - Risk Segment Distribution",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "BUSINESS_LOGIC",
    severity: "INFO",
    threshold: {
      passRate: 100.0,
      action: "MONITOR_ONLY",
    },
    description: "Monitor risk segment distribution for anomalies",
    sqlStatement: `
-- Business Logic: Risk segment distribution monitoring
SELECT 
  'CUST_GOLD_DQ_007' AS check_id,
  'Business Logic - Risk Segment Distribution' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_customers,
  SUM(CASE WHEN RISK_SEGMENT = 'LOW' THEN 1 ELSE 0 END) AS low_risk_count,
  SUM(CASE WHEN RISK_SEGMENT = 'MEDIUM' THEN 1 ELSE 0 END) AS medium_risk_count,
  SUM(CASE WHEN RISK_SEGMENT = 'HIGH' THEN 1 ELSE 0 END) AS high_risk_count,
  ROUND(100.0 * SUM(CASE WHEN RISK_SEGMENT = 'LOW' THEN 1 ELSE 0 END) / COUNT(*), 2) AS low_risk_pct,
  ROUND(100.0 * SUM(CASE WHEN RISK_SEGMENT = 'MEDIUM' THEN 1 ELSE 0 END) / COUNT(*), 2) AS medium_risk_pct,
  ROUND(100.0 * SUM(CASE WHEN RISK_SEGMENT = 'HIGH' THEN 1 ELSE 0 END) / COUNT(*), 2) AS high_risk_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE WHEN RISK_SEGMENT = 'HIGH' THEN 1 ELSE 0 END) / COUNT(*), 2) <= 10.0
    THEN 'PASS' 
    ELSE 'INFO - HIGH RISK ABOVE THRESHOLD' 
  END AS status
FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
WHERE PRCS_DTE = CURRENT_DATE()
  AND RISK_SEGMENT IS NOT NULL;
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_008",
    checkName: "Customer Deposit Aggr - Data Freshness Check",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "TIMELINESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_IF_DATA_STALE",
    },
    description: "Verify data is from current processing date",
    sqlStatement: `
-- Timeliness: Data freshness validation
SELECT 
  'CUST_GOLD_DQ_008' AS check_id,
  'Timeliness - Data Freshness' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  MAX(PRCS_DTE) AS latest_data_date,
  CURRENT_DATE() AS expected_date,
  DATEDIFF(day, MAX(PRCS_DTE), CURRENT_DATE()) AS days_lag,
  COUNT(*) AS total_records,
  SUM(CASE WHEN PRCS_DTE = CURRENT_DATE() THEN 1 ELSE 0 END) AS current_date_records,
  CASE 
    WHEN MAX(PRCS_DTE) = CURRENT_DATE() THEN 'PASS'
    WHEN DATEDIFF(day, MAX(PRCS_DTE), CURRENT_DATE()) = 1 THEN 'WARNING - 1 DAY LAG'
    ELSE 'FAIL - DATA STALE' 
  END AS status
FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR;
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_009",
    checkName: "Customer Deposit Aggr - Duplicate Customer Check",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "COMPLETENESS",
    severity: "CRITICAL",
    threshold: {
      passRate: 100.0,
      action: "ALERT_AND_BLOCK_BI_REFRESH",
    },
    description:
      "Verify no duplicate customer records for same processing date",
    sqlStatement: `
-- Uniqueness: No duplicate customers
WITH duplicates AS (
  SELECT 
    CUSTOMER_NUMBER,
    PRCS_DTE,
    COUNT(*) AS record_count
  FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
  WHERE PRCS_DTE = CURRENT_DATE()
  GROUP BY CUSTOMER_NUMBER, PRCS_DTE
  HAVING COUNT(*) > 1
)
SELECT 
  'CUST_GOLD_DQ_009' AS check_id,
  'Uniqueness - No Duplicate Customers' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  (SELECT COUNT(DISTINCT CUSTOMER_NUMBER) FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR WHERE PRCS_DTE = CURRENT_DATE()) AS unique_customers,
  COALESCE(SUM(record_count), 0) AS duplicate_records,
  COUNT(*) AS customers_with_duplicates,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  LISTAGG(CUSTOMER_NUMBER, ', ') WITHIN GROUP (ORDER BY CUSTOMER_NUMBER) AS duplicate_customer_numbers
FROM duplicates;
    `,
  },
  {
    checkId: "CUST_GOLD_DQ_010",
    checkName: "Customer Deposit Aggr - Derived Fields Logic Check",
    metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
    checkType: "CONSISTENCY",
    severity: "WARNING",
    threshold: {
      passRate: 98.0,
      action: "ALERT_DATA_STEWARD",
    },
    description: "Verify derived field calculations are consistent",
    sqlStatement: `
-- Consistency: Derived field logic validation
SELECT 
  'CUST_GOLD_DQ_010' AS check_id,
  'Consistency - Derived Fields' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  COUNT(*) AS total_records,
  SUM(CASE 
    WHEN (BAL_AVERAGE_BALANCE_30D IS NULL AND TXN_TOTAL_TRANSACTIONS_30D = 0)
      OR (BAL_AVERAGE_BALANCE_30D IS NOT NULL AND TXN_TOTAL_TRANSACTIONS_30D > 0)
    THEN 1 ELSE 0 
  END) AS logically_consistent,
  SUM(CASE 
    WHEN BAL_AVERAGE_BALANCE_30D IS NOT NULL 
      AND TXN_TOTAL_TRANSACTIONS_30D = 0
    THEN 1 ELSE 0 
  END) AS logic_inconsistencies,
  ROUND(100.0 * SUM(CASE 
    WHEN (BAL_AVERAGE_BALANCE_30D IS NULL AND TXN_TOTAL_TRANSACTIONS_30D = 0)
      OR (BAL_AVERAGE_BALANCE_30D IS NOT NULL AND TXN_TOTAL_TRANSACTIONS_30D > 0)
    THEN 1 ELSE 0 
  END) / COUNT(*), 2) AS pass_rate_pct,
  CASE 
    WHEN ROUND(100.0 * SUM(CASE 
      WHEN (BAL_AVERAGE_BALANCE_30D IS NULL AND TXN_TOTAL_TRANSACTIONS_30D = 0)
        OR (BAL_AVERAGE_BALANCE_30D IS NOT NULL AND TXN_TOTAL_TRANSACTIONS_30D > 0)
      THEN 1 ELSE 0 
    END) / COUNT(*), 2) >= 98.0
    THEN 'PASS' 
    ELSE 'WARNING' 
  END AS status
FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
WHERE PRCS_DTE = CURRENT_DATE();
    `,
  },
];

// ============================================================================
// GOLD TO SILVER RECONCILIATION
// ============================================================================
export const customerGoldReconciliation: MetricDQCheck = {
  checkId: "CUST_GOLD_DQ_999",
  checkName: "Gold Layer - Silver to Gold Reconciliation",
  metricTable: "ANALYTICS.CUSTOMER_DEPOSIT_AGGR",
  checkType: "CONSISTENCY",
  severity: "CRITICAL",
  threshold: {
    passRate: 99.0,
    action: "ALERT_IF_VARIANCE_EXCEEDS_1_PERCENT",
  },
  description: "Verify customer counts match between Silver and Gold layers",
  sqlStatement: `
-- Silver to Gold Reconciliation
WITH silver_counts AS (
  SELECT COUNT(DISTINCT customer_id) AS silver_active_customers
  FROM silver.customer_master_golden
  WHERE is_current = TRUE
    AND customer_status = 'ACTIVE'
),
gold_counts AS (
  SELECT COUNT(DISTINCT CUSTOMER_NUMBER) AS gold_customers
  FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
  WHERE PRCS_DTE = CURRENT_DATE()
)
SELECT 
  'CUST_GOLD_DQ_999' AS check_id,
  'Silver to Gold Reconciliation' AS check_name,
  CURRENT_TIMESTAMP() AS check_timestamp,
  sc.silver_active_customers,
  gc.gold_customers,
  sc.silver_active_customers - gc.gold_customers AS customer_difference,
  ROUND(100.0 * ABS(sc.silver_active_customers - gc.gold_customers) / NULLIF(sc.silver_active_customers, 0), 2) AS variance_pct,
  CASE 
    WHEN ABS(sc.silver_active_customers - gc.gold_customers) <= (sc.silver_active_customers * 0.01) THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM silver_counts sc
CROSS JOIN gold_counts gc;
  `,
};

// ============================================================================
// DQ CHECK CATALOG
// ============================================================================
export const customerGoldDQCatalog = {
  domain: "Customer Core",
  layer: "Gold",
  totalChecks: 11,

  checks: [...customerDepositAggrDQChecks, customerGoldReconciliation],

  checksByType: {
    COMPLETENESS: 2,
    BUSINESS_LOGIC: 5,
    CONSISTENCY: 3,
    ACCURACY: 1,
    TIMELINESS: 1,
  },

  execution: {
    schedule: "Daily at 07:00 UTC (post-gold aggregation)",
    duration: "5-8 minutes",
    tool: "dbt tests / Snowflake Tasks / Custom SQL",
    resultTable: "control.dq_results_gold_customer",
  },

  alerting: {
    critical: "PagerDuty + Email to Analytics Engineering + BI Team",
    warning: "Email to Data Stewards + Analytics Team",
    info: "Dashboard monitoring only",
  },

  remediation: {
    failedChecks: "Block BI dashboard refresh, investigate aggregation logic",
    warningChecks: "Log for review, allow BI refresh with warning flag",
    autoRemediation: "Rerun aggregation for date range with issues",
  },

  businessImpact: {
    critical:
      "Incorrect metrics affect executive reporting and customer analytics",
    warning: "Minor data quality issues that should be monitored",
    info: "Informational checks for trend monitoring",
  },
};

export default customerGoldDQCatalog;
