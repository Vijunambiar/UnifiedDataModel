/**
 * LOANS-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (20), Silver (15), Gold (10 dims + 6 facts)
 * 
 * Commercial Lending: C&I, CRE, LOC, Working Capital
 */

// BRONZE LAYER - 20 tables
export const loansCommercialBronzeLayer = {
  description: 'Bronze layer for commercial loans domain - raw lending data',
  layer: 'BRONZE',
  tables: [
    { name: 'bronze.commercial_loan_applications', description: 'Commercial loan applications', sourceSystem: 'COMMERCIAL_LOS', loadType: 'STREAMING', grain: 'One row per application' },
    { name: 'bronze.commercial_loan_accounts', description: 'Commercial loan account master', sourceSystem: 'COMMERCIAL_LOS', loadType: 'BATCH', grain: 'One row per loan account' },
    { name: 'bronze.commercial_ci_loans', description: 'Commercial & Industrial loans', sourceSystem: 'COMMERCIAL_LOS', loadType: 'BATCH', grain: 'One row per C&I loan' },
    { name: 'bronze.commercial_cre_loans', description: 'Commercial Real Estate loans', sourceSystem: 'COMMERCIAL_LOS', loadType: 'BATCH', grain: 'One row per CRE loan' },
    { name: 'bronze.commercial_lines_of_credit', description: 'Revolving lines of credit', sourceSystem: 'COMMERCIAL_LOS', loadType: 'BATCH', grain: 'One row per LOC' },
    { name: 'bronze.commercial_term_loans', description: 'Term loan details', sourceSystem: 'COMMERCIAL_LOS', loadType: 'BATCH', grain: 'One row per term loan' },
    { name: 'bronze.commercial_loan_draws', description: 'LOC draw transactions', sourceSystem: 'COMMERCIAL_LOS', loadType: 'STREAMING', grain: 'One row per draw' },
    { name: 'bronze.commercial_loan_payments', description: 'Commercial loan payments', sourceSystem: 'COMMERCIAL_LOS', loadType: 'STREAMING', grain: 'One row per payment' },
    { name: 'bronze.commercial_loan_collateral', description: 'Commercial loan collateral', sourceSystem: 'COLLATERAL_SYSTEM', loadType: 'BATCH', grain: 'One row per collateral item' },
    { name: 'bronze.commercial_property_appraisals', description: 'CRE property appraisals', sourceSystem: 'APPRAISAL_SYSTEM', loadType: 'BATCH', grain: 'One row per appraisal' },
    { name: 'bronze.commercial_loan_covenants', description: 'Financial covenants', sourceSystem: 'COVENANT_TRACKING', loadType: 'BATCH', grain: 'One row per covenant' },
    { name: 'bronze.commercial_covenant_compliance', description: 'Covenant compliance testing', sourceSystem: 'COVENANT_TRACKING', loadType: 'BATCH', grain: 'One row per test' },
    { name: 'bronze.commercial_loan_syndications', description: 'Syndicated loan participations', sourceSystem: 'SYNDICATION_SYSTEM', loadType: 'BATCH', grain: 'One row per syndication' },
    { name: 'bronze.commercial_loan_commitments', description: 'Loan commitments and unfunded amounts', sourceSystem: 'COMMERCIAL_LOS', loadType: 'BATCH', grain: 'One row per commitment' },
    { name: 'bronze.commercial_loan_modifications', description: 'Loan modification events', sourceSystem: 'COMMERCIAL_LOS', loadType: 'STREAMING', grain: 'One row per modification' },
    { name: 'bronze.commercial_loan_participations', description: 'Loan participation buy/sell', sourceSystem: 'PARTICIPATION_SYSTEM', loadType: 'BATCH', grain: 'One row per participation' },
    { name: 'bronze.commercial_loan_pricing', description: 'Loan pricing and rate adjustments', sourceSystem: 'PRICING_ENGINE', loadType: 'STREAMING', grain: 'One row per pricing event' },
    { name: 'bronze.commercial_credit_reviews', description: 'Annual credit reviews', sourceSystem: 'CREDIT_REVIEW_SYSTEM', loadType: 'BATCH', grain: 'One row per review' },
    { name: 'bronze.commercial_loan_watchlist', description: 'Problem loan watchlist', sourceSystem: 'RISK_SYSTEM', loadType: 'BATCH', grain: 'One row per watchlist entry' },
    { name: 'bronze.commercial_loan_charge_offs', description: 'Commercial loan charge-offs', sourceSystem: 'COMMERCIAL_LOS', loadType: 'BATCH', grain: 'One row per charge-off' }
  ],
  totalTables: 20
};

// SILVER LAYER - 15 tables
export const loansCommercialSilverLayer = {
  description: 'Silver layer for commercial loans domain - cleansed lending data',
  layer: 'SILVER',
  tables: [
    { name: 'silver.commercial_loan_accounts_cleansed', description: 'Cleansed commercial loan accounts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_ci_loans_cleansed', description: 'Cleansed C&I loans', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_cre_loans_cleansed', description: 'Cleansed CRE loans', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_lines_of_credit_cleansed', description: 'Cleansed lines of credit', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_loan_payments_cleansed', description: 'Cleansed loan payments', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_loan_collateral_cleansed', description: 'Cleansed collateral data', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.commercial_covenant_compliance_cleansed', description: 'Cleansed covenant compliance', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_credit_reviews_cleansed', description: 'Cleansed credit reviews', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_loan_performance_agg', description: 'Aggregated loan performance metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_portfolio_quality_agg', description: 'Aggregated portfolio quality', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_collateral_coverage_agg', description: 'Aggregated collateral coverage', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_covenant_metrics_agg', description: 'Aggregated covenant metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_loan_originations_agg', description: 'Aggregated origination metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_credit_quality_trends_agg', description: 'Aggregated credit quality trends', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.commercial_loan_profitability_agg', description: 'Aggregated loan profitability', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' }
  ],
  totalTables: 15
};

// GOLD LAYER - 10 dimensions + 6 facts
export const loansCommercialGoldLayer = {
  description: 'Gold layer for commercial loans domain - dimensional model',
  layer: 'GOLD',
  dimensions: [
    { name: 'gold.dim_commercial_loan', description: 'Commercial loan dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_loan_product_type', description: 'Loan product type dimension (C&I, CRE, LOC)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_loan_purpose', description: 'Loan purpose dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_collateral_type', description: 'Collateral type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_property_type', description: 'CRE property type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_loan_risk_grade', description: 'Loan risk rating dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_covenant_type', description: 'Financial covenant type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_loan_officer', description: 'Loan officer dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_loan_status', description: 'Loan status dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_industry_sector', description: 'Borrower industry sector dimension', scdType: 'SCD_TYPE_1' }
  ],
  facts: [
    { name: 'gold.fact_commercial_loan_originations', description: 'Loan origination fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_commercial_loan_balances', description: 'Loan balance snapshot fact', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_commercial_loan_payments', description: 'Loan payment fact', factType: 'TRANSACTION' },
    { name: 'gold.fact_commercial_loan_performance', description: 'Loan performance metrics fact', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_covenant_compliance', description: 'Covenant compliance fact', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_collateral_coverage', description: 'Collateral coverage fact', factType: 'PERIODIC_SNAPSHOT' }
  ],
  totalDimensions: 10,
  totalFacts: 6
};

// Export metrics catalog
export { loansCommercialMetricsCatalog } from './loans-commercial-metrics';

export default {
  loansCommercialBronzeLayer,
  loansCommercialSilverLayer,
  loansCommercialGoldLayer
};
