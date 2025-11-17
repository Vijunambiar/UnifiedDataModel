/**
 * LOANS-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model for retail lending
 * 11 Dimensions + 7 Facts
 */

export const loansRetailGoldDimensions = [
  // Dimension 1: Loan Account
  {
    name: 'gold.dim_retail_loan',
    description: 'Loan dimension with full loan attributes',
    type: 'SCD Type 1',
    grain: 'One row per unique loan',
    
    schema: {
      loan_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      loan_id: "BIGINT UNIQUE",
      loan_number: "STRING UNIQUE",
      
      // CLASSIFICATION
      loan_type: "STRING COMMENT 'Personal|Auto|Student|HELOC'",
      loan_subtype: "STRING",
      loan_purpose: "STRING",
      loan_category: "STRING COMMENT 'Secured|Unsecured'",
      
      product_code: "STRING",
      product_name: "STRING",
      
      // BORROWER
      primary_borrower_key: "BIGINT",
      primary_borrower_name: "STRING",
      borrower_count: "INTEGER",
      has_co_borrower: "BOOLEAN",
      
      // STATUS
      loan_status: "STRING",
      loan_stage: "STRING",
      is_active: "BOOLEAN",
      is_delinquent: "BOOLEAN",
      is_charged_off: "BOOLEAN",
      
      // LIFECYCLE DATES
      origination_date: "DATE",
      maturity_date: "DATE",
      paid_off_date: "DATE",
      loan_age_months: "INTEGER",
      loan_age_band: "STRING COMMENT '<1yr|1-3yr|3-5yr|5+yr'",
      
      // AMOUNTS
      original_loan_amount: "DECIMAL(18,2)",
      original_amount_tier: "STRING COMMENT '<5K|5K-10K|10K-25K|25K-50K|50K+'",
      
      // INTEREST
      interest_rate_type: "STRING COMMENT 'Fixed|Variable'",
      current_interest_rate: "DECIMAL(10,6)",
      rate_tier: "STRING COMMENT 'Excellent|Good|Fair|Subprime'",
      
      // TERMS
      original_term_months: "INTEGER",
      term_band: "STRING COMMENT '12-36mo|37-60mo|61-84mo|85+mo'",
      payment_frequency: "STRING",
      
      // COLLATERAL
      collateral_type: "STRING",
      is_secured: "BOOLEAN",
      
      // AUTO-SPECIFIC
      vehicle_type: "STRING COMMENT 'New|Used|CPO'",
      vehicle_make: "STRING",
      vehicle_year: "INTEGER",
      
      // STUDENT-SPECIFIC
      academic_level: "STRING",
      
      // HELOC-SPECIFIC
      is_heloc: "BOOLEAN",
      draw_period_active: "BOOLEAN",
      
      // SERVICING
      originating_branch_key: "BIGINT",
      loan_officer_key: "BIGINT",
      
      // PERFORMANCE
      ever_delinquent: "BOOLEAN",
      ever_30dpd: "BOOLEAN",
      ever_60dpd: "BOOLEAN",
      ever_90dpd: "BOOLEAN",
      
      has_been_modified: "BOOLEAN",
      
      // FEATURES
      autopay_enrolled: "BOOLEAN",
      has_payment_protection: "BOOLEAN",
      
      // AUDIT
      created_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
    },
    
    hierarchies: [
      {
        name: 'Loan Product Hierarchy',
        levels: [
          { level: 1, attribute: 'loan_category', description: 'Secured|Unsecured' },
          { level: 2, attribute: 'loan_type', description: 'Personal|Auto|Student|HELOC' },
          { level: 3, attribute: 'loan_subtype', description: 'Detailed product' },
        ],
      },
    ],
  },
  
  // Dimension 2: Loan Performance Status
  {
    name: 'gold.dim_loan_performance_status',
    description: 'Loan performance and delinquency status',
    type: 'SCD Type 1',
    grain: 'One row per status code',
    
    schema: {
      performance_status_key: "BIGINT PRIMARY KEY",
      performance_status_code: "STRING UNIQUE",
      performance_status_name: "STRING",
      
      delinquency_bucket: "STRING COMMENT 'Current|30DPD|60DPD|90DPD|120+DPD|ChargeOff'",
      days_past_due_min: "INTEGER",
      days_past_due_max: "INTEGER",
      
      is_performing: "BOOLEAN",
      is_delinquent: "BOOLEAN",
      is_default: "BOOLEAN",
      
      regulatory_classification: "STRING COMMENT 'Pass|Special Mention|Substandard|Doubtful|Loss'",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 3: Loan Product
  {
    name: 'gold.dim_loan_product',
    description: 'Loan product catalog',
    type: 'SCD Type 2',
    grain: 'One row per product per effective period',

    schema: {
      product_key: "BIGINT PRIMARY KEY",
      product_code: "STRING",
      product_name: "STRING",
      loan_type: "STRING",
      loan_category: "STRING",
      min_amount: "DECIMAL(18,2)",
      max_amount: "DECIMAL(18,2)",
      min_term_months: "INTEGER",
      max_term_months: "INTEGER",
      is_active: "BOOLEAN",
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
    },
  },

  // Dimension 4: Loan Purpose
  {
    name: 'gold.dim_loan_purpose',
    description: 'Purpose/reason for loan',
    type: 'SCD Type 1',
    grain: 'One row per purpose category',

    schema: {
      purpose_key: "BIGINT PRIMARY KEY",
      purpose_code: "STRING UNIQUE",
      purpose_name: "STRING",
      purpose_category: "STRING COMMENT 'Consumer|Business|Education|Home'",
      purpose_description: "STRING",
    },
  },

  // Dimension 5: Collateral Type
  {
    name: 'gold.dim_collateral_type',
    description: 'Types of collateral for secured loans',
    type: 'SCD Type 1',
    grain: 'One row per collateral type',

    schema: {
      collateral_type_key: "BIGINT PRIMARY KEY",
      collateral_type_code: "STRING UNIQUE",
      collateral_type_name: "STRING",
      collateral_category: "STRING COMMENT 'Vehicle|Real Estate|Securities|Equipment|None'",
      requires_appraisal: "BOOLEAN",
      requires_insurance: "BOOLEAN",
    },
  },

  // Dimension 6: Payment Method
  {
    name: 'gold.dim_payment_method',
    description: 'Payment methods and channels',
    type: 'SCD Type 1',
    grain: 'One row per payment method',

    schema: {
      payment_method_key: "BIGINT PRIMARY KEY",
      payment_method_code: "STRING UNIQUE",
      payment_method_name: "STRING",
      payment_type: "STRING COMMENT 'ACH|Check|Wire|Cash|Card'",
      channel: "STRING COMMENT 'Branch|Online|Mobile|Phone|ATM|Mail'",
      is_electronic: "BOOLEAN",
      is_autopay_eligible: "BOOLEAN",
    },
  },

  // Dimension 7: Underwriting Decision
  {
    name: 'gold.dim_underwriting_decision',
    description: 'Underwriting decision outcomes',
    type: 'SCD Type 1',
    grain: 'One row per decision type',

    schema: {
      decision_key: "BIGINT PRIMARY KEY",
      decision_code: "STRING UNIQUE",
      decision_name: "STRING",
      decision_category: "STRING COMMENT 'Approved|Declined|Conditional|Refer'",
      is_approval: "BOOLEAN",
      requires_manual_review: "BOOLEAN",
    },
  },

  // Dimension 8: Collection Status
  {
    name: 'gold.dim_collection_status',
    description: 'Collection status and stages',
    type: 'SCD Type 1',
    grain: 'One row per collection status',

    schema: {
      collection_status_key: "BIGINT PRIMARY KEY",
      collection_status_code: "STRING UNIQUE",
      collection_status_name: "STRING",
      collection_stage: "STRING COMMENT 'None|Internal|External|Legal|Recovery'",
      is_in_collections: "BOOLEAN",
      severity_level: "INTEGER COMMENT '1-5 scale'",
    },
  },

  // Dimension 9: Modification Type
  {
    name: 'gold.dim_modification_type',
    description: 'Loan modification types',
    type: 'SCD Type 1',
    grain: 'One row per modification type',

    schema: {
      modification_type_key: "BIGINT PRIMARY KEY",
      modification_type_code: "STRING UNIQUE",
      modification_type_name: "STRING",
      modification_category: "STRING COMMENT 'Rate|Term|Payment|Principal|Workout'",
      is_loss_mitigation: "BOOLEAN",
    },
  },

  // Dimension 10: Interest Rate Tier
  {
    name: 'gold.dim_interest_rate_tier',
    description: 'Interest rate tiers and credit quality bands',
    type: 'SCD Type 1',
    grain: 'One row per rate tier',

    schema: {
      rate_tier_key: "BIGINT PRIMARY KEY",
      rate_tier_code: "STRING UNIQUE",
      rate_tier_name: "STRING COMMENT 'Excellent|Good|Fair|Subprime'",
      credit_score_min: "INTEGER",
      credit_score_max: "INTEGER",
      typical_apr_min: "DECIMAL(10,6)",
      typical_apr_max: "DECIMAL(10,6)",
    },
  },

  // Dimension 11: Date (Conformed)
  {
    name: 'gold.dim_date',
    description: 'Date dimension (conformed across all retail domains)',
    type: 'SCD Type 1',
    grain: 'One row per calendar date',

    schema: {
      date_key: "INTEGER PRIMARY KEY COMMENT 'YYYYMMDD format'",
      full_date: "DATE UNIQUE",
      year: "INTEGER",
      quarter: "INTEGER",
      month: "INTEGER",
      week: "INTEGER",
      day_of_month: "INTEGER",
      day_of_week: "INTEGER",
      day_name: "STRING",
      month_name: "STRING",
      is_weekend: "BOOLEAN",
      is_holiday: "BOOLEAN",
      fiscal_year: "INTEGER",
      fiscal_quarter: "INTEGER",
    },
  },
];

export const loansRetailGoldFacts = [
  // Fact 1: Loan Originations
  {
    name: 'gold.fact_loan_originations',
    description: 'Loan origination events',
    factType: 'Transaction',
    grain: 'One row per loan originated',
    
    schema: {
      origination_key: "BIGINT PRIMARY KEY",
      
      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      origination_date_key: "INTEGER",
      product_key: "BIGINT",
      branch_key: "BIGINT",
      loan_officer_key: "BIGINT",
      
      // DEGENERATE DIMENSIONS
      application_id: "BIGINT",
      
      // MEASURES
      loan_amount: "DECIMAL(18,2)",
      origination_count: "INTEGER DEFAULT 1",
      
      approved_amount: "DECIMAL(18,2)",
      funded_amount: "DECIMAL(18,2)",
      
      interest_rate: "DECIMAL(10,6)",
      apr: "DECIMAL(10,6)",
      term_months: "INTEGER",
      
      origination_fee: "DECIMAL(18,2)",
      
      // UNDERWRITING METRICS
      credit_score_at_origination: "INTEGER",
      debt_to_income_ratio: "DECIMAL(5,2)",
      loan_to_value_ratio: "DECIMAL(5,2)",
      
      // FLAGS
      is_secured: "BOOLEAN",
      has_co_borrower: "BOOLEAN",
      autopay_enrolled: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
  
  // Fact 2: Loan Payments
  {
    name: 'gold.fact_loan_payments',
    description: 'All loan payment transactions',
    factType: 'Transaction',
    grain: 'One row per payment',
    
    schema: {
      payment_key: "BIGINT PRIMARY KEY",
      
      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      payment_date_key: "INTEGER",
      payment_due_date_key: "INTEGER",
      payment_method_key: "BIGINT",
      channel_key: "BIGINT",
      
      payment_id: "BIGINT",
      payment_number: "INTEGER",
      
      // MEASURES
      payment_amount: "DECIMAL(18,2)",
      principal_portion: "DECIMAL(18,2)",
      interest_portion: "DECIMAL(18,2)",
      fee_portion: "DECIMAL(18,2)",
      
      payment_count: "INTEGER DEFAULT 1",
      
      // FLAGS
      is_late_payment: "BOOLEAN",
      is_autopay: "BOOLEAN",
      is_extra_payment: "BOOLEAN",
      is_payoff: "BOOLEAN",
      
      days_late: "INTEGER",
      late_fee_assessed: "DECIMAL(18,2)",
      
      // NON-ADDITIVE
      principal_balance_after: "DECIMAL(18,2)",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
  
  // Fact 3: Daily Loan Balances
  {
    name: 'gold.fact_loan_daily_balances',
    description: 'Daily loan balance snapshots',
    factType: 'Periodic Snapshot',
    grain: 'One row per loan per business day',
    
    schema: {
      balance_snapshot_key: "BIGINT PRIMARY KEY",
      
      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      snapshot_date_key: "INTEGER",
      performance_status_key: "BIGINT",
      
      // SEMI-ADDITIVE MEASURES (Balances)
      principal_balance: "DECIMAL(18,2)",
      interest_balance: "DECIMAL(18,2)",
      fee_balance: "DECIMAL(18,2)",
      total_balance: "DECIMAL(18,2)",
      
      // FLOW MEASURES (Daily activity)
      principal_paid_today: "DECIMAL(18,2)",
      interest_paid_today: "DECIMAL(18,2)",
      interest_accrued_today: "DECIMAL(18,2)",
      
      // DELINQUENCY
      days_past_due: "INTEGER",
      delinquent_amount: "DECIMAL(18,2)",
      
      // NON-ADDITIVE
      current_interest_rate: "DECIMAL(10,6)",
      payment_to_income_ratio: "DECIMAL(5,2)",
      
      // FLAGS
      is_active: "BOOLEAN",
      is_performing: "BOOLEAN",
      is_delinquent: "BOOLEAN",
      is_in_collection: "BOOLEAN",
      
      is_month_end: "BOOLEAN",
      is_quarter_end: "BOOLEAN",
      is_year_end: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
  
  // Fact 4: Loan Delinquency Events
  {
    name: 'gold.fact_loan_delinquency',
    description: 'Delinquency events and status changes',
    factType: 'Accumulating Snapshot',
    grain: 'One row per delinquency event',

    schema: {
      delinquency_key: "BIGINT PRIMARY KEY",

      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      delinquency_start_date_key: "INTEGER",
      performance_status_key: "BIGINT",
      collection_status_key: "BIGINT",

      // MEASURES
      delinquent_amount: "DECIMAL(18,2)",
      days_past_due: "INTEGER",
      missed_payment_count: "INTEGER",

      delinquency_event_count: "INTEGER DEFAULT 1",

      // DATES
      cure_date_key: "INTEGER COMMENT 'Date returned to current (null if still delinquent)'",
      days_to_cure: "INTEGER",

      // FLAGS
      resulted_in_charge_off: "BOOLEAN",
      resulted_in_modification: "BOOLEAN",
      cured_flag: "BOOLEAN",

      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 5: Loan Charge-Offs
  {
    name: 'gold.fact_loan_charge_offs',
    description: 'Loan charge-off events and recoveries',
    factType: 'Transaction',
    grain: 'One row per charge-off event',

    schema: {
      charge_off_key: "BIGINT PRIMARY KEY",

      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      charge_off_date_key: "INTEGER",
      product_key: "BIGINT",

      // MEASURES
      principal_charged_off: "DECIMAL(18,2)",
      interest_charged_off: "DECIMAL(18,2)",
      fees_charged_off: "DECIMAL(18,2)",
      total_charge_off_amount: "DECIMAL(18,2)",

      charge_off_count: "INTEGER DEFAULT 1",

      // RECOVERY
      recovery_amount_to_date: "DECIMAL(18,2)",
      net_loss_amount: "DECIMAL(18,2)",

      days_past_due_at_charge_off: "INTEGER",

      // FLAGS
      bankruptcy_related: "BOOLEAN",
      fraud_related: "BOOLEAN",

      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 6: Loan Profitability
  {
    name: 'gold.fact_loan_profitability',
    description: 'Monthly loan profitability analysis',
    factType: 'Periodic Snapshot',
    grain: 'One row per loan per month',

    schema: {
      profitability_key: "BIGINT PRIMARY KEY",

      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      month_key: "INTEGER",
      product_key: "BIGINT",
      branch_key: "BIGINT",

      // REVENUE
      interest_income: "DECIMAL(18,2)",
      fee_income: "DECIMAL(18,2)",
      total_revenue: "DECIMAL(18,2)",

      // COSTS
      cost_of_funds: "DECIMAL(18,2)",
      servicing_costs: "DECIMAL(18,2)",
      provision_for_credit_losses: "DECIMAL(18,2)",
      operating_expenses: "DECIMAL(18,2)",
      total_costs: "DECIMAL(18,2)",

      // PROFITABILITY
      net_income: "DECIMAL(18,2)",

      // BALANCES (Semi-additive)
      average_principal_balance: "DECIMAL(18,2)",

      // RATIOS (Non-additive)
      net_interest_margin_pct: "DECIMAL(10,6)",
      return_on_assets_pct: "DECIMAL(10,6)",

      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 7: Collection Activities
  {
    name: 'gold.fact_loan_collections',
    description: 'Collection contacts and activities',
    factType: 'Transaction',
    grain: 'One row per collection activity',

    schema: {
      collection_activity_key: "BIGINT PRIMARY KEY",

      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      activity_date_key: "INTEGER",
      collection_status_key: "BIGINT",
      collector_key: "BIGINT",

      activity_id: "BIGINT",

      // MEASURES
      collection_activity_count: "INTEGER DEFAULT 1",

      promised_payment_amount: "DECIMAL(18,2)",

      // CATEGORIZATION
      activity_type: "STRING COMMENT 'Phone|Email|Letter|SMS|In-Person'",
      contact_result: "STRING COMMENT 'Spoke|Message|NoAnswer|Promise'",

      // FLAGS
      resulted_in_payment: "BOOLEAN",
      payment_promise_kept: "BOOLEAN",

      // DATES
      promised_payment_date_key: "INTEGER",

      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // ========================================
  // IFRS9 / CECL COMPLIANCE FACTS (P0)
  // ========================================

  // Fact 8: Loan Reserves (CECL/IFRS9 ECL)
  {
    name: 'gold.fact_loan_reserves',
    description: 'CECL/IFRS9 Expected Credit Loss reserves and allowances',
    factType: 'Periodic Snapshot',
    grain: 'One row per loan per reporting date',

    schema: {
      reserve_snapshot_key: "BIGINT PRIMARY KEY",

      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      snapshot_date_key: "INTEGER",
      product_key: "BIGINT",
      branch_key: "BIGINT",
      performance_status_key: "BIGINT",

      // DEGENERATE DIMENSIONS
      ifrs9_stage: "STRING COMMENT 'Stage 1|Stage 2|Stage 3'",
      regulatory_classification: "STRING COMMENT 'Pass|Special Mention|Substandard|Doubtful|Loss'",

      // EXPOSURE MEASURES
      outstanding_principal_balance: "DECIMAL(18,2)",
      accrued_interest: "DECIMAL(18,2)",
      total_exposure: "DECIMAL(18,2)",
      undrawn_commitment: "DECIMAL(18,2)",
      total_facility_exposure: "DECIMAL(18,2)",

      // CREDIT RISK PARAMETERS (Non-Additive)
      pd_12_month: "DECIMAL(10,6) COMMENT 'Probability of default - 12 months'",
      pd_lifetime: "DECIMAL(10,6) COMMENT 'Probability of default - lifetime'",
      lgd: "DECIMAL(5,2) COMMENT 'Loss given default %'",
      ead: "DECIMAL(18,2) COMMENT 'Exposure at default'",

      // EXPECTED CREDIT LOSS (Additive)
      ecl_12_month: "DECIMAL(18,2) COMMENT '12-month ECL (Stage 1)'",
      ecl_lifetime: "DECIMAL(18,2) COMMENT 'Lifetime ECL (Stage 2/3)'",
      ecl_allowance: "DECIMAL(18,2) COMMENT 'Total ECL allowance for this loan'",

      // CECL SPECIFIC
      cecl_reserve_amount: "DECIMAL(18,2) COMMENT 'CECL allowance (US GAAP)'",
      cecl_methodology: "STRING COMMENT 'DCF|Loss Rate|Roll Rate|Vintage'",

      // SCENARIO-BASED ECL
      base_scenario_ecl: "DECIMAL(18,2)",
      optimistic_scenario_ecl: "DECIMAL(18,2)",
      pessimistic_scenario_ecl: "DECIMAL(18,2)",
      weighted_average_ecl: "DECIMAL(18,2)",

      base_scenario_weight: "DECIMAL(5,2)",
      optimistic_scenario_weight: "DECIMAL(5,2)",
      pessimistic_scenario_weight: "DECIMAL(5,2)",

      // RESERVE MOVEMENTS (Flow Measures)
      reserve_opening_balance: "DECIMAL(18,2)",
      reserve_provision_expense: "DECIMAL(18,2) COMMENT 'P&L impact'",
      reserve_charge_offs: "DECIMAL(18,2) COMMENT 'Utilization'",
      reserve_recoveries: "DECIMAL(18,2) COMMENT 'Post charge-off recoveries'",
      reserve_closing_balance: "DECIMAL(18,2)",

      reserve_net_movement: "DECIMAL(18,2) COMMENT 'Net change in reserve'",

      // COLLATERAL COVERAGE
      collateral_value: "DECIMAL(18,2)",
      collateral_haircut_pct: "DECIMAL(5,2)",
      net_collateral_value: "DECIMAL(18,2)",
      unsecured_exposure: "DECIMAL(18,2)",
      collateral_coverage_ratio: "DECIMAL(10,6) COMMENT 'Collateral / Exposure'",

      // RESERVE ADEQUACY RATIOS (Non-Additive)
      reserve_to_exposure_ratio: "DECIMAL(10,6) COMMENT 'Reserve % of exposure'",
      reserve_coverage_ratio: "DECIMAL(10,6) COMMENT 'Reserve / NPL ratio'",
      ecl_coverage_ratio: "DECIMAL(10,6) COMMENT 'ECL / Total Loans'",

      // QUALITATIVE ADJUSTMENTS
      qualitative_adjustment: "DECIMAL(18,2) COMMENT 'Management overlay'",
      qualitative_adjustment_reason: "STRING",

      // BASEL III
      basel_risk_weight: "DECIMAL(5,2) COMMENT 'Basel risk weight %'",
      risk_weighted_assets: "DECIMAL(18,2) COMMENT 'RWA amount'",

      // MODEL METADATA
      pd_model_version: "STRING",
      lgd_model_version: "STRING",
      ecl_model_version: "STRING",
      model_run_id: "BIGINT",
      calculation_timestamp: "TIMESTAMP",

      // FLAGS
      is_month_end: "BOOLEAN",
      is_quarter_end: "BOOLEAN",
      is_year_end: "BOOLEAN",
      is_regulatory_reporting_date: "BOOLEAN",

      significant_increase_in_credit_risk_flag: "BOOLEAN",
      credit_impaired_flag: "BOOLEAN",
      default_flag: "BOOLEAN",

      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 9: IFRS9 Stage Transitions
  {
    name: 'gold.fact_ifrs9_stage_transitions',
    description: 'IFRS9 stage migration events and transition matrix',
    factType: 'Transaction',
    grain: 'One row per stage transition event',

    schema: {
      transition_key: "BIGINT PRIMARY KEY",

      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      transition_date_key: "INTEGER",
      product_key: "BIGINT",

      // STAGE TRANSITION
      prior_stage: "STRING COMMENT 'Stage 1|Stage 2|Stage 3'",
      new_stage: "STRING COMMENT 'Stage 1|Stage 2|Stage 3'",
      transition_type: "STRING COMMENT 'Upgrade|Downgrade|New Origination|Payoff'",

      // TRIGGERS
      transition_trigger: "STRING COMMENT 'SICR|Cure|Default|30+DPD|Rating Downgrade|Forbearance'",
      trigger_description: "STRING",

      days_in_prior_stage: "INTEGER",

      // IMPACT MEASURES
      ecl_before_transition: "DECIMAL(18,2)",
      ecl_after_transition: "DECIMAL(18,2)",
      ecl_impact: "DECIMAL(18,2) COMMENT 'Change in ECL due to transition'",

      reserve_before_transition: "DECIMAL(18,2)",
      reserve_after_transition: "DECIMAL(18,2)",
      reserve_impact: "DECIMAL(18,2)",

      // LOAN ATTRIBUTES AT TRANSITION
      loan_balance_at_transition: "DECIMAL(18,2)",
      days_past_due_at_transition: "INTEGER",

      pd_before_transition: "DECIMAL(10,6)",
      pd_after_transition: "DECIMAL(10,6)",

      // COUNTS
      transition_count: "INTEGER DEFAULT 1",

      // FLAGS
      resulted_in_provision_increase: "BOOLEAN",
      required_regulatory_reporting: "BOOLEAN",

      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 10: Stress Test Projections (CCAR/DFAST)
  {
    name: 'gold.fact_loan_stress_test_projections',
    description: 'CCAR/DFAST stress test scenario projections',
    factType: 'Periodic Snapshot',
    grain: 'One row per loan per scenario per projection quarter',

    schema: {
      stress_projection_key: "BIGINT PRIMARY KEY",

      loan_key: "BIGINT",
      borrower_key: "BIGINT",
      projection_date_key: "INTEGER",
      product_key: "BIGINT",

      // SCENARIO IDENTIFICATION
      stress_scenario_id: "STRING COMMENT 'Baseline|Adverse|Severely Adverse'",
      stress_test_cycle: "STRING COMMENT 'CCAR 2024|DFAST 2024'",
      projection_quarter: "INTEGER COMMENT 'Quarter number in projection (1-9)'",

      // MACROECONOMIC ASSUMPTIONS
      gdp_growth_rate: "DECIMAL(10,6) COMMENT 'GDP growth % for quarter'",
      unemployment_rate: "DECIMAL(5,2) COMMENT 'Unemployment rate %'",
      home_price_index_change: "DECIMAL(10,6) COMMENT 'HPI change %'",
      interest_rate_10yr_treasury: "DECIMAL(10,6) COMMENT '10-year Treasury rate'",
      bbg_corporate_spread: "DECIMAL(10,6) COMMENT 'BBB corporate spread'",

      // PROJECTED BALANCE MEASURES
      projected_principal_balance: "DECIMAL(18,2)",
      projected_exposure: "DECIMAL(18,2)",

      // PROJECTED RISK PARAMETERS
      projected_pd: "DECIMAL(10,6) COMMENT 'Projected probability of default'",
      projected_lgd: "DECIMAL(5,2) COMMENT 'Projected loss given default'",
      projected_ead: "DECIMAL(18,2) COMMENT 'Projected exposure at default'",

      // PROJECTED LOSSES
      projected_ecl: "DECIMAL(18,2) COMMENT 'Projected expected credit loss'",
      projected_default_amount: "DECIMAL(18,2) COMMENT 'Projected defaults'",
      projected_charge_off_amount: "DECIMAL(18,2) COMMENT 'Projected charge-offs'",

      // PROJECTED REVENUE
      projected_interest_income: "DECIMAL(18,2)",
      projected_fee_income: "DECIMAL(18,2)",
      projected_total_revenue: "DECIMAL(18,2)",

      // PROJECTED PROVISIONS
      projected_provision_expense: "DECIMAL(18,2) COMMENT 'Projected provision P&L'",
      projected_reserve_balance: "DECIMAL(18,2) COMMENT 'Projected allowance'",

      // PROJECTED CAPITAL IMPACT
      projected_rwa: "DECIMAL(18,2) COMMENT 'Projected risk-weighted assets'",
      projected_capital_requirement: "DECIMAL(18,2)",

      // DELTA FROM BASE
      delta_from_baseline_ecl: "DECIMAL(18,2) COMMENT 'Difference from baseline scenario'",
      delta_from_baseline_provision: "DECIMAL(18,2)",
      delta_from_baseline_rwa: "DECIMAL(18,2)",

      // MODEL METADATA
      stress_model_version: "STRING",
      projection_run_id: "BIGINT",
      projection_timestamp: "TIMESTAMP",

      // FLAGS
      is_severely_adverse: "BOOLEAN",
      is_final_projection_quarter: "BOOLEAN",

      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
];

export const loansRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail loans - Kimball star schema with IFRS9/CECL compliance',
  layer: 'GOLD',
  modelingApproach: 'Kimball Dimensional Modeling',

  dimensions: loansRetailGoldDimensions,
  facts: loansRetailGoldFacts,

  totalDimensions: 11,
  totalFacts: 10,
  estimatedSize: '300GB',

  complianceFrameworks: ['IFRS9', 'CECL (ASC 326)', 'Basel III/IV', 'CCAR/DFAST', 'BCBS 239'],

  keyCapabilities: [
    'Expected Credit Loss (ECL) calculation and tracking',
    'IFRS9 3-stage model implementation',
    'CECL lifetime credit loss methodology',
    'Stress testing projections (CCAR/DFAST)',
    'PD/LGD/EAD credit risk parameters',
    'Collateral valuation and LGD calculation',
    'Reserve adequacy and coverage ratios',
    'Stage transition monitoring and impact analysis',
  ],
};
