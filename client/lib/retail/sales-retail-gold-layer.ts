import type { Table } from '../schema-types';

/**
 * SALES-RETAIL DOMAIN - GOLD LAYER
 * 
 * Kimball Dimensional Model for Sales Analytics
 * Star schema optimized for BI reporting and analytics
 * 
 * Model Components:
 * - 4 Conformed Dimensions
 * - 5 Fact Tables (Transaction + Periodic Snapshot)
 */

// ========================================
// DIMENSIONS
// ========================================

export const salesRetailGoldDimensions: Table[] = [
  // Dimension 1: Sales Rep
  {
    name: 'gold.dim_sales_rep',
    description: 'Sales representative dimension (SCD Type 2)',
    grain: 'One row per sales rep per effective date',
    
    schema: {
      sales_rep_key: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Dimension surrogate key'",
      
      // NATURAL KEY
      sales_rep_id: "BIGINT COMMENT 'SFDC User ID'",
      employee_id: "BIGINT COMMENT 'HR employee ID'",
      
      // ATTRIBUTES
      sales_rep_name: "STRING",
      email: "STRING",
      
      title: "STRING",
      department: "STRING",
      division: "STRING",
      
      sales_team: "STRING",
      sales_role: "STRING COMMENT 'Individual Contributor|Team Lead|Manager|Director'",
      
      manager_id: "BIGINT",
      manager_name: "STRING",
      
      sales_territory_id: "BIGINT",
      sales_territory_name: "STRING",
      
      // QUOTA
      annual_quota: "DECIMAL(18,2)",
      quarterly_quota: "DECIMAL(18,2)",
      quota_fiscal_year: "INTEGER",
      
      // COMMISSION
      commission_plan_name: "STRING",
      commission_rate: "DECIMAL(5,2)",
      
      // LOCATION
      office_location: "STRING",
      branch_id: "BIGINT",
      branch_name: "STRING",
      
      // LICENSES
      nmls_number: "STRING",
      securities_license: "STRING",
      insurance_license: "STRING",
      
      // STATUS
      is_active: "BOOLEAN",
      hire_date: "DATE",
      termination_date: "DATE",
      
      // SCD TYPE 2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Dimension 2: Sales Territory
  {
    name: 'gold.dim_sales_territory',
    description: 'Sales territory dimension with hierarchy',
    grain: 'One row per territory',
    
    schema: {
      territory_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // NATURAL KEY
      territory_id: "BIGINT",
      
      // ATTRIBUTES
      territory_name: "STRING",
      territory_code: "STRING",
      
      // HIERARCHY
      parent_territory_id: "BIGINT",
      parent_territory_name: "STRING",
      
      territory_level: "STRING COMMENT 'National|Regional|District|Branch'",
      territory_type: "STRING COMMENT 'Geographic|Account-Based|Product-Based'",
      
      // GEOGRAPHY
      region: "STRING COMMENT 'Northeast|Southeast|Midwest|Southwest|West'",
      states: "STRING COMMENT 'JSON array of states'",
      
      // BRANCH COVERAGE
      branch_count: "INTEGER",
      
      // MARKET
      market_size: "STRING COMMENT 'Small|Medium|Large|Enterprise'",
      population: "INTEGER",
      median_household_income: "DECIMAL(18,2)",
      
      // STATUS
      is_active: "BOOLEAN",
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Dimension 3: Lead Source
  {
    name: 'gold.dim_lead_source',
    description: 'Lead source taxonomy and attribution hierarchy',
    grain: 'One row per lead source',
    
    schema: {
      lead_source_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // ATTRIBUTES
      lead_source: "STRING COMMENT 'Web Form|Referral|Partner|Event|Cold Call|Advertisement|Social Media|Branch Walk-In'",
      lead_source_detail: "STRING COMMENT 'Specific source detail'",
      lead_source_category: "STRING COMMENT 'Digital|Offline|Referral|Partner'",
      
      // UTM TRACKING
      utm_source: "STRING",
      utm_medium: "STRING",
      utm_campaign: "STRING",
      
      // ATTRIBUTION
      channel: "STRING COMMENT 'Online|Offline|Referral|Partner'",
      subchannel: "STRING",
      
      // CAMPAIGN
      campaign_id: "BIGINT",
      campaign_name: "STRING",
      campaign_type: "STRING COMMENT 'Brand|Performance|Referral|Event'",
      
      // COST (for CAC calculation)
      campaign_cost: "DECIMAL(18,2) COMMENT 'Total campaign cost'",
      
      // FLAGS
      is_paid: "BOOLEAN COMMENT 'Paid channel (e.g., Google Ads)'",
      is_organic: "BOOLEAN COMMENT 'Organic channel (e.g., SEO, word-of-mouth)'",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Dimension 4: Sales Stage
  {
    name: 'gold.dim_sales_stage',
    description: 'Sales stage dimension with progression logic',
    grain: 'One row per stage',
    
    schema: {
      stage_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // ATTRIBUTES
      stage: "STRING COMMENT 'Prospecting|Qualification|Needs Analysis|Value Proposition|Proposal|Negotiation|Closed Won|Closed Lost'",
      stage_rank: "INTEGER COMMENT 'Numeric rank for ordering (1-8)'",
      
      // CATEGORIZATION
      stage_category: "STRING COMMENT 'Early Stage|Mid Stage|Late Stage|Closed'",
      forecast_category: "STRING COMMENT 'Pipeline|Best Case|Commit|Omitted'",
      
      // PROBABILITY
      default_probability: "DECIMAL(5,2) COMMENT 'Default win probability %'",
      
      // FLAGS
      is_active_pipeline: "BOOLEAN COMMENT 'Stage is in active pipeline (not closed)'",
      is_closed: "BOOLEAN",
      is_won: "BOOLEAN",
      is_lost: "BOOLEAN",
      
      // PROGRESSION
      prior_stage: "STRING COMMENT 'Typical prior stage in progression'",
      next_stage: "STRING COMMENT 'Typical next stage'",
      
      // BENCHMARKS
      typical_duration_days: "INTEGER COMMENT 'Typical days in this stage'",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
];

// ========================================
// FACT TABLES
// ========================================

export const salesRetailGoldFacts: Table[] = [
  // Fact 1: Sales Opportunities (Transaction Fact)
  {
    name: 'gold.fact_sales_opportunities',
    description: 'Sales opportunity grain fact table for win/loss analysis',
    factType: 'Transaction',
    grain: 'One row per opportunity',
    
    schema: {
      opportunity_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION FOREIGN KEYS
      sales_rep_key: "BIGINT COMMENT 'FK to dim_sales_rep'",
      territory_key: "BIGINT COMMENT 'FK to dim_sales_territory'",
      lead_source_key: "BIGINT COMMENT 'FK to dim_lead_source'",
      stage_key: "BIGINT COMMENT 'FK to dim_sales_stage (current stage)'",
      
      created_date_key: "INTEGER COMMENT 'FK to date dimension (YYYYMMDD)'",
      close_date_key: "INTEGER COMMENT 'FK to date dimension (expected close)'",
      actual_close_date_key: "INTEGER COMMENT 'FK to date dimension (actual close if won/lost)'",
      
      // DEGENERATE DIMENSIONS
      opportunity_id: "BIGINT COMMENT 'SFDC Opportunity ID'",
      opportunity_number: "STRING",
      opportunity_name: "STRING",
      
      account_id: "BIGINT",
      account_name: "STRING",
      
      product_type: "STRING COMMENT 'Checking|Savings|Loan|Card|etc.'",
      product_category: "STRING COMMENT 'Deposits|Loans|Cards|Investments|Insurance'",
      
      opportunity_type: "STRING COMMENT 'New Customer|Cross-Sell|Upsell|Renewal'",
      channel: "STRING COMMENT 'Branch|Online|Mobile|Call Center|Partner|Referral'",
      
      customer_segment: "STRING COMMENT 'Mass Market|Affluent|High Net Worth'",
      
      // MEASURES (Additive)
      amount: "DECIMAL(18,2) COMMENT 'Opportunity value'",
      expected_revenue: "DECIMAL(18,2) COMMENT 'Amount × Probability'",
      
      // MEASURES (Semi-Additive)
      probability: "DECIMAL(5,2) COMMENT 'Win probability %'",
      
      // MEASURES (Non-Additive)
      age_in_days: "INTEGER COMMENT 'Days from created to snapshot'",
      days_to_close: "INTEGER COMMENT 'Days from created to close (if closed)'",
      sales_cycle_length: "INTEGER COMMENT 'Days to close (if won)'",
      
      // FLAGS (for filtering)
      is_won: "BOOLEAN",
      is_lost: "BOOLEAN",
      is_closed: "BOOLEAN",
      is_active: "BOOLEAN",
      
      is_new_customer: "BOOLEAN",
      
      // WIN/LOSS ANALYSIS
      loss_reason: "STRING",
      loss_reason_category: "STRING COMMENT 'Price|Product|Service|Competitor|Timing|Other'",
      win_reason: "STRING",
      
      competitors: "STRING COMMENT 'Competitor names'",
      
      // CONVERSION
      conversion_flag: "BOOLEAN COMMENT 'Customer account was created'",
      conversion_date_key: "INTEGER",
      conversion_account_id: "BIGINT COMMENT 'Account/loan/deposit created'",
      
      // PRODUCT COUNT
      product_count: "INTEGER COMMENT 'Number of products in opportunity'",
      
      // CREDIT
      credit_score: "INTEGER COMMENT 'Customer credit score'",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 2: Sales Pipeline Daily (Periodic Snapshot)
  {
    name: 'gold.fact_sales_pipeline_daily',
    description: 'Daily sales pipeline snapshot for trending and waterfall analysis',
    factType: 'Periodic Snapshot',
    grain: 'One row per opportunity per day',
    
    schema: {
      pipeline_snapshot_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION FOREIGN KEYS
      opportunity_key: "BIGINT COMMENT 'FK to fact_sales_opportunities (dimension-like)'",
      sales_rep_key: "BIGINT COMMENT 'FK to dim_sales_rep'",
      territory_key: "BIGINT COMMENT 'FK to dim_sales_territory'",
      stage_key: "BIGINT COMMENT 'FK to dim_sales_stage'",
      
      snapshot_date_key: "INTEGER COMMENT 'FK to date dimension (YYYYMMDD)'",
      
      // DEGENERATE DIMENSIONS
      opportunity_id: "BIGINT",
      opportunity_name: "STRING",
      
      product_type: "STRING",
      product_category: "STRING",
      
      forecast_category: "STRING COMMENT 'Pipeline|Best Case|Commit|Omitted'",
      
      // MEASURES (Additive)
      amount: "DECIMAL(18,2) COMMENT 'Opportunity amount at snapshot'",
      expected_revenue: "DECIMAL(18,2)",
      
      // MEASURES (Non-Additive)
      probability: "DECIMAL(5,2)",
      age_in_days: "INTEGER",
      days_in_current_stage: "INTEGER",
      
      // CHANGE TRACKING
      stage_changed_flag: "BOOLEAN COMMENT 'Stage changed since prior snapshot'",
      stage_change_direction: "STRING COMMENT 'Forward|Backward|Closed Won|Closed Lost|No Change'",
      
      amount_changed_flag: "BOOLEAN",
      amount_change: "DECIMAL(18,2) COMMENT 'Change in amount since prior snapshot'",
      
      close_date_changed_flag: "BOOLEAN",
      close_date_shift_days: "INTEGER COMMENT 'Days close date was pushed/pulled'",
      
      owner_changed_flag: "BOOLEAN",
      
      // PIPELINE MOVEMENT FLAGS
      is_new_this_period: "BOOLEAN COMMENT 'New opportunity since prior snapshot'",
      is_closed_this_period: "BOOLEAN",
      is_won_this_period: "BOOLEAN",
      is_lost_this_period: "BOOLEAN",
      
      // WATERFALL CATEGORIZATION
      waterfall_category: "STRING COMMENT 'Opening|New|Closed Won|Closed Lost|Slipped|Pulled In|Increased|Decreased|Closing'",
      
      // FLAGS
      is_won: "BOOLEAN",
      is_lost: "BOOLEAN",
      is_closed: "BOOLEAN",
      is_stale: "BOOLEAN COMMENT 'No activity in 30+ days'",
      
      // ACTIVITY
      days_since_last_activity: "INTEGER",
      
      // AUDIT
      snapshot_timestamp: "TIMESTAMP",
      created_timestamp: "TIMESTAMP",
    },
  },

  // Fact 3: Sales Activities (Transaction Fact)
  {
    name: 'gold.fact_sales_activities',
    description: 'Sales activity grain for productivity and engagement analysis',
    factType: 'Transaction',
    grain: 'One row per sales activity',
    
    schema: {
      activity_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION FOREIGN KEYS
      sales_rep_key: "BIGINT COMMENT 'FK to dim_sales_rep (activity owner)'",
      territory_key: "BIGINT COMMENT 'FK to dim_sales_territory'",
      
      activity_date_key: "INTEGER COMMENT 'FK to date dimension (YYYYMMDD)'",
      completed_date_key: "INTEGER COMMENT 'FK to date dimension'",
      
      // DEGENERATE DIMENSIONS
      activity_id: "BIGINT COMMENT 'SFDC Task/Event ID'",
      
      opportunity_id: "BIGINT COMMENT 'Related opportunity'",
      opportunity_name: "STRING",
      opportunity_stage: "STRING COMMENT 'Opportunity stage at time of activity'",
      
      lead_id: "BIGINT COMMENT 'Related lead'",
      lead_status: "STRING",
      
      account_id: "BIGINT",
      account_name: "STRING",
      
      activity_type: "STRING COMMENT 'Call|Email|Meeting|Demo|Proposal Sent|Quote Sent'",
      activity_subtype: "STRING",
      
      subject: "STRING",
      
      // STATUS
      status: "STRING COMMENT 'Not Started|In Progress|Completed|Cancelled'",
      is_completed: "BOOLEAN",
      is_cancelled: "BOOLEAN",
      
      priority: "STRING COMMENT 'High|Normal|Low'",
      
      // MEASURES
      activity_count: "INTEGER DEFAULT 1 COMMENT 'Count of activities (always 1 per row)'",
      
      duration_minutes: "INTEGER COMMENT 'Activity duration'",
      call_duration_seconds: "INTEGER COMMENT 'Call duration if call'",
      
      // OUTCOME
      outcome: "STRING",
      outcome_category: "STRING COMMENT 'Positive|Neutral|Negative'",
      
      resulted_in_opportunity: "BOOLEAN",
      resulted_in_meeting: "BOOLEAN",
      
      // CALL SPECIFICS
      call_direction: "STRING COMMENT 'Inbound|Outbound'",
      call_disposition: "STRING",
      
      // EMAIL SPECIFICS
      email_sent: "BOOLEAN",
      email_opened: "BOOLEAN",
      email_clicked: "BOOLEAN",
      email_replied: "BOOLEAN",
      
      // MEETING SPECIFICS
      meeting_attendee_count: "INTEGER",
      meeting_type: "STRING COMMENT 'In-Person|Phone|Video|Web Conference'",
      
      // ATTRIBUTION
      first_activity_flag: "BOOLEAN COMMENT 'First activity on this opportunity/lead'",
      last_activity_before_close_flag: "BOOLEAN COMMENT 'Last activity before opp closed'",
      
      days_since_prior_activity: "INTEGER",
      
      // TIME ATTRIBUTES
      activity_hour: "INTEGER COMMENT 'Hour of day (0-23)'",
      activity_day_of_week: "STRING COMMENT 'Monday, Tuesday, etc.'",
      is_business_hours: "BOOLEAN COMMENT '8am-6pm Mon-Fri'",
      is_weekend: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Fact 4: Lead Conversions (Accumulating Snapshot)
  {
    name: 'gold.fact_lead_conversions',
    description: 'Lead conversion funnel with milestone timestamps (accumulating snapshot)',
    factType: 'Accumulating Snapshot',
    grain: 'One row per lead',
    
    schema: {
      lead_conversion_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION FOREIGN KEYS
      lead_source_key: "BIGINT COMMENT 'FK to dim_lead_source'",
      sales_rep_key: "BIGINT COMMENT 'FK to dim_sales_rep (current owner)'",
      territory_key: "BIGINT COMMENT 'FK to dim_sales_territory'",
      
      // MILESTONE DATE KEYS (accumulating)
      lead_created_date_key: "INTEGER COMMENT 'FK to date dimension'",
      lead_contacted_date_key: "INTEGER COMMENT 'FK to date dimension (first contact)'",
      lead_qualified_date_key: "INTEGER COMMENT 'FK to date dimension'",
      opportunity_created_date_key: "INTEGER COMMENT 'FK to date dimension'",
      opportunity_won_date_key: "INTEGER COMMENT 'FK to date dimension'",
      account_opened_date_key: "INTEGER COMMENT 'FK to date dimension'",
      
      // DEGENERATE DIMENSIONS
      lead_id: "BIGINT",
      lead_number: "STRING",
      
      full_name: "STRING",
      email: "STRING",
      
      lead_status: "STRING COMMENT 'Current lead status'",
      
      opportunity_id: "BIGINT COMMENT 'Opportunity ID if converted'",
      opportunity_name: "STRING",
      
      account_id: "BIGINT COMMENT 'Account ID if customer created'",
      customer_name: "STRING",
      
      product_interest: "STRING",
      product_opened: "STRING COMMENT 'Actual product opened/purchased'",
      
      // LEAD SCORING
      lead_score: "INTEGER COMMENT 'Current lead score 0-100'",
      lead_grade: "STRING COMMENT 'A|B|C|D|F'",
      lead_temperature: "STRING COMMENT 'Hot|Warm|Cold'",
      
      // FUNNEL STAGES (FLAGS)
      is_contacted: "BOOLEAN COMMENT 'Lead has been contacted'",
      is_qualified: "BOOLEAN COMMENT 'Lead is qualified'",
      is_converted_to_opportunity: "BOOLEAN COMMENT 'Lead converted to opportunity'",
      is_won: "BOOLEAN COMMENT 'Opportunity is Closed Won'",
      is_customer_created: "BOOLEAN COMMENT 'Customer account/loan opened'",
      
      is_unqualified: "BOOLEAN COMMENT 'Lead disqualified'",
      unqualified_reason: "STRING",
      
      // MEASURES (Duration in days between milestones)
      days_to_contact: "INTEGER COMMENT 'Days from created to first contact'",
      days_to_qualification: "INTEGER COMMENT 'Days from created to qualified'",
      days_to_opportunity: "INTEGER COMMENT 'Days from created to opportunity'",
      days_to_won: "INTEGER COMMENT 'Days from created to won'",
      days_to_customer: "INTEGER COMMENT 'Days from created to account opened'",
      
      total_sales_cycle_days: "INTEGER COMMENT 'Days from lead created to customer created'",
      
      // ENGAGEMENT METRICS
      email_opens: "INTEGER",
      email_clicks: "INTEGER",
      web_visits: "INTEGER",
      form_submissions: "INTEGER",
      content_downloads: "INTEGER",
      total_engagement_actions: "INTEGER",
      
      // OPPORTUNITY AMOUNT (if converted)
      opportunity_amount: "DECIMAL(18,2) COMMENT 'Opportunity value if converted'",
      account_opening_amount: "DECIMAL(18,2) COMMENT 'Deposit/loan amount'",
      
      // CHANNEL
      channel: "STRING COMMENT 'Branch|Online|Mobile|Call Center|Partner|Referral'",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP COMMENT 'Updated as lead progresses through milestones'",
    },
  },

  // Fact 5: Sales Commissions (Transaction Fact)
  {
    name: 'gold.fact_sales_commissions',
    description: 'Sales commission calculations for compensation analysis',
    factType: 'Transaction',
    grain: 'One row per commission transaction',
    
    schema: {
      commission_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION FOREIGN KEYS
      sales_rep_key: "BIGINT COMMENT 'FK to dim_sales_rep'",
      territory_key: "BIGINT COMMENT 'FK to dim_sales_territory'",
      
      commission_period_end_date_key: "INTEGER COMMENT 'FK to date dimension (period end)'",
      payment_date_key: "INTEGER COMMENT 'FK to date dimension'",
      
      // DEGENERATE DIMENSIONS
      commission_id: "BIGINT",
      
      opportunity_id: "BIGINT COMMENT 'Opportunity that generated commission'",
      opportunity_name: "STRING",
      
      account_id: "BIGINT",
      customer_name: "STRING",
      
      product_type: "STRING",
      product_category: "STRING",
      
      commission_type: "STRING COMMENT 'New Account|Cross-Sell|Upsell|Renewal|Referral|Revenue Share'",
      commission_category: "STRING COMMENT 'Direct|Override|Split|Bonus'",
      
      commission_period: "STRING COMMENT 'YYYY-MM'",
      fiscal_quarter: "STRING",
      fiscal_year: "INTEGER",
      
      // STATUS
      commission_status: "STRING COMMENT 'Pending|Approved|Paid|Reversed|Disputed'",
      
      is_paid: "BOOLEAN",
      is_reversed: "BOOLEAN",
      is_split_commission: "BOOLEAN",
      is_override: "BOOLEAN",
      
      // MEASURES (Additive)
      revenue_amount: "DECIMAL(18,2) COMMENT 'Revenue generated'",
      commission_amount: "DECIMAL(18,2) COMMENT 'Commission earned'",
      bonus_amount: "DECIMAL(18,2) COMMENT 'Bonus amount'",
      total_commission: "DECIMAL(18,2) COMMENT 'Commission + Bonus'",
      
      tax_withheld: "DECIMAL(18,2)",
      net_commission: "DECIMAL(18,2) COMMENT 'Total - tax'",
      
      // MEASURES (Non-Additive)
      commission_rate: "DECIMAL(5,2) COMMENT 'Commission rate %'",
      split_percentage: "DECIMAL(5,2) COMMENT 'Split % if applicable'",
      
      quota_attainment_pct: "DECIMAL(5,2) COMMENT 'Quota attainment at time of commission'",
      
      accelerator_rate: "DECIMAL(5,2) COMMENT 'Accelerator multiplier if applied'",
      
      // CLAWBACK
      is_clawback: "BOOLEAN",
      clawback_at_risk: "BOOLEAN COMMENT 'Within clawback window'",
      clawback_period_months: "INTEGER",
      
      // REVERSAL
      reversal_reason: "STRING",
      
      // RECONCILIATION
      variance_amount: "DECIMAL(18,2) COMMENT 'Variance between calculated and paid'",
      
      // AUDIT
      calculation_timestamp: "TIMESTAMP",
      created_timestamp: "TIMESTAMP",
    },
  },
];

export const salesRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail sales - Kimball star schema',
  layer: 'GOLD',
  modelingApproach: 'Kimball Dimensional Modeling',
  
  dimensions: salesRetailGoldDimensions,
  facts: salesRetailGoldFacts,
  
  totalDimensions: 4,
  totalFacts: 5,
  estimatedSize: '45GB',
  
  starSchemaDesign: {
    coreDimensions: [
      'dim_sales_rep (SCD Type 2)',
      'dim_sales_territory (hierarchy)',
      'dim_lead_source (attribution)',
      'dim_sales_stage (progression)',
    ],
    
    factTables: [
      'fact_sales_opportunities (transaction grain)',
      'fact_sales_pipeline_daily (periodic snapshot)',
      'fact_sales_activities (transaction grain)',
      'fact_lead_conversions (accumulating snapshot)',
      'fact_sales_commissions (transaction grain)',
    ],
  },
  
  keyCapabilities: [
    'Sales pipeline analysis and trending',
    'Win/loss analysis by rep, territory, product',
    'Sales cycle length and velocity metrics',
    'Lead conversion funnel analysis',
    'Sales activity productivity tracking',
    'Commission calculation and reconciliation',
    'Quota attainment tracking',
    'Sales forecasting',
    'Territory performance comparison',
    'Attribution analysis (campaign to conversion)',
    'Waterfall pipeline movement analysis',
    'CAC (Customer Acquisition Cost) calculation',
  ],
  
  reportingUseCases: [
    'Executive sales dashboard (pipeline, win rate, quota attainment)',
    'Sales rep performance scorecards',
    'Territory comparison and ranking',
    'Lead source ROI analysis',
    'Sales activity heatmaps and trends',
    'Commission statements and reconciliation reports',
    'Sales forecast accuracy tracking',
    'Customer acquisition cost by channel',
    'Sales cycle benchmarking',
    'Pipeline waterfall (month-over-month changes)',
  ],
  
  dimensionHierarchies: {
    sales_rep: 'Individual Rep → Team → Manager → Division',
    territory: 'Branch → District → Regional → National',
    lead_source: 'Source Detail → Source → Category → Channel',
    stage: 'Stage → Category → Forecast Category',
  },
  
  aggregations: [
    'Daily pipeline snapshots → Weekly/Monthly summaries',
    'Activity counts by rep/day → Rep productivity metrics',
    'Lead conversions → Funnel conversion rates by stage',
    'Commission calculations → Payroll summaries',
  ],
};
