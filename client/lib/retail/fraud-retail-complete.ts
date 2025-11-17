/**
 * FRAUD-RETAIL COMPLETE DOMAIN
 * 
 * Domain: Fraud Detection & Prevention Retail
 * Coverage: Fraud alerts, cases, investigations, chargebacks, identity verification
 * 
 * COMPLETE: Bronze (20) + Silver (15) + Gold (10 dims + 6 facts) + Metrics (390)
 */

import { fraudRetailBronzeLayer, fraudRetailSilverLayer, fraudRetailGoldLayer } from './fraud-retail-comprehensive';

export const fraudRetailComplete = {
  domainId: 'fraud-retail',
  domainName: 'Fraud-Retail',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: fraudRetailBronzeLayer.totalTables,
    estimatedSize: '1.1TB',
    tables: fraudRetailBronzeLayer.tables.map((t: any) => t.name),
  },
  
  silver: {
    totalTables: fraudRetailSilverLayer.totalTables,
    estimatedSize: '700GB',
    tables: fraudRetailSilverLayer.tables.map((t: any) => t.name),
  },
  
  gold: {
    dimensions: {
      count: fraudRetailGoldLayer.totalDimensions,
      list: fraudRetailGoldLayer.dimensions.map((d: any) => d.name),
    },
    facts: {
      count: fraudRetailGoldLayer.totalFacts,
      list: fraudRetailGoldLayer.facts.map((f: any) => f.name),
    },
    totalTables: fraudRetailGoldLayer.totalDimensions + fraudRetailGoldLayer.totalFacts,
    estimatedSize: '800GB',
  },
  
  metrics: {
    totalMetrics: 390,
    totalCategories: 8,
    categories: [
      { name: 'Fraud Alert Metrics', count: 55 },
      { name: 'Investigation Metrics', count: 50 },
      { name: 'Loss Metrics', count: 45 },
      { name: 'Detection Performance Metrics', count: 50 },
      { name: 'False Positive Metrics', count: 45 },
      { name: 'Chargeback Metrics', count: 50 },
      { name: 'Rule Effectiveness Metrics', count: 45 },
      { name: 'Identity Verification Metrics', count: 50 },
    ],
  },
  
  regulatoryCompliance: ['BSA/AML fraud reporting', 'Reg E fraud dispute rights', 'Card network fraud rules', 'State identity theft laws'],
};

// Re-export the comprehensive layers
export { fraudRetailBronzeLayer, fraudRetailSilverLayer, fraudRetailGoldLayer };
