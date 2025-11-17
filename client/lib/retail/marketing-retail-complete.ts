/**
 * MARKETING-RETAIL COMPLETE DOMAIN - ENHANCED QUALITY TEMPLATE
 *
 * Domain: Marketing & Campaign Management Retail
 * Coverage: Multi-channel campaigns, martech stack, attribution, customer journeys, ROI
 * Data Sources: 16 platforms (12 internal + 4 external paid media)
 *
 * COMPLETE: Bronze (25) + Silver (18) + Gold (12 dims + 8 facts) + Metrics (400+)
 *
 * Enhancement Date: 2025-01-09
 * Quality Level: Enterprise-Grade Template
 */

import {
  marketingRetailBronzeLayer,
  marketingRetailSilverLayer,
  marketingRetailGoldLayer,
  marketingRetailMetricsCatalog,
  marketingRetailLogicalERD,
  marketingRetailPhysicalERD,
  marketingRetailLogicalModel,
  marketingRetailPhysicalModel,
} from './marketing-retail-comprehensive';

export const marketingRetailComplete = {
  domainId: 'marketing-retail',
  domainName: 'Marketing-Retail',
  status: 'completed',
  completionDate: '2025-01-09',
  qualityLevel: 'Enterprise-Grade + Banking-Specific',
  version: '2.0',

  // Bronze Layer: Banking tables (10) + Platform tables (25) = 35 total
  bronze: {
    totalTables: 35,
    bankingTables: marketingRetailPhysicalModel?.bronzeLayer?.tables?.length || 10,
    platformTables: marketingRetailBronzeLayer.totalTables || 25,
    estimatedSize: '1.5TB',
    dailyVolume: '~30M events',
    tables: [
      // Banking-specific tables
      ...(marketingRetailPhysicalModel?.bronzeLayer?.tables?.map((t: any) => t.name) || []),
      // Platform tables
      ...marketingRetailBronzeLayer.tables.map((t: any) => t.name),
    ],
  },

  // Silver Layer: Banking tables (8) + Platform tables (18) = 26 total
  silver: {
    totalTables: 26,
    bankingTables: marketingRetailPhysicalModel?.silverLayer?.tables?.length || 8,
    platformTables: marketingRetailSilverLayer.totalTables || 18,
    estimatedSize: '900GB',
    tables: [
      ...(marketingRetailPhysicalModel?.silverLayer?.tables?.map((t: any) => t.name) || []),
      ...marketingRetailSilverLayer.tables.map((t: any) => t.name),
    ],
  },

  // Gold Layer: Banking (7 dims + 5 facts) + Platform (12 dims + 8 facts) = 32 total
  gold: {
    dimensions: {
      count: 19, // 7 banking + 12 platform
      bankingDimensions: marketingRetailPhysicalModel?.goldLayer?.dimensions?.length || 7,
      platformDimensions: marketingRetailGoldLayer.totalDimensions || 12,
      list: [
        ...(marketingRetailPhysicalModel?.goldLayer?.dimensions?.map((d: any) => d.name) || []),
        ...marketingRetailGoldLayer.dimensions.map((d: any) => d.name),
      ],
    },
    facts: {
      count: 13, // 5 banking + 8 platform
      bankingFacts: marketingRetailPhysicalModel?.goldLayer?.facts?.length || 5,
      platformFacts: marketingRetailGoldLayer.totalFacts || 8,
      list: [
        ...(marketingRetailPhysicalModel?.goldLayer?.facts?.map((f: any) => f.name) || []),
        ...marketingRetailGoldLayer.facts.map((f: any) => f.name),
      ],
    },
    totalTables: 32, // 19 dimensions + 13 facts
    estimatedSize: '1.1TB',
  },

  metrics: {
    totalMetrics: 400,
    totalCategories: 10,
    categories: [
      { name: 'Campaign Performance Metrics', count: 50 },
      { name: 'Email Marketing Metrics', count: 45 },
      { name: 'Paid Media Metrics', count: 50 },
      { name: 'Web Analytics Metrics', count: 40 },
      { name: 'Mobile Engagement Metrics', count: 35 },
      { name: 'Lead Generation & Scoring Metrics', count: 40 },
      { name: 'Multi-Touch Attribution Metrics', count: 45 },
      { name: 'Customer Journey Metrics', count: 35 },
      { name: 'Segmentation & Personalization Metrics', count: 30 },
      { name: 'Marketing ROI & Efficiency Metrics', count: 30 },
    ],
  },

  dataSources: {
    total: 17,
    internal: 13,
    external: 4,
    realTimeStreams: 5,
    platforms: [
      'CRM Platform (Salesforce)',
      'Marketing Automation (HubSpot/Marketo)',
      'Email Platform (SendGrid/Braze)',
      'Web Analytics (GA4/Adobe)',
      'CDP (Segment/mParticle)',
      'SMS Platform (Twilio/Attentive)',
      'Push Notifications (OneSignal/Airship)',
      'A/B Testing (Optimizely/VWO)',
      'Attribution (Bizible/Ruler)',
      'Social Management (Hootsuite/Sprinklr)',
      'Marketing Cloud (Salesforce)',
      'Referral Program (ReferralCandy/Extole)',
      'Offer Management',
      'Google Ads',
      'Meta Ads Manager',
      'LinkedIn Campaign Manager',
      'Twitter (X) Ads',
    ],
  },

  regulatoryCompliance: [
    'TCPA (Telephone Consumer Protection Act - phone/SMS consent)',
    'CAN-SPAM Act (email marketing)',
    'CFPB (Consumer Financial Protection Bureau - marketing disclosures)',
    'ECOA (Equal Credit Opportunity Act - non-discriminatory marketing)',
    'TILA (Truth in Lending Act - APR/fee disclosures)',
    'GDPR (EU privacy & consent)',
    'CCPA (California Consumer Privacy Act)',
    'CASL (Canada anti-spam)',
    'ePrivacy Directive (cookies)',
    'Gramm-Leach-Bliley Act (privacy notices)',
  ],

  // Banking-Specific Use Cases
  bankingUseCases: marketingRetailLogicalModel?.businessUseCases || [],

  // Model References
  models: {
    logicalModel: marketingRetailLogicalModel,
    physicalModel: marketingRetailPhysicalModel,
    logicalERD: marketingRetailLogicalERD,
    physicalERD: marketingRetailPhysicalERD,
  },
};

// Re-export the comprehensive layers, metrics catalog, ERD definitions, and banking models
export {
  marketingRetailBronzeLayer,
  marketingRetailSilverLayer,
  marketingRetailGoldLayer,
  marketingRetailMetricsCatalog,
  marketingRetailLogicalERD,
  marketingRetailPhysicalERD,
  marketingRetailLogicalModel,
  marketingRetailPhysicalModel,
};
