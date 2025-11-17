/**
 * LEASING-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (20), Silver (15), Gold (12 dims + 8 facts)
 * 
 * Domain: Equipment Leasing & Finance
 * Coverage: Equipment Leases, Operating/Capital Leases, Residual Value, ASC 842/IFRS 16, Equipment Disposition
 */

// BRONZE LAYER - 20 tables
export const leasingCommercialBronzeLayer = {
  description: 'Bronze layer for equipment leasing domain - raw leasing data',
  layer: 'BRONZE',
  tables: [
    { 
      name: 'bronze.lease_contracts', 
      description: 'Equipment lease master contracts', 
      sourceSystem: 'LEASING_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per lease contract',
      estimatedRows: 100000,
      estimatedSize: '500MB'
    },
    { 
      name: 'bronze.lease_applications', 
      description: 'Lease application and credit approval', 
      sourceSystem: 'LEASING_ORIGINATION', 
      loadType: 'STREAMING', 
      grain: 'One row per application',
      estimatedRows: 50000,
      estimatedSize: '200MB'
    },
    { 
      name: 'bronze.leased_equipment', 
      description: 'Equipment inventory and specifications', 
      sourceSystem: 'ASSET_MANAGEMENT', 
      loadType: 'BATCH', 
      grain: 'One row per equipment item',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.lease_payments', 
      description: 'Lease payment transactions', 
      sourceSystem: 'LEASING_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per payment',
      estimatedRows: 5000000,
      estimatedSize: '20GB'
    },
    { 
      name: 'bronze.lease_schedules', 
      description: 'Lease payment schedules and amortization', 
      sourceSystem: 'LEASING_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per schedule',
      estimatedRows: 100000,
      estimatedSize: '400MB'
    },
    { 
      name: 'bronze.equipment_vendors', 
      description: 'Equipment vendors and manufacturers', 
      sourceSystem: 'VENDOR_MANAGEMENT', 
      loadType: 'BATCH', 
      grain: 'One row per vendor',
      estimatedRows: 10000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.equipment_purchase_orders', 
      description: 'Equipment purchase orders for lease', 
      sourceSystem: 'PROCUREMENT_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per PO',
      estimatedRows: 80000,
      estimatedSize: '300MB'
    },
    { 
      name: 'bronze.equipment_delivery_receipts', 
      description: 'Equipment delivery and acceptance', 
      sourceSystem: 'ASSET_MANAGEMENT', 
      loadType: 'STREAMING', 
      grain: 'One row per delivery',
      estimatedRows: 80000,
      estimatedSize: '250MB'
    },
    { 
      name: 'bronze.residual_value_estimates', 
      description: 'Equipment residual value forecasts', 
      sourceSystem: 'VALUATION_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per valuation',
      estimatedRows: 100000,
      estimatedSize: '300MB'
    },
    { 
      name: 'bronze.lease_terminations', 
      description: 'Lease early termination events', 
      sourceSystem: 'LEASING_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per termination',
      estimatedRows: 20000,
      estimatedSize: '100MB'
    },
    { 
      name: 'bronze.equipment_returns', 
      description: 'Equipment return and inspection reports', 
      sourceSystem: 'ASSET_MANAGEMENT', 
      loadType: 'STREAMING', 
      grain: 'One row per return',
      estimatedRows: 30000,
      estimatedSize: '150MB'
    },
    { 
      name: 'bronze.equipment_remarketing', 
      description: 'Off-lease equipment remarketing/sales', 
      sourceSystem: 'DISPOSITION_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per sale',
      estimatedRows: 25000,
      estimatedSize: '125MB'
    },
    { 
      name: 'bronze.lease_renewals', 
      description: 'Lease renewal and extension events', 
      sourceSystem: 'LEASING_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per renewal',
      estimatedRows: 30000,
      estimatedSize: '120MB'
    },
    { 
      name: 'bronze.lease_modifications', 
      description: 'Lease modification and restructure events', 
      sourceSystem: 'LEASING_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per modification',
      estimatedRows: 15000,
      estimatedSize: '75MB'
    },
    { 
      name: 'bronze.equipment_maintenance', 
      description: 'Equipment maintenance and service records', 
      sourceSystem: 'MAINTENANCE_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per maintenance event',
      estimatedRows: 200000,
      estimatedSize: '800MB'
    },
    { 
      name: 'bronze.lease_insurance', 
      description: 'Equipment insurance policies and claims', 
      sourceSystem: 'INSURANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per policy',
      estimatedRows: 100000,
      estimatedSize: '300MB'
    },
    { 
      name: 'bronze.equipment_depreciation', 
      description: 'Equipment depreciation schedules', 
      sourceSystem: 'ACCOUNTING_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per depreciation schedule',
      estimatedRows: 100000,
      estimatedSize: '400MB'
    },
    { 
      name: 'bronze.lease_accounting_entries', 
      description: 'ASC 842/IFRS 16 accounting journal entries', 
      sourceSystem: 'GL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per journal entry',
      estimatedRows: 1000000,
      estimatedSize: '4GB'
    },
    { 
      name: 'bronze.equipment_titling', 
      description: 'Equipment title and registration records', 
      sourceSystem: 'TITLING_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per title',
      estimatedRows: 500000,
      estimatedSize: '1GB'
    },
    { 
      name: 'bronze.tax_benefits', 
      description: 'Tax depreciation and Section 179 benefits', 
      sourceSystem: 'TAX_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per tax benefit',
      estimatedRows: 100000,
      estimatedSize: '300MB'
    }
  ],
  totalTables: 20
};

// SILVER LAYER - 15 tables
export const leasingCommercialSilverLayer = {
  description: 'Silver layer for equipment leasing domain - cleansed leasing data',
  layer: 'SILVER',
  tables: [
    { name: 'silver.lease_contracts_cleansed', description: 'Cleansed lease contracts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.leased_equipment_cleansed', description: 'Cleansed equipment inventory', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.lease_payments_cleansed', description: 'Cleansed lease payments', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.residual_value_cleansed', description: 'Cleansed residual value estimates', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.equipment_returns_cleansed', description: 'Cleansed equipment returns', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.equipment_remarketing_cleansed', description: 'Cleansed remarketing transactions', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.lease_accounting_cleansed', description: 'Cleansed ASC 842 accounting', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.lease_portfolio_metrics_agg', description: 'Aggregated portfolio metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.residual_value_variance_agg', description: 'Aggregated residual value variance', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.equipment_utilization_agg', description: 'Aggregated equipment utilization', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.lease_yield_metrics_agg', description: 'Aggregated lease yield and profitability', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.equipment_maintenance_costs_agg', description: 'Aggregated maintenance costs', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.lease_renewal_rates_agg', description: 'Aggregated renewal and retention rates', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.remarketing_recovery_rates_agg', description: 'Aggregated off-lease recovery rates', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.tax_benefit_utilization_agg', description: 'Aggregated tax benefit metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' }
  ],
  totalTables: 15
};

// GOLD LAYER - 12 dimensions + 8 facts
export const leasingCommercialGoldLayer = {
  description: 'Gold layer for equipment leasing domain - dimensional model',
  layer: 'GOLD',
  dimensions: [
    { name: 'gold.dim_lease_contract', description: 'Lease contract dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_lessee', description: 'Lessee/customer dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_equipment', description: 'Equipment dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_equipment_type', description: 'Equipment type dimension (IT, medical, construction, etc.)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_lease_type', description: 'Lease type dimension (operating, capital, finance)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_vendor', description: 'Equipment vendor dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_lease_term', description: 'Lease term dimension (12mo, 24mo, 36mo, etc.)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_payment_frequency', description: 'Payment frequency dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_lease_status', description: 'Lease status dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_equipment_condition', description: 'Equipment condition dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_disposition_channel', description: 'Off-lease disposition channel dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_industry_sector', description: 'Lessee industry sector dimension', scdType: 'SCD_TYPE_1' }
  ],
  facts: [
    { name: 'gold.fact_lease_originations', description: 'Lease origination fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_lease_payments', description: 'Lease payment fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_lease_portfolio', description: 'Lease portfolio snapshot', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_equipment_disposition', description: 'Off-lease equipment disposition fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_residual_value_variance', description: 'Residual value variance fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_lease_accounting', description: 'ASC 842/IFRS 16 accounting fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_equipment_maintenance', description: 'Equipment maintenance fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_lease_profitability', description: 'Lease profitability snapshot', factType: 'PERIODIC_SNAPSHOT' }
  ],
  totalDimensions: 12,
  totalFacts: 8
};

export default {
  leasingCommercialBronzeLayer,
  leasingCommercialSilverLayer,
  leasingCommercialGoldLayer
};
