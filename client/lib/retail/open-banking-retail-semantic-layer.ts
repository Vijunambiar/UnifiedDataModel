/**
 * OPEN-BANKING-RETAIL DOMAIN - SEMANTIC LAYER
 * Open Banking APIs, third-party access, consent management, and API analytics
 */

export const openBankingRetailSemanticLayer = {
  domainId: "open-banking-retail",
  domainName: "Open Banking Retail",
  
  measures: [
    {
      name: "total_api_calls",
      displayName: "Total API Calls",
      formula: "COUNT(api_call_id)",
      description: "Total number of Open Banking API calls",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Volume"
    },
    {
      name: "total_active_consents",
      displayName: "Total Active Consents",
      formula: "COUNT(DISTINCT CASE WHEN consent_status = 'Active' THEN consent_id END)",
      description: "Number of active customer consents for data sharing",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Consents"
    },
    {
      name: "total_connected_customers",
      displayName: "Total Connected Customers",
      formula: "COUNT(DISTINCT customer_id WHERE has_active_consent = 1)",
      description: "Number of customers with active open banking connections",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Adoption"
    },
    {
      name: "total_tpp_providers",
      displayName: "Total Third-Party Providers",
      formula: "COUNT(DISTINCT tpp_id)",
      description: "Number of registered third-party providers",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Ecosystem"
    },
    {
      name: "api_success_rate",
      displayName: "API Success Rate",
      formula: "(successful_api_calls / total_api_calls) * 100",
      description: "Percentage of successful API calls",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    },
    {
      name: "avg_api_response_time_ms",
      displayName: "Average API Response Time",
      formula: "AVG(response_time_ms)",
      description: "Average API response time in milliseconds",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Performance"
    },
    {
      name: "api_availability_percentage",
      displayName: "API Availability %",
      formula: "(uptime_minutes / total_minutes) * 100",
      description: "API uptime percentage (SLA target: 99.5%)",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "SLA"
    },
    {
      name: "consent_approval_rate",
      displayName: "Consent Approval Rate",
      formula: "(approved_consents / consent_requests) * 100",
      description: "Percentage of consent requests approved by customers",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Consents"
    },
    {
      name: "consent_revocation_rate",
      displayName: "Consent Revocation Rate",
      formula: "(revoked_consents / total_active_consents) * 100",
      description: "Percentage of consents revoked by customers",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Consents"
    },
    {
      name: "avg_consent_duration_days",
      displayName: "Average Consent Duration",
      formula: "AVG(DATEDIFF(day, consent_granted_date, consent_expiry_date))",
      description: "Average duration of customer consents",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Consents"
    },
    {
      name: "total_ais_requests",
      displayName: "Total AIS Requests",
      formula: "COUNT(CASE WHEN api_type = 'Account Information Service' THEN api_call_id END)",
      description: "Account Information Service API requests",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Services"
    },
    {
      name: "total_pis_transactions",
      displayName: "Total PIS Transactions",
      formula: "COUNT(CASE WHEN api_type = 'Payment Initiation Service' THEN api_call_id END)",
      description: "Payment Initiation Service transactions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Services"
    },
    {
      name: "total_pis_value",
      displayName: "Total PIS Transaction Value",
      formula: "SUM(CASE WHEN api_type = 'Payment Initiation Service' THEN transaction_amount END)",
      description: "Total value of payments initiated via PIS",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Payments"
    },
    {
      name: "total_security_incidents",
      displayName: "Total Security Incidents",
      formula: "COUNT(incident_id)",
      description: "Number of security incidents related to Open Banking",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Security"
    },
    {
      name: "api_error_rate",
      displayName: "API Error Rate",
      formula: "(failed_api_calls / total_api_calls) * 100",
      description: "Percentage of API calls that failed",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "oauth_token_count",
      displayName: "Active OAuth Tokens",
      formula: "COUNT(DISTINCT CASE WHEN token_status = 'Active' THEN token_id END)",
      description: "Number of active OAuth access tokens",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Security"
    },
    {
      name: "avg_tokens_per_customer",
      displayName: "Average Tokens Per Customer",
      formula: "oauth_token_count / total_connected_customers",
      description: "Average number of tokens per connected customer",
      dataType: "Decimal",
      aggregation: "CALCULATED",
      format: "0.00",
      category: "Adoption"
    },
    {
      name: "regulatory_compliance_score",
      displayName: "Regulatory Compliance Score",
      formula: "AVG(compliance_score)",
      description: "Average compliance score for regulatory requirements",
      dataType: "Percentage",
      aggregation: "AVG",
      format: "0.00%",
      category: "Compliance"
    }
  ],

  attributes: [
    {
      name: "api_endpoint",
      displayName: "API Endpoint",
      field: "endpoint_path",
      dataType: "String",
      description: "Open Banking API endpoint called",
      lookup: "dim_api_endpoint"
    },
    {
      name: "api_category",
      displayName: "API Category",
      field: "api_category",
      dataType: "String",
      description: "Category of API (AIS, PIS, CBPII, AISP)",
      lookup: "dim_api_category"
    },
    {
      name: "tpp_name",
      displayName: "Third-Party Provider",
      field: "tpp_name",
      dataType: "String",
      description: "Name of the third-party provider",
      lookup: "dim_tpp"
    },
    {
      name: "tpp_category",
      displayName: "TPP Category",
      field: "tpp_category",
      dataType: "String",
      description: "Category of TPP (Fintech, Aggregator, Payment Provider)",
      lookup: "dim_tpp_category"
    },
    {
      name: "consent_type",
      displayName: "Consent Type",
      field: "consent_type",
      dataType: "String",
      description: "Type of consent (Account Access, Payment, Balance Check)",
      lookup: "dim_consent_type"
    },
    {
      name: "consent_status",
      displayName: "Consent Status",
      field: "consent_status",
      dataType: "String",
      description: "Status of consent (Active, Expired, Revoked, Rejected)",
      lookup: "dim_consent_status"
    },
    {
      name: "authentication_method",
      displayName: "Authentication Method",
      field: "auth_method",
      dataType: "String",
      description: "Method used for authentication (OAuth 2.0, SCA)",
      lookup: "dim_auth_method"
    },
    {
      name: "response_code",
      displayName: "HTTP Response Code",
      field: "http_status_code",
      dataType: "String",
      description: "HTTP response status code (200, 400, 401, 500)"
    },
    {
      name: "regulatory_framework",
      displayName: "Regulatory Framework",
      field: "regulation",
      dataType: "String",
      description: "Applicable regulation (PSD2, CMA9, CDR)",
      lookup: "dim_regulation"
    },
    {
      name: "data_scope",
      displayName: "Data Scope",
      field: "CASE WHEN includes_transactions = 1 THEN 'Full Access' ELSE 'Balance Only' END",
      dataType: "String",
      description: "Scope of data shared"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Temporal analysis of API activity"
    },
    {
      name: "API Hierarchy",
      levels: ["API Category", "API Service", "API Endpoint", "API Version"],
      description: "API service classification"
    },
    {
      name: "TPP Hierarchy",
      levels: ["TPP Category", "TPP Type", "TPP Provider"],
      description: "Third-party provider classification"
    },
    {
      name: "Consent Hierarchy",
      levels: ["Consent Category", "Consent Type", "Data Scope"],
      description: "Consent type and scope breakdown"
    },
    {
      name: "Error Hierarchy",
      levels: ["Error Category", "HTTP Status Code", "Error Detail"],
      description: "Error classification and analysis"
    }
  ],

  folders: [
    {
      name: "API Usage & Performance",
      measures: ["total_api_calls", "api_success_rate", "avg_api_response_time_ms", "api_availability_percentage"],
      description: "API volume, performance, and SLA metrics",
      icon: "🔌"
    },
    {
      name: "Consent Management",
      measures: ["total_active_consents", "consent_approval_rate", "consent_revocation_rate", "avg_consent_duration_days"],
      description: "Customer consent metrics",
      icon: "✅"
    },
    {
      name: "Adoption & Ecosystem",
      measures: ["total_connected_customers", "total_tpp_providers", "avg_tokens_per_customer"],
      description: "Open Banking adoption and ecosystem",
      icon: "🌐"
    },
    {
      name: "Services Breakdown",
      measures: ["total_ais_requests", "total_pis_transactions", "total_pis_value"],
      description: "AIS and PIS service metrics",
      icon: "💳"
    },
    {
      name: "Security & Compliance",
      measures: ["total_security_incidents", "oauth_token_count", "regulatory_compliance_score"],
      description: "Security and regulatory compliance",
      icon: "🔒"
    },
    {
      name: "Quality Metrics",
      measures: ["api_error_rate", "api_success_rate"],
      description: "API quality and reliability",
      icon: "⭐"
    }
  ]
};

export default openBankingRetailSemanticLayer;
