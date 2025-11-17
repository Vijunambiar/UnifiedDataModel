/**
 * CUSTOMER-COMMERCIAL DOMAIN - SEMANTIC LAYER
 * Business entity management, KYB (Know Your Business), commercial relationships, and corporate hierarchy
 */

export const customerCommercialSemanticLayer = {
  domainId: "customer-commercial",
  domainName: "Customer Commercial",
  
  measures: [
    {
      name: "total_commercial_customers",
      displayName: "Total Commercial Customers",
      formula: "COUNT(DISTINCT customer_id)",
      description: "Total number of commercial banking customers",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "total_relationship_value",
      displayName: "Total Relationship Value",
      formula: "SUM(total_deposits + total_loans + treasury_balances)",
      description: "Total value of all commercial relationships",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "avg_relationship_value",
      displayName: "Average Relationship Value",
      formula: "AVG(total_deposits + total_loans + treasury_balances)",
      description: "Average value per commercial customer relationship",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "new_customers_acquired",
      displayName: "New Customers Acquired",
      formula: "COUNT(DISTINCT CASE WHEN relationship_start_date >= DATEADD(month, -1, CURRENT_DATE) THEN customer_id END)",
      description: "Number of new commercial customers onboarded",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Growth"
    },
    {
      name: "customer_churn_count",
      displayName: "Customer Churn Count",
      formula: "COUNT(DISTINCT CASE WHEN relationship_status = 'Closed' THEN customer_id END)",
      description: "Number of commercial customers who left",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Attrition"
    },
    {
      name: "customer_retention_rate",
      displayName: "Customer Retention Rate",
      formula: "((beginning_customers - churned_customers) / beginning_customers) * 100",
      description: "Percentage of commercial customers retained",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Retention"
    },
    {
      name: "total_revenue",
      displayName: "Total Revenue",
      formula: "SUM(interest_income + fee_income + fx_revenue + treasury_fees)",
      description: "Total revenue from commercial customers",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "revenue_per_customer",
      displayName: "Revenue Per Customer",
      formula: "total_revenue / total_commercial_customers",
      description: "Average revenue per commercial customer",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "products_per_customer",
      displayName: "Products Per Customer",
      formula: "AVG(number_of_products)",
      description: "Average number of products held per customer",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "0.00",
      category: "Cross-Sell"
    },
    {
      name: "wallet_share_percentage",
      displayName: "Wallet Share %",
      formula: "(bank_business_volume / total_customer_banking_volume) * 100",
      description: "Percentage of customer's total banking business",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Market Share"
    },
    {
      name: "kyb_reviews_completed",
      displayName: "KYB Reviews Completed",
      formula: "COUNT(DISTINCT kyb_review_id)",
      description: "Number of Know Your Business reviews completed",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Compliance"
    },
    {
      name: "avg_kyb_completion_days",
      displayName: "Average KYB Completion Time",
      formula: "AVG(DATEDIFF(day, review_start_date, review_complete_date))",
      description: "Average days to complete KYB review",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Efficiency"
    },
    {
      name: "high_risk_customers",
      displayName: "High Risk Customers",
      formula: "COUNT(DISTINCT CASE WHEN risk_rating = 'High' THEN customer_id END)",
      description: "Number of high-risk commercial customers",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Risk"
    },
    {
      name: "annual_revenue_under_5m",
      displayName: "Customers <$5M Revenue",
      formula: "COUNT(DISTINCT CASE WHEN annual_revenue < 5000000 THEN customer_id END)",
      description: "Small business customers (annual revenue <$5M)",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Segmentation"
    },
    {
      name: "annual_revenue_5m_to_500m",
      displayName: "Customers $5M-$500M Revenue",
      formula: "COUNT(DISTINCT CASE WHEN annual_revenue BETWEEN 5000000 AND 500000000 THEN customer_id END)",
      description: "Middle market customers ($5M-$500M annual revenue)",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Segmentation"
    },
    {
      name: "annual_revenue_over_500m",
      displayName: "Customers >$500M Revenue",
      formula: "COUNT(DISTINCT CASE WHEN annual_revenue > 500000000 THEN customer_id END)",
      description: "Large corporate customers (>$500M annual revenue)",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Segmentation"
    },
    {
      name: "avg_relationship_tenure_years",
      displayName: "Average Relationship Tenure",
      formula: "AVG(DATEDIFF(year, relationship_start_date, CURRENT_DATE))",
      description: "Average length of commercial customer relationships",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Retention"
    },
    {
      name: "nps_score",
      displayName: "Net Promoter Score",
      formula: "((promoters / total_responses) - (detractors / total_responses)) * 100",
      description: "Commercial customer Net Promoter Score",
      dataType: "Number",
      aggregation: "CALCULATED",
      format: "#,##0",
      category: "Satisfaction"
    }
  ],

  attributes: [
    {
      name: "business_type",
      displayName: "Business Type",
      field: "business_type",
      dataType: "String",
      description: "Type of business entity (Corporation, LLC, Partnership, Sole Proprietor)",
      lookup: "dim_business_type"
    },
    {
      name: "industry",
      displayName: "Industry",
      field: "industry_name",
      dataType: "String",
      description: "Industry classification (NAICS code)",
      lookup: "dim_industry"
    },
    {
      name: "company_size",
      displayName: "Company Size",
      field: "CASE WHEN annual_revenue < 5000000 THEN 'Small Business' WHEN annual_revenue < 500000000 THEN 'Middle Market' ELSE 'Large Corporate' END",
      dataType: "String",
      description: "Revenue-based company size segment"
    },
    {
      name: "relationship_manager",
      displayName: "Relationship Manager",
      field: "rm_name",
      dataType: "String",
      description: "Assigned relationship manager",
      lookup: "dim_relationship_manager"
    },
    {
      name: "risk_rating",
      displayName: "Risk Rating",
      field: "risk_rating",
      dataType: "String",
      description: "Customer risk classification (Low, Medium, High)",
      lookup: "dim_risk_rating"
    },
    {
      name: "relationship_status",
      displayName: "Relationship Status",
      field: "status",
      dataType: "String",
      description: "Current relationship status (Active, At Risk, Closed)",
      lookup: "dim_relationship_status"
    },
    {
      name: "geographic_region",
      displayName: "Geographic Region",
      field: "region_name",
      dataType: "String",
      description: "Primary operating region",
      lookup: "dim_geography"
    },
    {
      name: "ownership_structure",
      displayName: "Ownership Structure",
      field: "ownership_type",
      dataType: "String",
      description: "Ownership type (Public, Private, Government, Non-Profit)",
      lookup: "dim_ownership"
    },
    {
      name: "kyb_status",
      displayName: "KYB Status",
      field: "kyb_status",
      dataType: "String",
      description: "Know Your Business compliance status",
      lookup: "dim_kyb_status"
    },
    {
      name: "customer_tier",
      displayName: "Customer Tier",
      field: "tier",
      dataType: "String",
      description: "Service tier (Platinum, Gold, Silver, Bronze)",
      lookup: "dim_customer_tier"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis of commercial relationships"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City", "Branch"],
      description: "Geographic breakdown of commercial customers"
    },
    {
      name: "Industry Hierarchy",
      levels: ["Sector", "Industry Group", "Industry", "NAICS Code"],
      description: "Industry classification and segmentation"
    },
    {
      name: "Company Size Hierarchy",
      levels: ["Segment", "Revenue Band", "Company Size"],
      description: "Revenue-based customer segmentation"
    },
    {
      name: "Relationship Hierarchy",
      levels: ["Region", "Team", "Relationship Manager", "Customer"],
      description: "Relationship manager organizational structure"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_commercial_customers", "total_relationship_value", "avg_relationship_value"],
      description: "Commercial customer portfolio metrics",
      icon: "🏢"
    },
    {
      name: "Growth & Retention",
      measures: ["new_customers_acquired", "customer_churn_count", "customer_retention_rate", "avg_relationship_tenure_years"],
      description: "Customer acquisition and retention",
      icon: "📈"
    },
    {
      name: "Revenue & Profitability",
      measures: ["total_revenue", "revenue_per_customer"],
      description: "Revenue metrics from commercial relationships",
      icon: "💰"
    },
    {
      name: "Cross-Sell & Wallet Share",
      measures: ["products_per_customer", "wallet_share_percentage"],
      description: "Product penetration and market share",
      icon: "🎯"
    },
    {
      name: "Segmentation",
      measures: ["annual_revenue_under_5m", "annual_revenue_5m_to_500m", "annual_revenue_over_500m"],
      description: "Customer segmentation by revenue size",
      icon: "📊"
    },
    {
      name: "Compliance & Risk",
      measures: ["kyb_reviews_completed", "avg_kyb_completion_days", "high_risk_customers"],
      description: "KYB and risk management metrics",
      icon: "🛡️"
    },
    {
      name: "Customer Satisfaction",
      measures: ["nps_score"],
      description: "Commercial customer satisfaction metrics",
      icon: "⭐"
    }
  ]
};

export default customerCommercialSemanticLayer;
