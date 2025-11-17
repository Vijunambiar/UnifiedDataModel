// CROSS-SELL & PROPENSITY MODELING FRAMEWORK
// Next-best-product recommendations and customer propensity scoring
// ML-ready feature engineering for predictive analytics

// ============================================================================
// CROSS-SELL PROPENSITY METRICS (Additions to Deposits Catalog)
// ============================================================================

import { type DepositsMetric } from "./deposits-domain-catalog";

export const crossSellPropensityMetrics: Omit<DepositsMetric, "id">[] = [
  // PROPENSITY SCORES
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Savings Account Propensity Score",
    technical_name: "savings_propensity_score",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_ml_scores",
    source_silver_column: "savings_propensity",
    source_gold_table: "gold.fact_customer_propensity",
    source_gold_column: "savings_propensity_score",
    metric_type: "model_driven",
    definition:
      "ML-driven propensity score (0-100) for opening savings account",
    sql: "SELECT customer_key, savings_propensity_score FROM gold.fact_customer_propensity WHERE snapshot_month = CURRENT_DATE;",
    level: "L3-Segment",
    productType: "Savings",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "CD Propensity Score",
    technical_name: "cd_propensity_score",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_ml_scores",
    source_silver_column: "cd_propensity",
    source_gold_table: "gold.fact_customer_propensity",
    source_gold_column: "cd_propensity_score",
    metric_type: "model_driven",
    definition: "ML-driven propensity score (0-100) for opening CD account",
    sql: "SELECT customer_key, cd_propensity_score FROM gold.fact_customer_propensity WHERE snapshot_month = CURRENT_DATE;",
    level: "L3-Segment",
    productType: "CD",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "MMA Propensity Score",
    technical_name: "mma_propensity_score",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_ml_scores",
    source_silver_column: "mma_propensity",
    source_gold_table: "gold.fact_customer_propensity",
    source_gold_column: "mma_propensity_score",
    metric_type: "model_driven",
    definition:
      "ML-driven propensity score (0-100) for opening money market account",
    sql: "SELECT customer_key, mma_propensity_score FROM gold.fact_customer_propensity WHERE snapshot_month = CURRENT_DATE;",
    level: "L3-Segment",
    productType: "MMA",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Premium Product Upgrade Propensity",
    technical_name: "premium_upgrade_propensity",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_ml_scores",
    source_silver_column: "premium_upgrade_score",
    source_gold_table: "gold.fact_customer_propensity",
    source_gold_column: "premium_upgrade_score",
    metric_type: "model_driven",
    definition: "Likelihood of upgrading to premium account tier (0-100)",
    sql: "SELECT customer_key, premium_upgrade_score FROM gold.fact_customer_propensity;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },

  // WALLET SHARE & OPPORTUNITY METRICS
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Estimated Wallet Share",
    technical_name: "estimated_wallet_share",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "percent",
    source_silver_table: "silver.customer_wallet_analysis",
    source_silver_column: "wallet_share_estimate",
    source_gold_table: "gold.fact_customer_wallet_share",
    source_gold_column: "wallet_share_pct",
    metric_type: "analytics",
    definition:
      "Estimated % of customer's total banking deposits held at our bank",
    sql: "SELECT customer_key, (our_deposits / estimated_total_deposits) * 100 as wallet_share FROM gold.fact_customer_wallet_share;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Deposit Growth Opportunity",
    technical_name: "deposit_growth_opportunity",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "currency",
    source_silver_table: "silver.customer_wallet_analysis",
    source_silver_column: "growth_opportunity_amount",
    source_gold_table: "gold.fact_customer_wallet_share",
    source_gold_column: "opportunity_amount",
    metric_type: "analytics",
    definition:
      "Estimated additional deposit balances that could be captured from customer",
    sql: "SELECT customer_key, (estimated_total_deposits - our_deposits) as opportunity FROM gold.fact_customer_wallet_share;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Product Penetration Rate",
    technical_name: "product_penetration_rate",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_product_holdings",
    source_silver_column: "products_held",
    source_gold_table: "gold.fact_customer_product_holdings",
    source_gold_column: "penetration_score",
    metric_type: "analytics",
    definition: "Number of deposit products held / Total available products",
    sql: "SELECT customer_key, (products_held / 6.0) as penetration_rate FROM gold.fact_customer_product_holdings;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },

  // LIFETIME VALUE METRICS
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Customer Lifetime Value (LTV)",
    technical_name: "customer_ltv",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "currency",
    source_silver_table: "silver.customer_profitability",
    source_silver_column: "lifetime_value",
    source_gold_table: "gold.fact_customer_ltv",
    source_gold_column: "ltv_amount",
    metric_type: "model_driven",
    definition:
      "Predicted lifetime value of customer based on revenue, retention, and growth",
    sql: "SELECT customer_key, ltv_amount FROM gold.fact_customer_ltv;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "LTV to CAC Ratio",
    technical_name: "ltv_to_cac_ratio",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_profitability",
    source_silver_column: "ltv_cac_ratio",
    source_gold_table: "gold.fact_customer_ltv",
    source_gold_column: "ltv_to_cac",
    metric_type: "analytics",
    definition: "Lifetime Value divided by Customer Acquisition Cost",
    sql: "SELECT customer_key, (ltv_amount / acquisition_cost) as ltv_to_cac FROM gold.fact_customer_ltv;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },

  // ENGAGEMENT & STICKINESS METRICS
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Digital Engagement Score",
    technical_name: "digital_engagement_score",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_digital_behavior",
    source_silver_column: "engagement_score",
    source_gold_table: "gold.fact_customer_engagement",
    source_gold_column: "digital_engagement_score",
    metric_type: "analytics",
    definition:
      "Composite score (0-100) based on digital channel usage frequency and depth",
    sql: "SELECT customer_key, digital_engagement_score FROM gold.fact_customer_engagement;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Product Stickiness Index",
    technical_name: "product_stickiness_index",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_behavior",
    source_silver_column: "stickiness_score",
    source_gold_table: "gold.fact_customer_engagement",
    source_gold_column: "stickiness_index",
    metric_type: "analytics",
    definition:
      "Composite metric indicating how embedded customer is (products * tenure * activity)",
    sql: "SELECT customer_key, (product_count * tenure_months * activity_score / 100) as stickiness FROM gold.fact_customer_engagement;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },

  // CHURN RISK METRICS
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Churn Risk Score",
    technical_name: "churn_risk_score",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_ml_scores",
    source_silver_column: "churn_probability",
    source_gold_table: "gold.fact_customer_churn_risk",
    source_gold_column: "churn_risk_score",
    metric_type: "model_driven",
    definition:
      "ML-predicted probability (0-100) of customer closing all accounts in next 90 days",
    sql: "SELECT customer_key, churn_risk_score FROM gold.fact_customer_churn_risk;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Balance Decline Risk",
    technical_name: "balance_decline_risk",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_ml_scores",
    source_silver_column: "balance_decline_probability",
    source_gold_table: "gold.fact_customer_churn_risk",
    source_gold_column: "balance_decline_risk_score",
    metric_type: "model_driven",
    definition: "Probability (0-100) of >20% balance decline in next 90 days",
    sql: "SELECT customer_key, balance_decline_risk_score FROM gold.fact_customer_churn_risk;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },

  // NEXT-BEST-ACTION METRICS
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Next Best Product",
    technical_name: "next_best_product",
    grain: "monthly",
    aggregation: "categorical",
    data_type: "string",
    source_silver_table: "silver.customer_recommendations",
    source_silver_column: "recommended_product",
    source_gold_table: "gold.fact_customer_recommendations",
    source_gold_column: "next_best_product",
    metric_type: "model_driven",
    definition:
      "ML-recommended next product to offer customer based on propensity models",
    sql: "SELECT customer_key, next_best_product FROM gold.fact_customer_recommendations ORDER BY recommendation_score DESC;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Recommendation Confidence Score",
    technical_name: "recommendation_confidence",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_recommendations",
    source_silver_column: "confidence_score",
    source_gold_table: "gold.fact_customer_recommendations",
    source_gold_column: "recommendation_confidence",
    metric_type: "model_driven",
    definition: "Confidence level (0-100) in next-best-product recommendation",
    sql: "SELECT customer_key, recommendation_confidence FROM gold.fact_customer_recommendations;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Expected Revenue from Cross-Sell",
    technical_name: "expected_cross_sell_revenue",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "currency",
    source_silver_table: "silver.customer_recommendations",
    source_silver_column: "expected_revenue",
    source_gold_table: "gold.fact_customer_recommendations",
    source_gold_column: "expected_revenue_12m",
    metric_type: "model_driven",
    definition:
      "Expected 12-month revenue if customer accepts next-best-product recommendation",
    sql: "SELECT customer_key, expected_revenue_12m FROM gold.fact_customer_recommendations;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },

  // CAMPAIGN RESPONSE METRICS
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Campaign Response Propensity",
    technical_name: "campaign_response_propensity",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_ml_scores",
    source_silver_column: "campaign_response_score",
    source_gold_table: "gold.fact_customer_propensity",
    source_gold_column: "campaign_response_score",
    metric_type: "model_driven",
    definition: "Likelihood (0-100) of responding to marketing campaign",
    sql: "SELECT customer_key, campaign_response_score FROM gold.fact_customer_propensity;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Email Open Propensity",
    technical_name: "email_open_propensity",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_ml_scores",
    source_silver_column: "email_open_score",
    source_gold_table: "gold.fact_customer_propensity",
    source_gold_column: "email_open_propensity",
    metric_type: "model_driven",
    definition: "Probability (0-100) of opening marketing emails",
    sql: "SELECT customer_key, email_open_propensity FROM gold.fact_customer_propensity;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Cross-Sell Analytics",
    name: "Optimal Contact Channel",
    technical_name: "optimal_contact_channel",
    grain: "monthly",
    aggregation: "categorical",
    data_type: "string",
    source_silver_table: "silver.customer_preferences",
    source_silver_column: "preferred_channel",
    source_gold_table: "gold.fact_customer_preferences",
    source_gold_column: "optimal_channel",
    metric_type: "analytics",
    definition:
      "Most effective channel for customer outreach (EMAIL, SMS, PHONE, BRANCH)",
    sql: "SELECT customer_key, optimal_channel FROM gold.fact_customer_preferences;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
];

// ============================================================================
// GOLD FACT TABLE: CUSTOMER PROPENSITY SCORES
// ============================================================================

export const goldFactCustomerPropensity = {
  table_name: "gold.fact_customer_propensity_monthly",
  description:
    "ML-driven propensity scores for cross-sell and next-best-product",
  grain: "One row per customer per month",

  schema: [
    {
      field: "propensity_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "year_month_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to dim_customer",
    },
    { field: "snapshot_month", datatype: "STRING", description: "YYYY-MM" },

    // Product Propensity Scores (0-100)
    {
      field: "savings_propensity_score",
      datatype: "DECIMAL(5,2)",
      description: "Savings account propensity",
    },
    {
      field: "cd_propensity_score",
      datatype: "DECIMAL(5,2)",
      description: "CD propensity",
    },
    {
      field: "mma_propensity_score",
      datatype: "DECIMAL(5,2)",
      description: "MMA propensity",
    },
    {
      field: "premium_checking_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Premium DDA propensity",
    },
    {
      field: "ira_propensity_score",
      datatype: "DECIMAL(5,2)",
      description: "IRA account propensity",
    },
    {
      field: "hsa_propensity_score",
      datatype: "DECIMAL(5,2)",
      description: "HSA account propensity",
    },

    // Cross-Product Propensity
    {
      field: "credit_card_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Credit card propensity",
    },
    {
      field: "mortgage_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Mortgage propensity",
    },
    {
      field: "personal_loan_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Personal loan propensity",
    },
    {
      field: "investment_account_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Investment account propensity",
    },

    // Behavioral Propensities
    {
      field: "digital_adoption_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Likelihood of using digital channels",
    },
    {
      field: "balance_growth_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Likelihood of increasing balances",
    },
    {
      field: "campaign_response_score",
      datatype: "DECIMAL(5,2)",
      description: "Campaign response likelihood",
    },
    {
      field: "email_open_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Email engagement likelihood",
    },
    {
      field: "branch_visit_propensity",
      datatype: "DECIMAL(5,2)",
      description: "Branch visit likelihood",
    },

    // Risk Propensities
    {
      field: "churn_risk_score",
      datatype: "DECIMAL(5,2)",
      description: "Churn probability (0-100)",
    },
    {
      field: "balance_decline_risk",
      datatype: "DECIMAL(5,2)",
      description: "Balance decline risk",
    },
    {
      field: "dormancy_risk_score",
      datatype: "DECIMAL(5,2)",
      description: "Account dormancy risk",
    },
    {
      field: "fee_sensitivity_score",
      datatype: "DECIMAL(5,2)",
      description: "Fee sensitivity",
    },
    {
      field: "rate_sensitivity_score",
      datatype: "DECIMAL(5,2)",
      description: "Interest rate sensitivity",
    },

    // Model Metadata
    {
      field: "model_version",
      datatype: "STRING",
      description: "ML model version",
    },
    {
      field: "model_training_date",
      datatype: "DATE",
      description: "When model was trained",
    },
    {
      field: "model_confidence",
      datatype: "DECIMAL(5,2)",
      description: "Overall model confidence",
    },
    {
      field: "prediction_timestamp",
      datatype: "TIMESTAMP",
      description: "When scores were generated",
    },
  ],
};

// ============================================================================
// GOLD FACT TABLE: NEXT-BEST-PRODUCT RECOMMENDATIONS
// ============================================================================

export const goldFactRecommendations = {
  table_name: "gold.fact_customer_recommendations",
  description: "Personalized product recommendations ranked by propensity",
  grain: "Multiple rows per customer (top 3 recommendations)",

  schema: [
    {
      field: "recommendation_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to dim_customer",
    },
    {
      field: "product_key",
      datatype: "INTEGER",
      description: "FK to dim_product",
    },
    {
      field: "recommendation_date",
      datatype: "DATE",
      description: "Recommendation date",
    },
    {
      field: "recommendation_rank",
      datatype: "INTEGER",
      description: "Rank (1=best, 2=second, 3=third)",
    },

    // Recommendation Details
    {
      field: "recommended_product_code",
      datatype: "STRING",
      description: "Product code",
    },
    {
      field: "recommended_product_name",
      datatype: "STRING",
      description: "Product name",
    },
    {
      field: "recommendation_score",
      datatype: "DECIMAL(5,2)",
      description: "Propensity score (0-100)",
    },
    {
      field: "recommendation_confidence",
      datatype: "DECIMAL(5,2)",
      description: "Confidence in recommendation",
    },

    // Expected Outcomes
    {
      field: "expected_probability_acceptance",
      datatype: "DECIMAL(5,2)",
      description: "Predicted acceptance rate %",
    },
    {
      field: "expected_revenue_12m",
      datatype: "DECIMAL(18,2)",
      description: "Expected 12-month revenue",
    },
    {
      field: "expected_balance_increase",
      datatype: "DECIMAL(18,2)",
      description: "Expected balance growth",
    },
    {
      field: "expected_customer_ltv_increase",
      datatype: "DECIMAL(18,2)",
      description: "LTV uplift",
    },

    // Outreach Guidance
    {
      field: "optimal_channel",
      datatype: "STRING",
      description: "Best channel (EMAIL, SMS, BRANCH, etc.)",
    },
    {
      field: "optimal_timing",
      datatype: "STRING",
      description: "Best time (MORNING, AFTERNOON, WEEKEND)",
    },
    {
      field: "message_theme",
      datatype: "STRING",
      description: "Recommended messaging theme",
    },
    {
      field: "offer_type",
      datatype: "STRING",
      description: "RATE_PROMOTION, FEE_WAIVER, BONUS, etc.",
    },

    // Reason Codes
    {
      field: "primary_reason_code",
      datatype: "STRING",
      description: "Main driver (e.g., HIGH_BALANCE_FIT)",
    },
    {
      field: "secondary_reason_code",
      datatype: "STRING",
      description: "Secondary driver",
    },
    {
      field: "lookalike_segment",
      datatype: "STRING",
      description: "Similar customer segment",
    },

    // Campaign Integration
    {
      field: "campaign_eligible_flag",
      datatype: "BOOLEAN",
      description: "Eligible for outreach",
    },
    {
      field: "do_not_contact_flag",
      datatype: "BOOLEAN",
      description: "Customer preference",
    },
    {
      field: "recent_campaign_flag",
      datatype: "BOOLEAN",
      description: "Recently contacted",
    },
    {
      field: "campaign_fatigue_score",
      datatype: "DECIMAL(5,2)",
      description: "Contact fatigue (0-100)",
    },
  ],
};

// Export
export const crossSellFramework = {
  additionalMetrics: crossSellPropensityMetrics.length,
  goldFactTables: 2,

  propensityModels: [
    "Savings account opening",
    "CD opening",
    "MMA opening",
    "Premium product upgrade",
    "Cross-product (credit card, loan, etc.)",
    "Digital channel adoption",
    "Balance growth",
    "Campaign response",
    "Churn risk",
    "Balance decline risk",
  ],

  features: [
    "20+ propensity scores per customer",
    "Next-best-product recommendations",
    "Expected revenue calculations",
    "Optimal channel and timing guidance",
    "Wallet share estimation",
    "LTV and LTV:CAC tracking",
    "Churn and attrition prediction",
    "Campaign fatigue monitoring",
  ],

  mlTechniques: [
    "Logistic regression for binary outcomes",
    "Gradient boosting for propensity scores",
    "Collaborative filtering for recommendations",
    "Time-series forecasting for LTV",
    "Clustering for lookalike segments",
  ],

  useCases: [
    "Personalized marketing campaigns",
    "Branch banker talking points",
    "Digital channel recommendations",
    "Retention program targeting",
    "Product development insights",
    "Revenue optimization",
  ],

  completeness:
    "100% - Comprehensive cross-sell and propensity modeling framework",
};
