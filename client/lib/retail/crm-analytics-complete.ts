/**
 * CRM-ANALYTICS COMPLETE DOMAIN
 * 
 * Domain: CRM Analytics & Customer Engagement
 * Coverage: SALESFORCE account, contact, opportunity, activity, and engagement data
 * Data Sources: SALESFORCE CRM, Activity Tracking, Engagement Scoring
 * 
 * COMPLETE: Bronze (13) + Silver (11) + Gold (9 dims + 7 facts) + Metrics (280+)
 * Quality Level: Enterprise-Grade
 */

export const crmAnalyticsComplete = {
  domainId: 'crm-analytics',
  domainName: 'CRM Analytics',
  status: 'completed',
  completionDate: '2025-01-15',
  qualityLevel: 'Enterprise-Grade',
  version: '1.0',

  // Bronze Layer: 13 tables from SALESFORCE
  bronze: {
    totalTables: 13,
    estimatedSize: '900GB',
    dailyVolume: '~10M events',
    tables: [
      {
        name: 'bronze.salesforce_account',
        description: 'Corporate accounts and business customer master',
        grain: 'One row per account',
        keyColumns: ['account_id', 'account_name', 'last_modified_date'],
      },
      {
        name: 'bronze.salesforce_contact',
        description: 'Contact records and individuals',
        grain: 'One row per contact',
        keyColumns: ['contact_id', 'account_id', 'email', 'last_modified_date'],
      },
      {
        name: 'bronze.salesforce_lead',
        description: 'Sales leads and prospect records',
        grain: 'One row per lead',
        keyColumns: ['lead_id', 'email', 'lead_status', 'created_date'],
      },
      {
        name: 'bronze.salesforce_opportunity',
        description: 'Sales opportunities and pipeline records',
        grain: 'One row per opportunity',
        keyColumns: ['opportunity_id', 'account_id', 'stage', 'close_date'],
      },
      {
        name: 'bronze.salesforce_task',
        description: 'Sales activities and task records',
        grain: 'One row per task',
        keyColumns: ['task_id', 'who_id', 'what_id', 'activity_date'],
      },
      {
        name: 'bronze.salesforce_event',
        description: 'Calendar events and interactions',
        grain: 'One row per event',
        keyColumns: ['event_id', 'who_id', 'what_id', 'activity_date'],
      },
      {
        name: 'bronze.salesforce_campaign',
        description: 'Marketing campaigns managed in SALESFORCE',
        grain: 'One row per campaign',
        keyColumns: ['campaign_id', 'campaign_name', 'status', 'start_date'],
      },
      {
        name: 'bronze.salesforce_campaign_member',
        description: 'Campaign membership and response tracking',
        grain: 'One row per membership',
        keyColumns: ['campaign_member_id', 'campaign_id', 'contact_id', 'status'],
      },
      {
        name: 'bronze.salesforce_activity_history',
        description: 'Complete activity history tracking',
        grain: 'One row per activity',
        keyColumns: ['activity_id', 'contact_id', 'account_id', 'activity_type', 'activity_date'],
      },
      {
        name: 'bronze.salesforce_account_contact_relation',
        description: 'Account and contact relationships',
        grain: 'One row per relationship',
        keyColumns: ['relationship_id', 'account_id', 'contact_id', 'relationship_type'],
      },
      {
        name: 'bronze.salesforce_user',
        description: 'SALESFORCE users (sales reps, managers)',
        grain: 'One row per user',
        keyColumns: ['user_id', 'username', 'email', 'is_active'],
      },
      {
        name: 'bronze.salesforce_custom_engagement',
        description: 'Custom engagement scoring object',
        grain: 'One row per engagement',
        keyColumns: ['engagement_id', 'contact_id', 'engagement_score', 'engagement_date'],
      },
      {
        name: 'bronze.salesforce_forecast',
        description: 'Sales forecasts and pipeline projections',
        grain: 'One row per forecast',
        keyColumns: ['forecast_id', 'user_id', 'forecast_period', 'forecast_date'],
      },
    ],
  },

  // Silver Layer: 11 tables with transformations
  silver: {
    totalTables: 11,
    estimatedSize: '700GB',
    tables: [
      {
        name: 'silver.dim_crm_account',
        type: 'Dimension',
        description: 'Account master with SCD Type 2',
        grain: 'One row per account version',
        keyColumns: ['account_key', 'account_id'],
      },
      {
        name: 'silver.dim_crm_contact',
        type: 'Dimension',
        description: 'Contact dimension with account hierarchy',
        grain: 'One row per contact',
        keyColumns: ['contact_key', 'contact_id'],
      },
      {
        name: 'silver.dim_crm_user',
        type: 'Dimension',
        description: 'Sales representative dimension',
        grain: 'One row per user',
        keyColumns: ['user_key', 'user_id'],
      },
      {
        name: 'silver.dim_opportunity_stage',
        type: 'Dimension',
        description: 'Sales opportunity stage reference',
        grain: 'One row per stage type',
        keyColumns: ['stage_key', 'stage_name'],
      },
      {
        name: 'silver.dim_crm_campaign',
        type: 'Dimension',
        description: 'SALESFORCE campaign dimension',
        grain: 'One row per campaign',
        keyColumns: ['campaign_key', 'campaign_id'],
      },
      {
        name: 'silver.fct_crm_opportunity',
        type: 'Fact',
        description: 'Opportunity pipeline with revenue metrics',
        grain: 'One row per opportunity',
        keyColumns: ['opportunity_id', 'account_id', 'opportunity_date'],
      },
      {
        name: 'silver.fct_crm_activity',
        type: 'Fact',
        description: 'Aggregated activity metrics by contact and type',
        grain: 'One row per activity',
        keyColumns: ['activity_id', 'contact_id', 'activity_date'],
      },
      {
        name: 'silver.fct_campaign_response',
        type: 'Fact',
        description: 'Campaign response and engagement',
        grain: 'One row per response',
        keyColumns: ['response_id', 'campaign_id', 'contact_id', 'response_date'],
      },
      {
        name: 'silver.fct_customer_engagement',
        type: 'Fact',
        description: 'Engagement scoring and trends',
        grain: 'One row per engagement',
        keyColumns: ['engagement_id', 'contact_id', 'engagement_date'],
      },
      {
        name: 'silver.fct_sales_forecast',
        type: 'Fact',
        description: 'Sales forecast tracking and accuracy',
        grain: 'One row per forecast',
        keyColumns: ['forecast_id', 'user_id', 'forecast_date'],
      },
      {
        name: 'silver.dim_contact_account_relationship',
        type: 'Dimension',
        description: 'Contact-account relationship types',
        grain: 'One row per relationship type',
        keyColumns: ['relationship_key', 'relationship_type'],
      },
    ],
  },

  // Gold Layer: Star Schema
  gold: {
    dimensions: {
      count: 9,
      list: [
        {
          name: 'gold.dim_account',
          description: 'Account master with financial and operational attributes',
          columns: ['account_key', 'account_id', 'account_name', 'account_type', 'industry', 'revenue_range', 'employee_count', 'territory', 'account_status', 'effective_from', 'effective_to'],
        },
        {
          name: 'gold.dim_contact',
          description: 'Contact attributes with account relationships',
          columns: ['contact_key', 'contact_id', 'contact_name', 'title', 'email', 'phone', 'department', 'account_key', 'contact_status', 'effective_from', 'effective_to'],
        },
        {
          name: 'gold.dim_sales_rep',
          description: 'Sales representative and team structure',
          columns: ['rep_key', 'rep_id', 'rep_name', 'email', 'manager_id', 'territory', 'department', 'hire_date', 'is_active'],
        },
        {
          name: 'gold.dim_opportunity',
          description: 'Opportunity attributes and classification',
          columns: ['opportunity_key', 'opportunity_id', 'opportunity_name', 'product_line', 'opportunity_type', 'stage_name', 'probability', 'effective_from', 'effective_to'],
        },
        {
          name: 'gold.dim_crm_campaign',
          description: 'Campaign attributes and campaign type',
          columns: ['campaign_key', 'campaign_id', 'campaign_name', 'campaign_type', 'channel', 'status', 'budget', 'start_date', 'end_date', 'effective_from', 'effective_to'],
        },
        {
          name: 'gold.dim_activity_type',
          description: 'Activity type reference (call, email, meeting, etc)',
          columns: ['activity_type_key', 'activity_type', 'activity_category', 'typical_duration_minutes'],
        },
        {
          name: 'gold.dim_date',
          description: 'Standard date dimension',
          columns: ['date_key', 'date', 'year', 'quarter', 'month', 'week', 'day_of_week', 'is_holiday'],
        },
        {
          name: 'gold.dim_engagement_level',
          description: 'Engagement score and level classification',
          columns: ['engagement_level_key', 'engagement_score_range', 'engagement_level', 'engagement_category', 'action_recommended'],
        },
        {
          name: 'gold.dim_sales_stage',
          description: 'Sales opportunity stage progression',
          columns: ['stage_key', 'stage_id', 'stage_name', 'stage_order', 'win_probability_avg', 'typical_cycle_days'],
        },
      ],
    },
    facts: {
      count: 7,
      list: [
        {
          name: 'gold.fct_crm_opportunity',
          description: 'Sales opportunity pipeline and metrics',
          grain: 'One row per opportunity',
          measureColumns: [
            'opportunity_id', 'account_key', 'contact_key', 'rep_key', 'stage_key', 'date_key',
            'opportunity_amount', 'probability_percent', 'expected_revenue',
            'days_in_stage', 'days_in_pipeline', 'forecast_category',
            'is_closed_flag', 'is_won_flag', 'closed_amount', 'discount_percent',
            'commission_amount', 'forecast_accuracy_flag'
          ],
        },
        {
          name: 'gold.fct_crm_activity',
          description: 'Customer interaction activities and engagement',
          grain: 'One row per activity',
          measureColumns: [
            'activity_id', 'contact_key', 'account_key', 'rep_key', 'activity_type_key', 'date_key',
            'activity_timestamp', 'duration_minutes', 'activity_outcome',
            'subject', 'notes_count', 'attachment_count',
            'follow_up_flag', 'follow_up_date',
            'activity_value_score', 'opportunity_influenced_flag'
          ],
        },
        {
          name: 'gold.fct_campaign_response',
          description: 'Campaign engagement and response tracking',
          grain: 'One row per response',
          measureColumns: [
            'response_id', 'campaign_key', 'contact_key', 'account_key', 'rep_key', 'date_key',
            'contact_id', 'campaign_id', 'response_timestamp',
            'response_type', 'response_flag', 'responded_flag', 'accepted_flag',
            'conversion_flag', 'conversion_value', 'conversion_revenue',
            'days_to_response', 'days_to_conversion'
          ],
        },
        {
          name: 'gold.fct_customer_engagement',
          description: 'Overall customer engagement scoring and trends',
          grain: 'One row per customer per date',
          measureColumns: [
            'engagement_id', 'contact_key', 'account_key', 'engagement_level_key', 'date_key',
            'contact_id', 'engagement_score', 'engagement_percentile',
            'engagement_date', 'engagement_trend', 'engagement_velocity',
            'activities_count_30day', 'activities_count_90day',
            'last_activity_days_ago', 'interaction_frequency_score',
            'response_rate_percent', 'engagement_forecast_score'
          ],
        },
        {
          name: 'gold.fct_account_health',
          description: 'Account health and relationship metrics',
          grain: 'One row per account per date',
          measureColumns: [
            'health_id', 'account_key', 'rep_key', 'date_key',
            'account_id', 'health_score', 'health_status',
            'pipeline_value', 'closed_revenue_ytd', 'growth_rate',
            'win_rate_percent', 'contract_renewal_date', 'days_to_renewal',
            'churn_risk_score', 'expansion_opportunity_count',
            'engagement_level', 'forecast_accuracy_rating'
          ],
        },
        {
          name: 'gold.fct_sales_forecast',
          description: 'Sales forecast accuracy and pipeline analysis',
          grain: 'One row per rep per period',
          measureColumns: [
            'forecast_id', 'rep_key', 'stage_key', 'date_key',
            'forecast_period', 'forecast_amount', 'actual_amount',
            'forecast_accuracy_percent', 'forecast_variance_percent',
            'opportunities_count', 'weighted_pipeline', 'best_case_amount',
            'worst_case_amount', 'commit_flag'
          ],
        },
        {
          name: 'gold.fct_contact_touchpoint',
          description: 'Multi-channel customer touchpoint tracking',
          grain: 'One row per touchpoint',
          measureColumns: [
            'touchpoint_id', 'contact_key', 'account_key', 'campaign_key', 'date_key',
            'contact_id', 'touchpoint_date', 'channel', 'channel_type',
            'message_type', 'engagement_flag', 'response_flag', 'conversion_flag',
            'influence_attribution_weight', 'revenue_attributed',
            'was_first_touch_flag', 'was_last_touch_flag', 'touchpoint_value'
          ],
        },
      ],
    },
    totalTables: 16,
    estimatedSize: '1.3TB',
  },

  // Metrics Catalog
  metrics: {
    totalMetrics: 280,
    totalCategories: 9,
    categories: [
      {
        name: 'Account Management Metrics',
        count: 35,
        examples: [
          'Total Accounts',
          'Active Accounts',
          'New Accounts MTD',
          'Account Health Score',
          'Account Growth Rate',
          'Account Revenue',
          'Account Lifetime Value',
          'Account Churn Rate',
        ],
      },
      {
        name: 'Sales Opportunity Metrics',
        count: 40,
        examples: [
          'Total Opportunity Pipeline',
          'Open Opportunities',
          'Opportunities by Stage',
          'Win Rate',
          'Average Deal Size',
          'Sales Cycle Length',
          'Forecast Accuracy',
          'Revenue Forecast',
        ],
      },
      {
        name: 'Sales Activity Metrics',
        count: 30,
        examples: [
          'Total Activities',
          'Activities by Type (calls, emails, meetings)',
          'Activity Per Rep',
          'Activity Frequency',
          'Activity to Opportunity Ratio',
          'Activity Response Rate',
          'Follow-up Compliance Rate',
        ],
      },
      {
        name: 'Contact & Engagement Metrics',
        count: 35,
        examples: [
          'Total Contacts',
          'Active Contacts',
          'Contact Engagement Score',
          'Contact Sentiment',
          'Contact Activity Level',
          'Contact Interaction Frequency',
          'Contact Last Activity Days',
          'Contact Lifecycle Stage',
        ],
      },
      {
        name: 'Campaign Performance Metrics',
        count: 30,
        examples: [
          'Campaign Response Rate',
          'Campaign Conversion Rate',
          'Campaign Cost per Response',
          'Campaign Revenue Influenced',
          'Campaign ROI',
          'Email Open Rate',
          'Email Click Rate',
        ],
      },
      {
        name: 'Sales Rep Performance Metrics',
        count: 35,
        examples: [
          'Rep Revenue',
          'Rep Quota Attainment %',
          'Rep Pipeline Value',
          'Rep Win Rate',
          'Rep Activity Count',
          'Rep Activity Quality Score',
          'Rep Forecast Accuracy',
          'Rep Commission',
        ],
      },
      {
        name: 'Lead Quality & Conversion Metrics',
        count: 30,
        examples: [
          'Lead-to-Opportunity Conversion Rate',
          'Lead Quality Score',
          'Lead Response Time',
          'Lead Source Effectiveness',
          'Opportunity Win Rate by Source',
          'Sales Cycle by Lead Source',
        ],
      },
      {
        name: 'Territory & Quota Metrics',
        count: 25,
        examples: [
          'Territory Revenue',
          'Territory Quota Attainment %',
          'Territory Pipeline',
          'Territory Win Rate',
          'Territory Account Growth',
          'Territory Market Penetration %',
        ],
      },
      {
        name: 'Cross-Domain Integration Metrics',
        count: 20,
        examples: [
          'CRM-to-Marketing Orchestration Sync Rate',
          'Customer Master Data Quality Score',
          'Cross-sell Opportunities Identified',
          'Upsell Opportunities Identified',
          'Revenue Influenced by Orchestration',
          'SALESFORCE-PEGA Data Consistency',
        ],
      },
    ],
  },

  // Relationships to other domains
  relationships: {
    customerCore: {
      relationship: 'Many-to-One',
      description: 'Contacts and accounts map to Customer Core domain',
      joinKey: 'customer_id',
    },
    marketingOrchestration: {
      relationship: 'One-to-Many',
      description: 'CRM campaigns integrated with PEGA orchestration',
      joinKey: 'campaign_id',
    },
    deposits: {
      relationship: 'Many-to-One',
      description: 'Account opportunities for deposit products',
      joinKey: 'account_id',
    },
    loans: {
      relationship: 'Many-to-One',
      description: 'Loan opportunities and credit lines',
      joinKey: 'account_id',
    },
    cards: {
      relationship: 'Many-to-One',
      description: 'Credit card and merchant acquiring opportunities',
      joinKey: 'account_id',
    },
    revenue: {
      relationship: 'One-to-Many',
      description: 'Sales revenue and commission tracking',
      joinKey: 'opportunity_id',
    },
  },

  // Data Governance
  governance: {
    dataClassification: 'Confidential',
    piiFields: ['contact_id', 'contact_name', 'email', 'phone', 'address'],
    regulatoryRequirements: [
      'GDPR - Contact consent and preferences',
      'CCPA - Contact privacy rights',
      'SOX - Sales process controls',
      'GLBA - Data privacy and security',
      'Sarbanes-Oxley - Financial controls',
    ],
    accessControl: 'Role-based (Sales, Marketing, Analytics, Finance)',
    auditingRequired: true,
    consentTracking: true,
  },

  // SLA
  sla: {
    uptime: 99.95,
    maxLatencyHours: 0.25,
    rpo: 'Real-time',
    rto: '2 hours',
    dataRetention: '36 months',
  },

  // Status Summary
  summary: {
    completionStatus: '100% Complete',
    bronzeCoverage: '100% - All SALESFORCE objects extracted',
    silverCoverage: '100% - All transformations implemented',
    goldCoverage: '100% - Star schema dimensional model',
    metricsCoverage: '100% - 280+ business metrics defined',
    readinessForAnalytics: '✅ BI-Ready',
    readinessForML: '✅ ML-Ready',
  },
};
