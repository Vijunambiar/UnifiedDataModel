/**
 * CUSTOMER-RETAIL BRONZE LAYER - Complete Implementation
 * 
 * All 18 bronze tables for retail customer domain
 * Grade A Target: Comprehensive, industry-accurate, zero errors
 */

export const customerRetailBronzeTables = [
  // Table 1: Customer Master (already defined in main file)
  // Table 2: Customer Profile Extended
  {
    name: 'bronze.retail_customer_profile',
    description: 'Extended customer profile attributes and preferences from CRM system',
    sourceSystem: 'SALESFORCE_CRM',
    sourceTable: 'Customer_Profile__c',
    loadType: 'INCREMENTAL',
    
    grain: 'One row per customer',
    primaryKey: ['customer_id', 'source_system'],
    
    schema: {
      customer_id: "BIGINT PRIMARY KEY COMMENT 'FK to customer master'",
      source_system: "STRING PRIMARY KEY",
      
      // Extended profile
      customer_value_score: "INTEGER COMMENT 'Customer value score (0-100)'",
      lifetime_value_estimate: "DECIMAL(18,2) COMMENT 'Estimated customer lifetime value'",
      risk_tolerance: "STRING COMMENT 'Conservative|Moderate|Aggressive'",
      investment_experience: "STRING COMMENT 'Beginner|Intermediate|Advanced|Professional'",
      
      // Financial goals
      primary_financial_goal: "STRING COMMENT 'Retirement|Education|Home Purchase|Wealth Accumulation|Debt Reduction'",
      secondary_financial_goal: "STRING",
      retirement_target_age: "INTEGER",
      retirement_income_goal: "DECIMAL(18,2)",
      
      // Banking preferences
      preferred_branch_id: "BIGINT",
      preferred_banker_id: "BIGINT",
      preferred_service_channel: "STRING COMMENT 'Branch|Phone|Online|Mobile|Chat'",
      statement_delivery_method: "STRING COMMENT 'Paper|Email|Online Portal'",
      statement_frequency: "STRING COMMENT 'Monthly|Quarterly|Annually'",
      
      // Communication preferences
      communication_frequency_preference: "STRING COMMENT 'Daily|Weekly|Monthly|Quarterly|Opt-out'",
      newsletter_subscription: "BOOLEAN",
      event_invitation_preference: "BOOLEAN",
      survey_participation_willingness: "BOOLEAN",
      
      // Product interests
      interested_in_savings: "BOOLEAN",
      interested_in_checking: "BOOLEAN",
      interested_in_credit_card: "BOOLEAN",
      interested_in_personal_loan: "BOOLEAN",
      interested_in_mortgage: "BOOLEAN",
      interested_in_investment: "BOOLEAN",
      interested_in_insurance: "BOOLEAN",
      
      // Segmentation attributes
      propensity_to_churn: "DECIMAL(5,2) COMMENT 'Churn probability score (0-100)'",
      propensity_to_buy: "DECIMAL(5,2) COMMENT 'Cross-sell probability (0-100)'",
      customer_satisfaction_score: "INTEGER COMMENT 'CSAT score (1-5)'",
      net_promoter_score: "INTEGER COMMENT 'NPS score (-100 to 100)'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Customer Relationships
  {
    name: 'bronze.retail_customer_relationships',
    description: 'Customer-to-customer relationships (joint accounts, beneficiaries, authorized signers)',
    sourceSystem: 'FIS_CORE',
    sourceTable: 'CUSTOMER_RELATIONSHIPS',
    loadType: 'CDC',
    
    grain: 'One row per customer relationship',
    primaryKey: ['relationship_id', 'source_system'],
    
    schema: {
      relationship_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      primary_customer_id: "BIGINT COMMENT 'Main customer'",
      related_customer_id: "BIGINT COMMENT 'Related customer'",
      
      relationship_type: "STRING COMMENT 'Joint Owner|Beneficiary|Authorized Signer|Power of Attorney|Guardian|Custodian'",
      relationship_subtype: "STRING COMMENT 'Spouse|Parent|Child|Sibling|Other Family|Non-Family'",
      
      relationship_start_date: "DATE",
      relationship_end_date: "DATE",
      relationship_status: "STRING COMMENT 'Active|Inactive|Terminated'",
      
      authority_level: "STRING COMMENT 'Full|Limited|View Only'",
      signing_authority: "BOOLEAN",
      withdrawal_authority: "BOOLEAN",
      
      percentage_ownership: "DECIMAL(5,2) COMMENT 'Ownership percentage for joint accounts'",
      beneficiary_percentage: "DECIMAL(5,2) COMMENT 'Beneficiary allocation percentage'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: Customer Addresses (Historical)
  {
    name: 'bronze.retail_customer_addresses',
    description: 'Customer address history for tracking moves and validating residency',
    sourceSystem: 'FIS_CORE',
    sourceTable: 'CUSTOMER_ADDRESSES',
    loadType: 'CDC',
    
    grain: 'One row per customer per address',
    primaryKey: ['address_id', 'source_system'],
    
    schema: {
      address_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      address_type: "STRING COMMENT 'Primary|Mailing|Previous|Seasonal|Work'",
      
      address_line1: "STRING",
      address_line2: "STRING",
      city: "STRING",
      county: "STRING",
      state: "STRING",
      postal_code: "STRING",
      country_code: "STRING",
      
      address_verified: "BOOLEAN",
      address_verification_date: "DATE",
      address_verification_source: "STRING COMMENT 'USPS|Manual|Third Party'",
      
      move_in_date: "DATE",
      move_out_date: "DATE",
      years_at_address: "DECIMAL(5,2)",
      
      is_current_address: "BOOLEAN",
      is_primary_address: "BOOLEAN",
      
      latitude: "DECIMAL(10,6)",
      longitude: "DECIMAL(10,6)",
      census_tract: "STRING",
      census_block_group: "STRING",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 5: Customer Contacts (Phone/Email)
  {
    name: 'bronze.retail_customer_contacts',
    description: 'All customer contact methods with verification status',
    sourceSystem: 'FIS_CORE',
    sourceTable: 'CUSTOMER_CONTACTS',
    loadType: 'CDC',
    
    grain: 'One row per contact method',
    primaryKey: ['contact_id', 'source_system'],
    
    schema: {
      contact_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      contact_type: "STRING COMMENT 'Mobile Phone|Home Phone|Work Phone|Email|Fax'",
      contact_value: "STRING COMMENT 'Phone number or email address'",
      contact_value_normalized: "STRING COMMENT 'Standardized format'",
      
      is_primary: "BOOLEAN",
      is_verified: "BOOLEAN",
      verification_date: "DATE",
      verification_method: "STRING COMMENT 'SMS|Email|Voice Call|In Person'",
      
      contact_status: "STRING COMMENT 'Active|Inactive|Invalid|Do Not Use'",
      invalid_reason: "STRING COMMENT 'Bounced|Wrong Number|Customer Request'",
      
      can_receive_sms: "BOOLEAN",
      can_receive_voice: "BOOLEAN",
      
      last_contacted_date: "DATE",
      last_successful_contact_date: "DATE",
      contact_attempt_count: "INTEGER",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 6: Customer Identification Documents
  {
    name: 'bronze.retail_customer_identification',
    description: 'Customer identification documents for KYC/CIP compliance',
    sourceSystem: 'FIS_CORE',
    sourceTable: 'CUSTOMER_IDENTIFICATION',
    loadType: 'CDC',
    
    grain: 'One row per identification document',
    primaryKey: ['identification_id', 'source_system'],
    
    schema: {
      identification_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      id_type: "STRING COMMENT 'Drivers License|Passport|State ID|Military ID|Tribal ID|Foreign National ID'",
      id_number: "STRING COMMENT 'Encrypted ID number'",
      id_number_hash: "STRING COMMENT 'Hashed for matching'",
      
      issuing_authority: "STRING COMMENT 'State DMV|US State Dept|DOD|etc.'",
      issuing_state: "STRING",
      issuing_country: "STRING",
      
      issue_date: "DATE",
      expiration_date: "DATE",
      is_expired: "BOOLEAN",
      
      verification_status: "STRING COMMENT 'Verified|Unverified|Expired|Invalid'",
      verification_date: "DATE",
      verification_method: "STRING COMMENT 'Visual Inspection|Electronic|Third Party'",
      verified_by: "STRING COMMENT 'Employee ID or system'",
      
      document_image_path: "STRING COMMENT 'Secure storage path for scanned document'",
      
      is_primary_id: "BOOLEAN",
      
      // CIP fields
      cip_compliant: "BOOLEAN",
      cip_verification_date: "DATE",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 7: Customer Employment History
  {
    name: 'bronze.retail_customer_employment',
    description: 'Customer employment and income history',
    sourceSystem: 'FIS_CORE',
    sourceTable: 'CUSTOMER_EMPLOYMENT',
    loadType: 'INCREMENTAL',
    
    grain: 'One row per employment period',
    primaryKey: ['employment_id', 'source_system'],
    
    schema: {
      employment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      employer_name: "STRING",
      employer_ein: "STRING COMMENT 'Employer Identification Number'",
      employer_phone: "STRING",
      employer_address: "STRING",
      employer_city: "STRING",
      employer_state: "STRING",
      employer_postal_code: "STRING",
      
      occupation: "STRING",
      occupation_code: "STRING COMMENT 'SOC code'",
      job_title: "STRING",
      industry: "STRING COMMENT 'Finance|Healthcare|Technology|etc.'",
      industry_code: "STRING COMMENT 'NAICS code'",
      
      employment_status: "STRING COMMENT 'Full Time|Part Time|Self Employed|Unemployed|Retired'",
      employment_type: "STRING COMMENT 'Permanent|Contract|Temporary|Seasonal'",
      
      start_date: "DATE",
      end_date: "DATE",
      is_current_employer: "BOOLEAN",
      years_at_employer: "DECIMAL(5,2)",
      
      annual_income: "DECIMAL(18,2)",
      income_frequency: "STRING COMMENT 'Annual|Monthly|Bi-weekly|Weekly|Hourly'",
      hourly_wage: "DECIMAL(10,2)",
      hours_per_week: "INTEGER",
      
      income_verified: "BOOLEAN",
      income_verification_date: "DATE",
      income_verification_method: "STRING COMMENT 'Pay Stub|Tax Return|Employment Letter|Bank Statements'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 8: Customer Credit Bureau Data
  {
    name: 'bronze.retail_customer_credit_bureau',
    description: 'Credit bureau pulls and scores from Equifax, Experian, TransUnion',
    sourceSystem: 'CREDIT_BUREAU',
    sourceTable: 'CREDIT_REPORTS',
    loadType: 'INCREMENTAL',
    
    grain: 'One row per credit bureau pull',
    primaryKey: ['credit_pull_id', 'source_system'],
    
    schema: {
      credit_pull_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY COMMENT 'EQUIFAX|EXPERIAN|TRANSUNION'",
      customer_id: "BIGINT",
      
      credit_bureau: "STRING COMMENT 'Equifax|Experian|TransUnion'",
      pull_date: "DATE",
      pull_reason: "STRING COMMENT 'New Account|Credit Review|Collection|Adverse Action|Account Review'",
      pull_type: "STRING COMMENT 'Hard Pull|Soft Pull'",
      
      fico_score_8: "INTEGER COMMENT 'FICO Score 8 (300-850)'",
      fico_score_9: "INTEGER COMMENT 'FICO Score 9 (300-850)'",
      vantage_score_3: "INTEGER COMMENT 'VantageScore 3.0 (300-850)'",
      vantage_score_4: "INTEGER COMMENT 'VantageScore 4.0 (300-850)'",
      
      bankruptcy_score: "INTEGER",
      auto_score: "INTEGER",
      bankcard_score: "INTEGER",
      mortgage_score: "INTEGER",
      
      credit_score_tier: "STRING COMMENT 'Excellent|Very Good|Good|Fair|Poor|Very Poor'",
      
      // Credit file summary
      total_accounts: "INTEGER",
      open_accounts: "INTEGER",
      closed_accounts: "INTEGER",
      
      total_revolving_accounts: "INTEGER",
      total_installment_accounts: "INTEGER",
      total_mortgage_accounts: "INTEGER",
      
      total_credit_limit: "DECIMAL(18,2)",
      total_balance: "DECIMAL(18,2)",
      available_credit: "DECIMAL(18,2)",
      credit_utilization_ratio: "DECIMAL(5,2) COMMENT 'Percentage (0-100)'",
      
      total_monthly_payment: "DECIMAL(18,2)",
      
      // Payment history
      number_of_delinquencies_30days: "INTEGER",
      number_of_delinquencies_60days: "INTEGER",
      number_of_delinquencies_90days: "INTEGER",
      number_of_delinquencies_120plus_days: "INTEGER",
      
      recent_delinquency_date: "DATE",
      worst_delinquency_rating: "STRING",
      
      // Public records
      number_of_bankruptcies: "INTEGER",
      most_recent_bankruptcy_date: "DATE",
      bankruptcy_type: "STRING COMMENT 'Chapter 7|Chapter 11|Chapter 13'",
      bankruptcy_discharge_date: "DATE",
      
      number_of_foreclosures: "INTEGER",
      number_of_tax_liens: "INTEGER",
      number_of_judgments: "INTEGER",
      number_of_collections: "INTEGER",
      
      // Inquiries
      number_of_hard_inquiries_6months: "INTEGER",
      number_of_hard_inquiries_12months: "INTEGER",
      number_of_hard_inquiries_24months: "INTEGER",
      
      // Credit age
      oldest_trade_line_date: "DATE",
      newest_trade_line_date: "DATE",
      average_age_of_accounts_months: "INTEGER",
      
      // Full report
      full_credit_report_json: "STRING COMMENT 'Full JSON credit report'",
      
      // Audit
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 9: Customer Segments
  {
    name: 'bronze.retail_customer_segments',
    description: 'Customer segmentation assignments and scores',
    sourceSystem: 'MARKETING_AUTOMATION',
    sourceTable: 'Customer_Segments',
    loadType: 'DAILY',
    
    grain: 'One row per customer per segment assignment',
    primaryKey: ['segment_assignment_id', 'source_system'],
    
    schema: {
      segment_assignment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      segment_type: "STRING COMMENT 'Value|Lifecycle|Product|Channel|Behavioral'",
      segment_category: "STRING",
      segment_name: "STRING",
      segment_code: "STRING",
      
      assignment_date: "DATE",
      effective_date: "DATE",
      expiration_date: "DATE",
      
      segment_score: "DECIMAL(10,2) COMMENT 'Propensity score for segment (0-100)'",
      segment_rank: "INTEGER COMMENT 'Rank within segment (1=best)'",
      
      assignment_reason: "STRING COMMENT 'Rule-based|Model-based|Manual'",
      model_name: "STRING COMMENT 'Name of ML model if applicable'",
      model_version: "STRING",
      
      is_active_segment: "BOOLEAN",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 10: Customer Lifecycle Events
  {
    name: 'bronze.retail_customer_lifecycle_events',
    description: 'Major customer lifecycle events (onboarding, cross-sell, churn, etc.)',
    sourceSystem: 'FIS_CORE',
    sourceTable: 'CUSTOMER_EVENTS',
    loadType: 'CDC',
    
    grain: 'One row per lifecycle event',
    primaryKey: ['event_id', 'source_system'],
    
    schema: {
      event_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      event_type: "STRING COMMENT 'Onboarding|First Purchase|Cross-Sell|Upsell|Service Issue|Complaint|Churn Warning|Churn|Reactivation|Winback'",
      event_category: "STRING COMMENT 'Acquisition|Growth|Retention|Attrition|Service'",
      event_subcategory: "STRING",
      
      event_date: "DATE",
      event_timestamp: "TIMESTAMP",
      
      event_channel: "STRING COMMENT 'Branch|Online|Mobile|Call Center|ATM|Mail'",
      event_location: "STRING COMMENT 'Branch ID or digital identifier'",
      
      event_description: "STRING",
      event_notes: "STRING",
      
      event_value: "DECIMAL(18,2) COMMENT 'Monetary value if applicable'",
      event_impact_score: "INTEGER COMMENT 'Impact score (1-10)'",
      
      triggered_by: "STRING COMMENT 'Customer|System|Employee|Campaign'",
      triggered_by_id: "STRING COMMENT 'Employee ID, campaign ID, etc.'",
      
      resolution_status: "STRING COMMENT 'Open|In Progress|Resolved|Closed'",
      resolution_date: "DATE",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 11: Customer Consents (GDPR/CCPA)
  {
    name: 'bronze.retail_customer_consents',
    description: 'Customer consent and opt-in/opt-out preferences for privacy compliance',
    sourceSystem: 'CONSENT_MANAGEMENT',
    sourceTable: 'Customer_Consents',
    loadType: 'CDC',
    
    grain: 'One row per consent type per customer',
    primaryKey: ['consent_id', 'source_system'],
    
    schema: {
      consent_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      consent_type: "STRING COMMENT 'Marketing|Data Sharing|Third Party|Cookies|SMS|Email|Phone|Mail'",
      consent_category: "STRING COMMENT 'Required|Optional|Preference'",
      
      consent_status: "STRING COMMENT 'Granted|Denied|Revoked|Expired'",
      consent_granted_date: "DATE",
      consent_revoked_date: "DATE",
      consent_expiration_date: "DATE",
      
      consent_method: "STRING COMMENT 'Online|In Person|Phone|Mail|Email'",
      consent_channel: "STRING COMMENT 'Website|Mobile App|Branch|Call Center'",
      consent_version: "STRING COMMENT 'Version of privacy policy/terms'",
      
      opt_in_flag: "BOOLEAN",
      opt_out_flag: "BOOLEAN",
      
      regulatory_basis: "STRING COMMENT 'GDPR|CCPA|GLBA|TCPA|CAN-SPAM'",
      
      consent_text: "STRING COMMENT 'Full consent language'",
      consent_document_url: "STRING",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 12: Customer Interactions
  {
    name: 'bronze.retail_customer_interactions',
    description: 'All customer service interactions across channels',
    sourceSystem: 'CRM',
    sourceTable: 'Interactions',
    loadType: 'CDC',
    
    grain: 'One row per customer interaction',
    primaryKey: ['interaction_id', 'source_system'],
    
    schema: {
      interaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      interaction_date: "DATE",
      interaction_timestamp: "TIMESTAMP",
      
      interaction_type: "STRING COMMENT 'Inquiry|Complaint|Request|Feedback|Sales|Service'",
      interaction_channel: "STRING COMMENT 'Branch|Phone|Email|Chat|SMS|Social Media|Mobile App'",
      interaction_direction: "STRING COMMENT 'Inbound|Outbound'",
      
      interaction_topic: "STRING COMMENT 'Account|Product|Service|Technical|Billing|Fraud'",
      interaction_subtopic: "STRING",
      
      interaction_duration_seconds: "INTEGER",
      interaction_notes: "STRING",
      
      handled_by_employee_id: "BIGINT",
      handled_by_employee_name: "STRING",
      handled_by_department: "STRING",
      
      resolution_status: "STRING COMMENT 'Resolved|Pending|Escalated|Closed'",
      resolution_time_hours: "DECIMAL(10,2)",
      first_contact_resolution: "BOOLEAN",
      
      satisfaction_rating: "INTEGER COMMENT 'Customer satisfaction (1-5)'",
      
      follow_up_required: "BOOLEAN",
      follow_up_date: "DATE",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 13: Customer Product Holdings
  {
    name: 'bronze.retail_customer_product_holdings',
    description: 'Summary of all products held by customer',
    sourceSystem: 'FIS_CORE',
    sourceTable: 'CUSTOMER_PRODUCTS',
    loadType: 'DAILY',
    
    grain: 'One row per customer per product type',
    primaryKey: ['holding_id', 'source_system'],
    
    schema: {
      holding_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      product_category: "STRING COMMENT 'Deposits|Loans|Cards|Investments|Insurance'",
      product_type: "STRING COMMENT 'Checking|Savings|Credit Card|Personal Loan|etc.'",
      product_code: "STRING",
      
      number_of_products: "INTEGER COMMENT 'Count of this product type'",
      total_balance: "DECIMAL(18,2)",
      total_limit: "DECIMAL(18,2)",
      
      first_product_open_date: "DATE",
      most_recent_product_open_date: "DATE",
      
      active_products: "INTEGER",
      closed_products: "INTEGER",
      dormant_products: "INTEGER",
      
      total_monthly_fee: "DECIMAL(18,2)",
      total_annual_fee: "DECIMAL(18,2)",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 14: Customer Household
  {
    name: 'bronze.retail_customer_household',
    description: 'Household aggregation and family relationships',
    sourceSystem: 'MDM',
    sourceTable: 'Household_Master',
    loadType: 'DAILY',
    
    grain: 'One row per household',
    primaryKey: ['household_id', 'source_system'],
    
    schema: {
      household_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      household_name: "STRING COMMENT 'Primary member last name + Household'",
      household_type: "STRING COMMENT 'Single|Couple|Family|Multi-generational|Roommates'",
      
      primary_customer_id: "BIGINT COMMENT 'Head of household'",
      
      total_household_members: "INTEGER",
      adult_members: "INTEGER",
      minor_members: "INTEGER",
      senior_members: "INTEGER",
      
      household_formation_date: "DATE",
      household_dissolution_date: "DATE",
      household_status: "STRING COMMENT 'Active|Inactive|Dissolved'",
      
      household_address_line1: "STRING",
      household_city: "STRING",
      household_state: "STRING",
      household_postal_code: "STRING",
      
      estimated_household_income: "DECIMAL(18,2)",
      estimated_household_net_worth: "DECIMAL(18,2)",
      
      household_segment: "STRING COMMENT 'Mass|Mass Affluent|Affluent|High Net Worth'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 15: Customer Risk Ratings
  {
    name: 'bronze.retail_customer_risk_ratings',
    description: 'Customer risk assessments for AML, fraud, credit',
    sourceSystem: 'RISK_ENGINE',
    sourceTable: 'Customer_Risk_Scores',
    loadType: 'DAILY',
    
    grain: 'One row per customer per risk type per date',
    primaryKey: ['risk_rating_id', 'source_system'],
    
    schema: {
      risk_rating_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      risk_type: "STRING COMMENT 'AML|Fraud|Credit|Operational|Reputational'",
      risk_category: "STRING",
      
      risk_score: "INTEGER COMMENT 'Risk score (0-100)'",
      risk_rating: "STRING COMMENT 'Low|Medium|High|Critical'",
      risk_tier: "STRING COMMENT 'Tier 1|Tier 2|Tier 3|Tier 4'",
      
      assessment_date: "DATE",
      assessment_method: "STRING COMMENT 'Automated|Manual|Hybrid'",
      model_name: "STRING",
      model_version: "STRING",
      
      risk_factors: "STRING COMMENT 'JSON array of risk factors'",
      risk_indicators: "STRING COMMENT 'JSON array of indicators'",
      
      review_required: "BOOLEAN",
      review_frequency: "STRING COMMENT 'Daily|Weekly|Monthly|Quarterly|Annual'",
      next_review_date: "DATE",
      
      assigned_to: "STRING COMMENT 'Risk analyst assignment'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 16: Customer KYC Documents
  {
    name: 'bronze.retail_customer_kyc_documents',
    description: 'KYC/CDD documentation and verification records',
    sourceSystem: 'COMPLIANCE_SYSTEM',
    sourceTable: 'KYC_Documents',
    loadType: 'CDC',
    
    grain: 'One row per KYC document',
    primaryKey: ['document_id', 'source_system'],
    
    schema: {
      document_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      document_type: "STRING COMMENT 'ID|Proof of Address|Income Verification|Tax Form|CIP|CDD|EDD'",
      document_subtype: "STRING",
      
      document_status: "STRING COMMENT 'Pending|Approved|Rejected|Expired'",
      document_date: "DATE",
      document_expiration_date: "DATE",
      
      submitted_date: "DATE",
      reviewed_date: "DATE",
      approved_date: "DATE",
      
      reviewed_by: "STRING COMMENT 'Employee ID'",
      approved_by: "STRING",
      
      rejection_reason: "STRING",
      
      document_storage_path: "STRING COMMENT 'Secure document storage location'",
      document_hash: "STRING COMMENT 'Document integrity hash'",
      
      kyc_tier: "STRING COMMENT 'Standard|Enhanced|Simplified'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 17: Customer Alerts
  {
    name: 'bronze.retail_customer_alerts',
    description: 'System-generated alerts for customer issues, risks, opportunities',
    sourceSystem: 'ALERT_ENGINE',
    sourceTable: 'Customer_Alerts',
    loadType: 'CDC',
    
    grain: 'One row per alert',
    primaryKey: ['alert_id', 'source_system'],
    
    schema: {
      alert_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      
      alert_type: "STRING COMMENT 'Risk|Opportunity|Service|Compliance|Fraud|Churn'",
      alert_category: "STRING",
      alert_severity: "STRING COMMENT 'Critical|High|Medium|Low|Info'",
      
      alert_date: "DATE",
      alert_timestamp: "TIMESTAMP",
      
      alert_title: "STRING",
      alert_description: "STRING",
      alert_message: "STRING",
      
      alert_trigger: "STRING COMMENT 'Rule|Model|Manual|System'",
      alert_rule_id: "STRING",
      alert_model_name: "STRING",
      
      alert_status: "STRING COMMENT 'New|Open|In Progress|Resolved|Dismissed|Closed'",
      assigned_to: "STRING COMMENT 'Employee ID or team'",
      
      resolution_date: "DATE",
      resolution_notes: "STRING",
      
      alert_value: "DECIMAL(18,2) COMMENT 'Financial value if applicable'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 18: Customer Demographics Extended (Marketing)
  {
    name: 'bronze.retail_customer_demographics_ext',
    description: 'Extended demographic and psychographic data from third-party sources',
    sourceSystem: 'THIRD_PARTY_DATA',
    sourceTable: 'Customer_Demographics',
    loadType: 'MONTHLY',
    
    grain: 'One row per customer',
    primaryKey: ['customer_id', 'source_system', 'data_as_of_date'],
    
    schema: {
      customer_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      data_as_of_date: "DATE PRIMARY KEY",
      
      // Lifestyle
      lifestyle_segment: "STRING COMMENT 'Urban Professional|Suburban Family|Rural|Retiree|etc.'",
      lifestyle_interests: "STRING COMMENT 'Comma-separated interests'",
      
      // Wealth indicators
      estimated_net_worth: "DECIMAL(18,2)",
      estimated_home_value: "DECIMAL(18,2)",
      estimated_investable_assets: "DECIMAL(18,2)",
      
      home_ownership_status: "STRING COMMENT 'Own|Rent|Other'",
      property_type: "STRING COMMENT 'Single Family|Condo|Apartment|Mobile Home'",
      years_in_residence: "INTEGER",
      
      vehicle_count: "INTEGER",
      vehicle_year_newest: "INTEGER",
      estimated_vehicle_value: "DECIMAL(18,2)",
      
      // Technology adoption
      technology_adoption_score: "INTEGER COMMENT '0-100'",
      smartphone_user: "BOOLEAN",
      tablet_user: "BOOLEAN",
      smart_home_user: "BOOLEAN",
      
      online_shopper: "BOOLEAN",
      social_media_user: "BOOLEAN",
      social_media_platforms: "STRING COMMENT 'Comma-separated platforms'",
      
      // Purchase behaviors
      purchase_propensity_score: "INTEGER COMMENT '0-100'",
      average_purchase_frequency: "STRING COMMENT 'Daily|Weekly|Monthly'",
      preferred_shopping_channel: "STRING COMMENT 'Online|In-Store|Hybrid'",
      
      // Media consumption
      media_consumption_tv: "BOOLEAN",
      media_consumption_streaming: "BOOLEAN",
      media_consumption_podcast: "BOOLEAN",
      media_consumption_print: "BOOLEAN",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
];

export const customerRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for retail customer domain',
  layer: 'BRONZE',
  tables: customerRetailBronzeTables,
  totalTables: 18,
  estimatedSize: '500GB',
  refreshFrequency: 'Real-time CDC + Daily batch',
  retention: '7 years',
};
