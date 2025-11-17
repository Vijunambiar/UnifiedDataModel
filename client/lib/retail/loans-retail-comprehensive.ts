/**
 * LOANS-RETAIL DOMAIN - Comprehensive Data Model
 */

import { loansRetailBronzeLayerComplete } from './loans-retail-bronze-layer';
import { loansRetailSilverLayerComplete } from './loans-retail-silver-layer';
import { loansRetailGoldLayerComplete } from './loans-retail-gold-layer';
import { loansRetailLogicalERD, loansRetailPhysicalERD } from './loans-retail-erd';

// Re-export Bronze Layer
export const loansRetailBronzeLayer = loansRetailBronzeLayerComplete;

// Re-export Silver Layer
export const loansRetailSilverLayer = loansRetailSilverLayerComplete;

// Re-export Gold Layer
export const loansRetailGoldLayer = loansRetailGoldLayerComplete;

// Re-export ERDs
export { loansRetailLogicalERD, loansRetailPhysicalERD };

// Export default object for domain evaluation
export default {
  loansRetailBronzeLayer,
  loansRetailSilverLayer,
  loansRetailGoldLayer,
  loansRetailLogicalERD,
  loansRetailPhysicalERD,
};
