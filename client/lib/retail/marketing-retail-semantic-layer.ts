/**
 * MARKETING-RETAIL DOMAIN - SEMANTIC LAYER
 * Campaign management, lead generation, customer segmentation, and marketing analytics
 */

export const marketingRetailSemanticLayer = {
  domainId: "marketing-retail",
  domainName: "Marketing Retail",
  
  measures: [
    {
      name: "total_campaigns",
      displayName: "Total Campaigns",
      formula: "COUNT(DISTINCT campaign_id)",
      description: "Total number of marketing campaigns executed",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Campaigns"
    },
    {
      name: "total_campaign_cost",
      displayName: "Total Campaign Cost",
      formula: "SUM(campaign_cost)",
      description: "Total spend across all marketing campaigns",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Investment"
    },
    {
      name: "total_leads_generated",
      displayName: "Total Leads Generated",
      formula: "COUNT(DISTINCT lead_id)",
      description: "Total number of leads generated from campaigns",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Leads"
    },
    {
      name: "total_conversions",
      displayName: "Total Conversions",
      formula: "COUNT(DISTINCT CASE WHEN is_converted = 1 THEN lead_id END)",
      description: "Number of leads that converted to customers",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Conversions"
    },
    {
      name: "conversion_rate",
      displayName: "Conversion Rate",
      formula: "(total_conversions / total_leads_generated) * 100",
      description: "Percentage of leads that convert to customers",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    },
    {
      name: "cost_per_lead",
      displayName: "Cost Per Lead (CPL)",
      formula: "total_campaign_cost / total_leads_generated",
      description: "Average cost to acquire one lead",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Efficiency"
    },
    {
      name: "cost_per_acquisition",
      displayName: "Cost Per Acquisition (CPA)",
      formula: "total_campaign_cost / total_conversions",
      description: "Average cost to acquire one customer",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Efficiency"
    },
    {
      name: "total_revenue_generated",
      displayName: "Total Revenue Generated",
      formula: "SUM(revenue_attributed)",
      description: "Total revenue attributed to marketing campaigns",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "return_on_ad_spend",
      displayName: "Return on Ad Spend (ROAS)",
      formula: "(total_revenue_generated / total_campaign_cost) * 100",
      description: "Revenue generated per dollar spent on marketing",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "ROI"
    },
    {
      name: "total_impressions",
      displayName: "Total Impressions",
      formula: "SUM(impression_count)",
      description: "Total number of ad impressions served",
      dataType: "Number",
      aggregation: "SUM",
      format: "#,##0",
      category: "Reach"
    },
    {
      name: "total_clicks",
      displayName: "Total Clicks",
      formula: "SUM(click_count)",
      description: "Total number of ad clicks",
      dataType: "Number",
      aggregation: "SUM",
      format: "#,##0",
      category: "Engagement"
    },
    {
      name: "click_through_rate",
      displayName: "Click-Through Rate (CTR)",
      formula: "(total_clicks / total_impressions) * 100",
      description: "Percentage of impressions that result in clicks",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    },
    {
      name: "email_open_rate",
      displayName: "Email Open Rate",
      formula: "(emails_opened / emails_sent) * 100",
      description: "Percentage of emails opened",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Email"
    },
    {
      name: "email_click_rate",
      displayName: "Email Click Rate",
      formula: "(email_clicks / emails_sent) * 100",
      description: "Percentage of emails that result in clicks",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Email"
    },
    {
      name: "customer_lifetime_value",
      displayName: "Customer Lifetime Value (CLV)",
      formula: "AVG(lifetime_value)",
      description: "Average lifetime value of acquired customers",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Value"
    },
    {
      name: "marketing_roi",
      displayName: "Marketing ROI",
      formula: "((total_revenue_generated - total_campaign_cost) / total_campaign_cost) * 100",
      description: "Return on investment for marketing campaigns",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "ROI"
    },
    {
      name: "customer_acquisition_cost",
      displayName: "Customer Acquisition Cost (CAC)",
      formula: "total_campaign_cost / new_customers_acquired",
      description: "Total cost to acquire a new customer",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Efficiency"
    },
    {
      name: "brand_awareness_score",
      displayName: "Brand Awareness Score",
      formula: "AVG(awareness_score)",
      description: "Average brand awareness score from surveys",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Brand"
    }
  ],

  attributes: [
    {
      name: "campaign_name",
      displayName: "Campaign Name",
      field: "campaign_name",
      dataType: "String",
      description: "Name of marketing campaign",
      lookup: "dim_campaign"
    },
    {
      name: "campaign_type",
      displayName: "Campaign Type",
      field: "campaign_type",
      dataType: "String",
      description: "Type of campaign (Acquisition, Retention, Cross-sell)",
      lookup: "dim_campaign_type"
    },
    {
      name: "channel",
      displayName: "Marketing Channel",
      field: "channel_name",
      dataType: "String",
      description: "Marketing channel (Email, Social, Display, Search)",
      lookup: "dim_marketing_channel"
    },
    {
      name: "segment",
      displayName: "Target Segment",
      field: "segment_name",
      dataType: "String",
      description: "Customer segment targeted",
      lookup: "dim_customer_segment"
    },
    {
      name: "product_promoted",
      displayName: "Product Promoted",
      field: "product_name",
      dataType: "String",
      description: "Product or service being promoted",
      lookup: "dim_product"
    },
    {
      name: "campaign_status",
      displayName: "Campaign Status",
      field: "status",
      dataType: "String",
      description: "Current status (Draft, Active, Paused, Completed)",
      lookup: "dim_campaign_status"
    },
    {
      name: "audience_size",
      displayName: "Audience Size",
      field: "CASE WHEN target_size < 1000 THEN 'Small' WHEN target_size < 10000 THEN 'Medium' ELSE 'Large' END",
      dataType: "String",
      description: "Size of target audience"
    },
    {
      name: "campaign_objective",
      displayName: "Campaign Objective",
      field: "objective",
      dataType: "String",
      description: "Primary objective (Awareness, Consideration, Conversion)",
      lookup: "dim_objective"
    },
    {
      name: "creative_type",
      displayName: "Creative Type",
      field: "creative_type",
      dataType: "String",
      description: "Type of creative asset (Image, Video, Text)",
      lookup: "dim_creative_type"
    },
    {
      name: "attribution_model",
      displayName: "Attribution Model",
      field: "attribution_model",
      dataType: "String",
      description: "Model used for attribution (First-touch, Last-touch, Multi-touch)"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis of marketing activities"
    },
    {
      name: "Campaign Hierarchy",
      levels: ["Campaign Category", "Campaign Type", "Campaign Name", "Creative Variant"],
      description: "Campaign classification and breakdown"
    },
    {
      name: "Channel Hierarchy",
      levels: ["Channel Category", "Channel", "Subchannel", "Platform"],
      description: "Marketing channel breakdown"
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Category", "Product Line", "Product"],
      description: "Products being promoted in campaigns"
    },
    {
      name: "Customer Hierarchy",
      levels: ["Segment", "Subsegment", "Persona"],
      description: "Target audience segmentation"
    }
  ],

  folders: [
    {
      name: "Campaign Overview",
      measures: ["total_campaigns", "total_campaign_cost", "total_revenue_generated", "marketing_roi"],
      description: "High-level campaign performance metrics",
      icon: "📢"
    },
    {
      name: "Lead Generation",
      measures: ["total_leads_generated", "total_conversions", "conversion_rate"],
      description: "Lead generation and conversion metrics",
      icon: "🎯"
    },
    {
      name: "Cost Efficiency",
      measures: ["cost_per_lead", "cost_per_acquisition", "customer_acquisition_cost"],
      description: "Marketing cost efficiency metrics",
      icon: "💰"
    },
    {
      name: "Digital Performance",
      measures: ["total_impressions", "total_clicks", "click_through_rate"],
      description: "Digital advertising performance",
      icon: "🖱️"
    },
    {
      name: "Email Marketing",
      measures: ["email_open_rate", "email_click_rate"],
      description: "Email campaign performance",
      icon: "📧"
    },
    {
      name: "ROI & Value",
      measures: ["return_on_ad_spend", "marketing_roi", "customer_lifetime_value"],
      description: "Return on investment and customer value",
      icon: "📊"
    }
  ]
};

export default marketingRetailSemanticLayer;
