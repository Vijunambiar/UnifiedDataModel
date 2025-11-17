/**
 * CUSTOMER-SERVICE-RETAIL DOMAIN - SEMANTIC LAYER
 * Call center operations, case management, customer inquiries, and service quality
 */

export const customerServiceRetailSemanticLayer = {
  domainId: "customer-service-retail",
  domainName: "Customer Service Retail",
  
  measures: [
    {
      name: "total_cases",
      displayName: "Total Service Cases",
      formula: "COUNT(DISTINCT case_id)",
      description: "Total number of customer service cases",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Volume"
    },
    {
      name: "total_calls",
      displayName: "Total Calls",
      formula: "COUNT(call_id)",
      description: "Total number of customer service calls",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Calls"
    },
    {
      name: "total_chat_sessions",
      displayName: "Total Chat Sessions",
      formula: "COUNT(DISTINCT chat_session_id)",
      description: "Total number of live chat sessions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Digital"
    },
    {
      name: "total_emails",
      displayName: "Total Email Inquiries",
      formula: "COUNT(email_id)",
      description: "Total number of email inquiries received",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Digital"
    },
    {
      name: "avg_handle_time_minutes",
      displayName: "Average Handle Time",
      formula: "AVG(handle_time_seconds) / 60",
      description: "Average time to handle a call in minutes",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Efficiency"
    },
    {
      name: "avg_wait_time_seconds",
      displayName: "Average Wait Time",
      formula: "AVG(wait_time_seconds)",
      description: "Average customer wait time in seconds",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Service Level"
    },
    {
      name: "first_call_resolution_rate",
      displayName: "First Call Resolution Rate",
      formula: "(fcr_cases / total_cases) * 100",
      description: "Percentage of cases resolved on first contact",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "service_level_percentage",
      displayName: "Service Level %",
      formula: "(calls_answered_within_sla / total_calls) * 100",
      description: "Percentage of calls answered within service level agreement",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Service Level"
    },
    {
      name: "customer_satisfaction_score",
      displayName: "Customer Satisfaction (CSAT)",
      formula: "AVG(satisfaction_score)",
      description: "Average customer satisfaction score (1-5 scale)",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "0.00",
      category: "Satisfaction"
    },
    {
      name: "net_promoter_score",
      displayName: "Net Promoter Score (NPS)",
      formula: "((promoters / total_responses) - (detractors / total_responses)) * 100",
      description: "Net Promoter Score calculation",
      dataType: "Number",
      aggregation: "CALCULATED",
      format: "#,##0",
      category: "Satisfaction"
    },
    {
      name: "avg_resolution_time_hours",
      displayName: "Average Resolution Time",
      formula: "AVG(DATEDIFF(hour, case_open_time, case_close_time))",
      description: "Average time to resolve a case in hours",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Efficiency"
    },
    {
      name: "escalation_rate",
      displayName: "Escalation Rate",
      formula: "(escalated_cases / total_cases) * 100",
      description: "Percentage of cases escalated to higher tier",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "abandon_rate",
      displayName: "Call Abandon Rate",
      formula: "(abandoned_calls / total_calls) * 100",
      description: "Percentage of calls abandoned by customers",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Service Level"
    },
    {
      name: "agent_utilization",
      displayName: "Agent Utilization Rate",
      formula: "(productive_time / total_available_time) * 100",
      description: "Percentage of time agents spend on productive activities",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Productivity"
    },
    {
      name: "total_agents",
      displayName: "Total Agents",
      formula: "COUNT(DISTINCT agent_id)",
      description: "Total number of customer service agents",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Resources"
    },
    {
      name: "cases_per_agent",
      displayName: "Cases Per Agent",
      formula: "total_cases / total_agents",
      description: "Average number of cases handled per agent",
      dataType: "Decimal",
      aggregation: "CALCULATED",
      format: "#,##0.0",
      category: "Productivity"
    },
    {
      name: "self_service_rate",
      displayName: "Self-Service Rate",
      formula: "(self_service_resolutions / total_inquiries) * 100",
      description: "Percentage of inquiries resolved via self-service",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Digital"
    },
    {
      name: "quality_score",
      displayName: "Quality Assurance Score",
      formula: "AVG(qa_score)",
      description: "Average quality assurance score for agent interactions",
      dataType: "Percentage",
      aggregation: "AVG",
      format: "0.00%",
      category: "Quality"
    }
  ],

  attributes: [
    {
      name: "case_type",
      displayName: "Case Type",
      field: "case_type",
      dataType: "String",
      description: "Type of service case (Account Inquiry, Transaction Dispute, Product Question)",
      lookup: "dim_case_type"
    },
    {
      name: "channel",
      displayName: "Service Channel",
      field: "channel_name",
      dataType: "String",
      description: "Channel used for contact (Phone, Chat, Email, Social)",
      lookup: "dim_channel"
    },
    {
      name: "priority",
      displayName: "Case Priority",
      field: "priority_level",
      dataType: "String",
      description: "Priority level (Critical, High, Medium, Low)",
      lookup: "dim_priority"
    },
    {
      name: "case_status",
      displayName: "Case Status",
      field: "status",
      dataType: "String",
      description: "Current status (Open, In Progress, Resolved, Closed, Escalated)",
      lookup: "dim_status"
    },
    {
      name: "resolution_category",
      displayName: "Resolution Category",
      field: "resolution_category",
      dataType: "String",
      description: "How case was resolved (Resolved, Escalated, Transferred)",
      lookup: "dim_resolution"
    },
    {
      name: "agent_tier",
      displayName: "Agent Tier",
      field: "tier",
      dataType: "String",
      description: "Agent tier level (Tier 1, Tier 2, Tier 3)",
      lookup: "dim_agent_tier"
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
      name: "topic_category",
      displayName: "Topic Category",
      field: "topic",
      dataType: "String",
      description: "Topic of inquiry (Account, Transaction, Card, Loan)",
      lookup: "dim_topic"
    },
    {
      name: "sentiment",
      displayName: "Customer Sentiment",
      field: "sentiment",
      dataType: "String",
      description: "Customer sentiment (Positive, Neutral, Negative)",
      lookup: "dim_sentiment"
    },
    {
      name: "time_of_day",
      displayName: "Time of Day",
      field: "CASE WHEN HOUR(contact_time) < 12 THEN 'Morning' WHEN HOUR(contact_time) < 17 THEN 'Afternoon' ELSE 'Evening' END",
      dataType: "String",
      description: "Time period of contact"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Temporal analysis of service interactions"
    },
    {
      name: "Case Type Hierarchy",
      levels: ["Case Category", "Case Type", "Case Subtype"],
      description: "Classification of service cases"
    },
    {
      name: "Agent Hierarchy",
      levels: ["Team", "Supervisor", "Tier", "Agent"],
      description: "Agent organizational structure"
    },
    {
      name: "Channel Hierarchy",
      levels: ["Channel Category", "Channel", "Subchannel"],
      description: "Service channel breakdown"
    },
    {
      name: "Resolution Hierarchy",
      levels: ["Resolution Category", "Resolution Type", "Resolution Method"],
      description: "Case resolution classification"
    }
  ],

  folders: [
    {
      name: "Volume & Activity",
      measures: ["total_cases", "total_calls", "total_chat_sessions", "total_emails"],
      description: "Service volume and activity metrics",
      icon: "📞"
    },
    {
      name: "Service Level",
      measures: ["service_level_percentage", "avg_wait_time_seconds", "abandon_rate"],
      description: "Service level performance metrics",
      icon: "⏱️"
    },
    {
      name: "Quality & Resolution",
      measures: ["first_call_resolution_rate", "avg_resolution_time_hours", "escalation_rate", "quality_score"],
      description: "Service quality and resolution metrics",
      icon: "⭐"
    },
    {
      name: "Customer Satisfaction",
      measures: ["customer_satisfaction_score", "net_promoter_score"],
      description: "Customer satisfaction and loyalty metrics",
      icon: "😊"
    },
    {
      name: "Agent Performance",
      measures: ["avg_handle_time_minutes", "agent_utilization", "cases_per_agent", "total_agents"],
      description: "Agent productivity and performance",
      icon: "👥"
    },
    {
      name: "Digital & Self-Service",
      measures: ["self_service_rate", "total_chat_sessions"],
      description: "Digital service channel metrics",
      icon: "💻"
    }
  ]
};

export default customerServiceRetailSemanticLayer;
