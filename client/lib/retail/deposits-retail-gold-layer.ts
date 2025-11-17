/**
 * DEPOSITS-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model for retail deposit accounts
 * 10 Dimensions + 6 Facts
 */

export const depositsRetailGoldDimensions = [
  // Dimension 1: Account
  {
    name: 'gold.dim_retail_deposit_account',
    description: 'Deposit account dimension with full account attributes',
    type: 'SCD Type 1',
    grain: 'One row per unique deposit account',
    
    primaryKey: 'account_key',
    naturalKey: 'account_id',
    
    schema: {
      // SURROGATE KEY
      account_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // NATURAL KEYS
      account_id: "BIGINT UNIQUE",
      account_number: "STRING UNIQUE",
      account_uuid: "STRING UNIQUE",
      
      // ACCOUNT CLASSIFICATION
      account_type: "STRING COMMENT 'DDA|Savings|MoneyMarket|CD|NOW'",
      account_type_description: "STRING",
      account_subtype: "STRING",
      product_code: "STRING",
      product_name: "STRING",
      account_category: "STRING COMMENT 'Transaction|Savings|TimeDeposit'",
      
      // OWNERSHIP
      primary_customer_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
      primary_customer_name: "STRING",
      ownership_type: "STRING",
      ownership_type_description: "STRING",
      total_owners: "INTEGER",
      
      // ACCOUNT STATUS
      account_status: "STRING",
      account_status_description: "STRING",
      is_active: "BOOLEAN",
      is_closed: "BOOLEAN",
      is_dormant: "BOOLEAN",
      
      // LIFECYCLE DATES
      account_open_date: "DATE",
      account_close_date: "DATE",
      account_maturity_date: "DATE COMMENT 'CD maturity'",
      account_age_days: "INTEGER",
      account_age_band: "STRING COMMENT '<1yr|1-3yr|3-5yr|5-10yr|10+yr'",
      
      // BRANCH
      opening_branch_key: "BIGINT",
      opening_branch_name: "STRING",
      primary_branch_key: "BIGINT",
      primary_branch_name: "STRING",
      opening_channel: "STRING",
      
      // INTEREST
      interest_bearing: "BOOLEAN",
      interest_rate_tier: "STRING COMMENT 'Standard|Preferred|Premium'",
      interest_calculation_method: "STRING",
      interest_compounding_frequency: "STRING",
      interest_payment_frequency: "STRING",
      
      // FEES
      monthly_service_fee: "DECIMAL(18,2)",
      has_fee_waiver: "BOOLEAN",
      fee_waiver_type: "STRING",
      overdraft_protection_enrolled: "BOOLEAN",
      overdraft_protection_type: "STRING",
      
      // LIMITS & REQUIREMENTS
      minimum_balance_required: "DECIMAL(18,2)",
      withdrawal_limit_monthly: "INTEGER",
      
      // CD-SPECIFIC
      cd_term_months: "INTEGER",
      cd_auto_renewal: "BOOLEAN",
      
      // DIGITAL BANKING
      online_banking_enabled: "BOOLEAN",
      mobile_banking_enabled: "BOOLEAN",
      mobile_deposit_enabled: "BOOLEAN",
      
      // REGULATORY
      fdic_insured: "BOOLEAN",
      reg_d_applicable: "BOOLEAN COMMENT 'Regulation D applies (savings/MMA)'",
      
      // STATEMENTS
      statement_frequency: "STRING",
      statement_delivery_method: "STRING",
      paperless: "BOOLEAN",
      
      // AUDIT
      created_date: "DATE",
      updated_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
    },
    
    hierarchies: [
      {
        name: 'Product Hierarchy',
        levels: [
          { level: 1, attribute: 'account_category', description: 'Transaction|Savings|TimeDeposit' },
          { level: 2, attribute: 'account_type', description: 'DDA|Savings|CD|MMA' },
          { level: 3, attribute: 'account_subtype', description: 'Basic|Premium|Student|etc.' },
          { level: 4, attribute: 'product_code', description: 'SKU' },
        ],
      },
    ],
  },
  
  // Dimension 2: Transaction Type
  {
    name: 'gold.dim_transaction_type',
    description: 'Transaction type taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per transaction type',
    
    schema: {
      transaction_type_key: "BIGINT PRIMARY KEY",
      transaction_type_code: "STRING UNIQUE",
      transaction_type_name: "STRING",
      transaction_type_description: "STRING",
      
      transaction_category: "STRING COMMENT 'Deposit|Withdrawal|Transfer|Fee|Interest'",
      transaction_subcategory: "STRING",
      
      debit_credit_indicator: "STRING COMMENT 'DR|CR'",
      
      is_cash_transaction: "BOOLEAN",
      is_check_transaction: "BOOLEAN",
      is_electronic_transaction: "BOOLEAN",
      is_fee: "BOOLEAN",
      is_interest: "BOOLEAN",
      
      affects_available_balance: "BOOLEAN",
      affects_collected_balance: "BOOLEAN",
      
      ctf_reportable: "BOOLEAN COMMENT 'CTR reporting for cash >$10K'",
      
      created_date: "DATE",
    },
  },

  // Dimension 3: Deposit Product
  {
    name: 'gold.dim_deposit_product',
    description: 'Deposit product catalog',
    type: 'SCD Type 2',
    grain: 'One row per product per effective date',
    primaryKey: 'product_key',
    naturalKey: 'product_code',
    schema: {
      product_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      product_code: "STRING",
      product_name: "STRING",
      product_type: "STRING COMMENT 'DDA|Savings|MMA|CD'",
      is_interest_bearing: "BOOLEAN",
      minimum_balance: "DECIMAL(18,2)",
      monthly_fee: "DECIMAL(10,2)",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
    },
  },

  // Dimension 4: Account Status
  {
    name: 'gold.dim_account_status',
    description: 'Account status taxonomy',
    type: 'Static',
    grain: 'One row per status',
    primaryKey: 'account_status_key',
    naturalKey: 'status_code',
    schema: {
      account_status_key: "INTEGER PRIMARY KEY",
      status_code: "STRING UNIQUE",
      status_name: "STRING",
      is_active: "BOOLEAN",
      allows_transactions: "BOOLEAN",
    },
  },

  // Dimension 5: Ownership Type
  {
    name: 'gold.dim_ownership_type',
    description: 'Account ownership types',
    type: 'Static',
    grain: 'One row per ownership type',
    primaryKey: 'ownership_type_key',
    naturalKey: 'ownership_code',
    schema: {
      ownership_type_key: "INTEGER PRIMARY KEY",
      ownership_code: "STRING UNIQUE",
      ownership_name: "STRING COMMENT 'Individual|Joint|Trust|Business'",
      requires_multiple_signers: "BOOLEAN",
    },
  },

  // Dimension 6: Channel
  {
    name: 'gold.dim_channel',
    description: 'Transaction channels',
    type: 'SCD Type 1',
    grain: 'One row per channel',
    conformedDimension: true,
    primaryKey: 'channel_key',
    naturalKey: 'channel_code',
    schema: {
      channel_key: "BIGINT PRIMARY KEY",
      channel_code: "STRING UNIQUE",
      channel_name: "STRING",
      channel_type: "STRING COMMENT 'Branch|ATM|Online|Mobile|ACH|Wire'",
      is_digital: "BOOLEAN",
      is_self_service: "BOOLEAN",
    },
  },

  // Dimension 7: Interest Rate Tier
  {
    name: 'gold.dim_interest_rate_tier',
    description: 'Interest rate tiers',
    type: 'Static',
    grain: 'One row per rate tier',
    primaryKey: 'rate_tier_key',
    naturalKey: 'tier_code',
    schema: {
      rate_tier_key: "INTEGER PRIMARY KEY",
      tier_code: "STRING UNIQUE",
      tier_name: "STRING",
      min_balance: "DECIMAL(18,2)",
      max_balance: "DECIMAL(18,2)",
      base_rate: "DECIMAL(10,6)",
    },
  },

  // Dimension 8: Fee Type
  {
    name: 'gold.dim_fee_type',
    description: 'Fee type classification',
    type: 'Static',
    grain: 'One row per fee type',
    primaryKey: 'fee_type_key',
    naturalKey: 'fee_code',
    schema: {
      fee_type_key: "INTEGER PRIMARY KEY",
      fee_code: "STRING UNIQUE",
      fee_name: "STRING",
      fee_category: "STRING COMMENT 'Monthly|Overdraft|NSF|ATM|Wire|Transaction'",
      standard_amount: "DECIMAL(10,2)",
      is_waivable: "BOOLEAN",
    },
  },

  // Dimension 9: Statement Cycle
  {
    name: 'gold.dim_statement_cycle',
    description: 'Statement cycle periods',
    type: 'Static',
    grain: 'One row per cycle',
    primaryKey: 'statement_cycle_key',
    naturalKey: 'cycle_code',
    schema: {
      statement_cycle_key: "INTEGER PRIMARY KEY",
      cycle_code: "STRING UNIQUE",
      cycle_name: "STRING",
      cycle_day_of_month: "INTEGER",
      frequency: "STRING COMMENT 'Monthly|Quarterly'",
    },
  },

  // Dimension 10: Date (Conformed)
  {
    name: 'gold.dim_date',
    description: 'Date dimension',
    type: 'Static',
    grain: 'One row per day',
    conformedDimension: true,
    primaryKey: 'date_key',
    naturalKey: 'calendar_date',
    schema: {
      date_key: "INTEGER PRIMARY KEY COMMENT 'YYYYMMDD'",
      calendar_date: "DATE UNIQUE",
      year: "INTEGER",
      quarter: "INTEGER",
      month: "INTEGER",
      day_of_week: "INTEGER",
      is_weekend: "BOOLEAN",
      is_holiday: "BOOLEAN",
      is_business_day: "BOOLEAN",
      fiscal_year: "INTEGER",
      fiscal_quarter: "INTEGER",
    },
  },
];

export const depositsRetailGoldFacts = [
  // Fact 1: Account Transactions
  {
    name: 'gold.fact_deposit_transactions',
    description: 'All deposit account transactions',
    factType: 'Transaction',
    grain: 'One row per transaction',
    
    schema: {
      transaction_key: "BIGINT PRIMARY KEY",
      
      // DIMENSION FKs
      account_key: "BIGINT COMMENT 'FK to dim_retail_deposit_account'",
      customer_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
      transaction_type_key: "BIGINT COMMENT 'FK to dim_transaction_type'",
      transaction_date_key: "INTEGER COMMENT 'FK to dim_date'",
      posting_date_key: "INTEGER COMMENT 'FK to dim_date'",
      branch_key: "BIGINT COMMENT 'FK to dim_branch'",
      channel_key: "BIGINT COMMENT 'FK to dim_channel'",
      
      // DEGENERATE DIMENSIONS
      transaction_id: "BIGINT",
      transaction_timestamp: "TIMESTAMP",
      check_number: "STRING",
      merchant_name: "STRING",
      
      // ADDITIVE MEASURES
      transaction_amount: "DECIMAL(18,2) COMMENT 'Always positive'",
      transaction_count: "INTEGER DEFAULT 1",
      
      // SIGNED AMOUNTS (for aggregation)
      net_transaction_amount: "DECIMAL(18,2) COMMENT 'Positive for CR, negative for DR'",
      
      // NON-ADDITIVE
      running_balance_after: "DECIMAL(18,2) COMMENT 'Balance after transaction'",
      
      // FLAGS
      is_reversal: "BOOLEAN",
      is_fee: "BOOLEAN",
      is_interest: "BOOLEAN",
      
      // CTR/SAR
      ctf_reportable: "BOOLEAN",
      sar_reportable: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
  
  // Fact 2: Daily Account Balances
  {
    name: 'gold.fact_deposit_daily_balances',
    description: 'Daily account balance snapshots',
    factType: 'Periodic Snapshot',
    grain: 'One row per account per business day',
    
    schema: {
      balance_snapshot_key: "BIGINT PRIMARY KEY",
      
      account_key: "BIGINT",
      customer_key: "BIGINT",
      snapshot_date_key: "INTEGER",
      product_key: "BIGINT",
      
      // SEMI-ADDITIVE MEASURES (Balance - additive across accounts, not time)
      beginning_balance: "DECIMAL(18,2)",
      ending_balance: "DECIMAL(18,2)",
      available_balance: "DECIMAL(18,2)",
      collected_balance: "DECIMAL(18,2)",
      
      average_balance_mtd: "DECIMAL(18,2)",
      average_balance_ytd: "DECIMAL(18,2)",
      
      // FLOW MEASURES (Daily activity - fully additive)
      total_deposits_today: "DECIMAL(18,2)",
      total_withdrawals_today: "DECIMAL(18,2)",
      net_change_today: "DECIMAL(18,2)",
      
      deposit_count_today: "INTEGER",
      withdrawal_count_today: "INTEGER",
      transaction_count_today: "INTEGER",
      
      interest_accrued_today: "DECIMAL(18,2)",
      fees_charged_today: "DECIMAL(18,2)",
      
      // FLAGS
      is_business_day: "BOOLEAN",
      is_month_end: "BOOLEAN",
      is_quarter_end: "BOOLEAN",
      is_year_end: "BOOLEAN",
      
      account_active: "BOOLEAN",
      balance_below_minimum: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 3: Interest Accruals
  {
    name: 'gold.fact_deposit_interest',
    description: 'Daily interest accruals and payments',
    factType: 'Transaction',
    grain: 'One row per account per day',
    schema: {
      interest_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      account_key: "BIGINT",
      customer_key: "BIGINT",
      accrual_date_key: "INTEGER",
      product_key: "BIGINT",

      interest_rate: "DECIMAL(10,6)",
      balance_for_interest: "DECIMAL(18,2)",

      interest_earned: "DECIMAL(18,2)",
      interest_paid: "DECIMAL(18,2)",

      interest_accrued_mtd: "DECIMAL(18,2)",
      interest_accrued_ytd: "DECIMAL(18,2)",

      days_in_period: "INTEGER",

      created_timestamp: "TIMESTAMP",
    },
  },

  // Fact 4: Fees
  {
    name: 'gold.fact_deposit_fees',
    description: 'Fee assessments on deposit accounts',
    factType: 'Transaction',
    grain: 'One row per fee',
    schema: {
      fee_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      account_key: "BIGINT",
      customer_key: "BIGINT",
      fee_date_key: "INTEGER",
      product_key: "BIGINT",

      fee_id: "BIGINT COMMENT 'Degenerate dimension'",
      fee_type: "STRING",

      fee_amount: "DECIMAL(10,2)",
      fee_count: "INTEGER DEFAULT 1",

      fee_waived: "BOOLEAN",
      waived_amount: "DECIMAL(10,2)",

      created_timestamp: "TIMESTAMP",
    },
  },

  // Fact 5: Account Profitability
  {
    name: 'gold.fact_deposit_account_profitability',
    description: 'Monthly account profitability',
    factType: 'Periodic Snapshot',
    grain: 'One row per account per month',
    schema: {
      profitability_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      account_key: "BIGINT",
      customer_key: "BIGINT",
      month_key: "INTEGER",
      product_key: "BIGINT",
      branch_key: "BIGINT",

      average_balance: "DECIMAL(18,2)",

      revenue_interest_expense: "DECIMAL(18,2)",
      revenue_fees: "DECIMAL(18,2)",
      revenue_interchange: "DECIMAL(18,2)",
      total_revenue: "DECIMAL(18,2)",

      cost_servicing: "DECIMAL(18,2)",
      cost_fraud_losses: "DECIMAL(18,2)",
      total_cost: "DECIMAL(18,2)",

      net_income: "DECIMAL(18,2)",
      roi: "DECIMAL(10,4)",

      transaction_count: "INTEGER",

      created_timestamp: "TIMESTAMP",
    },
  },

  // Fact 6: Overdrafts
  {
    name: 'gold.fact_deposit_overdrafts',
    description: 'Overdraft events and fees',
    factType: 'Transaction',
    grain: 'One row per overdraft event',
    schema: {
      overdraft_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      account_key: "BIGINT",
      customer_key: "BIGINT",
      overdraft_date_key: "INTEGER",
      product_key: "BIGINT",

      overdraft_id: "BIGINT COMMENT 'Degenerate dimension'",

      overdraft_amount: "DECIMAL(18,2)",
      overdraft_count: "INTEGER DEFAULT 1",

      coverage_amount: "DECIMAL(18,2)",
      nsf_fee: "DECIMAL(10,2)",
      overdraft_fee: "DECIMAL(10,2)",
      total_fees: "DECIMAL(10,2)",

      days_overdrawn: "INTEGER",

      created_timestamp: "TIMESTAMP",
    },
  },
];

export const depositsRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail deposits - Kimball star schema',
  layer: 'GOLD',
  modelingApproach: 'Kimball Dimensional Modeling',
  
  dimensions: depositsRetailGoldDimensions,
  facts: depositsRetailGoldFacts,
  
  totalDimensions: 10,
  totalFacts: 6,
  estimatedSize: '150GB',
};
