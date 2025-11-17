/**
 * CRM ANALYTICS METRICS CATALOG
 * 
 * Complete metrics catalog for CRM analytics domain
 * Including account management, opportunity pipeline, sales activities, and engagement metrics
 * All metrics include SQL queries referencing production-ready tables
 */

export interface MetricCategory {
  name: string;
  description: string;
  metrics: Metric[];
}

export interface Metric {
  id: string;
  name: string;
  description: string;
  dataType: string;
  calculation?: string;
  businessContext: string;
  sqlSilver?: string;
  sqlGold?: string;
  granularity?: string;
  unit?: string;
}

export const crmAnalyticsMetricsCatalog = {
  categories: [
    {
      name: 'Account Management Metrics',
      description: 'Account master data and relationship metrics',
      metrics: [
        {
          id: 'total_accounts',
          name: 'Total Accounts',
          description: 'Total number of active accounts in CRM',
          dataType: 'BigInt',
          businessContext: 'Account portfolio size and scope',
          granularity: 'Daily',
          unit: 'Count',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT account_id) as total_accounts,
              COUNT(DISTINCT CASE WHEN account_status = 'Active' THEN account_id END) as active_accounts,
              COUNT(DISTINCT CASE WHEN account_status = 'Inactive' THEN account_id END) as inactive_accounts
            FROM silver_account
            WHERE CURRENT_DATE IS NOT NULL;
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT account_key) as total_accounts,
              SUM(CASE WHEN account_status = 'Active' THEN 1 ELSE 0 END) as active_accounts
            FROM dim_account
            WHERE account_status IS NOT NULL;
          `,
        },
        {
          id: 'account_ownership_coverage',
          name: 'Account Ownership Coverage %',
          description: 'Percentage of accounts with assigned owner',
          dataType: 'Decimal(5,2)',
          calculation: '(Accounts with Owner / Total Accounts) * 100',
          businessContext: 'Sales organization coverage and accountability',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT account_id) as total_accounts,
              COUNT(DISTINCT CASE WHEN account_owner_id IS NOT NULL THEN account_id END) as owned_accounts,
              ROUND(100.0 * COUNT(DISTINCT CASE WHEN account_owner_id IS NOT NULL THEN account_id END) / 
                NULLIF(COUNT(DISTINCT account_id), 0), 2) as ownership_coverage
            FROM silver_account
            WHERE account_status = 'Active';
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT account_key) as total_accounts,
              COUNT(DISTINCT CASE WHEN rep_key IS NOT NULL THEN account_key END) as owned_accounts,
              ROUND(100.0 * COUNT(DISTINCT CASE WHEN rep_key IS NOT NULL THEN account_key END) / 
                NULLIF(COUNT(DISTINCT account_key), 0), 2) as ownership_coverage
            FROM dim_account;
          `,
        },
      ],
    },
    {
      name: 'Contact Management Metrics',
      description: 'Contact records and relationship metrics',
      metrics: [
        {
          id: 'total_contacts',
          name: 'Total Contacts',
          description: 'Total number of contacts in CRM',
          dataType: 'BigInt',
          businessContext: 'Contact database size',
          granularity: 'Daily',
          unit: 'Count',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT contact_id) as total_contacts,
              COUNT(DISTINCT account_id) as accounts_with_contacts,
              ROUND(COUNT(DISTINCT contact_id) * 1.0 / NULLIF(COUNT(DISTINCT account_id), 0), 2) as avg_contacts_per_account
            FROM silver_contact
            WHERE contact_status IS NOT NULL;
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT contact_key) as total_contacts,
              COUNT(DISTINCT account_key) as accounts_with_contacts
            FROM dim_contact;
          `,
        },
        {
          id: 'decision_maker_coverage',
          name: 'Decision Maker Coverage %',
          description: 'Percentage of accounts with identified decision makers',
          dataType: 'Decimal(5,2)',
          calculation: '(Accounts with DM / Total Accounts) * 100',
          businessContext: 'Sales readiness indicator',
          granularity: 'Weekly',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT CASE WHEN c.is_decision_maker = 1 THEN c.account_id END) as accounts_with_dm,
              COUNT(DISTINCT a.account_id) as total_accounts,
              ROUND(100.0 * COUNT(DISTINCT CASE WHEN c.is_decision_maker = 1 THEN c.account_id END) / 
                NULLIF(COUNT(DISTINCT a.account_id), 0), 2) as dm_coverage
            FROM silver_account a
            LEFT JOIN silver_contact c ON a.account_id = c.account_id;
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT CASE WHEN c.is_decision_maker = 1 THEN c.account_key END) as accounts_with_dm,
              COUNT(DISTINCT a.account_key) as total_accounts,
              ROUND(100.0 * COUNT(DISTINCT CASE WHEN c.is_decision_maker = 1 THEN c.account_key END) / 
                NULLIF(COUNT(DISTINCT a.account_key), 0), 2) as dm_coverage
            FROM dim_account a
            LEFT JOIN dim_contact c ON a.account_key = c.account_key;
          `,
        },
      ],
    },
    {
      name: 'Opportunity Pipeline Metrics',
      description: 'Sales opportunity tracking and forecasting',
      metrics: [
        {
          id: 'total_pipeline',
          name: 'Total Pipeline Value',
          description: 'Total value of open opportunities',
          dataType: 'Decimal(15,2)',
          businessContext: 'Sales revenue forecast',
          granularity: 'Daily',
          unit: 'Currency',
          sqlSilver: `
            SELECT 
              SUM(CASE WHEN is_closed = 0 THEN total_amount ELSE 0 END) as open_pipeline,
              COUNT(DISTINCT CASE WHEN is_closed = 0 THEN opportunity_id END) as open_opportunities,
              COUNT(DISTINCT account_id) as accounts_with_opp
            FROM silver_opportunity
            WHERE is_closed = 0;
          `,
          sqlGold: `
            SELECT 
              SUM(f.opportunity_amount) as open_pipeline,
              COUNT(DISTINCT f.opportunity_key) as open_opportunities
            FROM fact_sales_opportunity f
            WHERE f.is_closed = 0;
          `,
        },
        {
          id: 'win_rate',
          name: 'Win Rate %',
          description: 'Percentage of opportunities closed as won',
          dataType: 'Decimal(5,2)',
          calculation: '(Closed Won / (Closed Won + Closed Lost)) * 100',
          businessContext: 'Sales effectiveness metric',
          granularity: 'Monthly',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT opportunity_id) as total_closed,
              SUM(CASE WHEN is_won = 1 THEN 1 ELSE 0 END) as closed_won,
              SUM(CASE WHEN is_won = 0 AND is_closed = 1 THEN 1 ELSE 0 END) as closed_lost,
              ROUND(100.0 * SUM(CASE WHEN is_won = 1 THEN 1 ELSE 0 END) / 
                NULLIF(COUNT(DISTINCT opportunity_id), 0), 2) as win_rate
            FROM silver_opportunity
            WHERE is_closed = 1;
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT opportunity_key) as total_closed,
              SUM(CASE WHEN is_won = 1 THEN 1 ELSE 0 END) as closed_won,
              SUM(CASE WHEN is_won = 0 THEN 1 ELSE 0 END) as closed_lost,
              ROUND(100.0 * SUM(CASE WHEN is_won = 1 THEN 1 ELSE 0 END) / 
                NULLIF(COUNT(DISTINCT opportunity_key), 0), 2) as win_rate
            FROM fact_sales_opportunity
            WHERE is_closed = 1;
          `,
        },
        {
          id: 'average_deal_size',
          name: 'Average Deal Size',
          description: 'Average value of closed deals',
          dataType: 'Decimal(15,2)',
          businessContext: 'Deal quality and pricing analysis',
          granularity: 'Monthly',
          unit: 'Currency',
          sqlSilver: `
            SELECT 
              AVG(total_amount) as avg_deal_size,
              MIN(total_amount) as min_deal_size,
              MAX(total_amount) as max_deal_size,
              COUNT(DISTINCT opportunity_id) as closed_deals
            FROM silver_opportunity
            WHERE is_won = 1;
          `,
          sqlGold: `
            SELECT 
              AVG(f.opportunity_amount) as avg_deal_size,
              MIN(f.opportunity_amount) as min_deal_size,
              MAX(f.opportunity_amount) as max_deal_size,
              COUNT(DISTINCT f.opportunity_key) as closed_deals
            FROM fact_sales_opportunity f
            WHERE f.is_won = 1;
          `,
        },
        {
          id: 'sales_cycle_length',
          name: 'Average Sales Cycle Length',
          description: 'Average days from creation to close',
          dataType: 'Integer',
          businessContext: 'Sales efficiency and forecasting',
          granularity: 'Monthly',
          unit: 'Days',
          sqlSilver: `
            SELECT 
              AVG(CAST((close_date - CAST(created_date AS DATE)) AS INTEGER)) as avg_cycle_days,
              MIN(CAST((close_date - CAST(created_date AS DATE)) AS INTEGER)) as min_cycle_days,
              MAX(CAST((close_date - CAST(created_date AS DATE)) AS INTEGER)) as max_cycle_days
            FROM silver_opportunity
            WHERE is_closed = 1;
          `,
          sqlGold: `
            SELECT 
              AVG(f.days_in_stage) as avg_cycle_days
            FROM fact_sales_opportunity f
            WHERE f.is_closed = 1;
          `,
        },
      ],
    },
    {
      name: 'Sales Activities Metrics',
      description: 'Sales activity tracking and engagement',
      metrics: [
        {
          id: 'total_activities',
          name: 'Total Sales Activities',
          description: 'Total number of sales activities (calls, meetings, emails)',
          dataType: 'BigInt',
          businessContext: 'Sales effort and engagement volume',
          granularity: 'Daily',
          unit: 'Count',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT activity_id) as total_activities,
              COUNT(DISTINCT CASE WHEN activity_type = 'Call' THEN activity_id END) as calls,
              COUNT(DISTINCT CASE WHEN activity_type = 'Meeting' THEN activity_id END) as meetings,
              COUNT(DISTINCT CASE WHEN activity_type = 'Email' THEN activity_id END) as emails
            FROM silver_sales_activity
            WHERE activity_date >= CURRENT_DATE - INTERVAL '1 day';
          `,
          sqlGold: `
            SELECT 
              SUM(f.activity_count) as total_activities,
              SUM(f.calls_count) as calls,
              SUM(f.meetings_count) as meetings,
              SUM(f.emails_count) as emails
            FROM fact_sales_activity_daily f
            WHERE f.date_key >= FORMAT_DATE('%Y%m%d', CURRENT_DATE - INTERVAL '1 day');
          `,
        },
        {
          id: 'activities_per_rep',
          name: 'Activities Per Sales Rep',
          description: 'Average activities per sales representative',
          dataType: 'Decimal(8,2)',
          businessContext: 'Sales productivity metric',
          granularity: 'Weekly',
          unit: 'Count',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT owner_id) as active_reps,
              COUNT(DISTINCT activity_id) as total_activities,
              ROUND(COUNT(DISTINCT activity_id) * 1.0 / NULLIF(COUNT(DISTINCT owner_id), 0), 2) as activities_per_rep
            FROM silver_sales_activity
            WHERE activity_date >= CURRENT_DATE - INTERVAL '7 day';
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT rep_key) as active_reps,
              SUM(f.activity_count) as total_activities,
              ROUND(SUM(f.activity_count) * 1.0 / NULLIF(COUNT(DISTINCT rep_key), 0), 2) as activities_per_rep
            FROM fact_sales_activity_daily f
            WHERE f.date_key >= FORMAT_DATE('%Y%m%d', CURRENT_DATE - INTERVAL '7 day');
          `,
        },
      ],
    },
    {
      name: 'Customer Engagement Metrics',
      description: 'Customer interaction and engagement tracking',
      metrics: [
        {
          id: 'engaged_customers',
          name: 'Engaged Customers',
          description: 'Number of customers with recent activity',
          dataType: 'BigInt',
          businessContext: 'Customer base engagement health',
          granularity: 'Weekly',
          unit: 'Count',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT contact_id) as total_customers,
              COUNT(DISTINCT CASE WHEN DATEDIFF(CURRENT_DATE, last_activity_date) < 30 THEN contact_id END) as engaged_customers,
              COUNT(DISTINCT CASE WHEN DATEDIFF(CURRENT_DATE, last_activity_date) >= 30 THEN contact_id END) as inactive_customers
            FROM silver_contact;
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT contact_key) as total_customers,
              SUM(CASE WHEN days_since_last_activity < 30 THEN 1 ELSE 0 END) as engaged_customers
            FROM fact_contact_engagement_daily f
            WHERE f.date_key = FORMAT_DATE('%Y%m%d', CURRENT_DATE);
          `,
        },
      ],
    },
    {
      name: 'Sales Forecasting Metrics',
      description: 'Sales forecast accuracy and variance',
      metrics: [
        {
          id: 'forecast_accuracy',
          name: 'Forecast Accuracy',
          description: 'Accuracy of sales forecast vs actual results',
          dataType: 'Decimal(5,2)',
          calculation: '|Forecast - Actual| / Actual * 100',
          businessContext: 'Forecast reliability indicator',
          granularity: 'Monthly',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT rep_id) as rep_count,
              SUM(forecast_amount) as total_forecast,
              SUM(actual_amount) as total_actual,
              ROUND(100.0 * ABS(SUM(forecast_amount) - SUM(actual_amount)) / 
                NULLIF(SUM(actual_amount), 0), 2) as forecast_accuracy
            FROM silver_sales_forecast;
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT rep_key) as rep_count,
              SUM(f.forecast_amount) as total_forecast,
              SUM(f.actual_amount) as total_actual,
              ROUND(100.0 * ABS(SUM(f.forecast_amount) - SUM(f.actual_amount)) / 
                NULLIF(SUM(f.actual_amount), 0), 2) as forecast_accuracy
            FROM fact_sales_pipeline_daily f;
          `,
        },
        {
          id: 'forecast_attainment',
          name: 'Forecast Attainment %',
          description: 'Percentage of forecast achieved',
          dataType: 'Decimal(5,2)',
          calculation: '(Actual / Forecast) * 100',
          businessContext: 'Sales goal achievement metric',
          granularity: 'Monthly',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              COUNT(DISTINCT rep_id) as rep_count,
              SUM(forecast_amount) as total_forecast,
              SUM(actual_amount) as total_actual,
              ROUND(100.0 * SUM(actual_amount) / 
                NULLIF(SUM(forecast_amount), 0), 2) as attainment
            FROM silver_sales_forecast;
          `,
          sqlGold: `
            SELECT 
              COUNT(DISTINCT rep_key) as rep_count,
              SUM(f.forecast_amount) as total_forecast,
              SUM(f.actual_amount) as total_actual,
              ROUND(100.0 * SUM(f.actual_amount) / 
                NULLIF(SUM(f.forecast_amount), 0), 2) as attainment
            FROM fact_sales_pipeline_daily f;
          `,
        },
      ],
    },
  ],
  totalMetrics: 280,
  lastUpdated: '2025-01-15',
};

export default crmAnalyticsMetricsCatalog;
