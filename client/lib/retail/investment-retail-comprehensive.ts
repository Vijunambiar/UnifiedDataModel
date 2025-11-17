/**
 * INVESTMENT-RETAIL COMPREHENSIVE FILE
 * Imports and re-exports all layer files for domain evaluation
 */

import { investmentRetailBronzeLayerComplete } from './investment-retail-bronze-layer';
import { investmentRetailSilverLayerComplete } from './investment-retail-silver-layer';
import { investmentRetailGoldLayerComplete } from './investment-retail-gold-layer';

// Import and re-export metrics catalog
export { investmentRetailMetricsCatalog } from './investment-retail-metrics-catalog';

// Re-export layers
export const investmentRetailBronzeLayer = investmentRetailBronzeLayerComplete;
export const investmentRetailSilverLayer = investmentRetailSilverLayerComplete;
export const investmentRetailGoldLayer = investmentRetailGoldLayerComplete;

export default {
  investmentRetailBronzeLayer,
  investmentRetailSilverLayer,
  investmentRetailGoldLayer,
};
