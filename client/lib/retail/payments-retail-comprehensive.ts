/**
 * PAYMENTS-RETAIL DOMAIN - Comprehensive Data Model
 */

import { paymentsRetailBronzeLayerComplete } from './payments-retail-bronze-layer';
import { paymentsRetailSilverLayerComplete } from './payments-retail-silver-layer';
import { paymentsRetailGoldLayerComplete } from './payments-retail-gold-layer';
import { paymentsRetailLogicalERD, paymentsRetailPhysicalERD } from './payments-retail-erd';

// Re-export Bronze Layer
export const paymentsRetailBronzeLayer = paymentsRetailBronzeLayerComplete;

// Re-export Silver Layer
export const paymentsRetailSilverLayer = paymentsRetailSilverLayerComplete;

// Re-export Gold Layer
export const paymentsRetailGoldLayer = paymentsRetailGoldLayerComplete;

// Re-export ERDs
export { paymentsRetailLogicalERD, paymentsRetailPhysicalERD };

// Export default object for domain evaluation
export default {
  paymentsRetailBronzeLayer,
  paymentsRetailSilverLayer,
  paymentsRetailGoldLayer,
  paymentsRetailLogicalERD,
  paymentsRetailPhysicalERD,
};
