/**
 * DIGITAL-RETAIL COMPLETE DOMAIN
 * 
 * Domain: Digital & Mobile Banking Retail
 * Area: Retail Banking
 * Coverage: Online banking, mobile app, digital wallets, chatbots, API banking
 * 
 * COMPLETE IMPLEMENTATION: Bronze (20 tables) + Silver (15 tables) + Gold (10 dims + 6 facts) + Metrics (420)
 */

import { digitalRetailBronzeLayer, digitalRetailSilverLayer, digitalRetailGoldLayer } from './digital-retail-comprehensive';

export const digitalRetailComplete = {
  domainId: 'digital-retail',
  domainName: 'Digital-Retail',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: digitalRetailBronzeLayer.totalTables,
    estimatedSize: '1.2TB',
    refreshFrequency: 'Real-time streaming + CDC',
    tables: digitalRetailBronzeLayer.tables.map((t: any) => t.name),
  },
  
  silver: {
    totalTables: digitalRetailSilverLayer.totalTables,
    estimatedSize: '800GB',
    refreshFrequency: 'Hourly',
    tables: digitalRetailSilverLayer.tables.map((t: any) => t.name),
  },
  
  gold: {
    dimensions: {
      count: digitalRetailGoldLayer.totalDimensions,
      list: digitalRetailGoldLayer.dimensions.map((d: any) => d.name),
    },
    facts: {
      count: digitalRetailGoldLayer.totalFacts,
      list: digitalRetailGoldLayer.facts.map((f: any) => f.name),
    },
    totalTables: digitalRetailGoldLayer.totalDimensions + digitalRetailGoldLayer.totalFacts,
    estimatedSize: '1TB',
  },
  
  metrics: {
    totalMetrics: 420,
    totalCategories: 8,
    categories: [
      { name: 'Session Metrics', count: 60 },
      { name: 'Transaction Metrics', count: 65 },
      { name: 'Engagement Metrics', count: 55 },
      { name: 'Channel Performance', count: 50 },
      { name: 'Security Metrics', count: 45 },
      { name: 'API Metrics', count: 50 },
      { name: 'User Experience Metrics', count: 50 },
      { name: 'Digital Adoption Metrics', count: 45 },
    ],
  },
  
  regulatoryCompliance: ['FFIEC Guidance on Mobile Banking', 'PCI DSS for digital payments', 'GLBA privacy for online channels', 'E-SIGN Act compliance'],
};

// Re-export the comprehensive layers
export { digitalRetailBronzeLayer, digitalRetailSilverLayer, digitalRetailGoldLayer };
