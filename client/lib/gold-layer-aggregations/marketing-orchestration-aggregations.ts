/**
 * MARKETING ORCHESTRATION GOLD LAYER AGGREGATIONS
 * 
 * Pre-aggregated metrics tables for fast BI/Analytics querying
 * Optimized for common reporting and analytical patterns
 * 
 * Aggregation Strategy:
 * - Daily aggregations by segment, campaign, channel, offer
 * - Weekly aggregations for trend analysis
 * - Monthly aggregations for executive reporting
 * - Real-time aggregations for operational dashboards
 */

export interface GoldAggregation {
  name: string;
  description: string;
  grain: string;
  refreshFrequency: string;
  sourceFactTables: string[];
  dimensions: string[];
  measures: string[];
  estimatedRows: number;
}

export const marketingOrchestrationAggregations: GoldAggregation[] = [
  {
    name: 'gold.agg_campaign_daily',
    description: 'Daily campaign performance aggregation by campaign, channel, and date',
    grain: 'One row per campaign-channel-date combination',
    refreshFrequency: 'Daily at 1:00 AM UTC',
    sourceFactTables: ['gold.fct_campaign_execution', 'gold.fct_offer_interaction'],
    dimensions: ['campaign_key', 'channel_key', 'date_key', 'segment_key'],
    measures: [
      'total_sends',
      'total_opens',
      'total_clicks',
      'total_conversions',
      'total_revenue',
      'open_rate',
      'click_rate',
      'conversion_rate',
      'cost_per_acquisition',
      'return_on_ad_spend',
      'avg_conversion_value',
    ],
    estimatedRows: 10000,
  },
  {
    name: 'gold.agg_nba_decision_daily',
    description: 'Daily NBA decision outcomes and accuracy metrics',
    grain: 'One row per strategy-segment-date combination',
    refreshFrequency: 'Daily at 1:15 AM UTC',
    sourceFactTables: ['gold.fct_nba_decision'],
    dimensions: ['strategy_key', 'segment_key', 'date_key', 'channel_key'],
    measures: [
      'total_decisions',
      'accepted_decisions',
      'converted_decisions',
      'decision_acceptance_rate',
      'decision_conversion_rate',
      'avg_propensity_score',
      'revenue_influenced',
      'roi_on_decisions',
      'decision_confidence_avg',
      'failed_decisions_count',
    ],
    estimatedRows: 5000,
  },
  {
    name: 'gold.agg_offer_performance_daily',
    description: 'Daily offer performance by offer, segment, and channel',
    grain: 'One row per offer-segment-channel-date',
    refreshFrequency: 'Daily at 1:30 AM UTC',
    sourceFactTables: ['gold.fct_offer_interaction'],
    dimensions: ['offer_key', 'segment_key', 'channel_key', 'date_key'],
    measures: [
      'presentations_count',
      'views_count',
      'clicks_count',
      'acceptances_count',
      'conversions_count',
      'presentation_to_acceptance_rate',
      'acceptance_to_conversion_rate',
      'offer_roi',
      'revenue_per_offer',
      'avg_acceptance_days',
    ],
    estimatedRows: 25000,
  },
  {
    name: 'gold.agg_segment_engagement_daily',
    description: 'Daily engagement metrics by customer segment',
    grain: 'One row per segment-channel-date',
    refreshFrequency: 'Daily at 1:45 AM UTC',
    sourceFactTables: ['gold.fct_nba_decision', 'gold.fct_personalization'],
    dimensions: ['segment_key', 'channel_key', 'date_key'],
    measures: [
      'active_customers_count',
      'engagement_events_count',
      'avg_engagement_score',
      'high_engagement_pct',
      'medium_engagement_pct',
      'low_engagement_pct',
      'engagement_trend',
      'churn_risk_customers_count',
    ],
    estimatedRows: 8000,
  },
  {
    name: 'gold.agg_propensity_distribution_daily',
    description: 'Daily propensity score distribution by product and segment',
    grain: 'One row per product-segment-propensity_bucket-date',
    refreshFrequency: 'Daily at 2:00 AM UTC',
    sourceFactTables: ['gold.fct_propensity_score'],
    dimensions: ['propensity_key', 'segment_key', 'date_key'],
    measures: [
      'customers_in_bucket',
      'avg_propensity_score',
      'predicted_purchase_rate',
      'actual_purchase_count',
      'prediction_accuracy',
      'lift_vs_random',
    ],
    estimatedRows: 5000,
  },
  {
    name: 'gold.agg_channel_performance_daily',
    description: 'Daily channel effectiveness for orchestration',
    grain: 'One row per channel-date',
    refreshFrequency: 'Daily at 2:15 AM UTC',
    sourceFactTables: ['gold.fct_campaign_execution', 'gold.fct_channel_interaction'],
    dimensions: ['channel_key', 'date_key'],
    measures: [
      'total_messages',
      'delivery_rate',
      'bounce_rate',
      'open_rate',
      'click_rate',
      'conversion_rate',
      'cost_per_message',
      'revenue_per_message',
      'channel_preference_score',
      'response_time_minutes',
    ],
    estimatedRows: 500,
  },
  {
    name: 'gold.agg_personalization_effectiveness_daily',
    description: 'Daily metrics on personalization impact',
    grain: 'One row per personalization_type-date',
    refreshFrequency: 'Daily at 2:30 AM UTC',
    sourceFactTables: ['gold.fct_personalization'],
    dimensions: ['date_key'],
    measures: [
      'total_personalized_events',
      'personalization_coverage_pct',
      'personalized_engagement_rate',
      'non_personalized_engagement_rate',
      'personalization_lift',
      'personalized_conversion_rate',
      'non_personalized_conversion_rate',
      'conversion_lift_from_personalization',
      'revenue_influenced_by_personalization',
      'roi_on_personalization',
    ],
    estimatedRows: 365,
  },
  {
    name: 'gold.agg_marketing_roi_daily',
    description: 'Daily marketing ROI and efficiency metrics',
    grain: 'One row per campaign-date',
    refreshFrequency: 'Daily at 2:45 AM UTC',
    sourceFactTables: ['gold.fct_campaign_execution', 'gold.fct_offer_interaction'],
    dimensions: ['campaign_key', 'date_key'],
    measures: [
      'campaign_budget_spent',
      'campaign_revenue_generated',
      'campaign_roi_pct',
      'customer_acquisition_cost',
      'lifetime_value_influenced',
      'payback_period_days',
      'cost_per_acquisition',
      'revenue_per_marketing_dollar',
    ],
    estimatedRows: 15000,
  },
];

export const marketingOrchestrationWeeklyAggregations: GoldAggregation[] = [
  {
    name: 'gold.agg_campaign_weekly',
    description: 'Weekly campaign performance trends',
    grain: 'One row per campaign-week',
    refreshFrequency: 'Weekly on Monday at 3:00 AM UTC',
    sourceFactTables: ['gold.agg_campaign_daily'],
    dimensions: ['campaign_key', 'week_key'],
    measures: [
      'weekly_sends',
      'weekly_opens',
      'weekly_clicks',
      'weekly_conversions',
      'weekly_revenue',
      'week_over_week_growth_pct',
      'trend_direction',
    ],
    estimatedRows: 2000,
  },
  {
    name: 'gold.agg_segment_trends_weekly',
    description: 'Weekly segment engagement and health trends',
    grain: 'One row per segment-week',
    refreshFrequency: 'Weekly on Monday at 3:30 AM UTC',
    sourceFactTables: ['gold.agg_segment_engagement_daily'],
    dimensions: ['segment_key', 'week_key'],
    measures: [
      'week_avg_engagement_score',
      'engagement_trend',
      'churn_velocity',
      'new_high_propensity_customers',
      'migrated_segments_count',
    ],
    estimatedRows: 1000,
  },
];

export const marketingOrchestrationMonthlyAggregations: GoldAggregation[] = [
  {
    name: 'gold.agg_marketing_summary_monthly',
    description: 'Monthly executive summary of marketing orchestration',
    grain: 'One row per month',
    refreshFrequency: 'Monthly on 1st day at 4:00 AM UTC',
    sourceFactTables: ['gold.agg_campaign_weekly', 'gold.agg_segment_trends_weekly'],
    dimensions: ['month_key'],
    measures: [
      'total_campaigns_executed',
      'total_decisions_made',
      'total_offers_presented',
      'total_conversions',
      'total_revenue_influenced',
      'monthly_roi_pct',
      'avg_nba_accuracy',
      'platform_availability_pct',
      'customer_engagement_score',
      'customer_satisfaction_nps',
    ],
    estimatedRows: 120,
  },
];

export const marketingOrchestrationRealTimeAggregations: GoldAggregation[] = [
  {
    name: 'gold.agg_live_campaign_metrics',
    description: 'Real-time (last 24 hours) campaign metrics for operational dashboards',
    grain: 'One row per active campaign',
    refreshFrequency: 'Hourly',
    sourceFactTables: ['gold.fct_campaign_execution'],
    dimensions: ['campaign_key'],
    measures: [
      'sends_last_24h',
      'opens_last_24h',
      'clicks_last_24h',
      'conversions_last_24h',
      'current_open_rate',
      'current_click_rate',
      'current_conversion_rate',
      'campaign_status',
      'performance_vs_target_pct',
    ],
    estimatedRows: 500,
  },
  {
    name: 'gold.agg_live_nba_performance',
    description: 'Real-time NBA decision performance for operational monitoring',
    grain: 'One row per strategy',
    refreshFrequency: 'Every 15 minutes',
    sourceFactTables: ['gold.fct_nba_decision'],
    dimensions: ['strategy_key'],
    measures: [
      'decisions_last_1h',
      'acceptance_rate_last_1h',
      'conversion_rate_last_1h',
      'avg_decision_confidence',
      'processing_latency_ms',
      'system_uptime_pct',
      'error_rate_pct',
    ],
    estimatedRows: 100,
  },
];

export const marketingOrchestrationAggregationStrategy = {
  purpose: 'Enable fast BI/Analytics queries and real-time operational dashboards',
  tiers: {
    daily: {
      description: 'Detailed daily metrics for campaign and offer tracking',
      tables: 8,
      updateTime: '1:00-2:45 AM UTC',
      retention: '24 months',
    },
    weekly: {
      description: 'Trend analysis and period-over-period comparisons',
      tables: 2,
      updateTime: 'Every Monday 3:00-3:30 AM UTC',
      retention: '36 months',
    },
    monthly: {
      description: 'Executive summaries and strategic reporting',
      tables: 1,
      updateTime: '1st of month 4:00 AM UTC',
      retention: '60 months',
    },
    realTime: {
      description: 'Live operational metrics for dashboards and alerts',
      tables: 2,
      updateTime: 'Continuous (every 15 minutes)',
      retention: '7 days',
    },
  },
  storageEstimate: {
    daily: '50GB',
    weekly: '10GB',
    monthly: '2GB',
    realTime: '5GB',
    total: '~67GB',
  },
  performanceOptimizations: [
    'Partitioned by date for efficient range queries',
    'Clustered on frequently filtered dimensions',
    'Materialized views for common joins',
    'Summary tables for 80% of ad-hoc queries',
    'Indexed on campaign_key, segment_key, channel_key for fast filters',
  ],
};
