// COMPLIANCE & AML - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: AML/BSA, KYC, Sanctions Screening, SAR Filing, Customer Due Diligence, Regulatory Compliance

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

export const semanticComplianceLayer = {
  domain: "compliance",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Compliance & AML - supporting AML/BSA, sanctions, SAR filing, and regulatory compliance",

  measures: [
    // ========== AML ALERTS & CASES ==========
    {
      name: "Total AML Alerts",
      technical_name: "total_aml_alerts",
      aggregation: "COUNT",
      format: "integer",
      description: "Total anti-money laundering alerts generated",
      sql: "COUNT(fact_aml_alerts.alert_sk)",
      folder: "AML Alerts",
    },
    {
      name: "High-Risk AML Alerts",
      technical_name: "high_risk_aml_alerts",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of high-risk AML alerts",
      sql: "COUNT(fact_aml_alerts.alert_sk) WHERE fact_aml_alerts.risk_score >= 800",
      folder: "AML Alerts",
    },
    {
      name: "AML Cases Opened",
      technical_name: "aml_cases_opened",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of AML investigation cases opened",
      sql: "COUNT(fact_aml_cases.case_sk) WHERE fact_aml_cases.case_status = 'OPEN' OR fact_aml_cases.case_status = 'INVESTIGATING'",
      folder: "AML Alerts",
    },
    {
      name: "AML Alert Clearance Rate",
      technical_name: "aml_alert_clearance_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Cleared alerts as % of total alerts",
      sql: "(COUNT(CASE WHEN fact_aml_cases.case_status = 'CLEARED' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "AML Alerts",
      type: "non-additive",
    },
    {
      name: "Average Time to Clear Alert",
      technical_name: "avg_time_to_clear_alert",
      aggregation: "AVG",
      format: "number",
      description: "Average days to clear an AML alert",
      sql: "AVG(DATEDIFF(DAY, fact_aml_cases.case_open_date, fact_aml_cases.case_close_date))",
      folder: "AML Alerts",
    },

    // ========== SAR FILING METRICS ==========
    {
      name: "SARs Filed",
      technical_name: "sars_filed",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of Suspicious Activity Reports filed",
      sql: "COUNT(fact_sar_filings.sar_sk)",
      folder: "SAR Filing",
    },
    {
      name: "Total SAR Amount",
      technical_name: "total_sar_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Total dollar amount reported in SARs",
      sql: "SUM(fact_sar_filings.sar_amount)",
      folder: "SAR Filing",
      type: "additive",
    },
    {
      name: "Average SAR Amount",
      technical_name: "avg_sar_amount",
      aggregation: "AVG",
      format: "currency",
      description: "Average dollar amount per SAR filing",
      sql: "AVG(fact_sar_filings.sar_amount)",
      folder: "SAR Filing",
    },
    {
      name: "SAR Filing Timeliness Rate",
      technical_name: "sar_filing_timeliness_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "SARs filed within 30 days as % of total SARs",
      sql: "(COUNT(CASE WHEN DATEDIFF(DAY, discovery_date, filing_date) <= 30 THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "SAR Filing",
      type: "non-additive",
    },

    // ========== SANCTIONS SCREENING ==========
    {
      name: "Total Sanctions Screenings",
      technical_name: "total_sanctions_screenings",
      aggregation: "COUNT",
      format: "integer",
      description: "Total number of sanctions screening checks performed",
      sql: "COUNT(fact_sanctions_screening.screening_sk)",
      folder: "Sanctions",
    },
    {
      name: "Sanctions Hits",
      technical_name: "sanctions_hits",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of potential sanctions matches",
      sql: "COUNT(fact_sanctions_screening.screening_sk) WHERE fact_sanctions_screening.hit_flag = TRUE",
      folder: "Sanctions",
    },
    {
      name: "Sanctions Hit Rate",
      technical_name: "sanctions_hit_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Sanctions hits as % of total screenings",
      sql: "(COUNT(CASE WHEN hit_flag = TRUE THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Sanctions",
      type: "non-additive",
    },
    {
      name: "Confirmed Sanctions Matches",
      technical_name: "confirmed_sanctions_matches",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of confirmed sanctions matches (true positives)",
      sql: "COUNT(fact_sanctions_screening.screening_sk) WHERE fact_sanctions_screening.match_status = 'CONFIRMED'",
      folder: "Sanctions",
    },
    {
      name: "False Positive Rate (Sanctions)",
      technical_name: "false_positive_rate_sanctions",
      aggregation: "CALCULATED",
      format: "percent",
      description: "False positive sanctions hits as % of total hits",
      sql: "(COUNT(CASE WHEN match_status = 'FALSE_POSITIVE' THEN 1 END) / NULLIF(COUNT(CASE WHEN hit_flag = TRUE THEN 1 END), 0)) * 100",
      folder: "Sanctions",
      type: "non-additive",
    },

    // ========== KYC & CDD METRICS ==========
    {
      name: "KYC Reviews Completed",
      technical_name: "kyc_reviews_completed",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of Know Your Customer reviews completed",
      sql: "COUNT(fact_kyc_reviews.review_sk) WHERE fact_kyc_reviews.review_status = 'COMPLETED'",
      folder: "KYC & CDD",
    },
    {
      name: "Enhanced Due Diligence (EDD) Cases",
      technical_name: "edd_cases",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of Enhanced Due Diligence cases",
      sql: "COUNT(fact_cdd.cdd_sk) WHERE fact_cdd.due_diligence_level = 'ENHANCED'",
      folder: "KYC & CDD",
    },
    {
      name: "Average KYC Review Time",
      technical_name: "avg_kyc_review_time",
      aggregation: "AVG",
      format: "number",
      description: "Average days to complete KYC review",
      sql: "AVG(DATEDIFF(DAY, fact_kyc_reviews.review_start_date, fact_kyc_reviews.review_complete_date))",
      folder: "KYC & CDD",
    },
    {
      name: "KYC Refresh Due",
      technical_name: "kyc_refresh_due",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Number of customers with KYC refresh due",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) WHERE dim_customer.kyc_refresh_due_date <= CURRENT_DATE()",
      folder: "KYC & CDD",
    },

    // ========== CTR FILING METRICS ==========
    {
      name: "CTRs Filed",
      technical_name: "ctrs_filed",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of Currency Transaction Reports filed",
      sql: "COUNT(fact_ctr_filings.ctr_sk)",
      folder: "CTR Filing",
    },
    {
      name: "Total CTR Amount",
      technical_name: "total_ctr_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Total dollar amount reported in CTRs",
      sql: "SUM(fact_ctr_filings.ctr_amount)",
      folder: "CTR Filing",
      type: "additive",
    },

    // ========== REGULATORY EXAMS & ISSUES ==========
    {
      name: "Open Regulatory Issues",
      technical_name: "open_regulatory_issues",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of open regulatory exam findings",
      sql: "COUNT(fact_regulatory_issues.issue_sk) WHERE fact_regulatory_issues.issue_status = 'OPEN'",
      folder: "Regulatory Exams",
    },
    {
      name: "Average Days to Remediate",
      technical_name: "avg_days_to_remediate",
      aggregation: "AVG",
      format: "number",
      description: "Average days to remediate regulatory issues",
      sql: "AVG(DATEDIFF(DAY, fact_regulatory_issues.issue_date, fact_regulatory_issues.remediation_date))",
      folder: "Regulatory Exams",
    },
  ],

  attributes: [
    {
      name: "Alert Type",
      technical_name: "alert_type",
      field: "dim_alert_type.alert_type_desc",
      description:
        "AML alert type (Structuring, Smurfing, High Volume, Geographic Risk, etc.)",
      datatype: "string",
      folder: "AML",
    },
    {
      name: "Alert Scenario",
      technical_name: "alert_scenario",
      field: "dim_alert_scenario.scenario_desc",
      description: "Alert scenario/rule triggered",
      datatype: "string",
      folder: "AML",
    },
    {
      name: "Case Status",
      technical_name: "case_status",
      field: "fact_aml_cases.case_status",
      description:
        "Case status (Open, Investigating, Cleared, Escalated to SAR)",
      datatype: "string",
      folder: "AML",
    },
    {
      name: "SAR Category",
      technical_name: "sar_category",
      field: "dim_sar_category.category_desc",
      description: "SAR suspicious activity category",
      datatype: "string",
      folder: "SAR",
    },
    {
      name: "Sanctions List",
      technical_name: "sanctions_list",
      field: "dim_sanctions_list.list_name",
      description: "Sanctions list (OFAC SDN, UN, EU, UK, etc.)",
      datatype: "string",
      folder: "Sanctions",
    },
    {
      name: "Customer Risk Rating",
      technical_name: "customer_risk_rating",
      field: "dim_customer.risk_rating",
      description: "Customer AML risk rating (High, Medium, Low)",
      datatype: "string",
      folder: "KYC",
    },
    {
      name: "Due Diligence Level",
      technical_name: "due_diligence_level",
      field: "fact_cdd.due_diligence_level",
      description:
        "Customer due diligence level (Standard, Enhanced, Simplified)",
      datatype: "string",
      folder: "KYC",
    },
    {
      name: "Compliance Analyst",
      technical_name: "compliance_analyst",
      field: "dim_analyst.analyst_name",
      description: "Compliance analyst assigned to case",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Regulatory Agency",
      technical_name: "regulatory_agency",
      field: "dim_regulatory_agency.agency_name",
      description: "Regulatory agency (OCC, FDIC, Federal Reserve, FinCEN)",
      datatype: "string",
      folder: "Regulatory",
    },
    {
      name: "Geographic Risk",
      technical_name: "geographic_risk",
      field: "dim_geography.risk_level",
      description: "Geographic risk level (High Risk Country, etc.)",
      datatype: "string",
      folder: "Risk",
    },
  ],

  folders: [
    {
      name: "AML Alerts",
      description: "AML alert volume, cases, and clearance metrics",
      measures: [
        "total_aml_alerts",
        "high_risk_aml_alerts",
        "aml_cases_opened",
        "aml_alert_clearance_rate",
        "avg_time_to_clear_alert",
      ],
      icon: "🔍",
    },
    {
      name: "SAR Filing",
      description: "Suspicious Activity Report filing metrics",
      measures: [
        "sars_filed",
        "total_sar_amount",
        "avg_sar_amount",
        "sar_filing_timeliness_rate",
      ],
      icon: "📋",
    },
    {
      name: "Sanctions",
      description: "Sanctions screening hits and match confirmation",
      measures: [
        "total_sanctions_screenings",
        "sanctions_hits",
        "sanctions_hit_rate",
        "confirmed_sanctions_matches",
        "false_positive_rate_sanctions",
      ],
      icon: "🚫",
    },
    {
      name: "KYC & CDD",
      description: "Know Your Customer and Customer Due Diligence",
      measures: [
        "kyc_reviews_completed",
        "edd_cases",
        "avg_kyc_review_time",
        "kyc_refresh_due",
      ],
      icon: "🔐",
    },
    {
      name: "CTR Filing",
      description: "Currency Transaction Report filing",
      measures: ["ctrs_filed", "total_ctr_amount"],
      icon: "💵",
    },
    {
      name: "Regulatory Exams",
      description: "Regulatory exam findings and remediation",
      measures: ["open_regulatory_issues", "avg_days_to_remediate"],
      icon: "⚖️",
    },
  ],

  drillPaths: [
    {
      name: "AML Alert Hierarchy",
      levels: ["Alert Type", "Alert Scenario", "Case Status"],
      description: "Drill down by AML alert classification",
    },
    {
      name: "SAR Hierarchy",
      levels: ["SAR Category", "Customer Risk Rating"],
      description: "Drill down by SAR category",
    },
    {
      name: "Sanctions Hierarchy",
      levels: ["Sanctions List", "Geographic Risk"],
      description: "Drill down by sanctions screening",
    },
    {
      name: "Organization Hierarchy",
      levels: ["Compliance Analyst", "Regulatory Agency"],
      description: "Drill down by analyst and regulator",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week"],
      description: "Drill down by time period",
    },
  ],

  keyMetricSQL: {
    amlAlertTrendBySenario: `
-- AML Alert Volume and Clearance by Scenario
SELECT 
  sc.scenario_desc,
  COUNT(*) as total_alerts,
  COUNT(CASE WHEN c.case_status = 'CLEARED' THEN 1 END) as cleared,
  COUNT(CASE WHEN c.case_status = 'ESCALATED_TO_SAR' THEN 1 END) as escalated_to_sar,
  (COUNT(CASE WHEN c.case_status = 'CLEARED' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100 as clearance_rate_pct,
  AVG(DATEDIFF(DAY, c.case_open_date, c.case_close_date)) as avg_days_to_clear
FROM gold.fact_aml_alerts a
JOIN gold.dim_alert_scenario sc ON a.scenario_sk = sc.scenario_sk
LEFT JOIN gold.fact_aml_cases c ON a.alert_sk = c.alert_sk
WHERE a.alert_date >= DATE_TRUNC('quarter', CURRENT_DATE())
GROUP BY sc.scenario_desc
ORDER BY total_alerts DESC;
`,

    sarFilingAnalysis: `
-- SAR Filing Analysis by Category
SELECT 
  DATE_TRUNC('month', s.filing_date) as month,
  sc.category_desc,
  COUNT(*) as sar_count,
  SUM(s.sar_amount) as total_amount,
  AVG(s.sar_amount) as avg_amount,
  COUNT(CASE WHEN DATEDIFF(DAY, s.discovery_date, s.filing_date) <= 30 THEN 1 END) as filed_on_time,
  (COUNT(CASE WHEN DATEDIFF(DAY, s.discovery_date, s.filing_date) <= 30 THEN 1 END) / NULLIF(COUNT(*), 0)) * 100 as timeliness_pct
FROM gold.fact_sar_filings s
JOIN gold.dim_sar_category sc ON s.category_sk = sc.category_sk
WHERE s.filing_date >= DATE_TRUNC('year', CURRENT_DATE())
GROUP BY DATE_TRUNC('month', s.filing_date), sc.category_desc
ORDER BY month DESC, sar_count DESC;
`,
  },
};

export default semanticComplianceLayer;
