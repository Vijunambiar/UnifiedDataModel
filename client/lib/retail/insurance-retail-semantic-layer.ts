/**
 * INSURANCE-RETAIL DOMAIN - SEMANTIC LAYER
 * Insurance products (life, auto, home), policy management, claims, and commissions
 */

export const insuranceRetailSemanticLayer = {
  domainId: "insurance-retail",
  domainName: "Insurance Retail",
  
  measures: [
    {
      name: "total_policies",
      displayName: "Total Active Policies",
      formula: "COUNT(DISTINCT CASE WHEN status = 'Active' THEN policy_id END)",
      description: "Total number of active insurance policies",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "total_premium_revenue",
      displayName: "Total Premium Revenue",
      formula: "SUM(premium_amount)",
      description: "Total insurance premium revenue collected",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "avg_premium_per_policy",
      displayName: "Average Premium Per Policy",
      formula: "AVG(premium_amount)",
      description: "Average premium amount per policy",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "new_policies_sold",
      displayName: "New Policies Sold",
      formula: "COUNT(DISTINCT CASE WHEN issue_date >= DATEADD(month, -1, CURRENT_DATE) THEN policy_id END)",
      description: "Number of new policies issued",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Sales"
    },
    {
      name: "policies_lapsed",
      displayName: "Policies Lapsed",
      formula: "COUNT(DISTINCT CASE WHEN status = 'Lapsed' THEN policy_id END)",
      description: "Number of policies that lapsed due to non-payment",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Attrition"
    },
    {
      name: "persistency_rate",
      displayName: "Persistency Rate",
      formula: "((beginning_policies - lapsed_policies) / beginning_policies) * 100",
      description: "Percentage of policies that remain in force",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Retention"
    },
    {
      name: "total_claims",
      displayName: "Total Claims",
      formula: "COUNT(claim_id)",
      description: "Total number of insurance claims filed",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Claims"
    },
    {
      name: "total_claims_paid",
      displayName: "Total Claims Paid",
      formula: "SUM(claim_paid_amount)",
      description: "Total amount paid out for claims",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Claims"
    },
    {
      name: "avg_claim_amount",
      displayName: "Average Claim Amount",
      formula: "AVG(claim_paid_amount)",
      description: "Average payout per claim",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Claims"
    },
    {
      name: "loss_ratio",
      displayName: "Loss Ratio",
      formula: "(total_claims_paid / total_premium_revenue) * 100",
      description: "Claims paid as percentage of premiums collected",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Profitability"
    },
    {
      name: "total_coverage_amount",
      displayName: "Total Coverage Amount",
      formula: "SUM(coverage_amount)",
      description: "Total sum insured across all policies",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "avg_coverage_per_policy",
      displayName: "Average Coverage Per Policy",
      formula: "AVG(coverage_amount)",
      description: "Average sum insured per policy",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_commission_paid",
      displayName: "Total Commission Paid",
      formula: "SUM(commission_amount)",
      description: "Total commissions paid to agents/brokers",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Expense"
    },
    {
      name: "commission_rate",
      displayName: "Average Commission Rate",
      formula: "(total_commission_paid / total_premium_revenue) * 100",
      description: "Commission as percentage of premium",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Expense"
    },
    {
      name: "claim_approval_rate",
      displayName: "Claim Approval Rate",
      formula: "(approved_claims / total_claims) * 100",
      description: "Percentage of claims approved for payment",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Claims"
    },
    {
      name: "avg_claim_processing_days",
      displayName: "Average Claim Processing Time",
      formula: "AVG(DATEDIFF(day, claim_date, settlement_date))",
      description: "Average days to process and settle a claim",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Efficiency"
    },
    {
      name: "underwriting_profit",
      displayName: "Underwriting Profit",
      formula: "total_premium_revenue - total_claims_paid - total_commission_paid - operating_expenses",
      description: "Profit from insurance underwriting",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Profitability"
    },
    {
      name: "combined_ratio",
      displayName: "Combined Ratio",
      formula: "((total_claims_paid + operating_expenses) / total_premium_revenue) * 100",
      description: "Total expenses as percentage of premiums (target <100%)",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Profitability"
    }
  ],

  attributes: [
    {
      name: "policy_type",
      displayName: "Policy Type",
      field: "policy_type",
      dataType: "String",
      description: "Type of insurance (Life, Auto, Home, Health, Umbrella)",
      lookup: "dim_policy_type"
    },
    {
      name: "product_name",
      displayName: "Product Name",
      field: "product_name",
      dataType: "String",
      description: "Specific insurance product",
      lookup: "dim_product"
    },
    {
      name: "policy_status",
      displayName: "Policy Status",
      field: "status",
      dataType: "String",
      description: "Current policy status (Active, Lapsed, Cancelled, Expired)",
      lookup: "dim_policy_status"
    },
    {
      name: "premium_frequency",
      displayName: "Premium Frequency",
      field: "payment_frequency",
      dataType: "String",
      description: "Premium payment frequency (Monthly, Quarterly, Annual)",
      lookup: "dim_frequency"
    },
    {
      name: "distribution_channel",
      displayName: "Distribution Channel",
      field: "channel_name",
      dataType: "String",
      description: "How policy was sold (Agent, Direct, Broker, Online)",
      lookup: "dim_channel"
    },
    {
      name: "agent_name",
      displayName: "Insurance Agent",
      field: "agent_name",
      dataType: "String",
      description: "Insurance agent who sold the policy",
      lookup: "dim_agent"
    },
    {
      name: "claim_type",
      displayName: "Claim Type",
      field: "claim_type",
      dataType: "String",
      description: "Type of claim (Death, Accident, Property Damage, Theft)",
      lookup: "dim_claim_type"
    },
    {
      name: "claim_status",
      displayName: "Claim Status",
      field: "claim_status",
      dataType: "String",
      description: "Status of claim (Pending, Approved, Denied, Settled)",
      lookup: "dim_claim_status"
    },
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "segment_name",
      dataType: "String",
      description: "Customer segment classification",
      lookup: "dim_customer_segment"
    },
    {
      name: "coverage_tier",
      displayName: "Coverage Tier",
      field: "CASE WHEN coverage_amount < 100000 THEN 'Basic' WHEN coverage_amount < 500000 THEN 'Standard' ELSE 'Premium' END",
      dataType: "String",
      description: "Coverage tier based on sum insured"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis of insurance operations"
    },
    {
      name: "Product Hierarchy",
      levels: ["Insurance Category", "Policy Type", "Product Name"],
      description: "Insurance product classification"
    },
    {
      name: "Distribution Hierarchy",
      levels: ["Channel Category", "Channel", "Agent/Broker"],
      description: "Distribution channel breakdown"
    },
    {
      name: "Claim Hierarchy",
      levels: ["Claim Category", "Claim Type", "Claim Subtype"],
      description: "Claim classification and types"
    },
    {
      name: "Customer Hierarchy",
      levels: ["Segment", "Subsegment", "Customer ID"],
      description: "Customer segmentation"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_policies", "total_premium_revenue", "total_coverage_amount"],
      description: "Insurance portfolio metrics",
      icon: "🏥"
    },
    {
      name: "Sales & Growth",
      measures: ["new_policies_sold", "policies_lapsed", "persistency_rate"],
      description: "New business and retention metrics",
      icon: "📈"
    },
    {
      name: "Claims Management",
      measures: ["total_claims", "total_claims_paid", "avg_claim_amount", "claim_approval_rate", "avg_claim_processing_days"],
      description: "Claims volume, payments, and processing",
      icon: "📋"
    },
    {
      name: "Profitability",
      measures: ["loss_ratio", "combined_ratio", "underwriting_profit"],
      description: "Profitability and loss ratios",
      icon: "💰"
    },
    {
      name: "Distribution",
      measures: ["total_commission_paid", "commission_rate"],
      description: "Distribution costs and commissions",
      icon: "🤝"
    }
  ]
};

export default insuranceRetailSemanticLayer;
