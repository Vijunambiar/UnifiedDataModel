/**
 * DEPOSITS DOMAIN - GOLD LAYER - DDL SPECIFICATIONS
 *
 * Aggregated analytics layer optimized for deposit analysis
 * Contains AGGREGATE tables for balance analysis and account performance
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
}

export interface GoldTableSpec {
  name: string;
  schema: string;
  type: "FACT" | "DIMENSION" | "AGGREGATE";
  grain: string;
  description: string;
  columns: GoldTableColumn[];
  estimatedRows: number;
  updateFrequency: string;
  primaryKey: string[];
  partitionBy?: string;
  clusterBy?: string[];
}

// ============================================================================
// AGG_ACCOUNT_BALANCE_SUMMARY - Account Balance Summary Aggregate
// ============================================================================
export const aggAccountBalanceSummaryTable: GoldTableSpec = {
  name: "AGG_ACCOUNT_BALANCE_SUMMARY",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account with current balance snapshot and trends",
  description: "Current account balances with 30/60/90 day trends (average, minimum, maximum) for account monitoring",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
  primaryKey: ["ACCOUNT_ID", "PROCESS_DATE"],
  partitionBy: "PROCESS_DATE",
  clusterBy: ["ACCOUNT_ID", "ACCOUNT_TYPE"],
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
    },
    {
      columnName: "AVERAGE_BALANCE_60D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(CURRENT_BALANCE) OVER 60 DAYS",
      businessMeaning: "60-day average daily balance",
      nullable: true,
    },
    {
      columnName: "AVERAGE_BALANCE_90D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(CURRENT_BALANCE) OVER 90 DAYS",
      businessMeaning: "90-day average daily balance",
      nullable: true,
    },
    {
      columnName: "MIN_BALANCE_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MIN(CURRENT_BALANCE) OVER 30 DAYS",
      businessMeaning: "Minimum balance in last 30 days",
      nullable: true,
    },
    {
      columnName: "MAX_BALANCE_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MAX(CURRENT_BALANCE) OVER 30 DAYS",
      businessMeaning: "Maximum balance in last 30 days",
      nullable: true,
    },
    {
      columnName: "BALANCE_VOLATILITY_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "STDDEV(CURRENT_BALANCE) OVER 30 DAYS",
      businessMeaning: "Standard deviation of balance",
      nullable: true,
    },
    {
      columnName: "DAYS_WITH_ZERO_BALANCE_30D",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(CURRENT_BALANCE <= 0) OVER 30 DAYS",
      businessMeaning: "Days with zero or negative balance",
      nullable: true,
    },
  ],
};

// ============================================================================
// AGG_ACCOUNT_MONTHLY_BALANCE - Monthly Balance Aggregate
// ============================================================================
export const aggAccountMonthlyBalanceTable: GoldTableSpec = {
  name: "AGG_ACCOUNT_MONTHLY_BALANCE",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account per month",
  description: "Monthly balance snapshots and averages for trend analysis and reporting",
  estimatedRows: 150000000,
  updateFrequency: "Monthly",
  primaryKey: ["ACCOUNT_ID", "BALANCE_MONTH"],
  partitionBy: "BALANCE_MONTH",
  clusterBy: ["ACCOUNT_ID"],
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
    },
    {
      columnName: "MONTH_END_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_DAILY_BALANCE",
      sourceColumn: "CURRENT_BALANCE",
      businessMeaning: "Balance at end of month",
      nullable: false,
    },
    {
      columnName: "MONTHLY_AVERAGE_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(CURRENT_BALANCE)",
      businessMeaning: "Average daily balance for the month",
      nullable: false,
    },
    {
      columnName: "MONTHLY_MIN_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MIN(CURRENT_BALANCE)",
      businessMeaning: "Minimum balance during the month",
      nullable: true,
    },
    {
      columnName: "MONTHLY_MAX_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MAX(CURRENT_BALANCE)",
      businessMeaning: "Maximum balance during the month",
      nullable: true,
    },
    {
      columnName: "MONTHLY_INTEREST_ACCRUED",
      dataType: "DECIMAL(12,6)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(INTEREST_ACCRUED)",
      businessMeaning: "Total interest accrued during the month",
      nullable: true,
    },
    {
      columnName: "GROWTH_FROM_PRIOR_MONTH_PCT",
      dataType: "DECIMAL(10,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "(CURRENT_MONTH - PRIOR_MONTH) / PRIOR_MONTH * 100",
      businessMeaning: "Percentage growth from prior month",
      nullable: true,
    },
  ],
};

// ============================================================================
// AGG_CD_MATURITY_TRACKING - CD Maturity Tracking Aggregate
// ============================================================================
export const aggCDMaturityTrackingTable: GoldTableSpec = {
  name: "AGG_CD_MATURITY_TRACKING",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per CD account",
  description: "Certificate of Deposit maturity tracking, renewal analysis, and interest projections for retention campaigns",
  estimatedRows: 1000000,
  updateFrequency: "Daily",
  primaryKey: ["ACCOUNT_ID"],
  partitionBy: "MATURITY_MONTH",
  clusterBy: ["ACCOUNT_ID", "MATURITY_DATE"],
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
    },
    {
      columnName: "DAYS_TO_MATURITY",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATEDIFF(day, CURRENT_DATE, MATURITY_DATE)",
      businessMeaning: "Days remaining until maturity",
      nullable: false,
    },
    {
      columnName: "PROJECTED_INTEREST_AT_MATURITY",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "PRINCIPAL_AMOUNT * INTEREST_RATE * TERM_MONTHS / 1200",
      businessMeaning: "Projected interest at maturity",
      nullable: false,
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
      sourceColumn: "CASE WHEN DAYS_TO_MATURITY <= 30 THEN '0-30 DAYS' ELSE '60+ DAYS' END",
      businessMeaning: "Maturity time bucket for campaigns",
      nullable: true,
    },
  ],
};

// ============================================================================
// AGG_ACCOUNT_HEALTH_METRICS - Account Health Metrics Aggregate
// ============================================================================
export const aggAccountHealthMetricsTable: GoldTableSpec = {
  name: "AGG_ACCOUNT_HEALTH_METRICS",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account",
  description: "Account health indicators including overdraft frequency, fee analysis, and balance volatility for risk management",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
  primaryKey: ["ACCOUNT_ID", "PROCESS_DATE"],
  partitionBy: "PROCESS_DATE",
  clusterBy: ["ACCOUNT_ID", "HEALTH_SCORE_BUCKET"],
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
      businessMeaning: "Number of overdraft occurrences",
      nullable: true,
    },
    {
      columnName: "TOTAL_FEES_90D",
      dataType: "DECIMAL(12,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(FEE_AMOUNT) OVER 90 DAYS",
      businessMeaning: "Total fees charged",
      nullable: true,
    },
    {
      columnName: "OVERDRAFT_FEES_90D",
      dataType: "DECIMAL(12,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(FEE_AMOUNT WHERE FEE_TYPE='OVERDRAFT') OVER 90 DAYS",
      businessMeaning: "Overdraft fees",
      nullable: true,
    },
    {
      columnName: "NSF_COUNT_90D",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(NSF_TRANSACTIONS) OVER 90 DAYS",
      businessMeaning: "NSF transaction count",
      nullable: true,
    },
    {
      columnName: "BALANCE_VOLATILITY_SCORE",
      dataType: "DECIMAL(10,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "STDDEV(CURRENT_BALANCE) / AVG(CURRENT_BALANCE) * 100",
      businessMeaning: "Coefficient of variation for balance",
      nullable: true,
    },
    {
      columnName: "HEALTH_SCORE",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CALCULATED SCORE 0-100",
      businessMeaning: "Overall account health score (0-100, higher is better)",
      nullable: true,
    },
    {
      columnName: "HEALTH_SCORE_BUCKET",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CASE WHEN HEALTH_SCORE >= 80 THEN 'EXCELLENT' ELSE 'POOR' END",
      businessMeaning: "Health score category",
      nullable: true,
    },
    {
      columnName: "AT_RISK_FLAG",
      dataType: "BOOLEAN",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "HEALTH_SCORE < 40 OR OVERDRAFT_COUNT_90D > 5",
      businessMeaning: "Flag indicating account is at risk",
      nullable: true,
    },
  ],
};

// ============================================================================
// CUSTOMER_DEPOSIT_AGGR - Shared Cross-Domain Aggregate (referenced)
// ============================================================================
export const customerDepositAggrTable: GoldTableSpec = {
  name: "CUSTOMER_DEPOSIT_AGGR",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer",
  description: "Customer-level deposit aggregation combining demographics, account behavior, and transaction analytics (owned by Customer domain)",
  estimatedRows: 5500000,
  updateFrequency: "Daily",
  primaryKey: ["CUSTOMER_ID", "PROCESS_DATE"],
  partitionBy: "PROCESS_DATE",
  clusterBy: ["CUSTOMER_ID"],
  columns: [
    {
      columnName: "CUSTOMER_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_CUSTOMERS",
      sourceTable: "DIM_CUSTOMER",
      sourceColumn: "CUSTOMER_NUMBER",
      businessMeaning: "Customer identifier",
      nullable: false,
    },
    {
      columnName: "PROCESS_DATE",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "SYSTEM",
      sourceColumn: "CURRENT_DATE",
      businessMeaning: "Processing date",
      nullable: false,
    },
  ],
};

// ============================================================================
// GOLD TABLE CATALOG
// ============================================================================
export const depositsGoldTableCatalog = {
  facts: [], // All fact tables moved to Silver layer
  dimensions: [], // All dimension tables moved to Silver layer
  aggregates: [
    aggAccountBalanceSummaryTable,
    aggAccountMonthlyBalanceTable,
    aggCDMaturityTrackingTable,
    aggAccountHealthMetricsTable,
    customerDepositAggrTable, // Shared cross-domain aggregate
  ],
  totalTables: 5,
  description: "Gold Layer DDL specifications for Deposits domain - Aggregate tables only (facts and dimensions in Silver)",
};

export default depositsGoldTableCatalog;
