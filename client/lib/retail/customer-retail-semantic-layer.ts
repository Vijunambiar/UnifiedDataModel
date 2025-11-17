/**
 * CUSTOMER-RETAIL DOMAIN - SEMANTIC LAYER
 * Individual consumer customer management, demographics, lifecycle
 */

export const customerRetailSemanticLayer = {
  domainId: "customer-retail",
  domainName: "Customer-Retail",
  
  measures: [
    {
      name: "total_retail_customers",
      displayName: "Total Retail Customers",
      formula: "COUNT(DISTINCT customer_id)",
      description: "Total number of retail banking customers",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "active_customers",
      displayName: "Active Customers",
      formula: "COUNT(DISTINCT CASE WHEN status = 'ACTIVE' THEN customer_id END)",
      description: "Number of active retail customers",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "new_customers",
      displayName: "New Customers",
      formula: "COUNT(DISTINCT CASE WHEN onboarding_date >= DATE_TRUNC('month', CURRENT_DATE) THEN customer_id END)",
      description: "New customers onboarded in current period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Acquisition"
    },
    {
      name: "total_households",
      displayName: "Total Households",
      formula: "COUNT(DISTINCT household_id)",
      description: "Total number of retail households",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "customers_per_household",
      displayName: "Customers Per Household",
      formula: "COUNT(DISTINCT customer_id) / NULLIF(COUNT(DISTINCT household_id), 0)",
      description: "Average number of customers per household",
      dataType: "Decimal",
      aggregation: "CALCULATED",
      format: "#,##0.00",
      category: "Household Analytics"
    },
    {
      name: "primary_customer_age",
      displayName: "Average Customer Age",
      formula: "AVG(DATEDIFF(year, date_of_birth, CURRENT_DATE))",
      description: "Average age of retail customers",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Demographics"
    },
    {
      name: "digital_customers",
      displayName: "Digital Customers",
      formula: "COUNT(DISTINCT CASE WHEN has_digital_banking = TRUE THEN customer_id END)",
      description: "Number of customers with digital banking enrollment",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Digital"
    },
    {
      name: "digital_penetration",
      displayName: "Digital Penetration Rate",
      formula: "(COUNT(DISTINCT CASE WHEN has_digital_banking = TRUE THEN customer_id END) / NULLIF(COUNT(DISTINCT customer_id), 0)) * 100",
      description: "Percentage of customers enrolled in digital banking",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Digital"
    },
    {
      name: "avg_tenure_months",
      displayName: "Average Tenure (Months)",
      formula: "AVG(DATEDIFF(month, customer_since_date, CURRENT_DATE))",
      description: "Average customer tenure in months",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Loyalty"
    },
    {
      name: "kyc_compliance_rate",
      displayName: "KYC Compliance Rate",
      formula: "(COUNT(DISTINCT CASE WHEN kyc_status = 'COMPLIANT' THEN customer_id END) / NULLIF(COUNT(DISTINCT customer_id), 0)) * 100",
      description: "Percentage of customers with compliant KYC",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Compliance"
    },
    {
      name: "products_per_customer",
      displayName: "Products Per Customer",
      formula: "SUM(product_count) / NULLIF(COUNT(DISTINCT customer_id), 0)",
      description: "Average number of products per customer",
      dataType: "Decimal",
      aggregation: "CALCULATED",
      format: "#,##0.00",
      category: "Cross-Sell"
    },
    {
      name: "avg_monthly_income",
      displayName: "Average Monthly Income",
      formula: "AVG(monthly_income)",
      description: "Average customer monthly income",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Demographics"
    },
    {
      name: "high_value_customers",
      displayName: "High Value Customers",
      formula: "COUNT(DISTINCT CASE WHEN total_balance > 100000 THEN customer_id END)",
      description: "Number of customers with balances over $100K",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Segmentation"
    },
    {
      name: "dormant_customers",
      displayName: "Dormant Customers",
      formula: "COUNT(DISTINCT CASE WHEN last_activity_date < DATEADD(month, -12, CURRENT_DATE) THEN customer_id END)",
      description: "Customers with no activity in 12+ months",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Attrition"
    },
    {
      name: "customer_churn_rate",
      displayName: "Customer Churn Rate",
      formula: "(COUNT(DISTINCT churned_customer_id) / NULLIF(COUNT(DISTINCT beginning_customer_id), 0)) * 100",
      description: "Percentage of customers who churned",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Attrition"
    }
  ],

  attributes: [
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "segment_code",
      dataType: "String",
      description: "Customer segment (Mass Market, Mass Affluent, Affluent, Student, Senior)",
      lookup: "dim_customer_segment"
    },
    {
      name: "lifecycle_stage",
      displayName: "Lifecycle Stage",
      field: "lifecycle_stage_code",
      dataType: "String",
      description: "Customer lifecycle stage (Prospect, New, Growing, Mature, Declining)",
      lookup: "dim_lifecycle_stage"
    },
    {
      name: "age_bracket",
      displayName: "Age Bracket",
      field: "CASE WHEN age < 25 THEN '18-24' WHEN age < 35 THEN '25-34' WHEN age < 45 THEN '35-44' WHEN age < 55 THEN '45-54' WHEN age < 65 THEN '55-64' ELSE '65+' END",
      dataType: "String",
      description: "Customer age grouping"
    },
    {
      name: "gender",
      displayName: "Gender",
      field: "gender_code",
      dataType: "String",
      description: "Customer gender",
      lookup: "dim_gender"
    },
    {
      name: "marital_status",
      displayName: "Marital Status",
      field: "marital_status_code",
      dataType: "String",
      description: "Customer marital status",
      lookup: "dim_marital_status"
    },
    {
      name: "employment_status",
      displayName: "Employment Status",
      field: "employment_status_code",
      dataType: "String",
      description: "Customer employment status",
      lookup: "dim_employment_status"
    },
    {
      name: "income_bracket",
      displayName: "Income Bracket",
      field: "CASE WHEN annual_income < 30000 THEN '<$30K' WHEN annual_income < 60000 THEN '$30K-$60K' WHEN annual_income < 100000 THEN '$60K-$100K' WHEN annual_income < 200000 THEN '$100K-$200K' ELSE '$200K+' END",
      dataType: "String",
      description: "Annual income grouping"
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
      name: "digital_status",
      displayName: "Digital Banking Status",
      field: "CASE WHEN has_mobile_app = TRUE AND has_online_banking = TRUE THEN 'Fully Digital' WHEN has_online_banking = TRUE THEN 'Online Only' WHEN has_mobile_app = TRUE THEN 'Mobile Only' ELSE 'Non-Digital' END",
      dataType: "String",
      description: "Level of digital banking adoption"
    },
    {
      name: "tenure_bucket",
      displayName: "Tenure Bucket",
      field: "CASE WHEN tenure_months < 12 THEN '<1 Year' WHEN tenure_months < 36 THEN '1-3 Years' WHEN tenure_months < 60 THEN '3-5 Years' WHEN tenure_months < 120 THEN '5-10 Years' ELSE '10+ Years' END",
      dataType: "String",
      description: "Customer tenure grouping"
    }
  ],

  hierarchies: [
    {
      name: "Customer Segment Hierarchy",
      levels: ["Segment", "Subsegment", "Household Type"],
      description: "Customer segmentation drill-down"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City", "Zip Code"],
      description: "Customer location hierarchy"
    },
    {
      name: "Demographic Hierarchy",
      levels: ["Age Bracket", "Income Bracket", "Employment Status"],
      description: "Customer demographic classification"
    },
    {
      name: "Lifecycle Hierarchy",
      levels: ["Lifecycle Stage", "Tenure Bucket", "Engagement Level"],
      description: "Customer lifecycle and engagement"
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week"],
      description: "Temporal analysis hierarchy"
    }
  ],

  folders: [
    {
      name: "Customer Base",
      measures: ["total_retail_customers", "active_customers", "total_households", "customers_per_household"],
      description: "Core customer base metrics",
      icon: "👥"
    },
    {
      name: "Customer Acquisition",
      measures: ["new_customers"],
      description: "New customer onboarding metrics",
      icon: "📈"
    },
    {
      name: "Demographics",
      measures: ["primary_customer_age", "avg_monthly_income"],
      description: "Customer demographic insights",
      icon: "📊"
    },
    {
      name: "Digital Adoption",
      measures: ["digital_customers", "digital_penetration"],
      description: "Digital banking adoption metrics",
      icon: "📱"
    },
    {
      name: "Customer Loyalty",
      measures: ["avg_tenure_months", "high_value_customers"],
      description: "Customer loyalty and value metrics",
      icon: "⭐"
    },
    {
      name: "Cross-Sell & Retention",
      measures: ["products_per_customer", "dormant_customers", "customer_churn_rate"],
      description: "Product penetration and retention",
      icon: "🔄"
    },
    {
      name: "Compliance",
      measures: ["kyc_compliance_rate"],
      description: "Regulatory compliance metrics",
      icon: "🛡️"
    }
  ]
};

export default customerRetailSemanticLayer;
