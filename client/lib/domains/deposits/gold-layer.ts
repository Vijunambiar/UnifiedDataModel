/**
 * DEPOSITS DOMAIN - GOLD LAYER
 * 
 * Aggregated analytics layer optimized for BI reporting
 * Leverages CUSTOMER_DEPOSIT_AGGR and deposit-specific metrics
 * Source: CORE_DEPOSIT (Silver) tables
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
// DEPOSIT ANALYTICS TABLES
// ============================================================================

export const depositDailyBalanceFactTable: GoldTable = {
  name: "FCT_DEPOSIT_DAILY_BALANCE",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per account per day",
  description: "Daily deposit account balance metrics and calculations",
  estimatedRows: 18250000000,
  updateFrequency: "Daily",
};

export const depositAccountTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per transaction",
  description: "Individual transaction details for deposit accounts",
  estimatedRows: 500000000,
  updateFrequency: "Real-time",
};

export const depositHoldTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_HOLD_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per hold transaction",
  description: "Account holds and restrictions (legal, levy, NSF, etc)",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
};

export const depositMaintenanceTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per maintenance event",
  description: "Account maintenance and keyword changes",
  estimatedRows: 100000000,
  updateFrequency: "Daily",
};

export const depositCertificateTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per certificate transaction",
  description: "Certificate of Deposit (CD) and time deposit transactions",
  estimatedRows: 20000000,
  updateFrequency: "Daily",
};

export const depositStopTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_STOP_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per stop payment",
  description: "Stop payment transactions and check stop requests",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
};

export const dimDepositTable: GoldTable = {
  name: "DIM_DEPOSIT",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per deposit account version (SCD2)",
  description: "Slowly changing dimension for deposit accounts",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
};

export const dimAccountTable: GoldTable = {
  name: "DIM_ACCOUNT",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per account version (SCD2)",
  description: "Account dimension with all account-level attributes",
  estimatedRows: 100000000,
  updateFrequency: "Daily",
};

// Aggregated view leveraging customer deposit aggregations
export const customerDepositAggrTable: GoldTable = {
  name: "CUSTOMER_DEPOSIT_AGGR",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer with consolidated deposit metrics",
  description: "Comprehensive customer and deposit aggregation combining demographics, account behavior, and transaction analytics",
  estimatedRows: 5500000,
  updateFrequency: "Daily",
};

export const depositsGoldLayerComplete = {
  facts: [
    depositDailyBalanceFactTable,
    depositAccountTransactionFactTable,
    depositHoldTransactionFactTable,
    depositMaintenanceTransactionFactTable,
    depositCertificateTransactionFactTable,
    depositStopTransactionFactTable,
  ],
  dimensions: [dimDepositTable, dimAccountTable],
  aggregates: [customerDepositAggrTable],
  totalTables: 9,
  description: "Deposits domain gold layer - Aggregated analytics for deposit account activity and metrics",
};

export default depositsGoldLayerComplete;
