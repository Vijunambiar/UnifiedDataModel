/**
 * DEPOSITS-COMMERCIAL BRONZE LAYER
 * Raw data layer for commercial deposit accounts and treasury services
 * 
 * Domain: Deposits-Commercial
 * Area: Commercial Banking
 * Layer: BRONZE (Raw/Landing Zone)
 * Tables: 22
 * 
 * Coverage: Checking, savings, money market, CDs, sweep accounts, lockbox, positive pay,
 *           ACH origination, wire transfers, account analysis, cash management services
 */

export const depositsCommercialBronzeTables = [
  // Table 1: Deposit Account Master
  {
    name: 'bronze.commercial_deposit_accounts',
    description: 'Master data for all commercial deposit accounts including checking, savings, money market, and CDs',
    sourceSystem: 'CORE_BANKING',
    sourceTable: 'DEPOSIT_ACCOUNT_MASTER',
    loadType: 'CDC',
    
    grain: 'One row per deposit account',
    primaryKey: ['account_id', 'source_system'],
    
    schema: {
      // Primary Identifiers
      account_id: "BIGINT PRIMARY KEY COMMENT 'Unique account identifier'",
      source_system: "STRING PRIMARY KEY",
      global_account_id: "STRING COMMENT 'Cross-system unique ID'",
      account_number: "STRING NOT NULL COMMENT 'Customer-facing account number (masked)'",
      
      // Customer & Relationship
      entity_id: "BIGINT NOT NULL COMMENT 'FK to commercial entity (account owner)'",
      relationship_id: "BIGINT",
      primary_account_holder_name: "STRING",
      
      // Account Classification
      account_type: "STRING NOT NULL COMMENT 'CHECKING|SAVINGS|MONEY_MARKET|CD|SWEEP|ESCROW'",
      account_subtype: "STRING",
      account_purpose: "STRING COMMENT 'OPERATING|PAYROLL|CONCENTRATION|DISBURSEMENT|LOCKBOX'",
      
      // Product Details
      product_code: "STRING",
      product_name: "STRING",
      product_category: "STRING COMMENT 'DDA|SAVINGS|TIME_DEPOSIT|TREASURY_MGMT'",
      
      // Opening
      account_open_date: "DATE NOT NULL",
      opening_deposit: "DECIMAL(18,2)",
      opening_channel: "STRING COMMENT 'BRANCH|ONLINE|PHONE|RELATIONSHIP_MANAGER'",
      opened_by_employee_id: "BIGINT",
      
      // Balances (as of load timestamp)
      current_balance: "DECIMAL(18,2) NOT NULL",
      available_balance: "DECIMAL(18,2) COMMENT 'Current - holds'",
      ledger_balance: "DECIMAL(18,2)",
      collected_balance: "DECIMAL(18,2) COMMENT 'Funds available for withdrawal'",
      
      // Balance Requirements
      minimum_balance_required: "DECIMAL(18,2)",
      minimum_balance_to_avoid_fee: "DECIMAL(18,2)",
      average_monthly_balance: "DECIMAL(18,2)",
      average_daily_balance_mtd: "DECIMAL(18,2)",
      
      // Interest Terms
      interest_bearing_flag: "BOOLEAN",
      current_interest_rate: "DECIMAL(7,4) COMMENT 'Annual percentage yield'",
      interest_rate_tier: "STRING",
      interest_accrued_mtd: "DECIMAL(18,2)",
      interest_paid_ytd: "DECIMAL(18,2)",
      interest_calculation_method: "STRING COMMENT 'DAILY_BALANCE|AVERAGE_DAILY|MIN_BALANCE'",
      
      // CD-Specific Fields
      maturity_date: "DATE COMMENT 'For CDs and time deposits'",
      original_term_months: "INTEGER",
      auto_renewal_flag: "BOOLEAN",
      early_withdrawal_penalty_amount: "DECIMAL(18,2)",
      
      // Overdraft Protection
      overdraft_protection_flag: "BOOLEAN",
      overdraft_protection_source: "STRING COMMENT 'LINKED_SAVINGS|LINE_OF_CREDIT|CREDIT_CARD'",
      overdraft_limit: "DECIMAL(18,2)",
      overdraft_balance: "DECIMAL(18,2) COMMENT 'Current overdraft amount'",
      
      // Sweep Arrangements
      sweep_account_flag: "BOOLEAN",
      sweep_type: "STRING COMMENT 'OVERNIGHT|INTRADAY|WEEKLY'",
      target_balance: "DECIMAL(18,2) COMMENT 'Sweep threshold'",
      sweep_to_account_id: "BIGINT COMMENT 'Destination account'",
      
      // Treasury Services
      lockbox_account_flag: "BOOLEAN",
      lockbox_number: "STRING",
      positive_pay_enrolled_flag: "BOOLEAN",
      ach_origination_enabled: "BOOLEAN",
      wire_transfer_enabled: "BOOLEAN",
      zba_account_flag: "BOOLEAN COMMENT 'Zero Balance Account'",
      controlled_disbursement_flag: "BOOLEAN",
      
      // Fees
      monthly_maintenance_fee: "DECIMAL(18,2)",
      fees_charged_mtd: "DECIMAL(18,2)",
      fees_charged_ytd: "DECIMAL(18,2)",
      fee_waiver_flag: "BOOLEAN",
      fee_waiver_reason: "STRING",
      
      // Transaction Limits
      daily_withdrawal_limit: "DECIMAL(18,2)",
      daily_deposit_limit: "DECIMAL(18,2)",
      monthly_transaction_limit: "INTEGER COMMENT 'Reg D limit for savings'",
      transactions_count_mtd: "INTEGER",
      
      // Account Analysis
      account_analysis_enrolled: "BOOLEAN COMMENT 'Earnings credit rate (ECR) account'",
      earnings_credit_rate: "DECIMAL(7,4)",
      reserve_requirement_pct: "DECIMAL(5,2) COMMENT 'Fed reserve requirement'",
      
      // Status
      account_status: "STRING NOT NULL COMMENT 'ACTIVE|DORMANT|FROZEN|CLOSED|ESCHEATMENT'",
      dormancy_date: "DATE COMMENT 'Date account became dormant'",
      frozen_flag: "BOOLEAN",
      frozen_reason: "STRING COMMENT 'FRAUD|GARNISHMENT|LEGAL_HOLD|DECEASED'",
      closed_date: "DATE",
      closure_reason: "STRING",
      
      // Regulatory
      fdic_insured_flag: "BOOLEAN DEFAULT TRUE",
      fdic_insurance_limit: "DECIMAL(18,2) DEFAULT 250000",
      cif_number: "STRING COMMENT 'Customer Information File number'",
      
      // Escrow Accounts
      escrow_type: "STRING COMMENT 'REAL_ESTATE|CONSTRUCTION|LEGAL|TAX'",
      escrow_beneficiary_name: "STRING",
      
      // Relationship Management
      relationship_manager_id: "BIGINT",
      assigned_branch_id: "BIGINT",
      service_tier: "STRING COMMENT 'BASIC|PREMIUM|ELITE'",
      
      // Activity Metrics
      last_transaction_date: "DATE",
      last_deposit_date: "DATE",
      last_withdrawal_date: "DATE",
      days_since_last_activity: "INTEGER",
      
      // Profitability
      ytd_revenue: "DECIMAL(18,2) COMMENT 'Interest expense + fee income'",
      ytd_cost_to_serve: "DECIMAL(18,2)",
      ytd_net_income: "DECIMAL(18,2)",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Daily Account Balances
  {
    name: 'bronze.commercial_account_balances_daily',
    description: 'Daily snapshot of account balances for all commercial deposit accounts',
    sourceSystem: 'CORE_BANKING',
    sourceTable: 'DAILY_BALANCES',
    loadType: 'BATCH',
    
    grain: 'One row per account per day',
    primaryKey: ['account_id', 'balance_date', 'source_system'],
    
    schema: {
      account_id: "BIGINT NOT NULL",
      balance_date: "DATE NOT NULL",
      source_system: "STRING PRIMARY KEY",
      
      // Opening/Closing Balances
      opening_ledger_balance: "DECIMAL(18,2)",
      closing_ledger_balance: "DECIMAL(18,2)",
      opening_available_balance: "DECIMAL(18,2)",
      closing_available_balance: "DECIMAL(18,2)",
      opening_collected_balance: "DECIMAL(18,2)",
      closing_collected_balance: "DECIMAL(18,2)",
      
      // Average Balances
      average_ledger_balance: "DECIMAL(18,2) COMMENT 'Intraday average'",
      average_collected_balance: "DECIMAL(18,2)",
      
      // Daily Activity
      total_credits: "DECIMAL(18,2) COMMENT 'Total deposits'",
      total_debits: "DECIMAL(18,2) COMMENT 'Total withdrawals'",
      credit_count: "INTEGER",
      debit_count: "INTEGER",
      
      // Holds & Reserves
      total_holds: "DECIMAL(18,2)",
      reserve_balance: "DECIMAL(18,2) COMMENT 'Fed reserve requirement'",
      
      // Interest
      interest_accrued: "DECIMAL(18,2)",
      
      // Overdraft
      overdraft_amount: "DECIMAL(18,2)",
      overdraft_fee: "DECIMAL(18,2)",
      
      source_system: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Account Transactions
  {
    name: 'bronze.commercial_account_transactions',
    description: 'All deposit account transactions including deposits, withdrawals, transfers, fees',
    sourceSystem: 'CORE_BANKING',
    sourceTable: 'ACCOUNT_TRANSACTIONS',
    loadType: 'CDC',
    
    grain: 'One row per transaction',
    primaryKey: ['transaction_id', 'source_system'],
    
    schema: {
      transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      account_id: "BIGINT NOT NULL",
      
      // Transaction Details
      transaction_date: "DATE NOT NULL",
      transaction_timestamp: "TIMESTAMP NOT NULL",
      post_date: "DATE COMMENT 'When transaction posted to ledger'",
      value_date: "DATE COMMENT 'When funds available'",
      
      transaction_type: "STRING NOT NULL COMMENT 'DEPOSIT|WITHDRAWAL|TRANSFER|FEE|INTEREST|ADJUSTMENT'",
      transaction_subtype: "STRING COMMENT 'CHECK|ACH|WIRE|CASH|ATM|MOBILE_DEPOSIT'",
      
      transaction_amount: "DECIMAL(18,2) NOT NULL",
      transaction_currency: "STRING DEFAULT 'USD'",
      
      debit_credit_indicator: "STRING NOT NULL COMMENT 'DEBIT|CREDIT'",
      
      // Transaction Details
      description: "STRING",
      reference_number: "STRING",
      check_number: "STRING",
      
      // Counterparty
      counterparty_name: "STRING",
      counterparty_account: "STRING",
      counterparty_bank_routing: "STRING",
      
      // Channel
      transaction_channel: "STRING COMMENT 'BRANCH|ATM|ONLINE|MOBILE|WIRE|ACH'",
      terminal_id: "STRING",
      branch_id: "BIGINT",
      
      // Status
      transaction_status: "STRING COMMENT 'POSTED|PENDING|REVERSED|FAILED'",
      reversal_flag: "BOOLEAN",
      original_transaction_id: "BIGINT COMMENT 'If this is a reversal'",
      
      // Balances After Transaction
      balance_after_transaction: "DECIMAL(18,2)",
      available_balance_after: "DECIMAL(18,2)",
      
      source_system: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  // Tables 4-22 continue...
  // For brevity showing condensed versions
  
  {
    name: 'bronze.commercial_lockbox_receipts',
    description: 'Lockbox payment receipts and remittance information',
    sourceSystem: 'LOCKBOX_PROCESSOR',
    loadType: 'BATCH',
    grain: 'One row per lockbox receipt',
    primaryKey: ['receipt_id', 'source_system'],
    schema: {
      receipt_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT NOT NULL",
      lockbox_number: "STRING",
      receipt_date: "DATE",
      deposit_amount: "DECIMAL(18,2)",
      check_count: "INTEGER",
      remittance_data: "JSON COMMENT 'Parsed remittance information'",
      processing_timestamp: "TIMESTAMP",
      source_system: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  {
    name: 'bronze.commercial_positive_pay_items',
    description: 'Positive pay check issue and exception items',
    sourceSystem: 'POSITIVE_PAY_SYSTEM',
    loadType: 'BATCH',
    grain: 'One row per check',
    primaryKey: ['positive_pay_item_id', 'source_system'],
    schema: {
      positive_pay_item_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT NOT NULL",
      check_number: "STRING NOT NULL",
      check_date: "DATE",
      check_amount: "DECIMAL(18,2)",
      payee_name: "STRING",
      issue_status: "STRING COMMENT 'ISSUED|PAID|VOID|STOP_PAYMENT|EXCEPTION'",
      exception_type: "STRING COMMENT 'AMOUNT_MISMATCH|PAYEE_MISMATCH|DUPLICATE|NOT_ISSUED'",
      decision: "STRING COMMENT 'PAY|RETURN|PENDING_REVIEW'",
      decision_date: "TIMESTAMP",
      source_system: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  {
    name: 'bronze.commercial_ach_origination',
    description: 'ACH origination transactions initiated by commercial customers',
    sourceSystem: 'ACH_ORIGINATION_SYSTEM',
    loadType: 'CDC',
    grain: 'One row per ACH transaction',
    primaryKey: ['ach_transaction_id', 'source_system'],
    schema: {
      ach_transaction_id: "BIGINT PRIMARY KEY",
      originating_account_id: "BIGINT NOT NULL",
      batch_id: "STRING",
      transaction_date: "DATE",
      effective_date: "DATE",
      settlement_date: "DATE",
      transaction_type: "STRING COMMENT 'DEBIT|CREDIT'",
      sec_code: "STRING COMMENT 'CCD|CTX|PPD|WEB|TEL'",
      amount: "DECIMAL(18,2)",
      receiver_name: "STRING",
      receiver_account: "STRING",
      receiver_routing: "STRING",
      status: "STRING COMMENT 'SUBMITTED|PROCESSED|RETURNED|SETTLED'",
      return_code: "STRING COMMENT 'R01-R99'",
      source_system: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  {
    name: 'bronze.commercial_wire_transfers',
    description: 'Domestic and international wire transfers',
    sourceSystem: 'WIRE_SYSTEM',
    loadType: 'CDC',
    grain: 'One row per wire',
    primaryKey: ['wire_id', 'source_system'],
    schema: {
      wire_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT NOT NULL",
      wire_direction: "STRING COMMENT 'OUTGOING|INCOMING'",
      wire_type: "STRING COMMENT 'DOMESTIC|INTERNATIONAL'",
      wire_date: "DATE",
      settlement_date: "DATE",
      amount: "DECIMAL(18,2)",
      currency: "STRING",
      beneficiary_name: "STRING",
      beneficiary_account: "STRING",
      beneficiary_bank: "STRING",
      swift_code: "STRING",
      wire_reference: "STRING",
      purpose_of_payment: "STRING",
      fee_amount: "DECIMAL(18,2)",
      status: "STRING COMMENT 'PENDING|SENT|RECEIVED|RETURNED|FAILED'",
      source_system: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  {
    name: 'bronze.commercial_account_analysis_statements',
    description: 'Monthly account analysis statements with service charges and earnings credits',
    sourceSystem: 'ACCOUNT_ANALYSIS_SYSTEM',
    loadType: 'BATCH',
    grain: 'One row per account per month',
    primaryKey: ['statement_id', 'source_system'],
    schema: {
      statement_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT NOT NULL",
      statement_month: "DATE NOT NULL COMMENT 'First day of month'",
      average_ledger_balance: "DECIMAL(18,2)",
      average_collected_balance: "DECIMAL(18,2)",
      reserve_requirement_amount: "DECIMAL(18,2)",
      investable_balance: "DECIMAL(18,2) COMMENT 'Collected - reserve'",
      earnings_credit_rate: "DECIMAL(7,4)",
      earnings_credit_allowance: "DECIMAL(18,2)",
      total_service_charges: "DECIMAL(18,2)",
      net_service_charge: "DECIMAL(18,2) COMMENT 'Charges - earnings credit'",
      transaction_volume: "INTEGER",
      source_system: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  {
    name: 'bronze.commercial_sweep_transactions',
    description: 'Sweep account movements between operating and investment accounts',
    sourceSystem: 'SWEEP_SYSTEM',
    loadType: 'BATCH',
    grain: 'One row per sweep transaction',
    primaryKey: ['sweep_id', 'source_system'],
    schema: {
      sweep_id: "BIGINT PRIMARY KEY",
      source_account_id: "BIGINT NOT NULL",
      target_account_id: "BIGINT NOT NULL",
      sweep_date: "DATE",
      sweep_amount: "DECIMAL(18,2)",
      sweep_type: "STRING COMMENT 'OVERNIGHT|INTRADAY|WEEKLY'",
      sweep_direction: "STRING COMMENT 'TO_INVESTMENT|TO_OPERATING'",
      target_balance_maintained: "DECIMAL(18,2)",
      source_system: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  // Additional tables 10-22:
  // - bronze.commercial_check_images
  // - bronze.commercial_rdc_deposits (Remote Deposit Capture)
  // - bronze.commercial_controlled_disbursement
  // - bronze.commercial_zba_transactions (Zero Balance Account)
  // - bronze.commercial_account_holds
  // - bronze.commercial_escheatment_tracking
  // - bronze.commercial_interest_accruals
  // - bronze.commercial_fee_assessments
  // - bronze.commercial_overdraft_events
  // - bronze.commercial_account_alerts
  // - bronze.commercial_fraud_alerts
  // - bronze.commercial_regulatory_reporting_extracts
  // - bronze.commercial_cash_concentration
];

export default depositsCommercialBronzeTables;
