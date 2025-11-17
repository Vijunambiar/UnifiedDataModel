/**
 * CUSTOMER-COMMERCIAL SILVER LAYER
 * Cleansed, conformed, and enriched business entity data
 * 
 * Domain: Customer-Commercial
 * Area: Commercial Banking
 * Layer: SILVER (Cleansed/Conformed)
 * Tables: 15
 */

export const customerCommercialSilverTables = [
  // Table 1: Business Entity Golden Record
  {
    name: 'silver.commercial_business_golden_record',
    description: 'Master Data Management (MDM) golden record for business entities with best-of-breed data from all sources',
    grain: 'One row per unique business entity (current state)',
    scdType: 'SCD_TYPE_2',
    primaryKey: ['entity_key'],
    
    transformations: [
      'Deduplicate entities across source systems using fuzzy matching',
      'Resolve conflicts using data quality scores and source hierarchy',
      'Standardize legal names and addresses using USPS/GLEIF standards',
      'Enrich with D&B firmographics and industry classifications',
      'Calculate entity hierarchy levels and relationships',
      'Apply business rules for customer segmentation',
    ],
    
    dataQualityRules: [
      'Legal name must not be null',
      'EIN must be valid 9-digit format if USA entity',
      'NAICS code must be valid 6-digit industry code',
      'Headquarters address must be validated',
      'Annual revenue must be positive if provided',
    ],
    
    schema: {
      // Surrogate Key
      entity_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key for dimensional modeling'",
      
      // Business Keys
      entity_id: "BIGINT NOT NULL UNIQUE COMMENT 'Natural key from source'",
      global_entity_id: "STRING UNIQUE COMMENT 'Global identifier (LEI if available)'",
      entity_hash: "STRING COMMENT 'MD5 hash of identifying attributes for matching'",
      
      // Legal Entity Information (Best of Breed)
      legal_name: "STRING NOT NULL COMMENT 'Official legal name (standardized)'",
      legal_name_soundex: "STRING COMMENT 'Soundex for fuzzy matching'",
      dba_name: "STRING COMMENT 'Doing Business As name'",
      entity_type: "STRING COMMENT 'Standardized: LLC|C_CORP|S_CORP|PARTNERSHIP|SOLE_PROP|NONPROFIT|GOVERNMENT'",
      entity_subtype: "STRING",
      incorporation_state: "STRING COMMENT '2-letter state code'",
      incorporation_country: "STRING DEFAULT 'USA' COMMENT 'ISO 3166-1 alpha-3'",
      incorporation_date: "DATE",
      fiscal_year_end_month: "INTEGER COMMENT '1-12'",
      
      // Identifiers (Validated & Standardized)
      ein_tax_id: "STRING COMMENT 'Encrypted EIN (9 digits)'",
      ein_verified_flag: "BOOLEAN",
      ein_verification_date: "DATE",
      duns_number: "STRING COMMENT '9-digit DUNS'",
      lei_code: "STRING COMMENT 'ISO 17442 LEI (20 characters)'",
      lei_status: "STRING COMMENT 'ISSUED|LAPSED|RETIRED'",
      naics_code: "STRING COMMENT '6-digit NAICS (validated)'",
      naics_description: "STRING",
      sic_code: "STRING COMMENT '4-digit SIC (legacy)'",
      
      // Industry Classification (Enriched)
      industry_sector: "STRING COMMENT 'Level 1: Sector'",
      industry_subsector: "STRING COMMENT 'Level 2: Subsector'",
      industry_group: "STRING COMMENT 'Level 3: Industry Group'",
      industry_category: "STRING COMMENT 'Level 4: Industry'",
      industry_vertical: "STRING COMMENT 'Bank-specific classification'",
      
      // Firmographics (D&B Enriched)
      annual_revenue: "DECIMAL(18,2) COMMENT 'Most recent annual revenue (USD)'",
      revenue_currency: "STRING DEFAULT 'USD'",
      revenue_range: "STRING COMMENT 'LESS_1M|1M_5M|5M_25M|25M_100M|100M_500M|500M_1B|1B_PLUS'",
      employee_count: "INTEGER COMMENT 'Full-time equivalent'",
      employee_count_range: "STRING COMMENT 'LESS_10|10_50|51_200|201_500|501_1000|1000_PLUS'",
      years_in_business: "INTEGER COMMENT 'Calculated from incorporation date'",
      business_lifecycle_stage: "STRING COMMENT 'STARTUP|GROWTH|MATURE|DECLINING|DISTRESSED'",
      
      // Location (Standardized)
      hq_address_line1: "STRING COMMENT 'USPS standardized'",
      hq_address_line2: "STRING",
      hq_city: "STRING",
      hq_state: "STRING COMMENT '2-letter code'",
      hq_postal_code: "STRING COMMENT '5 or 9-digit ZIP'",
      hq_county: "STRING",
      hq_country: "STRING DEFAULT 'USA'",
      hq_latitude: "DECIMAL(10,8)",
      hq_longitude: "DECIMAL(11,8)",
      hq_metro_area: "STRING COMMENT 'MSA/CBSA name'",
      hq_time_zone: "STRING COMMENT 'America/New_York, etc.'",
      number_of_locations: "INTEGER",
      geographic_footprint: "STRING COMMENT 'LOCAL|REGIONAL|NATIONAL|INTERNATIONAL'",
      
      // Banking Relationship
      customer_since_date: "DATE NOT NULL",
      customer_tenure_months: "INTEGER COMMENT 'Calculated tenure'",
      customer_status: "STRING NOT NULL COMMENT 'ACTIVE|INACTIVE|PROSPECT|DORMANT|CLOSED'",
      customer_segment: "STRING COMMENT 'SMALL_BUSINESS|MIDDLE_MARKET|LARGE_CORP|ENTERPRISE'",
      customer_tier: "STRING COMMENT 'TIER_1|TIER_2|TIER_3'",
      relationship_depth_score: "DECIMAL(5,2) COMMENT 'Product penetration score (0-100)'",
      wallet_share_pct: "DECIMAL(5,2) COMMENT 'Est. % of total banking wallet'",
      
      // Risk & Credit
      internal_risk_rating: "STRING COMMENT 'LOW|MODERATE|HIGH|PROHIBITED'",
      internal_risk_score: "INTEGER COMMENT '300-850 scale'",
      credit_rating_moody: "STRING",
      credit_rating_sp: "STRING",
      credit_rating_fitch: "STRING",
      paydex_score: "INTEGER COMMENT 'D&B Paydex (0-100)'",
      duns_failure_score: "INTEGER COMMENT '1-9999 (lower is better)'",
      probability_of_default_pct: "DECIMAL(5,4) COMMENT 'PD %'",
      loss_given_default_pct: "DECIMAL(5,2) COMMENT 'LGD %'",
      risk_rating_effective_date: "DATE",
      next_risk_rating_review_date: "DATE",
      
      // Ownership Structure
      public_private_indicator: "STRING COMMENT 'PUBLIC|PRIVATE|SUBSIDIARY'",
      publicly_traded_flag: "BOOLEAN",
      stock_ticker: "STRING",
      stock_exchange: "STRING COMMENT 'NYSE|NASDAQ|etc'",
      parent_company_name: "STRING",
      parent_entity_id: "BIGINT COMMENT 'FK to parent entity'",
      ultimate_parent_entity_id: "BIGINT COMMENT 'FK to ultimate parent'",
      entity_hierarchy_level: "INTEGER COMMENT '1=Ultimate Parent, 2=Subsidiary, etc.'",
      consolidation_flag: "BOOLEAN COMMENT 'Should consolidate financials'",
      
      // KYB/Compliance Status
      kyb_status: "STRING NOT NULL COMMENT 'NOT_STARTED|IN_PROGRESS|COMPLETED|EXPIRED|FAILED'",
      kyb_completion_date: "DATE",
      kyb_expiration_date: "DATE",
      kyb_next_review_date: "DATE",
      kyb_risk_level: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      cip_completed_flag: "BOOLEAN COMMENT 'Customer Identification Program'",
      cdd_completed_flag: "BOOLEAN COMMENT 'Customer Due Diligence'",
      edd_required_flag: "BOOLEAN COMMENT 'Enhanced Due Diligence required'",
      
      // AML/Sanctions
      aml_risk_rating: "STRING COMMENT 'LOW|MEDIUM|HIGH|PROHIBITED'",
      sanctions_screening_status: "STRING COMMENT 'CLEAR|MATCH|PENDING_REVIEW'",
      sanctions_screening_date: "DATE",
      ofac_match_flag: "BOOLEAN",
      pep_flag: "BOOLEAN",
      adverse_media_flag: "BOOLEAN",
      adverse_media_score: "INTEGER COMMENT '0-100 (higher is riskier)'",
      
      // Financial Health
      financial_health_score: "INTEGER COMMENT 'Composite score (0-100)'",
      financial_statement_type: "STRING COMMENT 'AUDITED|REVIEWED|COMPILED|TAX_RETURN'",
      latest_financial_statement_date: "DATE",
      financial_statement_frequency: "STRING COMMENT 'ANNUAL|QUARTERLY|MONTHLY'",
      debt_to_equity_ratio: "DECIMAL(10,4)",
      current_ratio: "DECIMAL(10,4)",
      quick_ratio: "DECIMAL(10,4)",
      debt_service_coverage_ratio: "DECIMAL(10,4)",
      profitability_trend: "STRING COMMENT 'GROWING|STABLE|DECLINING'",
      revenue_growth_yoy_pct: "DECIMAL(5,2)",
      
      // Relationship Management
      primary_rm_employee_id: "BIGINT",
      primary_rm_name: "STRING",
      secondary_rm_employee_id: "BIGINT",
      industry_specialist_employee_id: "BIGINT",
      assigned_branch_id: "BIGINT",
      assigned_region_id: "BIGINT",
      relationship_review_date: "DATE COMMENT 'Annual relationship review'",
      
      // Business Characteristics
      seasonality_indicator: "BOOLEAN",
      peak_season_q1_flag: "BOOLEAN",
      peak_season_q2_flag: "BOOLEAN",
      peak_season_q3_flag: "BOOLEAN",
      peak_season_q4_flag: "BOOLEAN",
      cyclical_industry_flag: "BOOLEAN",
      
      // Contact Information
      primary_phone: "STRING COMMENT 'E.164 format'",
      primary_phone_validated_flag: "BOOLEAN",
      primary_email: "STRING",
      primary_email_validated_flag: "BOOLEAN",
      website_url: "STRING",
      website_active_flag: "BOOLEAN COMMENT 'Website accessibility check'",
      
      // Certifications & Flags
      minority_owned_flag: "BOOLEAN COMMENT 'MBE'",
      women_owned_flag: "BOOLEAN COMMENT 'WBE'",
      veteran_owned_flag: "BOOLEAN COMMENT 'VBE'",
      small_business_certified_flag: "BOOLEAN COMMENT 'SBA 8(a)'",
      disadvantaged_business_flag: "BOOLEAN COMMENT 'DBE'",
      foreign_entity_flag: "BOOLEAN",
      related_party_flag: "BOOLEAN",
      
      // Data Quality & Lineage
      data_quality_score: "INTEGER COMMENT 'Overall DQ score (0-100)'",
      completeness_score: "INTEGER COMMENT 'Field completeness (0-100)'",
      accuracy_score: "INTEGER COMMENT 'Data accuracy (0-100)'",
      timeliness_score: "INTEGER COMMENT 'Data freshness (0-100)'",
      source_count: "INTEGER COMMENT 'Number of contributing sources'",
      primary_source_system: "STRING COMMENT 'Primary source of truth'",
      last_source_update: "TIMESTAMP",
      
      // SCD Type 2 Fields
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP COMMENT 'NULL = current record'",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      row_hash: "STRING COMMENT 'Hash of all attributes for change detection'",
      
      // Audit
      created_timestamp: "TIMESTAMP NOT NULL",
      updated_timestamp: "TIMESTAMP NOT NULL",
      created_by: "STRING DEFAULT 'ETL_PROCESS'",
      updated_by: "STRING",
    },
  },
  
  // Table 2: Entity Relationships (Cleansed)
  {
    name: 'silver.commercial_entity_relationships_cleansed',
    description: 'Validated and enriched entity-to-entity relationships with hierarchy calculations',
    grain: 'One row per relationship',
    scdType: 'SCD_TYPE_2',
    primaryKey: ['relationship_key'],
    
    transformations: [
      'Validate both entities exist in golden record',
      'Standardize relationship types',
      'Calculate relationship hierarchy depth',
      'Identify circular relationships',
      'Validate ownership percentages sum to 100%',
    ],
    
    schema: {
      relationship_key: "BIGINT PRIMARY KEY",
      relationship_id: "BIGINT NOT NULL",
      
      primary_entity_key: "BIGINT NOT NULL COMMENT 'FK to dim_commercial_customer'",
      related_entity_key: "BIGINT NOT NULL COMMENT 'FK to dim_commercial_customer'",
      
      relationship_type: "STRING COMMENT 'Standardized: PARENT|SUBSIDIARY|AFFILIATE|JOINT_VENTURE|PARTNER'",
      relationship_subtype: "STRING",
      relationship_direction: "STRING COMMENT 'PRIMARY_TO_RELATED|BIDIRECTIONAL'",
      
      ownership_percentage: "DECIMAL(5,2)",
      ownership_tier: "STRING COMMENT 'MAJORITY|MINORITY|EQUAL'",
      control_level: "STRING COMMENT 'FULL_CONTROL|SIGNIFICANT_INFLUENCE|MINORITY_INTEREST'",
      
      relationship_start_date: "DATE NOT NULL",
      relationship_end_date: "DATE",
      relationship_status: "STRING DEFAULT 'ACTIVE' COMMENT 'ACTIVE|INACTIVE|TERMINATED'",
      relationship_tenure_months: "INTEGER",
      
      consolidation_flag: "BOOLEAN",
      cross_default_flag: "BOOLEAN",
      cross_collateral_flag: "BOOLEAN",
      related_party_transaction_flag: "BOOLEAN",
      
      hierarchy_path: "STRING COMMENT 'Full path from ultimate parent'",
      hierarchy_depth: "INTEGER COMMENT 'Distance from ultimate parent'",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Credit Profile (Aggregated)
  {
    name: 'silver.commercial_credit_profile_agg',
    description: 'Aggregated credit metrics with historical trending and comparative analysis',
    grain: 'One row per entity per month',
    scdType: 'SCD_TYPE_1',
    primaryKey: ['entity_key', 'snapshot_month'],
    
    schema: {
      entity_key: "BIGINT NOT NULL",
      snapshot_month: "DATE NOT NULL COMMENT 'First day of month'",
      
      // Current Credit Metrics
      paydex_score: "INTEGER",
      paydex_trend: "STRING COMMENT 'IMPROVING|STABLE|DECLINING'",
      duns_failure_score: "INTEGER",
      duns_credit_rating: "STRING",
      
      // Trade Line Analysis
      total_trade_lines: "INTEGER",
      active_trade_lines: "INTEGER",
      satisfactory_trades: "INTEGER",
      slow_30_trades: "INTEGER",
      slow_60_trades: "INTEGER",
      slow_90_trades: "INTEGER",
      delinquent_trades: "INTEGER",
      satisfactory_trade_pct: "DECIMAL(5,2)",
      
      // Payment Behavior
      avg_days_beyond_terms: "DECIMAL(5,1)",
      max_days_beyond_terms: "INTEGER",
      on_time_payment_pct: "DECIMAL(5,2)",
      payment_behavior_trend: "STRING COMMENT 'IMPROVING|STABLE|DETERIORATING'",
      
      // Exposure & Limits
      total_credit_exposure: "DECIMAL(18,2)",
      highest_credit_extended: "DECIMAL(18,2)",
      bank_credit_exposure: "DECIMAL(18,2) COMMENT 'This bank total exposure'",
      bank_exposure_pct_of_total: "DECIMAL(5,2)",
      
      // Public Records
      active_liens: "INTEGER",
      active_judgments: "INTEGER",
      bankruptcies_filed: "INTEGER",
      ucc_filings: "INTEGER",
      
      // Trend Indicators (MoM)
      paydex_change_mom: "INTEGER",
      trade_lines_change_mom: "INTEGER",
      exposure_change_pct_mom: "DECIMAL(5,2)",
      
      // Trend Indicators (YoY)
      paydex_change_yoy: "INTEGER",
      exposure_change_pct_yoy: "DECIMAL(5,2)",
      
      created_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: Ownership Structure Consolidated
  {
    name: 'silver.commercial_ownership_structure_consolidated',
    description: 'Consolidated ownership view with effective ownership calculations through multi-level chains',
    grain: 'One row per entity with full ownership hierarchy',
    scdType: 'SCD_TYPE_2',
    primaryKey: ['entity_key'],

    transformations: [
      'Calculate effective ownership % through entire chain',
      'Identify ultimate beneficial owners (25%+ ownership)',
      'Flag VIE consolidation requirements per ASC 810',
      'Detect circular ownership structures',
      'Aggregate foreign ownership percentages',
      'Calculate voting control vs economic ownership splits',
    ],

    dataQualityRules: [
      'Total direct ownership % for each entity must sum to ≤100%',
      'Hierarchy paths must be acyclic (no circular references)',
      'Ultimate parent must have no parent itself',
      'Beneficial owners must have 25%+ effective ownership',
      'VIE determination must be documented',
    ],

    schema: {
      entity_key: "BIGINT PRIMARY KEY",
      entity_id: "BIGINT NOT NULL",
      ultimate_parent_entity_id: "BIGINT",

      // Calculated Ownership
      total_direct_ownership_pct: "DECIMAL(5,2) COMMENT 'Sum of all direct owners'",
      largest_shareholder_ownership_pct: "DECIMAL(5,2)",
      largest_shareholder_entity_id: "BIGINT",
      foreign_ownership_pct: "DECIMAL(5,2)",

      // Beneficial Owners
      beneficial_owner_count: "INTEGER COMMENT 'Count of 25%+ owners'",
      beneficial_owner_entity_ids: "JSON COMMENT 'Array of beneficial owner IDs'",
      control_person_count: "INTEGER",

      // Hierarchy Metrics
      hierarchy_depth: "INTEGER COMMENT 'Levels from ultimate parent'",
      subsidiary_count: "INTEGER COMMENT 'Direct subsidiaries'",
      total_subsidiary_count: "INTEGER COMMENT 'All descendants'",
      sister_company_count: "INTEGER COMMENT 'Entities with same parent'",

      // Consolidation
      requires_consolidation_flag: "BOOLEAN",
      consolidation_method: "STRING",
      is_vie_flag: "BOOLEAN",
      vie_determination_date: "DATE",

      // Flags
      complex_structure_flag: "BOOLEAN COMMENT 'More than 3 ownership levels'",
      cross_border_ownership_flag: "BOOLEAN",
      public_company_in_chain_flag: "BOOLEAN",

      // Verification
      ownership_verified_date: "DATE",
      next_verification_date: "DATE",
      verification_status: "STRING COMMENT 'CURRENT|OVERDUE|PENDING'",

      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN DEFAULT TRUE",

      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 5: Account Opening Pipeline
  {
    name: 'silver.commercial_account_opening_pipeline',
    description: 'Aggregated view of account opening funnel with conversion metrics and bottleneck analysis',
    grain: 'One row per application with enriched funnel metrics',
    scdType: 'SCD_TYPE_1',
    primaryKey: ['application_id'],

    transformations: [
      'Calculate stage conversion rates',
      'Identify funnel drop-off points',
      'Calculate time-in-stage metrics',
      'Flag applications exceeding SLA',
      'Enrich with customer segment and credit score',
      'Calculate approval rates by segment',
    ],

    schema: {
      application_id: "BIGINT PRIMARY KEY",
      entity_id: "BIGINT",

      // Application Details
      product_type: "STRING NOT NULL",
      application_status: "STRING NOT NULL",
      final_decision: "STRING",

      // Funnel Stage Tracking
      current_stage: "STRING COMMENT 'Where application is now'",
      furthest_stage_reached: "STRING COMMENT 'Farthest progression'",
      stages_completed_count: "INTEGER",
      total_stages: "INTEGER",
      completion_percentage: "DECIMAL(5,2)",

      // Timing Metrics (in hours)
      time_to_submit: "DECIMAL(10,2) COMMENT 'Lead to submission'",
      time_to_review: "DECIMAL(10,2) COMMENT 'Submission to review start'",
      time_in_review: "DECIMAL(10,2) COMMENT 'Review duration'",
      time_to_decision: "DECIMAL(10,2) COMMENT 'Submission to decision'",
      time_to_funding: "DECIMAL(10,2) COMMENT 'Decision to funding'",
      total_cycle_time: "DECIMAL(10,2) COMMENT 'End-to-end'",

      // SLA Tracking
      sla_target_hours: "DECIMAL(10,2)",
      sla_met_flag: "BOOLEAN",
      sla_variance_hours: "DECIMAL(10,2) COMMENT 'Positive = beat SLA, negative = missed'",

      // Conversion Indicators
      converted_to_customer_flag: "BOOLEAN",
      account_opened_flag: "BOOLEAN",
      account_funded_flag: "BOOLEAN",

      // Drop-off Analysis
      dropped_at_stage: "STRING",
      drop_off_reason: "STRING",
      reengagement_attempted_flag: "BOOLEAN",

      // Marketing Attribution
      lead_source: "STRING",
      marketing_campaign: "STRING",
      referral_indicator: "BOOLEAN",

      // Risk Signals
      fraud_score: "INTEGER COMMENT '0-1000, higher = riskier'",
      aml_risk_level: "STRING",
      identity_verification_attempts: "INTEGER",
      identity_verification_failed_flag: "BOOLEAN",

      // Approval Factors
      automated_decision: "STRING",
      manual_review_required_flag: "BOOLEAN",
      credit_score: "INTEGER",
      requested_amount: "DECIMAL(18,2)",
      approved_amount: "DECIMAL(18,2)",
      approval_rate_variance_pct: "DECIMAL(5,2) COMMENT '(Approved-Requested)/Requested'",

      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 6: Data Quality Scorecard
  {
    name: 'silver.commercial_data_quality_scorecard',
    description: 'Data quality metrics by table and column with trend analysis and issue tracking',
    grain: 'One row per table per day',
    scdType: 'SCD_TYPE_1',
    primaryKey: ['table_name', 'scorecard_date'],

    transformations: [
      'Aggregate DQ metrics from lineage and governance tables',
      'Calculate composite quality score (0-100)',
      'Identify tables failing BCBS 239 thresholds',
      'Trend DQ metrics over time (7-day, 30-day, 90-day)',
      'Flag tables requiring remediation',
    ],

    schema: {
      table_name: "STRING NOT NULL PRIMARY KEY",
      scorecard_date: "DATE NOT NULL PRIMARY KEY",

      // Composite Scores (0-100)
      overall_quality_score: "DECIMAL(5,2) COMMENT 'Weighted average of all dimensions'",
      accuracy_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      timeliness_score: "DECIMAL(5,2)",
      uniqueness_score: "DECIMAL(5,2)",
      validity_score: "DECIMAL(5,2)",
      consistency_score: "DECIMAL(5,2)",

      // Record Counts
      total_records: "BIGINT",
      valid_records: "BIGINT",
      invalid_records: "BIGINT",
      duplicate_records: "BIGINT",
      null_records: "BIGINT COMMENT 'Records with critical nulls'",

      // BCBS 239 Compliance
      bcbs239_critical_flag: "BOOLEAN",
      bcbs239_threshold_met_flag: "BOOLEAN",
      bcbs239_required_score: "DECIMAL(5,2)",
      bcbs239_actual_score: "DECIMAL(5,2)",
      bcbs239_variance: "DECIMAL(5,2)",

      // Issue Counts
      critical_issues: "INTEGER",
      high_severity_issues: "INTEGER",
      medium_severity_issues: "INTEGER",
      low_severity_issues: "INTEGER",
      open_issues: "INTEGER",
      overdue_issues: "INTEGER",

      // Failed Rules
      failed_rule_count: "INTEGER",
      top_failed_rule: "STRING COMMENT 'Most frequently failing rule'",
      top_failed_rule_count: "INTEGER",

      // Trend Indicators (7-day)
      quality_score_change_7d: "DECIMAL(5,2) COMMENT 'Change from 7 days ago'",
      quality_trend_7d: "STRING COMMENT 'IMPROVING|STABLE|DECLINING'",

      // Trend Indicators (30-day)
      quality_score_change_30d: "DECIMAL(5,2)",
      quality_trend_30d: "STRING",

      // Remediation
      remediation_required_flag: "BOOLEAN",
      remediation_priority: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      remediation_owner: "STRING",
      remediation_due_date: "DATE",

      // Certification
      data_certified_flag: "BOOLEAN",
      last_certification_date: "DATE",
      certification_expires_date: "DATE",

      created_timestamp: "TIMESTAMP",
    },
  },

  // Tables 7-15 follow similar pattern
  // Including: Financial performance aggregations, risk profiles, relationship coverage, etc.
];

export default customerCommercialSilverTables;
