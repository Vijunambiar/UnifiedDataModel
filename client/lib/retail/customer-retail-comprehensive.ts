/**
 * CUSTOMER-RETAIL DOMAIN - Comprehensive Data Model
 *
 * Domain: Customer Retail
 * Area: Retail Banking
 * Version: 1.0
 * Last Updated: 2025-01-08
 * Status: PRODUCTION
 * Grade Target: A (95-100% completeness)
 *
 * Purpose: Comprehensive retail customer domain covering individual consumers,
 * households, demographics, financial profiles, preferences, and lifecycle management.
 *
 * Scope:
 * - Customer master data (demographics, contact, identification)
 * - Household relationships and aggregation
 * - Customer lifecycle events and segmentation
 * - Financial profile and credit scoring
 * - Preferences and consent management
 * - KYC/AML compliance data
 *
 * Regulatory Compliance:
 * - GLBA (Gramm-Leach-Bliley Act) - Privacy
 * - FCRA (Fair Credit Reporting Act) - Credit reporting
 * - CCPA (California Consumer Privacy Act) - Privacy
 * - GDPR (General Data Protection Regulation) - EU privacy
 * - ECOA (Equal Credit Opportunity Act) - Fair lending
 * - BSA/AML - Anti-money laundering
 * - OFAC - Sanctions screening
 */

import type { BankingDomain } from '../enterprise-domains';
import { customerRetailBronzeLayerComplete } from './customer-retail-bronze-layer';
import { customerRetailSilverLayerComplete } from './customer-retail-silver-layer';
import { customerRetailGoldLayerComplete } from './customer-retail-gold-layer';
import { customerRetailLogicalERD, customerRetailPhysicalERD } from './customer-retail-erd';

// ============================================================================
// DOMAIN METADATA
// ============================================================================

export const customerRetailMetadata = {
  id: 'customer-retail',
  name: 'Customer Retail',
  area: 'retail',
  description: 'Comprehensive retail customer domain covering individual consumers, households, demographics, financial profiles, preferences, and lifecycle management across all retail banking touchpoints.',
  
  businessOwner: 'Retail Banking - Head of Customer Experience',
  technicalOwner: 'Data Architecture - Retail Domain Team',
  
  industryAlignment: {
    standardsBody: 'BIAN (Banking Industry Architecture Network)',
    domainMapping: 'Party Management / Customer Management',
    complianceStandards: ['GLBA', 'FCRA', 'CCPA', 'GDPR', 'ECOA', 'BSA/AML', 'OFAC'],
  },
  
  businessContext: {
    revenueImpact: 'Critical',
    customerSegments: ['Mass Market', 'Mass Affluent', 'Affluent', 'Student', 'Senior'],
    keyProcesses: [
      'Customer Onboarding',
      'KYC/CDD (Know Your Customer / Customer Due Diligence)',
      'Relationship Management',
      'Cross-Sell & Upsell',
      'Customer Retention',
      'Lifecycle Marketing',
    ],
    strategicImportance: 'Foundation domain for all retail banking operations',
  },
  
  dataArchitecture: {
    sourceSystems: [
      { name: 'FIS Core Banking', vendor: 'FIS', type: 'Core Banking' },
      { name: 'Temenos T24', vendor: 'Temenos', type: 'Core Banking' },
      { name: 'Salesforce CRM', vendor: 'Salesforce', type: 'CRM' },
      { name: 'Adobe Marketing Cloud', vendor: 'Adobe', type: 'Marketing Automation' },
      { name: 'Equifax', vendor: 'Equifax', type: 'Credit Bureau' },
      { name: 'Experian', vendor: 'Experian', type: 'Credit Bureau' },
      { name: 'TransUnion', vendor: 'TransUnion', type: 'Credit Bureau' },
      { name: 'LexisNexis', vendor: 'LexisNexis', type: 'Identity Verification' },
    ],
    refreshFrequency: 'Real-time CDC for transactional data + Daily batch for aggregations',
    dataVolume: {
      rowCount: '50M customers',
      storageSize: '500GB bronze, 200GB silver, 100GB gold',
      growthRate: '15% annually',
    },
    dataLineage: 'Core Banking → Bronze → Silver (MDM) → Gold (Analytics)',
  },
  
  regulatoryRequirements: [
    {
      regulation: 'GLBA',
      requirement: 'Customer privacy and data security, annual privacy notices',
      dataElements: ['ssn', 'account_numbers', 'financial_info', 'personal_info'],
      retentionPeriod: '7 years post relationship closure',
    },
    {
      regulation: 'FCRA',
      requirement: 'Accurate credit reporting, adverse action notices',
      dataElements: ['credit_scores', 'credit_history', 'adverse_actions'],
      retentionPeriod: '7 years',
    },
    {
      regulation: 'CCPA',
      requirement: 'Consumer data rights (access, delete, opt-out)',
      dataElements: ['personal_info', 'browsing_data', 'marketing_data'],
      retentionPeriod: 'As long as necessary for business purposes',
    },
    {
      regulation: 'BSA/AML',
      requirement: 'Customer identification program, suspicious activity monitoring',
      dataElements: ['identification_docs', 'beneficial_owners', 'transaction_patterns'],
      retentionPeriod: '5 years post account closure',
    },
  ],
  
  keyMetrics: {
    totalMetrics: 500,
    categories: [
      'Acquisition Metrics',
      'Retention Metrics',
      'Engagement Metrics',
      'Profitability Metrics',
      'Risk Metrics',
      'Satisfaction Metrics',
      'Lifecycle Metrics',
      'Segmentation Metrics',
    ],
  },
  
  version: '1.0',
  lastUpdated: '2025-01-08',
  status: 'PRODUCTION',
};

// ============================================================================
// BRONZE LAYER (RAW DATA) - Import from dedicated file
// ============================================================================

// Use complete bronze layer from separate file (18 tables)
export const customerRetailBronzeLayer = customerRetailBronzeLayerComplete;

// Original partial definition kept for reference (DEPRECATED - use import above)
const customerRetailBronzeLayerPartial = {
  description: 'Raw retail customer data from source systems with minimal transformation',
  layer: 'BRONZE',
  sourceSystem: 'FIS_CORE',
  refreshFrequency: 'Real-time CDC',
  dataVolume: '50M rows, 500GB',
  retention: '7 years (regulatory requirement)',

  tables: [
    // Table 1: Customer Master (SAMPLE ONLY - full definition in customer-retail-bronze-layer.ts)
    {
      name: 'bronze.retail_customer_master',
      description: 'Core customer demographic and identification data from core banking system',
      sourceSystem: 'FIS_CORE',
      sourceTable: 'CUSTOMER_MASTER',
      loadType: 'CDC',

      grain: 'One row per customer per source system',
      primaryKey: ['customer_id', 'source_system'],

      partitioning: {
        type: 'HASH',
        column: 'customer_id',
        buckets: 100,
      },

      clusteringKeys: ['customer_since_date'],

      estimatedRows: 50000000,
      avgRowSize: 4096,
      estimatedSize: '200GB',

      schema: {
        // PRIMARY KEYS
        customer_id: "BIGINT PRIMARY KEY COMMENT 'Unique customer identifier from core banking'",
        source_system: "STRING PRIMARY KEY COMMENT 'Source system name (FIS_CORE, TEMENOS_T24)'",
        
        // NATURAL KEYS
        ssn_encrypted: "STRING COMMENT 'Encrypted SSN (AES-256)'",
        ssn_hash: "STRING COMMENT 'Hashed SSN for matching (SHA-256)'",
        tax_id: "STRING COMMENT 'Tax identification number'",
        customer_uuid: "STRING COMMENT 'Global UUID (RFC 4122 v4)'",
        legacy_customer_number: "STRING COMMENT 'Previous system customer number'",
        
        // DEMOGRAPHICS
        first_name: "STRING COMMENT 'Legal first name'",
        middle_name: "STRING COMMENT 'Middle name or initial'",
        last_name: "STRING COMMENT 'Legal last name'",
        suffix: "STRING COMMENT 'Name suffix (Jr, Sr, III, etc.)'",
        full_name: "STRING COMMENT 'Full legal name'",
        preferred_name: "STRING COMMENT 'Preferred/nickname'",
        
        date_of_birth: "DATE COMMENT 'Date of birth'",
        age: "INTEGER COMMENT 'Current age in years'",
        age_group: "STRING COMMENT '<18|18-24|25-34|35-44|45-54|55-64|65+'",
        
        gender: "STRING COMMENT 'M (Male) | F (Female) | X (Non-binary) | U (Unknown)'",
        marital_status: "STRING COMMENT 'S (Single) | M (Married) | D (Divorced) | W (Widowed) | P (Domestic Partner)'",
        
        citizenship_status: "STRING COMMENT 'US Citizen|Permanent Resident|Non-Resident Alien'",
        country_of_birth: "STRING COMMENT 'ISO 3166-1 alpha-2 country code'",
        nationality: "STRING COMMENT 'Primary nationality'",
        
        // CONTACT INFORMATION
        email_primary: "STRING COMMENT 'Primary email address'",
        email_secondary: "STRING COMMENT 'Secondary email address'",
        email_work: "STRING COMMENT 'Work email address'",
        email_verified: "BOOLEAN COMMENT 'Email verification status'",
        email_verification_date: "DATE COMMENT 'Date email was verified'",
        
        phone_mobile: "STRING COMMENT 'Mobile phone (E.164 format +1XXXXXXXXXX)'",
        phone_home: "STRING COMMENT 'Home phone'",
        phone_work: "STRING COMMENT 'Work phone'",
        phone_mobile_verified: "BOOLEAN COMMENT 'Mobile verification status'",
        phone_sms_capable: "BOOLEAN COMMENT 'SMS capability flag'",
        
        // ADDRESS (Current/Primary)
        address_line1: "STRING COMMENT 'Street address'",
        address_line2: "STRING COMMENT 'Apartment, suite, etc.'",
        address_line3: "STRING COMMENT 'Additional address info'",
        city: "STRING COMMENT 'City name'",
        county: "STRING COMMENT 'County name'",
        state: "STRING COMMENT 'State/province code (2-char)'",
        postal_code: "STRING COMMENT 'ZIP/postal code'",
        postal_code_plus4: "STRING COMMENT 'ZIP+4 code'",
        country_code: "STRING COMMENT 'ISO 3166-1 alpha-2'",
        address_type: "STRING COMMENT 'Residential|Business|PO Box|Military'",
        address_verified: "BOOLEAN COMMENT 'USPS verification status'",
        address_standardized: "STRING COMMENT 'USPS standardized address'",
        latitude: "DECIMAL(10,6) COMMENT 'Geocoded latitude'",
        longitude: "DECIMAL(10,6) COMMENT 'Geocoded longitude'",
        
        // FINANCIAL PROFILE
        fico_score: "INTEGER COMMENT 'FICO credit score (300-850)'",
        fico_score_date: "DATE COMMENT 'Date of FICO score pull'",
        vantage_score: "INTEGER COMMENT 'VantageScore 3.0 (300-850)'",
        credit_bureau: "STRING COMMENT 'Equifax|Experian|TransUnion'",
        credit_score_tier: "STRING COMMENT 'Excellent (740+)|Good (670-739)|Fair (580-669)|Poor (<580)'",
        
        annual_income: "DECIMAL(18,2) COMMENT 'Self-reported annual income (USD)'",
        annual_income_verified: "BOOLEAN COMMENT 'Income verification status'",
        annual_income_verification_date: "DATE",
        household_income: "DECIMAL(18,2) COMMENT 'Total household income'",
        
        employment_status: "STRING COMMENT 'Employed|Self-Employed|Unemployed|Retired|Student|Homemaker'",
        employer_name: "STRING COMMENT 'Current employer'",
        employer_ein: "STRING COMMENT 'Employer EIN'",
        occupation: "STRING COMMENT 'Job title/occupation'",
        occupation_code: "STRING COMMENT 'SOC (Standard Occupational Classification) code'",
        years_at_employer: "DECIMAL(5,2) COMMENT 'Years at current employer'",
        
        // EDUCATION
        education_level: "STRING COMMENT 'High School|Some College|Associates|Bachelors|Masters|Doctorate'",
        
        // CUSTOMER LIFECYCLE
        customer_since_date: "DATE COMMENT 'First account open date (customer inception)'",
        customer_status: "STRING COMMENT 'Active|Inactive|Dormant|Closed|Deceased'",
        customer_status_date: "DATE COMMENT 'Date of current status'",
        customer_status_reason: "STRING COMMENT 'Reason for status change'",
        
        customer_type: "STRING COMMENT 'Individual|Joint|Minor (UTMA)|Trust|Estate'",
        customer_subtype: "STRING COMMENT 'Primary|Secondary|Authorized Signer|Beneficiary'",
        
        customer_segment: "STRING COMMENT 'Mass|Mass Affluent|Affluent|Private|Student|Senior'",
        customer_tier: "STRING COMMENT 'Bronze|Silver|Gold|Platinum|Diamond'",
        lifecycle_stage: "STRING COMMENT 'Prospect|New|Growing|Mature|Declining|Attrition'",
        
        primary_branch_id: "BIGINT COMMENT 'FK to primary branch'",
        assigned_banker_id: "BIGINT COMMENT 'FK to relationship banker'",
        
        // HOUSEHOLD
        household_id: "BIGINT COMMENT 'FK to household dimension'",
        household_role: "STRING COMMENT 'Head of Household|Spouse|Dependent|Other'",
        number_of_dependents: "INTEGER COMMENT 'Count of dependents'",
        
        // RISK & COMPLIANCE
        kyc_status: "STRING COMMENT 'Not Started|In Progress|Completed|Expired|Failed'",
        kyc_completion_date: "DATE COMMENT 'Date KYC completed'",
        kyc_expiration_date: "DATE COMMENT 'Date KYC needs renewal'",
        kyc_risk_rating: "STRING COMMENT 'Low|Medium|High'",
        kyc_last_reviewed_date: "DATE",
        
        cip_status: "STRING COMMENT 'Customer Identification Program status'",
        cip_completion_date: "DATE",
        
        aml_risk_rating: "STRING COMMENT 'Low|Medium|High|Prohibited'",
        aml_risk_score: "INTEGER COMMENT 'AML risk score (0-100)'",
        aml_last_review_date: "DATE",
        
        ofac_check_date: "DATE COMMENT 'Last OFAC screening date'",
        ofac_check_status: "STRING COMMENT 'Clear|Match|Pending Investigation'",
        ofac_match_id: "STRING COMMENT 'OFAC match identifier if applicable'",
        
        sanctions_flag: "BOOLEAN COMMENT 'Sanctions list match flag'",
        pep_flag: "BOOLEAN COMMENT 'Politically Exposed Person flag'",
        pep_type: "STRING COMMENT 'Foreign PEP|Domestic PEP|International Organization|RCA (Relative/Close Associate)'",
        
        fraud_flag: "BOOLEAN COMMENT 'Known fraud indicator'",
        fraud_alert_date: "DATE COMMENT 'Date fraud alert placed'",
        
        // PREFERENCES & CONSENT
        paperless_flag: "BOOLEAN COMMENT 'Paperless statement preference'",
        paperless_enrollment_date: "DATE",
        
        marketing_opt_in: "BOOLEAN COMMENT 'General marketing consent'",
        marketing_opt_in_date: "DATE",
        email_opt_in: "BOOLEAN COMMENT 'Email marketing consent'",
        sms_opt_in: "BOOLEAN COMMENT 'SMS marketing consent'",
        phone_opt_in: "BOOLEAN COMMENT 'Phone marketing consent'",
        mail_opt_in: "BOOLEAN COMMENT 'Direct mail consent'",
        third_party_sharing_opt_in: "BOOLEAN COMMENT 'Third-party data sharing consent'",
        
        do_not_call_flag: "BOOLEAN COMMENT 'National Do Not Call Registry'",
        do_not_mail_flag: "BOOLEAN COMMENT 'Do not mail preference'",
        do_not_email_flag: "BOOLEAN COMMENT 'Do not email preference'",
        do_not_solicit_flag: "BOOLEAN COMMENT 'General do not solicit'",
        
        preferred_language: "STRING COMMENT 'ISO 639-1 language code (en, es, zh, etc.)'",
        preferred_contact_method: "STRING COMMENT 'Email|Phone|Mail|SMS|Mobile App'",
        preferred_contact_time: "STRING COMMENT 'Morning|Afternoon|Evening|Anytime'",
        
        accessibility_needs: "STRING COMMENT 'Vision impaired|Hearing impaired|Mobility|None'",
        communication_format_preference: "STRING COMMENT 'Large Print|Braille|Audio|Standard'",
        
        // DIGITAL PROFILE
        online_banking_enrolled: "BOOLEAN COMMENT 'Online banking enrollment status'",
        online_banking_enrollment_date: "DATE",
        online_banking_last_login: "TIMESTAMP",
        online_banking_login_count: "INTEGER COMMENT 'Lifetime login count'",
        
        mobile_banking_enrolled: "BOOLEAN COMMENT 'Mobile app enrollment status'",
        mobile_banking_enrollment_date: "DATE",
        mobile_banking_last_login: "TIMESTAMP",
        mobile_app_version: "STRING COMMENT 'Current mobile app version'",
        mobile_device_type: "STRING COMMENT 'iOS|Android|Other'",
        
        biometric_auth_enrolled: "BOOLEAN COMMENT 'Face ID / Touch ID enrollment'",
        two_factor_auth_enabled: "BOOLEAN COMMENT '2FA status'",
        
        // SOCIAL MEDIA
        social_media_linked: "BOOLEAN COMMENT 'Social media profile linked'",
        linkedin_profile: "STRING COMMENT 'LinkedIn profile URL'",
        facebook_profile: "STRING COMMENT 'Facebook profile ID'",
        
        // INTERESTS & LIFESTYLE (for targeting)
        homeowner_flag: "BOOLEAN COMMENT 'Homeowner status'",
        home_value_estimate: "DECIMAL(18,2) COMMENT 'Estimated home value'",
        vehicle_owner_flag: "BOOLEAN COMMENT 'Vehicle ownership'",
        small_business_owner_flag: "BOOLEAN COMMENT 'Small business ownership indicator'",
        
        interests: "STRING COMMENT 'Comma-separated interests (Travel, Sports, Technology, etc.)'",
        life_events: "STRING COMMENT 'Recent life events (Marriage, Birth, Home Purchase, etc.)'",
        
        // AUDIT TRAIL (REQUIRED FOR ALL BRONZE TABLES)
        source_record_id: "STRING COMMENT 'Original source system record ID'",
        source_file_name: "STRING COMMENT 'Source file/batch identifier'",
        load_timestamp: "TIMESTAMP COMMENT 'ETL load timestamp (UTC)'",
        cdc_operation: "STRING COMMENT 'INSERT|UPDATE|DELETE'",
        record_hash: "STRING COMMENT 'MD5 hash of entire record for change detection'",
        created_timestamp: "TIMESTAMP COMMENT 'Source system record creation time'",
        updated_timestamp: "TIMESTAMP COMMENT 'Source system last update time'",
      },
      
      columns: [
        {
          name: 'customer_id',
          isPrimaryKey: true,
          isForeignKey: false,
          isNullable: false,
          dataType: 'BIGINT',
          description: 'Unique customer identifier from core banking system',
          sampleValues: ['1001', '1002', '1003'],
          businessRules: ['Must be unique', 'Auto-generated sequence from core banking'],
          dataQualityRules: ['NOT NULL', 'UNIQUE', 'NUMERIC'],
          sourceColumn: 'CUST_ID',
          transformation: 'Direct mapping',
        },
        {
          name: 'ssn_encrypted',
          isPrimaryKey: false,
          isForeignKey: false,
          isNullable: true,
          dataType: 'STRING',
          description: 'Social Security Number encrypted with AES-256',
          sampleValues: ['encrypted_hash_1', 'encrypted_hash_2'],
          businessRules: ['Required for US citizens', 'Must be 9 digits', 'Encrypted at rest'],
          dataQualityRules: ['NOT NULL for US Citizens', 'ENCRYPTED'],
          sourceColumn: 'SSN',
          transformation: 'AES-256 encryption applied during ingestion',
        },
        // Additional column metadata would continue for all 100+ columns...
      ],
      
      indexes: [
        { name: 'idx_pk_retail_customer', type: 'CLUSTERED', columns: ['customer_id', 'source_system'], isUnique: true },
        { name: 'idx_ssn_hash', type: 'UNIQUE', columns: ['ssn_hash'], isUnique: true },
        { name: 'idx_email_primary', type: 'NONCLUSTERED', columns: ['email_primary'], isUnique: false },
        { name: 'idx_household', type: 'NONCLUSTERED', columns: ['household_id'], isUnique: false },
        { name: 'idx_since_date', type: 'NONCLUSTERED', columns: ['customer_since_date'], isUnique: false },
        { name: 'idx_status', type: 'NONCLUSTERED', columns: ['customer_status'], isUnique: false },
        { name: 'idx_segment', type: 'NONCLUSTERED', columns: ['customer_segment'], isUnique: false },
      ],
      
      constraints: [
        {
          type: 'PRIMARY KEY',
          columns: ['customer_id', 'source_system'],
          name: 'pk_retail_customer_master',
        },
        {
          type: 'CHECK',
          expression: 'fico_score IS NULL OR (fico_score BETWEEN 300 AND 850)',
          name: 'chk_fico_range',
          description: 'FICO score must be within valid range',
        },
        {
          type: 'CHECK',
          expression: 'age IS NULL OR age >= 0',
          name: 'chk_age_positive',
          description: 'Age must be non-negative',
        },
        {
          type: 'CHECK',
          expression: "gender IN ('M', 'F', 'X', 'U')",
          name: 'chk_valid_gender',
          description: 'Gender must be valid code',
        },
      ],
      
      relationships: [],
      
      dataQuality: {
        completenessTarget: 95,
        accuracyTarget: 99,
        validationRules: [
          {
            rule: 'Valid email format',
            expression: "email_primary IS NULL OR email_primary LIKE '%@%.%'",
            severity: 'WARNING',
          },
          {
            rule: 'Valid phone format',
            expression: "phone_mobile IS NULL OR phone_mobile LIKE '+1__________'",
            severity: 'WARNING',
          },
        ],
      },
    },
    
    // Additional bronze tables would follow...
    // For brevity showing structure - full implementation would include all 18-20 tables
    
  ],
  
  totalTables: 18,
  estimatedSize: '500GB',
};

// Re-export layers (Bronze already exported above)
export const customerRetailSilverLayer = customerRetailSilverLayerComplete;
export const customerRetailGoldLayer = customerRetailGoldLayerComplete;

// Re-export ERDs
export { customerRetailLogicalERD, customerRetailPhysicalERD };

// Export for domain registry
export const customerRetailDomain: Partial<BankingDomain> = {
  id: customerRetailMetadata.id,
  name: customerRetailMetadata.name,
  area: customerRetailMetadata.area as any,
  description: customerRetailMetadata.description,

  version: customerRetailMetadata.version,
  lastUpdated: customerRetailMetadata.lastUpdated,
  status: customerRetailMetadata.status as any,
};
