/**
 * INSURANCE-RETAIL COMPREHENSIVE FILE
 * Imports and re-exports all layer files for domain evaluation
 */

import { insuranceRetailBronzeLayerComplete } from './insurance-retail-bronze-layer';
import { insuranceRetailSilverLayerComplete } from './insurance-retail-silver-layer';
import { insuranceRetailGoldLayerComplete } from './insurance-retail-gold-layer';

// Import and re-export metrics catalog
export { insuranceRetailMetricsCatalog } from './insurance-retail-metrics-catalog';

// Re-export layers
export const insuranceRetailBronzeLayer = insuranceRetailBronzeLayerComplete;
export const insuranceRetailSilverLayer = insuranceRetailSilverLayerComplete;
export const insuranceRetailGoldLayer = insuranceRetailGoldLayerComplete;

export default {
  insuranceRetailBronzeLayer,
  insuranceRetailSilverLayer,
  insuranceRetailGoldLayer,
};
