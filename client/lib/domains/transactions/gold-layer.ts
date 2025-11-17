/**
 * TRANSACTIONS DOMAIN - GOLD LAYER
 * 
 * Aggregated analytics layer optimized for transaction analysis
 * Provides comprehensive transaction metrics and patterns
 * Source: CORE_DEPOSIT (Silver) transaction fact tables
 */

export interface GoldTable {
  name: string;
  schema: string;
  type: "FACT" | "DIMENSION" | "AGGREGATE";
  grain: string;
  description: string;
  estimatedRows: number;
  updateFrequency: string;
}

// ============================================================================
// TRANSACTION ANALYTICS TABLES
// ============================================================================

export const depositAccountTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per individual transaction",
  description: "All individual deposit account transactions with full detail",
  estimatedRows: 500000000,
  updateFrequency: "Real-time",
};

export const depositCertificateTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per CD/time deposit transaction",
  description: "Transactions specific to certificate of deposit and time deposit accounts",
  estimatedRows: 20000000,
  updateFrequency: "Daily",
};

export const depositHoldTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_HOLD_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per hold transaction",
  description: "Account holds and restrictions including legal holds, levies, and NSF holds",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
};

export const depositMaintenanceTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per maintenance transaction",
  description: "Account maintenance transactions including keyword changes and service modifications",
  estimatedRows: 100000000,
  updateFrequency: "Daily",
};

export const depositStopTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_STOP_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per stop payment request",
  description: "Stop payment requests including individual and range stops",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
};

export const dimTransactionTypeTable: GoldTable = {
  name: "DIM_TRANSACTION_TYPE",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per transaction type code",
  description: "Transaction type dimension mapping codes to descriptions",
  estimatedRows: 1000,
  updateFrequency: "Monthly",
};

export const dimTransactionSourceTable: GoldTable = {
  name: "DIM_TRANSACTION_SOURCE",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per transaction source/channel",
  description: "Transaction source dimension (branch, ATM, online, mobile, ACH, etc)",
  estimatedRows: 100,
  updateFrequency: "Monthly",
};

export const dimMerchantCategoryTable: GoldTable = {
  name: "DIM_MERCHANT_CATEGORY",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per merchant category",
  description: "Merchant category dimension for transaction classification",
  estimatedRows: 10000,
  updateFrequency: "Monthly",
};

// Aggregated view leveraging customer transaction aggregations
export const customerDepositAggrTable: GoldTable = {
  name: "CUSTOMER_DEPOSIT_AGGR",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer with consolidated metrics",
  description: "Customer-level aggregation including transaction metrics and behavioral analytics",
  estimatedRows: 5500000,
  updateFrequency: "Daily",
};

export const transactionsDailyAggregateTable: GoldTable = {
  name: "FCT_TRANSACTION_DAILY_AGGREGATE",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account per transaction type per day",
  description: "Daily aggregated transaction metrics by type and account",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
};

export const transactionCustomerAggregateTable: GoldTable = {
  name: "FCT_TRANSACTION_CUSTOMER_AGGREGATE",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer with transaction history",
  description: "Customer-level transaction summary including frequency, volume, and patterns",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
};

export const transactionsGoldLayerComplete = {
  facts: [
    depositAccountTransactionFactTable,
    depositCertificateTransactionFactTable,
    depositHoldTransactionFactTable,
    depositMaintenanceTransactionFactTable,
    depositStopTransactionFactTable,
  ],
  dimensions: [
    dimTransactionTypeTable,
    dimTransactionSourceTable,
    dimMerchantCategoryTable,
  ],
  aggregates: [
    customerDepositAggrTable,
    transactionsDailyAggregateTable,
    transactionCustomerAggregateTable,
  ],
  totalTables: 11,
  description: "Transactions domain gold layer - Comprehensive transaction analytics including individual transactions, aggregates, and behavioral metrics",
};

export default transactionsGoldLayerComplete;
