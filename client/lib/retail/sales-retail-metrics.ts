import type { Metric } from '../schema-types';

/**
 * SALES-RETAIL DOMAIN - METRICS CATALOG
 * 
 * 50 Key Performance Indicators for Sales Analytics
 * Organized by category: Pipeline, Activity, Conversion, Productivity, Compensation
 */

export const salesRetailMetrics: Metric[] = [
  // ========================================
  // PIPELINE METRICS (12 metrics)
  // ========================================
  
  {
    name: 'Total Pipeline Value',
    category: 'Pipeline',
    type: 'Currency',
    description: 'Total value of all active opportunities in pipeline',
    formula: 'SUM(amount) WHERE is_closed = FALSE',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Real-time',
    businessDefinition: 'Sum of opportunity amounts for all open (not closed won/lost) opportunities',
  },
  
  {
    name: 'Weighted Pipeline Value',
    category: 'Pipeline',
    type: 'Currency',
    description: 'Pipeline value weighted by probability',
    formula: 'SUM(expected_revenue) WHERE is_closed = FALSE',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Real-time',
    businessDefinition: 'Sum of (opportunity amount × probability) for open opportunities',
  },
  
  {
    name: 'Pipeline Coverage Ratio',
    category: 'Pipeline',
    type: 'Ratio',
    description: 'Ratio of pipeline to quota',
    formula: 'Weighted Pipeline Value / Period Quota',
    sourceTable: 'gold.fact_sales_opportunities, gold.dim_sales_rep',
    updateFrequency: 'Daily',
    businessDefinition: 'Multiple of quota covered by current pipeline (e.g., 3x means pipeline is 3× quota)',
  },
  
  {
    name: 'Pipeline by Stage',
    category: 'Pipeline',
    type: 'Currency',
    description: 'Pipeline value by sales stage',
    formula: 'SUM(amount) GROUP BY stage',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Real-time',
  },
  
  {
    name: 'Average Deal Size',
    category: 'Pipeline',
    type: 'Currency',
    description: 'Average value per opportunity',
    formula: 'AVG(amount)',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Pipeline Velocity',
    category: 'Pipeline',
    type: 'Currency',
    description: 'Rate of pipeline movement (value won per time period)',
    formula: 'SUM(amount WHERE is_won_this_period = TRUE) / Days in Period',
    sourceTable: 'gold.fact_sales_pipeline_daily',
    updateFrequency: 'Daily',
    businessDefinition: 'Average daily value of opportunities being won',
  },
  
  {
    name: 'New Opportunities Created',
    category: 'Pipeline',
    type: 'Count',
    description: 'Number of new opportunities created in period',
    formula: 'COUNT(opportunity_id) WHERE created_date BETWEEN period_start AND period_end',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Opportunities Closed Won',
    category: 'Pipeline',
    type: 'Count',
    description: 'Number of opportunities won in period',
    formula: 'COUNT(opportunity_id) WHERE is_won = TRUE AND actual_close_date BETWEEN period_start AND period_end',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Opportunities Closed Lost',
    category: 'Pipeline',
    type: 'Count',
    description: 'Number of opportunities lost in period',
    formula: 'COUNT(opportunity_id) WHERE is_lost = TRUE AND actual_close_date BETWEEN period_start AND period_end',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Stale Opportunities',
    category: 'Pipeline',
    type: 'Count',
    description: 'Opportunities with no activity in 30+ days',
    formula: 'COUNT(opportunity_id) WHERE is_stale = TRUE AND is_closed = FALSE',
    sourceTable: 'gold.fact_sales_pipeline_daily',
    updateFrequency: 'Daily',
    businessDefinition: 'Open opportunities with no sales activity (calls, emails, meetings) in last 30 days',
  },
  
  {
    name: 'Pipeline Slippage',
    category: 'Pipeline',
    type: 'Currency',
    description: 'Value of opportunities with pushed close dates',
    formula: 'SUM(amount) WHERE close_date_changed_flag = TRUE AND close_date_shift_days > 0',
    sourceTable: 'gold.fact_sales_pipeline_daily',
    updateFrequency: 'Daily',
    businessDefinition: 'Opportunities whose expected close date was pushed out',
  },
  
  {
    name: 'Forecast Accuracy',
    category: 'Pipeline',
    type: 'Percentage',
    description: 'Accuracy of sales forecast vs actual results',
    formula: '(Actual Closed Won Value / Forecasted Value) × 100',
    sourceTable: 'gold.fact_sales_pipeline_daily',
    updateFrequency: 'Monthly',
    businessDefinition: 'Measures how accurately the forecast predicted actual wins',
  },

  // ========================================
  // CONVERSION METRICS (10 metrics)
  // ========================================
  
  {
    name: 'Win Rate',
    category: 'Conversion',
    type: 'Percentage',
    description: 'Percentage of closed opportunities that were won',
    formula: '(Opportunities Closed Won / Total Opportunities Closed) × 100',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
    businessDefinition: 'Win rate = Won / (Won + Lost)',
  },
  
  {
    name: 'Lead Conversion Rate',
    category: 'Conversion',
    type: 'Percentage',
    description: 'Percentage of leads converted to opportunities',
    formula: '(Leads Converted to Opportunity / Total Leads) × 100',
    sourceTable: 'gold.fact_lead_conversions',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Lead-to-Customer Conversion Rate',
    category: 'Conversion',
    type: 'Percentage',
    description: 'Percentage of leads that became customers',
    formula: '(Leads Converted to Customer / Total Leads) × 100',
    sourceTable: 'gold.fact_lead_conversions',
    updateFrequency: 'Daily',
    businessDefinition: 'End-to-end conversion from lead to paying customer',
  },
  
  {
    name: 'Opportunity-to-Customer Conversion Rate',
    category: 'Conversion',
    type: 'Percentage',
    description: 'Percentage of opportunities that resulted in customer accounts',
    formula: '(Opportunities with Customer Created / Total Opportunities Closed Won) × 100',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Stage Conversion Rate',
    category: 'Conversion',
    type: 'Percentage',
    description: 'Conversion rate from one stage to next',
    formula: '(Opps that progressed to next stage / Opps in prior stage) × 100',
    sourceTable: 'gold.fact_sales_pipeline_daily',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Referral Conversion Rate',
    category: 'Conversion',
    type: 'Percentage',
    description: 'Percentage of referrals that converted to customers',
    formula: '(Referrals Converted / Total Referrals) × 100',
    sourceTable: 'bronze.retail_customer_referrals',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Quote-to-Close Rate',
    category: 'Conversion',
    type: 'Percentage',
    description: 'Percentage of quotes that resulted in closed deals',
    formula: '(Quotes Accepted / Total Quotes Sent) × 100',
    sourceTable: 'bronze.retail_sales_quotes',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'New Customer Acquisition',
    category: 'Conversion',
    type: 'Count',
    description: 'Number of new customers acquired',
    formula: 'COUNT(DISTINCT customer_id) WHERE is_new_customer = TRUE AND conversion_date BETWEEN period_start AND period_end',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Cross-Sell Success Rate',
    category: 'Conversion',
    type: 'Percentage',
    description: 'Percentage of cross-sell opportunities won',
    formula: '(Cross-Sell Opps Won / Total Cross-Sell Opps) × 100',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Product Attach Rate',
    category: 'Conversion',
    type: 'Ratio',
    description: 'Average number of products per customer',
    formula: 'AVG(product_count) WHERE conversion_flag = TRUE',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },

  // ========================================
  // SALES CYCLE METRICS (8 metrics)
  // ========================================
  
  {
    name: 'Average Sales Cycle Length',
    category: 'Sales Cycle',
    type: 'Days',
    description: 'Average days from opportunity created to closed won',
    formula: 'AVG(sales_cycle_length) WHERE is_won = TRUE',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Median Sales Cycle Length',
    category: 'Sales Cycle',
    type: 'Days',
    description: 'Median days to close (less sensitive to outliers)',
    formula: 'MEDIAN(sales_cycle_length) WHERE is_won = TRUE',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Sales Cycle by Product',
    category: 'Sales Cycle',
    type: 'Days',
    description: 'Average sales cycle by product type',
    formula: 'AVG(sales_cycle_length) GROUP BY product_type',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Time in Stage',
    category: 'Sales Cycle',
    type: 'Days',
    description: 'Average days spent in each stage',
    formula: 'AVG(days_in_current_stage) GROUP BY stage',
    sourceTable: 'gold.fact_sales_pipeline_daily',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Lead Response Time',
    category: 'Sales Cycle',
    type: 'Hours',
    description: 'Average time to first contact after lead creation',
    formula: 'AVG(days_to_contact × 24) WHERE is_contacted = TRUE',
    sourceTable: 'gold.fact_lead_conversions',
    updateFrequency: 'Daily',
    businessDefinition: 'Speed of initial outreach to new leads',
  },
  
  {
    name: 'Days to Qualification',
    category: 'Sales Cycle',
    type: 'Days',
    description: 'Average days from lead created to qualified',
    formula: 'AVG(days_to_qualification) WHERE is_qualified = TRUE',
    sourceTable: 'gold.fact_lead_conversions',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Days from Qualified to Won',
    category: 'Sales Cycle',
    type: 'Days',
    description: 'Average days from lead qualified to opportunity won',
    formula: 'AVG(days_to_won - days_to_qualification) WHERE is_won = TRUE',
    sourceTable: 'gold.fact_lead_conversions',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Opportunity Age',
    category: 'Sales Cycle',
    type: 'Days',
    description: 'Average age of open opportunities',
    formula: 'AVG(age_in_days) WHERE is_closed = FALSE',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },

  // ========================================
  // ACTIVITY & PRODUCTIVITY METRICS (10 metrics)
  // ========================================
  
  {
    name: 'Total Sales Activities',
    category: 'Activity',
    type: 'Count',
    description: 'Total number of sales activities (calls, emails, meetings)',
    formula: 'COUNT(activity_id)',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Real-time',
  },
  
  {
    name: 'Activities per Rep per Day',
    category: 'Activity',
    type: 'Count',
    description: 'Average daily activity count per sales rep',
    formula: 'COUNT(activity_id) / DISTINCT(sales_rep_key) / Business Days',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Call Volume',
    category: 'Activity',
    type: 'Count',
    description: 'Number of calls made/received',
    formula: 'COUNT(activity_id) WHERE activity_type = Call',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Real-time',
  },
  
  {
    name: 'Email Activity',
    category: 'Activity',
    type: 'Count',
    description: 'Number of emails sent',
    formula: 'COUNT(activity_id) WHERE activity_type = Email AND email_sent = TRUE',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Real-time',
  },
  
  {
    name: 'Meeting Productivity',
    category: 'Activity',
    type: 'Percentage',
    description: 'Percentage of meetings that resulted in opportunities',
    formula: '(Meetings that resulted in opp / Total Meetings) × 100',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Email Open Rate',
    category: 'Activity',
    type: 'Percentage',
    description: 'Percentage of sales emails opened',
    formula: '(Emails Opened / Emails Sent) × 100',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Email Response Rate',
    category: 'Activity',
    type: 'Percentage',
    description: 'Percentage of sales emails that received replies',
    formula: '(Emails Replied / Emails Sent) × 100',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Call Connect Rate',
    category: 'Activity',
    type: 'Percentage',
    description: 'Percentage of outbound calls that connected',
    formula: '(Calls Connected / Outbound Calls) × 100',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Daily',
    businessDefinition: 'Excludes voicemails and no-answers',
  },
  
  {
    name: 'Average Call Duration',
    category: 'Activity',
    type: 'Minutes',
    description: 'Average call length in minutes',
    formula: 'AVG(call_duration_seconds / 60) WHERE activity_type = Call',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Activities per Opportunity',
    category: 'Activity',
    type: 'Count',
    description: 'Average number of activities per opportunity',
    formula: 'COUNT(activity_id) / DISTINCT(opportunity_id)',
    sourceTable: 'gold.fact_sales_activities',
    updateFrequency: 'Daily',
  },

  // ========================================
  // QUOTA & ATTAINMENT METRICS (5 metrics)
  // ========================================
  
  {
    name: 'Quota Attainment',
    category: 'Quota',
    type: 'Percentage',
    description: 'Percentage of quota achieved',
    formula: '(Actual Closed Won Value / Quota) × 100',
    sourceTable: 'gold.fact_sales_opportunities, gold.dim_sales_rep',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Reps at Quota',
    category: 'Quota',
    type: 'Count',
    description: 'Number of reps who achieved 100%+ quota',
    formula: 'COUNT(DISTINCT sales_rep_id) WHERE quota_attainment_pct >= 100',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Monthly',
  },
  
  {
    name: 'Team Quota Attainment',
    category: 'Quota',
    type: 'Percentage',
    description: 'Quota attainment at team/territory level',
    formula: '(Team Actual / Team Quota) × 100',
    sourceTable: 'gold.fact_sales_opportunities, gold.dim_sales_territory',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'YTD Quota Performance',
    category: 'Quota',
    type: 'Percentage',
    description: 'Year-to-date quota attainment',
    formula: '(YTD Actual / YTD Quota) × 100',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Pacing to Quota',
    category: 'Quota',
    type: 'Percentage',
    description: 'On-pace percentage relative to quota',
    formula: '(Actual to Date / (Quota × Days Elapsed / Days in Period)) × 100',
    sourceTable: 'gold.fact_sales_opportunities',
    updateFrequency: 'Daily',
    businessDefinition: 'If 100%, on pace to hit quota. >100% = ahead of pace.',
  },

  // ========================================
  // COMMISSION & COMPENSATION METRICS (5 metrics)
  // ========================================
  
  {
    name: 'Total Commissions Paid',
    category: 'Commission',
    type: 'Currency',
    description: 'Total commission amount paid',
    formula: 'SUM(total_commission) WHERE is_paid = TRUE',
    sourceTable: 'gold.fact_sales_commissions',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Average Commission per Deal',
    category: 'Commission',
    type: 'Currency',
    description: 'Average commission earned per closed deal',
    formula: 'AVG(commission_amount) WHERE commission_type = New Account',
    sourceTable: 'gold.fact_sales_commissions',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Commission-to-Revenue Ratio',
    category: 'Commission',
    type: 'Percentage',
    description: 'Commission expense as % of revenue',
    formula: '(Total Commissions / Total Revenue) × 100',
    sourceTable: 'gold.fact_sales_commissions',
    updateFrequency: 'Monthly',
  },
  
  {
    name: 'Pending Commissions',
    category: 'Commission',
    type: 'Currency',
    description: 'Commission amount pending approval/payment',
    formula: 'SUM(total_commission) WHERE is_paid = FALSE AND commission_status = Approved',
    sourceTable: 'gold.fact_sales_commissions',
    updateFrequency: 'Daily',
  },
  
  {
    name: 'Commission Clawback Risk',
    category: 'Commission',
    type: 'Currency',
    description: 'Commission at risk of clawback',
    formula: 'SUM(total_commission) WHERE clawback_at_risk = TRUE',
    sourceTable: 'gold.fact_sales_commissions',
    updateFrequency: 'Daily',
    businessDefinition: 'Commissions within clawback period where account could close',
  },
];

export const salesRetailMetricsComplete = {
  domain: 'Sales-Retail',
  totalMetrics: 50,
  categories: [
    { name: 'Pipeline', count: 12 },
    { name: 'Conversion', count: 10 },
    { name: 'Sales Cycle', count: 8 },
    { name: 'Activity', count: 10 },
    { name: 'Quota', count: 5 },
    { name: 'Commission', count: 5 },
  ],
  keyInsights: [
    'Pipeline health and coverage',
    'Win/loss analysis',
    'Sales velocity and cycle time',
    'Rep productivity and activity levels',
    'Quota attainment tracking',
    'Commission liability and risk',
  ],
};
