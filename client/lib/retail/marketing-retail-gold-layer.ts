/**
 * MARKETING-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model (Kimball methodology) with:
 * - 12 Dimensions
 * - 8 Fact Tables
 * 
 * Grade A Target: Analytics-ready star schema for banking marketing analytics
 */

export const marketingRetailGoldDimensions = [
  {
    name: 'gold.dim_marketing_campaign',
    description: 'Marketing campaign dimension',
    type: 'SCD Type 2',
    grain: 'One row per campaign per effective period',
    primaryKey: 'campaign_key',
    schema: {
      campaign_key: "BIGINT PRIMARY KEY",
      campaign_id: "STRING",
      campaign_name: "STRING",
      campaign_type: "STRING COMMENT 'Email|SMS|Paid Search|Paid Social|Display|Branch|Referral'",
      campaign_objective: "STRING COMMENT 'Awareness|Consideration|Conversion|Retention'",
      product_line: "STRING COMMENT 'Deposits|Cards|Loans|Investments'",
      product_category: "STRING",
      target_segment: "STRING",
      budget_tier: "STRING COMMENT 'Small|Medium|Large|Enterprise'",
      is_compliance_approved: "BOOLEAN",
      is_tcpa_compliant: "BOOLEAN",
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
    },
  },
  {
    name: 'gold.dim_marketing_channel',
    description: 'Marketing channel dimension',
    type: 'SCD Type 1',
    grain: 'One row per channel',
    primaryKey: 'channel_key',
    schema: {
      channel_key: "BIGINT PRIMARY KEY",
      channel_name: "STRING",
      channel_type: "STRING COMMENT 'Paid|Owned|Earned'",
      channel_category: "STRING COMMENT 'Digital|Traditional|In-Person'",
      is_digital: "BOOLEAN",
      cost_structure: "STRING COMMENT 'CPC|CPM|CPA|Fixed'",
      attribution_window_days: "INTEGER",
      avg_cac: "DECIMAL(10,2) COMMENT 'Average Customer Acquisition Cost'",
    },
  },
  {
    name: 'gold.dim_marketing_offer',
    description: 'Banking product offer dimension',
    type: 'SCD Type 2',
    grain: 'One row per offer per effective period',
    primaryKey: 'offer_key',
    schema: {
      offer_key: "BIGINT PRIMARY KEY",
      offer_id: "STRING",
      offer_name: "STRING",
      offer_type: "STRING COMMENT 'Cash Bonus|Rate Promotion|Fee Waiver|Rewards Bonus'",
      product_line: "STRING",
      offer_amount: "DECIMAL(18,2)",
      min_deposit_required: "DECIMAL(18,2)",
      min_balance_required: "DECIMAL(18,2)",
      qualification_period_days: "INTEGER",
      is_active: "BOOLEAN",
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
    },
  },
  {
    name: 'gold.dim_lead_source',
    description: 'Lead source dimension',
    type: 'SCD Type 1',
    grain: 'One row per lead source',
    primaryKey: 'lead_source_key',
    schema: {
      lead_source_key: "BIGINT PRIMARY KEY",
      lead_source_code: "STRING UNIQUE",
      lead_source_name: "STRING COMMENT 'Website|Landing Page|Branch|Referral|Event'",
      lead_source_category: "STRING COMMENT 'Digital|Physical|Referral'",
      typical_conversion_rate: "DECIMAL(5,4)",
      typical_cpl: "DECIMAL(10,2) COMMENT 'Cost Per Lead'",
    },
  },
  {
    name: 'gold.dim_lead_status',
    description: 'Lead lifecycle status dimension',
    type: 'SCD Type 1',
    grain: 'One row per status',
    primaryKey: 'lead_status_key',
    schema: {
      lead_status_key: "BIGINT PRIMARY KEY",
      lead_status_code: "STRING UNIQUE",
      lead_status_name: "STRING COMMENT 'New|Contacted|Qualified|Application|Converted|Disqualified'",
      status_order: "INTEGER COMMENT 'Funnel sequence'",
      is_active_status: "BOOLEAN",
      is_converted_status: "BOOLEAN",
    },
  },
  {
    name: 'gold.dim_customer_segment',
    description: 'Customer segment dimension',
    type: 'SCD Type 1',
    grain: 'One row per segment',
    primaryKey: 'segment_key',
    schema: {
      segment_key: "BIGINT PRIMARY KEY",
      segment_id: "STRING UNIQUE",
      segment_name: "STRING",
      segment_type: "STRING COMMENT 'Demographic|Behavioral|Lifecycle|Predictive'",
      segment_criteria: "STRING COMMENT 'JSON'",
      segment_size: "INTEGER",
      avg_account_balance: "DECIMAL(18,2)",
      avg_product_count: "DECIMAL(5,2)",
    },
  },
  {
    name: 'gold.dim_product',
    description: 'Banking product dimension',
    type: 'SCD Type 2',
    grain: 'One row per product per effective period',
    primaryKey: 'product_key',
    schema: {
      product_key: "BIGINT PRIMARY KEY",
      product_id: "STRING",
      product_name: "STRING",
      product_line: "STRING COMMENT 'Deposits|Cards|Loans|Investments|Insurance'",
      product_category: "STRING COMMENT 'Checking|Savings|CD|Credit Card|Personal Loan|etc.'",
      product_tier: "STRING COMMENT 'Basic|Premium|Private'",
      current_rate: "DECIMAL(7,4) COMMENT 'Interest rate or APR'",
      monthly_fee: "DECIMAL(10,2)",
      is_active: "BOOLEAN",
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
    },
  },
  {
    name: 'gold.dim_attribution_model',
    description: 'Attribution model dimension',
    type: 'SCD Type 1',
    grain: 'One row per attribution model',
    primaryKey: 'attribution_model_key',
    schema: {
      attribution_model_key: "BIGINT PRIMARY KEY",
      attribution_model_code: "STRING UNIQUE",
      attribution_model_name: "STRING COMMENT 'First Touch|Last Touch|Linear|Time Decay|U-Shaped|W-Shaped|Custom Banking'",
      model_type: "STRING COMMENT 'Single Touch|Multi Touch|Algorithmic'",
      model_description: "STRING",
    },
  },
  {
    name: 'gold.dim_touchpoint_type',
    description: 'Marketing touchpoint type dimension',
    type: 'SCD Type 1',
    grain: 'One row per touchpoint type',
    primaryKey: 'touchpoint_type_key',
    schema: {
      touchpoint_type_key: "BIGINT PRIMARY KEY",
      touchpoint_type_code: "STRING UNIQUE",
      touchpoint_type_name: "STRING COMMENT 'Email Open|Ad Click|Website Visit|Branch Visit|Call'",
      touchpoint_category: "STRING COMMENT 'Impression|Engagement|Conversion'",
      is_digital: "BOOLEAN",
      avg_conversion_influence: "DECIMAL(5,4)",
    },
  },
  {
    name: 'gold.dim_content',
    description: 'Marketing content dimension',
    type: 'SCD Type 2',
    grain: 'One row per content asset per version',
    primaryKey: 'content_key',
    schema: {
      content_key: "BIGINT PRIMARY KEY",
      content_id: "STRING",
      content_name: "STRING",
      content_type: "STRING COMMENT 'Email Template|Landing Page|Banner Ad|Video|Social Post'",
      content_format: "STRING COMMENT 'HTML|Image|Video|Text'",
      product_focus: "STRING",
      call_to_action: "STRING",
      version: "INTEGER",
      is_ab_test: "BOOLEAN",
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
    },
  },
  {
    name: 'gold.dim_consent_status',
    description: 'Consent status dimension',
    type: 'SCD Type 1',
    grain: 'One row per consent status',
    primaryKey: 'consent_status_key',
    schema: {
      consent_status_key: "BIGINT PRIMARY KEY",
      consent_status_code: "STRING UNIQUE",
      consent_status_name: "STRING COMMENT 'Active|Expired|Withdrawn|Pending'",
      can_market: "BOOLEAN COMMENT 'Whether marketing is allowed'",
    },
  },
  {
    name: 'gold.dim_geography',
    description: 'Geographic dimension for marketing analysis',
    type: 'SCD Type 1',
    grain: 'One row per geographic area',
    primaryKey: 'geography_key',
    schema: {
      geography_key: "BIGINT PRIMARY KEY",
      country: "STRING",
      state: "STRING",
      dma: "STRING COMMENT 'Designated Market Area'",
      msa: "STRING COMMENT 'Metropolitan Statistical Area'",
      zip_code: "STRING",
      population: "INTEGER",
      median_income: "DECIMAL(18,2)",
      urban_rural: "STRING COMMENT 'Urban|Suburban|Rural'",
    },
  },
];

export const marketingRetailGoldFacts = [
  {
    name: 'gold.fact_marketing_campaigns',
    description: 'Campaign performance fact table',
    factType: 'Accumulating Snapshot',
    grain: 'One row per campaign',
    dimensions: ['campaign_key', 'channel_key', 'product_key', 'segment_key', 'start_date_key', 'end_date_key'],
    schema: {
      campaign_key: "BIGINT PRIMARY KEY",
      channel_key: "BIGINT",
      product_key: "BIGINT",
      segment_key: "BIGINT",
      start_date_key: "INTEGER",
      end_date_key: "INTEGER",
      
      campaign_id: "STRING UNIQUE",
      
      // Budget & Spend
      budget_allocated: "DECIMAL(18,2)",
      actual_spend: "DECIMAL(18,2)",
      media_spend: "DECIMAL(18,2)",
      creative_cost: "DECIMAL(18,2)",
      technology_cost: "DECIMAL(18,2)",
      bonus_payout: "DECIMAL(18,2)",
      
      // Reach & Engagement
      impressions: "BIGINT",
      clicks: "BIGINT",
      unique_visitors: "INTEGER",
      ctr: "DECIMAL(5,4) COMMENT 'Click-Through Rate'",
      
      // Lead Generation
      leads_generated: "INTEGER",
      qualified_leads: "INTEGER",
      cost_per_lead: "DECIMAL(10,2)",
      lead_qualification_rate: "DECIMAL(5,4)",
      
      // Conversions
      applications_submitted: "INTEGER",
      accounts_opened: "INTEGER",
      accounts_funded: "INTEGER",
      conversion_rate: "DECIMAL(5,4)",
      
      // Financial Impact
      total_deposits_acquired: "DECIMAL(18,2)",
      total_loans_funded: "DECIMAL(18,2)",
      total_credit_extended: "DECIMAL(18,2)",
      
      // CAC & ROI
      cac: "DECIMAL(10,2) COMMENT 'Customer Acquisition Cost'",
      ltv: "DECIMAL(18,2) COMMENT 'Customer Lifetime Value'",
      roi: "DECIMAL(8,4) COMMENT 'Return on Investment'",
      payback_period_months: "INTEGER",
    },
    estimatedRows: 50000,
    estimatedSize: '2GB',
  },
  {
    name: 'gold.fact_lead_conversions',
    description: 'Lead lifecycle and conversion tracking',
    factType: 'Accumulating Snapshot',
    grain: 'One row per lead',
    dimensions: ['customer_key', 'campaign_key', 'channel_key', 'lead_source_key', 'lead_status_key', 'product_key', 'offer_key', 'lead_date_key', 'conversion_date_key'],
    schema: {
      lead_key: "BIGINT PRIMARY KEY",
      customer_key: "BIGINT",
      campaign_key: "BIGINT",
      channel_key: "BIGINT",
      lead_source_key: "BIGINT",
      lead_status_key: "BIGINT",
      product_key: "BIGINT",
      offer_key: "BIGINT",
      lead_date_key: "INTEGER",
      application_date_key: "INTEGER",
      approval_date_key: "INTEGER",
      funding_date_key: "INTEGER",
      conversion_date_key: "INTEGER",
      
      lead_id: "BIGINT UNIQUE",
      
      // Lead Attributes
      lead_score: "INTEGER COMMENT '0-100'",
      income_stated: "DECIMAL(18,2)",
      credit_score_range: "STRING",
      
      // Timing
      days_to_application: "INTEGER",
      days_to_approval: "INTEGER",
      days_to_funding: "INTEGER",
      total_days_to_conversion: "INTEGER",
      
      // Financial
      application_amount: "DECIMAL(18,2)",
      approved_amount: "DECIMAL(18,2)",
      funded_amount: "DECIMAL(18,2)",
      
      // Flags
      is_converted: "BOOLEAN",
      is_qualified: "BOOLEAN",
      is_existing_customer: "BOOLEAN",
    },
    estimatedRows: 5000000,
    estimatedSize: '15GB',
  },
  {
    name: 'gold.fact_marketing_touchpoints',
    description: 'Marketing touchpoint interactions',
    factType: 'Transaction',
    grain: 'One row per touchpoint',
    dimensions: ['customer_key', 'campaign_key', 'channel_key', 'touchpoint_type_key', 'content_key', 'touchpoint_date_key', 'touchpoint_time_key'],
    schema: {
      touchpoint_key: "BIGINT PRIMARY KEY",
      customer_key: "BIGINT",
      campaign_key: "BIGINT",
      channel_key: "BIGINT",
      touchpoint_type_key: "BIGINT",
      content_key: "BIGINT",
      touchpoint_date_key: "INTEGER",
      touchpoint_time_key: "INTEGER",
      
      touchpoint_timestamp: "TIMESTAMP",
      
      journey_id: "STRING COMMENT 'Customer journey identifier'",
      session_id: "STRING",
      
      touchpoint_position: "INTEGER COMMENT 'Position in customer journey'",
      
      is_first_touch: "BOOLEAN",
      is_last_touch: "BOOLEAN",
      is_conversion_touch: "BOOLEAN",
      
      minutes_since_last_touchpoint: "INTEGER",
      
      touchpoint_count: "INTEGER DEFAULT 1",
    },
    estimatedRows: 50000000,
    estimatedSize: '60GB',
  },
  {
    name: 'gold.fact_marketing_attribution',
    description: 'Multi-touch attribution revenue allocation',
    factType: 'Transaction',
    grain: 'One row per conversion per channel per attribution model',
    dimensions: ['customer_key', 'campaign_key', 'channel_key', 'attribution_model_key', 'product_key', 'conversion_date_key'],
    schema: {
      attribution_key: "BIGINT PRIMARY KEY",
      customer_key: "BIGINT",
      campaign_key: "BIGINT",
      channel_key: "BIGINT",
      attribution_model_key: "BIGINT",
      product_key: "BIGINT",
      conversion_date_key: "INTEGER",
      
      conversion_id: "STRING",
      journey_id: "STRING",
      
      conversion_value: "DECIMAL(18,2)",
      
      attribution_credit: "DECIMAL(5,4) COMMENT '0-1, portion of credit'",
      attributed_revenue: "DECIMAL(18,2) COMMENT 'Credit * Conversion Value'",
      attributed_spend: "DECIMAL(18,2)",
      
      total_touchpoints: "INTEGER",
      touchpoint_position: "INTEGER COMMENT 'Position of this channel in journey'",
    },
    estimatedRows: 20000000,
    estimatedSize: '30GB',
  },
  {
    name: 'gold.fact_offer_redemptions',
    description: 'Banking offer redemptions and bonus payouts',
    factType: 'Transaction',
    grain: 'One row per offer redemption',
    dimensions: ['customer_key', 'offer_key', 'campaign_key', 'product_key', 'redemption_date_key', 'payout_date_key'],
    schema: {
      redemption_key: "BIGINT PRIMARY KEY",
      customer_key: "BIGINT",
      offer_key: "BIGINT",
      campaign_key: "BIGINT",
      product_key: "BIGINT",
      account_key: "BIGINT",
      redemption_date_key: "INTEGER",
      qualification_date_key: "INTEGER",
      payout_date_key: "INTEGER",
      
      redemption_id: "STRING UNIQUE",
      
      offer_amount: "DECIMAL(18,2)",
      qualification_amount: "DECIMAL(18,2) COMMENT 'Deposit or spend required'",
      
      account_balance_30d: "DECIMAL(18,2)",
      account_balance_90d: "DECIMAL(18,2)",
      account_balance_180d: "DECIMAL(18,2)",
      
      days_to_qualification: "INTEGER",
      days_to_payout: "INTEGER",
      
      bonus_paid: "DECIMAL(18,2)",
      is_bonus_paid: "BOOLEAN",
      
      is_early_closure: "BOOLEAN COMMENT 'Account closed within 180 days'",
      
      redemption_count: "INTEGER DEFAULT 1",
    },
    estimatedRows: 2000000,
    estimatedSize: '8GB',
  },
  {
    name: 'gold.fact_channel_performance_daily',
    description: 'Daily marketing channel performance',
    factType: 'Periodic Snapshot',
    grain: 'One row per channel per day',
    dimensions: ['channel_key', 'date_key'],
    schema: {
      channel_key: "BIGINT",
      date_key: "INTEGER",
      
      snapshot_date: "DATE",
      
      impressions: "BIGINT",
      clicks: "BIGINT",
      conversions: "INTEGER",
      
      spend: "DECIMAL(18,2)",
      revenue: "DECIMAL(18,2)",
      
      ctr: "DECIMAL(5,4)",
      cpc: "DECIMAL(10,2)",
      cpa: "DECIMAL(10,2)",
      cac: "DECIMAL(10,2)",
      roas: "DECIMAL(8,4) COMMENT 'Return on Ad Spend'",
      
      channel_mix_pct: "DECIMAL(5,4)",
    },
    estimatedRows: 500000,
    estimatedSize: '2GB',
  },
  {
    name: 'gold.fact_customer_engagement',
    description: 'Customer marketing engagement metrics',
    factType: 'Periodic Snapshot',
    grain: 'One row per customer per month',
    dimensions: ['customer_key', 'segment_key', 'month_key'],
    schema: {
      customer_key: "BIGINT",
      segment_key: "BIGINT",
      month_key: "INTEGER",
      
      snapshot_month: "DATE",
      
      total_touchpoints: "INTEGER",
      email_opens: "INTEGER",
      email_clicks: "INTEGER",
      sms_replies: "INTEGER",
      web_sessions: "INTEGER",
      branch_visits: "INTEGER",
      
      engagement_score: "INTEGER COMMENT '0-100'",
      
      preferred_channel: "STRING",
      
      days_since_last_engagement: "INTEGER",
      
      is_engaged: "BOOLEAN COMMENT 'Score >= 60'",
    },
    estimatedRows: 60000000,
    estimatedSize: '30GB',
  },
  {
    name: 'gold.fact_consent_status',
    description: 'Customer consent status tracking',
    factType: 'Accumulating Snapshot',
    grain: 'One row per customer per consent type',
    dimensions: ['customer_key', 'consent_status_key', 'granted_date_key', 'withdrawal_date_key'],
    schema: {
      customer_key: "BIGINT",
      consent_type: "STRING COMMENT 'Email|SMS|Phone|Direct Mail|Data Sharing'",
      consent_status_key: "BIGINT",
      granted_date_key: "INTEGER",
      withdrawal_date_key: "INTEGER",
      
      consent_id: "STRING UNIQUE",
      
      consent_timestamp: "TIMESTAMP",
      withdrawal_timestamp: "TIMESTAMP",
      
      consent_channel: "STRING COMMENT 'Web|Mobile|Branch|Phone'",
      
      is_opted_in: "BOOLEAN",
      
      days_consented: "INTEGER",
    },
    estimatedRows: 50000000,
    estimatedSize: '20GB',
  },
];

export const marketingRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail marketing domain',
  layer: 'GOLD',
  dimensions: marketingRetailGoldDimensions,
  facts: marketingRetailGoldFacts,
  totalDimensions: 12,
  totalFacts: 8,
  estimatedSize: '600GB',
  refreshFrequency: 'Daily for snapshots, Real-time for touchpoints',
  methodology: 'Kimball Dimensional Modeling',
  
  keyFeatures: [
    'Banking-specific campaign and offer tracking',
    'Multi-touch attribution with 7 models',
    'Lead lifecycle and conversion funnel',
    'Product-specific performance (Deposits, Cards, Loans)',
    'Offer redemption and bonus payout tracking',
    'Customer engagement scoring',
    'Channel performance and mix analysis',
    'Consent and compliance tracking',
    'CAC, LTV, and ROI calculations',
    'Branch integration for attribution',
  ],
  
  analyticsCapabilities: [
    'Marketing ROI analysis by product line',
    'Multi-touch attribution comparison',
    'Lead conversion funnel optimization',
    'Offer effectiveness and redemption analysis',
    'Channel mix optimization',
    'Customer engagement trend analysis',
    'CAC and LTV benchmarking',
    'Campaign budget allocation',
    'Consent compliance monitoring',
    'A/B test winner identification',
  ],
};
