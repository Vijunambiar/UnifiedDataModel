/**
 * DIGITAL-RETAIL COMPREHENSIVE FILE
 * Imports and re-exports all layer files for domain evaluation
 */

import { digitalRetailBronzeLayerComplete } from './digital-retail-bronze-layer';
import { digitalRetailSilverLayerComplete } from './digital-retail-silver-layer';
import { digitalRetailGoldLayerComplete } from './digital-retail-gold-layer';

// Import and re-export metrics catalog
export { digitalRetailMetricsCatalog } from './digital-retail-metrics-catalog';

// Re-export layers
export const digitalRetailBronzeLayer = digitalRetailBronzeLayerComplete;
export const digitalRetailSilverLayer = digitalRetailSilverLayerComplete;
export const digitalRetailGoldLayer = digitalRetailGoldLayerComplete;

export default {
  digitalRetailBronzeLayer,
  digitalRetailSilverLayer,
  digitalRetailGoldLayer,
};
