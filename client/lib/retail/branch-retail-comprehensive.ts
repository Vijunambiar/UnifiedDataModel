/**
 * BRANCH-RETAIL DOMAIN - Comprehensive Data Model
 */

import { branchRetailBronzeLayerComplete } from './branch-retail-bronze-layer';
import { branchRetailSilverLayerComplete } from './branch-retail-silver-layer';
import { branchRetailGoldLayerComplete } from './branch-retail-gold-layer';

// Re-export Bronze Layer
export const branchRetailBronzeLayer = branchRetailBronzeLayerComplete;

// Re-export Silver Layer
export const branchRetailSilverLayer = branchRetailSilverLayerComplete;

// Re-export Gold Layer  
export const branchRetailGoldLayer = branchRetailGoldLayerComplete;

// Export default object for domain evaluation
export default {
  branchRetailBronzeLayer,
  branchRetailSilverLayer,
  branchRetailGoldLayer,
};
