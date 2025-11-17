/**
 * LOANS-COMMERCIAL GOLD LAYER
 * Dimensional model for commercial loan analytics
 * 
 * Domain: Loans-Commercial
 * Area: Commercial Banking
 * Layer: GOLD (Dimensional/Kimball Model)
 * Dimensions: 14 | Facts: 10
 */

export const loansCommercialGoldDimensions = [
  // Dimension 1: Loan Account
  {
    name: 'gold.dim_loan_account',
    description: 'Type 2 slowly changing dimension for commercial loan accounts',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per loan per effective period',
    primaryKey: ['loan_sk'],
    businessKey: ['loan_id'],
    
    schema: {
      // Surrogate Key
      loan_sk: "BIGINT PRIMARY KEY",
      
      // Business Key
      loan_id: "BIGINT NOT NULL",
      global_loan_id: "STRING",
      
      // Loan Classification
      loan_type: "STRING",
      loan_subtype: "STRING",
      loan_purpose: "STRING",
      product_category: "STRING",
      
      // Terms
      origination_date: "DATE",
      maturity_date: "DATE",
      original_term_months: "INTEGER",
      rate_type: "STRING",
      
      // Status
      loan_status: "STRING",
      secured_flag: "BOOLEAN",
      
      // Risk
      risk_rating: "STRING",
      regulatory_classification: "STRING",
      
      // Flags
      tdr_flag: "BOOLEAN",
      nonaccrual_flag: "BOOLEAN",
      participation_flag: "BOOLEAN",
      
      // SCD Type 2
      effective_start_date: "DATE NOT NULL",
      effective_end_date: "DATE",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 2: Loan Type
  {
    name: 'gold.dim_loan_type',
    description: 'Loan product types and categories',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per loan type',
    primaryKey: ['loan_type_sk'],
    businessKey: ['loan_type_code'],
    
    schema: {
      loan_type_sk: "BIGINT PRIMARY KEY",
      loan_type_code: "STRING NOT NULL UNIQUE",
      loan_type_name: "STRING",
      loan_type_category: "STRING COMMENT 'C&I|CRE|CONSTRUCTION|EQUIPMENT|ABL'",
      secured_typically: "BOOLEAN",
      revolving_flag: "BOOLEAN",
      amortizing_flag: "BOOLEAN",
      typical_term_months: "INTEGER",
      basel_risk_weight_pct: "DECIMAL(5,2) COMMENT 'Basel III risk weight'",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 3: Collateral Type
  {
    name: 'gold.dim_collateral_type',
    description: 'Types of collateral securing loans',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per collateral type',
    primaryKey: ['collateral_type_sk'],
    businessKey: ['collateral_type_code'],
    
    schema: {
      collateral_type_sk: "BIGINT PRIMARY KEY",
      collateral_type_code: "STRING NOT NULL UNIQUE",
      collateral_type_name: "STRING",
      collateral_category: "STRING COMMENT 'REAL_ESTATE|EQUIPMENT|FINANCIAL_ASSETS|OTHER'",
      typical_advance_rate: "DECIMAL(5,2) COMMENT 'Typical LTV %'",
      appraisal_required: "BOOLEAN",
      appraisal_frequency_months: "INTEGER",
      liquidation_timeframe_days: "INTEGER COMMENT 'Expected time to liquidate'",
      basel_risk_weight_reduction: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 4: Risk Rating
  {
    name: 'gold.dim_risk_rating',
    description: 'Internal loan risk rating scale',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per risk rating',
    primaryKey: ['risk_rating_sk'],
    businessKey: ['risk_rating_code'],
    
    schema: {
      risk_rating_sk: "BIGINT PRIMARY KEY",
      risk_rating_code: "STRING NOT NULL UNIQUE COMMENT '1|2|3|...|10 or PASS|WATCH|etc'",
      risk_rating_name: "STRING",
      risk_rating_category: "STRING COMMENT 'PASS|WATCH|SUBSTANDARD|DOUBTFUL|LOSS'",
      regulatory_classification: "STRING",
      criticized_flag: "BOOLEAN",
      classified_flag: "BOOLEAN",
      pd_range_low: "DECIMAL(5,4) COMMENT 'Min PD %'",
      pd_range_high: "DECIMAL(5,4) COMMENT 'Max PD %'",
      typical_pd: "DECIMAL(5,4)",
      typical_lgd: "DECIMAL(5,2)",
      sort_order: "INTEGER",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 5: Delinquency Status
  {
    name: 'gold.dim_delinquency_status',
    description: 'Loan delinquency bucket codes',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per delinquency status',
    primaryKey: ['delinquency_sk'],
    businessKey: ['delinquency_code'],
    
    schema: {
      delinquency_sk: "BIGINT PRIMARY KEY",
      delinquency_code: "STRING NOT NULL UNIQUE",
      delinquency_name: "STRING",
      days_past_due_min: "INTEGER",
      days_past_due_max: "INTEGER",
      nonaccrual_required: "BOOLEAN",
      charge_off_required: "BOOLEAN",
      sort_order: "INTEGER",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimensions 6-14 include:
  // - dim_loan_purpose
  // - dim_covenant_type  
  // - dim_modification_type
  // - dim_regulatory_classification
  // - dim_cecl_pool
  // - dim_participation_type
  // - dim_sba_program
  // - dim_loan_officer
  // - dim_property_type (CRE)
];

export const loansCommercialGoldFacts = [
  // Fact 1: Loan Balances (Daily Snapshot)
  {
    name: 'gold.fact_loan_balances',
    description: 'Daily snapshot of loan balances and exposures',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per loan per day',
    primaryKey: ['loan_sk', 'balance_date_sk'],
    
    dimensions: [
      'dim_loan_account (loan_sk)',
      'dim_date (balance_date_sk)',
      'dim_commercial_customer (customer_sk)',
      'dim_loan_type (loan_type_sk)',
      'dim_collateral_type (collateral_type_sk)',
      'dim_risk_rating (risk_rating_sk)',
      'dim_delinquency_status (delinquency_sk)',
    ],
    
    schema: {
      // Dimension Keys
      loan_sk: "BIGINT NOT NULL",
      balance_date_sk: "INTEGER NOT NULL",
      customer_sk: "BIGINT",
      loan_type_sk: "BIGINT",
      collateral_type_sk: "BIGINT",
      risk_rating_sk: "BIGINT",
      delinquency_sk: "BIGINT",
      
      // Degenerate Dimensions
      loan_id: "BIGINT",
      snapshot_date: "DATE",
      
      // Additive Measures - Balances
      principal_balance: "DECIMAL(18,2)",
      commitment_amount: "DECIMAL(18,2)",
      unfunded_commitment: "DECIMAL(18,2)",
      total_exposure: "DECIMAL(18,2)",
      accrued_interest: "DECIMAL(18,2)",
      
      // Additive Measures - Reserves
      allowance_for_credit_losses: "DECIMAL(18,2)",
      specific_reserve: "DECIMAL(18,2)",
      
      // Additive Measures - Collateral
      collateral_value: "DECIMAL(18,2)",
      
      // Semi-Additive Measures (Period-end balances)
      eod_principal_balance: "DECIMAL(18,2)",
      eod_accrued_interest: "DECIMAL(18,2)",
      
      // Non-Additive Measures
      current_interest_rate: "DECIMAL(7,4)",
      loan_to_value_ratio: "DECIMAL(5,2)",
      days_past_due: "INTEGER",
      
      // Risk Metrics (Non-Additive)
      probability_of_default_pct: "DECIMAL(5,4)",
      loss_given_default_pct: "DECIMAL(5,2)",
      expected_loss: "DECIMAL(18,2)",
      
      // Flags
      active_flag: "BOOLEAN",
      nonaccrual_flag: "BOOLEAN",
      delinquent_flag: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    partitioning: "PARTITION BY RANGE (balance_date_sk) -- Monthly partitions",
    
    indexes: [
      "CREATE INDEX idx_fact_balances_loan ON gold.fact_loan_balances(loan_sk)",
      "CREATE INDEX idx_fact_balances_date ON gold.fact_loan_balances(balance_date_sk)",
      "CREATE INDEX idx_fact_balances_customer ON gold.fact_loan_balances(customer_sk, balance_date_sk)",
    ],
  },
  
  // Fact 2: Loan Originations (Transaction)
  {
    name: 'gold.fact_loan_originations',
    description: 'Loan origination events',
    factType: 'TRANSACTION',
    grain: 'One row per loan originated',
    
    schema: {
      loan_sk: "BIGINT NOT NULL",
      origination_date_sk: "INTEGER NOT NULL",
      customer_sk: "BIGINT",
      loan_type_sk: "BIGINT",
      
      // Measures
      origination_amount: "DECIMAL(18,2)",
      origination_fee: "DECIMAL(18,2)",
      commitment_amount: "DECIMAL(18,2)",
      
      // Terms
      original_interest_rate: "DECIMAL(7,4)",
      original_term_months: "INTEGER",
      
      // Application Metrics
      application_to_origination_days: "INTEGER",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Fact 3: Loan Payments (Transaction)
  {
    name: 'gold.fact_loan_payments',
    description: 'Loan payment transactions',
    factType: 'TRANSACTION',
    grain: 'One row per payment',
    
    schema: {
      payment_sk: "BIGINT PRIMARY KEY",
      loan_sk: "BIGINT NOT NULL",
      payment_date_sk: "INTEGER NOT NULL",
      customer_sk: "BIGINT",
      
      // Measures - Additive
      payment_amount_total: "DECIMAL(18,2)",
      payment_amount_principal: "DECIMAL(18,2)",
      payment_amount_interest: "DECIMAL(18,2)",
      payment_amount_fees: "DECIMAL(18,2)",
      late_fee_amount: "DECIMAL(18,2)",
      prepayment_penalty: "DECIMAL(18,2)",
      
      // Non-Additive
      days_late: "INTEGER",
      
      // Flags
      late_payment_flag: "BOOLEAN",
      prepayment_flag: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Fact 4: Loan Profitability (Periodic Snapshot)
  {
    name: 'gold.fact_loan_profitability',
    description: 'Monthly loan profitability with FTP allocations',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per loan per month',
    
    schema: {
      loan_sk: "BIGINT NOT NULL",
      month_sk: "INTEGER NOT NULL",
      customer_sk: "BIGINT",
      
      // Revenue
      interest_income: "DECIMAL(18,2)",
      fee_income: "DECIMAL(18,2)",
      total_revenue: "DECIMAL(18,2)",
      
      // Costs
      cost_of_funds: "DECIMAL(18,2) COMMENT 'FTP allocation'",
      provision_expense: "DECIMAL(18,2)",
      operating_expenses: "DECIMAL(18,2)",
      total_costs: "DECIMAL(18,2)",
      
      // Profitability
      net_income: "DECIMAL(18,2)",
      return_on_assets_pct: "DECIMAL(5,2)",
      net_interest_margin_pct: "DECIMAL(5,2)",
      
      // Risk-Adjusted
      raroc_pct: "DECIMAL(5,2) COMMENT 'Risk-Adjusted Return on Capital'",
      economic_value_added: "DECIMAL(18,2)",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Facts 5-10 include:
  // - fact_loan_credit_losses (charge-offs & recoveries)
  // - fact_loan_modifications (TDR events)
  // - fact_covenant_compliance (covenant testing)
  // - fact_collateral_valuations (appraisals)
  // - fact_loan_draws (construction/revolving draws)
  // - fact_risk_migrations (rating changes)
];

export const loansCommercialGoldLayer = {
  dimensions: loansCommercialGoldDimensions,
  facts: loansCommercialGoldFacts,
};

export default loansCommercialGoldLayer;
