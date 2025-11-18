/**
 * DEPOSITS DOMAIN - GOLD LAYER
 * 
 * Aggregated analytics layer optimized for deposit analysis
 * Focus: Balance aggregations and account performance metrics
 * Source: CORE_DEPOSIT (Silver) deposit tables
 */

export interface GoldTableColumn {
  columnName: string;
  dataType: string;
  sourceSchema: string;
  sourceTable: string;
  sourceColumn: string;
  businessMeaning: string;
  nullable: boolean;
  aggregationLogic?: string;
}

export interface GoldTable {
  name: string;
  schema: string;
  type: "FACT" | "DIMENSION" | "AGGREGATE";
  grain: string;
  description: string;
  columns?: GoldTableColumn[];
  estimatedRows: number;
  updateFrequency: string;
  partitionBy?: string[];
  clusterBy?: string[];
  aggregationStrategy?: string;
}

// ============================================================================
// AGGREGATE TABLE 1: Account Balance Summary
// Grain: One row per account with current snapshot
// ============================================================================

export const aggAccountBalanceSummary: GoldTable = {
  name: "AGG_ACCOUNT_BALANCE_SUMMARY",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account with current balance snapshot and trends",
  description: "Current account balances with 30/60/90 day trends (average, minimum, maximum) for account monitoring",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["ACCOUNT_ID", "ACCOUNT_TYPE"],
  aggregationStrategy: "Current snapshot with rolling window calculations for trends",
  columns: [
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_ACCOUNT",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "PROCESS_DATE",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "SYSTEM",
      sourceColumn: "CURRENT_DATE",
      businessMeaning: "Processing date of snapshot",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_TYPE",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_ACCOUNT",
      sourceColumn: "ACCOUNT_TYPE",
      businessMeaning: "Account type (CHECKING, SAVINGS, CD, MMDA)",
      nullable: false,
    },
    {
      columnName: "CURRENT_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_DAILY_BALANCE",
      sourceColumn: "CURRENT_BALANCE",
      businessMeaning: "Current ledger balance",
      nullable: false,
    },
    {
      columnName: "AVAILABLE_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_DAILY_BALANCE",
      sourceColumn: "AVAILABLE_BALANCE",
      businessMeaning: "Available balance after holds",
      nullable: false,
    },
    {
      columnName: "AVERAGE_BALANCE_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(CURRENT_BALANCE) OVER 30 DAYS",
      businessMeaning: "30-day average daily balance",
      nullable: true,
      aggregationLogic: "AVG(current_balance) over last 30 days",
    },
    {
      columnName: "AVERAGE_BALANCE_60D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(CURRENT_BALANCE) OVER 60 DAYS",
      businessMeaning: "60-day average daily balance",
      nullable: true,
      aggregationLogic: "AVG(current_balance) over last 60 days",
    },
    {
      columnName: "AVERAGE_BALANCE_90D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(CURRENT_BALANCE) OVER 90 DAYS",
      businessMeaning: "90-day average daily balance",
      nullable: true,
      aggregationLogic: "AVG(current_balance) over last 90 days",
    },
    {
      columnName: "MIN_BALANCE_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MIN(CURRENT_BALANCE) OVER 30 DAYS",
      businessMeaning: "Minimum balance in last 30 days",
      nullable: true,
      aggregationLogic: "MIN(current_balance) over last 30 days",
    },
    {
      columnName: "MAX_BALANCE_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MAX(CURRENT_BALANCE) OVER 30 DAYS",
      businessMeaning: "Maximum balance in last 30 days",
      nullable: true,
      aggregationLogic: "MAX(current_balance) over last 30 days",
    },
    {
      columnName: "BALANCE_VOLATILITY_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "STDDEV(CURRENT_BALANCE) OVER 30 DAYS",
      businessMeaning: "Standard deviation of balance over 30 days",
      nullable: true,
      aggregationLogic: "STDDEV(current_balance) over last 30 days",
    },
    {
      columnName: "DAYS_WITH_ZERO_BALANCE_30D",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(CURRENT_BALANCE <= 0) OVER 30 DAYS",
      businessMeaning: "Number of days with zero or negative balance in last 30 days",
      nullable: true,
      aggregationLogic: "COUNT days where current_balance <= 0",
    },
  ],
};

// ============================================================================
// AGGREGATE TABLE 2: Account Monthly Balance
// Grain: One row per account per month
// ============================================================================

export const aggAccountMonthlyBalance: GoldTable = {
  name: "AGG_ACCOUNT_MONTHLY_BALANCE",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account per month with monthly balance snapshots",
  description: "Monthly balance snapshots and averages for trend analysis and reporting",
  estimatedRows: 150000000,
  updateFrequency: "Monthly",
  partitionBy: ["BALANCE_MONTH"],
  clusterBy: ["ACCOUNT_ID"],
  aggregationStrategy: "Monthly aggregation: end-of-month balance, monthly average, interest accrued",
  columns: [
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_DAILY_BALANCE",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "BALANCE_MONTH",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATE_TRUNC('MONTH', BALANCE_DATE)",
      businessMeaning: "First day of balance month",
      nullable: false,
      aggregationLogic: "DATE_TRUNC('MONTH', balance_date)",
    },
    {
      columnName: "MONTH_END_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_DAILY_BALANCE",
      sourceColumn: "CURRENT_BALANCE",
      businessMeaning: "Balance at end of month",
      nullable: false,
      aggregationLogic: "LAST_VALUE(current_balance) for the month",
    },
    {
      columnName: "MONTHLY_AVERAGE_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(CURRENT_BALANCE)",
      businessMeaning: "Average daily balance for the month",
      nullable: false,
      aggregationLogic: "AVG(current_balance) for the month",
    },
    {
      columnName: "MONTHLY_MIN_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MIN(CURRENT_BALANCE)",
      businessMeaning: "Minimum balance during the month",
      nullable: true,
      aggregationLogic: "MIN(current_balance) for the month",
    },
    {
      columnName: "MONTHLY_MAX_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MAX(CURRENT_BALANCE)",
      businessMeaning: "Maximum balance during the month",
      nullable: true,
      aggregationLogic: "MAX(current_balance) for the month",
    },
    {
      columnName: "MONTHLY_INTEREST_ACCRUED",
      dataType: "DECIMAL(12,6)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(INTEREST_ACCRUED)",
      businessMeaning: "Total interest accrued during the month",
      nullable: true,
      aggregationLogic: "SUM(interest_accrued) for the month",
    },
    {
      columnName: "GROWTH_FROM_PRIOR_MONTH_PCT",
      dataType: "DECIMAL(10,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "(CURRENT_MONTH - PRIOR_MONTH) / PRIOR_MONTH * 100",
      businessMeaning: "Percentage growth from prior month end balance",
      nullable: true,
      aggregationLogic: "Window function: LAG() for prior month comparison",
    },
  ],
};

// ============================================================================
// AGGREGATE TABLE 3: CD Maturity Tracking
// Grain: One row per CD account
// ============================================================================

export const aggCDMaturityTracking: GoldTable = {
  name: "AGG_CD_MATURITY_TRACKING",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per CD account with maturity tracking and analysis",
  description: "Certificate of Deposit maturity tracking, renewal analysis, and interest projections for retention campaigns",
  estimatedRows: 1000000,
  updateFrequency: "Daily",
  partitionBy: ["MATURITY_MONTH"],
  clusterBy: ["ACCOUNT_ID", "MATURITY_DATE"],
  aggregationStrategy: "CD account aggregation with maturity projections and retention metrics",
  columns: [
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_DEPOSIT",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "CD account identifier",
      nullable: false,
    },
    {
      columnName: "CUSTOMER_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_ACCOUNT",
      sourceColumn: "CUSTOMER_ID",
      businessMeaning: "Customer identifier",
      nullable: false,
    },
    {
      columnName: "PRINCIPAL_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_DEPOSIT",
      sourceColumn: "ACCOUNT_TD_ORIGINAL_BALANCE",
      businessMeaning: "Original CD principal amount",
      nullable: false,
    },
    {
      columnName: "INTEREST_RATE",
      dataType: "DECIMAL(8,6)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_DEPOSIT",
      sourceColumn: "ACCOUNT_INTEREST_RATE",
      businessMeaning: "Annual interest rate percentage",
      nullable: false,
    },
    {
      columnName: "TERM_MONTHS",
      dataType: "NUMBER(3,0)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_DEPOSIT",
      sourceColumn: "ACCOUNT_TD_TERM",
      businessMeaning: "CD term in months",
      nullable: false,
    },
    {
      columnName: "ISSUE_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_DEPOSIT",
      sourceColumn: "ACCOUNT_OPEN_DATE",
      businessMeaning: "CD issuance date",
      nullable: false,
    },
    {
      columnName: "MATURITY_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_DEPOSIT",
      sourceColumn: "ACCOUNT_TD_NEXT_MATURITY_DATE",
      businessMeaning: "CD maturity date",
      nullable: false,
    },
    {
      columnName: "MATURITY_MONTH",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATE_TRUNC('MONTH', MATURITY_DATE)",
      businessMeaning: "First day of maturity month",
      nullable: false,
      aggregationLogic: "DATE_TRUNC('MONTH', maturity_date)",
    },
    {
      columnName: "DAYS_TO_MATURITY",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATEDIFF(day, CURRENT_DATE, MATURITY_DATE)",
      businessMeaning: "Days remaining until maturity",
      nullable: false,
      aggregationLogic: "DATEDIFF(day, current_date, maturity_date)",
    },
    {
      columnName: "PROJECTED_INTEREST_AT_MATURITY",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "PRINCIPAL_AMOUNT * INTEREST_RATE * TERM_MONTHS / 1200",
      businessMeaning: "Projected interest at maturity",
      nullable: false,
      aggregationLogic: "Simple interest calculation",
    },
    {
      columnName: "ACCRUED_INTEREST_TO_DATE",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_DAILY_BALANCE",
      sourceColumn: "INTEREST_ACCRUED_YTD",
      businessMeaning: "Interest accrued to current date",
      nullable: true,
    },
    {
      columnName: "MATURITY_BUCKET",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CASE WHEN DAYS_TO_MATURITY <= 30 THEN '0-30 DAYS' WHEN DAYS_TO_MATURITY <= 60 THEN '31-60 DAYS' ELSE '60+ DAYS' END",
      businessMeaning: "Maturity time bucket for campaigns",
      nullable: true,
      aggregationLogic: "Calculated based on days_to_maturity",
    },
  ],
};

// ============================================================================
// AGGREGATE TABLE 4: Account Health Metrics
// Grain: One row per account
// ============================================================================

export const aggAccountHealthMetrics: GoldTable = {
  name: "AGG_ACCOUNT_HEALTH_METRICS",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account with health indicators",
  description: "Account health indicators including overdraft frequency, fee analysis, and balance volatility for risk management",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["ACCOUNT_ID", "HEALTH_SCORE_BUCKET"],
  aggregationStrategy: "Account health scoring based on overdraft, fees, and balance patterns",
  columns: [
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "DIM_ACCOUNT",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "PROCESS_DATE",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "SYSTEM",
      sourceColumn: "CURRENT_DATE",
      businessMeaning: "Processing date of health assessment",
      nullable: false,
    },
    {
      columnName: "OVERDRAFT_COUNT_90D",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(CURRENT_BALANCE < 0) OVER 90 DAYS",
      businessMeaning: "Number of overdraft occurrences in last 90 days",
      nullable: true,
      aggregationLogic: "COUNT days where current_balance < 0",
    },
    {
      columnName: "TOTAL_FEES_90D",
      dataType: "DECIMAL(12,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(FEE_AMOUNT) OVER 90 DAYS",
      businessMeaning: "Total fees charged in last 90 days",
      nullable: true,
      aggregationLogic: "SUM(fee_amount) from transactions",
    },
    {
      columnName: "OVERDRAFT_FEES_90D",
      dataType: "DECIMAL(12,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(FEE_AMOUNT WHERE FEE_TYPE='OVERDRAFT') OVER 90 DAYS",
      businessMeaning: "Overdraft fees in last 90 days",
      nullable: true,
      aggregationLogic: "SUM(fee_amount) where fee_type='OVERDRAFT'",
    },
    {
      columnName: "NSF_COUNT_90D",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(NSF_TRANSACTIONS) OVER 90 DAYS",
      businessMeaning: "NSF transaction count in last 90 days",
      nullable: true,
      aggregationLogic: "COUNT NSF transactions",
    },
    {
      columnName: "BALANCE_VOLATILITY_SCORE",
      dataType: "DECIMAL(10,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "STDDEV(CURRENT_BALANCE) / AVG(CURRENT_BALANCE) * 100",
      businessMeaning: "Coefficient of variation for balance (0-100)",
      nullable: true,
      aggregationLogic: "STDDEV / AVG * 100",
    },
    {
      columnName: "HEALTH_SCORE",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CALCULATED SCORE 0-100",
      businessMeaning: "Overall account health score (0-100, higher is better)",
      nullable: true,
      aggregationLogic: "Weighted score based on overdrafts, fees, volatility",
    },
    {
      columnName: "HEALTH_SCORE_BUCKET",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CASE WHEN HEALTH_SCORE >= 80 THEN 'EXCELLENT' WHEN HEALTH_SCORE >= 60 THEN 'GOOD' WHEN HEALTH_SCORE >= 40 THEN 'FAIR' ELSE 'POOR' END",
      businessMeaning: "Health score category",
      nullable: true,
      aggregationLogic: "Bucketing based on health_score",
    },
    {
      columnName: "AT_RISK_FLAG",
      dataType: "BOOLEAN",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "HEALTH_SCORE < 40 OR OVERDRAFT_COUNT_90D > 5",
      businessMeaning: "Flag indicating account is at risk",
      nullable: true,
      aggregationLogic: "TRUE if health_score < 40 or excessive overdrafts",
    },
  ],
};

// ============================================================================
// EXPORT
// ============================================================================

// Re-export for compatibility
export const depositsGoldDimensions: GoldTable[] = [];

// Note: For UI purposes, aggregates are exported as part of "facts" array
export const depositsGoldFacts = [
  aggAccountBalanceSummary,
  aggAccountMonthlyBalance,
  aggCDMaturityTracking,
  aggAccountHealthMetrics,
];

export const depositsGoldLayerComplete = {
  aggregates: [
    aggAccountBalanceSummary,
    aggAccountMonthlyBalance,
    aggCDMaturityTracking,
    aggAccountHealthMetrics,
  ],
  dimensions: depositsGoldDimensions,
  facts: depositsGoldFacts,
  totalTables: 4,
  totalAggregates: 4,
  totalDimensions: 0,
  totalFacts: 0,
  description: "Deposits domain gold layer - Aggregate tables for balance analysis and account performance",
};

export default depositsGoldLayerComplete;
