/**
 * MARKETING ORCHESTRATION SEMANTIC LAYER
 * 
 * Semantic layer for BI and analytics consumption
 * Provides business-friendly abstractions over gold layer tables
 */

const marketingOrchestrationSemanticLayer = {
  name: "Marketing Orchestration Semantic Layer",
  description: "Business-friendly semantic layer for marketing orchestration domain",
  version: "1.0",
  lastUpdated: "2025-01-15",
  
  tables: [
    {
      name: "fact_nba_decisions",
      description: "Next-Best-Action decisions and outcomes",
      columns: [
        { name: "decision_id", type: "String", description: "Unique decision identifier" },
        { name: "customer_id", type: "String", description: "Customer being targeted" },
        { name: "campaign_id", type: "String", description: "Associated campaign" },
        { name: "offer_id", type: "String", description: "Offer presented" },
        { name: "strategy_id", type: "String", description: "NBA strategy used" },
        { name: "decision_timestamp", type: "DateTime", description: "When decision was made" },
        { name: "accepted_flag", type: "Boolean", description: "Whether offer was accepted" },
        { name: "converted_flag", type: "Boolean", description: "Whether conversion occurred" },
        { name: "decision_confidence", type: "Decimal", description: "Model confidence score" },
        { name: "propensity_score", type: "Decimal", description: "Customer propensity score" },
        { name: "revenue_influenced", type: "Decimal", description: "Revenue from this decision" },
      ],
      grain: "One row per NBA decision",
    },
    {
      name: "fact_campaign_performance",
      description: "Campaign execution and performance metrics",
      columns: [
        { name: "campaign_id", type: "String", description: "Campaign identifier" },
        { name: "campaign_name", type: "String", description: "Campaign name" },
        { name: "sends_count", type: "Integer", description: "Total sends" },
        { name: "opens_count", type: "Integer", description: "Total opens" },
        { name: "clicks_count", type: "Integer", description: "Total clicks" },
        { name: "conversions_count", type: "Integer", description: "Total conversions" },
        { name: "open_rate", type: "Decimal", description: "Calculated open rate" },
        { name: "click_rate", type: "Decimal", description: "Calculated click rate" },
        { name: "conversion_rate", type: "Decimal", description: "Calculated conversion rate" },
        { name: "revenue_generated", type: "Decimal", description: "Campaign revenue" },
        { name: "campaign_cost", type: "Decimal", description: "Campaign cost" },
        { name: "roi", type: "Decimal", description: "Return on investment" },
      ],
      grain: "One row per campaign",
    },
    {
      name: "fact_offer_performance",
      description: "Offer presentation and response tracking",
      columns: [
        { name: "offer_id", type: "String", description: "Offer identifier" },
        { name: "offer_name", type: "String", description: "Offer name" },
        { name: "presentations_count", type: "Integer", description: "Times presented" },
        { name: "views_count", type: "Integer", description: "Times viewed" },
        { name: "clicks_count", type: "Integer", description: "Times clicked" },
        { name: "acceptances_count", type: "Integer", description: "Times accepted" },
        { name: "conversions_count", type: "Integer", description: "Times converted" },
        { name: "view_rate", type: "Decimal", description: "View to presentation ratio" },
        { name: "click_rate", type: "Decimal", description: "Click to view ratio" },
        { name: "acceptance_rate", type: "Decimal", description: "Acceptance rate" },
        { name: "conversion_rate", type: "Decimal", description: "Conversion rate" },
        { name: "revenue_generated", type: "Decimal", description: "Total revenue from offer" },
      ],
      grain: "One row per offer",
    },
    {
      name: "fact_customer_engagement",
      description: "Customer engagement by segment and channel",
      columns: [
        { name: "customer_id", type: "String", description: "Customer identifier" },
        { name: "segment_id", type: "String", description: "Segment identifier" },
        { name: "channel", type: "String", description: "Communication channel" },
        { name: "engagement_score", type: "Decimal", description: "Engagement score" },
        { name: "interaction_count", type: "Integer", description: "Number of interactions" },
        { name: "last_interaction_date", type: "Date", description: "Last interaction date" },
        { name: "engagement_trend", type: "String", description: "Trend direction" },
        { name: "churn_risk_score", type: "Decimal", description: "Churn prediction score" },
      ],
      grain: "One row per customer-segment-channel",
    },
  ],
  
  measures: [
    {
      name: "nba_decision_rate",
      description: "Percentage of interactions with NBA decisions",
      calculation: "(decisions_made / total_interactions) * 100",
      category: "NBA Performance",
    },
    {
      name: "campaign_roi",
      description: "Campaign return on investment",
      calculation: "revenue_generated / campaign_cost",
      category: "Campaign Performance",
    },
    {
      name: "offer_acceptance_rate",
      description: "Percentage of offers accepted",
      calculation: "(acceptances / presentations) * 100",
      category: "Offer Performance",
    },
    {
      name: "customer_engagement_score",
      description: "Customer engagement level",
      calculation: "avg(engagement_score)",
      category: "Customer Engagement",
    },
    {
      name: "revenue_influenced_total",
      description: "Total revenue influenced by orchestration",
      calculation: "sum(revenue_influenced)",
      category: "Business Impact",
    },
  ],

  dimensions: [
    {
      name: "campaign",
      description: "Campaign attributes and properties",
      attributes: ["campaign_id", "campaign_name", "campaign_type", "channel", "status"],
    },
    {
      name: "offer",
      description: "Product offer attributes",
      attributes: ["offer_id", "offer_name", "product_id", "offer_type", "tenure_requirement"],
    },
    {
      name: "customer_segment",
      description: "Customer segment classification",
      attributes: ["segment_id", "segment_name", "priority_level", "size_estimate"],
    },
    {
      name: "time",
      description: "Time dimensions for temporal analysis",
      attributes: ["date", "month", "quarter", "year", "week"],
    },
    {
      name: "channel",
      description: "Communication and delivery channels",
      attributes: ["channel_id", "channel_name", "channel_type", "delivery_medium"],
    },
  ],

  folders: [
    {
      name: "Marketing Orchestration Overview",
      description: "High-level orchestration metrics",
      tables: ["fact_nba_decisions", "fact_campaign_performance"],
      measures: ["nba_decision_rate", "campaign_roi"],
    },
    {
      name: "Campaign Analytics",
      description: "Campaign performance and ROI analysis",
      tables: ["fact_campaign_performance"],
      measures: ["campaign_roi"],
    },
    {
      name: "Offer Management",
      description: "Offer effectiveness and performance",
      tables: ["fact_offer_performance"],
      measures: ["offer_acceptance_rate"],
    },
    {
      name: "Customer Engagement",
      description: "Customer interaction and engagement tracking",
      tables: ["fact_customer_engagement"],
      measures: ["customer_engagement_score"],
    },
  ],

  relationshipsMapped: [
    {
      from: "marketing_orchestration",
      to: "customer_core",
      relationship: "Many-to-One",
      joinKey: "customer_id",
    },
    {
      from: "marketing_orchestration",
      to: "deposits",
      relationship: "Many-to-One",
      joinKey: "product_id",
    },
  ],
};

export default marketingOrchestrationSemanticLayer;
