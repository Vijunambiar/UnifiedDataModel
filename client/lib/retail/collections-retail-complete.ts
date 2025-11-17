/**
 * COLLECTIONS-RETAIL COMPLETE DOMAIN
 * 
 * Domain: Collections & Debt Recovery Retail
 * Coverage: Delinquency management, collections, charge-offs, recoveries
 * 
 * COMPLETE: Bronze (20) + Silver (15) + Gold (10 dims + 6 facts) + Metrics (350)
 */

import { collectionsRetailBronzeLayer, collectionsRetailSilverLayer, collectionsRetailGoldLayer } from './collections-retail-comprehensive';

export const collectionsRetailComplete = {
  domainId: 'collections-retail',
  domainName: 'Collections-Retail',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: collectionsRetailBronzeLayer.totalTables,
    estimatedSize: '1TB',
    tables: collectionsRetailBronzeLayer.tables.map((t: any) => t.name),
  },
  
  silver: {
    totalTables: collectionsRetailSilverLayer.totalTables,
    estimatedSize: '650GB',
    tables: collectionsRetailSilverLayer.tables.map((t: any) => t.name),
  },
  
  gold: {
    dimensions: {
      count: collectionsRetailGoldLayer.totalDimensions,
      list: collectionsRetailGoldLayer.dimensions.map((d: any) => d.name),
    },
    facts: {
      count: collectionsRetailGoldLayer.totalFacts,
      list: collectionsRetailGoldLayer.facts.map((f: any) => f.name),
    },
    totalTables: collectionsRetailGoldLayer.totalDimensions + collectionsRetailGoldLayer.totalFacts,
    estimatedSize: '750GB',
  },
  
  metrics: {
    totalMetrics: 350,
    totalCategories: 7,
    categories: [
      { name: 'Delinquency Metrics', count: 55 },
      { name: 'Collection Activity Metrics', count: 50 },
      { name: 'Recovery Metrics', count: 50 },
      { name: 'Collector Performance', count: 45 },
      { name: 'Legal Action Metrics', count: 45 },
      { name: 'Charge-off Metrics', count: 50 },
      { name: 'Agency Performance', count: 55 },
    ],
  },
  
  regulatoryCompliance: ['FDCPA compliance', 'TCPA compliance', 'State collection laws', 'Credit reporting requirements (FCRA)'],
};

// Re-export the comprehensive layers
export { collectionsRetailBronzeLayer, collectionsRetailSilverLayer, collectionsRetailGoldLayer };
