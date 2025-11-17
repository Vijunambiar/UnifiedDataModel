/**
 * CARDS-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model (Kimball methodology) with:
 * - 11 Dimensions (including conformed dimensions)
 * - 7 Fact Tables
 * 
 * Grade A Target: Analytics-ready star schema for card analytics
 */

export const cardsRetailGoldDimensions = [
  // Dimension 1: Card Account
  {
    name: 'gold.dim_retail_card_account',
    description: 'Card account dimension with full card attributes and classifications',
    type: 'SCD Type 1',
    grain: 'One row per unique card account',
    conformedDimension: false,
    
    primaryKey: 'card_account_key',
    naturalKey: 'card_account_id',
    
    sourceTables: ['silver.retail_card_account_master_golden'],
    
    schema: {
      // SURROGATE KEY
      card_account_key: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Dimension surrogate key'",
      
      // NATURAL KEYS
      card_account_id: "BIGINT UNIQUE COMMENT 'Business account ID'",
      card_account_uuid: "STRING UNIQUE",
      
      // CARD CLASSIFICATION (Hierarchy Level 1-4)
      card_category_l1: "STRING COMMENT 'Consumer|Business'",
      card_category_l2: "STRING COMMENT 'Credit|Debit|Prepaid'",
      card_category_l3: "STRING COMMENT 'Standard|Rewards|Premium'",
      card_category_l4: "STRING COMMENT 'Product code (SKU)'",
      
      card_type: "STRING COMMENT 'Credit|Debit|Prepaid'",
      card_type_description: "STRING",
      card_subtype: "STRING COMMENT 'Standard|Gold|Platinum|Secured|Student|Business'",
      card_category: "STRING COMMENT 'Consumer|Business'",
      
      card_network: "STRING COMMENT 'Visa|Mastercard|Amex|Discover'",
      card_network_description: "STRING",
      
      product_code: "STRING",
      product_name: "STRING",
      product_description: "STRING",
      
      // CARDHOLDER
      primary_cardholder_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
      primary_cardholder_name: "STRING",
      authorized_user_count: "INTEGER",
      has_authorized_users: "BOOLEAN",
      
      // ACCOUNT STATUS
      account_status: "STRING COMMENT 'Active|Inactive|Closed|Frozen|Suspended'",
      account_status_description: "STRING",
      is_active: "BOOLEAN",
      is_closed: "BOOLEAN",
      is_frozen: "BOOLEAN",
      
      account_open_date: "DATE",
      account_close_date: "DATE",
      account_age_months: "INTEGER",
      account_age_band: "STRING COMMENT '<6mo|6-12mo|1-2yr|2-5yr|5-10yr|10+yr'",
      
      // CREDIT FEATURES (for Credit Cards)
      has_credit_limit: "BOOLEAN",
      credit_limit_tier: "STRING COMMENT '<$1K|$1K-$5K|$5K-$10K|$10K-$25K|$25K+'",
      
      utilization_tier: "STRING COMMENT 'Low<30%|Medium 30-50%|High 50-75%|Very High 75%+'",
      
      apr_type: "STRING COMMENT 'Fixed|Variable'",
      apr_tier: "STRING COMMENT '<10%|10-15%|15-20%|20-25%|25%+'",
      
      // REWARDS PROGRAM
      has_rewards_program: "BOOLEAN",
      rewards_program_name: "STRING",
      rewards_type: "STRING COMMENT 'Points|Cash Back|Miles|None'",
      rewards_tier: "STRING COMMENT 'Basic|Silver|Gold|Platinum'",
      
      // FEES
      has_annual_fee: "BOOLEAN",
      annual_fee_tier: "STRING COMMENT 'None|<$100|$100-$300|$300-$500|$500+'",
      has_foreign_transaction_fee: "BOOLEAN",
      
      // DELINQUENCY STATUS
      delinquency_status: "STRING COMMENT 'Current|30DPD|60DPD|90DPD|120+DPD|ChargeOff'",
      delinquency_status_description: "STRING",
      is_delinquent: "BOOLEAN",
      is_charged_off: "BOOLEAN",
      
      // PAYMENT BEHAVIOR
      autopay_enrolled: "BOOLEAN",
      autopay_type: "STRING COMMENT 'Minimum|Full|Fixed Amount'",
      typical_payment_behavior: "STRING COMMENT 'Full Pay|Revolver|Transactor'",
      payment_behavior_description: "STRING",
      
      // DIGITAL FEATURES
      digital_wallet_enabled: "BOOLEAN",
      contactless_enabled: "BOOLEAN",
      virtual_card_enabled: "BOOLEAN",
      digital_feature_adoption_level: "STRING COMMENT 'High|Medium|Low|None'",
      
      // SECURITY
      chip_enabled: "BOOLEAN",
      fraud_alerts_enabled: "BOOLEAN",
      transaction_alerts_enabled: "BOOLEAN",
      
      // SECURED CARD
      is_secured: "BOOLEAN",
      security_deposit_tier: "STRING COMMENT 'If secured card'",
      
      // OPENING DETAILS
      opening_channel: "STRING COMMENT 'Branch|Online|Mobile|Phone|Partner'",
      opening_branch_key: "BIGINT",
      opening_branch_name: "STRING",
      
      // REGULATORY
      card_act_compliant: "BOOLEAN COMMENT 'CARD Act compliance'",
      pci_dss_compliant: "BOOLEAN",
      
      // AUDIT
      created_date: "DATE",
      updated_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
    },
    
    hierarchies: [
      {
        name: 'Card Product Hierarchy',
        levels: [
          { level: 1, attribute: 'card_category_l1', description: 'Consumer|Business' },
          { level: 2, attribute: 'card_category_l2', description: 'Credit|Debit|Prepaid' },
          { level: 3, attribute: 'card_category_l3', description: 'Standard|Rewards|Premium' },
          { level: 4, attribute: 'card_category_l4', description: 'Product Code (SKU)' },
        ],
      },
      {
        name: 'Utilization Hierarchy',
        levels: [
          { level: 1, attribute: 'utilization_tier', description: 'Low|Medium|High|Very High' },
        ],
      },
    ],
  },
  
  // Dimension 2: Physical Card
  {
    name: 'gold.dim_retail_physical_card',
    description: 'Physical card plastic dimension',
    type: 'SCD Type 1',
    grain: 'One row per physical card',
    
    primaryKey: 'physical_card_key',
    naturalKey: 'card_number_hash',
    
    sourceTables: ['silver.retail_card_physical_cards_golden'],
    
    schema: {
      physical_card_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      card_number_hash: "STRING UNIQUE",
      
      card_account_key: "BIGINT COMMENT 'FK to dim_retail_card_account'",
      cardholder_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
      
      card_type: "STRING COMMENT 'Primary|Authorized User|Replacement'",
      card_type_description: "STRING",
      
      card_status: "STRING COMMENT 'Active|Lost|Stolen|Expired|Cancelled|Inactive'",
      card_status_description: "STRING",
      is_active: "BOOLEAN",
      
      card_issue_date: "DATE",
      card_expiration_date: "DATE",
      card_activation_date: "DATE",
      
      embossed_name: "STRING",
      
      card_design: "STRING",
      card_material: "STRING COMMENT 'Plastic|Metal'",
      is_metal_card: "BOOLEAN",
      
      is_chip_enabled: "BOOLEAN",
      is_contactless_enabled: "BOOLEAN",
      is_digital_wallet_enrolled: "BOOLEAN",
      
      replacement_reason: "STRING COMMENT 'Lost|Stolen|Damaged|Expired|Fraud|Upgrade'",
      is_replacement_card: "BOOLEAN",
      
      card_age_months: "INTEGER",
      months_until_expiration: "INTEGER",
      
      created_date: "DATE",
      updated_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 3: Merchant
  {
    name: 'gold.dim_merchant',
    description: 'Merchant dimension for card transactions',
    type: 'SCD Type 1',
    grain: 'One row per merchant',
    conformedDimension: true,
    
    primaryKey: 'merchant_key',
    naturalKey: 'merchant_id',
    
    schema: {
      merchant_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      merchant_id: "STRING UNIQUE",
      merchant_name: "STRING",
      
      merchant_dba_name: "STRING COMMENT 'Doing Business As name'",
      merchant_legal_name: "STRING",
      
      merchant_category_code: "STRING COMMENT 'MCC 4-digit code'",
      merchant_category: "STRING COMMENT 'Human-readable category'",
      merchant_category_l1: "STRING COMMENT 'Top-level category'",
      merchant_category_l2: "STRING COMMENT 'Mid-level category'",
      merchant_category_l3: "STRING COMMENT 'Detailed category'",
      
      merchant_city: "STRING",
      merchant_state: "STRING",
      merchant_country: "STRING",
      merchant_country_name: "STRING",
      merchant_postal_code: "STRING",
      merchant_region: "STRING COMMENT 'Domestic|International'",
      
      is_domestic_merchant: "BOOLEAN",
      is_international_merchant: "BOOLEAN",
      
      merchant_type: "STRING COMMENT 'Retail|E-Commerce|Service|Subscription'",
      
      created_date: "DATE",
      updated_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
    },
    
    hierarchies: [
      {
        name: 'Merchant Category Hierarchy',
        levels: [
          { level: 1, attribute: 'merchant_category_l1', description: 'Top category (e.g., Retail)' },
          { level: 2, attribute: 'merchant_category_l2', description: 'Mid category (e.g., Grocery)' },
          { level: 3, attribute: 'merchant_category_l3', description: 'Detail (e.g., Supermarket)' },
        ],
      },
      {
        name: 'Merchant Geography Hierarchy',
        levels: [
          { level: 1, attribute: 'merchant_region', description: 'Domestic|International' },
          { level: 2, attribute: 'merchant_country', description: 'Country code' },
          { level: 3, attribute: 'merchant_state', description: 'State/Province' },
          { level: 4, attribute: 'merchant_city', description: 'City' },
        ],
      },
    ],
  },
  
  // Dimension 4: Transaction Type
  {
    name: 'gold.dim_card_transaction_type',
    description: 'Card transaction type taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per transaction type',
    
    primaryKey: 'transaction_type_key',
    naturalKey: 'transaction_type_code',
    
    schema: {
      transaction_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      transaction_type_code: "STRING UNIQUE",
      transaction_type_name: "STRING",
      transaction_type_description: "STRING",
      
      transaction_category: "STRING COMMENT 'Purchase|Cash Advance|Fee|Interest|Payment|Refund|Adjustment'",
      transaction_subcategory: "STRING COMMENT 'POS|E-Commerce|Recurring|ATM|Manual'",
      
      transaction_class: "STRING COMMENT 'Debit|Credit'",
      
      is_purchase: "BOOLEAN",
      is_cash_advance: "BOOLEAN",
      is_balance_transfer: "BOOLEAN",
      is_fee: "BOOLEAN",
      is_interest: "BOOLEAN",
      is_payment: "BOOLEAN",
      is_refund: "BOOLEAN",
      
      affects_balance: "BOOLEAN",
      affects_available_credit: "BOOLEAN",
      
      earns_rewards: "BOOLEAN",
      incurs_interest: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 5: Rewards Program
  {
    name: 'gold.dim_rewards_program',
    description: 'Card rewards program dimension',
    type: 'SCD Type 2',
    grain: 'One row per rewards program',
    
    primaryKey: 'rewards_program_key',
    naturalKey: 'rewards_program_id',
    
    schema: {
      rewards_program_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      rewards_program_id: "BIGINT",
      rewards_program_name: "STRING",
      rewards_program_description: "STRING",
      
      rewards_type: "STRING COMMENT 'Points|Cash Back|Miles|Other'",
      rewards_type_description: "STRING",
      
      base_earning_rate: "DECIMAL(10,6) COMMENT 'Points per dollar or percentage'",
      earning_rate_tier: "STRING COMMENT 'Standard|Bonus|Premium'",
      
      has_bonus_categories: "BOOLEAN",
      bonus_categories: "STRING COMMENT 'Comma-separated bonus categories'",
      
      redemption_minimum: "DECIMAL(18,2) COMMENT 'Minimum points for redemption'",
      redemption_options: "STRING COMMENT 'Available redemption types'",
      
      points_expiration_months: "INTEGER COMMENT 'Months until points expire (NULL if no expiration)'",
      has_expiration: "BOOLEAN",
      
      program_tier: "STRING COMMENT 'Basic|Silver|Gold|Platinum'",
      
      is_active: "BOOLEAN",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 6: Authorization Status
  {
    name: 'gold.dim_authorization_status',
    description: 'Authorization approval/decline status dimension',
    type: 'SCD Type 1',
    grain: 'One row per authorization status',
    
    primaryKey: 'authorization_status_key',
    naturalKey: 'authorization_status_code',
    
    schema: {
      authorization_status_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      authorization_status_code: "STRING UNIQUE",
      authorization_status_name: "STRING COMMENT 'Approved|Declined|Partial Approval'",
      authorization_status_description: "STRING",
      
      status_category: "STRING COMMENT 'Success|Decline|Partial'",
      
      is_approved: "BOOLEAN",
      is_declined: "BOOLEAN",
      is_partial_approval: "BOOLEAN",
      
      decline_reason_category: "STRING COMMENT 'Insufficient Funds|Fraud|Invalid|Other'",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 7: Dispute Status
  {
    name: 'gold.dim_dispute_status',
    description: 'Dispute case status dimension',
    type: 'SCD Type 1',
    grain: 'One row per dispute status',
    
    primaryKey: 'dispute_status_key',
    naturalKey: 'dispute_status_code',
    
    schema: {
      dispute_status_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      dispute_status_code: "STRING UNIQUE",
      dispute_status_name: "STRING COMMENT 'Open|Under Investigation|Resolved|Withdrawn'",
      dispute_status_description: "STRING",
      
      status_category: "STRING COMMENT 'Open|In Progress|Closed'",
      
      is_open: "BOOLEAN",
      is_closed: "BOOLEAN",
      
      resolution_type: "STRING COMMENT 'Customer Won|Merchant Won|Settled|Withdrawn|N/A'",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 8: Statement Period
  {
    name: 'gold.dim_statement_period',
    description: 'Billing statement period dimension',
    type: 'SCD Type 1',
    grain: 'One row per statement period',
    
    primaryKey: 'statement_period_key',
    naturalKey: 'statement_period_id',
    
    schema: {
      statement_period_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      statement_period_id: "STRING UNIQUE COMMENT 'Format: YYYY-MM'",
      
      statement_year: "INTEGER",
      statement_month: "INTEGER",
      statement_month_name: "STRING",
      statement_quarter: "INTEGER COMMENT 'Q1|Q2|Q3|Q4'",
      
      period_start_date: "DATE",
      period_end_date: "DATE",
      days_in_period: "INTEGER",
      
      is_current_period: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 9: Fraud Type
  {
    name: 'gold.dim_fraud_type',
    description: 'Fraud case type taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per fraud type',
    
    primaryKey: 'fraud_type_key',
    naturalKey: 'fraud_type_code',
    
    schema: {
      fraud_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      fraud_type_code: "STRING UNIQUE",
      fraud_type_name: "STRING COMMENT 'Card Not Present|Card Present|Account Takeover|Application Fraud|Identity Theft'",
      fraud_type_description: "STRING",
      
      fraud_category: "STRING COMMENT 'First Party|Third Party|Friendly'",
      fraud_severity: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      is_first_party: "BOOLEAN",
      is_third_party: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 10: Payment Channel
  {
    name: 'gold.dim_payment_channel',
    description: 'Payment channel dimension',
    type: 'SCD Type 1',
    grain: 'One row per payment channel',
    
    primaryKey: 'payment_channel_key',
    naturalKey: 'payment_channel_code',
    
    schema: {
      payment_channel_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      payment_channel_code: "STRING UNIQUE",
      payment_channel_name: "STRING COMMENT 'Branch|Online|Mobile|Phone|ATM|Mail|AutoPay'",
      payment_channel_description: "STRING",
      
      channel_category: "STRING COMMENT 'Digital|Physical|Automated'",
      channel_type: "STRING COMMENT 'Self-Service|Assisted'",
      
      is_digital: "BOOLEAN",
      is_automated: "BOOLEAN",
      is_self_service: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 11: Promotional Offer
  {
    name: 'gold.dim_promotional_offer',
    description: 'Card promotional offer dimension',
    type: 'SCD Type 2',
    grain: 'One row per promotional offer',
    
    primaryKey: 'promo_offer_key',
    naturalKey: 'promo_offer_id',
    
    schema: {
      promo_offer_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      promo_offer_id: "BIGINT",
      
      promo_name: "STRING",
      promo_description: "STRING",
      
      promo_type: "STRING COMMENT 'Intro APR|Balance Transfer|Bonus Rewards|No Annual Fee|Sign-Up Bonus'",
      promo_type_description: "STRING",
      promo_category: "STRING COMMENT 'APR|Rewards|Fees'",
      
      promo_duration_months: "INTEGER",
      
      is_apr_promo: "BOOLEAN",
      is_rewards_promo: "BOOLEAN",
      is_fee_waiver: "BOOLEAN",
      is_sign_up_bonus: "BOOLEAN",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
    },
  },
];

export const cardsRetailGoldFacts = [
  // Fact 1: Card Account Snapshot (Periodic Snapshot)
  {
    name: 'gold.fact_retail_card_account_snapshot',
    description: 'Daily snapshot of card account balances, limits, and metrics',
    factType: 'Periodic Snapshot',
    grain: 'One row per card account per day',
    
    dimensions: [
      'card_account_key',
      'cardholder_key (dim_retail_customer)',
      'date_key (dim_date)',
      'rewards_program_key',
      'promo_offer_key',
    ],
    
    schema: {
      // DIMENSION KEYS
      card_account_key: "BIGINT COMMENT 'FK to dim_retail_card_account'",
      cardholder_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
      date_key: "INTEGER COMMENT 'FK to dim_date'",
      rewards_program_key: "BIGINT COMMENT 'FK to dim_rewards_program'",
      promo_offer_key: "BIGINT COMMENT 'FK to dim_promotional_offer'",
      
      snapshot_date: "DATE",
      
      // BALANCE MEASURES (Credit Cards)
      credit_limit: "DECIMAL(18,2)",
      current_balance: "DECIMAL(18,2)",
      available_credit: "DECIMAL(18,2)",
      
      cash_advance_limit: "DECIMAL(18,2)",
      cash_advance_balance: "DECIMAL(18,2)",
      
      purchase_balance: "DECIMAL(18,2)",
      balance_transfer_balance: "DECIMAL(18,2)",
      
      // UTILIZATION METRICS
      credit_utilization_ratio: "DECIMAL(5,2) COMMENT 'Percentage'",
      cash_advance_utilization_ratio: "DECIMAL(5,2)",
      
      // PAYMENT METRICS
      minimum_payment_due: "DECIMAL(18,2)",
      days_until_payment_due: "INTEGER",
      last_payment_amount: "DECIMAL(18,2)",
      days_since_last_payment: "INTEGER",
      
      // DELINQUENCY METRICS
      days_past_due: "INTEGER",
      delinquent_amount: "DECIMAL(18,2)",
      missed_payments_12mo: "INTEGER",
      
      // INTEREST RATES
      current_apr: "DECIMAL(10,6)",
      purchase_apr: "DECIMAL(10,6)",
      cash_advance_apr: "DECIMAL(10,6)",
      
      // REWARDS METRICS
      rewards_balance: "DECIMAL(18,2)",
      rewards_earned_ytd: "DECIMAL(18,2)",
      rewards_redeemed_ytd: "DECIMAL(18,2)",
      
      // FEES & INTEREST YTD
      fees_charged_ytd: "DECIMAL(18,2)",
      interest_charged_ytd: "DECIMAL(18,2)",
      
      // TRANSACTION COUNTS
      transactions_mtd: "INTEGER",
      transactions_ytd: "INTEGER",
      
      // VOLUME MEASURES
      purchase_volume_mtd: "DECIMAL(18,2)",
      purchase_volume_ytd: "DECIMAL(18,2)",
      
      // FRAUD INDICATORS
      fraud_score: "INTEGER COMMENT '0-100'",
      fraud_blocks_ytd: "INTEGER",
      
      // ACCOUNT FLAGS
      is_active: "BOOLEAN",
      is_delinquent: "BOOLEAN",
      is_overlimit: "BOOLEAN",
      has_autopay: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    partitioning: {
      type: 'RANGE',
      column: 'snapshot_date',
      ranges: ['Monthly partitions'],
    },
    
    estimatedRows: 2000000000,
    estimatedSize: '300GB',
  },
  
  // Fact 2: Transactions (Transaction Grain)
  {
    name: 'gold.fact_retail_card_transaction',
    description: 'Posted card transaction fact table',
    factType: 'Transaction',
    grain: 'One row per posted transaction',
    
    dimensions: [
      'card_account_key',
      'physical_card_key',
      'cardholder_key',
      'transaction_date_key',
      'posting_date_key',
      'transaction_type_key',
      'merchant_key',
      'rewards_program_key',
    ],
    
    schema: {
      // SURROGATE KEY
      transaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      card_account_key: "BIGINT COMMENT 'FK to dim_retail_card_account'",
      physical_card_key: "BIGINT COMMENT 'FK to dim_retail_physical_card'",
      cardholder_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
      transaction_date_key: "INTEGER COMMENT 'FK to dim_date'",
      posting_date_key: "INTEGER COMMENT 'FK to dim_date'",
      transaction_type_key: "BIGINT COMMENT 'FK to dim_card_transaction_type'",
      merchant_key: "BIGINT COMMENT 'FK to dim_merchant'",
      rewards_program_key: "BIGINT COMMENT 'FK to dim_rewards_program'",
      
      // DEGENERATE DIMENSIONS
      transaction_id: "BIGINT UNIQUE",
      authorization_id: "BIGINT",
      
      transaction_timestamp: "TIMESTAMP",
      posting_timestamp: "TIMESTAMP",
      
      // MEASURES
      transaction_amount: "DECIMAL(18,2) COMMENT 'Amount in card currency'",
      transaction_amount_usd: "DECIMAL(18,2) COMMENT 'Amount in USD'",
      
      // CARD NETWORK FEES
      interchange_fee_amount: "DECIMAL(10,4) COMMENT 'Interchange revenue'",
      network_assessment_fee: "DECIMAL(10,4)",
      
      // REWARDS
      rewards_earned_points: "DECIMAL(18,2)",
      rewards_earned_cash_value: "DECIMAL(10,2)",
      rewards_earning_rate: "DECIMAL(10,6)",
      
      // TRANSACTION ATTRIBUTES
      pos_entry_mode: "STRING COMMENT 'Chip|Swipe|Contactless|Manual|E-Commerce'",
      card_present_flag: "BOOLEAN",
      cardholder_present_flag: "BOOLEAN",
      
      // SECURITY & FRAUD
      fraud_score: "INTEGER COMMENT '0-100'",
      fraud_flag: "BOOLEAN",
      three_d_secure_flag: "BOOLEAN",
      
      // TRANSACTION FLAGS
      is_reversal: "BOOLEAN",
      is_dispute: "BOOLEAN",
      is_international: "BOOLEAN",
      is_contactless: "BOOLEAN",
      is_ecommerce: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    partitioning: {
      type: 'RANGE',
      column: 'transaction_date_key',
      ranges: ['Monthly partitions'],
    },
    
    estimatedRows: 15000000000,
    estimatedSize: '2.5TB',
  },
  
  // Fact 3: Authorizations (Transaction Grain)
  {
    name: 'gold.fact_retail_card_authorization',
    description: 'Card authorization request fact table (real-time)',
    factType: 'Transaction',
    grain: 'One row per authorization request',
    
    dimensions: [
      'card_account_key',
      'physical_card_key',
      'cardholder_key',
      'authorization_date_key',
      'transaction_type_key',
      'merchant_key',
      'authorization_status_key',
    ],
    
    schema: {
      authorization_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      card_account_key: "BIGINT",
      physical_card_key: "BIGINT",
      cardholder_key: "BIGINT",
      authorization_date_key: "INTEGER",
      transaction_type_key: "BIGINT",
      merchant_key: "BIGINT",
      authorization_status_key: "BIGINT COMMENT 'FK to dim_authorization_status'",
      
      // DEGENERATE DIMENSIONS
      authorization_id: "BIGINT UNIQUE",
      approval_code: "STRING",
      terminal_id: "STRING",
      
      authorization_timestamp: "TIMESTAMP",
      
      // MEASURES
      authorization_amount: "DECIMAL(18,2)",
      authorization_amount_usd: "DECIMAL(18,2)",
      
      // FRAUD MEASURES
      fraud_score: "INTEGER COMMENT '0-100'",
      
      // AUTHORIZATION FLAGS
      is_approved: "BOOLEAN",
      is_declined: "BOOLEAN",
      is_partial_approval: "BOOLEAN",
      is_reversed: "BOOLEAN",
      is_posted: "BOOLEAN",
      
      // SECURITY FLAGS
      cvv_match: "BOOLEAN",
      avs_match: "BOOLEAN",
      three_d_secure_authenticated: "BOOLEAN",
      pin_verified: "BOOLEAN",
      
      // TRANSACTION FLAGS
      card_present: "BOOLEAN",
      cardholder_present: "BOOLEAN",
      is_contactless: "BOOLEAN",
      is_chip: "BOOLEAN",
      is_ecommerce: "BOOLEAN",
      
      // FRAUD FLAGS
      fraud_flag: "BOOLEAN",
      fraud_auto_declined: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    partitioning: {
      type: 'RANGE',
      column: 'authorization_timestamp',
      ranges: ['Hourly partitions for real-time analytics'],
    },
    
    estimatedRows: 20000000000,
    estimatedSize: '2TB',
  },
  
  // Fact 4: Monthly Statements (Accumulating Snapshot)
  {
    name: 'gold.fact_retail_card_statement',
    description: 'Monthly billing statement fact table',
    factType: 'Accumulating Snapshot',
    grain: 'One row per card account per statement period',
    
    dimensions: [
      'card_account_key',
      'cardholder_key',
      'statement_date_key',
      'statement_period_key',
      'rewards_program_key',
    ],
    
    schema: {
      statement_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      card_account_key: "BIGINT",
      cardholder_key: "BIGINT",
      statement_date_key: "INTEGER COMMENT 'FK to dim_date (statement closing date)'",
      statement_period_key: "BIGINT COMMENT 'FK to dim_statement_period'",
      rewards_program_key: "BIGINT",
      
      // DEGENERATE DIMENSIONS
      statement_id: "BIGINT UNIQUE",
      
      // BALANCE MEASURES
      previous_balance: "DECIMAL(18,2)",
      payments_credits: "DECIMAL(18,2)",
      purchases: "DECIMAL(18,2)",
      cash_advances: "DECIMAL(18,2)",
      balance_transfers: "DECIMAL(18,2)",
      fees_charged: "DECIMAL(18,2)",
      interest_charged: "DECIMAL(18,2)",
      new_balance: "DECIMAL(18,2)",
      
      // CREDIT MEASURES
      credit_limit: "DECIMAL(18,2)",
      available_credit: "DECIMAL(18,2)",
      
      // PAYMENT MEASURES
      minimum_payment_due: "DECIMAL(18,2)",
      days_until_due: "INTEGER",
      
      // TRANSACTION COUNTS
      purchase_count: "INTEGER",
      cash_advance_count: "INTEGER",
      payment_count: "INTEGER",
      fee_count: "INTEGER",
      
      // APR MEASURES
      purchase_apr: "DECIMAL(10,6)",
      cash_advance_apr: "DECIMAL(10,6)",
      
      // REWARDS MEASURES
      rewards_earned_this_period: "DECIMAL(18,2)",
      rewards_balance: "DECIMAL(18,2)",
      
      // DELINQUENCY MEASURES
      days_past_due: "INTEGER",
      
      // FLAGS
      late_payment_flag: "BOOLEAN",
      minimum_payment_made_flag: "BOOLEAN",
      full_balance_paid_flag: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    partitioning: {
      type: 'RANGE',
      column: 'statement_date_key',
      ranges: ['Monthly partitions'],
    },
    
    estimatedRows: 900000000,
    estimatedSize: '120GB',
  },
  
  // Fact 5: Payments
  {
    name: 'gold.fact_retail_card_payment',
    description: 'Card payment transaction fact table',
    factType: 'Transaction',
    grain: 'One row per payment',
    
    dimensions: [
      'card_account_key',
      'cardholder_key',
      'payment_date_key',
      'payment_channel_key',
      'statement_period_key',
    ],
    
    schema: {
      payment_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      card_account_key: "BIGINT",
      cardholder_key: "BIGINT",
      payment_date_key: "INTEGER",
      payment_channel_key: "BIGINT COMMENT 'FK to dim_payment_channel'",
      statement_period_key: "BIGINT",
      
      // DEGENERATE DIMENSIONS
      payment_id: "BIGINT UNIQUE",
      payment_confirmation_number: "STRING",
      
      payment_timestamp: "TIMESTAMP",
      
      // MEASURES
      payment_amount: "DECIMAL(18,2)",
      
      statement_balance_at_payment: "DECIMAL(18,2)",
      minimum_due_at_payment: "DECIMAL(18,2)",
      
      // PAYMENT FLAGS
      is_autopay: "BOOLEAN",
      is_late_payment: "BOOLEAN",
      is_minimum_payment: "BOOLEAN",
      is_full_payment: "BOOLEAN",
      is_returned_payment: "BOOLEAN",
      
      // LATE PAYMENT MEASURES
      days_late: "INTEGER",
      late_fee_assessed: "DECIMAL(18,2)",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    partitioning: {
      type: 'RANGE',
      column: 'payment_date_key',
      ranges: ['Monthly partitions'],
    },
    
    estimatedRows: 2000000000,
    estimatedSize: '200GB',
  },
  
  // Fact 6: Disputes
  {
    name: 'gold.fact_retail_card_dispute',
    description: 'Card transaction dispute fact table',
    factType: 'Accumulating Snapshot',
    grain: 'One row per dispute case',
    
    dimensions: [
      'card_account_key',
      'cardholder_key',
      'transaction_key',
      'dispute_date_key',
      'resolution_date_key',
      'merchant_key',
      'dispute_status_key',
    ],
    
    schema: {
      dispute_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      card_account_key: "BIGINT",
      cardholder_key: "BIGINT",
      transaction_key: "BIGINT COMMENT 'FK to fact_retail_card_transaction'",
      dispute_date_key: "INTEGER COMMENT 'FK to dim_date'",
      resolution_date_key: "INTEGER COMMENT 'FK to dim_date (NULL if unresolved)'",
      merchant_key: "BIGINT",
      dispute_status_key: "BIGINT COMMENT 'FK to dim_dispute_status'",
      
      // DEGENERATE DIMENSIONS
      dispute_id: "BIGINT UNIQUE",
      dispute_reason_code: "STRING",
      network_case_number: "STRING",
      
      // MEASURES
      disputed_amount: "DECIMAL(18,2)",
      provisional_credit_amount: "DECIMAL(18,2)",
      chargeback_amount: "DECIMAL(18,2)",
      final_credit_amount: "DECIMAL(18,2)",
      
      // TIME MEASURES
      days_to_resolution: "INTEGER COMMENT 'Days from dispute to resolution'",
      
      // FLAGS
      provisional_credit_issued: "BOOLEAN",
      chargeback_filed: "BOOLEAN",
      customer_won: "BOOLEAN",
      merchant_won: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 50000000,
    estimatedSize: '8GB',
  },
  
  // Fact 7: Fraud Cases
  {
    name: 'gold.fact_retail_card_fraud',
    description: 'Card fraud case fact table',
    factType: 'Accumulating Snapshot',
    grain: 'One row per fraud case',
    
    dimensions: [
      'card_account_key',
      'physical_card_key',
      'cardholder_key',
      'fraud_detection_date_key',
      'resolution_date_key',
      'fraud_type_key',
    ],
    
    schema: {
      fraud_case_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      card_account_key: "BIGINT",
      physical_card_key: "BIGINT",
      cardholder_key: "BIGINT",
      fraud_detection_date_key: "INTEGER",
      resolution_date_key: "INTEGER COMMENT 'NULL if unresolved'",
      fraud_type_key: "BIGINT COMMENT 'FK to dim_fraud_type'",
      
      // DEGENERATE DIMENSIONS
      fraud_case_id: "BIGINT UNIQUE",
      law_enforcement_case_number: "STRING",
      
      // MEASURES
      fraud_amount: "DECIMAL(18,2) COMMENT 'Total fraudulent amount'",
      customer_liability_amount: "DECIMAL(18,2)",
      bank_liability_amount: "DECIMAL(18,2)",
      recovered_amount: "DECIMAL(18,2)",
      
      fraud_transaction_count: "INTEGER",
      
      // TIME MEASURES
      days_to_detection: "INTEGER COMMENT 'Days between first fraud and detection'",
      days_to_resolution: "INTEGER",
      
      // FLAGS
      card_blocked: "BOOLEAN",
      card_reissued: "BOOLEAN",
      law_enforcement_notified: "BOOLEAN",
      fraud_confirmed: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 10000000,
    estimatedSize: '2GB',
  },
];

export const cardsRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail cards domain with dimensional model',
  layer: 'GOLD',
  dimensions: cardsRetailGoldDimensions,
  facts: cardsRetailGoldFacts,
  totalDimensions: 11,
  totalFacts: 7,
  estimatedSize: '5.1TB',
  refreshFrequency: 'Daily for snapshots, Real-time for transactions/authorizations',
  methodology: 'Kimball Dimensional Modeling',
};
