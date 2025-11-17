/**
 * DEPOSITS DOMAIN - GOLD LAYER
 * 
 * Aggregated analytics layer optimized for BI reporting
 * Complete column specifications, aggregation logic, and grain definitions
 * Source: CORE_DEPOSIT (Silver) tables
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
// FCT_DEPOSIT_DAILY_BALANCE - Daily Balance Fact Table
// Grain: One row per account per day
// Aggregation: Daily snapshots of account balances
// ============================================================================

export const depositDailyBalanceFactTable: GoldTable = {
  name: "FCT_DEPOSIT_DAILY_BALANCE",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per account per day with balance snapshots",
  description: "Daily deposit account balance metrics and calculations at end-of-day",
  estimatedRows: 18250000000,
  updateFrequency: "Daily",
  partitionBy: ["BALANCE_DATE"],
  clusterBy: ["ACCOUNT_ID", "CUSTOMER_ID"],
  aggregationStrategy: "Snapshot of account balances at day-end from silver.deposit_account",
  columns: [
    {
      columnName: "BALANCE_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "PROCESS_DATE",
      businessMeaning: "Date of balance snapshot",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "ACCOUNT_ID",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "CUSTOMER_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "CUSTOMER_ID",
      businessMeaning: "Customer identifier",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_TYPE",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "ACCOUNT_TYPE",
      businessMeaning: "Account type code (CHECKING, SAVINGS, CD, MMDA)",
      nullable: false,
    },
    {
      columnName: "CURRENT_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_balance",
      sourceColumn: "CURRENT_BALANCE",
      businessMeaning: "Current ledger balance as of balance date",
      nullable: false,
    },
    {
      columnName: "AVAILABLE_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_balance",
      sourceColumn: "AVAILABLE_BALANCE",
      businessMeaning: "Available balance after pending items",
      nullable: false,
    },
    {
      columnName: "PENDING_DEBIT_AMOUNT",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_balance",
      sourceColumn: "PENDING_DEBIT_AMOUNT",
      businessMeaning: "Total amount of pending debits",
      nullable: true,
    },
    {
      columnName: "PENDING_CREDIT_AMOUNT",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_balance",
      sourceColumn: "PENDING_CREDIT_AMOUNT",
      businessMeaning: "Total amount of pending credits",
      nullable: true,
    },
    {
      columnName: "INTEREST_ACCRUED_TODAY",
      dataType: "DECIMAL(12,6)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "INTEREST_ACCRUED",
      businessMeaning: "Interest accrued on this balance date",
      nullable: true,
      aggregationLogic: "Sum of daily interest calculations",
    },
    {
      columnName: "INTEREST_ACCRUED_YTD",
      dataType: "DECIMAL(18,6)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "SUM(INTEREST_ACCRUED) OVER (PARTITION BY ACCOUNT_ID ORDER BY BALANCE_DATE ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW WHERE EXTRACT(YEAR FROM BALANCE_DATE) = EXTRACT(YEAR FROM CURRENT_DATE))",
      businessMeaning: "Year-to-date accumulated interest",
      nullable: true,
      aggregationLogic: "Running sum of daily interest within fiscal year",
    },
    {
      columnName: "AVERAGE_BALANCE_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "AVG(CURRENT_BALANCE) OVER (PARTITION BY ACCOUNT_ID ORDER BY BALANCE_DATE ROWS BETWEEN 29 PRECEDING AND CURRENT ROW)",
      businessMeaning: "30-day average daily balance",
      nullable: true,
      aggregationLogic: "Rolling 30-day average of daily balances",
    },
    {
      columnName: "AVERAGE_BALANCE_90D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "AVG(CURRENT_BALANCE) OVER (PARTITION BY ACCOUNT_ID ORDER BY BALANCE_DATE ROWS BETWEEN 89 PRECEDING AND CURRENT ROW)",
      businessMeaning: "90-day average daily balance",
      nullable: true,
      aggregationLogic: "Rolling 90-day average of daily balances",
    },
    {
      columnName: "MAXIMUM_BALANCE_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "MAX(CURRENT_BALANCE) OVER (PARTITION BY ACCOUNT_ID ORDER BY BALANCE_DATE ROWS BETWEEN 29 PRECEDING AND CURRENT ROW)",
      businessMeaning: "30-day maximum balance",
      nullable: true,
      aggregationLogic: "Highest balance in last 30 days",
    },
    {
      columnName: "MINIMUM_BALANCE_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "MIN(CURRENT_BALANCE) OVER (PARTITION BY ACCOUNT_ID ORDER BY BALANCE_DATE ROWS BETWEEN 29 PRECEDING AND CURRENT ROW)",
      businessMeaning: "30-day minimum balance",
      nullable: true,
      aggregationLogic: "Lowest balance in last 30 days",
    },
    {
      columnName: "BALANCE_VARIANCE_FROM_MONTH_AVG_PCT",
      dataType: "DECIMAL(10,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "(CURRENT_BALANCE - AVERAGE_BALANCE_30D) / AVERAGE_BALANCE_30D * 100",
      businessMeaning: "Percentage variance from 30-day average",
      nullable: true,
      aggregationLogic: "Derived from balance metrics",
    },
    {
      columnName: "DAYS_ZERO_BALANCE",
      dataType: "NUMBER(3,0)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "COUNT(CASE WHEN CURRENT_BALANCE <= 0 THEN 1 END) OVER (PARTITION BY ACCOUNT_ID ORDER BY BALANCE_DATE ROWS BETWEEN 29 PRECEDING AND CURRENT ROW)",
      businessMeaning: "Number of days with zero or negative balance in last 30 days",
      nullable: true,
      aggregationLogic: "Count of days with negative/zero balance",
    },
    {
      columnName: "SERVICE_CHARGE_AMOUNT",
      dataType: "DECIMAL(12,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "SERVICE_CHARGE_AMOUNT",
      businessMeaning: "Service charges applied today",
      nullable: true,
    },
  ],
};

// ============================================================================
// FCT_DEPOSIT_ACCOUNT_TRANSACTION - Transaction Fact Table
// Grain: One row per transaction
// Aggregation: Transaction-level detail with minimal aggregation
// ============================================================================

export const depositAccountTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per individual deposit account transaction",
  description: "Individual transaction details for deposit accounts with full detail",
  estimatedRows: 500000000,
  updateFrequency: "Real-time",
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_ID", "CUSTOMER_ID", "TRANSACTION_CODE"],
  aggregationStrategy: "No aggregation - fact table with transaction-level detail",
  columns: [
    {
      columnName: "TRANSACTION_ID",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "TRANSACTION_ID",
      businessMeaning: "Unique transaction identifier",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "CUSTOMER_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "CUSTOMER_ID",
      businessMeaning: "Customer identifier (from account master)",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "TRANSACTION_DATE",
      businessMeaning: "Date transaction occurred",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_TIMESTAMP",
      dataType: "TIMESTAMP_NTZ",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "TRANSACTION_TIMESTAMP",
      businessMeaning: "Precise timestamp of transaction",
      nullable: true,
    },
    {
      columnName: "POST_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "POST_DATE",
      businessMeaning: "Date transaction posted to account",
      nullable: true,
    },
    {
      columnName: "TRANSACTION_CODE",
      dataType: "VARCHAR(10)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "TRANSACTION_CODE",
      businessMeaning: "FIS transaction code",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "TRANSACTION_AMOUNT",
      businessMeaning: "Transaction amount",
      nullable: false,
    },
    {
      columnName: "DEBIT_CREDIT_INDICATOR",
      dataType: "VARCHAR(10)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "CASE WHEN TRANSACTION_TYPE='DEBIT' THEN 'DEBIT' ELSE 'CREDIT' END",
      businessMeaning: "Debit or credit indicator",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_DESCRIPTION",
      dataType: "VARCHAR(200)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "TRANSACTION_DESCRIPTION",
      businessMeaning: "Description of transaction",
      nullable: true,
    },
    {
      columnName: "TRANSACTION_STATUS",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "TRANSACTION_STATUS",
      businessMeaning: "Transaction status (POSTED, PENDING, REVERSED, FAILED)",
      nullable: false,
    },
    {
      columnName: "RUNNING_BALANCE_AFTER_TXN",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(CASE WHEN DEBIT_CREDIT_INDICATOR='CREDIT' THEN TRANSACTION_AMOUNT ELSE -TRANSACTION_AMOUNT END) OVER (PARTITION BY ACCOUNT_ID ORDER BY TRANSACTION_TIMESTAMP)",
      businessMeaning: "Running balance after this transaction",
      nullable: true,
      aggregationLogic: "Cumulative sum of debits/credits by account",
    },
  ],
};

// ============================================================================
// FCT_DEPOSIT_HOLD_TRANSACTION - Hold Transaction Fact Table
// Grain: One row per hold transaction
// Aggregation: Detailed hold tracking with expiration logic
// ============================================================================

export const depositHoldTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_HOLD_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per hold transaction/modification",
  description: "Account holds and restrictions including legal holds, levies, and NSF holds",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
  partitionBy: ["HOLD_ENTRY_DATE"],
  clusterBy: ["ACCOUNT_ID", "HOLD_TYPE"],
  aggregationStrategy: "Detailed hold records with SCD Type 2 tracking for historical hold states",
  columns: [
    {
      columnName: "HOLD_ID",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "hold_transaction_details",
      sourceColumn: "HOLD_ID",
      businessMeaning: "Unique hold identifier",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "hold_transaction_details",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "HOLD_TYPE",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "hold_transaction_details",
      sourceColumn: "HOLD_TYPE",
      businessMeaning: "Hold type (LEGAL, LEVY, NSF, GARNISHMENT, SUSPENSION)",
      nullable: false,
    },
    {
      columnName: "HOLD_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "hold_transaction_details",
      sourceColumn: "HOLD_AMOUNT",
      businessMeaning: "Amount placed on hold",
      nullable: false,
    },
    {
      columnName: "HOLD_REASON",
      dataType: "VARCHAR(200)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "hold_transaction_details",
      sourceColumn: "HOLD_REASON",
      businessMeaning: "Reason for hold placement",
      nullable: true,
    },
    {
      columnName: "HOLD_ENTRY_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "hold_transaction_details",
      sourceColumn: "HOLD_ENTERED_DATE",
      businessMeaning: "Date hold was entered",
      nullable: false,
    },
    {
      columnName: "HOLD_EXPIRATION_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "hold_transaction_details",
      sourceColumn: "HOLD_EXPIRATION_DATE",
      businessMeaning: "Date hold expires (NULL for indefinite holds)",
      nullable: true,
    },
    {
      columnName: "IS_ACTIVE_HOLD",
      dataType: "NUMBER(1,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CASE WHEN HOLD_EXPIRATION_DATE IS NULL OR HOLD_EXPIRATION_DATE >= CURRENT_DATE THEN 1 ELSE 0 END",
      businessMeaning: "Flag indicating if hold is currently active",
      nullable: false,
      aggregationLogic: "Derived from expiration date comparison",
    },
    {
      columnName: "HOLD_DAYS_OUTSTANDING",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATEDIFF(day, HOLD_ENTRY_DATE, CURRENT_DATE)",
      businessMeaning: "Number of days hold has been in place",
      nullable: true,
      aggregationLogic: "Days between entry and current date",
    },
  ],
};

// ============================================================================
// FCT_DEPOSIT_MAINTENANCE_TRANSACTION - Maintenance Transaction Fact Table
// Grain: One row per maintenance event
// Aggregation: Account maintenance and keyword changes
// ============================================================================

export const depositMaintenanceTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per account maintenance event or keyword change",
  description: "Account maintenance and keyword changes with full audit trail",
  estimatedRows: 100000000,
  updateFrequency: "Daily",
  partitionBy: ["MAINTENANCE_DATE"],
  clusterBy: ["ACCOUNT_ID", "MAINTENANCE_CODE"],
  aggregationStrategy: "Detailed maintenance records for audit and compliance tracking",
  columns: [
    {
      columnName: "MAINTENANCE_ID",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "maintenance_log_transaction",
      sourceColumn: "TRANSACTION_ID",
      businessMeaning: "Unique maintenance event identifier",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "maintenance_log_transaction",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "MAINTENANCE_CODE",
      dataType: "VARCHAR(10)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "maintenance_log_transaction",
      sourceColumn: "TRANSACTION_CODE",
      businessMeaning: "Maintenance event code",
      nullable: false,
    },
    {
      columnName: "MAINTENANCE_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "maintenance_log_transaction",
      sourceColumn: "TRANSACTION_DATE",
      businessMeaning: "Date of maintenance event",
      nullable: false,
    },
    {
      columnName: "KEYWORD_NAME",
      dataType: "VARCHAR(100)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "maintenance_log_transaction",
      sourceColumn: "KEYWORD_DESCRIPTION",
      businessMeaning: "Keyword being changed",
      nullable: true,
    },
    {
      columnName: "KEYWORD_OLD_VALUE",
      dataType: "VARCHAR(100)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "maintenance_log_transaction",
      sourceColumn: "KEYWORD_OLD_VALUE",
      businessMeaning: "Previous value of keyword",
      nullable: true,
    },
    {
      columnName: "KEYWORD_NEW_VALUE",
      dataType: "VARCHAR(100)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "maintenance_log_transaction",
      sourceColumn: "KEYWORD_NEW_VALUE",
      businessMeaning: "New value of keyword",
      nullable: true,
    },
  ],
};

// ============================================================================
// FCT_DEPOSIT_CERTIFICATE_TRANSACTION - Certificate Transaction Fact Table
// Grain: One row per certificate transaction
// Aggregation: CD and time deposit transactions with maturity tracking
// ============================================================================

export const depositCertificateTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per certificate of deposit or time deposit transaction",
  description: "Certificate of Deposit (CD) and time deposit transactions with maturity details",
  estimatedRows: 20000000,
  updateFrequency: "Daily",
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_ID", "MATURITY_DATE"],
  aggregationStrategy: "CD transaction detail with maturity and renewal tracking",
  columns: [
    {
      columnName: "CD_TRANSACTION_ID",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "money_transaction",
      sourceColumn: "TRANSACTION_ID",
      businessMeaning: "Unique CD transaction identifier",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "ACCOUNT_ID",
      businessMeaning: "CD account identifier",
      nullable: false,
    },
    {
      columnName: "CD_PRINCIPAL_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "CD_PRINCIPAL_AMOUNT",
      businessMeaning: "Principal amount of CD",
      nullable: false,
    },
    {
      columnName: "CD_INTEREST_RATE",
      dataType: "DECIMAL(8,6)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "INTEREST_RATE",
      businessMeaning: "Annual interest rate percentage",
      nullable: false,
    },
    {
      columnName: "CD_TERM_MONTHS",
      dataType: "NUMBER(3,0)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "TERM_MONTHS",
      businessMeaning: "CD term in months",
      nullable: false,
    },
    {
      columnName: "ISSUE_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "OPEN_DATE",
      businessMeaning: "CD issuance date",
      nullable: false,
    },
    {
      columnName: "MATURITY_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "MATURITY_DATE",
      businessMeaning: "CD maturity date",
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
      aggregationLogic: "Calculated from maturity date",
    },
    {
      columnName: "PROJECTED_INTEREST_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CD_PRINCIPAL_AMOUNT * CD_INTEREST_RATE * CD_TERM_MONTHS / 12",
      businessMeaning: "Projected interest at maturity",
      nullable: false,
      aggregationLogic: "Simple interest calculation",
    },
    {
      columnName: "ACCRUED_INTEREST_TO_DATE",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "account_daily_balance_fact",
      sourceColumn: "INTEREST_ACCRUED_YTD",
      businessMeaning: "Interest accrued to date",
      nullable: true,
    },
  ],
};

// ============================================================================
// FCT_DEPOSIT_STOP_TRANSACTION - Stop Payment Transaction Fact Table
// Grain: One row per stop payment request
// Aggregation: Stop payment detail with expiration logic
// ============================================================================

export const depositStopTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_STOP_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per stop payment request or range",
  description: "Stop payment requests and check stop transactions with detail",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
  partitionBy: ["STOP_ENTERED_DATE"],
  clusterBy: ["ACCOUNT_ID", "STOP_STATUS"],
  aggregationStrategy: "Detailed stop payment records with expiration and compliance tracking",
  columns: [
    {
      columnName: "STOP_PAYMENT_ID",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "stop_payment_details",
      sourceColumn: "STOP_PAYMENT_ID",
      businessMeaning: "Unique stop payment identifier",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "stop_payment_details",
      sourceColumn: "ACCOUNT_NUMBER",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "STOP_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "stop_payment_details",
      sourceColumn: "STOP_AMOUNT",
      businessMeaning: "Amount of stop payment",
      nullable: false,
    },
    {
      columnName: "CHECK_SERIAL_NUMBER",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "stop_payment_details",
      sourceColumn: "CHECK_SERIAL_NUMBER",
      businessMeaning: "Check serial number (if single check)",
      nullable: true,
    },
    {
      columnName: "CHECK_SERIAL_NUMBER_END",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "stop_payment_details",
      sourceColumn: "CHECK_END_SERIAL_NUMBER",
      businessMeaning: "Check range end serial number",
      nullable: true,
    },
    {
      columnName: "STOP_ENTERED_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "stop_payment_details",
      sourceColumn: "STOP_ENTERED_DATE",
      businessMeaning: "Date stop was entered",
      nullable: false,
    },
    {
      columnName: "STOP_EXPIRATION_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "stop_payment_details",
      sourceColumn: "STOP_EXPIRATION_DATE",
      businessMeaning: "Date stop expires",
      nullable: true,
    },
    {
      columnName: "STOP_STATUS",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CASE WHEN STOP_EXPIRATION_DATE IS NULL OR STOP_EXPIRATION_DATE >= CURRENT_DATE THEN 'ACTIVE' ELSE 'EXPIRED' END",
      businessMeaning: "Stop status (ACTIVE or EXPIRED)",
      nullable: false,
      aggregationLogic: "Derived from expiration date",
    },
    {
      columnName: "DAYS_STOP_ACTIVE",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATEDIFF(day, STOP_ENTERED_DATE, COALESCE(STOP_EXPIRATION_DATE, CURRENT_DATE))",
      businessMeaning: "Number of days stop has been or was active",
      nullable: true,
      aggregationLogic: "Days between entry and expiration/current date",
    },
  ],
};

// ============================================================================
// DIM_DEPOSIT - Deposit Account Dimension (SCD Type 2)
// Grain: One row per deposit account version
// Aggregation: Slowly changing dimension tracking account history
// ============================================================================

export const dimDepositTable: GoldTable = {
  name: "DIM_DEPOSIT",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per deposit account version with effective dating (SCD Type 2)",
  description: "Slowly changing dimension for deposit accounts with full history",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
  partitionBy: ["EFFECTIVE_START_DATE"],
  clusterBy: ["ACCOUNT_ID"],
  aggregationStrategy: "SCD Type 2 tracking all account attribute changes with effective dating",
};

// ============================================================================
// DIM_ACCOUNT - Account Dimension (SCD Type 2)
// Grain: One row per account version
// Aggregation: Comprehensive account attributes with history
// ============================================================================

export const dimAccountTable: GoldTable = {
  name: "DIM_ACCOUNT",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per account version with effective dating (SCD Type 2)",
  description: "Account dimension with all account-level attributes and historical versions",
  estimatedRows: 100000000,
  updateFrequency: "Daily",
  partitionBy: ["EFFECTIVE_START_DATE"],
  clusterBy: ["ACCOUNT_ID", "CUSTOMER_ID"],
  aggregationStrategy: "SCD Type 2 tracking account master data and attribute changes",
};

// ============================================================================
// CUSTOMER_DEPOSIT_AGGR - Customer-Deposit Aggregation
// Grain: One row per customer
// Aggregation: Customer-level metrics aggregated from deposit fact tables
// ============================================================================

export const customerDepositAggrTable: GoldTable = {
  name: "CUSTOMER_DEPOSIT_AGGR",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer with consolidated daily deposit metrics",
  description: "Customer-level deposit aggregation combining demographics, account behavior, and transaction analytics",
  estimatedRows: 5500000,
  updateFrequency: "Daily",
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["CUSTOMER_ID"],
  aggregationStrategy: "Customer-level aggregation: COUNT(DISTINCT accounts), SUM(balances), AVG(rates), historical analysis",
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
  description: "Deposits domain gold layer - Comprehensive fact tables, dimensions, and aggregations for deposit analytics",
};

export default depositsGoldLayerComplete;
