/**
 * SALESFORCE Source System Integration
 * 
 * Integration Layer: Bronze Layer
 * Purpose: CRM Analytics & Customer Engagement
 * Data Flow: SALESFORCE CRM → Bronze Layer → Silver (transformation) → Gold (aggregation)
 * 
 * SALESFORCE provides comprehensive CRM data including accounts, contacts, opportunities,
 * activities, and revenue insights for customer relationship management and personalization.
 */

export interface SalesforceSourceSystem {
  id: string;
  name: string;
  description: string;
  category: 'CRM' | 'CustomerEngagement' | 'RevenueManagement';
  dataClassification: 'Confidential' | 'Internal' | 'Public';
}

export interface SalesforceObjectTable {
  name: string;
  description: string;
  sourceObject: string;
  grain: string;
  updateFrequency: 'Real-time' | 'Hourly' | 'Daily';
  estimatedRowsPerDay: number;
  keyFields: string[];
  relatedDomains: string[];
}

export const salesforceSourceSystem: SalesforceSourceSystem = {
  id: 'salesforce',
  name: 'SALESFORCE',
  description: 'SALESFORCE CRM - Customer Relationship Management, Account Management, Opportunities, and Customer Engagement',
  category: 'CRM',
  dataClassification: 'Confidential',
};

export const salesforceObjectTables: SalesforceObjectTable[] = [
  {
    name: 'salesforce_account',
    description: 'Corporate accounts and business customer information',
    sourceObject: 'Account',
    grain: 'One row per account',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 100000,
    keyFields: ['account_id', 'account_name', 'last_modified_date'],
    relatedDomains: ['crm-analytics', 'customer-core'],
  },
  {
    name: 'salesforce_contact',
    description: 'Contact records for individuals within accounts',
    sourceObject: 'Contact',
    grain: 'One row per contact',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 500000,
    keyFields: ['contact_id', 'account_id', 'email', 'last_modified_date'],
    relatedDomains: ['crm-analytics', 'customer-core'],
  },
  {
    name: 'salesforce_lead',
    description: 'Sales leads and prospect records',
    sourceObject: 'Lead',
    grain: 'One row per lead',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 1000000,
    keyFields: ['lead_id', 'email', 'lead_status', 'created_date'],
    relatedDomains: ['crm-analytics', 'marketing-orchestration'],
  },
  {
    name: 'salesforce_opportunity',
    description: 'Sales opportunities and pipeline records',
    sourceObject: 'Opportunity',
    grain: 'One row per opportunity',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 500000,
    keyFields: ['opportunity_id', 'account_id', 'stage', 'close_date'],
    relatedDomains: ['crm-analytics', 'revenue'],
  },
  {
    name: 'salesforce_task',
    description: 'Sales activities and task records',
    sourceObject: 'Task',
    grain: 'One row per task',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 2000000,
    keyFields: ['task_id', 'who_id', 'what_id', 'activity_date'],
    relatedDomains: ['crm-analytics', 'customer-core'],
  },
  {
    name: 'salesforce_event',
    description: 'Calendar events and customer interactions',
    sourceObject: 'Event',
    grain: 'One row per event',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 1500000,
    keyFields: ['event_id', 'who_id', 'what_id', 'activity_date'],
    relatedDomains: ['crm-analytics', 'channels'],
  },
  {
    name: 'salesforce_campaign',
    description: 'Marketing campaigns managed in SALESFORCE',
    sourceObject: 'Campaign',
    grain: 'One row per campaign',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 10000,
    keyFields: ['campaign_id', 'campaign_name', 'status', 'start_date'],
    relatedDomains: ['crm-analytics', 'marketing-orchestration'],
  },
  {
    name: 'salesforce_campaign_member',
    description: 'Campaign membership and response tracking',
    sourceObject: 'CampaignMember',
    grain: 'One row per lead/contact-campaign membership',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 1000000,
    keyFields: ['campaign_member_id', 'campaign_id', 'contact_id', 'status'],
    relatedDomains: ['crm-analytics', 'marketing-orchestration'],
  },
  {
    name: 'salesforce_activity_history',
    description: 'Historical tracking of all customer interactions and activities',
    sourceObject: 'ActivityHistory',
    grain: 'One row per activity',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 3000000,
    keyFields: ['activity_id', 'contact_id', 'account_id', 'activity_type', 'activity_date'],
    relatedDomains: ['crm-analytics', 'customer-core', 'channels'],
  },
  {
    name: 'salesforce_relationship',
    description: 'Account and contact relationships and hierarchy',
    sourceObject: 'AccountContactRelation',
    grain: 'One row per relationship',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 200000,
    keyFields: ['relationship_id', 'account_id', 'contact_id', 'relationship_type'],
    relatedDomains: ['crm-analytics', 'customer-core'],
  },
  {
    name: 'salesforce_user',
    description: 'SALESFORCE user accounts (sales reps, managers)',
    sourceObject: 'User',
    grain: 'One row per user',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 1000,
    keyFields: ['user_id', 'username', 'email', 'is_active'],
    relatedDomains: ['crm-analytics', 'operations'],
  },
  {
    name: 'salesforce_custom_object_engagement',
    description: 'Custom object for customer engagement scoring and tracking',
    sourceObject: 'Customer_Engagement__c',
    grain: 'One row per engagement record',
    updateFrequency: 'Real-time',
    estimatedRowsPerDay: 500000,
    keyFields: ['engagement_id', 'contact_id', 'engagement_score', 'engagement_date'],
    relatedDomains: ['crm-analytics', 'customer-core'],
  },
  {
    name: 'salesforce_account_insights',
    description: 'AI-powered account insights and recommendations',
    sourceObject: 'AccountInsights',
    grain: 'One row per account per insight',
    updateFrequency: 'Daily',
    estimatedRowsPerDay: 50000,
    keyFields: ['insight_id', 'account_id', 'insight_type', 'generated_date'],
    relatedDomains: ['crm-analytics', 'customer-core'],
  },
  {
    name: 'salesforce_forecast',
    description: 'Sales forecasts and pipeline projections',
    sourceObject: 'ForecastHistory',
    grain: 'One row per forecast per period',
    updateFrequency: 'Weekly',
    estimatedRowsPerDay: 50000,
    keyFields: ['forecast_id', 'user_id', 'forecast_period', 'forecast_date'],
    relatedDomains: ['crm-analytics', 'revenue'],
  },
];

export const salesforceSilverTransformations = {
  description: 'Silver layer transformation rules for SALESFORCE data',
  domain: 'crm-analytics',
  transformations: [
    {
      sourceBronze: 'salesforce_account',
      silverTable: 'silver.dim_crm_account',
      businessLogic: 'Standardize account attributes, apply SCD Type 2 for historical tracking',
    },
    {
      sourceBronze: 'salesforce_contact',
      silverTable: 'silver.dim_crm_contact',
      businessLogic: 'Deduplicate contacts, join with customer-core for master data alignment',
    },
    {
      sourceBronze: 'salesforce_opportunity',
      silverTable: 'silver.fct_crm_opportunity',
      businessLogic: 'Track opportunity lifecycle, calculate revenue metrics',
    },
    {
      sourceBronze: 'salesforce_activity_history',
      silverTable: 'silver.fct_crm_activity',
      businessLogic: 'Aggregate activities by contact, type, and date for engagement metrics',
    },
    {
      sourceBronze: 'salesforce_campaign_member',
      silverTable: 'silver.fct_campaign_response',
      businessLogic: 'Track campaign responses, join with PEGA campaign data for cross-system attribution',
    },
    {
      sourceBronze: 'salesforce_custom_object_engagement',
      silverTable: 'silver.fct_customer_engagement',
      businessLogic: 'Calculate engagement trends, apply time-series analysis',
    },
  ],
};

export const salesforceIntegrationMetadata = {
  sourceSystem: 'SALESFORCE',
  integrationPattern: 'Change Data Capture (CDC) + daily batch export',
  dataLatency: {
    realTime: '< 15 minutes',
    batch: 'Daily at 3:00 AM UTC',
  },
  volumeEstimates: {
    dailyEvents: '~10 million',
    monthlyStorage: '~300 GB',
  },
  keyFeatures: [
    'Complete account and contact hierarchy',
    'Sales opportunity pipeline management',
    'Activity and task tracking',
    'Multi-touch campaign attribution',
    'Engagement scoring and insights',
    'Sales forecasting and pipeline analytics',
    'Custom object extensibility',
  ],
  dataOwner: {
    team: 'Sales Operations & CRM',
    department: 'Customer Experience',
  },
  sla: {
    uptime: 99.95,
    maxLatencyHours: 0.25, // 15 minutes for real-time
    rpo: 'Real-time',
    rto: '2 hours',
  },
};
