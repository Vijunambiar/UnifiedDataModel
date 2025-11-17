// CREDIT CARDS - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Portfolio Management, Transaction Analysis, Credit Risk, Profitability, Rewards, Fraud

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

export const semanticCreditCardsLayer = {
  domain: "credit-cards",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Credit Cards domain - supporting portfolio management, transaction analysis, rewards, and profitability",

  measures: [
    // ========== PORTFOLIO BALANCE METRICS ==========
    {
      name: "Total Card Balances",
      technical_name: "total_card_balances",
      aggregation: "SUM",
      format: "currency",
      description: "Sum of all outstanding credit card balances",
      sql: "SUM(fact_card_positions.outstanding_balance)",
      folder: "Portfolio Metrics",
      type: "additive",
    },
    {
      name: "Total Credit Limits",
      technical_name: "total_credit_limits",
      aggregation: "SUM",
      format: "currency",
      description: "Total credit limits across all card accounts",
      sql: "SUM(fact_card_positions.credit_limit)",
      folder: "Portfolio Metrics",
      type: "semi-additive",
    },
    {
      name: "Total Available Credit",
      technical_name: "total_available_credit",
      aggregation: "SUM",
      format: "currency",
      description: "Total unused credit available (credit limit - balance)",
      sql: "SUM(fact_card_positions.available_credit)",
      folder: "Portfolio Metrics",
      type: "semi-additive",
    },
    {
      name: "Portfolio Utilization Rate",
      technical_name: "portfolio_utilization_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Outstanding balance as % of total credit limits",
      sql: "(SUM(fact_card_positions.outstanding_balance) / NULLIF(SUM(fact_card_positions.credit_limit), 0)) * 100",
      folder: "Portfolio Metrics",
      type: "non-additive",
    },
    {
      name: "Total Card Accounts",
      technical_name: "total_card_accounts",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Number of active credit card accounts",
      sql: "COUNT(DISTINCT fact_card_positions.card_account_sk) WHERE dim_card_account.account_status = 'ACTIVE'",
      folder: "Portfolio Metrics",
    },
    {
      name: "Average Balance per Account",
      technical_name: "avg_balance_per_account",
      aggregation: "AVG",
      format: "currency",
      description: "Average outstanding balance across all accounts",
      sql: "AVG(fact_card_positions.outstanding_balance)",
      folder: "Portfolio Metrics",
    },

    // ========== TRANSACTION VOLUME METRICS ==========
    {
      name: "Total Transaction Volume",
      technical_name: "total_transaction_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total dollar value of all card transactions",
      sql: "SUM(fact_card_transactions.transaction_amount)",
      folder: "Transaction Metrics",
      type: "additive",
    },
    {
      name: "Total Transaction Count",
      technical_name: "total_transaction_count",
      aggregation: "COUNT",
      format: "integer",
      description: "Total number of card transactions",
      sql: "COUNT(fact_card_transactions.transaction_sk)",
      folder: "Transaction Metrics",
    },
    {
      name: "Purchase Volume",
      technical_name: "purchase_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total purchase transaction volume",
      sql: "SUM(fact_card_transactions.transaction_amount) WHERE fact_card_transactions.transaction_type = 'PURCHASE'",
      folder: "Transaction Metrics",
      type: "additive",
    },
    {
      name: "Cash Advance Volume",
      technical_name: "cash_advance_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total cash advance volume",
      sql: "SUM(fact_card_transactions.transaction_amount) WHERE fact_card_transactions.transaction_type = 'CASH_ADVANCE'",
      folder: "Transaction Metrics",
      type: "additive",
    },
    {
      name: "Balance Transfer Volume",
      technical_name: "balance_transfer_volume",
      aggregation: "SUM",
      format: "currency",
      description: "Total balance transfer volume",
      sql: "SUM(fact_card_transactions.transaction_amount) WHERE fact_card_transactions.transaction_type = 'BALANCE_TRANSFER'",
      folder: "Transaction Metrics",
      type: "additive",
    },
    {
      name: "Average Transaction Size",
      technical_name: "avg_transaction_size",
      aggregation: "AVG",
      format: "currency",
      description: "Average transaction amount",
      sql: "AVG(fact_card_transactions.transaction_amount)",
      folder: "Transaction Metrics",
    },

    // ========== CREDIT RISK METRICS ==========
    {
      name: "Delinquent Balances (30+ DPD)",
      technical_name: "delinquent_balances_30",
      aggregation: "SUM",
      format: "currency",
      description: "Total balance of accounts 30+ days past due",
      sql: "SUM(fact_card_positions.outstanding_balance) WHERE fact_card_positions.days_past_due >= 30",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "Delinquency Rate (30+ DPD)",
      technical_name: "delinquency_rate_30",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Delinquent balances (30+ DPD) as % of total balances",
      sql: "(SUM(CASE WHEN fact_card_positions.days_past_due >= 30 THEN outstanding_balance ELSE 0 END) / NULLIF(SUM(outstanding_balance), 0)) * 100",
      folder: "Credit Risk",
      type: "non-additive",
    },
    {
      name: "Charge-Off Amount",
      technical_name: "charge_off_amount",
      aggregation: "SUM",
      format: "currency",
      description: "Total card balances charged off",
      sql: "SUM(fact_card_positions.chargeoff_amount)",
      folder: "Credit Risk",
      type: "additive",
    },
    {
      name: "Charge-Off Rate",
      technical_name: "charge_off_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Charge-offs as % of average balances (annualized)",
      sql: "(SUM(fact_card_positions.chargeoff_amount) * 12 / AVG(outstanding_balance)) * 100",
      folder: "Credit Risk",
      type: "non-additive",
    },
    {
      name: "Overlimit Accounts",
      technical_name: "overlimit_accounts",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Number of accounts over their credit limit",
      sql: "COUNT(DISTINCT fact_card_positions.card_account_sk) WHERE fact_card_positions.overlimit_flag = TRUE",
      folder: "Credit Risk",
    },

    // ========== PROFITABILITY METRICS ==========
    {
      name: "Total Interchange Revenue",
      technical_name: "total_interchange_revenue",
      aggregation: "SUM",
      format: "currency",
      description: "Total interchange revenue from merchant transactions",
      sql: "SUM(fact_card_transactions.interchange_revenue)",
      folder: "Profitability",
      type: "additive",
    },
    {
      name: "Interchange Rate",
      technical_name: "interchange_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Interchange revenue as % of transaction volume",
      sql: "(SUM(fact_card_transactions.interchange_revenue) / NULLIF(SUM(fact_card_transactions.transaction_amount), 0)) * 100",
      folder: "Profitability",
      type: "non-additive",
    },
    {
      name: "Total Interest Income",
      technical_name: "total_interest_income",
      aggregation: "SUM",
      format: "currency",
      description: "Total interest charged on revolving balances",
      sql: "SUM(fact_card_positions.interest_charged)",
      folder: "Profitability",
      type: "additive",
    },
    {
      name: "Total Fee Income",
      technical_name: "total_fee_income",
      aggregation: "SUM",
      format: "currency",
      description:
        "Total fees collected (annual, late, overlimit, foreign transaction, etc.)",
      sql: "SUM(fact_card_positions.fee_income)",
      folder: "Profitability",
      type: "additive",
    },
    {
      name: "Card APR (Average)",
      technical_name: "card_apr_avg",
      aggregation: "AVG",
      format: "percent",
      description: "Average annual percentage rate across card portfolio",
      sql: "AVG(dim_card_account.current_apr)",
      folder: "Profitability",
    },
    {
      name: "Net Card Revenue",
      technical_name: "net_card_revenue",
      aggregation: "SUM",
      format: "currency",
      description:
        "Total revenue (interchange + interest + fees - charge-offs)",
      sql: "SUM(fact_card_transactions.interchange_revenue + fact_card_positions.interest_charged + fact_card_positions.fee_income - fact_card_positions.chargeoff_amount)",
      folder: "Profitability",
      type: "additive",
    },

    // ========== REWARDS METRICS ==========
    {
      name: "Total Rewards Earned",
      technical_name: "total_rewards_earned",
      aggregation: "SUM",
      format: "number",
      description: "Total rewards points/miles earned",
      sql: "SUM(fact_card_rewards.points_earned)",
      folder: "Rewards",
      type: "additive",
    },
    {
      name: "Total Rewards Redeemed",
      technical_name: "total_rewards_redeemed",
      aggregation: "SUM",
      format: "number",
      description: "Total rewards points/miles redeemed",
      sql: "SUM(fact_card_rewards.points_redeemed)",
      folder: "Rewards",
      type: "additive",
    },
    {
      name: "Rewards Liability",
      technical_name: "rewards_liability",
      aggregation: "SUM",
      format: "currency",
      description: "Total unredeemed rewards liability (fair value)",
      sql: "SUM(fact_card_rewards.points_balance * fact_card_rewards.point_value)",
      folder: "Rewards",
      type: "semi-additive",
    },
    {
      name: "Rewards Redemption Rate",
      technical_name: "rewards_redemption_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Points redeemed as % of points earned",
      sql: "(SUM(fact_card_rewards.points_redeemed) / NULLIF(SUM(fact_card_rewards.points_earned), 0)) * 100",
      folder: "Rewards",
      type: "non-additive",
    },

    // ========== PAYMENT METRICS ==========
    {
      name: "Total Payments Received",
      technical_name: "total_payments_received",
      aggregation: "SUM",
      format: "currency",
      description: "Total payment amount received from cardholders",
      sql: "SUM(fact_card_payments.payment_amount)",
      folder: "Payment Behavior",
      type: "additive",
    },
    {
      name: "Minimum Payment Due",
      technical_name: "minimum_payment_due",
      aggregation: "SUM",
      format: "currency",
      description: "Total minimum payment due across all accounts",
      sql: "SUM(fact_card_payments.minimum_payment_due)",
      folder: "Payment Behavior",
      type: "additive",
    },
  ],

  attributes: [
    {
      name: "Card Product",
      technical_name: "card_product",
      field: "dim_card_product.product_name",
      description:
        "Card product type (Rewards, Cash Back, Travel, Secured, etc.)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Card Network",
      technical_name: "card_network",
      field: "dim_card_network.network_name",
      description: "Card network (Visa, Mastercard, Amex, Discover)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Cardholder Segment",
      technical_name: "cardholder_segment",
      field: "dim_cardholder.customer_segment",
      description:
        "Cardholder segment (Prime, Near Prime, Subprime, Super Prime)",
      datatype: "string",
      folder: "Customer",
    },
    {
      name: "Merchant Category",
      technical_name: "merchant_category",
      field: "dim_mcc.category_desc",
      description: "Merchant category (Grocery, Gas, Restaurant, Travel, etc.)",
      datatype: "string",
      folder: "Merchant",
    },
    {
      name: "Merchant Name",
      technical_name: "merchant_name",
      field: "dim_merchant.merchant_name",
      description: "Merchant business name",
      datatype: "string",
      folder: "Merchant",
    },
    {
      name: "Card Status",
      technical_name: "card_status",
      field: "dim_card_account.account_status",
      description: "Card account status (Active, Closed, Suspended, Frozen)",
      datatype: "string",
      folder: "Status",
    },
    {
      name: "Delinquency Bucket",
      technical_name: "delinquency_bucket",
      field: "dim_delinquency_bucket.bucket_desc",
      description: "Delinquency aging (Current, 30-59 DPD, 60-89 DPD, 90+ DPD)",
      datatype: "string",
      folder: "Risk",
    },
    {
      name: "Reward Program",
      technical_name: "reward_program",
      field: "dim_reward_program.program_name",
      description:
        "Rewards program name (Cash Back, Travel Rewards, Points, etc.)",
      datatype: "string",
      folder: "Rewards",
    },
    {
      name: "Transaction Type",
      technical_name: "transaction_type",
      field: "fact_card_transactions.transaction_type",
      description:
        "Transaction type (Purchase, Cash Advance, Balance Transfer, Payment)",
      datatype: "string",
      folder: "Transaction",
    },
    {
      name: "Geography",
      technical_name: "geography",
      field: "dim_card_geography.region_name",
      description: "Transaction or cardholder geography",
      datatype: "string",
      folder: "Geography",
    },
    {
      name: "Card Tier",
      technical_name: "card_tier",
      field: "dim_card_product.product_tier",
      description: "Card tier (Standard, Gold, Platinum, Signature)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Payment Method",
      technical_name: "payment_method",
      field: "fact_card_payments.payment_type",
      description: "Payment method (ACH, Check, Online, Phone, Auto-Pay)",
      datatype: "string",
      folder: "Payment",
    },
  ],

  folders: [
    {
      name: "Portfolio Metrics",
      description:
        "Overall card portfolio balances, limits, utilization, and account counts",
      measures: [
        "total_card_balances",
        "total_credit_limits",
        "total_available_credit",
        "portfolio_utilization_rate",
        "total_card_accounts",
        "avg_balance_per_account",
      ],
      icon: "💳",
    },
    {
      name: "Transaction Metrics",
      description: "Transaction volume, counts, and composition by type",
      measures: [
        "total_transaction_volume",
        "total_transaction_count",
        "purchase_volume",
        "cash_advance_volume",
        "balance_transfer_volume",
        "avg_transaction_size",
      ],
      icon: "🛒",
    },
    {
      name: "Credit Risk",
      description: "Delinquency, charge-offs, and credit quality metrics",
      measures: [
        "delinquent_balances_30",
        "delinquency_rate_30",
        "charge_off_amount",
        "charge_off_rate",
        "overlimit_accounts",
      ],
      icon: "⚠️",
    },
    {
      name: "Profitability",
      description: "Interchange, interest, fee income, and net revenue",
      measures: [
        "total_interchange_revenue",
        "interchange_rate",
        "total_interest_income",
        "total_fee_income",
        "card_apr_avg",
        "net_card_revenue",
      ],
      icon: "💰",
    },
    {
      name: "Rewards",
      description: "Rewards points earned, redeemed, and liability",
      measures: [
        "total_rewards_earned",
        "total_rewards_redeemed",
        "rewards_liability",
        "rewards_redemption_rate",
      ],
      icon: "🎁",
    },
    {
      name: "Payment Behavior",
      description: "Payment amounts and patterns",
      measures: ["total_payments_received", "minimum_payment_due"],
      icon: "💵",
    },
  ],

  drillPaths: [
    {
      name: "Product Hierarchy",
      levels: ["Card Network", "Card Tier", "Card Product"],
      description: "Drill down from network to specific card products",
    },
    {
      name: "Customer Hierarchy",
      levels: ["Cardholder Segment", "Credit Score Band", "Cardholder"],
      description: "Drill down by customer credit quality",
    },
    {
      name: "Merchant Hierarchy",
      levels: ["Merchant Category", "Merchant", "Transaction"],
      description: "Drill down by merchant type and specific merchants",
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City"],
      description: "Drill down by transaction geography",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Date", "Hour"],
      description: "Drill down by time for transaction analysis",
    },
  ],

  // Key metric SQL for complex calculations and executive dashboards
  keyMetricSQL: {
    portfolioUtilization: `
-- Portfolio Utilization Trend
-- Utilization rate by card product over time
SELECT 
  DATE_TRUNC('month', position_date) as month,
  cp.product_name,
  SUM(pos.outstanding_balance) as total_balance,
  SUM(pos.credit_limit) as total_limit,
  (SUM(pos.outstanding_balance) / NULLIF(SUM(pos.credit_limit), 0)) * 100 as utilization_pct
FROM gold.fact_card_positions pos
JOIN gold.dim_card_account ca ON pos.card_account_sk = ca.card_account_sk
JOIN gold.dim_card_product cp ON ca.product_sk = cp.product_sk
WHERE ca.account_status = 'ACTIVE'
  AND pos.position_date >= DATE_TRUNC('month', CURRENT_DATE()) - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', position_date), cp.product_name
ORDER BY month DESC, product_name;
`,

    interchangeRevenue: `
-- Interchange Revenue by Merchant Category
-- Top merchant categories by interchange earnings
SELECT 
  mcc.category_desc,
  COUNT(DISTINCT txn.transaction_sk) as transaction_count,
  SUM(txn.transaction_amount) as total_volume,
  SUM(txn.interchange_revenue) as total_interchange,
  (SUM(txn.interchange_revenue) / NULLIF(SUM(txn.transaction_amount), 0)) * 100 as interchange_rate_pct
FROM gold.fact_card_transactions txn
JOIN gold.dim_mcc mcc ON txn.mcc_sk = mcc.mcc_sk
WHERE txn.transaction_date >= DATE_TRUNC('month', CURRENT_DATE()) - INTERVAL '3 months'
  AND txn.transaction_type = 'PURCHASE'
GROUP BY mcc.category_desc
ORDER BY total_interchange DESC
LIMIT 20;
`,

    rewardsLiability: `
-- Rewards Liability Analysis
-- Unredeemed rewards by program and aging
SELECT 
  rp.program_name,
  SUM(rew.points_balance) as total_points_outstanding,
  SUM(rew.points_balance * rew.point_value) as total_liability_usd,
  COUNT(DISTINCT rew.card_account_sk) as accounts_with_points,
  AVG(rew.points_balance) as avg_points_per_account,
  SUM(CASE WHEN rew.points_age_days > 365 THEN points_balance ELSE 0 END) as points_over_1_year
FROM gold.fact_card_rewards rew
JOIN gold.dim_reward_program rp ON rew.reward_program_sk = rp.reward_program_sk
WHERE rew.points_balance > 0
GROUP BY rp.program_name
ORDER BY total_liability_usd DESC;
`,

    delinquencyVintage: `
-- Delinquency by Origination Vintage
-- Delinquency rates segmented by account opening year
SELECT 
  YEAR(ca.account_open_date) as origination_year,
  COUNT(DISTINCT pos.card_account_sk) as total_accounts,
  SUM(pos.outstanding_balance) as total_balance,
  SUM(CASE WHEN pos.days_past_due >= 30 THEN pos.outstanding_balance ELSE 0 END) as delinquent_balance,
  (SUM(CASE WHEN pos.days_past_due >= 30 THEN pos.outstanding_balance ELSE 0 END) / 
   NULLIF(SUM(pos.outstanding_balance), 0)) * 100 as delinquency_rate_pct
FROM gold.fact_card_positions pos
JOIN gold.dim_card_account ca ON pos.card_account_sk = ca.card_account_sk
WHERE ca.account_status = 'ACTIVE'
  AND pos.position_date = CURRENT_DATE()
GROUP BY YEAR(ca.account_open_date)
ORDER BY origination_year DESC;
`,
  },
};

// Export for use in BI tools, data catalogs, and reporting frameworks
export default semanticCreditCardsLayer;
