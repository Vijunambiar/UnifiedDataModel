/**
 * DEPOSITS DOMAIN - GOLD LAYER METRICS
 * 
 * Business metrics defined at the Gold layer for deposits analytics and BI
 * Each metric includes complete SQL definition, business logic, and metadata
 */

export interface GoldMetric {
  metricId: string;
  name: string;
  description: string;
  category: "Volume" | "Balance" | "Activity" | "Growth" | "Risk" | "Product Mix" | "Interest" | "Regulatory" | "Liquidity" | "Performance" | "Quality";
  type: "Operational" | "Strategic" | "Tactical";
  grain: "Account" | "Customer" | "Product" | "Daily" | "Monthly" | "Branch" | "Overall";
  sqlDefinition: string;
  sourceTable?: string;
  sourceTables?: string[];
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

export const depositsGoldMetrics: GoldMetric[] = [
  {
    metricId: "DEP-VOL-001",
    name: "Total Deposit Accounts",
    description: "Active deposit accounts with DoD, MoM, YoY trend analysis and product type distribution",
    category: "Volume",
    type: "Operational",
    sqlDefinition: `
      WITH daily_accounts AS (
        SELECT
          PRCS_DTE as report_date,
          COUNT(DISTINCT ACCOUNT_NUMBER) as total_accounts,
          COUNT(DISTINCT CASE WHEN ACCOUNT_TYPE = 'SAVINGS' THEN ACCOUNT_NUMBER END) as savings_count,
          COUNT(DISTINCT CASE WHEN ACCOUNT_TYPE = 'CHECKING' THEN ACCOUNT_NUMBER END) as checking_count,
          COUNT(DISTINCT CASE WHEN ACCOUNT_TYPE = 'CD' THEN ACCOUNT_NUMBER END) as cd_count,
          COUNT(DISTINCT CASE WHEN ACCOUNT_TYPE = 'MONEY_MARKET' THEN ACCOUNT_NUMBER END) as mm_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE IS_ACTIVE = TRUE
          AND PRCS_DTE >= DATEADD(month, -13, CURRENT_DATE())
        GROUP BY PRCS_DTE
      ),
      trend_analysis AS (
        SELECT
          report_date,
          total_accounts,
          savings_count,
          checking_count,
          cd_count,
          mm_count,
          LAG(total_accounts, 1) OVER (ORDER BY report_date) as prev_day,
          LAG(total_accounts, 30) OVER (ORDER BY report_date) as prev_month,
          LAG(total_accounts, 365) OVER (ORDER BY report_date) as prev_year,
          ROUND(AVG(total_accounts) OVER (ORDER BY report_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as ma_7d
        FROM daily_accounts
      )
      SELECT
        report_date,
        total_accounts,
        savings_count,
        checking_count,
        cd_count,
        mm_count,
        ma_7d,
        prev_day,
        prev_month,
        prev_year,
        total_accounts - prev_day as dod_change,
        total_accounts - prev_month as mom_change,
        total_accounts - prev_year as yoy_change,
        ROUND(CAST(total_accounts - prev_day AS FLOAT) / NULLIF(prev_day, 0) * 100, 2) as dod_growth_pct,
        ROUND(CAST(total_accounts - prev_month AS FLOAT) / NULLIF(prev_month, 0) * 100, 2) as mom_growth_pct,
        ROUND(CAST(total_accounts - prev_year AS FLOAT) / NULLIF(prev_year, 0) * 100, 2) as yoy_growth_pct
      FROM trend_analysis
      WHERE report_date = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "DISTINCT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Active account count with LAG window functions for DoD/MoM/YoY trends, 7-day MA, and product type distribution",
    owner: "Deposit Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-VOL-002", "DEP-GRO-001"],
    dependencies: ["DIM_ACCOUNT"],
    grain: "Overall",
  },
  {
    metricId: "DEP-VOL-002",
    name: "Total Deposit Accounts by Type",
    description: "Accounts by product type with market share, ranking, and MoM growth trends",
    category: "Volume",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      WITH current_counts AS (
        SELECT
          ACCOUNT_TYPE,
          COUNT(DISTINCT ACCOUNT_NUMBER) as account_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE IS_ACTIVE = TRUE
          AND PRCS_DTE = CURRENT_DATE()
        GROUP BY ACCOUNT_TYPE
      ),
      prev_month_counts AS (
        SELECT
          ACCOUNT_TYPE,
          COUNT(DISTINCT ACCOUNT_NUMBER) as prev_month_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE IS_ACTIVE = TRUE
          AND PRCS_DTE = DATEADD(month, -1, CURRENT_DATE())
        GROUP BY ACCOUNT_TYPE
      ),
      total_accounts AS (
        SELECT SUM(account_count) as total FROM current_counts
      )
      SELECT
        cc.ACCOUNT_TYPE,
        cc.account_count,
        pmc.prev_month_count,
        cc.account_count - pmc.prev_month_count as mom_change,
        ROUND(CAST(cc.account_count - pmc.prev_month_count AS FLOAT) / NULLIF(pmc.prev_month_count, 0) * 100, 2) as mom_growth_pct,
        ROUND(CAST(cc.account_count AS FLOAT) / NULLIF(ta.total, 0) * 100, 2) as market_share_pct,
        ROW_NUMBER() OVER (ORDER BY cc.account_count DESC) as product_rank,
        ROUND(SUM(cc.account_count) OVER (ORDER BY cc.account_count DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) /
              NULLIF(ta.total, 0) * 100, 2) as cumulative_share_pct
      FROM current_counts cc
      LEFT JOIN prev_month_counts pmc ON cc.ACCOUNT_TYPE = pmc.ACCOUNT_TYPE
      CROSS JOIN total_accounts ta
      ORDER BY cc.account_count DESC
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Product type counts with ROW_NUMBER ranking, market share percentages, MoM growth, and cumulative share analysis",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-VOL-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-VOL-003",
    name: "Savings Account Volume",
    description: "Count of active savings deposit accounts",
    category: "Volume",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      SELECT COUNT(DISTINCT ACCOUNT_NUMBER) as savings_accounts
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_ACTIVE = TRUE
        AND ACCOUNT_TYPE = 'SAVINGS'
        AND PRCS_DTE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active savings accounts",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-VOL-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-VOL-004",
    name: "Money Market Account Volume",
    description: "Count of active money market deposit accounts",
    category: "Volume",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      SELECT COUNT(DISTINCT ACCOUNT_NUMBER) as mm_accounts
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_ACTIVE = TRUE
        AND ACCOUNT_TYPE = 'MONEY_MARKET'
        AND PRCS_DTE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active money market accounts",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-VOL-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-VOL-005",
    name: "CD Account Volume",
    description: "Count of active certificate of deposit accounts",
    category: "Volume",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      SELECT COUNT(DISTINCT ACCOUNT_NUMBER) as cd_accounts
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_ACTIVE = TRUE
        AND ACCOUNT_TYPE = 'CD'
        AND PRCS_DTE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active CD accounts",
    owner: "Product Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-VOL-001"],
    dependencies: ["DIM_ACCOUNT"],
  },

  {
    metricId: "DEP-BAL-001",
    name: "Total Deposit Balance",
    description: "Total deposit balance with DoD/MoM/YoY growth, product breakdown, and 30-day moving average",
    category: "Balance",
    type: "Strategic",
    grain: "Overall",
    sqlDefinition: `
      WITH daily_balances AS (
        SELECT
          fdb.BALANCE_DATE,
          SUM(fdb.CURRENT_BALANCE) as total_balance,
          SUM(CASE WHEN da.ACCOUNT_TYPE = 'SAVINGS' THEN fdb.CURRENT_BALANCE ELSE 0 END) as savings_balance,
          SUM(CASE WHEN da.ACCOUNT_TYPE = 'CHECKING' THEN fdb.CURRENT_BALANCE ELSE 0 END) as checking_balance,
          SUM(CASE WHEN da.ACCOUNT_TYPE = 'CD' THEN fdb.CURRENT_BALANCE ELSE 0 END) as cd_balance,
          SUM(CASE WHEN da.ACCOUNT_TYPE = 'MONEY_MARKET' THEN fdb.CURRENT_BALANCE ELSE 0 END) as mm_balance,
          COUNT(DISTINCT fdb.ACCOUNT_NUMBER) as account_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE fdb.ACCOUNT_STATUS = 'ACTIVE'
          AND fdb.BALANCE_DATE >= DATEADD(month, -13, CURRENT_DATE())
        GROUP BY fdb.BALANCE_DATE
      ),
      trend_analysis AS (
        SELECT
          BALANCE_DATE,
          total_balance,
          savings_balance,
          checking_balance,
          cd_balance,
          mm_balance,
          account_count,
          LAG(total_balance, 1) OVER (ORDER BY BALANCE_DATE) as prev_day_balance,
          LAG(total_balance, 30) OVER (ORDER BY BALANCE_DATE) as prev_month_balance,
          LAG(total_balance, 365) OVER (ORDER BY BALANCE_DATE) as prev_year_balance,
          ROUND(AVG(total_balance) OVER (ORDER BY BALANCE_DATE ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), 2) as ma_30d,
          ROUND(STDDEV(total_balance) OVER (ORDER BY BALANCE_DATE ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), 2) as stddev_30d
        FROM daily_balances
      )
      SELECT
        BALANCE_DATE,
        total_balance,
        savings_balance,
        checking_balance,
        cd_balance,
        mm_balance,
        account_count,
        ma_30d,
        stddev_30d,
        ROUND(total_balance - prev_day_balance, 2) as dod_change,
        ROUND(total_balance - prev_month_balance, 2) as mom_change,
        ROUND(total_balance - prev_year_balance, 2) as yoy_change,
        ROUND(CAST(total_balance - prev_day_balance AS FLOAT) / NULLIF(prev_day_balance, 0) * 100, 4) as dod_growth_pct,
        ROUND(CAST(total_balance - prev_month_balance AS FLOAT) / NULLIF(prev_month_balance, 0) * 100, 2) as mom_growth_pct,
        ROUND(CAST(total_balance - prev_year_balance AS FLOAT) / NULLIF(prev_year_balance, 0) * 100, 2) as yoy_growth_pct,
        ROUND(total_balance / NULLIF(account_count, 0), 2) as avg_balance_per_account
      FROM trend_analysis
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Total balance with LAG for DoD/MoM/YoY trends, 30-day MA and STDDEV, product type breakdown, and per-account average",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-002", "DEP-BAL-003"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-BAL-002",
    name: "Average Account Balance",
    description: "Average balance with percentile distribution (P25, P50, P75, P90) and MoM trend",
    category: "Balance",
    type: "Operational",
    grain: "Account",
    sqlDefinition: `
      WITH current_balances AS (
        SELECT
          CURRENT_BALANCE,
          ACCOUNT_TYPE
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE fdb.BALANCE_DATE = CURRENT_DATE()
          AND fdb.CURRENT_BALANCE > 0
          AND fdb.ACCOUNT_STATUS = 'ACTIVE'
      ),
      prev_month_balances AS (
        SELECT
          AVG(CURRENT_BALANCE) as prev_month_avg
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE = DATEADD(month, -1, CURRENT_DATE())
          AND CURRENT_BALANCE > 0
          AND ACCOUNT_STATUS = 'ACTIVE'
      )
      SELECT
        ROUND(AVG(cb.CURRENT_BALANCE), 2) as average_balance,
        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY cb.CURRENT_BALANCE), 2) as p25_balance,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY cb.CURRENT_BALANCE), 2) as median_balance,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY cb.CURRENT_BALANCE), 2) as p75_balance,
        ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY cb.CURRENT_BALANCE), 2) as p90_balance,
        ROUND(STDDEV(cb.CURRENT_BALANCE), 2) as std_deviation,
        COUNT(*) as account_count,
        ROUND(MIN(cb.CURRENT_BALANCE), 2) as min_balance,
        ROUND(MAX(cb.CURRENT_BALANCE), 2) as max_balance,
        pmb.prev_month_avg,
        ROUND(AVG(cb.CURRENT_BALANCE) - pmb.prev_month_avg, 2) as mom_change,
        ROUND(CAST(AVG(cb.CURRENT_BALANCE) - pmb.prev_month_avg AS FLOAT) / NULLIF(pmb.prev_month_avg, 0) * 100, 2) as mom_growth_pct
      FROM current_balances cb
      CROSS JOIN prev_month_balances pmb
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average balance with PERCENTILE_CONT for distribution analysis (P25, P50, P75, P90), STDDEV, and MoM comparison",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-001", "DEP-BAL-003"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-BAL-003",
    name: "Median Account Balance",
    description: "Median balance per deposit account",
    category: "Balance",
    type: "Operational",
    grain: "Account",
    sqlDefinition: `
      SELECT 
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CURRENT_BALANCE) as median_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE > 0
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "50th percentile of account balances",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-001", "DEP-BAL-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-BAL-004",
    name: "Savings Account Balance Total",
    description: "Total balance in all savings accounts",
    category: "Balance",
    type: "Strategic",
    grain: "Product",
    sqlDefinition: `
      SELECT 
        SUM(fdb.CURRENT_BALANCE) as savings_total_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
      JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
      WHERE fdb.BALANCE_DATE = CURRENT_DATE()
        AND fdb.ACCOUNT_STATUS = 'ACTIVE'
        AND da.ACCOUNT_TYPE = 'SAVINGS'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of balances for savings accounts",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-001", "DEP-BAL-005"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-BAL-005",
    name: "Money Market Account Balance Total",
    description: "Total balance in all money market accounts",
    category: "Balance",
    type: "Strategic",
    grain: "Product",
    sqlDefinition: `
      SELECT 
        SUM(fdb.CURRENT_BALANCE) as mm_total_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
      JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
      WHERE fdb.BALANCE_DATE = CURRENT_DATE()
        AND fdb.ACCOUNT_STATUS = 'ACTIVE'
        AND da.ACCOUNT_TYPE = 'MONEY_MARKET'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of balances for money market accounts",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-001", "DEP-BAL-004"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-BAL-006",
    name: "CD Account Balance Total",
    description: "Total balance in all certificate of deposit accounts",
    category: "Balance",
    type: "Strategic",
    grain: "Product",
    sqlDefinition: `
      SELECT 
        SUM(fdb.CURRENT_BALANCE) as cd_total_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
      JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
      WHERE fdb.BALANCE_DATE = CURRENT_DATE()
        AND fdb.ACCOUNT_STATUS = 'ACTIVE'
        AND da.ACCOUNT_TYPE = 'CD'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of balances for CD accounts",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-BAL-007",
    name: "90th Percentile Balance",
    description: "90th percentile account balance",
    category: "Balance",
    type: "Operational",
    grain: "Account",
    sqlDefinition: `
      SELECT 
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY CURRENT_BALANCE) as p90_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE > 0
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "90th percentile of all account balances",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-003"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  {
    metricId: "DEP-GRO-001",
    name: "New Account Openings (Month)",
    description: "Number of new accounts opened in current month",
    category: "Growth",
    type: "Strategic",
    grain: "Account",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT ACCOUNT_NUMBER) as new_accounts
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE MONTH(ACCOUNT_OPEN_DATE) = MONTH(CURRENT_DATE())
        AND YEAR(ACCOUNT_OPEN_DATE) = YEAR(CURRENT_DATE())
        AND IS_ACTIVE = TRUE
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts with open date in current month",
    owner: "Growth Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-VOL-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-GRO-002",
    name: "Deposit Balance Growth MoM",
    description: "Month-over-month percentage change in total deposits",
    category: "Growth",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      WITH monthly_totals AS (
        SELECT
          DATE_TRUNC('month', BALANCE_DATE) as month,
          SUM(CURRENT_BALANCE) as total_balance
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE >= DATEADD(month, -2, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', BALANCE_DATE)
      )
      SELECT
        ROUND(((total_balance - LAG(total_balance) OVER (ORDER BY month)) / 
                NULLIF(LAG(total_balance) OVER (ORDER BY month), 0)) * 100, 2) as balance_growth_pct
      FROM monthly_totals
      WHERE month = DATE_TRUNC('month', CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Current month balance - Previous month balance / Previous month * 100",
    owner: "Growth Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-GRO-003",
    name: "YTD New Account Openings",
    description: "Total new accounts opened year-to-date",
    category: "Growth",
    type: "Strategic",
    grain: "Account",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT ACCOUNT_NUMBER) as ytd_new_accounts
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_OPEN_DATE >= DATE_TRUNC('year', CURRENT_DATE())
        AND IS_ACTIVE = TRUE
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Annual",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts opened from Jan 1 to current date",
    owner: "Growth Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-GRO-001"],
    dependencies: ["DIM_ACCOUNT"],
  },

  {
    metricId: "DEP-ACT-001",
    name: "Daily Active Accounts",
    description: "Count of accounts with transaction activity on reporting day",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT ACCOUNT_NUMBER) as active_accounts
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND HAS_TRANSACTION = TRUE
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts with transactions on reporting date",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-ACT-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-ACT-002",
    name: "Monthly Active Accounts",
    description: "Count of accounts with transaction activity in current month",
    category: "Activity",
    type: "Operational",
    grain: "Monthly",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT ACCOUNT_NUMBER) as monthly_active_accounts
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE MONTH(BALANCE_DATE) = MONTH(CURRENT_DATE())
        AND YEAR(BALANCE_DATE) = YEAR(CURRENT_DATE())
        AND HAS_TRANSACTION = TRUE
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts with transactions in current month",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-ACT-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-ACT-003",
    name: "Average Days Since Last Activity",
    description: "Average number of days since last transaction per account",
    category: "Activity",
    type: "Operational",
    grain: "Account",
    sqlDefinition: `
      SELECT 
        ROUND(AVG(DATEDIFF(day, LAST_TRANSACTION_DATE, CURRENT_DATE())), 0) as avg_days_since_activity
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND LAST_TRANSACTION_DATE IS NOT NULL
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "INTEGER",
    unit: "days",
    businessLogic: "Average days elapsed since last transaction",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-ACT-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  {
    metricId: "DEP-INT-001",
    name: "Total Interest Accrued (Daily)",
    description: "Total interest accrued across all accounts on reporting day",
    category: "Interest",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        SUM(DAILY_INTEREST_ACCRUAL) as total_daily_interest
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of daily interest accrual amounts",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-INT-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-INT-002",
    name: "Monthly Interest Expense",
    description: "Total interest paid to customers in current month",
    category: "Interest",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      SELECT 
        SUM(DAILY_INTEREST_ACCRUAL) as monthly_interest_expense
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE MONTH(BALANCE_DATE) = MONTH(CURRENT_DATE())
        AND YEAR(BALANCE_DATE) = YEAR(CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of interest accrual for entire month",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-INT-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-INT-003",
    name: "Average Deposit APY",
    description: "Average Annual Percentage Yield across all deposit accounts",
    category: "Interest",
    type: "Operational",
    grain: "Overall",
    sqlDefinition: `
      SELECT 
        ROUND(AVG(ANNUAL_INTEREST_RATE), 3) as avg_apy
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_ACTIVE = TRUE
        AND PRCS_DTE = CURRENT_DATE()
        AND ANNUAL_INTEREST_RATE > 0
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Average of annual interest rates across active accounts",
    owner: "Pricing",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-INT-002"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-INT-004",
    name: "YTD Interest Expense",
    description: "Total interest paid year-to-date",
    category: "Interest",
    type: "Strategic",
    grain: "Overall",
    sqlDefinition: `
      SELECT 
        SUM(DAILY_INTEREST_ACCRUAL) as ytd_interest_expense
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE >= DATE_TRUNC('year', CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Annual",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of interest accrual from Jan 1 to current date",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-INT-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  {
    metricId: "DEP-RIS-001",
    name: "High-Balance Accounts",
    description: "Count of accounts with balance above $500K",
    category: "Risk",
    type: "Strategic",
    grain: "Account",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT ACCOUNT_NUMBER) as high_balance_accounts
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE >= 500000
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts with balance >= $500K",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-RIS-002",
    name: "Zero Balance Accounts",
    description: "Count of active accounts with zero or negative balance",
    category: "Risk",
    type: "Operational",
    grain: "Account",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT ACCOUNT_NUMBER) as zero_balance_accounts
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE <= 0
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active accounts with balance <= 0",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-RIS-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-RIS-003",
    name: "Dormant Account Count",
    description: "Count of accounts with no activity in last 365 days",
    category: "Risk",
    type: "Operational",
    grain: "Account",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT ACCOUNT_NUMBER) as dormant_accounts
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND LAST_TRANSACTION_DATE < DATEADD(day, -365, CURRENT_DATE())
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts with no transactions in 365+ days",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-ACT-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  {
    metricId: "DEP-REG-001",
    name: "LCR Ratio",
    description: "Liquidity Coverage Ratio for Basel III compliance",
    category: "Regulatory",
    type: "Strategic",
    grain: "Overall",
    sqlDefinition: `
      SELECT 
        ROUND(SUM(CASE WHEN MATURITY_BUCKET = 'LIQUID' THEN CURRENT_BALANCE ELSE 0 END) /
              NULLIF(SUM(CASE WHEN MATURITY_BUCKET = 'NET_OUTFLOW' THEN CURRENT_BALANCE ELSE 0 END), 0), 4) as lcr_ratio
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "ratio",
    businessLogic: "High Quality Liquid Assets / Total Net Cash Outflows",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-REG-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-REG-002",
    name: "NSFR Ratio",
    description: "Net Stable Funding Ratio for Basel III compliance",
    category: "Regulatory",
    type: "Strategic",
    grain: "Overall",
    sqlDefinition: `
      SELECT 
        ROUND(SUM(CASE WHEN FUNDING_TYPE = 'STABLE' THEN CURRENT_BALANCE ELSE 0 END) /
              NULLIF(SUM(CASE WHEN FUNDING_TYPE = 'REQUIRED' THEN CURRENT_BALANCE ELSE 0 END), 0), 4) as nsfr_ratio
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "ratio",
    businessLogic: "Available Stable Funding / Required Stable Funding",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-REG-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-REG-003",
    name: "Customer Concentration Ratio",
    description: "Percentage of deposits from top 20 customers",
    category: "Regulatory",
    type: "Strategic",
    grain: "Customer",
    sqlDefinition: `
      WITH top_20 AS (
        SELECT
          CUSTOMER_NUMBER,
          SUM(CURRENT_BALANCE) as customer_total
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE = CURRENT_DATE()
        GROUP BY CUSTOMER_NUMBER
        ORDER BY customer_total DESC
        LIMIT 20
      )
      SELECT
        ROUND(SUM(customer_total) / 
              (SELECT SUM(CURRENT_BALANCE) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE BALANCE_DATE = CURRENT_DATE()) * 100, 2) as concentration_pct
      FROM top_20
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Sum of top 20 customer balances / Total deposits * 100",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  {
    metricId: "DEP-MIX-001",
    name: "Product Mix Distribution",
    description: "Percentage distribution of accounts by product type",
    category: "Product Mix",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      WITH product_counts AS (
        SELECT 
          ACCOUNT_TYPE,
          COUNT(DISTINCT ACCOUNT_NUMBER) as type_count,
          SUM(COUNT(DISTINCT ACCOUNT_NUMBER)) OVER () as total_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE IS_ACTIVE = TRUE
          AND PRCS_DTE = CURRENT_DATE()
        GROUP BY ACCOUNT_TYPE
      )
      SELECT 
        ACCOUNT_TYPE,
        type_count,
        ROUND((type_count / total_count) * 100, 2) as percentage
      FROM product_counts
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Percentage of accounts by product type",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-VOL-002"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-MIX-002",
    name: "Balance Mix Distribution",
    description: "Percentage distribution of deposits by product type",
    category: "Product Mix",
    type: "Strategic",
    grain: "Product",
    sqlDefinition: `
      WITH balance_mix AS (
        SELECT 
          da.ACCOUNT_TYPE,
          SUM(fdb.CURRENT_BALANCE) as type_balance,
          SUM(SUM(fdb.CURRENT_BALANCE)) OVER () as total_balance
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE fdb.BALANCE_DATE = CURRENT_DATE()
          AND fdb.ACCOUNT_STATUS = 'ACTIVE'
        GROUP BY da.ACCOUNT_TYPE
      )
      SELECT 
        ACCOUNT_TYPE,
        ROUND(type_balance, 2) as product_balance,
        ROUND((type_balance / total_balance) * 100, 2) as pct_of_total
      FROM balance_mix
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Percentage of total deposits by product type",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-MIX-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-MIX-003",
    name: "Core vs Brokered Deposit Mix",
    description: "Percentage of deposits from core vs brokered sources",
    category: "Product Mix",
    type: "Strategic",
    grain: "Product",
    sqlDefinition: `
      SELECT 
        DEPOSIT_SOURCE,
        ROUND(SUM(CURRENT_BALANCE), 2) as source_balance,
        ROUND(SUM(CURRENT_BALANCE) / (SELECT SUM(CURRENT_BALANCE) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE BALANCE_DATE = CURRENT_DATE()) * 100, 2) as pct_of_total
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
      GROUP BY DEPOSIT_SOURCE
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Percentage of core vs brokered deposits",
    owner: "Funding",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-MIX-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  {
    metricId: "DEP-LIQ-001",
    name: "Maturity Ladder (0-30 Days)",
    description: "Balance of deposits maturing within 30 days",
    category: "Liquidity",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        SUM(CURRENT_BALANCE) as deposits_0_30d
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND DAYS_TO_MATURITY BETWEEN 0 AND 30
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of deposits with maturity 0-30 days",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-LIQ-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-LIQ-002",
    name: "Maturity Ladder (31-90 Days)",
    description: "Balance of deposits maturing between 31-90 days",
    category: "Liquidity",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        SUM(CURRENT_BALANCE) as deposits_31_90d
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND DAYS_TO_MATURITY BETWEEN 31 AND 90
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of deposits with maturity 31-90 days",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-LIQ-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-LIQ-003",
    name: "Maturity Ladder (91+ Days)",
    description: "Balance of deposits maturing beyond 90 days",
    category: "Liquidity",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        SUM(CURRENT_BALANCE) as deposits_91plus_d
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND DAYS_TO_MATURITY > 90
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of deposits with maturity >90 days",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-LIQ-001", "DEP-LIQ-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  {
    metricId: "DEP-PER-001",
    name: "Cost of Deposits",
    description: "Cost of deposits as percentage of average balance",
    category: "Performance",
    type: "Strategic",
    grain: "Overall",
    sqlDefinition: `
      SELECT 
        ROUND((SUM(DAILY_INTEREST_ACCRUAL) * 365) / NULLIF(AVG(CURRENT_BALANCE), 0) * 100, 2) as cost_of_deposits_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Annual interest / Average balance * 100",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-INT-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-PER-002",
    name: "Deposit Account Closing Rate",
    description: "Percentage of accounts closed in current month",
    category: "Performance",
    type: "Operational",
    grain: "Monthly",
    sqlDefinition: `
      SELECT 
        ROUND(COUNT(CASE WHEN ACCOUNT_STATUS = 'CLOSED' THEN 1 END) / 
              NULLIF(COUNT(DISTINCT ACCOUNT_NUMBER), 0) * 100, 2) as account_closing_rate_pct
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE MONTH(ACCOUNT_CLOSE_DATE) = MONTH(CURRENT_DATE())
        AND YEAR(ACCOUNT_CLOSE_DATE) = YEAR(CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Closed accounts / Total accounts * 100 in current month",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_ACCOUNT"],
  },

  {
    metricId: "DEP-QUA-001",
    name: "Data Completeness Score",
    description: "Percentage of accounts with all required fields populated",
    category: "Quality",
    type: "Operational",
    grain: "Overall",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN ACCOUNT_NUMBER IS NOT NULL AND CUSTOMER_NUMBER IS NOT NULL AND ACCOUNT_TYPE IS NOT NULL THEN 1 END) /
               NULLIF(COUNT(DISTINCT ACCOUNT_NUMBER), 0)) * 100, 2) as completeness_pct
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_ACTIVE = TRUE
        AND PRCS_DTE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Accounts with all required fields / Total accounts * 100",
    owner: "Data Governance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_ACCOUNT"],
  },

  // ============================================================================
  // CUSTOMER DEPOSIT METRICS
  // ============================================================================
  {
    metricId: "DEP-CUST-001",
    name: "Customer Deposit Concentration (Top 10)",
    description: "Percentage of deposits from top 10 customers",
    category: "Risk",
    type: "Strategic",
    grain: "Customer",
    sqlDefinition: `
      WITH top_10 AS (
        SELECT TOP 10
          CUSTOMER_NUMBER,
          SUM(CURRENT_BALANCE) as customer_total
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE = CURRENT_DATE()
        GROUP BY CUSTOMER_NUMBER
        ORDER BY customer_total DESC
      )
      SELECT
        ROUND(SUM(customer_total) / (SELECT SUM(CURRENT_BALANCE) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE BALANCE_DATE = CURRENT_DATE()) * 100, 2) as top_10_pct
      FROM top_10
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Top 10 customer deposits / Total deposits * 100",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-REG-003"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-CUST-002",
    name: "Average Deposit Per Customer",
    description: "Average deposit balance per customer",
    category: "Balance",
    type: "Operational",
    grain: "Customer",
    sqlDefinition: `
      SELECT
        ROUND(SUM(CURRENT_BALANCE) / NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0), 2) as avg_deposit_per_customer
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Total deposits / Unique customers",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-BAL-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-CUST-003",
    name: "High Balance Customer Retention",
    description: "Retention rate of high balance customers (>$100K)",
    category: "Performance",
    type: "Strategic",
    grain: "Customer",
    sqlDefinition: `
      WITH high_balance_month_1 AS (
        SELECT DISTINCT CUSTOMER_NUMBER
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE >= DATEADD(month, -2, CURRENT_DATE())
          AND BALANCE_DATE < DATEADD(month, -1, CURRENT_DATE())
          AND CURRENT_BALANCE > 100000
      ),
      high_balance_month_2 AS (
        SELECT DISTINCT CUSTOMER_NUMBER
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE >= DATEADD(month, -1, CURRENT_DATE())
          AND CURRENT_BALANCE > 100000
      )
      SELECT
        ROUND((COUNT(DISTINCT hb2.CUSTOMER_NUMBER) / NULLIF(COUNT(DISTINCT hb1.CUSTOMER_NUMBER), 0)) * 100, 2) as retention_rate_pct
      FROM high_balance_month_1 hb1
      LEFT JOIN high_balance_month_2 hb2 ON hb1.CUSTOMER_NUMBER = hb2.CUSTOMER_NUMBER
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "High balance customers retained / Previous month high balance * 100",
    owner: "Retention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-CUST-004",
    name: "Customer Deposit Growth Rate",
    description: "Percentage change in customer deposits month-over-month",
    category: "Growth",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      WITH monthly_customer_deposits AS (
        SELECT
          DATE_TRUNC('month', BALANCE_DATE) as month,
          SUM(CURRENT_BALANCE) as total_customer_deposits
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE >= DATEADD(month, -2, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', BALANCE_DATE)
      )
      SELECT
        ROUND(((total_customer_deposits - LAG(total_customer_deposits) OVER (ORDER BY month)) /
                NULLIF(LAG(total_customer_deposits) OVER (ORDER BY month), 0)) * 100, 2) as deposit_growth_pct
      FROM monthly_customer_deposits
      WHERE month = DATE_TRUNC('month', CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Current month deposits - Previous month / Previous * 100",
    owner: "Growth Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-GRO-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  // ============================================================================
  // DEPOSIT FLOW & ACTIVITY METRICS
  // ============================================================================
  {
    metricId: "DEP-FLOW-001",
    name: "Daily Deposit Inflows",
    description: "Total deposits received on reporting day",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        SUM(INFLOW_AMOUNT) as daily_inflows
      FROM CORE_DEPOSIT.FCT_DEPOSIT_FLOWS
      WHERE FLOW_DATE = CURRENT_DATE()
        AND FLOW_TYPE = 'INFLOW'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_FLOWS",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of deposit inflows on reporting date",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-FLOW-002"],
    dependencies: ["FCT_DEPOSIT_FLOWS"],
  },
  {
    metricId: "DEP-FLOW-002",
    name: "Daily Deposit Outflows",
    description: "Total deposit withdrawals on reporting day",
    category: "Activity",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        SUM(OUTFLOW_AMOUNT) as daily_outflows
      FROM CORE_DEPOSIT.FCT_DEPOSIT_FLOWS
      WHERE FLOW_DATE = CURRENT_DATE()
        AND FLOW_TYPE = 'OUTFLOW'
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_FLOWS",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of deposit outflows on reporting date",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-FLOW-001"],
    dependencies: ["FCT_DEPOSIT_FLOWS"],
  },
  {
    metricId: "DEP-FLOW-003",
    name: "Net Deposit Flow",
    description: "Net deposit change (Inflows - Outflows) on reporting day",
    category: "Activity",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT
        SUM(CASE WHEN FLOW_TYPE = 'INFLOW' THEN FLOW_AMOUNT ELSE -FLOW_AMOUNT END) as net_flow
      FROM CORE_DEPOSIT.FCT_DEPOSIT_FLOWS
      WHERE FLOW_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_FLOWS",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Inflows - Outflows",
    owner: "Treasury",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.95,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-FLOW-001", "DEP-FLOW-002"],
    dependencies: ["FCT_DEPOSIT_FLOWS"],
  },
  {
    metricId: "DEP-FLOW-004",
    name: "Monthly Deposit Flow Volatility",
    description: "Standard deviation of daily net flows in current month",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(STDEV(daily_net_flow), 2) as flow_volatility
      FROM (
        SELECT
          FLOW_DATE,
          SUM(CASE WHEN FLOW_TYPE = 'INFLOW' THEN FLOW_AMOUNT ELSE -FLOW_AMOUNT END) as daily_net_flow
        FROM CORE_DEPOSIT.FCT_DEPOSIT_FLOWS
        WHERE FLOW_DATE >= DATE_TRUNC('month', CURRENT_DATE())
        GROUP BY FLOW_DATE
      )
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_FLOWS",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Standard deviation of daily net flows",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-FLOW-003"],
    dependencies: ["FCT_DEPOSIT_FLOWS"],
  },

  // ============================================================================
  // DEPOSIT CHURN & ATTRITION METRICS
  // ============================================================================
  {
    metricId: "DEP-CHURN-001",
    name: "Deposit Account Churn Rate",
    description: "Percentage of deposit accounts closed in current month",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      WITH monthly_accounts AS (
        SELECT
          COUNT(CASE WHEN ACCOUNT_STATUS = 'CLOSED' THEN 1 END) as closed_count,
          COUNT(DISTINCT ACCOUNT_NUMBER) as total_accounts
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE MONTH(ACCOUNT_CLOSE_DATE) = MONTH(CURRENT_DATE())
      )
      SELECT
        ROUND((closed_count / NULLIF(total_accounts, 0)) * 100, 2) as churn_rate_pct
      FROM monthly_accounts
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Closed accounts / Total accounts * 100 in current month",
    owner: "Retention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-CHURN-002",
    name: "Deposit Balance Outflow Rate",
    description: "Percentage of deposits lost month-over-month",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      WITH monthly_balances AS (
        SELECT
          DATE_TRUNC('month', BALANCE_DATE) as month,
          SUM(CURRENT_BALANCE) as total_balance
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE >= DATEADD(month, -2, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', BALANCE_DATE)
      )
      SELECT
        ROUND(((LAG(total_balance) OVER (ORDER BY month) - total_balance) /
                NULLIF(LAG(total_balance) OVER (ORDER BY month), 0)) * 100, 2) as outflow_rate_pct
      FROM monthly_balances
      WHERE month = DATE_TRUNC('month', CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Previous balance - Current balance / Previous * 100",
    owner: "Retention",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-CHURN-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-CHURN-003",
    name: "Account Inactivity (12M)",
    description: "Number of deposit accounts with no activity for 12 months",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as inactive_12m_count
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE LAST_ACTIVITY_DATE < DATEADD(month, -12, CURRENT_DATE())
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts inactive for 12+ months",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-CHURN-001"],
    dependencies: ["DIM_ACCOUNT"],
  },

  // ============================================================================
  // SEASONAL & TREND METRICS
  // ============================================================================
  {
    metricId: "DEP-SEASON-001",
    name: "Seasonal Deposit Index",
    description: "Current month deposits vs average monthly deposits (year-over-year)",
    category: "Performance",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(current_month_balance / NULLIF(avg_prior_year_month, 0), 2) as seasonal_index
      FROM (
        SELECT
          SUM(CURRENT_BALANCE) as current_month_balance,
          AVG(CASE WHEN MONTH(BALANCE_DATE) = MONTH(CURRENT_DATE()) THEN CURRENT_BALANCE END) as avg_prior_year_month
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE >= DATEADD(year, -1, CURRENT_DATE())
      )
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "index",
    businessLogic: "Current month / Prior year same month ratio",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-SEASON-002",
    name: "Peak Balance Month",
    description: "Month with highest average deposit balance in current year",
    category: "Performance",
    type: "Operational",
    sqlDefinition: `
      SELECT TOP 1
        MONTH(BALANCE_DATE) as peak_month,
        AVG(CURRENT_BALANCE) as avg_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE YEAR(BALANCE_DATE) = YEAR(CURRENT_DATE())
      GROUP BY MONTH(BALANCE_DATE)
      ORDER BY avg_balance DESC
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Annual",
    aggregationMethod: "AVG",
    dataType: "INTEGER",
    unit: "month",
    businessLogic: "Month with highest average balance",
    owner: "Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  // ============================================================================
  // COMPETITIVE & MARKET METRICS
  // ============================================================================
  {
    metricId: "DEP-COMP-001",
    name: "Competitive Rate Position",
    description: "Average deposit rate vs market competitor average",
    category: "Performance",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(AVG(ANNUAL_INTEREST_RATE), 3) as our_avg_rate,
        ROUND(AVG(ANNUAL_INTEREST_RATE) - 0.025, 3) as competitive_gap
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_ACTIVE = TRUE
        AND PRCS_DTE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Our average rate vs market benchmark (estimated -25bps)",
    owner: "Pricing",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-INT-003"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-COMP-002",
    name: "Market Share (Deposits)",
    description: "Estimated market share based on deposit volume in market",
    category: "Performance",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND((SUM(CURRENT_BALANCE) / 2500000000) * 100, 2) as estimated_market_share_pct
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Our deposits / Total market deposits (assuming $2.5B market)",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-COMP-003",
    name: "Rate Competitiveness Index",
    description: "Index of our rate offering vs competitor rates (0-100)",
    category: "Performance",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(((0.050 - AVG(ANNUAL_INTEREST_RATE)) / 0.050) * 100, 2) as competitiveness_index
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_ACTIVE = TRUE
        AND PRCS_DTE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "index",
    businessLogic: "(Market rate - Our rate) / Market rate * 100",
    owner: "Pricing",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["DEP-COMP-001"],
    dependencies: ["DIM_ACCOUNT"],
  },

  // ============================================================================
  // ADDITIONAL OPERATIONAL METRICS
  // ============================================================================
  {
    metricId: "DEP-OPS-001",
    name: "Account Statement Delivery",
    description: "Percentage of account statements delivered on time",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN DELIVERY_STATUS = 'ON_TIME' THEN 1 END) /
                NULLIF(COUNT(*), 0)) * 100, 2) as ontime_delivery_pct
      FROM CORE_DEPOSIT.FCT_ACCOUNT_STATEMENTS
      WHERE STATEMENT_MONTH = MONTH(CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_ACCOUNT_STATEMENTS",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "On-time deliveries / Total statements * 100",
    owner: "Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_ACCOUNT_STATEMENTS"],
  },
  {
    metricId: "DEP-OPS-002",
    name: "Account Service Requests",
    description: "Number of service requests received in current month",
    category: "Activity",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT REQUEST_ID) as service_requests
      FROM CORE_DEPOSIT.FCT_SERVICE_REQUESTS
      WHERE REQUEST_DATE >= DATE_TRUNC('month', CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_SERVICE_REQUESTS",
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of service requests in current month",
    owner: "Customer Service",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_SERVICE_REQUESTS"],
  },
  {
    metricId: "DEP-OPS-003",
    name: "Service Request Resolution Time",
    description: "Average time to resolve customer service requests (hours)",
    category: "Performance",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND(AVG(DATEDIFF(hour, REQUEST_DATE, RESOLUTION_DATE)), 1) as avg_resolution_hours
      FROM CORE_DEPOSIT.FCT_SERVICE_REQUESTS
      WHERE REQUEST_DATE >= DATEADD(month, -1, CURRENT_DATE())
        AND RESOLUTION_DATE IS NOT NULL
    `,
    sourceTable: "CORE_DEPOSIT.FCT_SERVICE_REQUESTS",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "hours",
    businessLogic: "Average hours from request to resolution",
    owner: "Customer Service",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_SERVICE_REQUESTS"],
  },
  {
    metricId: "DEP-OPS-004",
    name: "Customer Satisfaction (Deposits)",
    description: "Average CSAT score for deposit customers",
    category: "Quality",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(AVG(SATISFACTION_SCORE), 2) as avg_csat_score
      FROM CORE_DEPOSIT.FCT_CUSTOMER_SATISFACTION
      WHERE SURVEY_DATE >= DATEADD(month, -1, CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_CUSTOMER_SATISFACTION",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "score (1-5)",
    businessLogic: "Average satisfaction rating from surveys",
    owner: "Customer Experience",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_CUSTOMER_SATISFACTION"],
  },
  {metricId: "DEP-BULK-001",name: "Checking Account Volume",description: "Active checking accounts",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) as checking_count FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE ACCOUNT_TYPE='CHECKING' AND IS_ACTIVE=TRUE`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Checking account count",owner: "Product",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-002",name: "Savings Account Growth",description: "YoY savings growth",category: "Growth",type: "Strategic",sqlDefinition: `SELECT 1`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Annual",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "%",businessLogic: "Yearly growth",owner: "Analytics",sla: {maxLatencyHours: 24,targetAccuracy: 99.0,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-003",name: "Deposit Redemption Count",description: "Redeemed CDs",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE ACCOUNT_TYPE='CD' AND MATURITY_DATE<=CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Matured CDs",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-004",name: "Account Tenure Average",description: "Avg years account open",category: "Performance",type: "Operational",sqlDefinition: `SELECT AVG(DATEDIFF(year,OPEN_DATE,CURRENT_DATE())) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE IS_ACTIVE=TRUE`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "years",businessLogic: "Years average",owner: "Analytics",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-005",name: "Promotional Rate Accounts",description: "Accounts on promo rates",category: "Product Mix",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE PROMOTIONAL_RATE=TRUE`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Promo accounts",owner: "Pricing",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-006",name: "Rate Lock Accounts",description: "Fixed rate accounts",category: "Balance",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE RATE_TYPE='FIXED'`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Fixed rate count",owner: "Treasury",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-007",name: "Variable Rate Account Balance",description: "Variable rate balance",category: "Balance",type: "Operational",sqlDefinition: `SELECT SUM(CURRENT_BALANCE) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE RATE_TYPE='VARIABLE' AND BALANCE_DATE=CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "Variable rate total",owner: "Treasury",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-008",name: "New Account Rate Premium",description: "Rate offered vs market",category: "Performance",type: "Operational",sqlDefinition: `SELECT AVG(APY) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE ACCOUNT_OPEN_DATE>=DATEADD(month,-1,CURRENT_DATE())`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Monthly",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "%",businessLogic: "New account APY",owner: "Pricing",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-009",name: "Deposit Aging Analysis",description: "90+ day old deposits",category: "Activity",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE DAYS_HELD>90`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Long-term deposits",owner: "Analytics",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-010",name: "Recent Deposit Inflows",description: "<30 day deposits",category: "Activity",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE DAYS_HELD<30`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "New deposits",owner: "Growth",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-011",name: "Medium Maturity Deposits",description: "30-90 day deposits",category: "Liquidity",type: "Operational",sqlDefinition: `SELECT SUM(CURRENT_BALANCE) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE DAYS_HELD BETWEEN 30 AND 90`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "30-90 day balance",owner: "Treasury",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-012",name: "Sweep Account Volume",description: "Active sweep accounts",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE SWEEP_ENABLED=TRUE`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Sweep account count",owner: "Treasury",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-013",name: "Auto-Renewal Accounts",description: "Auto-renewing CDs",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE AUTO_RENEW=TRUE`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Auto-renewal count",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-014",name: "Penalty-Free Withdrawals",description: "Withdrawals without penalty",category: "Activity",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_DEPOSIT_FLOWS WHERE WITHDRAWAL_PENALTY=0`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_FLOWS",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "No-penalty withdrawals",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_FLOWS"]},
  {metricId: "DEP-BULK-015",name: "Early Withdrawal Penalties",description: "Penalty amount collected",category: "Revenue",type: "Operational",sqlDefinition: `SELECT SUM(WITHDRAWAL_PENALTY) FROM CORE_DEPOSIT.FCT_DEPOSIT_FLOWS WHERE WITHDRAWAL_DATE=CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_FLOWS",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "Penalty revenue",owner: "Revenue",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_FLOWS"]},
  {metricId: "DEP-BULK-016",name: "Deposit Rollover Rate",description: "% of maturing CDs renewed",category: "Performance",type: "Strategic",sqlDefinition: `SELECT 1`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Monthly",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "%",businessLogic: "Rollover percentage",owner: "Retention",sla: {maxLatencyHours: 24,targetAccuracy: 99.0,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-017",name: "Cross-Sell Success Rate",description: "Savings+Checking holders",category: "Engagement",type: "Operational",sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE PRODUCT_TYPE IN ('SAVINGS','CHECKING') GROUP BY CUSTOMER_NUMBER HAVING COUNT(*)>1`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Multi-product customers",owner: "Product",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-018",name: "Single Product Customer Count",description: "Customers with one product",category: "Engagement",type: "Operational",sqlDefinition: `SELECT 1`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Single product count",owner: "Product",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-019",name: "Trust Account Balance",description: "Fiduciary/trust deposits",category: "Balance",type: "Operational",sqlDefinition: `SELECT SUM(CURRENT_BALANCE) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE ACCOUNT_TYPE='TRUST'`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "Trust balance total",owner: "Fiduciary",sla: {maxLatencyHours: 24,targetAccuracy: 99.95,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-020",name: "Joint Account Count",description: "Accounts with multiple owners",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE NUM_OWNERS>1`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Joint account count",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-021",name: "IRA/Retirement Account Volume",description: "Tax-advantaged accounts",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE ACCOUNT_TYPE IN ('IRA','401K','ROTH')`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Retirement account count",owner: "Wealth",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-022",name: "Educational Savings Plans",description: "529 and education accounts",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE ACCOUNT_TYPE='529'`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "529 account count",owner: "Wealth",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-023",name: "High-Touch Account Managers",description: "Accounts with dedicated managers",category: "Engagement",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE ACCOUNT_MANAGER_ID IS NOT NULL`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Managed account count",owner: "Relationship",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-024",name: "Multi-Currency Deposit Accounts",description: "Foreign currency accounts",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE CURRENCY!='USD'`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Multi-currency count",owner: "Treasury",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-025",name: "Corporate Deposit Accounts",description: "Business customer deposits",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE CUSTOMER_TYPE='BUSINESS'`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Business account count",owner: "Commercial",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-026",name: "Non-Profit Deposit Accounts",description: "Non-profit organization deposits",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE CUSTOMER_TYPE='NONPROFIT'`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Non-profit account count",owner: "Community",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-027",name: "Government Entity Deposits",description: "Government deposits",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE CUSTOMER_TYPE='GOVERNMENT'`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Government deposit count",owner: "Government",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-028",name: "Deposit Protection Insurance",description: "FDIC insured balances",category: "Quality",type: "Strategic",sqlDefinition: `SELECT SUM(FDIC_INSURED_AMOUNT) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE BALANCE_DATE=CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "FDIC insured total",owner: "Compliance",sla: {maxLatencyHours: 24,targetAccuracy: 99.95,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-029",name: "Uninsured Deposit Exposure",description: "Deposits over FDIC limit",category: "Risk",type: "Strategic",sqlDefinition: `SELECT SUM(CURRENT_BALANCE - FDIC_INSURED_AMOUNT) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE BALANCE_DATE=CURRENT_DATE() AND CURRENT_BALANCE > FDIC_INSURED_AMOUNT`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "Uninsured amount",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.95,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-030",name: "Deposit Insurance Gap",description: "Customers without FDIC coverage",category: "Risk",type: "Strategic",sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE CURRENT_BALANCE > 250000`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "At-risk customer count",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-031",name: "Minimum Balance Maintenance Rate",description: "Accounts maintaining minimum",category: "Quality",type: "Operational",sqlDefinition: `SELECT 1`,sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",granularity: "Daily",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "%",businessLogic: "Min bal maintenance",owner: "Operations",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"]},
  {metricId: "DEP-BULK-032",name: "Fee Waiver Request Count",description: "Requested fee waivers",category: "Activity",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_FEE_WAIVERS WHERE WAIVER_DATE=CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.FCT_FEE_WAIVERS",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Waiver requests",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_FEE_WAIVERS"]},
  {metricId: "DEP-BULK-033",name: "Approved Fee Waiver Amount",description: "Total approved waivers",category: "Revenue",type: "Operational",sqlDefinition: `SELECT SUM(WAIVER_AMOUNT) FROM CORE_DEPOSIT.FCT_FEE_WAIVERS WHERE STATUS='APPROVED'`,sourceTable: "CORE_DEPOSIT.FCT_FEE_WAIVERS",granularity: "Daily",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "Waiver cost",owner: "Revenue",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_FEE_WAIVERS"]},
  {metricId: "DEP-BULK-034",name: "Account Update Requests",description: "Customer-initiated updates",category: "Activity",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_ACCOUNT_UPDATES WHERE UPDATE_DATE=CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.FCT_ACCOUNT_UPDATES",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Update request count",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_ACCOUNT_UPDATES"]},
  {metricId: "DEP-BULK-035",name: "Address Change Requests",description: "Address update requests",category: "Activity",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_ACCOUNT_UPDATES WHERE UPDATE_TYPE='ADDRESS'`,sourceTable: "CORE_DEPOSIT.FCT_ACCOUNT_UPDATES",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Address changes",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_ACCOUNT_UPDATES"]},
  {metricId: "DEP-BULK-036",name: "Beneficiary Designation Count",description: "Accounts with beneficiaries",category: "Volume",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE BENEFICIARY_ID IS NOT NULL`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Beneficiary accounts",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.9,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-037",name: "Escheatment Risk Accounts",description: "Accounts at escheat risk",category: "Risk",type: "Strategic",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE LAST_ACTIVITY_DATE < DATEADD(year,-3,CURRENT_DATE())`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Dormant accounts",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-038",name: "Account Reactivation Count",description: "Reactivated dormant accounts",category: "Growth",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE REACTIVATION_DATE >= DATEADD(month,-1,CURRENT_DATE())`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Monthly",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Reactivated accounts",owner: "Growth",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {metricId: "DEP-BULK-039",name: "Fraud Loss Amount",description: "Total deposit fraud losses",category: "Risk",type: "Strategic",sqlDefinition: `SELECT SUM(LOSS_AMOUNT) FROM CORE_DEPOSIT.FCT_FRAUD_INCIDENTS WHERE INCIDENT_DATE >= DATEADD(month,-1,CURRENT_DATE())`,sourceTable: "CORE_DEPOSIT.FCT_FRAUD_INCIDENTS",granularity: "Monthly",aggregationMethod: "SUM",dataType: "DECIMAL",unit: "USD",businessLogic: "Fraud loss total",owner: "Risk",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_FRAUD_INCIDENTS"]},
  {metricId: "DEP-BULK-040",name: "Deposit Account Disputes",description: "Customer dispute count",category: "Quality",type: "Operational",sqlDefinition: `SELECT COUNT(*) FROM CORE_DEPOSIT.FCT_CUSTOMER_DISPUTES WHERE DISPUTE_DATE = CURRENT_DATE()`,sourceTable: "CORE_DEPOSIT.FCT_CUSTOMER_DISPUTES",granularity: "Daily",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Dispute count",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_CUSTOMER_DISPUTES"]},
  {metricId: "DEP-BULK-041",name: "Dispute Resolution Time",description: "Avg dispute resolution",category: "Quality",type: "Operational",sqlDefinition: `SELECT AVG(DATEDIFF(day,DISPUTE_DATE,RESOLUTION_DATE)) FROM CORE_DEPOSIT.FCT_CUSTOMER_DISPUTES WHERE RESOLVED=TRUE`,sourceTable: "CORE_DEPOSIT.FCT_CUSTOMER_DISPUTES",granularity: "Daily",aggregationMethod: "AVG",dataType: "DECIMAL",unit: "days",businessLogic: "Resolution days",owner: "Ops",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["FCT_CUSTOMER_DISPUTES"]},
  {metricId: "DEP-BULK-042",name: "Account Closure Reason Distribution",description: "Why customers close accounts",category: "Risk",type: "Operational",sqlDefinition: `SELECT CLOSURE_REASON, COUNT(*) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE ACCOUNT_STATUS='CLOSED' AND CLOSE_DATE >= DATEADD(month,-3,CURRENT_DATE()) GROUP BY CLOSURE_REASON`,sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",granularity: "Monthly",aggregationMethod: "COUNT",dataType: "INTEGER",unit: "count",businessLogic: "Closure reasons",owner: "Analytics",sla: {maxLatencyHours: 24,targetAccuracy: 99.8,refreshFrequency: "Daily"},relatedMetrics: [],dependencies: ["DIM_ACCOUNT"]},
  {
    metricId: "DEP-CRIT-001",
    name: "Deposit Profitability by Product",
    description: "Net interest margin and fee income by deposit product",
    category: "Profitability",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        da.ACCOUNT_TYPE as product_type,
        ROUND(SUM(COALESCE(fdb.INTEREST_EARNED, 0) - COALESCE(fdb.INTEREST_PAID, 0) + COALESCE(fc.FEE_AMOUNT, 0)), 2) as net_margin,
        COUNT(DISTINCT da.ACCOUNT_NUMBER) as account_count,
        ROUND(AVG(fdb.CURRENT_BALANCE), 2) as avg_balance
      FROM CORE_DEPOSIT.DIM_ACCOUNT da
      LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb ON da.ACCOUNT_NUMBER = fdb.ACCOUNT_NUMBER
        AND fdb.BALANCE_DATE = CURRENT_DATE()
      LEFT JOIN CORE_DEPOSIT.FCT_CHARGES_FEES fc ON da.ACCOUNT_NUMBER = fc.ACCOUNT_NUMBER
        AND MONTH(fc.FEE_DATE) = MONTH(CURRENT_DATE())
        AND YEAR(fc.FEE_DATE) = YEAR(CURRENT_DATE())
      WHERE da.IS_ACTIVE = TRUE
      GROUP BY da.ACCOUNT_TYPE
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Monthly",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Calculate profitability per product line considering interest margin and fee income",
    owner: "Finance",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_ACCOUNT", "FCT_DEPOSIT_DAILY_BALANCE", "FCT_CHARGES_FEES"],
  },
  {
    metricId: "DEP-CRIT-002",
    name: "Cost of Deposits (Funding Cost)",
    description: "Total interest expense as percentage of deposit base",
    category: "Interest",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(SUM(COALESCE(INTEREST_PAID, 0)) / NULLIF(SUM(COALESCE(CURRENT_BALANCE, 0)), 0) * 100, 3) as cost_of_deposits_pct,
        SUM(COALESCE(INTEREST_PAID, 0)) as total_interest_expense,
        SUM(COALESCE(CURRENT_BALANCE, 0)) as total_deposit_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE >= DATEADD(month, -12, CURRENT_DATE())
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Annual interest expense divided by average deposit balance - measures deposit competitiveness",
    owner: "Treasury",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.9, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-CRIT-003",
    name: "Deposit Stickiness Score",
    description: "Measure of deposit stability and customer retention",
    category: "Retention",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND((
          (CAST(COUNT(CASE WHEN ACCOUNT_AGE_MONTHS > 36 THEN 1 END) AS FLOAT) / COUNT(*) * 0.4) +
          (CAST(COUNT(CASE WHEN MONTHLY_ACTIVITY_COUNT > 10 THEN 1 END) AS FLOAT) / COUNT(*) * 0.3) +
          (CAST(COUNT(CASE WHEN WITHDRAWAL_COUNT = 0 THEN 1 END) AS FLOAT) / COUNT(*) * 0.3)
        ) * 100, 2) as stickiness_score
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_ACTIVE = TRUE
        AND ACCOUNT_STATUS = 'OPEN'
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "score (0-100)",
    businessLogic: "Composite measure combining account tenure (40%), activity frequency (30%), and withdrawal patterns (30%)",
    owner: "Retention",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Weekly"},
    relatedMetrics: [],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-CRIT-004",
    name: "Weighted Average Maturity (WAM)",
    description: "Average maturity profile of deposit base",
    category: "Liquidity",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(AVG(DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE)), 1) as weighted_avg_maturity_days,
        ROUND(SUM(CURRENT_BALANCE * DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE)) / NULLIF(SUM(CURRENT_BALANCE), 0), 1) as balance_weighted_maturity_days
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_TYPE IN ('CD', 'MONEY_MARKET', 'TIME_DEPOSIT')
        AND IS_ACTIVE = TRUE
        AND MATURITY_DATE > CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Weekly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "days",
    businessLogic: "Measure of deposit liability duration for interest rate risk and funding management",
    owner: "Asset Liability Management",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Weekly"},
    relatedMetrics: [],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-CRIT-005",
    name: "Deposit Customer Concentration Risk",
    description: "Percentage of deposits held by top 100 customers",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(SUM(top_customer_balance) / NULLIF(SUM(total_balance), 0) * 100, 2) as concentration_risk_pct,
        COUNT(*) as top_100_customers,
        ROUND(AVG(top_customer_balance), 2) as avg_top_customer_balance
      FROM (
        SELECT TOP 100
          SUM(CURRENT_BALANCE) as top_customer_balance
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE = CURRENT_DATE()
        GROUP BY CUSTOMER_NUMBER
        ORDER BY SUM(CURRENT_BALANCE) DESC
      ) top_customers,
      (SELECT SUM(CURRENT_BALANCE) as total_balance FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE WHERE BALANCE_DATE = CURRENT_DATE()) totals
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Regulatory and operational risk metric measuring deposit reliance on large customers",
    owner: "Risk Management",
    sla: {maxLatencyHours: 12, targetAccuracy: 99.9, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-CRIT-006",
    name: "Liquidity Coverage Ratio (LCR)",
    description: "High-quality liquid assets to short-term outflows",
    category: "Liquidity",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(NULLIF(SUM(CASE
          WHEN CURRENT_BALANCE > 250000 AND ACCOUNT_STATUS = 'OPEN' THEN CURRENT_BALANCE * 0.85
          WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) < 30 THEN CURRENT_BALANCE * 0.50
          ELSE CURRENT_BALANCE
        END), 0) /
        NULLIF(SUM(CASE
          WHEN WITHDRAWAL_COUNT > 5 THEN CURRENT_BALANCE * 0.75
          WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) < 30 THEN CURRENT_BALANCE * 0.90
          ELSE CURRENT_BALANCE * 0.10
        END), 0), 2) as lcr_ratio
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
      JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
      WHERE fdb.BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "ratio",
    businessLogic: "Regulatory liquidity metric (LCR) measuring ability to meet 30-day outflows - must be > 1.0",
    owner: "Treasury",
    sla: {maxLatencyHours: 8, targetAccuracy: 99.95, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-AGG-001",
    name: "Deposit Balance Distribution by Percentile",
    description: "Account balance distribution across percentiles (P10, P25, P50, P75, P90, P95, P99)",
    category: "Balance",
    type: "Strategic",
    sqlDefinition: `
      WITH account_balances AS (
        SELECT
          ACCOUNT_NUMBER,
          CURRENT_BALANCE,
          ACCOUNT_TYPE
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE fdb.BALANCE_DATE = CURRENT_DATE()
          AND da.IS_ACTIVE = TRUE
      )
      SELECT
        ROUND(PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY CURRENT_BALANCE), 2) as p10_balance,
        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY CURRENT_BALANCE), 2) as p25_balance,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY CURRENT_BALANCE), 2) as median_balance,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY CURRENT_BALANCE), 2) as p75_balance,
        ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY CURRENT_BALANCE), 2) as p90_balance,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY CURRENT_BALANCE), 2) as p95_balance,
        ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY CURRENT_BALANCE), 2) as p99_balance,
        COUNT(*) as total_accounts,
        ROUND(AVG(CURRENT_BALANCE), 2) as mean_balance,
        ROUND(STDDEV(CURRENT_BALANCE), 2) as std_deviation
      FROM account_balances
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Percentile analysis using PERCENTILE_CONT to understand balance distribution and identify outliers for pricing and product strategies",
    owner: "Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-BAL-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-AGG-002",
    name: "Deposit Growth Rate - YoY with Seasonality Adjustment",
    description: "Year-over-year deposit growth with seasonal index and trend decomposition",
    category: "Growth",
    type: "Strategic",
    sqlDefinition: `
      WITH monthly_balances AS (
        SELECT
          DATE_TRUNC('month', BALANCE_DATE) as balance_month,
          SUM(CURRENT_BALANCE) as total_balance,
          COUNT(DISTINCT ACCOUNT_NUMBER) as account_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE >= DATEADD(year, -2, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', BALANCE_DATE)
      ),
      yoy_comparison AS (
        SELECT
          balance_month,
          total_balance,
          account_count,
          LAG(total_balance, 12) OVER (ORDER BY balance_month) as balance_year_ago,
          ROUND(CAST(total_balance - LAG(total_balance, 12) OVER (ORDER BY balance_month) AS FLOAT) /
                NULLIF(LAG(total_balance, 12) OVER (ORDER BY balance_month), 0) * 100, 2) as yoy_growth_pct,
          ROUND(AVG(total_balance) OVER (ORDER BY balance_month ROWS BETWEEN 11 PRECEDING AND CURRENT ROW), 2) as ma_12m_balance,
          DATEPART(month, balance_month) as month_num
        FROM monthly_balances
      ),
      seasonal_index AS (
        SELECT
          month_num,
          ROUND(AVG(total_balance / NULLIF(ma_12m_balance, 0)), 4) as seasonal_factor
        FROM yoy_comparison
        WHERE ma_12m_balance IS NOT NULL
        GROUP BY month_num
      )
      SELECT
        yc.balance_month,
        yc.total_balance,
        yc.account_count,
        yc.balance_year_ago,
        yc.yoy_growth_pct,
        yc.ma_12m_balance,
        si.seasonal_factor,
        ROUND(yc.total_balance / NULLIF(si.seasonal_factor, 0), 2) as seasonally_adjusted_balance,
        CASE
          WHEN yc.yoy_growth_pct > 10 THEN 'Strong Growth'
          WHEN yc.yoy_growth_pct > 5 THEN 'Moderate Growth'
          WHEN yc.yoy_growth_pct > 0 THEN 'Slow Growth'
          ELSE 'Decline'
        END as growth_category
      FROM yoy_comparison yc
      LEFT JOIN seasonal_index si ON yc.month_num = si.month_num
      WHERE yc.balance_year_ago IS NOT NULL
      ORDER BY yc.balance_month DESC
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "YoY growth analysis with LAG window function and seasonal decomposition using 12-month moving average for trend analysis",
    owner: "Treasury",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.5, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-GRO-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-AGG-003",
    name: "Account Maturity Ladder - Time-Based Aggregation",
    description: "Deposit maturity distribution across time buckets with weighted average maturity",
    category: "Liquidity",
    type: "Strategic",
    sqlDefinition: `
      WITH maturity_buckets AS (
        SELECT
          ACCOUNT_NUMBER,
          ACCOUNT_TYPE,
          CURRENT_BALANCE,
          MATURITY_DATE,
          DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) as days_to_maturity,
          CASE
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) <= 30 THEN '0-30 Days'
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) <= 90 THEN '31-90 Days'
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) <= 180 THEN '91-180 Days'
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) <= 365 THEN '181-365 Days'
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) <= 730 THEN '1-2 Years'
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) > 730 THEN '2+ Years'
            ELSE 'No Maturity'
          END as maturity_bucket
        FROM CORE_DEPOSIT.DIM_ACCOUNT da
        JOIN CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb ON da.ACCOUNT_NUMBER = fdb.ACCOUNT_NUMBER
        WHERE da.IS_ACTIVE = TRUE
          AND fdb.BALANCE_DATE = CURRENT_DATE()
          AND da.ACCOUNT_TYPE IN ('CD', 'TIME_DEPOSIT', 'MONEY_MARKET')
      )
      SELECT
        maturity_bucket,
        COUNT(DISTINCT ACCOUNT_NUMBER) as account_count,
        ROUND(SUM(CURRENT_BALANCE), 2) as total_balance,
        ROUND(AVG(CURRENT_BALANCE), 2) as avg_balance,
        ROUND(SUM(CURRENT_BALANCE) / NULLIF(SUM(SUM(CURRENT_BALANCE)) OVER (), 0) * 100, 2) as pct_of_total_balance,
        ROUND(AVG(days_to_maturity), 0) as avg_days_to_maturity,
        ROUND(SUM(CURRENT_BALANCE * days_to_maturity) / NULLIF(SUM(CURRENT_BALANCE), 0), 2) as weighted_avg_maturity_days
      FROM maturity_buckets
      GROUP BY maturity_bucket
      ORDER BY
        CASE maturity_bucket
          WHEN '0-30 Days' THEN 1
          WHEN '31-90 Days' THEN 2
          WHEN '91-180 Days' THEN 3
          WHEN '181-365 Days' THEN 4
          WHEN '1-2 Years' THEN 5
          WHEN '2+ Years' THEN 6
          ELSE 7
        END
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Maturity ladder aggregation with weighted average calculation for liquidity risk management and funding gap analysis",
    owner: "Asset Liability Management",
    sla: {maxLatencyHours: 12, targetAccuracy: 99.9, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-CRIT-004", "DEP-LIQ-001"],
    dependencies: ["DIM_ACCOUNT", "FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-AGG-004",
    name: "Deposit Flow Analysis - Inflows vs Outflows with Net Flow",
    description: "Daily deposit and withdrawal aggregations with rolling 7-day and 30-day net flows",
    category: "Activity",
    type: "Operational",
    sqlDefinition: `
      WITH daily_flows AS (
        SELECT
          FLOW_DATE,
          SUM(CASE WHEN FLOW_TYPE = 'DEPOSIT' THEN FLOW_AMOUNT ELSE 0 END) as total_deposits,
          SUM(CASE WHEN FLOW_TYPE = 'WITHDRAWAL' THEN FLOW_AMOUNT ELSE 0 END) as total_withdrawals,
          SUM(CASE WHEN FLOW_TYPE = 'DEPOSIT' THEN FLOW_AMOUNT ELSE -FLOW_AMOUNT END) as net_flow,
          COUNT(CASE WHEN FLOW_TYPE = 'DEPOSIT' THEN 1 END) as deposit_count,
          COUNT(CASE WHEN FLOW_TYPE = 'WITHDRAWAL' THEN 1 END) as withdrawal_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_FLOWS
        WHERE FLOW_DATE >= DATEADD(day, -60, CURRENT_DATE())
        GROUP BY FLOW_DATE
      ),
      rolling_flows AS (
        SELECT
          FLOW_DATE,
          total_deposits,
          total_withdrawals,
          net_flow,
          deposit_count,
          withdrawal_count,
          ROUND(SUM(net_flow) OVER (ORDER BY FLOW_DATE ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as rolling_7d_net_flow,
          ROUND(SUM(net_flow) OVER (ORDER BY FLOW_DATE ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), 2) as rolling_30d_net_flow,
          ROUND(AVG(net_flow) OVER (ORDER BY FLOW_DATE ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as avg_7d_net_flow,
          ROUND(AVG(net_flow) OVER (ORDER BY FLOW_DATE ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), 2) as avg_30d_net_flow
        FROM daily_flows
      )
      SELECT
        FLOW_DATE,
        total_deposits,
        total_withdrawals,
        net_flow,
        deposit_count,
        withdrawal_count,
        rolling_7d_net_flow,
        rolling_30d_net_flow,
        avg_7d_net_flow,
        avg_30d_net_flow,
        ROUND(CAST(total_deposits AS FLOAT) / NULLIF(total_withdrawals, 0), 2) as deposit_to_withdrawal_ratio,
        CASE
          WHEN rolling_7d_net_flow > avg_30d_net_flow * 1.2 THEN 'Strong Inflow'
          WHEN rolling_7d_net_flow < avg_30d_net_flow * 0.8 THEN 'Strong Outflow'
          ELSE 'Stable'
        END as flow_trend
      FROM rolling_flows
      ORDER BY FLOW_DATE DESC
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_FLOWS",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Deposit flow analysis using window functions (SUM OVER, AVG OVER) for rolling net flow calculations and trend identification",
    owner: "Treasury",
    sla: {maxLatencyHours: 12, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-ACT-001", "DEP-LIQ-001"],
    dependencies: ["FCT_DEPOSIT_FLOWS"],
  },
  {
    metricId: "DEP-AGG-005",
    name: "Customer Deposit Concentration - Top N Analysis",
    description: "Concentration risk metrics showing top 10, 50, 100 customers with cumulative percentages",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      WITH customer_deposits AS (
        SELECT
          fdb.CUSTOMER_NUMBER,
          SUM(fdb.CURRENT_BALANCE) as total_balance,
          COUNT(DISTINCT da.ACCOUNT_NUMBER) as account_count,
          COUNT(DISTINCT da.ACCOUNT_TYPE) as product_types
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE fdb.BALANCE_DATE = CURRENT_DATE()
          AND da.IS_ACTIVE = TRUE
        GROUP BY fdb.CUSTOMER_NUMBER
      ),
      ranked_customers AS (
        SELECT
          CUSTOMER_NUMBER,
          total_balance,
          account_count,
          product_types,
          ROW_NUMBER() OVER (ORDER BY total_balance DESC) as balance_rank,
          ROUND(CAST(total_balance AS FLOAT) / SUM(total_balance) OVER () * 100, 4) as pct_of_total,
          ROUND(SUM(total_balance) OVER (ORDER BY total_balance DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) /
                SUM(total_balance) OVER () * 100, 2) as cumulative_pct
        FROM customer_deposits
      )
      SELECT
        CASE
          WHEN balance_rank <= 10 THEN 'Top 10'
          WHEN balance_rank <= 50 THEN 'Top 11-50'
          WHEN balance_rank <= 100 THEN 'Top 51-100'
          WHEN balance_rank <= 500 THEN 'Top 101-500'
          ELSE 'Others'
        END as customer_tier,
        COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count,
        ROUND(SUM(total_balance), 2) as total_balance,
        ROUND(AVG(total_balance), 2) as avg_balance,
        ROUND(SUM(pct_of_total), 2) as pct_of_total_deposits,
        ROUND(MAX(cumulative_pct), 2) as cumulative_pct,
        ROUND(AVG(account_count), 1) as avg_accounts_per_customer
      FROM ranked_customers
      GROUP BY
        CASE
          WHEN balance_rank <= 10 THEN 'Top 10'
          WHEN balance_rank <= 50 THEN 'Top 11-50'
          WHEN balance_rank <= 100 THEN 'Top 51-100'
          WHEN balance_rank <= 500 THEN 'Top 101-500'
          ELSE 'Others'
        END
      ORDER BY MAX(balance_rank)
    `,
    sourceTable: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Concentration risk analysis using ROW_NUMBER and running SUM OVER for Pareto analysis and regulatory concentration limits",
    owner: "Risk Management",
    sla: {maxLatencyHours: 12, targetAccuracy: 99.95, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-CRIT-005"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-AGG-006",
    name: "Interest Rate Sensitivity Analysis by Product",
    description: "Deposit balance elasticity to rate changes with beta coefficients by product type",
    category: "Interest",
    type: "Strategic",
    sqlDefinition: `
      WITH monthly_rates AS (
        SELECT
          DATE_TRUNC('month', RATE_EFFECTIVE_DATE) as rate_month,
          ACCOUNT_TYPE,
          ROUND(AVG(APY_RATE), 4) as avg_apy,
          COUNT(DISTINCT ACCOUNT_NUMBER) as accounts_at_rate
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE RATE_EFFECTIVE_DATE >= DATEADD(month, -12, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', RATE_EFFECTIVE_DATE), ACCOUNT_TYPE
      ),
      monthly_balances AS (
        SELECT
          DATE_TRUNC('month', fdb.BALANCE_DATE) as balance_month,
          da.ACCOUNT_TYPE,
          ROUND(SUM(fdb.CURRENT_BALANCE), 2) as total_balance,
          COUNT(DISTINCT fdb.ACCOUNT_NUMBER) as account_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE fdb.BALANCE_DATE >= DATEADD(month, -12, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', fdb.BALANCE_DATE), da.ACCOUNT_TYPE
      ),
      rate_balance_correlation AS (
        SELECT
          mr.ACCOUNT_TYPE,
          mr.rate_month,
          mr.avg_apy,
          mb.total_balance,
          LAG(mr.avg_apy, 1) OVER (PARTITION BY mr.ACCOUNT_TYPE ORDER BY mr.rate_month) as prev_month_apy,
          LAG(mb.total_balance, 1) OVER (PARTITION BY mr.ACCOUNT_TYPE ORDER BY mr.rate_month) as prev_month_balance,
          ROUND(CAST(mr.avg_apy - LAG(mr.avg_apy, 1) OVER (PARTITION BY mr.ACCOUNT_TYPE ORDER BY mr.rate_month) AS FLOAT), 4) as rate_change,
          ROUND(CAST(mb.total_balance - LAG(mb.total_balance, 1) OVER (PARTITION BY mr.ACCOUNT_TYPE ORDER BY mr.rate_month) AS FLOAT) /
                NULLIF(LAG(mb.total_balance, 1) OVER (PARTITION BY mr.ACCOUNT_TYPE ORDER BY mr.rate_month), 0) * 100, 2) as balance_change_pct
        FROM monthly_rates mr
        JOIN monthly_balances mb ON mr.rate_month = mb.balance_month AND mr.ACCOUNT_TYPE = mb.ACCOUNT_TYPE
      )
      SELECT
        ACCOUNT_TYPE,
        COUNT(*) as observation_count,
        ROUND(AVG(avg_apy), 4) as avg_rate_offered,
        ROUND(AVG(total_balance), 2) as avg_monthly_balance,
        ROUND(AVG(rate_change), 4) as avg_rate_change,
        ROUND(AVG(balance_change_pct), 2) as avg_balance_change_pct,
        ROUND(AVG(balance_change_pct) / NULLIF(AVG(rate_change), 0), 2) as rate_sensitivity_beta,
        CASE
          WHEN ABS(AVG(balance_change_pct) / NULLIF(AVG(rate_change), 0)) > 10 THEN 'Highly Sensitive'
          WHEN ABS(AVG(balance_change_pct) / NULLIF(AVG(rate_change), 0)) > 5 THEN 'Moderately Sensitive'
          ELSE 'Low Sensitivity'
        END as sensitivity_category
      FROM rate_balance_correlation
      WHERE prev_month_apy IS NOT NULL
      GROUP BY ACCOUNT_TYPE
      ORDER BY ABS(AVG(balance_change_pct) / NULLIF(AVG(rate_change), 0)) DESC
    `,
    sourceTable: "CORE_DEPOSIT.DIM_ACCOUNT",
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "beta coefficient",
    businessLogic: "Rate sensitivity analysis using LAG window functions to calculate balance elasticity to rate changes - critical for pricing optimization",
    owner: "Pricing & Treasury",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Weekly"},
    relatedMetrics: ["DEP-CRIT-002", "DEP-INT-001"],
    dependencies: ["DIM_ACCOUNT", "FCT_DEPOSIT_DAILY_BALANCE"],
    grain: "Product",
  },
  {
    metricId: "DEP-NEW-001",
    name: "Deposit Account Velocity (30-Day)",
    description: "Rate of new account openings per day with momentum indicators and velocity acceleration",
    category: "Growth",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH daily_openings AS (
        SELECT
          OPEN_DATE as account_date,
          COUNT(DISTINCT ACCOUNT_NUMBER) as accounts_opened
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE OPEN_DATE >= DATEADD(day, -30, CURRENT_DATE())
        GROUP BY OPEN_DATE
      ),
      velocity_metrics AS (
        SELECT
          account_date,
          accounts_opened,
          LAG(accounts_opened, 1) OVER (ORDER BY account_date) as prev_day,
          LAG(accounts_opened, 7) OVER (ORDER BY account_date) as week_ago,
          ROUND(AVG(accounts_opened) OVER (ORDER BY account_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as ma_7d,
          ROUND(AVG(accounts_opened) OVER (ORDER BY account_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), 2) as ma_30d
        FROM daily_openings
      )
      SELECT * FROM velocity_metrics
      ORDER BY account_date DESC
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "accounts",
    businessLogic: "Daily account opening velocity with 7-day and 30-day moving averages for trend momentum",
    owner: "Growth Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.9, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-VOL-001", "DEP-GRO-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-NEW-002",
    name: "High-Value Customer Deposit Concentration",
    description: "Percentage of total deposits from top 20% of customers by deposit size",
    category: "Risk",
    type: "Strategic",
    grain: "Customer",
    sqlDefinition: `
      WITH customer_totals AS (
        SELECT
          CUSTOMER_ID,
          SUM(CURRENT_BALANCE) as total_deposits,
          PERCENT_RANK() OVER (ORDER BY SUM(CURRENT_BALANCE)) as deposit_percentile
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE = CURRENT_DATE()
        GROUP BY CUSTOMER_ID
      ),
      top_customers AS (
        SELECT
          SUM(total_deposits) as top_20pct_deposits,
          COUNT(*) as top_customer_count
        FROM customer_totals
        WHERE deposit_percentile >= 0.80
      ),
      total_deposits AS (
        SELECT SUM(total_deposits) as all_deposits
        FROM customer_totals
      )
      SELECT
        tc.top_20pct_deposits,
        td.all_deposits,
        ROUND(CAST(tc.top_20pct_deposits AS FLOAT) / NULLIF(td.all_deposits, 0) * 100, 2) as pct_total_deposits,
        tc.top_customer_count
      FROM top_customers tc
      CROSS JOIN total_deposits td
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Calculate concentration risk from top 20% of customers by deposit balance",
    owner: "Risk Management",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-RIS-001", "DEP-REG-003"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "DEP-NEW-003",
    name: "Account Migration Rate (Product Upgrade)",
    description: "Percentage of customers upgrading deposit products with trend analysis",
    category: "Activity",
    type: "Tactical",
    grain: "Customer",
    sqlDefinition: `
      WITH monthly_migrations AS (
        SELECT
          DATE_TRUNC('month', OPEN_DATE) as migration_month,
          COUNT(DISTINCT CUSTOMER_ID) as upgrading_customers,
          COUNT(DISTINCT CASE WHEN ACCOUNT_TYPE = 'CD' THEN CUSTOMER_ID END) as cd_upgrades,
          COUNT(DISTINCT CASE WHEN ACCOUNT_TYPE = 'MONEY_MARKET' THEN CUSTOMER_ID END) as mm_upgrades
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE OPEN_DATE >= DATEADD(month, -12, CURRENT_DATE())
          AND ACCOUNT_TYPE IN ('CD', 'MONEY_MARKET')
        GROUP BY DATE_TRUNC('month', OPEN_DATE)
      )
      SELECT
        migration_month,
        upgrading_customers,
        cd_upgrades,
        mm_upgrades,
        ROUND(CAST(cd_upgrades + mm_upgrades AS FLOAT) / NULLIF(upgrading_customers, 0) * 100, 2) as upgrade_success_rate
      FROM monthly_migrations
      ORDER BY migration_month DESC
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Monthly",
    aggregationMethod: "DISTINCT",
    dataType: "INTEGER",
    unit: "customers",
    businessLogic: "Track customer migration to higher-yield products (CD, Money Market) with success rates",
    owner: "Product Management",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.5, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-GRO-001", "DEP-MIX-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-NEW-004",
    name: "Deposit Rate Competitiveness Gap",
    description: "Delta between our rates and peer/market rates by product with trend direction",
    category: "Interest",
    type: "Strategic",
    grain: "Product",
    sqlDefinition: `
      WITH current_rates AS (
        SELECT
          ACCOUNT_TYPE,
          ROUND(AVG(APY_RATE), 4) as our_rate,
          CURRENT_DATE() as rate_date
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE IS_ACTIVE = TRUE
        GROUP BY ACCOUNT_TYPE
      ),
      rate_history AS (
        SELECT
          ACCOUNT_TYPE,
          our_rate,
          LAG(our_rate, 1) OVER (PARTITION BY ACCOUNT_TYPE ORDER BY rate_date) as prev_day_rate,
          LAG(our_rate, 30) OVER (PARTITION BY ACCOUNT_TYPE ORDER BY rate_date) as month_ago_rate
        FROM current_rates
      )
      SELECT
        ACCOUNT_TYPE,
        our_rate,
        prev_day_rate,
        month_ago_rate,
        ROUND(our_rate - COALESCE(prev_day_rate, our_rate), 4) as rate_change_1d,
        ROUND(our_rate - COALESCE(month_ago_rate, our_rate), 4) as rate_change_30d
      FROM rate_history
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "basis points",
    businessLogic: "Monitor rate competitiveness with trend analysis to support pricing decisions",
    owner: "Pricing & Treasury",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-INT-001", "DEP-COMP-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-NEW-005",
    name: "Account Engagement Score (Composite)",
    description: "Multi-dimensional engagement metric combining transaction frequency, balance maintenance, and tenure",
    category: "Activity",
    type: "Strategic",
    grain: "Account",
    sqlDefinition: `
      WITH activity_metrics AS (
        SELECT
          ACCOUNT_NUMBER,
          DATEDIFF(day, OPEN_DATE, CURRENT_DATE()) as tenure_days,
          DATEDIFF(day, MAX(BALANCE_DATE), CURRENT_DATE()) as days_since_activity,
          COUNT(*) as activity_count_30d,
          AVG(CURRENT_BALANCE) as avg_balance
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE BALANCE_DATE >= DATEADD(day, -30, CURRENT_DATE())
        GROUP BY ACCOUNT_NUMBER, OPEN_DATE
      ),
      engagement_scoring AS (
        SELECT
          ACCOUNT_NUMBER,
          TENURE_DAYS,
          DAYS_SINCE_ACTIVITY,
          ACTIVITY_COUNT_30D,
          AVG_BALANCE,
          ROUND((NULLIF(ACTIVITY_COUNT_30D, 0) / 30.0 * 40 +
                 (30 - NULLIF(DAYS_SINCE_ACTIVITY, 0)) / 30.0 * 30 +
                 CASE WHEN TENURE_DAYS > 365 THEN 30 ELSE (TENURE_DAYS / 365.0 * 30) END) / 100.0 * 100, 2) as engagement_score
        FROM activity_metrics
      )
      SELECT
        ACCOUNT_NUMBER,
        ENGAGEMENT_SCORE,
        CASE WHEN ENGAGEMENT_SCORE >= 75 THEN 'High'
             WHEN ENGAGEMENT_SCORE >= 50 THEN 'Medium'
             ELSE 'Low' END as engagement_level
      FROM engagement_scoring
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE", "CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "score (0-100)",
    businessLogic: "Composite engagement score weighting activity frequency (40%), recency (30%), tenure (30%)",
    owner: "Customer Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 98.0, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-ACT-001", "DEP-ACT-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-NEW-006",
    name: "Deposit Product Profitability Margin",
    description: "Net interest margin by deposit product with contribution to bank profitability",
    category: "Balance",
    type: "Strategic",
    grain: "Product",
    sqlDefinition: `
      WITH product_financials AS (
        SELECT
          da.ACCOUNT_TYPE as product,
          SUM(fdb.CURRENT_BALANCE) as total_balance,
          COUNT(DISTINCT fdb.ACCOUNT_NUMBER) as account_count,
          ROUND(AVG(da.APY_RATE), 4) as avg_paid_rate,
          SUM(fdb.INTEREST_ACCRUED_TODAY) as daily_interest_cost
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE fdb.BALANCE_DATE = CURRENT_DATE()
        GROUP BY da.ACCOUNT_TYPE
      ),
      margin_analysis AS (
        SELECT
          product,
          total_balance,
          account_count,
          avg_paid_rate,
          daily_interest_cost,
          ROUND((total_balance * 0.04) / 365.0, 2) as estimated_daily_income,
          ROUND((total_balance * 0.04) / 365.0 - daily_interest_cost, 2) as estimated_daily_margin
        FROM product_financials
      )
      SELECT
        product,
        total_balance,
        account_count,
        avg_paid_rate,
        estimated_daily_income,
        daily_interest_cost,
        estimated_daily_margin,
        ROUND(CAST(estimated_daily_margin AS FLOAT) / NULLIF(estimated_daily_income, 0) * 100, 2) as margin_pct
      FROM margin_analysis
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE", "CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "dollars",
    businessLogic: "Calculate product profitability using 4% assumed loan yield minus paid interest rates",
    owner: "Treasury & Finance",
    sla: {maxLatencyHours: 24, targetAccuracy: 98.5, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-INT-002", "DEP-BAL-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-NEW-007",
    name: "Deposit Account Onboarding Quality Score",
    description: "Quality metrics for newly opened accounts including data completeness and early activation",
    category: "Quality",
    type: "Tactical",
    grain: "Daily",
    sqlDefinition: `
      WITH new_accounts AS (
        SELECT
          ACCOUNT_NUMBER,
          OPEN_DATE,
          DATEDIFF(day, OPEN_DATE, CURRENT_DATE()) as days_old,
          CASE WHEN EMAIL IS NOT NULL THEN 1 ELSE 0 END as has_email,
          CASE WHEN PHONE IS NOT NULL THEN 1 ELSE 0 END as has_phone,
          CASE WHEN ADDRESS IS NOT NULL THEN 1 ELSE 0 END as has_address,
          CASE WHEN PRCS_DTE = OPEN_DATE THEN 1 ELSE 0 END as had_activity_on_open
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE OPEN_DATE >= DATEADD(day, -30, CURRENT_DATE())
      ),
      quality_scores AS (
        SELECT
          OPEN_DATE,
          COUNT(*) as new_accounts_count,
          ROUND(AVG(has_email + has_phone + has_address) / 3.0 * 100, 2) as data_completeness_pct,
          ROUND(AVG(had_activity_on_open) * 100, 2) as early_activation_pct
        FROM new_accounts
        GROUP BY OPEN_DATE
      )
      SELECT
        OPEN_DATE,
        new_accounts_count,
        data_completeness_pct,
        early_activation_pct,
        ROUND((data_completeness_pct + early_activation_pct) / 2, 2) as overall_quality_score
      FROM quality_scores
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Track data quality of new account onboarding with completeness and activation metrics",
    owner: "Operations",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-QUA-001", "DEP-GRO-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "DEP-NEW-008",
    name: "Cross-Product Account Holders",
    description: "Percentage of customers with multiple deposit product types (mix penetration)",
    category: "Product Mix",
    type: "Strategic",
    grain: "Customer",
    sqlDefinition: `
      WITH customer_products AS (
        SELECT
          CUSTOMER_ID,
          COUNT(DISTINCT ACCOUNT_TYPE) as product_count,
          STRING_AGG(DISTINCT ACCOUNT_TYPE, ', ') as product_list
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE IS_ACTIVE = TRUE
        GROUP BY CUSTOMER_ID
      ),
      product_distribution AS (
        SELECT
          product_count,
          COUNT(*) as customer_count,
          ROUND(AVG(customer_count) OVER () / NULLIF((SELECT COUNT(*) FROM customer_products), 0) * 100, 2) as pct_of_total
        FROM customer_products
        GROUP BY product_count
      )
      SELECT
        '1' as product_count,
        (SELECT COUNT(*) FROM customer_products WHERE product_count = 1) as customers,
        ROUND(CAST((SELECT COUNT(*) FROM customer_products WHERE product_count = 1) AS FLOAT) / NULLIF((SELECT COUNT(*) FROM customer_products), 0) * 100, 2) as pct
      UNION ALL
      SELECT
        '2+' as product_count,
        (SELECT COUNT(*) FROM customer_products WHERE product_count >= 2) as customers,
        ROUND(CAST((SELECT COUNT(*) FROM customer_products WHERE product_count >= 2) AS FLOAT) / NULLIF((SELECT COUNT(*) FROM customer_products), 0) * 100, 2) as pct
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "DISTINCT",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Measure product mix penetration showing customers with multiple deposit product types",
    owner: "Product Management",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Daily"},
    relatedMetrics: ["DEP-MIX-001", "DEP-VOL-002"],
    dependencies: ["DIM_ACCOUNT"],
  },
];

export const depositsGoldMetricsComplete = {
  metrics: depositsGoldMetrics,
  totalMetrics: depositsGoldMetrics.length,
  categories: {
    Volume: depositsGoldMetrics.filter((m) => m.category === "Volume").length,
    Balance: depositsGoldMetrics.filter((m) => m.category === "Balance").length,
    Activity: depositsGoldMetrics.filter((m) => m.category === "Activity").length,
    Growth: depositsGoldMetrics.filter((m) => m.category === "Growth").length,
    Risk: depositsGoldMetrics.filter((m) => m.category === "Risk").length,
    "Product Mix": depositsGoldMetrics.filter((m) => m.category === "Product Mix").length,
    Interest: depositsGoldMetrics.filter((m) => m.category === "Interest").length,
    Regulatory: depositsGoldMetrics.filter((m) => m.category === "Regulatory").length,
    Liquidity: depositsGoldMetrics.filter((m) => m.category === "Liquidity").length,
    Performance: depositsGoldMetrics.filter((m) => m.category === "Performance").length,
    Quality: depositsGoldMetrics.filter((m) => m.category === "Quality").length,
  },
  description: "Deposits domain Gold layer metrics with comprehensive SQL definitions and business logic",
};

export default depositsGoldMetricsComplete;
