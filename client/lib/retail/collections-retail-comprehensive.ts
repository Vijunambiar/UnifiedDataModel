/**
 * COLLECTIONS-RETAIL COMPREHENSIVE FILE
 * Imports and re-exports all layer files for domain evaluation
 */

import { collectionsRetailBronzeLayerComplete } from './collections-retail-bronze-layer';
import { collectionsRetailSilverLayerComplete } from './collections-retail-silver-layer';
import { collectionsRetailGoldLayerComplete } from './collections-retail-gold-layer';

// Import and re-export metrics catalog
export { collectionsRetailMetricsCatalog } from './collections-retail-metrics-catalog';

// Re-export layers
export const collectionsRetailBronzeLayer = collectionsRetailBronzeLayerComplete;
export const collectionsRetailSilverLayer = collectionsRetailSilverLayerComplete;
export const collectionsRetailGoldLayer = collectionsRetailGoldLayerComplete;

export default {
  collectionsRetailBronzeLayer,
  collectionsRetailSilverLayer,
  collectionsRetailGoldLayer,
};
