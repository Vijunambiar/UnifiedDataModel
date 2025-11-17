/**
 * COMPLIANCE-RETAIL COMPLETE DOMAIN
 * 
 * Domain: Compliance & Regulatory Retail
 * Coverage: KYC, AML, SAR, CTR, sanctions screening, privacy, audit
 * 
 * COMPLETE: Bronze (20) + Silver (15) + Gold (10 dims + 6 facts) + Metrics (400)
 */

import { complianceRetailBronzeLayer, complianceRetailSilverLayer, complianceRetailGoldLayer } from './compliance-retail-comprehensive';

export const complianceRetailComplete = {
  domainId: 'compliance-retail',
  domainName: 'Compliance-Retail',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: complianceRetailBronzeLayer.totalTables,
    estimatedSize: '950GB',
    tables: complianceRetailBronzeLayer.tables.map((t: any) => t.name),
  },
  
  silver: {
    totalTables: complianceRetailSilverLayer.totalTables,
    estimatedSize: '600GB',
    tables: complianceRetailSilverLayer.tables.map((t: any) => t.name),
  },
  
  gold: {
    dimensions: {
      count: complianceRetailGoldLayer.totalDimensions,
      list: complianceRetailGoldLayer.dimensions.map((d: any) => d.name),
    },
    facts: {
      count: complianceRetailGoldLayer.totalFacts,
      list: complianceRetailGoldLayer.facts.map((f: any) => f.name),
    },
    totalTables: complianceRetailGoldLayer.totalDimensions + complianceRetailGoldLayer.totalFacts,
    estimatedSize: '700GB',
  },
  
  metrics: {
    totalMetrics: 400,
    totalCategories: 8,
    categories: [
      { name: 'KYC Metrics', count: 55 },
      { name: 'AML Alert Metrics', count: 60 },
      { name: 'SAR Metrics', count: 45 },
      { name: 'Sanctions Screening Metrics', count: 50 },
      { name: 'Regulatory Reporting Metrics', count: 50 },
      { name: 'Audit Metrics', count: 45 },
      { name: 'Training Compliance Metrics', count: 45 },
      { name: 'Risk Assessment Metrics', count: 50 },
    ],
  },
  
  regulatoryCompliance: ['BSA/AML compliance', 'OFAC sanctions screening', 'CDD/EDD requirements', 'SAR/CTR filing', 'GDPR/CCPA privacy', 'SOX compliance'],
};

// Re-export the comprehensive layers
export { complianceRetailBronzeLayer, complianceRetailSilverLayer, complianceRetailGoldLayer };
