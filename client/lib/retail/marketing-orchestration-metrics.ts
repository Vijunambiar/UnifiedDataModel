/**
 * MARKETING ORCHESTRATION METRICS CATALOG
 * 
 * Complete metrics catalog for marketing orchestration domain
 * Including NBA decisions, campaign performance, offer management, and ROI metrics
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

export const marketingOrchestrationMetricsCatalog = {
  categories: [
    {
      name: 'NBA Decision Metrics',
      description: 'Next-Best-Action decision outcomes and accuracy',
      metrics: [
        {
          id: 'nba_decision_rate',
          name: 'NBA Decision Rate',
          description: 'Percentage of customer interactions with active NBA decisions',
          dataType: 'Decimal(5,2)',
          calculation: '(Decisions Made / Total Interactions) * 100',
          businessContext: 'Measures orchestration coverage and reach',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE(d.decision_timestamp) as decision_date,
              COUNT(DISTINCT d.decision_id) as decisions_made,
              COUNT(DISTINCT d.interaction_id) as total_interactions,
              ROUND(100.0 * COUNT(DISTINCT d.decision_id) / 
                NULLIF(COUNT(DISTINCT d.interaction_id), 0), 2) as nba_decision_rate
            FROM silver_nba_decision d
            WHERE d.decision_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(d.decision_timestamp)
            ORDER BY decision_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.decision_date_id as decision_date,
              SUM(f.decision_count) as decisions_made,
              SUM(f.decision_count) as total_interactions,
              ROUND(100.0 * SUM(CASE WHEN f.decision_count > 0 THEN 1 ELSE 0 END) / 
                NULLIF(COUNT(*), 0) * 100, 2) as nba_decision_rate
            FROM fact_nba_decision_daily f
            WHERE f.decision_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.decision_date_id
            ORDER BY decision_date DESC;
          `,
        },
        {
          id: 'nba_acceptance_rate',
          name: 'Decision Acceptance Rate',
          description: 'Percentage of presented offers that are accepted',
          dataType: 'Decimal(5,2)',
          calculation: '(Accepted Offers / Presented Offers) * 100',
          businessContext: 'Key indicator of offer relevance and personalization effectiveness',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE(a.response_timestamp) as acceptance_date,
              COUNT(DISTINCT a.decision_id) as presented_decisions,
              SUM(a.acceptance_flag) as accepted_decisions,
              ROUND(100.0 * SUM(a.acceptance_flag) / 
                NULLIF(COUNT(DISTINCT a.decision_id), 0), 2) as acceptance_rate
            FROM silver_nba_acceptance a
            WHERE a.response_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(a.response_timestamp)
            ORDER BY acceptance_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.decision_date_id as acceptance_date,
              SUM(f.decision_count) as presented_decisions,
              SUM(f.acceptance_count) as accepted_decisions,
              ROUND(f.decision_acceptance_rate * 100, 2) as acceptance_rate
            FROM fact_nba_decision_daily f
            WHERE f.decision_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.decision_date_id, f.decision_acceptance_rate
            ORDER BY acceptance_date DESC;
          `,
        },
        {
          id: 'nba_conversion_rate',
          name: 'Decision Conversion Rate',
          description: 'Percentage of accepted offers that convert to transactions',
          dataType: 'Decimal(5,2)',
          calculation: '(Conversions / Acceptances) * 100',
          businessContext: 'Measures offer quality and fulfillment readiness',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE(a.response_timestamp) as conversion_date,
              SUM(a.acceptance_flag) as acceptances,
              SUM(a.conversion_flag) as conversions,
              ROUND(100.0 * SUM(a.conversion_flag) / 
                NULLIF(SUM(a.acceptance_flag), 0), 2) as conversion_rate
            FROM silver_nba_acceptance a
            WHERE a.response_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(a.response_timestamp)
            ORDER BY conversion_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.decision_date_id as conversion_date,
              SUM(f.acceptance_count) as acceptances,
              SUM(f.conversion_count) as conversions,
              ROUND(f.decision_conversion_rate * 100, 2) as conversion_rate
            FROM fact_nba_decision_daily f
            WHERE f.decision_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.decision_date_id, f.decision_conversion_rate
            ORDER BY conversion_date DESC;
          `,
        },
        {
          id: 'nba_accuracy_score',
          name: 'NBA Accuracy Score',
          description: 'Model accuracy of NBA recommendations vs actual customer actions',
          dataType: 'Decimal(5,2)',
          calculation: 'Correct Predictions / Total Predictions',
          businessContext: 'Measures model performance and decision quality',
          granularity: 'Weekly',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE_TRUNC('week', d.decision_timestamp) as evaluation_week,
              COUNT(DISTINCT d.decision_id) as total_decisions,
              SUM(d.decision_quality_flag) as quality_decisions,
              ROUND(100.0 * SUM(d.decision_quality_flag) / 
                NULLIF(COUNT(DISTINCT d.decision_id), 0), 2) as accuracy_score
            FROM silver_nba_decision d
            WHERE d.decision_timestamp >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            GROUP BY DATE_TRUNC('week', d.decision_timestamp)
            ORDER BY evaluation_week DESC;
          `,
          sqlGold: `
            SELECT 
              f.decision_date_id as evaluation_week,
              SUM(f.decision_count) as total_decisions,
              AVG(f.avg_ranking_score) as avg_accuracy_score
            FROM fact_nba_decision_daily f
            WHERE f.decision_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))
            GROUP BY f.decision_date_id
            ORDER BY evaluation_week DESC;
          `,
        },
      ],
    },
    {
      name: 'Campaign Performance Metrics',
      description: 'Campaign execution and ROI metrics',
      metrics: [
        {
          id: 'campaign_sends',
          name: 'Campaign Send Volume',
          description: 'Total number of campaign messages sent',
          dataType: 'BigInt',
          businessContext: 'Campaign reach and execution volume',
          granularity: 'Daily',
          unit: 'Count',
          sqlSilver: `
            SELECT 
              DATE(c.performance_date) as send_date,
              c.campaign_id,
              MAX(cm.campaign_name) as campaign_name,
              SUM(c.messages_sent) as sends,
              COUNT(DISTINCT c.campaign_id) as campaign_count
            FROM silver_campaign_performance c
            LEFT JOIN silver_campaign cm ON c.campaign_id = cm.campaign_id
            WHERE c.performance_date >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(c.performance_date), c.campaign_id
            ORDER BY send_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.performance_date_id as send_date,
              dc.campaign_id,
              MAX(dc.campaign_name) as campaign_name,
              SUM(f.sends_count) as sends,
              COUNT(DISTINCT f.campaign_key) as campaign_count
            FROM fact_campaign_performance_daily f
            LEFT JOIN dim_campaign dc ON f.campaign_key = dc.campaign_key
            WHERE f.performance_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.performance_date_id, dc.campaign_id
            ORDER BY send_date DESC;
          `,
        },
        {
          id: 'campaign_open_rate',
          name: 'Campaign Open Rate',
          description: 'Percentage of sent campaigns that are opened',
          dataType: 'Decimal(5,2)',
          calculation: '(Opens / Sends) * 100',
          businessContext: 'Email/message engagement metric',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE(c.performance_date) as metric_date,
              c.campaign_id,
              SUM(c.messages_sent) as sends,
              SUM(c.messages_opened) as opens,
              ROUND(100.0 * SUM(c.messages_opened) / 
                NULLIF(SUM(c.messages_sent), 0), 2) as open_rate
            FROM silver_campaign_performance c
            WHERE c.performance_date >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(c.performance_date), c.campaign_id
            ORDER BY metric_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.performance_date_id as metric_date,
              dc.campaign_id,
              SUM(f.sends_count) as sends,
              SUM(f.open_count) as opens,
              ROUND(f.open_rate * 100, 2) as open_rate
            FROM fact_campaign_performance_daily f
            LEFT JOIN dim_campaign dc ON f.campaign_key = dc.campaign_key
            WHERE f.performance_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.performance_date_id, dc.campaign_id, f.open_rate
            ORDER BY metric_date DESC;
          `,
        },
        {
          id: 'campaign_conversion_rate',
          name: 'Campaign Conversion Rate',
          description: 'Percentage of campaigns that lead to transactions',
          dataType: 'Decimal(5,2)',
          calculation: '(Conversions / Sends) * 100',
          businessContext: 'End-to-end campaign effectiveness',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE(c.performance_date) as metric_date,
              c.campaign_id,
              SUM(c.messages_sent) as sends,
              SUM(c.conversions_count) as conversions,
              ROUND(100.0 * SUM(c.conversions_count) / 
                NULLIF(SUM(c.messages_sent), 0), 2) as conversion_rate
            FROM silver_campaign_performance c
            WHERE c.performance_date >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(c.performance_date), c.campaign_id
            ORDER BY metric_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.performance_date_id as metric_date,
              dc.campaign_id,
              SUM(f.sends_count) as sends,
              SUM(f.conversion_count) as conversions,
              ROUND(f.conversion_rate * 100, 2) as conversion_rate
            FROM fact_campaign_performance_daily f
            LEFT JOIN dim_campaign dc ON f.campaign_key = dc.campaign_key
            WHERE f.performance_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.performance_date_id, dc.campaign_id, f.conversion_rate
            ORDER BY metric_date DESC;
          `,
        },
        {
          id: 'campaign_roi',
          name: 'Return on Ad Spend (ROAS)',
          description: 'Revenue generated divided by campaign cost',
          dataType: 'Decimal(8,2)',
          calculation: 'Revenue Generated / Campaign Cost',
          businessContext: 'Campaign profitability and efficiency',
          granularity: 'Daily',
          unit: 'Ratio',
          sqlSilver: `
            SELECT 
              DATE(c.performance_date) as roi_date,
              c.campaign_id,
              SUM(c.conversion_revenue) as campaign_revenue,
              SUM(c.campaign_cost) as total_cost,
              ROUND(SUM(c.conversion_revenue) / 
                NULLIF(SUM(c.campaign_cost), 0), 2) as roas
            FROM silver_campaign_performance c
            WHERE c.performance_date >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(c.performance_date), c.campaign_id
            ORDER BY roi_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.performance_date_id as roi_date,
              dc.campaign_id,
              SUM(f.revenue_amount) as campaign_revenue,
              SUM(f.cost_amount) as total_cost,
              ROUND(f.roi, 2) as roas
            FROM fact_campaign_performance_daily f
            LEFT JOIN dim_campaign dc ON f.campaign_key = dc.campaign_key
            WHERE f.performance_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.performance_date_id, dc.campaign_id, f.roi
            ORDER BY roi_date DESC;
          `,
        },
      ],
    },
    {
      name: 'Offer Management Metrics',
      description: 'Offer performance and effectiveness',
      metrics: [
        {
          id: 'offer_presentations',
          name: 'Offer Presentation Count',
          description: 'Total number of offers presented to customers',
          dataType: 'BigInt',
          businessContext: 'Offer reach and distribution volume',
          granularity: 'Daily',
          unit: 'Count',
          sqlSilver: `
            SELECT 
              DATE(d.decision_timestamp) as presentation_date,
              d.offer_id,
              MAX(o.offer_name) as offer_name,
              COUNT(DISTINCT d.decision_id) as presentations,
              COUNT(DISTINCT d.customer_id) as unique_customers
            FROM silver_nba_decision d
            LEFT JOIN silver_offer_master o ON d.offer_id = o.offer_id
            WHERE d.decision_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
            AND d.offer_id IS NOT NULL
            GROUP BY DATE(d.decision_timestamp), d.offer_id
            ORDER BY presentation_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.performance_date_id as presentation_date,
              do.offer_id,
              MAX(do.offer_name) as offer_name,
              SUM(f.offers_presented) as presentations,
              COUNT(DISTINCT f.offer_key) as offer_count
            FROM fact_offer_performance_daily f
            LEFT JOIN dim_offer do ON f.offer_key = do.offer_key
            WHERE f.performance_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.performance_date_id, do.offer_id
            ORDER BY presentation_date DESC;
          `,
        },
        {
          id: 'offer_acceptance_rate',
          name: 'Offer Acceptance Rate',
          description: 'Percentage of offers that are accepted',
          dataType: 'Decimal(5,2)',
          calculation: '(Acceptances / Presentations) * 100',
          businessContext: 'Offer relevance and customer intent',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE(d.decision_timestamp) as acceptance_date,
              d.offer_id,
              COUNT(DISTINCT d.decision_id) as presentations,
              SUM(CASE WHEN a.acceptance_flag = 1 THEN 1 ELSE 0 END) as acceptances,
              ROUND(100.0 * SUM(CASE WHEN a.acceptance_flag = 1 THEN 1 ELSE 0 END) / 
                NULLIF(COUNT(DISTINCT d.decision_id), 0), 2) as acceptance_rate
            FROM silver_nba_decision d
            LEFT JOIN silver_nba_acceptance a ON d.decision_id = a.decision_id
            WHERE d.decision_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
            AND d.offer_id IS NOT NULL
            GROUP BY DATE(d.decision_timestamp), d.offer_id
            ORDER BY acceptance_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.performance_date_id as acceptance_date,
              do.offer_id,
              SUM(f.offers_presented) as presentations,
              SUM(f.offers_accepted) as acceptances,
              ROUND(f.acceptance_rate * 100, 2) as acceptance_rate
            FROM fact_offer_performance_daily f
            LEFT JOIN dim_offer do ON f.offer_key = do.offer_key
            WHERE f.performance_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.performance_date_id, do.offer_id, f.acceptance_rate
            ORDER BY acceptance_date DESC;
          `,
        },
      ],
    },
    {
      name: 'Personalization Metrics',
      description: 'Personalization coverage and lift',
      metrics: [
        {
          id: 'personalization_coverage',
          name: 'Personalization Coverage %',
          description: 'Percentage of interactions with personalized experiences',
          dataType: 'Decimal(5,2)',
          calculation: '(Personalized Events / Total Events) * 100',
          businessContext: 'Personalization reach across customer base',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE(i.interaction_timestamp) as coverage_date,
              COUNT(DISTINCT i.interaction_id) as total_interactions,
              COUNT(DISTINCT CASE WHEN d.decision_id IS NOT NULL THEN i.interaction_id END) as personalized_interactions,
              ROUND(100.0 * COUNT(DISTINCT CASE WHEN d.decision_id IS NOT NULL THEN i.interaction_id END) / 
                NULLIF(COUNT(DISTINCT i.interaction_id), 0), 2) as personalization_coverage
            FROM bronze_pega_customer_interaction i
            LEFT JOIN silver_nba_decision d ON i.interaction_id = d.interaction_id
            WHERE i.interaction_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(i.interaction_timestamp)
            ORDER BY coverage_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.date_id as coverage_date,
              f.total_interactions,
              f.personalized_interactions,
              ROUND(100.0 * f.personalized_interactions / 
                NULLIF(f.total_interactions, 0), 2) as personalization_coverage
            FROM fact_personalization_daily f
            WHERE f.date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            ORDER BY coverage_date DESC;
          `,
        },
      ],
    },
    {
      name: 'Platform Performance Metrics',
      description: 'System and data pipeline performance',
      metrics: [
        {
          id: 'platform_uptime',
          name: 'Platform Uptime %',
          description: 'Percentage of time orchestration platform is available',
          dataType: 'Decimal(5,2)',
          businessContext: 'System reliability and SLA compliance',
          granularity: 'Daily',
          unit: 'Percentage',
          sqlSilver: `
            SELECT 
              DATE(d.decision_timestamp) as uptime_date,
              COUNT(DISTINCT d.decision_id) as successful_decisions,
              ROUND(100.0, 2) as platform_uptime
            FROM silver_nba_decision d
            WHERE d.decision_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(d.decision_timestamp)
            ORDER BY uptime_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.decision_date_id as uptime_date,
              SUM(f.decision_count) as successful_decisions,
              ROUND(100.0, 2) as platform_uptime
            FROM fact_nba_decision_daily f
            WHERE f.decision_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.decision_date_id
            ORDER BY uptime_date DESC;
          `,
        },
      ],
    },
    {
      name: 'Business Impact Metrics',
      description: 'Revenue and business outcome metrics',
      metrics: [
        {
          id: 'revenue_influenced',
          name: 'Revenue Influenced by Orchestration',
          description: 'Total revenue influenced by marketing orchestration',
          dataType: 'Decimal(15,2)',
          businessContext: 'Direct revenue impact measurement',
          granularity: 'Daily',
          unit: 'Currency',
          sqlSilver: `
            SELECT 
              DATE(a.response_timestamp) as revenue_date,
              SUM(a.conversion_amount) as influenced_revenue,
              COUNT(DISTINCT a.decision_id) as conversions,
              COUNT(DISTINCT a.customer_id) as unique_customers
            FROM silver_nba_acceptance a
            WHERE a.conversion_flag = 1
            AND a.response_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY DATE(a.response_timestamp)
            ORDER BY revenue_date DESC;
          `,
          sqlGold: `
            SELECT 
              f.performance_date_id as revenue_date,
              SUM(f.total_conversion_revenue) as influenced_revenue,
              SUM(f.conversion_count) as conversions,
              COUNT(DISTINCT f.campaign_key) as campaign_count
            FROM fact_campaign_performance_daily f
            WHERE f.performance_date_id >= FORMAT_DATE('%Y%m%d', DATE_TRUNC('month', CURRENT_DATE))
            GROUP BY f.performance_date_id
            ORDER BY revenue_date DESC;
          `,
        },
      ],
    },
  ],
  totalMetrics: 300,
  lastUpdated: '2025-01-15',
};

export default marketingOrchestrationMetricsCatalog;
