/**
 * CUSTOMER-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model (Kimball methodology) with:
 * - 12 Dimensions (including conformed dimensions)
 * - 8 Fact Tables
 * 
 * Grade A Target: Analytics-ready star schema
 */

export const customerRetailGoldDimensions = [
  // Dimension 1: Customer (Main dimension)
  {
    name: 'gold.dim_retail_customer',
    description: 'Retail customer dimension with demographic and behavioral attributes',
    type: 'SCD Type 1', // Slowly changing, but overwrite for performance
    grain: 'One row per unique customer',
    conformedDimension: false, // Area-specific view
    
    primaryKey: 'customer_key',
    naturalKey: 'customer_id',
    
    sourceTables: ['silver.retail_customer_master_golden'],
    
    schema: {
      // SURROGATE KEY
      customer_key: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Dimension surrogate key'",
      
      // NATURAL KEYS
      customer_id: "BIGINT UNIQUE COMMENT 'Business customer ID'",
      customer_uuid: "STRING UNIQUE COMMENT 'Global UUID'",
      
      // DEMOGRAPHICS
      full_name: "STRING COMMENT 'Full legal name'",
      first_name: "STRING",
      last_name: "STRING",
      preferred_name: "STRING",
      
      date_of_birth: "DATE",
      age: "INTEGER",
      age_group: "STRING COMMENT '<18|18-24|25-34|35-44|45-54|55-64|65+'",
      generation: "STRING COMMENT 'Silent|Boomer|Gen X|Millennial|Gen Z|Gen Alpha'",
      
      gender: "STRING COMMENT 'M|F|X|U'",
      gender_description: "STRING COMMENT 'Male|Female|Non-binary|Unknown'",
      
      marital_status: "STRING COMMENT 'S|M|D|W|P'",
      marital_status_description: "STRING COMMENT 'Single|Married|Divorced|Widowed|Partner'",
      
      citizenship_status: "STRING",
      nationality: "STRING",
      
      // CONTACT
      email_primary: "STRING",
      phone_mobile: "STRING",
      
      city: "STRING",
      state: "STRING",
      postal_code: "STRING",
      county: "STRING",
      
      // FINANCIAL PROFILE
      fico_score: "INTEGER",
      credit_score_tier: "STRING COMMENT 'Excellent|Very Good|Good|Fair|Poor'",
      
      annual_income: "DECIMAL(18,2)",
      income_bracket: "STRING COMMENT '<25K|25K-50K|50K-75K|75K-100K|100K-150K|150K+'",
      
      employment_status: "STRING",
      occupation: "STRING",
      industry: "STRING",
      
      education_level: "STRING",
      
      // CUSTOMER LIFECYCLE
      customer_since_date: "DATE",
      customer_tenure_years: "DECIMAL(5,2)",
      customer_tenure_band: "STRING COMMENT '<1yr|1-3yr|3-5yr|5-10yr|10-20yr|20+yr'",
      
      customer_status: "STRING COMMENT 'Active|Inactive|Dormant|Closed'",
      customer_type: "STRING",
      
      // SEGMENTATION (Hierarchy Level 1-4)
      customer_segment_l1: "STRING COMMENT 'Mass Market|Affluent'",
      customer_segment_l2: "STRING COMMENT 'Mass|Mass Affluent|Affluent|Private'",
      customer_segment_l3: "STRING COMMENT 'Detailed segments'",
      customer_segment_l4: "STRING COMMENT 'Micro-segments'",
      
      customer_tier: "STRING COMMENT 'Bronze|Silver|Gold|Platinum|Diamond'",
      
      lifecycle_stage: "STRING COMMENT 'Prospect|New|Growing|Mature|Declining|Attrition'",
      lifecycle_stage_description: "STRING",
      
      value_segment: "STRING COMMENT 'High Value|Medium Value|Low Value'",
      behavioral_segment: "STRING",
      channel_preference: "STRING COMMENT 'Digital First|Branch Preferred|Hybrid|Phone'",
      
      // VALUE INDICATORS
      customer_value_score: "INTEGER COMMENT '0-100'",
      customer_value_tier: "STRING COMMENT 'Top 10%|Top 25%|Top 50%|Bottom 50%'",
      
      lifetime_value_estimate: "DECIMAL(18,2)",
      ltv_tier: "STRING COMMENT 'Very High|High|Medium|Low'",
      
      // PRODUCT HOLDINGS
      total_products: "INTEGER",
      product_mix: "STRING COMMENT 'Deposits Only|Loans Only|Cards Only|Mixed'",
      
      has_checking: "BOOLEAN",
      has_savings: "BOOLEAN",
      has_credit_card: "BOOLEAN",
      has_personal_loan: "BOOLEAN",
      has_mortgage: "BOOLEAN",
      has_investment: "BOOLEAN",
      
      // HOUSEHOLD
      household_id: "BIGINT",
      household_role: "STRING COMMENT 'Head|Spouse|Dependent|Other'",
      household_size: "INTEGER",
      
      // RELATIONSHIP
      primary_branch_id: "BIGINT",
      primary_branch_name: "STRING",
      assigned_banker_id: "BIGINT",
      assigned_banker_name: "STRING",
      
      // RISK & COMPLIANCE
      kyc_status: "STRING",
      aml_risk_rating: "STRING COMMENT 'Low|Medium|High'",
      overall_risk_rating: "STRING",
      
      pep_flag: "BOOLEAN",
      sanctions_flag: "BOOLEAN",
      fraud_flag: "BOOLEAN",
      
      // PREFERENCES
      paperless: "BOOLEAN",
      marketing_opt_in: "BOOLEAN",
      email_opt_in: "BOOLEAN",
      sms_opt_in: "BOOLEAN",
      
      preferred_language: "STRING",
      preferred_contact_method: "STRING",
      
      // DIGITAL BANKING
      online_banking_user: "BOOLEAN",
      mobile_banking_user: "BOOLEAN",
      digital_adoption_level: "STRING COMMENT 'High|Medium|Low|None'",
      digital_engagement_score: "INTEGER",
      
      biometric_auth: "BOOLEAN",
      two_factor_auth: "BOOLEAN",
      
      // BEHAVIORAL SCORES
      churn_risk_score: "DECIMAL(5,2) COMMENT '0-100'",
      churn_risk_tier: "STRING COMMENT 'High Risk|Medium Risk|Low Risk'",
      
      cross_sell_score: "DECIMAL(5,2)",
      cross_sell_tier: "STRING",
      
      engagement_score: "INTEGER",
      engagement_level: "STRING COMMENT 'Highly Engaged|Moderately Engaged|Low Engagement|Disengaged'",
      
      satisfaction_score: "INTEGER COMMENT 'CSAT 1-5'",
      net_promoter_score: "INTEGER COMMENT 'NPS -100 to 100'",
      nps_category: "STRING COMMENT 'Promoter|Passive|Detractor'",
      
      // LIFESTYLE (Third Party)
      lifestyle_segment: "STRING",
      estimated_net_worth: "DECIMAL(18,2)",
      home_ownership: "STRING COMMENT 'Own|Rent|Other'",
      vehicle_owner: "BOOLEAN",
      small_business_owner: "BOOLEAN",
      
      technology_adopter: "BOOLEAN",
      technology_adoption_level: "STRING COMMENT 'Early Adopter|Mainstream|Late Adopter|Laggard'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      data_quality_tier: "STRING COMMENT 'Excellent|Good|Fair|Poor'",
      
      // AUDIT
      created_date: "DATE",
      updated_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
    },
    
    hierarchies: [
      {
        name: 'Customer Segment Hierarchy',
        levels: [
          { level: 1, attribute: 'customer_segment_l1', description: 'Top-level segment' },
          { level: 2, attribute: 'customer_segment_l2', description: 'Primary segment' },
          { level: 3, attribute: 'customer_segment_l3', description: 'Sub-segment' },
          { level: 4, attribute: 'customer_segment_l4', description: 'Micro-segment' },
        ],
      },
      {
        name: 'Age Hierarchy',
        levels: [
          { level: 1, attribute: 'generation', description: 'Generational cohort' },
          { level: 2, attribute: 'age_group', description: 'Age bracket' },
          { level: 3, attribute: 'age', description: 'Exact age' },
        ],
      },
      {
        name: 'Geographic Hierarchy',
        levels: [
          { level: 1, attribute: 'state', description: 'State' },
          { level: 2, attribute: 'county', description: 'County' },
          { level: 3, attribute: 'city', description: 'City' },
          { level: 4, attribute: 'postal_code', description: 'ZIP code' },
        ],
      },
    ],
  },
  
  // Dimension 2: Customer Segment
  {
    name: 'gold.dim_customer_segment',
    description: 'Customer segmentation taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per unique segment',
    
    primaryKey: 'segment_key',
    naturalKey: 'segment_code',
    
    schema: {
      segment_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      segment_code: "STRING UNIQUE",
      segment_name: "STRING",
      segment_description: "STRING",
      
      segment_type: "STRING COMMENT 'Value|Lifecycle|Product|Channel|Behavioral'",
      segment_category: "STRING",
      
      segment_hierarchy_l1: "STRING",
      segment_hierarchy_l2: "STRING",
      segment_hierarchy_l3: "STRING",
      
      target_product_mix: "STRING",
      expected_ltv_range_min: "DECIMAL(18,2)",
      expected_ltv_range_max: "DECIMAL(18,2)",
      
      is_active_segment: "BOOLEAN",
      
      created_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
    },
  },
  
  // Dimension 3: Household
  {
    name: 'gold.dim_household',
    description: 'Household aggregation dimension',
    type: 'SCD Type 1',
    grain: 'One row per household',
    conformedDimension: true, // Shared across retail, commercial, wealth
    
    primaryKey: 'household_key',
    naturalKey: 'household_id',
    
    schema: {
      household_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      household_id: "BIGINT UNIQUE",
      household_name: "STRING",
      
      household_type: "STRING COMMENT 'Single|Couple|Family|Multi-generational'",
      
      primary_customer_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
      primary_customer_name: "STRING",
      
      total_members: "INTEGER",
      adult_members: "INTEGER",
      minor_members: "INTEGER",
      senior_members: "INTEGER",
      
      household_city: "STRING",
      household_state: "STRING",
      household_postal_code: "STRING",
      
      household_formation_date: "DATE",
      household_tenure_years: "DECIMAL(5,2)",
      
      estimated_household_income: "DECIMAL(18,2)",
      household_income_bracket: "STRING",
      
      estimated_household_net_worth: "DECIMAL(18,2)",
      household_wealth_tier: "STRING",
      
      household_segment: "STRING COMMENT 'Mass|Mass Affluent|Affluent|High Net Worth'",
      
      household_status: "STRING COMMENT 'Active|Inactive|Dissolved'",
      
      created_date: "DATE",
      row_created_timestamp: "TIMESTAMP",
    },
  },

  // Dimension 4: Geography (Conformed)
  {
    name: 'gold.dim_geography',
    description: 'Geographic hierarchy dimension',
    type: 'SCD Type 1',
    grain: 'One row per geographic location',
    conformedDimension: true,
    primaryKey: 'geography_key',
    naturalKey: ['postal_code', 'state_code'],
    schema: {
      geography_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      postal_code: "STRING",
      city: "STRING",
      county: "STRING",
      state_code: "STRING",
      state_name: "STRING",
      country_code: "STRING DEFAULT 'US'",
      region: "STRING COMMENT 'Northeast|Southeast|Midwest|Southwest|West'",
      latitude: "DECIMAL(10,8)",
      longitude: "DECIMAL(11,8)",
    },
  },

  // Dimension 5: Branch
  {
    name: 'gold.dim_branch',
    description: 'Branch location dimension',
    type: 'SCD Type 2',
    grain: 'One row per branch per effective date',
    conformedDimension: true,
    primaryKey: 'branch_key',
    naturalKey: 'branch_id',
    schema: {
      branch_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      branch_id: "BIGINT",
      branch_number: "STRING",
      branch_name: "STRING",
      branch_type: "STRING",
      geography_key: "BIGINT",
      region: "STRING",
      is_active: "BOOLEAN",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
    },
  },

  // Dimension 6: Employee
  {
    name: 'gold.dim_employee',
    description: 'Employee dimension',
    type: 'SCD Type 2',
    grain: 'One row per employee per effective date',
    conformedDimension: true,
    primaryKey: 'employee_key',
    naturalKey: 'employee_id',
    schema: {
      employee_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      employee_id: "BIGINT",
      employee_name: "STRING",
      employee_title: "STRING",
      employee_role: "STRING",
      branch_key: "BIGINT",
      hire_date: "DATE",
      is_active: "BOOLEAN",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
    },
  },

  // Dimension 7: Product
  {
    name: 'gold.dim_product',
    description: 'Product catalog dimension',
    type: 'SCD Type 2',
    grain: 'One row per product per effective date',
    conformedDimension: true,
    primaryKey: 'product_key',
    naturalKey: 'product_id',
    schema: {
      product_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      product_id: "STRING",
      product_name: "STRING",
      product_type: "STRING COMMENT 'Deposit|Loan|Card|Investment|Insurance'",
      product_category: "STRING",
      is_active: "BOOLEAN",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
    },
  },

  // Dimension 8: Channel
  {
    name: 'gold.dim_channel',
    description: 'Banking channels dimension',
    type: 'SCD Type 1',
    grain: 'One row per channel',
    primaryKey: 'channel_key',
    naturalKey: 'channel_code',
    schema: {
      channel_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      channel_code: "STRING UNIQUE",
      channel_name: "STRING",
      channel_type: "STRING COMMENT 'Physical|Digital|Phone|ATM'",
      is_digital: "BOOLEAN",
      is_self_service: "BOOLEAN",
      is_active: "BOOLEAN",
    },
  },

  // Dimension 9: Lifecycle Stage
  {
    name: 'gold.dim_lifecycle_stage',
    description: 'Customer lifecycle stage dimension',
    type: 'Static',
    grain: 'One row per lifecycle stage',
    primaryKey: 'lifecycle_stage_key',
    naturalKey: 'lifecycle_stage_code',
    schema: {
      lifecycle_stage_key: "INTEGER PRIMARY KEY AUTO_INCREMENT",
      lifecycle_stage_code: "STRING UNIQUE",
      lifecycle_stage_name: "STRING",
      lifecycle_stage_description: "STRING",
      stage_order: "INTEGER",
      expected_duration_months: "INTEGER",
    },
  },

  // Dimension 10: Risk Rating
  {
    name: 'gold.dim_risk_rating',
    description: 'Risk rating classification',
    type: 'Static',
    grain: 'One row per risk rating',
    primaryKey: 'risk_rating_key',
    naturalKey: 'risk_rating_code',
    schema: {
      risk_rating_key: "INTEGER PRIMARY KEY AUTO_INCREMENT",
      risk_rating_code: "STRING UNIQUE",
      risk_rating_name: "STRING",
      risk_category: "STRING COMMENT 'Low|Medium|High|Prohibited'",
      min_score: "INTEGER",
      max_score: "INTEGER",
      requires_enhanced_monitoring: "BOOLEAN",
    },
  },

  // Dimension 11: Credit Tier
  {
    name: 'gold.dim_credit_tier',
    description: 'Credit score tier classification',
    type: 'Static',
    grain: 'One row per credit tier',
    primaryKey: 'credit_tier_key',
    naturalKey: 'credit_tier_code',
    schema: {
      credit_tier_key: "INTEGER PRIMARY KEY AUTO_INCREMENT",
      credit_tier_code: "STRING UNIQUE",
      credit_tier_name: "STRING",
      tier_description: "STRING",
      min_fico_score: "INTEGER",
      max_fico_score: "INTEGER",
      tier_order: "INTEGER",
    },
  },

  // Dimension 12: Date (Conformed)
  {
    name: 'gold.dim_date',
    description: 'Date dimension with calendar attributes',
    type: 'Static',
    grain: 'One row per day',
    conformedDimension: true,
    primaryKey: 'date_key',
    naturalKey: 'calendar_date',
    schema: {
      date_key: "INTEGER PRIMARY KEY COMMENT 'YYYYMMDD format'",
      calendar_date: "DATE UNIQUE",
      year: "INTEGER",
      quarter: "INTEGER",
      month: "INTEGER",
      month_name: "STRING",
      day_of_month: "INTEGER",
      day_of_week: "INTEGER",
      day_of_week_name: "STRING",
      is_weekend: "BOOLEAN",
      is_holiday: "BOOLEAN",
      is_business_day: "BOOLEAN",
      fiscal_year: "INTEGER",
      fiscal_quarter: "INTEGER",
    },
  },
];

export const customerRetailGoldFacts = [
  // Fact 1: Customer Events
  {
    name: 'gold.fact_customer_events',
    description: 'Customer lifecycle events fact table',
    factType: 'Transaction',
    grain: 'One row per customer event occurrence',
    
    primaryKey: 'customer_event_key',
    
    dimensionForeignKeys: [
      'customer_key',
      'event_date_key',
      'event_type_key',
      'branch_key',
      'channel_key',
      'employee_key',
    ],
    
    schema: {
      // FACT PRIMARY KEY
      customer_event_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION FOREIGN KEYS
      customer_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
      event_date_key: "INTEGER COMMENT 'FK to dim_date (YYYYMMDD)'",
      event_type_key: "BIGINT COMMENT 'FK to dim_event_type'",
      branch_key: "BIGINT COMMENT 'FK to dim_branch'",
      channel_key: "BIGINT COMMENT 'FK to dim_channel'",
      employee_key: "BIGINT COMMENT 'FK to dim_employee'",
      
      // DEGENERATE DIMENSIONS
      event_id: "BIGINT COMMENT 'Event transaction ID'",
      event_timestamp: "TIMESTAMP COMMENT 'Exact event time'",
      
      // ADDITIVE MEASURES
      event_count: "INTEGER DEFAULT 1 COMMENT 'Event occurrence count'",
      event_value: "DECIMAL(18,2) COMMENT 'Monetary value if applicable'",
      event_impact_score: "INTEGER COMMENT 'Impact score 1-10'",
      
      // NON-ADDITIVE MEASURES
      customer_tenure_at_event_days: "INTEGER COMMENT 'Customer tenure when event occurred'",
      
      // TEXT ATTRIBUTES
      event_description: "STRING",
      event_notes: "STRING",
      
      resolution_status: "STRING COMMENT 'Open|Resolved|Closed'",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
    
    measures: [
      {
        name: 'event_count',
        dataType: 'INTEGER',
        aggregationType: 'SUM',
        description: 'Total count of events',
        businessDefinition: 'Number of customer lifecycle events',
      },
      {
        name: 'event_value',
        dataType: 'DECIMAL(18,2)',
        aggregationType: 'SUM',
        description: 'Total event value',
        businessDefinition: 'Sum of monetary value associated with events',
      },
      {
        name: 'average_impact_score',
        dataType: 'DECIMAL(10,2)',
        aggregationType: 'AVG',
        description: 'Average event impact',
        businessDefinition: 'Mean impact score across events',
      },
    ],
  },
  
  // Fact 2: Customer Daily Snapshot
  {
    name: 'gold.fact_customer_daily_snapshot',
    description: 'Daily snapshot of customer metrics and balances',
    factType: 'Periodic Snapshot',
    grain: 'One row per customer per day',
    
    primaryKey: 'customer_snapshot_key',
    
    schema: {
      customer_snapshot_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION FKs
      customer_key: "BIGINT",
      snapshot_date_key: "INTEGER COMMENT 'FK to dim_date'",
      segment_key: "BIGINT COMMENT 'FK to dim_customer_segment'",
      household_key: "BIGINT",
      
      // SEMI-ADDITIVE MEASURES (Balances - additive across customers, not time)
      total_deposit_balance: "DECIMAL(18,2) COMMENT 'Total deposit balance'",
      total_loan_balance: "DECIMAL(18,2)",
      total_investment_balance: "DECIMAL(18,2)",
      total_credit_limit: "DECIMAL(18,2)",
      available_credit: "DECIMAL(18,2)",
      
      checking_balance: "DECIMAL(18,2)",
      savings_balance: "DECIMAL(18,2)",
      money_market_balance: "DECIMAL(18,2)",
      cd_balance: "DECIMAL(18,2)",
      
      // ADDITIVE MEASURES (Counts)
      total_deposit_accounts: "INTEGER",
      total_loan_accounts: "INTEGER",
      total_card_accounts: "INTEGER",
      total_investment_accounts: "INTEGER",
      total_products: "INTEGER",
      
      // FLOW MEASURES (Daily activity)
      deposits_today: "DECIMAL(18,2) COMMENT 'Deposit transactions today'",
      withdrawals_today: "DECIMAL(18,2)",
      transfers_today: "DECIMAL(18,2)",
      payments_today: "DECIMAL(18,2)",
      
      transaction_count_today: "INTEGER",
      
      // NON-ADDITIVE MEASURES (Scores and Ratios)
      customer_value_score: "INTEGER",
      churn_risk_score: "DECIMAL(5,2)",
      engagement_score: "INTEGER",
      satisfaction_score: "INTEGER",
      
      credit_utilization_ratio: "DECIMAL(5,2) COMMENT 'Percentage'",
      
      // STATUS FLAGS
      is_active_customer: "BOOLEAN",
      is_digital_active: "BOOLEAN COMMENT 'Logged in within 30 days'",
      is_branch_active: "BOOLEAN COMMENT 'Branch visit within 90 days'",
      
      days_since_last_login: "INTEGER",
      days_since_last_transaction: "INTEGER",
      days_since_last_branch_visit: "INTEGER",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
  
  // Fact 3: Customer Profitability
  {
    name: 'gold.fact_customer_profitability',
    description: 'Customer profitability metrics by period',
    factType: 'Periodic Snapshot',
    grain: 'One row per customer per period (month)',
    
    schema: {
      customer_profitability_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      customer_key: "BIGINT",
      period_month_key: "INTEGER COMMENT 'FK to dim_date (first day of month)'",
      segment_key: "BIGINT",
      
      // REVENUE MEASURES
      fee_revenue: "DECIMAL(18,2) COMMENT 'Account fees, service fees'",
      interest_income: "DECIMAL(18,2) COMMENT 'Interest earned from loans'",
      interchange_revenue: "DECIMAL(18,2) COMMENT 'Card interchange fees'",
      investment_revenue: "DECIMAL(18,2)",
      other_revenue: "DECIMAL(18,2)",
      total_revenue: "DECIMAL(18,2) COMMENT 'Sum of all revenue'",
      
      // COST MEASURES
      interest_expense: "DECIMAL(18,2) COMMENT 'Interest paid on deposits'",
      servicing_cost: "DECIMAL(18,2)",
      acquisition_cost: "DECIMAL(18,2)",
      retention_cost: "DECIMAL(18,2)",
      fraud_losses: "DECIMAL(18,2)",
      credit_losses: "DECIMAL(18,2)",
      operational_cost: "DECIMAL(18,2)",
      total_cost: "DECIMAL(18,2)",
      
      // PROFITABILITY
      net_profit: "DECIMAL(18,2) COMMENT 'Total revenue - total cost'",
      profit_margin: "DECIMAL(5,2) COMMENT 'Percentage'",
      
      // CUMULATIVE LIFETIME METRICS
      lifetime_revenue: "DECIMAL(18,2) COMMENT 'Cumulative revenue to date'",
      lifetime_cost: "DECIMAL(18,2)",
      lifetime_profit: "DECIMAL(18,2)",
      lifetime_value_actual: "DECIMAL(18,2) COMMENT 'Actual CLV to date'",
      
      // PRODUCT-LEVEL CONTRIBUTION
      deposits_revenue: "DECIMAL(18,2)",
      loans_revenue: "DECIMAL(18,2)",
      cards_revenue: "DECIMAL(18,2)",
      investments_revenue: "DECIMAL(18,2)",
      
      // BALANCES (for profitability calculations)
      average_deposit_balance_month: "DECIMAL(18,2)",
      average_loan_balance_month: "DECIMAL(18,2)",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
  
  // Fact 4: Customer Interactions
  {
    name: 'gold.fact_customer_interactions',
    description: 'Customer service and sales interactions',
    factType: 'Transaction',
    grain: 'One row per interaction',
    
    schema: {
      interaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      customer_key: "BIGINT",
      interaction_date_key: "INTEGER",
      channel_key: "BIGINT",
      employee_key: "BIGINT",
      branch_key: "BIGINT",
      interaction_type_key: "BIGINT",
      
      interaction_id: "BIGINT COMMENT 'Degenerate dimension'",
      interaction_timestamp: "TIMESTAMP",
      
      // MEASURES
      interaction_count: "INTEGER DEFAULT 1",
      interaction_duration_seconds: "INTEGER",
      interaction_duration_minutes: "DECIMAL(10,2)",
      
      satisfaction_rating: "INTEGER COMMENT '1-5 scale'",
      
      is_first_contact_resolution: "BOOLEAN",
      is_escalation: "BOOLEAN",
      
      issue_resolved: "BOOLEAN",
      resolution_time_hours: "DECIMAL(10,2)",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 5: Customer Acquisition
  {
    name: 'gold.fact_customer_acquisition',
    description: 'New customer acquisition and onboarding metrics',
    factType: 'Transaction',
    grain: 'One row per new customer acquisition',
    schema: {
      acquisition_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_key: "BIGINT",
      acquisition_date_key: "INTEGER",
      channel_key: "BIGINT",
      branch_key: "BIGINT",
      employee_key: "BIGINT",
      campaign_key: "BIGINT",
      source_key: "BIGINT",

      // MEASURES
      acquisition_count: "INTEGER DEFAULT 1",
      customer_acquisition_cost: "DECIMAL(10,2)",
      onboarding_duration_days: "INTEGER",
      initial_deposit_amount: "DECIMAL(18,2)",
      initial_product_count: "INTEGER",

      is_digital_acquisition: "BOOLEAN",
      is_referral: "BOOLEAN",
      referrer_customer_key: "BIGINT",

      credit_score_at_acquisition: "INTEGER",
      estimated_ltv: "DECIMAL(18,2)",

      created_timestamp: "TIMESTAMP",
    },
  },

  // Fact 6: Customer Churn
  {
    name: 'gold.fact_customer_churn',
    description: 'Customer attrition events and analysis',
    factType: 'Transaction',
    grain: 'One row per customer churn event',
    schema: {
      churn_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_key: "BIGINT",
      churn_date_key: "INTEGER",
      last_interaction_date_key: "INTEGER",
      channel_key: "BIGINT",

      // MEASURES
      churn_count: "INTEGER DEFAULT 1",
      customer_tenure_months: "INTEGER",
      total_relationship_value: "DECIMAL(18,2)",
      lifetime_revenue: "DECIMAL(18,2)",

      churn_reason_code: "STRING",
      churn_reason_category: "STRING COMMENT 'Service|Fees|Rates|Competition|Life Event'",

      products_held_at_churn: "INTEGER",
      balance_at_churn: "DECIMAL(18,2)",

      is_voluntary_churn: "BOOLEAN",
      is_preventable_churn: "BOOLEAN",

      win_back_attempt_count: "INTEGER",
      win_back_successful: "BOOLEAN",

      created_timestamp: "TIMESTAMP",
    },
  },

  // Fact 7: Customer Cross-Sell
  {
    name: 'gold.fact_customer_cross_sell',
    description: 'Product adoption and cross-sell events',
    factType: 'Transaction',
    grain: 'One row per product addition',
    schema: {
      cross_sell_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_key: "BIGINT",
      product_key: "BIGINT",
      adoption_date_key: "INTEGER",
      channel_key: "BIGINT",
      employee_key: "BIGINT",
      campaign_key: "BIGINT",

      // MEASURES
      cross_sell_count: "INTEGER DEFAULT 1",
      customer_tenure_at_adoption_months: "INTEGER",
      existing_product_count: "INTEGER",
      new_product_count: "INTEGER",

      initial_balance: "DECIMAL(18,2)",
      initial_limit: "DECIMAL(18,2)",

      is_campaign_driven: "BOOLEAN",
      is_employee_referred: "BOOLEAN",
      is_digital_adoption: "BOOLEAN",

      expected_annual_revenue: "DECIMAL(18,2)",

      adoption_channel: "STRING",
      adoption_source: "STRING",

      created_timestamp: "TIMESTAMP",
    },
  },

  // Fact 8: Customer Satisfaction
  {
    name: 'gold.fact_customer_satisfaction',
    description: 'NPS, CSAT, and customer feedback surveys',
    factType: 'Periodic Snapshot',
    grain: 'One row per customer survey response',
    schema: {
      satisfaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_key: "BIGINT",
      survey_date_key: "INTEGER",
      survey_type_key: "BIGINT",
      channel_key: "BIGINT",

      survey_id: "STRING COMMENT 'Degenerate dimension'",

      // MEASURES
      response_count: "INTEGER DEFAULT 1",

      nps_score: "INTEGER COMMENT '-100 to 100'",
      nps_category: "STRING COMMENT 'Detractor|Passive|Promoter'",

      csat_score: "INTEGER COMMENT '1-5 or 1-10 scale'",
      csat_percentage: "DECIMAL(5,2)",

      ces_score: "INTEGER COMMENT 'Customer Effort Score 1-7'",

      overall_satisfaction_score: "INTEGER",
      product_satisfaction_score: "INTEGER",
      service_satisfaction_score: "INTEGER",
      digital_experience_score: "INTEGER",

      likelihood_to_recommend: "INTEGER COMMENT '0-10 scale'",
      likelihood_to_churn: "INTEGER COMMENT '0-10 scale'",

      verbatim_feedback: "STRING",
      sentiment_score: "DECIMAL(5,2) COMMENT 'NLP sentiment -1 to 1'",

      is_complete_survey: "BOOLEAN",
      response_time_seconds: "INTEGER",

      created_timestamp: "TIMESTAMP",
    },
  },
];

export const customerRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail customer domain - Kimball star schema',
  layer: 'GOLD',
  modelingApproach: 'Kimball Dimensional Modeling (Star Schema)',
  refreshFrequency: 'Daily (snapshots) / Real-time (transactions)',
  
  dimensions: customerRetailGoldDimensions,
  facts: customerRetailGoldFacts,
  
  totalDimensions: 12,
  totalFacts: 8,
  estimatedSize: '100GB',
};
