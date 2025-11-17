/**
 * CARDS-RETAIL SILVER LAYER - Complete Implementation
 * 
 * Domain: Cards Retail
 * Area: Retail Banking
 * Purpose: Golden records for card accounts, transactions, rewards, fraud
 * 
 * All 18 silver tables for retail cards domain
 * MDM, SCD Type 2, data quality standards applied
 */

export const cardsRetailSilverTables = [
  // Table 1: Card Account Master Golden Record
  {
    name: 'silver.retail_card_account_master_golden',
    description: 'Golden record for card accounts with MDM, deduplication, and SCD Type 2 history',
    grain: 'One current row per unique card account',
    scdType: 'Type 2',
    
    primaryKey: ['card_account_sk'],
    naturalKey: ['card_account_id'],
    
    sourceTables: [
      'bronze.retail_card_account_master',
      'bronze.retail_card_product_catalog',
    ],
    
    deduplicationLogic: {
      matchingKeys: ['card_account_number_hash', 'primary_cardholder_id'],
      survivorshipRules: [
        { attribute: 'credit_limit', rule: 'Highest value from most recent update' },
        { attribute: 'account_status', rule: 'Most recent status change' },
        { attribute: 'product_code', rule: 'Most frequently used or highest tier product' },
      ],
    },
    
    schema: {
      // SURROGATE KEY
      card_account_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Surrogate key for silver layer'",
      
      // NATURAL KEYS
      card_account_id: "BIGINT UNIQUE COMMENT 'Business account ID'",
      card_account_uuid: "STRING UNIQUE COMMENT 'Global UUID'",
      card_account_number_hash: "STRING COMMENT 'Hashed account number (PCI compliant)'",
      
      // CARD TYPE & CLASSIFICATION
      card_type: "STRING COMMENT 'Credit|Debit|Prepaid'",
      card_subtype: "STRING COMMENT 'Standard|Gold|Platinum|Secured'",
      card_category: "STRING COMMENT 'Consumer|Business'",
      card_network: "STRING COMMENT 'Visa|Mastercard|Amex|Discover'",
      
      product_code: "STRING",
      product_name: "STRING",
      
      // ACCOUNT STATUS & LIFECYCLE
      account_status: "STRING COMMENT 'Active|Inactive|Closed|Frozen|Suspended'",
      account_status_date: "DATE",
      account_status_reason: "STRING",
      account_open_date: "DATE",
      account_close_date: "DATE",
      account_age_months: "INTEGER",
      
      // CARDHOLDER
      primary_cardholder_sk: "BIGINT COMMENT 'FK to dim_customer'",
      primary_cardholder_id: "BIGINT",
      authorized_user_count: "INTEGER",
      
      // CREDIT LIMIT & BALANCES (Credit Cards)
      credit_limit: "DECIMAL(18,2)",
      current_balance: "DECIMAL(18,2)",
      available_credit: "DECIMAL(18,2)",
      
      cash_advance_limit: "DECIMAL(18,2)",
      cash_advance_balance: "DECIMAL(18,2)",
      
      purchase_balance: "DECIMAL(18,2)",
      balance_transfer_balance: "DECIMAL(18,2)",
      
      minimum_payment_due: "DECIMAL(18,2)",
      payment_due_date: "DATE",
      last_payment_date: "DATE",
      last_payment_amount: "DECIMAL(18,2)",
      
      // INTEREST RATES (Credit Cards)
      purchase_apr: "DECIMAL(10,6)",
      cash_advance_apr: "DECIMAL(10,6)",
      balance_transfer_apr: "DECIMAL(10,6)",
      penalty_apr: "DECIMAL(10,6)",
      current_apr: "DECIMAL(10,6)",
      apr_type: "STRING COMMENT 'Fixed|Variable'",
      
      // UTILIZATION
      credit_utilization_ratio: "DECIMAL(5,2) COMMENT 'Percentage'",
      utilization_tier: "STRING COMMENT 'Low|Medium|High|Very High'",
      
      // BILLING CYCLE
      billing_cycle_day: "INTEGER",
      statement_close_date: "DATE",
      next_statement_date: "DATE",
      grace_period_days: "INTEGER",
      
      // FEES
      annual_fee: "DECIMAL(18,2)",
      has_annual_fee_waiver: "BOOLEAN",
      annual_fee_due_date: "DATE",
      
      late_payment_fee: "DECIMAL(18,2)",
      over_limit_fee: "DECIMAL(18,2)",
      cash_advance_fee: "DECIMAL(18,2)",
      balance_transfer_fee: "DECIMAL(18,2)",
      foreign_transaction_fee_pct: "DECIMAL(5,2)",
      
      fees_charged_ytd: "DECIMAL(18,2)",
      interest_charged_ytd: "DECIMAL(18,2)",
      
      // REWARDS
      rewards_program_id: "BIGINT",
      rewards_program_name: "STRING",
      rewards_tier: "STRING",
      rewards_balance: "DECIMAL(18,2)",
      rewards_earned_ytd: "DECIMAL(18,2)",
      rewards_redeemed_ytd: "DECIMAL(18,2)",
      
      // DELINQUENCY
      days_past_due: "INTEGER",
      delinquency_status: "STRING COMMENT 'Current|30DPD|60DPD|90DPD|120+DPD|ChargeOff'",
      delinquent_amount: "DECIMAL(18,2)",
      missed_payment_count_12mo: "INTEGER",
      last_delinquency_date: "DATE",
      
      // PAYMENT BEHAVIOR
      autopay_enrolled: "BOOLEAN",
      autopay_amount_type: "STRING COMMENT 'Minimum|Statement Balance|Fixed Amount'",
      autopay_account_id: "BIGINT",
      typical_payment_behavior: "STRING COMMENT 'Full Pay|Revolver|Transactor'",
      
      // USAGE PATTERNS
      last_transaction_date: "DATE",
      last_purchase_date: "DATE",
      last_cash_advance_date: "DATE",
      
      transactions_mtd: "INTEGER",
      purchase_volume_mtd: "DECIMAL(18,2)",
      transactions_12mo: "INTEGER",
      purchase_volume_12mo: "DECIMAL(18,2)",
      
      // DIGITAL FEATURES
      digital_wallet_enabled: "BOOLEAN",
      contactless_enabled: "BOOLEAN",
      virtual_card_number_active: "BOOLEAN",
      
      // SECURITY
      chip_enabled: "BOOLEAN",
      pin_set: "BOOLEAN",
      fraud_alerts_enabled: "BOOLEAN",
      transaction_alerts_enabled: "BOOLEAN",
      fraud_blocks_ytd: "INTEGER",
      
      // SECURED CARD
      is_secured: "BOOLEAN",
      security_deposit_amount: "DECIMAL(18,2)",
      security_deposit_account_id: "BIGINT",
      
      // SCD TYPE 2 (REQUIRED)
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // DATA QUALITY METRICS (REQUIRED)
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      accuracy_score: "DECIMAL(5,2)",
      consistency_score: "DECIMAL(5,2)",
      timeliness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      match_confidence_score: "DECIMAL(5,2)",
      
      // AUDIT TRAIL (REQUIRED)
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Physical Card Golden Record
  {
    name: 'silver.retail_card_physical_cards_golden',
    description: 'Golden record for physical cards issued to cardholders',
    grain: 'One current row per physical card',
    scdType: 'Type 2',
    
    primaryKey: ['physical_card_sk'],
    naturalKey: ['card_number_hash'],
    
    sourceTables: ['bronze.retail_card_physical_cards'],
    
    schema: {
      physical_card_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      card_number_hash: "STRING UNIQUE COMMENT 'Hashed PAN for PCI compliance'",
      card_number_encrypted: "STRING COMMENT 'Encrypted full card number'",
      
      card_account_sk: "BIGINT COMMENT 'FK to card account golden'",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT COMMENT 'FK to customer golden'",
      cardholder_id: "BIGINT",
      
      card_type: "STRING COMMENT 'Primary|Authorized User|Replacement'",
      
      card_issue_date: "DATE",
      card_expiration_date: "DATE COMMENT 'MM/YY expiration'",
      card_activation_date: "DATE",
      
      card_status: "STRING COMMENT 'Active|Lost|Stolen|Expired|Cancelled|Inactive'",
      card_status_date: "DATE",
      
      embossed_name: "STRING COMMENT 'Name printed on card'",
      
      card_design: "STRING COMMENT 'Card design variant'",
      card_material: "STRING COMMENT 'Plastic|Metal'",
      
      chip_serial_number: "STRING COMMENT 'EMV chip serial number'",
      is_chip_enabled: "BOOLEAN",
      is_contactless_enabled: "BOOLEAN",
      
      replacement_for_card_number: "STRING COMMENT 'Previous card if replacement'",
      replacement_reason: "STRING COMMENT 'Lost|Stolen|Damaged|Expired|Fraud|Upgrade'",
      
      is_digital_wallet_enrolled: "BOOLEAN COMMENT 'Apple Pay, Google Pay, Samsung Pay'",
      digital_wallet_tokens_count: "INTEGER",
      
      // SCD TYPE 2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      accuracy_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Posted Transactions Golden
  {
    name: 'silver.retail_card_transactions_posted_golden',
    description: 'Golden record of posted and settled card transactions',
    grain: 'One row per posted transaction',
    scdType: 'Type 1',
    
    primaryKey: ['posted_transaction_sk'],
    naturalKey: ['transaction_id'],
    
    sourceTables: ['bronze.retail_card_transactions_posted'],
    
    partitioning: {
      type: 'RANGE',
      column: 'transaction_date',
      ranges: ['Monthly partitions'],
    },
    
    schema: {
      posted_transaction_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      transaction_id: "BIGINT UNIQUE",
      authorization_id: "BIGINT COMMENT 'FK to original authorization'",
      
      card_account_sk: "BIGINT COMMENT 'FK to card account golden'",
      card_account_id: "BIGINT",
      
      physical_card_sk: "BIGINT COMMENT 'FK to physical card'",
      card_number_hash: "STRING",
      
      cardholder_sk: "BIGINT COMMENT 'FK to customer golden'",
      cardholder_id: "BIGINT",
      
      transaction_date_key: "INTEGER COMMENT 'FK to dim_date'",
      transaction_date: "DATE",
      transaction_timestamp: "TIMESTAMP",
      
      posting_date_key: "INTEGER COMMENT 'FK to dim_date'",
      posting_date: "DATE",
      posting_timestamp: "TIMESTAMP",
      
      transaction_type: "STRING COMMENT 'Purchase|Cash Advance|Fee|Interest|Payment|Refund|Adjustment'",
      transaction_category: "STRING COMMENT 'POS|E-Commerce|Recurring|ATM|Manual'",
      
      transaction_amount: "DECIMAL(18,2) COMMENT 'Transaction amount in card currency'",
      transaction_currency: "STRING COMMENT 'ISO 4217 currency code'",
      
      merchant_name: "STRING",
      merchant_id: "STRING COMMENT 'Merchant ID (MID)'",
      merchant_category_code: "STRING COMMENT 'MCC 4-digit code'",
      merchant_category: "STRING COMMENT 'Human-readable category'",
      
      merchant_city: "STRING",
      merchant_state: "STRING",
      merchant_country: "STRING COMMENT 'ISO 3166-1 alpha-2'",
      merchant_postal_code: "STRING",
      
      pos_entry_mode: "STRING COMMENT 'Chip|Swipe|Contactless|Manual|E-Commerce'",
      card_present: "BOOLEAN",
      cardholder_present: "BOOLEAN",
      
      terminal_id: "STRING",
      terminal_type: "STRING COMMENT 'POS|ATM|E-Commerce|MOTO|Recurring'",
      
      is_posted: "BOOLEAN DEFAULT TRUE",
      is_reversal: "BOOLEAN",
      reversal_reason: "STRING",
      
      is_dispute: "BOOLEAN",
      dispute_id: "BIGINT COMMENT 'FK to dispute record'",
      
      fraud_score: "INTEGER COMMENT 'Fraud risk score at posting (0-100)'",
      fraud_flag: "BOOLEAN",
      
      rewards_earned_points: "DECIMAL(18,2)",
      rewards_earned_cash_value: "DECIMAL(10,2)",
      
      interchange_fee_amount: "DECIMAL(10,4) COMMENT 'Interchange revenue'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      accuracy_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: Authorization Transactions Golden
  {
    name: 'silver.retail_card_authorizations_golden',
    description: 'Golden record of card authorization requests (real-time)',
    grain: 'One row per authorization request',
    scdType: 'Type 1',
    
    primaryKey: ['authorization_sk'],
    naturalKey: ['authorization_id'],
    
    sourceTables: ['bronze.retail_card_authorizations'],
    
    partitioning: {
      type: 'RANGE',
      column: 'authorization_timestamp',
      ranges: ['Hourly partitions for real-time querying'],
    },
    
    schema: {
      authorization_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      authorization_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      physical_card_sk: "BIGINT",
      card_number_hash: "STRING",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      authorization_timestamp: "TIMESTAMP COMMENT 'Exact authorization time'",
      authorization_date: "DATE",
      authorization_date_key: "INTEGER COMMENT 'FK to dim_date'",
      
      transaction_type: "STRING COMMENT 'Purchase|Cash Advance|Balance Transfer'",
      transaction_category: "STRING COMMENT 'POS|E-Commerce|Recurring|ATM'",
      
      authorization_amount: "DECIMAL(18,2)",
      authorization_currency: "STRING",
      
      authorization_status: "STRING COMMENT 'Approved|Declined|Partial Approval'",
      decline_reason: "STRING COMMENT 'Insufficient Funds|Fraud Suspected|Invalid PIN|Over Limit'",
      
      merchant_name: "STRING",
      merchant_id: "STRING",
      merchant_category_code: "STRING",
      merchant_category: "STRING",
      merchant_city: "STRING",
      merchant_state: "STRING",
      merchant_country: "STRING",
      
      pos_entry_mode: "STRING COMMENT 'Chip|Swipe|Contactless|Manual|E-Commerce'",
      card_present: "BOOLEAN",
      cardholder_present: "BOOLEAN",
      
      terminal_id: "STRING",
      terminal_type: "STRING",
      
      cvv_result: "STRING COMMENT 'Match|No Match|Not Provided'",
      avs_result: "STRING COMMENT 'Address Verification System result'",
      three_d_secure_flag: "BOOLEAN",
      pin_verified: "BOOLEAN",
      
      fraud_score: "INTEGER COMMENT '0-100'",
      fraud_flag: "BOOLEAN",
      fraud_reason: "STRING",
      
      approval_code: "STRING",
      response_code: "STRING COMMENT 'ISO 8583 response code'",
      
      reversed_flag: "BOOLEAN",
      reversal_timestamp: "TIMESTAMP",
      reversal_reason: "STRING",
      
      posted_flag: "BOOLEAN COMMENT 'Has this authorization posted?'",
      posted_transaction_sk: "BIGINT COMMENT 'FK to posted transaction'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 5: Statements Golden
  {
    name: 'silver.retail_card_statements_golden',
    description: 'Golden record of monthly card billing statements',
    grain: 'One row per card account per statement period',
    scdType: 'Type 1',
    
    primaryKey: ['statement_sk'],
    naturalKey: ['card_account_id', 'statement_date'],
    
    sourceTables: ['bronze.retail_card_statements'],
    
    schema: {
      statement_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      statement_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      statement_date: "DATE COMMENT 'Statement closing date'",
      statement_date_key: "INTEGER",
      
      statement_period_start: "DATE",
      statement_period_end: "DATE",
      days_in_period: "INTEGER",
      
      previous_balance: "DECIMAL(18,2)",
      payments_credits: "DECIMAL(18,2)",
      purchases: "DECIMAL(18,2)",
      cash_advances: "DECIMAL(18,2)",
      balance_transfers: "DECIMAL(18,2)",
      fees_charged: "DECIMAL(18,2)",
      interest_charged: "DECIMAL(18,2)",
      new_balance: "DECIMAL(18,2)",
      
      credit_limit: "DECIMAL(18,2)",
      available_credit: "DECIMAL(18,2)",
      
      minimum_payment_due: "DECIMAL(18,2)",
      payment_due_date: "DATE",
      
      purchase_count: "INTEGER",
      cash_advance_count: "INTEGER",
      fee_count: "INTEGER",
      
      purchase_apr: "DECIMAL(10,6)",
      cash_advance_apr: "DECIMAL(10,6)",
      
      rewards_earned_this_period: "DECIMAL(18,2)",
      rewards_balance: "DECIMAL(18,2)",
      
      days_past_due: "INTEGER",
      late_payment_flag: "BOOLEAN",
      
      statement_delivery_method: "STRING COMMENT 'Paper|Email|Online'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 6: Payments Golden
  {
    name: 'silver.retail_card_payments_golden',
    description: 'Golden record of card payment transactions',
    grain: 'One row per payment',
    scdType: 'Type 1',
    
    primaryKey: ['payment_sk'],
    naturalKey: ['payment_id'],
    
    sourceTables: ['bronze.retail_card_payments'],
    
    schema: {
      payment_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      payment_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      payment_date: "DATE",
      payment_date_key: "INTEGER",
      payment_timestamp: "TIMESTAMP",
      
      payment_amount: "DECIMAL(18,2)",
      payment_method: "STRING COMMENT 'ACH|Check|Wire|Cash|Transfer|Online|Mobile|AutoPay'",
      payment_channel: "STRING COMMENT 'Branch|Online|Mobile|Phone|ATM|Mail'",
      
      payment_type: "STRING COMMENT 'Minimum|Statement Balance|Custom Amount|Full Balance'",
      
      is_autopay: "BOOLEAN",
      is_late_payment: "BOOLEAN",
      days_late: "INTEGER",
      
      payment_source_account_id: "BIGINT COMMENT 'Source deposit account if internal transfer'",
      payment_source_account_sk: "BIGINT",
      
      payment_confirmation_number: "STRING",
      
      payment_status: "STRING COMMENT 'Posted|Pending|Returned|Failed'",
      payment_status_date: "DATE",
      return_reason: "STRING COMMENT 'NSF|Account Closed|Stop Payment'",
      
      statement_balance_at_payment: "DECIMAL(18,2)",
      minimum_due_at_payment: "DECIMAL(18,2)",
      
      late_fee_assessed: "DECIMAL(18,2)",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 7: Rewards Earned Golden
  {
    name: 'silver.retail_card_rewards_earned_golden',
    description: 'Golden record of rewards points/cash earned by cardholders',
    grain: 'One row per rewards earning event',
    scdType: 'Type 1',
    
    primaryKey: ['rewards_earned_sk'],
    naturalKey: ['rewards_earned_id'],
    
    sourceTables: ['bronze.retail_card_rewards_earned'],
    
    schema: {
      rewards_earned_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      rewards_earned_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      transaction_sk: "BIGINT COMMENT 'FK to posted transaction'",
      transaction_id: "BIGINT",
      
      rewards_program_id: "BIGINT",
      rewards_program_name: "STRING",
      
      earned_date: "DATE",
      earned_date_key: "INTEGER",
      earned_timestamp: "TIMESTAMP",
      
      rewards_type: "STRING COMMENT 'Points|Cash Back|Miles|Other'",
      
      points_earned: "DECIMAL(18,2)",
      cash_value: "DECIMAL(10,2) COMMENT 'Cash equivalent value'",
      
      earning_rate: "DECIMAL(10,6) COMMENT 'Points per dollar or percentage'",
      earning_category: "STRING COMMENT 'Base|Bonus|Promotional|Referral'",
      merchant_category: "STRING COMMENT 'Category that earned bonus points'",
      
      transaction_amount: "DECIMAL(18,2) COMMENT 'Transaction that earned rewards'",
      
      promotional_offer_id: "BIGINT COMMENT 'If part of promotion'",
      
      expiration_date: "DATE COMMENT 'Rewards expiration if applicable'",
      is_expired: "BOOLEAN",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 8: Rewards Redeemed Golden
  {
    name: 'silver.retail_card_rewards_redeemed_golden',
    description: 'Golden record of rewards redemptions by cardholders',
    grain: 'One row per redemption transaction',
    scdType: 'Type 1',
    
    primaryKey: ['redemption_sk'],
    naturalKey: ['redemption_id'],
    
    sourceTables: ['bronze.retail_card_rewards_redeemed'],
    
    schema: {
      redemption_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      redemption_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      rewards_program_id: "BIGINT",
      rewards_program_name: "STRING",
      
      redemption_date: "DATE",
      redemption_date_key: "INTEGER",
      redemption_timestamp: "TIMESTAMP",
      
      redemption_type: "STRING COMMENT 'Statement Credit|Travel|Merchandise|Gift Card|Transfer|Cash'",
      
      points_redeemed: "DECIMAL(18,2)",
      cash_value: "DECIMAL(10,2)",
      
      redemption_value: "DECIMAL(10,2) COMMENT 'Actual value received'",
      redemption_rate: "DECIMAL(10,6) COMMENT 'Cents per point'",
      
      redemption_category: "STRING COMMENT 'Travel|Dining|Shopping|Cash|Other'",
      
      merchant_name: "STRING COMMENT 'If redeemed at merchant'",
      
      redemption_channel: "STRING COMMENT 'Online|Mobile|Phone|Branch'",
      
      redemption_status: "STRING COMMENT 'Completed|Pending|Cancelled|Reversed'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 9: Fees Golden
  {
    name: 'silver.retail_card_fees_golden',
    description: 'Golden record of card fees assessed',
    grain: 'One row per fee assessment',
    scdType: 'Type 1',
    
    primaryKey: ['fee_sk'],
    naturalKey: ['fee_id'],
    
    sourceTables: ['bronze.retail_card_fees'],
    
    schema: {
      fee_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      fee_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      fee_date: "DATE",
      fee_date_key: "INTEGER",
      fee_timestamp: "TIMESTAMP",
      
      fee_type: "STRING COMMENT 'Annual|Late Payment|Over Limit|Cash Advance|Balance Transfer|Foreign Transaction|Returned Payment'",
      fee_category: "STRING COMMENT 'Account|Transaction|Service'",
      
      fee_amount: "DECIMAL(18,2)",
      
      transaction_id: "BIGINT COMMENT 'Related transaction if applicable'",
      transaction_sk: "BIGINT",
      
      fee_waived: "BOOLEAN",
      waiver_reason: "STRING COMMENT 'Customer Request|First Time|Goodwill|Retention'",
      waived_by: "STRING COMMENT 'User or process that waived fee'",
      waiver_date: "DATE",
      
      fee_reversed: "BOOLEAN",
      reversal_reason: "STRING",
      reversal_date: "DATE",
      
      is_regulatory_compliant: "BOOLEAN COMMENT 'Fee complies with CARD Act limits'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 10: Interest Charges Golden
  {
    name: 'silver.retail_card_interest_charges_golden',
    description: 'Golden record of interest charges assessed on card accounts',
    grain: 'One row per interest assessment',
    scdType: 'Type 1',
    
    primaryKey: ['interest_charge_sk'],
    naturalKey: ['interest_charge_id'],
    
    sourceTables: ['bronze.retail_card_interest_charges'],
    
    schema: {
      interest_charge_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      interest_charge_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      charge_date: "DATE",
      charge_date_key: "INTEGER",
      
      interest_type: "STRING COMMENT 'Purchase|Cash Advance|Balance Transfer'",
      
      interest_amount: "DECIMAL(18,2)",
      
      balance_subject_to_interest: "DECIMAL(18,2) COMMENT 'Average daily balance'",
      
      apr_applied: "DECIMAL(10,6)",
      days_in_period: "INTEGER",
      
      statement_id: "BIGINT COMMENT 'FK to statement'",
      statement_sk: "BIGINT",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 11: Disputes Golden
  {
    name: 'silver.retail_card_disputes_golden',
    description: 'Golden record of transaction disputes and chargebacks',
    grain: 'One row per dispute case',
    scdType: 'Type 2',
    
    primaryKey: ['dispute_sk'],
    naturalKey: ['dispute_id'],
    
    sourceTables: ['bronze.retail_card_disputes'],
    
    schema: {
      dispute_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      dispute_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      transaction_sk: "BIGINT COMMENT 'FK to disputed transaction'",
      transaction_id: "BIGINT",
      
      dispute_date: "DATE COMMENT 'Date dispute filed'",
      dispute_date_key: "INTEGER",
      
      dispute_type: "STRING COMMENT 'Fraud|Quality|Service|Billing Error|Unauthorized'",
      dispute_reason: "STRING",
      dispute_reason_code: "STRING COMMENT 'Reason code per card network'",
      
      disputed_amount: "DECIMAL(18,2)",
      
      transaction_date: "DATE COMMENT 'Date of disputed transaction'",
      merchant_name: "STRING",
      
      dispute_status: "STRING COMMENT 'Open|Under Investigation|Resolved-Customer Favor|Resolved-Merchant Favor|Withdrawn'",
      dispute_status_date: "DATE",
      
      provisional_credit_issued: "BOOLEAN",
      provisional_credit_amount: "DECIMAL(18,2)",
      provisional_credit_date: "DATE",
      
      chargeback_filed: "BOOLEAN",
      chargeback_date: "DATE",
      chargeback_amount: "DECIMAL(18,2)",
      
      resolution_date: "DATE",
      resolution_type: "STRING COMMENT 'Customer Won|Merchant Won|Settled|Withdrawn'",
      
      final_credit_amount: "DECIMAL(18,2) COMMENT 'Final amount returned to customer'",
      
      network_case_number: "STRING COMMENT 'Visa/MC case number'",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 12: Fraud Cases Golden
  {
    name: 'silver.retail_card_fraud_cases_golden',
    description: 'Golden record of confirmed fraud cases',
    grain: 'One row per fraud case',
    scdType: 'Type 2',
    
    primaryKey: ['fraud_case_sk'],
    naturalKey: ['fraud_case_id'],
    
    sourceTables: ['bronze.retail_card_fraud_cases', 'bronze.retail_card_fraud_alerts'],
    
    schema: {
      fraud_case_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      fraud_case_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      physical_card_sk: "BIGINT",
      card_number_hash: "STRING",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      fraud_detection_date: "DATE",
      fraud_detection_date_key: "INTEGER",
      fraud_detection_timestamp: "TIMESTAMP",
      
      fraud_type: "STRING COMMENT 'Card Not Present|Card Present|Account Takeover|Application Fraud|Identity Theft'",
      fraud_category: "STRING COMMENT 'First Party|Third Party|Friendly'",
      
      detection_method: "STRING COMMENT 'System Alert|Customer Report|Merchant Report|Manual Review'",
      
      fraud_amount: "DECIMAL(18,2) COMMENT 'Total fraudulent amount'",
      transaction_count: "INTEGER COMMENT 'Number of fraudulent transactions'",
      
      first_fraud_transaction_date: "DATE",
      last_fraud_transaction_date: "DATE",
      
      fraud_status: "STRING COMMENT 'Under Investigation|Confirmed|False Positive|Unresolved'",
      fraud_status_date: "DATE",
      
      card_blocked: "BOOLEAN",
      card_block_date: "DATE",
      
      card_reissued: "BOOLEAN",
      card_reissue_date: "DATE",
      new_card_number_hash: "STRING",
      
      customer_liability_amount: "DECIMAL(18,2)",
      bank_liability_amount: "DECIMAL(18,2)",
      
      resolution_date: "DATE",
      resolution_type: "STRING",
      
      law_enforcement_notified: "BOOLEAN",
      law_enforcement_case_number: "STRING",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 13: Authorized Users Golden
  {
    name: 'silver.retail_card_authorized_users_golden',
    description: 'Golden record of authorized users on card accounts',
    grain: 'One row per authorized user per card account',
    scdType: 'Type 2',
    
    primaryKey: ['authorized_user_sk'],
    naturalKey: ['card_account_id', 'authorized_user_id'],
    
    sourceTables: ['bronze.retail_card_authorized_users'],
    
    schema: {
      authorized_user_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      card_account_sk: "BIGINT COMMENT 'FK to primary card account'",
      card_account_id: "BIGINT",
      
      primary_cardholder_sk: "BIGINT COMMENT 'FK to primary cardholder'",
      primary_cardholder_id: "BIGINT",
      
      authorized_user_sk_ref: "BIGINT COMMENT 'FK to customer dimension'",
      authorized_user_id: "BIGINT",
      
      authorized_user_name: "STRING",
      relationship_to_primary: "STRING COMMENT 'Spouse|Child|Parent|Sibling|Employee|Other'",
      
      authorization_date: "DATE COMMENT 'Date authorized user added'",
      authorization_status: "STRING COMMENT 'Active|Inactive|Removed'",
      authorization_status_date: "DATE",
      
      authorized_user_card_number_hash: "STRING COMMENT 'Hash of AU card number'",
      authorized_user_card_issue_date: "DATE",
      authorized_user_card_status: "STRING",
      
      spending_limit: "DECIMAL(18,2) COMMENT 'Individual spending limit if set'",
      has_spending_limit: "BOOLEAN",
      
      removal_date: "DATE",
      removal_reason: "STRING",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 14: Credit Limit Changes Golden
  {
    name: 'silver.retail_card_credit_limit_changes_golden',
    description: 'Golden record of credit limit changes over time',
    grain: 'One row per credit limit change event',
    scdType: 'Type 1',
    
    primaryKey: ['credit_limit_change_sk'],
    naturalKey: ['change_id'],
    
    sourceTables: ['bronze.retail_card_credit_limit_changes'],
    
    schema: {
      credit_limit_change_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      change_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      change_date: "DATE",
      change_date_key: "INTEGER",
      change_timestamp: "TIMESTAMP",
      
      previous_credit_limit: "DECIMAL(18,2)",
      new_credit_limit: "DECIMAL(18,2)",
      credit_limit_change_amount: "DECIMAL(18,2) COMMENT 'Can be positive or negative'",
      credit_limit_change_pct: "DECIMAL(10,6) COMMENT 'Percentage change'",
      
      change_type: "STRING COMMENT 'Increase|Decrease|Temporary Increase|Restoration'",
      change_reason: "STRING COMMENT 'Customer Request|Automatic Review|Credit Score Change|Risk Adjustment|Regulatory'",
      
      initiated_by: "STRING COMMENT 'Customer|Bank|Automatic Process'",
      
      approval_status: "STRING COMMENT 'Approved|Denied|Pending'",
      approval_date: "DATE",
      approved_by: "STRING",
      
      denial_reason: "STRING",
      
      temporary_increase_flag: "BOOLEAN",
      temporary_increase_expiration_date: "DATE",
      
      fico_score_at_change: "INTEGER",
      utilization_at_change: "DECIMAL(5,2)",
      days_past_due_at_change: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 15: Balance Transfers Golden
  {
    name: 'silver.retail_card_balance_transfers_golden',
    description: 'Golden record of balance transfer transactions',
    grain: 'One row per balance transfer',
    scdType: 'Type 1',
    
    primaryKey: ['balance_transfer_sk'],
    naturalKey: ['balance_transfer_id'],
    
    sourceTables: ['bronze.retail_card_balance_transfers'],
    
    schema: {
      balance_transfer_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      balance_transfer_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT COMMENT 'Receiving account'",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      transfer_date: "DATE",
      transfer_date_key: "INTEGER",
      transfer_timestamp: "TIMESTAMP",
      
      transfer_amount: "DECIMAL(18,2)",
      transfer_fee: "DECIMAL(18,2)",
      transfer_fee_pct: "DECIMAL(5,2) COMMENT 'Fee as percentage'",
      
      from_creditor_name: "STRING COMMENT 'External card issuer'",
      from_account_last_four: "STRING COMMENT 'Last 4 digits of external account'",
      
      promotional_apr: "DECIMAL(10,6)",
      promotional_period_months: "INTEGER",
      promotional_end_date: "DATE",
      
      standard_apr_after_promo: "DECIMAL(10,6)",
      
      transfer_status: "STRING COMMENT 'Completed|Pending|Failed|Cancelled'",
      transfer_status_date: "DATE",
      failure_reason: "STRING",
      
      promotional_offer_id: "BIGINT COMMENT 'FK to promotional offer'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 16: Cash Advances Golden
  {
    name: 'silver.retail_card_cash_advances_golden',
    description: 'Golden record of cash advance transactions',
    grain: 'One row per cash advance',
    scdType: 'Type 1',
    
    primaryKey: ['cash_advance_sk'],
    naturalKey: ['cash_advance_id'],
    
    sourceTables: ['bronze.retail_card_cash_advances'],
    
    schema: {
      cash_advance_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      cash_advance_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      physical_card_sk: "BIGINT",
      card_number_hash: "STRING",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      transaction_sk: "BIGINT COMMENT 'FK to posted transaction'",
      transaction_id: "BIGINT",
      
      cash_advance_date: "DATE",
      cash_advance_date_key: "INTEGER",
      cash_advance_timestamp: "TIMESTAMP",
      
      cash_advance_amount: "DECIMAL(18,2)",
      cash_advance_fee: "DECIMAL(18,2)",
      cash_advance_fee_pct: "DECIMAL(5,2)",
      
      cash_advance_apr: "DECIMAL(10,6)",
      
      cash_advance_type: "STRING COMMENT 'ATM|Branch|Convenience Check|Direct Deposit'",
      
      atm_id: "STRING COMMENT 'ATM ID if ATM withdrawal'",
      atm_location: "STRING",
      atm_network: "STRING COMMENT 'In Network|Out of Network'",
      
      branch_id: "BIGINT COMMENT 'Branch ID if branch withdrawal'",
      
      cash_advance_limit_before: "DECIMAL(18,2)",
      cash_advance_limit_after: "DECIMAL(18,2)",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 17: Promotional Offers Golden
  {
    name: 'silver.retail_card_promotional_offers_golden',
    description: 'Golden record of promotional offers applied to card accounts',
    grain: 'One row per promotional offer per account',
    scdType: 'Type 2',
    
    primaryKey: ['promo_offer_sk'],
    naturalKey: ['card_account_id', 'promo_offer_id'],
    
    sourceTables: ['bronze.retail_card_promotional_offers'],
    
    schema: {
      promo_offer_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      promo_offer_id: "BIGINT",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      promo_type: "STRING COMMENT 'Intro APR|Balance Transfer|Bonus Rewards|No Annual Fee|Sign-Up Bonus'",
      promo_name: "STRING",
      promo_description: "STRING",
      
      promo_start_date: "DATE",
      promo_end_date: "DATE",
      promo_duration_months: "INTEGER",
      
      promo_apr: "DECIMAL(10,6) COMMENT 'If APR promotion'",
      standard_apr_after_promo: "DECIMAL(10,6)",
      
      bonus_rewards_multiplier: "DECIMAL(5,2) COMMENT 'If bonus rewards (e.g., 5x points)'",
      bonus_rewards_category: "STRING COMMENT 'Dining|Gas|Travel|All'",
      
      sign_up_bonus_amount: "DECIMAL(18,2) COMMENT 'Bonus points/cash'",
      sign_up_bonus_spend_requirement: "DECIMAL(18,2) COMMENT 'Minimum spend requirement'",
      sign_up_bonus_timeframe_days: "INTEGER",
      sign_up_bonus_earned: "BOOLEAN",
      sign_up_bonus_earned_date: "DATE",
      
      annual_fee_waiver_first_year: "BOOLEAN",
      
      promo_status: "STRING COMMENT 'Active|Expired|Cancelled|Completed'",
      promo_status_date: "DATE",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 18: Account Alerts Golden
  {
    name: 'silver.retail_card_account_alerts_golden',
    description: 'Golden record of alerts sent to cardholders',
    grain: 'One row per alert sent',
    scdType: 'Type 1',
    
    primaryKey: ['alert_sk'],
    naturalKey: ['alert_id'],
    
    sourceTables: ['bronze.retail_card_account_alerts'],
    
    schema: {
      alert_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      alert_id: "BIGINT UNIQUE",
      
      card_account_sk: "BIGINT",
      card_account_id: "BIGINT",
      
      cardholder_sk: "BIGINT",
      cardholder_id: "BIGINT",
      
      alert_date: "DATE",
      alert_date_key: "INTEGER",
      alert_timestamp: "TIMESTAMP",
      
      alert_type: "STRING COMMENT 'Transaction|Fraud|Payment Due|Payment Posted|Limit Approaching|Security|Promotional'",
      alert_category: "STRING COMMENT 'Informational|Warning|Critical'",
      
      alert_channel: "STRING COMMENT 'Email|SMS|Push Notification|In-App'",
      
      alert_subject: "STRING",
      alert_message: "STRING",
      
      transaction_id: "BIGINT COMMENT 'Related transaction if applicable'",
      transaction_sk: "BIGINT",
      
      alert_sent: "BOOLEAN",
      alert_sent_timestamp: "TIMESTAMP",
      
      alert_delivered: "BOOLEAN",
      alert_delivery_timestamp: "TIMESTAMP",
      
      alert_opened: "BOOLEAN",
      alert_opened_timestamp: "TIMESTAMP",
      
      alert_action_taken: "BOOLEAN COMMENT 'Customer took action'",
      alert_action_type: "STRING COMMENT 'Confirmed|Disputed|Ignored'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
];

export const cardsRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail cards domain with MDM and SCD2',
  layer: 'SILVER',
  tables: cardsRetailSilverTables,
  totalTables: 18,
  estimatedSize: '600GB',
  refreshFrequency: 'Hourly',
  dataQuality: {
    completenessTarget: 95,
    accuracyTarget: 99,
    consistencyTarget: 98,
    timelinessTarget: 99.5,
  },
  retention: '7 years',
};
