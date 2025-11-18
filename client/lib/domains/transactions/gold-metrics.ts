/**
 * TRANSACTIONS DOMAIN - GOLD LAYER METRICS
 * 
 * Two-Tier Metrics Strategy:
 * - Tier 1: Unified metrics aggregating across all 5 transaction types
 * - Tier 2: Table-specific metrics for each transaction type
 * 
 * Transaction Tables (Silver Layer):
 * 1. CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION (regular deposits/withdrawals)
 * 2. CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION (CD transactions)
 * 3. CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION (holds/freezes)
 * 4. CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION (account maintenance)
 * 5. CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION (stop payments)
 */

export interface GoldMetric {
  metricId: string;
  name: string;
  description: string;
  category: "Volume" | "Value" | "Activity" | "Quality" | "Risk" | "Performance" | "Channel" | "Compliance" | "Fraud" | "Velocity" | "Revenue" | "Mix";
  type: "Operational" | "Strategic" | "Tactical";
  grain: string;
  sqlDefinition: string;
  sourceTables: string[];
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
  // ============================================================================
  // TIER 1: UNIFIED CROSS-TRANSACTION METRICS
  // ============================================================================
  {
    metricId: "TXN-ALL-001",
    name: "Total Daily Transaction Volume (All Types)",
    description: "Total transaction count across all transaction types with DoD/WoW/MoM trends",
    category: "Volume",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      WITH all_transactions AS (
        SELECT TRANSACTION_DATE, TRANSACTION_ID, 'ACCOUNT' as TXN_TYPE FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION WHERE TRANSACTION_STATUS = 'COMPLETED'
        UNION ALL
        SELECT TRANSACTION_DATE, TRANSACTION_ID, 'CD' as TXN_TYPE FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_STATUS = 'COMPLETED'
        UNION ALL
        SELECT HOLD_START_DATE as TRANSACTION_DATE, TRANSACTION_ID, 'HOLD' as TXN_TYPE FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION WHERE HOLD_STATUS = 'ACTIVE'
        UNION ALL
        SELECT CHANGE_DATE as TRANSACTION_DATE, TRANSACTION_ID, 'MAINTENANCE' as TXN_TYPE FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION
        UNION ALL
        SELECT STOP_ENTERED_DATE as TRANSACTION_DATE, TRANSACTION_ID, 'STOP' as TXN_TYPE FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION WHERE STOP_STATUS = 'ACTIVE'
      ),
      daily_volumes AS (
        SELECT
          CAST(TRANSACTION_DATE AS DATE) as txn_date,
          COUNT(DISTINCT TRANSACTION_ID) as daily_count,
          LAG(COUNT(DISTINCT TRANSACTION_ID), 1) OVER (ORDER BY CAST(TRANSACTION_DATE AS DATE)) as prev_day,
          LAG(COUNT(DISTINCT TRANSACTION_ID), 7) OVER (ORDER BY CAST(TRANSACTION_DATE AS DATE)) as prev_week,
          LAG(COUNT(DISTINCT TRANSACTION_ID), 30) OVER (ORDER BY CAST(TRANSACTION_DATE AS DATE)) as prev_month
        FROM all_transactions
        WHERE TRANSACTION_DATE >= DATEADD(month, -2, CURRENT_DATE())
        GROUP BY CAST(TRANSACTION_DATE AS DATE)
      )
      SELECT
        txn_date,
        daily_count as total_transaction_count,
        prev_day,
        prev_week,
        prev_month,
        ROUND(CAST(daily_count - prev_day AS FLOAT) / NULLIF(prev_day, 0) * 100, 2) as dod_growth_pct,
        ROUND(CAST(daily_count - prev_week AS FLOAT) / NULLIF(prev_week, 0) * 100, 2) as wow_growth_pct,
        ROUND(CAST(daily_count - prev_month AS FLOAT) / NULLIF(prev_month, 0) * 100, 2) as mom_growth_pct
      FROM daily_volumes
      WHERE txn_date = CURRENT_DATE()
    `,
    sourceTables: [
      "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"
    ],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "UNION ALL across 5 transaction tables with LAG for DoD/WoW/MoM trends",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.99,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ALL-002", "TXN-ALL-003"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION", "FCT_DEPOSIT_CERTIFICATE_TRANSACTION", "FCT_DEPOSIT_HOLD_TRANSACTION", "FCT_DEPOSIT_MAINTENANCE_TRANSACTION", "FCT_DEPOSIT_STOP_TRANSACTION"],
  },
  {
    metricId: "TXN-ALL-002",
    name: "Total Daily Transaction Value (All Types)",
    description: "Total transaction dollar value across all transaction types",
    category: "Value",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      WITH all_transactions AS (
        SELECT TRANSACTION_DATE, TRANSACTION_AMOUNT FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION WHERE TRANSACTION_STATUS = 'COMPLETED'
        UNION ALL
        SELECT TRANSACTION_DATE, TRANSACTION_AMOUNT FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_STATUS = 'COMPLETED'
        UNION ALL
        SELECT TRANSACTION_DATE, HOLD_AMOUNT as TRANSACTION_AMOUNT FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION WHERE HOLD_STATUS = 'ACTIVE'
        UNION ALL
        SELECT TRANSACTION_DATE, 0 as TRANSACTION_AMOUNT FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION WHERE MAINTENANCE_STATUS = 'COMPLETED'
        UNION ALL
        SELECT TRANSACTION_DATE, STOP_AMOUNT as TRANSACTION_AMOUNT FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION WHERE STOP_STATUS = 'ACTIVE'
      )
      SELECT
        CAST(TRANSACTION_DATE AS DATE) as txn_date,
        SUM(TRANSACTION_AMOUNT) as total_value
      FROM all_transactions
      WHERE TRANSACTION_DATE = CURRENT_DATE()
      GROUP BY CAST(TRANSACTION_DATE AS DATE)
    `,
    sourceTables: [
      "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"
    ],
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "UNION ALL across transaction tables, SUM of amounts",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ALL-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION", "FCT_DEPOSIT_CERTIFICATE_TRANSACTION", "FCT_DEPOSIT_HOLD_TRANSACTION", "FCT_DEPOSIT_MAINTENANCE_TRANSACTION", "FCT_DEPOSIT_STOP_TRANSACTION"],
  },
  {
    metricId: "TXN-ALL-003",
    name: "Transaction Mix by Type",
    description: "Percentage distribution of transactions by type (Account, CD, Hold, Maintenance, Stop)",
    category: "Mix",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH all_transactions AS (
        SELECT 'ACCOUNT' as txn_type, COUNT(*) as type_count FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION WHERE TRANSACTION_DATE = CURRENT_DATE() AND TRANSACTION_STATUS = 'COMPLETED'
        UNION ALL
        SELECT 'CD' as txn_type, COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_DATE = CURRENT_DATE() AND TRANSACTION_STATUS = 'COMPLETED'
        UNION ALL
        SELECT 'HOLD' as txn_type, COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION WHERE TRANSACTION_DATE = CURRENT_DATE() AND HOLD_STATUS = 'ACTIVE'
        UNION ALL
        SELECT 'MAINTENANCE' as txn_type, COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION WHERE TRANSACTION_DATE = CURRENT_DATE() AND MAINTENANCE_STATUS = 'COMPLETED'
        UNION ALL
        SELECT 'STOP' as txn_type, COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION WHERE TRANSACTION_DATE = CURRENT_DATE() AND STOP_STATUS = 'ACTIVE'
      ),
      total_count AS (
        SELECT SUM(type_count) as total FROM all_transactions
      )
      SELECT
        txn_type,
        type_count,
        ROUND(CAST(type_count AS FLOAT) / NULLIF(total, 0) * 100, 2) as pct_of_total
      FROM all_transactions
      CROSS JOIN total_count
      ORDER BY type_count DESC
    `,
    sourceTables: [
      "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"
    ],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Count by type / total count * 100 across all transaction tables",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ALL-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION", "FCT_DEPOSIT_CERTIFICATE_TRANSACTION", "FCT_DEPOSIT_HOLD_TRANSACTION", "FCT_DEPOSIT_MAINTENANCE_TRANSACTION", "FCT_DEPOSIT_STOP_TRANSACTION"],
  },
  {
    metricId: "TXN-ALL-004",
    name: "Monthly Transaction Volume (All Types)",
    description: "Total transaction count for current month across all types",
    category: "Volume",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      WITH all_transactions AS (
        SELECT TRANSACTION_ID FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE()) AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE()) AND TRANSACTION_STATUS = 'COMPLETED'
        UNION ALL
        SELECT TRANSACTION_ID FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE()) AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE()) AND TRANSACTION_STATUS = 'COMPLETED'
        UNION ALL
        SELECT TRANSACTION_ID FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE()) AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE()) AND HOLD_STATUS = 'ACTIVE'
        UNION ALL
        SELECT TRANSACTION_ID FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE()) AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE()) AND MAINTENANCE_STATUS = 'COMPLETED'
        UNION ALL
        SELECT TRANSACTION_ID FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE()) AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE()) AND STOP_STATUS = 'ACTIVE'
      )
      SELECT COUNT(DISTINCT TRANSACTION_ID) as monthly_transaction_count
      FROM all_transactions
    `,
    sourceTables: [
      "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
      "CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"
    ],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "UNION ALL across 5 transaction tables for current month",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.99,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ALL-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION", "FCT_DEPOSIT_CERTIFICATE_TRANSACTION", "FCT_DEPOSIT_HOLD_TRANSACTION", "FCT_DEPOSIT_MAINTENANCE_TRANSACTION", "FCT_DEPOSIT_STOP_TRANSACTION"],
  },

  // ============================================================================
  // TIER 2A: ACCOUNT TRANSACTION METRICS (Most Common)
  // ============================================================================
  {
    metricId: "TXN-ACCT-001",
    name: "Daily Account Transaction Volume",
    description: "Daily deposit/withdrawal transaction count with DoD/WoW trends",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH daily_volumes AS (
        SELECT
          CAST(TRANSACTION_DATE AS DATE) as txn_date,
          COUNT(DISTINCT TRANSACTION_ID) as daily_count,
          LAG(COUNT(DISTINCT TRANSACTION_ID), 1) OVER (ORDER BY CAST(TRANSACTION_DATE AS DATE)) as prev_day,
          LAG(COUNT(DISTINCT TRANSACTION_ID), 7) OVER (ORDER BY CAST(TRANSACTION_DATE AS DATE)) as prev_week
        FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
        WHERE TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
        GROUP BY CAST(TRANSACTION_DATE AS DATE)
      )
      SELECT
        txn_date,
        daily_count,
        prev_day,
        prev_week,
        ROUND(CAST(daily_count - prev_day AS FLOAT) / NULLIF(prev_day, 0) * 100, 2) as dod_growth_pct,
        ROUND(CAST(daily_count - prev_week AS FLOAT) / NULLIF(prev_week, 0) * 100, 2) as wow_growth_pct
      FROM daily_volumes
      WHERE txn_date = CURRENT_DATE()
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Daily account transaction count with LAG for DoD/WoW trends",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.99,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACCT-002", "TXN-ALL-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "TXN-ACCT-002",
    name: "Daily Account Transaction Value",
    description: "Total dollar value of account transactions with trend analysis",
    category: "Value",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        CAST(TRANSACTION_DATE AS DATE) as txn_date,
        SUM(TRANSACTION_AMOUNT) as total_value,
        COUNT(DISTINCT TRANSACTION_ID) as txn_count,
        ROUND(AVG(TRANSACTION_AMOUNT), 2) as avg_amount
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
      GROUP BY CAST(TRANSACTION_DATE AS DATE)
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of account transaction amounts for current date",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACCT-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "TXN-ACCT-003",
    name: "Deposit Transaction Volume",
    description: "Count of deposit-only transactions",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as deposit_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'DEPOSIT'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of deposit transactions",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACCT-004"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "TXN-ACCT-004",
    name: "Withdrawal Transaction Volume",
    description: "Count of withdrawal transactions",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as withdrawal_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'WITHDRAWAL'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of withdrawal transactions",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACCT-003"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "TXN-ACCT-005",
    name: "Average Account Transaction Amount",
    description: "Average transaction size with percentile distribution",
    category: "Value",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        ROUND(AVG(TRANSACTION_AMOUNT), 2) as avg_amount,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT), 2) as median_amount,
        ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY TRANSACTION_AMOUNT), 2) as p90_amount,
        COUNT(*) as transaction_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_AMOUNT > 0
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average with PERCENTILE_CONT for distribution",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACCT-002"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "TXN-ACCT-006",
    name: "Account Transaction Failure Rate",
    description: "Percentage of failed account transactions",
    category: "Quality",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH txn_summary AS (
        SELECT
          COUNT(CASE WHEN TRANSACTION_STATUS = 'FAILED' THEN 1 END) as failed_count,
          COUNT(*) as total_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
        WHERE TRANSACTION_DATE = CURRENT_DATE()
      )
      SELECT
        ROUND((failed_count / NULLIF(total_count, 0)) * 100, 2) as failure_rate_pct
      FROM txn_summary
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Failed / Total * 100",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-ACCT-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },

  // ============================================================================
  // TIER 2B: CERTIFICATE OF DEPOSIT (CD) TRANSACTION METRICS
  // ============================================================================
  {
    metricId: "TXN-CD-001",
    name: "Daily CD Transaction Volume",
    description: "CD issuance, renewal, and redemption transaction count",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as cd_txn_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of completed CD transactions",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CD-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CD-002",
    name: "CD Issuance Volume",
    description: "New CD accounts opened",
    category: "Volume",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as cd_issuance_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'ISSUANCE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of CD issuance transactions",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CD-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CD-003",
    name: "CD Redemption Volume",
    description: "CDs redeemed/cashed out",
    category: "Volume",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as cd_redemption_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'REDEMPTION'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of CD redemption transactions",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CD-001"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CD-004",
    name: "CD Renewal Rate",
    description: "Percentage of maturing CDs that renew",
    category: "Performance",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      WITH cd_maturities AS (
        SELECT
          COUNT(CASE WHEN TRANSACTION_TYPE = 'RENEWAL' THEN 1 END) as renewal_count,
          COUNT(CASE WHEN TRANSACTION_TYPE IN ('REDEMPTION', 'RENEWAL') THEN 1 END) as total_maturities
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE())
          AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE())
          AND TRANSACTION_STATUS = 'COMPLETED'
      )
      SELECT
        ROUND((renewal_count / NULLIF(total_maturities, 0)) * 100, 2) as renewal_rate_pct
      FROM cd_maturities
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Renewals / Total maturities * 100",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CD-002", "TXN-CD-003"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-CD-005",
    name: "Average CD Principal Amount",
    description: "Average principal amount for new CD issuances",
    category: "Value",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        ROUND(AVG(TRANSACTION_AMOUNT), 2) as avg_cd_principal
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND TRANSACTION_TYPE = 'ISSUANCE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average of CD issuance amounts",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CD-002"],
    dependencies: ["FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },

  // ============================================================================
  // TIER 2C: HOLD TRANSACTION METRICS
  // ============================================================================
  {
    metricId: "TXN-HOLD-001",
    name: "Active Holds Count",
    description: "Number of active holds/freezes on accounts",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as active_holds_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION
      WHERE HOLD_STATUS = 'ACTIVE'
        AND TRANSACTION_DATE <= CURRENT_DATE()
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active holds as of current date",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-HOLD-002"],
    dependencies: ["FCT_DEPOSIT_HOLD_TRANSACTION"],
  },
  {
    metricId: "TXN-HOLD-002",
    name: "Total Hold Amount",
    description: "Total dollar amount under hold/freeze",
    category: "Value",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        SUM(HOLD_AMOUNT) as total_hold_amount
      FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION
      WHERE HOLD_STATUS = 'ACTIVE'
        AND TRANSACTION_DATE <= CURRENT_DATE()
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of active hold amounts",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-HOLD-001"],
    dependencies: ["FCT_DEPOSIT_HOLD_TRANSACTION"],
  },
  {
    metricId: "TXN-HOLD-003",
    name: "New Holds Placed Today",
    description: "Number of holds placed on current date",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as new_holds_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND HOLD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of new holds placed today",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-HOLD-001"],
    dependencies: ["FCT_DEPOSIT_HOLD_TRANSACTION"],
  },
  {
    metricId: "TXN-HOLD-004",
    name: "Holds Released Today",
    description: "Number of holds released on current date",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as holds_released_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION
      WHERE HOLD_RELEASE_DATE = CURRENT_DATE()
        AND HOLD_STATUS = 'RELEASED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of holds released today",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-HOLD-003"],
    dependencies: ["FCT_DEPOSIT_HOLD_TRANSACTION"],
  },
  {
    metricId: "TXN-HOLD-005",
    name: "Average Hold Amount",
    description: "Average dollar amount per hold",
    category: "Value",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        ROUND(AVG(HOLD_AMOUNT), 2) as avg_hold_amount
      FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION
      WHERE HOLD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average of active hold amounts",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-HOLD-002"],
    dependencies: ["FCT_DEPOSIT_HOLD_TRANSACTION"],
  },
  {
    metricId: "TXN-HOLD-006",
    name: "Average Hold Duration",
    description: "Average days holds remain active",
    category: "Performance",
    type: "Operational",
    grain: "Monthly",
    sqlDefinition: `
      SELECT
        ROUND(AVG(DATEDIFF(day, TRANSACTION_DATE, HOLD_RELEASE_DATE)), 1) as avg_hold_days
      FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION
      WHERE HOLD_STATUS = 'RELEASED'
        AND HOLD_RELEASE_DATE >= DATEADD(month, -1, CURRENT_DATE())
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "days",
    businessLogic: "Average duration from placement to release",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-HOLD-004"],
    dependencies: ["FCT_DEPOSIT_HOLD_TRANSACTION"],
  },

  // ============================================================================
  // TIER 2D: MAINTENANCE TRANSACTION METRICS
  // ============================================================================
  {
    metricId: "TXN-MAINT-001",
    name: "Daily Maintenance Activity Volume",
    description: "Number of account maintenance transactions",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as maintenance_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND MAINTENANCE_STATUS = 'COMPLETED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of completed maintenance transactions",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-MAINT-002"],
    dependencies: ["FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
  },
  {
    metricId: "TXN-MAINT-002",
    name: "Maintenance by Type Distribution",
    description: "Breakdown of maintenance activities by type",
    category: "Mix",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        MAINTENANCE_TYPE,
        COUNT(*) as type_count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pct_of_total
      FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND MAINTENANCE_STATUS = 'COMPLETED'
      GROUP BY MAINTENANCE_TYPE
      ORDER BY type_count DESC
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count grouped by maintenance type",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-MAINT-001"],
    dependencies: ["FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
  },
  {
    metricId: "TXN-MAINT-003",
    name: "Account Update Volume",
    description: "Number of account information update transactions",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as account_update_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND MAINTENANCE_STATUS = 'COMPLETED'
        AND MAINTENANCE_TYPE = 'ACCOUNT_UPDATE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of account update transactions",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-MAINT-002"],
    dependencies: ["FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
  },
  {
    metricId: "TXN-MAINT-004",
    name: "Address Change Volume",
    description: "Number of customer address change transactions",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as address_change_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND MAINTENANCE_STATUS = 'COMPLETED'
        AND MAINTENANCE_TYPE = 'ADDRESS_CHANGE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of address change transactions",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-MAINT-002"],
    dependencies: ["FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
  },
  {
    metricId: "TXN-MAINT-005",
    name: "Maintenance Completion Rate",
    description: "Percentage of maintenance requests completed successfully",
    category: "Quality",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH maint_summary AS (
        SELECT
          COUNT(CASE WHEN MAINTENANCE_STATUS = 'COMPLETED' THEN 1 END) as completed_count,
          COUNT(*) as total_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION
        WHERE TRANSACTION_DATE = CURRENT_DATE()
      )
      SELECT
        ROUND((completed_count / NULLIF(total_count, 0)) * 100, 2) as completion_rate_pct
      FROM maint_summary
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Completed / Total * 100",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-MAINT-001"],
    dependencies: ["FCT_DEPOSIT_MAINTENANCE_TRANSACTION"],
  },

  // ============================================================================
  // TIER 2E: STOP PAYMENT TRANSACTION METRICS
  // ============================================================================
  {
    metricId: "TXN-STOP-001",
    name: "Active Stop Payments Count",
    description: "Number of active stop payment orders",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as active_stops_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION
      WHERE STOP_STATUS = 'ACTIVE'
        AND TRANSACTION_DATE <= CURRENT_DATE()
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active stop payment orders",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-STOP-002"],
    dependencies: ["FCT_DEPOSIT_STOP_TRANSACTION"],
  },
  {
    metricId: "TXN-STOP-002",
    name: "New Stop Payments Placed Today",
    description: "Number of stop payment orders placed today",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as new_stops_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND STOP_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of stop payments placed today",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-STOP-001"],
    dependencies: ["FCT_DEPOSIT_STOP_TRANSACTION"],
  },
  {
    metricId: "TXN-STOP-003",
    name: "Total Stop Payment Amount",
    description: "Total dollar amount under stop payment orders",
    category: "Value",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        SUM(STOP_AMOUNT) as total_stop_amount
      FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION
      WHERE STOP_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of active stop payment amounts",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-STOP-001"],
    dependencies: ["FCT_DEPOSIT_STOP_TRANSACTION"],
  },
  {
    metricId: "TXN-STOP-004",
    name: "Stop Payment Success Rate",
    description: "Percentage of stop payments that successfully prevented payment",
    category: "Performance",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      WITH stop_summary AS (
        SELECT
          COUNT(CASE WHEN STOP_RESULT = 'PREVENTED' THEN 1 END) as prevented_count,
          COUNT(CASE WHEN STOP_RESULT IN ('PREVENTED', 'PAID') THEN 1 END) as total_resolved
        FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION
        WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE())
          AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE())
      )
      SELECT
        ROUND((prevented_count / NULLIF(total_resolved, 0)) * 100, 2) as success_rate_pct
      FROM stop_summary
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Prevented payments / Total resolved * 100",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-STOP-002"],
    dependencies: ["FCT_DEPOSIT_STOP_TRANSACTION"],
  },
  {
    metricId: "TXN-STOP-005",
    name: "Average Stop Payment Amount",
    description: "Average dollar amount per stop payment order",
    category: "Value",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        ROUND(AVG(STOP_AMOUNT), 2) as avg_stop_amount
      FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION
      WHERE STOP_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average of stop payment amounts",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-STOP-003"],
    dependencies: ["FCT_DEPOSIT_STOP_TRANSACTION"],
  },
  {
    metricId: "TXN-STOP-006",
    name: "Expired Stop Payments",
    description: "Number of stop payment orders that expired without action",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as expired_stops_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION
      WHERE STOP_EXPIRATION_DATE = CURRENT_DATE()
        AND STOP_STATUS = 'EXPIRED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of expired stop payments",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-STOP-001"],
    dependencies: ["FCT_DEPOSIT_STOP_TRANSACTION"],
  },

  // ============================================================================
  // CROSS-CUTTING METRICS (Channel, Compliance, Risk)
  // ============================================================================
  {
    metricId: "TXN-CHN-001",
    name: "Mobile Channel Transaction Share",
    description: "Percentage of account transactions from mobile channel",
    category: "Channel",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN TRANSACTION_CHANNEL = 'MOBILE' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100, 2) as mobile_share_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Mobile transactions / Total * 100",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CHN-002"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "TXN-CHN-002",
    name: "Digital Channel Adoption Rate",
    description: "Combined mobile + online transaction percentage",
    category: "Channel",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN TRANSACTION_CHANNEL IN ('MOBILE', 'ONLINE') THEN 1 END) / NULLIF(COUNT(*), 0)) * 100, 2) as digital_adoption_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "(Mobile + Online) / Total * 100",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-CHN-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "TXN-RISK-001",
    name: "High-Value Transaction Count",
    description: "Transactions exceeding $10K threshold (SAR reporting)",
    category: "Risk",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      WITH all_high_value AS (
        SELECT TRANSACTION_ID, TRANSACTION_AMOUNT FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION WHERE TRANSACTION_DATE = CURRENT_DATE() AND TRANSACTION_AMOUNT >= 10000
        UNION ALL
        SELECT TRANSACTION_ID, TRANSACTION_AMOUNT FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION WHERE TRANSACTION_DATE = CURRENT_DATE() AND TRANSACTION_AMOUNT >= 10000
      )
      SELECT COUNT(DISTINCT TRANSACTION_ID) as high_value_count
      FROM all_high_value
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION", "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions >= $10K across account and CD transactions",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-COMP-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION", "FCT_DEPOSIT_CERTIFICATE_TRANSACTION"],
  },
  {
    metricId: "TXN-COMP-001",
    name: "AML Flagged Transactions",
    description: "Transactions flagged for AML/BSA review",
    category: "Compliance",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT TRANSACTION_ID) as aml_flagged_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND AML_FLAG = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions with AML flag",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["TXN-RISK-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
];

export default transactionsGoldMetrics;
