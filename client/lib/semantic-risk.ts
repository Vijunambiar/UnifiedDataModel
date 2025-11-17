// ENTERPRISE RISK MANAGEMENT - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Credit Risk, Market Risk, Liquidity Risk, Operational Risk, Capital Planning, CCAR/DFAST

export type SemanticMeasure = {
  name: string;
  technical_name: string;
  aggregation:
    | "SUM"
    | "AVG"
    | "COUNT"
    | "COUNT DISTINCT"
    | "MIN"
    | "MAX"
    | "CALCULATED";
  format: "currency" | "percent" | "number" | "integer" | "date" | "datetime";
  description: string;
  sql: string;
  folder: string;
  type?: "additive" | "semi-additive" | "non-additive";
  hidden?: boolean;
};

export type SemanticAttribute = {
  name: string;
  technical_name: string;
  field: string;
  description: string;
  datatype?: "string" | "number" | "date" | "boolean";
  folder?: string;
  hidden?: boolean;
};

export type SemanticFolder = {
  name: string;
  description: string;
  measures: string[];
  icon?: string;
};

export type SemanticDrillPath = {
  name: string;
  levels: string[];
  description: string;
};

export const semanticRiskLayer = {
  domain: "risk",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Enterprise Risk Management - supporting credit, market, liquidity, operational risk, and capital planning",

  measures: [
    // ========== CREDIT RISK METRICS ==========
    {
      name: "Total Credit Exposure",
      technical_name: "total_credit_exposure",
      aggregation: "SUM",
      format: "currency",
      description: "Total credit exposure across all lending products",
      sql: "SUM(fact_credit_risk.total_exposure)",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "Expected Credit Loss (ECL)",
      technical_name: "expected_credit_loss",
      aggregation: "SUM",
      format: "currency",
      description: "Total expected credit loss under CECL/IFRS 9",
      sql: "SUM(fact_credit_risk.expected_credit_loss)",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "Probability of Default (PD)",
      technical_name: "probability_of_default",
      aggregation: "AVG",
      format: "percent",
      description: "Average probability of default across portfolio",
      sql: "AVG(fact_credit_risk.probability_of_default) * 100",
      folder: "Credit Risk",
    },
    {
      name: "Loss Given Default (LGD)",
      technical_name: "loss_given_default",
      aggregation: "AVG",
      format: "percent",
      description: "Average loss given default (severity)",
      sql: "AVG(fact_credit_risk.loss_given_default) * 100",
      folder: "Credit Risk",
    },
    {
      name: "Exposure at Default (EAD)",
      technical_name: "exposure_at_default",
      aggregation: "SUM",
      format: "currency",
      description: "Total exposure at default",
      sql: "SUM(fact_credit_risk.exposure_at_default)",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "Non-Performing Loans",
      technical_name: "non_performing_loans",
      aggregation: "SUM",
      format: "currency",
      description: "Total non-performing loan balances (90+ DPD)",
      sql: "SUM(fact_credit_risk.non_performing_balance)",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "NPL Ratio",
      technical_name: "npl_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "NPL as % of total credit exposure",
      sql: "(SUM(fact_credit_risk.non_performing_balance) / NULLIF(SUM(fact_credit_risk.total_exposure), 0)) * 100",
      folder: "Credit Risk",
      type: "non-additive",
    },

    // ========== MARKET RISK METRICS ==========
    {
      name: "Value at Risk (VaR)",
      technical_name: "value_at_risk",
      aggregation: "SUM",
      format: "currency",
      description: "Total Value at Risk (99% confidence, 1-day horizon)",
      sql: "SUM(fact_market_risk.var_99_1day)",
      folder: "Market Risk",
      type: "semi-additive",
    },
    {
      name: "Expected Shortfall (ES)",
      technical_name: "expected_shortfall",
      aggregation: "SUM",
      format: "currency",
      description: "Expected Shortfall / Conditional VaR (99% confidence)",
      sql: "SUM(fact_market_risk.expected_shortfall_99)",
      folder: "Market Risk",
      type: "semi-additive",
    },
    {
      name: "Interest Rate Risk (Duration)",
      technical_name: "interest_rate_duration",
      aggregation: "AVG",
      format: "number",
      description: "Average portfolio duration (interest rate sensitivity)",
      sql: "AVG(fact_market_risk.portfolio_duration)",
      folder: "Market Risk",
    },
    {
      name: "Net Interest Income at Risk (NII@R)",
      technical_name: "nii_at_risk",
      aggregation: "SUM",
      format: "currency",
      description: "Net interest income at risk from rate shock (+/- 200 bps)",
      sql: "SUM(fact_market_risk.nii_at_risk_200bp)",
      folder: "Market Risk",
      type: "semi-additive",
    },
    {
      name: "Economic Value of Equity (EVE)",
      technical_name: "economic_value_equity",
      aggregation: "SUM",
      format: "currency",
      description: "Economic value of equity under rate shock",
      sql: "SUM(fact_market_risk.eve_shock_200bp)",
      folder: "Market Risk",
      type: "semi-additive",
    },

    // ========== LIQUIDITY RISK METRICS ==========
    {
      name: "Liquidity Coverage Ratio (LCR)",
      technical_name: "liquidity_coverage_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description:
        "High-quality liquid assets / net cash outflows (30-day stress)",
      sql: "(SUM(fact_liquidity_risk.hqla) / NULLIF(SUM(fact_liquidity_risk.net_cash_outflow_30d), 0)) * 100",
      folder: "Liquidity Risk",
      type: "non-additive",
    },
    {
      name: "Net Stable Funding Ratio (NSFR)",
      technical_name: "net_stable_funding_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Available stable funding / required stable funding",
      sql: "(SUM(fact_liquidity_risk.available_stable_funding) / NULLIF(SUM(fact_liquidity_risk.required_stable_funding), 0)) * 100",
      folder: "Liquidity Risk",
      type: "non-additive",
    },
    {
      name: "High-Quality Liquid Assets (HQLA)",
      technical_name: "high_quality_liquid_assets",
      aggregation: "SUM",
      format: "currency",
      description: "Total high-quality liquid assets (Level 1 + Level 2)",
      sql: "SUM(fact_liquidity_risk.hqla)",
      folder: "Liquidity Risk",
      type: "semi-additive",
    },
    {
      name: "Loan-to-Deposit Ratio",
      technical_name: "loan_to_deposit_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Total loans as % of total deposits",
      sql: "(SUM(fact_liquidity_risk.total_loans) / NULLIF(SUM(fact_liquidity_risk.total_deposits), 0)) * 100",
      folder: "Liquidity Risk",
      type: "non-additive",
    },

    // ========== OPERATIONAL RISK METRICS ==========
    {
      name: "Operational Loss Events",
      technical_name: "operational_loss_events",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of operational loss events",
      sql: "COUNT(fact_operational_risk.event_sk)",
      folder: "Operational Risk",
    },
    {
      name: "Total Operational Losses",
      technical_name: "total_operational_losses",
      aggregation: "SUM",
      format: "currency",
      description: "Total operational loss amount",
      sql: "SUM(fact_operational_risk.loss_amount)",
      folder: "Operational Risk",
      type: "additive",
    },
    {
      name: "Gross Operational Loss",
      technical_name: "gross_operational_loss",
      aggregation: "SUM",
      format: "currency",
      description: "Gross operational loss before recoveries",
      sql: "SUM(fact_operational_risk.gross_loss_amount)",
      folder: "Operational Risk",
      type: "additive",
    },
    {
      name: "Net Operational Loss",
      technical_name: "net_operational_loss",
      aggregation: "SUM",
      format: "currency",
      description: "Net operational loss after recoveries and insurance",
      sql: "SUM(fact_operational_risk.gross_loss_amount - fact_operational_risk.recovery_amount)",
      folder: "Operational Risk",
      type: "additive",
    },
    {
      name: "Recovery Rate",
      technical_name: "recovery_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Recoveries as % of gross losses",
      sql: "(SUM(fact_operational_risk.recovery_amount) / NULLIF(SUM(fact_operational_risk.gross_loss_amount), 0)) * 100",
      folder: "Operational Risk",
      type: "non-additive",
    },

    // ========== CAPITAL METRICS ==========
    {
      name: "Risk-Weighted Assets (RWA)",
      technical_name: "risk_weighted_assets",
      aggregation: "SUM",
      format: "currency",
      description: "Total risk-weighted assets under Basel III",
      sql: "SUM(fact_capital.risk_weighted_assets)",
      folder: "Capital & Ratios",
      type: "additive",
    },
    {
      name: "Common Equity Tier 1 (CET1) Capital",
      technical_name: "cet1_capital",
      aggregation: "SUM",
      format: "currency",
      description: "Total CET1 capital",
      sql: "SUM(fact_capital.cet1_capital)",
      folder: "Capital & Ratios",
      type: "semi-additive",
    },
    {
      name: "CET1 Ratio",
      technical_name: "cet1_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "CET1 capital as % of RWA",
      sql: "(SUM(fact_capital.cet1_capital) / NULLIF(SUM(fact_capital.risk_weighted_assets), 0)) * 100",
      folder: "Capital & Ratios",
      type: "non-additive",
    },
    {
      name: "Tier 1 Capital",
      technical_name: "tier1_capital",
      aggregation: "SUM",
      format: "currency",
      description: "Total Tier 1 capital (CET1 + AT1)",
      sql: "SUM(fact_capital.tier1_capital)",
      folder: "Capital & Ratios",
      type: "semi-additive",
    },
    {
      name: "Tier 1 Ratio",
      technical_name: "tier1_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Tier 1 capital as % of RWA",
      sql: "(SUM(fact_capital.tier1_capital) / NULLIF(SUM(fact_capital.risk_weighted_assets), 0)) * 100",
      folder: "Capital & Ratios",
      type: "non-additive",
    },
    {
      name: "Total Capital",
      technical_name: "total_capital",
      aggregation: "SUM",
      format: "currency",
      description: "Total regulatory capital (Tier 1 + Tier 2)",
      sql: "SUM(fact_capital.total_capital)",
      folder: "Capital & Ratios",
      type: "semi-additive",
    },
    {
      name: "Total Capital Ratio",
      technical_name: "total_capital_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Total capital as % of RWA",
      sql: "(SUM(fact_capital.total_capital) / NULLIF(SUM(fact_capital.risk_weighted_assets), 0)) * 100",
      folder: "Capital & Ratios",
      type: "non-additive",
    },
    {
      name: "Leverage Ratio",
      technical_name: "leverage_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Tier 1 capital as % of total exposures",
      sql: "(SUM(fact_capital.tier1_capital) / NULLIF(SUM(fact_capital.total_exposures), 0)) * 100",
      folder: "Capital & Ratios",
      type: "non-additive",
    },
  ],

  attributes: [
    {
      name: "Risk Type",
      technical_name: "risk_type",
      field: "dim_risk_type.risk_type_desc",
      description:
        "Risk type (Credit, Market, Liquidity, Operational, Strategic)",
      datatype: "string",
      folder: "Risk Classification",
    },
    {
      name: "Risk Category",
      technical_name: "risk_category",
      field: "dim_risk_category.category_desc",
      description: "Risk category within risk type",
      datatype: "string",
      folder: "Risk Classification",
    },
    {
      name: "Risk Rating",
      technical_name: "risk_rating",
      field: "dim_risk_rating.rating_desc",
      description:
        "Risk rating (Pass, Special Mention, Substandard, Doubtful, Loss)",
      datatype: "string",
      folder: "Credit Risk",
    },
    {
      name: "Industry Sector",
      technical_name: "industry_sector",
      field: "dim_industry.sector_name",
      description: "Industry sector for concentration risk",
      datatype: "string",
      folder: "Credit Risk",
    },
    {
      name: "Geography",
      technical_name: "geography",
      field: "dim_geography.region_name",
      description: "Geographic region for concentration risk",
      datatype: "string",
      folder: "Credit Risk",
    },
    {
      name: "Product Type",
      technical_name: "product_type",
      field: "dim_product.product_type",
      description:
        "Financial product type (Loans, Deposits, Investments, Derivatives)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Basel Asset Class",
      technical_name: "basel_asset_class",
      field: "dim_basel_asset_class.asset_class_desc",
      description:
        "Basel III asset class (Sovereigns, Banks, Corporates, Retail)",
      datatype: "string",
      folder: "Regulatory",
    },
    {
      name: "Stress Scenario",
      technical_name: "stress_scenario",
      field: "dim_stress_scenario.scenario_name",
      description: "Stress test scenario (Baseline, Adverse, Severely Adverse)",
      datatype: "string",
      folder: "Stress Testing",
    },
    {
      name: "Loss Event Type",
      technical_name: "loss_event_type",
      field: "dim_loss_event_type.event_type_desc",
      description:
        "Operational loss event type (Fraud, Systems, Processing, etc.)",
      datatype: "string",
      folder: "Operational Risk",
    },
    {
      name: "Business Line",
      technical_name: "business_line",
      field: "dim_business_line.business_line_desc",
      description: "Business line (Retail, Commercial, Treasury, Wealth)",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Legal Entity",
      technical_name: "legal_entity",
      field: "dim_legal_entity.entity_name",
      description: "Legal entity (parent bank, subsidiaries)",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Regulatory Reporting Period",
      technical_name: "regulatory_period",
      field: "dim_date.quarter",
      description: "Regulatory reporting period (e.g., Q1 2024)",
      datatype: "string",
      folder: "Time",
    },
    {
      name: "CCAR/DFAST Scenario",
      technical_name: "ccar_scenario",
      field: "dim_ccar_scenario.scenario_name",
      description: "CCAR/DFAST scenario name",
      datatype: "string",
      folder: "Stress Testing",
    },
  ],

  folders: [
    {
      name: "Credit Risk",
      description: "Credit exposure, ECL, PD, LGD, EAD, and NPL metrics",
      measures: [
        "total_credit_exposure",
        "expected_credit_loss",
        "probability_of_default",
        "loss_given_default",
        "exposure_at_default",
        "non_performing_loans",
        "npl_ratio",
      ],
      icon: "📊",
    },
    {
      name: "Market Risk",
      description:
        "VaR, Expected Shortfall, interest rate risk, and market sensitivities",
      measures: [
        "value_at_risk",
        "expected_shortfall",
        "interest_rate_duration",
        "nii_at_risk",
        "economic_value_equity",
      ],
      icon: "📈",
    },
    {
      name: "Liquidity Risk",
      description: "LCR, NSFR, HQLA, and funding ratios",
      measures: [
        "liquidity_coverage_ratio",
        "net_stable_funding_ratio",
        "high_quality_liquid_assets",
        "loan_to_deposit_ratio",
      ],
      icon: "💧",
    },
    {
      name: "Operational Risk",
      description: "Operational loss events, amounts, and recovery rates",
      measures: [
        "operational_loss_events",
        "total_operational_losses",
        "gross_operational_loss",
        "net_operational_loss",
        "recovery_rate",
      ],
      icon: "⚙️",
    },
    {
      name: "Capital & Ratios",
      description: "RWA, CET1, Tier 1, Total Capital, and regulatory ratios",
      measures: [
        "risk_weighted_assets",
        "cet1_capital",
        "cet1_ratio",
        "tier1_capital",
        "tier1_ratio",
        "total_capital",
        "total_capital_ratio",
        "leverage_ratio",
      ],
      icon: "🏦",
    },
  ],

  drillPaths: [
    {
      name: "Risk Hierarchy",
      levels: ["Risk Type", "Risk Category", "Risk Subcategory"],
      description: "Drill down by risk classification",
    },
    {
      name: "Credit Risk Hierarchy",
      levels: ["Basel Asset Class", "Industry Sector", "Risk Rating"],
      description: "Drill down by credit risk segmentation",
    },
    {
      name: "Organizational Hierarchy",
      levels: ["Legal Entity", "Business Line", "Geography"],
      description: "Drill down by organization structure",
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Type", "Product"],
      description: "Drill down by product",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month"],
      description: "Drill down by regulatory reporting period",
    },
  ],

  // Key metric SQL for complex calculations and executive dashboards
  keyMetricSQL: {
    cet1RatioTrend: `
-- CET1 Ratio Trend
-- Quarterly CET1 ratio with components
SELECT 
  d.year_quarter,
  SUM(cap.cet1_capital) as cet1_capital,
  SUM(cap.risk_weighted_assets) as rwa,
  (SUM(cap.cet1_capital) / NULLIF(SUM(cap.risk_weighted_assets), 0)) * 100 as cet1_ratio_pct,
  SUM(cap.cet1_capital) - LAG(SUM(cap.cet1_capital)) OVER (ORDER BY d.year_quarter) as cet1_change_qoq,
  SUM(cap.risk_weighted_assets) - LAG(SUM(cap.risk_weighted_assets)) OVER (ORDER BY d.year_quarter) as rwa_change_qoq
FROM gold.fact_capital cap
JOIN gold.dim_date d ON cap.date_sk = d.date_sk
WHERE d.is_month_end = TRUE
GROUP BY d.year_quarter
ORDER BY d.year_quarter DESC;
`,

    creditRiskConcentration: `
-- Credit Risk Concentration by Industry
-- Top 10 industry exposures with risk metrics
SELECT 
  ind.sector_name,
  ind.industry_name,
  SUM(cr.total_exposure) as total_exposure,
  SUM(cr.expected_credit_loss) as total_ecl,
  (SUM(cr.expected_credit_loss) / NULLIF(SUM(cr.total_exposure), 0)) * 100 as ecl_rate_pct,
  AVG(cr.probability_of_default) * 100 as avg_pd_pct,
  AVG(cr.loss_given_default) * 100 as avg_lgd_pct,
  (SUM(cr.total_exposure) / SUM(SUM(cr.total_exposure)) OVER ()) * 100 as concentration_pct
FROM gold.fact_credit_risk cr
JOIN gold.dim_industry ind ON cr.industry_sk = ind.industry_sk
WHERE cr.reporting_date = CURRENT_DATE()
GROUP BY ind.sector_name, ind.industry_name
ORDER BY total_exposure DESC
LIMIT 10;
`,

    liquidityStressTest: `
-- Liquidity Stress Test Results
-- LCR and NSFR under different scenarios
SELECT 
  ss.scenario_name,
  SUM(liq.hqla) as hqla,
  SUM(liq.net_cash_outflow_30d) as net_outflow_30d,
  (SUM(liq.hqla) / NULLIF(SUM(liq.net_cash_outflow_30d), 0)) * 100 as lcr_pct,
  SUM(liq.available_stable_funding) as available_stable_funding,
  SUM(liq.required_stable_funding) as required_stable_funding,
  (SUM(liq.available_stable_funding) / NULLIF(SUM(liq.required_stable_funding), 0)) * 100 as nsfr_pct
FROM gold.fact_liquidity_risk liq
JOIN gold.dim_stress_scenario ss ON liq.scenario_sk = ss.scenario_sk
WHERE liq.reporting_date = CURRENT_DATE()
GROUP BY ss.scenario_name
ORDER BY ss.scenario_severity;
`,

    operationalLossByType: `
-- Operational Loss by Event Type
-- Operational losses segmented by Basel event type
SELECT 
  let.event_type_desc,
  COUNT(DISTINCT opr.event_sk) as event_count,
  SUM(opr.gross_loss_amount) as gross_loss,
  SUM(opr.recovery_amount) as recoveries,
  SUM(opr.gross_loss_amount - opr.recovery_amount) as net_loss,
  (SUM(opr.recovery_amount) / NULLIF(SUM(opr.gross_loss_amount), 0)) * 100 as recovery_rate_pct,
  AVG(opr.gross_loss_amount) as avg_loss_per_event
FROM gold.fact_operational_risk opr
JOIN gold.dim_loss_event_type let ON opr.event_type_sk = let.event_type_sk
WHERE opr.event_date >= DATE_TRUNC('year', CURRENT_DATE())
GROUP BY let.event_type_desc
ORDER BY net_loss DESC;
`,
  },
};

// Export for use in BI tools, data catalogs, and reporting frameworks
export default semanticRiskLayer;
