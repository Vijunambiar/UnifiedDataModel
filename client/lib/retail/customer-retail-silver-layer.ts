/**
 * CUSTOMER-RETAIL SILVER LAYER - Complete Implementation
 * 
 * All 15 silver tables for retail customer domain
 * Golden records with SCD Type 2, deduplication, MDM
 * Grade A Target: 95%+ completeness, 99%+ accuracy
 */

export const customerRetailSilverTables = [
  // Table 1: Customer Master Golden Record
  {
    name: 'silver.retail_customer_master_golden',
    description: 'Golden customer record with MDM, deduplication, and SCD Type 2 history',
    grain: 'One current row per unique customer',
    scdType: 'Type 2',
    
    primaryKey: ['customer_sk'],
    naturalKey: ['customer_id'],
    
    sourceTables: [
      'bronze.retail_customer_master',
      'bronze.retail_customer_profile',
      'bronze.retail_customer_demographics_ext',
    ],
    
    deduplicationLogic: {
      matchingKeys: ['ssn_hash', 'full_name', 'date_of_birth', 'address'],
      survivorshipRules: [
        {
          attribute: 'full_name',
          rule: 'Most recent non-null from trusted source',
          priority: ['FIS_CORE', 'SALESFORCE_CRM', 'THIRD_PARTY_DATA'],
        },
        {
          attribute: 'email_primary',
          rule: 'Most recently verified',
        },
        {
          attribute: 'phone_mobile',
          rule: 'Most recently verified',
        },
        {
          attribute: 'address',
          rule: 'Most recent update with USPS verification',
        },
      ],
      confidenceScore: 'Calculated based on data quality and source reliability',
    },
    
    schema: {
      // SURROGATE KEY
      customer_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Surrogate key for silver layer'",
      
      // NATURAL KEYS
      customer_id: "BIGINT UNIQUE COMMENT 'Business natural key from core banking'",
      customer_uuid: "STRING UNIQUE COMMENT 'Global unique identifier (UUID v4)'",
      ssn_hash: "STRING COMMENT 'Hashed SSN for matching (cannot be decrypted)'",
      
      // DEMOGRAPHICS (Cleansed)
      first_name_cleansed: "STRING COMMENT 'Standardized first name (proper case, trimmed)'",
      middle_name_cleansed: "STRING COMMENT 'Standardized middle name'",
      last_name_cleansed: "STRING COMMENT 'Standardized last name'",
      full_name_cleansed: "STRING COMMENT 'Full legal name standardized'",
      preferred_name: "STRING COMMENT 'Preferred nickname'",
      
      date_of_birth: "DATE COMMENT 'Validated date of birth'",
      age: "INTEGER COMMENT 'Current age in years'",
      age_group: "STRING COMMENT 'Age segmentation'",
      generation: "STRING COMMENT 'Silent|Boomer|Gen X|Millennial|Gen Z'",
      
      gender: "STRING COMMENT 'M|F|X|U (standardized)'",
      marital_status: "STRING COMMENT 'Standardized marital status'",
      
      citizenship_status: "STRING",
      country_of_birth: "STRING",
      nationality: "STRING",
      
      // CONTACT INFORMATION (Validated)
      email_primary: "STRING COMMENT 'Primary verified email'",
      email_primary_verified: "BOOLEAN",
      email_primary_verification_date: "DATE",
      email_primary_valid: "BOOLEAN COMMENT 'Email validation status'",
      
      phone_mobile: "STRING COMMENT 'Mobile phone E.164 format'",
      phone_mobile_verified: "BOOLEAN",
      phone_mobile_verification_date: "DATE",
      phone_mobile_valid: "BOOLEAN",
      
      phone_home: "STRING",
      phone_work: "STRING",
      
      // ADDRESS (USPS Standardized)
      address_line1_std: "STRING COMMENT 'USPS standardized street address'",
      address_line2_std: "STRING",
      city_std: "STRING COMMENT 'USPS standardized city'",
      county: "STRING",
      state_std: "STRING COMMENT 'USPS 2-char state code'",
      postal_code_std: "STRING COMMENT 'ZIP+4'",
      country_code: "STRING",
      
      address_type: "STRING",
      address_verified: "BOOLEAN COMMENT 'USPS CASS certified'",
      address_deliverability: "STRING COMMENT 'Deliverable|Undeliverable|Vacant'",
      
      latitude: "DECIMAL(10,6)",
      longitude: "DECIMAL(10,6)",
      census_tract: "STRING",
      census_block_group: "STRING",
      
      years_at_address: "DECIMAL(5,2)",
      move_in_date: "DATE",
      
      // FINANCIAL PROFILE (Enriched)
      fico_score_current: "INTEGER COMMENT 'Most recent FICO score'",
      fico_score_date: "DATE",
      fico_score_bureau: "STRING",
      credit_score_tier: "STRING COMMENT 'Excellent|Very Good|Good|Fair|Poor'",
      
      vantage_score_current: "INTEGER",
      bankruptcy_score: "INTEGER",
      
      annual_income: "DECIMAL(18,2)",
      annual_income_verified: "BOOLEAN",
      household_income: "DECIMAL(18,2)",
      
      employment_status: "STRING",
      employer_name: "STRING",
      occupation: "STRING",
      occupation_code: "STRING COMMENT 'SOC code'",
      industry: "STRING",
      industry_code: "STRING COMMENT 'NAICS code'",
      years_at_employer: "DECIMAL(5,2)",
      
      education_level: "STRING",
      
      // CUSTOMER LIFECYCLE
      customer_since_date: "DATE COMMENT 'First account open date'",
      customer_tenure_years: "DECIMAL(5,2) COMMENT 'Years as customer'",
      customer_tenure_months: "INTEGER",
      
      customer_status: "STRING COMMENT 'Active|Inactive|Dormant|Closed|Deceased'",
      customer_status_date: "DATE",
      customer_status_reason: "STRING",
      
      customer_type: "STRING",
      customer_subtype: "STRING",
      
      // SEGMENTATION (Enhanced)
      customer_segment: "STRING COMMENT 'Mass|Mass Affluent|Affluent|Private'",
      customer_tier: "STRING COMMENT 'Bronze|Silver|Gold|Platinum|Diamond'",
      lifecycle_stage: "STRING COMMENT 'Prospect|New|Growing|Mature|Declining|Attrition'",
      
      value_segment: "STRING COMMENT 'High Value|Medium Value|Low Value'",
      behavioral_segment: "STRING",
      product_segment: "STRING",
      channel_segment: "STRING COMMENT 'Digital First|Branch Preferred|Hybrid'",
      
      // CUSTOMER VALUE METRICS
      customer_value_score: "INTEGER COMMENT 'Overall value score (0-100)'",
      lifetime_value_estimate: "DECIMAL(18,2) COMMENT 'Estimated CLV'",
      current_year_revenue: "DECIMAL(18,2)",
      prior_year_revenue: "DECIMAL(18,2)",
      
      total_products: "INTEGER COMMENT 'Count of all products'",
      total_deposit_accounts: "INTEGER",
      total_loan_accounts: "INTEGER",
      total_card_accounts: "INTEGER",
      
      total_deposit_balance: "DECIMAL(18,2)",
      total_loan_balance: "DECIMAL(18,2)",
      total_credit_limit: "DECIMAL(18,2)",
      
      // HOUSEHOLD
      household_id: "BIGINT COMMENT 'FK to household dimension'",
      household_role: "STRING",
      household_size: "INTEGER",
      number_of_dependents: "INTEGER",
      
      // RELATIONSHIP MANAGEMENT
      primary_branch_id: "BIGINT",
      primary_branch_name: "STRING",
      assigned_banker_id: "BIGINT",
      assigned_banker_name: "STRING",
      relationship_manager_id: "BIGINT",
      
      // RISK & COMPLIANCE (Consolidated)
      kyc_status: "STRING COMMENT 'Completed|Expired|In Progress|Failed'",
      kyc_completion_date: "DATE",
      kyc_expiration_date: "DATE",
      kyc_risk_rating: "STRING COMMENT 'Low|Medium|High'",
      kyc_tier: "STRING COMMENT 'Standard|Enhanced|Simplified'",
      
      cip_status: "STRING COMMENT 'CIP compliance status'",
      cip_completion_date: "DATE",
      
      aml_risk_rating: "STRING COMMENT 'Low|Medium|High|Prohibited'",
      aml_risk_score: "INTEGER COMMENT '0-100'",
      aml_last_review_date: "DATE",
      aml_next_review_date: "DATE",
      
      ofac_status: "STRING COMMENT 'Clear|Match|Under Investigation'",
      ofac_last_check_date: "DATE",
      ofac_next_check_date: "DATE",
      
      sanctions_flag: "BOOLEAN",
      pep_flag: "BOOLEAN COMMENT 'Politically Exposed Person'",
      pep_type: "STRING",
      
      fraud_flag: "BOOLEAN",
      fraud_alert_active: "BOOLEAN",
      fraud_score: "INTEGER COMMENT 'Fraud risk score (0-100)'",
      
      overall_risk_rating: "STRING COMMENT 'Low|Medium|High|Critical'",
      overall_risk_score: "INTEGER",
      
      // PREFERENCES (Consolidated)
      paperless_flag: "BOOLEAN",
      paperless_enrollment_date: "DATE",
      
      marketing_opt_in: "BOOLEAN",
      email_opt_in: "BOOLEAN",
      sms_opt_in: "BOOLEAN",
      phone_opt_in: "BOOLEAN",
      mail_opt_in: "BOOLEAN",
      
      do_not_call: "BOOLEAN",
      do_not_mail: "BOOLEAN",
      do_not_email: "BOOLEAN",
      do_not_solicit: "BOOLEAN",
      
      preferred_language: "STRING COMMENT 'ISO 639-1'",
      preferred_contact_method: "STRING",
      preferred_contact_time: "STRING",
      
      accessibility_needs: "STRING",
      communication_format_preference: "STRING",
      
      // DIGITAL BANKING
      online_banking_user: "BOOLEAN",
      online_banking_enrollment_date: "DATE",
      online_banking_last_login: "DATE",
      online_banking_login_frequency: "STRING COMMENT 'Daily|Weekly|Monthly|Rarely'",
      online_banking_lifetime_logins: "INTEGER",
      
      mobile_banking_user: "BOOLEAN",
      mobile_banking_enrollment_date: "DATE",
      mobile_banking_last_login: "DATE",
      mobile_app_version: "STRING",
      mobile_device_type: "STRING",
      
      biometric_auth_enrolled: "BOOLEAN",
      two_factor_auth_enabled: "BOOLEAN",
      
      digital_engagement_score: "INTEGER COMMENT 'Digital engagement (0-100)'",
      digital_adoption_level: "STRING COMMENT 'High|Medium|Low|None'",
      
      // BEHAVIORAL INDICATORS
      propensity_to_churn: "DECIMAL(5,2) COMMENT 'Churn probability (0-100)'",
      churn_risk_tier: "STRING COMMENT 'High Risk|Medium Risk|Low Risk'",
      
      propensity_to_buy: "DECIMAL(5,2) COMMENT 'Cross-sell probability'",
      cross_sell_opportunity_score: "INTEGER",
      
      engagement_score: "INTEGER COMMENT 'Customer engagement (0-100)'",
      satisfaction_score: "INTEGER COMMENT 'CSAT (1-5)'",
      net_promoter_score: "INTEGER COMMENT 'NPS (-100 to 100)'",
      
      last_interaction_date: "DATE",
      last_transaction_date: "DATE",
      last_branch_visit_date: "DATE",
      
      days_since_last_interaction: "INTEGER",
      interaction_frequency: "STRING COMMENT 'High|Medium|Low'",
      
      // LIFESTYLE & DEMOGRAPHICS (Third Party)
      lifestyle_segment: "STRING",
      estimated_net_worth: "DECIMAL(18,2)",
      estimated_home_value: "DECIMAL(18,2)",
      home_ownership_status: "STRING",
      
      vehicle_owner: "BOOLEAN",
      small_business_owner: "BOOLEAN",
      
      technology_adoption_score: "INTEGER",
      
      // SCD TYPE 2 (REQUIRED)
      effective_date: "DATE COMMENT 'SCD2 effective start date'",
      expiration_date: "DATE DEFAULT '9999-12-31' COMMENT 'SCD2 end date'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'Current record flag'",
      record_version: "INTEGER COMMENT 'Version number starting at 1'",
      
      // DATA QUALITY METRICS (REQUIRED)
      data_quality_score: "DECIMAL(5,2) COMMENT 'Overall quality score (0-100)'",
      completeness_score: "DECIMAL(5,2) COMMENT 'Completeness percentage'",
      accuracy_score: "DECIMAL(5,2) COMMENT 'Accuracy percentage'",
      consistency_score: "DECIMAL(5,2) COMMENT 'Cross-field consistency'",
      timeliness_score: "DECIMAL(5,2) COMMENT 'Data freshness score'",
      
      source_system_of_record: "STRING COMMENT 'Authoritative source'",
      source_confidence_level: "STRING COMMENT 'High|Medium|Low'",
      
      match_confidence_score: "DECIMAL(5,2) COMMENT 'MDM match confidence'",
      duplicate_count: "INTEGER COMMENT 'Number of duplicate records merged'",
      
      // AUDIT TRAIL (REQUIRED)
      created_timestamp: "TIMESTAMP COMMENT 'Record creation timestamp (UTC)'",
      updated_timestamp: "TIMESTAMP COMMENT 'Last update timestamp'",
      created_by: "STRING COMMENT 'User/process that created record'",
      updated_by: "STRING COMMENT 'User/process that updated record'",
      
      source_load_timestamp: "TIMESTAMP COMMENT 'Bronze layer source timestamp'",
      silver_processing_timestamp: "TIMESTAMP COMMENT 'Silver layer ETL timestamp'",
    },
  },
  
  // Table 2: Customer Attributes Extended
  {
    name: 'silver.retail_customer_attributes_ext',
    description: 'Extended customer attributes that change frequently',
    grain: 'One current row per customer',
    scdType: 'Type 2',
    
    primaryKey: ['customer_attribute_sk'],
    naturalKey: ['customer_id'],
    
    schema: {
      customer_attribute_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      customer_sk: "BIGINT COMMENT 'FK to customer master golden'",
      
      // Financial goals
      primary_financial_goal: "STRING",
      retirement_target_age: "INTEGER",
      retirement_income_goal: "DECIMAL(18,2)",
      education_savings_goal: "DECIMAL(18,2)",
      home_purchase_goal: "DECIMAL(18,2)",
      
      // Risk profile
      risk_tolerance: "STRING COMMENT 'Conservative|Moderate|Aggressive'",
      investment_experience: "STRING",
      investment_time_horizon: "STRING COMMENT 'Short|Medium|Long'",
      
      // Interests & preferences
      interests: "ARRAY<STRING> COMMENT 'Array of interests'",
      hobbies: "ARRAY<STRING>",
      life_events: "ARRAY<STRING>",
      
      // Product interests
      product_interests: "ARRAY<STRING>",
      campaign_responses: "INTEGER COMMENT 'Lifetime campaign response count'",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // Data quality
      data_quality_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
    },
  },
  
  // Table 3: Customer Relationships Golden
  {
    name: 'silver.retail_customer_relationships_golden',
    description: 'Golden record of customer-to-customer relationships',
    grain: 'One row per active customer relationship',
    scdType: 'Type 2',
    
    primaryKey: ['relationship_sk'],
    naturalKey: ['primary_customer_id', 'related_customer_id', 'relationship_type'],
    
    schema: {
      relationship_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      primary_customer_id: "BIGINT",
      primary_customer_sk: "BIGINT",
      
      related_customer_id: "BIGINT",
      related_customer_sk: "BIGINT",
      
      relationship_type: "STRING",
      relationship_subtype: "STRING",
      relationship_category: "STRING COMMENT 'Family|Business|Legal|Beneficial'",
      
      relationship_start_date: "DATE",
      relationship_end_date: "DATE",
      relationship_status: "STRING",
      relationship_duration_years: "DECIMAL(5,2)",
      
      authority_level: "STRING",
      signing_authority: "BOOLEAN",
      withdrawal_authority: "BOOLEAN",
      view_authority: "BOOLEAN",
      
      percentage_ownership: "DECIMAL(5,2)",
      beneficiary_percentage: "DECIMAL(5,2)",
      
      is_reciprocal: "BOOLEAN COMMENT 'Relationship goes both ways'",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // Data quality
      data_quality_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
    },
  },

  // Table 4: Customer Addresses Golden
  {
    name: 'silver.retail_customer_addresses_golden',
    description: 'USPS-validated customer addresses with geocoding and SCD Type 2',
    grain: 'One row per customer address per effective date',
    scdType: 'Type 2',
    primaryKey: ['address_sk'],
    naturalKey: ['customer_id', 'address_type'],
    sourceTables: ['bronze.retail_customer_address'],
    schema: {
      address_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      address_type: "STRING COMMENT 'Mailing|Physical|Business|Previous'",
      address_line1_std: "STRING COMMENT 'USPS standardized'",
      address_line2_std: "STRING",
      city_std: "STRING",
      county: "STRING",
      state_std: "STRING",
      postal_code_std: "STRING COMMENT 'ZIP+4'",
      country_code: "STRING DEFAULT 'US'",
      latitude: "DECIMAL(10,8)",
      longitude: "DECIMAL(11,8)",
      address_valid: "BOOLEAN",
      usps_verified_date: "DATE",
      is_primary: "BOOLEAN",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 5: Customer Contacts Golden
  {
    name: 'silver.retail_customer_contacts_golden',
    description: 'Validated phone and email contacts with verification status',
    grain: 'One row per contact method per customer',
    scdType: 'Type 2',
    primaryKey: ['contact_sk'],
    naturalKey: ['customer_id', 'contact_type', 'contact_value'],
    sourceTables: ['bronze.retail_customer_phone', 'bronze.retail_customer_email'],
    schema: {
      contact_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      contact_type: "STRING COMMENT 'Mobile|Home|Work|Email|Fax'",
      contact_value: "STRING COMMENT 'Phone E.164 or email address'",
      is_verified: "BOOLEAN",
      verification_date: "DATE",
      verification_method: "STRING COMMENT 'SMS OTP|Email Link|Phone Call|Manual'",
      is_valid: "BOOLEAN COMMENT 'Format and deliverability validation'",
      is_primary: "BOOLEAN",
      opt_in_marketing: "BOOLEAN",
      opt_in_date: "DATE",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 6: Customer Employment Golden
  {
    name: 'silver.retail_customer_employment_golden',
    description: 'Employment information with income validation',
    grain: 'One row per customer employment record',
    scdType: 'Type 2',
    primaryKey: ['employment_sk'],
    naturalKey: ['customer_id'],
    sourceTables: ['bronze.retail_customer_profile'],
    schema: {
      employment_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      employment_status: "STRING COMMENT 'Employed|Self-Employed|Retired|Student|Unemployed'",
      employer_name: "STRING",
      job_title: "STRING",
      occupation_category: "STRING",
      industry_code: "STRING COMMENT 'NAICS code'",
      employer_phone: "STRING",
      work_email: "STRING",
      employment_start_date: "DATE",
      employment_length_years: "INTEGER",
      annual_income: "DECIMAL(18,2)",
      income_verified: "BOOLEAN",
      income_verification_method: "STRING COMMENT 'Tax Return|Pay Stub|Bank Statement|Stated'",
      income_verification_date: "DATE",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 7: Customer Credit Profile Golden
  {
    name: 'silver.retail_customer_credit_profile_golden',
    description: 'Credit bureau data with risk scores and tradelines',
    grain: 'One row per customer credit pull',
    scdType: 'Type 2',
    primaryKey: ['credit_profile_sk'],
    naturalKey: ['customer_id', 'bureau_name', 'pull_date'],
    sourceTables: ['bronze.retail_customer_profile'],
    schema: {
      credit_profile_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      bureau_name: "STRING COMMENT 'Experian|TransUnion|Equifax'",
      credit_score: "INTEGER COMMENT 'FICO score 300-850'",
      credit_score_model: "STRING COMMENT 'FICO 8|FICO 9|VantageScore 3.0'",
      credit_score_date: "DATE",
      pull_date: "DATE",
      pull_reason: "STRING COMMENT 'Application|Account Review|Monitoring'",
      total_tradelines: "INTEGER",
      open_tradelines: "INTEGER",
      total_debt: "DECIMAL(18,2)",
      total_available_credit: "DECIMAL(18,2)",
      credit_utilization_pct: "DECIMAL(5,2)",
      delinquent_accounts: "INTEGER",
      public_records_count: "INTEGER",
      bankruptcy_flag: "BOOLEAN",
      foreclosure_flag: "BOOLEAN",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 8: Customer Segments Golden
  {
    name: 'silver.retail_customer_segments_golden',
    description: 'Customer segmentation assignments with scores',
    grain: 'One row per customer per segment type',
    scdType: 'Type 2',
    primaryKey: ['segment_sk'],
    naturalKey: ['customer_id', 'segment_type'],
    sourceTables: ['bronze.retail_customer_segments'],
    schema: {
      segment_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      segment_type: "STRING COMMENT 'Demographic|Behavioral|Value|Product|Lifecycle'",
      segment_code: "STRING",
      segment_name: "STRING",
      segment_description: "STRING",
      segment_score: "DECIMAL(10,2)",
      assignment_date: "DATE",
      assignment_method: "STRING COMMENT 'Rule-Based|ML Model|Manual'",
      model_version: "STRING",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 9: Customer Lifecycle Events Golden
  {
    name: 'silver.retail_customer_lifecycle_events_golden',
    description: 'Key customer lifecycle milestones and status changes',
    grain: 'One row per customer lifecycle event',
    scdType: 'Type 2',
    primaryKey: ['lifecycle_event_sk'],
    naturalKey: ['customer_id', 'event_date', 'event_type'],
    sourceTables: ['bronze.retail_customer_lifecycle_events'],
    schema: {
      lifecycle_event_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      event_type: "STRING COMMENT 'Onboarding|Activation|Dormant|Reactivation|Closure|Attrition'",
      event_date: "DATE",
      event_reason: "STRING",
      previous_status: "STRING",
      new_status: "STRING",
      event_source: "STRING",
      triggered_by: "STRING COMMENT 'Customer|System|Employee'",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 10: Customer Consents Golden
  {
    name: 'silver.retail_customer_consents_golden',
    description: 'GDPR/CCPA compliant consent management',
    grain: 'One row per customer per consent type',
    scdType: 'Type 2',
    primaryKey: ['consent_sk'],
    naturalKey: ['customer_id', 'consent_type'],
    sourceTables: ['bronze.retail_customer_consent'],
    schema: {
      consent_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      consent_type: "STRING COMMENT 'Marketing|Data Sharing|Phone|Email|SMS|Cookies'",
      consent_status: "STRING COMMENT 'Granted|Denied|Withdrawn|Expired'",
      consent_date: "DATE",
      consent_method: "STRING COMMENT 'Online|In-Branch|Phone|Mail'",
      consent_channel: "STRING",
      withdrawal_date: "DATE",
      expiration_date_consent: "DATE COMMENT 'GDPR consent expiration'",
      compliance_framework: "STRING COMMENT 'GDPR|CCPA|TCPA|CAN-SPAM'",
      audit_trail: "STRING",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 11: Customer Interactions Golden
  {
    name: 'silver.retail_customer_interactions_golden',
    description: 'Omnichannel customer interaction history',
    grain: 'One row per customer interaction',
    scdType: 'Type 1',
    primaryKey: ['interaction_sk'],
    naturalKey: ['customer_id', 'interaction_date', 'interaction_id'],
    sourceTables: ['bronze.retail_customer_master'],
    schema: {
      interaction_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      interaction_id: "STRING",
      interaction_date: "TIMESTAMP",
      interaction_type: "STRING COMMENT 'Call|Email|Chat|Branch Visit|Mobile App|ATM'",
      interaction_channel: "STRING",
      interaction_direction: "STRING COMMENT 'Inbound|Outbound'",
      interaction_reason: "STRING",
      interaction_outcome: "STRING",
      employee_id: "BIGINT",
      branch_id: "BIGINT",
      duration_seconds: "INTEGER",
      sentiment_score: "DECIMAL(5,2) COMMENT 'NLP sentiment -1 to 1'",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 12: Customer Product Holdings Golden
  {
    name: 'silver.retail_customer_product_holdings_golden',
    description: 'Customer product ownership and balances',
    grain: 'One row per customer per product',
    scdType: 'Type 2',
    primaryKey: ['holding_sk'],
    naturalKey: ['customer_id', 'product_id'],
    sourceTables: ['bronze.retail_customer_master'],
    schema: {
      holding_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      product_id: "STRING",
      product_type: "STRING COMMENT 'Checking|Savings|Loan|Card|Investment'",
      product_name: "STRING",
      account_number: "STRING",
      open_date: "DATE",
      close_date: "DATE",
      status: "STRING COMMENT 'Active|Inactive|Dormant|Closed'",
      balance: "DECIMAL(18,2)",
      available_balance: "DECIMAL(18,2)",
      currency_code: "STRING DEFAULT 'USD'",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 13: Household Golden
  {
    name: 'silver.retail_household_golden',
    description: 'Household aggregation with relationships',
    grain: 'One row per household',
    scdType: 'Type 2',
    primaryKey: ['household_sk'],
    naturalKey: ['household_id'],
    sourceTables: ['bronze.retail_household', 'bronze.retail_household_members'],
    schema: {
      household_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      household_id: "BIGINT",
      household_name: "STRING",
      household_type: "STRING COMMENT 'Single|Family|Multi-Generational|Shared'",
      primary_customer_id: "BIGINT",
      member_count: "INTEGER",
      adult_count: "INTEGER",
      child_count: "INTEGER",
      household_income: "DECIMAL(18,2)",
      household_net_worth: "DECIMAL(18,2)",
      primary_address_sk: "BIGINT",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 14: Customer Risk Ratings Golden
  {
    name: 'silver.retail_customer_risk_ratings_golden',
    description: 'Comprehensive risk assessment across dimensions',
    grain: 'One row per customer per risk assessment',
    scdType: 'Type 2',
    primaryKey: ['risk_rating_sk'],
    naturalKey: ['customer_id', 'assessment_date'],
    sourceTables: ['bronze.retail_customer_kyc', 'bronze.retail_customer_aml_screening'],
    schema: {
      risk_rating_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      assessment_date: "DATE",
      overall_risk_rating: "STRING COMMENT 'Low|Medium|High|Prohibited'",
      overall_risk_score: "INTEGER COMMENT '0-100'",
      credit_risk_rating: "STRING",
      credit_risk_score: "INTEGER",
      aml_risk_rating: "STRING",
      aml_risk_score: "INTEGER",
      fraud_risk_rating: "STRING",
      fraud_risk_score: "INTEGER",
      kyc_risk_rating: "STRING",
      sanctions_flag: "BOOLEAN",
      pep_flag: "BOOLEAN",
      assessment_method: "STRING COMMENT 'Rule-Based|ML Model|Manual Review'",
      assessed_by: "STRING",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 15: Customer KYC Compliance Golden
  {
    name: 'silver.retail_customer_kyc_compliance_golden',
    description: 'KYC/CIP compliance status and documentation',
    grain: 'One row per customer KYC review',
    scdType: 'Type 2',
    primaryKey: ['kyc_sk'],
    naturalKey: ['customer_id', 'kyc_review_date'],
    sourceTables: ['bronze.retail_customer_kyc', 'bronze.retail_customer_identification'],
    schema: {
      kyc_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      customer_id: "BIGINT",
      kyc_status: "STRING COMMENT 'Not Started|In Progress|Completed|Expired|Failed'",
      kyc_completion_date: "DATE",
      kyc_expiration_date: "DATE",
      kyc_review_date: "DATE",
      kyc_reviewer_id: "STRING",
      cip_status: "STRING COMMENT 'Customer Identification Program status'",
      cip_completion_date: "DATE",
      identity_verified: "BOOLEAN",
      identity_verification_method: "STRING COMMENT 'Government ID|Biometric|Knowledge-Based'",
      documents_collected: "STRING COMMENT 'Comma-separated list'",
      risk_rating: "STRING",
      enhanced_due_diligence_required: "BOOLEAN",
      edd_completion_date: "DATE",
      regulatory_comments: "STRING",
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

];

export const customerRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail customer domain with MDM and SCD2',
  layer: 'SILVER',
  tables: customerRetailSilverTables,
  totalTables: 15,
  estimatedSize: '200GB',
  refreshFrequency: 'Hourly',
  dataQuality: {
    completenessTarget: 95,
    accuracyTarget: 99,
    consistencyTarget: 98,
    timelinessTarget: 99.5,
  },
};
