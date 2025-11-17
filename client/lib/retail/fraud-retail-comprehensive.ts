/**
 * FRAUD-RETAIL COMPREHENSIVE FILE
 * Imports and re-exports all layer files for domain evaluation
 * 
 * Complete implementation with:
 * - Bronze: 14 tables (6.8TB)
 * - Silver: 11 tables (450GB)
 * - Gold: 8 dimensions + 5 facts (127GB)
 * - Total: 38 tables, 7.377TB
 */

import { fraudRetailBronzeLayerComplete } from './fraud-retail-bronze-layer';
import { fraudRetailSilverLayerComplete } from './fraud-retail-silver-layer';
import { fraudRetailGoldLayerComplete } from './fraud-retail-gold-layer';

// Import and re-export metrics catalog
export { fraudRetailMetricsCatalog } from './fraud-retail-metrics-catalog';

// Re-export layers
export const fraudRetailBronzeLayer = fraudRetailBronzeLayerComplete;
export const fraudRetailSilverLayer = fraudRetailSilverLayerComplete;
export const fraudRetailGoldLayer = fraudRetailGoldLayerComplete;

export default {
  fraudRetailBronzeLayer,
  fraudRetailSilverLayer,
  fraudRetailGoldLayer,
};
