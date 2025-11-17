/**
 * ABL-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (20), Silver (15), Gold (11 dims + 8 facts)
 * 
 * Domain: Asset-Based Lending (ABL)
 * Coverage: AR Financing, Inventory Financing, Borrowing Base, Field Exams, Collateral Monitoring
 */

// BRONZE LAYER - 20 tables
export const ablCommercialBronzeLayer = {
  description: 'Bronze layer for ABL domain - raw asset-based lending data',
  layer: 'BRONZE',
  tables: [
    { 
      name: 'bronze.abl_loan_facilities', 
      description: 'ABL revolving credit facilities', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per ABL facility',
      estimatedRows: 10000,
      estimatedSize: '100MB'
    },
    { 
      name: 'bronze.abl_borrowing_base_certificates', 
      description: 'Borrowing base certificates (BBC)', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per BBC submission',
      estimatedRows: 120000,
      estimatedSize: '600MB'
    },
    { 
      name: 'bronze.abl_accounts_receivable', 
      description: 'Accounts receivable aging reports', 
      sourceSystem: 'ERP_INTEGRATION', 
      loadType: 'BATCH', 
      grain: 'One row per AR invoice',
      estimatedRows: 50000000,
      estimatedSize: '250GB'
    },
    { 
      name: 'bronze.abl_inventory_reports', 
      description: 'Inventory valuation and aging reports', 
      sourceSystem: 'ERP_INTEGRATION', 
      loadType: 'BATCH', 
      grain: 'One row per inventory item',
      estimatedRows: 20000000,
      estimatedSize: '100GB'
    },
    { 
      name: 'bronze.abl_advance_rates', 
      description: 'Advance rate schedules by collateral type', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per advance rate',
      estimatedRows: 50000,
      estimatedSize: '100MB'
    },
    { 
      name: 'bronze.abl_ineligibles', 
      description: 'Ineligible AR and inventory items', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per ineligible item',
      estimatedRows: 5000000,
      estimatedSize: '25GB'
    },
    { 
      name: 'bronze.abl_dilution_reserves', 
      description: 'AR dilution reserve calculations', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per reserve calculation',
      estimatedRows: 120000,
      estimatedSize: '300MB'
    },
    { 
      name: 'bronze.abl_concentration_reserves', 
      description: 'Concentration reserve calculations', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per concentration limit',
      estimatedRows: 100000,
      estimatedSize: '250MB'
    },
    { 
      name: 'bronze.abl_field_exams', 
      description: 'Field examination reports', 
      sourceSystem: 'FIELD_EXAM_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per field exam',
      estimatedRows: 5000,
      estimatedSize: '50GB'
    },
    { 
      name: 'bronze.abl_field_exam_findings', 
      description: 'Field exam findings and exceptions', 
      sourceSystem: 'FIELD_EXAM_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per finding',
      estimatedRows: 20000,
      estimatedSize: '100MB'
    },
    { 
      name: 'bronze.abl_loan_advances', 
      description: 'ABL loan advance transactions', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per advance',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.abl_loan_repayments', 
      description: 'ABL loan repayment transactions', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per repayment',
      estimatedRows: 1000000,
      estimatedSize: '4GB'
    },
    { 
      name: 'bronze.abl_availability_blocks', 
      description: 'Availability blocks and reserves', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per block',
      estimatedRows: 50000,
      estimatedSize: '150MB'
    },
    { 
      name: 'bronze.abl_covenant_compliance', 
      description: 'ABL covenant compliance testing', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per covenant test',
      estimatedRows: 40000,
      estimatedSize: '100MB'
    },
    { 
      name: 'bronze.abl_collateral_insurance', 
      description: 'Collateral insurance certificates', 
      sourceSystem: 'INSURANCE_TRACKING', 
      loadType: 'BATCH', 
      grain: 'One row per insurance policy',
      estimatedRows: 15000,
      estimatedSize: '75MB'
    },
    { 
      name: 'bronze.abl_appraisals', 
      description: 'Inventory and equipment appraisals', 
      sourceSystem: 'APPRAISAL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per appraisal',
      estimatedRows: 10000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.abl_lockbox_receipts', 
      description: 'Lockbox AR collection receipts', 
      sourceSystem: 'LOCKBOX_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per receipt',
      estimatedRows: 10000000,
      estimatedSize: '50GB'
    },
    { 
      name: 'bronze.abl_overadvances', 
      description: 'Overadvance situations and approvals', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per overadvance',
      estimatedRows: 5000,
      estimatedSize: '25MB'
    },
    { 
      name: 'bronze.abl_borrower_financials', 
      description: 'Borrower financial statements for ABL', 
      sourceSystem: 'BORROWER_PORTAL', 
      loadType: 'BATCH', 
      grain: 'One row per financial statement',
      estimatedRows: 30000,
      estimatedSize: '150MB'
    },
    { 
      name: 'bronze.abl_cross_age_analysis', 
      description: 'Cross-aged AR analysis', 
      sourceSystem: 'ABL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per cross-age bucket',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    }
  ],
  totalTables: 20
};

// SILVER LAYER - 15 tables
export const ablCommercialSilverLayer = {
  description: 'Silver layer for ABL domain - cleansed ABL data',
  layer: 'SILVER',
  tables: [
    { name: 'silver.abl_facilities_cleansed', description: 'Cleansed ABL facilities', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.abl_borrowing_base_cleansed', description: 'Cleansed borrowing base certificates', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_ar_cleansed', description: 'Cleansed accounts receivable', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_inventory_cleansed', description: 'Cleansed inventory reports', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_advances_cleansed', description: 'Cleansed loan advances', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_field_exams_cleansed', description: 'Cleansed field exams', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_lockbox_receipts_cleansed', description: 'Cleansed lockbox receipts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_availability_agg', description: 'Aggregated borrowing base availability', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_collateral_coverage_agg', description: 'Aggregated collateral coverage ratios', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_ar_turnover_agg', description: 'Aggregated AR turnover metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_inventory_turnover_agg', description: 'Aggregated inventory turnover', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_dilution_trends_agg', description: 'Aggregated AR dilution trends', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_utilization_metrics_agg', description: 'Aggregated facility utilization', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_field_exam_scores_agg', description: 'Aggregated field exam quality scores', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.abl_profitability_agg', description: 'Aggregated ABL facility profitability', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' }
  ],
  totalTables: 15
};

// GOLD LAYER - 11 dimensions + 8 facts
export const ablCommercialGoldLayer = {
  description: 'Gold layer for ABL domain - dimensional model',
  layer: 'GOLD',
  dimensions: [
    { name: 'gold.dim_abl_facility', description: 'ABL facility dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_borrower', description: 'ABL borrower dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_collateral_type', description: 'Collateral type dimension (AR, inventory, equipment)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_advance_rate_tier', description: 'Advance rate tier dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_ineligible_category', description: 'AR/inventory ineligible category dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_reserve_type', description: 'Reserve type dimension (dilution, concentration)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_field_examiner', description: 'Field examiner dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_industry_sector', description: 'Borrower industry sector dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_facility_status', description: 'Facility status dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_covenant_type', description: 'ABL covenant type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_relationship_manager', description: 'ABL relationship manager dimension', scdType: 'SCD_TYPE_2' }
  ],
  facts: [
    { name: 'gold.fact_abl_borrowing_base', description: 'Borrowing base calculation fact', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_abl_advances', description: 'ABL advance transaction fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_abl_repayments', description: 'ABL repayment transaction fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_abl_collateral_performance', description: 'Collateral performance snapshot', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_abl_ar_aging', description: 'AR aging fact', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_abl_inventory_aging', description: 'Inventory aging fact', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_abl_field_exams', description: 'Field exam fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_abl_facility_profitability', description: 'ABL facility profitability snapshot', factType: 'PERIODIC_SNAPSHOT' }
  ],
  totalDimensions: 11,
  totalFacts: 8
};

export default {
  ablCommercialBronzeLayer,
  ablCommercialSilverLayer,
  ablCommercialGoldLayer
};
