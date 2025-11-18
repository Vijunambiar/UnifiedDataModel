/**
 * TRANSACTIONS DOMAIN - GOLD LAYER
 * 
 * Aggregated analytics layer optimized for transaction analysis
 * Focus: Transaction aggregations and behavioral analytics
 * Source: CORE_DEPOSIT (Silver) transaction tables
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
// AGGREGATE TABLE 1: Daily Transaction Summary
// Grain: One row per account per transaction type per day
// ============================================================================

export const aggTransactionDailySummary: GoldTable = {
  name: "AGG_TRANSACTION_DAILY_SUMMARY",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account per transaction type per calendar day",
  description: "Daily aggregated transaction metrics by type and account for operational reporting",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_ID", "TRANSACTION_TYPE"],
  aggregationStrategy: "GROUP BY account_id, transaction_type, transaction_date; SUM(amount), COUNT(*), AVG(amount), MIN(amount), MAX(amount)",
  columns: [
    {
      columnName: "TRANSACTION_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "TRANSACTION_DATE",
      businessMeaning: "Transaction date",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_TYPE",
      dataType: "VARCHAR(50)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "TRANSACTION_CODE",
      businessMeaning: "Transaction type code",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_COUNT",
      dataType: "NUMBER(10,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT TRANSACTION_ID)",
      businessMeaning: "Number of transactions for the day",
      nullable: false,
      aggregationLogic: "COUNT(DISTINCT transaction_id)",
    },
    {
      columnName: "TOTAL_AMOUNT",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT)",
      businessMeaning: "Total transaction amount for the day",
      nullable: false,
      aggregationLogic: "SUM(transaction_amount)",
    },
    {
      columnName: "AVERAGE_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT)",
      businessMeaning: "Average transaction amount",
      nullable: true,
      aggregationLogic: "AVG(transaction_amount)",
    },
    {
      columnName: "MIN_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MIN(TRANSACTION_AMOUNT)",
      businessMeaning: "Minimum transaction amount",
      nullable: true,
      aggregationLogic: "MIN(transaction_amount)",
    },
    {
      columnName: "MAX_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MAX(TRANSACTION_AMOUNT)",
      businessMeaning: "Maximum transaction amount",
      nullable: true,
      aggregationLogic: "MAX(transaction_amount)",
    },
  ],
};

// ============================================================================
// AGGREGATE TABLE 2: Monthly Transaction Summary
// Grain: One row per account per transaction type per month
// ============================================================================

export const aggTransactionMonthlySummary: GoldTable = {
  name: "AGG_TRANSACTION_MONTHLY_SUMMARY",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account per transaction type per month",
  description: "Monthly transaction patterns and trends for strategic analysis",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
  partitionBy: ["TRANSACTION_MONTH"],
  clusterBy: ["ACCOUNT_ID", "TRANSACTION_TYPE"],
  aggregationStrategy: "GROUP BY account_id, transaction_type, month; SUM(amount), COUNT(*), trend analysis",
  columns: [
    {
      columnName: "TRANSACTION_MONTH",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATE_TRUNC('MONTH', TRANSACTION_DATE)",
      businessMeaning: "First day of transaction month",
      nullable: false,
      aggregationLogic: "DATE_TRUNC('MONTH', transaction_date)",
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_TYPE",
      dataType: "VARCHAR(50)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "TRANSACTION_CODE",
      businessMeaning: "Transaction type code",
      nullable: false,
    },
    {
      columnName: "MONTHLY_TRANSACTION_COUNT",
      dataType: "NUMBER(10,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT TRANSACTION_ID)",
      businessMeaning: "Total transactions for the month",
      nullable: false,
      aggregationLogic: "COUNT(DISTINCT transaction_id)",
    },
    {
      columnName: "MONTHLY_TOTAL_AMOUNT",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT)",
      businessMeaning: "Total transaction amount for the month",
      nullable: false,
      aggregationLogic: "SUM(transaction_amount)",
    },
    {
      columnName: "MONTHLY_AVERAGE_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT)",
      businessMeaning: "Average transaction amount for the month",
      nullable: true,
      aggregationLogic: "AVG(transaction_amount)",
    },
    {
      columnName: "GROWTH_FROM_PRIOR_MONTH_PCT",
      dataType: "DECIMAL(10,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "(CURRENT_MONTH - PRIOR_MONTH) / PRIOR_MONTH * 100",
      businessMeaning: "Percentage growth from prior month",
      nullable: true,
      aggregationLogic: "Window function: LAG() for prior month comparison",
    },
  ],
};

// ============================================================================
// AGGREGATE TABLE 3: Customer Transaction Behavior
// Grain: One row per customer
// ============================================================================

export const aggCustomerTransactionBehavior: GoldTable = {
  name: "AGG_CUSTOMER_TRANSACTION_BEHAVIOR",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer with transaction behavior metrics",
  description: "Customer transaction behavior analytics including frequency, volume, channel preference, and fraud metrics",
  estimatedRows: 5500000,
  updateFrequency: "Daily",
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["CUSTOMER_ID"],
  aggregationStrategy: "Customer-level aggregation: transaction volume, frequency, channel analysis, risk metrics",
  columns: [
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
      columnName: "PROCESS_DATE",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "SYSTEM",
      sourceColumn: "CURRENT_DATE",
      businessMeaning: "Processing date of aggregation",
      nullable: false,
    },
    {
      columnName: "TOTAL_TRANSACTIONS_30D",
      dataType: "NUMBER(10,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(*) WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE)",
      businessMeaning: "Total transaction count in last 30 days",
      nullable: true,
      aggregationLogic: "COUNT(*) for last 30 days",
    },
    {
      columnName: "TOTAL_AMOUNT_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT) WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE)",
      businessMeaning: "Total transaction amount in last 30 days",
      nullable: true,
      aggregationLogic: "SUM(transaction_amount) for last 30 days",
    },
    {
      columnName: "AVERAGE_TRANSACTION_AMOUNT_30D",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT) WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE)",
      businessMeaning: "Average transaction amount over last 30 days",
      nullable: true,
      aggregationLogic: "AVG(transaction_amount) for last 30 days",
    },
    {
      columnName: "PRIMARY_TRANSACTION_CHANNEL",
      dataType: "VARCHAR(50)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MODE(TRANSACTION_CHANNEL)",
      businessMeaning: "Most frequently used transaction channel",
      nullable: true,
      aggregationLogic: "MODE(transaction_channel) for last 30 days",
    },
    {
      columnName: "UNIQUE_TRANSACTION_TYPES_30D",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT TRANSACTION_TYPE)",
      businessMeaning: "Number of unique transaction types used",
      nullable: true,
      aggregationLogic: "COUNT(DISTINCT transaction_type)",
    },
  ],
};

// ============================================================================
// DIMENSION TABLE 1: Transaction Type Reference
// Grain: One row per transaction type code
// ============================================================================

export const dimTransactionType: GoldTable = {
  name: "DIM_TRANSACTION_TYPE",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique transaction type code",
  description: "Transaction type dimension mapping codes to business descriptions and categories",
  estimatedRows: 1000,
  updateFrequency: "Monthly",
  aggregationStrategy: "Reference dimension - one record per transaction type code",
  columns: [
    {
      columnName: "TRANSACTION_TYPE_CODE",
      dataType: "VARCHAR(10)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "TRANSACTION_TYPE_MAPPING",
      sourceColumn: "SOURCE_CODE",
      businessMeaning: "FIS transaction type code",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_TYPE_NAME",
      dataType: "VARCHAR(100)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "TRANSACTION_TYPE_MAPPING",
      sourceColumn: "TYPE_NAME",
      businessMeaning: "Transaction type name",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_CATEGORY",
      dataType: "VARCHAR(50)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "TRANSACTION_TYPE_MAPPING",
      sourceColumn: "CATEGORY",
      businessMeaning: "Transaction category (DEPOSIT, WITHDRAWAL, TRANSFER, FEE, INTEREST)",
      nullable: true,
    },
    {
      columnName: "DEBIT_CREDIT_INDICATOR",
      dataType: "VARCHAR(10)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "TRANSACTION_TYPE_MAPPING",
      sourceColumn: "DEBIT_CREDIT",
      businessMeaning: "Debit or Credit indicator",
      nullable: true,
    },
  ],
};

// ============================================================================
// DIMENSION TABLE 2: Transaction Channel Reference
// Grain: One row per transaction channel
// ============================================================================

export const dimTransactionChannel: GoldTable = {
  name: "DIM_TRANSACTION_CHANNEL",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique transaction channel/source",
  description: "Transaction channel dimension mapping channel codes to descriptions (Branch, ATM, Online, Mobile, ACH, Wire)",
  estimatedRows: 100,
  updateFrequency: "Monthly",
  aggregationStrategy: "Reference dimension - one record per transaction channel",
  columns: [
    {
      columnName: "CHANNEL_CODE",
      dataType: "VARCHAR(20)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "CHANNEL_MAPPING",
      sourceColumn: "SOURCE_CODE",
      businessMeaning: "Channel code",
      nullable: false,
    },
    {
      columnName: "CHANNEL_NAME",
      dataType: "VARCHAR(100)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "CHANNEL_MAPPING",
      sourceColumn: "CHANNEL_NAME",
      businessMeaning: "Channel name",
      nullable: false,
    },
    {
      columnName: "CHANNEL_TYPE",
      dataType: "VARCHAR(50)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "CHANNEL_MAPPING",
      sourceColumn: "CHANNEL_TYPE",
      businessMeaning: "Channel type (BRANCH, DIGITAL, ATM, ACH, WIRE)",
      nullable: true,
    },
  ],
};

// ============================================================================
// DIMENSION TABLE 3: Merchant Category Reference
// Grain: One row per MCC code
// ============================================================================

export const dimMerchantCategory: GoldTable = {
  name: "DIM_MERCHANT_CATEGORY",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique merchant category code (MCC)",
  description: "Merchant category dimension mapping MCC codes to business categories for card transaction analysis",
  estimatedRows: 10000,
  updateFrequency: "Monthly",
  aggregationStrategy: "Reference dimension - one record per MCC code",
  columns: [
    {
      columnName: "MCC_CODE",
      dataType: "VARCHAR(10)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "MCC_MAPPING",
      sourceColumn: "MCC_CODE",
      businessMeaning: "Merchant Category Code (MCC)",
      nullable: false,
    },
    {
      columnName: "MCC_DESCRIPTION",
      dataType: "VARCHAR(200)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "MCC_MAPPING",
      sourceColumn: "DESCRIPTION",
      businessMeaning: "MCC description",
      nullable: false,
    },
    {
      columnName: "MCC_CATEGORY",
      dataType: "VARCHAR(100)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "MCC_MAPPING",
      sourceColumn: "CATEGORY",
      businessMeaning: "High-level category (RETAIL, RESTAURANT, TRAVEL, etc.)",
      nullable: true,
    },
  ],
};

// ============================================================================
// EXPORT
// ============================================================================

// Re-export for compatibility - dimensions and aggregates are exported separately
export const transactionsGoldDimensions = [
  dimTransactionType,
  dimTransactionChannel,
  dimMerchantCategory,
];

// Note: For UI purposes, aggregates are exported as part of "facts" array
export const transactionsGoldFacts = [
  aggTransactionDailySummary,
  aggTransactionMonthlySummary,
  aggCustomerTransactionBehavior,
];

export const transactionsGoldLayerComplete = {
  aggregates: [
    aggTransactionDailySummary,
    aggTransactionMonthlySummary,
    aggCustomerTransactionBehavior,
  ],
  dimensions: transactionsGoldDimensions,
  facts: transactionsGoldFacts,
  totalTables: 6,
  totalAggregates: 3,
  totalDimensions: 3,
  totalFacts: 0,
  description: "Transactions domain gold layer - Aggregate tables and reference dimensions for transaction analytics",
};

export default transactionsGoldLayerComplete;
