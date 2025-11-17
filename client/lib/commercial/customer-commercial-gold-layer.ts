/**
 * CUSTOMER-COMMERCIAL GOLD LAYER
 * Dimensional model for business entity analytics
 * 
 * Domain: Customer-Commercial
 * Area: Commercial Banking
 * Layer: GOLD (Dimensional/Kimball Model)
 * Dimensions: 10 | Facts: 6
 */

export const customerCommercialGoldDimensions = [
  // Dimension 1: Commercial Customer
  {
    name: 'gold.dim_commercial_customer',
    description: 'Type 2 slowly changing dimension for commercial business entities',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per unique entity per effective period',
    primaryKey: ['customer_sk'],
    businessKey: ['entity_id'],
    
    schema: {
      // Surrogate Key
      customer_sk: "BIGINT PRIMARY KEY COMMENT 'Surrogate key (auto-increment)'",
      
      // Natural/Business Keys
      entity_id: "BIGINT NOT NULL COMMENT 'Natural key from source'",
      global_entity_id: "STRING COMMENT 'Global LEI or DUNS'",
      
      // Legal Attributes
      legal_name: "STRING NOT NULL",
      dba_name: "STRING",
      entity_type: "STRING COMMENT 'LLC|C_CORP|S_CORP|PARTNERSHIP|SOLE_PROP|NONPROFIT|GOVERNMENT'",
      entity_type_desc: "STRING",
      incorporation_state: "STRING",
      incorporation_country: "STRING",
      incorporation_date: "DATE",
      
      // Identifiers
      ein_tax_id: "STRING COMMENT 'Encrypted'",
      duns_number: "STRING",
      lei_code: "STRING",
      naics_code: "STRING",
      naics_description: "STRING",
      sic_code: "STRING",
      
      // Industry Classification
      industry_sector: "STRING",
      industry_subsector: "STRING",
      industry_group: "STRING",
      industry_vertical: "STRING",
      
      // Firmographics
      annual_revenue: "DECIMAL(18,2)",
      revenue_range: "STRING",
      revenue_range_sort_order: "INTEGER",
      employee_count: "INTEGER",
      employee_count_range: "STRING",
      employee_range_sort_order: "INTEGER",
      years_in_business: "INTEGER",
      business_age_group: "STRING COMMENT 'STARTUP(<2yr)|EMERGING(2-5yr)|ESTABLISHED(5-10yr)|MATURE(10+yr)'",
      business_lifecycle_stage: "STRING",
      
      // Location
      hq_address_line1: "STRING",
      hq_city: "STRING",
      hq_state: "STRING",
      hq_postal_code: "STRING",
      hq_county: "STRING",
      hq_metro_area: "STRING",
      hq_region: "STRING COMMENT 'Northeast|Southeast|Midwest|Southwest|West'",
      number_of_locations: "INTEGER",
      geographic_footprint: "STRING",
      
      // Banking Relationship
      customer_since_date: "DATE NOT NULL",
      customer_tenure_years: "INTEGER",
      customer_tenure_band: "STRING COMMENT '<1yr|1-3yr|3-5yr|5-10yr|10+yr'",
      customer_status: "STRING",
      customer_segment: "STRING",
      customer_tier: "STRING",
      
      // Ownership
      public_private_indicator: "STRING",
      publicly_traded_flag: "BOOLEAN",
      stock_ticker: "STRING",
      parent_company_name: "STRING",
      entity_hierarchy_level: "INTEGER",
      
      // Risk Ratings
      internal_risk_rating: "STRING",
      internal_risk_score: "INTEGER",
      credit_rating: "STRING COMMENT 'Best available rating (Moody/S&P/Fitch)'",
      aml_risk_rating: "STRING",
      
      // Compliance Status
      kyb_status: "STRING",
      kyb_current_flag: "BOOLEAN COMMENT 'KYB not expired'",
      pep_flag: "BOOLEAN",
      sanctions_flag: "BOOLEAN",
      
      // Certifications
      minority_owned_flag: "BOOLEAN",
      women_owned_flag: "BOOLEAN",
      veteran_owned_flag: "BOOLEAN",
      small_business_certified_flag: "BOOLEAN",
      
      // Relationship Management
      primary_rm_name: "STRING",
      primary_rm_id: "BIGINT",
      assigned_branch_name: "STRING",
      assigned_region: "STRING",
      
      // Data Quality
      data_quality_score: "INTEGER",
      record_completeness_pct: "DECIMAL(5,2)",
      
      // SCD Type 2 Fields
      effective_start_date: "DATE NOT NULL",
      effective_end_date: "DATE COMMENT '9999-12-31 for current'",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      row_current_flag: "STRING COMMENT 'Y|N for easier querying'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_customer_entity_id ON gold.dim_commercial_customer(entity_id)",
      "CREATE INDEX idx_dim_customer_current ON gold.dim_commercial_customer(is_current, customer_status)",
      "CREATE INDEX idx_dim_customer_segment ON gold.dim_commercial_customer(customer_segment, customer_tier)",
      "CREATE INDEX idx_dim_customer_effective_dates ON gold.dim_commercial_customer(effective_start_date, effective_end_date)",
    ],
  },
  
  // Dimension 2: Industry Classification
  {
    name: 'gold.dim_industry',
    description: 'Industry classification hierarchy (NAICS-based)',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per unique industry code',
    primaryKey: ['industry_sk'],
    businessKey: ['naics_code'],
    
    schema: {
      industry_sk: "BIGINT PRIMARY KEY",
      naics_code: "STRING NOT NULL UNIQUE COMMENT '6-digit NAICS'",
      naics_description: "STRING",
      
      // Hierarchy
      sector_code: "STRING COMMENT '2-digit sector'",
      sector_name: "STRING",
      subsector_code: "STRING COMMENT '3-digit'",
      subsector_name: "STRING",
      industry_group_code: "STRING COMMENT '4-digit'",
      industry_group_name: "STRING",
      naics_industry_code: "STRING COMMENT '5-digit'",
      naics_industry_name: "STRING",
      
      // Bank Classification
      bank_industry_vertical: "STRING",
      high_risk_industry_flag: "BOOLEAN",
      regulated_industry_flag: "BOOLEAN",
      
      // Attributes
      typical_revenue_range: "STRING",
      typical_employee_range: "STRING",
      capital_intensity: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      cyclical_indicator: "BOOLEAN",
      
      // SIC Mapping (Legacy)
      sic_code: "STRING COMMENT '4-digit SIC'",
      sic_description: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 3: Entity Type
  {
    name: 'gold.dim_entity_type',
    description: 'Business entity legal structure types',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per entity type',
    primaryKey: ['entity_type_sk'],
    businessKey: ['entity_type_code'],
    
    schema: {
      entity_type_sk: "BIGINT PRIMARY KEY",
      entity_type_code: "STRING NOT NULL UNIQUE",
      entity_type_name: "STRING",
      entity_type_description: "STRING",
      entity_category: "STRING COMMENT 'CORPORATION|PARTNERSHIP|SOLE_PROP|NONPROFIT|GOVERNMENT'",
      limited_liability_flag: "BOOLEAN",
      pass_through_taxation_flag: "BOOLEAN",
      ownership_structure: "STRING COMMENT 'Single|Multiple|Public'",
      typical_size_range: "STRING",
      common_industries: "STRING",
      sort_order: "INTEGER",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 4: Credit Rating
  {
    name: 'gold.dim_credit_rating',
    description: 'Credit rating codes and risk levels',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per rating',
    primaryKey: ['credit_rating_sk'],
    businessKey: ['rating_code'],
    
    schema: {
      credit_rating_sk: "BIGINT PRIMARY KEY",
      rating_code: "STRING NOT NULL UNIQUE COMMENT 'AAA|AA|A|BBB|BB|B|CCC|CC|C|D'",
      rating_agency: "STRING COMMENT 'MOODYS|SP|FITCH|DBRS|INTERNAL'",
      rating_description: "STRING",
      rating_category: "STRING COMMENT 'INVESTMENT_GRADE|NON_INVESTMENT_GRADE|DEFAULT'",
      investment_grade_flag: "BOOLEAN",
      risk_level: "STRING COMMENT 'MINIMAL|LOW|MODERATE|HIGH|VERY_HIGH|DEFAULT'",
      numeric_score: "INTEGER COMMENT 'Normalized 0-100 score'",
      default_probability_range: "STRING",
      sort_order: "INTEGER",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 5: Business Lifecycle Stage
  {
    name: 'gold.dim_business_lifecycle',
    description: 'Business maturity and lifecycle stages',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per lifecycle stage',
    primaryKey: ['lifecycle_sk'],
    businessKey: ['lifecycle_stage_code'],
    
    schema: {
      lifecycle_sk: "BIGINT PRIMARY KEY",
      lifecycle_stage_code: "STRING NOT NULL UNIQUE",
      lifecycle_stage_name: "STRING",
      lifecycle_description: "STRING",
      typical_years_in_business: "STRING",
      typical_growth_rate: "STRING",
      typical_profitability: "STRING",
      risk_profile: "STRING",
      lending_appetite: "STRING COMMENT 'LOW|MODERATE|HIGH'",
      sort_order: "INTEGER",
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimensions 6-10 follow similar pattern:
  // - dim_revenue_bracket (revenue size tiers)
  // - dim_relationship_manager (RM dimension)
  // - dim_geographic_market (market segmentation)
  // - dim_entity_relationship_type (relationship classifications)
  // - dim_ownership_type (ownership structure types)
];

export const customerCommercialGoldFacts = [
  // Fact 1: Commercial Customer Profile (Periodic Snapshot)
  {
    name: 'gold.fact_commercial_customer_profile',
    description: 'Monthly snapshot of commercial customer profile metrics',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per customer per month',
    primaryKey: ['customer_sk', 'snapshot_date_sk'],
    
    dimensions: [
      'dim_commercial_customer (customer_sk)',
      'dim_date (snapshot_date_sk)',
      'dim_industry (industry_sk)',
      'dim_entity_type (entity_type_sk)',
      'dim_credit_rating (credit_rating_sk)',
      'dim_business_lifecycle (lifecycle_sk)',
      'dim_revenue_bracket (revenue_bracket_sk)',
      'dim_relationship_manager (rm_sk)',
      'dim_geographic_market (market_sk)',
    ],
    
    schema: {
      // Dimension Foreign Keys
      customer_sk: "BIGINT NOT NULL",
      snapshot_date_sk: "INTEGER NOT NULL COMMENT 'YYYYMMDD'",
      industry_sk: "BIGINT",
      entity_type_sk: "BIGINT",
      credit_rating_sk: "BIGINT",
      lifecycle_sk: "BIGINT",
      revenue_bracket_sk: "BIGINT",
      rm_sk: "BIGINT",
      market_sk: "BIGINT",
      
      // Degenerate Dimensions
      snapshot_month: "DATE NOT NULL",
      fiscal_year: "INTEGER",
      fiscal_quarter: "INTEGER",
      
      // Additive Measures
      annual_revenue: "DECIMAL(18,2)",
      employee_count: "INTEGER",
      total_credit_exposure: "DECIMAL(18,2) COMMENT 'Bank total exposure'",
      total_deposits: "DECIMAL(18,2)",
      total_loans: "DECIMAL(18,2)",
      total_treasury_volume: "DECIMAL(18,2) COMMENT 'Monthly treasury transaction volume'",
      total_fee_revenue: "DECIMAL(18,2) COMMENT 'Monthly fees generated'",
      total_interest_income: "DECIMAL(18,2)",
      total_accounts: "INTEGER",
      
      // Semi-Additive Measures (can sum across customers, not time)
      eod_checking_balance: "DECIMAL(18,2)",
      eod_savings_balance: "DECIMAL(18,2)",
      eod_money_market_balance: "DECIMAL(18,2)",
      eod_loan_balance: "DECIMAL(18,2)",
      eod_unused_credit_limit: "DECIMAL(18,2)",
      
      // Non-Additive Measures (ratios, percentages, counts)
      relationship_depth_score: "DECIMAL(5,2) COMMENT 'Products per customer (0-100)'",
      wallet_share_pct: "DECIMAL(5,2) COMMENT 'Est. % of total banking wallet'",
      internal_risk_score: "INTEGER",
      paydex_score: "INTEGER",
      nps_score: "INTEGER COMMENT 'Net Promoter Score (-100 to 100)'",
      customer_tenure_months: "INTEGER",
      days_since_last_contact: "INTEGER",
      
      // Profitability Measures
      monthly_revenue: "DECIMAL(18,2)",
      monthly_cost_to_serve: "DECIMAL(18,2)",
      monthly_net_income: "DECIMAL(18,2)",
      customer_lifetime_value: "DECIMAL(18,2) COMMENT 'Calculated CLV'",
      
      // Activity Measures
      monthly_transaction_count: "INTEGER",
      monthly_login_count: "INTEGER",
      monthly_service_calls: "INTEGER",
      monthly_complaints: "INTEGER",
      
      // Flags
      active_flag: "BOOLEAN",
      kyb_current_flag: "BOOLEAN",
      cross_sell_opportunity_flag: "BOOLEAN",
      at_risk_flag: "BOOLEAN COMMENT 'Churn risk model output'",
      
      // Calculated Indicators
      relationship_health_score: "DECIMAL(5,2) COMMENT 'Composite health (0-100)'",
      growth_potential_score: "DECIMAL(5,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    partitioning: "PARTITION BY RANGE (snapshot_date_sk) -- Monthly partitions",
    
    indexes: [
      "CREATE INDEX idx_fact_profile_customer ON gold.fact_commercial_customer_profile(customer_sk)",
      "CREATE INDEX idx_fact_profile_snapshot ON gold.fact_commercial_customer_profile(snapshot_date_sk)",
      "CREATE INDEX idx_fact_profile_rm ON gold.fact_commercial_customer_profile(rm_sk, snapshot_date_sk)",
    ],
  },
  
  // Fact 2: Financial Performance (Periodic Snapshot)
  {
    name: 'gold.fact_financial_performance',
    description: 'Financial statement metrics by period',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per customer per financial statement period',
    primaryKey: ['customer_sk', 'statement_date_sk'],
    
    schema: {
      customer_sk: "BIGINT NOT NULL",
      statement_date_sk: "INTEGER NOT NULL",
      
      // Income Statement Measures
      total_revenue: "DECIMAL(18,2)",
      cost_of_goods_sold: "DECIMAL(18,2)",
      gross_profit: "DECIMAL(18,2)",
      operating_expenses: "DECIMAL(18,2)",
      ebitda: "DECIMAL(18,2)",
      operating_income: "DECIMAL(18,2)",
      net_income: "DECIMAL(18,2)",
      
      // Balance Sheet Measures
      total_assets: "DECIMAL(18,2)",
      current_assets: "DECIMAL(18,2)",
      total_liabilities: "DECIMAL(18,2)",
      current_liabilities: "DECIMAL(18,2)",
      total_equity: "DECIMAL(18,2)",
      
      // Cash Flow Measures
      operating_cash_flow: "DECIMAL(18,2)",
      free_cash_flow: "DECIMAL(18,2)",
      
      // Financial Ratios
      current_ratio: "DECIMAL(10,4)",
      quick_ratio: "DECIMAL(10,4)",
      debt_to_equity: "DECIMAL(10,4)",
      debt_service_coverage: "DECIMAL(10,4)",
      gross_margin_pct: "DECIMAL(5,2)",
      operating_margin_pct: "DECIMAL(5,2)",
      net_margin_pct: "DECIMAL(5,2)",
      roa_pct: "DECIMAL(5,2)",
      roe_pct: "DECIMAL(5,2)",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Fact 3: Credit Worthiness (Periodic Snapshot)
  {
    name: 'gold.fact_credit_worthiness',
    description: 'Credit assessment and trade line metrics',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per customer per month',
    
    schema: {
      customer_sk: "BIGINT NOT NULL",
      snapshot_date_sk: "INTEGER NOT NULL",
      credit_rating_sk: "BIGINT",
      
      // Credit Scores
      paydex_score: "INTEGER",
      duns_failure_score: "INTEGER",
      internal_credit_score: "INTEGER",
      
      // Trade Line Metrics
      total_trade_lines: "INTEGER",
      satisfactory_trades: "INTEGER",
      slow_30_trades: "INTEGER",
      slow_60_trades: "INTEGER",
      slow_90_trades: "INTEGER",
      avg_days_beyond_terms: "DECIMAL(5,1)",
      
      // Exposure
      total_credit_exposure: "DECIMAL(18,2)",
      bank_credit_exposure: "DECIMAL(18,2)",
      
      // Public Records
      active_liens: "INTEGER",
      active_judgments: "INTEGER",
      ucc_filings: "INTEGER",
      
      // Risk Indicators
      probability_of_default_pct: "DECIMAL(5,4)",
      loss_given_default_pct: "DECIMAL(5,2)",
      expected_loss: "DECIMAL(18,2)",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Fact 4: Account Opening Funnel
  {
    name: 'gold.fact_account_opening_funnel',
    description: 'Account opening application funnel analysis with conversion rates',
    factType: 'TRANSACTION',
    grain: 'One row per application',
    primaryKey: ['application_sk', 'application_date_sk'],

    dimensions: [
      'dim_date (application_date_sk)',
      'dim_commercial_customer (customer_sk)',
      'dim_product_type (product_type_sk)',
      'dim_channel (channel_sk)',
      'dim_campaign (campaign_sk)',
    ],

    schema: {
      // Dimension Keys
      application_sk: "BIGINT PRIMARY KEY",
      application_date_sk: "INTEGER NOT NULL",
      customer_sk: "BIGINT",
      product_type_sk: "BIGINT",
      channel_sk: "BIGINT",
      campaign_sk: "BIGINT",

      // Degenerate Dimensions
      application_id: "BIGINT NOT NULL",
      application_status: "STRING",

      // Additive Measures (amounts)
      requested_amount: "DECIMAL(18,2)",
      approved_amount: "DECIMAL(18,2)",
      funded_amount: "DECIMAL(18,2)",

      // Additive Measures (counts)
      applications_submitted: "INTEGER DEFAULT 1",
      applications_approved: "INTEGER",
      applications_declined: "INTEGER",
      applications_withdrawn: "INTEGER",
      accounts_opened: "INTEGER",
      accounts_funded: "INTEGER",

      // Non-Additive Measures (durations in hours)
      time_to_decision_hours: "DECIMAL(10,2)",
      time_to_funding_hours: "DECIMAL(10,2)",
      total_cycle_time_hours: "DECIMAL(10,2)",

      // Non-Additive Measures (flags)
      sla_met_flag: "BOOLEAN",
      automated_approval_flag: "BOOLEAN",
      manual_review_flag: "BOOLEAN",
      fraud_detected_flag: "BOOLEAN",

      // Non-Additive Measures (scores)
      credit_score: "INTEGER",
      fraud_score: "INTEGER",

      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },

    indexes: [
      "CREATE INDEX idx_fact_funnel_customer ON gold.fact_account_opening_funnel(customer_sk)",
      "CREATE INDEX idx_fact_funnel_date ON gold.fact_account_opening_funnel(application_date_sk)",
      "CREATE INDEX idx_fact_funnel_product ON gold.fact_account_opening_funnel(product_type_sk)",
    ],
  },

  // Fact 5: Ownership Relationships
  {
    name: 'gold.fact_ownership_relationships',
    description: 'Entity ownership relationships with effective ownership calculations',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per ownership relationship per month',

    schema: {
      // Dimension Keys
      child_entity_sk: "BIGINT NOT NULL",
      parent_entity_sk: "BIGINT NOT NULL",
      snapshot_date_sk: "INTEGER NOT NULL",

      // Degenerate Dimensions
      ownership_id: "BIGINT",
      hierarchy_level: "INTEGER",

      // Additive Measures
      direct_ownership_pct: "DECIMAL(5,2)",
      indirect_ownership_pct: "DECIMAL(5,2)",
      effective_ownership_pct: "DECIMAL(5,2)",
      voting_rights_pct: "DECIMAL(5,2)",

      // Non-Additive Measures
      is_beneficial_owner: "BOOLEAN",
      is_consolidation_required: "BOOLEAN",
      is_vie: "BOOLEAN",
      ownership_verified_flag: "BOOLEAN",

      created_timestamp: "TIMESTAMP",
    },
  },

  // Fact 6: Data Quality Events
  {
    name: 'gold.fact_data_quality_events',
    description: 'Data quality issue tracking and resolution',
    factType: 'TRANSACTION',
    grain: 'One row per data quality issue',

    schema: {
      // Dimension Keys
      issue_date_sk: "INTEGER NOT NULL",
      resolution_date_sk: "INTEGER",
      table_sk: "BIGINT NOT NULL",
      dq_rule_sk: "BIGINT NOT NULL",

      // Degenerate Dimensions
      issue_id: "BIGINT PRIMARY KEY",
      issue_severity: "STRING",

      // Additive Measures
      records_affected: "BIGINT",
      issues_detected: "INTEGER DEFAULT 1",
      issues_resolved: "INTEGER",

      // Non-Additive Measures
      resolution_time_hours: "DECIMAL(10,2)",
      sla_met_flag: "BOOLEAN",
      auto_remediated_flag: "BOOLEAN",

      created_timestamp: "TIMESTAMP",
    },
  },
];

// Add new dimensions for the new capabilities
customerCommercialGoldDimensions.push(
  {
    name: 'gold.dim_application_status',
    description: 'Account opening application status codes',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per status code',
    primaryKey: ['status_sk'],
    businessKey: ['status_code'],

    schema: {
      status_sk: "BIGINT PRIMARY KEY",
      status_code: "STRING NOT NULL UNIQUE",
      status_name: "STRING",
      status_category: "STRING COMMENT 'IN_PROGRESS|APPROVED|DECLINED|CLOSED'",
      is_terminal_status: "BOOLEAN COMMENT 'No further transitions possible'",
      is_successful_outcome: "BOOLEAN",
      display_order: "INTEGER",
      created_timestamp: "TIMESTAMP",
    },
  },
  {
    name: 'gold.dim_ownership_type',
    description: 'Types of entity ownership relationships',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per ownership type',
    primaryKey: ['ownership_type_sk'],
    businessKey: ['ownership_type_code'],

    schema: {
      ownership_type_sk: "BIGINT PRIMARY KEY",
      ownership_type_code: "STRING NOT NULL UNIQUE",
      ownership_type_name: "STRING",
      ownership_type_description: "STRING",
      requires_consolidation_flag: "BOOLEAN",
      beneficial_owner_threshold_pct: "DECIMAL(5,2)",
      control_level: "STRING COMMENT 'FULL|SIGNIFICANT|MINORITY|NONE'",
      created_timestamp: "TIMESTAMP",
    },
  },
  {
    name: 'gold.dim_data_quality_rule',
    description: 'Data quality validation rules',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per DQ rule',
    primaryKey: ['dq_rule_sk'],
    businessKey: ['rule_code'],

    schema: {
      dq_rule_sk: "BIGINT PRIMARY KEY",
      rule_code: "STRING NOT NULL UNIQUE",
      rule_name: "STRING",
      rule_type: "STRING COMMENT 'ACCURACY|COMPLETENESS|VALIDITY|UNIQUENESS|TIMELINESS|CONSISTENCY'",
      rule_definition: "STRING",
      severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      threshold_pct: "DECIMAL(5,2)",
      bcbs239_critical_flag: "BOOLEAN",
      created_timestamp: "TIMESTAMP",
    },
  }
);

export const customerCommercialGoldLayer = {
  dimensions: customerCommercialGoldDimensions,
  facts: customerCommercialGoldFacts,
};

export default customerCommercialGoldLayer;
