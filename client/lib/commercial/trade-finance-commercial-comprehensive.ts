/**
 * TRADE-FINANCE-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (22), Silver (16), Gold (12 dims + 8 facts)
 * 
 * Domain: Trade Finance & Documentary Credits
 * Coverage: Letters of Credit, Documentary Collections, Bank Guarantees, Trade Loans, SWIFT, Supply Chain Finance
 */

// BRONZE LAYER - 22 tables
export const tradeFinanceCommercialBronzeLayer = {
  description: 'Bronze layer for trade finance domain - raw trade documentation data',
  layer: 'BRONZE',
  tables: [
    { 
      name: 'bronze.trade_letters_of_credit', 
      description: 'Letters of credit (Import/Export LC)', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per LC',
      estimatedRows: 100000,
      estimatedSize: '500MB'
    },
    { 
      name: 'bronze.trade_lc_amendments', 
      description: 'LC amendment requests and approvals', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per amendment',
      estimatedRows: 50000,
      estimatedSize: '150MB'
    },
    { 
      name: 'bronze.trade_documentary_collections', 
      description: 'Documentary collection transactions (D/P, D/A)', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per collection',
      estimatedRows: 75000,
      estimatedSize: '300MB'
    },
    { 
      name: 'bronze.trade_bank_guarantees', 
      description: 'Bank guarantees and standby LCs', 
      sourceSystem: 'GUARANTEE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per guarantee',
      estimatedRows: 60000,
      estimatedSize: '250MB'
    },
    { 
      name: 'bronze.trade_shipping_documents', 
      description: 'Bills of lading, packing lists, invoices', 
      sourceSystem: 'DOCUMENT_MANAGEMENT', 
      loadType: 'STREAMING', 
      grain: 'One row per document',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.trade_swift_messages', 
      description: 'SWIFT MT messages (MT700, MT710, MT720, MT760)', 
      sourceSystem: 'SWIFT_GATEWAY', 
      loadType: 'STREAMING', 
      grain: 'One row per SWIFT message',
      estimatedRows: 1000000,
      estimatedSize: '5GB'
    },
    { 
      name: 'bronze.trade_beneficiaries', 
      description: 'Trade finance beneficiaries and sellers', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per beneficiary',
      estimatedRows: 20000,
      estimatedSize: '100MB'
    },
    { 
      name: 'bronze.trade_applicants', 
      description: 'LC applicants and buyers', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per applicant',
      estimatedRows: 15000,
      estimatedSize: '75MB'
    },
    { 
      name: 'bronze.trade_advising_banks', 
      description: 'Advising and confirming banks', 
      sourceSystem: 'CORRESPONDENT_BANKING', 
      loadType: 'BATCH', 
      grain: 'One row per bank',
      estimatedRows: 5000,
      estimatedSize: '25MB'
    },
    { 
      name: 'bronze.trade_discrepancies', 
      description: 'Documentary discrepancies and exceptions', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per discrepancy',
      estimatedRows: 100000,
      estimatedSize: '400MB'
    },
    { 
      name: 'bronze.trade_payments', 
      description: 'Trade finance payment transactions', 
      sourceSystem: 'PAYMENT_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per payment',
      estimatedRows: 200000,
      estimatedSize: '800MB'
    },
    { 
      name: 'bronze.trade_reimbursements', 
      description: 'Bank-to-bank reimbursements', 
      sourceSystem: 'CORRESPONDENT_BANKING', 
      loadType: 'STREAMING', 
      grain: 'One row per reimbursement',
      estimatedRows: 150000,
      estimatedSize: '600MB'
    },
    { 
      name: 'bronze.trade_insurance_certificates', 
      description: 'Marine insurance and cargo insurance', 
      sourceSystem: 'INSURANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per insurance cert',
      estimatedRows: 80000,
      estimatedSize: '300MB'
    },
    { 
      name: 'bronze.trade_commodity_details', 
      description: 'Commodity descriptions and HS codes', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per commodity',
      estimatedRows: 100000,
      estimatedSize: '400MB'
    },
    { 
      name: 'bronze.trade_country_regulations', 
      description: 'Trade compliance and sanctions rules', 
      sourceSystem: 'COMPLIANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per regulation',
      estimatedRows: 50000,
      estimatedSize: '200MB'
    },
    { 
      name: 'bronze.trade_incoterms', 
      description: 'Incoterms definitions and usage', 
      sourceSystem: 'REFERENCE_DATA', 
      loadType: 'BATCH', 
      grain: 'One row per incoterm transaction',
      estimatedRows: 100000,
      estimatedSize: '300MB'
    },
    { 
      name: 'bronze.trade_finance_loans', 
      description: 'Pre-shipment and post-shipment financing', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per trade loan',
      estimatedRows: 40000,
      estimatedSize: '200MB'
    },
    { 
      name: 'bronze.trade_forfaiting', 
      description: 'Forfaiting transactions (without recourse)', 
      sourceSystem: 'FORFAITING_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per forfaiting deal',
      estimatedRows: 10000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.trade_supply_chain_finance', 
      description: 'Supply chain finance programs (reverse factoring)', 
      sourceSystem: 'SCF_PLATFORM', 
      loadType: 'STREAMING', 
      grain: 'One row per SCF transaction',
      estimatedRows: 300000,
      estimatedSize: '1.5GB'
    },
    { 
      name: 'bronze.trade_ucp_rules', 
      description: 'UCP 600 rules compliance tracking', 
      sourceSystem: 'COMPLIANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per rule check',
      estimatedRows: 50000,
      estimatedSize: '150MB'
    },
    { 
      name: 'bronze.trade_sanctions_screening', 
      description: 'Trade sanctions screening (OFAC, UN, EU)', 
      sourceSystem: 'SANCTIONS_SCREENING', 
      loadType: 'STREAMING', 
      grain: 'One row per screening',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.trade_export_credits', 
      description: 'Export credit agency guarantees (EXIM, UKEF)', 
      sourceSystem: 'TRADE_FINANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per credit',
      estimatedRows: 15000,
      estimatedSize: '75MB'
    }
  ],
  totalTables: 22
};

// SILVER LAYER - 16 tables
export const tradeFinanceCommercialSilverLayer = {
  description: 'Silver layer for trade finance domain - cleansed trade data',
  layer: 'SILVER',
  tables: [
    { name: 'silver.trade_lc_cleansed', description: 'Cleansed letters of credit', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.trade_documentary_collections_cleansed', description: 'Cleansed documentary collections', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.trade_bank_guarantees_cleansed', description: 'Cleansed bank guarantees', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.trade_swift_messages_cleansed', description: 'Cleansed SWIFT messages', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_discrepancies_cleansed', description: 'Cleansed documentary discrepancies', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_payments_cleansed', description: 'Cleansed trade payments', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_supply_chain_finance_cleansed', description: 'Cleansed SCF transactions', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_sanctions_screening_cleansed', description: 'Cleansed sanctions screening', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_lc_lifecycle_agg', description: 'Aggregated LC lifecycle metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_volume_metrics_agg', description: 'Aggregated trade volume by country/commodity', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_discrepancy_rates_agg', description: 'Aggregated discrepancy rates by bank', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_turnaround_times_agg', description: 'Aggregated processing turnaround times', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_fee_revenue_agg', description: 'Aggregated trade finance fee revenue', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_compliance_metrics_agg', description: 'Aggregated compliance and sanctions metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_counterparty_risk_agg', description: 'Aggregated counterparty risk exposure', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.trade_scf_performance_agg', description: 'Aggregated supply chain finance performance', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' }
  ],
  totalTables: 16
};

// GOLD LAYER - 12 dimensions + 8 facts
export const tradeFinanceCommercialGoldLayer = {
  description: 'Gold layer for trade finance domain - dimensional model',
  layer: 'GOLD',
  dimensions: [
    { name: 'gold.dim_trade_instrument', description: 'Trade finance instrument dimension (LC, Guarantee, Collection)', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_lc_type', description: 'LC type dimension (Irrevocable, Standby, Revolving)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_beneficiary', description: 'Beneficiary/seller dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_applicant', description: 'Applicant/buyer dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_correspondent_bank', description: 'Advising/confirming bank dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_country', description: 'Country dimension (origin/destination)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_commodity', description: 'Commodity dimension with HS codes', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_incoterm', description: 'Incoterms dimension (FOB, CIF, etc.)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_swift_message_type', description: 'SWIFT MT message type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_discrepancy_type', description: 'Documentary discrepancy type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_payment_term', description: 'Payment terms dimension (sight, usance)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_trade_status', description: 'Trade instrument status dimension', scdType: 'SCD_TYPE_1' }
  ],
  facts: [
    { name: 'gold.fact_trade_lc_issuance', description: 'LC issuance fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_trade_documentary_collections', description: 'Documentary collection fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_trade_payments', description: 'Trade payment fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_trade_discrepancies', description: 'Documentary discrepancy fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_trade_outstanding_exposure', description: 'Outstanding trade exposure snapshot', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_trade_fee_revenue', description: 'Trade finance fee revenue fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_trade_scf_transactions', description: 'Supply chain finance transaction fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_trade_compliance_events', description: 'Trade compliance and sanctions events', factType: 'TRANSACTION' }
  ],
  totalDimensions: 12,
  totalFacts: 8
};

export default {
  tradeFinanceCommercialBronzeLayer,
  tradeFinanceCommercialSilverLayer,
  tradeFinanceCommercialGoldLayer
};
