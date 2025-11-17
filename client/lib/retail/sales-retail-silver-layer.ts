import type { Table } from '../schema-types';

/**
 * SALES-RETAIL DOMAIN - SILVER LAYER
 * 
 * Conformed, cleansed, and deduplicated sales data
 * Implements Master Data Management (MDM) and Slowly Changing Dimensions (SCD Type 2)
 * 
 * Data Quality Standards:
 * - Completeness: 95%+
 * - Accuracy: 99%+
 * - Timeliness: Real-time for opportunities, daily for other tables
 */

export const salesRetailSilverTables: Table[] = [
  // Table 1: Opportunity Golden Record (SCD Type 2)
  {
    name: 'silver.retail_sales_opportunity_golden',
    description: 'Golden record for sales opportunities with MDM and SCD Type 2 history',
    grain: 'One row per opportunity per effective date',
    scdType: 'Type 2',
    primaryKey: ['opportunity_sk'],
    naturalKey: ['opportunity_id'],
    sourceTables: ['bronze.retail_sales_opportunities'],
    
    schema: {
      // SURROGATE KEY
      opportunity_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Surrogate key'",
      
      // NATURAL KEY
      opportunity_id: "BIGINT COMMENT 'SFDC Opportunity ID'",
      opportunity_number: "STRING COMMENT 'Human-readable opportunity number'",
      
      // OPPORTUNITY DETAILS
      opportunity_name: "STRING",
      
      account_id: "BIGINT",
      account_name: "STRING",
      
      lead_id: "BIGINT",
      lead_source: "STRING",
      
      // OWNERSHIP (current)
      owner_id: "BIGINT",
      owner_name: "STRING",
      owner_email: "STRING",
      sales_team: "STRING",
      sales_territory_id: "BIGINT",
      sales_territory_name: "STRING",
      
      // STAGE & STATUS
      stage: "STRING",
      stage_rank: "INTEGER COMMENT 'Numeric rank of stage for ordering (1=Prospecting, 8=Closed Won)'",
      
      is_won: "BOOLEAN",
      is_lost: "BOOLEAN",
      is_closed: "BOOLEAN",
      is_active: "BOOLEAN COMMENT 'Opportunity is in active pipeline (not closed)'",
      
      forecast_category: "STRING",
      
      // AMOUNTS
      amount: "DECIMAL(18,2)",
      expected_revenue: "DECIMAL(18,2)",
      probability: "DECIMAL(5,2)",
      
      // PRODUCT
      product_type: "STRING",
      product_category: "STRING",
      product_subcategory: "STRING",
      product_count: "INTEGER",
      
      // DATES
      created_date: "DATE",
      close_date: "DATE",
      actual_close_date: "DATE",
      last_stage_change_date: "DATE",
      last_activity_date: "DATE",
      
      // SALES CYCLE
      age_in_days: "INTEGER",
      days_in_current_stage: "INTEGER",
      days_to_close: "INTEGER COMMENT 'Days from created to close (if closed)'",
      
      // TYPE & ATTRIBUTES
      opportunity_type: "STRING COMMENT 'New Customer|Cross-Sell|Upsell|Renewal'",
      channel: "STRING",
      
      is_new_customer: "BOOLEAN",
      existing_product_count: "INTEGER",
      
      // CAMPAIGN
      campaign_id: "BIGINT",
      campaign_name: "STRING",
      
      // COMPETITIVE
      competitors: "STRING",
      competitive_threat_level: "STRING",
      loss_reason: "STRING",
      loss_reason_category: "STRING",
      win_reason: "STRING",
      
      // CONVERSION
      conversion_date: "DATE",
      conversion_account_id: "BIGINT",
      
      // CUSTOMER ATTRIBUTES
      customer_type: "STRING",
      customer_segment: "STRING",
      customer_age_range: "STRING",
      customer_income_range: "STRING",
      
      // APPROVALS
      approval_required: "BOOLEAN",
      approval_status: "STRING",
      approved_by: "STRING",
      approval_date: "DATE",
      
      credit_check_status: "STRING",
      credit_score: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2) COMMENT 'DQ score 0-100'",
      completeness_pct: "DECIMAL(5,2) COMMENT 'Field completeness %'",
      
      missing_fields: "STRING COMMENT 'JSON array of missing critical fields'",
      data_quality_issues: "STRING COMMENT 'JSON array of DQ issues'",
      
      // SCD TYPE 2 FIELDS
      effective_date: "DATE COMMENT 'Effective start date for this version'",
      expiration_date: "DATE DEFAULT '9999-12-31' COMMENT 'Effective end date'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'Current version flag'",
      
      // AUDIT
      source_system: "STRING",
      source_record_id: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      record_hash: "STRING COMMENT 'Hash for change detection'",
    },
  },

  // Table 2: Lead Golden Record (SCD Type 2)
  {
    name: 'silver.retail_sales_lead_golden',
    description: 'Golden record for sales leads with deduplication and MDM',
    grain: 'One row per lead per effective date',
    scdType: 'Type 2',
    primaryKey: ['lead_sk'],
    naturalKey: ['lead_id'],
    sourceTables: ['bronze.retail_sales_leads'],
    
    schema: {
      // SURROGATE KEY
      lead_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // NATURAL KEY
      lead_id: "BIGINT",
      lead_number: "STRING",
      
      // CONTACT INFO (deduplicated)
      full_name: "STRING",
      email: "STRING COMMENT 'Standardized email (lowercase)'",
      phone: "STRING COMMENT 'Standardized phone (digits only)'",
      mobile_phone: "STRING",
      
      // ADDRESS (standardized)
      street: "STRING",
      city: "STRING",
      state: "STRING COMMENT 'Standardized state code'",
      zip: "STRING COMMENT 'Standardized 5-digit ZIP'",
      zip_plus_4: "STRING COMMENT 'Full ZIP+4 if available'",
      country: "STRING DEFAULT 'USA'",
      
      // DEDUPLICATION
      master_lead_id: "BIGINT COMMENT 'Master lead ID if this is a duplicate'",
      is_duplicate: "BOOLEAN COMMENT 'Lead is a duplicate'",
      duplicate_reason: "STRING COMMENT 'Reason flagged as duplicate (email match, phone match, etc.)'",
      duplicate_confidence: "DECIMAL(5,2) COMMENT 'Duplicate matching confidence %'",
      
      // LEAD SOURCE
      lead_source: "STRING",
      lead_source_detail: "STRING",
      campaign_id: "BIGINT",
      campaign_name: "STRING",
      
      utm_source: "STRING",
      utm_medium: "STRING",
      utm_campaign: "STRING",
      
      referral_customer_id: "BIGINT",
      referral_name: "STRING",
      
      // OWNERSHIP
      owner_id: "BIGINT",
      owner_name: "STRING",
      owner_email: "STRING",
      sales_team: "STRING",
      sales_territory_id: "BIGINT",
      
      // STATUS
      status: "STRING",
      status_reason: "STRING",
      
      is_converted: "BOOLEAN",
      is_qualified: "BOOLEAN",
      is_unqualified: "BOOLEAN",
      unqualified_reason: "STRING",
      
      // LEAD SCORING (enriched)
      lead_score: "INTEGER COMMENT 'Composite lead score 0-100'",
      lead_grade: "STRING COMMENT 'A|B|C|D|F'",
      
      engagement_score: "INTEGER",
      fit_score: "INTEGER",
      lead_temperature: "STRING COMMENT 'Hot|Warm|Cold'",
      
      // PRODUCT INTEREST
      product_interest: "STRING",
      product_interest_detail: "STRING",
      
      // QUALIFICATION
      budget_range: "STRING",
      timeline: "STRING",
      bant_qualified: "BOOLEAN",
      
      // DEMOGRAPHICS
      age_range: "STRING",
      income_range: "STRING",
      employment_status: "STRING",
      
      // DATES
      created_date: "DATE",
      last_activity_date: "DATE",
      last_contacted_date: "DATE",
      qualified_date: "DATE",
      converted_date: "DATE",
      
      // CONVERSION
      converted_account_id: "BIGINT",
      converted_contact_id: "BIGINT",
      converted_opportunity_id: "BIGINT",
      
      days_to_conversion: "INTEGER COMMENT 'Days from created to converted'",
      
      // ENGAGEMENT METRICS
      email_opens: "INTEGER",
      email_clicks: "INTEGER",
      web_visits: "INTEGER",
      form_submissions: "INTEGER",
      content_downloads: "INTEGER",
      
      total_engagement_actions: "INTEGER COMMENT 'Sum of all engagement metrics'",
      
      last_engagement_date: "DATE COMMENT 'Most recent engagement date'",
      days_since_last_engagement: "INTEGER",
      
      // ASSIGNMENT
      assignment_date: "DATE",
      assignment_method: "STRING",
      days_since_assignment: "INTEGER",
      
      // NURTURE
      nurture_status: "STRING",
      nurture_campaign_id: "BIGINT",
      nurture_stage: "STRING",
      
      // CONSENT
      email_opt_in: "BOOLEAN",
      sms_opt_in: "BOOLEAN",
      do_not_call: "BOOLEAN",
      do_not_email: "BOOLEAN",
      gdpr_consent: "BOOLEAN",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      email_valid: "BOOLEAN COMMENT 'Email passed validation'",
      phone_valid: "BOOLEAN COMMENT 'Phone is valid US number'",
      address_valid: "BOOLEAN COMMENT 'Address validated via USPS'",
      
      // SCD TYPE 2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      // AUDIT
      source_system: "STRING",
      source_record_id: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      record_hash: "STRING",
    },
  },

  // Table 3: Sales Pipeline Daily Snapshot
  {
    name: 'silver.retail_sales_pipeline_snapshot',
    description: 'Daily snapshot of sales pipeline for historical trending and waterfall analysis',
    grain: 'One row per opportunity per snapshot date',
    scdType: 'Type 1',
    primaryKey: ['opportunity_id', 'snapshot_date'],
    naturalKey: ['opportunity_id', 'snapshot_date'],
    sourceTables: ['bronze.retail_sales_opportunities'],
    
    schema: {
      // COMPOSITE KEY
      opportunity_id: "BIGINT COMMENT 'FK to opportunity'",
      snapshot_date: "DATE COMMENT 'Business date of snapshot (typically end-of-day)'",
      
      // OPPORTUNITY ATTRIBUTES (at snapshot date)
      opportunity_name: "STRING",
      account_id: "BIGINT",
      account_name: "STRING",
      
      owner_id: "BIGINT",
      owner_name: "STRING",
      sales_team: "STRING",
      sales_territory_id: "BIGINT",
      
      // STAGE
      stage: "STRING",
      stage_rank: "INTEGER",
      
      is_won: "BOOLEAN",
      is_lost: "BOOLEAN",
      is_closed: "BOOLEAN",
      
      forecast_category: "STRING",
      
      // AMOUNTS (at snapshot date)
      amount: "DECIMAL(18,2)",
      expected_revenue: "DECIMAL(18,2)",
      probability: "DECIMAL(5,2)",
      
      // PRODUCT
      product_type: "STRING",
      product_category: "STRING",
      
      // KEY DATES
      created_date: "DATE",
      close_date: "DATE COMMENT 'Expected close date at snapshot'",
      actual_close_date: "DATE COMMENT 'Actual close date if closed'",
      
      // AGE & VELOCITY
      age_in_days: "INTEGER COMMENT 'Age at snapshot date'",
      days_in_current_stage: "INTEGER COMMENT 'Days in current stage at snapshot'",
      
      // PRIOR DAY COMPARISON
      prior_snapshot_stage: "STRING COMMENT 'Stage from prior snapshot'",
      stage_changed_flag: "BOOLEAN COMMENT 'Stage changed since prior snapshot'",
      stage_change_direction: "STRING COMMENT 'Forward|Backward|Closed Won|Closed Lost|No Change'",
      
      prior_snapshot_amount: "DECIMAL(18,2) COMMENT 'Amount from prior snapshot'",
      amount_changed_flag: "BOOLEAN",
      amount_change: "DECIMAL(18,2) COMMENT 'Change in amount since prior snapshot'",
      
      prior_snapshot_close_date: "DATE",
      close_date_changed_flag: "BOOLEAN",
      close_date_shift_days: "INTEGER COMMENT 'Days close date was pushed out (positive) or pulled in (negative)'",
      
      // WEEKLY/MONTHLY COHORTS
      created_week: "DATE COMMENT 'Monday of week opportunity was created'",
      created_month: "DATE COMMENT 'First day of month opportunity was created'",
      created_quarter: "STRING COMMENT 'Fiscal quarter (e.g., FY24 Q2)'",
      
      snapshot_week: "DATE COMMENT 'Monday of snapshot week'",
      snapshot_month: "DATE COMMENT 'First day of snapshot month'",
      snapshot_quarter: "STRING COMMENT 'Fiscal quarter of snapshot'",
      
      // ACTIVITY
      last_activity_date: "DATE",
      days_since_last_activity: "INTEGER COMMENT 'Days since last activity at snapshot'",
      
      is_stale: "BOOLEAN COMMENT 'No activity in last 30 days'",
      
      // OWNERSHIP CHANGES
      prior_snapshot_owner_id: "BIGINT",
      owner_changed_flag: "BOOLEAN COMMENT 'Owner changed since prior snapshot'",
      
      // FLAGS FOR PIPELINE ANALYSIS
      is_new_this_period: "BOOLEAN COMMENT 'Opportunity created between prior snapshot and this snapshot'",
      is_closed_this_period: "BOOLEAN COMMENT 'Opportunity closed between snapshots'",
      is_won_this_period: "BOOLEAN COMMENT 'Opportunity won between snapshots'",
      is_lost_this_period: "BOOLEAN COMMENT 'Opportunity lost between snapshots'",
      
      // WATERFALL CATEGORIZATION
      waterfall_category: "STRING COMMENT 'Opening Pipeline|New|Closed Won|Closed Lost|Slipped|Pulled In|Increased|Decreased|Closing Pipeline'",
      
      // AUDIT
      snapshot_timestamp: "TIMESTAMP COMMENT 'Exact timestamp of snapshot'",
      created_timestamp: "TIMESTAMP",
    },
  },

  // Table 4: Sales Activities Enriched
  {
    name: 'silver.retail_sales_activities_enriched',
    description: 'Sales activities enriched with opportunity/lead/account context for attribution',
    grain: 'One row per sales activity',
    scdType: 'Type 1',
    primaryKey: ['activity_id'],
    naturalKey: ['activity_id'],
    sourceTables: [
      'bronze.retail_sales_activities',
      'bronze.retail_sales_opportunities',
      'bronze.retail_sales_leads',
    ],
    
    schema: {
      // PRIMARY KEY
      activity_id: "BIGINT PRIMARY KEY",
      
      // ACTIVITY DETAILS
      activity_type: "STRING",
      activity_subtype: "STRING",
      object_type: "STRING COMMENT 'Task|Event'",
      
      subject: "STRING",
      description: "STRING",
      
      // RELATED RECORDS (with enrichment)
      opportunity_id: "BIGINT",
      opportunity_name: "STRING COMMENT 'Denormalized from opportunity'",
      opportunity_stage: "STRING COMMENT 'Opportunity stage at time of activity'",
      opportunity_amount: "DECIMAL(18,2) COMMENT 'Opportunity amount at time of activity'",
      
      lead_id: "BIGINT",
      lead_status: "STRING COMMENT 'Lead status at time of activity'",
      lead_score: "INTEGER COMMENT 'Lead score at time of activity'",
      
      account_id: "BIGINT",
      account_name: "STRING",
      
      contact_id: "BIGINT",
      contact_name: "STRING",
      
      // ACTIVITY OWNER
      owner_id: "BIGINT",
      owner_name: "STRING",
      sales_team: "STRING",
      sales_territory_id: "BIGINT",
      
      // STATUS
      status: "STRING",
      is_completed: "BOOLEAN",
      is_cancelled: "BOOLEAN",
      priority: "STRING",
      
      // DATES
      activity_date: "DATE",
      activity_timestamp: "TIMESTAMP",
      due_date: "DATE",
      completed_date: "DATE",
      completed_timestamp: "TIMESTAMP",
      
      // DURATION
      duration_minutes: "INTEGER",
      
      // OUTCOME
      outcome: "STRING",
      outcome_category: "STRING COMMENT 'Positive|Neutral|Negative'",
      
      resulted_in_opportunity: "BOOLEAN",
      resulted_in_meeting: "BOOLEAN",
      
      // CALL SPECIFICS
      call_direction: "STRING",
      call_duration_seconds: "INTEGER",
      call_disposition: "STRING",
      
      // EMAIL SPECIFICS
      email_sent: "BOOLEAN",
      email_opened: "BOOLEAN",
      email_clicked: "BOOLEAN",
      email_replied: "BOOLEAN",
      
      // MEETING SPECIFICS
      meeting_attendee_count: "INTEGER",
      meeting_type: "STRING",
      
      // ATTRIBUTION
      first_activity_flag: "BOOLEAN COMMENT 'First activity on this opportunity/lead'",
      last_activity_before_close_flag: "BOOLEAN COMMENT 'Last activity before opportunity closed'",
      
      days_since_prior_activity: "INTEGER COMMENT 'Days since previous activity on this opp/lead'",
      days_until_next_activity: "INTEGER COMMENT 'Days until next activity'",
      
      // CAMPAIGN
      campaign_id: "BIGINT",
      campaign_name: "STRING",
      
      // TIME-BASED ATTRIBUTES
      activity_hour: "INTEGER COMMENT 'Hour of day (0-23)'",
      activity_day_of_week: "STRING COMMENT 'Monday, Tuesday, etc.'",
      activity_week: "DATE COMMENT 'Monday of week'",
      activity_month: "DATE COMMENT 'First day of month'",
      activity_quarter: "STRING COMMENT 'Fiscal quarter'",
      
      is_business_hours: "BOOLEAN COMMENT 'Activity during business hours (8am-6pm)'",
      is_weekend: "BOOLEAN",
      
      // DATA QUALITY
      has_description: "BOOLEAN COMMENT 'Description field is not null'",
      has_outcome: "BOOLEAN COMMENT 'Outcome field is not null'",
      
      // AUDIT
      source_system: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 5: Commission Reconciled
  {
    name: 'silver.retail_sales_commission_reconciled',
    description: 'Commission calculations reconciled with payroll and validated',
    grain: 'One row per commission transaction',
    scdType: 'Type 1',
    primaryKey: ['commission_id'],
    naturalKey: ['commission_id'],
    sourceTables: [
      'bronze.retail_sales_commissions',
      'bronze.retail_sales_opportunities',
      'bronze.retail_sales_reps',
    ],
    
    schema: {
      // PRIMARY KEY
      commission_id: "BIGINT PRIMARY KEY",
      
      // SALES REP (enriched)
      sales_rep_id: "BIGINT",
      sales_rep_name: "STRING",
      employee_id: "BIGINT",
      
      sales_team: "STRING COMMENT 'Denormalized from sales rep'",
      sales_territory_id: "BIGINT",
      manager_id: "BIGINT COMMENT 'Sales rep manager'",
      
      // OPPORTUNITY (enriched)
      opportunity_id: "BIGINT",
      opportunity_name: "STRING",
      opportunity_close_date: "DATE COMMENT 'Opportunity close date'",
      
      account_id: "BIGINT",
      customer_name: "STRING",
      
      // COMMISSION TYPE
      commission_type: "STRING",
      commission_category: "STRING",
      
      // PRODUCT
      product_id: "BIGINT",
      product_name: "STRING",
      product_type: "STRING",
      product_category: "STRING COMMENT 'Deposits|Loans|Cards|etc.'",
      
      // AMOUNTS
      revenue_amount: "DECIMAL(18,2)",
      commission_rate: "DECIMAL(5,2)",
      commission_amount: "DECIMAL(18,2)",
      
      bonus_amount: "DECIMAL(18,2)",
      total_commission: "DECIMAL(18,2) COMMENT 'Commission + Bonus'",
      
      // SPLIT/OVERRIDE
      is_split_commission: "BOOLEAN",
      split_percentage: "DECIMAL(5,2)",
      
      is_override: "BOOLEAN",
      override_level: "INTEGER",
      
      // PERIOD
      commission_period: "STRING COMMENT 'YYYY-MM'",
      commission_period_start_date: "DATE",
      commission_period_end_date: "DATE",
      
      fiscal_quarter: "STRING",
      fiscal_year: "INTEGER",
      
      // STATUS
      commission_status: "STRING",
      
      is_paid: "BOOLEAN",
      payment_date: "DATE",
      payment_method: "STRING",
      
      is_reversed: "BOOLEAN",
      reversal_reason: "STRING",
      reversal_date: "DATE",
      
      // CLAWBACK
      is_clawback: "BOOLEAN",
      clawback_period_months: "INTEGER",
      clawback_expiry_date: "DATE",
      clawback_at_risk: "BOOLEAN COMMENT 'Within clawback window and at risk'",
      
      // APPROVAL
      approved_by: "STRING",
      approval_date: "DATE",
      
      // QUOTA ATTAINMENT (at time of commission)
      quota_attainment_pct: "DECIMAL(5,2)",
      quota_tier: "STRING COMMENT 'Quota tier (0-50%|50-75%|75-100%|100%+)'",
      
      // ACCELERATORS
      accelerator_applied: "BOOLEAN",
      accelerator_rate: "DECIMAL(5,2)",
      
      // TAX
      tax_withheld: "DECIMAL(18,2)",
      net_commission: "DECIMAL(18,2) COMMENT 'Total commission - tax'",
      
      // RECONCILIATION
      reconciliation_status: "STRING COMMENT 'Reconciled|Unreconciled|Exception'",
      reconciliation_date: "DATE COMMENT 'Date reconciled with payroll'",
      
      payroll_batch_id: "STRING COMMENT 'Payroll batch identifier'",
      
      variance_amount: "DECIMAL(18,2) COMMENT 'Variance between calculated and paid (if any)'",
      variance_reason: "STRING",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      validation_errors: "STRING COMMENT 'JSON array of validation errors'",
      
      // AUDIT
      calculation_timestamp: "TIMESTAMP",
      calculated_by: "STRING",
      
      source_system: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
];

export const salesRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail sales domain with MDM and data quality',
  layer: 'SILVER',
  tables: salesRetailSilverTables,
  totalTables: 5,
  estimatedSize: '60GB',
  
  dataQualityTargets: {
    completeness: '95%+',
    accuracy: '99%+',
    consistency: '98%+',
    timeliness: '99%+ (SLA for opportunity updates: < 5 minutes)',
  },
  
  masterDataManagement: {
    opportunities: 'SCD Type 2 with stage change history',
    leads: 'SCD Type 2 with deduplication via email/phone matching',
    salesReps: 'Dimension from bronze with minimal changes',
  },
  
  keyTransformations: [
    'Opportunity deduplication and golden record creation',
    'Lead deduplication and email/phone standardization',
    'Daily pipeline snapshots for historical trending',
    'Activity enrichment with opportunity/lead context',
    'Commission reconciliation with payroll',
    'Stage change detection and velocity calculations',
    'Data quality scoring and validation',
  ],
  
  businessRules: [
    'Stage Rank: Prospecting=1, Qualification=2, Needs Analysis=3, Value Proposition=4, Proposal=5, Negotiation=6, Closed Won=7, Closed Lost=8',
    'Lead deduplication: Match on email (exact) or phone (last 10 digits)',
    'Opportunity SCD: Trigger new version on stage change, amount change >10%, or owner change',
    'Pipeline snapshot: Daily at 11:59 PM ET',
    'Commission eligibility: Opportunity must be Closed Won and account opened',
    'Clawback at risk: Account closed within clawback period',
  ],
};
