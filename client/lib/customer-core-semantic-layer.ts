/**
 * CUSTOMER-CORE DOMAIN - SEMANTIC LAYER
 * Cross-area customer analytics, CDP, and 360-degree customer view
 */

export const customerCoreSemanticLayer = {
  domainId: "customer-core",
  domainName: "Customer Core",
  
  measures: [
    {
      name: "total_customers",
      displayName: "Total Customers",
      formula: "COUNT(DISTINCT customer_id)",
      description: "Total number of unique customers across all banking areas",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio Metrics"
    },
    {
      name: "active_customers",
      displayName: "Active Customers",
      formula: "COUNT(DISTINCT CASE WHEN customer_status = 'ACTIVE' THEN customer_id END)",
      description: "Number of customers with active status",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio Metrics"
    },
    {
      name: "new_customers_mtd",
      displayName: "New Customers (MTD)",
      formula: "COUNT(DISTINCT CASE WHEN customer_since_date >= DATE_TRUNC('month', CURRENT_DATE) THEN customer_id END)",
      description: "New customers acquired month-to-date",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Acquisition"
    },
    {
      name: "customer_lifetime_value",
      displayName: "Customer Lifetime Value (CLV)",
      formula: "SUM(total_revenue) / NULLIF(COUNT(DISTINCT customer_id), 0)",
      description: "Average lifetime value per customer",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Profitability"
    },
    {
      name: "products_per_customer",
      displayName: "Products Per Customer",
      formula: "SUM(product_count) / NULLIF(COUNT(DISTINCT customer_id), 0)",
      description: "Average number of products held per customer",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "#,##0.00",
      category: "Cross-Sell"
    },
    {
      name: "wallet_share",
      displayName: "Wallet Share",
      formula: "(SUM(customer_revenue) / SUM(customer_total_banking_spend)) * 100",
      description: "Percentage of customer banking spend captured",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Share of Wallet"
    },
    {
      name: "churn_rate",
      displayName: "Churn Rate",
      formula: "(COUNT(DISTINCT churned_customer_id) / NULLIF(COUNT(DISTINCT beginning_customer_id), 0)) * 100",
      description: "Percentage of customers who left in the period",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Retention"
    },
    {
      name: "retention_rate",
      displayName: "Retention Rate",
      formula: "((COUNT(DISTINCT beginning_customer_id) - COUNT(DISTINCT churned_customer_id)) / NULLIF(COUNT(DISTINCT beginning_customer_id), 0)) * 100",
      description: "Percentage of customers retained from beginning of period",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Retention"
    },
    {
      name: "nps_score",
      displayName: "Net Promoter Score (NPS)",
      formula: "(COUNT(promoters) - COUNT(detractors)) / NULLIF(COUNT(total_respondents), 0) * 100",
      description: "Net Promoter Score measuring customer loyalty",
      dataType: "Number",
      aggregation: "CALCULATED",
      format: "#,##0",
      category: "Satisfaction"
    },
    {
      name: "csat_score",
      displayName: "Customer Satisfaction Score",
      formula: "AVG(satisfaction_rating)",
      description: "Average customer satisfaction rating (1-5 scale)",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "#,##0.00",
      category: "Satisfaction"
    },
    {
      name: "customer_acquisition_cost",
      displayName: "Customer Acquisition Cost (CAC)",
      formula: "SUM(marketing_spend + sales_cost) / NULLIF(COUNT(DISTINCT new_customer_id), 0)",
      description: "Average cost to acquire a new customer",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Acquisition"
    },
    {
      name: "digital_adoption_rate",
      displayName: "Digital Adoption Rate",
      formula: "(COUNT(DISTINCT digital_customer_id) / NULLIF(COUNT(DISTINCT customer_id), 0)) * 100",
      description: "Percentage of customers using digital channels",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Digital Engagement"
    },
    {
      name: "total_touchpoints",
      displayName: "Total Customer Touchpoints",
      formula: "COUNT(interaction_id)",
      description: "Total number of customer interactions across all channels",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Engagement"
    },
    {
      name: "avg_relationship_tenure",
      displayName: "Average Relationship Tenure",
      formula: "AVG(DATEDIFF(month, customer_since_date, CURRENT_DATE))",
      description: "Average customer relationship length in months",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Lifecycle"
    },
    {
      name: "total_revenue_per_customer",
      displayName: "Revenue Per Customer",
      formula: "SUM(total_revenue) / NULLIF(COUNT(DISTINCT customer_id), 0)",
      description: "Average total revenue per customer",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Profitability"
    }
  ],

  attributes: [
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "segment_code",
      dataType: "String",
      description: "Customer segmentation tier (Mass, Mass Affluent, Affluent, Private)",
      lookup: "dim_customer_segment"
    },
    {
      name: "lifecycle_stage",
      displayName: "Lifecycle Stage",
      field: "lifecycle_stage_code",
      dataType: "String",
      description: "Customer lifecycle stage (Prospect, New, Growing, Mature, Declining, Dormant)",
      lookup: "dim_lifecycle_stage"
    },
    {
      name: "primary_channel",
      displayName: "Primary Channel",
      field: "primary_channel_code",
      dataType: "String",
      description: "Customer's preferred banking channel",
      lookup: "dim_channel"
    },
    {
      name: "risk_tier",
      displayName: "Risk Tier",
      field: "risk_tier_code",
      dataType: "String",
      description: "Customer risk classification",
      lookup: "dim_risk_tier"
    },
    {
      name: "household_type",
      displayName: "Household Type",
      field: "household_type_code",
      dataType: "String",
      description: "Type of household (Single, Family, Multi-generational)",
      lookup: "dim_household_type"
    },
    {
      name: "banking_tenure",
      displayName: "Banking Tenure",
      field: "tenure_bucket",
      dataType: "String",
      description: "Customer tenure bucket (0-1yr, 1-3yr, 3-5yr, 5-10yr, 10+yr)",
      lookup: "dim_tenure"
    },
    {
      name: "digital_engagement_level",
      displayName: "Digital Engagement Level",
      field: "digital_engagement_tier",
      dataType: "String",
      description: "Level of digital channel adoption (High, Medium, Low, None)",
      lookup: "dim_digital_engagement"
    },
    {
      name: "geographic_region",
      displayName: "Geographic Region",
      field: "region_code",
      dataType: "String",
      description: "Customer's geographic region",
      lookup: "dim_geography"
    },
    {
      name: "product_portfolio",
      displayName: "Product Portfolio",
      field: "portfolio_mix",
      dataType: "String",
      description: "Mix of products held (Deposits Only, Lending Only, Full Relationship)",
      lookup: "dim_product_mix"
    },
    {
      name: "relationship_manager",
      displayName: "Relationship Manager",
      field: "rm_employee_id",
      dataType: "String",
      description: "Assigned relationship manager",
      lookup: "dim_employee"
    }
  ],

  hierarchies: [
    {
      name: "Customer Hierarchy",
      levels: ["Segment", "Subsegment", "Household", "Customer"],
      description: "Customer segmentation and household drill-down"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City", "Zip Code"],
      description: "Geographic location drill-down"
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis hierarchy"
    },
    {
      name: "Product Hierarchy",
      levels: ["Banking Area", "Product Category", "Product Line", "Product"],
      description: "Product classification from area to specific product"
    },
    {
      name: "Lifecycle Hierarchy",
      levels: ["Lifecycle Stage", "Tenure Bucket", "Engagement Level"],
      description: "Customer lifecycle and engagement progression"
    },
    {
      name: "Channel Hierarchy",
      levels: ["Channel Type", "Channel Category", "Specific Channel"],
      description: "Banking channel classification"
    }
  ],

  folders: [
    {
      name: "Customer Portfolio",
      measures: ["total_customers", "active_customers", "products_per_customer", "avg_relationship_tenure"],
      description: "Overall customer base metrics",
      icon: "👥"
    },
    {
      name: "Customer Acquisition",
      measures: ["new_customers_mtd", "customer_acquisition_cost"],
      description: "New customer acquisition metrics",
      icon: "📈"
    },
    {
      name: "Customer Retention",
      measures: ["churn_rate", "retention_rate"],
      description: "Customer retention and churn analytics",
      icon: "🔄"
    },
    {
      name: "Customer Profitability",
      measures: ["customer_lifetime_value", "total_revenue_per_customer", "wallet_share"],
      description: "Customer profitability and revenue metrics",
      icon: "💰"
    },
    {
      name: "Customer Satisfaction",
      measures: ["nps_score", "csat_score"],
      description: "Customer satisfaction and loyalty metrics",
      icon: "⭐"
    },
    {
      name: "Digital Engagement",
      measures: ["digital_adoption_rate", "total_touchpoints"],
      description: "Digital channel adoption and engagement",
      icon: "📱"
    }
  ]
};

export default customerCoreSemanticLayer;
