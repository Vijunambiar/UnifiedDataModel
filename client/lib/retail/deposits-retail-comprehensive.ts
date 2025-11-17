/**
 * DEPOSITS-RETAIL DOMAIN - Comprehensive Data Model
 */

import { depositsRetailBronzeLayerComplete } from './deposits-retail-bronze-layer';
import { depositsRetailSilverLayerComplete } from './deposits-retail-silver-layer';
import { depositsRetailGoldLayerComplete } from './deposits-retail-gold-layer';
import { depositsRetailLogicalERD, depositsRetailPhysicalERD } from './deposits-retail-erd';

// Re-export Bronze Layer
export const depositsRetailBronzeLayer = depositsRetailBronzeLayerComplete;

// Re-export Silver Layer
export const depositsRetailSilverLayer = depositsRetailSilverLayerComplete;

// Re-export Gold Layer
export const depositsRetailGoldLayer = depositsRetailGoldLayerComplete;

// Re-export ERDs
export { depositsRetailLogicalERD, depositsRetailPhysicalERD };

// Export default object for domain evaluation
export default {
  depositsRetailBronzeLayer,
  depositsRetailSilverLayer,
  depositsRetailGoldLayer,
  depositsRetailLogicalERD,
  depositsRetailPhysicalERD,
};
