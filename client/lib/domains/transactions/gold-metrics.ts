/**
 * TRANSACTIONS DOMAIN - GOLD LAYER METRICS
 * 
 * Business metrics defined at the Gold layer for transaction analytics and BI
 * Each metric includes complete SQL definition, business logic, and metadata
 */

export interface GoldMetric {
  metricId: string;
  name: string;
  description: string;
  category: "Volume" | "Value" | "Activity" | "Quality" | "Risk" | "Performance" | "Channel" | "Compliance" | "Fraud" | "Velocity" | "Revenue";
  type: "Operational" | "Strategic" | "Tactical";
  grain: "Account" | "Customer" | "Transaction" | "Daily" | "Monthly" | "Overall";
  sqlDefinition: string;
  sourceTable: string;
  granularity: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual";
  aggregationMethod: "SUM" | "AVG" | "COUNT" | "MAX" | "MIN" | "DISTINCT";
  dataType: "INTEGER" | "DECIMAL" | "VARCHAR" | "DATE" | "FLOAT";
  unit: string;
  businessLogic: string;
  owner: string;
  sla: {
    maxLatencyHours: number;
    targetAccuracy: number;
    refreshFrequency: string;
  };
  relatedMetrics: string[];
  dependencies: string[];
}

export const transactionsGoldMetrics: GoldMetric[] = [
  {
    metricId: "TXN-VOL-001",
    name: "Daily Transaction Volume",
    description: "Daily transaction volume with DoD/WoW/YoY trends, hourly distribution, and channel breakdown",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH daily_volumes AS (
        SELECT
          CAST(TRANSACTION_DATE AS DATE) as txn_date,
          COUNT(DISTINCT TRANSACTION_ID) as daily_count,
          COUNT(DISTINCT CASE WHEN TRANSACTION_CHANNEL = 'MOBILE' THEN TRANSACTION_ID END) as mobile_count,
          COUNT(DISTINCT CASE WHEN TRANSACTION_CHANNEL = 'ONLINE' THEN TRANSACTION_ID END) as online_count,
          COUNT(DISTINCT CASE WHEN TRANSACTION_CHANNEL = 'BRANCH' THEN TRANSACTION_ID END) as branch_count,
          COUNT(DISTINCT CASE WHEN TRANSACTION_CHANNEL = 'ATM' THEN TRANSACTION_ID END) as atm_count,
          ROUND(AVG(TRANSACTION_AMOUNT), 2) as avg_txn_amount
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_DATE >= DATEADD(year, -1, CURRENT_DATE())
        GROUP BY CAST(TRANSACTION_DATE AS DATE)
      ),
      trend_analysis AS (
        SELECT
          txn_date,
          daily_count,
          mobile_count,
          online_count,
          branch_count,
          atm_count,
          avg_txn_amount,
          LAG(daily_count, 1) OVER (ORDER BY txn_date) as prev_day,
          LAG(daily_count, 7) OVER (ORDER BY txn_date) as prev_week,
          LAG(daily_count, 365) OVER (ORDER BY txn_date) as prev_year,
          ROUND(AVG(daily_count) OVER (ORDER BY txn_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as ma_7d,
          ROUND(STDDEV(daily_count) OVER (ORDER BY txn_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), 2) as stddev_30d
        FROM daily_volumes
      )
      SELECT
        txn_date,
        daily_count as daily_transaction_count,
        mobile_count,
        online_count,
        branch_count,
        atm_count,
        avg_txn_amount,
        ma_7d,
        stddev_30d,
        prev_day,
        prev_week,
        prev_year,
        daily_count - prev_day as dod_change,
        daily_count - prev_week as wow_change,
        ROUND(CAST(daily_count - prev_day AS FLOAT) / NULLIF(prev_day, 0) * 100, 2) as dod_growth_pct,
        ROUND(CAST(daily_count - prev_week AS FLOAT) / NULLIF(prev_week, 0) * 100, 2) as wow_growth_pct,
        ROUND(CAST(daily_count - prev_year AS FLOAT) / NULLIF(prev_year, 0) * 100, 2) as yoy_growth_pct,
        CASE
          WHEN daily_count > ma_7d + (2 * stddev_30d) THEN 'High Volume Alert'
          WHEN daily_count < ma_7d - (2 * stddev_30d) THEN 'Low Volume Alert'
          ELSE 'Normal'
        END as volume_status
      FROM trend_analysis
      WHERE txn_date = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Daily volume with LAG for DoD/WoW/YoY trends, 7-day MA, 30-day STDDEV for anomaly detection, and channel distribution",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.99,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VOL-002",
    name: "Monthly Transaction Volume",
    description: "Monthly volume with MoM/YoY trends, daily average, and transaction type breakdown",
    category: "Volume",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      WITH monthly_volumes AS (
        SELECT
          DATE_TRUNC('month', TRANSACTION_DATE) as txn_month,
          COUNT(DISTINCT TRANSACTION_ID) as monthly_count,
          COUNT(DISTINCT CASE WHEN TRANSACTION_TYPE = 'DEPOSIT' THEN TRANSACTION_ID END) as deposit_count,
          COUNT(DISTINCT CASE WHEN TRANSACTION_TYPE = 'WITHDRAWAL' THEN TRANSACTION_ID END) as withdrawal_count,
          COUNT(DISTINCT CASE WHEN TRANSACTION_TYPE = 'TRANSFER' THEN TRANSACTION_ID END) as transfer_count,
          COUNT(DISTINCT CUSTOMER_NUMBER) as unique_customers,
          ROUND(SUM(TRANSACTION_AMOUNT), 2) as total_amount,
          COUNT(DISTINCT CAST(TRANSACTION_DATE AS DATE)) as business_days
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_DATE >= DATEADD(month, -24, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', TRANSACTION_DATE)
      ),
      trend_analysis AS (
        SELECT
          txn_month,
          monthly_count,
          deposit_count,
          withdrawal_count,
          transfer_count,
          unique_customers,
          total_amount,
          business_days,
          ROUND(CAST(monthly_count AS FLOAT) / NULLIF(business_days, 0), 2) as avg_daily_volume,
          ROUND(CAST(monthly_count AS FLOAT) / NULLIF(unique_customers, 0), 2) as avg_txn_per_customer,
          LAG(monthly_count, 1) OVER (ORDER BY txn_month) as prev_month,
          LAG(monthly_count, 12) OVER (ORDER BY txn_month) as prev_year,
          ROUND(AVG(monthly_count) OVER (ORDER BY txn_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) as ma_3m,
          ROUND(AVG(monthly_count) OVER (ORDER BY txn_month ROWS BETWEEN 11 PRECEDING AND CURRENT ROW), 2) as ma_12m
        FROM monthly_volumes
      )
      SELECT
        txn_month,
        monthly_count as monthly_transaction_count,
        deposit_count,
        withdrawal_count,
        transfer_count,
        unique_customers,
        total_amount,
        avg_daily_volume,
        avg_txn_per_customer,
        ma_3m,
        ma_12m,
        prev_month,
        prev_year,
        ROUND(CAST(monthly_count - prev_month AS FLOAT) / NULLIF(prev_month, 0) * 100, 2) as mom_growth_pct,
        ROUND(CAST(monthly_count - prev_year AS FLOAT) / NULLIF(prev_year, 0) * 100, 2) as yoy_growth_pct
      FROM trend_analysis
      WHERE txn_month = DATE_TRUNC('month', CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Monthly volume with LAG for MoM/YoY comparison, 3-month and 12-month MA, transaction type breakdown, and per-customer metrics",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.99,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VOL-003",
    name: "YTD Transaction Volume",
    description: "Total transactions processed year-to-date",
    category: "Volume",
    type: "Strategic",
    grain: "Overall",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as ytd_transaction_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE >= DATE_TRUNC('year', CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Annual",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of completed transactions from Jan 1 to current date",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.99,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VOL-004",
    name: "Mobile Transaction Count",
    description: "Number of transactions initiated from mobile channel",
    category: "Channel",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as mobile_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND CHANNEL = 'MOBILE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of completed mobile transactions",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VOL-005",
    name: "Online Transaction Count",
    description: "Number of transactions initiated from online channel",
    category: "Channel",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as online_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND CHANNEL = 'ONLINE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of completed online transactions",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VOL-006",
    name: "ATM Transaction Count",
    description: "Number of transactions at ATM channel",
    category: "Channel",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as atm_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND CHANNEL = 'ATM'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of completed ATM transactions",
    owner: "ATM Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VOL-007",
    name: "Branch Transaction Count",
    description: "Number of transactions at branch channel",
    category: "Channel",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as branch_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND CHANNEL = 'BRANCH'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of completed branch transactions",
    owner: "Branch Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-VAL-001",
    name: "Daily Transaction Value",
    description: "Total transaction value with DoD/WoW/YoY trends, type breakdown, and 7-day moving average",
    category: "Value",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      WITH daily_values AS (
        SELECT
          CAST(TRANSACTION_DATE AS DATE) as txn_date,
          SUM(TRANSACTION_AMOUNT) as total_value,
          SUM(CASE WHEN TRANSACTION_TYPE = 'DEPOSIT' THEN TRANSACTION_AMOUNT ELSE 0 END) as deposit_value,
          SUM(CASE WHEN TRANSACTION_TYPE = 'WITHDRAWAL' THEN TRANSACTION_AMOUNT ELSE 0 END) as withdrawal_value,
          SUM(CASE WHEN TRANSACTION_TYPE = 'TRANSFER' THEN TRANSACTION_AMOUNT ELSE 0 END) as transfer_value,
          COUNT(DISTINCT TRANSACTION_ID) as txn_count,
          COUNT(DISTINCT CUSTOMER_NUMBER) as unique_customers
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_DATE >= DATEADD(year, -1, CURRENT_DATE())
        GROUP BY CAST(TRANSACTION_DATE AS DATE)
      ),
      trend_analysis AS (
        SELECT
          txn_date,
          total_value,
          deposit_value,
          withdrawal_value,
          transfer_value,
          txn_count,
          unique_customers,
          ROUND(total_value / NULLIF(txn_count, 0), 2) as avg_txn_amount,
          ROUND(total_value / NULLIF(unique_customers, 0), 2) as avg_value_per_customer,
          LAG(total_value, 1) OVER (ORDER BY txn_date) as prev_day,
          LAG(total_value, 7) OVER (ORDER BY txn_date) as prev_week,
          LAG(total_value, 365) OVER (ORDER BY txn_date) as prev_year,
          ROUND(AVG(total_value) OVER (ORDER BY txn_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as ma_7d,
          ROUND(STDDEV(total_value) OVER (ORDER BY txn_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), 2) as stddev_30d
        FROM daily_values
      )
      SELECT
        txn_date,
        total_value as daily_transaction_value,
        deposit_value,
        withdrawal_value,
        transfer_value,
        txn_count,
        unique_customers,
        avg_txn_amount,
        avg_value_per_customer,
        ma_7d,
        stddev_30d,
        prev_day,
        prev_week,
        prev_year,
        ROUND(total_value - prev_day, 2) as dod_change,
        ROUND(total_value - prev_week, 2) as wow_change,
        ROUND(CAST(total_value - prev_day AS FLOAT) / NULLIF(prev_day, 0) * 100, 2) as dod_growth_pct,
        ROUND(CAST(total_value - prev_week AS FLOAT) / NULLIF(prev_week, 0) * 100, 2) as wow_growth_pct,
        ROUND(CAST(total_value - prev_year AS FLOAT) / NULLIF(prev_year, 0) * 100, 2) as yoy_growth_pct
      FROM trend_analysis
      WHERE txn_date = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Total transaction value with LAG for DoD/WoW/YoY trends, 7-day MA, 30-day STDDEV, transaction type breakdown, and per-customer metrics",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VAL-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VAL-002",
    name: "Average Transaction Amount",
    description: "Average transaction amount with percentile distribution, channel breakdown, and MoM trend",
    category: "Value",
    type: "Operational",
    grain: "Transaction",
    sqlDefinition: `
      WITH current_transactions AS (
        SELECT
          TRANSACTION_AMOUNT,
          TRANSACTION_CHANNEL,
          TRANSACTION_TYPE
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE = CURRENT_DATE()
          AND TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_AMOUNT > 0
      ),
      prev_month_avg AS (
        SELECT
          AVG(TRANSACTION_AMOUNT) as prev_month_amount
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE = DATEADD(month, -1, CURRENT_DATE())
          AND TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_AMOUNT > 0
      )
      SELECT
        ROUND(AVG(ct.TRANSACTION_AMOUNT), 2) as average_transaction_amount,
        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ct.TRANSACTION_AMOUNT), 2) as p25_amount,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY ct.TRANSACTION_AMOUNT), 2) as median_amount,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ct.TRANSACTION_AMOUNT), 2) as p75_amount,
        ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY ct.TRANSACTION_AMOUNT), 2) as p90_amount,
        ROUND(STDDEV(ct.TRANSACTION_AMOUNT), 2) as std_deviation,
        COUNT(*) as transaction_count,
        ROUND(AVG(CASE WHEN ct.TRANSACTION_CHANNEL = 'MOBILE' THEN ct.TRANSACTION_AMOUNT END), 2) as avg_mobile,
        ROUND(AVG(CASE WHEN ct.TRANSACTION_CHANNEL = 'ONLINE' THEN ct.TRANSACTION_AMOUNT END), 2) as avg_online,
        ROUND(AVG(CASE WHEN ct.TRANSACTION_CHANNEL = 'BRANCH' THEN ct.TRANSACTION_AMOUNT END), 2) as avg_branch,
        pma.prev_month_amount,
        ROUND(AVG(ct.TRANSACTION_AMOUNT) - pma.prev_month_amount, 2) as mom_change,
        ROUND(CAST(AVG(ct.TRANSACTION_AMOUNT) - pma.prev_month_amount AS FLOAT) / NULLIF(pma.prev_month_amount, 0) * 100, 2) as mom_growth_pct
      FROM current_transactions ct
      CROSS JOIN prev_month_avg pma
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average transaction amount with PERCENTILE_CONT distribution (P25-P90), STDDEV, channel-specific averages, and MoM comparison",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VAL-001", "TXN-VAL-003"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VAL-003",
    name: "Median Transaction Amount",
    description: "Median monetary amount per transaction",
    category: "Value",
    type: "Operational",
    grain: "Transaction",
    sqlDefinition: `
      SELECT 
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT) as median_transaction_amount
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_AMOUNT > 0
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "50th percentile of transaction amounts",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VAL-001", "TXN-VAL-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VAL-004",
    name: "Maximum Transaction Amount",
    description: "Highest single transaction amount on reporting day",
    category: "Value",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        MAX(TRANSACTION_AMOUNT) as max_transaction_amount
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "MAX",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Maximum transaction amount",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VAL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VAL-005",
    name: "Monthly Transaction Value",
    description: "Total monetary value of transactions in current month",
    category: "Value",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      SELECT 
        SUM(TRANSACTION_AMOUNT) as monthly_transaction_value
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE())
        AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Monthly",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of all transaction amounts in current month",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VAL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-ACT-001",
    name: "Transaction Failure Rate",
    description: "Percentage of transactions that failed to complete",
    category: "Quality",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH transaction_summary AS (
        SELECT 
          COUNT(CASE WHEN TRANSACTION_STATUS = 'FAILED' THEN 1 END) as failed_count,
          COUNT(*) as total_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE = CURRENT_DATE()
      )
      SELECT 
        ROUND((failed_count / NULLIF(total_count, 0)) * 100, 2) as failure_rate_pct
      FROM transaction_summary
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Failed transactions / Total transactions * 100",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-ACT-002",
    name: "Pending Transactions",
    description: "Count of transactions awaiting completion or approval",
    category: "Quality",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as pending_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'PENDING'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions with PENDING status",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACT-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-ACT-003",
    name: "Average Transaction Processing Time",
    description: "Average time from submission to completion (in seconds)",
    category: "Performance",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        ROUND(AVG(DATEDIFF(second, SUBMISSION_TIME, COMPLETION_TIME)), 2) as avg_processing_seconds
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND COMPLETION_TIME IS NOT NULL
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "seconds",
    businessLogic: "Average processing time for completed transactions",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-PER-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-RIS-001",
    name: "Suspicious Transaction Count",
    description: "Count of transactions flagged as potentially fraudulent",
    category: "Risk",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as suspicious_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND IS_SUSPICIOUS = TRUE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions with IS_SUSPICIOUS = TRUE",
    owner: "Fraud Prevention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-RIS-002",
    name: "Fraud Detection Rate",
    description: "Rate of suspicious transactions per 1000 completed transactions",
    category: "Risk",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      WITH fraud_metrics AS (
        SELECT 
          COUNT(CASE WHEN IS_SUSPICIOUS = TRUE THEN 1 END) as suspicious_count,
          COUNT(CASE WHEN TRANSACTION_STATUS = 'COMPLETED' THEN 1 END) as completed_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE = CURRENT_DATE()
      )
      SELECT 
        ROUND((suspicious_count / NULLIF(completed_count, 0)) * 1000, 2) as fraud_rate_per_1000
      FROM fraud_metrics
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "rate per 1000",
    businessLogic: "Suspicious transactions / Completed transactions * 1000",
    owner: "Fraud Prevention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-RIS-003",
    name: "High-Risk Transaction Count",
    description: "Count of transactions exceeding $10K threshold (SAR reporting)",
    category: "Risk",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as high_risk_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_AMOUNT >= 10000
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions >= $10K",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-RIS-004",
    name: "Duplicate Transaction Count",
    description: "Potential duplicate transactions within last 24 hours",
    category: "Quality",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH duplicate_check AS (
        SELECT 
          CUSTOMER_NUMBER,
          TRANSACTION_AMOUNT,
          TRANSACTION_DATE,
          COUNT(*) as transaction_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE >= DATEADD(day, -1, CURRENT_DATE())
        GROUP BY CUSTOMER_NUMBER, TRANSACTION_AMOUNT, TRANSACTION_DATE
      )
      SELECT 
        COUNT(DISTINCT CUSTOMER_NUMBER) as duplicate_flag_count
      FROM duplicate_check
      WHERE transaction_count > 1
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of potential duplicate transactions in last 24h",
    owner: "Fraud Prevention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-COM-001",
    name: "AML Flagged Transactions",
    description: "Transactions flagged for AML/CFT compliance review",
    category: "Compliance",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as aml_flagged_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND AML_FLAG = TRUE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions flagged for AML review",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-003"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-COM-002",
    name: "OFAC Blocked Transactions",
    description: "Transactions blocked due to OFAC sanctions list matches",
    category: "Compliance",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as ofac_blocked_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND OFAC_BLOCKED = TRUE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions blocked by OFAC screening",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-COM-003",
    name: "SAR Filed Transactions",
    description: "Suspicious Activity Reports (SAR) filed with FinCEN",
    category: "Compliance",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as sar_filed_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(month, -1, CURRENT_DATE())
        AND SAR_FILED = TRUE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions with filed SAR",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-003"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-CHN-001",
    name: "Mobile Channel Share",
    description: "Percentage of total transaction volume from mobile",
    category: "Channel",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        ROUND((COUNT(CASE WHEN CHANNEL = 'MOBILE' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100, 2) as mobile_volume_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Mobile transactions / Total transactions * 100",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CHN-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CHN-002",
    name: "Digital Channel Adoption",
    description: "Combined percentage of mobile + online transaction volume",
    category: "Channel",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        ROUND((COUNT(CASE WHEN CHANNEL IN ('MOBILE', 'ONLINE') THEN 1 END) / NULLIF(COUNT(*), 0)) * 100, 2) as digital_adoption_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "(Mobile + Online) transactions / Total transactions * 100",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CHN-001", "TXN-CHN-003"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CHN-003",
    name: "Channel Avg Transaction Amount",
    description: "Average transaction amount by channel (Mobile, Online, ATM, Branch)",
    category: "Channel",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        CHANNEL,
        ROUND(AVG(TRANSACTION_AMOUNT), 2) as channel_avg_amount,
        COUNT(DISTINCT TRANSACTION_ID) as transaction_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
      GROUP BY CHANNEL
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average transaction amount grouped by channel",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CHN-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-FRD-001",
    name: "Fraud Prevention Block Rate",
    description: "Percentage of suspicious transactions blocked before completion",
    category: "Fraud",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      WITH fraud_analysis AS (
        SELECT 
          COUNT(CASE WHEN IS_SUSPICIOUS = TRUE AND TRANSACTION_STATUS = 'BLOCKED' THEN 1 END) as blocked_count,
          COUNT(CASE WHEN IS_SUSPICIOUS = TRUE THEN 1 END) as total_suspicious
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE = CURRENT_DATE()
      )
      SELECT 
        ROUND((blocked_count / NULLIF(total_suspicious, 0)) * 100, 2) as fraud_block_rate_pct
      FROM fraud_analysis
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Blocked suspicious txns / Total suspicious txns * 100",
    owner: "Fraud Prevention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-FRD-002",
    name: "Fraud Loss Amount",
    description: "Total dollar amount of fraudulent transactions detected",
    category: "Fraud",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      SELECT 
        SUM(TRANSACTION_AMOUNT) as fraud_loss_amount
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(month, -1, CURRENT_DATE())
        AND IS_SUSPICIOUS = TRUE
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Monthly",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of suspicious transaction amounts in last 30 days",
    owner: "Fraud Prevention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-VEL-001",
    name: "Velocity Flag Count",
    description: "Transactions flagged for unusual velocity patterns",
    category: "Velocity",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as velocity_flag_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND VELOCITY_FLAG = TRUE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions flagged for velocity rules",
    owner: "Fraud Prevention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RIS-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-VEL-002",
    name: "Peak Transaction Hour",
    description: "Hour of day with highest transaction volume",
    category: "Velocity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        HOUR(SUBMISSION_TIME) as peak_hour,
        COUNT(DISTINCT TRANSACTION_ID) as hourly_volume
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
      GROUP BY HOUR(SUBMISSION_TIME)
      ORDER BY hourly_volume DESC
      LIMIT 1
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "hour",
    businessLogic: "Hour with maximum transaction count",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-REV-001",
    name: "Transaction Fee Revenue",
    description: "Total fees collected from transaction services",
    category: "Revenue",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        SUM(TRANSACTION_FEE) as total_fee_revenue
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of transaction fees collected",
    owner: "Revenue Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-REV-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-REV-002",
    name: "Monthly Transaction Fee Revenue",
    description: "Total transaction fee revenue for current month",
    category: "Revenue",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      SELECT 
        SUM(TRANSACTION_FEE) as monthly_fee_revenue
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE())
        AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Monthly",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of transaction fees collected in current month",
    owner: "Revenue Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-REV-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-REV-003",
    name: "Average Fee Per Transaction",
    description: "Average fee amount per completed transaction",
    category: "Revenue",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        ROUND(AVG(TRANSACTION_FEE), 2) as avg_fee_per_txn
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_FEE > 0
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average transaction fee amount",
    owner: "Revenue Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-REV-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  {
    metricId: "TXN-PER-001",
    name: "System Availability",
    description: "Percentage uptime of transaction processing system",
    category: "Performance",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        ROUND((1 - (COUNT(CASE WHEN TRANSACTION_STATUS = 'SYSTEM_ERROR' THEN 1 END) / NULLIF(COUNT(*), 0))) * 100, 2) as system_availability_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "(Total txns - System error txns) / Total txns * 100",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACT-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-PER-002",
    name: "Peak Transaction Rate",
    description: "Maximum transactions per second during peak hours",
    category: "Performance",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        ROUND(MAX(txn_per_second), 2) as peak_txn_rate
      FROM (
        SELECT
          DATEADD(second, DATEDIFF(second, 0, SUBMISSION_TIME), 0) as second_bucket,
          COUNT(*) as txn_per_second
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE = CURRENT_DATE()
          AND TRANSACTION_STATUS = 'COMPLETED'
        GROUP BY DATEADD(second, DATEDIFF(second, 0, SUBMISSION_TIME), 0)
      )
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "MAX",
    dataType: "DECIMAL",
    unit: "transactions/sec",
    businessLogic: "Maximum transactions processed per second",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACT-003"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  // ============================================================================
  // TRANSACTION TYPE METRICS
  // ============================================================================
  {
    metricId: "TXN-TYPE-001",
    name: "ACH Transaction Volume",
    description: "Number of ACH transactions processed",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as ach_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'ACH'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of ACH transactions",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-TYPE-002",
    name: "Wire Transfer Volume",
    description: "Number of wire transfer transactions processed",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as wire_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'WIRE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of wire transactions",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-TYPE-003",
    name: "Debit Card Transaction Volume",
    description: "Number of debit card transactions processed",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as debit_card_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'DEBIT_CARD'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of debit card transactions",
    owner: "Card Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-TYPE-004",
    name: "ATM Withdrawal Volume",
    description: "Number of ATM withdrawal transactions",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as atm_withdrawal_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'ATM_WITHDRAWAL'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of ATM withdrawal transactions",
    owner: "ATM Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-006"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-TYPE-005",
    name: "Bill Pay Volume",
    description: "Number of bill pay transactions",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as billpay_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'BILL_PAY'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of bill pay transactions",
    owner: "Payments",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-TYPE-006",
    name: "P2P Payment Volume",
    description: "Number of peer-to-peer payment transactions",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as p2p_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'P2P'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of P2P transactions",
    owner: "Digital Payments",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  // ============================================================================
  // MERCHANT CATEGORY METRICS
  // ============================================================================
  {
    metricId: "TXN-MERCH-001",
    name: "Retail Merchant Transactions",
    description: "Transactions at retail merchants",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as retail_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND MERCHANT_CATEGORY = 'RETAIL'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of retail merchant transactions",
    owner: "Merchant Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-MERCH-002",
    name: "Grocery/Gas Transactions",
    description: "Transactions at grocery stores and gas stations",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as grocery_gas_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND MERCHANT_CATEGORY IN ('GROCERY', 'GAS_STATION')
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of grocery/gas transactions",
    owner: "Merchant Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-MERCH-003",
    name: "Online Merchant Transactions",
    description: "Online/e-commerce transactions",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as online_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND MERCHANT_CATEGORY = 'E_COMMERCE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of online merchant transactions",
    owner: "Merchant Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-MERCH-004",
    name: "Recurring Transaction Count",
    description: "Number of recurring/subscription transactions",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as recurring_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND IS_RECURRING = TRUE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of recurring subscription transactions",
    owner: "Merchant Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  // ============================================================================
  // GEOGRAPHIC & LOCATION METRICS
  // ============================================================================
  {
    metricId: "TXN-GEO-001",
    name: "Domestic Transaction Percentage",
    description: "Percentage of transactions within domestic country",
    category: "Volume",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN TRANSACTION_COUNTRY = 'US' THEN 1 END) /
                NULLIF(COUNT(*), 0)) * 100, 2) as domestic_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Domestic transactions / Total transactions * 100",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-GEO-002",
    name: "International Transaction Volume",
    description: "Number of cross-border/international transactions",
    category: "Volume",
    type: "Operational",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as intl_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_COUNTRY != 'US'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of international transactions",
    owner: "International Services",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-GEO-003",
    name: "High-Risk Country Transactions",
    description: "Transactions in high-risk jurisdictions",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as highrisk_country_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_COUNTRY IN ('IRAN', 'NORTH_KOREA', 'SYRIA', 'CUBA')
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions in embargoed countries",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Real-time",
    },
    relatedMetrics: ["TXN-COM-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  // ============================================================================
  // TIME PATTERN METRICS
  // ============================================================================
  {
    metricId: "TXN-TIME-001",
    name: "Business Hours Transaction Percentage",
    description: "Percentage of transactions during business hours (9-5 weekdays)",
    category: "Activity",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN HOUR(SUBMISSION_TIME) BETWEEN 9 AND 17 AND DATEPART(DW, SUBMISSION_TIME) BETWEEN 2 AND 6 THEN 1 END) /
                NULLIF(COUNT(*), 0)) * 100, 2) as business_hours_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Business hours transactions / Total * 100",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-TIME-002",
    name: "Weekend Transaction Volume",
    description: "Transactions on weekends",
    category: "Volume",
    type: "Operational",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as weekend_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND DATEPART(DW, SUBMISSION_TIME) IN (1, 7)
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of weekend transactions",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-TIME-003",
    name: "Late Night Transaction Percentage",
    description: "Percentage of transactions after 10 PM",
    category: "Activity",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN HOUR(SUBMISSION_TIME) >= 22 THEN 1 END) /
                NULLIF(COUNT(*), 0)) * 100, 2) as late_night_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Late night transactions / Total * 100",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-VEL-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  // ============================================================================
  // DECLINE & ERROR METRICS
  // ============================================================================
  {
    metricId: "TXN-DECLINE-001",
    name: "Transaction Decline Count",
    description: "Number of declined transactions",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as decline_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'DECLINED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of declined transactions",
    owner: "Fraud Prevention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-DECLINE-002",
    name: "Insufficient Funds Declines",
    description: "Transactions declined due to insufficient funds",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as insufficient_funds_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND DECLINE_REASON = 'INSUFFICIENT_FUNDS'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of NSF (no sufficient funds) declines",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-DECLINE-003",
    name: "Fraud-Related Declines",
    description: "Transactions blocked due to fraud detection",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `
      SELECT COUNT(DISTINCT TRANSACTION_ID) as fraud_decline_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND DECLINE_REASON = 'FRAUD_BLOCK'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of fraud-related transaction blocks",
    owner: "Fraud Prevention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Real-time",
    },
    relatedMetrics: ["TXN-FRD-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-DECLINE-004",
    name: "Decline Rate by Card Type",
    description: "Transaction decline percentage by debit/credit card",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT
        CARD_TYPE,
        ROUND((COUNT(CASE WHEN TRANSACTION_STATUS = 'DECLINED' THEN 1 END) /
                NULLIF(COUNT(*), 0)) * 100, 2) as decline_rate_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
      GROUP BY CARD_TYPE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Declined / Total transactions by card type * 100",
    owner: "Card Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-DECLINE-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  // ============================================================================
  // CUSTOMER SEGMENT METRICS
  // ============================================================================
  {
    metricId: "TXN-SEG-001",
    name: "Premium Customer Transaction Value",
    description: "Average transaction amount for premium customers",
    category: "Value",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND(AVG(TRANSACTION_AMOUNT), 2) as premium_avg_txn_value
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION fct
      JOIN CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd ON fct.CUSTOMER_NUMBER = dcd.CUSTOMER_NUMBER
      WHERE fct.TRANSACTION_DATE = CURRENT_DATE()
        AND fct.TRANSACTION_STATUS = 'COMPLETED'
        AND dcd.CUSTOMER_SEGMENT = 'PREMIUM'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average transaction amount for premium segment",
    owner: "Segment Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION", "DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "TXN-SEG-002",
    name: "Standard Customer Transaction Frequency",
    description: "Average transactions per standard segment customer",
    category: "Activity",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND(COUNT(DISTINCT fct.TRANSACTION_ID) / NULLIF(COUNT(DISTINCT fct.CUSTOMER_NUMBER), 0), 2) as standard_txn_freq
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION fct
      JOIN CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd ON fct.CUSTOMER_NUMBER = dcd.CUSTOMER_NUMBER
      WHERE fct.TRANSACTION_DATE >= DATEADD(month, -1, CURRENT_DATE())
        AND fct.TRANSACTION_STATUS = 'COMPLETED'
        AND dcd.CUSTOMER_SEGMENT = 'STANDARD'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "count",
    businessLogic: "Average transaction frequency for standard segment",
    owner: "Segment Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION", "DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "TXN-SEG-003",
    name: "Youth Segment Transaction Volume",
    description: "Transaction volume from customers under 35",
    category: "Volume",
    type: "Operational",
    sqlDefinition: `
      SELECT COUNT(DISTINCT fct.TRANSACTION_ID) as youth_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION fct
      JOIN CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd ON fct.CUSTOMER_NUMBER = dcd.CUSTOMER_NUMBER
      WHERE fct.TRANSACTION_DATE = CURRENT_DATE()
        AND fct.TRANSACTION_STATUS = 'COMPLETED'
        AND dcd.AGE < 35
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions from younger customers",
    owner: "Segment Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION", "DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {metricId: "TXN-BULK-001",name: "Cross-Border Transaction Count",description: "International transactions",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_COUNTRY!='US'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Intl txn count",owner: "Intl",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-002",name: "RTP Transaction Volume",description: "Real-time payment count",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_TYPE='RTP'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "RTP count",owner: "Payments",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-003",name: "Same-Day ACH Count",description: "Same-day ACH transfers",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_TYPE='ACH' AND PROCESSING_TIME<1`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Same-day ACH",owner: "Payments",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-004",name: "Cryptocurrency Transaction Count",description: "Crypto-related transactions",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='CRYPTO'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Crypto txn count",owner: "Digital",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-005",name: "Gambling Transaction Count",description: "Gambling-related transactions",category: "Risk",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='GAMBLING'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Gambling txn count",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-006",name: "Adult Content Transaction Count",description: "Adult content purchase transactions",category: "Risk",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='ADULT'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Adult txn count",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-007",name: "Subscription Service Failures",description: "Failed recurring payments",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE IS_RECURRING=TRUE AND TRANSACTION_STATUS='FAILED'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Failed recurring txn",owner: "Payments",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-008",name: "Travel Transaction Volume",description: "Travel-related spending",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY IN ('AIRLINE','HOTEL','CAR_RENTAL')`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Travel txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-009",name: "Healthcare Transaction Volume",description: "Healthcare/medical spending",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY IN ('PHARMACY','HOSPITAL','DOCTOR')`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Health txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-010",name: "Education Expense Transactions",description: "Tuition and education",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='EDUCATION'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Education txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-011",name: "Utilities Payment Transactions",description: "Utilities paid via debit",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='UTILITIES'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Utilities txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-012",name: "Telecommunications Payment Count",description: "Phone/internet payment txns",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='TELECOM'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Telecom txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-013",name: "Insurance Premium Payments",description: "Insurance premium transactions",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='INSURANCE'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Insurance txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-014",name: "Donation Transaction Count",description: "Charitable donations",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='CHARITY'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Charity txn count",owner: "Social",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-015",name: "Restaurant Transaction Count",description: "Restaurant/dining spending",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY IN ('RESTAURANT','BAR','CAFE')`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Dining txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-016",name: "Entertainment Spending",description: "Movies, concerts, events",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY IN ('MOVIE','CONCERT','EVENTS')`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Entertainment txn",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-017",name: "Fitness Membership Charges",description: "Gym/fitness transactions",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='FITNESS'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Fitness txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-018",name: "Pet Expense Transactions",description: "Pet store and vet spending",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY IN ('PET_STORE','VETERINARY')`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Pet txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-019",name: "Personal Care Spending",description: "Salon and personal care",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY IN ('SALON','BARBER','SPA')`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Personal care txn",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-020",name: "Automotive Spending",description: "Gas, repairs, maintenance",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY IN ('GAS_STATION','AUTO_REPAIR','AUTO_PARTS')`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Auto txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-021",name: "Rent Payment Transactions",description: "Rent payments via debit",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='RENT'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Rent txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-022",name: "Mortgage Payment Transactions",description: "Mortgage payments",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='MORTGAGE'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Mortgage txn count",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-023",name: "Property Tax Payment Count",description: "Property tax transactions",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='PROPERTY_TAX'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Property tax txn",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-024",name: "Tax Preparation Service Transactions",description: "Tax filing service payments",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MERCHANT_CATEGORY='TAX_SERVICE'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Tax service txn",owner: "Merchant",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-025",name: "High-Value Transaction Count",description: "Transactions > $5000",category: "Value",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_AMOUNT>5000`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "High-value txn",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-026",name: "Small-Value Transaction Count",description: "Micropayments < $10",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_AMOUNT<10`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Micropayment count",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-027",name: "Chargeback Count",description: "Customer disputes/chargebacks",category: "Risk",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_CHARGEBACKS WHERE CHARGEBACK_DATE = CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.FCT_CHARGEBACKS",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Chargeback count",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_CHARGEBACKS"]},
  {metricId: "TXN-BULK-028",name: "Chargeback Loss Amount",description: "Total chargeback losses",category: "Risk",type: "Operational",sqlDefinition: `SELECT SUM(AMOUNT) FROM CORE_DEPOSIT.FCT_CHARGEBACKS WHERE CHARGEBACK_DATE = CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.FCT_CHARGEBACKS",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "Chargeback loss",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_CHARGEBACKS"]},
  {metricId: "TXN-BULK-029",name: "Recurring Billing Disputes",description: "Recurring payment disputes",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_CHARGEBACKS WHERE IS_RECURRING = TRUE`,sourceTable: "CORE_DEPOSIT.FCT_CHARGEBACKS",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Recurring disputes",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_CHARGEBACKS"]},
  {metricId: "TXN-BULK-030",name: "Timeout/No Response Count",description: "No response to auth requests",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE DECLINE_REASON = 'TIMEOUT'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Timeout transactions",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-031",name: "Network Error Count",description: "Network-related failures",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_STATUS = 'NETWORK_ERROR'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Network error count",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-032",name: "Invalid Card Count",description: "Invalid card declined txns",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE DECLINE_REASON = 'INVALID_CARD'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Invalid card count",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-033",name: "Expired Card Count",description: "Expired card declined txns",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE DECLINE_REASON = 'EXPIRED_CARD'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Expired card count",owner: "Card Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-034",name: "Velocity Limit Declines",description: "Velocity rule violations",category: "Risk",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE DECLINE_REASON = 'VELOCITY_EXCEEDED'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Velocity decline count",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-035",name: "Testing Transaction Count",description: "Test/invalid transactions",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE IS_TEST_TRANSACTION = TRUE`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Test txn count",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-036",name: "Recurring Billing Failures",description: "Failed recurring charges",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE IS_RECURRING = TRUE AND TRANSACTION_STATUS = 'FAILED'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Recurring failures",owner: "Payments",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-037",name: "Recurring Billing Success Rate",description: "Successful recurring charge %",category: "Performance",type: "Operational",sqlDefinition: `SELECT ROUND((COUNT(CASE WHEN TRANSACTION_STATUS='COMPLETED' THEN 1 END)/NULLIF(COUNT(*),0))*100,2) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE IS_RECURRING=TRUE`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "%",businessLogic: "Recurring success %",owner: "Payments",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-038",name: "Transaction Reversal Count",description: "Reversed/refunded transactions",category: "Activity",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_STATUS = 'REVERSED'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Reversal count",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-039",name: "Reversal Amount",description: "Total reversed transaction value",category: "Value",type: "Operational",sqlDefinition: `SELECT SUM(TRANSACTION_AMOUNT) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_STATUS = 'REVERSED'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "Total reversals",owner: "Finance",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-040",name: "Pending Authorization Count",description: "Transactions awaiting auth",category: "Activity",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_STATUS = 'PENDING_AUTH'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Pending auth count",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Real-time"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-041",name: "Authorization Hold Duration",description: "Average auth hold time",category: "Performance",type: "Operational",sqlDefinition: `SELECT AVG(DATEDIFF(hour,SUBMISSION_TIME,COMPLETION_TIME)) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_STATUS='PENDING_AUTH'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "hours",businessLogic: "Hold duration",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {metricId: "TXN-BULK-042",name: "Authorization Conversion Rate",description: "Auth % eventually completed",category: "Performance",type: "Operational",sqlDefinition: `SELECT ROUND((COUNT(CASE WHEN TRANSACTION_STATUS='COMPLETED' THEN 1 END)/NULLIF(COUNT(*),0))*100,2) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE WAS_PENDING_AUTH=TRUE`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",granularity: "Daily",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "%",businessLogic: "Auth to completion %",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"]},
  {
    metricId: "TXN-CRIT-001",
    name: "Real-Time Fraud Detection Score",
    description: "Percentage of transactions flagged by machine learning fraud model with score > 75",
    category: "Fraud",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(CAST(SUM(CASE WHEN FRAUD_DETECTION_SCORE > 75 THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(*), 0) * 100, 2) as high_fraud_risk_pct,
        COUNT(CASE WHEN FRAUD_DETECTION_SCORE > 75 THEN 1 END) as high_risk_txn_count,
        ROUND(AVG(FRAUD_DETECTION_SCORE), 2) as avg_fraud_score
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(day, -1, CURRENT_DATE())
        AND TRANSACTION_STATUS IN ('COMPLETED', 'BLOCKED')
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "ML fraud score identifies high-risk transactions for real-time intervention and investigation",
    owner: "Fraud Prevention",
    sla: {maxLatencyHours: 1, targetAccuracy: 99.5, refreshFrequency: "Real-time"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CRIT-002",
    name: "Transaction Processing Efficiency (End-to-End)",
    description: "Average total processing time from submission to settlement",
    category: "Performance",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND(AVG(DATEDIFF(millisecond, SUBMISSION_TIME, COMPLETION_TIME)), 0) as avg_processing_time_ms,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY DATEDIFF(millisecond, SUBMISSION_TIME, COMPLETION_TIME)), 0) as p95_processing_time_ms,
        ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY DATEDIFF(millisecond, SUBMISSION_TIME, COMPLETION_TIME)), 0) as p99_processing_time_ms,
        COUNT(*) as total_transactions
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE COMPLETION_TIME IS NOT NULL
        AND TRANSACTION_DATE >= DATEADD(day, -7, CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Weekly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "milliseconds",
    businessLogic: "Measures transaction processing speed - critical for customer experience and operational efficiency",
    owner: "Operations",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CRIT-003",
    name: "Cross-Channel Transaction Consistency",
    description: "Percentage of transactions matching expected patterns by channel",
    category: "Quality",
    type: "Tactical",
    sqlDefinition: `
      SELECT
        TRANSACTION_CHANNEL,
        ROUND(CAST(SUM(CASE WHEN IS_PATTERN_MATCH = TRUE THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(*), 0) * 100, 2) as consistency_pct,
        COUNT(*) as total_txns
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(day, -7, CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
      GROUP BY TRANSACTION_CHANNEL
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Validates transaction consistency across channels (mobile, web, ATM, branch) to identify anomalies",
    owner: "Quality Assurance",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CRIT-004",
    name: "Transaction Exception Rate",
    description: "Percentage of transactions requiring manual intervention or exception handling",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND(CAST(SUM(CASE WHEN HAS_EXCEPTION = TRUE OR REQUIRES_REVIEW = TRUE THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(*), 0) * 100, 2) as exception_rate_pct,
        COUNT(CASE WHEN HAS_EXCEPTION = TRUE OR REQUIRES_REVIEW = TRUE THEN 1 END) as exception_count,
        COUNT(*) as total_transactions
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Tracks percentage of transactions with exceptions to identify process improvement opportunities",
    owner: "Operations",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CRIT-005",
    name: "Settlement Success Rate by Transaction Type",
    description: "Percentage of transactions settling successfully by type (ACH, Wire, RTP, etc)",
    category: "Performance",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        TRANSACTION_TYPE,
        ROUND(CAST(SUM(CASE WHEN SETTLEMENT_STATUS = 'SETTLED' THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(*), 0) * 100, 2) as settlement_success_rate,
        COUNT(CASE WHEN SETTLEMENT_STATUS = 'SETTLED' THEN 1 END) as settled_count,
        COUNT(CASE WHEN SETTLEMENT_STATUS = 'FAILED' THEN 1 END) as failed_count,
        COUNT(*) as total_transactions
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
      GROUP BY TRANSACTION_TYPE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Measures transaction reliability by type - critical SLA metric for each payment channel",
    owner: "Payments",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.9, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CRIT-006",
    name: "Transaction Throughput Utilization",
    description: "Percentage of system capacity used based on peak transaction volume",
    category: "Performance",
    type: "Tactical",
    sqlDefinition: `
      SELECT
        DATEPART(hour, SUBMISSION_TIME) as hour_of_day,
        COUNT(*) as hourly_txn_count,
        ROUND(CAST(COUNT(*) AS FLOAT) / (
          SELECT MAX(hourly_count)
          FROM (
            SELECT COUNT(*) as hourly_count
            FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
            WHERE SUBMISSION_TIME >= DATEADD(day, -7, CURRENT_DATE())
            GROUP BY DATEPART(hour, SUBMISSION_TIME)
          ) peak_hours
        ) * 100, 2) as capacity_utilization_pct,
        CASE
          WHEN CAST(COUNT(*) AS FLOAT) / (SELECT MAX(hourly_count) FROM (SELECT COUNT(*) as hourly_count FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE SUBMISSION_TIME >= DATEADD(day, -7, CURRENT_DATE()) GROUP BY DATEPART(hour, SUBMISSION_TIME)) peak_hours) > 0.9 THEN 'CRITICAL'
          WHEN CAST(COUNT(*) AS FLOAT) / (SELECT MAX(hourly_count) FROM (SELECT COUNT(*) as hourly_count FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE SUBMISSION_TIME >= DATEADD(day, -7, CURRENT_DATE()) GROUP BY DATEPART(hour, SUBMISSION_TIME)) peak_hours) > 0.7 THEN 'HIGH'
          ELSE 'NORMAL'
        END as capacity_status
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE SUBMISSION_TIME >= DATEADD(day, -1, CURRENT_DATE())
      GROUP BY DATEPART(hour, SUBMISSION_TIME)
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Monitors system capacity usage to ensure infrastructure meets demand and identifies scaling needs",
    owner: "Infrastructure",
    sla: {maxLatencyHours: 1, targetAccuracy: 99.5, refreshFrequency: "Real-time"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-AGG-001",
    name: "Transaction Amount Percentile Distribution by Channel",
    description: "Transaction amount distribution across percentiles segmented by transaction channel",
    category: "Value",
    type: "Tactical",
    sqlDefinition: `
      WITH channel_transactions AS (
        SELECT
          TRANSACTION_CHANNEL,
          TRANSACTION_AMOUNT
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
          AND TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_AMOUNT > 0
      )
      SELECT
        TRANSACTION_CHANNEL,
        COUNT(*) as transaction_count,
        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT), 2) as p25_amount,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT), 2) as median_amount,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT), 2) as p75_amount,
        ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT), 2) as p90_amount,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT), 2) as p95_amount,
        ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT), 2) as p99_amount,
        ROUND(AVG(TRANSACTION_AMOUNT), 2) as mean_amount,
        ROUND(STDDEV(TRANSACTION_AMOUNT), 2) as std_dev_amount,
        ROUND(MAX(TRANSACTION_AMOUNT), 2) as max_amount
      FROM channel_transactions
      GROUP BY TRANSACTION_CHANNEL
      ORDER BY median_amount DESC
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Percentile-based transaction amount analysis by channel using PERCENTILE_CONT for fraud detection and channel behavior patterns",
    owner: "Transaction Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: ["TXN-VAL-001", "TXN-CHAN-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-AGG-002",
    name: "Transaction Velocity Analysis with Moving Windows",
    description: "Customer transaction velocity tracking with 1hr, 24hr, and 7-day rolling windows for fraud detection",
    category: "Velocity",
    type: "Strategic",
    sqlDefinition: `
      WITH customer_transactions AS (
        SELECT
          CUSTOMER_NUMBER,
          TRANSACTION_ID,
          TRANSACTION_AMOUNT,
          SUBMISSION_TIME,
          COUNT(*) OVER (
            PARTITION BY CUSTOMER_NUMBER
            ORDER BY SUBMISSION_TIME
            RANGE BETWEEN INTERVAL '1' HOUR PRECEDING AND CURRENT ROW
          ) as txn_count_1hr,
          SUM(TRANSACTION_AMOUNT) OVER (
            PARTITION BY CUSTOMER_NUMBER
            ORDER BY SUBMISSION_TIME
            RANGE BETWEEN INTERVAL '1' HOUR PRECEDING AND CURRENT ROW
          ) as txn_amount_1hr,
          COUNT(*) OVER (
            PARTITION BY CUSTOMER_NUMBER
            ORDER BY SUBMISSION_TIME
            RANGE BETWEEN INTERVAL '24' HOUR PRECEDING AND CURRENT ROW
          ) as txn_count_24hr,
          SUM(TRANSACTION_AMOUNT) OVER (
            PARTITION BY CUSTOMER_NUMBER
            ORDER BY SUBMISSION_TIME
            RANGE BETWEEN INTERVAL '24' HOUR PRECEDING AND CURRENT ROW
          ) as txn_amount_24hr,
          COUNT(*) OVER (
            PARTITION BY CUSTOMER_NUMBER
            ORDER BY SUBMISSION_TIME
            RANGE BETWEEN INTERVAL '7' DAY PRECEDING AND CURRENT ROW
          ) as txn_count_7d,
          SUM(TRANSACTION_AMOUNT) OVER (
            PARTITION BY CUSTOMER_NUMBER
            ORDER BY SUBMISSION_TIME
            RANGE BETWEEN INTERVAL '7' DAY PRECEDING AND CURRENT ROW
          ) as txn_amount_7d
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE SUBMISSION_TIME >= DATEADD(day, -7, CURRENT_DATE())
          AND TRANSACTION_STATUS = 'COMPLETED'
      )
      SELECT
        CUSTOMER_NUMBER,
        MAX(txn_count_1hr) as max_txn_1hr,
        ROUND(MAX(txn_amount_1hr), 2) as max_amount_1hr,
        MAX(txn_count_24hr) as max_txn_24hr,
        ROUND(MAX(txn_amount_24hr), 2) as max_amount_24hr,
        MAX(txn_count_7d) as total_txn_7d,
        ROUND(MAX(txn_amount_7d), 2) as total_amount_7d,
        ROUND(AVG(txn_count_1hr), 2) as avg_txn_per_hr,
        ROUND(AVG(txn_amount_1hr), 2) as avg_amount_per_hr,
        CASE
          WHEN MAX(txn_count_1hr) > 10 OR MAX(txn_amount_1hr) > 10000 THEN 'High Velocity Alert'
          WHEN MAX(txn_count_24hr) > 50 OR MAX(txn_amount_24hr) > 50000 THEN 'Elevated Velocity'
          ELSE 'Normal'
        END as velocity_risk_level
      FROM customer_transactions
      GROUP BY CUSTOMER_NUMBER
      HAVING MAX(txn_count_1hr) > 1
      ORDER BY max_txn_1hr DESC, max_amount_1hr DESC
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Window-based velocity tracking using RANGE window frames to detect unusual transaction patterns across multiple time horizons",
    owner: "Fraud Prevention",
    sla: {maxLatencyHours: 1, targetAccuracy: 99.9, refreshFrequency: "Real-time"},
    relatedMetrics: ["TXN-CRIT-001", "TXN-FRAUD-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-AGG-003",
    name: "Transaction Success Rate Trend - 7-Day Moving Average",
    description: "Daily transaction success rate with 7-day MA and variance analysis by transaction type",
    category: "Performance",
    type: "Operational",
    sqlDefinition: `
      WITH daily_metrics AS (
        SELECT
          CAST(TRANSACTION_DATE AS DATE) as txn_date,
          TRANSACTION_TYPE,
          COUNT(*) as total_transactions,
          COUNT(CASE WHEN TRANSACTION_STATUS = 'COMPLETED' THEN 1 END) as successful_txns,
          COUNT(CASE WHEN TRANSACTION_STATUS = 'FAILED' THEN 1 END) as failed_txns,
          ROUND(CAST(COUNT(CASE WHEN TRANSACTION_STATUS = 'COMPLETED' THEN 1 END) AS FLOAT) /
                NULLIF(COUNT(*), 0) * 100, 2) as success_rate_pct
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
        GROUP BY CAST(TRANSACTION_DATE AS DATE), TRANSACTION_TYPE
      ),
      moving_averages AS (
        SELECT
          txn_date,
          TRANSACTION_TYPE,
          total_transactions,
          successful_txns,
          failed_txns,
          success_rate_pct,
          ROUND(AVG(success_rate_pct) OVER (
            PARTITION BY TRANSACTION_TYPE
            ORDER BY txn_date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
          ), 2) as ma_7d_success_rate,
          ROUND(STDDEV(success_rate_pct) OVER (
            PARTITION BY TRANSACTION_TYPE
            ORDER BY txn_date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
          ), 2) as stddev_7d_success_rate,
          LAG(success_rate_pct, 1) OVER (PARTITION BY TRANSACTION_TYPE ORDER BY txn_date) as prev_day_success_rate
        FROM daily_metrics
      )
      SELECT
        txn_date,
        TRANSACTION_TYPE,
        total_transactions,
        successful_txns,
        failed_txns,
        success_rate_pct,
        ma_7d_success_rate,
        stddev_7d_success_rate,
        prev_day_success_rate,
        ROUND(success_rate_pct - prev_day_success_rate, 2) as day_over_day_change,
        CASE
          WHEN success_rate_pct < ma_7d_success_rate - (2 * stddev_7d_success_rate) THEN 'Significant Degradation'
          WHEN success_rate_pct < ma_7d_success_rate - stddev_7d_success_rate THEN 'Below Average'
          WHEN success_rate_pct > ma_7d_success_rate + stddev_7d_success_rate THEN 'Above Average'
          ELSE 'Normal'
        END as performance_indicator
      FROM moving_averages
      WHERE ma_7d_success_rate IS NOT NULL
      ORDER BY txn_date DESC, TRANSACTION_TYPE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Moving average and standard deviation analysis using window functions (AVG OVER, STDDEV OVER, LAG) for performance monitoring and anomaly detection",
    owner: "Operations",
    sla: {maxLatencyHours: 12, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: ["TXN-CRIT-002", "TXN-PERF-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-AGG-004",
    name: "Transaction Cohort Analysis - First Transaction Date",
    description: "Customer cohort performance based on first transaction date with retention and activity metrics",
    category: "Activity",
    type: "Strategic",
    sqlDefinition: `
      WITH first_transaction AS (
        SELECT
          CUSTOMER_NUMBER,
          MIN(TRANSACTION_DATE) as first_txn_date,
          DATE_TRUNC('month', MIN(TRANSACTION_DATE)) as cohort_month
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_STATUS = 'COMPLETED'
        GROUP BY CUSTOMER_NUMBER
      ),
      monthly_activity AS (
        SELECT
          ft.CUSTOMER_NUMBER,
          ft.cohort_month,
          DATE_TRUNC('month', t.TRANSACTION_DATE) as activity_month,
          DATEDIFF(month, ft.cohort_month, DATE_TRUNC('month', t.TRANSACTION_DATE)) as months_since_first,
          COUNT(DISTINCT t.TRANSACTION_ID) as txn_count,
          ROUND(SUM(t.TRANSACTION_AMOUNT), 2) as txn_amount
        FROM first_transaction ft
        LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION t ON ft.CUSTOMER_NUMBER = t.CUSTOMER_NUMBER
        WHERE t.TRANSACTION_STATUS = 'COMPLETED'
          AND ft.cohort_month >= DATEADD(month, -12, CURRENT_DATE())
        GROUP BY ft.CUSTOMER_NUMBER, ft.cohort_month, DATE_TRUNC('month', t.TRANSACTION_DATE)
      ),
      cohort_metrics AS (
        SELECT
          cohort_month,
          months_since_first,
          COUNT(DISTINCT CUSTOMER_NUMBER) as active_customers,
          SUM(txn_count) as total_transactions,
          ROUND(AVG(txn_count), 2) as avg_txn_per_customer,
          ROUND(SUM(txn_amount), 2) as total_amount,
          ROUND(AVG(txn_amount), 2) as avg_amount_per_customer
        FROM monthly_activity
        GROUP BY cohort_month, months_since_first
      )
      SELECT
        cohort_month,
        months_since_first,
        active_customers,
        total_transactions,
        avg_txn_per_customer,
        total_amount,
        avg_amount_per_customer,
        ROUND(CAST(active_customers AS FLOAT) /
              FIRST_VALUE(active_customers) OVER (PARTITION BY cohort_month ORDER BY months_since_first) * 100, 2) as retention_rate,
        ROUND(AVG(avg_txn_per_customer) OVER (PARTITION BY months_since_first), 2) as avg_txn_by_age,
        ROUND(AVG(avg_amount_per_customer) OVER (PARTITION BY months_since_first), 2) as avg_amount_by_age
      FROM cohort_metrics
      WHERE months_since_first <= 12
      ORDER BY cohort_month DESC, months_since_first
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Cohort retention analysis using FIRST_VALUE and window partitioning to track customer behavior evolution from first transaction",
    owner: "Customer Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.5, refreshFrequency: "Weekly"},
    relatedMetrics: ["TXN-VOL-001", "TXN-ACT-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-AGG-005",
    name: "Hourly Transaction Volume with Peak Detection",
    description: "Hourly transaction patterns with peak identification and capacity utilization metrics",
    category: "Performance",
    type: "Operational",
    sqlDefinition: `
      WITH hourly_volumes AS (
        SELECT
          CAST(TRANSACTION_DATE AS DATE) as txn_date,
          DATEPART(hour, SUBMISSION_TIME) as txn_hour,
          DATEPART(dow, TRANSACTION_DATE) as day_of_week,
          COUNT(*) as hourly_txn_count,
          ROUND(SUM(TRANSACTION_AMOUNT), 2) as hourly_txn_amount,
          COUNT(CASE WHEN TRANSACTION_STATUS = 'COMPLETED' THEN 1 END) as successful_count,
          COUNT(CASE WHEN TRANSACTION_STATUS = 'FAILED' THEN 1 END) as failed_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
        GROUP BY CAST(TRANSACTION_DATE AS DATE), DATEPART(hour, SUBMISSION_TIME), DATEPART(dow, TRANSACTION_DATE)
      ),
      hourly_stats AS (
        SELECT
          txn_date,
          txn_hour,
          day_of_week,
          hourly_txn_count,
          hourly_txn_amount,
          successful_count,
          failed_count,
          ROUND(AVG(hourly_txn_count) OVER (PARTITION BY txn_hour), 2) as avg_txn_for_hour,
          ROUND(MAX(hourly_txn_count) OVER (), 2) as system_peak_volume,
          ROUND(STDDEV(hourly_txn_count) OVER (PARTITION BY txn_hour), 2) as stddev_for_hour,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY hourly_txn_count) OVER (PARTITION BY txn_hour) as p95_for_hour
        FROM hourly_volumes
      )
      SELECT
        txn_date,
        txn_hour,
        CASE day_of_week
          WHEN 0 THEN 'Sunday'
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
          WHEN 6 THEN 'Saturday'
        END as day_name,
        hourly_txn_count,
        hourly_txn_amount,
        successful_count,
        failed_count,
        avg_txn_for_hour,
        ROUND(CAST(hourly_txn_count AS FLOAT) / NULLIF(system_peak_volume, 0) * 100, 2) as pct_of_peak_capacity,
        CASE
          WHEN hourly_txn_count > p95_for_hour THEN 'Peak Hour'
          WHEN hourly_txn_count > avg_txn_for_hour + stddev_for_hour THEN 'High Volume'
          WHEN hourly_txn_count < avg_txn_for_hour - stddev_for_hour THEN 'Low Volume'
          ELSE 'Normal'
        END as volume_category,
        ROUND(CAST(successful_count AS FLOAT) / NULLIF(hourly_txn_count, 0) * 100, 2) as hourly_success_rate
      FROM hourly_stats
      ORDER BY txn_date DESC, txn_hour
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Hourly pattern analysis using multiple window functions (AVG OVER, MAX OVER, STDDEV, PERCENTILE_CONT) for capacity planning and peak detection",
    owner: "Infrastructure",
    sla: {maxLatencyHours: 6, targetAccuracy: 99.8, refreshFrequency: "Hourly"},
    relatedMetrics: ["TXN-CRIT-006", "TXN-VOL-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-AGG-006",
    name: "Transaction Processing Time Percentiles by Type",
    description: "End-to-end processing time distribution with P50, P90, P95, P99 by transaction type for SLA monitoring",
    category: "Performance",
    type: "Strategic",
    sqlDefinition: `
      WITH processing_times AS (
        SELECT
          TRANSACTION_TYPE,
          TRANSACTION_CHANNEL,
          DATEDIFF(millisecond, SUBMISSION_TIME, COMPLETION_TIME) as processing_time_ms,
          CAST(TRANSACTION_DATE AS DATE) as txn_date
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE COMPLETION_TIME IS NOT NULL
          AND TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_DATE >= DATEADD(day, -7, CURRENT_DATE())
          AND DATEDIFF(millisecond, SUBMISSION_TIME, COMPLETION_TIME) > 0
      )
      SELECT
        TRANSACTION_TYPE,
        TRANSACTION_CHANNEL,
        COUNT(*) as sample_size,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY processing_time_ms), 0) as p50_processing_ms,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY processing_time_ms), 0) as p75_processing_ms,
        ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY processing_time_ms), 0) as p90_processing_ms,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms), 0) as p95_processing_ms,
        ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY processing_time_ms), 0) as p99_processing_ms,
        ROUND(AVG(processing_time_ms), 0) as avg_processing_ms,
        ROUND(STDDEV(processing_time_ms), 0) as stddev_processing_ms,
        ROUND(MIN(processing_time_ms), 0) as min_processing_ms,
        ROUND(MAX(processing_time_ms), 0) as max_processing_ms,
        CASE
          WHEN PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) < 1000 THEN 'Excellent (<1s P95)'
          WHEN PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) < 3000 THEN 'Good (<3s P95)'
          WHEN PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) < 5000 THEN 'Acceptable (<5s P95)'
          ELSE 'Needs Improvement (>5s P95)'
        END as performance_rating
      FROM processing_times
      GROUP BY TRANSACTION_TYPE, TRANSACTION_CHANNEL
      HAVING COUNT(*) >= 100
      ORDER BY p95_processing_ms DESC
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    granularity: "Weekly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "milliseconds",
    businessLogic: "Percentile-based SLA monitoring using PERCENTILE_CONT for latency distribution analysis across transaction types and channels",
    owner: "Operations",
    sla: {maxLatencyHours: 12, targetAccuracy: 99.9, refreshFrequency: "Daily"},
    relatedMetrics: ["TXN-CRIT-002", "TXN-PERF-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
];

export const transactionsGoldMetricsComplete = {
  metrics: transactionsGoldMetrics,
  totalMetrics: transactionsGoldMetrics.length,
  categories: {
    Volume: transactionsGoldMetrics.filter((m) => m.category === "Volume").length,
    Value: transactionsGoldMetrics.filter((m) => m.category === "Value").length,
    Activity: transactionsGoldMetrics.filter((m) => m.category === "Activity").length,
    Quality: transactionsGoldMetrics.filter((m) => m.category === "Quality").length,
    Risk: transactionsGoldMetrics.filter((m) => m.category === "Risk").length,
    Performance: transactionsGoldMetrics.filter((m) => m.category === "Performance").length,
    Channel: transactionsGoldMetrics.filter((m) => m.category === "Channel").length,
    Compliance: transactionsGoldMetrics.filter((m) => m.category === "Compliance").length,
    Fraud: transactionsGoldMetrics.filter((m) => m.category === "Fraud").length,
    Velocity: transactionsGoldMetrics.filter((m) => m.category === "Velocity").length,
    Revenue: transactionsGoldMetrics.filter((m) => m.category === "Revenue").length,
  },
  description: "Transactions domain Gold layer metrics with complete SQL definitions",
};

export default transactionsGoldMetricsComplete;
