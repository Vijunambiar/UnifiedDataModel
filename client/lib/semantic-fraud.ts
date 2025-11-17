// FRAUD & SECURITY - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Fraud Detection, Transaction Monitoring, Identity Theft, Card Fraud, Account Takeover

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

export const semanticFraudLayer = {
  domain: "fraud",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Fraud & Security - supporting fraud detection, prevention, and loss management",

  measures: [
    // ========== FRAUD ALERTS & CASES ==========
    {
      name: "Total Fraud Alerts",
      technical_name: "total_fraud_alerts",
      aggregation: "COUNT",
      format: "integer",
      description: "Total number of fraud alerts generated",
      sql: "COUNT(fact_fraud_alerts.alert_sk)",
      folder: "Alerts & Cases",
    },
    {
      name: "High-Risk Alerts",
      technical_name: "high_risk_alerts",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of high-risk fraud alerts",
      sql: "COUNT(fact_fraud_alerts.alert_sk) WHERE fact_fraud_alerts.risk_score >= 800",
      folder: "Alerts & Cases",
    },
    {
      name: "Confirmed Fraud Cases",
      technical_name: "confirmed_fraud_cases",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of confirmed fraud cases",
      sql: "COUNT(fact_fraud_cases.case_sk) WHERE fact_fraud_cases.case_status = 'CONFIRMED_FRAUD'",
      folder: "Alerts & Cases",
    },
    {
      name: "False Positive Rate",
      technical_name: "false_positive_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "False positive alerts as % of total alerts",
      sql: "(COUNT(CASE WHEN fact_fraud_cases.case_status = 'FALSE_POSITIVE' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Alerts & Cases",
      type: "non-additive",
    },
    {
      name: "Average Time to Resolve",
      technical_name: "avg_time_to_resolve",
      aggregation: "AVG",
      format: "number",
      description: "Average hours to resolve fraud case",
      sql: "AVG(DATEDIFF(HOUR, fact_fraud_cases.case_open_date, fact_fraud_cases.case_close_date))",
      folder: "Alerts & Cases",
    },

    // ========== FRAUD LOSSES ==========
    {
      name: "Total Fraud Losses",
      technical_name: "total_fraud_losses",
      aggregation: "SUM",
      format: "currency",
      description: "Total fraud losses (confirmed fraud amount)",
      sql: "SUM(fact_fraud_cases.fraud_amount) WHERE fact_fraud_cases.case_status = 'CONFIRMED_FRAUD'",
      folder: "Fraud Losses",
      type: "additive",
    },
    {
      name: "Gross Fraud Losses",
      technical_name: "gross_fraud_losses",
      aggregation: "SUM",
      format: "currency",
      description: "Gross fraud losses before recoveries",
      sql: "SUM(fact_fraud_losses.gross_loss_amount)",
      folder: "Fraud Losses",
      type: "additive",
    },
    {
      name: "Fraud Recoveries",
      technical_name: "fraud_recoveries",
      aggregation: "SUM",
      format: "currency",
      description: "Amount recovered from fraud cases",
      sql: "SUM(fact_fraud_losses.recovery_amount)",
      folder: "Fraud Losses",
      type: "additive",
    },
    {
      name: "Net Fraud Losses",
      technical_name: "net_fraud_losses",
      aggregation: "SUM",
      format: "currency",
      description: "Net fraud losses after recoveries",
      sql: "SUM(fact_fraud_losses.gross_loss_amount - fact_fraud_losses.recovery_amount)",
      folder: "Fraud Losses",
      type: "additive",
    },
    {
      name: "Fraud Loss Rate",
      technical_name: "fraud_loss_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Fraud losses as % of transaction volume",
      sql: "(SUM(fact_fraud_losses.net_loss_amount) / NULLIF(SUM(fact_transactions.transaction_amount), 0)) * 10000",
      folder: "Fraud Losses",
      type: "non-additive",
    },

    // ========== TRANSACTION MONITORING ==========
    {
      name: "Total Transactions Monitored",
      technical_name: "total_transactions_monitored",
      aggregation: "COUNT",
      format: "integer",
      description: "Total transactions screened for fraud",
      sql: "COUNT(fact_fraud_scoring.transaction_sk)",
      folder: "Transaction Monitoring",
    },
    {
      name: "Transactions Blocked",
      technical_name: "transactions_blocked",
      aggregation: "COUNT",
      format: "integer",
      description: "Transactions blocked due to fraud suspicion",
      sql: "COUNT(fact_fraud_scoring.transaction_sk) WHERE fact_fraud_scoring.action = 'BLOCK'",
      folder: "Transaction Monitoring",
    },
    {
      name: "Block Rate",
      technical_name: "block_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Blocked transactions as % of total transactions",
      sql: "(COUNT(CASE WHEN action = 'BLOCK' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Transaction Monitoring",
      type: "non-additive",
    },
    {
      name: "Average Fraud Score",
      technical_name: "avg_fraud_score",
      aggregation: "AVG",
      format: "integer",
      description: "Average fraud risk score (0-1000)",
      sql: "AVG(fact_fraud_scoring.fraud_score)",
      folder: "Transaction Monitoring",
    },

    // ========== FRAUD TYPES ==========
    {
      name: "Card Fraud Cases",
      technical_name: "card_fraud_cases",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of credit/debit card fraud cases",
      sql: "COUNT(fact_fraud_cases.case_sk) WHERE dim_fraud_type.fraud_category = 'CARD_FRAUD'",
      folder: "Fraud Types",
    },
    {
      name: "Account Takeover Cases",
      technical_name: "account_takeover_cases",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of account takeover (ATO) cases",
      sql: "COUNT(fact_fraud_cases.case_sk) WHERE dim_fraud_type.fraud_category = 'ACCOUNT_TAKEOVER'",
      folder: "Fraud Types",
    },
    {
      name: "Identity Theft Cases",
      technical_name: "identity_theft_cases",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of identity theft cases",
      sql: "COUNT(fact_fraud_cases.case_sk) WHERE dim_fraud_type.fraud_category = 'IDENTITY_THEFT'",
      folder: "Fraud Types",
    },
    {
      name: "Check Fraud Cases",
      technical_name: "check_fraud_cases",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of check fraud cases",
      sql: "COUNT(fact_fraud_cases.case_sk) WHERE dim_fraud_type.fraud_category = 'CHECK_FRAUD'",
      folder: "Fraud Types",
    },

    // ========== PREVENTION METRICS ==========
    {
      name: "Fraud Prevented Amount",
      technical_name: "fraud_prevented_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Dollar value of fraud prevented (blocked transactions)",
      sql: "SUM(fact_fraud_scoring.transaction_amount) WHERE fact_fraud_scoring.action = 'BLOCK' AND fact_fraud_scoring.confirmed_fraud = TRUE",
      folder: "Prevention",
      type: "additive",
    },
    {
      name: "Prevention Rate",
      technical_name: "prevention_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Fraud prevented as % of total fraud attempted",
      sql: "(SUM(CASE WHEN action = 'BLOCK' AND confirmed_fraud = TRUE THEN transaction_amount END) / NULLIF(SUM(CASE WHEN confirmed_fraud = TRUE THEN transaction_amount END), 0)) * 100",
      folder: "Prevention",
      type: "non-additive",
    },
  ],

  attributes: [
    {
      name: "Fraud Type",
      technical_name: "fraud_type",
      field: "dim_fraud_type.fraud_type_desc",
      description:
        "Type of fraud (Card Fraud, ATO, Identity Theft, Check Fraud, etc.)",
      datatype: "string",
      folder: "Fraud Classification",
    },
    {
      name: "Fraud Category",
      technical_name: "fraud_category",
      field: "dim_fraud_type.fraud_category",
      description: "High-level fraud category",
      datatype: "string",
      folder: "Fraud Classification",
    },
    {
      name: "Detection Method",
      technical_name: "detection_method",
      field: "dim_detection_method.method_desc",
      description:
        "How fraud was detected (Rules Engine, ML Model, Customer Report, etc.)",
      datatype: "string",
      folder: "Detection",
    },
    {
      name: "Alert Priority",
      technical_name: "alert_priority",
      field: "dim_alert_priority.priority_desc",
      description: "Alert priority (Critical, High, Medium, Low)",
      datatype: "string",
      folder: "Alerts",
    },
    {
      name: "Case Status",
      technical_name: "case_status",
      field: "fact_fraud_cases.case_status",
      description:
        "Fraud case status (Open, Investigating, Confirmed, False Positive, Closed)",
      datatype: "string",
      folder: "Cases",
    },
    {
      name: "Channel",
      technical_name: "channel",
      field: "dim_channel.channel_name",
      description: "Transaction channel (Online, Mobile, ATM, Branch, Card)",
      datatype: "string",
      folder: "Channel",
    },
    {
      name: "Device Type",
      technical_name: "device_type",
      field: "dim_device.device_type",
      description: "Device type (Desktop, Mobile, Tablet, etc.)",
      datatype: "string",
      folder: "Device Intelligence",
    },
    {
      name: "Device Risk Score",
      technical_name: "device_risk_score",
      field: "fact_fraud_scoring.device_risk_score",
      description: "Device risk score (0-1000)",
      datatype: "number",
      folder: "Device Intelligence",
    },
    {
      name: "Geographic Region",
      technical_name: "geographic_region",
      field: "dim_geography.region_name",
      description: "Transaction geography",
      datatype: "string",
      folder: "Geography",
    },
    {
      name: "Fraud Analyst",
      technical_name: "fraud_analyst",
      field: "dim_analyst.analyst_name",
      description: "Fraud analyst assigned to case",
      datatype: "string",
      folder: "Organization",
    },
  ],

  folders: [
    {
      name: "Alerts & Cases",
      description: "Fraud alerts, cases, and resolution metrics",
      measures: [
        "total_fraud_alerts",
        "high_risk_alerts",
        "confirmed_fraud_cases",
        "false_positive_rate",
        "avg_time_to_resolve",
      ],
      icon: "🚨",
    },
    {
      name: "Fraud Losses",
      description: "Fraud loss amounts, recoveries, and rates",
      measures: [
        "total_fraud_losses",
        "gross_fraud_losses",
        "fraud_recoveries",
        "net_fraud_losses",
        "fraud_loss_rate",
      ],
      icon: "💸",
    },
    {
      name: "Transaction Monitoring",
      description: "Transaction screening, blocking, and fraud scoring",
      measures: [
        "total_transactions_monitored",
        "transactions_blocked",
        "block_rate",
        "avg_fraud_score",
      ],
      icon: "🔍",
    },
    {
      name: "Fraud Types",
      description: "Fraud cases by type and category",
      measures: [
        "card_fraud_cases",
        "account_takeover_cases",
        "identity_theft_cases",
        "check_fraud_cases",
      ],
      icon: "🎭",
    },
    {
      name: "Prevention",
      description: "Fraud prevention effectiveness metrics",
      measures: ["fraud_prevented_amount", "prevention_rate"],
      icon: "🛡️",
    },
  ],

  drillPaths: [
    {
      name: "Fraud Type Hierarchy",
      levels: ["Fraud Category", "Fraud Type", "Detection Method"],
      description: "Drill down by fraud classification",
    },
    {
      name: "Channel Hierarchy",
      levels: ["Channel", "Device Type"],
      description: "Drill down by transaction channel",
    },
    {
      name: "Case Management Hierarchy",
      levels: ["Alert Priority", "Case Status", "Fraud Analyst"],
      description: "Drill down by case workflow",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Drill down by time for pattern analysis",
    },
  ],

  keyMetricSQL: {
    fraudTrendByType: `
-- Fraud Cases and Losses by Type
SELECT 
  ft.fraud_category,
  ft.fraud_type_desc,
  COUNT(DISTINCT fc.case_sk) as case_count,
  SUM(fc.fraud_amount) as total_loss,
  AVG(fc.fraud_amount) as avg_loss_per_case,
  (COUNT(DISTINCT CASE WHEN fc.case_status = 'FALSE_POSITIVE' THEN fc.case_sk END) / 
   NULLIF(COUNT(DISTINCT fc.case_sk), 0)) * 100 as false_positive_pct
FROM gold.fact_fraud_cases fc
JOIN gold.dim_fraud_type ft ON fc.fraud_type_sk = ft.fraud_type_sk
WHERE fc.case_open_date >= DATE_TRUNC('quarter', CURRENT_DATE())
GROUP BY ft.fraud_category, ft.fraud_type_desc
ORDER BY total_loss DESC;
`,

    fraudDetectionEffectiveness: `
-- Fraud Detection Effectiveness by Method
SELECT 
  dm.method_desc,
  COUNT(*) as total_alerts,
  COUNT(CASE WHEN fc.case_status = 'CONFIRMED_FRAUD' THEN 1 END) as true_positives,
  COUNT(CASE WHEN fc.case_status = 'FALSE_POSITIVE' THEN 1 END) as false_positives,
  (COUNT(CASE WHEN fc.case_status = 'CONFIRMED_FRAUD' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100 as precision_pct,
  AVG(fa.fraud_score) as avg_score
FROM gold.fact_fraud_alerts fa
JOIN gold.dim_detection_method dm ON fa.detection_method_sk = dm.detection_method_sk
LEFT JOIN gold.fact_fraud_cases fc ON fa.alert_sk = fc.alert_sk
WHERE fa.alert_date >= DATE_TRUNC('month', CURRENT_DATE())
GROUP BY dm.method_desc
ORDER BY precision_pct DESC;
`,
  },
};

export default semanticFraudLayer;
