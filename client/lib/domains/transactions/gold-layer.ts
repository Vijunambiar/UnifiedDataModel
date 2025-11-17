/**
 * TRANSACTIONS DOMAIN - GOLD LAYER
 * 
 * Aggregated analytics layer optimized for transaction analysis
 * Complete column specifications, aggregation logic, and grain definitions
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
// FCT_DEPOSIT_ACCOUNT_TRANSACTION - Transaction Detail Fact Table
// Grain: One row per transaction
// Aggregation: Minimal - transaction-level detail
// ============================================================================

export const depositAccountTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per individual deposit account transaction",
  description: "All individual deposit account transactions with full detail, cleansed and classified",
  estimatedRows: 500000000,
  updateFrequency: "Real-time",
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_ID", "CUSTOMER_ID", "TRANSACTION_CODE"],
  aggregationStrategy: "No aggregation - fact table with transaction-level detail for granular analysis",
  columns: [
    {
      columnName: "TRANSACTION_ID",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_id",
      businessMeaning: "Unique transaction identifier",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "account_id",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "CUSTOMER_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "customer_id",
      businessMeaning: "Customer identifier",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_date",
      businessMeaning: "Date transaction occurred",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_TIMESTAMP",
      dataType: "TIMESTAMP_NTZ",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_timestamp",
      businessMeaning: "Precise timestamp of transaction",
      nullable: true,
    },
    {
      columnName: "POST_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "post_date",
      businessMeaning: "Date transaction posted to account",
      nullable: true,
    },
    {
      columnName: "TRANSACTION_TYPE",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_type",
      businessMeaning: "Transaction type (DEPOSIT, WITHDRAWAL, TRANSFER, FEE, INTEREST, etc)",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_CODE",
      dataType: "VARCHAR(10)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_code",
      businessMeaning: "FIS transaction code",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_CATEGORY",
      dataType: "VARCHAR(50)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_category",
      businessMeaning: "Business category (Cash, Transfer, Payment, Fee, Interest, etc)",
      nullable: true,
    },
    {
      columnName: "DEBIT_CREDIT_INDICATOR",
      dataType: "VARCHAR(10)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "debit_credit_indicator",
      businessMeaning: "DEBIT or CREDIT indicator",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_amount",
      businessMeaning: "Transaction amount",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_CURRENCY",
      dataType: "VARCHAR(3)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "currency_code",
      businessMeaning: "ISO 4217 currency code",
      nullable: true,
    },
    {
      columnName: "TRANSACTION_CHANNEL",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_channel",
      businessMeaning: "Channel through which transaction occurred (BRANCH, ATM, MOBILE, ONLINE, ACH, etc)",
      nullable: true,
    },
    {
      columnName: "TRANSACTION_STATUS",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_status",
      businessMeaning: "Transaction status (POSTED, PENDING, REVERSED, FAILED)",
      nullable: false,
    },
    {
      columnName: "IS_REVERSAL",
      dataType: "NUMBER(1,0)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "is_reversal",
      businessMeaning: "Flag indicating if transaction is a reversal",
      nullable: false,
    },
    {
      columnName: "IS_DISPUTED",
      dataType: "NUMBER(1,0)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "is_disputed",
      businessMeaning: "Flag indicating if transaction is disputed",
      nullable: true,
    },
    {
      columnName: "FRAUD_SCORE",
      dataType: "DECIMAL(5,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "fraud_score",
      businessMeaning: "Fraud risk score (0-100)",
      nullable: true,
    },
    {
      columnName: "FRAUD_STATUS",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "fraud_status",
      businessMeaning: "Fraud status (CLEAN, FLAGGED, CONFIRMED)",
      nullable: true,
    },
    {
      columnName: "MERCHANT_NAME",
      dataType: "VARCHAR(100)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "merchant_name",
      businessMeaning: "Merchant or counterparty name",
      nullable: true,
    },
    {
      columnName: "MERCHANT_CATEGORY_CODE",
      dataType: "VARCHAR(10)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "mcc_code",
      businessMeaning: "Merchant category code (for card transactions)",
      nullable: true,
    },
    {
      columnName: "REFERENCE_NUMBER",
      dataType: "VARCHAR(50)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "reference_number",
      businessMeaning: "Reference or confirmation number",
      nullable: true,
    },
    {
      columnName: "RUNNING_BALANCE_AFTER_TXN",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(CASE WHEN DEBIT_CREDIT_INDICATOR='CREDIT' THEN TRANSACTION_AMOUNT ELSE -TRANSACTION_AMOUNT END) OVER (PARTITION BY ACCOUNT_ID ORDER BY TRANSACTION_TIMESTAMP)",
      businessMeaning: "Running balance after transaction",
      nullable: true,
      aggregationLogic: "Cumulative sum of debits/credits by account ordered by timestamp",
    },
  ],
};

// ============================================================================
// FCT_DEPOSIT_CERTIFICATE_TRANSACTION - CD Transaction Fact Table
// Grain: One row per CD/time deposit transaction
// Aggregation: Transaction detail for time deposits
// ============================================================================

export const depositCertificateTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per CD or time deposit transaction (issuance, maturity, renewal)",
  description: "Transactions specific to certificate of deposit and time deposit accounts with maturity tracking",
  estimatedRows: 20000000,
  updateFrequency: "Daily",
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_ID", "MATURITY_DATE"],
  aggregationStrategy: "CD transaction detail with maturity and renewal event tracking",
  columns: [
    {
      columnName: "CD_TRANSACTION_ID",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_id",
      businessMeaning: "Unique CD transaction identifier",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "account_id",
      businessMeaning: "CD account identifier",
      nullable: false,
    },
    {
      columnName: "CUSTOMER_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "customer_id",
      businessMeaning: "Customer identifier",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_TYPE",
      dataType: "VARCHAR(30)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_type",
      businessMeaning: "CD transaction type (ISSUE, MATURITY, RENEWAL, EARLY_WITHDRAWAL)",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_date",
      businessMeaning: "Date of CD transaction",
      nullable: false,
    },
    {
      columnName: "CD_PRINCIPAL_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "cd_principal_amount",
      businessMeaning: "Principal amount of CD",
      nullable: false,
    },
    {
      columnName: "CD_INTEREST_RATE",
      dataType: "DECIMAL(8,6)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "interest_rate",
      businessMeaning: "Annual interest rate percentage",
      nullable: false,
    },
    {
      columnName: "CD_TERM_MONTHS",
      dataType: "NUMBER(3,0)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "term_months",
      businessMeaning: "CD term in months",
      nullable: false,
    },
    {
      columnName: "ISSUE_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "open_date",
      businessMeaning: "CD issuance date",
      nullable: false,
    },
    {
      columnName: "MATURITY_DATE",
      dataType: "DATE",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "deposit_account",
      sourceColumn: "maturity_date",
      businessMeaning: "CD maturity date",
      nullable: false,
    },
    {
      columnName: "PROJECTED_INTEREST_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CD_PRINCIPAL_AMOUNT * CD_INTEREST_RATE * CD_TERM_MONTHS / 1200",
      businessMeaning: "Projected interest at maturity",
      nullable: false,
      aggregationLogic: "Simple interest calculation: Principal × Rate × Term / 12 months",
    },
    {
      columnName: "ACCRUED_INTEREST_PAID",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "CORE_DEPOSIT",
      sourceTable: "transaction_fact",
      sourceColumn: "transaction_amount",
      businessMeaning: "Interest paid on maturity",
      nullable: true,
    },
  ],
};

// ============================================================================
// FCT_DEPOSIT_HOLD_TRANSACTION - Hold Transaction Fact Table
// Grain: One row per hold transaction
// Aggregation: Detailed hold tracking
// ============================================================================

export const depositHoldTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_HOLD_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per hold transaction or hold modification event",
  description: "Account holds and restrictions including legal holds, levies, NSF holds, and garnishments",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
  partitionBy: ["HOLD_ENTRY_DATE"],
  clusterBy: ["ACCOUNT_ID", "HOLD_TYPE"],
  aggregationStrategy: "Detailed hold records with status tracking for compliance and audit",
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
      businessMeaning: "Hold type (LEGAL, LEVY, NSF, GARNISHMENT, SUSPENSION, OTHER)",
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
      businessMeaning: "Date hold was entered into system",
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
      aggregationLogic: "Derived from expiration date comparison with current date",
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
  description: "Account maintenance transactions including keyword changes and service modifications with audit trail",
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
// FCT_DEPOSIT_STOP_TRANSACTION - Stop Payment Transaction Fact Table
// Grain: One row per stop payment request
// Aggregation: Stop payment tracking with expiration
// ============================================================================

export const depositStopTransactionFactTable: GoldTable = {
  name: "FCT_DEPOSIT_STOP_TRANSACTION",
  schema: "ANALYTICS",
  type: "FACT",
  grain: "One row per stop payment request or check range",
  description: "Stop payment requests and check stop transactions with compliance and expiration tracking",
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
      businessMeaning: "Check range end serial number (if range)",
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
      aggregationLogic: "Derived from expiration date comparison",
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
// DIM_TRANSACTION_TYPE - Transaction Type Dimension
// Grain: One row per transaction type code
// Aggregation: Reference data
// ============================================================================

export const dimTransactionTypeTable: GoldTable = {
  name: "DIM_TRANSACTION_TYPE",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique transaction type code",
  description: "Transaction type dimension mapping codes to business descriptions and categories",
  estimatedRows: 1000,
  updateFrequency: "Monthly",
  aggregationStrategy: "Reference dimension - one record per transaction type code",
};

// ============================================================================
// DIM_TRANSACTION_SOURCE - Transaction Source/Channel Dimension
// Grain: One row per transaction source
// Aggregation: Reference data
// ============================================================================

export const dimTransactionSourceTable: GoldTable = {
  name: "DIM_TRANSACTION_SOURCE",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique transaction source/channel",
  description: "Transaction source dimension mapping channel codes to descriptions (branch, ATM, online, mobile, ACH, Wire, etc)",
  estimatedRows: 100,
  updateFrequency: "Monthly",
  aggregationStrategy: "Reference dimension - one record per transaction channel/source",
};

// ============================================================================
// DIM_MERCHANT_CATEGORY - Merchant Category Dimension
// Grain: One row per merchant category
// Aggregation: Reference data
// ============================================================================

export const dimMerchantCategoryTable: GoldTable = {
  name: "DIM_MERCHANT_CATEGORY",
  schema: "ANALYTICS",
  type: "DIMENSION",
  grain: "One row per unique merchant category code",
  description: "Merchant category dimension mapping MCC codes to business categories",
  estimatedRows: 10000,
  updateFrequency: "Monthly",
  aggregationStrategy: "Reference dimension - one record per MCC category",
};

// ============================================================================
// FCT_TRANSACTION_DAILY_AGGREGATE - Daily Transaction Aggregate
// Grain: One row per account per transaction type per day
// Aggregation: Daily aggregation by type
// ============================================================================

export const transactionsDailyAggregateTable: GoldTable = {
  name: "FCT_TRANSACTION_DAILY_AGGREGATE",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per account per transaction type per calendar day",
  description: "Daily aggregated transaction metrics by type and account for reporting and analytics",
  estimatedRows: 50000000,
  updateFrequency: "Daily",
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_ID", "TRANSACTION_TYPE"],
  aggregationStrategy: "Aggregation: GROUP BY account_id, transaction_type, transaction_date; SUM(amount), COUNT(transactions), AVG(amount)",
  columns: [
    {
      columnName: "TRANSACTION_DATE",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "TRANSACTION_DATE",
      businessMeaning: "Date of transactions",
      nullable: false,
    },
    {
      columnName: "ACCOUNT_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "ACCOUNT_ID",
      businessMeaning: "Account identifier",
      nullable: false,
    },
    {
      columnName: "TRANSACTION_TYPE",
      dataType: "VARCHAR(30)",
      sourceSchema: "ANALYTICS",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "TRANSACTION_TYPE",
      businessMeaning: "Transaction type",
      nullable: false,
    },
    {
      columnName: "TOTAL_TRANSACTION_AMOUNT",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT)",
      businessMeaning: "Total transaction amount for the day and type",
      nullable: false,
      aggregationLogic: "SUM(transaction_amount) GROUP BY account_id, transaction_type, transaction_date",
    },
    {
      columnName: "TRANSACTION_COUNT",
      dataType: "NUMBER(10,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT TRANSACTION_ID)",
      businessMeaning: "Number of transactions for the day and type",
      nullable: false,
      aggregationLogic: "COUNT(DISTINCT transaction_id) GROUP BY account_id, transaction_type, transaction_date",
    },
    {
      columnName: "AVERAGE_TRANSACTION_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT)",
      businessMeaning: "Average transaction amount",
      nullable: true,
      aggregationLogic: "AVG(transaction_amount) GROUP BY account_id, transaction_type, transaction_date",
    },
  ],
};

// ============================================================================
// FCT_TRANSACTION_CUSTOMER_AGGREGATE - Customer Transaction Aggregate
// Grain: One row per customer
// Aggregation: Customer-level aggregation
// ============================================================================

export const transactionCustomerAggregateTable: GoldTable = {
  name: "FCT_TRANSACTION_CUSTOMER_AGGREGATE",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer with daily transaction summary",
  description: "Customer-level transaction summary including frequency, volume, patterns, and behavioral metrics",
  estimatedRows: 10000000,
  updateFrequency: "Daily",
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["CUSTOMER_ID"],
  aggregationStrategy: "Aggregation: GROUP BY customer_id; SUM(all_transactions), COUNT(transaction_types), AVG(frequency), behavior analysis",
  columns: [
    {
      columnName: "PROCESS_DATE",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "TRANSACTION_DATE",
      businessMeaning: "Processing date of aggregation",
      nullable: false,
    },
    {
      columnName: "CUSTOMER_ID",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      sourceColumn: "CUSTOMER_ID",
      businessMeaning: "Customer identifier",
      nullable: false,
    },
    {
      columnName: "TOTAL_TRANSACTION_AMOUNT_TODAY",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT) WHERE TRANSACTION_DATE = CURRENT_DATE",
      businessMeaning: "Total transaction amount today",
      nullable: true,
      aggregationLogic: "SUM(transaction_amount) WHERE transaction_date = current_date",
    },
    {
      columnName: "TRANSACTION_COUNT_TODAY",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT TRANSACTION_ID) WHERE TRANSACTION_DATE = CURRENT_DATE",
      businessMeaning: "Number of transactions today",
      nullable: true,
      aggregationLogic: "COUNT(DISTINCT transaction_id) WHERE transaction_date = current_date",
    },
    {
      columnName: "TOTAL_TRANSACTION_AMOUNT_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT) WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE)",
      businessMeaning: "Total transaction amount in last 30 days",
      nullable: true,
      aggregationLogic: "SUM(transaction_amount) last 30 days",
    },
    {
      columnName: "TRANSACTION_COUNT_30D",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT TRANSACTION_ID) WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE)",
      businessMeaning: "Number of transactions in last 30 days",
      nullable: true,
      aggregationLogic: "COUNT(DISTINCT transaction_id) last 30 days",
    },
    {
      columnName: "AVERAGE_TRANSACTION_AMOUNT_30D",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT) WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE)",
      businessMeaning: "Average transaction amount over 30 days",
      nullable: true,
      aggregationLogic: "AVG(transaction_amount) last 30 days",
    },
    {
      columnName: "PRIMARY_TRANSACTION_CHANNEL",
      dataType: "VARCHAR(30)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MODE(TRANSACTION_CHANNEL) WITHIN GROUP (ORDER BY COUNT(*)) WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE)",
      businessMeaning: "Most-used transaction channel in last 30 days",
      nullable: true,
      aggregationLogic: "MODE(transaction_channel) last 30 days",
    },
    {
      columnName: "FRAUD_FLAGGED_COUNT_30D",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(CASE WHEN FRAUD_STATUS='FLAGGED' THEN 1 END) WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE)",
      businessMeaning: "Count of fraud-flagged transactions in last 30 days",
      nullable: true,
      aggregationLogic: "COUNT(CASE WHEN fraud_status='FLAGGED') last 30 days",
    },
  ],
};

// ============================================================================
// CUSTOMER_DEPOSIT_AGGR - Customer-Level Aggregate (referenced from Deposits)
// Grain: One row per customer
// Aggregation: Full customer aggregation
// ============================================================================

export const customerDepositAggrTable: GoldTable = {
  name: "CUSTOMER_DEPOSIT_AGGR",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer with consolidated transaction and deposit metrics",
  description: "Customer-level aggregation combining transaction metrics with deposit behavioral analytics",
  estimatedRows: 5500000,
  updateFrequency: "Daily",
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["CUSTOMER_ID"],
  aggregationStrategy: "Customer aggregation: SUM(all balances), COUNT(accounts), AVG(transaction_frequency), behavioral analysis",
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
  description: "Transactions domain gold layer - Comprehensive transaction fact tables, dimensions, and aggregations for advanced analytics",
};

export default transactionsGoldLayerComplete;
