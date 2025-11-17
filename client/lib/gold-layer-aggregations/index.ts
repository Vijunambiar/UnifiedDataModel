/**
 * GOLD LAYER AGGREGATIONS REGISTRY
 * 
 * Central catalog of all gold layer aggregations across domains
 * Pre-computed summary tables optimized for analytics and BI consumption
 */

import {
  marketingOrchestrationAggregations,
  marketingOrchestrationWeeklyAggregations,
  marketingOrchestrationMonthlyAggregations,
  marketingOrchestrationRealTimeAggregations,
  marketingOrchestrationAggregationStrategy,
} from './marketing-orchestration-aggregations';

import {
  crmAnalyticsAggregations,
  crmAnalyticsWeeklyAggregations,
  crmAnalyticsMonthlyAggregations,
  crmAnalyticsRealTimeAggregations,
  crmAnalyticsAggregationStrategy,
} from './crm-analytics-aggregations';

export interface AggregationRegistry {
  domain: string;
  dailyAggregations: any[];
  weeklyAggregations: any[];
  monthlyAggregations: any[];
  realTimeAggregations: any[];
  strategy: any;
}

export const goldLayerAggregationRegistry: AggregationRegistry[] = [
  {
    domain: 'marketing-orchestration',
    dailyAggregations: marketingOrchestrationAggregations,
    weeklyAggregations: marketingOrchestrationWeeklyAggregations,
    monthlyAggregations: marketingOrchestrationMonthlyAggregations,
    realTimeAggregations: marketingOrchestrationRealTimeAggregations,
    strategy: marketingOrchestrationAggregationStrategy,
  },
  {
    domain: 'crm-analytics',
    dailyAggregations: crmAnalyticsAggregations,
    weeklyAggregations: crmAnalyticsWeeklyAggregations,
    monthlyAggregations: crmAnalyticsMonthlyAggregations,
    realTimeAggregations: crmAnalyticsRealTimeAggregations,
    strategy: crmAnalyticsAggregationStrategy,
  },
];

export const goldLayerAggregationsSummary = {
  totalDomains: goldLayerAggregationRegistry.length,
  totalAggregations: {
    daily: 16,
    weekly: 4,
    monthly: 3,
    realTime: 4,
    total: 27,
  },
  storageEstimate: {
    marketingOrchestration: '~67GB',
    crmAnalytics: '~103GB',
    total: '~170GB',
  },
  updateSchedule: [
    {
      time: '1:00-2:45 AM UTC',
      description: 'Marketing Orchestration daily aggregations',
      tables: 8,
    },
    {
      time: '6:00-7:45 AM UTC',
      description: 'CRM Analytics daily aggregations',
      tables: 8,
    },
    {
      time: 'Every Monday 3:00-3:30 AM UTC',
      description: 'Weekly aggregations (both domains)',
      tables: 4,
    },
    {
      time: 'Every Monday 8:00-8:30 AM UTC',
      description: 'Weekly CRM Analytics aggregations',
      tables: 2,
    },
    {
      time: '1st of month 4:00 AM UTC',
      description: 'Monthly Marketing Orchestration summary',
      tables: 1,
    },
    {
      time: '1st of month 9:00-9:30 AM UTC',
      description: 'Monthly CRM Analytics summaries',
      tables: 2,
    },
  ],
  realTimeAggregations: {
    marketingOrchestration: {
      frequency: 'Every 15 minutes',
      tables: 2,
      latency: '< 15 minutes',
    },
    crmAnalytics: {
      frequency: 'Every 30 minutes',
      tables: 2,
      latency: '< 30 minutes',
    },
  },
  biTools: [
    'Tableau',
    'Power BI',
    'Looker',
    'Qlik',
    'Microstrategy',
    'Custom REST APIs',
  ],
  queryPatterns: {
    marketing: [
      'Campaign performance trending (daily to monthly)',
      'Offer effectiveness analysis by segment/channel',
      'NBA decision accuracy and impact',
      'Propensity score distribution and lift',
      'Marketing ROI and budget efficiency',
      'Channel performance comparison',
      'Personalization effectiveness',
    ],
    sales: [
      'Sales pipeline by stage, rep, territory',
      'Opportunity tracking and progression',
      'Account health scorecard',
      'Sales rep activity and productivity',
      'Contact engagement and responsiveness',
      'Sales forecast accuracy',
      'Lead quality and conversion',
      'Quota attainment tracking',
    ],
    crossDomain: [
      'Marketing-influenced sales opportunities',
      'Customer engagement correlation with pipeline',
      'PEGA NBA impact on SALESFORCE deal velocity',
      'Orchestration-driven revenue attribution',
    ],
  },
};

// Helper functions
export function getAggregationsByDomain(domain: string): AggregationRegistry | undefined {
  return goldLayerAggregationRegistry.find((r) => r.domain === domain);
}

export function getAllDailyAggregations(): any[] {
  return goldLayerAggregationRegistry.flatMap((r) => r.dailyAggregations);
}

export function getAllWeeklyAggregations(): any[] {
  return goldLayerAggregationRegistry.flatMap((r) => r.weeklyAggregations);
}

export function getAllMonthlyAggregations(): any[] {
  return goldLayerAggregationRegistry.flatMap((r) => r.monthlyAggregations);
}

export function getAllRealTimeAggregations(): any[] {
  return goldLayerAggregationRegistry.flatMap((r) => r.realTimeAggregations);
}

export function getAggregationByName(name: string): any {
  for (const registry of goldLayerAggregationRegistry) {
    const allAggs = [
      ...registry.dailyAggregations,
      ...registry.weeklyAggregations,
      ...registry.monthlyAggregations,
      ...registry.realTimeAggregations,
    ];
    const found = allAggs.find((agg) => agg.name === name);
    if (found) return found;
  }
  return undefined;
}

export const goldLayerAggregationsBestPractices = {
  designPrinciples: [
    'Pre-aggregate at multiple levels (daily, weekly, monthly) for query performance',
    'Maintain denormalized fact tables to reduce join complexity',
    'Use date/time partitioning for efficient time-series queries',
    'Cluster on frequently filtered dimensions (campaign, rep, account)',
    'Keep raw fact tables alongside aggregates for drill-down analysis',
    'Set clear SLAs for each aggregation refresh cycle',
  ],
  maintainanceConsiderations: [
    'Monitor aggregation recalculation time to ensure SLA compliance',
    'Archive old aggregations (> 24 months) to cold storage',
    'Validate data consistency between fact tables and aggregations weekly',
    'Document lineage from source silver tables to gold aggregations',
    'Create alerts for failed aggregation refreshes',
    'Implement incremental updates where possible (vs. full recalculation)',
  ],
  performanceTuning: [
    'Use approximate aggregations (HyperLogLog) for very large cardinality metrics',
    'Leverage columnar storage and compression for storage efficiency',
    'Create materialized views for top 20% of ad-hoc queries',
    'Implement caching layer (Redis) for frequently accessed aggregations',
    'Use query result caching to reduce recalculation',
    'Implement aggregation pruning to avoid unused tables',
  ],
};
