/**
 * DEPOSITS DOMAIN - SILVER LAYER COMPREHENSIVE DDL
 * 
 * Purpose: Cleansed, standardized deposit account data with balances, transactions, and compliance
 * Source: Bronze Layer (FIS deposit tables)
 * Layer: Silver (Conformed)
 * Grain: One row per account per effective date (SCD2) or per date for balances
 * Refresh: Daily for master, Real-time for transaction rollups
 * 
 * Transformations Applied:
 * - Account number standardization and validation
 * - Balance validation and reconciliation
 * - Interest rate and fee standardization
 * - Date validation and normalization
 * - Derived calculations (available balance, interest accrual)
 * - Data type conversion and validation
 * - Null value handling
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
// TABLE 1: DEPOSIT ACCOUNT MASTER GOLDEN RECORD
// ============================================================================

export const depositAccountMasterSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.DIM_DEPOSIT",
  schema: "CORE_DEPOSIT",
  description: "Golden deposit account record with SCD Type 2 history",
  businessKey: "account_id",
  surrogatePrimaryKey: "account_sk",
  sourceTables: ["bronze.deposit_account_master"],
  scdType: "Type 2",
  grain: "One row per account per effective date",
  partitionBy: ["effective_date"],
  clusterBy: ["account_id", "is_current"],

  dataQualityRules: [
    {
      ruleName: "Null Check - Account ID",
      ruleDescription: "Account ID must not be null",
      severity: "ERROR",
      expression: "account_id IS NOT NULL",
    },
    {
      ruleName: "Uniqueness - Account ID",
      ruleDescription: "Account ID must be unique per effective date",
      severity: "ERROR",
      expression: "COUNT(DISTINCT account_id) = COUNT(*) WHERE is_current = TRUE",
    },
    {
      ruleName: "Date Validation - Account Open Date",
      ruleDescription: "Account open date must be <= today",
      severity: "ERROR",
      expression: "account_open_date <= CURRENT_DATE()",
    },
    {
      ruleName: "Date Validation - Account Close Date",
      ruleDescription: "If account closed, close date must be >= open date",
      severity: "ERROR",
      expression: "account_close_date IS NULL OR account_close_date >= account_open_date",
    },
    {
      ruleName: "Interest Rate Validation",
      ruleDescription: "Interest rate must be between 0 and 10 percent",
      severity: "WARNING",
      expression: "interest_rate_current IS NULL OR (interest_rate_current >= 0 AND interest_rate_current <= 10)",
    },
    {
      ruleName: "Status Validation",
      ruleDescription: "Account status must be one of allowed values",
      severity: "ERROR",
      expression: "account_status IN ('ACTIVE', 'INACTIVE', 'DORMANT', 'CLOSED')",
    },
  ],

  columns: [
    // ========== SURROGATE KEY ==========
    {
      name: "account_sk",
      dataType: "BIGINT",
      nullable: false,
      businessMeaning: "Surrogate key for dimension table joins",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Auto-generated sequence",
      },
    },

    // ========== NATURAL KEYS ==========
    {
      name: "account_id",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Unique account identifier from core banking",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_NUMBER",
        transformation: "1:1 mapping, trim whitespace",
      },
    },

    {
      name: "account_uuid",
      dataType: "STRING",
      nullable: true,
      businessMeaning: "Global unique identifier for distributed systems",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Generated using UUID_STRING()",
      },
    },

    {
      name: "account_number_formatted",
      dataType: "VARCHAR(30)",
      nullable: false,
      businessMeaning: "Account number in standardized display format",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_NUMBER",
        transformation: "Format as XXX-XXXX-XXXXXXXXX (masked for display)",
      },
    },

    // ========== ACCOUNT IDENTIFICATION ==========
    {
      name: "bank_number",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Bank identifier number",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "BANK_NUMBER",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "branch_number",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Branch where account was opened",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "BRANCH_NUMBER",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "account_type",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Account type: DDA, Savings, MoneyMarket, CD, etc.",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_TYPE",
        transformation: "Map to standardized account type",
      },
      validation: {
        allowedValues: ["DDA", "SAVINGS", "MONEY_MARKET", "CD", "IRA", "HSA"],
      },
    },

    {
      name: "account_subtype",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "More granular account classification",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_TYPE",
        transformation: "Derived from account type and additional flags",
      },
    },

    {
      name: "product_code",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Product code for this account",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "INTEREST_PLAN_CODE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "product_name",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Marketing name of the product",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_NAME",
        transformation: "Standardize and trim whitespace",
      },
    },

    {
      name: "account_name",
      dataType: "VARCHAR(200)",
      nullable: false,
      businessMeaning: "Account name/title as displayed to customer",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_NAME",
        transformation: "INITCAP(TRIM())",
      },
      piiClassification: "LOW",
    },

    // ========== OWNERSHIP & RELATIONSHIPS ==========
    {
      name: "primary_customer_id",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Primary account owner customer ID",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Lookup from customer_account_relationships where role=PRIMARY",
      },
    },

    {
      name: "ownership_type",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Ownership structure: INDIVIDUAL, JOINT, TRUST, CORPORATE, etc.",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_TYPE",
        transformation: "Derived from customer relationships and account characteristics",
      },
      validation: {
        allowedValues: ["INDIVIDUAL", "JOINT", "TRUST", "CORPORATE", "PARTNERSHIP"],
      },
    },

    {
      name: "total_owners",
      dataType: "INTEGER",
      nullable: false,
      businessMeaning: "Number of account owners",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "COUNT(DISTINCT customer_id) from relationships",
      },
    },

    // ========== ACCOUNT STATUS & DATES ==========
    {
      name: "account_status",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Current status: ACTIVE, INACTIVE, DORMANT, CLOSED, SUSPENDED",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_STATUS",
        transformation: "Map status code to standard status",
      },
      validation: {
        allowedValues: ["ACTIVE", "INACTIVE", "DORMANT", "CLOSED", "SUSPENDED"],
      },
    },

    {
      name: "account_open_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date account was opened",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_OPEN_DATE",
        transformation: "1:1 mapping, validate format",
      },
    },

    {
      name: "account_close_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date account was closed (NULL if still open)",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_CLOSE_DATE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "account_close_reason",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Reason for account closure",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_CLOSE_REASON",
        transformation: "Standardize reason descriptions",
      },
    },

    {
      name: "account_reopen_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date account was reopened if previously closed",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_REOPEN_DATE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "account_tenure_days",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Days account has been open",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "DATEDIFF(day, account_open_date, COALESCE(account_close_date, CURRENT_DATE()))",
      },
    },

    // ========== FOR CERTIFICATES OF DEPOSIT ==========
    {
      name: "maturity_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Maturity date for time deposits and CDs",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ACCOUNT_MATURITY_DATE",
        transformation: "1:1 mapping (only for CD/Time Deposit)",
      },
    },

    {
      name: "term_months",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Term of CD in months",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "DATEDIFF(month, account_open_date, maturity_date)",
      },
    },

    {
      name: "is_auto_renewal",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether CD automatically renews at maturity",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "N/A",
        transformation: "Derived from product flags",
      },
    },

    // ========== INTEREST & RATES ==========
    {
      name: "interest_rate_current",
      dataType: "DECIMAL(10, 6)",
      nullable: true,
      businessMeaning: "Current annual interest rate percentage",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "CURRENT_INTEREST_RATE",
        transformation: "1:1 mapping, validate range 0-10%",
      },
      validation: {
        minValue: 0,
        maxValue: 10,
      },
    },

    {
      name: "interest_plan_code",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Interest rate plan code",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "INTEREST_PLAN_CODE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "interest_accrual_method",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "How interest is accrued: DAILY, MONTHLY, QUARTERLY, ANNUALLY",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from product definition",
      },
    },

    {
      name: "interest_compounding_frequency",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Interest compounding frequency",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from product definition",
      },
    },

    {
      name: "rate_change_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date when interest rate last changed",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Tracked from rate change history",
      },
    },

    // ========== FEES ==========
    {
      name: "monthly_fee_amount",
      dataType: "DECIMAL(10, 2)",
      nullable: true,
      businessMeaning: "Monthly maintenance fee",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "MONTHLY_FEE",
        transformation: "1:1 mapping",
      },
      validation: {
        minValue: 0,
        maxValue: 1000,
      },
    },

    {
      name: "minimum_balance_required",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Minimum balance to avoid fees",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from product definition",
      },
    },

    {
      name: "exception_plan",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Exception plan code for fee waivers",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "EXCEPTION_PLAN",
        transformation: "1:1 mapping",
      },
    },

    // ========== ELECTRONIC SERVICES ==========
    {
      name: "electronic_statement_flag",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether customer receives electronic statements",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "ELECTRONIC_STATEMENT",
        transformation: "Map Y/N to TRUE/FALSE",
      },
    },

    {
      name: "online_banking_flag",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether account is enabled for online banking",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from account security settings",
      },
    },

    {
      name: "mobile_banking_flag",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether account is enabled for mobile banking",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from account security settings",
      },
    },

    // ========== SCD TYPE 2 TRACKING ==========
    {
      name: "effective_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date this record version became effective",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_master",
        bronzeColumn: "REFRESH_TIME",
        transformation: "Set to source last modified date on insert",
      },
    },

    {
      name: "expiration_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date this record version expired (9999-12-31 for current)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Set to 9999-12-31 for current",
      },
    },

    {
      name: "is_current",
      dataType: "BOOLEAN",
      nullable: false,
      businessMeaning: "Flag indicating if this is the current version",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "TRUE if expiration_date = 9999-12-31",
      },
    },

    // ========== DATA QUALITY & LINEAGE ==========
    {
      name: "data_quality_score",
      dataType: "DECIMAL(5, 2)",
      nullable: true,
      businessMeaning: "Data quality score 0-100",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Based on completeness and validity",
      },
    },

    {
      name: "created_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Timestamp when record was created",
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
      businessMeaning: "Timestamp when record was last updated",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP()",
      },
    },
  ],
};

// ============================================================================
// TABLE 2: DEPOSIT ACCOUNT DAILY BALANCES
// ============================================================================

export const depositAccountDailyBalancesSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE",
  schema: "CORE_DEPOSIT",
  description: "Daily balance snapshots for all deposit accounts with transaction summaries",
  businessKey: "account_id",
  surrogatePrimaryKey: "balance_snapshot_sk",
  sourceTables: [
    "bronze.deposit_account_balances_daily",
    "bronze.money_transaction",
  ],
  scdType: "Type 1",
  grain: "One row per account per business day",
  partitionBy: ["balance_date"],
  clusterBy: ["account_id", "balance_date"],

  columns: [
    {
      name: "balance_snapshot_sk",
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
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "ACCOUNT_ID",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "balance_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Business date for balance snapshot",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "BALANCE_DATE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "opening_balance",
      dataType: "DECIMAL(18, 2)",
      nullable: false,
      businessMeaning: "Opening balance at start of business day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "OPENING_BALANCE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "closing_balance",
      dataType: "DECIMAL(18, 2)",
      nullable: false,
      businessMeaning: "Closing balance at end of business day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "CLOSING_BALANCE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "available_balance",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Available balance (ledger minus holds)",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "AVAILABLE_BALANCE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "collected_balance",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Collected balance (cleared funds)",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "COLLECTED_BALANCE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "hold_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Amount on hold (checks, deposits pending)",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "HOLD_AMOUNT",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "average_balance",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Average daily balance for the month",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "AVERAGE_BALANCE",
        transformation: "1:1 mapping or calculated YTD average",
      },
    },
    {
      name: "minimum_balance",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Minimum balance during the day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "MINIMUM_BALANCE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "maximum_balance",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Maximum balance during the day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "MAXIMUM_BALANCE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "total_deposits",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Total deposits posted during the day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "TOTAL_DEPOSITS",
        transformation: "1:1 mapping or SUM of deposit transactions",
      },
    },
    {
      name: "total_withdrawals",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Total withdrawals posted during the day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "TOTAL_WITHDRAWALS",
        transformation: "1:1 mapping or SUM of withdrawal transactions",
      },
    },
    {
      name: "net_change",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Net change in balance for the day",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "closing_balance - opening_balance",
      },
    },
    {
      name: "transaction_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Total number of transactions during the day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "TRANSACTION_COUNT",
        transformation: "COUNT(*) of transactions for the account on the date",
      },
    },
    {
      name: "deposit_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Count of deposit transactions",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "DEPOSIT_COUNT",
        transformation: "COUNT of credit transactions",
      },
    },
    {
      name: "withdrawal_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Count of withdrawal transactions",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "WITHDRAWAL_COUNT",
        transformation: "COUNT of debit transactions",
      },
    },
    {
      name: "interest_accrued",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Interest accrued during the day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "INTEREST_ACCRUED",
        transformation: "1:1 mapping or calculated from rate",
      },
    },
    {
      name: "fees_charged",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Fees charged during the day",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "FEES_CHARGED",
        transformation: "1:1 mapping or SUM of fee transactions",
      },
    },
    {
      name: "balance_verified",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether balance was verified/reconciled",
      sourceMapping: {
        bronzeTable: "bronze.deposit_account_balances_daily",
        bronzeColumn: "BALANCE_VALIDATED",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "data_quality_score",
      dataType: "DECIMAL(5, 2)",
      nullable: true,
      businessMeaning: "Data quality score 0-100",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Based on validation checks",
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
// TABLE 3: DEPOSIT ACCOUNT TRANSACTION DETAIL
// ============================================================================

export const depositTransactionDetailSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.FCT_DEPOSIT_ACCOUNT_TRANSACTION",
  schema: "CORE_DEPOSIT",
  description: "Standardized deposit transaction detail with validation and categorization",
  businessKey: "transaction_id",
  surrogatePrimaryKey: "transaction_sk",
  sourceTables: ["bronze.money_transaction"],
  scdType: "Type 1",
  grain: "One row per transaction",
  partitionBy: ["transaction_date"],
  clusterBy: ["account_id", "transaction_date", "transaction_code"],

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
      ruleName: "Date Validation",
      ruleDescription: "Transaction date must not be in future",
      severity: "WARNING",
      expression: "transaction_date <= CURRENT_DATE()",
    },
    {
      ruleName: "Status Validation",
      ruleDescription: "Transaction status must be one of allowed values",
      severity: "ERROR",
      expression: "transaction_status IN ('POSTED', 'PENDING', 'REVERSED', 'FAILED')",
    },
  ],

  columns: [
    {
      name: "transaction_sk",
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
      name: "transaction_id",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Unique transaction identifier",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_ID",
        transformation: "1:1 mapping",
      },
    },
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
      name: "transaction_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date transaction was posted",
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
      businessMeaning: "Timestamp of transaction execution",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "N/A",
        transformation: "Extracted from transaction detail if available",
      },
    },
    {
      name: "transaction_code",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Transaction type code",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_CODE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "transaction_type",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Standard transaction type: DEPOSIT, WITHDRAWAL, TRANSFER, etc.",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_TYPE",
        transformation: "Map code to standard type",
      },
    },
    {
      name: "transaction_category",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Business category: CHECK, ACH, ATM, TRANSFER, INTEREST, FEE",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Derived from transaction code and description",
      },
    },
    {
      name: "transaction_amount",
      dataType: "DECIMAL(18, 2)",
      nullable: false,
      businessMeaning: "Transaction amount (positive value)",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_AMOUNT",
        transformation: "1:1 mapping, ensure positive",
      },
    },
    {
      name: "debit_or_credit",
      dataType: "VARCHAR(5)",
      nullable: false,
      businessMeaning: "D=Debit, C=Credit",
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
      name: "transaction_description",
      dataType: "VARCHAR(500)",
      nullable: true,
      businessMeaning: "Description of transaction for customer display",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_DESCRIPTION",
        transformation: "Trim and standardize",
      },
    },
    {
      name: "transaction_status",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Status: POSTED, PENDING, REVERSED, FAILED",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_STATUS",
        transformation: "Map code to status",
      },
      validation: {
        allowedValues: ["POSTED", "PENDING", "REVERSED", "FAILED"],
      },
    },
    {
      name: "transaction_control_number",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Control number for tracking and dispute resolution",
      sourceMapping: {
        bronzeTable: "bronze.money_transaction",
        bronzeColumn: "TRANSACTION_CONTROL_NUMBER",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "balance_after_transaction",
      dataType: "DECIMAL(18, 2)",
      nullable: true,
      businessMeaning: "Running balance after this transaction",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Calculated from balance movements",
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

// Additional Deposits Silver Tables
export const depositAccountSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.DIM_ACCOUNT",
  schema: "CORE_DEPOSIT",
  description: "Deposit account dimension with SCD Type 2",
  businessKey: "account_number",
  surrogatePrimaryKey: "account_sk",
  sourceTables: ["bronze.deposit_account_master"],
  scdType: "Type 2",
  grain: "One row per account",
  columns: [
    { name: "account_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key for the account dimension", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "account_number", dataType: "VARCHAR(16777216)", nullable: false, businessMeaning: "Unique identifier for the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_NUMBER" }, piiClassification: "HIGH" },
    { name: "account_type_code", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Code representing the type of account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_TYPE_CODE" }, piiClassification: "MEDIUM" },
    { name: "account_application_code", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Code indicating the application that originated the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_APPLICATION_CODE" } },
    { name: "account_status", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Code indicating the status of the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_STATUS" } },
    { name: "account_number_operational", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Operational account number used internally", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_NUMBER_OPERATIONAL" }, piiClassification: "HIGH" },
    { name: "account_number_last4", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Last four digits of the account number", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_NUMBER_LAST4" }, piiClassification: "HIGH" },
    { name: "account_number_operational_last4", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Last four digits of the operational account number", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_NUMBER_OPERATIONAL_LAST4" }, piiClassification: "HIGH" },
    { name: "cost_center", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Cost center associated with the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "COST_CENTER" }, piiClassification: "HIGH" },
    { name: "operational_account_cost_center", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Cost center for operational account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "OPERATIONAL_ACCOUNT_COST_CENTER" } },
    { name: "bank_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Bank identifier where the account resides", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "BANK_NUMBER" }, piiClassification: "HIGH" },
    { name: "account_type_description", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Description of the account type", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_TYPE_DESCRIPTION" } },
    { name: "account_open_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the account was opened", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_OPEN_DATE" } },
    { name: "secondary_officer_number", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Employee number of the secondary officer managing the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "SECONDARY_OFFICER_NUMBER" } },
    { name: "secondary_officer_name", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Name of the secondary officer managing the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "SECONDARY_OFFICER_NAME" }, piiClassification: "HIGH" },
    { name: "dormant_inactive_indicator", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Indicator if the account is dormant or inactive", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "DORMANT_INACTIVE_INDICATOR" }, piiClassification: "HIGH" },
    { name: "account_closed_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the account was closed", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_CLOSED_DATE" } },
    { name: "account_closed_month", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Month when the account was closed", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "ACCOUNT_CLOSED_MONTH" } },
    { name: "closed_reason_code", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Code indicating reason for account closure", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "CLOSED_REASON_CODE" } },
    { name: "closed_reason_desc", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Description of account closure reason", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "CLOSED_REASON_DESC" } },
    { name: "officer_number", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Employee number of the primary officer managing the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "OFFICER_NUMBER" } },
    { name: "officer_name", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Name of the primary officer managing the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "OFFICER_NAME" }, piiClassification: "HIGH" },
    { name: "initial_funding_amount", dataType: "NUMBER(18,2)", nullable: true, businessMeaning: "Initial amount deposited to fund the account", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "INITIAL_FUNDING_AMOUNT" }, piiClassification: "HIGH" },
    { name: "branch_number", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Branch identifier number where the account was opened", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "BRANCH_NUMBER" }, piiClassification: "HIGH" },
    { name: "branch_description", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Description about the branch where the account was opened", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "BRANCH_DESCRIPTION" } },
    { name: "row_hash", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Hash value used for change detection", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "MD5 hash of business columns" } },
    { name: "record_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was created", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "RECORD_DATE" } },
    { name: "effective_start_date", dataType: "DATE", nullable: true, businessMeaning: "Start date of the record validity", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "effective_end_date", dataType: "DATE", nullable: true, businessMeaning: "End date of the record validity", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "record_flag", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Indicator of current record status (e.g., Active, Inactive)", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "business_date", dataType: "DATE", nullable: true, businessMeaning: "Business date the data corresponds to", sourceMapping: { bronzeTable: "bronze.deposit_account_master", bronzeColumn: "BUSINESS_DATE" } },
    { name: "insert_by", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "User who inserted the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "insert_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Timestamp when the record was inserted", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "last_modified_by", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "User who last modified the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "last_modified_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Timestamp of last record modification", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
  ],
};

export const depositAccountPackageSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.DIM_ACCOUNT_PACKAGE",
  schema: "CORE_DEPOSIT",
  description: "Account package and tier information with SCD Type 2",
  businessKey: "account_number",
  surrogatePrimaryKey: "account_package_sk",
  sourceTables: ["bronze.account_package"],
  scdType: "Type 2",
  grain: "One row per account number and enrollment role",
  columns: [
    { name: "account_package_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key for the account dimension", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "account_number_fk", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Foreign key linking to DIM_ACCOUNT (ACCOUNT_SK)", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "Lookup to DIM_ACCOUNT" } },
    { name: "account_number", dataType: "VARCHAR(16777216)", nullable: false, businessMeaning: "Unique account number associated with the package", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "ACCOUNT_NUMBER" } },
    { name: "account_package_id", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Unique identifier for the account package", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "ACCOUNT_PACKAGE_ID" } },
    { name: "account_package_name", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Name of the account package", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "ACCOUNT_PACKAGE_NAME" } },
    { name: "account_package_description", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Detailed description of the account package", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "ACCOUNT_PACKAGE_DESCRIPTION" } },
    { name: "account_tier_id", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Identifier for the account tier", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "ACCOUNT_TIER_ID" } },
    { name: "account_tier_name", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Name of the account tier", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "ACCOUNT_TIER_NAME" } },
    { name: "account_enrollment_role_code", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Role code for enrollment (e.g., Primary, Secondary)", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "ACCOUNT_ENROLLMENT_ROLE_CODE" } },
    { name: "account_enrollment_forced_ind", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Indicates if enrollment is mandatory (Y/N)", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "ACCOUNT_ENROLLMENT_FORCED_IND" } },
    { name: "row_hash", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Hash value of business columns used for change tracking", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "MD5 hash" } },
    { name: "business_date", dataType: "DATE", nullable: true, businessMeaning: "Business date associated with the data record", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "BUSINESS_DATE" } },
    { name: "record_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was extracted from source system", sourceMapping: { bronzeTable: "bronze.account_package", bronzeColumn: "RECORD_DATE" } },
    { name: "effective_start_date", dataType: "DATE", nullable: true, businessMeaning: "Start date indicating when the record became valid", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "effective_end_date", dataType: "DATE", nullable: true, businessMeaning: "End date indicating when the record expired", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "record_flag", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Record status flag (e.g., Active, Inactive)", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "insert_by", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "User who inserted the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "insert_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Timestamp of record insertion", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "last_modified_by", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "User who last modified the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "last_modified_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Timestamp of last modification", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
  ],
};

export const depositDebitCardSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.DIM_DEBIT_CARD",
  schema: "CORE_DEPOSIT",
  description: "Debit card information linked to deposit accounts",
  businessKey: "debit_card_number",
  surrogatePrimaryKey: "debit_card_sk",
  sourceTables: ["bronze.debit_card"],
  scdType: "Type 2",
  grain: "One row per account, customer, and debit card combination",
  columns: [
    { name: "debit_card_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key for the debit card", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "account_number", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Foreign key referencing the associated deposit account", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "ACCOUNT_NUMBER" } },
    { name: "customer_number", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Optional foreign key referencing the customer", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "CUSTOMER_NUMBER" } },
    { name: "debit_card_number", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Masked or tokenized debit card number", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "DEBIT_CARD_NUMBER" } },
    { name: "issue_date", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Date the debit card was issued", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "ISSUE_DATE" } },
    { name: "expiry_date", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Date when the debit card expires", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "EXPIRY_DATE" } },
    { name: "card_status", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Current status of the card (e.g., Active, Blocked, Expired)", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "CARD_STATUS" } },
    { name: "is_primary_card", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Indicates whether this is the primary debit card for the account", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "IS_PRIMARY_CARD" } },
    { name: "row_hash", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Hash value of Business Columns", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "MD5 hash" } },
    { name: "business_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was created in business", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "BUSINESS_DATE" } },
    { name: "record_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was Extracted", sourceMapping: { bronzeTable: "bronze.debit_card", bronzeColumn: "RECORD_DATE" } },
    { name: "effective_start_date", dataType: "DATE", nullable: true, businessMeaning: "Start date of this record for SCD tracking", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "effective_end_date", dataType: "DATE", nullable: true, businessMeaning: "End date of this record for SCD tracking", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "record_flag", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Indicator of current record status (e.g., Active, Inactive)", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "insert_by", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "The identifier of the user or system that inserted the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "insert_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "The date and time when the record was initially inserted into the database", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "last_modified_by", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "The identifier of the user or system that last modified the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "last_modified_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "The date and time when the record was last modified", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
  ],
};

export const depositCertificateTransactionSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
  schema: "CORE_DEPOSIT",
  description: "Certificate of deposit (CD) transaction fact table",
  businessKey: "transaction_id",
  surrogatePrimaryKey: "deposit_certificate_transaction_sk",
  sourceTables: ["bronze.certificate_transaction"],
  scdType: "Type 1",
  grain: "One row per account and transaction ID",
  columns: [
    { name: "deposit_certificate_transaction_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key uniquely identifying each deposit certificate transaction", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "account_number_fk", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Foreign key linking to DIM_ACCOUNT (ACCOUNT_SK)", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "Lookup to DIM_ACCOUNT" } },
    { name: "account_number", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Account number", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "ACCOUNT_NUMBER" } },
    { name: "bank_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Bank identifier", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "BANK_NUMBER" } },
    { name: "branch_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Branch identifier", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "BRANCH_NUMBER" } },
    { name: "calendar_date", dataType: "DATE", nullable: true, businessMeaning: "Foreign key linking to the date dimension table", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "CALENDAR_DATE" } },
    { name: "transaction_date", dataType: "DATE", nullable: true, businessMeaning: "Date on which the transaction occurred", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "TRANSACTION_DATE" } },
    { name: "transaction_id", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Datetime sequence on which the transaction occurred", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "TRANSACTION_ID" } },
    { name: "transaction_code", dataType: "VARCHAR(50)", nullable: true, businessMeaning: "Code representing the type of transaction", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "TRANSACTION_CODE" } },
    { name: "transaction_amount", dataType: "NUMBER(18,6)", nullable: true, businessMeaning: "Amount of money involved in the transaction", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "TRANSACTION_AMOUNT" } },
    { name: "debit_credit_indicator", dataType: "VARCHAR(50)", nullable: true, businessMeaning: "Indicator specifying whether the transaction is a debit or credit", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "DEBIT_CREDIT_INDICATOR" } },
    { name: "transaction_description", dataType: "VARCHAR(500)", nullable: true, businessMeaning: "Description of the transaction", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "TRANSACTION_DESCRIPTION" } },
    { name: "transaction_control_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Unique control number assigned to the transaction for tracking", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "TRANSACTION_CONTROL_NUMBER" } },
    { name: "reversal_flag", dataType: "BOOLEAN", nullable: true, businessMeaning: "Flag indicating whether the transaction is a reversal of a previous transaction", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "REVERSAL_FLAG" } },
    { name: "transaction_status", dataType: "VARCHAR(50)", nullable: true, businessMeaning: "Current status of the transaction", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "TRANSACTION_STATUS" } },
    { name: "c_d_principal_balance", dataType: "NUMBER(18,6)", nullable: true, businessMeaning: "Principal balance of the deposit certificate account", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "C_D_PRINCIPAL_BALANCE" } },
    { name: "account_available_balance", dataType: "NUMBER(18,6)", nullable: true, businessMeaning: "Balance available for transactions", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "ACCOUNT_AVAILABLE_BALANCE" } },
    { name: "original_transaction_date", dataType: "DATE", nullable: true, businessMeaning: "Date of the original transaction if this is a reversal or correction", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "ORIGINAL_TRANSACTION_DATE" } },
    { name: "f_t_m_group_id", dataType: "VARCHAR(50)", nullable: true, businessMeaning: "Group identifier for financial tracking and management", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "F_T_M_GROUP_ID" } },
    { name: "record_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was created or last updated", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "RECORD_DATE" } },
    { name: "business_date", dataType: "DATE", nullable: true, businessMeaning: "Business date", sourceMapping: { bronzeTable: "bronze.certificate_transaction", bronzeColumn: "BUSINESS_DATE" } },
    { name: "insert_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Timestamp when record was inserted", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "insert_by", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "User or system that inserted the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
  ],
};

export const depositHoldTransactionSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION",
  schema: "CORE_DEPOSIT",
  description: "Hold transactions on deposit accounts",
  businessKey: "transaction_id",
  surrogatePrimaryKey: "deposit_hold_transaction_sk",
  sourceTables: ["bronze.hold_transaction"],
  scdType: "Type 1",
  grain: "One row per account and transaction ID",
  columns: [
    { name: "deposit_hold_transaction_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "account_number_fk", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Foreign key linking to DIM_ACCOUNT (ACCOUNT_SK)", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "Lookup to DIM_ACCOUNT" } },
    { name: "account_number", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Unique identifier for the deposit account", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "ACCOUNT_NUMBER" } },
    { name: "bank_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Bank identifier", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "BANK_NUMBER" } },
    { name: "branch_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Branch identifier", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "BRANCH_NUMBER" } },
    { name: "calendar_date", dataType: "DATE", nullable: true, businessMeaning: "Foreign key linking to the date dimension", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "CALENDAR_DATE" } },
    { name: "hold_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Unique identifier assigned to each hold transaction", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "HOLD_NUMBER" } },
    { name: "hold_type", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Type of hold placed on the deposit account", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "HOLD_TYPE" } },
    { name: "hold_reason", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Reason for placing the hold on the deposit account", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "HOLD_REASON" } },
    { name: "transaction_date", dataType: "DATE", nullable: true, businessMeaning: "Date on which the hold transaction occurred", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "TRANSACTION_DATE" } },
    { name: "transaction_id", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Datetime sequence on which the hold transaction occurred", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "TRANSACTION_ID" } },
    { name: "transaction_code", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Code representing the type of transaction related to the hold", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "TRANSACTION_CODE" } },
    { name: "transaction_amount", dataType: "NUMBER(18,6)", nullable: true, businessMeaning: "Amount of money held in the deposit account", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "TRANSACTION_AMOUNT" } },
    { name: "hold_amount", dataType: "NUMBER(18,6)", nullable: true, businessMeaning: "Total amount of money held in the deposit account", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "HOLD_AMOUNT" } },
    { name: "hold_transaction_entered_date", dataType: "DATE", nullable: true, businessMeaning: "Date on which the hold was entered into the system", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "HOLD_TRANSACTION_ENTERED_DATE" } },
    { name: "hold_transaction_expiration_date", dataType: "DATE", nullable: true, businessMeaning: "Date on which the hold is set to expire", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "HOLD_TRANSACTION_EXPIRATION_DATE" } },
    { name: "record_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was created or last updated", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "RECORD_DATE" } },
    { name: "business_date", dataType: "DATE", nullable: true, businessMeaning: "Business date", sourceMapping: { bronzeTable: "bronze.hold_transaction", bronzeColumn: "BUSINESS_DATE" } },
    { name: "insert_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Timestamp when record was inserted", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "insert_by", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "User or system that inserted the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
  ],
};

export const depositMaintenanceTransactionSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
  schema: "CORE_DEPOSIT",
  description: "Maintenance transaction history for deposit accounts",
  businessKey: "transaction_id",
  surrogatePrimaryKey: "deposit_maintenance_transaction_sk",
  sourceTables: ["bronze.maintenance_log_transaction"],
  scdType: "Type 1",
  grain: "One row per account and transaction ID",
  columns: [
    { name: "deposit_maintenance_transaction_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key uniquely identifying each deposit maintenance transaction", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "account_number_fk", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Foreign key linking to DIM_ACCOUNT (ACCOUNT_SK)", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "Lookup to DIM_ACCOUNT" } },
    { name: "account_number", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Account number", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "ACCOUNT_NUMBER" } },
    { name: "bank_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Bank identifier", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "BANK_NUMBER" } },
    { name: "branch_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Branch identifier", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "BRANCH_NUMBER" } },
    { name: "calendar_date", dataType: "DATE", nullable: true, businessMeaning: "Foreign key linking to the date dimension", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "CALENDAR_DATE" } },
    { name: "transaction_date", dataType: "DATE", nullable: true, businessMeaning: "Date on which the maintenance transaction occurred", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "TRANSACTION_DATE" } },
    { name: "transaction_id", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Datetime sequence on which the maintenance transaction occurred", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "TRANSACTION_ID" } },
    { name: "maintenance_transaction_code", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Code representing the type of maintenance transaction performed", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "MAINTENANCE_TRANSACTION_CODE" } },
    { name: "maintenance_description_code", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Code describing the maintenance transaction", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "MAINTENANCE_DESCRIPTION_CODE" } },
    { name: "keyword_new_value", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "New value of the keyword or attribute after the maintenance transaction", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "KEYWORD_NEW_VALUE" } },
    { name: "keyword_old_value", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Old value of the keyword or attribute before the maintenance transaction", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "KEYWORD_OLD_VALUE" } },
    { name: "record_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was created or last updated", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "RECORD_DATE" } },
    { name: "business_date", dataType: "DATE", nullable: true, businessMeaning: "Business date", sourceMapping: { bronzeTable: "bronze.maintenance_log_transaction", bronzeColumn: "BUSINESS_DATE" } },
    { name: "insert_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Timestamp when record was inserted", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "insert_by", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "User or system that inserted the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
  ],
};

export const depositStopTransactionSilver: SilverTableDefinition = {
  name: "CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION",
  schema: "CORE_DEPOSIT",
  description: "Stop payment transactions on deposit accounts",
  businessKey: "transaction_id",
  surrogatePrimaryKey: "deposit_stop_transaction_sk",
  sourceTables: ["bronze.stop_transaction"],
  scdType: "Type 1",
  grain: "One row per account and transaction ID",
  columns: [
    { name: "deposit_stop_transaction_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "account_number_fk", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Foreign key linking to DIM_ACCOUNT (ACCOUNT_SK)", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "Lookup to DIM_ACCOUNT" } },
    { name: "calendar_date", dataType: "DATE", nullable: true, businessMeaning: "Foreign key linking to the date dimension", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "CALENDAR_DATE" } },
    { name: "bank_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Bank identifier", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "BANK_NUMBER" } },
    { name: "branch_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Branch identifier", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "BRANCH_NUMBER" } },
    { name: "account_number", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Unique identifier for the deposit account", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "ACCOUNT_NUMBER" } },
    { name: "stop_payment_i_d", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Unique identifier for the stop payment instruction", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "STOP_PAYMENT_I_D" } },
    { name: "transaction_date", dataType: "DATE", nullable: true, businessMeaning: "Date on which the stop transaction occurred", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "TRANSACTION_DATE" } },
    { name: "transaction_id", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Datetime sequence on which the transaction occurred", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "TRANSACTION_ID" } },
    { name: "transaction_code", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Code representing the type of transaction related to the stop payment", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "TRANSACTION_CODE" } },
    { name: "transaction_amount", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Amount of money involved in the stop transaction", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "TRANSACTION_AMOUNT" } },
    { name: "stop_type", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Type of stop payment, such as check stop or ACH stop", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "STOP_TYPE" } },
    { name: "stop_reason", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Reason for placing the stop payment", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "STOP_REASON" } },
    { name: "stop_entered_date", dataType: "DATE", nullable: true, businessMeaning: "Date on which the stop payment was entered into the system", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "STOP_ENTERED_DATE" } },
    { name: "stop_expiration_date", dataType: "DATE", nullable: true, businessMeaning: "Date on which the stop payment is set to expire", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "STOP_EXPIRATION_DATE" } },
    { name: "serial_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Serial number of the check or transaction being stopped", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "SERIAL_NUMBER" } },
    { name: "end_serial_number", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Ending serial number if a range of checks or transactions is being stopped", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "END_SERIAL_NUMBER" } },
    { name: "a_c_h_company_id", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Company identifier for ACH transactions", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "A_C_H_COMPANY_ID" } },
    { name: "a_c_h_entry_class", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Entry class code for ACH transactions", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "A_C_H_ENTRY_CLASS" } },
    { name: "a_c_h_individual_id", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Individual identifier for ACH transactions", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "A_C_H_INDIVIDUAL_ID" } },
    { name: "transaction_tme_seq", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "Datetime sequence on which the stop transaction occurred", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "TRANSACTION_TME_SEQ" } },
    { name: "record_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was created or last updated", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "RECORD_DATE" } },
    { name: "business_date", dataType: "DATE", nullable: true, businessMeaning: "Business date", sourceMapping: { bronzeTable: "bronze.stop_transaction", bronzeColumn: "BUSINESS_DATE" } },
    { name: "insert_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Timestamp when record was inserted", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "insert_by", dataType: "VARCHAR(100)", nullable: true, businessMeaning: "User or system that inserted the record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
  ],
};

export const depositsSilverTables = [
  depositAccountMasterSilver,
  depositAccountDailyBalancesSilver,
  depositTransactionDetailSilver,
  depositAccountSilver,
  depositAccountPackageSilver,
  depositDebitCardSilver,
  depositCertificateTransactionSilver,
  depositHoldTransactionSilver,
  depositMaintenanceTransactionSilver,
  depositStopTransactionSilver,
];

export const depositsSilverLayerComplete = {
  tables: depositsSilverTables,
  totalTables: depositsSilverTables.length,
  description:
    "Deposits domain silver layer - cleansed and standardized deposit account and transaction data",
  layerPurpose:
    "Conformed deposit data with balance validation, transaction categorization, and SCD Type 2 history",
};

export default depositsSilverTables;
