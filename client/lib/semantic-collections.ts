// COLLECTIONS & RECOVERY - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Collections Management, Recovery Rates, Delinquency Roll Rates, Contact Strategies

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

export const semanticCollectionsLayer = {
  domain: "collections",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Collections & Recovery - supporting delinquency management, recovery strategies, and contact optimization",

  measures: [
    // ========== DELINQUENCY PORTFOLIO METRICS ==========
    {
      name: "Total Delinquent Balance",
      technical_name: "total_delinquent_balance",
      aggregation: "SUM",
      format: "currency",
      description: "Total balance of delinquent accounts (30+ DPD)",
      sql: "SUM(fact_collections.outstanding_balance) WHERE fact_collections.days_past_due >= 30",
      folder: "Delinquency",
      type: "semi-additive",
    },
    {
      name: "Delinquent Account Count",
      technical_name: "delinquent_account_count",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Number of accounts in collections (30+ DPD)",
      sql: "COUNT(DISTINCT fact_collections.account_sk) WHERE fact_collections.days_past_due >= 30",
      folder: "Delinquency",
    },
    {
      name: "30-59 DPD Balance",
      technical_name: "dpd_30_59_balance",
      aggregation: "SUM",
      format: "currency",
      description: "Balance of accounts 30-59 days past due",
      sql: "SUM(fact_collections.outstanding_balance) WHERE fact_collections.days_past_due BETWEEN 30 AND 59",
      folder: "Delinquency",
      type: "semi-additive",
    },
    {
      name: "60-89 DPD Balance",
      technical_name: "dpd_60_89_balance",
      aggregation: "SUM",
      format: "currency",
      description: "Balance of accounts 60-89 days past due",
      sql: "SUM(fact_collections.outstanding_balance) WHERE fact_collections.days_past_due BETWEEN 60 AND 89",
      folder: "Delinquency",
      type: "semi-additive",
    },
    {
      name: "90+ DPD Balance",
      technical_name: "dpd_90_plus_balance",
      aggregation: "SUM",
      format: "currency",
      description: "Balance of accounts 90+ days past due",
      sql: "SUM(fact_collections.outstanding_balance) WHERE fact_collections.days_past_due >= 90",
      folder: "Delinquency",
      type: "semi-additive",
    },

    // ========== RECOVERY METRICS ==========
    {
      name: "Total Recovery Amount",
      technical_name: "total_recovery_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Total amount collected from delinquent accounts",
      sql: "SUM(fact_collections_activity.recovery_amount)",
      folder: "Recovery",
      type: "additive",
    },
    {
      name: "Recovery Rate",
      technical_name: "recovery_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Recovery amount as % of delinquent balance",
      sql: "(SUM(fact_collections_activity.recovery_amount) / NULLIF(SUM(fact_collections.outstanding_balance), 0)) * 100",
      folder: "Recovery",
      type: "non-additive",
    },
    {
      name: "Average Recovery per Account",
      technical_name: "avg_recovery_per_account",
      aggregation: "AVG",
      format: "currency",
      description: "Average recovery amount per delinquent account",
      sql: "AVG(fact_collections_activity.recovery_amount)",
      folder: "Recovery",
    },
    {
      name: "Cure Rate",
      technical_name: "cure_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description:
        "Accounts returned to current status as % of delinquent accounts",
      sql: "(COUNT(DISTINCT CASE WHEN fact_collections.cure_flag = TRUE THEN account_sk END) / NULLIF(COUNT(DISTINCT account_sk), 0)) * 100",
      folder: "Recovery",
      type: "non-additive",
    },

    // ========== CONTACT & ACTIVITY METRICS ==========
    {
      name: "Total Contact Attempts",
      technical_name: "total_contact_attempts",
      aggregation: "COUNT",
      format: "integer",
      description: "Total number of contact attempts made",
      sql: "COUNT(fact_collections_contacts.contact_sk)",
      folder: "Contact Activity",
    },
    {
      name: "Successful Contacts",
      technical_name: "successful_contacts",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of successful contacts (right party contact)",
      sql: "COUNT(fact_collections_contacts.contact_sk) WHERE fact_collections_contacts.contact_outcome = 'RPC'",
      folder: "Contact Activity",
    },
    {
      name: "Contact Success Rate",
      technical_name: "contact_success_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Successful contacts as % of total attempts",
      sql: "(COUNT(CASE WHEN contact_outcome = 'RPC' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Contact Activity",
      type: "non-additive",
    },
    {
      name: "Promise to Pay Count",
      technical_name: "promise_to_pay_count",
      aggregation: "COUNT",
      format: "integer",
      description: "Number of payment promises made",
      sql: "COUNT(fact_collections_contacts.contact_sk) WHERE fact_collections_contacts.promise_to_pay_flag = TRUE",
      folder: "Contact Activity",
    },
    {
      name: "Promise Keep Rate",
      technical_name: "promise_keep_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Promises kept as % of total promises",
      sql: "(COUNT(CASE WHEN promise_kept_flag = TRUE THEN 1 END) / NULLIF(COUNT(CASE WHEN promise_to_pay_flag = TRUE THEN 1 END), 0)) * 100",
      folder: "Contact Activity",
      type: "non-additive",
    },

    // ========== ROLL RATE METRICS ==========
    {
      name: "Roll Forward Rate",
      technical_name: "roll_forward_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description:
        "Accounts rolling to next delinquency bucket as % of current bucket",
      sql: "(COUNT(CASE WHEN fact_collections.bucket_movement = 'FORWARD' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Roll Rates",
      type: "non-additive",
    },
    {
      name: "Roll Backward Rate",
      technical_name: "roll_backward_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description:
        "Accounts improving to previous bucket as % of current bucket",
      sql: "(COUNT(CASE WHEN fact_collections.bucket_movement = 'BACKWARD' THEN 1 END) / NULLIF(COUNT(*), 0)) * 100",
      folder: "Roll Rates",
      type: "non-additive",
    },

    // ========== CHARGE-OFF METRICS ==========
    {
      name: "Charge-Off Amount",
      technical_name: "charge_off_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Total amount charged off",
      sql: "SUM(fact_collections.chargeoff_amount)",
      folder: "Charge-Offs",
      type: "additive",
    },
    {
      name: "Charge-Off Rate",
      technical_name: "charge_off_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Charge-offs as % of delinquent balance",
      sql: "(SUM(fact_collections.chargeoff_amount) / NULLIF(SUM(fact_collections.outstanding_balance), 0)) * 100",
      folder: "Charge-Offs",
      type: "non-additive",
    },
  ],

  attributes: [
    {
      name: "Delinquency Bucket",
      technical_name: "delinquency_bucket",
      field: "dim_delinquency_bucket.bucket_desc",
      description:
        "Delinquency aging bucket (Current, 30-59, 60-89, 90+, 120+)",
      datatype: "string",
      folder: "Delinquency",
    },
    {
      name: "Product Type",
      technical_name: "product_type",
      field: "dim_product.product_type",
      description: "Product type (Loan, Credit Card, Mortgage)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Collections Strategy",
      technical_name: "collections_strategy",
      field: "dim_collections_strategy.strategy_desc",
      description: "Collections treatment strategy",
      datatype: "string",
      folder: "Strategy",
    },
    {
      name: "Contact Channel",
      technical_name: "contact_channel",
      field: "dim_contact_channel.channel_desc",
      description: "Contact channel (Phone, SMS, Email, Letter)",
      datatype: "string",
      folder: "Contact",
    },
    {
      name: "Contact Outcome",
      technical_name: "contact_outcome",
      field: "fact_collections_contacts.contact_outcome",
      description: "Contact outcome (RPC, No Answer, Busy, Wrong Number, etc.)",
      datatype: "string",
      folder: "Contact",
    },
    {
      name: "Collector",
      technical_name: "collector",
      field: "dim_collector.collector_name",
      description: "Collections agent assigned",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Collections Queue",
      technical_name: "collections_queue",
      field: "dim_queue.queue_name",
      description: "Collections queue assignment",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Bankruptcy Flag",
      technical_name: "bankruptcy_flag",
      field: "fact_collections.bankruptcy_flag",
      description: "Whether account is in bankruptcy",
      datatype: "boolean",
      folder: "Status",
    },
  ],

  folders: [
    {
      name: "Delinquency",
      description: "Delinquent portfolio balances by aging bucket",
      measures: [
        "total_delinquent_balance",
        "delinquent_account_count",
        "dpd_30_59_balance",
        "dpd_60_89_balance",
        "dpd_90_plus_balance",
      ],
      icon: "📊",
    },
    {
      name: "Recovery",
      description: "Recovery amounts, rates, and cure performance",
      measures: [
        "total_recovery_amount",
        "recovery_rate",
        "avg_recovery_per_account",
        "cure_rate",
      ],
      icon: "💰",
    },
    {
      name: "Contact Activity",
      description: "Contact attempts, success rates, and promises",
      measures: [
        "total_contact_attempts",
        "successful_contacts",
        "contact_success_rate",
        "promise_to_pay_count",
        "promise_keep_rate",
      ],
      icon: "📞",
    },
    {
      name: "Roll Rates",
      description: "Delinquency bucket migration rates",
      measures: ["roll_forward_rate", "roll_backward_rate"],
      icon: "📈",
    },
    {
      name: "Charge-Offs",
      description: "Charge-off amounts and rates",
      measures: ["charge_off_amount", "charge_off_rate"],
      icon: "❌",
    },
  ],

  drillPaths: [
    {
      name: "Delinquency Hierarchy",
      levels: ["Delinquency Bucket", "Product Type", "Collections Strategy"],
      description: "Drill down by delinquency aging",
    },
    {
      name: "Contact Hierarchy",
      levels: ["Contact Channel", "Contact Outcome", "Collector"],
      description: "Drill down by contact activity",
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Type"],
      description: "Drill down by product",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week"],
      description: "Drill down by time period",
    },
  ],

  keyMetricSQL: {
    recoveryByStrategy: `
-- Recovery Performance by Collections Strategy
SELECT 
  cs.strategy_desc,
  COUNT(DISTINCT c.account_sk) as account_count,
  SUM(c.outstanding_balance) as total_balance,
  SUM(ca.recovery_amount) as total_recovery,
  (SUM(ca.recovery_amount) / NULLIF(SUM(c.outstanding_balance), 0)) * 100 as recovery_rate_pct,
  COUNT(DISTINCT CASE WHEN c.cure_flag = TRUE THEN c.account_sk END) as cured_accounts,
  (COUNT(DISTINCT CASE WHEN c.cure_flag = TRUE THEN c.account_sk END) / NULLIF(COUNT(DISTINCT c.account_sk), 0)) * 100 as cure_rate_pct
FROM gold.fact_collections c
JOIN gold.dim_collections_strategy cs ON c.strategy_sk = cs.strategy_sk
LEFT JOIN gold.fact_collections_activity ca ON c.account_sk = ca.account_sk
WHERE c.collection_date >= DATE_TRUNC('quarter', CURRENT_DATE())
GROUP BY cs.strategy_desc
ORDER BY recovery_rate_pct DESC;
`,

    rollRateAnalysis: `
-- Delinquency Roll Rate Matrix
SELECT 
  db_prior.bucket_desc as from_bucket,
  db_current.bucket_desc as to_bucket,
  COUNT(*) as account_count,
  SUM(c.outstanding_balance) as total_balance
FROM gold.fact_collections c
JOIN gold.dim_delinquency_bucket db_prior ON c.prior_bucket_sk = db_prior.bucket_sk
JOIN gold.dim_delinquency_bucket db_current ON c.current_bucket_sk = db_current.bucket_sk
WHERE c.collection_date = DATE_TRUNC('month', CURRENT_DATE())
GROUP BY db_prior.bucket_desc, db_current.bucket_desc
ORDER BY db_prior.bucket_order, db_current.bucket_order;
`,
  },
};

export default semanticCollectionsLayer;
