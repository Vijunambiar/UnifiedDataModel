// MORTGAGE BANKING - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Origination, Servicing, Secondary Marketing, MSR, Gain-on-Sale, Compliance

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

export const semanticMortgagesLayer = {
  domain: "mortgages",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Mortgage Banking - supporting origination, servicing, secondary marketing, and compliance",

  measures: [
    // ========== ORIGINATION METRICS ==========
    {
      name: "Mortgage Origination Volume",
      technical_name: "mortgage_origination_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total funded mortgage loan amount",
      sql: "SUM(fact_mortgage_originations.funded_amount)",
      folder: "Origination",
      type: "additive",
    },
    {
      name: "Origination Count",
      technical_name: "origination_count",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of mortgages originated",
      sql: "COUNT(fact_mortgage_originations.mortgage_sk)",
      folder: "Origination",
    },
    {
      name: "Application Volume",
      technical_name: "application_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total mortgage application amount",
      sql: "SUM(fact_mortgage_pipeline.application_amount)",
      folder: "Origination",
      type: "additive",
    },
    {
      name: "Pull-Through Rate",
      technical_name: "pull_through_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Funded loans as % of applications",
      sql: "(COUNT(CASE WHEN status = 'FUNDED' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Origination",
      type: "non-additive",
    },
    {
      name: "Average FICO Score",
      technical_name: "avg_fico_score",
      aggregation: "AVG",
      format: "integer",
      description: "Average borrower FICO score at origination",
      sql: "AVG(fact_mortgage_originations.fico_score)",
      folder: "Origination",
    },
    {
      name: "Average LTV",
      technical_name: "avg_ltv",
      aggregation: "AVG",
      format: "percent",
      description: "Average loan-to-value ratio",
      sql: "AVG(fact_mortgage_originations.ltv)",
      folder: "Origination",
    },
    {
      name: "Average DTI",
      technical_name: "avg_dti",
      aggregation: "AVG",
      format: "percent",
      description: "Average debt-to-income ratio",
      sql: "AVG(fact_mortgage_originations.dti)",
      folder: "Origination",
    },

    // ========== SERVICING PORTFOLIO METRICS ==========
    {
      name: "Total Servicing Portfolio",
      technical_name: "total_servicing_portfolio",
      aggregation: "SUM",
      format: "currency",
      description: "Total UPB of loans serviced",
      sql: "SUM(fact_mortgage_servicing.unpaid_principal_balance)",
      folder: "Servicing",
      type: "semi-additive",
    },
    {
      name: "Servicing Loan Count",
      technical_name: "servicing_loan_count",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Number of loans in servicing portfolio",
      sql: "COUNT(DISTINCT fact_mortgage_servicing.mortgage_sk)",
      folder: "Servicing",
    },
    {
      name: "Delinquency Rate (30+ DPD)",
      technical_name: "delinquency_rate_30",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Mortgages 30+ days past due as % of portfolio",
      sql: "(SUM(CASE WHEN days_past_due >= 30 THEN unpaid_principal_balance ELSE 0 END) / NULLIF(SUM(unpaid_principal_balance), 0)) * 100",
      folder: "Servicing",
      type: "non-additive",
    },
    {
      name: "Foreclosure Inventory",
      technical_name: "foreclosure_inventory",
      aggregation: "SUM",
      format: "currency",
      description: "UPB of loans in foreclosure process",
      sql: "SUM(fact_mortgage_servicing.unpaid_principal_balance) WHERE dim_loan_status.status_code = 'FORECLOSURE'",
      folder: "Servicing",
      type: "semi-additive",
    },
    {
      name: "Modification Count",
      technical_name: "modification_count",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of loan modifications completed",
      sql: "COUNT(fact_mortgage_modifications.modification_sk)",
      folder: "Servicing",
    },

    // ========== SECONDARY MARKETING METRICS ==========
    {
      name: "Loans Sold Volume",
      technical_name: "loans_sold_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total UPB of loans sold to investors",
      sql: "SUM(fact_secondary_marketing.sold_amount)",
      folder: "Secondary Marketing",
      type: "additive",
    },
    {
      name: "Gain-on-Sale",
      technical_name: "gain_on_sale",
      aggregation: "SUM",
      format: "currency",
      description: "Total gain on sale of mortgage loans",
      sql: "SUM(fact_secondary_marketing.gain_on_sale)",
      folder: "Secondary Marketing",
      type: "additive",
    },
    {
      name: "Gain-on-Sale Margin",
      technical_name: "gain_on_sale_margin",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Gain on sale as % of loans sold",
      sql: "(SUM(fact_secondary_marketing.gain_on_sale) / NULLIF(SUM(fact_secondary_marketing.sold_amount), 0)) * 100",
      folder: "Secondary Marketing",
      type: "non-additive",
    },
    {
      name: "Investor Premium",
      technical_name: "investor_premium",
      aggregation: "AVG",
      format: "percent",
      description: "Average premium paid by investors",
      sql: "AVG(fact_secondary_marketing.investor_premium) * 100",
      folder: "Secondary Marketing",
    },

    // ========== MSR (MORTGAGE SERVICING RIGHTS) METRICS ==========
    {
      name: "MSR Asset Value",
      technical_name: "msr_asset_value",
      aggregation: "SUM",
      format: "currency",
      description: "Fair value of mortgage servicing rights asset",
      sql: "SUM(fact_msr.fair_value)",
      folder: "MSR",
      type: "semi-additive",
    },
    {
      name: "Servicing Fee Income",
      technical_name: "servicing_fee_income",
      aggregation: "SUM",
      format: "currency",
      description: "Total servicing fees collected",
      sql: "SUM(fact_mortgage_servicing.servicing_fee_income)",
      folder: "MSR",
      type: "additive",
    },
    {
      name: "Average Servicing Fee Rate",
      technical_name: "avg_servicing_fee_rate",
      aggregation: "AVG",
      format: "percent",
      description: "Average servicing fee rate (bps)",
      sql: "AVG(fact_mortgage_servicing.servicing_fee_rate) * 100",
      folder: "MSR",
    },
    {
      name: "MSR Runoff Rate",
      technical_name: "msr_runoff_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Portfolio runoff rate (prepayments + payoffs)",
      sql: "(SUM(fact_msr.prepayments + fact_msr.payoffs) / NULLIF(AVG(fact_msr.beginning_upb), 0)) * 100",
      folder: "MSR",
      type: "non-additive",
    },

    // ========== PROFITABILITY METRICS ==========
    {
      name: "Total Mortgage Revenue",
      technical_name: "total_mortgage_revenue",
      aggregation: "SUM",
      format: "currency",
      description: "Total revenue (interest + fees + gain-on-sale)",
      sql: "SUM(fact_mortgage_profitability.interest_income + fact_mortgage_profitability.fee_income + fact_secondary_marketing.gain_on_sale)",
      folder: "Profitability",
      type: "additive",
    },
    {
      name: "Net Interest Margin (NIM)",
      technical_name: "net_interest_margin",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Net interest income as % of average UPB",
      sql: "((SUM(interest_income) - SUM(interest_expense)) / NULLIF(AVG(unpaid_principal_balance), 0)) * 100",
      folder: "Profitability",
      type: "non-additive",
    },
    {
      name: "Cost to Originate",
      technical_name: "cost_to_originate",
      aggregation: "CALCULATED",
      format: "currency",
      description: "Average cost to originate per loan",
      sql: "SUM(fact_mortgage_originations.origination_cost) / NULLIF(COUNT(fact_mortgage_originations.mortgage_sk), 0)",
      folder: "Profitability",
      type: "non-additive",
    },
  ],

  attributes: [
    {
      name: "Loan Purpose",
      technical_name: "loan_purpose",
      field: "dim_loan_purpose.purpose_desc",
      description: "Loan purpose (Purchase, Refinance, Cash-Out Refi)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Loan Type",
      technical_name: "loan_type",
      field: "dim_loan_type.loan_type_desc",
      description: "Loan type (Conventional, FHA, VA, USDA)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Property Type",
      technical_name: "property_type",
      field: "dim_property_type.property_type_desc",
      description: "Property type (Single Family, Condo, Multi-Family, etc.)",
      datatype: "string",
      folder: "Property",
    },
    {
      name: "Occupancy Type",
      technical_name: "occupancy_type",
      field: "dim_occupancy.occupancy_desc",
      description: "Occupancy type (Owner-Occupied, Investment, Second Home)",
      datatype: "string",
      folder: "Property",
    },
    {
      name: "Investor",
      technical_name: "investor",
      field: "dim_investor.investor_name",
      description:
        "Investor name (Fannie Mae, Freddie Mac, Ginnie Mae, Private)",
      datatype: "string",
      folder: "Secondary Marketing",
    },
    {
      name: "Loan Status",
      technical_name: "loan_status",
      field: "dim_loan_status.status_desc",
      description: "Loan status (Active, Paid Off, Delinquent, Foreclosure)",
      datatype: "string",
      folder: "Status",
    },
    {
      name: "Geographic Region",
      technical_name: "geographic_region",
      field: "dim_geography.region_name",
      description: "Property location (MSA or state)",
      datatype: "string",
      folder: "Geography",
    },
    {
      name: "Origination Channel",
      technical_name: "origination_channel",
      field: "dim_channel.channel_name",
      description: "Origination channel (Retail, Broker, Correspondent)",
      datatype: "string",
      folder: "Origination",
    },
    {
      name: "Credit Score Band",
      technical_name: "credit_score_band",
      field: "dim_fico_band.band_desc",
      description: "FICO score range (< 620, 620-679, 680-739, 740+)",
      datatype: "string",
      folder: "Credit Quality",
    },
    {
      name: "LTV Band",
      technical_name: "ltv_band",
      field: "dim_ltv_band.band_desc",
      description: "Loan-to-value range (< 80%, 80-90%, 90-95%, 95%+)",
      datatype: "string",
      folder: "Credit Quality",
    },
  ],

  folders: [
    {
      name: "Origination",
      description: "Mortgage origination volume, count, and quality metrics",
      measures: [
        "mortgage_origination_volume",
        "origination_count",
        "application_volume",
        "pull_through_rate",
        "avg_fico_score",
        "avg_ltv",
        "avg_dti",
      ],
      icon: "📝",
    },
    {
      name: "Servicing",
      description: "Servicing portfolio, delinquency, and modifications",
      measures: [
        "total_servicing_portfolio",
        "servicing_loan_count",
        "delinquency_rate_30",
        "foreclosure_inventory",
        "modification_count",
      ],
      icon: "🏠",
    },
    {
      name: "Secondary Marketing",
      description: "Loan sales, gain-on-sale, and investor premiums",
      measures: [
        "loans_sold_volume",
        "gain_on_sale",
        "gain_on_sale_margin",
        "investor_premium",
      ],
      icon: "💼",
    },
    {
      name: "MSR",
      description: "Mortgage servicing rights asset and fee income",
      measures: [
        "msr_asset_value",
        "servicing_fee_income",
        "avg_servicing_fee_rate",
        "msr_runoff_rate",
      ],
      icon: "💰",
    },
    {
      name: "Profitability",
      description: "Revenue, NIM, and origination costs",
      measures: [
        "total_mortgage_revenue",
        "net_interest_margin",
        "cost_to_originate",
      ],
      icon: "💵",
    },
  ],

  drillPaths: [
    {
      name: "Product Hierarchy",
      levels: ["Loan Type", "Loan Purpose", "Property Type"],
      description: "Drill down by mortgage product",
    },
    {
      name: "Credit Quality Hierarchy",
      levels: ["Credit Score Band", "LTV Band"],
      description: "Drill down by credit risk",
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Region", "MSA", "State"],
      description: "Drill down by geography",
    },
    {
      name: "Channel Hierarchy",
      levels: ["Origination Channel", "Loan Officer"],
      description: "Drill down by origination channel",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month"],
      description: "Drill down by time period",
    },
  ],

  keyMetricSQL: {
    originationVolumeByPurpose: `
-- Origination Volume by Loan Purpose
SELECT 
  lp.purpose_desc,
  COUNT(DISTINCT mo.mortgage_sk) as loan_count,
  SUM(mo.funded_amount) as total_volume,
  AVG(mo.funded_amount) as avg_loan_size,
  AVG(mo.fico_score) as avg_fico,
  AVG(mo.ltv) as avg_ltv,
  AVG(mo.interest_rate) as avg_rate
FROM gold.fact_mortgage_originations mo
JOIN gold.dim_loan_purpose lp ON mo.purpose_sk = lp.purpose_sk
WHERE mo.origination_date >= DATE_TRUNC('quarter', CURRENT_DATE())
GROUP BY lp.purpose_desc
ORDER BY total_volume DESC;
`,

    gainOnSaleTrend: `
-- Gain-on-Sale Trend by Investor
SELECT 
  DATE_TRUNC('month', sm.sale_date) as month,
  inv.investor_name,
  SUM(sm.sold_amount) as sold_upb,
  SUM(sm.gain_on_sale) as total_gain,
  (SUM(sm.gain_on_sale) / NULLIF(SUM(sm.sold_amount), 0)) * 100 as margin_pct
FROM gold.fact_secondary_marketing sm
JOIN gold.dim_investor inv ON sm.investor_sk = inv.investor_sk
WHERE sm.sale_date >= DATE_TRUNC('year', CURRENT_DATE())
GROUP BY DATE_TRUNC('month', sm.sale_date), inv.investor_name
ORDER BY month DESC, total_gain DESC;
`,
  },
};

export default semanticMortgagesLayer;
