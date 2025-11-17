/**
 * DEPOSITS-COMMERCIAL SILVER LAYER
 * Cleansed, conformed, and enriched deposit data
 * 
 * Domain: Deposits-Commercial
 * Area: Commercial Banking
 * Layer: SILVER (Cleansed/Conformed)
 * Tables: 16
 */

export const depositsCommercialSilverTables = [
  // Table 1: Deposit Account Golden Record
  {
    name: 'silver.commercial_deposit_golden_record',
    description: 'MDM golden record for commercial deposit accounts with calculated metrics',
    grain: 'One row per deposit account (current state)',
    scdType: 'SCD_TYPE_2',
    primaryKey: ['account_key'],
    
    transformations: [
      'Deduplicate accounts across source systems',
      'Standardize account types and statuses',
      'Calculate average daily balances (7/30/90 day)',
      'Calculate account velocity metrics',
      'Enrich with customer segment and profitability',
      'Identify dormant and at-risk accounts',
      'Calculate service utilization scores',
    ],
    
    dataQualityRules: [
      'Account ID must be unique and not null',
      'Current balance must be >= 0 for most account types',
      'Interest rate must be >= 0 and < 20%',
      'Account type must be valid enumeration',
      'Opening date must be <= current date',
    ],
    
    schema: {
      account_key: "BIGINT PRIMARY KEY",
      account_id: "BIGINT NOT NULL UNIQUE",
      account_number: "STRING",
      
      entity_key: "BIGINT NOT NULL COMMENT 'FK to dim_commercial_customer'",
      entity_id: "BIGINT",
      
      // Account Classification
      account_type: "STRING NOT NULL",
      account_subtype: "STRING",
      account_purpose: "STRING",
      product_category: "STRING",
      
      // Dates
      account_open_date: "DATE NOT NULL",
      account_age_months: "INTEGER COMMENT 'Calculated from open date'",
      last_transaction_date: "DATE",
      days_since_last_activity: "INTEGER",
      
      // Current Balances
      current_balance: "DECIMAL(18,2) NOT NULL",
      available_balance: "DECIMAL(18,2)",
      collected_balance: "DECIMAL(18,2)",
      
      // Average Balances
      avg_daily_balance_7d: "DECIMAL(18,2)",
      avg_daily_balance_30d: "DECIMAL(18,2)",
      avg_daily_balance_90d: "DECIMAL(18,2)",
      avg_monthly_balance: "DECIMAL(18,2)",
      
      // Balance Trends
      balance_trend_30d: "STRING COMMENT 'GROWING|STABLE|DECLINING'",
      balance_volatility_score: "INTEGER COMMENT '0-100 (100 = highly volatile)'",
      
      // Interest
      interest_bearing_flag: "BOOLEAN",
      current_interest_rate: "DECIMAL(7,4)",
      ytd_interest_paid: "DECIMAL(18,2)",
      
      // Activity Metrics
      mtd_transaction_count: "INTEGER",
      mtd_deposit_count: "INTEGER",
      mtd_withdrawal_count: "INTEGER",
      mtd_deposit_amount: "DECIMAL(18,2)",
      mtd_withdrawal_amount: "DECIMAL(18,2)",
      account_velocity: "DECIMAL(10,2) COMMENT 'Turnover rate'",
      
      // Treasury Services
      lockbox_flag: "BOOLEAN",
      positive_pay_flag: "BOOLEAN",
      ach_origination_flag: "BOOLEAN",
      wire_enabled_flag: "BOOLEAN",
      treasury_service_count: "INTEGER COMMENT 'Number of services enrolled'",
      
      // Fees & Revenue
      monthly_fee: "DECIMAL(18,2)",
      ytd_fees_charged: "DECIMAL(18,2)",
      ytd_fee_waivers: "DECIMAL(18,2)",
      
      // Profitability
      ytd_interest_expense: "DECIMAL(18,2)",
      ytd_fee_income: "DECIMAL(18,2)",
      ytd_total_revenue: "DECIMAL(18,2)",
      ytd_cost_to_serve: "DECIMAL(18,2)",
      ytd_net_income: "DECIMAL(18,2)",
      profitability_score: "INTEGER COMMENT '0-100'",
      
      // Status
      account_status: "STRING NOT NULL",
      active_flag: "BOOLEAN",
      dormant_flag: "BOOLEAN",
      frozen_flag: "BOOLEAN",
      
      // Risk Indicators
      overdraft_count_ytd: "INTEGER",
      nsf_count_ytd: "INTEGER",
      fraud_alert_count_ytd: "INTEGER",
      risk_score: "INTEGER COMMENT '0-100 (higher = riskier)'",
      
      // Relationship
      relationship_manager_id: "BIGINT",
      service_tier: "STRING",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Daily Balance Aggregations
  {
    name: 'silver.commercial_daily_balance_agg',
    description: 'Daily aggregated balances with calculated metrics',
    grain: 'One row per account per day',
    scdType: 'SCD_TYPE_1',
    primaryKey: ['account_id', 'balance_date'],
    
    transformations: [
      'Calculate net change in balances',
      'Calculate intraday volatility',
      'Identify unusual balance movements',
      'Calculate reserve requirements',
      'Calculate investable balances',
    ],
    
    schema: {
      account_id: "BIGINT NOT NULL",
      balance_date: "DATE NOT NULL",
      
      opening_balance: "DECIMAL(18,2)",
      closing_balance: "DECIMAL(18,2)",
      average_balance: "DECIMAL(18,2)",
      
      net_change: "DECIMAL(18,2) COMMENT 'Closing - opening'",
      net_change_pct: "DECIMAL(5,2)",
      
      total_credits: "DECIMAL(18,2)",
      total_debits: "DECIMAL(18,2)",
      net_activity: "DECIMAL(18,2)",
      
      transaction_count: "INTEGER",
      
      reserve_balance: "DECIMAL(18,2)",
      investable_balance: "DECIMAL(18,2)",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Account Profitability
  {
    name: 'silver.commercial_deposit_profitability',
    description: 'Monthly account profitability with FTP allocations',
    grain: 'One row per account per month',
    scdType: 'SCD_TYPE_1',
    primaryKey: ['account_id', 'profit_month'],
    
    transformations: [
      'Calculate funds transfer pricing (FTP) benefit',
      'Allocate operating costs',
      'Calculate net interest income',
      'Calculate return on deposits',
    ],
    
    schema: {
      account_id: "BIGINT NOT NULL",
      profit_month: "DATE NOT NULL",
      
      average_balance: "DECIMAL(18,2)",
      
      // Revenue
      interest_expense: "DECIMAL(18,2)",
      fee_income: "DECIMAL(18,2)",
      ftp_credit: "DECIMAL(18,2) COMMENT 'FTP benefit of deposit funding'",
      total_revenue: "DECIMAL(18,2)",
      
      // Costs
      operating_expense: "DECIMAL(18,2)",
      allocated_overhead: "DECIMAL(18,2)",
      total_costs: "DECIMAL(18,2)",
      
      // Profitability
      net_income: "DECIMAL(18,2)",
      return_on_deposits_pct: "DECIMAL(5,2) COMMENT 'Net income / avg balance * 100'",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Tables 4-16 follow similar pattern
];

export default depositsCommercialSilverTables;
