/**
 * INSURANCE-RETAIL COMPLETE DOMAIN
 * 
 * Domain: Insurance Products Retail
 * Coverage: Life insurance, auto, home, umbrella policies sold through bank
 * 
 * COMPLETE: Bronze (20) + Silver (15) + Gold (10 dims + 6 facts) + Metrics (300)
 */

import { insuranceRetailBronzeLayer, insuranceRetailSilverLayer, insuranceRetailGoldLayer } from './insurance-retail-comprehensive';

export const insuranceRetailComplete = {
  domainId: 'insurance-retail',
  domainName: 'Insurance-Retail',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: insuranceRetailBronzeLayer.totalTables,
    estimatedSize: '700GB',
    tables: insuranceRetailBronzeLayer.tables.map((t: any) => t.name),
  },
  
  silver: {
    totalTables: insuranceRetailSilverLayer.totalTables,
    estimatedSize: '450GB',
    tables: insuranceRetailSilverLayer.tables.map((t: any) => t.name),
  },
  
  gold: {
    dimensions: {
      count: insuranceRetailGoldLayer.totalDimensions,
      list: insuranceRetailGoldLayer.dimensions.map((d: any) => d.name),
    },
    facts: {
      count: insuranceRetailGoldLayer.totalFacts,
      list: insuranceRetailGoldLayer.facts.map((f: any) => f.name),
    },
    totalTables: insuranceRetailGoldLayer.totalDimensions + insuranceRetailGoldLayer.totalFacts,
    estimatedSize: '550GB',
  },
  
  metrics: {
    totalMetrics: 300,
    totalCategories: 6,
    categories: [
      { name: 'Policy Metrics', count: 55 },
      { name: 'Premium Metrics', count: 50 },
      { name: 'Claims Metrics', count: 55 },
      { name: 'Underwriting Metrics', count: 45 },
      { name: 'Agent Performance Metrics', count: 50 },
      { name: 'Loss Ratio Metrics', count: 45 },
    ],
  },
  
  regulatoryCompliance: ['State insurance regulations', 'NAIC reporting requirements', 'Policy reserve calculations', 'Claims processing standards'],
};

// Re-export the comprehensive layers
export { insuranceRetailBronzeLayer, insuranceRetailSilverLayer, insuranceRetailGoldLayer };
