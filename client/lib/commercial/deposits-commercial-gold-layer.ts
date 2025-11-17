/**
 * DEPOSITS-COMMERCIAL GOLD LAYER
 * Dimensional model for commercial deposit analytics
 * 
 * Domain: Deposits-Commercial
 * Area: Commercial Banking
 * Layer: GOLD (Dimensional/Kimball Model)
 * Dimensions: 12 | Facts: 8
 */

export const depositsCommercialGoldDimensions = [
  // Dimension 1: Deposit Account
  {
    name: 'gold.dim_deposit_account',
    description: 'Type 2 slowly changing dimension for commercial deposit accounts',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per account per effective period',
    primaryKey: ['account_sk'],
    businessKey: ['account_id'],
    
    schema: {
      account_sk: "BIGINT PRIMARY KEY",
      account_id: "BIGINT NOT NULL",
      account_number: "STRING",
      account_type: "STRING",
      account_subtype: "STRING",
      account_purpose: "STRING",
      account_open_date: "DATE",
      interest_bearing_flag: "BOOLEAN",
      account_status: "STRING",
      effective_start_date: "DATE NOT NULL",
      effective_end_date: "DATE",
      is_current: "BOOLEAN DEFAULT TRUE",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 2: Account Type
  {
    name: 'gold.dim_account_type',
    description: 'Deposit account product types',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per account type',
    primaryKey: ['account_type_sk'],
    businessKey: ['account_type_code'],
    
    schema: {
      account_type_sk: "BIGINT PRIMARY KEY",
      account_type_code: "STRING NOT NULL UNIQUE",
      account_type_name: "STRING",
      account_category: "STRING COMMENT 'DDA|SAVINGS|TIME_DEPOSIT|TREASURY'",
      interest_bearing: "BOOLEAN",
      transaction_limited: "BOOLEAN COMMENT 'Reg D limit applies'",
      fdic_insured: "BOOLEAN",
      typical_interest_rate: "DECIMAL(7,4)",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 3: Treasury Service
  {
    name: 'gold.dim_treasury_service',
    description: 'Cash management and treasury services',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per service type',
    primaryKey: ['service_sk'],
    businessKey: ['service_code'],
    
    schema: {
      service_sk: "BIGINT PRIMARY KEY",
      service_code: "STRING NOT NULL UNIQUE",
      service_name: "STRING",
      service_category: "STRING COMMENT 'PAYMENTS|RECEIPTS|INFO_REPORTING|FRAUD_PREVENTION'",
      monthly_fee: "DECIMAL(18,2)",
      per_transaction_fee: "DECIMAL(18,2)",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimensions 4-12 include fee types, transaction types, etc.
];

export const depositsCommercialGoldFacts = [
  // Fact 1: Deposit Balances (Daily Snapshot)
  {
    name: 'gold.fact_deposit_balances',
    description: 'Daily snapshot of deposit account balances',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per account per day',
    primaryKey: ['account_sk', 'balance_date_sk'],
    
    schema: {
      account_sk: "BIGINT NOT NULL",
      balance_date_sk: "INTEGER NOT NULL",
      customer_sk: "BIGINT",
      account_type_sk: "BIGINT",
      
      opening_balance: "DECIMAL(18,2)",
      closing_balance: "DECIMAL(18,2)",
      average_balance: "DECIMAL(18,2)",
      available_balance: "DECIMAL(18,2)",
      
      total_credits: "DECIMAL(18,2)",
      total_debits: "DECIMAL(18,2)",
      transaction_count: "INTEGER",
      
      interest_accrued: "DECIMAL(18,2)",
      fees_charged: "DECIMAL(18,2)",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Fact 2: Deposit Transactions
  {
    name: 'gold.fact_deposit_transactions',
    description: 'Deposit account transaction details',
    factType: 'TRANSACTION',
    grain: 'One row per transaction',
    
    schema: {
      transaction_sk: "BIGINT PRIMARY KEY",
      account_sk: "BIGINT NOT NULL",
      transaction_date_sk: "INTEGER NOT NULL",
      customer_sk: "BIGINT",
      
      transaction_amount: "DECIMAL(18,2)",
      debit_credit_indicator: "STRING",
      
      transaction_count: "INTEGER DEFAULT 1",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Fact 3: Deposit Profitability
  {
    name: 'gold.fact_deposit_profitability',
    description: 'Monthly deposit account profitability',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per account per month',
    
    schema: {
      account_sk: "BIGINT NOT NULL",
      month_sk: "INTEGER NOT NULL",
      customer_sk: "BIGINT",
      
      average_balance: "DECIMAL(18,2)",
      interest_expense: "DECIMAL(18,2)",
      fee_income: "DECIMAL(18,2)",
      ftp_benefit: "DECIMAL(18,2)",
      total_revenue: "DECIMAL(18,2)",
      operating_expense: "DECIMAL(18,2)",
      net_income: "DECIMAL(18,2)",
      
      return_on_deposits_pct: "DECIMAL(5,2)",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Facts 4-8 include treasury service usage, fees, ACH/wire volumes, etc.
];

export const depositsCommercialGoldLayer = {
  dimensions: depositsCommercialGoldDimensions,
  facts: depositsCommercialGoldFacts,
};

export default depositsCommercialGoldLayer;
