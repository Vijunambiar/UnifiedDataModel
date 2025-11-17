/**
 * DEPOSITS-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (20), Silver (15), Gold (10 dims + 6 facts)
 * 
 * Commercial Deposits: DDA, Analyzed Accounts, Sweep Accounts
 */

// BRONZE LAYER - 20 tables
export const depositsCommercialBronzeLayer = {
  description: 'Bronze layer for commercial deposits domain - raw deposit data',
  layer: 'BRONZE',
  tables: [
    { name: 'bronze.commercial_dda_accounts', description: 'Commercial DDA accounts', sourceSystem: 'CORE_BANKING', loadType: 'BATCH', grain: 'One row per DDA account' },
    { name: 'bronze.commercial_analyzed_accounts', description: 'Analyzed business accounts', sourceSystem: 'ACCOUNT_ANALYSIS', loadType: 'BATCH', grain: 'One row per analyzed account' },
    { name: 'bronze.commercial_money_market_accounts', description: 'Commercial money market accounts', sourceSystem: 'CORE_BANKING', loadType: 'BATCH', grain: 'One row per MMDA' },
    { name: 'bronze.commercial_sweep_accounts', description: 'Commercial sweep account arrangements', sourceSystem: 'SWEEP_SYSTEM', loadType: 'BATCH', grain: 'One row per sweep account' },
    { name: 'bronze.commercial_cd_accounts', description: 'Commercial certificate of deposit accounts', sourceSystem: 'CORE_BANKING', loadType: 'BATCH', grain: 'One row per CD' },
    { name: 'bronze.commercial_deposit_transactions', description: 'Commercial deposit transactions', sourceSystem: 'CORE_BANKING', loadType: 'STREAMING', grain: 'One row per transaction' },
    { name: 'bronze.commercial_account_balances', description: 'Daily account balance snapshots', sourceSystem: 'CORE_BANKING', loadType: 'BATCH', grain: 'One row per account per day' },
    { name: 'bronze.commercial_service_charges', description: 'Commercial service charges', sourceSystem: 'ACCOUNT_ANALYSIS', loadType: 'BATCH', grain: 'One row per charge' },
    { name: 'bronze.commercial_earnings_credits', description: 'Earnings credit calculations', sourceSystem: 'ACCOUNT_ANALYSIS', loadType: 'BATCH', grain: 'One row per credit calculation' },
    { name: 'bronze.commercial_account_analysis_statements', description: 'Account analysis statements', sourceSystem: 'ACCOUNT_ANALYSIS', loadType: 'BATCH', grain: 'One row per statement' },
    { name: 'bronze.commercial_sweep_transactions', description: 'Automated sweep transactions', sourceSystem: 'SWEEP_SYSTEM', loadType: 'STREAMING', grain: 'One row per sweep' },
    { name: 'bronze.commercial_zba_accounts', description: 'Zero Balance Account structures', sourceSystem: 'CORE_BANKING', loadType: 'BATCH', grain: 'One row per ZBA' },
    { name: 'bronze.commercial_concentration_accounts', description: 'Concentration account master', sourceSystem: 'CORE_BANKING', loadType: 'BATCH', grain: 'One row per concentration account' },
    { name: 'bronze.commercial_reciprocal_deposits', description: 'Reciprocal deposit arrangements', sourceSystem: 'RECIPROCAL_SYSTEM', loadType: 'BATCH', grain: 'One row per reciprocal deposit' },
    { name: 'bronze.commercial_deposit_holds', description: 'Deposit holds and restrictions', sourceSystem: 'CORE_BANKING', loadType: 'STREAMING', grain: 'One row per hold' },
    { name: 'bronze.commercial_signature_cards', description: 'Account signature authorizations', sourceSystem: 'SIGNATURE_SYSTEM', loadType: 'BATCH', grain: 'One row per signature card' },
    { name: 'bronze.commercial_account_packages', description: 'Account package assignments', sourceSystem: 'CORE_BANKING', loadType: 'BATCH', grain: 'One row per package' },
    { name: 'bronze.commercial_interest_accruals', description: 'Interest accrual calculations', sourceSystem: 'CORE_BANKING', loadType: 'BATCH', grain: 'One row per accrual' },
    { name: 'bronze.commercial_reserve_requirements', description: 'Reserve requirement calculations', sourceSystem: 'TREASURY_SYSTEM', loadType: 'BATCH', grain: 'One row per requirement' },
    { name: 'bronze.commercial_account_openings', description: 'New account opening events', sourceSystem: 'ONBOARDING_SYSTEM', loadType: 'STREAMING', grain: 'One row per opening' }
  ],
  totalTables: 20
};

// SILVER LAYER - 15 tables
export const depositsCommercialSilverLayer = {
  description: 'Silver layer for commercial deposits domain - cleansed deposit data',
  layer: 'SILVER',
  tables: [
    { name: 'silver.commercial_dda_accounts_cleansed', description: 'Cleansed commercial DDA accounts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_analyzed_accounts_cleansed', description: 'Cleansed analyzed accounts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_sweep_accounts_cleansed', description: 'Cleansed sweep accounts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_deposit_transactions_cleansed', description: 'Cleansed deposit transactions', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_service_charges_cleansed', description: 'Cleansed service charges', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_earnings_credits_cleansed', description: 'Cleansed earnings credits', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_zba_structures_cleansed', description: 'Cleansed ZBA structures', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_account_balances_agg', description: 'Aggregated account balances', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_transaction_volumes_agg', description: 'Aggregated transaction volumes', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_service_fee_revenue_agg', description: 'Aggregated service fee revenue', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_account_profitability_agg', description: 'Aggregated account profitability', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_balance_trends_agg', description: 'Aggregated balance trends', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_sweep_performance_agg', description: 'Aggregated sweep performance', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_deposit_growth_agg', description: 'Aggregated deposit growth metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_account_analysis_metrics_agg', description: 'Aggregated account analysis metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' }
  ],
  totalTables: 15
};

// GOLD LAYER - 10 dimensions + 6 facts
export const depositsCommercialGoldLayer = {
  description: 'Gold layer for commercial deposits domain - dimensional model',
  layer: 'GOLD',
  dimensions: [
    { name: 'gold.dim_commercial_deposit_account', description: 'Commercial deposit account dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_account_product_type', description: 'Account product type dimension (DDA, MMDA, CD)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_account_package', description: 'Account package dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_service_charge_type', description: 'Service charge type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_balance_tier', description: 'Balance tier dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_transaction_type', description: 'Transaction type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_sweep_type', description: 'Sweep arrangement type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_zba_structure_type', description: 'ZBA structure type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_deposit_relationship_manager', description: 'Deposit relationship manager dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_account_status', description: 'Account status dimension', scdType: 'SCD_TYPE_1' }
  ],
  facts: [
    { name: 'gold.fact_commercial_account_balances', description: 'Account balance snapshot fact', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_commercial_deposit_transactions', description: 'Deposit transaction fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_commercial_service_fees', description: 'Service fee fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_commercial_account_profitability', description: 'Account profitability fact', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_commercial_sweep_activity', description: 'Sweep activity fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_commercial_account_analysis', description: 'Account analysis statement fact', factType: 'PERIODIC_SNAPSHOT' }
  ],
  totalDimensions: 10,
  totalFacts: 6
};

// Export metrics catalog
export { depositsCommercialMetricsCatalog } from './deposits-commercial-metrics';

export default {
  depositsCommercialBronzeLayer,
  depositsCommercialSilverLayer,
  depositsCommercialGoldLayer
};
