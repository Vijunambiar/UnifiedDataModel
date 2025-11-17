/**
 * INVESTMENT-RETAIL COMPLETE DOMAIN
 * 
 * Domain: Investment & Brokerage Retail
 * Coverage: Brokerage accounts, trading, portfolio management, robo-advisors
 * 
 * COMPLETE: Bronze (20) + Silver (15) + Gold (10 dims + 6 facts) + Metrics (340)
 */

import { investmentRetailBronzeLayer, investmentRetailSilverLayer, investmentRetailGoldLayer } from './investment-retail-comprehensive';

export const investmentRetailComplete = {
  domainId: 'investment-retail',
  domainName: 'Investment-Retail',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: investmentRetailBronzeLayer.totalTables,
    estimatedSize: '900GB',
    tables: investmentRetailBronzeLayer.tables.map((t: any) => t.name),
  },
  
  silver: {
    totalTables: investmentRetailSilverLayer.totalTables,
    estimatedSize: '500GB',
    tables: investmentRetailSilverLayer.tables.map((t: any) => t.name),
  },
  
  gold: {
    dimensions: {
      count: investmentRetailGoldLayer.totalDimensions,
      list: investmentRetailGoldLayer.dimensions.map((d: any) => d.name),
    },
    facts: {
      count: investmentRetailGoldLayer.totalFacts,
      list: investmentRetailGoldLayer.facts.map((f: any) => f.name),
    },
    totalTables: investmentRetailGoldLayer.totalDimensions + investmentRetailGoldLayer.totalFacts,
    estimatedSize: '600GB',
  },
  
  metrics: {
    totalMetrics: 340,
    totalCategories: 7,
    categories: [
      { name: 'AUM Metrics', count: 50 },
      { name: 'Trading Activity Metrics', count: 55 },
      { name: 'Portfolio Performance Metrics', count: 60 },
      { name: 'Advisory Metrics', count: 45 },
      { name: 'Robo-Advisor Metrics', count: 40 },
      { name: 'Revenue Metrics', count: 45 },
      { name: 'Compliance Metrics', count: 45 },
    ],
  },
  
  regulatoryCompliance: ['SEC Regulation Best Interest (Reg BI)', 'FINRA Rule 2111 (Suitability)', 'Form ADV reporting', 'Pattern Day Trader rules', 'Wash Sale rules'],
};

// Re-export the comprehensive layers
export { investmentRetailBronzeLayer, investmentRetailSilverLayer, investmentRetailGoldLayer };
