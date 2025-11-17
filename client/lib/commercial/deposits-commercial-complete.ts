/**
 * DEPOSITS-COMMERCIAL COMPLETE DOMAIN
 * 
 * Domain: Commercial Deposits & Treasury
 * Area: Commercial Banking
 * Coverage: DDA, analyzed accounts, sweep accounts, ZBA, MMDA, reciprocal deposits
 * 
 * COMPLETE: Bronze (20) + Silver (15) + Gold (10 dims + 6 facts) + Metrics (420)
 */

import { depositsCommercialBronzeLayer, depositsCommercialSilverLayer, depositsCommercialGoldLayer } from './deposits-commercial-comprehensive';

export const depositsCommercialComplete = {
  domainId: 'deposits-commercial',
  domainName: 'Deposits-Commercial',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: depositsCommercialBronzeLayer.totalTables,
    estimatedSize: '2TB',
    refreshFrequency: 'Real-time streaming + daily batch',
    tables: depositsCommercialBronzeLayer.tables.map((t: any) => t.name),
  },
  
  silver: {
    totalTables: depositsCommercialSilverLayer.totalTables,
    estimatedSize: '1.3TB',
    refreshFrequency: 'Daily',
    tables: depositsCommercialSilverLayer.tables.map((t: any) => t.name),
  },
  
  gold: {
    dimensions: {
      count: depositsCommercialGoldLayer.totalDimensions,
      list: depositsCommercialGoldLayer.dimensions.map((d: any) => d.name),
    },
    facts: {
      count: depositsCommercialGoldLayer.totalFacts,
      list: depositsCommercialGoldLayer.facts.map((f: any) => f.name),
    },
    totalTables: depositsCommercialGoldLayer.totalDimensions + depositsCommercialGoldLayer.totalFacts,
    estimatedSize: '1.5TB',
  },
  
  metrics: {
    totalMetrics: 420,
    totalCategories: 9,
    categories: [
      { name: 'Balance Metrics', count: 60 },
      { name: 'Transaction Volume Metrics', count: 55 },
      { name: 'Service Fee Revenue Metrics', count: 50 },
      { name: 'Account Analysis Metrics', count: 45 },
      { name: 'Sweep Performance Metrics', count: 40 },
      { name: 'ZBA Metrics', count: 40 },
      { name: 'Account Profitability Metrics', count: 50 },
      { name: 'Earnings Credit Metrics', count: 40 },
      { name: 'Deposit Growth Metrics', count: 40 },
    ],
  },
  
  regulatoryCompliance: ['Reg D reserve requirements', 'Reg CC funds availability', 'Account analysis standards', 'Sweep account regulations', 'FDIC insurance limits'],
};

export { depositsCommercialBronzeLayer, depositsCommercialSilverLayer, depositsCommercialGoldLayer };
