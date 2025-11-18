/**
 * TRANSACTIONS DOMAIN - GOLD LAYER - DDL SPECIFICATIONS
 *
 * Aggregated analytics layer optimized for transaction analysis
 * Contains AGGREGATE tables for daily/monthly summaries and customer behavior
 * DIMENSION tables for reference data (transaction types, channels, merchant categories)
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
// AGG_TRANSACTION_DAILY_SUMMARY - Daily Transaction Aggregate
// ============================================================================
export const aggTransactionDailySummaryTable: GoldTableSpec = {
  name: "AGG_TRANSACTION_DAILY_SUMMARY",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account per transaction type per day",
  description: "Daily aggregated transaction metrics by type and account for operational reporting",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
  primaryKey: ["TRANSACTION_DATE", "ACCOUNT_ID", "TRANSACTION_TYPE"],
  partitionBy: "TRANSACTION_DATE",
  clusterBy: ["ACCOUNT_ID", "TRANSACTION_TYPE"],
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
    },
    {
      columnName: "TOTAL_AMOUNT",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT)",
      businessMeaning: "Total transaction amount",
      nullable: false,
    },
    {
      columnName: "AVERAGE_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT)",
      businessMeaning: "Average transaction amount",
      nullable: true,
    },
    {
      columnName: "MIN_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MIN(TRANSACTION_AMOUNT)",
      businessMeaning: "Minimum transaction amount",
      nullable: true,
    },
    {
      columnName: "MAX_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MAX(TRANSACTION_AMOUNT)",
      businessMeaning: "Maximum transaction amount",
      nullable: true,
    },
  ],
};

// ============================================================================
// AGG_TRANSACTION_MONTHLY_SUMMARY - Monthly Transaction Aggregate
// ============================================================================
export const aggTransactionMonthlySummaryTable: GoldTableSpec = {
  name: "AGG_TRANSACTION_MONTHLY_SUMMARY",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account per transaction type per month",
  description: "Monthly transaction patterns and trends for strategic analysis",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
  primaryKey: ["TRANSACTION_MONTH", "ACCOUNT_ID", "TRANSACTION_TYPE"],
  partitionBy: "TRANSACTION_MONTH",
  clusterBy: ["ACCOUNT_ID", "TRANSACTION_TYPE"],
  columns: [
    {
      columnName: "TRANSACTION_MONTH",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATE_TRUNC('MONTH', TRANSACTION_DATE)",
      businessMeaning: "First day of transaction month",
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
      columnName: "MONTHLY_TRANSACTION_COUNT",
      dataType: "NUMBER(10,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT TRANSACTION_ID)",
      businessMeaning: "Total transactions for the month",
      nullable: false,
    },
    {
      columnName: "MONTHLY_TOTAL_AMOUNT",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT)",
      businessMeaning: "Total transaction amount for the month",
      nullable: false,
    },
    {
      columnName: "MONTHLY_AVERAGE_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT)",
      businessMeaning: "Average transaction amount",
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
// AGG_CUSTOMER_TRANSACTION_BEHAVIOR - Customer Behavior Aggregate
// ============================================================================
export const aggCustomerTransactionBehaviorTable: GoldTableSpec = {
  name: "AGG_CUSTOMER_TRANSACTION_BEHAVIOR",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer",
  description: "Customer transaction behavior analytics including frequency, volume, channel preference, and risk metrics",
  estimatedRows: 5500000,
  updateFrequency: "Daily",
  primaryKey: ["CUSTOMER_ID", "PROCESS_DATE"],
  partitionBy: "PROCESS_DATE",
  clusterBy: ["CUSTOMER_ID"],
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
      sourceColumn: "COUNT(*)",
      businessMeaning: "Total transaction count in last 30 days",
      nullable: true,
    },
    {
      columnName: "TOTAL_AMOUNT_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT)",
      businessMeaning: "Total transaction amount in last 30 days",
      nullable: true,
    },
    {
      columnName: "AVERAGE_TRANSACTION_AMOUNT_30D",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT)",
      businessMeaning: "Average transaction amount",
      nullable: true,
    },
    {
      columnName: "PRIMARY_TRANSACTION_CHANNEL",
      dataType: "VARCHAR(50)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MODE(TRANSACTION_CHANNEL)",
      businessMeaning: "Most frequently used channel",
      nullable: true,
    },
    {
      columnName: "UNIQUE_TRANSACTION_TYPES_30D",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT TRANSACTION_TYPE)",
      businessMeaning: "Number of unique transaction types used",
      nullable: true,
    },
  ],
};

// ============================================================================
// DIM_TRANSACTION_TYPE - Transaction Type Reference Dimension
// ============================================================================
export const dimTransactionTypeTable: GoldTableSpec = {
  name: "DIM_TRANSACTION_TYPE",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique transaction type code",
  description: "Transaction type dimension mapping codes to business descriptions and categories",
  estimatedRows: 1000,
  updateFrequency: "Monthly",
  primaryKey: ["TRANSACTION_TYPE_CODE"],
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
// DIM_TRANSACTION_CHANNEL - Transaction Channel Reference Dimension
// ============================================================================
export const dimTransactionChannelTable: GoldTableSpec = {
  name: "DIM_TRANSACTION_CHANNEL",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique transaction channel",
  description: "Transaction channel dimension mapping channel codes to descriptions (Branch, ATM, Online, Mobile, ACH, Wire)",
  estimatedRows: 100,
  updateFrequency: "Monthly",
  primaryKey: ["CHANNEL_CODE"],
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
// DIM_MERCHANT_CATEGORY - Merchant Category Reference Dimension
// ============================================================================
export const dimMerchantCategoryTable: GoldTableSpec = {
  name: "DIM_MERCHANT_CATEGORY",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique MCC code",
  description: "Merchant category dimension mapping MCC codes to business categories for card transaction analysis",
  estimatedRows: 10000,
  updateFrequency: "Monthly",
  primaryKey: ["MCC_CODE"],
  columns: [
    {
      columnName: "MCC_CODE",
      dataType: "VARCHAR(10)",
      sourceSchema: "REFERENCE_DATA",
      sourceTable: "MCC_MAPPING",
      sourceColumn: "MCC_CODE",
      businessMeaning: "Merchant Category Code",
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
// CUSTOMER_TRANSACTION_AGGR - Shared Cross-Domain Aggregate (referenced)
// ============================================================================
export const customerTransactionAggrTable: GoldTableSpec = {
  name: "CUSTOMER_TRANSACTION_AGGR",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer",
  description: "Customer-level aggregation combining transaction metrics with customer behavioral analytics (owned by Customer domain)",
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
export const transactionsGoldTableCatalog = {
  facts: [], // All fact tables moved to Silver layer
  dimensions: [dimTransactionTypeTable, dimTransactionChannelTable, dimMerchantCategoryTable], // Reference dimensions only
  aggregates: [
    aggTransactionDailySummaryTable,
    aggTransactionMonthlySummaryTable,
    aggCustomerTransactionBehaviorTable,
    customerTransactionAggrTable,
  ],
  totalTables: 7,
  description: "Gold Layer DDL specifications for Transactions domain - Aggregates and reference dimensions (detailed facts in Silver)",
};

export default transactionsGoldTableCatalog;
