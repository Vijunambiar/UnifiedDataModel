/**
 * RISK-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (28), Silver (20), Gold (16 dims + 12 facts)
 * 
 * Domain: Commercial Banking Risk Management
 * Coverage: Credit Risk, Market Risk, Operational Risk, Liquidity Risk, Concentration Risk, CCAR/Stress Testing
 */

// BRONZE LAYER - 28 tables
export const riskCommercialBronzeLayer = {
  description: 'Bronze layer for commercial risk domain - raw risk management data',
  layer: 'BRONZE',
  tables: [
    { 
      name: 'bronze.credit_risk_ratings', 
      description: 'Internal credit risk ratings and PD/LGD/EAD', 
      sourceSystem: 'CREDIT_RISK_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per rating',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.credit_risk_models', 
      description: 'Credit risk model parameters and scorecards', 
      sourceSystem: 'MODEL_RISK_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per model',
      estimatedRows: 1000,
      estimatedSize: '100MB'
    },
    { 
      name: 'bronze.loan_portfolio_segments', 
      description: 'Loan portfolio segmentation for risk analysis', 
      sourceSystem: 'CREDIT_RISK_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per segment',
      estimatedRows: 5000000,
      estimatedSize: '20GB'
    },
    { 
      name: 'bronze.credit_limit_utilization', 
      description: 'Credit line utilization and availability', 
      sourceSystem: 'LENDING_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per utilization snapshot',
      estimatedRows: 10000000,
      estimatedSize: '40GB'
    },
    { 
      name: 'bronze.collateral_valuations', 
      description: 'Collateral appraisals and valuations', 
      sourceSystem: 'COLLATERAL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per valuation',
      estimatedRows: 2000000,
      estimatedSize: '8GB'
    },
    { 
      name: 'bronze.loan_loss_reserves', 
      description: 'ALLL/CECL reserves by portfolio', 
      sourceSystem: 'FINANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per reserve calculation',
      estimatedRows: 100000,
      estimatedSize: '500MB'
    },
    { 
      name: 'bronze.credit_risk_concentrations', 
      description: 'Concentration risk by industry/geography/borrower', 
      sourceSystem: 'CREDIT_RISK_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per concentration metric',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.loan_modifications', 
      description: 'Loan restructurings and forbearances', 
      sourceSystem: 'LENDING_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per modification',
      estimatedRows: 200000,
      estimatedSize: '800MB'
    },
    { 
      name: 'bronze.market_risk_positions', 
      description: 'Trading book positions and exposures', 
      sourceSystem: 'TREASURY_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per position',
      estimatedRows: 5000000,
      estimatedSize: '20GB'
    },
    { 
      name: 'bronze.market_risk_var', 
      description: 'Value at Risk (VaR) calculations', 
      sourceSystem: 'RISK_ANALYTICS', 
      loadType: 'BATCH', 
      grain: 'One row per VaR calculation',
      estimatedRows: 365000,
      estimatedSize: '1.5GB'
    },
    { 
      name: 'bronze.market_risk_scenarios', 
      description: 'Market risk stress scenarios and sensitivities', 
      sourceSystem: 'RISK_ANALYTICS', 
      loadType: 'BATCH', 
      grain: 'One row per scenario run',
      estimatedRows: 10000,
      estimatedSize: '100MB'
    },
    { 
      name: 'bronze.derivative_exposures', 
      description: 'Derivative positions and mark-to-market', 
      sourceSystem: 'TREASURY_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per derivative',
      estimatedRows: 1000000,
      estimatedSize: '4GB'
    },
    { 
      name: 'bronze.counterparty_credit_risk', 
      description: 'CVA, DVA, FVA for counterparty exposure', 
      sourceSystem: 'RISK_ANALYTICS', 
      loadType: 'BATCH', 
      grain: 'One row per counterparty',
      estimatedRows: 50000,
      estimatedSize: '200MB'
    },
    { 
      name: 'bronze.operational_risk_events', 
      description: 'Operational loss events and incidents', 
      sourceSystem: 'OPRISK_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per event',
      estimatedRows: 100000,
      estimatedSize: '400MB'
    },
    { 
      name: 'bronze.operational_kri_metrics', 
      description: 'Key Risk Indicators (KRIs) for operational risk', 
      sourceSystem: 'OPRISK_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per KRI measurement',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.control_self_assessments', 
      description: 'Risk control self-assessments (RCSAs)', 
      sourceSystem: 'OPRISK_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per control assessment',
      estimatedRows: 50000,
      estimatedSize: '200MB'
    },
    { 
      name: 'bronze.audit_findings', 
      description: 'Internal audit findings and issues', 
      sourceSystem: 'AUDIT_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per finding',
      estimatedRows: 20000,
      estimatedSize: '80MB'
    },
    { 
      name: 'bronze.liquidity_positions', 
      description: 'Daily liquidity positions and cash flows', 
      sourceSystem: 'TREASURY_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per position snapshot',
      estimatedRows: 10000000,
      estimatedSize: '40GB'
    },
    { 
      name: 'bronze.liquidity_stress_tests', 
      description: 'Liquidity stress testing scenarios', 
      sourceSystem: 'ALCO_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per stress test',
      estimatedRows: 5000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.lcr_calculations', 
      description: 'Liquidity Coverage Ratio (LCR) calculations', 
      sourceSystem: 'REGULATORY_REPORTING', 
      loadType: 'BATCH', 
      grain: 'One row per LCR calculation',
      estimatedRows: 365000,
      estimatedSize: '1.5GB'
    },
    { 
      name: 'bronze.nsfr_calculations', 
      description: 'Net Stable Funding Ratio (NSFR) calculations', 
      sourceSystem: 'REGULATORY_REPORTING', 
      loadType: 'BATCH', 
      grain: 'One row per NSFR calculation',
      estimatedRows: 365000,
      estimatedSize: '1.5GB'
    },
    { 
      name: 'bronze.ccar_submissions', 
      description: 'CCAR stress testing submissions', 
      sourceSystem: 'REGULATORY_REPORTING', 
      loadType: 'BATCH', 
      grain: 'One row per CCAR submission',
      estimatedRows: 100,
      estimatedSize: '10MB'
    },
    { 
      name: 'bronze.stress_test_scenarios', 
      description: 'Regulatory and internal stress scenarios', 
      sourceSystem: 'RISK_ANALYTICS', 
      loadType: 'BATCH', 
      grain: 'One row per scenario',
      estimatedRows: 1000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.capital_adequacy_ratios', 
      description: 'CET1, Tier 1, Total Capital ratios', 
      sourceSystem: 'REGULATORY_REPORTING', 
      loadType: 'BATCH', 
      grain: 'One row per capital calculation',
      estimatedRows: 365000,
      estimatedSize: '1.5GB'
    },
    { 
      name: 'bronze.rwa_calculations', 
      description: 'Risk-Weighted Assets by Basel III approach', 
      sourceSystem: 'CAPITAL_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per RWA calculation',
      estimatedRows: 5000000,
      estimatedSize: '20GB'
    },
    { 
      name: 'bronze.large_exposures', 
      description: 'Large exposure reporting (> 10% of capital)', 
      sourceSystem: 'CREDIT_RISK_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per large exposure',
      estimatedRows: 10000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.model_validation_results', 
      description: 'Model validation findings and backtesting', 
      sourceSystem: 'MODEL_RISK_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per validation',
      estimatedRows: 5000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.risk_appetite_metrics', 
      description: 'Risk appetite limits and utilization', 
      sourceSystem: 'RISK_GOVERNANCE', 
      loadType: 'BATCH', 
      grain: 'One row per metric',
      estimatedRows: 50000,
      estimatedSize: '200MB'
    }
  ],
  totalTables: 28
};

// SILVER LAYER - 20 tables
export const riskCommercialSilverLayer = {
  description: 'Silver layer for commercial risk domain - cleansed and aggregated risk metrics',
  layer: 'SILVER',
  tables: [
    { name: 'silver.credit_risk_ratings_cleansed', description: 'Cleansed credit ratings with PD/LGD/EAD', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.loan_portfolio_segments_cleansed', description: 'Cleansed portfolio segments', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.collateral_valuations_cleansed', description: 'Cleansed collateral valuations', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.market_risk_positions_cleansed', description: 'Cleansed trading positions', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.derivative_exposures_cleansed', description: 'Cleansed derivative exposures', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.operational_risk_events_cleansed', description: 'Cleansed operational loss events', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.liquidity_positions_cleansed', description: 'Cleansed liquidity positions', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.capital_ratios_cleansed', description: 'Cleansed capital adequacy ratios', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.credit_risk_concentration_agg', description: 'Aggregated concentration risk metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.loan_loss_reserve_agg', description: 'Aggregated ALLL/CECL reserves', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.market_risk_var_agg', description: 'Aggregated VaR metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.counterparty_credit_risk_agg', description: 'Aggregated CCR exposures', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.operational_kri_agg', description: 'Aggregated KRI metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.liquidity_coverage_agg', description: 'Aggregated LCR/NSFR metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.stress_test_results_agg', description: 'Aggregated stress test impacts', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.rwa_summary_agg', description: 'Aggregated RWA by Basel approach', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.risk_appetite_utilization_agg', description: 'Aggregated risk appetite metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.portfolio_risk_metrics_agg', description: 'Aggregated portfolio risk metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.expected_loss_agg', description: 'Aggregated expected loss (EL = PD × LGD × EAD)', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.unexpected_loss_agg', description: 'Aggregated unexpected loss and economic capital', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' }
  ],
  totalTables: 20
};

// GOLD LAYER - 16 dimensions + 12 facts
export const riskCommercialGoldLayer = {
  description: 'Gold layer for commercial risk domain - dimensional risk analytics',
  layer: 'GOLD',
  dimensions: [
    { name: 'gold.dim_credit_rating', description: 'Credit rating dimension (AAA to D)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_risk_segment', description: 'Risk segment dimension (investment grade, sub-investment)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_collateral_type', description: 'Collateral type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_industry_sector', description: 'Industry sector dimension for concentration risk', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_geographic_region', description: 'Geographic region dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_risk_model', description: 'Risk model dimension (PD, LGD, EAD models)', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_basel_approach', description: 'Basel approach dimension (Standardized, IRB-A, IRB-F)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_stress_scenario', description: 'Stress test scenario dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_liquidity_bucket', description: 'Liquidity time bucket dimension (0-30d, 31-90d, etc.)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_risk_type', description: 'Risk type dimension (Credit, Market, Operational, Liquidity)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_operational_loss_category', description: 'Basel II operational loss event types', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_counterparty', description: 'Counterparty dimension for CCR', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_regulatory_regime', description: 'Regulatory regime dimension (US, EU, Basel)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_risk_appetite_limit', description: 'Risk appetite limit type dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_capital_component', description: 'Capital component dimension (CET1, AT1, Tier 2)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_asset_class', description: 'Asset class dimension for risk reporting', scdType: 'SCD_TYPE_1' }
  ],
  facts: [
    { name: 'gold.fact_credit_risk_exposure', description: 'Credit risk EAD, PD, LGD, EL, UL metrics', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_loan_portfolio_performance', description: 'Portfolio delinquency, NPLs, charge-offs', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_market_risk_metrics', description: 'VaR, SVaR, IRC, stressed VaR', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_operational_losses', description: 'Operational loss events and impacts', factType: 'TRANSACTION' },
    { name: 'gold.fact_liquidity_metrics', description: 'LCR, NSFR, liquidity gaps', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_capital_adequacy', description: 'Capital ratios, RWA, capital buffers', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_stress_test_results', description: 'CCAR/DFAST stress test impacts', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_concentration_risk', description: 'Concentration by industry, geography, borrower', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_counterparty_credit_risk', description: 'CVA, DVA, FVA, PFE metrics', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_loan_loss_reserves', description: 'ALLL, CECL reserves by segment', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_risk_appetite_utilization', description: 'Risk appetite limits and breaches', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_model_performance', description: 'Model validation, backtesting results', factType: 'PERIODIC_SNAPSHOT' }
  ],
  totalDimensions: 16,
  totalFacts: 12
};

export default {
  riskCommercialBronzeLayer,
  riskCommercialSilverLayer,
  riskCommercialGoldLayer
};
