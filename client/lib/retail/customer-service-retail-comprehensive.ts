/**
 * CUSTOMER-SERVICE-RETAIL COMPREHENSIVE FILE
 * Imports and re-exports all layer files for domain evaluation
 * 
 * Complete implementation with:
 * - Bronze: 18 tables (1.1TB)
 * - Silver: 14 tables (650GB)
 * - Gold: 9 dimensions + 6 facts (118GB)
 * - Total: 41 tables, 1.868TB
 */

import { customerServiceRetailBronzeLayerComplete } from './customer-service-retail-bronze-layer';
import { customerServiceRetailSilverLayerComplete } from './customer-service-retail-silver-layer';
import { customerServiceRetailGoldLayerComplete } from './customer-service-retail-gold-layer';

// Import and re-export metrics catalog
export { customerServiceRetailMetricsCatalog } from './customer-service-retail-metrics-catalog';

// Re-export layers
export const customerServiceRetailBronzeLayer = customerServiceRetailBronzeLayerComplete;
export const customerServiceRetailSilverLayer = customerServiceRetailSilverLayerComplete;
export const customerServiceRetailGoldLayer = customerServiceRetailGoldLayerComplete;

export default {
  customerServiceRetailBronzeLayer,
  customerServiceRetailSilverLayer,
  customerServiceRetailGoldLayer,
};
