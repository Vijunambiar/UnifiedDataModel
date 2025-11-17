// CUSTOMER CORE - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: Customer 360, Segmentation, Analytics, Lifetime Value, Engagement, Retention

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

export const semanticCustomerCoreLayer = {
  domain: "customer-core",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Customer Core domain - supporting customer 360, segmentation, analytics, and lifetime value",

  measures: [
    // ========== CUSTOMER BASE METRICS ==========
    {
      name: "Total Customers",
      technical_name: "total_customers",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Total number of unique customers",
      sql: "COUNT(DISTINCT dim_customer.customer_sk)",
      folder: "Customer Base",
    },
    {
      name: "Active Customers",
      technical_name: "active_customers",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Customers with activity in last 90 days",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) WHERE dim_customer.last_activity_date >= CURRENT_DATE() - INTERVAL '90 days'",
      folder: "Customer Base",
    },
    {
      name: "New Customers",
      technical_name: "new_customers",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Customers acquired in the period",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) WHERE dim_customer.customer_since_date BETWEEN period_start AND period_end",
      folder: "Customer Base",
    },
    {
      name: "Total Households",
      technical_name: "total_households",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Total number of unique households",
      sql: "COUNT(DISTINCT dim_household.household_sk)",
      folder: "Customer Base",
    },
    {
      name: "Average Customers per Household",
      technical_name: "avg_customers_per_household",
      aggregation: "CALCULATED",
      format: "number",
      description: "Average number of customers per household",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) / NULLIF(COUNT(DISTINCT dim_household.household_sk), 0)",
      folder: "Customer Base",
      type: "non-additive",
    },

    // ========== CUSTOMER VALUE METRICS ==========
    {
      name: "Total Customer Lifetime Value (CLV)",
      technical_name: "total_clv",
      aggregation: "SUM",
      format: "currency",
      description: "Sum of predicted lifetime value across all customers",
      sql: "SUM(fact_customer_ltv.predicted_lifetime_value)",
      folder: "Customer Value",
      type: "additive",
    },
    {
      name: "Average CLV",
      technical_name: "avg_clv",
      aggregation: "AVG",
      format: "currency",
      description: "Average predicted lifetime value per customer",
      sql: "AVG(fact_customer_ltv.predicted_lifetime_value)",
      folder: "Customer Value",
    },
    {
      name: "Total Deposits per Customer",
      technical_name: "total_deposits_per_customer",
      aggregation: "CALCULATED",
      format: "currency",
      description: "Average total deposit balances per customer",
      sql: "SUM(fact_customer_balances.total_deposit_balance) / NULLIF(COUNT(DISTINCT dim_customer.customer_sk), 0)",
      folder: "Customer Value",
      type: "non-additive",
    },
    {
      name: "Total Loans per Customer",
      technical_name: "total_loans_per_customer",
      aggregation: "CALCULATED",
      format: "currency",
      description: "Average total loan balances per customer",
      sql: "SUM(fact_customer_balances.total_loan_balance) / NULLIF(COUNT(DISTINCT dim_customer.customer_sk), 0)",
      folder: "Customer Value",
      type: "non-additive",
    },
    {
      name: "Total Revenue per Customer",
      technical_name: "total_revenue_per_customer",
      aggregation: "CALCULATED",
      format: "currency",
      description: "Average total revenue generated per customer",
      sql: "SUM(fact_customer_profitability.total_revenue) / NULLIF(COUNT(DISTINCT dim_customer.customer_sk), 0)",
      folder: "Customer Value",
      type: "non-additive",
    },
    {
      name: "Total Customer Profitability",
      technical_name: "total_customer_profitability",
      aggregation: "SUM",
      format: "currency",
      description:
        "Total net profitability across all customers (revenue - costs)",
      sql: "SUM(fact_customer_profitability.net_profit)",
      folder: "Customer Value",
      type: "additive",
    },
    {
      name: "Profitable Customer Count",
      technical_name: "profitable_customer_count",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Number of customers with positive profitability",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) WHERE fact_customer_profitability.net_profit > 0",
      folder: "Customer Value",
    },
    {
      name: "Profitable Customer %",
      technical_name: "profitable_customer_pct",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Percentage of customers that are profitable",
      sql: "(COUNT(DISTINCT CASE WHEN fact_customer_profitability.net_profit > 0 THEN dim_customer.customer_sk END) / NULLIF(COUNT(DISTINCT dim_customer.customer_sk), 0)) * 100",
      folder: "Customer Value",
      type: "non-additive",
    },

    // ========== ENGAGEMENT METRICS ==========
    {
      name: "Total Digital Users",
      technical_name: "total_digital_users",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Customers with digital banking enrollment",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) WHERE dim_customer.digital_banking_flag = TRUE",
      folder: "Engagement",
    },
    {
      name: "Digital Adoption Rate",
      technical_name: "digital_adoption_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Digital users as % of total customers",
      sql: "(COUNT(DISTINCT CASE WHEN dim_customer.digital_banking_flag = TRUE THEN customer_sk END) / NULLIF(COUNT(DISTINCT customer_sk), 0)) * 100",
      folder: "Engagement",
      type: "non-additive",
    },
    {
      name: "Mobile App Users",
      technical_name: "mobile_app_users",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Customers who used mobile app in period",
      sql: "COUNT(DISTINCT fact_customer_engagement.customer_sk) WHERE fact_customer_engagement.mobile_app_session_count > 0",
      folder: "Engagement",
    },
    {
      name: "Average Logins per Customer",
      technical_name: "avg_logins_per_customer",
      aggregation: "AVG",
      format: "number",
      description: "Average digital banking logins per customer per month",
      sql: "AVG(fact_customer_engagement.total_login_count)",
      folder: "Engagement",
    },
    {
      name: "Average Products per Customer",
      technical_name: "avg_products_per_customer",
      aggregation: "AVG",
      format: "number",
      description: "Average number of products held per customer",
      sql: "AVG(fact_customer_relationships.product_count)",
      folder: "Engagement",
    },
    {
      name: "Cross-Sell Ratio",
      technical_name: "cross_sell_ratio",
      aggregation: "CALCULATED",
      format: "number",
      description: "Average products per customer (cross-sell metric)",
      sql: "SUM(fact_customer_relationships.product_count) / NULLIF(COUNT(DISTINCT dim_customer.customer_sk), 0)",
      folder: "Engagement",
      type: "non-additive",
    },

    // ========== RETENTION & CHURN METRICS ==========
    {
      name: "Churned Customers",
      technical_name: "churned_customers",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Customers who closed all accounts in period",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) WHERE dim_customer.churn_flag = TRUE AND dim_customer.churn_date BETWEEN period_start AND period_end",
      folder: "Retention & Churn",
    },
    {
      name: "Churn Rate",
      technical_name: "churn_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Churned customers as % of beginning customer base",
      sql: "(COUNT(DISTINCT CASE WHEN churn_flag = TRUE THEN customer_sk END) / NULLIF(COUNT(DISTINCT customer_sk), 0)) * 100",
      folder: "Retention & Churn",
      type: "non-additive",
    },
    {
      name: "Retention Rate",
      technical_name: "retention_rate",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Customers retained as % of beginning customer base",
      sql: "100 - ((COUNT(DISTINCT CASE WHEN churn_flag = TRUE THEN customer_sk END) / NULLIF(COUNT(DISTINCT customer_sk), 0)) * 100)",
      folder: "Retention & Churn",
      type: "non-additive",
    },
    {
      name: "At-Risk Customers",
      technical_name: "at_risk_customers",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Customers with high predicted churn probability",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) WHERE fact_customer_churn.churn_probability >= 0.7",
      folder: "Retention & Churn",
    },
    {
      name: "Customer Tenure (Average)",
      technical_name: "avg_customer_tenure",
      aggregation: "AVG",
      format: "number",
      description: "Average customer tenure in months",
      sql: "AVG(DATEDIFF(MONTH, dim_customer.customer_since_date, CURRENT_DATE()))",
      folder: "Retention & Churn",
    },

    // ========== ACQUISITION METRICS ==========
    {
      name: "Customer Acquisition Cost (CAC)",
      technical_name: "customer_acquisition_cost",
      aggregation: "CALCULATED",
      format: "currency",
      description: "Total acquisition marketing spend / new customers",
      sql: "SUM(fact_marketing.acquisition_spend) / NULLIF(COUNT(DISTINCT CASE WHEN customer_since_date BETWEEN period_start AND period_end THEN customer_sk END), 0)",
      folder: "Acquisition",
      type: "non-additive",
    },
    {
      name: "CAC Payback Period",
      technical_name: "cac_payback_period",
      aggregation: "CALCULATED",
      format: "number",
      description: "Months to recover customer acquisition cost",
      sql: "SUM(fact_marketing.acquisition_spend) / NULLIF((SUM(fact_customer_profitability.net_profit) / 12), 0)",
      folder: "Acquisition",
      type: "non-additive",
    },
    {
      name: "Customers by Acquisition Channel",
      technical_name: "customers_by_channel",
      aggregation: "COUNT DISTINCT",
      format: "integer",
      description: "Customer count segmented by acquisition channel",
      sql: "COUNT(DISTINCT dim_customer.customer_sk) GROUP BY dim_customer.acquisition_channel",
      folder: "Acquisition",
    },

    // ========== DEMOGRAPHIC METRICS ==========
    {
      name: "Average Customer Age",
      technical_name: "avg_customer_age",
      aggregation: "AVG",
      format: "integer",
      description: "Average age of customers in years",
      sql: "AVG(DATEDIFF(YEAR, dim_customer.birth_date, CURRENT_DATE()))",
      folder: "Demographics",
    },
    {
      name: "Average Household Income",
      technical_name: "avg_household_income",
      aggregation: "AVG",
      format: "currency",
      description: "Average estimated household income",
      sql: "AVG(dim_customer.estimated_income)",
      folder: "Demographics",
    },
  ],

  attributes: [
    {
      name: "Customer Segment",
      technical_name: "customer_segment",
      field: "dim_customer.customer_segment",
      description:
        "Customer segment (Retail, Affluent, Mass Market, Small Business, etc.)",
      datatype: "string",
      folder: "Segmentation",
    },
    {
      name: "Life Stage",
      technical_name: "life_stage",
      field: "dim_customer.life_stage",
      description:
        "Customer life stage (Young Professional, Family, Pre-Retirement, Retiree)",
      datatype: "string",
      folder: "Segmentation",
    },
    {
      name: "Age Band",
      technical_name: "age_band",
      field: "dim_customer.age_band",
      description:
        "Customer age range (18-25, 26-35, 36-45, 46-55, 56-65, 65+)",
      datatype: "string",
      folder: "Demographics",
    },
    {
      name: "Gender",
      technical_name: "gender",
      field: "dim_customer.gender",
      description: "Customer gender",
      datatype: "string",
      folder: "Demographics",
    },
    {
      name: "Income Band",
      technical_name: "income_band",
      field: "dim_customer.income_band",
      description:
        "Estimated income range (< $50K, $50K-$100K, $100K-$200K, $200K+)",
      datatype: "string",
      folder: "Demographics",
    },
    {
      name: "Geography",
      technical_name: "geography",
      field: "dim_geography.region_name",
      description: "Customer geography (State, Region, MSA)",
      datatype: "string",
      folder: "Geography",
    },
    {
      name: "Branch",
      technical_name: "branch",
      field: "dim_branch.branch_name",
      description: "Primary branch affiliation",
      datatype: "string",
      folder: "Geography",
    },
    {
      name: "Customer Status",
      technical_name: "customer_status",
      field: "dim_customer.customer_status",
      description: "Customer status (Active, Inactive, Dormant, Closed)",
      datatype: "string",
      folder: "Status",
    },
    {
      name: "Risk Rating",
      technical_name: "risk_rating",
      field: "dim_customer.risk_rating",
      description: "Customer risk rating (Low, Medium, High)",
      datatype: "string",
      folder: "Risk",
    },
    {
      name: "Acquisition Channel",
      technical_name: "acquisition_channel",
      field: "dim_customer.acquisition_channel",
      description:
        "Channel through which customer was acquired (Branch, Online, Mobile, Referral, etc.)",
      datatype: "string",
      folder: "Acquisition",
    },
    {
      name: "Primary Product",
      technical_name: "primary_product",
      field: "dim_customer.primary_product",
      description: "Customer's primary banking product",
      datatype: "string",
      folder: "Products",
    },
    {
      name: "Digital Banking Status",
      technical_name: "digital_banking_status",
      field: "dim_customer.digital_banking_flag",
      description: "Whether customer is enrolled in digital banking",
      datatype: "boolean",
      folder: "Digital",
    },
    {
      name: "Preferred Channel",
      technical_name: "preferred_channel",
      field: "dim_customer.preferred_channel",
      description:
        "Customer's preferred interaction channel (Branch, Phone, Online, Mobile)",
      datatype: "string",
      folder: "Digital",
    },
    {
      name: "Relationship Manager",
      technical_name: "relationship_manager",
      field: "dim_relationship_manager.manager_name",
      description: "Assigned relationship manager (for high-value customers)",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Customer Type",
      technical_name: "customer_type",
      field: "dim_customer.customer_type",
      description: "Customer type (Individual, Joint, Business, Trust)",
      datatype: "string",
      folder: "Customer Info",
    },
  ],

  folders: [
    {
      name: "Customer Base",
      description:
        "Total customers, active customers, households, and base metrics",
      measures: [
        "total_customers",
        "active_customers",
        "new_customers",
        "total_households",
        "avg_customers_per_household",
      ],
      icon: "👥",
    },
    {
      name: "Customer Value",
      description: "Lifetime value, profitability, revenue, and wallet share",
      measures: [
        "total_clv",
        "avg_clv",
        "total_deposits_per_customer",
        "total_loans_per_customer",
        "total_revenue_per_customer",
        "total_customer_profitability",
        "profitable_customer_count",
        "profitable_customer_pct",
      ],
      icon: "💎",
    },
    {
      name: "Engagement",
      description: "Digital adoption, app usage, logins, and product ownership",
      measures: [
        "total_digital_users",
        "digital_adoption_rate",
        "mobile_app_users",
        "avg_logins_per_customer",
        "avg_products_per_customer",
        "cross_sell_ratio",
      ],
      icon: "📱",
    },
    {
      name: "Retention & Churn",
      description: "Churn rates, retention, at-risk customers, and tenure",
      measures: [
        "churned_customers",
        "churn_rate",
        "retention_rate",
        "at_risk_customers",
        "avg_customer_tenure",
      ],
      icon: "🔄",
    },
    {
      name: "Acquisition",
      description: "Customer acquisition cost, channels, and payback period",
      measures: [
        "customer_acquisition_cost",
        "cac_payback_period",
        "customers_by_channel",
      ],
      icon: "🎯",
    },
    {
      name: "Demographics",
      description: "Age, income, and demographic characteristics",
      measures: ["avg_customer_age", "avg_household_income"],
      icon: "📊",
    },
  ],

  drillPaths: [
    {
      name: "Segmentation Hierarchy",
      levels: ["Customer Segment", "Life Stage", "Income Band"],
      description: "Drill down by customer segmentation",
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Region", "State", "MSA", "Branch"],
      description: "Drill down by geography",
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Type", "Product"],
      description: "Drill down by product ownership",
    },
    {
      name: "Engagement Hierarchy",
      levels: ["Digital Status", "Preferred Channel", "Login Frequency Band"],
      description: "Drill down by engagement level",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week"],
      description: "Drill down by time period",
    },
  ],

  // Key metric SQL for complex calculations and executive dashboards
  keyMetricSQL: {
    clvBySegment: `
-- Customer Lifetime Value by Segment
-- Average CLV segmented by customer type
SELECT 
  c.customer_segment,
  c.life_stage,
  COUNT(DISTINCT c.customer_sk) as customer_count,
  AVG(ltv.predicted_lifetime_value) as avg_clv,
  SUM(ltv.predicted_lifetime_value) as total_clv,
  AVG(prof.net_profit) as avg_annual_profit
FROM gold.dim_customer c
JOIN gold.fact_customer_ltv ltv ON c.customer_sk = ltv.customer_sk
JOIN gold.fact_customer_profitability prof ON c.customer_sk = prof.customer_sk
WHERE c.customer_status = 'ACTIVE'
GROUP BY c.customer_segment, c.life_stage
ORDER BY avg_clv DESC;
`,

    churnAnalysis: `
-- Churn Analysis by Cohort
-- Monthly churn rates by acquisition cohort
SELECT 
  DATE_TRUNC('month', c.customer_since_date) as cohort_month,
  COUNT(DISTINCT c.customer_sk) as cohort_size,
  COUNT(DISTINCT CASE WHEN c.churn_flag = TRUE THEN c.customer_sk END) as churned_count,
  (COUNT(DISTINCT CASE WHEN c.churn_flag = TRUE THEN c.customer_sk END) / 
   NULLIF(COUNT(DISTINCT c.customer_sk), 0)) * 100 as churn_rate_pct,
  AVG(DATEDIFF(MONTH, c.customer_since_date, COALESCE(c.churn_date, CURRENT_DATE()))) as avg_tenure_months
FROM gold.dim_customer c
WHERE c.customer_since_date >= DATE_TRUNC('month', CURRENT_DATE()) - INTERVAL '24 months'
GROUP BY DATE_TRUNC('month', c.customer_since_date)
ORDER BY cohort_month DESC;
`,

    digitalAdoption: `
-- Digital Adoption by Segment and Age
-- Digital banking adoption rates
SELECT 
  c.customer_segment,
  c.age_band,
  COUNT(DISTINCT c.customer_sk) as total_customers,
  COUNT(DISTINCT CASE WHEN c.digital_banking_flag = TRUE THEN c.customer_sk END) as digital_users,
  (COUNT(DISTINCT CASE WHEN c.digital_banking_flag = TRUE THEN c.customer_sk END) / 
   NULLIF(COUNT(DISTINCT c.customer_sk), 0)) * 100 as digital_adoption_pct,
  AVG(eng.total_login_count) as avg_monthly_logins
FROM gold.dim_customer c
LEFT JOIN gold.fact_customer_engagement eng ON c.customer_sk = eng.customer_sk
WHERE c.customer_status = 'ACTIVE'
GROUP BY c.customer_segment, c.age_band
ORDER BY digital_adoption_pct DESC;
`,

    crossSellOpportunity: `
-- Cross-Sell Opportunity Analysis
-- Customers by product count and profitability
SELECT 
  rel.product_count,
  COUNT(DISTINCT c.customer_sk) as customer_count,
  AVG(prof.net_profit) as avg_profit,
  AVG(ltv.predicted_lifetime_value) as avg_clv,
  SUM(prof.total_revenue) as total_revenue
FROM gold.dim_customer c
JOIN gold.fact_customer_relationships rel ON c.customer_sk = rel.customer_sk
JOIN gold.fact_customer_profitability prof ON c.customer_sk = prof.customer_sk
JOIN gold.fact_customer_ltv ltv ON c.customer_sk = ltv.customer_sk
WHERE c.customer_status = 'ACTIVE'
GROUP BY rel.product_count
ORDER BY rel.product_count;
`,
  },
};

// Export for use in BI tools, data catalogs, and reporting frameworks
export default semanticCustomerCoreLayer;
