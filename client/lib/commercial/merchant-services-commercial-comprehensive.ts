/**
 * MERCHANT-SERVICES-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (24), Silver (18), Gold (14 dims + 10 facts)
 * 
 * Domain: Merchant Acquiring & Payment Processing
 * Coverage: Merchant Onboarding, POS Terminals, Card Processing, Chargebacks, Interchange Revenue, Fraud Prevention
 */

// BRONZE LAYER - 24 tables
export const merchantServicesCommercialBronzeLayer = {
  description: 'Bronze layer for merchant services domain - raw merchant acquiring data',
  layer: 'BRONZE',
  tables: [
    { 
      name: 'bronze.merchant_accounts', 
      description: 'Merchant account master data', 
      sourceSystem: 'MERCHANT_PLATFORM', 
      loadType: 'BATCH', 
      grain: 'One row per merchant account',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.merchant_applications', 
      description: 'Merchant onboarding applications', 
      sourceSystem: 'ONBOARDING_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per application',
      estimatedRows: 100000,
      estimatedSize: '400MB'
    },
    { 
      name: 'bronze.merchant_underwriting', 
      description: 'Merchant underwriting and risk assessment', 
      sourceSystem: 'UNDERWRITING_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per underwriting decision',
      estimatedRows: 100000,
      estimatedSize: '500MB'
    },
    { 
      name: 'bronze.merchant_business_info', 
      description: 'Merchant business information and MCC codes', 
      sourceSystem: 'MERCHANT_PLATFORM', 
      loadType: 'BATCH', 
      grain: 'One row per merchant',
      estimatedRows: 500000,
      estimatedSize: '1.5GB'
    },
    { 
      name: 'bronze.pos_terminals', 
      description: 'POS terminal and device inventory', 
      sourceSystem: 'TERMINAL_MANAGEMENT', 
      loadType: 'BATCH', 
      grain: 'One row per terminal',
      estimatedRows: 2000000,
      estimatedSize: '4GB'
    },
    { 
      name: 'bronze.terminal_transactions', 
      description: 'POS terminal transaction logs', 
      sourceSystem: 'PROCESSING_PLATFORM', 
      loadType: 'STREAMING', 
      grain: 'One row per transaction',
      estimatedRows: 5000000000,
      estimatedSize: '25TB'
    },
    { 
      name: 'bronze.card_authorizations', 
      description: 'Card authorization requests and responses', 
      sourceSystem: 'AUTHORIZATION_PLATFORM', 
      loadType: 'STREAMING', 
      grain: 'One row per authorization',
      estimatedRows: 6000000000,
      estimatedSize: '30TB'
    },
    { 
      name: 'bronze.card_settlements', 
      description: 'Card settlement and clearing transactions', 
      sourceSystem: 'SETTLEMENT_PLATFORM', 
      loadType: 'BATCH', 
      grain: 'One row per settlement',
      estimatedRows: 5000000000,
      estimatedSize: '20TB'
    },
    { 
      name: 'bronze.chargebacks', 
      description: 'Chargeback transactions and disputes', 
      sourceSystem: 'CHARGEBACK_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per chargeback',
      estimatedRows: 50000000,
      estimatedSize: '250GB'
    },
    { 
      name: 'bronze.chargeback_responses', 
      description: 'Merchant responses to chargebacks', 
      sourceSystem: 'CHARGEBACK_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per response',
      estimatedRows: 30000000,
      estimatedSize: '150GB'
    },
    { 
      name: 'bronze.merchant_fees', 
      description: 'Merchant discount rate and fee schedules', 
      sourceSystem: 'PRICING_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per fee schedule',
      estimatedRows: 500000,
      estimatedSize: '500MB'
    },
    { 
      name: 'bronze.interchange_fees', 
      description: 'Card network interchange fee schedules', 
      sourceSystem: 'CARD_NETWORKS', 
      loadType: 'BATCH', 
      grain: 'One row per interchange rate',
      estimatedRows: 10000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.merchant_deposits', 
      description: 'Merchant settlement deposit transactions', 
      sourceSystem: 'SETTLEMENT_PLATFORM', 
      loadType: 'BATCH', 
      grain: 'One row per deposit',
      estimatedRows: 500000000,
      estimatedSize: '2TB'
    },
    { 
      name: 'bronze.merchant_reserves', 
      description: 'Merchant reserve account balances', 
      sourceSystem: 'RESERVE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per reserve snapshot',
      estimatedRows: 10000000,
      estimatedSize: '50GB'
    },
    { 
      name: 'bronze.fraud_alerts', 
      description: 'Merchant fraud detection alerts', 
      sourceSystem: 'FRAUD_DETECTION', 
      loadType: 'STREAMING', 
      grain: 'One row per alert',
      estimatedRows: 100000000,
      estimatedSize: '500GB'
    },
    { 
      name: 'bronze.fraud_cases', 
      description: 'Merchant fraud investigation cases', 
      sourceSystem: 'FRAUD_CASE_MGMT', 
      loadType: 'STREAMING', 
      grain: 'One row per case',
      estimatedRows: 5000000,
      estimatedSize: '25GB'
    },
    { 
      name: 'bronze.pci_compliance', 
      description: 'PCI DSS compliance assessments', 
      sourceSystem: 'COMPLIANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per assessment',
      estimatedRows: 500000,
      estimatedSize: '200MB'
    },
    { 
      name: 'bronze.merchant_statements', 
      description: 'Monthly merchant statements', 
      sourceSystem: 'BILLING_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per statement',
      estimatedRows: 6000000,
      estimatedSize: '30GB'
    },
    { 
      name: 'bronze.gateway_transactions', 
      description: 'Payment gateway transactions (e-commerce)', 
      sourceSystem: 'PAYMENT_GATEWAY', 
      loadType: 'STREAMING', 
      grain: 'One row per gateway transaction',
      estimatedRows: 3000000000,
      estimatedSize: '15TB'
    },
    { 
      name: 'bronze.virtual_terminals', 
      description: 'Virtual terminal transactions (MOTO)', 
      sourceSystem: 'VIRTUAL_TERMINAL', 
      loadType: 'STREAMING', 
      grain: 'One row per virtual transaction',
      estimatedRows: 500000000,
      estimatedSize: '2.5TB'
    },
    { 
      name: 'bronze.recurring_billing', 
      description: 'Recurring billing and subscription transactions', 
      sourceSystem: 'RECURRING_PLATFORM', 
      loadType: 'STREAMING', 
      grain: 'One row per recurring charge',
      estimatedRows: 1000000000,
      estimatedSize: '5TB'
    },
    { 
      name: 'bronze.merchant_equipment', 
      description: 'Merchant equipment leases and purchases', 
      sourceSystem: 'EQUIPMENT_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per equipment',
      estimatedRows: 2000000,
      estimatedSize: '5GB'
    },
    { 
      name: 'bronze.merchant_contracts', 
      description: 'Merchant service agreements and contracts', 
      sourceSystem: 'CONTRACT_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per contract',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.network_fees', 
      description: 'Card network assessment fees (Visa, MC, Amex)', 
      sourceSystem: 'CARD_NETWORKS', 
      loadType: 'BATCH', 
      grain: 'One row per fee transaction',
      estimatedRows: 100000000,
      estimatedSize: '500GB'
    }
  ],
  totalTables: 24
};

// SILVER LAYER - 18 tables
export const merchantServicesCommercialSilverLayer = {
  description: 'Silver layer for merchant services domain - cleansed merchant data',
  layer: 'SILVER',
  tables: [
    { name: 'silver.merchant_accounts_cleansed', description: 'Cleansed merchant accounts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.pos_terminals_cleansed', description: 'Cleansed POS terminals', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.terminal_transactions_cleansed', description: 'Cleansed terminal transactions', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.card_authorizations_cleansed', description: 'Cleansed authorizations', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.card_settlements_cleansed', description: 'Cleansed settlements', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.chargebacks_cleansed', description: 'Cleansed chargebacks', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.merchant_fees_cleansed', description: 'Cleansed merchant fees', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.fraud_alerts_cleansed', description: 'Cleansed fraud alerts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.merchant_volume_agg', description: 'Aggregated merchant processing volume', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.authorization_metrics_agg', description: 'Aggregated authorization approval rates', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.chargeback_ratios_agg', description: 'Aggregated chargeback ratios by merchant', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.merchant_profitability_agg', description: 'Aggregated merchant profitability', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.interchange_revenue_agg', description: 'Aggregated interchange revenue', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.fraud_loss_ratios_agg', description: 'Aggregated fraud loss ratios', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.merchant_retention_agg', description: 'Aggregated merchant retention metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.terminal_utilization_agg', description: 'Aggregated terminal utilization', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.gateway_conversion_agg', description: 'Aggregated e-commerce conversion rates', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.merchant_risk_scores_agg', description: 'Aggregated merchant risk scores', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' }
  ],
  totalTables: 18
};

// GOLD LAYER - 14 dimensions + 10 facts
export const merchantServicesCommercialGoldLayer = {
  description: 'Gold layer for merchant services domain - dimensional model',
  layer: 'GOLD',
  dimensions: [
    { name: 'gold.dim_merchant', description: 'Merchant dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_merchant_category', description: 'MCC (Merchant Category Code) dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_terminal', description: 'POS terminal dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_terminal_type', description: 'Terminal type dimension (POS, gateway, virtual)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_card_type', description: 'Card type dimension (Visa, MC, Amex, Discover)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_card_product', description: 'Card product dimension (credit, debit, prepaid)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_transaction_type', description: 'Transaction type dimension (sale, refund, void)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_entry_mode', description: 'Card entry mode dimension (chip, swipe, contactless, keyed)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_chargeback_reason', description: 'Chargeback reason code dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_merchant_size', description: 'Merchant size tier dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_pricing_plan', description: 'Merchant pricing plan dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_fraud_type', description: 'Fraud type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_merchant_status', description: 'Merchant account status dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_acquiring_bank', description: 'Acquiring bank dimension', scdType: 'SCD_TYPE_2' }
  ],
  facts: [
    { name: 'gold.fact_merchant_authorizations', description: 'Authorization transaction fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_merchant_settlements', description: 'Settlement transaction fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_merchant_chargebacks', description: 'Chargeback fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_merchant_deposits', description: 'Merchant deposit fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_merchant_fees', description: 'Merchant fee revenue fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_interchange_revenue', description: 'Interchange revenue fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_merchant_volume', description: 'Merchant processing volume snapshot', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_terminal_activity', description: 'Terminal activity fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_fraud_events', description: 'Merchant fraud event fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_merchant_profitability', description: 'Merchant profitability snapshot', factType: 'PERIODIC_SNAPSHOT' }
  ],
  totalDimensions: 14,
  totalFacts: 10
};

export default {
  merchantServicesCommercialBronzeLayer,
  merchantServicesCommercialSilverLayer,
  merchantServicesCommercialGoldLayer
};
