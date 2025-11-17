/**
 * CRM ANALYTICS GOLD LAYER AGGREGATIONS
 * 
 * Pre-aggregated metrics tables for fast BI/Analytics querying
 * Optimized for sales analytics, pipeline analysis, and forecast accuracy
 * 
 * Aggregation Strategy:
 * - Daily aggregations by rep, territory, stage, customer
 * - Weekly aggregations for pipeline tracking
 * - Monthly aggregations for quota management
 * - Real-time aggregations for sales ops dashboards
 */

export interface CRMGoldAggregation {
  name: string;
  description: string;
  grain: string;
  refreshFrequency: string;
  sourceFactTables: string[];
  dimensions: string[];
  measures: string[];
  estimatedRows: number;
}

export const crmAnalyticsAggregations: CRMGoldAggregation[] = [
  {
    name: 'gold.agg_opportunity_pipeline_daily',
    description: 'Daily opportunity pipeline by stage, rep, and account',
    grain: 'One row per stage-rep-account-date combination',
    refreshFrequency: 'Daily at 6:00 AM UTC',
    sourceFactTables: ['gold.fct_crm_opportunity'],
    dimensions: ['stage_key', 'rep_key', 'account_key', 'date_key'],
    measures: [
      'total_opportunities',
      'total_pipeline_value',
      'avg_opportunity_size',
      'total_expected_revenue',
      'total_probability_weighted_revenue',
      'average_days_in_stage',
      'opportunities_by_probability_bucket',
      'new_opportunities_count',
      'closed_opportunities_count',
      'won_opportunities_count',
    ],
    estimatedRows: 50000,
  },
  {
    name: 'gold.agg_account_health_daily',
    description: 'Daily account health scorecard',
    grain: 'One row per account-date',
    refreshFrequency: 'Daily at 6:15 AM UTC',
    sourceFactTables: ['gold.fct_account_health'],
    dimensions: ['account_key', 'rep_key', 'date_key'],
    measures: [
      'account_health_score',
      'health_status',
      'pipeline_value',
      'ytd_revenue',
      'growth_rate_pct',
      'win_rate_pct',
      'churn_risk_score',
      'expansion_opportunity_count',
      'contract_renewal_in_days',
      'forecast_accuracy_rating',
    ],
    estimatedRows: 100000,
  },
  {
    name: 'gold.agg_sales_rep_activity_daily',
    description: 'Daily sales activity metrics by rep',
    grain: 'One row per rep-date',
    refreshFrequency: 'Daily at 6:30 AM UTC',
    sourceFactTables: ['gold.fct_crm_activity'],
    dimensions: ['rep_key', 'date_key'],
    measures: [
      'total_activities',
      'calls_count',
      'emails_count',
      'meetings_count',
      'activities_per_opportunity',
      'avg_activity_duration_minutes',
      'activity_quality_score',
      'follow_up_compliance_rate',
      'opportunities_influenced_count',
      'revenue_influenced_from_activities',
    ],
    estimatedRows: 50000,
  },
  {
    name: 'gold.agg_contact_engagement_daily',
    description: 'Daily engagement metrics by contact',
    grain: 'One row per contact-date',
    refreshFrequency: 'Daily at 6:45 AM UTC',
    sourceFactTables: ['gold.fct_customer_engagement'],
    dimensions: ['contact_key', 'account_key', 'date_key'],
    measures: [
      'engagement_score',
      'engagement_level',
      'activities_in_30days',
      'activities_in_90days',
      'last_activity_days_ago',
      'response_rate_pct',
      'interaction_frequency_score',
      'engagement_trend',
      'forecast_engagement_score',
    ],
    estimatedRows: 300000,
  },
  {
    name: 'gold.agg_campaign_effectiveness_daily',
    description: 'Daily campaign response and effectiveness',
    grain: 'One row per campaign-date',
    refreshFrequency: 'Daily at 7:00 AM UTC',
    sourceFactTables: ['gold.fct_campaign_response'],
    dimensions: ['campaign_key', 'date_key'],
    measures: [
      'total_members',
      'responses_count',
      'response_rate_pct',
      'acceptances_count',
      'acceptance_rate_pct',
      'conversions_count',
      'conversion_rate_pct',
      'conversion_value',
      'campaign_roi_pct',
      'cost_per_response',
    ],
    estimatedRows: 10000,
  },
  {
    name: 'gold.agg_sales_forecast_accuracy_daily',
    description: 'Daily sales forecast accuracy tracking',
    grain: 'One row per rep-period-date',
    refreshFrequency: 'Daily at 7:15 AM UTC',
    sourceFactTables: ['gold.fct_sales_forecast'],
    dimensions: ['rep_key', 'stage_key', 'date_key'],
    measures: [
      'forecast_amount',
      'actual_amount',
      'forecast_variance_pct',
      'forecast_accuracy_pct',
      'opportunities_count',
      'weighted_pipeline',
      'best_case_amount',
      'worst_case_amount',
      'commit_flag',
    ],
    estimatedRows: 100000,
  },
  {
    name: 'gold.agg_lead_quality_daily',
    description: 'Daily lead quality and conversion metrics',
    grain: 'One row per source-date',
    refreshFrequency: 'Daily at 7:30 AM UTC',
    sourceFactTables: ['gold.fct_crm_opportunity'],
    dimensions: ['date_key'],
    measures: [
      'total_leads',
      'leads_converted_to_opportunities',
      'lead_to_opportunity_rate_pct',
      'avg_sales_cycle_days',
      'opportunities_won_from_leads',
      'win_rate_pct',
      'revenue_from_leads',
      'quality_score_avg',
    ],
    estimatedRows: 500,
  },
  {
    name: 'gold.agg_territory_performance_daily',
    description: 'Daily territory sales performance',
    grain: 'One row per territory-date',
    refreshFrequency: 'Daily at 7:45 AM UTC',
    sourceFactTables: ['gold.fct_crm_opportunity', 'gold.fct_account_health'],
    dimensions: ['rep_key', 'date_key'],
    measures: [
      'territory_revenue',
      'territory_quota',
      'quota_attainment_pct',
      'territory_pipeline',
      'win_rate_pct',
      'account_growth_pct',
      'market_penetration_pct',
      'new_account_count',
    ],
    estimatedRows: 50000,
  },
];

export const crmAnalyticsWeeklyAggregations: CRMGoldAggregation[] = [
  {
    name: 'gold.agg_opportunity_pipeline_weekly',
    description: 'Weekly opportunity pipeline for trend analysis',
    grain: 'One row per stage-rep-week',
    refreshFrequency: 'Weekly on Monday at 8:00 AM UTC',
    sourceFactTables: ['gold.agg_opportunity_pipeline_daily'],
    dimensions: ['stage_key', 'rep_key', 'week_key'],
    measures: [
      'week_avg_pipeline',
      'week_new_opportunities',
      'week_closed_opportunities',
      'week_won_opportunities',
      'week_over_week_growth_pct',
      'pipeline_trend',
    ],
    estimatedRows: 10000,
  },
  {
    name: 'gold.agg_rep_performance_weekly',
    description: 'Weekly rep performance dashboard',
    grain: 'One row per rep-week',
    refreshFrequency: 'Weekly on Monday at 8:30 AM UTC',
    sourceFactTables: ['gold.agg_sales_rep_activity_daily', 'gold.agg_opportunity_pipeline_daily'],
    dimensions: ['rep_key', 'week_key'],
    measures: [
      'week_activities',
      'week_opportunities_created',
      'week_revenue_closed',
      'week_quota_attainment_pct',
      'week_pipeline_value',
      'activity_efficiency_score',
    ],
    estimatedRows: 10000,
  },
];

export const crmAnalyticsMonthlyAggregations: CRMGoldAggregation[] = [
  {
    name: 'gold.agg_sales_performance_monthly',
    description: 'Monthly executive sales summary',
    grain: 'One row per month',
    refreshFrequency: 'Monthly on 1st day at 9:00 AM UTC',
    sourceFactTables: ['gold.agg_opportunity_pipeline_weekly', 'gold.agg_rep_performance_weekly'],
    dimensions: ['month_key'],
    measures: [
      'monthly_revenue',
      'monthly_quota',
      'monthly_quota_attainment_pct',
      'monthly_pipeline',
      'monthly_new_customers',
      'monthly_churn',
      'monthly_win_rate_pct',
      'average_sales_cycle_days',
      'forecast_accuracy_pct',
      'rep_count',
      'total_accounts',
    ],
    estimatedRows: 120,
  },
  {
    name: 'gold.agg_account_metrics_monthly',
    description: 'Monthly account portfolio metrics',
    grain: 'One row per month',
    refreshFrequency: 'Monthly on 1st day at 9:30 AM UTC',
    sourceFactTables: ['gold.agg_account_health_daily'],
    dimensions: ['month_key'],
    measures: [
      'total_accounts',
      'healthy_accounts_pct',
      'at_risk_accounts_count',
      'churn_accounts_count',
      'new_accounts_count',
      'expansion_accounts_count',
      'avg_account_ltv',
      'avg_account_health_score',
    ],
    estimatedRows: 120,
  },
];

export const crmAnalyticsRealTimeAggregations: CRMGoldAggregation[] = [
  {
    name: 'gold.agg_live_sales_ops',
    description: 'Real-time (current day) sales operations dashboard',
    grain: 'One row per rep',
    refreshFrequency: 'Every hour',
    sourceFactTables: ['gold.fct_crm_opportunity'],
    dimensions: ['rep_key'],
    measures: [
      'today_activities',
      'today_opportunities_created',
      'today_revenue_closed',
      'daily_quota_attainment_pct',
      'current_pipeline',
      'pending_tasks_count',
      'overdue_follow_ups_count',
    ],
    estimatedRows: 5000,
  },
  {
    name: 'gold.agg_live_opportunity_tracking',
    description: 'Real-time opportunity tracking for sales management',
    grain: 'One row per opportunity',
    refreshFrequency: 'Every 30 minutes',
    sourceFactTables: ['gold.fct_crm_opportunity'],
    dimensions: ['stage_key', 'rep_key'],
    measures: [
      'high_risk_opportunities_count',
      'at_risk_opportunities_count',
      'stage_changes_today_count',
      'expected_close_in_7days_count',
      'overdue_opportunities_count',
      'value_at_risk',
    ],
    estimatedRows: 50000,
  },
];

export const crmAnalyticsAggregationStrategy = {
  purpose: 'Enable fast sales analytics, forecast accuracy tracking, and rep performance management',
  tiers: {
    daily: {
      description: 'Detailed daily metrics for opportunity, account, and activity tracking',
      tables: 8,
      updateTime: '6:00-7:45 AM UTC',
      retention: '24 months',
    },
    weekly: {
      description: 'Weekly trend analysis and pipeline tracking',
      tables: 2,
      updateTime: 'Every Monday 8:00-8:30 AM UTC',
      retention: '36 months',
    },
    monthly: {
      description: 'Executive summaries and quota tracking',
      tables: 2,
      updateTime: '1st of month 9:00-9:30 AM UTC',
      retention: '60 months',
    },
    realTime: {
      description: 'Live sales ops dashboards and opportunity tracking',
      tables: 2,
      updateTime: 'Continuous (every 30 minutes)',
      retention: '7 days',
    },
  },
  storageEstimate: {
    daily: '75GB',
    weekly: '15GB',
    monthly: '3GB',
    realTime: '10GB',
    total: '~103GB',
  },
  performanceOptimizations: [
    'Partitioned by date and rep_key for efficient filtering',
    'Clustered on stage_key, account_key for sales process queries',
    'Materialized views for common dashboard queries',
    'Indexed on rep_key for fast sales rep lookups',
    'Pre-calculated winning probabilities and forecasts',
  ],
  crmSalesforceIntegration: {
    syncFrequency: 'Real-time for high-priority aggregations',
    dataConsistency: 'Eventual consistency within 30 minutes',
    crossDomainMetrics: [
      'Aggregate customer-core data with CRM opportunity data for 360 view',
      'Correlate marketing-orchestration offers with sales pipeline',
      'Track customer engagement score impact on sales cycle',
    ],
  },
};
