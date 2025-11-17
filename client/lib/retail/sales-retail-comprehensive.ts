import type { Domain } from '../schema-types';
import { salesRetailBronzeLayerComplete } from './sales-retail-bronze-layer';
import { salesRetailSilverLayerComplete } from './sales-retail-silver-layer';
import { salesRetailGoldLayerComplete } from './sales-retail-gold-layer';
import { salesRetailMetricsComplete } from './sales-retail-metrics';
import { salesRetailERD } from './sales-retail-erd';

// Export layers with required naming convention for domain-evaluation.ts
export const salesRetailBronzeLayer = salesRetailBronzeLayerComplete;
export const salesRetailSilverLayer = salesRetailSilverLayerComplete;
export const salesRetailGoldLayer = salesRetailGoldLayerComplete;

/**
 * SALES-RETAIL DOMAIN - COMPREHENSIVE DEFINITION
 * 
 * Complete sales domain for retail banking
 * Covers sales pipeline, lead management, activities, and commissions
 */

export const salesRetailComprehensive: Domain = {
  id: 'sales-retail',
  name: 'Sales-Retail',
  displayName: 'Sales & CRM',
  icon: '📊',
  
  description: 'Sales pipeline management, lead tracking, opportunity management, and commission calculations for retail banking products',
  
  category: 'Revenue',
  priority: 'P0',
  complexity: 'High',
  businessValue: 'Critical',
  
  // DOMAIN STRUCTURE
  subDomains: [
    'Sales Pipeline',
    'Lead Management',
    'Opportunity Management',
    'Sales Activities',
    'Quote Management',
    'Territory Management',
    'Commission Management',
    'Referral Program',
  ],
  
  // DATA LAYERS
  bronzeLayer: salesRetailBronzeLayerComplete,
  silverLayer: salesRetailSilverLayerComplete,
  goldLayer: salesRetailGoldLayerComplete,
  
  // METRICS
  metrics: salesRetailMetricsComplete,
  
  // ERD
  erd: salesRetailERD,
  
  // KEY ENTITIES
  keyEntities: [
    'Opportunity',
    'Lead',
    'Sales Activity',
    'Quote',
    'Sales Rep',
    'Territory',
    'Commission',
    'Referral',
  ],
  
  // DATA SOURCES
  dataSources: [
    {
      name: 'Salesforce CRM',
      type: 'SaaS Application',
      refreshFrequency: 'Real-time CDC',
      volumePerDay: '50K records',
      integration: 'API + CDC',
      criticality: 'Mission Critical',
    },
    {
      name: 'HubSpot',
      type: 'Marketing Automation',
      refreshFrequency: 'Hourly',
      volumePerDay: '20K records',
      integration: 'API',
      criticality: 'High',
    },
    {
      name: 'Commission Management System',
      type: 'Internal Application',
      refreshFrequency: 'Daily',
      volumePerDay: '5K records',
      integration: 'Database Export',
      criticality: 'High',
    },
    {
      name: 'Referral Platform',
      type: 'SaaS Application',
      refreshFrequency: 'Hourly',
      volumePerDay: '1K records',
      integration: 'API',
      criticality: 'Medium',
    },
  ],
  
  // USE CASES
  useCases: [
    'Sales pipeline analysis and forecasting',
    'Lead scoring and prioritization',
    'Win/loss analysis',
    'Sales rep performance tracking',
    'Quota attainment monitoring',
    'Commission calculation and reconciliation',
    'Sales activity productivity analysis',
    'Territory optimization',
    'Customer acquisition cost (CAC) analysis',
    'Attribution modeling (campaign to conversion)',
    'Sales cycle benchmarking',
    'Referral program ROI tracking',
  ],
  
  // REGULATORY
  regulatoryRequirements: [
    {
      framework: 'SOX (Sarbanes-Oxley)',
      description: 'Financial controls for commission calculations',
      implementation: 'Audit trail for all commission adjustments and approvals',
    },
    {
      framework: 'TCPA (Telephone Consumer Protection Act)',
      description: 'Do-not-call compliance',
      implementation: 'Track do_not_call, do_not_email flags on leads',
    },
    {
      framework: 'GDPR / CCPA',
      description: 'Customer consent and data privacy',
      implementation: 'Consent tracking on leads (email_opt_in, gdpr_consent)',
    },
    {
      framework: 'FINRA (for investment products)',
      description: 'Supervision and surveillance of sales activities',
      implementation: 'Activity logging for all client interactions',
    },
  ],
  
  // ARCHITECTURE
  architecture: {
    modelingApproach: 'Kimball Dimensional Modeling',
    dataVaultImplementation: false,
    lakehouseArchitecture: 'Bronze (Raw) → Silver (Conformed) → Gold (Star Schema)',
    
    dataGovernance: {
      piiHandling: 'Mask customer email/phone in non-prod environments',
      dataRetention: '7 years (regulatory requirement)',
      masterDataManagement: 'SCD Type 2 for opportunities and leads',
    },
    
    dataQuality: {
      completenessTarget: '95%',
      accuracyTarget: '99%',
      timelinessTarget: '<5 minutes for opportunities (real-time CDC)',
    },
  },
  
  // INTEGRATION PATTERNS
  integrationPatterns: [
    'Real-time CDC from Salesforce for opportunities, leads, activities',
    'Daily batch for commission calculations (end-of-day)',
    'Hourly incremental for quotes and referrals',
    'Event-driven triggers for pipeline snapshots (daily at 11:59 PM)',
  ],
  
  // BUSINESS GLOSSARY
  businessGlossary: [
    { term: 'Opportunity', definition: 'A qualified sales prospect with defined value and close date' },
    { term: 'Lead', definition: 'An unqualified prospect who has expressed interest' },
    { term: 'Win Rate', definition: 'Percentage of closed opportunities that were won (Won / (Won + Lost))' },
    { term: 'Sales Cycle', definition: 'Average days from opportunity creation to close' },
    { term: 'Pipeline Coverage', definition: 'Ratio of weighted pipeline to quota (e.g., 3x coverage)' },
    { term: 'BANT', definition: 'Budget, Authority, Need, Timeline - lead qualification criteria' },
    { term: 'Clawback', definition: 'Reversal of commission if customer closes account within period' },
    { term: 'Stage Progression', definition: 'Movement of opportunity through sales stages' },
    { term: 'Quota Attainment', definition: 'Percentage of quota achieved by sales rep' },
    { term: 'Pipeline Slippage', definition: 'Opportunities whose close date was pushed out' },
  ],
  
  // DEPENDENCIES
  dependencies: {
    upstream: [
      'Marketing-Retail (campaigns, lead sources)',
      'Customer-Retail (account creation, customer master)',
      'Product catalog (products being sold)',
    ],
    downstream: [
      'Finance (revenue recognition, commission expense)',
      'HR (payroll integration for commissions)',
      'Executive dashboards (sales performance)',
    ],
  },
  
  // STATUS
  implementationStatus: 'Complete',
  dataQualityGrade: 'A',
  completenessScore: 100,
  lastUpdated: '2025-01-08',
  
  // METADATA
  owner: 'Sales Operations',
  steward: 'Revenue Analytics Team',
  technicalContact: 'Data Engineering Team',
};
