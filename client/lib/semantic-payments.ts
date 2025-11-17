// PAYMENTS & TRANSFERS - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Payment Processing, ACH, Wire, Real-Time Payments, Cross-Border, Fee Income

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

export const semanticPaymentsLayer = {
  domain: "payments",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Payments & Transfers - supporting ACH, Wire, RTP, and cross-border payment analytics",

  measures: [
    // ========== VOLUME METRICS ==========
    {
      name: "Total Payment Volume",
      technical_name: "total_payment_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total dollar value of all payments processed",
      sql: "SUM(fact_payments.payment_amount)",
      folder: "Volume Metrics",
      type: "additive",
    },
    {
      name: "Total Payment Count",
      technical_name: "total_payment_count",
      aggregation: "COUNT",
      format: "integer",
      description: "Total number of payment transactions",
      sql: "COUNT(fact_payments.payment_sk)",
      folder: "Volume Metrics",
    },
    {
      name: "Average Payment Amount",
      technical_name: "avg_payment_amount",
      aggregation: "AVG",
      format: "currency",
      description: "Average payment transaction amount",
      sql: "AVG(fact_payments.payment_amount)",
      folder: "Volume Metrics",
    },
    {
      name: "ACH Volume",
      technical_name: "ach_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total ACH payment volume",
      sql: "SUM(fact_payments.payment_amount) WHERE dim_payment_type.payment_type = 'ACH'",
      folder: "Volume Metrics",
      type: "additive",
    },
    {
      name: "Wire Transfer Volume",
      technical_name: "wire_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total wire transfer volume (domestic + international)",
      sql: "SUM(fact_payments.payment_amount) WHERE dim_payment_type.payment_type = 'WIRE'",
      folder: "Volume Metrics",
      type: "additive",
    },
    {
      name: "RTP Volume",
      technical_name: "rtp_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Real-time payment volume (RTP/Zelle/Instant)",
      sql: "SUM(fact_payments.payment_amount) WHERE dim_payment_type.payment_type IN ('RTP', 'ZELLE', 'INSTANT')",
      folder: "Volume Metrics",
      type: "additive",
    },

    // ========== PROCESSING METRICS ==========
    {
      name: "Payment Success Rate",
      technical_name: "payment_success_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Successful payments as % of total payment attempts",
      sql: "(COUNT(CASE WHEN fact_payments.status = 'SUCCESS' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Processing Metrics",
      type: "non-additive",
    },
    {
      name: "Failed Payment Count",
      technical_name: "failed_payment_count",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of failed payment transactions",
      sql: "COUNT(fact_payments.payment_sk) WHERE fact_payments.status = 'FAILED'",
      folder: "Processing Metrics",
    },
    {
      name: "Failed Payment Amount",
      technical_name: "failed_payment_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Dollar value of failed payments",
      sql: "SUM(fact_payments.payment_amount) WHERE fact_payments.status = 'FAILED'",
      folder: "Processing Metrics",
      type: "additive",
    },
    {
      name: "Average Processing Time",
      technical_name: "avg_processing_time",
      aggregation: "AVG",
      format: "number",
      description: "Average payment processing time in seconds",
      sql: "AVG(fact_payments.processing_time_seconds)",
      folder: "Processing Metrics",
    },
    {
      name: "SLA Compliance Rate",
      technical_name: "sla_compliance_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Payments processed within SLA as % of total",
      sql: "(COUNT(CASE WHEN fact_payments.processing_time_seconds <= dim_payment_type.sla_seconds THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Processing Metrics",
      type: "non-additive",
    },

    // ========== FEE INCOME METRICS ==========
    {
      name: "Total Fee Income",
      technical_name: "total_fee_income",
      aggregation: "SUM",
      format: "currency",
      description: "Total fees collected from payment transactions",
      sql: "SUM(fact_payments.fee_amount)",
      folder: "Fee Income",
      type: "additive",
    },
    {
      name: "Wire Transfer Fees",
      technical_name: "wire_transfer_fees",
      aggregation: "SUM",
      format: "currency",
      description: "Fees from wire transfers",
      sql: "SUM(fact_payments.fee_amount) WHERE dim_payment_type.payment_type = 'WIRE'",
      folder: "Fee Income",
      type: "additive",
    },
    {
      name: "ACH Fees",
      technical_name: "ach_fees",
      aggregation: "SUM",
      format: "currency",
      description: "Fees from ACH transactions",
      sql: "SUM(fact_payments.fee_amount) WHERE dim_payment_type.payment_type = 'ACH'",
      folder: "Fee Income",
      type: "additive",
    },
    {
      name: "Average Fee per Transaction",
      technical_name: "avg_fee_per_transaction",
      aggregation: "AVG",
      format: "currency",
      description: "Average fee per payment transaction",
      sql: "AVG(fact_payments.fee_amount)",
      folder: "Fee Income",
    },
    {
      name: "Fee Yield",
      technical_name: "fee_yield",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Fee income as % of payment volume",
      sql: "(SUM(fact_payments.fee_amount) / NULLIF(SUM(fact_payments.payment_amount), 0)) * 100",
      folder: "Fee Income",
      type: "non-additive",
    },

    // ========== FRAUD & AML METRICS ==========
    {
      name: "Flagged Payments",
      technical_name: "flagged_payments",
      aggregation: "COUNT",
      format: "integer",
      description: "Payments flagged for fraud or AML review",
      sql: "COUNT(fact_payments.payment_sk) WHERE fact_payments.fraud_flag = TRUE OR fact_payments.aml_flag = TRUE",
      folder: "Fraud & AML",
    },
    {
      name: "Fraud Rate",
      technical_name: "fraud_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Flagged payments as % of total payments",
      sql: "(COUNT(CASE WHEN fact_payments.fraud_flag = TRUE THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Fraud & AML",
      type: "non-additive",
    },
    {
      name: "Blocked Payment Amount",
      technical_name: "blocked_payment_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Dollar value of payments blocked for fraud/AML",
      sql: "SUM(fact_payments.payment_amount) WHERE fact_payments.status = 'BLOCKED'",
      folder: "Fraud & AML",
      type: "additive",
    },

    // ========== CROSS-BORDER METRICS ==========
    {
      name: "Cross-Border Payment Volume",
      technical_name: "cross_border_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total cross-border/international payment volume",
      sql: "SUM(fact_payments.payment_amount) WHERE fact_payments.cross_border_flag = TRUE",
      folder: "Cross-Border",
      type: "additive",
    },
    {
      name: "FX Conversion Revenue",
      technical_name: "fx_conversion_revenue",
      aggregation: "SUM",
      format: "currency",
      description: "Revenue from foreign exchange conversions",
      sql: "SUM(fact_payments.fx_revenue)",
      folder: "Cross-Border",
      type: "additive",
    },
    {
      name: "SWIFT Payment Volume",
      technical_name: "swift_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Payment volume via SWIFT network",
      sql: "SUM(fact_payments.payment_amount) WHERE dim_payment_channel.channel_name = 'SWIFT'",
      folder: "Cross-Border",
      type: "additive",
    },
  ],

  attributes: [
    {
      name: "Payment Type",
      technical_name: "payment_type",
      field: "dim_payment_type.payment_type",
      description: "Payment type (ACH, Wire, RTP, Check, Card, etc.)",
      datatype: "string",
      folder: "Payment Classification",
    },
    {
      name: "Payment Direction",
      technical_name: "payment_direction",
      field: "fact_payments.payment_direction",
      description: "Payment direction (Inbound, Outbound)",
      datatype: "string",
      folder: "Payment Classification",
    },
    {
      name: "Payment Channel",
      technical_name: "payment_channel",
      field: "dim_payment_channel.channel_name",
      description: "Channel used for payment (Online, Mobile, Branch, API)",
      datatype: "string",
      folder: "Channel",
    },
    {
      name: "Payment Status",
      technical_name: "payment_status",
      field: "fact_payments.status",
      description: "Payment status (Success, Failed, Pending, Blocked)",
      datatype: "string",
      folder: "Status",
    },
    {
      name: "Originator",
      technical_name: "originator",
      field: "dim_originator.originator_name",
      description: "Payment originator (customer or entity)",
      datatype: "string",
      folder: "Parties",
    },
    {
      name: "Beneficiary",
      technical_name: "beneficiary",
      field: "dim_beneficiary.beneficiary_name",
      description: "Payment beneficiary (recipient)",
      datatype: "string",
      folder: "Parties",
    },
    {
      name: "Beneficiary Bank",
      technical_name: "beneficiary_bank",
      field: "dim_beneficiary_bank.bank_name",
      description: "Beneficiary's bank institution",
      datatype: "string",
      folder: "Parties",
    },
    {
      name: "Currency",
      technical_name: "currency",
      field: "dim_currency.currency_code",
      description: "Payment currency (USD, EUR, GBP, etc.)",
      datatype: "string",
      folder: "Cross-Border",
    },
    {
      name: "Country",
      technical_name: "country",
      field: "dim_country.country_name",
      description: "Beneficiary country for cross-border payments",
      datatype: "string",
      folder: "Cross-Border",
    },
    {
      name: "Failure Reason",
      technical_name: "failure_reason",
      field: "dim_failure_reason.reason_desc",
      description: "Reason for payment failure",
      datatype: "string",
      folder: "Status",
    },
    {
      name: "Business Line",
      technical_name: "business_line",
      field: "dim_business_line.business_line_desc",
      description: "Business line (Retail, Commercial, Treasury)",
      datatype: "string",
      folder: "Organization",
    },
  ],

  folders: [
    {
      name: "Volume Metrics",
      description: "Payment volume by type and channel",
      measures: [
        "total_payment_volume",
        "total_payment_count",
        "avg_payment_amount",
        "ach_volume",
        "wire_volume",
        "rtp_volume",
      ],
      icon: "💸",
    },
    {
      name: "Processing Metrics",
      description: "Success rates, failures, and processing times",
      measures: [
        "payment_success_rate",
        "failed_payment_count",
        "failed_payment_amount",
        "avg_processing_time",
        "sla_compliance_rate",
      ],
      icon: "⚙️",
    },
    {
      name: "Fee Income",
      description: "Fee income by payment type",
      measures: [
        "total_fee_income",
        "wire_transfer_fees",
        "ach_fees",
        "avg_fee_per_transaction",
        "fee_yield",
      ],
      icon: "💰",
    },
    {
      name: "Fraud & AML",
      description: "Fraud detection and AML screening metrics",
      measures: ["flagged_payments", "fraud_rate", "blocked_payment_amount"],
      icon: "🔒",
    },
    {
      name: "Cross-Border",
      description: "International and cross-border payment metrics",
      measures: [
        "cross_border_volume",
        "fx_conversion_revenue",
        "swift_volume",
      ],
      icon: "🌍",
    },
  ],

  drillPaths: [
    {
      name: "Payment Type Hierarchy",
      levels: ["Payment Type", "Payment Direction", "Payment Status"],
      description: "Drill down by payment classification",
    },
    {
      name: "Channel Hierarchy",
      levels: ["Payment Channel", "Business Line"],
      description: "Drill down by payment channel",
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Currency"],
      description: "Drill down by geography for cross-border payments",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Drill down by time for intraday analysis",
    },
  ],

  keyMetricSQL: {
    paymentVolumeByType: `
-- Payment Volume by Type and Direction
SELECT 
  pt.payment_type,
  p.payment_direction,
  COUNT(*) as transaction_count,
  SUM(p.payment_amount) as total_volume,
  AVG(p.payment_amount) as avg_amount,
  SUM(p.fee_amount) as total_fees
FROM gold.fact_payments p
JOIN gold.dim_payment_type pt ON p.payment_type_sk = pt.payment_type_sk
WHERE p.payment_date >= DATE_TRUNC('month', CURRENT_DATE())
GROUP BY pt.payment_type, p.payment_direction
ORDER BY total_volume DESC;
`,

    successRateTrend: `
-- Payment Success Rate Trend by Hour
SELECT 
  DATE_TRUNC('hour', p.payment_timestamp) as hour,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN p.status = 'SUCCESS' THEN 1 END) as successful,
  (COUNT(CASE WHEN p.status = 'SUCCESS' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100 as success_rate_pct,
  AVG(p.processing_time_seconds) as avg_processing_time
FROM gold.fact_payments p
WHERE p.payment_date = CURRENT_DATE()
GROUP BY DATE_TRUNC('hour', p.payment_timestamp)
ORDER BY hour;
`,
  },
};

export default semanticPaymentsLayer;
