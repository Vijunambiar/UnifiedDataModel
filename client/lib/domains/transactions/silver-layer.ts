/**
 * TRANSACTIONS DOMAIN - SILVER LAYER COMPREHENSIVE DDL
 * 
 * Purpose: Cleansed, enriched, and categorized transaction data with compliance and analytics ready
 * Source: Bronze Layer (FIS transaction and ACH/Wire tables)
 * Layer: Silver (Conformed)
 * Grain: One row per transaction (Type 1), daily aggregations by type, route, counterparty
 * Refresh: Real-time for detail, daily for aggregations
 * 
 * Transformations Applied:
 * - Transaction type standardization and categorization
 * - Amount validation and conversion
 * - Date/time normalization and business day logic
 * - Counterparty identification and enrichment
 * - Compliance screening results
 * - Fraud risk scoring
 * - Route and channel identification
 * - Settlement status tracking
 */

export interface SilverColumnDefinition {
  name: string;
  dataType: string;
  nullable: boolean;
  businessMeaning: string;
  sourceMapping: {
    bronzeTable: string;
    bronzeColumn: string;
    transformation?: string;
  };
  piiClassification?: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  encryptionMethod?: "AES_256" | "TOKENIZATION" | "HASHING" | "NONE";
  validation?: {
    dataType?: string;
    pattern?: string;
    allowedValues?: string[];
    minValue?: number;
    maxValue?: number;
  };
}

export interface SilverTableDefinition {
  name: string;
  schema: string;
  description: string;
  businessKey: string;
  surrogatePrimaryKey: string;
  sourceTables: string[];
  scdType: "Type 1" | "Type 2";
  grain: string;
  partitionBy?: string[];
  clusterBy?: string[];
  columns: SilverColumnDefinition[];
  dataQualityRules?: Array<{
    ruleName: string;
    ruleDescription: string;
    severity: "ERROR" | "WARNING" | "INFO";
    expression: string;
  }>;
}

// ============================================================================
// TABLE 1: TRANSACTION DETAIL - STANDARDIZED & ENRICHED
// ============================================================================

export const transactionDetailSilver: SilverTableDefinition = {
  name: "CORE_TRANSACTIONS.FCT_TRANSACTION_DETAIL",
  schema: "CORE_TRANSACTIONS",
  description: "Complete transaction detail with enrichment, categorization, and compliance data",
  businessKey: "transaction_id",
  surrogatePrimaryKey: "transaction_sk",
  sourceTables: [
    "bronze.money_transaction",
    "bronze.maintenance_log_transaction",
    "bronze.ach_transaction",
    "bronze.wire_transfer_transaction",
  ],
  scdType: "Type 1",
  grain: "One row per unique transaction",
  partitionBy: ["transaction_date"],
  clusterBy: ["account_id", "transaction_date", "transaction_type_standard"],

  dataQualityRules: [
    {
      ruleName: "Null Check - Transaction ID",
      ruleDescription: "Transaction ID must not be null",
      severity: "ERROR",
      expression: "transaction_id IS NOT NULL",
    },
    {
      ruleName: "Amount Validation",
      ruleDescription: "Transaction amount must be positive",
      severity: "ERROR",
      expression: "transaction_amount > 0",
    },
    {
      ruleName: "Debit Credit Balance",
      ruleDescription: "All transactions must have debit_or_credit flag",
      severity: "ERROR",
      expression: "debit_or_credit IN ('D', 'C')",
    },
    {
      ruleName: "Date Validation",
      ruleDescription: "Transaction date should not be in far future",
      severity: "WARNING",
      expression: "transaction_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY)",
    },
    {
      ruleName: "Status Validation",
      ruleDescription: "Transaction status must be valid",
      severity: "ERROR",
      expression: "transaction_status IN ('POSTED', 'PENDING', 'REVERSED', 'FAILED', 'REJECTED')",
    },
  ],

  columns: [
    // ========== SURROGATE KEY ==========
    {
      name: "transaction_sk",
      dataType: "BIGINT",
      nullable: false,
      businessMeaning: "Surrogate key for transaction fact table",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Auto-generated sequence",
      },
    },

    // ========== NATURAL KEYS ==========
    {
      name: "transaction_id",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Unique transaction identifier (core banking system)",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_ID",
        transformation: "1:1 mapping, ensure uniqueness",
      },
    },

    {
      name: "transaction_uuid",
      dataType: "STRING",
      nullable: true,
      businessMeaning: "Global unique identifier for transaction",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Generated for distributed systems",
      },
    },

    // ========== ACCOUNT & PARTY INFORMATION ==========
    {
      name: "account_id",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account on which transaction occurred",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "ACCOUNT_NUMBER",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "customer_id",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Primary account owner (customer ID)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Lookup from account master",
      },
    },

    {
      name: "counterparty_account",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Receiving/Sending account for transfers",
      sourceMapping: {
        bronzeTable: "bronze.ach_transaction",
        bronzeColumn: "ACH_RECEIVING_ACCOUNT",
        transformation: "Tokenized if external",
      },
      piiClassification: "HIGH",
      encryptionMethod: "TOKENIZATION",
    },

    {
      name: "counterparty_name",
      dataType: "VARCHAR(255)",
      nullable: true,
      businessMeaning: "Counterparty name/business",
      sourceMapping: {
        bronzeTable: "bronze.ach_transaction",
        bronzeColumn: "ACH_RECEIVING_ACCOUNT_NAME",
        transformation: "Truncate if > 255 chars",
      },
      piiClassification: "MEDIUM",
    },

    {
      name: "counterparty_type",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Type: INTERNAL, EXTERNAL, BENEFICIARY, ORIGINATOR",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from counterparty attributes",
      },
    },

    {
      name: "counterparty_bank_routing",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Bank routing number for external transfers",
      sourceMapping: {
        bronzeTable: "bronze.ach_transaction",
        bronzeColumn: "ACH_RECEIVING_BANK_ROUTING",
        transformation: "1:1 mapping",
      },
    },

    // ========== TRANSACTION AMOUNTS & CURRENCY ==========
    {
      name: "transaction_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: false,
      businessMeaning: "Transaction amount (positive)",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_AMOUNT",
        transformation: "1:1 mapping, ensure positive",
      },
      validation: {
        minValue: 0,
      },
    },

    {
      name: "debit_or_credit",
      dataType: "VARCHAR(5)",
      nullable: false,
      businessMeaning: "D=Debit (outflow), C=Credit (inflow)",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_TYPE",
        transformation: "Map to D or C",
      },
      validation: {
        allowedValues: ["D", "C"],
      },
    },

    {
      name: "signed_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: false,
      businessMeaning: "Signed amount (negative for debits, positive for credits)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "transaction_amount * CASE WHEN debit_or_credit='D' THEN -1 ELSE 1 END",
      },
    },

    {
      name: "currency_code",
      dataType: "VARCHAR(3)",
      nullable: false,
      businessMeaning: "ISO 4217 currency code (USD, EUR, etc.)",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "N/A",
        transformation: "'USD' (derived from FIS defaults)",
      },
    },

    // ========== TRANSACTION DATES & TIMING ==========
    {
      name: "transaction_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Transaction posting/booking date",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_DATE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "transaction_time",
      dataType: "TIMESTAMP_NTZ",
      nullable: true,
      businessMeaning: "Exact timestamp of transaction execution",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "N/A",
        transformation: "Extracted from source if available, else set to midnight",
      },
    },

    {
      name: "value_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Effective date for funds (may differ from transaction date)",
      sourceMapping: {
        bronzeTable: "bronze.ach_transaction",
        bronzeColumn: "ACH_VALUE_DATE",
        transformation: "1:1 mapping if available",
      },
    },

    {
      name: "settlement_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date when transaction fully settled",
      sourceMapping: {
        bronzeTable: "bronze.ach_transaction",
        bronzeColumn: "ACH_SETTLEMENT_DATE",
        transformation: "1:1 mapping if available",
      },
    },

    {
      name: "business_day_indicator",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether transaction_date is a business day",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Lookup in business calendar",
      },
    },

    // ========== TRANSACTION TYPE & CATEGORIZATION ==========
    {
      name: "transaction_code_source",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Original transaction code from FIS",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_CODE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "transaction_type_standard",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Standard transaction type across all sources",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Map source codes to standard types: CHECK, ACH, WIRE, TRANSFER, ATM, DEPOSIT, etc.",
      },
      validation: {
        allowedValues: [
          "CHECK",
          "ACH",
          "WIRE",
          "TRANSFER",
          "ATM",
          "DEBIT_CARD",
          "DEPOSIT",
          "INTEREST",
          "FEE",
          "ADJUSTMENT",
          "STOP_PAYMENT",
          "HOLD",
          "RELEASE",
          "OTHER",
        ],
      },
    },

    {
      name: "transaction_category",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Business category for analytics: OUTGOING, INCOMING, INTERNAL, MAINTENANCE",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from transaction_type_standard and direction",
      },
    },

    {
      name: "transaction_subtype",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "More granular categorization",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from source codes and enrichment data",
      },
    },

    {
      name: "transaction_channel",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Channel through which transaction was initiated",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "N/A",
        transformation: "Derived from transaction type: TELLER, ATM, ONLINE, MOBILE, ACH, WIRE, etc.",
      },
    },

    // ========== TRANSACTION DESCRIPTION & DETAILS ==========
    {
      name: "transaction_description",
      dataType: "VARCHAR(500)",
      nullable: true,
      businessMeaning: "Description as appears to customer",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_DESCRIPTION",
        transformation: "Trim whitespace, standardize formatting",
      },
    },

    {
      name: "transaction_memo",
      dataType: "VARCHAR(500)",
      nullable: true,
      businessMeaning: "Internal memo or reference number",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "N/A",
        transformation: "Extracted from description if applicable",
      },
    },

    {
      name: "check_number",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Check number (for check transactions)",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "N/A",
        transformation: "Extracted from transaction description or detail records",
      },
    },

    {
      name: "trace_number",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "ACH or Wire trace/reference number",
      sourceMapping: {
        bronzeTable: "bronze.ach_transaction",
        bronzeColumn: "ACH_TRACE_NUMBER",
        transformation: "1:1 mapping",
      },
    },

    // ========== TRANSACTION STATUS & SETTLEMENT ==========
    {
      name: "transaction_status",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Status: POSTED, PENDING, REVERSED, FAILED, REJECTED",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_STATUS",
        transformation: "Map code to status",
      },
      validation: {
        allowedValues: ["POSTED", "PENDING", "REVERSED", "FAILED", "REJECTED"],
      },
    },

    {
      name: "is_posted",
      dataType: "BOOLEAN",
      nullable: false,
      businessMeaning: "Whether transaction has been posted to account",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "TRUE if status = 'POSTED'",
      },
    },

    {
      name: "is_pending",
      dataType: "BOOLEAN",
      nullable: false,
      businessMeaning: "Whether transaction is still pending",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "TRUE if status = 'PENDING'",
      },
    },

    {
      name: "is_reversed",
      dataType: "BOOLEAN",
      nullable: false,
      businessMeaning: "Whether transaction has been reversed",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "TRUE if status = 'REVERSED'",
      },
    },

    {
      name: "original_transaction_id",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Original transaction ID if this is a reversal",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Referenced transaction ID for reversals",
      },
    },

    {
      name: "reversal_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date when transaction was reversed",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Tracked from reversal records",
      },
    },

    // ========== COMPLIANCE & SCREENING ==========
    {
      name: "ofac_screening_status",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "OFAC screening result: PASS, FAIL, HOLD, REVIEW",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Result from compliance screening system",
      },
    },

    {
      name: "aml_alert_flag",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether transaction triggered AML alert",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from monitoring rules",
      },
    },

    {
      name: "high_value_transaction",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether transaction exceeds threshold ($10,000)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "transaction_amount >= 10000",
      },
    },

    {
      name: "ctc_reportable",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether transaction requires CTR reporting (>$10K)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "TRUE if high_value_transaction AND not exempt",
      },
    },

    // ========== FRAUD & RISK SCORING ==========
    {
      name: "fraud_risk_score",
      dataType: "DECIMAL(5, 2)",
      nullable: true,
      businessMeaning: "Fraud risk score (0-100, higher = more risky)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Calculated by fraud detection model",
      },
    },

    {
      name: "fraud_rule_hits",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Number of fraud rules triggered",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Count of matched fraud rules",
      },
    },

    {
      name: "is_suspicious",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether transaction flagged as suspicious",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "fraud_risk_score > 70 OR fraud_rule_hits > 0",
      },
    },

    // ========== BALANCE IMPACT ==========
    {
      name: "balance_before",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Account balance before this transaction",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Calculated from previous day balance + intervening transactions",
      },
    },

    {
      name: "balance_after",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Account balance after this transaction",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "balance_before + signed_amount",
      },
    },

    {
      name: "overdraft_flag",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether transaction caused overdraft",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "balance_after < 0 AND balance_before >= 0",
      },
    },

    // ========== DATA QUALITY & LINEAGE ==========
    {
      name: "data_quality_score",
      dataType: "DECIMAL(5, 2)",
      nullable: true,
      businessMeaning: "Data quality score (0-100)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Based on completeness and validation",
      },
    },

    {
      name: "created_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Record creation timestamp",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP()",
      },
    },

    {
      name: "updated_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Record last update timestamp",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP()",
      },
    },

    {
      name: "source_system",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Source system: FIS, SWIFT, NACHA, etc.",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "N/A",
        transformation: "Derived from transaction type",
      },
    },
  ],
};

// ============================================================================
// TABLE 2: TRANSACTION DAILY AGGREGATES BY TYPE
// ============================================================================

export const transactionDailyAggregatesSilver: SilverTableDefinition = {
  name: "silver.transaction_daily_aggregates",
  schema: "silver",
  description: "Daily transaction aggregates by type, account, and counterparty for reporting",
  businessKey: "account_id",
  surrogatePrimaryKey: "daily_aggregate_sk",
  sourceTables: ["silver.transaction_detail_enriched"],
  scdType: "Type 1",
  grain: "One row per account per transaction type per day",
  partitionBy: ["transaction_date"],
  clusterBy: ["account_id", "transaction_date", "transaction_type_standard"],

  columns: [
    {
      name: "daily_aggregate_sk",
      dataType: "BIGINT",
      nullable: false,
      businessMeaning: "Surrogate key",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Auto-generated",
      },
    },
    {
      name: "account_id",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account identifier",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "account_id",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "transaction_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Transaction date for aggregation",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "transaction_date",
        transformation: "GROUP BY date",
      },
    },
    {
      name: "transaction_type_standard",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Standard transaction type",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "transaction_type_standard",
        transformation: "GROUP BY type",
      },
    },
    {
      name: "total_transactions",
      dataType: "INTEGER",
      nullable: false,
      businessMeaning: "Count of transactions",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "N/A",
        transformation: "COUNT(*)",
      },
    },
    {
      name: "total_debits",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Count of debit transactions",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "debit_or_credit",
        transformation: "COUNT(*) WHERE debit_or_credit = 'D'",
      },
    },
    {
      name: "total_credits",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Count of credit transactions",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "debit_or_credit",
        transformation: "COUNT(*) WHERE debit_or_credit = 'C'",
      },
    },
    {
      name: "total_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: false,
      businessMeaning: "Total signed amount for transactions",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "signed_amount",
        transformation: "SUM(signed_amount)",
      },
    },
    {
      name: "total_debit_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Total debit amount",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "signed_amount",
        transformation: "SUM(ABS(signed_amount)) WHERE debit_or_credit = 'D'",
      },
    },
    {
      name: "total_credit_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Total credit amount",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "signed_amount",
        transformation: "SUM(ABS(signed_amount)) WHERE debit_or_credit = 'C'",
      },
    },
    {
      name: "average_transaction_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Average transaction size",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "transaction_amount",
        transformation: "AVG(transaction_amount)",
      },
    },
    {
      name: "min_transaction_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Minimum transaction amount",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "transaction_amount",
        transformation: "MIN(transaction_amount)",
      },
    },
    {
      name: "max_transaction_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Maximum transaction amount",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "transaction_amount",
        transformation: "MAX(transaction_amount)",
      },
    },
    {
      name: "posted_transaction_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Count of posted transactions",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "is_posted",
        transformation: "COUNT(*) WHERE is_posted = TRUE",
      },
    },
    {
      name: "pending_transaction_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Count of pending transactions",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "is_pending",
        transformation: "COUNT(*) WHERE is_pending = TRUE",
      },
    },
    {
      name: "aml_alerts_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Number of AML alerts triggered",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "aml_alert_flag",
        transformation: "COUNT(*) WHERE aml_alert_flag = TRUE",
      },
    },
    {
      name: "high_risk_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Count of high fraud risk transactions",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "fraud_risk_score",
        transformation: "COUNT(*) WHERE fraud_risk_score > 70",
      },
    },
    {
      name: "created_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Record creation timestamp",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP()",
      },
    },
  ],
};

// ============================================================================
// TABLE 3: TRANSACTION COUNTERPARTY SUMMARY
// ============================================================================

export const transactionCounterpartySummarySilver: SilverTableDefinition = {
  name: "silver.transaction_counterparty_summary",
  schema: "silver",
  description: "Monthly aggregates by counterparty for relationship analysis and compliance",
  businessKey: "account_id",
  surrogatePrimaryKey: "counterparty_summary_sk",
  sourceTables: ["silver.transaction_detail_enriched"],
  scdType: "Type 1",
  grain: "One row per account per counterparty per month",
  partitionBy: ["summary_month"],
  clusterBy: ["account_id", "counterparty_name"],

  columns: [
    {
      name: "counterparty_summary_sk",
      dataType: "BIGINT",
      nullable: false,
      businessMeaning: "Surrogate key",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Auto-generated",
      },
    },
    {
      name: "account_id",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account identifier",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "account_id",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "summary_month",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "First day of month for aggregation",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "transaction_date",
        transformation: "DATE_TRUNC('month', transaction_date)",
      },
    },
    {
      name: "counterparty_name",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Counterparty name/identifier",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "counterparty_name",
        transformation: "GROUP BY counterparty",
      },
    },
    {
      name: "counterparty_type",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Counterparty classification",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "counterparty_type",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "transaction_count",
      dataType: "INTEGER",
      nullable: false,
      businessMeaning: "Total transaction count with counterparty",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "N/A",
        transformation: "COUNT(*)",
      },
    },
    {
      name: "total_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: false,
      businessMeaning: "Total value exchanged with counterparty",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "signed_amount",
        transformation: "SUM(ABS(signed_amount))",
      },
    },
    {
      name: "total_outgoing",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Total outgoing to counterparty",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "signed_amount",
        transformation: "SUM(ABS(signed_amount)) WHERE debit_or_credit='D'",
      },
    },
    {
      name: "total_incoming",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Total incoming from counterparty",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "signed_amount",
        transformation: "SUM(ABS(signed_amount)) WHERE debit_or_credit='C'",
      },
    },
    {
      name: "first_transaction_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "First transaction date with this counterparty",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "transaction_date",
        transformation: "MIN(transaction_date)",
      },
    },
    {
      name: "last_transaction_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Most recent transaction date with counterparty",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "transaction_date",
        transformation: "MAX(transaction_date)",
      },
    },
    {
      name: "aml_alerts_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "AML alerts for this counterparty relationship",
      sourceMapping: {
        bronzeTable: "silver.transaction_detail_enriched",
        bronzeColumn: "aml_alert_flag",
        transformation: "COUNT(*) WHERE aml_alert_flag = TRUE",
      },
    },
    {
      name: "is_new_counterparty",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether this is a new counterparty relationship",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "DATEDIFF(month, first_transaction_date, summary_month) <= 1",
      },
    },
    {
      name: "created_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Record creation timestamp",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP()",
      },
    },
  ],
};

export const transactionsSilverTables = [
  transactionDetailSilver,
  transactionDailyAggregatesSilver,
  transactionCounterpartySummarySilver,
];

export const transactionsSilverLayerComplete = {
  tables: transactionsSilverTables,
  totalTables: transactionsSilverTables.length,
  description:
    "Transactions domain silver layer - standardized and enriched transaction data with compliance data",
  layerPurpose:
    "Comprehensive transaction analytics with categorization, compliance screening, fraud detection, and counterparty analysis",
};

export default transactionsSilverTables;
