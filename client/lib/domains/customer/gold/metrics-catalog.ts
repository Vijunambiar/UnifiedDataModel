/**
 * CUSTOMER DOMAIN - GOLD LAYER METRICS
 * 
 * Business metrics defined at the Gold layer for analytics and BI
 * Each metric is derived from ACTUAL source tables in the data model:
 * - CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
 * - CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER
 * - CORE_DEPOSIT.DIM_ACCOUNT
 * - CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
 * - CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
 */

export interface GoldMetric {
  metricId: string;
  name: string;
  description: string;
  category: "Volume" | "Growth" | "Retention" | "Value" | "Risk" | "Engagement" | "Segmentation" | "Quality" | "Lifecycle" | "Profitability" | "Compliance";
  type: "Operational" | "Strategic" | "Tactical";
  grain: string; // Comma-separated values: Customer, Account, Product, Channel, Daily, Monthly, Overall
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

// ============================================================================
// VOLUME & GROWTH METRICS
// ============================================================================
export const customerGoldMetrics: GoldMetric[] = [
  {
    metricId: "CUST-VOL-001",
    name: "Total Active Customers",
    description: "Count of unique active customers with trend analysis (MoM, YoY, 7-day MA)",
    category: "Volume",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH daily_counts AS (
        SELECT
          PRCS_DTE as report_date,
          COUNT(DISTINCT CUSTOMER_NUMBER) as active_customers
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE RECORD_STATUS = 'ACTIVE'
          AND IS_CURRENT = TRUE
          AND PRCS_DTE >= DATEADD(month, -13, CURRENT_DATE())
        GROUP BY PRCS_DTE
      ),
      trend_analysis AS (
        SELECT
          report_date,
          active_customers,
          LAG(active_customers, 1) OVER (ORDER BY report_date) as prev_day,
          LAG(active_customers, 30) OVER (ORDER BY report_date) as prev_month,
          LAG(active_customers, 365) OVER (ORDER BY report_date) as prev_year,
          ROUND(AVG(active_customers) OVER (ORDER BY report_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as ma_7d
        FROM daily_counts
      )
      SELECT
        report_date,
        active_customers as total_active_customers,
        prev_day,
        prev_month,
        prev_year,
        ma_7d,
        ROUND(CAST(active_customers - prev_day AS FLOAT) / NULLIF(prev_day, 0) * 100, 2) as dod_growth_pct,
        ROUND(CAST(active_customers - prev_month AS FLOAT) / NULLIF(prev_month, 0) * 100, 2) as mom_growth_pct,
        ROUND(CAST(active_customers - prev_year AS FLOAT) / NULLIF(prev_year, 0) * 100, 2) as yoy_growth_pct
      FROM trend_analysis
      WHERE report_date = CURRENT_DATE()
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "DISTINCT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Active customer count with LAG window functions for DoD, MoM, YoY trend analysis and 7-day moving average",
    owner: "Data Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-GRO-001", "CUST-RET-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-VOL-002",
    name: "New Customers (Month)",
    description: "New customer acquisitions with MoM trend, channel breakdown, and running total",
    category: "Growth",
    type: "Strategic",
    grain: "Monthly, Channel",
    sqlDefinition: `
      WITH monthly_acquisitions AS (
        SELECT
          DATE_TRUNC('month', CUSTOMER_ACQUISITION_DATE) as acq_month,
          COUNT(DISTINCT CUSTOMER_NUMBER) as new_customers,
          COUNT(DISTINCT CASE WHEN ACQUISITION_CHANNEL = 'ONLINE' THEN CUSTOMER_NUMBER END) as online_acquisitions,
          COUNT(DISTINCT CASE WHEN ACQUISITION_CHANNEL = 'BRANCH' THEN CUSTOMER_NUMBER END) as branch_acquisitions,
          COUNT(DISTINCT CASE WHEN ACQUISITION_CHANNEL = 'MOBILE' THEN CUSTOMER_NUMBER END) as mobile_acquisitions
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE CUSTOMER_ACQUISITION_DATE >= DATEADD(month, -12, CURRENT_DATE())
          AND IS_CURRENT = TRUE
          AND RECORD_STATUS = 'ACTIVE'
        GROUP BY DATE_TRUNC('month', CUSTOMER_ACQUISITION_DATE)
      ),
      trend_metrics AS (
        SELECT
          acq_month,
          new_customers,
          online_acquisitions,
          branch_acquisitions,
          mobile_acquisitions,
          LAG(new_customers, 1) OVER (ORDER BY acq_month) as prev_month_new,
          ROUND(AVG(new_customers) OVER (ORDER BY acq_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) as ma_3m,
          SUM(new_customers) OVER (ORDER BY acq_month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_ytd
        FROM monthly_acquisitions
      )
      SELECT
        acq_month,
        new_customers as new_customers_month,
        online_acquisitions,
        branch_acquisitions,
        mobile_acquisitions,
        prev_month_new,
        ma_3m,
        cumulative_ytd,
        ROUND(CAST(new_customers - prev_month_new AS FLOAT) / NULLIF(prev_month_new, 0) * 100, 2) as mom_growth_pct,
        ROUND(CAST(online_acquisitions AS FLOAT) / NULLIF(new_customers, 0) * 100, 2) as online_pct
      FROM trend_metrics
      WHERE acq_month = DATE_TRUNC('month', CURRENT_DATE())
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "DISTINCT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "New customer count with LAG for MoM comparison, 3-month MA, channel breakdown, and YTD cumulative total",
    owner: "Growth Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-001", "CUST-GRO-003"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-VOL-003",
    name: "Churned Customers (Month)",
    description: "Churned customers with churn rate calculation, tenure distribution, and trend analysis",
    category: "Retention",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      WITH monthly_churn AS (
        SELECT
          DATE_TRUNC('month', RECORD_END_DATE) as churn_month,
          COUNT(DISTINCT CUSTOMER_NUMBER) as churned_customers,
          ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY DATEDIFF(month, CUSTOMER_ACQUISITION_DATE, RECORD_END_DATE)), 0) as median_tenure_months,
          ROUND(AVG(DATEDIFF(month, CUSTOMER_ACQUISITION_DATE, RECORD_END_DATE)), 2) as avg_tenure_months,
          COUNT(DISTINCT CASE WHEN DATEDIFF(month, CUSTOMER_ACQUISITION_DATE, RECORD_END_DATE) <= 3 THEN CUSTOMER_NUMBER END) as early_churn_0_3m,
          COUNT(DISTINCT CASE WHEN DATEDIFF(month, CUSTOMER_ACQUISITION_DATE, RECORD_END_DATE) BETWEEN 4 AND 12 THEN CUSTOMER_NUMBER END) as churn_4_12m,
          COUNT(DISTINCT CASE WHEN DATEDIFF(month, CUSTOMER_ACQUISITION_DATE, RECORD_END_DATE) > 12 THEN CUSTOMER_NUMBER END) as churn_over_12m
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE IS_CURRENT = FALSE
          AND RECORD_STATUS = 'INACTIVE'
          AND RECORD_END_DATE >= DATEADD(month, -12, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', RECORD_END_DATE)
      ),
      active_base AS (
        SELECT
          DATE_TRUNC('month', PRCS_DTE) as base_month,
          COUNT(DISTINCT CUSTOMER_NUMBER) as active_customers
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE RECORD_STATUS = 'ACTIVE'
          AND IS_CURRENT = TRUE
          AND PRCS_DTE >= DATEADD(month, -12, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', PRCS_DTE)
      )
      SELECT
        mc.churn_month,
        mc.churned_customers,
        mc.median_tenure_months,
        mc.avg_tenure_months,
        mc.early_churn_0_3m,
        mc.churn_4_12m,
        mc.churn_over_12m,
        ab.active_customers as active_base,
        ROUND(CAST(mc.churned_customers AS FLOAT) / NULLIF(ab.active_customers, 0) * 100, 2) as churn_rate_pct,
        LAG(mc.churned_customers, 1) OVER (ORDER BY mc.churn_month) as prev_month_churn,
        ROUND(AVG(mc.churned_customers) OVER (ORDER BY mc.churn_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) as ma_3m_churn
      FROM monthly_churn mc
      LEFT JOIN active_base ab ON mc.churn_month = ab.base_month
      WHERE mc.churn_month = DATE_TRUNC('month', CURRENT_DATE())
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "DISTINCT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Churned customers with churn rate calculation, tenure distribution using PERCENTILE_CONT, and 3-month MA trend analysis",
    owner: "Retention Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-RET-001", "CUST-RET-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-VOL-004",
    name: "Total Inactive Customers",
    description: "Count of inactive customers at end of period",
    category: "Retention",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as inactive_customers
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE RECORD_STATUS = 'INACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "DISTINCT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of inactive customers as of current date",
    owner: "Data Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },

  // ============================================================================
  // RETENTION METRICS
  // ============================================================================
  {
    metricId: "CUST-RET-001",
    name: "Customer Churn Rate",
    description: "Monthly customer churn rate as percentage",
    category: "Retention",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      WITH monthly_churn AS (
        SELECT 
          COUNT(DISTINCT CASE WHEN IS_CURRENT = FALSE THEN CUSTOMER_NUMBER END) as churned_count,
          COUNT(DISTINCT CUSTOMER_NUMBER) as total_customers
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE MONTH(PRCS_DTE) = MONTH(CURRENT_DATE())
          AND YEAR(PRCS_DTE) = YEAR(CURRENT_DATE())
      )
      SELECT 
        ROUND((churned_count / NULLIF(total_customers, 0)) * 100, 2) as churn_rate_pct
      FROM monthly_churn
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Churned customers / Total customers * 100 from DIM_CUSTOMER_DEMOGRAPHY",
    owner: "Retention Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-003", "CUST-RET-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-RET-002",
    name: "Customer Retention Rate",
    description: "Percentage of customers retained month-over-month",
    category: "Retention",
    type: "Strategic",
    grain: "Monthly",
    sqlDefinition: `
      SELECT 
        ROUND((1 - (churned_count / NULLIF(prev_total_customers, 0))) * 100, 2) as retention_rate_pct
      FROM (
        SELECT 
          COUNT(DISTINCT CASE WHEN IS_CURRENT = FALSE THEN CUSTOMER_NUMBER END) as churned_count,
          LAG(COUNT(DISTINCT CUSTOMER_NUMBER), 1) OVER (ORDER BY MONTH(PRCS_DTE)) as prev_total_customers
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE IS_CURRENT = TRUE
        GROUP BY MONTH(PRCS_DTE)
      )
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "100% - Churn Rate (month-over-month) from DIM_CUSTOMER_DEMOGRAPHY",
    owner: "Retention Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-RET-001", "CUST-VOL-003"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-RET-003",
    name: "Customer Tenure Distribution",
    description: "Distribution of customers by account tenure ranges",
    category: "Engagement",
    type: "Tactical",
    grain: "Customer",
    sqlDefinition: `
      SELECT
        CASE
          WHEN DATEDIFF(year, CUSTOMER_ACQUISITION_DATE, CURRENT_DATE()) < 1 THEN '0-1 Year'
          WHEN DATEDIFF(year, CUSTOMER_ACQUISITION_DATE, CURRENT_DATE()) < 3 THEN '1-3 Years'
          WHEN DATEDIFF(year, CUSTOMER_ACQUISITION_DATE, CURRENT_DATE()) < 5 THEN '3-5 Years'
          WHEN DATEDIFF(year, CUSTOMER_ACQUISITION_DATE, CURRENT_DATE()) < 10 THEN '5-10 Years'
          ELSE '10+ Years'
        END as tenure_range,
        COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE IS_CURRENT = TRUE
        AND RECORD_STATUS = 'ACTIVE'
      GROUP BY tenure_range
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Customer count grouped by tenure length from acquisition date",
    owner: "Retention Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-RET-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },

  // ============================================================================
  // VALUE METRICS (from CORE_DEPOSIT)
  // ============================================================================
  {
    metricId: "CUST-VAL-001",
    name: "Average Customer Deposit Balance",
    description: "Average deposit balance per active customer",
    category: "Value",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        ROUND(AVG(CURRENT_BALANCE), 2) as avg_deposit_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE > 0
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE", "CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average of CURRENT_BALANCE from FCT_DEPOSIT_DAILY_BALANCE for current date",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VAL-002", "CUST-VAL-003"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-VAL-002",
    name: "Total Customer Deposits",
    description: "Total deposit balance across all active accounts",
    category: "Value",
    type: "Strategic",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        SUM(CURRENT_BALANCE) as total_customer_deposits
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Sum of all deposit balances from FCT_DEPOSIT_DAILY_BALANCE on reporting date",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VAL-001", "CUST-VAL-003"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-VAL-003",
    name: "Median Customer Deposit Balance",
    description: "Median deposit balance per active customer",
    category: "Value",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CURRENT_BALANCE) as median_deposit_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE > 0
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "50th percentile of account balances from FCT_DEPOSIT_DAILY_BALANCE",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VAL-001", "CUST-VAL-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-VAL-004",
    name: "90th Percentile Customer Balance",
    description: "90th percentile deposit balance across customers",
    category: "Value",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY CURRENT_BALANCE) as p90_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE > 0
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "90th percentile of account balances",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VAL-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-VAL-005",
    name: "Customer Balance Growth MoM",
    description: "Month-over-month percentage change in total customer deposits",
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
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Current month balance - Previous month balance / Previous month * 100",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VAL-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  // ============================================================================
  // ENGAGEMENT METRICS
  // ============================================================================
  {
    metricId: "CUST-ENG-001",
    name: "Average Accounts Per Customer",
    description: "Average number of accounts held per customer",
    category: "Engagement",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      SELECT 
        ROUND(COUNT(DISTINCT ACCOUNT_NUMBER) / NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0), 2) as avg_accounts_per_customer
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "count",
    businessLogic: "Total active accounts / distinct customers from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-002", "CUST-ENG-003"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ENG-002",
    name: "Multi-Account Holder Count",
    description: "Number of customers holding multiple deposit accounts",
    category: "Engagement",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH customer_account_count AS (
        SELECT 
          CUSTOMER_NUMBER,
          COUNT(DISTINCT ACCOUNT_NUMBER) as account_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE ACCOUNT_STATUS = 'ACTIVE'
        GROUP BY CUSTOMER_NUMBER
      )
      SELECT 
        COUNT(DISTINCT CUSTOMER_NUMBER) as multi_account_customers
      FROM customer_account_count
      WHERE account_count > 1
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with more than 1 account from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-001", "CUST-ENG-003"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ENG-003",
    name: "Account Type Distribution",
    description: "Count of customers by account product type",
    category: "Engagement",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      SELECT 
        ACCOUNT_TYPE,
        COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_STATUS = 'ACTIVE'
      GROUP BY ACCOUNT_TYPE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Distinct customers grouped by account type from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-001", "CUST-ENG-002"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ENG-004",
    name: "Single Account Holders",
    description: "Number of customers holding exactly one account",
    category: "Engagement",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH customer_account_count AS (
        SELECT 
          CUSTOMER_NUMBER,
          COUNT(DISTINCT ACCOUNT_NUMBER) as account_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE ACCOUNT_STATUS = 'ACTIVE'
        GROUP BY CUSTOMER_NUMBER
      )
      SELECT 
        COUNT(DISTINCT CUSTOMER_NUMBER) as single_account_customers
      FROM customer_account_count
      WHERE account_count = 1
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with exactly 1 account from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-002"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ENG-005",
    name: "Three Plus Account Holders",
    description: "Number of customers holding three or more accounts",
    category: "Engagement",
    type: "Operational",
    grain: "Daily",
    sqlDefinition: `
      WITH customer_account_count AS (
        SELECT 
          CUSTOMER_NUMBER,
          COUNT(DISTINCT ACCOUNT_NUMBER) as account_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE ACCOUNT_STATUS = 'ACTIVE'
        GROUP BY CUSTOMER_NUMBER
      )
      SELECT 
        COUNT(DISTINCT CUSTOMER_NUMBER) as three_plus_customers
      FROM customer_account_count
      WHERE account_count >= 3
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with 3 or more accounts from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-002"],
    dependencies: ["DIM_ACCOUNT"],
  },

  // ============================================================================
  // TRANSACTION ACTIVITY METRICS
  // ============================================================================
  {
    metricId: "CUST-ACT-001",
    name: "Total Transactions (12M)",
    description: "Total number of transactions in last 12 months",
    category: "Engagement",
    type: "Strategic",
    grain: "Overall",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as total_transactions_12m
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(month, -12, CURRENT_DATE())
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Quarterly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of transactions in last 12 months from FCT_DEPOSIT_ACCOUNT_TRANSACTION",
    owner: "Transaction Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACT-002"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-ACT-002",
    name: "Average Daily Deposits (30D)",
    description: "Average daily deposit transaction amount in last 30 days",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT 
        ROUND(AVG(TRANSACTION_AMOUNT), 2) as avg_daily_deposit_30d
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
        AND TRANSACTION_TYPE = 'DEPOSIT'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average deposit transaction amounts from last 30 days in FCT_DEPOSIT_ACCOUNT_TRANSACTION",
    owner: "Transaction Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACT-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-ACT-003",
    name: "Daily Active Customers",
    description: "Count of customers with at least one transaction on reporting day",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT CUSTOMER_NUMBER) as daily_active_customers
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of distinct customers with completed transactions on reporting date",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-PER-002"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-ACT-004",
    name: "Monthly Active Customers",
    description: "Count of customers with at least one transaction in current month",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT CUSTOMER_NUMBER) as monthly_active_customers
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE())
        AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of distinct customers with completed transactions in current month",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACT-003"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-ACT-005",
    name: "Average Transactions Per Active Customer",
    description: "Average number of transactions per customer with activity",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT 
        ROUND(COUNT(DISTINCT TRANSACTION_ID) / NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0), 2) as avg_txn_per_customer
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "count",
    businessLogic: "Total transactions / distinct active customers over period",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACT-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },

  // ============================================================================
  // RISK METRICS
  // ============================================================================
  {
    metricId: "CUST-RIS-001",
    name: "High-Value Customer Count",
    description: "Number of customers with average deposit balance above $500K",
    category: "Risk",
    type: "Operational",
    grain: "Customer, Daily",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT CUSTOMER_NUMBER) as high_value_customers
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
      JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE >= 500000
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE", "CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with deposit balance >= $500K from FCT_DEPOSIT_DAILY_BALANCE",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VAL-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE", "DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-RIS-002",
    name: "Customer Identity Verification Status",
    description: "Percentage of customers with complete KYC verification",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN KYC_VERIFICATION_STATUS = 'VERIFIED' THEN 1 END) /
               NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as kyc_verification_pct
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER
      WHERE IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Verified customers / Total customers * 100 from DIM_CUSTOMER_IDENTIFER",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_IDENTIFER"],
  },
  {
    metricId: "CUST-RIS-003",
    name: "Unverified KYC Customers",
    description: "Count of customers with pending or failed KYC verification",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as unverified_customers
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER
      WHERE KYC_VERIFICATION_STATUS IN ('PENDING', 'FAILED')
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with pending or failed KYC status",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-RIS-002"],
    dependencies: ["DIM_CUSTOMER_IDENTIFER"],
  },
  {
    metricId: "CUST-RIS-004",
    name: "Zero Balance Accounts",
    description: "Count of active accounts with zero or negative balance",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT ACCOUNT_NUMBER) as zero_balance_accounts
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE <= 0
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
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
    relatedMetrics: ["CUST-RIS-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  // ============================================================================
  // GROWTH & ACQUISITION METRICS
  // ============================================================================
  {
    metricId: "CUST-GRO-001",
    name: "Monthly Customer Acquisition Rate",
    description: "Month-over-month customer growth percentage",
    category: "Growth",
    type: "Strategic",
    sqlDefinition: `
      WITH monthly_totals AS (
        SELECT
          DATE_TRUNC('month', CUSTOMER_ACQUISITION_DATE) as month,
          COUNT(DISTINCT CUSTOMER_NUMBER) as monthly_new_customers
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE RECORD_STATUS = 'ACTIVE'
        GROUP BY DATE_TRUNC('month', CUSTOMER_ACQUISITION_DATE)
      )
      SELECT
        ROUND(((monthly_new_customers - LAG(monthly_new_customers) OVER (ORDER BY month)) /
                NULLIF(LAG(monthly_new_customers) OVER (ORDER BY month), 0)) * 100, 2) as mom_growth_pct
      FROM monthly_totals
      WHERE month = DATE_TRUNC('month', CURRENT_DATE())
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Current month new customers / Previous month customers * 100",
    owner: "Growth Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-002", "CUST-GRO-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-GRO-002",
    name: "Year-to-Date Customer Acquisitions",
    description: "Total number of new customers acquired year-to-date",
    category: "Growth",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as ytd_new_customers
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE CUSTOMER_ACQUISITION_DATE >= DATE_TRUNC('year', CURRENT_DATE())
        AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Annual",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers acquired from Jan 1 to current date",
    owner: "Growth Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-002", "CUST-GRO-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-GRO-003",
    name: "Average Days to First Transaction",
    description: "Average number of days from customer creation to first transaction",
    category: "Engagement",
    type: "Tactical",
    sqlDefinition: `
      SELECT
        ROUND(AVG(DATEDIFF(day, cd.CUSTOMER_ACQUISITION_DATE, ft.FIRST_TRANSACTION_DATE)), 0) as avg_days_to_first_transaction
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY cd
      LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION ft ON cd.CUSTOMER_NUMBER = ft.CUSTOMER_NUMBER
      WHERE cd.IS_CURRENT = TRUE
        AND ft.TRANSACTION_DATE IS NOT NULL
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "INTEGER",
    unit: "days",
    businessLogic: "Average (First transaction date - Customer acquisition date) for active customers",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-001", "CUST-GRO-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-GRO-004",
    name: "Customer Acquisition Cost Trend",
    description: "Estimated monthly customer acquisition cost based on new accounts",
    category: "Growth",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        DATE_TRUNC('month', CUSTOMER_ACQUISITION_DATE) as month,
        COUNT(DISTINCT CUSTOMER_NUMBER) as new_customers,
        ROUND(5000000 / NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0), 2) as estimated_cac
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE RECORD_STATUS = 'ACTIVE'
        AND CUSTOMER_ACQUISITION_DATE >= DATEADD(month, -12, CURRENT_DATE())
      GROUP BY DATE_TRUNC('month', CUSTOMER_ACQUISITION_DATE)
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Marketing budget / new customers per month (estimated with $5M annual budget)",
    owner: "Marketing Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-GRO-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },

  // ============================================================================
  // SEGMENTATION METRICS
  // ============================================================================
  {
    metricId: "CUST-SEG-001",
    name: "Premium Customer Count",
    description: "Number of customers classified as premium tier",
    category: "Segmentation",
    type: "Operational",
    grain: "Segment",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as premium_customer_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE CUSTOMER_SEGMENT = 'PREMIUM'
        AND IS_CURRENT = TRUE
        AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with PREMIUM segment classification",
    owner: "Customer Success",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-SEG-002", "CUST-VAL-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-SEG-002",
    name: "Standard Customer Count",
    description: "Number of customers classified as standard tier",
    category: "Segmentation",
    type: "Operational",
    grain: "Segment",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as standard_customer_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE CUSTOMER_SEGMENT = 'STANDARD'
        AND IS_CURRENT = TRUE
        AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with STANDARD segment classification",
    owner: "Customer Success",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-SEG-001", "CUST-SEG-003"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-SEG-003",
    name: "Customer Geographic Distribution",
    description: "Distribution of customers by geographic state/region",
    category: "Segmentation",
    type: "Operational",
    grain: "Channel",
    sqlDefinition: `
      SELECT
        STATE,
        COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_NAMES_ADDRESSES
      WHERE IS_CURRENT = TRUE
        AND ADDRESS_TYPE = 'PRIMARY'
      GROUP BY STATE
      ORDER BY customer_count DESC
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_NAMES_ADDRESSES"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Distinct customer count grouped by geographic state",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-001"],
    dependencies: ["DIM_CUSTOMER_NAMES_ADDRESSES"],
  },
  {
    metricId: "CUST-SEG-004",
    name: "Age Group Distribution",
    description: "Distribution of customers by age group segments",
    category: "Segmentation",
    type: "Operational",
    grain: "Segment",
    sqlDefinition: `
      SELECT
        CASE
          WHEN AGE < 25 THEN '18-24'
          WHEN AGE < 35 THEN '25-34'
          WHEN AGE < 50 THEN '35-49'
          WHEN AGE < 65 THEN '50-64'
          ELSE '65+'
        END as age_group,
        COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
      GROUP BY age_group
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Customer count grouped by computed age bands",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.7,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-SEG-003"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-SEG-005",
    name: "Income Segment Distribution",
    description: "Distribution of customers by income level segments",
    category: "Segmentation",
    type: "Operational",
    grain: "Segment",
    sqlDefinition: `
      SELECT
        CASE
          WHEN ANNUAL_INCOME < 50000 THEN 'Low Income'
          WHEN ANNUAL_INCOME < 100000 THEN 'Middle Income'
          WHEN ANNUAL_INCOME < 200000 THEN 'Upper Income'
          ELSE 'High Income'
        END as income_segment,
        COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
      GROUP BY income_segment
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Customer count grouped by income level segments",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.7,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-SEG-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-SEG-006",
    name: "Employment Status Distribution",
    description: "Distribution of customers by employment status",
    category: "Segmentation",
    type: "Operational",
    grain: "Segment",
    sqlDefinition: `
      SELECT
        EMPLOYMENT_STATUS,
        COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
      GROUP BY EMPLOYMENT_STATUS
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Customer count grouped by employment status",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },

  // ============================================================================
  // ACCOUNT METRICS
  // ============================================================================
  {
    metricId: "CUST-ACC-001",
    name: "Total Active Accounts",
    description: "Total number of active deposit accounts",
    category: "Volume",
    type: "Operational",
    grain: "Overall",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as total_active_accounts
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active accounts from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-001", "CUST-ACC-002"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ACC-002",
    name: "Savings Account Count",
    description: "Number of active savings accounts",
    category: "Volume",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as savings_account_count
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_TYPE = 'SAVINGS'
        AND ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active savings accounts from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACC-001", "CUST-ACC-003"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ACC-003",
    name: "Checking Account Count",
    description: "Number of active checking accounts",
    category: "Volume",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as checking_account_count
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_TYPE = 'CHECKING'
        AND ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active checking accounts from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACC-001", "CUST-ACC-002"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ACC-004",
    name: "Average Account Tenure",
    description: "Average number of days since account opening",
    category: "Engagement",
    type: "Operational",
    grain: "Overall",
    sqlDefinition: `
      SELECT
        ROUND(AVG(DATEDIFF(day, ACCOUNT_OPEN_DATE, CURRENT_DATE())), 0) as avg_account_tenure_days
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "INTEGER",
    unit: "days",
    businessLogic: "Average age of active accounts measured from opening date",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACC-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ACC-005",
    name: "Money Market Account Count",
    description: "Number of active money market accounts",
    category: "Volume",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as money_market_count
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_TYPE = 'MONEY_MARKET'
        AND ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active money market accounts from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACC-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-ACC-006",
    name: "Certificate of Deposit Count",
    description: "Number of active CD accounts",
    category: "Volume",
    type: "Operational",
    grain: "Product",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as cd_account_count
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE ACCOUNT_TYPE = 'CD'
        AND ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of active CD accounts from DIM_ACCOUNT",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACC-001"],
    dependencies: ["DIM_ACCOUNT"],
  },

  // ============================================================================
  // BALANCE & LIQUIDITY METRICS
  // ============================================================================
  {
    metricId: "CUST-BAL-001",
    name: "Accounts Below Minimum Balance",
    description: "Count of accounts with balance below $100 minimum",
    category: "Risk",
    type: "Operational",
    grain: "Overall",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as below_minimum_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE < 100
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts with balance < $100 minimum requirement",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-BAL-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-BAL-002",
    name: "Maximum Account Balance",
    description: "Highest account balance across all customer accounts",
    category: "Value",
    type: "Operational",
    grain: "Overall",
    sqlDefinition: `
      SELECT
        MAX(CURRENT_BALANCE) as max_account_balance
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "MAX",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Maximum balance across all accounts on reporting date",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VAL-002"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-BAL-003",
    name: "Total High Balance Accounts",
    description: "Count of accounts with balance over $100K",
    category: "Value",
    type: "Operational",
    grain: "Overall",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as high_balance_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE > 100000
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts with balance > $100K",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-RIS-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-BAL-004",
    name: "Total Low Balance Accounts",
    description: "Count of accounts with balance under $1000",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT ACCOUNT_NUMBER) as low_balance_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND CURRENT_BALANCE < 1000
        AND CURRENT_BALANCE > 0
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of accounts with balance between $0 and $1K",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-BAL-001"],
    dependencies: ["FCT_DEPOSIT_DAILY_BALANCE"],
  },

  // ============================================================================
  // QUALITY & COMPLETENESS METRICS
  // ============================================================================
  {
    metricId: "CUST-QUA-001",
    name: "Email Address Completeness",
    description: "Percentage of customers with valid email addresses",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN EMAIL IS NOT NULL AND EMAIL != '' THEN 1 END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as email_completeness_pct
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_NAMES_ADDRESSES
      WHERE IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_NAMES_ADDRESSES"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Customers with non-null email / total customers * 100",
    owner: "Data Governance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-QUA-002"],
    dependencies: ["DIM_CUSTOMER_NAMES_ADDRESSES"],
  },
  {
    metricId: "CUST-QUA-002",
    name: "Phone Number Completeness",
    description: "Percentage of customers with valid phone contact",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN PHONE_NUMBER IS NOT NULL AND PHONE_NUMBER != '' THEN 1 END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as phone_completeness_pct
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_NAMES_ADDRESSES
      WHERE IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_NAMES_ADDRESSES"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Customers with non-null phone / total customers * 100",
    owner: "Data Governance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-QUA-001"],
    dependencies: ["DIM_CUSTOMER_NAMES_ADDRESSES"],
  },
  {
    metricId: "CUST-QUA-003",
    name: "Data Freshness Score",
    description: "Percentage of records updated within last 30 days",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN DATEDIFF(day, LAST_MODIFIED_DATE, CURRENT_DATE()) <= 30 THEN 1 END) /
                NULLIF(COUNT(*), 0)) * 100, 2) as data_freshness_pct
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Records modified within 30 days / total records * 100",
    owner: "Data Governance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-QUA-004",
    name: "Customer Record Completeness",
    description: "Percentage of customer records with all required fields populated",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN NAME IS NOT NULL AND DOB IS NOT NULL AND ADDRESS IS NOT NULL THEN 1 END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as record_completeness_pct
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Customers with all required fields / total customers * 100",
    owner: "Data Governance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-QUA-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },

  // ============================================================================
  // PERFORMANCE METRICS
  // ============================================================================
  {
    metricId: "CUST-PER-001",
    name: "Customer Lifetime Value (CLV) - High",
    grain: "Customer",
    description: "Estimated lifetime value for premium customers",
    category: "Value",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(AVG(total_account_balance), 2) as estimated_clv_premium
      FROM (
        SELECT
          cd.CUSTOMER_NUMBER,
          SUM(fdb.CURRENT_BALANCE) as total_account_balance
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY cd
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON cd.CUSTOMER_NUMBER = da.CUSTOMER_NUMBER
        JOIN CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb ON da.ACCOUNT_NUMBER = fdb.ACCOUNT_NUMBER
        WHERE cd.CUSTOMER_SEGMENT = 'PREMIUM'
          AND fdb.BALANCE_DATE = CURRENT_DATE()
        GROUP BY cd.CUSTOMER_NUMBER
      )
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.DIM_ACCOUNT", "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average total account balance for premium segment customers",
    owner: "Strategy & Planning",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.5,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-SEG-001", "CUST-VAL-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "DIM_ACCOUNT", "FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-PER-002",
    name: "Inactive Customer Count",
    grain: "Overall",
    description: "Number of customers with no transactions in last 90 days",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT cd.CUSTOMER_NUMBER) as inactive_90day_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY cd
      LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION ft ON cd.CUSTOMER_NUMBER = ft.CUSTOMER_NUMBER
        AND ft.TRANSACTION_DATE >= DATEADD(day, -90, CURRENT_DATE())
      WHERE cd.IS_CURRENT = TRUE
        AND cd.RECORD_STATUS = 'ACTIVE'
        AND ft.TRANSACTION_ID IS NULL
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Customers with zero transactions in past 90 days",
    owner: "Retention Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-RET-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-PER-003",
    name: "Customer Satisfaction Score",
    grain: "Overall",
    description: "Average customer satisfaction rating from surveys",
    category: "Engagement",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(AVG(SATISFACTION_SCORE), 2) as avg_satisfaction_score
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_SATISFACTION
      WHERE SURVEY_DATE >= DATEADD(month, -1, CURRENT_DATE())
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_SATISFACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "score",
    businessLogic: "Average customer satisfaction rating from monthly surveys",
    owner: "Customer Experience",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_CUSTOMER_SATISFACTION"],
  },
  {
    metricId: "CUST-PER-004",
    name: "Net Promoter Score (NPS)",
    grain: "Overall",
    description: "NPS sentiment index ranging from -100 to +100",
    category: "Engagement",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(((promoters - detractors) / NULLIF((promoters + detractors), 0)) * 100, 2) as nps_score
      FROM (
        SELECT
          COUNT(CASE WHEN SATISFACTION_SCORE >= 9 THEN 1 END) as promoters,
          COUNT(CASE WHEN SATISFACTION_SCORE <= 6 THEN 1 END) as detractors
        FROM CORE_CUSTOMERS.FCT_CUSTOMER_SATISFACTION
        WHERE SURVEY_DATE >= DATEADD(month, -1, CURRENT_DATE())
      )
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_SATISFACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "score",
    businessLogic: "(Promoters - Detractors) / (Promoters + Detractors) * 100",
    owner: "Customer Experience",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-PER-003"],
    dependencies: ["FCT_CUSTOMER_SATISFACTION"],
  },

  // ============================================================================
  // PROFITABILITY METRICS
  // ============================================================================
  {
    metricId: "CUST-PROF-001",
    name: "Average Customer Profit",
    grain: "Customer",
    description: "Average profit contribution per customer",
    category: "Value",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(AVG(total_profit), 2) as avg_customer_profit
      FROM (
        SELECT
          cd.CUSTOMER_NUMBER,
          (SUM(fdb.CURRENT_BALANCE) * 0.05 - SUM(fdb.DAILY_INTEREST_ACCRUAL) * 365) as total_profit
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY cd
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON cd.CUSTOMER_NUMBER = da.CUSTOMER_NUMBER
        JOIN CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb ON da.ACCOUNT_NUMBER = fdb.ACCOUNT_NUMBER
        WHERE cd.IS_CURRENT = TRUE
          AND fdb.BALANCE_DATE = CURRENT_DATE()
        GROUP BY cd.CUSTOMER_NUMBER
      )
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.DIM_ACCOUNT", "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "USD",
    businessLogic: "Average profit = (Balance * margin) - (Interest expense)",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VAL-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "DIM_ACCOUNT", "FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-PROF-002",
    name: "Profitable Customer Count",
    grain: "Overall",
    description: "Number of customers with positive profitability",
    category: "Value",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as profitable_customers
      FROM (
        SELECT
          cd.CUSTOMER_NUMBER,
          (SUM(fdb.CURRENT_BALANCE) * 0.05 - SUM(fdb.DAILY_INTEREST_ACCRUAL) * 365) as total_profit
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY cd
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON cd.CUSTOMER_NUMBER = da.CUSTOMER_NUMBER
        JOIN CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb ON da.ACCOUNT_NUMBER = fdb.ACCOUNT_NUMBER
        WHERE cd.IS_CURRENT = TRUE
          AND fdb.BALANCE_DATE = CURRENT_DATE()
        GROUP BY cd.CUSTOMER_NUMBER
        HAVING (SUM(fdb.CURRENT_BALANCE) * 0.05 - SUM(fdb.DAILY_INTEREST_ACCRUAL) * 365) > 0
      )
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.DIM_ACCOUNT", "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with positive profit contribution",
    owner: "Financial Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-PROF-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "DIM_ACCOUNT", "FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-PROF-003",
    name: "Unprofitable Customer Count",
    grain: "Overall",
    description: "Number of customers with negative profitability",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as unprofitable_customers
      FROM (
        SELECT
          cd.CUSTOMER_NUMBER,
          (SUM(fdb.CURRENT_BALANCE) * 0.05 - SUM(fdb.DAILY_INTEREST_ACCRUAL) * 365) as total_profit
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY cd
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON cd.CUSTOMER_NUMBER = da.CUSTOMER_NUMBER
        JOIN CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb ON da.ACCOUNT_NUMBER = fdb.ACCOUNT_NUMBER
        WHERE cd.IS_CURRENT = TRUE
          AND fdb.BALANCE_DATE = CURRENT_DATE()
        GROUP BY cd.CUSTOMER_NUMBER
        HAVING (SUM(fdb.CURRENT_BALANCE) * 0.05 - SUM(fdb.DAILY_INTEREST_ACCRUAL) * 365) < 0
      )
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.DIM_ACCOUNT", "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with negative profit contribution",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-PROF-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "DIM_ACCOUNT", "FCT_DEPOSIT_DAILY_BALANCE"],
  },

  // ============================================================================
  // CHANNEL & DIGITAL METRICS
  // ============================================================================
  {
    metricId: "CUST-CHAN-001",
    name: "Mobile App Users",
    grain: "Channel",
    description: "Number of customers with active mobile app usage",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as mobile_app_users
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_CHANNEL_ACTIVITY
      WHERE ACTIVITY_DATE >= DATEADD(month, -1, CURRENT_DATE())
        AND CHANNEL = 'MOBILE_APP'
        AND ACTIVITY_TYPE = 'LOGIN'
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_CHANNEL_ACTIVITY"],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of unique customers with mobile app activity in last month",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-CHAN-002"],
    dependencies: ["FCT_CUSTOMER_CHANNEL_ACTIVITY"],
  },
  {
    metricId: "CUST-CHAN-002",
    name: "Online Banking Users",
    grain: "Channel",
    description: "Number of customers with active online banking usage",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as online_users
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_CHANNEL_ACTIVITY
      WHERE ACTIVITY_DATE >= DATEADD(month, -1, CURRENT_DATE())
        AND CHANNEL = 'ONLINE'
        AND ACTIVITY_TYPE = 'LOGIN'
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_CHANNEL_ACTIVITY"],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of unique customers with online banking activity in last month",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-CHAN-001"],
    dependencies: ["FCT_CUSTOMER_CHANNEL_ACTIVITY"],
  },
  {
    metricId: "CUST-CHAN-003",
    name: "Digital Adoption Rate",
    grain: "Channel",
    description: "Percentage of customers using digital channels",
    category: "Engagement",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(DISTINCT CASE WHEN DIGITAL_USER = TRUE THEN CUSTOMER_NUMBER END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as digital_adoption_pct
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Digital users / Total customers * 100",
    owner: "Digital Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-CHAN-001", "CUST-CHAN-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-CHAN-004",
    name: "Branch Visit Frequency",
    grain: "Channel",
    description: "Average number of branch visits per customer per month",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND(COUNT(DISTINCT VISIT_ID) / NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0), 2) as avg_branch_visits_month
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_CHANNEL_ACTIVITY
      WHERE ACTIVITY_DATE >= DATEADD(month, -1, CURRENT_DATE())
        AND CHANNEL = 'BRANCH'
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_CHANNEL_ACTIVITY"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "visits",
    businessLogic: "Total branch visits / distinct customers",
    owner: "Branch Operations",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_CUSTOMER_CHANNEL_ACTIVITY"],
  },

  // ============================================================================
  // PRODUCT HOLDING METRICS
  // ============================================================================
  {
    metricId: "CUST-PROD-001",
    name: "Credit Card Holder Count",
    grain: "Product",
    description: "Number of active credit card customers",
    category: "Volume",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as cc_holders
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE PRODUCT_TYPE = 'CREDIT_CARD'
        AND ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with active credit card",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACC-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-PROD-002",
    name: "Loan Holder Count",
    grain: "Product",
    description: "Number of active loan customers",
    category: "Volume",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as loan_holders
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE PRODUCT_TYPE IN ('AUTO_LOAN', 'PERSONAL_LOAN', 'MORTGAGE', 'HOME_EQUITY')
        AND ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with active loans",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACC-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-PROD-003",
    name: "Investment Product Holders",
    grain: "Product",
    description: "Number of customers with investment products",
    category: "Volume",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as investment_holders
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE PRODUCT_TYPE IN ('MUTUAL_FUND', 'BROKERAGE', 'RETIREMENT')
        AND ACCOUNT_STATUS = 'ACTIVE'
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with investment accounts",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACC-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-PROD-004",
    name: "Average Products Per Customer",
    grain: "Customer",
    description: "Average number of distinct product types per customer",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND(AVG(product_count), 2) as avg_products_per_cust
      FROM (
        SELECT
          CUSTOMER_NUMBER,
          COUNT(DISTINCT PRODUCT_TYPE) as product_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE ACCOUNT_STATUS = 'ACTIVE'
          AND IS_CURRENT = TRUE
        GROUP BY CUSTOMER_NUMBER
      )
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "count",
    businessLogic: "Average number of unique product types per customer",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-001"],
    dependencies: ["DIM_ACCOUNT"],
  },

  // ============================================================================
  // BEHAVIOR & ACTIVITY METRICS
  // ============================================================================
  {
    metricId: "CUST-BEH-001",
    name: "High Activity Customers",
    grain: "Customer",
    description: "Number of customers with 10+ transactions in last 30 days",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as high_activity_count
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
      GROUP BY CUSTOMER_NUMBER
      HAVING COUNT(*) >= 10
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with 10+ transactions in last 30 days",
    owner: "Behavioral Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ACT-004"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-BEH-002",
    name: "Low Activity Customers",
    grain: "Customer",
    description: "Number of customers with 0-2 transactions in last 30 days",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT cd.CUSTOMER_NUMBER) as low_activity_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY cd
      LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION ft ON cd.CUSTOMER_NUMBER = ft.CUSTOMER_NUMBER
        AND ft.TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
      WHERE cd.IS_CURRENT = TRUE
        AND cd.RECORD_STATUS = 'ACTIVE'
      GROUP BY cd.CUSTOMER_NUMBER
      HAVING COUNT(DISTINCT ft.TRANSACTION_ID) <= 2
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with 0-2 transactions in last 30 days",
    owner: "Behavioral Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-BEH-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-BEH-003",
    name: "New Product Adoption Rate",
    grain: "Overall",
    description: "Percentage of customers adopting new products within 90 days",
    category: "Growth",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN PRODUCT_ADOPTION_DATE >= DATEADD(day, -90, CURRENT_DATE()) THEN 1 END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as adoption_rate_pct
      FROM CORE_DEPOSIT.DIM_ACCOUNT
      WHERE IS_CURRENT = TRUE AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Quarterly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Customers adopting new products / Total customers * 100",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-GRO-001"],
    dependencies: ["DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-BEH-004",
    name: "Product Cross-buy Rate",
    grain: "Overall",
    description: "Percentage of customers buying cross-selling products",
    category: "Growth",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN product_count > 1 THEN 1 END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as crossbuy_rate_pct
      FROM (
        SELECT
          CUSTOMER_NUMBER,
          COUNT(DISTINCT PRODUCT_TYPE) as product_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE ACCOUNT_STATUS = 'ACTIVE' AND IS_CURRENT = TRUE
        GROUP BY CUSTOMER_NUMBER
      )
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Customers with multiple products / Total customers * 100",
    owner: "Product Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-ENG-002"],
    dependencies: ["DIM_ACCOUNT"],
  },

  // ============================================================================
  // RISK SCORING & COMPLIANCE METRICS
  // ============================================================================
  {
    metricId: "CUST-SCORE-001",
    name: "High Risk Customer Count",
    grain: "Overall",
    description: "Number of customers with high risk score",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as high_risk_count
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_RISK_SCORE
      WHERE RISK_SCORE >= 80
        AND AS_OF_DATE = CURRENT_DATE()
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_RISK_SCORE"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with risk score >= 80",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-SCORE-002"],
    dependencies: ["FCT_CUSTOMER_RISK_SCORE"],
  },
  {
    metricId: "CUST-SCORE-002",
    name: "Medium Risk Customer Count",
    grain: "Overall",
    description: "Number of customers with medium risk score",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as medium_risk_count
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_RISK_SCORE
      WHERE RISK_SCORE BETWEEN 50 AND 79
        AND AS_OF_DATE = CURRENT_DATE()
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_RISK_SCORE"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with risk score 50-79",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-SCORE-001"],
    dependencies: ["FCT_CUSTOMER_RISK_SCORE"],
  },
  {
    metricId: "CUST-SCORE-003",
    name: "Average Customer Risk Score",
    grain: "Overall",
    description: "Average risk score across all customers",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(AVG(RISK_SCORE), 2) as avg_risk_score
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_RISK_SCORE
      WHERE AS_OF_DATE = CURRENT_DATE()
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_RISK_SCORE"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "score",
    businessLogic: "Average risk score (0-100 scale)",
    owner: "Risk Management",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-SCORE-001"],
    dependencies: ["FCT_CUSTOMER_RISK_SCORE"],
  },
  {
    metricId: "CUST-COMP-001",
    name: "Compliance Review Flag Count",
    grain: "Overall",
    description: "Customers flagged for compliance review",
    category: "Compliance",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as compliance_flag_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER
      WHERE COMPLIANCE_FLAG = TRUE
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers flagged for compliance issues",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_IDENTIFER"],
  },
  {
    metricId: "CUST-COMP-002",
    name: "AML Compliance Rate",
    grain: "Overall",
    description: "Percentage of customers with current AML certification",
    category: "Compliance",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN AML_CERTIFIED = TRUE THEN 1 END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as aml_compliance_pct
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER
      WHERE IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "AML certified customers / Total customers * 100",
    owner: "Compliance",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_IDENTIFER"],
  },

  // ============================================================================
  // DEMOGRAPHIC & LIFESTYLE METRICS
  // ============================================================================
  {
    metricId: "CUST-DEMO-001",
    name: "Married Customer Count",
    grain: "Overall",
    description: "Number of customers with married status",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as married_customers
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE MARITAL_STATUS = 'MARRIED'
        AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of married customers",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-DEMO-002",
    name: "Customer With Dependents",
    grain: "Overall",
    description: "Number of customers with dependent children",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as customers_with_dependents
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE NUMBER_OF_DEPENDENTS > 0
        AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with dependents",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-DEMO-003",
    name: "College Educated Customers",
    grain: "Overall",
    description: "Number of customers with college or higher education",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as college_educated
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE EDUCATION_LEVEL IN ('COLLEGE', 'GRADUATE')
        AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of college+ educated customers",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.7,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-DEMO-004",
    name: "Homeowner Count",
    grain: "Overall",
    description: "Number of customers who own their residence",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as homeowner_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE HOME_OWNERSHIP = 'OWN'
        AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of homeowner customers",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-DEMO-005",
    name: "Business Owner Count",
    grain: "Overall",
    description: "Number of customers who own a business",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as business_owner_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE BUSINESS_OWNER = TRUE
        AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of business owner customers",
    owner: "Market Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },

  // ============================================================================
  // LIFECYCLE STAGE METRICS
  // ============================================================================
  {
    metricId: "CUST-LIFE-001",
    name: "New Customers (30 Days)",
    grain: "Customer",
    description: "Customers acquired in last 30 days",
    category: "Growth",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as new_30day
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE CUSTOMER_ACQUISITION_DATE >= DATEADD(day, -30, CURRENT_DATE())
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers acquired in last 30 days",
    owner: "Growth Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.9,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-LIFE-002",
    name: "Mature Customers (5+ Years)",
    grain: "Customer",
    description: "Number of customers with 5+ year tenure",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as mature_customers
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE DATEDIFF(year, CUSTOMER_ACQUISITION_DATE, CURRENT_DATE()) >= 5
        AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with 5+ year tenure",
    owner: "Retention Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-RET-003"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-LIFE-003",
    name: "At-Risk Customers",
    grain: "Customer",
    description: "Customers showing early churn signals",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as at_risk_count
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_CHURN_SIGNAL
      WHERE CHURN_RISK_SCORE >= 70
        AND SIGNAL_DATE = CURRENT_DATE()
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_CHURN_SIGNAL"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with high churn signals",
    owner: "Retention Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-PER-002"],
    dependencies: ["FCT_CUSTOMER_CHURN_SIGNAL"],
  },
  {
    metricId: "CUST-LIFE-004",
    name: "Win-Back Campaign Targets",
    grain: "Customer",
    description: "Previously churned customers eligible for win-back",
    category: "Growth",
    type: "Tactical",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as winback_targets
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
      WHERE RECORD_STATUS = 'INACTIVE'
        AND IS_CURRENT = FALSE
        AND RECORD_END_DATE >= DATEADD(month, -6, CURRENT_DATE())
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of recently churned customers for win-back",
    owner: "Retention Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-VOL-003"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },

  // ============================================================================
  // CAMPAIGN & MARKETING METRICS
  // ============================================================================
  {
    metricId: "CUST-CAMP-001",
    name: "Campaign Reach",
    grain: "Overall",
    description: "Number of unique customers targeted in current campaigns",
    category: "Growth",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as campaign_reach
      FROM CORE_CUSTOMERS.FCT_CAMPAIGN_RESPONSE
      WHERE CAMPAIGN_START_DATE <= CURRENT_DATE()
        AND CAMPAIGN_END_DATE >= CURRENT_DATE()
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CAMPAIGN_RESPONSE"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of unique customers in active campaigns",
    owner: "Marketing Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_CAMPAIGN_RESPONSE"],
  },
  {
    metricId: "CUST-CAMP-002",
    name: "Campaign Response Rate",
    grain: "Overall",
    description: "Percentage of targeted customers responding to campaigns",
    category: "Growth",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN RESPONSE_TYPE IN ('CLICK', 'PURCHASE', 'INQUIRY') THEN 1 END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as response_rate_pct
      FROM CORE_CUSTOMERS.FCT_CAMPAIGN_RESPONSE
      WHERE CAMPAIGN_MONTH = MONTH(CURRENT_DATE())
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CAMPAIGN_RESPONSE"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Responding customers / Targeted customers * 100",
    owner: "Marketing Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["FCT_CAMPAIGN_RESPONSE"],
  },
  {
    metricId: "CUST-CAMP-003",
    name: "Email Engagement Rate",
    grain: "Overall",
    description: "Percentage of customers opening marketing emails",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT
        ROUND((COUNT(CASE WHEN OPENED = TRUE THEN 1 END) /
                NULLIF(COUNT(DISTINCT CUSTOMER_NUMBER), 0)) * 100, 2) as email_open_rate_pct
      FROM CORE_CUSTOMERS.FCT_EMAIL_ENGAGEMENT
      WHERE SEND_DATE >= DATEADD(month, -1, CURRENT_DATE())
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_EMAIL_ENGAGEMENT"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Opened emails / Sent emails * 100",
    owner: "Marketing Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.0,
      refreshFrequency: "Daily",
    },
    relatedMetrics: ["CUST-CAMP-002"],
    dependencies: ["FCT_EMAIL_ENGAGEMENT"],
  },
  {
    metricId: "CUST-CAMP-004",
    name: "SMS Opt-In Count",
    grain: "Overall",
    description: "Number of customers opted in for SMS marketing",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `
      SELECT
        COUNT(DISTINCT CUSTOMER_NUMBER) as sms_optin_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_PREFERENCES
      WHERE SMS_MARKETING_OPT_IN = TRUE
        AND IS_CURRENT = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_PREFERENCES"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers opted in for SMS",
    owner: "Marketing Analytics",
    sla: {
      maxLatencyHours: 24,
      targetAccuracy: 99.8,
      refreshFrequency: "Daily",
    },
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_PREFERENCES"],
  },
  {
    metricId: "CUST-OTHER-001",
    name: "Customer Relationship Manager Assigned",
    grain: "Overall",
    description: "Customers assigned a dedicated relationship manager",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as rm_assigned FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE RELATIONSHIP_MANAGER_ID IS NOT NULL AND IS_CURRENT = TRUE`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customers with assigned RM",
    owner: "Relationship Management",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.9, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-OTHER-002",
    name: "Call Center Interaction Volume",
    grain: "Overall",
    description: "Total calls to customer service",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CALL_ID) as call_count FROM CORE_CUSTOMERS.FCT_CALL_CENTER WHERE CALL_DATE = CURRENT_DATE()`,
    sourceTables: ["CORE_CUSTOMERS.FCT_CALL_CENTER"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of customer service calls",
    owner: "Customer Service",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.9, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_CALL_CENTER"],
  },
  {
    metricId: "CUST-OTHER-003",
    name: "Average Call Duration",
    grain: "Overall",
    description: "Average length of customer service calls",
    category: "Engagement",
    type: "Operational",
    sqlDefinition: `SELECT ROUND(AVG(CALL_DURATION_SECONDS), 0) as avg_call_sec FROM CORE_CUSTOMERS.FCT_CALL_CENTER WHERE CALL_DATE >= DATEADD(day, -7, CURRENT_DATE())`,
    sourceTables: ["CORE_CUSTOMERS.FCT_CALL_CENTER"],
    granularity: "Weekly",
    aggregationMethod: "AVG",
    dataType: "INTEGER",
    unit: "seconds",
    businessLogic: "Average call duration in seconds",
    owner: "Customer Service",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_CALL_CENTER"],
  },
  {
    metricId: "CUST-OTHER-004",
    name: "Customer Service Issue Resolution Rate",
    grain: "Overall",
    description: "Percentage of service issues resolved on first contact",
    category: "Quality",
    type: "Operational",
    sqlDefinition: `SELECT ROUND((COUNT(CASE WHEN RESOLVED_ON_FIRST_CONTACT = TRUE THEN 1 END) / NULLIF(COUNT(*), 0)) * 100, 2) as resolution_rate FROM CORE_CUSTOMERS.FCT_CALL_CENTER WHERE CALL_DATE >= DATEADD(month, -1, CURRENT_DATE())`,
    sourceTables: ["CORE_CUSTOMERS.FCT_CALL_CENTER"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "First contact resolution rate",
    owner: "Customer Service",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["FCT_CALL_CENTER"],
  },
  {
    metricId: "CUST-OTHER-005",
    name: "Credit Score Distribution",
    grain: "Overall",
    description: "Average credit score of customer base",
    category: "Risk",
    type: "Operational",
    sqlDefinition: `SELECT ROUND(AVG(CREDIT_SCORE), 0) as avg_credit_score FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "INTEGER",
    unit: "score",
    businessLogic: "Average customer credit score",
    owner: "Credit Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-OTHER-006",
    name: "Prime Age Customers",
    grain: "Overall",
    description: "Customers aged 35-55 (prime earning years)",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as prime_age FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE AGE BETWEEN 35 AND 55 AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of prime earning age customers",
    owner: "Market Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-OTHER-007",
    name: "Retired Customers",
    grain: "Overall",
    description: "Customers with retired employment status",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as retired FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE EMPLOYMENT_STATUS = 'RETIRED' AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of retired customers",
    owner: "Wealth Management",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-OTHER-008",
    name: "Government Employee Customers",
    grain: "Overall",
    description: "Customers employed by federal/state government",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as govt_employees FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE EMPLOYER_SECTOR = 'GOVERNMENT' AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of government employee customers",
    owner: "Market Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-OTHER-009",
    name: "Healthcare Professional Count",
    grain: "Overall",
    description: "Customers working in healthcare professions",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as healthcare_prof FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE PROFESSION = 'HEALTHCARE' AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of healthcare professionals",
    owner: "Market Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-OTHER-010",
    name: "Solo Practitioner/Self-Employed",
    grain: "Overall",
    description: "Self-employed and solo practitioners",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as self_employed FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE EMPLOYMENT_TYPE = 'SELF_EMPLOYED' AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of self-employed customers",
    owner: "Business Banking",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-OTHER-011",
    name: "Real Estate Professional Customers",
    grain: "Overall",
    description: "Customers working in real estate",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as realestate_prof FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE PROFESSION = 'REAL_ESTATE' AND IS_CURRENT = TRUE AND RECORD_STATUS = 'ACTIVE'`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of real estate professionals",
    owner: "Market Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-FINAL-001",
    name: "Lawyer/Attorney Customers",
    grain: "Overall",
    description: "Customers in legal profession",
    category: "Segmentation",
    type: "Operational",
    sqlDefinition: `SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as lawyers FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY WHERE PROFESSION = 'LEGAL' AND IS_CURRENT = TRUE`,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Daily",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Count of lawyer/attorney customers",
    owner: "Market Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: [],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-CRIT-001",
    name: "Customer Lifetime Value (Actual)",
    grain: "Customer",
    description: "Actual revenue generated by customer over relationship lifetime",
    category: "Value",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        CUSTOMER_NUMBER,
        SUM(TRANSACTION_AMOUNT) as customer_lifetime_revenue,
        COUNT(DISTINCT TRANSACTION_ID) as transaction_count,
        DATEDIFF(month, MIN(TRANSACTION_DATE), MAX(TRANSACTION_DATE)) as relationship_months
      FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
      WHERE TRANSACTION_STATUS = 'COMPLETED'
      GROUP BY CUSTOMER_NUMBER
      HAVING SUM(TRANSACTION_AMOUNT) > 0
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION", "CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Quarterly",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Total revenue generated per customer across entire lifetime based on transaction history",
    owner: "Customer Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Daily"},
    relatedMetrics: ["CUST-VAL-001", "CUST-PROF-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION", "DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-CRIT-002",
    name: "Churn Risk Score Distribution",
    grain: "Overall",
    description: "Percentage of customers with high churn probability (>70%)",
    category: "Risk",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(CAST(SUM(CASE WHEN CHURN_PROBABILITY_SCORE > 0.70 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT CUSTOMER_NUMBER) * 100, 2) as high_churn_risk_pct
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd
      JOIN CORE_CUSTOMERS.FCT_CUSTOMER_CHURN_SCORE ccs ON dcd.CUSTOMER_NUMBER = ccs.CUSTOMER_NUMBER
      WHERE dcd.RECORD_STATUS = 'ACTIVE'
        AND ccs.CALCULATION_DATE = CURRENT_DATE()
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_CUSTOMERS.FCT_CUSTOMER_CHURN_SCORE"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Percentage of active customers with high churn probability indicating customer retention risk",
    owner: "Risk Management",
    sla: {maxLatencyHours: 12, targetAccuracy: 99.5, refreshFrequency: "Daily"},
    relatedMetrics: ["CUST-RET-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "FCT_CUSTOMER_CHURN_SCORE"],
  },
  {
    metricId: "CUST-CRIT-003",
    name: "Cross-Sell Opportunity Count",
    grain: "Customer",
    description: "Customers eligible for cross-sell based on product gap analysis",
    category: "Engagement",
    type: "Strategic",
    sqlDefinition: `
      SELECT COUNT(DISTINCT dcd.CUSTOMER_NUMBER) as crosssell_eligible_count
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd
      WHERE dcd.RECORD_STATUS = 'ACTIVE'
        AND dcd.IS_CURRENT = TRUE
        AND dcd.PRODUCT_COUNT < 5
        AND dcd.RELATIONSHIP_MONTHS > 12
        AND dcd.CUSTOMER_NUMBER NOT IN (
          SELECT DISTINCT CUSTOMER_NUMBER
          FROM CORE_DEPOSIT.DIM_ACCOUNT
          WHERE ACCOUNT_TYPE IN ('CHECKING', 'SAVINGS', 'INVESTMENT')
          GROUP BY CUSTOMER_NUMBER
          HAVING COUNT(DISTINCT ACCOUNT_TYPE) >= 3
        )
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Weekly",
    aggregationMethod: "COUNT",
    dataType: "INTEGER",
    unit: "count",
    businessLogic: "Number of customers with product gap opportunity and engagement history qualifying them for cross-sell campaigns",
    owner: "Sales Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Weekly"},
    relatedMetrics: ["CUST-ENG-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "DIM_ACCOUNT"],
  },
  {
    metricId: "CUST-CRIT-004",
    name: "Net Promoter Score (NPS)",
    grain: "Overall",
    description: "Customer satisfaction and loyalty measured through NPS",
    category: "Engagement",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(AVG(CASE
          WHEN NPS_SCORE >= 9 THEN 1
          WHEN NPS_SCORE <= 6 THEN -1
          ELSE 0
        END) * 100, 1) as nps_score
      FROM CORE_CUSTOMERS.FCT_CUSTOMER_SATISFACTION_SURVEY
      WHERE SURVEY_DATE >= DATEADD(month, -3, CURRENT_DATE())
        AND SURVEY_COMPLETE_FLAG = TRUE
    `,
    sourceTables: ["CORE_CUSTOMERS.FCT_CUSTOMER_SATISFACTION_SURVEY"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "score",
    businessLogic: "Net Promoter Score calculated from last 3 months of customer satisfaction surveys",
    owner: "Customer Experience",
    sla: {maxLatencyHours: 24, targetAccuracy: 98.0, refreshFrequency: "Weekly"},
    relatedMetrics: ["CUST-ENG-005"],
    dependencies: ["FCT_CUSTOMER_SATISFACTION_SURVEY"],
  },
  {
    metricId: "CUST-CRIT-005",
    name: "Customer Health Score",
    grain: "Customer",
    description: "Composite health indicator combining engagement, balance, and activity metrics",
    category: "Value",
    type: "Tactical",
    sqlDefinition: `
      SELECT
        dcd.CUSTOMER_NUMBER,
        ROUND((
          (CAST(COALESCE(txn_count.transaction_count, 0) AS FLOAT) / 100 * 0.3) +
          (CASE WHEN COALESCE(fdb.current_balance, 0) > 100000 THEN 1.0 ELSE COALESCE(fdb.current_balance, 0) / 100000 END * 0.3) +
          (CASE WHEN dcd.MONTHS_SINCE_LAST_ACTIVITY < 30 THEN 1.0 ELSE 0.3 END * 0.4)
        ) * 100, 2) as health_score
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd
      LEFT JOIN (
        SELECT CUSTOMER_NUMBER, COUNT(DISTINCT TRANSACTION_ID) as transaction_count
        FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
        WHERE TRANSACTION_DATE >= DATEADD(month, -3, CURRENT_DATE())
        GROUP BY CUSTOMER_NUMBER
      ) txn_count ON dcd.CUSTOMER_NUMBER = txn_count.CUSTOMER_NUMBER
      LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb ON dcd.CUSTOMER_NUMBER = fdb.CUSTOMER_NUMBER
      WHERE dcd.RECORD_STATUS = 'ACTIVE'
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION", "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Weekly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "score (0-100)",
    businessLogic: "Composite health score combining transaction activity (30%), deposit balance (30%), and account recency (40%)",
    owner: "Customer Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Weekly"},
    relatedMetrics: ["CUST-ENG-001", "CUST-VAL-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "FCT_DEPOSIT_ACCOUNT_TRANSACTION", "FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-CRIT-006",
    name: "Revenue Per Available Customer",
    grain: "Overall",
    description: "Average revenue generated per active customer",
    category: "Profitability",
    type: "Strategic",
    sqlDefinition: `
      SELECT
        ROUND(SUM(fdat.TRANSACTION_AMOUNT) / COUNT(DISTINCT dcd.CUSTOMER_NUMBER), 2) as revenue_per_customer
      FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd
      LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION fdat ON dcd.CUSTOMER_NUMBER = fdat.CUSTOMER_NUMBER
        AND fdat.TRANSACTION_DATE >= DATEADD(month, -12, CURRENT_DATE())
        AND fdat.TRANSACTION_STATUS = 'COMPLETED'
      WHERE dcd.RECORD_STATUS = 'ACTIVE'
        AND dcd.IS_CURRENT = TRUE
      GROUP BY DATEPART(month, CURRENT_DATE())
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Total annual revenue divided by count of active customers - key profitability metric",
    owner: "Financial Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.5, refreshFrequency: "Monthly"},
    relatedMetrics: ["CUST-PROF-001", "CUST-VAL-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-AGG-001",
    name: "Customer Balance Percentile Distribution",
    grain: "Overall",
    description: "Customer segmentation by balance percentiles (P25, P50, P75, P90, P95)",
    category: "Segmentation",
    type: "Strategic",
    sqlDefinition: `
      WITH customer_balances AS (
        SELECT
          dcd.CUSTOMER_NUMBER,
          SUM(fdb.CURRENT_BALANCE) as total_balance
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd
        LEFT JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON dcd.CUSTOMER_NUMBER = da.CUSTOMER_NUMBER
        LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb ON da.ACCOUNT_NUMBER = fdb.ACCOUNT_NUMBER
        WHERE dcd.RECORD_STATUS = 'ACTIVE'
          AND fdb.BALANCE_DATE = CURRENT_DATE()
        GROUP BY dcd.CUSTOMER_NUMBER
      )
      SELECT
        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_balance), 2) as p25_balance,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_balance), 2) as median_balance,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_balance), 2) as p75_balance,
        ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY total_balance), 2) as p90_balance,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_balance), 2) as p95_balance,
        COUNT(*) as total_customers
      FROM customer_balances
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.DIM_ACCOUNT", "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE"],
    granularity: "Daily",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Percentile-based customer segmentation using PERCENTILE_CONT for balance distribution analysis and tier assignment",
    owner: "Customer Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.5, refreshFrequency: "Daily"},
    relatedMetrics: ["CUST-VAL-001", "CUST-SEG-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "DIM_ACCOUNT", "FCT_DEPOSIT_DAILY_BALANCE"],
  },
  {
    metricId: "CUST-AGG-002",
    name: "Customer Cohort Retention Analysis",
    grain: "Customer",
    description: "Month-over-month retention rates by customer acquisition cohort with cohort age",
    category: "Retention",
    type: "Strategic",
    sqlDefinition: `
      WITH acquisition_cohorts AS (
        SELECT
          CUSTOMER_NUMBER,
          DATE_TRUNC('month', CUSTOMER_ACQUISITION_DATE) as cohort_month,
          DATEDIFF(month, DATE_TRUNC('month', CUSTOMER_ACQUISITION_DATE), CURRENT_DATE()) as cohort_age_months
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE CUSTOMER_ACQUISITION_DATE IS NOT NULL
      ),
      retention_status AS (
        SELECT
          ac.cohort_month,
          ac.cohort_age_months,
          COUNT(DISTINCT ac.CUSTOMER_NUMBER) as cohort_size,
          COUNT(DISTINCT CASE WHEN dcd.RECORD_STATUS = 'ACTIVE' THEN ac.CUSTOMER_NUMBER END) as active_customers,
          ROUND(CAST(COUNT(DISTINCT CASE WHEN dcd.RECORD_STATUS = 'ACTIVE' THEN ac.CUSTOMER_NUMBER END) AS FLOAT) /
                NULLIF(COUNT(DISTINCT ac.CUSTOMER_NUMBER), 0) * 100, 2) as retention_rate
        FROM acquisition_cohorts ac
        LEFT JOIN CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd ON ac.CUSTOMER_NUMBER = dcd.CUSTOMER_NUMBER
        GROUP BY ac.cohort_month, ac.cohort_age_months
      )
      SELECT
        cohort_month,
        cohort_age_months,
        cohort_size,
        active_customers,
        retention_rate,
        ROUND(AVG(retention_rate) OVER (PARTITION BY cohort_age_months), 2) as avg_retention_by_age
      FROM retention_status
      WHERE cohort_age_months <= 24
      ORDER BY cohort_month DESC, cohort_age_months
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Cohort analysis tracking retention rates over time using window functions for average retention by cohort age",
    owner: "Retention Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Weekly"},
    relatedMetrics: ["CUST-RET-001", "CUST-RET-002"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY"],
  },
  {
    metricId: "CUST-AGG-003",
    name: "Customer Lifetime Value Ranking with Running Total",
    grain: "Customer",
    description: "Top customers ranked by CLV with cumulative percentage of total revenue",
    category: "Value",
    type: "Strategic",
    sqlDefinition: `
      WITH customer_revenue AS (
        SELECT
          dcd.CUSTOMER_NUMBER,
          dcd.CUSTOMER_NAME,
          SUM(fdat.TRANSACTION_AMOUNT) as lifetime_revenue,
          COUNT(DISTINCT fdat.TRANSACTION_ID) as transaction_count,
          DATEDIFF(month, dcd.CUSTOMER_ACQUISITION_DATE, CURRENT_DATE()) as tenure_months
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd
        LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION fdat ON dcd.CUSTOMER_NUMBER = fdat.CUSTOMER_NUMBER
        WHERE fdat.TRANSACTION_STATUS = 'COMPLETED'
          AND dcd.RECORD_STATUS = 'ACTIVE'
        GROUP BY dcd.CUSTOMER_NUMBER, dcd.CUSTOMER_NAME, dcd.CUSTOMER_ACQUISITION_DATE
      ),
      ranked_customers AS (
        SELECT
          CUSTOMER_NUMBER,
          CUSTOMER_NAME,
          lifetime_revenue,
          transaction_count,
          tenure_months,
          ROW_NUMBER() OVER (ORDER BY lifetime_revenue DESC) as revenue_rank,
          ROUND(CAST(lifetime_revenue AS FLOAT) / SUM(lifetime_revenue) OVER () * 100, 2) as pct_of_total_revenue,
          ROUND(SUM(lifetime_revenue) OVER (ORDER BY lifetime_revenue DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) /
                SUM(lifetime_revenue) OVER () * 100, 2) as cumulative_revenue_pct
        FROM customer_revenue
      )
      SELECT
        CUSTOMER_NUMBER,
        CUSTOMER_NAME,
        lifetime_revenue,
        transaction_count,
        tenure_months,
        revenue_rank,
        pct_of_total_revenue,
        cumulative_revenue_pct,
        CASE
          WHEN cumulative_revenue_pct <= 20 THEN 'Top 20% - Platinum'
          WHEN cumulative_revenue_pct <= 50 THEN 'Top 50% - Gold'
          WHEN cumulative_revenue_pct <= 80 THEN 'Top 80% - Silver'
          ELSE 'Bronze'
        END as customer_tier
      FROM ranked_customers
      WHERE revenue_rank <= 1000
      ORDER BY revenue_rank
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "SUM",
    dataType: "DECIMAL",
    unit: "currency",
    businessLogic: "Window functions (ROW_NUMBER, SUM OVER) to rank customers by CLV with running total for Pareto analysis and tier assignment",
    owner: "Customer Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.8, refreshFrequency: "Weekly"},
    relatedMetrics: ["CUST-CRIT-001", "CUST-VAL-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-AGG-004",
    name: "Customer Activity Trend - 3-Month Moving Average",
    grain: "Overall",
    description: "Rolling 3-month average of customer transaction activity with trend indicators",
    category: "Engagement",
    type: "Tactical",
    sqlDefinition: `
      WITH monthly_activity AS (
        SELECT
          DATE_TRUNC('month', TRANSACTION_DATE) as activity_month,
          COUNT(DISTINCT CUSTOMER_NUMBER) as active_customers,
          COUNT(DISTINCT TRANSACTION_ID) as total_transactions,
          ROUND(AVG(TRANSACTION_AMOUNT), 2) as avg_transaction_amt
        FROM CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION
        WHERE TRANSACTION_STATUS = 'COMPLETED'
          AND TRANSACTION_DATE >= DATEADD(month, -12, CURRENT_DATE())
        GROUP BY DATE_TRUNC('month', TRANSACTION_DATE)
      ),
      moving_averages AS (
        SELECT
          activity_month,
          active_customers,
          total_transactions,
          avg_transaction_amt,
          ROUND(AVG(active_customers) OVER (ORDER BY activity_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) as ma_3m_customers,
          ROUND(AVG(total_transactions) OVER (ORDER BY activity_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) as ma_3m_transactions,
          ROUND(AVG(avg_transaction_amt) OVER (ORDER BY activity_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) as ma_3m_avg_amt,
          LAG(active_customers, 1) OVER (ORDER BY activity_month) as prev_month_customers
        FROM monthly_activity
      )
      SELECT
        activity_month,
        active_customers,
        total_transactions,
        avg_transaction_amt,
        ma_3m_customers,
        ma_3m_transactions,
        ma_3m_avg_amt,
        ROUND(CAST(active_customers - prev_month_customers AS FLOAT) / NULLIF(prev_month_customers, 0) * 100, 2) as mom_growth_pct,
        CASE
          WHEN active_customers > ma_3m_customers THEN 'Above Trend'
          WHEN active_customers < ma_3m_customers * 0.95 THEN 'Below Trend'
          ELSE 'On Trend'
        END as trend_indicator
      FROM moving_averages
      ORDER BY activity_month DESC
    `,
    sourceTables: ["CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Monthly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "count",
    businessLogic: "Moving average analysis using window functions (AVG OVER, LAG) to identify customer activity trends and month-over-month changes",
    owner: "Customer Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.5, refreshFrequency: "Daily"},
    relatedMetrics: ["CUST-ACT-001", "CUST-ENG-001"],
    dependencies: ["FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-AGG-005",
    name: "Customer RFM Segmentation Score",
    grain: "Customer",
    description: "Recency, Frequency, Monetary (RFM) composite score with quintile rankings",
    category: "Segmentation",
    type: "Strategic",
    sqlDefinition: `
      WITH customer_rfm AS (
        SELECT
          dcd.CUSTOMER_NUMBER,
          DATEDIFF(day, MAX(fdat.TRANSACTION_DATE), CURRENT_DATE()) as recency_days,
          COUNT(DISTINCT fdat.TRANSACTION_ID) as frequency_count,
          ROUND(SUM(fdat.TRANSACTION_AMOUNT), 2) as monetary_value
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY dcd
        LEFT JOIN CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION fdat ON dcd.CUSTOMER_NUMBER = fdat.CUSTOMER_NUMBER
        WHERE dcd.RECORD_STATUS = 'ACTIVE'
          AND fdat.TRANSACTION_STATUS = 'COMPLETED'
          AND fdat.TRANSACTION_DATE >= DATEADD(month, -12, CURRENT_DATE())
        GROUP BY dcd.CUSTOMER_NUMBER
      ),
      rfm_scores AS (
        SELECT
          CUSTOMER_NUMBER,
          recency_days,
          frequency_count,
          monetary_value,
          NTILE(5) OVER (ORDER BY recency_days ASC) as r_score,
          NTILE(5) OVER (ORDER BY frequency_count DESC) as f_score,
          NTILE(5) OVER (ORDER BY monetary_value DESC) as m_score
        FROM customer_rfm
      )
      SELECT
        CUSTOMER_NUMBER,
        recency_days,
        frequency_count,
        monetary_value,
        r_score,
        f_score,
        m_score,
        (r_score + f_score + m_score) as rfm_composite_score,
        CASE
          WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
          WHEN r_score >= 3 AND f_score >= 3 AND m_score >= 3 THEN 'Loyal Customers'
          WHEN r_score >= 4 AND f_score <= 2 THEN 'Recent Customers'
          WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
          WHEN r_score <= 2 AND f_score <= 2 THEN 'Lost'
          ELSE 'Potential'
        END as rfm_segment
      FROM rfm_scores
      ORDER BY rfm_composite_score DESC
    `,
    sourceTables: ["CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY", "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
    granularity: "Weekly",
    aggregationMethod: "AVG",
    dataType: "INTEGER",
    unit: "score",
    businessLogic: "RFM segmentation using NTILE window function to create quintile scores for Recency, Frequency, and Monetary value with composite scoring",
    owner: "Marketing Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.0, refreshFrequency: "Weekly"},
    relatedMetrics: ["CUST-SEG-001", "CUST-VAL-001", "CUST-ENG-001"],
    dependencies: ["DIM_CUSTOMER_DEMOGRAPHY", "FCT_DEPOSIT_ACCOUNT_TRANSACTION"],
  },
  {
    metricId: "CUST-AGG-006",
    name: "Customer Product Affinity Matrix",
    grain: "Segment",
    description: "Cross-product holdings analysis with propensity scores for cross-sell targeting",
    category: "Engagement",
    type: "Tactical",
    sqlDefinition: `
      WITH customer_products AS (
        SELECT
          CUSTOMER_NUMBER,
          CASE
            WHEN ACCOUNT_TYPE IN ('CHECKING', 'SAVINGS') THEN 'DEPOSITS'
            WHEN ACCOUNT_TYPE IN ('AUTO_LOAN', 'PERSONAL_LOAN', 'MORTGAGE') THEN 'LOANS'
            WHEN ACCOUNT_TYPE IN ('CREDIT_CARD') THEN 'CREDIT'
            WHEN ACCOUNT_TYPE IN ('MUTUAL_FUND', 'BROKERAGE', 'RETIREMENT') THEN 'INVESTMENTS'
            ELSE 'OTHER'
          END as product_category,
          COUNT(DISTINCT ACCOUNT_NUMBER) as product_count
        FROM CORE_DEPOSIT.DIM_ACCOUNT
        WHERE IS_ACTIVE = TRUE
        GROUP BY CUSTOMER_NUMBER,
          CASE
            WHEN ACCOUNT_TYPE IN ('CHECKING', 'SAVINGS') THEN 'DEPOSITS'
            WHEN ACCOUNT_TYPE IN ('AUTO_LOAN', 'PERSONAL_LOAN', 'MORTGAGE') THEN 'LOANS'
            WHEN ACCOUNT_TYPE IN ('CREDIT_CARD') THEN 'CREDIT'
            WHEN ACCOUNT_TYPE IN ('MUTUAL_FUND', 'BROKERAGE', 'RETIREMENT') THEN 'INVESTMENTS'
            ELSE 'OTHER'
          END
      ),
      product_matrix AS (
        SELECT
          product_category,
          COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count,
          ROUND(AVG(product_count), 2) as avg_products_per_customer,
          ROUND(CAST(COUNT(DISTINCT CUSTOMER_NUMBER) AS FLOAT) /
                (SELECT COUNT(DISTINCT CUSTOMER_NUMBER) FROM CORE_DEPOSIT.DIM_ACCOUNT WHERE IS_ACTIVE = TRUE) * 100, 2) as penetration_rate
        FROM customer_products
        GROUP BY product_category
      )
      SELECT
        product_category,
        customer_count,
        avg_products_per_customer,
        penetration_rate,
        ROUND(100 - penetration_rate, 2) as cross_sell_opportunity_pct,
        CASE
          WHEN penetration_rate >= 75 THEN 'High Saturation'
          WHEN penetration_rate >= 50 THEN 'Moderate Saturation'
          WHEN penetration_rate >= 25 THEN 'Low Saturation'
          ELSE 'High Opportunity'
        END as market_saturation_level
      FROM product_matrix
      ORDER BY penetration_rate DESC
    `,
    sourceTables: ["CORE_DEPOSIT.DIM_ACCOUNT"],
    granularity: "Weekly",
    aggregationMethod: "AVG",
    dataType: "DECIMAL",
    unit: "percentage",
    businessLogic: "Product affinity analysis using aggregations across product categories to identify cross-sell opportunities and market penetration",
    owner: "Product Analytics",
    sla: {maxLatencyHours: 24, targetAccuracy: 99.5, refreshFrequency: "Weekly"},
    relatedMetrics: ["CUST-CRIT-003", "CUST-PROD-004"],
    dependencies: ["DIM_ACCOUNT"],
  },
];

export const customerGoldMetricsComplete = {
  metrics: customerGoldMetrics,
  totalMetrics: customerGoldMetrics.length,
  categories: {
    Volume: customerGoldMetrics.filter((m) => m.category === "Volume").length,
    Growth: customerGoldMetrics.filter((m) => m.category === "Growth").length,
    Retention: customerGoldMetrics.filter((m) => m.category === "Retention").length,
    Value: customerGoldMetrics.filter((m) => m.category === "Value").length,
    Engagement: customerGoldMetrics.filter((m) => m.category === "Engagement").length,
    Risk: customerGoldMetrics.filter((m) => m.category === "Risk").length,
    Segmentation: customerGoldMetrics.filter((m) => m.category === "Segmentation").length,
    Quality: customerGoldMetrics.filter((m) => m.category === "Quality").length,
    Profitability: customerGoldMetrics.filter((m) => m.category === "Profitability").length,
    Compliance: customerGoldMetrics.filter((m) => m.category === "Compliance").length,
    Lifecycle: customerGoldMetrics.filter((m) => m.category === "Lifecycle").length,
  },
  description: "Customer domain Gold layer metrics derived from actual CORE_CUSTOMERS and CORE_DEPOSIT source tables",
};

export default customerGoldMetricsComplete;
