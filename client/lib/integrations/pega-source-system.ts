/**
 * PEGA Source System Integration
 * 
 * Integration Layer: Bronze Layer
 * Purpose: Marketing Orchestration & Campaign Management
 * Data Flow: PEGA BPM → Bronze Layer → Silver (transformation) → Gold (aggregation)
 * 
 * PEGA provides workflow orchestration, business rules, and campaign decisioning
 * for personalized customer interactions across all banking channels.
 */

export interface PegaSourceSystem {
  id: string;
  name: string;
  description: string;
  category: 'MarketingOrchestration' | 'CampaignManagement' | 'DecisioningEngine';
  dataClassification: 'Confidential' | 'Internal' | 'Public';
}

export interface PegaBronzeTable {
  name: string;
  description: string;
  sourceEntity: string;
  grain: string;
  updateFrequency: 'Real-time' | 'Hourly' | 'Daily';
  estimatedRowsPerDay: number;
  keyFields: string[];
  relatedDomains: string[];
}

export const pegaSourceSystem: PegaSourceSystem = {
  id: 'pega',
  name: 'PEGA',
  description: 'PEGA Infinity - Marketing Orchestration, Campaign Management, and Next-Best-Action (NBA) decisioning engine',
  category: 'MarketingOrchestration',
  dataClassification: 'Confidential',
};

export const pegaBronzeTables: PegaBronzeTable[] = [
  {
    name: 'pega_campaign_master',
    description: 'Campaign definitions, rules, and execution parameters',
    sourceEntity: 'Campaign',
    grain: 'One row per campaign version',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 50000,
    keyFields: ['campaign_id', 'version', 'effective_date'],
    relatedDomains: ['marketing-orchestration'],
  },
  {
    name: 'pega_campaign_execution',
    description: 'Campaign execution events and performance metrics',
    sourceEntity: 'CampaignExecution',
    grain: 'One row per execution event',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 5000000,
    keyFields: ['execution_id', 'campaign_id', 'customer_id', 'event_timestamp'],
    relatedDomains: ['marketing-orchestration', 'customer-core'],
  },
  {
    name: 'pega_nba_decisions',
    description: 'Next-Best-Action (NBA) decisions and recommendations',
    sourceEntity: 'NBADecision',
    grain: 'One row per decision',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 2000000,
    keyFields: ['decision_id', 'customer_id', 'interaction_id', 'decision_timestamp'],
    relatedDomains: ['marketing-orchestration', 'crm-analytics'],
  },
  {
    name: 'pega_nba_strategy',
    description: 'NBA strategy configurations and prioritization rules',
    sourceEntity: 'NBAStrategy',
    grain: 'One row per strategy',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 1000,
    keyFields: ['strategy_id', 'effective_date'],
    relatedDomains: ['marketing-orchestration'],
  },
  {
    name: 'pega_customer_interaction',
    description: 'Customer interaction history from PEGA orchestration',
    sourceEntity: 'CustomerInteraction',
    grain: 'One row per interaction',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 3000000,
    keyFields: ['interaction_id', 'customer_id', 'channel', 'interaction_date'],
    relatedDomains: ['marketing-orchestration', 'customer-core', 'channels'],
  },
  {
    name: 'pega_customer_decisioning_segment',
    description: 'Customer segments used in decisioning and targeting',
    sourceEntity: 'CustomerSegment',
    grain: 'One row per customer-segment assignment',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 1500000,
    keyFields: ['customer_id', 'segment_id', 'effective_date'],
    relatedDomains: ['marketing-orchestration', 'customer-core'],
  },
  {
    name: 'pega_offer_catalog',
    description: 'Product offers and offer configurations managed by PEGA',
    sourceEntity: 'Offer',
    grain: 'One row per offer version',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 10000,
    keyFields: ['offer_id', 'version', 'effective_date'],
    relatedDomains: ['marketing-orchestration'],
  },
  {
    name: 'pega_offer_presentation',
    description: 'Offers presented to customers through PEGA orchestration',
    sourceEntity: 'OfferPresentation',
    grain: 'One row per presentation event',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 4000000,
    keyFields: ['presentation_id', 'customer_id', 'offer_id', 'channel', 'presentation_date'],
    relatedDomains: ['marketing-orchestration', 'crm-analytics'],
  },
  {
    name: 'pega_offer_response',
    description: 'Customer responses to offers (accepted, declined, viewed)',
    sourceEntity: 'OfferResponse',
    grain: 'One row per response',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 1000000,
    keyFields: ['response_id', 'customer_id', 'offer_id', 'response_type', 'response_date'],
    relatedDomains: ['marketing-orchestration', 'crm-analytics'],
  },
  {
    name: 'pega_business_rule_execution',
    description: 'Business rule evaluations and outcomes in PEGA',
    sourceEntity: 'BusinessRuleExecution',
    grain: 'One row per rule execution',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 10000000,
    keyFields: ['rule_execution_id', 'customer_id', 'rule_id', 'execution_timestamp'],
    relatedDomains: ['marketing-orchestration', 'compliance'],
  },
  {
    name: 'pega_propensity_score',
    description: 'Propensity scores calculated by PEGA analytics models',
    sourceEntity: 'PropensityScore',
    grain: 'One row per customer per product',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 200000,
    keyFields: ['customer_id', 'product_id', 'score_date'],
    relatedDomains: ['marketing-orchestration', 'crm-analytics'],
  },
  {
    name: 'pega_channel_preference',
    description: 'Customer channel preferences and interaction history for orchestration',
    sourceEntity: 'ChannelPreference',
    grain: 'One row per customer',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 100000,
    keyFields: ['customer_id', 'preference_date'],
    relatedDomains: ['marketing-orchestration', 'channels'],
  },
];

export const pegaSilverTransformations = {
  description: 'Silver layer transformation rules for PEGA data',
  domain: 'marketing-orchestration',
  transformations: [
    {
      sourceBronze: 'pega_campaign_master',
      silverTable: 'silver.dim_marketing_campaign',
      businessLogic: 'Standardize campaign attributes, apply SCD Type 2 for historical tracking',
    },
    {
      sourceBronze: 'pega_campaign_execution',
      silverTable: 'silver.fct_campaign_execution',
      businessLogic: 'Aggregate execution events, calculate campaign metrics, apply data quality rules',
    },
    {
      sourceBronze: 'pega_nba_decisions',
      silverTable: 'silver.fct_nba_decisions',
      businessLogic: 'Track decision accuracy, join with customer segment and interaction context',
    },
    {
      sourceBronze: 'pega_offer_presentation',
      silverTable: 'silver.fct_offer_presentation',
      businessLogic: 'Combine with offer response for conversion tracking',
    },
    {
      sourceBronze: 'pega_customer_decisioning_segment',
      silverTable: 'silver.dim_customer_segment',
      businessLogic: 'Deduplicate, apply SCD Type 2 for segment membership changes',
    },
  ],
};

export const pegaIntegrationMetadata = {
  sourceSystem: 'PEGA',
  integrationPattern: 'Real-time event streaming + daily batch',
  dataLatency: {
    realTime: '< 5 minutes',
    batch: 'Daily at 2:00 AM UTC',
  },
  volumeEstimates: {
    dailyEvents: '~25 million',
    monthlyStorage: '~500 GB',
  },
  keyFeatures: [
    'Next-Best-Action decisioning',
    'Multi-channel campaign orchestration',
    'Real-time customer interaction tracking',
    'Propensity and affinity scoring',
    'Business rule engine integration',
    'Channel preference management',
  ],
  dataOwner: {
    team: 'Marketing Operations',
    department: 'Customer Experience',
  },
  sla: {
    uptime: 99.9,
    maxLatencyHours: 0.083, // 5 minutes for real-time
    rpo: 'Real-time',
    rto: '1 hour',
  },
};
