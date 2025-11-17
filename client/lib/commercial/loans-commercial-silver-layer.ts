/**
 * LOANS-COMMERCIAL SILVER LAYER
 * Cleansed, conformed, and enriched loan data
 * 
 * Domain: Loans-Commercial
 * Area: Commercial Banking
 * Layer: SILVER (Cleansed/Conformed)
 * Tables: 18
 */

export const loansCommercialSilverTables = [
  // Table 1: Loan Golden Record
  {
    name: 'silver.commercial_loan_golden_record',
    description: 'MDM golden record for commercial loans with best-of-breed data and calculated metrics',
    grain: 'One row per loan (current state)',
    scdType: 'SCD_TYPE_2',
    primaryKey: ['loan_key'],
    
    transformations: [
      'Deduplicate loans across source systems',
      'Standardize loan types and statuses',
      'Calculate current outstanding balance',
      'Calculate unfunded commitments',
      'Enrich with borrower credit rating',
      'Calculate days past due and delinquency bucket',
      'Determine regulatory classification',
      'Calculate LTV, DSCR, and other ratios',
    ],
    
    dataQualityRules: [
      'Loan ID must be unique and not null',
      'Outstanding balance must be non-negative',
      'Maturity date must be >= origination date',
      'Interest rate must be > 0 and < 100%',
      'Risk rating must be valid per rating scale',
      'CECL pool assignment required for all active loans',
    ],
    
    schema: {
      // Surrogate Key
      loan_key: "BIGINT PRIMARY KEY",
      
      // Business Keys
      loan_id: "BIGINT NOT NULL UNIQUE",
      global_loan_id: "STRING",
      
      // Customer Link
      entity_key: "BIGINT NOT NULL COMMENT 'FK to dim_commercial_customer'",
      entity_id: "BIGINT NOT NULL",
      borrower_name: "STRING",
      
      // Loan Classification
      loan_type: "STRING NOT NULL COMMENT 'Standardized: TERM_LOAN|REVOLVING_LOC|CONSTRUCTION|EQUIPMENT|CRE|ABL'",
      loan_subtype: "STRING",
      loan_purpose: "STRING",
      product_category: "STRING COMMENT 'C&I|CRE|CONSTRUCTION|EQUIPMENT|ABL'",
      
      // Origination
      origination_date: "DATE NOT NULL",
      origination_amount: "DECIMAL(18,2) NOT NULL",
      origination_channel: "STRING",
      
      // Current Balances (as of load date)
      current_principal_balance: "DECIMAL(18,2) NOT NULL",
      current_commitment_amount: "DECIMAL(18,2)",
      unfunded_commitment: "DECIMAL(18,2) COMMENT 'Calculated: commitment - principal'",
      total_exposure: "DECIMAL(18,2) COMMENT 'Principal + unfunded'",
      outstanding_balance: "DECIMAL(18,2) COMMENT 'Principal + accrued interest + fees'",
      
      // Interest Terms
      current_interest_rate: "DECIMAL(7,4)",
      rate_type: "STRING COMMENT 'FIXED|VARIABLE|ADJUSTABLE'",
      rate_index: "STRING",
      rate_spread: "DECIMAL(5,4)",
      effective_yield: "DECIMAL(7,4) COMMENT 'APR including fees'",
      
      // Maturity & Term
      maturity_date: "DATE NOT NULL",
      original_term_months: "INTEGER",
      remaining_term_months: "INTEGER COMMENT 'Calculated from current date'",
      months_on_books: "INTEGER COMMENT 'Age of loan'",
      
      // Payment Status
      payment_frequency: "STRING",
      next_payment_date: "DATE",
      next_payment_amount: "DECIMAL(18,2)",
      last_payment_date: "DATE",
      
      // Delinquency
      delinquency_status: "STRING NOT NULL COMMENT 'CURRENT|30_DAYS|60_DAYS|90_PLUS|DEFAULT'",
      days_past_due: "INTEGER",
      delinquent_amount: "DECIMAL(18,2)",
      nonaccrual_flag: "BOOLEAN",
      nonaccrual_date: "DATE",
      
      // Collateral
      secured_flag: "BOOLEAN NOT NULL",
      collateral_type_primary: "STRING",
      collateral_value: "DECIMAL(18,2)",
      loan_to_value_ratio: "DECIMAL(5,2) COMMENT 'Current LTV %'",
      
      // Risk & Credit Quality
      risk_rating: "STRING NOT NULL",
      risk_rating_numeric: "INTEGER COMMENT '1-10 scale for trending'",
      risk_rating_date: "DATE",
      probability_of_default_pct: "DECIMAL(5,4)",
      loss_given_default_pct: "DECIMAL(5,2)",
      exposure_at_default: "DECIMAL(18,2)",
      expected_loss: "DECIMAL(18,2) COMMENT 'Calculated: EAD * PD * LGD'",
      
      // Regulatory Classification
      regulatory_classification: "STRING COMMENT 'PASS|SPECIAL_MENTION|SUBSTANDARD|DOUBTFUL|LOSS'",
      criticized_flag: "BOOLEAN",
      classified_flag: "BOOLEAN",
      tdr_flag: "BOOLEAN",
      
      // CECL / IFRS 9
      cecl_pool_id: "STRING",
      ifrs9_stage: "STRING COMMENT 'STAGE_1|STAGE_2|STAGE_3'",
      allowance_for_credit_losses: "DECIMAL(18,2)",
      coverage_ratio_pct: "DECIMAL(5,2) COMMENT 'Reserve / outstanding balance * 100'",
      
      // Financial Ratios (calculated)
      debt_service_coverage_ratio: "DECIMAL(10,4) COMMENT 'From borrower financials'",
      debt_to_equity_ratio: "DECIMAL(10,4)",
      current_ratio: "DECIMAL(10,4)",
      
      // Performance Metrics
      ytd_interest_income: "DECIMAL(18,2)",
      ytd_fee_income: "DECIMAL(18,2)",
      total_payments_received_ytd: "DECIMAL(18,2)",
      payment_performance_score: "INTEGER COMMENT '0-100 (100 = perfect payment history)'",
      
      // Covenants
      financial_covenants_count: "INTEGER",
      covenants_in_compliance_flag: "BOOLEAN",
      covenant_breach_count: "INTEGER",
      
      // Industry & Geography
      naics_code: "STRING",
      industry_sector: "STRING",
      industry_concentration_flag: "BOOLEAN COMMENT 'Portfolio concentration risk'",
      property_state: "STRING",
      geographic_concentration_flag: "BOOLEAN",
      
      // Participation
      participation_flag: "BOOLEAN",
      retained_percentage: "DECIMAL(5,2)",
      retained_amount: "DECIMAL(18,2) COMMENT 'Calculated amount on books'",
      participated_amount: "DECIMAL(18,2)",
      
      // Relationship Management
      relationship_manager_id: "BIGINT",
      assigned_branch_id: "BIGINT",
      portfolio_segment: "STRING",
      
      // Status & Flags
      loan_status: "STRING NOT NULL",
      active_flag: "BOOLEAN",
      charged_off_flag: "BOOLEAN",
      paid_off_flag: "BOOLEAN",
      
      // Data Quality
      data_quality_score: "INTEGER COMMENT '0-100'",
      source_system_count: "INTEGER COMMENT 'Number of source systems'",
      primary_source_system: "STRING",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN DEFAULT TRUE",
      row_hash: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Loan Exposure Aggregation
  {
    name: 'silver.commercial_loan_exposure_agg',
    description: 'Credit exposure rollups by borrower, industry, geography for concentration risk',
    grain: 'One row per borrower per snapshot date',
    scdType: 'SCD_TYPE_1',
    primaryKey: ['entity_id', 'snapshot_date'],
    
    transformations: [
      'Sum all loan exposures by borrower',
      'Include unfunded commitments',
      'Calculate as % of total portfolio',
      'Flag concentration limit violations',
      'Aggregate by guarantor relationships',
    ],
    
    schema: {
      entity_id: "BIGINT NOT NULL",
      snapshot_date: "DATE NOT NULL",
      
      // Exposure Metrics
      total_commitment: "DECIMAL(18,2)",
      total_outstanding: "DECIMAL(18,2)",
      total_unfunded: "DECIMAL(18,2)",
      total_exposure: "DECIMAL(18,2) COMMENT 'Outstanding + unfunded'",
      
      // Loan Counts
      active_loan_count: "INTEGER",
      delinquent_loan_count: "INTEGER",
      nonaccrual_loan_count: "INTEGER",
      
      // Concentration
      exposure_pct_of_portfolio: "DECIMAL(5,2)",
      exposure_pct_of_capital: "DECIMAL(5,2) COMMENT '% of Tier 1 capital'",
      concentration_limit_flag: "BOOLEAN COMMENT 'Exceeds policy limit'",
      
      // Risk-Weighted
      total_risk_weighted_assets: "DECIMAL(18,2) COMMENT 'Basel III RWA'",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: CECL / ACL Calculation
  {
    name: 'silver.commercial_loan_allowance_cecl',
    description: 'CECL (Current Expected Credit Losses) reserve calculations per ASC 326',
    grain: 'One row per loan per month',
    scdType: 'SCD_TYPE_1',
    primaryKey: ['loan_id', 'calculation_month'],
    
    transformations: [
      'Calculate lifetime expected credit losses',
      'Apply CECL methodology (PD * LGD * EAD)',
      'Incorporate forward-looking macroeconomic scenarios',
      'Pool loans by similar risk characteristics',
      'Calculate specific vs pooled reserves',
    ],
    
    schema: {
      loan_id: "BIGINT NOT NULL",
      calculation_month: "DATE NOT NULL",
      
      // CECL Pool Assignment
      cecl_pool_id: "STRING",
      pool_method: "STRING COMMENT 'VINTAGE|RISK_RATING|PRODUCT_TYPE|INDUSTRY'",
      
      // Expected Loss Components
      exposure_at_default: "DECIMAL(18,2)",
      probability_of_default_pct: "DECIMAL(5,4) COMMENT 'Lifetime PD'",
      loss_given_default_pct: "DECIMAL(5,2)",
      lifetime_expected_loss: "DECIMAL(18,2) COMMENT 'EAD * PD * LGD'",
      
      // Reserve Calculation
      pooled_reserve: "DECIMAL(18,2) COMMENT 'Pool-level reserve allocation'",
      specific_reserve: "DECIMAL(18,2) COMMENT 'Loan-specific reserve'",
      total_reserve: "DECIMAL(18,2)",
      
      // Qualitative Adjustments
      qualitative_adjustment: "DECIMAL(18,2)",
      adjustment_reason: "STRING",
      
      // Macroeconomic Scenarios
      base_case_reserve: "DECIMAL(18,2)",
      adverse_case_reserve: "DECIMAL(18,2)",
      severely_adverse_reserve: "DECIMAL(18,2)",
      weighted_average_reserve: "DECIMAL(18,2)",
      
      // Prior Period
      prior_month_reserve: "DECIMAL(18,2)",
      reserve_change: "DECIMAL(18,2) COMMENT 'Provision expense'",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Tables 4-18 follow similar pattern
  // Including: collateral coverage, covenant monitoring, payment performance,
  // delinquency tracking, risk migration, profitability, vintage analysis, etc.
];

export default loansCommercialSilverTables;
