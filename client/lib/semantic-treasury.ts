// TREASURY & ALM - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Liquidity Management, Interest Rate Risk, Investment Portfolio, Gap Analysis, FTP

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

export const semanticTreasuryLayer = {
  domain: "treasury",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Treasury & ALM - supporting liquidity, interest rate risk, investments, and gap analysis",

  measures: [
    // ========== LIQUIDITY METRICS ==========
    {
      name: "Total Liquid Assets",
      technical_name: "total_liquid_assets",
      aggregation: "SUM",
      format: "currency",
      description: "Total liquid assets (cash + Level 1 & 2 HQLA)",
      sql: "SUM(fact_liquidity.total_liquid_assets)",
      folder: "Liquidity",
      type: "semi-additive",
    },
    {
      name: "HQLA Level 1",
      technical_name: "hqla_level_1",
      aggregation: "SUM",
      format: "currency",
      description:
        "High-Quality Liquid Assets - Level 1 (cash, reserves, sovereigns)",
      sql: "SUM(fact_liquidity.hqla_level1)",
      folder: "Liquidity",
      type: "semi-additive",
    },
    {
      name: "HQLA Level 2A",
      technical_name: "hqla_level_2a",
      aggregation: "SUM",
      format: "currency",
      description:
        "High-Quality Liquid Assets - Level 2A (GSE securities, covered bonds)",
      sql: "SUM(fact_liquidity.hqla_level2a)",
      folder: "Liquidity",
      type: "semi-additive",
    },
    {
      name: "HQLA Level 2B",
      technical_name: "hqla_level_2b",
      aggregation: "SUM",
      format: "currency",
      description:
        "High-Quality Liquid Assets - Level 2B (corporate bonds, equities)",
      sql: "SUM(fact_liquidity.hqla_level2b)",
      folder: "Liquidity",
      type: "semi-additive",
    },
    {
      name: "Liquidity Coverage Ratio (LCR)",
      technical_name: "liquidity_coverage_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "HQLA / Net Cash Outflows (30-day stress)",
      sql: "(SUM(fact_liquidity.total_hqla) / NULLIF(SUM(fact_liquidity.net_cash_outflow_30d), 0)) * 100",
      folder: "Liquidity",
      type: "non-additive",
    },
    {
      name: "Net Stable Funding Ratio (NSFR)",
      technical_name: "net_stable_funding_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Available Stable Funding / Required Stable Funding",
      sql: "(SUM(fact_liquidity.available_stable_funding) / NULLIF(SUM(fact_liquidity.required_stable_funding), 0)) * 100",
      folder: "Liquidity",
      type: "non-additive",
    },

    // ========== INTEREST RATE RISK METRICS ==========
    {
      name: "Net Interest Income (NII)",
      technical_name: "net_interest_income",
      aggregation: "SUM",
      format: "currency",
      description: "Net interest income (interest income - interest expense)",
      sql: "SUM(fact_alm.interest_income - fact_alm.interest_expense)",
      folder: "Interest Rate Risk",
      type: "additive",
    },
    {
      name: "NII at Risk (+200 bps)",
      technical_name: "nii_at_risk_200bp_up",
      aggregation: "SUM",
      format: "currency",
      description: "NII impact from +200 bps rate shock",
      sql: "SUM(fact_alm.nii_shock_200bp_up)",
      folder: "Interest Rate Risk",
      type: "semi-additive",
    },
    {
      name: "NII at Risk (-200 bps)",
      technical_name: "nii_at_risk_200bp_down",
      aggregation: "SUM",
      format: "currency",
      description: "NII impact from -200 bps rate shock",
      sql: "SUM(fact_alm.nii_shock_200bp_down)",
      folder: "Interest Rate Risk",
      type: "semi-additive",
    },
    {
      name: "Economic Value of Equity (EVE)",
      technical_name: "economic_value_equity",
      aggregation: "SUM",
      format: "currency",
      description: "Present value of assets minus liabilities",
      sql: "SUM(fact_alm.economic_value_equity)",
      folder: "Interest Rate Risk",
      type: "semi-additive",
    },
    {
      name: "EVE at Risk (+200 bps)",
      technical_name: "eve_at_risk_200bp",
      aggregation: "SUM",
      format: "currency",
      description: "EVE impact from +200 bps rate shock",
      sql: "SUM(fact_alm.eve_shock_200bp)",
      folder: "Interest Rate Risk",
      type: "semi-additive",
    },
    {
      name: "Duration Gap",
      technical_name: "duration_gap",
      aggregation: "AVG",
      format: "number",
      description: "Asset duration minus liability duration",
      sql: "AVG(fact_alm.asset_duration - fact_alm.liability_duration)",
      folder: "Interest Rate Risk",
    },

    // ========== INVESTMENT PORTFOLIO METRICS ==========
    {
      name: "Total Investment Portfolio",
      technical_name: "total_investment_portfolio",
      aggregation: "SUM",
      format: "currency",
      description: "Total market value of investment securities",
      sql: "SUM(fact_investments.market_value)",
      folder: "Investment Portfolio",
      type: "semi-additive",
    },
    {
      name: "Available-for-Sale (AFS) Securities",
      technical_name: "afs_securities",
      aggregation: "SUM",
      format: "currency",
      description: "Market value of AFS securities",
      sql: "SUM(fact_investments.market_value) WHERE dim_security.accounting_classification = 'AFS'",
      folder: "Investment Portfolio",
      type: "semi-additive",
    },
    {
      name: "Held-to-Maturity (HTM) Securities",
      technical_name: "htm_securities",
      aggregation: "SUM",
      format: "currency",
      description: "Amortized cost of HTM securities",
      sql: "SUM(fact_investments.amortized_cost) WHERE dim_security.accounting_classification = 'HTM'",
      folder: "Investment Portfolio",
      type: "semi-additive",
    },
    {
      name: "Unrealized Gains/Losses (AOCI)",
      technical_name: "unrealized_gains_losses",
      aggregation: "SUM",
      format: "currency",
      description:
        "Accumulated Other Comprehensive Income (unrealized gains/losses on AFS)",
      sql: "SUM(fact_investments.market_value - fact_investments.amortized_cost) WHERE dim_security.accounting_classification = 'AFS'",
      folder: "Investment Portfolio",
      type: "semi-additive",
    },
    {
      name: "Portfolio Yield",
      technical_name: "portfolio_yield",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Annualized yield on investment portfolio",
      sql: "(SUM(fact_investments.interest_income) * 12 / AVG(fact_investments.market_value)) * 100",
      folder: "Investment Portfolio",
      type: "non-additive",
    },

    // ========== GAP ANALYSIS METRICS ==========
    {
      name: "Cumulative Gap (1 Year)",
      technical_name: "cumulative_gap_1yr",
      aggregation: "SUM",
      format: "currency",
      description:
        "Rate-sensitive assets minus liabilities (cumulative 1 year)",
      sql: "SUM(fact_gap_analysis.rsa_1yr - fact_gap_analysis.rsl_1yr)",
      folder: "Gap Analysis",
      type: "semi-additive",
    },
    {
      name: "Gap Ratio (1 Year)",
      technical_name: "gap_ratio_1yr",
      aggregation: "CALCULATED",
      format: "percent",
      description: "RSA / RSL ratio (1 year horizon)",
      sql: "(SUM(fact_gap_analysis.rsa_1yr) / NULLIF(SUM(fact_gap_analysis.rsl_1yr), 0)) * 100",
      folder: "Gap Analysis",
      type: "non-additive",
    },
    {
      name: "Rate-Sensitive Assets (RSA)",
      technical_name: "rate_sensitive_assets",
      aggregation: "SUM",
      format: "currency",
      description: "Assets that reprice within time horizon",
      sql: "SUM(fact_gap_analysis.rate_sensitive_assets)",
      folder: "Gap Analysis",
      type: "semi-additive",
    },
    {
      name: "Rate-Sensitive Liabilities (RSL)",
      technical_name: "rate_sensitive_liabilities",
      aggregation: "SUM",
      format: "currency",
      description: "Liabilities that reprice within time horizon",
      sql: "SUM(fact_gap_analysis.rate_sensitive_liabilities)",
      folder: "Gap Analysis",
      type: "semi-additive",
    },

    // ========== FUNDS TRANSFER PRICING (FTP) METRICS ==========
    {
      name: "Total FTP Revenue",
      technical_name: "total_ftp_revenue",
      aggregation: "SUM",
      format: "currency",
      description: "Total funds transfer pricing revenue",
      sql: "SUM(fact_ftp.ftp_revenue)",
      folder: "FTP",
      type: "additive",
    },
    {
      name: "Average FTP Rate",
      technical_name: "avg_ftp_rate",
      aggregation: "AVG",
      format: "percent",
      description: "Average funds transfer pricing rate",
      sql: "AVG(fact_ftp.ftp_rate) * 100",
      folder: "FTP",
    },
    {
      name: "FTP Spread",
      technical_name: "ftp_spread",
      aggregation: "AVG",
      format: "percent",
      description: "Average spread between FTP rate and market rate",
      sql: "AVG(fact_ftp.ftp_rate - fact_ftp.market_rate) * 100",
      folder: "FTP",
    },
  ],

  attributes: [
    {
      name: "Security Type",
      technical_name: "security_type",
      field: "dim_security.security_type",
      description:
        "Security type (Treasury, Agency, MBS, Corporate, Municipal)",
      datatype: "string",
      folder: "Investment",
    },
    {
      name: "Accounting Classification",
      technical_name: "accounting_classification",
      field: "dim_security.accounting_classification",
      description: "Accounting treatment (AFS, HTM, Trading)",
      datatype: "string",
      folder: "Investment",
    },
    {
      name: "Credit Rating",
      technical_name: "credit_rating",
      field: "dim_security.credit_rating",
      description: "Credit rating (AAA, AA, A, BBB, etc.)",
      datatype: "string",
      folder: "Investment",
    },
    {
      name: "Maturity Bucket",
      technical_name: "maturity_bucket",
      field: "dim_maturity_bucket.bucket_desc",
      description: "Maturity time bucket (0-3M, 3-12M, 1-3Y, 3-5Y, 5Y+)",
      datatype: "string",
      folder: "Gap Analysis",
    },
    {
      name: "Repricing Bucket",
      technical_name: "repricing_bucket",
      field: "dim_repricing_bucket.bucket_desc",
      description: "Interest rate repricing time bucket",
      datatype: "string",
      folder: "Gap Analysis",
    },
    {
      name: "Product Category",
      technical_name: "product_category",
      field: "dim_product.product_category",
      description: "Product category (Loans, Deposits, Investments)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Business Line",
      technical_name: "business_line",
      field: "dim_business_line.business_line_desc",
      description: "Business line (Retail, Commercial, Treasury)",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Scenario",
      technical_name: "scenario",
      field: "dim_scenario.scenario_name",
      description: "Rate shock scenario (Base, +100bp, +200bp, -100bp, -200bp)",
      datatype: "string",
      folder: "Scenarios",
    },
  ],

  folders: [
    {
      name: "Liquidity",
      description: "HQLA, LCR, NSFR, and liquidity metrics",
      measures: [
        "total_liquid_assets",
        "hqla_level_1",
        "hqla_level_2a",
        "hqla_level_2b",
        "liquidity_coverage_ratio",
        "net_stable_funding_ratio",
      ],
      icon: "💧",
    },
    {
      name: "Interest Rate Risk",
      description: "NII at risk, EVE, duration gap, and rate sensitivity",
      measures: [
        "net_interest_income",
        "nii_at_risk_200bp_up",
        "nii_at_risk_200bp_down",
        "economic_value_equity",
        "eve_at_risk_200bp",
        "duration_gap",
      ],
      icon: "📊",
    },
    {
      name: "Investment Portfolio",
      description: "Securities portfolio value, classification, and yield",
      measures: [
        "total_investment_portfolio",
        "afs_securities",
        "htm_securities",
        "unrealized_gains_losses",
        "portfolio_yield",
      ],
      icon: "📈",
    },
    {
      name: "Gap Analysis",
      description: "Asset-liability gap and repricing analysis",
      measures: [
        "cumulative_gap_1yr",
        "gap_ratio_1yr",
        "rate_sensitive_assets",
        "rate_sensitive_liabilities",
      ],
      icon: "⚖️",
    },
    {
      name: "FTP",
      description: "Funds transfer pricing revenue and rates",
      measures: ["total_ftp_revenue", "avg_ftp_rate", "ftp_spread"],
      icon: "💱",
    },
  ],

  drillPaths: [
    {
      name: "Security Hierarchy",
      levels: ["Security Type", "Credit Rating", "Maturity Bucket"],
      description: "Drill down by security classification",
    },
    {
      name: "Gap Analysis Hierarchy",
      levels: ["Repricing Bucket", "Product Category", "Business Line"],
      description: "Drill down by repricing time buckets",
    },
    {
      name: "Scenario Analysis Hierarchy",
      levels: ["Scenario", "Product Category"],
      description: "Drill down by rate shock scenarios",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month"],
      description: "Drill down by time period",
    },
  ],

  keyMetricSQL: {
    lcrTrend: `
-- LCR Trend with Components
SELECT 
  DATE_TRUNC('month', l.reporting_date) as month,
  SUM(l.hqla_level1 + l.hqla_level2a + l.hqla_level2b) as total_hqla,
  SUM(l.net_cash_outflow_30d) as net_outflow,
  (SUM(l.hqla_level1 + l.hqla_level2a + l.hqla_level2b) / 
   NULLIF(SUM(l.net_cash_outflow_30d), 0)) * 100 as lcr_pct
FROM gold.fact_liquidity l
WHERE l.reporting_date >= DATE_TRUNC('month', CURRENT_DATE()) - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', l.reporting_date)
ORDER BY month DESC;
`,

    niiSensitivity: `
-- NII Sensitivity to Rate Shocks
SELECT 
  s.scenario_name,
  SUM(alm.net_interest_income) as base_nii,
  SUM(alm.nii_shock) as shocked_nii,
  SUM(alm.nii_shock - alm.net_interest_income) as nii_impact,
  ((SUM(alm.nii_shock - alm.net_interest_income) / 
    NULLIF(SUM(alm.net_interest_income), 0)) * 100) as impact_pct
FROM gold.fact_alm alm
JOIN gold.dim_scenario s ON alm.scenario_sk = s.scenario_sk
WHERE alm.reporting_date = CURRENT_DATE()
GROUP BY s.scenario_name
ORDER BY s.scenario_severity;
`,
  },
};

export default semanticTreasuryLayer;
