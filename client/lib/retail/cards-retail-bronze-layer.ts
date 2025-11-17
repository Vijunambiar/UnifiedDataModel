/**
 * CARDS-RETAIL BRONZE LAYER - Complete Implementation
 * 
 * Domain: Cards Retail
 * Area: Retail Banking
 * Purpose: Credit cards, debit cards, card processing, rewards
 * 
 * All 24 bronze tables for retail cards domain
 * Industry-accurate, comprehensive, enterprise-ready
 */

export const cardsRetailBronzeTables = [
  // Table 1: Card Account Master
  {
    name: 'bronze.retail_card_account_master',
    description: 'Core credit and debit card account data',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'CARD_ACCOUNTS',
    loadType: 'CDC',
    
    grain: 'One row per card account',
    primaryKey: ['card_account_id', 'source_system'],
    
    estimatedRows: 75000000,
    avgRowSize: 2560,
    estimatedSize: '190GB',
    
    schema: {
      // PRIMARY KEYS
      card_account_id: "BIGINT PRIMARY KEY COMMENT 'Unique card account identifier'",
      source_system: "STRING PRIMARY KEY COMMENT 'TSYS|FISERV|FIS|etc.'",
      
      // NATURAL KEYS
      card_account_number: "STRING UNIQUE COMMENT 'Card account number (16 digits, encrypted)'",
      card_account_uuid: "STRING UNIQUE COMMENT 'Global UUID'",
      
      // CARD TYPE & CLASSIFICATION
      card_type: "STRING COMMENT 'Credit|Debit|Prepaid|Charge|ATM'",
      card_subtype: "STRING COMMENT 'Standard|Gold|Platinum|Secured|Student|Business'",
      card_category: "STRING COMMENT 'Consumer|Business|Commercial'",
      
      card_network: "STRING COMMENT 'Visa|Mastercard|American Express|Discover'",
      
      product_code: "STRING COMMENT 'Internal product SKU'",
      product_name: "STRING COMMENT 'Product marketing name (e.g., Platinum Rewards Card)'",
      
      // CARD STATUS & LIFECYCLE
      card_status: "STRING COMMENT 'Active|Inactive|Suspended|Closed|Frozen|Lost|Stolen'",
      card_status_date: "DATE COMMENT 'Date of current status'",
      card_status_reason: "STRING",
      
      account_open_date: "DATE COMMENT 'Card account open date'",
      account_close_date: "DATE COMMENT 'Account close date if closed'",
      account_age_months: "INTEGER COMMENT 'Months since account opening'",
      
      // CARDHOLDER
      primary_cardholder_id: "BIGINT COMMENT 'FK to primary cardholder (customer)'",
      authorized_user_count: "INTEGER COMMENT 'Number of authorized users'",
      
      // CREDIT LIMIT & BALANCES (Credit Cards)
      credit_limit: "DECIMAL(18,2) COMMENT 'Total credit limit'",
      current_balance: "DECIMAL(18,2) COMMENT 'Current outstanding balance'",
      available_credit: "DECIMAL(18,2) COMMENT 'Available to spend'",
      
      cash_advance_limit: "DECIMAL(18,2) COMMENT 'Cash advance sublimit'",
      cash_advance_balance: "DECIMAL(18,2) COMMENT 'Cash advance balance'",
      
      purchase_balance: "DECIMAL(18,2) COMMENT 'Purchase balance'",
      balance_transfer_balance: "DECIMAL(18,2) COMMENT 'Balance transfer amount'",
      
      minimum_payment_due: "DECIMAL(18,2) COMMENT 'Minimum payment amount'",
      payment_due_date: "DATE COMMENT 'Payment due date'",
      last_payment_date: "DATE COMMENT 'Date of last payment'",
      last_payment_amount: "DECIMAL(18,2)",
      
      // INTEREST RATES (Credit Cards)
      purchase_apr: "DECIMAL(10,6) COMMENT 'Purchase APR (decimal)'",
      cash_advance_apr: "DECIMAL(10,6) COMMENT 'Cash advance APR'",
      balance_transfer_apr: "DECIMAL(10,6) COMMENT 'Balance transfer APR'",
      penalty_apr: "DECIMAL(10,6) COMMENT 'Penalty APR for late payments'",
      
      current_apr: "DECIMAL(10,6) COMMENT 'Effective APR'",
      apr_type: "STRING COMMENT 'Fixed|Variable'",
      
      // UTILIZATION
      credit_utilization_ratio: "DECIMAL(5,2) COMMENT 'Balance / Limit %'",
      utilization_tier: "STRING COMMENT 'Low (<30%)|Medium (30-50%)|High (50-75%)|Very High (75%+)'",
      
      // BILLING CYCLE
      billing_cycle_day: "INTEGER COMMENT 'Day of month for statement close (1-31)'",
      statement_close_date: "DATE COMMENT 'Last statement closing date'",
      next_statement_date: "DATE COMMENT 'Next statement closing date'",
      
      grace_period_days: "INTEGER COMMENT 'Grace period in days (typically 21-25)'",
      
      // FEES
      annual_fee: "DECIMAL(18,2) COMMENT 'Annual membership fee'",
      annual_fee_waived: "BOOLEAN COMMENT 'Fee waiver status'",
      annual_fee_due_date: "DATE",
      
      late_payment_fee: "DECIMAL(18,2) COMMENT 'Standard late payment fee'",
      over_limit_fee: "DECIMAL(18,2) COMMENT 'Over limit fee'",
      cash_advance_fee: "DECIMAL(18,2) COMMENT 'Cash advance fee'",
      balance_transfer_fee: "DECIMAL(18,2) COMMENT 'Balance transfer fee'",
      foreign_transaction_fee_pct: "DECIMAL(5,2) COMMENT 'Foreign transaction fee %'",
      
      fees_charged_ytd: "DECIMAL(18,2) COMMENT 'Total fees charged YTD'",
      interest_charged_ytd: "DECIMAL(18,2) COMMENT 'Total interest charged YTD'",
      
      // REWARDS PROGRAM
      rewards_program_id: "BIGINT COMMENT 'FK to rewards program'",
      rewards_program_name: "STRING COMMENT 'Program name (e.g., Cash Back, Points, Miles)'",
      rewards_tier: "STRING COMMENT 'Member tier (Silver, Gold, Platinum)'",
      
      rewards_balance: "DECIMAL(18,2) COMMENT 'Current rewards points/cash balance'",
      rewards_earned_ytd: "DECIMAL(18,2) COMMENT 'Rewards earned YTD'",
      rewards_redeemed_ytd: "DECIMAL(18,2) COMMENT 'Rewards redeemed YTD'",
      
      // DELINQUENCY
      days_past_due: "INTEGER COMMENT 'Current days past due'",
      delinquency_status: "STRING COMMENT 'Current|30DPD|60DPD|90DPD|120+DPD|ChargeOff'",
      delinquent_amount: "DECIMAL(18,2)",
      
      missed_payment_count_12mo: "INTEGER COMMENT 'Missed payments last 12 months'",
      last_delinquency_date: "DATE",
      
      // PAYMENT BEHAVIOR
      autopay_enrolled: "BOOLEAN COMMENT 'Automatic payment enrolled'",
      autopay_amount_type: "STRING COMMENT 'Minimum|Statement Balance|Fixed Amount'",
      autopay_account_id: "BIGINT COMMENT 'Linked deposit account for autopay'",
      
      typical_payment_behavior: "STRING COMMENT 'Full Pay|Revolver|Transactor'",
      
      // USAGE PATTERNS
      last_transaction_date: "DATE COMMENT 'Date of last transaction'",
      last_purchase_date: "DATE",
      last_cash_advance_date: "DATE",
      
      transactions_mtd: "INTEGER COMMENT 'Transactions month-to-date'",
      purchase_volume_mtd: "DECIMAL(18,2) COMMENT 'Purchase volume MTD'",
      
      transactions_12mo: "INTEGER COMMENT 'Transactions last 12 months'",
      purchase_volume_12mo: "DECIMAL(18,2)",
      
      // DIGITAL FEATURES
      digital_wallet_enabled: "BOOLEAN COMMENT 'Apple Pay, Google Pay, Samsung Pay'",
      contactless_enabled: "BOOLEAN COMMENT 'Contactless/tap to pay'",
      virtual_card_number: "STRING COMMENT 'Virtual card number for online shopping'",
      
      // SECURITY
      chip_enabled: "BOOLEAN COMMENT 'EMV chip card'",
      pin_set: "BOOLEAN COMMENT 'PIN has been set'",
      
      fraud_alerts_enabled: "BOOLEAN",
      transaction_alerts_enabled: "BOOLEAN",
      
      fraud_blocks_ytd: "INTEGER COMMENT 'Number of fraud blocks YTD'",
      
      // CREDIT LINE MANAGEMENT
      last_credit_limit_increase_date: "DATE",
      last_credit_limit_increase_amount: "DECIMAL(18,2)",
      credit_limit_review_date: "DATE COMMENT 'Next scheduled CL review'",
      
      temporary_limit_increase_amount: "DECIMAL(18,2) COMMENT 'Temporary increase for specific purpose'",
      temporary_limit_expiration_date: "DATE",
      
      // SECURED CARD (if applicable)
      is_secured: "BOOLEAN COMMENT 'Secured credit card flag'",
      security_deposit_amount: "DECIMAL(18,2) COMMENT 'Deposit held for secured card'",
      security_deposit_account_id: "BIGINT COMMENT 'Account holding security deposit'",
      
      // BALANCE TRANSFERS
      balance_transfer_offer_flag: "BOOLEAN COMMENT 'Currently has BT offer'",
      balance_transfer_promo_apr: "DECIMAL(10,6) COMMENT 'Promotional BT APR'",
      balance_transfer_promo_end_date: "DATE",
      
      // PROMOTIONAL RATES
      intro_apr_flag: "BOOLEAN COMMENT 'Introductory APR active'",
      intro_apr_rate: "DECIMAL(10,6)",
      intro_apr_end_date: "DATE",
      
      // STATEMENTS & COMMUNICATIONS
      statement_delivery_method: "STRING COMMENT 'Paper|Email|Online Portal'",
      paperless_enrolled: "BOOLEAN",
      paperless_enrollment_date: "DATE",
      
      // REGULATORY & COMPLIANCE
      credit_card_act_compliant: "BOOLEAN COMMENT 'CARD Act compliance'",
      schumer_box_disclosure_date: "DATE COMMENT 'Terms disclosure date'",
      
      ability_to_pay_verified: "BOOLEAN COMMENT 'CARD Act income verification'",
      income_verification_date: "DATE",
      
      // CARD REISSUE
      card_expiration_date: "DATE COMMENT 'Physical card expiration (MM/YY)'",
      card_reissue_date: "DATE COMMENT 'Date new card issued'",
      
      // CREDIT BUREAU REPORTING
      report_to_credit_bureaus: "BOOLEAN COMMENT 'Account reported to bureaus'",
      
      // AUDIT TRAIL (REQUIRED)
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Physical Cards
  {
    name: 'bronze.retail_card_physical_cards',
    description: 'Physical card plastic details for each card issued',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'CARDS',
    loadType: 'CDC',
    
    grain: 'One row per physical card (can have multiple per account)',
    primaryKey: ['card_number_hash', 'source_system'],
    
    schema: {
      card_number_hash: "STRING PRIMARY KEY COMMENT 'Hashed card number (PCI compliance)'",
      card_number_encrypted: "STRING COMMENT 'Encrypted full card number'",
      source_system: "STRING PRIMARY KEY",
      
      card_account_id: "BIGINT COMMENT 'FK to card account'",
      cardholder_id: "BIGINT COMMENT 'FK to cardholder (primary or authorized user)'",
      
      card_type: "STRING COMMENT 'Primary|Authorized User|Replacement'",
      
      card_issue_date: "DATE COMMENT 'Date card issued'",
      card_expiration_date: "DATE COMMENT 'Card expiration (MM/YY)'",
      card_activation_date: "DATE COMMENT 'Date card activated'",
      
      card_status: "STRING COMMENT 'Active|Inactive|Lost|Stolen|Expired|Cancelled'",
      card_status_date: "DATE",
      
      cvv_hash: "STRING COMMENT 'Hashed CVV code'",
      
      embossed_name: "STRING COMMENT 'Name on card'",
      
      card_design: "STRING COMMENT 'Card design variant'",
      card_material: "STRING COMMENT 'Plastic|Metal'",
      
      chip_serial_number: "STRING COMMENT 'EMV chip serial'",
      
      replacement_for_card_number: "STRING COMMENT 'Previous card if replacement'",
      replacement_reason: "STRING COMMENT 'Lost|Stolen|Damaged|Expired|Fraud'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Card Transactions (Authorizations)
  {
    name: 'bronze.retail_card_authorizations',
    description: 'Real-time card authorization requests',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'AUTHORIZATIONS',
    loadType: 'STREAMING',
    
    grain: 'One row per authorization request',
    primaryKey: ['authorization_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'authorization_timestamp',
      ranges: ['Hourly partitions'],
    },
    
    schema: {
      authorization_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      card_account_id: "BIGINT",
      card_number_hash: "STRING",
      
      authorization_timestamp: "TIMESTAMP COMMENT 'Exact authorization time'",
      authorization_date: "DATE",
      
      transaction_type: "STRING COMMENT 'Purchase|Cash Advance|Balance Transfer|Fee|Adjustment'",
      transaction_category: "STRING COMMENT 'POS|E-Commerce|Recurring|ATM|Manual'",
      
      authorization_amount: "DECIMAL(18,2) COMMENT 'Authorization amount in card currency'",
      authorization_currency: "STRING COMMENT 'ISO 4217 currency code'",
      
      authorization_status: "STRING COMMENT 'Approved|Declined|Partial Approval'",
      decline_reason: "STRING COMMENT 'Insufficient Funds|Fraud Suspected|Invalid PIN|etc.'",
      
      // Merchant Information
      merchant_name: "STRING COMMENT 'Merchant name'",
      merchant_id: "STRING COMMENT 'Merchant ID (MID)'",
      merchant_category_code: "STRING COMMENT 'MCC code (4 digits)'",
      merchant_category: "STRING COMMENT 'Human-readable category'",
      
      merchant_city: "STRING",
      merchant_state: "STRING",
      merchant_country: "STRING COMMENT 'ISO 3166-1 alpha-2'",
      merchant_postal_code: "STRING",
      
      // Transaction Details
      pos_entry_mode: "STRING COMMENT 'Chip|Swipe|Contactless|Manual|E-Commerce|ATM'",
      card_present: "BOOLEAN COMMENT 'Card present transaction'",
      cardholder_present: "BOOLEAN",
      
      terminal_id: "STRING COMMENT 'Terminal/ATM ID'",
      terminal_type: "STRING COMMENT 'POS|ATM|E-Commerce|MOTO|Recurring'",
      
      // Security
      cvv_result: "STRING COMMENT 'Match|No Match|Not Provided'",
      avs_result: "STRING COMMENT 'Address Verification System result'",
      three_d_secure_flag: "BOOLEAN COMMENT '3-D Secure authentication used'",
      
      pin_verified: "BOOLEAN COMMENT 'PIN verification status'",
      
      // Fraud Detection
      fraud_score: "INTEGER COMMENT 'Fraud risk score (0-100)'",
      fraud_flag: "BOOLEAN COMMENT 'Flagged as potential fraud'",
      fraud_reason: "STRING",
      
      // Authorization Response
      approval_code: "STRING COMMENT 'Authorization approval code'",
      response_code: "STRING COMMENT 'ISO 8583 response code'",
      
      // Reversal
      reversed_flag: "BOOLEAN COMMENT 'Authorization reversed'",
      reversal_timestamp: "TIMESTAMP",
      reversal_reason: "STRING",
      
      // Posting
      posted_flag: "BOOLEAN COMMENT 'Authorization posted to account'",
      posted_transaction_id: "BIGINT COMMENT 'FK to posted transaction'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: Posted Transactions
  {
    name: 'bronze.retail_card_transactions_posted',
    description: 'Settled/cleared card transactions',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'POSTED_TRANSACTIONS',
    loadType: 'CDC',
    grain: 'One row per posted transaction',
    primaryKey: ['transaction_id', 'source_system'],
    schema: {
      transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      authorization_id: "BIGINT COMMENT 'FK to authorization'",
      transaction_date: "DATE",
      posting_date: "DATE",
      settlement_date: "DATE",
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING",
      billing_amount: "DECIMAL(18,2)",
      transaction_type: "STRING COMMENT 'Purchase|Return|Fee|Interest|Payment'",
      merchant_name: "STRING",
      merchant_category_code: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 5: Statements
  {
    name: 'bronze.retail_card_statements',
    description: 'Monthly card billing statements',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'STATEMENTS',
    loadType: 'MONTHLY',
    grain: 'One row per account per statement',
    primaryKey: ['card_account_id', 'statement_date', 'source_system'],
    schema: {
      card_account_id: "BIGINT PRIMARY KEY",
      statement_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      statement_period_start: "DATE",
      statement_period_end: "DATE",
      previous_balance: "DECIMAL(18,2)",
      payments_credits: "DECIMAL(18,2)",
      purchases: "DECIMAL(18,2)",
      cash_advances: "DECIMAL(18,2)",
      fees: "DECIMAL(18,2)",
      interest_charged: "DECIMAL(18,2)",
      new_balance: "DECIMAL(18,2)",
      minimum_payment_due: "DECIMAL(18,2)",
      payment_due_date: "DATE",
      available_credit: "DECIMAL(18,2)",
      statement_pdf_path: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 6: Card Payments
  {
    name: 'bronze.retail_card_payments',
    description: 'Card payment transactions',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'PAYMENTS',
    loadType: 'CDC',
    grain: 'One row per payment',
    primaryKey: ['payment_id', 'source_system'],
    schema: {
      payment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      payment_date: "DATE",
      payment_amount: "DECIMAL(18,2)",
      payment_method: "STRING COMMENT 'ACH|Check|Wire|Transfer'",
      payment_channel: "STRING COMMENT 'Online|Mobile|Branch|Phone|Mail'",
      payment_status: "STRING COMMENT 'Posted|Pending|Returned'",
      returned_flag: "BOOLEAN",
      return_reason: "STRING COMMENT 'NSF|Stop Payment|etc.'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 7: Rewards Earned
  {
    name: 'bronze.retail_card_rewards_earned',
    description: 'Rewards points and cash back earned',
    sourceSystem: 'REWARDS_SYSTEM',
    sourceTable: 'REWARDS_EARNED',
    loadType: 'CDC',
    grain: 'One row per rewards earning event',
    primaryKey: ['rewards_earn_id', 'source_system'],
    schema: {
      rewards_earn_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      transaction_id: "BIGINT",
      earn_date: "DATE",
      rewards_type: "STRING COMMENT 'Points|Cash Back|Miles'",
      rewards_amount: "DECIMAL(18,2)",
      earn_rate: "DECIMAL(10,6) COMMENT 'Earn rate (e.g., 1.5% cash back)'",
      bonus_category: "STRING COMMENT 'Groceries|Gas|Travel|Dining|etc.'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 8: Rewards Redeemed
  {
    name: 'bronze.retail_card_rewards_redeemed',
    description: 'Rewards redemption transactions',
    sourceSystem: 'REWARDS_SYSTEM',
    sourceTable: 'REWARDS_REDEMPTIONS',
    loadType: 'CDC',
    grain: 'One row per redemption',
    primaryKey: ['redemption_id', 'source_system'],
    schema: {
      redemption_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      redemption_date: "DATE",
      rewards_type: "STRING",
      rewards_amount_redeemed: "DECIMAL(18,2)",
      redemption_method: "STRING COMMENT 'Statement Credit|Gift Card|Travel|Merchandise'",
      redemption_value: "DECIMAL(18,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 9: Card Fees
  {
    name: 'bronze.retail_card_fees',
    description: 'Fee assessments on card accounts',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'FEES',
    loadType: 'CDC',
    grain: 'One row per fee charged',
    primaryKey: ['fee_id', 'source_system'],
    schema: {
      fee_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      fee_date: "DATE",
      fee_type: "STRING COMMENT 'Annual|Late|Overlimit|Foreign Transaction|Cash Advance|Balance Transfer'",
      fee_amount: "DECIMAL(18,2)",
      fee_waived: "BOOLEAN",
      waiver_reason: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 10: Interest Charges
  {
    name: 'bronze.retail_card_interest_charges',
    description: 'Daily interest calculations',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'INTEREST_CHARGES',
    loadType: 'DAILY',
    grain: 'One row per account per day',
    primaryKey: ['card_account_id', 'interest_date', 'source_system'],
    schema: {
      card_account_id: "BIGINT PRIMARY KEY",
      interest_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      average_daily_balance: "DECIMAL(18,2)",
      daily_periodic_rate: "DECIMAL(10,8)",
      interest_charged: "DECIMAL(18,2)",
      interest_type: "STRING COMMENT 'Purchase|Cash Advance|Balance Transfer'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 11: Disputes
  {
    name: 'bronze.retail_card_disputes',
    description: 'Transaction disputes and chargebacks',
    sourceSystem: 'DISPUTE_SYSTEM',
    sourceTable: 'DISPUTES',
    loadType: 'CDC',
    grain: 'One row per dispute',
    primaryKey: ['dispute_id', 'source_system'],
    schema: {
      dispute_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      transaction_id: "BIGINT",
      dispute_date: "DATE",
      dispute_type: "STRING COMMENT 'Unauthorized|Billing Error|Fraud|Quality Issue'",
      dispute_amount: "DECIMAL(18,2)",
      dispute_reason: "STRING",
      dispute_status: "STRING COMMENT 'Filed|Under Investigation|Resolved|Denied'",
      resolution_date: "DATE",
      resolution_outcome: "STRING COMMENT 'Favor Cardholder|Favor Merchant|Split'",
      chargeback_amount: "DECIMAL(18,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 12: Fraud Alerts
  {
    name: 'bronze.retail_card_fraud_alerts',
    description: 'Real-time fraud detection alerts',
    sourceSystem: 'FRAUD_DETECTION_SYSTEM',
    sourceTable: 'FRAUD_ALERTS',
    loadType: 'STREAMING',
    grain: 'One row per fraud alert',
    primaryKey: ['alert_id', 'source_system'],
    schema: {
      alert_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      authorization_id: "BIGINT",
      alert_timestamp: "TIMESTAMP",
      fraud_score: "INTEGER COMMENT '0-100 risk score'",
      alert_reason: "STRING COMMENT 'Unusual Location|Velocity|Amount|Pattern'",
      alert_action: "STRING COMMENT 'Declined|Hold for Review|Approved'",
      confirmed_fraud: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 13: Fraud Cases
  {
    name: 'bronze.retail_card_fraud_cases',
    description: 'Confirmed fraud cases',
    sourceSystem: 'FRAUD_SYSTEM',
    sourceTable: 'FRAUD_CASES',
    loadType: 'CDC',
    grain: 'One row per fraud case',
    primaryKey: ['fraud_case_id', 'source_system'],
    schema: {
      fraud_case_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      case_open_date: "DATE",
      fraud_type: "STRING COMMENT 'Lost/Stolen Card|CNP Fraud|Account Takeover|Application Fraud'",
      fraud_amount: "DECIMAL(18,2)",
      liability_amount: "DECIMAL(18,2)",
      case_status: "STRING COMMENT 'Open|Under Investigation|Closed'",
      case_resolution: "STRING",
      card_reissued: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 14: Authorized Users
  {
    name: 'bronze.retail_card_authorized_users',
    description: 'Authorized users on credit card accounts',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'AUTHORIZED_USERS',
    loadType: 'CDC',
    grain: 'One row per authorized user per account',
    primaryKey: ['card_account_id', 'authorized_user_id', 'source_system'],
    schema: {
      card_account_id: "BIGINT PRIMARY KEY",
      authorized_user_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      user_name: "STRING",
      relationship: "STRING COMMENT 'Spouse|Child|Employee|etc.'",
      card_number: "STRING COMMENT 'Physical card number for user'",
      spending_limit: "DECIMAL(18,2)",
      date_added: "DATE",
      date_removed: "DATE",
      is_active: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 15: Credit Limit Changes
  {
    name: 'bronze.retail_card_credit_limit_changes',
    description: 'Credit line increase/decrease history',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'CREDIT_LIMIT_CHANGES',
    loadType: 'CDC',
    grain: 'One row per credit limit change',
    primaryKey: ['limit_change_id', 'source_system'],
    schema: {
      limit_change_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      change_date: "DATE",
      previous_limit: "DECIMAL(18,2)",
      new_limit: "DECIMAL(18,2)",
      change_reason: "STRING COMMENT 'Customer Request|Credit Review|Promotion|Risk Reduction'",
      requested_by: "STRING COMMENT 'Customer|Bank|System'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 16: Balance Transfers
  {
    name: 'bronze.retail_card_balance_transfers',
    description: 'Balance transfer transactions',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'BALANCE_TRANSFERS',
    loadType: 'CDC',
    grain: 'One row per balance transfer',
    primaryKey: ['balance_transfer_id', 'source_system'],
    schema: {
      balance_transfer_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      transfer_date: "DATE",
      transfer_amount: "DECIMAL(18,2)",
      transfer_fee: "DECIMAL(18,2)",
      transfer_fee_percentage: "DECIMAL(5,2)",
      promotional_rate: "DECIMAL(10,6)",
      promotional_period_months: "INTEGER",
      promotional_end_date: "DATE",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 17: Cash Advances
  {
    name: 'bronze.retail_card_cash_advances',
    description: 'Cash advance transactions',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'CASH_ADVANCES',
    loadType: 'CDC',
    grain: 'One row per cash advance',
    primaryKey: ['cash_advance_id', 'source_system'],
    schema: {
      cash_advance_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      advance_date: "DATE",
      advance_amount: "DECIMAL(18,2)",
      advance_fee: "DECIMAL(18,2)",
      advance_fee_percentage: "DECIMAL(5,2)",
      atm_id: "STRING",
      location: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 18: Product Catalog
  {
    name: 'bronze.retail_card_product_catalog',
    description: 'Card product offerings',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'PRODUCT_CATALOG',
    loadType: 'SCD2',
    grain: 'One row per product per effective period',
    primaryKey: ['product_code', 'effective_date', 'source_system'],
    schema: {
      product_code: "STRING PRIMARY KEY",
      effective_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      expiration_date: "DATE",
      product_name: "STRING",
      card_type: "STRING",
      card_network: "STRING",
      annual_fee: "DECIMAL(18,2)",
      purchase_apr: "DECIMAL(10,6)",
      cash_advance_apr: "DECIMAL(10,6)",
      balance_transfer_apr: "DECIMAL(10,6)",
      rewards_program: "STRING",
      rewards_rate: "DECIMAL(10,6)",
      sign_up_bonus: "DECIMAL(18,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 19: Merchant Category Codes
  {
    name: 'bronze.retail_card_merchant_category_codes',
    description: 'MCC reference data',
    sourceSystem: 'REFERENCE_DATA',
    sourceTable: 'MCC_CODES',
    loadType: 'FULL',
    grain: 'One row per MCC code',
    primaryKey: ['mcc_code'],
    schema: {
      mcc_code: "STRING PRIMARY KEY COMMENT '4-digit MCC'",
      mcc_description: "STRING",
      mcc_category: "STRING COMMENT 'Groceries|Gas|Travel|Dining|Retail|etc.'",
      interchange_category: "STRING",
      rewards_eligible: "BOOLEAN",
      bonus_category: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 20: Interchange Fees
  {
    name: 'bronze.retail_card_interchange_fees',
    description: 'Interchange revenue by transaction',
    sourceSystem: 'NETWORK_SETTLEMENT',
    sourceTable: 'INTERCHANGE_FEES',
    loadType: 'DAILY',
    grain: 'One row per transaction',
    primaryKey: ['transaction_id', 'source_system'],
    schema: {
      transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      settlement_date: "DATE",
      transaction_amount: "DECIMAL(18,2)",
      interchange_amount: "DECIMAL(18,2)",
      interchange_rate: "DECIMAL(10,6)",
      interchange_category: "STRING COMMENT 'Debit Regulated|Credit Standard|Credit Premium|etc.'",
      card_network: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 21: Promotional Offers
  {
    name: 'bronze.retail_card_promotional_offers',
    description: 'Promotional rate offers on accounts',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'PROMOTIONAL_OFFERS',
    loadType: 'CDC',
    grain: 'One row per promo per account',
    primaryKey: ['promo_id', 'source_system'],
    schema: {
      promo_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      promo_type: "STRING COMMENT '0% APR|Balance Transfer|Cash Back Bonus'",
      promo_start_date: "DATE",
      promo_end_date: "DATE",
      promotional_rate: "DECIMAL(10,6)",
      promo_description: "STRING",
      qualification_met: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 22: Account Alerts
  {
    name: 'bronze.retail_card_account_alerts',
    description: 'Account alerts sent to cardholders',
    sourceSystem: 'ALERT_SYSTEM',
    sourceTable: 'ACCOUNT_ALERTS',
    loadType: 'CDC',
    grain: 'One row per alert',
    primaryKey: ['alert_id', 'source_system'],
    schema: {
      alert_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      alert_timestamp: "TIMESTAMP",
      alert_type: "STRING COMMENT 'Large Purchase|Payment Due|Fraud Alert|Credit Limit|etc.'",
      alert_message: "STRING",
      delivery_method: "STRING COMMENT 'Email|SMS|Push|In-App'",
      delivery_status: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 23: Digital Wallets
  {
    name: 'bronze.retail_card_digital_wallets',
    description: 'Digital wallet enrollment and tokenization',
    sourceSystem: 'TOKEN_VAULT',
    sourceTable: 'DIGITAL_WALLETS',
    loadType: 'CDC',
    grain: 'One row per card per wallet',
    primaryKey: ['token_id', 'source_system'],
    schema: {
      token_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      physical_card_id: "BIGINT",
      wallet_type: "STRING COMMENT 'Apple Pay|Google Pay|Samsung Pay|PayPal'",
      token_value: "STRING COMMENT 'Tokenized card number'",
      enrollment_date: "DATE",
      token_status: "STRING COMMENT 'Active|Suspended|Inactive'",
      device_id: "STRING",
      device_type: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 24: Blocked Merchants
  {
    name: 'bronze.retail_card_blocked_merchants',
    description: 'Customer-specified merchant blocks',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'MERCHANT_BLOCKS',
    loadType: 'CDC',
    grain: 'One row per account per blocked merchant',
    primaryKey: ['block_id', 'source_system'],
    schema: {
      block_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      card_account_id: "BIGINT",
      merchant_name: "STRING",
      merchant_id: "STRING",
      block_type: "STRING COMMENT 'Specific Merchant|MCC Category|Merchant Type'",
      block_date: "DATE",
      block_reason: "STRING COMMENT 'Fraud Prevention|Budgeting|Personal Preference'",
      is_active: "BOOLEAN",
      unblock_date: "DATE",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
];

export const cardsRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for retail cards domain',
  layer: 'BRONZE',
  tables: cardsRetailBronzeTables,
  totalTables: 24,
  estimatedSize: '1.2TB',
  refreshFrequency: 'Real-time streaming + CDC',
  retention: '7 years',
};
