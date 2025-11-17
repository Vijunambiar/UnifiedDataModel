/**
 * TREASURY-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (18), Silver (14), Gold (10 dims + 7 facts)
 *
 * Domain: Commercial Treasury & Financial Markets
 * Coverage: FX Trading, IR Derivatives, Hedging, Liquidity Management, Investments, Debt Management
 * 
 * COMPLETE IMPLEMENTATION WITH DETAILED TABLE SPECIFICATIONS
 * 
 * This file imports the comprehensive Bronze, Silver, and Gold layer specifications
 * created for the Treasury-Commercial domain, following the pattern established
 * by Customer-Commercial, Loans-Commercial, Deposits-Commercial, and Payments-Commercial.
 */

import { treasuryCommercialBronzeLayer } from './treasury-commercial-bronze-layer';
import { treasuryCommercialSilverLayer } from './treasury-commercial-silver-layer';
import { treasuryCommercialGoldLayer } from './treasury-commercial-gold-layer';

// Export the layers
export { 
  treasuryCommercialBronzeLayer, 
  treasuryCommercialSilverLayer, 
  treasuryCommercialGoldLayer 
};

// Default export
export default {
  treasuryCommercialBronzeLayer,
  treasuryCommercialSilverLayer,
  treasuryCommercialGoldLayer
};
