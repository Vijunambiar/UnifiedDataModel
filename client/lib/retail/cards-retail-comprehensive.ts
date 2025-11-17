/**
 * CARDS-RETAIL DOMAIN - Comprehensive Data Model
 */

import { cardsRetailBronzeLayerComplete } from './cards-retail-bronze-layer';
import { cardsRetailSilverLayerComplete } from './cards-retail-silver-layer';
import { cardsRetailGoldLayerComplete } from './cards-retail-gold-layer';
import { cardsRetailLogicalERD, cardsRetailPhysicalERD } from './cards-retail-erd';

// Re-export Bronze Layer
export const cardsRetailBronzeLayer = cardsRetailBronzeLayerComplete;

// Re-export Silver Layer
export const cardsRetailSilverLayer = cardsRetailSilverLayerComplete;

// Re-export Gold Layer
export const cardsRetailGoldLayer = cardsRetailGoldLayerComplete;

// Re-export ERDs
export { cardsRetailLogicalERD, cardsRetailPhysicalERD };

// Export default object for domain evaluation
export default {
  cardsRetailBronzeLayer,
  cardsRetailSilverLayer,
  cardsRetailGoldLayer,
  cardsRetailLogicalERD,
  cardsRetailPhysicalERD,
};
