/**
 * PAYMENTS-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (25), Silver (18), Gold (14 dims + 9 facts)
 *
 * Domain: Commercial Payments & Treasury Services
 * Coverage: ACH, Wire Transfers, RTP, Business Bill Pay, Payroll, Positive Pay, FIS ACH Tracker
 * 
 * COMPLETE IMPLEMENTATION WITH DETAILED TABLE SPECIFICATIONS
 * 
 * This file imports the comprehensive Bronze, Silver, and Gold layer specifications
 * created for the Payments-Commercial domain, following the pattern established
 * by Customer-Commercial, Loans-Commercial, and Deposits-Commercial.
 */

import { paymentsCommercialBronzeLayer } from './payments-commercial-bronze-layer';
import { paymentsCommercialSilverLayer } from './payments-commercial-silver-layer';
import { paymentsCommercialGoldLayer } from './payments-commercial-gold-layer';

// Export the layers
export { 
  paymentsCommercialBronzeLayer, 
  paymentsCommercialSilverLayer, 
  paymentsCommercialGoldLayer 
};

// Export metrics catalog
export { paymentsCommercialMetricsCatalog } from './payments-commercial-metrics';

// Export semantic layer
export { paymentsCommercialSemanticLayer } from './payments-commercial-semantic-layer';

// Export complete definition
export { paymentsCommercialComplete } from './payments-commercial-complete';

// Domain Summary
export const paymentsCommercialDomainSummary = {
  domainId: 'payments-commercial',
  domainName: 'Payments-Commercial',
  area: 'Commercial Banking',

  overview: {
    description: 'Comprehensive commercial payments and treasury services including ACH, wire transfers, RTP, bill payments, and payroll processing',
    purpose: 'Enable high-volume payment processing, treasury services, fraud prevention, and regulatory compliance',
    scope: 'All commercial payment types with real-time and batch processing capabilities',
  },

  coverage: {
    bronze: { tables: 25, description: 'Raw payment transaction data from multiple networks and channels' },
    silver: { tables: 18, description: 'Cleansed and unified payment data with quality metrics' },
    gold: { dimensions: 14, facts: 9, description: 'Dimensional model for payment analytics and BI' },
    metrics: { total: 460, description: 'Comprehensive payment processing and revenue KPIs' },
    semanticLayer: { measures: 20, attributes: 12, hierarchies: 6, folders: 9 },
  },

  keyFeatures: [
    'Multi-channel Payment Processing (ACH, Wire, RTP, Bill Pay, Payroll)',
    'Real-time Payment Settlement (RTP, Fedwire)',
    'Same-Day ACH Processing (3 Daily Windows)',
    'International Wire Transfers (SWIFT)',
    'Automated OFAC Sanctions Screening',
    'Payment Fraud Detection & Prevention',
    'Check/ACH Positive Pay',
    'Multi-level Payment Approval Workflows',
    'Payment Templates & Recurring Payments',
    'Bulk Payment File Processing',
    'Payment Returns & Exception Handling',
    'Payment Reconciliation with GL',
    'Payment SLA Tracking',
    'Payment Fee Revenue Management',
  ],

  regulatoryCompliance: [
    'NACHA Operating Rules',
    'Same-Day ACH Rules',
    'Fedwire Operating Circular',
    'UCC Article 4A - Funds Transfers',
    'OFAC Sanctions Screening',
    'FinCEN Recordkeeping Requirements',
    'Regulation E - Electronic Fund Transfers',
    'ISO 20022 Standards',
  ],

  useCases: [
    'Commercial Payment Processing',
    'Payment Revenue Analytics',
    'Payment Fraud Prevention',
    'Payment Quality Monitoring',
    'Regulatory Reporting (NACHA, Fed, FinCEN)',
  ],

  dataQuality: {
    tier: 'Tier 1 (Critical)',
    accuracy: 'High',
    completeness: 'High',
    timeliness: 'Real-time',
    consistency: 'High',
    uniqueness: 'High',
  },
};

// Default export
export default {
  bronze: paymentsCommercialBronzeLayer,
  silver: paymentsCommercialSilverLayer,
  gold: paymentsCommercialGoldLayer,
  summary: paymentsCommercialDomainSummary,
};
