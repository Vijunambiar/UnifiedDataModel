/**
 * CRM ANALYTICS SEMANTIC LAYER
 * 
 * Semantic layer for BI and analytics consumption
 * Provides business-friendly abstractions over CRM gold layer tables
 */

const crmAnalyticsSemanticLayer = {
  name: "CRM Analytics Semantic Layer",
  description: "Business-friendly semantic layer for CRM analytics domain",
  version: "1.0",
  lastUpdated: "2025-01-15",
  
  tables: [
    {
      name: "fact_sales_opportunities",
      description: "Sales opportunity pipeline and metrics",
      columns: [
        { name: "opportunity_id", type: "String", description: "Opportunity identifier" },
        { name: "account_id", type: "String", description: "Associated account" },
        { name: "rep_id", type: "String", description: "Sales representative" },
        { name: "opportunity_name", type: "String", description: "Opportunity name" },
        { name: "amount", type: "Decimal", description: "Opportunity value" },
        { name: "stage", type: "String", description: "Sales stage" },
        { name: "probability", type: "Decimal", description: "Win probability" },
        { name: "close_date", type: "Date", description: "Expected close date" },
        { name: "created_date", type: "Date", description: "Creation date" },
        { name: "is_closed", type: "Boolean", description: "Closed flag" },
        { name: "is_won", type: "Boolean", description: "Won flag" },
        { name: "days_in_pipeline", type: "Integer", description: "Days in sales process" },
      ],
      grain: "One row per opportunity",
    },
    {
      name: "fact_sales_activities",
      description: "Sales rep activities and interactions",
      columns: [
        { name: "activity_id", type: "String", description: "Activity identifier" },
        { name: "contact_id", type: "String", description: "Contact identifier" },
        { name: "account_id", type: "String", description: "Account identifier" },
        { name: "rep_id", type: "String", description: "Sales representative" },
        { name: "activity_type", type: "String", description: "Type: call, email, meeting" },
        { name: "activity_date", type: "Date", description: "Activity date" },
        { name: "duration_minutes", type: "Integer", description: "Duration in minutes" },
        { name: "subject", type: "String", description: "Activity subject" },
        { name: "outcome", type: "String", description: "Activity outcome" },
        { name: "follow_up_flag", type: "Boolean", description: "Follow-up required" },
        { name: "follow_up_date", type: "Date", description: "Scheduled follow-up" },
      ],
      grain: "One row per activity",
    },
    {
      name: "fact_account_health",
      description: "Account relationship health and metrics",
      columns: [
        { name: "account_id", type: "String", description: "Account identifier" },
        { name: "account_name", type: "String", description: "Account name" },
        { name: "health_score", type: "Decimal", description: "Account health score" },
        { name: "pipeline_value", type: "Decimal", description: "Open pipeline value" },
        { name: "ytd_revenue", type: "Decimal", description: "Year-to-date revenue" },
        { name: "growth_rate", type: "Decimal", description: "Revenue growth rate" },
        { name: "win_rate", type: "Decimal", description: "Win rate percentage" },
        { name: "churn_risk_score", type: "Decimal", description: "Churn risk score" },
        { name: "expansion_opportunity_count", type: "Integer", description: "Upsell/cross-sell opportunities" },
        { name: "contract_renewal_date", type: "Date", description: "Next renewal date" },
      ],
      grain: "One row per account",
    },
    {
      name: "fact_contact_engagement",
      description: "Contact-level engagement and activity",
      columns: [
        { name: "contact_id", type: "String", description: "Contact identifier" },
        { name: "contact_name", type: "String", description: "Contact name" },
        { name: "account_id", type: "String", description: "Account identifier" },
        { name: "engagement_score", type: "Decimal", description: "Engagement score" },
        { name: "engagement_level", type: "String", description: "Engagement classification" },
        { name: "activities_30day", type: "Integer", description: "Activities in 30 days" },
        { name: "activities_90day", type: "Integer", description: "Activities in 90 days" },
        { name: "last_activity_days_ago", type: "Integer", description: "Days since last activity" },
        { name: "interaction_frequency", type: "String", description: "Frequency classification" },
        { name: "response_rate", type: "Decimal", description: "Response rate to outreach" },
      ],
      grain: "One row per contact",
    },
    {
      name: "dim_sales_rep",
      description: "Sales representative attributes",
      columns: [
        { name: "rep_id", type: "String", description: "Rep identifier" },
        { name: "rep_name", type: "String", description: "Rep name" },
        { name: "email", type: "String", description: "Email address" },
        { name: "manager_id", type: "String", description: "Manager identifier" },
        { name: "territory", type: "String", description: "Territory assigned" },
        { name: "department", type: "String", description: "Department" },
        { name: "hire_date", type: "Date", description: "Hire date" },
        { name: "is_active", type: "Boolean", description: "Active flag" },
      ],
      grain: "One row per sales representative",
    },
  ],
  
  measures: [
    {
      name: "total_pipeline",
      description: "Total value of open opportunities",
      calculation: "sum(amount where is_closed = false)",
      category: "Pipeline",
    },
    {
      name: "win_rate",
      description: "Percentage of closed opportunities won",
      calculation: "(count(is_won=true) / count(is_closed=true)) * 100",
      category: "Sales Performance",
    },
    {
      name: "average_sales_cycle",
      description: "Average days from creation to close",
      calculation: "avg(days_in_pipeline)",
      category: "Sales Efficiency",
    },
    {
      name: "rep_quota_attainment",
      description: "Sales rep quota achievement percentage",
      calculation: "(actual_revenue / quota) * 100",
      category: "Rep Performance",
    },
    {
      name: "account_health_avg",
      description: "Average account health score",
      calculation: "avg(health_score)",
      category: "Account Management",
    },
    {
      name: "contact_engagement_avg",
      description: "Average contact engagement score",
      calculation: "avg(engagement_score)",
      category: "Engagement",
    },
  ],

  dimensions: [
    {
      name: "account",
      description: "Customer account attributes",
      attributes: ["account_id", "account_name", "industry", "revenue_range", "territory"],
    },
    {
      name: "contact",
      description: "Contact person attributes",
      attributes: ["contact_id", "contact_name", "title", "email", "phone", "account_id"],
    },
    {
      name: "sales_stage",
      description: "Sales process stages",
      attributes: ["stage_id", "stage_name", "stage_order", "win_probability"],
    },
    {
      name: "activity_type",
      description: "Types of sales activities",
      attributes: ["activity_type_id", "activity_type", "category", "avg_duration"],
    },
    {
      name: "time",
      description: "Time dimensions",
      attributes: ["date", "month", "quarter", "year", "week"],
    },
  ],

  folders: [
    {
      name: "Sales Pipeline",
      description: "Opportunity pipeline and forecasting",
      tables: ["fact_sales_opportunities", "dim_sales_rep"],
      measures: ["total_pipeline", "win_rate", "average_sales_cycle"],
    },
    {
      name: "Sales Performance",
      description: "Sales rep and territory performance",
      tables: ["fact_sales_opportunities", "fact_sales_activities"],
      measures: ["rep_quota_attainment", "win_rate"],
    },
    {
      name: "Account Management",
      description: "Account health and relationship metrics",
      tables: ["fact_account_health"],
      measures: ["account_health_avg"],
    },
    {
      name: "Customer Engagement",
      description: "Contact engagement and activity tracking",
      tables: ["fact_contact_engagement", "fact_sales_activities"],
      measures: ["contact_engagement_avg"],
    },
    {
      name: "Sales Activities",
      description: "Sales activity tracking and analysis",
      tables: ["fact_sales_activities", "dim_sales_rep"],
      measures: [],
    },
  ],

  relationshipsMapped: [
    {
      from: "crm_analytics",
      to: "customer_core",
      relationship: "Many-to-One",
      joinKey: "customer_id",
    },
    {
      from: "crm_analytics",
      to: "marketing_orchestration",
      relationship: "One-to-Many",
      joinKey: "campaign_id",
    },
  ],
};

export default crmAnalyticsSemanticLayer;
