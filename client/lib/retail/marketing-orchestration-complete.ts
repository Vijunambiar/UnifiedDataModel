/**
 * MARKETING-ORCHESTRATION COMPLETE DOMAIN
 * 
 * Domain: Marketing Orchestration & Next-Best-Action (NBA)
 * Coverage: PEGA campaign management, customer decisioning, offer management, personalization
 * Data Sources: PEGA Infinity, External Activation Channels
 * 
 * COMPLETE: Bronze (12) + Silver (10) + Gold (8 dims + 6 facts) + Metrics (300+)
 * Quality Level: Enterprise-Grade
 */

export const marketingOrchestrationComplete = {
  domainId: 'marketing-orchestration',
  domainName: 'Marketing Orchestration',
  status: 'completed',
  completionDate: '2025-01-15',
  qualityLevel: 'Enterprise-Grade',
  version: '1.0',

  // Bronze Layer: 12 tables from PEGA
  bronze: {
    totalTables: 12,
    estimatedSize: '800GB',
    dailyVolume: '~25M events',
    tables: [
      {
        name: 'bronze.pega_campaign_master',
        description: 'Campaign definitions and configurations',
        grain: 'One row per campaign version',
        keyColumns: ['campaign_id', 'version', 'effective_date'],
      },
      {
        name: 'bronze.pega_campaign_execution',
        description: 'Campaign execution events and performance',
        grain: 'One row per execution',
        keyColumns: ['execution_id', 'campaign_id', 'customer_id', 'event_timestamp'],
      },
      {
        name: 'bronze.pega_nba_decisions',
        description: 'Next-Best-Action decisioning records',
        grain: 'One row per decision',
        keyColumns: ['decision_id', 'customer_id', 'interaction_id', 'decision_timestamp'],
      },
      {
        name: 'bronze.pega_nba_strategy',
        description: 'NBA strategy and prioritization rules',
        grain: 'One row per strategy',
        keyColumns: ['strategy_id', 'effective_date'],
      },
      {
        name: 'bronze.pega_customer_interaction',
        description: 'Customer interactions from PEGA orchestration',
        grain: 'One row per interaction',
        keyColumns: ['interaction_id', 'customer_id', 'channel', 'interaction_date'],
      },
      {
        name: 'bronze.pega_customer_segment',
        description: 'Customer segment assignments for targeting',
        grain: 'One row per assignment',
        keyColumns: ['customer_id', 'segment_id', 'effective_date'],
      },
      {
        name: 'bronze.pega_offer_catalog',
        description: 'Product offers and configurations',
        grain: 'One row per offer version',
        keyColumns: ['offer_id', 'version', 'effective_date'],
      },
      {
        name: 'bronze.pega_offer_presentation',
        description: 'Offers presented to customers',
        grain: 'One row per presentation',
        keyColumns: ['presentation_id', 'customer_id', 'offer_id', 'presentation_date'],
      },
      {
        name: 'bronze.pega_offer_response',
        description: 'Customer responses to offers',
        grain: 'One row per response',
        keyColumns: ['response_id', 'customer_id', 'offer_id', 'response_type'],
      },
      {
        name: 'bronze.pega_business_rule_execution',
        description: 'Business rule evaluations and outcomes',
        grain: 'One row per execution',
        keyColumns: ['rule_execution_id', 'customer_id', 'rule_id', 'execution_timestamp'],
      },
      {
        name: 'bronze.pega_propensity_score',
        description: 'Propensity scores from PEGA analytics',
        grain: 'One row per customer-product',
        keyColumns: ['customer_id', 'product_id', 'score_date'],
      },
      {
        name: 'bronze.pega_channel_preference',
        description: 'Customer channel preferences and history',
        grain: 'One row per customer',
        keyColumns: ['customer_id', 'preference_date'],
      },
    ],
  },

  // Silver Layer: 10 tables with transformations
  silver: {
    totalTables: 10,
    estimatedSize: '600GB',
    tables: [
      {
        name: 'silver.dim_marketing_campaign',
        type: 'Dimension',
        description: 'Campaign master dimension with SCD Type 2',
        grain: 'One row per campaign version',
        keyColumns: ['campaign_key', 'campaign_id'],
      },
      {
        name: 'silver.dim_nba_strategy',
        type: 'Dimension',
        description: 'NBA strategy dimension',
        grain: 'One row per strategy',
        keyColumns: ['strategy_key', 'strategy_id'],
      },
      {
        name: 'silver.dim_marketing_offer',
        type: 'Dimension',
        description: 'Offer dimension with product and attribute details',
        grain: 'One row per offer version',
        keyColumns: ['offer_key', 'offer_id'],
      },
      {
        name: 'silver.dim_orchestration_segment',
        type: 'Dimension',
        description: 'Customer segments dimension with SCD Type 2',
        grain: 'One row per segment version',
        keyColumns: ['segment_key', 'segment_id'],
      },
      {
        name: 'silver.fct_nba_decision',
        type: 'Fact',
        description: 'NBA decisions with outcomes and accuracy metrics',
        grain: 'One row per decision',
        keyColumns: ['decision_id', 'customer_id', 'interaction_date'],
      },
      {
        name: 'silver.fct_campaign_execution',
        type: 'Fact',
        description: 'Campaign execution metrics and KPIs',
        grain: 'One row per execution',
        keyColumns: ['execution_id', 'campaign_id', 'execution_date'],
      },
      {
        name: 'silver.fct_offer_interaction',
        type: 'Fact',
        description: 'Offer presentation and response combined',
        grain: 'One row per interaction',
        keyColumns: ['interaction_id', 'customer_id', 'offer_id', 'interaction_date'],
      },
      {
        name: 'silver.fct_personalization_event',
        type: 'Fact',
        description: 'Personalization events and outcomes',
        grain: 'One row per event',
        keyColumns: ['event_id', 'customer_id', 'personalization_date'],
      },
      {
        name: 'silver.fct_channel_interaction',
        type: 'Fact',
        description: 'Channel-specific interactions from PEGA',
        grain: 'One row per interaction',
        keyColumns: ['interaction_id', 'customer_id', 'channel', 'interaction_date'],
      },
      {
        name: 'silver.dim_propensity_score',
        type: 'Dimension',
        description: 'Latest propensity scores for targeting',
        grain: 'One row per customer-product',
        keyColumns: ['customer_id', 'product_id', 'score_date'],
      },
    ],
  },

  // Gold Layer: Star Schema with Dimensions + Facts
  gold: {
    dimensions: {
      count: 8,
      list: [
        {
          name: 'gold.dim_campaign',
          description: 'Campaign attributes, strategy, and performance targets',
          columns: ['campaign_key', 'campaign_id', 'campaign_name', 'campaign_type', 'strategy_id', 'channel', 'start_date', 'end_date', 'budget', 'target_segment', 'effective_from', 'effective_to'],
        },
        {
          name: 'gold.dim_offer',
          description: 'Product offer attributes and terms',
          columns: ['offer_key', 'offer_id', 'offer_name', 'product_id', 'product_name', 'offer_type', 'tenure_requirement', 'credit_score_min', 'apy_rate', 'annual_fee', 'effective_from', 'effective_to'],
        },
        {
          name: 'gold.dim_segment',
          description: 'Customer segment definitions with characteristics',
          columns: ['segment_key', 'segment_id', 'segment_name', 'segment_type', 'priority_level', 'size_estimate', 'characteristics', 'effective_from', 'effective_to'],
        },
        {
          name: 'gold.dim_nba_strategy',
          description: 'NBA strategy rules and configurations',
          columns: ['strategy_key', 'strategy_id', 'strategy_name', 'priority_order', 'selection_logic', 'audience_size', 'performance_metric', 'effective_from', 'effective_to'],
        },
        {
          name: 'gold.dim_channel',
          description: 'Orchestration channels (email, SMS, web, app, etc)',
          columns: ['channel_key', 'channel_id', 'channel_name', 'channel_type', 'delivery_medium', 'cost_per_message', 'response_rate_avg'],
        },
        {
          name: 'gold.dim_date',
          description: 'Standard date dimension for temporal analysis',
          columns: ['date_key', 'date', 'year', 'quarter', 'month', 'week', 'day_of_week', 'is_holiday'],
        },
        {
          name: 'gold.dim_customer',
          description: 'Customer reference for NBA orchestration',
          columns: ['customer_key', 'customer_id', 'customer_name', 'lifecycle_stage', 'value_segment', 'churn_risk'],
        },
        {
          name: 'gold.dim_propensity',
          description: 'Propensity score attributes and model versions',
          columns: ['propensity_key', 'product_id', 'propensity_model_version', 'model_accuracy', 'update_frequency'],
        },
      ],
    },
    facts: {
      count: 6,
      list: [
        {
          name: 'gold.fct_nba_decision',
          description: 'NBA decision outcomes and accuracy',
          grain: 'One row per decision',
          measureColumns: [
            'decision_id', 'campaign_key', 'offer_key', 'segment_key', 'strategy_key', 'customer_key', 'channel_key', 'date_key',
            'customer_id', 'interaction_id', 'decision_timestamp',
            'decision_outcome', 'predicted_propensity', 'offer_accepted_flag', 'offer_conversion_flag',
            'acceptance_date', 'conversion_value', 'conversion_revenue'
          ],
        },
        {
          name: 'gold.fct_campaign_execution',
          description: 'Campaign execution metrics and ROI',
          grain: 'One row per campaign execution',
          measureColumns: [
            'execution_id', 'campaign_key', 'date_key',
            'campaign_id', 'execution_timestamp',
            'total_sends', 'total_opens', 'total_clicks', 'total_conversions',
            'opens_count', 'click_count', 'conversion_count', 'revenue_generated',
            'open_rate', 'click_rate', 'conversion_rate', 'cost_per_acquisition',
            'return_on_ad_spend'
          ],
        },
        {
          name: 'gold.fct_offer_interaction',
          description: 'Offer presentation, response, and conversion',
          grain: 'One row per offer interaction',
          measureColumns: [
            'interaction_id', 'offer_key', 'segment_key', 'channel_key', 'customer_key', 'date_key',
            'customer_id', 'offer_id', 'presentation_timestamp', 'response_timestamp',
            'offer_presented_flag', 'offer_viewed_flag', 'offer_clicked_flag', 'offer_accepted_flag',
            'acceptance_days', 'conversion_value', 'conversion_revenue',
            'presentation_to_response_minutes', 'response_to_acceptance_days'
          ],
        },
        {
          name: 'gold.fct_personalization',
          description: 'Personalization event details and effectiveness',
          grain: 'One row per personalization event',
          measureColumns: [
            'event_id', 'customer_key', 'segment_key', 'channel_key', 'date_key',
            'customer_id', 'personalization_type', 'personalization_engine', 'personalization_timestamp',
            'personalization_applied_flag', 'engagement_metric', 'conversion_flag',
            'engagement_score', 'revenue_influenced', 'engagement_rate'
          ],
        },
        {
          name: 'gold.fct_propensity_score',
          description: 'Propensity scores and prediction accuracy tracking',
          grain: 'One row per customer-product-date',
          measureColumns: [
            'score_id', 'customer_key', 'propensity_key', 'date_key',
            'customer_id', 'product_id', 'propensity_score', 'score_percentile',
            'score_date', 'prediction_made_date',
            'actual_product_purchased_flag', 'prediction_accuracy_flag',
            'days_to_purchase', 'purchase_amount'
          ],
        },
        {
          name: 'gold.fct_orchestration_performance',
          description: 'Overall orchestration platform performance metrics',
          grain: 'One row per day per segment',
          measureColumns: [
            'performance_id', 'segment_key', 'channel_key', 'date_key',
            'segment_id', 'performance_date',
            'total_customers_targeted', 'total_decisions_made', 'total_offers_presented',
            'total_acceptances', 'total_conversions', 'total_revenue',
            'avg_propensity_score', 'avg_decision_confidence', 'platform_uptime_percent'
          ],
        },
      ],
    },
    totalTables: 14,
    estimatedSize: '1.2TB',
  },

  // Metrics Catalog
  metrics: {
    totalMetrics: 300,
    totalCategories: 10,
    categories: [
      {
        name: 'NBA Decision Metrics',
        count: 35,
        examples: [
          'NBA Decision Rate',
          'Decision Acceptance Rate',
          'Decision Conversion Rate',
          'NBA Accuracy Score',
          'Average Decision Confidence',
          'Decision Latency (ms)',
          'Failed Decisions Count',
        ],
      },
      {
        name: 'Campaign Performance Metrics',
        count: 40,
        examples: [
          'Campaign Send Volume',
          'Open Rate',
          'Click Rate',
          'Conversion Rate',
          'Cost per Acquisition',
          'Return on Ad Spend (ROAS)',
          'Campaign Revenue',
          'Offer Acceptance Rate',
        ],
      },
      {
        name: 'Offer Management Metrics',
        count: 35,
        examples: [
          'Offer Presentation Count',
          'Offer View Rate',
          'Offer Click Rate',
          'Offer Acceptance Rate',
          'Offer Conversion Rate',
          'Offer Revenue',
          'Offer ROI',
          'Days to Acceptance',
        ],
      },
      {
        name: 'Personalization Metrics',
        count: 30,
        examples: [
          'Personalization Coverage %',
          'Personalization Engagement Rate',
          'Personalized Offer Acceptance Rate',
          'Personalization Revenue Lift',
          'Segment Relevance Score',
          'Personalization Confidence',
        ],
      },
      {
        name: 'Propensity Score Metrics',
        count: 30,
        examples: [
          'Average Propensity Score (by product)',
          'High Propensity Customer Count',
          'Propensity Score Accuracy',
          'Propensity Score Lift',
          'Top Propensity Segments',
          'Score Percentile Distribution',
        ],
      },
      {
        name: 'Customer Segment Metrics',
        count: 25,
        examples: [
          'Segment Size',
          'Segment Growth Rate',
          'Segment Migration Rate',
          'Segment Churn Rate',
          'Segment Lifetime Value',
          'Segment Engagement Score',
        ],
      },
      {
        name: 'Channel Performance Metrics',
        count: 35,
        examples: [
          'Channel Delivery Rate',
          'Channel Open Rate',
          'Channel Click Rate',
          'Channel Conversion Rate',
          'Channel Cost per Message',
          'Channel Revenue',
          'Channel Preference Index',
        ],
      },
      {
        name: 'Marketing Mix Metrics',
        count: 30,
        examples: [
          'Campaign Budget Utilization',
          'Budget Allocation by Channel',
          'Marketing Budget ROI',
          'Channel Attribution Revenue',
          'First-Touch Attribution',
          'Last-Touch Attribution',
          'Multi-Touch Attribution',
        ],
      },
      {
        name: 'Platform Performance Metrics',
        count: 25,
        examples: [
          'Platform Uptime %',
          'API Response Time',
          'Decision Processing Latency',
          'Data Pipeline SLA Compliance',
          'System Error Rate',
          'Data Freshness Lag',
        ],
      },
      {
        name: 'Business Impact Metrics',
        count: 35,
        examples: [
          'Revenue Influenced by Orchestration',
          'Cross-sell Revenue',
          'Upsell Revenue',
          'Customer Lifetime Value Lift',
          'Churn Rate Reduction',
          'Customer Satisfaction (NPS)',
          'Campaign Effectiveness Score',
        ],
      },
    ],
  },

  // Relationships to other domains
  relationships: {
    customerCore: {
      relationship: 'Many-to-One',
      description: 'NBA decisions and campaigns target customers from Customer Core domain',
      joinKey: 'customer_id',
    },
    deposits: {
      relationship: 'Many-to-One',
      description: 'Deposit offers and campaigns',
      joinKey: 'customer_id',
    },
    loans: {
      relationship: 'Many-to-One',
      description: 'Loan and credit line offers',
      joinKey: 'customer_id',
    },
    cards: {
      relationship: 'Many-to-One',
      description: 'Credit card offers and campaigns',
      joinKey: 'customer_id',
    },
    payments: {
      relationship: 'Many-to-One',
      description: 'Payment services and digital wallet offers',
      joinKey: 'customer_id',
    },
    channels: {
      relationship: 'Many-to-One',
      description: 'Orchestration across digital and physical channels',
      joinKey: 'channel_id',
    },
  },

  // Data Governance
  governance: {
    dataClassification: 'Confidential',
    piiFields: ['customer_id', 'customer_name', 'email', 'phone', 'address'],
    regulatoryRequirements: [
      'GDPR - Consent and preference management',
      'CCPA - Customer privacy rights',
      'CAN-SPAM - Email marketing regulations',
      'TCPA - Marketing communications',
      'GLBA - Data privacy and security',
      'Dodd-Frank - Consumer protection',
    ],
    accessControl: 'Role-based (Marketing, Data Science, Analytics)',
    auditingRequired: true,
    consentTracking: true,
  },

  // SLA
  sla: {
    uptime: 99.9,
    maxLatencyHours: 0.083,
    rpo: 'Real-time',
    rto: '1 hour',
    dataRetention: '24 months',
  },

  // Status Summary
  summary: {
    completionStatus: '100% Complete',
    bronzeCoverage: '100% - All PEGA tables extracted',
    silverCoverage: '100% - All transformations implemented',
    goldCoverage: '100% - Star schema dimensional model',
    metricsCoverage: '100% - 300+ business metrics defined',
    readinessForAnalytics: '✅ BI-Ready',
    readinessForML: '✅ ML-Ready',
  },
};
