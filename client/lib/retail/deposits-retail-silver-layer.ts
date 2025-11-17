/**
 * DEPOSITS-RETAIL SILVER LAYER - Complete Implementation
 * 
 * Domain: Deposits Retail
 * Area: Retail Banking
 * Purpose: Conformed deposit account data with MDM and SCD Type 2
 * 
 * All 15 silver tables for retail deposits domain
 */

export const depositsRetailSilverTables = [
  // Table 1: Account Golden Record
  {
    name: 'silver.retail_deposit_account_golden',
    description: 'Golden record for deposit accounts with MDM and SCD Type 2',
    grain: 'One row per account per effective date',
    scdType: 'Type 2',
    primaryKey: ['account_sk'],
    naturalKey: ['account_id'],
    sourceTables: ['bronze.retail_deposit_account_master'],
    
    schema: {
      account_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      account_id: "BIGINT",
      account_number: "STRING",
      account_uuid: "STRING",
      
      account_type: "STRING COMMENT 'DDA|Savings|MoneyMarket|CD'",
      account_subtype: "STRING",
      product_code: "STRING",
      product_name: "STRING",
      
      primary_customer_id: "BIGINT",
      ownership_type: "STRING",
      total_owners: "INTEGER",
      
      account_status: "STRING",
      account_open_date: "DATE",
      account_close_date: "DATE",
      account_maturity_date: "DATE",
      
      current_balance: "DECIMAL(18,2)",
      available_balance: "DECIMAL(18,2)",
      interest_rate_current: "DECIMAL(10,6)",
      
      branch_id: "BIGINT",
      region: "STRING",
      
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 2: Account Balances Daily Snapshot
  {
    name: 'silver.retail_deposit_balances_daily',
    description: 'Daily account balance snapshots with quality checks',
    grain: 'One row per account per day',
    scdType: 'Type 1',
    primaryKey: ['account_id', 'balance_date'],
    naturalKey: ['account_id', 'balance_date'],
    sourceTables: ['bronze.retail_deposit_account_balances_daily'],
    
    schema: {
      account_id: "BIGINT",
      balance_date: "DATE",
      
      opening_balance: "DECIMAL(18,2)",
      closing_balance: "DECIMAL(18,2)",
      average_balance: "DECIMAL(18,2)",
      
      minimum_balance: "DECIMAL(18,2)",
      maximum_balance: "DECIMAL(18,2)",
      
      total_deposits: "DECIMAL(18,2)",
      total_withdrawals: "DECIMAL(18,2)",
      net_change: "DECIMAL(18,2)",
      
      collected_balance: "DECIMAL(18,2)",
      available_balance: "DECIMAL(18,2)",
      hold_amount: "DECIMAL(18,2)",
      
      transaction_count: "INTEGER",
      deposit_count: "INTEGER",
      withdrawal_count: "INTEGER",
      
      interest_accrued: "DECIMAL(18,2)",
      fees_charged: "DECIMAL(18,2)",
      
      balance_validated: "BOOLEAN",
      data_quality_score: "DECIMAL(5,2)",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 3: Transactions Conformed
  {
    name: 'silver.retail_deposit_transactions_conformed',
    description: 'Conformed deposit transactions with enrichment',
    grain: 'One row per transaction',
    scdType: 'Type 1',
    primaryKey: ['transaction_id'],
    naturalKey: ['transaction_id'],
    sourceTables: ['bronze.retail_deposit_transactions'],
    
    schema: {
      transaction_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      transaction_date: "DATE",
      transaction_time: "TIMESTAMP",
      post_date: "DATE",
      value_date: "DATE",
      
      transaction_type: "STRING COMMENT 'Deposit|Withdrawal|Transfer|Fee|Interest'",
      transaction_code: "STRING",
      transaction_description: "STRING",
      
      amount: "DECIMAL(18,2)",
      transaction_sign: "STRING COMMENT 'Debit|Credit'",
      
      balance_before: "DECIMAL(18,2)",
      balance_after: "DECIMAL(18,2)",
      
      channel: "STRING COMMENT 'ATM|Branch|Online|Mobile|ACH|Wire'",
      location_id: "BIGINT",
      
      merchant_name: "STRING",
      merchant_category: "STRING",
      
      reference_number: "STRING",
      check_number: "STRING",
      
      is_reversal: "BOOLEAN",
      reversed_transaction_id: "BIGINT",
      
      hold_placed: "BOOLEAN",
      hold_amount: "DECIMAL(18,2)",
      hold_release_date: "DATE",
      
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 4: Account Owners Golden
  {
    name: 'silver.retail_deposit_owners_golden',
    description: 'Account ownership with relationship types',
    grain: 'One row per account-owner relationship',
    scdType: 'Type 2',
    primaryKey: ['account_owner_sk'],
    naturalKey: ['account_id', 'customer_id'],
    sourceTables: ['bronze.retail_deposit_account_holders'],
    
    schema: {
      account_owner_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      account_id: "BIGINT",
      customer_id: "BIGINT",
      
      ownership_role: "STRING COMMENT 'Primary|Joint|Beneficiary|Custodian|Trustee'",
      ownership_percentage: "DECIMAL(5,2)",
      
      relationship_start_date: "DATE",
      relationship_end_date: "DATE",
      
      is_authorized_signer: "BOOLEAN",
      signing_authority: "STRING COMMENT 'Single|Joint|Either'",
      
      is_primary_contact: "BOOLEAN",
      statement_recipient: "BOOLEAN",
      
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 5: Interest Accruals Conformed
  {
    name: 'silver.retail_deposit_interest_accruals',
    description: 'Daily interest accruals with rate tracking',
    grain: 'One row per account per day',
    scdType: 'Type 1',
    primaryKey: ['account_id', 'accrual_date'],
    naturalKey: ['account_id', 'accrual_date'],
    sourceTables: ['bronze.retail_deposit_interest_accruals'],
    
    schema: {
      account_id: "BIGINT",
      accrual_date: "DATE",
      
      interest_rate: "DECIMAL(10,6) COMMENT 'APY'",
      rate_tier: "STRING",
      
      balance_for_interest: "DECIMAL(18,2)",
      
      interest_earned: "DECIMAL(18,2)",
      interest_accrued_mtd: "DECIMAL(18,2)",
      interest_accrued_ytd: "DECIMAL(18,2)",
      
      interest_paid: "DECIMAL(18,2)",
      interest_paid_ytd: "DECIMAL(18,2)",
      
      compounding_frequency: "STRING COMMENT 'Daily|Monthly|Quarterly|Annual'",
      days_in_period: "INTEGER",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 6: Fees Assessed Conformed
  {
    name: 'silver.retail_deposit_fees_assessed',
    description: 'Fees charged on deposit accounts',
    grain: 'One row per fee assessment',
    scdType: 'Type 1',
    primaryKey: ['fee_id'],
    naturalKey: ['fee_id'],
    sourceTables: ['bronze.retail_deposit_fees'],
    
    schema: {
      fee_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      fee_date: "DATE",
      fee_post_date: "DATE",
      
      fee_type: "STRING COMMENT 'Monthly|Overdraft|NSF|ATM|Wire|Stop Payment'",
      fee_code: "STRING",
      fee_description: "STRING",
      
      fee_amount: "DECIMAL(10,2)",
      
      fee_waived: "BOOLEAN",
      waiver_reason: "STRING",
      waived_by: "STRING",
      
      fee_reason: "STRING",
      triggering_transaction_id: "BIGINT",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 7: Statements Golden
  {
    name: 'silver.retail_deposit_statements_golden',
    description: 'Monthly account statements',
    grain: 'One row per account per statement period',
    scdType: 'Type 1',
    primaryKey: ['statement_id'],
    naturalKey: ['account_id', 'statement_date'],
    sourceTables: ['bronze.retail_deposit_statements'],
    
    schema: {
      statement_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      statement_date: "DATE",
      statement_period_start: "DATE",
      statement_period_end: "DATE",
      
      opening_balance: "DECIMAL(18,2)",
      closing_balance: "DECIMAL(18,2)",
      
      total_deposits: "DECIMAL(18,2)",
      total_withdrawals: "DECIMAL(18,2)",
      
      total_fees: "DECIMAL(18,2)",
      total_interest_paid: "DECIMAL(18,2)",
      
      average_daily_balance: "DECIMAL(18,2)",
      
      transaction_count: "INTEGER",
      days_in_period: "INTEGER",
      
      statement_delivery_method: "STRING COMMENT 'Paper|Electronic|Suppressed'",
      statement_sent_date: "DATE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 8: Overdrafts Conformed
  {
    name: 'silver.retail_deposit_overdrafts',
    description: 'Overdraft events and coverage',
    grain: 'One row per overdraft event',
    scdType: 'Type 1',
    primaryKey: ['overdraft_id'],
    naturalKey: ['overdraft_id'],
    sourceTables: ['bronze.retail_deposit_overdrafts'],
    
    schema: {
      overdraft_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      overdraft_date: "DATE",
      overdraft_amount: "DECIMAL(18,2)",
      
      trigger_transaction_id: "BIGINT",
      
      overdraft_protection_type: "STRING COMMENT 'None|Linked Account|LOC|Standard'",
      coverage_source: "STRING",
      coverage_amount: "DECIMAL(18,2)",
      
      nsf_fee_charged: "DECIMAL(10,2)",
      overdraft_fee_charged: "DECIMAL(10,2)",
      
      returned_items_count: "INTEGER",
      
      cleared_date: "DATE",
      days_overdrawn: "INTEGER",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 9: Transfers Conformed
  {
    name: 'silver.retail_deposit_transfers',
    description: 'Internal and external transfers',
    grain: 'One row per transfer',
    scdType: 'Type 1',
    primaryKey: ['transfer_id'],
    naturalKey: ['transfer_id'],
    sourceTables: ['bronze.retail_deposit_transfers'],
    
    schema: {
      transfer_id: "BIGINT PRIMARY KEY",
      
      from_account_id: "BIGINT",
      to_account_id: "BIGINT",
      
      transfer_date: "DATE",
      transfer_time: "TIMESTAMP",
      settlement_date: "DATE",
      
      transfer_amount: "DECIMAL(18,2)",
      
      transfer_type: "STRING COMMENT 'Internal|External|ACH|Wire'",
      transfer_method: "STRING",
      
      transfer_status: "STRING COMMENT 'Pending|Completed|Failed|Cancelled'",
      
      external_bank_name: "STRING",
      external_routing_number: "STRING",
      external_account_number: "STRING",
      
      initiated_by: "STRING COMMENT 'Customer|System|Employee'",
      initiation_channel: "STRING",
      
      is_recurring: "BOOLEAN",
      recurrence_frequency: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 10: Checks Conformed
  {
    name: 'silver.retail_deposit_checks',
    description: 'Check transactions and clearing',
    grain: 'One row per check',
    scdType: 'Type 1',
    primaryKey: ['check_id'],
    naturalKey: ['account_id', 'check_number'],
    sourceTables: ['bronze.retail_deposit_checks'],
    
    schema: {
      check_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      check_number: "STRING",
      check_amount: "DECIMAL(18,2)",
      
      check_date: "DATE",
      clear_date: "DATE",
      post_date: "DATE",
      
      payee_name: "STRING",
      
      check_status: "STRING COMMENT 'Cleared|Pending|Returned|Stop Payment|Void'",
      
      return_reason: "STRING",
      return_fee: "DECIMAL(10,2)",
      
      stop_payment_placed: "BOOLEAN",
      stop_payment_date: "DATE",
      stop_payment_fee: "DECIMAL(10,2)",
      
      check_image_available: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 11: Holds Conformed
  {
    name: 'silver.retail_deposit_holds',
    description: 'Funds on hold tracking',
    grain: 'One row per hold',
    scdType: 'Type 1',
    primaryKey: ['hold_id'],
    naturalKey: ['hold_id'],
    sourceTables: ['bronze.retail_deposit_holds'],
    
    schema: {
      hold_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      hold_placed_date: "DATE",
      hold_release_date: "DATE",
      hold_amount: "DECIMAL(18,2)",
      
      hold_type: "STRING COMMENT 'Check Hold|Deposit Hold|Legal Hold|Fraud Hold'",
      hold_reason: "STRING",
      
      related_transaction_id: "BIGINT",
      
      hold_status: "STRING COMMENT 'Active|Released|Expired'",
      actual_release_date: "DATE",
      
      placed_by: "STRING",
      released_by: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 12: Product Features Golden
  {
    name: 'silver.retail_deposit_product_features',
    description: 'Product configuration and features per account',
    grain: 'One row per account per effective date',
    scdType: 'Type 2',
    primaryKey: ['account_product_sk'],
    naturalKey: ['account_id'],
    sourceTables: ['bronze.retail_deposit_account_master'],
    
    schema: {
      account_product_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      account_id: "BIGINT",
      
      product_code: "STRING",
      product_tier: "STRING",
      
      minimum_balance_required: "DECIMAL(18,2)",
      monthly_fee: "DECIMAL(10,2)",
      
      fee_waiver_balance: "DECIMAL(18,2)",
      fee_waiver_direct_deposit: "BOOLEAN",
      
      interest_bearing: "BOOLEAN",
      interest_rate_tier: "STRING",
      
      overdraft_protection_enabled: "BOOLEAN",
      overdraft_protection_type: "STRING",
      
      atm_withdrawals_free_count: "INTEGER",
      atm_withdrawal_fee: "DECIMAL(10,2)",
      
      check_writing_allowed: "BOOLEAN",
      debit_card_linked: "BOOLEAN",
      
      online_banking_enabled: "BOOLEAN",
      mobile_banking_enabled: "BOOLEAN",
      
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 13: Rate Changes History
  {
    name: 'silver.retail_deposit_rate_changes_history',
    description: 'Interest rate change history',
    grain: 'One row per rate change per account',
    scdType: 'Type 1',
    primaryKey: ['rate_change_id'],
    naturalKey: ['account_id', 'effective_date'],
    sourceTables: ['bronze.retail_deposit_rate_changes'],
    
    schema: {
      rate_change_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      effective_date: "DATE",
      prior_rate: "DECIMAL(10,6)",
      new_rate: "DECIMAL(10,6)",
      rate_change_percent: "DECIMAL(10,6)",
      
      change_reason: "STRING COMMENT 'Fed Rate Change|Promotional|Balance Tier|Product Change'",
      
      rate_tier: "STRING",
      promotional: "BOOLEAN",
      promotion_end_date: "DATE",
      
      notice_sent_date: "DATE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 14: Regulatory Events Conformed
  {
    name: 'silver.retail_deposit_regulatory_events',
    description: 'Regulatory compliance events (Reg D, CTR, SAR)',
    grain: 'One row per regulatory event',
    scdType: 'Type 1',
    primaryKey: ['regulatory_event_id'],
    naturalKey: ['regulatory_event_id'],
    sourceTables: ['bronze.retail_deposit_reg_d_violations'],
    
    schema: {
      regulatory_event_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      event_date: "DATE",
      event_type: "STRING COMMENT 'Reg D Violation|CTR|SAR|Large Cash'",
      
      regulation: "STRING COMMENT 'Reg D|BSA|OFAC|CTR|SAR'",
      
      violation_count: "INTEGER",
      warning_sent: "BOOLEAN",
      penalty_assessed: "DECIMAL(10,2)",
      
      transaction_amount: "DECIMAL(18,2)",
      transaction_id: "BIGINT",
      
      filing_required: "BOOLEAN",
      filing_date: "DATE",
      filing_reference: "STRING",
      
      notes: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 15: Account Lifecycle Events
  {
    name: 'silver.retail_deposit_lifecycle_events',
    description: 'Account lifecycle milestones and status changes',
    grain: 'One row per lifecycle event',
    scdType: 'Type 1',
    primaryKey: ['lifecycle_event_id'],
    naturalKey: ['account_id', 'event_date', 'event_type'],
    sourceTables: ['bronze.retail_deposit_account_events'],
    
    schema: {
      lifecycle_event_id: "BIGINT PRIMARY KEY",
      account_id: "BIGINT",
      
      event_date: "DATE",
      event_type: "STRING COMMENT 'Opened|Closed|Dormant|Reactivated|Frozen|Unfrozen|Product Change'",
      
      prior_status: "STRING",
      new_status: "STRING",
      
      event_reason: "STRING",
      initiated_by: "STRING COMMENT 'Customer|System|Compliance|Employee'",
      
      related_account_id: "BIGINT COMMENT 'For product changes/consolidations'",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
];

export const depositsRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail deposits domain with MDM and SCD2',
  layer: 'SILVER',
  tables: depositsRetailSilverTables,
  totalTables: 15,
  estimatedSize: '600GB',
  dataQualityTargets: {
    completeness: '95%+',
    accuracy: '99%+',
    consistency: '98%+',
  },
};
