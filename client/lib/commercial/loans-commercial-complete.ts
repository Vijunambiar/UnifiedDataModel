/**
 * LOANS-COMMERCIAL COMPLETE DOMAIN
 * 
 * Domain: Commercial Lending & Credit
 * Area: Commercial Banking
 * Coverage: C&I loans, CRE loans, lines of credit, term loans, participations, covenants
 * 
 * COMPLETE: Bronze (20) + Silver (15) + Gold (10 dims + 6 facts) + Metrics (480)
 */

import { loansCommercialBronzeLayer, loansCommercialSilverLayer, loansCommercialGoldLayer } from './loans-commercial-comprehensive';

export const loansCommercialComplete = {
  domainId: 'loans-commercial',
  domainName: 'Loans-Commercial',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: loansCommercialBronzeLayer.totalTables,
    estimatedSize: '2.5TB',
    refreshFrequency: 'Real-time streaming + daily batch',
    tables: loansCommercialBronzeLayer.tables.map((t: any) => t.name),
  },
  
  silver: {
    totalTables: loansCommercialSilverLayer.totalTables,
    estimatedSize: '1.6TB',
    refreshFrequency: 'Daily',
    tables: loansCommercialSilverLayer.tables.map((t: any) => t.name),
  },
  
  gold: {
    dimensions: {
      count: loansCommercialGoldLayer.totalDimensions,
      list: loansCommercialGoldLayer.dimensions.map((d: any) => d.name),
    },
    facts: {
      count: loansCommercialGoldLayer.totalFacts,
      list: loansCommercialGoldLayer.facts.map((f: any) => f.name),
    },
    totalTables: loansCommercialGoldLayer.totalDimensions + loansCommercialGoldLayer.totalFacts,
    estimatedSize: '2TB',
  },
  
  metrics: {
    totalMetrics: 480,
    totalCategories: 10,
    categories: [
      { name: 'Loan Origination Metrics', count: 55 },
      { name: 'Portfolio Quality Metrics', count: 60 },
      { name: 'C&I Loan Metrics', count: 50 },
      { name: 'CRE Loan Metrics', count: 55 },
      { name: 'Line of Credit Metrics', count: 45 },
      { name: 'Collateral Coverage Metrics', count: 50 },
      { name: 'Covenant Compliance Metrics', count: 45 },
      { name: 'Credit Review Metrics', count: 40 },
      { name: 'Loan Profitability Metrics', count: 40 },
      { name: 'Risk Grade Metrics', count: 40 },
    ],
  },
  
  regulatoryCompliance: ['Commercial lending standards', 'CRE concentration limits', 'Shared National Credit requirements', 'Leveraged lending guidance', 'CECL reserves'],
};

export { loansCommercialBronzeLayer, loansCommercialSilverLayer, loansCommercialGoldLayer };
