/**
 * MARKETING-RETAIL COMPREHENSIVE FILE
 * Imports and re-exports all layer files for domain evaluation
 * 
 * Complete implementation with:
 * - Bronze: 35 tables (850GB) - 10 banking core + 25 platform tables
 * - Silver: 26 tables (500GB) - 8 banking core + 18 platform tables
 * - Gold: 12 dimensions + 8 facts (600GB)
 * - Total: 81 tables, 1.95TB
 * 
 * WHAT'S INCLUDED:
 * - Banking-specific campaign and offer tracking
 * - Multi-touch attribution with 7 models
 * - Lead lifecycle and conversion funnel
 * - Product-specific performance (Deposits, Cards, Loans)
 * - Offer redemption and bonus payout tracking
 * - Compliance-first design (TCPA, CAN-SPAM, CFPB)
 * - Branch integration for attribution
 * - Customer consent management (GDPR, CCPA, TCPA)
 */

import { marketingRetailBronzeLayerComplete } from './marketing-retail-bronze-layer';
import { marketingRetailSilverLayerComplete } from './marketing-retail-silver-layer';
import { marketingRetailGoldLayerComplete } from './marketing-retail-gold-layer';

// Import metrics catalogs (named exports)
import { marketingRetailMetricsCatalog as marketingRetailMetrics } from './marketing-retail-metrics';
import { marketingRetailMetricsCatalog as marketingRetailMetricsFull } from './marketing-retail-metrics-full';

// Re-export metrics
export { marketingRetailMetrics, marketingRetailMetricsFull };

// Re-export layers
export const marketingRetailBronzeLayer = marketingRetailBronzeLayerComplete;
export const marketingRetailSilverLayer = marketingRetailSilverLayerComplete;
export const marketingRetailGoldLayer = marketingRetailGoldLayerComplete;

// Metrics catalog summary
export const marketingRetailMetricsCatalog = {
  totalMetrics: 400,
  categories: [
    {
      category: 'Campaign Performance',
      metricCount: 80,
      keyMetrics: ['ROI', 'CAC', 'Conversion Rate', 'Budget Utilization', 'ROAS'],
    },
    {
      category: 'Lead Generation',
      metricCount: 60,
      keyMetrics: ['Lead Count', 'Cost Per Lead', 'Lead Quality Score', 'Conversion Rate', 'Time to Conversion'],
    },
    {
      category: 'Channel Performance',
      metricCount: 70,
      keyMetrics: ['Channel Mix', 'Channel ROI', 'CTR', 'CPC', 'CPA'],
    },
    {
      category: 'Attribution',
      metricCount: 50,
      keyMetrics: ['First Touch Revenue', 'Last Touch Revenue', 'Multi-Touch Revenue', 'Assisted Conversions'],
    },
    {
      category: 'Product Performance',
      metricCount: 60,
      keyMetrics: ['Accounts Opened', 'Total Deposits', 'Loans Funded', 'Product ROI', 'Product Mix'],
    },
    {
      category: 'Offer Performance',
      metricCount: 40,
      keyMetrics: ['Redemption Rate', 'Bonus Payout Rate', 'Offer ROI', 'Early Closure Rate'],
    },
    {
      category: 'Customer Engagement',
      metricCount: 40,
      keyMetrics: ['Engagement Score', 'Touchpoint Frequency', 'Preferred Channel', 'Days Since Last Engagement'],
    },
  ],
};

export default {
  marketingRetailBronzeLayer,
  marketingRetailSilverLayer,
  marketingRetailGoldLayer,
  marketingRetailMetricsCatalog,
};
