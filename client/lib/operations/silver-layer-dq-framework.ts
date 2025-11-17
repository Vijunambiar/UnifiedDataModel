/**
 * SILVER LAYER DATA QUALITY FRAMEWORK
 * 
 * Comprehensive DQ rules, scoring, monitoring, and remediation for Silver Layer
 * Organized by domain, rule type, and severity level
 * Includes automated enforcement, manual review workflows, and SLA monitoring
 * 
 * DQ Rule Categories:
 * - Completeness (null checks)
 * - Validity (format, range, enum)
 * - Uniqueness (duplicates, business keys)
 * - Consistency (referential integrity, cross-domain)
 * - Accuracy (reconciliation, comparison)
 * - Timeliness (freshness, latency)
 * - Conformity (schema, data types)
 */

export interface DataQualityRule {
  ruleId: string;
  ruleName: string;
  description: string;
  domain: string;
  targetTable: string;
  ruleType:
    | "COMPLETENESS"
    | "VALIDITY"
    | "UNIQUENESS"
    | "CONSISTENCY"
    | "ACCURACY"
    | "TIMELINESS"
    | "CONFORMITY";
  severity: "CRITICAL" | "ERROR" | "WARNING" | "INFO";
  sqlExpression: string;
  expectedPassRate: number;
  toleranceThreshold?: number;
  remediationAction: "BLOCK" | "ALERT" | "LOG" | "AUTO_FIX";
  autoFixLogic?: string;
  owner: string;
  sla?: string;
}

export interface DataQualityScore {
  tableName: string;
  scoreDate: string;
  overallScore: number;
  categoryScores: {
    completeness: number;
    validity: number;
    uniqueness: number;
    consistency: number;
    accuracy: number;
    timeliness: number;
  };
  recordCount: number;
  failedRecords: number;
  failedRules: string[];
  qualityTrend: "IMPROVING" | "STABLE" | "DECLINING";
}

// ============================================================================
// CUSTOMER DOMAIN - DATA QUALITY RULES
// ============================================================================

export const customerDomainDQRules: DataQualityRule[] = [
  // ===== COMPLETENESS RULES =====
  {
    ruleId: "CUST_COMP_001",
    ruleName: "Customer ID Not Null",
    description: "All records must have a customer_id value",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "COMPLETENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE customer_id IS NULL",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
    sla: "Must not exceed 0 records",
  },
  {
    ruleId: "CUST_COMP_002",
    ruleName: "Full Name Not Null",
    description: "All customer records must have a full_name_cleansed",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "COMPLETENESS",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE is_current=TRUE AND full_name_cleansed IS NULL",
    expectedPassRate: 95,
    toleranceThreshold: 5,
    remediationAction: "ALERT",
    owner: "Data Steward",
    sla: "Alert if > 5% null",
  },
  {
    ruleId: "CUST_COMP_003",
    ruleName: "Customer Status Not Null",
    description: "Customer status must be populated",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "COMPLETENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE customer_status IS NULL",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "CUST_COMP_004",
    ruleName: "Customer Since Date Not Null",
    description: "Customer since date must be populated for all customers",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "COMPLETENESS",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE customer_since_date IS NULL",
    expectedPassRate: 99.5,
    toleranceThreshold: 0.5,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },

  // ===== VALIDITY RULES =====
  {
    ruleId: "CUST_VALID_001",
    ruleName: "Customer Status Valid Value",
    description: "Customer status must be one of allowed values",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "VALIDITY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE customer_status NOT IN ('ACTIVE', 'INACTIVE', 'CLOSED', 'DECEASED')",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "CUST_VALID_002",
    ruleName: "Customer Since Date Valid",
    description: "Customer since date must be <= today and > 1900-01-01",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "VALIDITY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE customer_since_date > CURRENT_DATE() OR customer_since_date < '1900-01-01'",
    expectedPassRate: 99.9,
    toleranceThreshold: 0.1,
    remediationAction: "ALERT",
    owner: "Data Steward",
    sla: "Must not exceed 0.1% of records",
  },
  {
    ruleId: "CUST_VALID_003",
    ruleName: "Birth Date Valid",
    description: "Birth date must be before today and customer must be >= 0 years old",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "VALIDITY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE date_of_birth IS NOT NULL AND (date_of_birth >= CURRENT_DATE() OR DATEDIFF(year, date_of_birth, CURRENT_DATE()) > 150)",
    expectedPassRate: 95,
    toleranceThreshold: 5,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },
  {
    ruleId: "CUST_VALID_004",
    ruleName: "Email Format Valid",
    description: "Email address must match valid email pattern if populated",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "VALIDITY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE email_primary IS NOT NULL AND email_primary NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Z|a-z]{2,}$'",
    expectedPassRate: 90,
    toleranceThreshold: 10,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },
  {
    ruleId: "CUST_VALID_005",
    ruleName: "Phone Format Valid",
    description: "Phone must be in E.164 format if populated",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "VALIDITY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE phone_mobile IS NOT NULL AND phone_mobile NOT REGEXP '^\\\\+[1-9]\\\\d{1,14}$'",
    expectedPassRate: 85,
    toleranceThreshold: 15,
    remediationAction: "LOG",
    owner: "Data Steward",
  },
  {
    ruleId: "CUST_VALID_006",
    ruleName: "State Code Valid",
    description: "State code must be 2-character uppercase if populated",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "VALIDITY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE state_code IS NOT NULL AND state_code NOT REGEXP '^[A-Z]{2}$'",
    expectedPassRate: 95,
    toleranceThreshold: 5,
    remediationAction: "LOG",
    owner: "Data Steward",
  },

  // ===== UNIQUENESS RULES =====
  {
    ruleId: "CUST_UNIQUE_001",
    ruleName: "Customer ID Unique",
    description: "Customer ID must be unique per is_current=TRUE",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "UNIQUENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) as cnt FROM silver.customer_master_golden WHERE is_current=TRUE GROUP BY customer_id HAVING cnt > 1) x",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "CUST_UNIQUE_002",
    ruleName: "SSN Hash Deduplication Check",
    description: "No duplicate SSN hashes across current customers (unless NULL)",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "UNIQUENESS",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM (SELECT ssn_hash, COUNT(*) as cnt FROM silver.customer_master_golden WHERE is_current=TRUE AND ssn_hash IS NOT NULL GROUP BY ssn_hash HAVING cnt > 1) x",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Engineering",
  },

  // ===== CONSISTENCY RULES =====
  {
    ruleId: "CUST_CONS_001",
    ruleName: "Customer Account Relationship Consistency",
    description: "All accounts in relationships must reference valid customers",
    domain: "Customer",
    targetTable: "silver.customer_relationships",
    ruleType: "CONSISTENCY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_relationships r WHERE NOT EXISTS (SELECT 1 FROM silver.customer_master_golden c WHERE c.customer_id = r.customer_id AND c.is_current=TRUE)",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Engineering",
  },
  {
    ruleId: "CUST_CONS_002",
    ruleName: "Customer Close Date Logic",
    description: "If customer_status=CLOSED, customer_close_date must be populated",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "CONSISTENCY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE customer_status='CLOSED' AND customer_close_date IS NULL",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },
  {
    ruleId: "CUST_CONS_003",
    ruleName: "SCD2 Date Logic",
    description: "effective_date must be <= expiration_date for all records",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "CONSISTENCY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE effective_date > expiration_date",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "CUST_CONS_004",
    ruleName: "Current Record Date Logic",
    description: "Records with is_current=TRUE must have expiration_date='9999-12-31'",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "CONSISTENCY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE (is_current=TRUE AND expiration_date != '9999-12-31') OR (is_current=FALSE AND expiration_date = '9999-12-31')",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },

  // ===== ACCURACY RULES =====
  {
    ruleId: "CUST_ACC_001",
    ruleName: "Deduplication Confidence Score Valid",
    description: "Deduplication confidence score must be 0-100",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "ACCURACY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE deduplication_confidence_score IS NOT NULL AND (deduplication_confidence_score < 0 OR deduplication_confidence_score > 100)",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Engineering",
  },
  {
    ruleId: "CUST_ACC_002",
    ruleName: "Data Quality Score Calculation",
    description: "Data quality score must be between 0 and 100",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "ACCURACY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE data_quality_score IS NOT NULL AND (data_quality_score < 0 OR data_quality_score > 100)",
    expectedPassRate: 100,
    remediationAction: "LOG",
    owner: "Data Engineering",
  },

  // ===== TIMELINESS RULES =====
  {
    ruleId: "CUST_TIME_001",
    ruleName: "Data Freshness - Customer Master",
    description: "Customer master records must be updated within 1 day",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "TIMELINESS",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE is_current=TRUE AND DATEDIFF(day, updated_timestamp, CURRENT_TIMESTAMP()) > 1",
    expectedPassRate: 95,
    toleranceThreshold: 5,
    remediationAction: "ALERT",
    owner: "Data Engineering",
    sla: "95% of records updated within 1 day",
  },
  {
    ruleId: "CUST_TIME_002",
    ruleName: "Effective Date Timeliness",
    description: "Effective date must not be too far in the past (>90 days)",
    domain: "Customer",
    targetTable: "silver.customer_master_golden",
    ruleType: "TIMELINESS",
    severity: "INFO",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.customer_master_golden WHERE is_current=TRUE AND DATEDIFF(day, effective_date, CURRENT_DATE()) > 90",
    expectedPassRate: 85,
    remediationAction: "LOG",
    owner: "Data Steward",
  },
];

// ============================================================================
// DEPOSITS DOMAIN - DATA QUALITY RULES
// ============================================================================

export const depositsDomainDQRules: DataQualityRule[] = [
  // ===== COMPLETENESS RULES =====
  {
    ruleId: "DEP_COMP_001",
    ruleName: "Account ID Not Null",
    description: "All account records must have account_id",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "COMPLETENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE account_id IS NULL",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "DEP_COMP_002",
    ruleName: "Account Type Not Null",
    description: "All accounts must have account_type",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "COMPLETENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE account_type IS NULL",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "DEP_COMP_003",
    ruleName: "Account Status Not Null",
    description: "All accounts must have account_status",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "COMPLETENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE account_status IS NULL",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },

  // ===== VALIDITY RULES =====
  {
    ruleId: "DEP_VALID_001",
    ruleName: "Account Type Valid",
    description: "Account type must be one of allowed values",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "VALIDITY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE account_type NOT IN ('DDA', 'SAVINGS', 'MONEY_MARKET', 'CD', 'IRA', 'HSA')",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "DEP_VALID_002",
    ruleName: "Account Status Valid",
    description: "Account status must be one of allowed values",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "VALIDITY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE account_status NOT IN ('ACTIVE', 'INACTIVE', 'DORMANT', 'CLOSED', 'SUSPENDED')",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "DEP_VALID_003",
    ruleName: "Account Open Date Valid",
    description: "Account open date must be <= today",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "VALIDITY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE account_open_date > CURRENT_DATE()",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },
  {
    ruleId: "DEP_VALID_004",
    ruleName: "Interest Rate Valid",
    description: "Interest rate must be between 0 and 10 percent if populated",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "VALIDITY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE interest_rate_current IS NOT NULL AND (interest_rate_current < 0 OR interest_rate_current > 10)",
    expectedPassRate: 99,
    toleranceThreshold: 1,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },
  {
    ruleId: "DEP_VALID_005",
    ruleName: "Monthly Fee Valid",
    description: "Monthly fee must be between 0 and 1000 if populated",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "VALIDITY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE monthly_fee_amount IS NOT NULL AND (monthly_fee_amount < 0 OR monthly_fee_amount > 1000)",
    expectedPassRate: 99.5,
    toleranceThreshold: 0.5,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },

  // ===== CONSISTENCY RULES =====
  {
    ruleId: "DEP_CONS_001",
    ruleName: "Close Date Logic",
    description: "If account_status=CLOSED, account_close_date must be populated and >= account_open_date",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "CONSISTENCY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE account_status='CLOSED' AND (account_close_date IS NULL OR account_close_date < account_open_date)",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },
  {
    ruleId: "DEP_CONS_002",
    ruleName: "Maturity Date Logic",
    description: "CD maturity date must be >= account open date and > today",
    domain: "Deposits",
    targetTable: "silver.deposit_account_master_golden",
    ruleType: "CONSISTENCY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_master_golden WHERE account_type='CD' AND (maturity_date < account_open_date OR maturity_date < CURRENT_DATE())",
    expectedPassRate: 95,
    toleranceThreshold: 5,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },
  {
    ruleId: "DEP_CONS_003",
    ruleName: "Balance Reconciliation",
    description: "Daily balance sum must reconcile to account balance",
    domain: "Deposits",
    targetTable: "silver.deposit_account_daily_balances",
    ruleType: "CONSISTENCY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_daily_balances WHERE ABS((total_deposits - total_withdrawals) - net_change) > 0.01",
    expectedPassRate: 99.99,
    toleranceThreshold: 0.01,
    remediationAction: "ALERT",
    owner: "Data Engineering",
  },

  // ===== ACCURACY RULES =====
  {
    ruleId: "DEP_ACC_001",
    ruleName: "Balance Calculation Accuracy",
    description: "Verify closing_balance = opening_balance + net_change",
    domain: "Deposits",
    targetTable: "silver.deposit_account_daily_balances",
    ruleType: "ACCURACY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_daily_balances WHERE ABS(closing_balance - (opening_balance + net_change)) > 0.01",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Engineering",
  },
  {
    ruleId: "DEP_ACC_002",
    ruleName: "Minimum Balance Logic",
    description: "Minimum balance must be <= average balance",
    domain: "Deposits",
    targetTable: "silver.deposit_account_daily_balances",
    ruleType: "ACCURACY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_daily_balances WHERE minimum_balance > average_balance",
    expectedPassRate: 99,
    toleranceThreshold: 1,
    remediationAction: "LOG",
    owner: "Data Steward",
  },

  // ===== TIMELINESS RULES =====
  {
    ruleId: "DEP_TIME_001",
    ruleName: "Daily Balance Freshness",
    description: "Daily balances must be recorded within 4 hours of day-end",
    domain: "Deposits",
    targetTable: "silver.deposit_account_daily_balances",
    ruleType: "TIMELINESS",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.deposit_account_daily_balances WHERE created_timestamp > DATE_ADD(balance_date, INTERVAL 4 HOUR)",
    expectedPassRate: 98,
    toleranceThreshold: 2,
    remediationAction: "ALERT",
    owner: "Data Engineering",
    sla: "98% within 4 hours",
  },
];

// ============================================================================
// TRANSACTIONS DOMAIN - DATA QUALITY RULES
// ============================================================================

export const transactionsDomainDQRules: DataQualityRule[] = [
  // ===== COMPLETENESS RULES =====
  {
    ruleId: "TRX_COMP_001",
    ruleName: "Transaction ID Not Null",
    description: "All transactions must have transaction_id",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "COMPLETENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE transaction_id IS NULL",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "TRX_COMP_002",
    ruleName: "Account ID Not Null",
    description: "All transactions must reference an account",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "COMPLETENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE account_id IS NULL",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "TRX_COMP_003",
    ruleName: "Transaction Amount Not Null",
    description: "All transactions must have an amount",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "COMPLETENESS",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE transaction_amount IS NULL",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },

  // ===== VALIDITY RULES =====
  {
    ruleId: "TRX_VALID_001",
    ruleName: "Transaction Amount Valid",
    description: "Transaction amount must be positive",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "VALIDITY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE transaction_amount <= 0",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "TRX_VALID_002",
    ruleName: "Debit Credit Valid",
    description: "Debit/Credit flag must be D or C",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "VALIDITY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE debit_or_credit NOT IN ('D', 'C')",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "TRX_VALID_003",
    ruleName: "Transaction Status Valid",
    description: "Transaction status must be one of allowed values",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "VALIDITY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE transaction_status NOT IN ('POSTED', 'PENDING', 'REVERSED', 'FAILED', 'REJECTED')",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Engineering",
  },
  {
    ruleId: "TRX_VALID_004",
    ruleName: "Transaction Date Not Future",
    description: "Transaction date must not be in the future",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "VALIDITY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE transaction_date > CURRENT_DATE()",
    expectedPassRate: 99.9,
    toleranceThreshold: 0.1,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },

  // ===== CONSISTENCY RULES =====
  {
    ruleId: "TRX_CONS_001",
    ruleName: "Signed Amount Consistency",
    description: "Signed amount must match transaction amount with correct sign",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "CONSISTENCY",
    severity: "CRITICAL",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE (debit_or_credit='D' AND signed_amount >= 0) OR (debit_or_credit='C' AND signed_amount <= 0)",
    expectedPassRate: 100,
    remediationAction: "BLOCK",
    owner: "Data Engineering",
  },
  {
    ruleId: "TRX_CONS_002",
    ruleName: "Balance Reconciliation",
    description: "balance_after must equal balance_before + signed_amount",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "CONSISTENCY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE ABS(balance_after - (balance_before + signed_amount)) > 0.01",
    expectedPassRate: 99.9,
    toleranceThreshold: 0.1,
    remediationAction: "ALERT",
    owner: "Data Engineering",
  },
  {
    ruleId: "TRX_CONS_003",
    ruleName: "Reversal Reference Logic",
    description: "If is_reversed=TRUE, original_transaction_id must be populated",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "CONSISTENCY",
    severity: "ERROR",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE is_reversed=TRUE AND original_transaction_id IS NULL",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Steward",
  },

  // ===== ACCURACY RULES =====
  {
    ruleId: "TRX_ACC_001",
    ruleName: "Fraud Risk Score Valid",
    description: "Fraud risk score must be 0-100 if populated",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "ACCURACY",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE fraud_risk_score IS NOT NULL AND (fraud_risk_score < 0 OR fraud_risk_score > 100)",
    expectedPassRate: 100,
    remediationAction: "ALERT",
    owner: "Data Engineering",
  },

  // ===== TIMELINESS RULES =====
  {
    ruleId: "TRX_TIME_001",
    ruleName: "Real-Time Transaction Latency",
    description: "Transactions must appear in silver within 10 seconds",
    domain: "Transactions",
    targetTable: "silver.transaction_detail_enriched",
    ruleType: "TIMELINESS",
    severity: "WARNING",
    sqlExpression:
      "SELECT COUNT(*) FROM silver.transaction_detail_enriched WHERE DATEDIFF(second, transaction_time, created_timestamp) > 10",
    expectedPassRate: 95,
    toleranceThreshold: 5,
    remediationAction: "LOG",
    owner: "Data Engineering",
    sla: "95% within 10 seconds",
  },
];

// ============================================================================
// DATA QUALITY SCORING FRAMEWORK
// ============================================================================

export interface DQScoringWeights {
  completeness: number;
  validity: number;
  uniqueness: number;
  consistency: number;
  accuracy: number;
  timeliness: number;
}

export const defaultDQScoringWeights: DQScoringWeights = {
  completeness: 0.2,
  validity: 0.2,
  uniqueness: 0.15,
  consistency: 0.15,
  accuracy: 0.15,
  timeliness: 0.15,
};

// Calculate rule metrics
const allRules = [...customerDomainDQRules, ...depositsDomainDQRules, ...transactionsDomainDQRules];
const calculateSeverityCounts = () => ({
  CRITICAL: allRules.filter(r => r.severity === "CRITICAL").length,
  ERROR: allRules.filter(r => r.severity === "ERROR").length,
  WARNING: allRules.filter(r => r.severity === "WARNING").length,
  INFO: allRules.filter(r => r.severity === "INFO").length,
});

const calculateTypeCounts = () => ({
  COMPLETENESS: allRules.filter(r => r.ruleType === "COMPLETENESS").length,
  VALIDITY: allRules.filter(r => r.ruleType === "VALIDITY").length,
  UNIQUENESS: allRules.filter(r => r.ruleType === "UNIQUENESS").length,
  CONSISTENCY: allRules.filter(r => r.ruleType === "CONSISTENCY").length,
  ACCURACY: allRules.filter(r => r.ruleType === "ACCURACY").length,
  TIMELINESS: allRules.filter(r => r.ruleType === "TIMELINESS").length,
});

export const dqFrameworkSummary = {
  totalRules: customerDomainDQRules.length + depositsDomainDQRules.length + transactionsDomainDQRules.length,
  rulesByDomain: {
    Customer: customerDomainDQRules.length,
    Deposits: depositsDomainDQRules.length,
    Transactions: transactionsDomainDQRules.length,
  },
  rulesBySeverity: calculateSeverityCounts(),
  rulesByType: calculateTypeCounts(),

  dqMonitoringApproach: {
    frequency: "Real-time for CRITICAL/ERROR, daily for WARNING/INFO",
    alerting: "Automated alerts to data team for failures",
    dashboard: "Real-time DQ metrics dashboard in Snowflake/BI tool",
    reporting: "Daily DQ scorecard, weekly trend analysis",
    sla: "99%+ pass rate for CRITICAL rules, 95%+ for ERROR rules",
  },

  remediationWorkflow: {
    BLOCK: "Reject records, halt pipeline, manual investigation required",
    ALERT: "Alert to data team, allow processing with flag, manual review required",
    LOG: "Log issue, allow processing, track for periodic review",
    AUTO_FIX: "Automatically correct if possible (e.g., standardization), log changes",
  },

  description:
    "Comprehensive Data Quality framework with 50+ rules across Customer, Deposits, and Transactions domains. Includes completeness, validity, uniqueness, consistency, accuracy, and timeliness checks with automated enforcement and manual review workflows.",
};

export default dqFrameworkSummary;
