import type { Table } from '../schema-types';

/**
 * SALES-RETAIL DOMAIN - BRONZE LAYER
 * 
 * Raw data ingestion from Sales/CRM systems (Salesforce, HubSpot, etc.)
 * Captures opportunities, leads, sales activities, quotes, and commission tracking
 * 
 * Supports:
 * - SFDC Opportunity and Lead management
 * - Sales pipeline tracking
 * - Quota and commission calculations
 * - Customer referral programs
 * - Sales territory management
 */

export const salesRetailBronzeTables: Table[] = [
  // Table 1: Sales Opportunities (SFDC Integration)
  {
    name: 'bronze.retail_sales_opportunities',
    description: 'Salesforce opportunity records - sales pipeline and deal tracking',
    sourceSystem: 'SALESFORCE',
    sourceTable: 'Opportunity',
    loadType: 'CDC',
    
    grain: 'One row per sales opportunity',
    primaryKey: ['opportunity_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'created_date',
      ranges: ['Monthly partitions'],
    },
    
    estimatedRows: 5000000,
    avgRowSize: 2048,
    estimatedSize: '10GB',
    
    schema: {
      // PRIMARY KEYS
      opportunity_id: "BIGINT PRIMARY KEY COMMENT 'SFDC Opportunity ID'",
      source_system: "STRING PRIMARY KEY COMMENT 'CRM system identifier'",
      
      // SFDC STANDARD FIELDS
      opportunity_name: "STRING COMMENT 'Opportunity name/title'",
      opportunity_number: "STRING COMMENT 'Human-readable opportunity number'",
      
      account_id: "BIGINT COMMENT 'FK to SFDC Account (customer)'",
      account_name: "STRING COMMENT 'Account name for denormalization'",
      
      lead_id: "BIGINT COMMENT 'FK to Lead (if converted from lead)'",
      lead_source: "STRING COMMENT 'Original lead source'",
      
      // OPPORTUNITY OWNERSHIP
      owner_id: "BIGINT COMMENT 'FK to User/Sales Rep'",
      owner_name: "STRING COMMENT 'Sales rep full name'",
      owner_email: "STRING COMMENT 'Sales rep email'",
      
      sales_team: "STRING COMMENT 'Sales team name (Retail Banking, Small Business, etc.)'",
      sales_territory_id: "BIGINT COMMENT 'FK to Territory'",
      sales_territory_name: "STRING COMMENT 'Territory name'",
      
      // OPPORTUNITY STAGE & STATUS
      stage: "STRING COMMENT 'Prospecting|Qualification|Needs Analysis|Value Proposition|Proposal|Negotiation|Closed Won|Closed Lost'",
      stage_history: "STRING COMMENT 'JSON array of stage transitions with timestamps'",
      
      is_won: "BOOLEAN COMMENT 'Opportunity is Closed Won'",
      is_lost: "BOOLEAN COMMENT 'Opportunity is Closed Lost'",
      is_closed: "BOOLEAN COMMENT 'Opportunity is closed (won or lost)'",
      
      forecast_category: "STRING COMMENT 'Pipeline|Best Case|Commit|Omitted'",
      forecast_category_name: "STRING",
      
      // AMOUNTS & PROBABILITY
      amount: "DECIMAL(18,2) COMMENT 'Total opportunity value'",
      expected_revenue: "DECIMAL(18,2) COMMENT 'Amount × Probability'",
      
      probability: "DECIMAL(5,2) COMMENT 'Win probability % (0-100)'",
      
      // DATES
      created_date: "DATE COMMENT 'Opportunity created date'",
      created_timestamp: "TIMESTAMP COMMENT 'Opportunity created timestamp'",
      
      close_date: "DATE COMMENT 'Expected or actual close date'",
      actual_close_date: "DATE COMMENT 'Actual close date if won/lost'",
      
      last_stage_change_date: "DATE COMMENT 'Last stage transition date'",
      last_activity_date: "DATE COMMENT 'Last sales activity date'",
      next_step: "STRING COMMENT 'Next step description'",
      
      // PRODUCT INTEREST
      product_type: "STRING COMMENT 'Checking|Savings|Personal Loan|Auto Loan|Credit Card|HELOC|CD|Investment|Insurance'",
      product_category: "STRING COMMENT 'Deposits|Loans|Cards|Investments|Insurance'",
      product_subcategory: "STRING COMMENT 'Specific product SKU/variant'",
      
      product_count: "INTEGER COMMENT 'Number of products in opportunity'",
      product_list: "STRING COMMENT 'JSON array of products'",
      
      // OPPORTUNITY ATTRIBUTES
      type: "STRING COMMENT 'New Customer|Existing Customer Cross-Sell|Existing Customer Upsell|Renewal'",
      
      description: "STRING COMMENT 'Opportunity description'",
      
      is_priority: "BOOLEAN COMMENT 'High-priority opportunity'",
      priority_reason: "STRING COMMENT 'Why this is high priority'",
      
      // SALES CYCLE METRICS
      age_in_days: "INTEGER COMMENT 'Days since opportunity created'",
      days_in_current_stage: "INTEGER COMMENT 'Days in current stage'",
      
      // COMPETITIVE INTELLIGENCE
      competitors: "STRING COMMENT 'Competitor names'",
      competitive_threat_level: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      loss_reason: "STRING COMMENT 'Reason for Closed Lost (if applicable)'",
      loss_reason_category: "STRING COMMENT 'Price|Product|Service|Competitor|Timing|Other'",
      
      win_reason: "STRING COMMENT 'Reason for Closed Won'",
      
      // CAMPAIGN ATTRIBUTION
      campaign_id: "BIGINT COMMENT 'FK to Campaign if sourced from marketing'",
      campaign_name: "STRING COMMENT 'Campaign name'",
      
      // CHANNEL
      channel: "STRING COMMENT 'Branch|Online|Mobile|Call Center|Partner|Referral'",
      referral_source: "STRING COMMENT 'Referral source if applicable'",
      partner_name: "STRING COMMENT 'Partner name if channel=Partner'",
      
      // CUSTOMER DEMOGRAPHICS (from Account)
      customer_type: "STRING COMMENT 'Individual|Household|Small Business'",
      customer_segment: "STRING COMMENT 'Mass Market|Affluent|High Net Worth'",
      customer_age_range: "STRING COMMENT 'Age range of primary customer'",
      customer_income_range: "STRING COMMENT 'Annual income range'",
      customer_geography: "STRING COMMENT 'City, State, ZIP'",
      
      // RELATIONSHIP
      is_new_customer: "BOOLEAN COMMENT 'Customer has no existing accounts'",
      existing_relationship_flag: "BOOLEAN COMMENT 'Customer has existing accounts'",
      existing_product_count: "INTEGER COMMENT 'Number of products customer already has'",
      
      // CONVERSION TRACKING
      conversion_date: "DATE COMMENT 'Date opportunity converted to customer account'",
      conversion_account_id: "BIGINT COMMENT 'FK to account/loan/deposit created'",
      
      // APPROVALS & COMPLIANCE
      approval_required: "BOOLEAN COMMENT 'Requires manager approval'",
      approval_status: "STRING COMMENT 'Pending|Approved|Rejected'",
      approved_by: "STRING COMMENT 'Approver name'",
      approval_date: "DATE",
      
      credit_check_required: "BOOLEAN COMMENT 'Requires credit check'",
      credit_check_status: "STRING COMMENT 'Not Started|In Progress|Completed|Failed'",
      credit_score: "INTEGER COMMENT 'Credit score if checked'",
      
      compliance_review_required: "BOOLEAN",
      compliance_review_status: "STRING",
      
      // COLLABORATION
      team_members: "STRING COMMENT 'JSON array of team member IDs'",
      
      // NOTES & ATTACHMENTS
      notes_count: "INTEGER COMMENT 'Number of notes/comments'",
      attachment_count: "INTEGER COMMENT 'Number of attachments'",
      
      latest_note: "STRING COMMENT 'Most recent note'",
      latest_note_date: "DATE",
      
      // INTEGRATION
      external_id: "STRING COMMENT 'External system opportunity ID'",
      integration_status: "STRING COMMENT 'Sync status with external systems'",
      
      // SFDC SYSTEM FIELDS
      sfdc_record_type_id: "STRING COMMENT 'SFDC Record Type ID'",
      sfdc_record_type_name: "STRING COMMENT 'SFDC Record Type Name'",
      
      is_deleted: "BOOLEAN COMMENT 'SFDC IsDeleted flag'",
      
      last_modified_date: "TIMESTAMP COMMENT 'SFDC LastModifiedDate'",
      last_modified_by: "STRING COMMENT 'SFDC LastModifiedBy'",
      
      system_modstamp: "TIMESTAMP COMMENT 'SFDC SystemModstamp'",
      
      // CUSTOM FIELDS (bank-specific)
      custom_field_1: "STRING COMMENT 'Custom field placeholder'",
      custom_field_2: "STRING",
      custom_field_3: "STRING",
      
      // AUDIT TRAIL
      source_record_id: "STRING COMMENT 'Source system record identifier'",
      source_file_name: "STRING COMMENT 'Source file if batch loaded'",
      load_timestamp: "TIMESTAMP COMMENT 'ETL load timestamp'",
      cdc_operation: "STRING COMMENT 'INSERT|UPDATE|DELETE'",
      record_hash: "STRING COMMENT 'Hash for change detection'",
      created_timestamp_etl: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp_etl: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    },
  },

  // Table 2: Sales Leads
  {
    name: 'bronze.retail_sales_leads',
    description: 'SFDC Lead records - prospective customers not yet qualified as opportunities',
    sourceSystem: 'SALESFORCE',
    sourceTable: 'Lead',
    loadType: 'CDC',
    
    grain: 'One row per lead',
    primaryKey: ['lead_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'created_date',
      ranges: ['Monthly partitions'],
    },
    
    estimatedRows: 10000000,
    avgRowSize: 1536,
    estimatedSize: '15GB',
    
    schema: {
      // PRIMARY KEYS
      lead_id: "BIGINT PRIMARY KEY COMMENT 'SFDC Lead ID'",
      source_system: "STRING PRIMARY KEY",
      
      // LEAD IDENTIFICATION
      lead_number: "STRING COMMENT 'Human-readable lead number'",
      
      // CONTACT INFORMATION
      first_name: "STRING",
      last_name: "STRING",
      full_name: "STRING COMMENT 'First + Last name'",
      
      email: "STRING COMMENT 'Email address'",
      phone: "STRING COMMENT 'Phone number'",
      mobile_phone: "STRING",
      
      company: "STRING COMMENT 'Company name if small business'",
      title: "STRING COMMENT 'Job title'",
      
      // ADDRESS
      street: "STRING",
      city: "STRING",
      state: "STRING",
      zip: "STRING",
      country: "STRING DEFAULT 'USA'",
      
      // LEAD SOURCE & ATTRIBUTION
      lead_source: "STRING COMMENT 'Web Form|Referral|Partner|Event|Cold Call|Advertisement|Social Media|Branch Walk-In'",
      lead_source_detail: "STRING COMMENT 'Specific source (e.g., Google Ads, Facebook, Branch 1234)'",
      
      campaign_id: "BIGINT COMMENT 'FK to Campaign'",
      campaign_name: "STRING",
      
      utm_source: "STRING COMMENT 'UTM tracking - source'",
      utm_medium: "STRING COMMENT 'UTM tracking - medium'",
      utm_campaign: "STRING COMMENT 'UTM tracking - campaign'",
      utm_content: "STRING COMMENT 'UTM tracking - content'",
      utm_term: "STRING COMMENT 'UTM tracking - term'",
      
      referral_customer_id: "BIGINT COMMENT 'FK to referring customer'",
      referral_name: "STRING COMMENT 'Referring customer name'",
      
      // LEAD OWNERSHIP
      owner_id: "BIGINT COMMENT 'FK to User/Sales Rep'",
      owner_name: "STRING",
      owner_email: "STRING",
      
      sales_team: "STRING",
      sales_territory_id: "BIGINT",
      
      // LEAD STATUS & STAGE
      status: "STRING COMMENT 'New|Contacted|Qualified|Unqualified|Converted|Dead'",
      status_reason: "STRING COMMENT 'Reason for current status'",
      
      is_converted: "BOOLEAN COMMENT 'Lead converted to Account/Contact/Opportunity'",
      is_qualified: "BOOLEAN COMMENT 'Lead is qualified'",
      is_unqualified: "BOOLEAN COMMENT 'Lead is disqualified'",
      
      unqualified_reason: "STRING COMMENT 'Reason for disqualification'",
      
      // LEAD SCORING
      lead_score: "INTEGER COMMENT 'Predictive lead score (0-100)'",
      lead_grade: "STRING COMMENT 'A|B|C|D|F - grade based on score'",
      
      engagement_score: "INTEGER COMMENT 'Engagement activity score'",
      fit_score: "INTEGER COMMENT 'ICP fit score (ideal customer profile)'",
      
      lead_temperature: "STRING COMMENT 'Hot|Warm|Cold'",
      
      // PRODUCT INTEREST
      product_interest: "STRING COMMENT 'Primary product of interest'",
      product_interest_detail: "STRING COMMENT 'Specific product details'",
      
      secondary_products: "STRING COMMENT 'JSON array of additional products of interest'",
      
      // QUALIFICATION CRITERIA
      budget_range: "STRING COMMENT 'Budget/deposit amount range'",
      timeline: "STRING COMMENT 'Decision timeline (Immediate|30 days|60 days|90+ days)'",
      authority: "STRING COMMENT 'Decision maker authority level'",
      need: "STRING COMMENT 'Customer need/pain point'",
      
      bant_qualified: "BOOLEAN COMMENT 'Budget, Authority, Need, Timeline qualified'",
      
      // DEMOGRAPHICS
      age_range: "STRING COMMENT 'Age range'",
      income_range: "STRING COMMENT 'Annual income range'",
      
      employment_status: "STRING COMMENT 'Employed|Self-Employed|Retired|Student|Unemployed'",
      
      // DATES
      created_date: "DATE",
      created_timestamp: "TIMESTAMP",
      
      last_activity_date: "DATE COMMENT 'Last sales activity date'",
      last_contacted_date: "DATE COMMENT 'Last contact attempt'",
      
      qualified_date: "DATE COMMENT 'Date lead was qualified'",
      converted_date: "DATE COMMENT 'Date lead was converted'",
      
      // CONVERSION DETAILS
      converted_account_id: "BIGINT COMMENT 'SFDC Account ID if converted'",
      converted_contact_id: "BIGINT COMMENT 'SFDC Contact ID if converted'",
      converted_opportunity_id: "BIGINT COMMENT 'SFDC Opportunity ID if converted'",
      
      // ENGAGEMENT TRACKING
      email_opens: "INTEGER COMMENT 'Email open count'",
      email_clicks: "INTEGER COMMENT 'Email click count'",
      
      web_visits: "INTEGER COMMENT 'Website visit count'",
      form_submissions: "INTEGER COMMENT 'Form submission count'",
      content_downloads: "INTEGER COMMENT 'Content download count'",
      
      last_web_visit_date: "DATE",
      last_email_open_date: "DATE",
      
      // ASSIGNMENT
      assignment_date: "DATE COMMENT 'Date lead assigned to current owner'",
      assignment_method: "STRING COMMENT 'Round Robin|Territory|Manual|Auto-Assignment'",
      
      days_since_assignment: "INTEGER COMMENT 'Days since assigned'",
      
      // NURTURE
      nurture_status: "STRING COMMENT 'Active|Paused|Completed'",
      nurture_campaign_id: "BIGINT COMMENT 'FK to nurture campaign'",
      nurture_stage: "STRING COMMENT 'Current nurture stage'",
      
      // NOTES
      description: "STRING COMMENT 'Lead description/notes'",
      notes_count: "INTEGER",
      
      // CONSENT & COMPLIANCE
      email_opt_in: "BOOLEAN COMMENT 'Opted in to email'",
      sms_opt_in: "BOOLEAN COMMENT 'Opted in to SMS'",
      do_not_call: "BOOLEAN",
      do_not_email: "BOOLEAN",
      
      gdpr_consent: "BOOLEAN COMMENT 'GDPR consent flag'",
      consent_date: "DATE",
      
      // SFDC SYSTEM FIELDS
      sfdc_record_type_id: "STRING",
      sfdc_record_type_name: "STRING",
      
      is_deleted: "BOOLEAN",
      last_modified_date: "TIMESTAMP",
      last_modified_by: "STRING",
      system_modstamp: "TIMESTAMP",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp_etl: "TIMESTAMP",
      updated_timestamp_etl: "TIMESTAMP",
    },
  },

  // Table 3: Sales Activities
  {
    name: 'bronze.retail_sales_activities',
    description: 'Sales activities and interactions (calls, emails, meetings, demos)',
    sourceSystem: 'SALESFORCE',
    sourceTable: 'Task + Event',
    loadType: 'STREAMING',
    
    grain: 'One row per sales activity',
    primaryKey: ['activity_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'activity_date',
      ranges: ['Daily partitions'],
    },
    
    estimatedRows: 50000000,
    avgRowSize: 1024,
    estimatedSize: '50GB',
    
    schema: {
      // PRIMARY KEYS
      activity_id: "BIGINT PRIMARY KEY COMMENT 'SFDC Task/Event ID'",
      source_system: "STRING PRIMARY KEY",
      
      // ACTIVITY TYPE
      activity_type: "STRING COMMENT 'Call|Email|Meeting|Demo|Proposal Sent|Quote Sent|Follow-up|Site Visit'",
      activity_subtype: "STRING COMMENT 'Inbound Call|Outbound Call|Discovery Meeting|etc.'",
      
      object_type: "STRING COMMENT 'Task|Event'",
      
      // RELATED RECORDS
      opportunity_id: "BIGINT COMMENT 'FK to Opportunity'",
      lead_id: "BIGINT COMMENT 'FK to Lead'",
      account_id: "BIGINT COMMENT 'FK to Account'",
      contact_id: "BIGINT COMMENT 'FK to Contact'",
      
      related_to_type: "STRING COMMENT 'Opportunity|Lead|Account|Contact'",
      related_to_id: "BIGINT COMMENT 'ID of related record'",
      related_to_name: "STRING COMMENT 'Name of related record'",
      
      // ACTIVITY OWNERSHIP
      owner_id: "BIGINT COMMENT 'FK to User who performed activity'",
      owner_name: "STRING COMMENT 'Sales rep name'",
      
      assigned_to_id: "BIGINT COMMENT 'Assigned to (for tasks)'",
      assigned_to_name: "STRING",
      
      // ACTIVITY DETAILS
      subject: "STRING COMMENT 'Activity subject/title'",
      description: "STRING COMMENT 'Activity notes/description'",
      
      // STATUS
      status: "STRING COMMENT 'Not Started|In Progress|Completed|Cancelled|Deferred'",
      is_completed: "BOOLEAN",
      is_cancelled: "BOOLEAN",
      
      priority: "STRING COMMENT 'High|Normal|Low'",
      
      // DATES & TIMES
      activity_date: "DATE COMMENT 'Activity date'",
      activity_timestamp: "TIMESTAMP COMMENT 'Activity start timestamp'",
      
      due_date: "DATE COMMENT 'Task due date'",
      
      completed_date: "DATE COMMENT 'Actual completion date'",
      completed_timestamp: "TIMESTAMP",
      
      // DURATION (for Events/Meetings)
      duration_minutes: "INTEGER COMMENT 'Activity duration in minutes'",
      start_time: "TIMESTAMP",
      end_time: "TIMESTAMP",
      
      // OUTCOME
      outcome: "STRING COMMENT 'Connected|Left Voicemail|No Answer|Gatekeeper|Wrong Number|Meeting Scheduled|etc.'",
      outcome_category: "STRING COMMENT 'Positive|Neutral|Negative'",
      
      resulted_in_opportunity: "BOOLEAN COMMENT 'Activity resulted in opportunity creation'",
      resulted_in_meeting: "BOOLEAN COMMENT 'Activity scheduled a meeting'",
      
      // CALL SPECIFICS
      call_direction: "STRING COMMENT 'Inbound|Outbound'",
      call_duration_seconds: "INTEGER",
      call_disposition: "STRING COMMENT 'Call outcome'",
      
      // EMAIL SPECIFICS
      email_sent: "BOOLEAN",
      email_opened: "BOOLEAN",
      email_clicked: "BOOLEAN",
      email_replied: "BOOLEAN",
      
      email_template_id: "BIGINT COMMENT 'Email template used'",
      email_template_name: "STRING",
      
      // MEETING SPECIFICS
      meeting_attendees: "STRING COMMENT 'JSON array of attendee names'",
      meeting_attendee_count: "INTEGER",
      meeting_location: "STRING",
      meeting_type: "STRING COMMENT 'In-Person|Phone|Video|Web Conference'",
      
      // NEXT STEPS
      next_steps: "STRING COMMENT 'Next steps noted'",
      follow_up_required: "BOOLEAN",
      follow_up_date: "DATE",
      
      // CAMPAIGN
      campaign_id: "BIGINT COMMENT 'Campaign related to activity'",
      
      // FLAGS
      is_high_priority: "BOOLEAN",
      is_reminder_set: "BOOLEAN",
      reminder_datetime: "TIMESTAMP",
      
      // RECURRENCE (for recurring tasks/meetings)
      is_recurrence: "BOOLEAN",
      recurrence_pattern: "STRING COMMENT 'Daily|Weekly|Monthly'",
      
      // SFDC SYSTEM FIELDS
      created_date: "DATE",
      created_by: "STRING",
      last_modified_date: "TIMESTAMP",
      last_modified_by: "STRING",
      
      is_deleted: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp_etl: "TIMESTAMP",
      updated_timestamp_etl: "TIMESTAMP",
    },
  },

  // Table 4: Sales Quotes
  {
    name: 'bronze.retail_sales_quotes',
    description: 'Product quotes and proposals sent to prospects/customers',
    sourceSystem: 'SALESFORCE',
    sourceTable: 'Quote',
    loadType: 'CDC',
    
    grain: 'One row per quote',
    primaryKey: ['quote_id', 'source_system'],
    
    estimatedRows: 3000000,
    avgRowSize: 1536,
    estimatedSize: '4.5GB',
    
    schema: {
      // PRIMARY KEYS
      quote_id: "BIGINT PRIMARY KEY COMMENT 'SFDC Quote ID'",
      source_system: "STRING PRIMARY KEY",
      
      // QUOTE IDENTIFICATION
      quote_number: "STRING COMMENT 'Human-readable quote number'",
      quote_name: "STRING COMMENT 'Quote title'",
      
      // RELATIONSHIPS
      opportunity_id: "BIGINT COMMENT 'FK to Opportunity'",
      opportunity_name: "STRING",
      
      account_id: "BIGINT COMMENT 'FK to Account'",
      account_name: "STRING",
      
      contact_id: "BIGINT COMMENT 'FK to primary contact'",
      contact_name: "STRING",
      
      // QUOTE OWNER
      owner_id: "BIGINT COMMENT 'FK to User (sales rep)'",
      owner_name: "STRING",
      
      // QUOTE STATUS
      status: "STRING COMMENT 'Draft|Sent|Presented|Accepted|Rejected|Expired|Withdrawn'",
      
      is_sent: "BOOLEAN COMMENT 'Quote has been sent to customer'",
      is_accepted: "BOOLEAN COMMENT 'Quote was accepted by customer'",
      is_rejected: "BOOLEAN COMMENT 'Quote was rejected'",
      
      rejection_reason: "STRING COMMENT 'Reason for rejection'",
      
      // PRODUCT DETAILS
      product_id: "BIGINT COMMENT 'Primary product quoted'",
      product_name: "STRING",
      product_type: "STRING COMMENT 'Checking|Savings|Loan|Card|etc.'",
      
      product_line_items: "STRING COMMENT 'JSON array of all products in quote'",
      line_item_count: "INTEGER COMMENT 'Number of products'",
      
      // PRICING
      subtotal_amount: "DECIMAL(18,2) COMMENT 'Subtotal before fees/taxes'",
      fee_amount: "DECIMAL(18,2) COMMENT 'Fees'",
      discount_amount: "DECIMAL(18,2) COMMENT 'Discounts applied'",
      total_amount: "DECIMAL(18,2) COMMENT 'Total quote amount'",
      
      // LOAN/CREDIT SPECIFIC
      quoted_apr: "DECIMAL(10,6) COMMENT 'APR for loans/cards'",
      quoted_interest_rate: "DECIMAL(10,6) COMMENT 'Interest rate'",
      quoted_term_months: "INTEGER COMMENT 'Loan term in months'",
      quoted_monthly_payment: "DECIMAL(18,2) COMMENT 'Monthly payment amount'",
      
      // DEPOSIT SPECIFIC
      quoted_apy: "DECIMAL(10,6) COMMENT 'APY for deposits'",
      quoted_minimum_balance: "DECIMAL(18,2) COMMENT 'Minimum balance requirement'",
      quoted_monthly_fee: "DECIMAL(18,2) COMMENT 'Monthly account fee'",
      
      // TERMS & CONDITIONS
      terms_and_conditions: "STRING COMMENT 'T&C text or link'",
      special_terms: "STRING COMMENT 'Special pricing or terms'",
      
      // DATES
      created_date: "DATE COMMENT 'Quote created date'",
      sent_date: "DATE COMMENT 'Date quote was sent to customer'",
      presented_date: "DATE COMMENT 'Date quote was presented'",
      accepted_date: "DATE COMMENT 'Date quote was accepted'",
      expiration_date: "DATE COMMENT 'Quote expiration date'",
      
      is_expired: "BOOLEAN COMMENT 'Quote has expired'",
      
      // VERSION CONTROL
      version_number: "INTEGER COMMENT 'Quote version number'",
      is_latest_version: "BOOLEAN COMMENT 'This is the current version'",
      parent_quote_id: "BIGINT COMMENT 'FK to original quote if revised'",
      
      // APPROVALS
      approval_required: "BOOLEAN COMMENT 'Requires manager approval'",
      approval_status: "STRING COMMENT 'Pending|Approved|Rejected'",
      approved_by: "STRING COMMENT 'Approver name'",
      approval_date: "DATE",
      
      // DELIVERY
      delivery_method: "STRING COMMENT 'Email|Mail|In-Person|Portal'",
      delivery_status: "STRING COMMENT 'Pending|Sent|Delivered|Bounced'",
      
      email_sent_to: "STRING COMMENT 'Email address quote sent to'",
      email_sent_timestamp: "TIMESTAMP",
      email_opened_timestamp: "TIMESTAMP",
      
      // PROPOSAL DOCUMENT
      proposal_document_url: "STRING COMMENT 'URL to PDF/document'",
      proposal_template_id: "BIGINT COMMENT 'Template used'",
      
      // CUSTOMER INTERACTION
      customer_viewed_date: "DATE COMMENT 'Date customer viewed quote'",
      customer_view_count: "INTEGER COMMENT 'Number of times viewed'",
      
      customer_questions: "STRING COMMENT 'Customer questions/notes'",
      
      // NOTES
      notes: "STRING COMMENT 'Internal notes'",
      
      // SFDC SYSTEM FIELDS
      last_modified_date: "TIMESTAMP",
      last_modified_by: "STRING",
      is_deleted: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp_etl: "TIMESTAMP",
      updated_timestamp_etl: "TIMESTAMP",
    },
  },

  // Table 5: Sales Reps (Users)
  {
    name: 'bronze.retail_sales_reps',
    description: 'Sales representatives and relationship managers',
    sourceSystem: 'SALESFORCE',
    sourceTable: 'User',
    loadType: 'DAILY',
    
    grain: 'One row per sales rep',
    primaryKey: ['sales_rep_id', 'source_system'],
    
    estimatedRows: 5000,
    avgRowSize: 1024,
    estimatedSize: '5MB',
    
    schema: {
      // PRIMARY KEYS
      sales_rep_id: "BIGINT PRIMARY KEY COMMENT 'SFDC User ID'",
      source_system: "STRING PRIMARY KEY",
      
      // IDENTIFICATION
      employee_id: "BIGINT COMMENT 'FK to HR employee master'",
      user_name: "STRING COMMENT 'SFDC username'",
      
      // PERSONAL INFO
      first_name: "STRING",
      last_name: "STRING",
      full_name: "STRING",
      
      email: "STRING",
      phone: "STRING",
      mobile_phone: "STRING",
      
      // JOB INFORMATION
      title: "STRING COMMENT 'Job title (e.g., Relationship Manager, Branch Manager)'",
      department: "STRING COMMENT 'Department'",
      division: "STRING COMMENT 'Division'",
      
      // SALES STRUCTURE
      sales_team: "STRING COMMENT 'Sales team assignment'",
      sales_role: "STRING COMMENT 'Individual Contributor|Team Lead|Manager|Director'",
      
      manager_id: "BIGINT COMMENT 'FK to manager User ID'",
      manager_name: "STRING",
      
      // TERRITORY
      sales_territory_id: "BIGINT COMMENT 'FK to Territory'",
      sales_territory_name: "STRING",
      
      // QUOTA
      annual_quota: "DECIMAL(18,2) COMMENT 'Annual sales quota'",
      quarterly_quota: "DECIMAL(18,2) COMMENT 'Quarterly quota'",
      monthly_quota: "DECIMAL(18,2) COMMENT 'Monthly quota'",
      
      quota_currency: "STRING DEFAULT 'USD'",
      quota_fiscal_year: "INTEGER COMMENT 'Fiscal year for quota'",
      
      // COMMISSION PLAN
      commission_plan_id: "BIGINT COMMENT 'FK to commission plan'",
      commission_plan_name: "STRING",
      commission_rate: "DECIMAL(5,2) COMMENT 'Commission rate %'",
      
      // PRODUCT SPECIALIZATION
      product_specialization: "STRING COMMENT 'Primary product expertise'",
      product_certifications: "STRING COMMENT 'JSON array of certifications'",
      
      // LOCATION
      office_location: "STRING COMMENT 'Office/branch location'",
      branch_id: "BIGINT COMMENT 'FK to branch if branch-based'",
      branch_name: "STRING",
      
      time_zone: "STRING COMMENT 'Time zone'",
      
      // STATUS
      is_active: "BOOLEAN COMMENT 'Currently active employee'",
      user_status: "STRING COMMENT 'Active|Inactive|On Leave'",
      
      hire_date: "DATE COMMENT 'Hire date'",
      termination_date: "DATE COMMENT 'Termination date if applicable'",
      
      // PERFORMANCE
      ytd_sales: "DECIMAL(18,2) COMMENT 'YTD sales to date'",
      ytd_quota_attainment: "DECIMAL(5,2) COMMENT 'YTD quota attainment %'",
      
      last_quarter_sales: "DECIMAL(18,2)",
      last_quarter_quota_attainment: "DECIMAL(5,2)",
      
      // LICENSES & CERTIFICATIONS
      nmls_number: "STRING COMMENT 'NMLS license number (for loan officers)'",
      securities_license: "STRING COMMENT 'Series 6/7/63 etc.'",
      insurance_license: "STRING COMMENT 'Insurance license'",
      
      license_expiration_date: "DATE",
      
      // PERMISSIONS
      sfdc_profile: "STRING COMMENT 'SFDC Profile name'",
      sfdc_role: "STRING COMMENT 'SFDC Role name'",
      
      can_approve_quotes: "BOOLEAN",
      can_approve_exceptions: "BOOLEAN",
      
      // PREFERENCES
      preferred_language: "STRING DEFAULT 'English'",
      
      // SFDC SYSTEM FIELDS
      created_date: "DATE",
      last_login_date: "DATE COMMENT 'Last SFDC login'",
      last_modified_date: "TIMESTAMP",
      
      is_deleted: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp_etl: "TIMESTAMP",
      updated_timestamp_etl: "TIMESTAMP",
    },
  },

  // Table 6: Sales Territories
  {
    name: 'bronze.retail_sales_territories',
    description: 'Geographic sales territories and coverage areas',
    sourceSystem: 'SALESFORCE',
    sourceTable: 'Territory',
    loadType: 'DAILY',
    
    grain: 'One row per territory',
    primaryKey: ['territory_id', 'source_system'],
    
    estimatedRows: 500,
    avgRowSize: 512,
    estimatedSize: '256KB',
    
    schema: {
      // PRIMARY KEYS
      territory_id: "BIGINT PRIMARY KEY COMMENT 'Territory ID'",
      source_system: "STRING PRIMARY KEY",
      
      // IDENTIFICATION
      territory_name: "STRING COMMENT 'Territory name'",
      territory_code: "STRING COMMENT 'Territory code/abbreviation'",
      
      // HIERARCHY
      parent_territory_id: "BIGINT COMMENT 'FK to parent territory'",
      parent_territory_name: "STRING",
      
      territory_level: "STRING COMMENT 'National|Regional|District|Branch'",
      territory_type: "STRING COMMENT 'Geographic|Account-Based|Product-Based'",
      
      // GEOGRAPHY
      states: "STRING COMMENT 'JSON array of states covered'",
      cities: "STRING COMMENT 'JSON array of cities'",
      zip_codes: "STRING COMMENT 'JSON array of ZIP codes'",
      
      region: "STRING COMMENT 'Region name (Northeast, Southeast, etc.)'",
      
      // BRANCH COVERAGE
      branch_ids: "STRING COMMENT 'JSON array of branch IDs in territory'",
      branch_count: "INTEGER COMMENT 'Number of branches'",
      
      // ASSIGNMENT
      assigned_sales_rep_id: "BIGINT COMMENT 'Primary sales rep assigned'",
      assigned_sales_rep_name: "STRING",
      
      sales_team_ids: "STRING COMMENT 'JSON array of sales team members'",
      sales_team_size: "INTEGER",
      
      // TERRITORY ATTRIBUTES
      is_active: "BOOLEAN COMMENT 'Territory is active'",
      
      effective_start_date: "DATE COMMENT 'Territory effective start'",
      effective_end_date: "DATE COMMENT 'Territory effective end'",
      
      // QUOTA
      territory_quota: "DECIMAL(18,2) COMMENT 'Quota for territory'",
      territory_quota_fiscal_year: "INTEGER",
      
      // MARKET CHARACTERISTICS
      market_size: "STRING COMMENT 'Small|Medium|Large|Enterprise'",
      market_potential: "DECIMAL(18,2) COMMENT 'Estimated market potential'",
      
      population: "INTEGER COMMENT 'Population in territory'",
      household_count: "INTEGER COMMENT 'Household count'",
      
      median_household_income: "DECIMAL(18,2) COMMENT 'Median HH income'",
      
      // COMPETITION
      competitor_branch_count: "INTEGER COMMENT 'Competitor branches in territory'",
      competitor_market_share: "DECIMAL(5,2) COMMENT 'Competitor market share %'",
      
      // NOTES
      description: "STRING",
      
      // SFDC SYSTEM FIELDS
      created_date: "DATE",
      last_modified_date: "TIMESTAMP",
      is_deleted: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp_etl: "TIMESTAMP",
      updated_timestamp_etl: "TIMESTAMP",
    },
  },

  // Table 7: Sales Commissions
  {
    name: 'bronze.retail_sales_commissions',
    description: 'Sales commission calculations and payments',
    sourceSystem: 'COMMISSION_SYSTEM',
    sourceTable: 'COMMISSION_TRANSACTIONS',
    loadType: 'DAILY',
    
    grain: 'One row per commission transaction',
    primaryKey: ['commission_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'commission_period_end_date',
      ranges: ['Monthly partitions'],
    },
    
    estimatedRows: 1000000,
    avgRowSize: 768,
    estimatedSize: '750MB',
    
    schema: {
      // PRIMARY KEYS
      commission_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      // SALES REP
      sales_rep_id: "BIGINT COMMENT 'FK to sales rep'",
      sales_rep_name: "STRING",
      employee_id: "BIGINT COMMENT 'FK to HR employee'",
      
      // OPPORTUNITY/ACCOUNT
      opportunity_id: "BIGINT COMMENT 'FK to Opportunity that generated commission'",
      opportunity_name: "STRING",
      
      account_id: "BIGINT COMMENT 'FK to Account'",
      customer_name: "STRING",
      
      // COMMISSION TYPE
      commission_type: "STRING COMMENT 'New Account|Cross-Sell|Upsell|Renewal|Referral|Revenue Share'",
      commission_category: "STRING COMMENT 'Direct|Override|Split|Bonus'",
      
      // PRODUCT
      product_id: "BIGINT COMMENT 'Product that earned commission'",
      product_name: "STRING",
      product_type: "STRING COMMENT 'Checking|Loan|Card|etc.'",
      
      // COMMISSION CALCULATION
      revenue_amount: "DECIMAL(18,2) COMMENT 'Revenue generated (loan amount, deposit balance, etc.)'",
      commission_rate: "DECIMAL(5,2) COMMENT 'Commission rate %'",
      commission_amount: "DECIMAL(18,2) COMMENT 'Commission earned'",
      
      // OVERRIDE/SPLIT
      is_split_commission: "BOOLEAN COMMENT 'Commission is split among multiple reps'",
      split_percentage: "DECIMAL(5,2) COMMENT 'Split % if applicable'",
      
      is_override: "BOOLEAN COMMENT 'Manager override commission'",
      override_level: "INTEGER COMMENT 'Override tier (1st, 2nd level manager)'",
      
      // COMMISSION PERIOD
      commission_period_start_date: "DATE COMMENT 'Commission period start'",
      commission_period_end_date: "DATE COMMENT 'Commission period end'",
      commission_period: "STRING COMMENT 'YYYY-MM format'",
      
      fiscal_quarter: "STRING COMMENT 'FY quarter (e.g., FY24 Q2)'",
      fiscal_year: "INTEGER",
      
      // STATUS
      commission_status: "STRING COMMENT 'Pending|Approved|Paid|Reversed|Disputed'",
      
      is_paid: "BOOLEAN COMMENT 'Commission has been paid'",
      payment_date: "DATE COMMENT 'Date commission was paid'",
      payment_method: "STRING COMMENT 'Payroll|Check|Direct Deposit'",
      
      // REVERSAL
      is_reversed: "BOOLEAN COMMENT 'Commission was reversed (chargeback)'",
      reversal_reason: "STRING COMMENT 'Reason for reversal (e.g., customer closed account)'",
      reversal_date: "DATE",
      
      // CLAWBACK
      is_clawback: "BOOLEAN COMMENT 'Clawback provision applies'",
      clawback_period_months: "INTEGER COMMENT 'Clawback period (e.g., 12 months)'",
      clawback_expiry_date: "DATE",
      
      // APPROVAL
      approved_by: "STRING COMMENT 'Manager who approved commission'",
      approval_date: "DATE",
      
      // ACCELERATORS & BONUSES
      accelerator_applied: "BOOLEAN COMMENT 'Accelerator multiplier applied'",
      accelerator_rate: "DECIMAL(5,2) COMMENT 'Accelerator multiplier'",
      
      bonus_amount: "DECIMAL(18,2) COMMENT 'Additional bonus amount'",
      bonus_reason: "STRING COMMENT 'Reason for bonus'",
      
      // QUOTA ATTAINMENT
      quota_attainment_pct: "DECIMAL(5,2) COMMENT 'Quota attainment % at time of commission'",
      
      // TAX
      tax_withheld: "DECIMAL(18,2) COMMENT 'Tax withheld from commission'",
      
      // NOTES
      notes: "STRING COMMENT 'Commission notes'",
      
      // AUDIT TRAIL
      calculation_timestamp: "TIMESTAMP COMMENT 'When commission was calculated'",
      calculated_by: "STRING COMMENT 'System/user who calculated'",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 8: Customer Referrals
  {
    name: 'bronze.retail_customer_referrals',
    description: 'Customer referral program tracking',
    sourceSystem: 'CRM_REFERRAL_MODULE',
    sourceTable: 'REFERRALS',
    loadType: 'CDC',
    
    grain: 'One row per referral',
    primaryKey: ['referral_id', 'source_system'],
    
    estimatedRows: 500000,
    avgRowSize: 512,
    estimatedSize: '250MB',
    
    schema: {
      // PRIMARY KEYS
      referral_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      // REFERRER (existing customer)
      referrer_customer_id: "BIGINT COMMENT 'FK to existing customer who referred'",
      referrer_name: "STRING",
      referrer_email: "STRING",
      referrer_account_id: "BIGINT COMMENT 'Referrer primary account'",
      
      // REFERRED (new prospect/customer)
      referred_customer_id: "BIGINT COMMENT 'FK to referred customer (if converted)'",
      referred_name: "STRING",
      referred_email: "STRING",
      referred_phone: "STRING",
      
      // REFERRAL DETAILS
      referral_date: "DATE COMMENT 'Date referral was made'",
      referral_timestamp: "TIMESTAMP",
      
      referral_method: "STRING COMMENT 'Email|Link|In-Person|Mobile App|Branch'",
      referral_campaign_id: "BIGINT COMMENT 'FK to referral campaign'",
      referral_campaign_name: "STRING",
      
      // LEAD/OPPORTUNITY CREATED
      lead_id: "BIGINT COMMENT 'FK to Lead created from referral'",
      opportunity_id: "BIGINT COMMENT 'FK to Opportunity if converted'",
      
      // REFERRAL STATUS
      referral_status: "STRING COMMENT 'Pending|Contacted|Qualified|Converted|Declined|Expired'",
      
      is_qualified: "BOOLEAN COMMENT 'Referred prospect is qualified'",
      qualified_date: "DATE",
      
      is_converted: "BOOLEAN COMMENT 'Referred prospect became customer'",
      conversion_date: "DATE COMMENT 'Date prospect converted to customer'",
      
      days_to_conversion: "INTEGER COMMENT 'Days from referral to conversion'",
      
      // PRODUCT
      product_interest: "STRING COMMENT 'Product referred prospect is interested in'",
      product_opened: "STRING COMMENT 'Product actually opened/purchased'",
      
      account_opened_id: "BIGINT COMMENT 'FK to account/loan opened'",
      account_opening_amount: "DECIMAL(18,2) COMMENT 'Deposit amount or loan amount'",
      
      // REFERRAL REWARD
      referral_reward_type: "STRING COMMENT 'Cash|Points|Gift Card|Account Credit'",
      referral_reward_amount: "DECIMAL(18,2) COMMENT 'Reward amount ($)'",
      
      reward_status: "STRING COMMENT 'Pending|Approved|Paid|Cancelled'",
      reward_approval_date: "DATE",
      reward_paid_date: "DATE",
      
      reward_paid_to_account_id: "BIGINT COMMENT 'Account where reward was deposited'",
      
      // REWARD TERMS
      reward_requires_min_balance: "BOOLEAN COMMENT 'Reward requires minimum balance'",
      reward_min_balance_amount: "DECIMAL(18,2)",
      reward_min_balance_period_days: "INTEGER COMMENT 'Days balance must be maintained'",
      
      reward_requires_active_account: "BOOLEAN COMMENT 'Account must remain open'",
      reward_active_period_days: "INTEGER COMMENT 'Days account must remain active'",
      
      // RELATIONSHIP
      relationship_to_referrer: "STRING COMMENT 'Friend|Family|Coworker|Other'",
      
      // TRACKING
      referral_link_id: "STRING COMMENT 'Unique referral link/code'",
      referral_link_clicks: "INTEGER COMMENT 'Number of clicks on referral link'",
      
      // COMPLIANCE
      consent_received: "BOOLEAN COMMENT 'Referred person consented to contact'",
      consent_date: "DATE",
      
      do_not_contact: "BOOLEAN COMMENT 'Do not contact flag'",
      
      // NOTES
      notes: "STRING COMMENT 'Referral notes'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
];

export const salesRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for retail sales domain with SFDC/CRM integration',
  layer: 'BRONZE',
  tables: salesRetailBronzeTables,
  totalTables: 8,
  estimatedSize: '80.5GB',
  refreshFrequency: 'Real-time CDC (opportunities, leads, activities) + Daily (reps, territories, commissions)',
  retention: '7 years',
  
  sourceIntegrations: [
    'Salesforce CRM (Opportunities, Leads, Tasks, Events, Quotes, Users)',
    'Commission Management System',
    'Referral Program Platform',
    'HubSpot (alternative CRM)',
  ],
  
  keyCapabilities: [
    'Sales pipeline and opportunity tracking',
    'Lead capture, scoring, and conversion',
    'Sales activity logging (calls, emails, meetings)',
    'Quote and proposal management',
    'Sales rep quota and performance tracking',
    'Territory management and assignment',
    'Commission calculation and tracking',
    'Customer referral program management',
    'Multi-touch attribution (campaign to conversion)',
    'Sales forecasting data foundation',
  ],
  
  complianceConsiderations: [
    'PII protection for customer contact information',
    'GDPR/CCPA consent tracking',
    'TCPA compliance (do not call, do not email)',
    'SOX compliance for commission calculations',
    'Audit trail for all sales activities',
  ],
};
