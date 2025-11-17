/**
 * COMPLIANCE-RETAIL DOMAIN - SEMANTIC LAYER
 * Regulatory compliance, AML/KYC, BSA, OFAC, consumer protection (TILA, EFTA, CARD Act)
 */

export const complianceRetailSemanticLayer = {
  domainId: "compliance-retail",
  domainName: "Compliance Retail",
  
  measures: [
    {
      name: "total_sar_filings",
      displayName: "Total SAR Filings",
      formula: "COUNT(DISTINCT sar_id)",
      description: "Total Suspicious Activity Reports filed",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "AML"
    },
    {
      name: "total_ctr_filings",
      displayName: "Total CTR Filings",
      formula: "COUNT(DISTINCT ctr_id)",
      description: "Total Currency Transaction Reports filed",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "BSA"
    },
    {
      name: "total_ofac_alerts",
      displayName: "Total OFAC Alerts",
      formula: "COUNT(alert_id WHERE alert_type = 'OFAC')",
      description: "Number of OFAC sanctions screening alerts",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Sanctions"
    },
    {
      name: "total_kyc_reviews",
      displayName: "Total KYC Reviews",
      formula: "COUNT(DISTINCT kyc_review_id)",
      description: "Number of KYC reviews conducted",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "KYC"
    },
    {
      name: "avg_kyc_completion_days",
      displayName: "Average KYC Completion Time",
      formula: "AVG(DATEDIFF(day, review_start_date, review_complete_date))",
      description: "Average days to complete KYC review",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Efficiency"
    },
    {
      name: "high_risk_customers",
      displayName: "High Risk Customers",
      formula: "COUNT(DISTINCT CASE WHEN risk_rating = 'High' THEN customer_id END)",
      description: "Number of customers classified as high risk",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Risk"
    },
    {
      name: "pep_count",
      displayName: "PEP Customers",
      formula: "COUNT(DISTINCT CASE WHEN is_pep = 1 THEN customer_id END)",
      description: "Number of Politically Exposed Person customers",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Risk"
    },
    {
      name: "total_reg_violations",
      displayName: "Total Regulatory Violations",
      formula: "COUNT(violation_id)",
      description: "Number of regulatory violations identified",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Violations"
    },
    {
      name: "total_fine_amount",
      displayName: "Total Fine Amount",
      formula: "SUM(fine_amount)",
      description: "Total amount of regulatory fines assessed",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Penalties"
    },
    {
      name: "consumer_complaints",
      displayName: "Consumer Complaints",
      formula: "COUNT(complaint_id)",
      description: "Number of consumer complaints received",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Consumer Protection"
    },
    {
      name: "avg_complaint_resolution_days",
      displayName: "Average Complaint Resolution Time",
      formula: "AVG(DATEDIFF(day, complaint_date, resolution_date))",
      description: "Average days to resolve consumer complaints",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Service"
    },
    {
      name: "tila_disclosures_delivered",
      displayName: "TILA Disclosures Delivered",
      formula: "COUNT(DISTINCT CASE WHEN disclosure_type = 'TILA' THEN disclosure_id END)",
      description: "Number of Truth in Lending Act disclosures provided",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Disclosure"
    },
    {
      name: "efta_error_resolutions",
      displayName: "EFTA Error Resolutions",
      formula: "COUNT(DISTINCT CASE WHEN error_type = 'EFTA' THEN error_id END)",
      description: "Number of Electronic Fund Transfer Act error resolutions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Consumer Rights"
    },
    {
      name: "card_act_compliance_rate",
      displayName: "CARD Act Compliance Rate",
      formula: "(compliant_accounts / total_credit_card_accounts) * 100",
      description: "Percentage of credit card accounts compliant with CARD Act",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Cards"
    },
    {
      name: "training_completion_rate",
      displayName: "Compliance Training Completion",
      formula: "(employees_trained / total_employees) * 100",
      description: "Percentage of employees completing compliance training",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Training"
    },
    {
      name: "audit_findings",
      displayName: "Audit Findings",
      formula: "COUNT(finding_id)",
      description: "Number of compliance audit findings",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Audit"
    },
    {
      name: "remediation_completion_rate",
      displayName: "Remediation Completion Rate",
      formula: "(remediated_findings / total_findings) * 100",
      description: "Percentage of findings successfully remediated",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Audit"
    }
  ],

  attributes: [
    {
      name: "regulation_type",
      displayName: "Regulation Type",
      field: "regulation_name",
      dataType: "String",
      description: "Type of regulation (BSA, AML, OFAC, TILA, EFTA, CARD Act)",
      lookup: "dim_regulation"
    },
    {
      name: "filing_type",
      displayName: "Filing Type",
      field: "filing_type",
      dataType: "String",
      description: "Type of regulatory filing (SAR, CTR, Form 8300)",
      lookup: "dim_filing_type"
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
      name: "alert_priority",
      displayName: "Alert Priority",
      field: "priority",
      dataType: "String",
      description: "Priority level of compliance alert (Critical, High, Medium, Low)",
      lookup: "dim_priority"
    },
    {
      name: "violation_category",
      displayName: "Violation Category",
      field: "category",
      dataType: "String",
      description: "Category of regulatory violation",
      lookup: "dim_violation_category"
    },
    {
      name: "disclosure_method",
      displayName: "Disclosure Method",
      field: "delivery_method",
      dataType: "String",
      description: "How disclosure was delivered (Electronic, Paper, Verbal)",
      lookup: "dim_delivery_method"
    },
    {
      name: "complaint_type",
      displayName: "Complaint Type",
      field: "complaint_category",
      dataType: "String",
      description: "Type of consumer complaint",
      lookup: "dim_complaint_type"
    },
    {
      name: "regulatory_agency",
      displayName: "Regulatory Agency",
      field: "agency_name",
      dataType: "String",
      description: "Overseeing regulatory agency (FDIC, OCC, CFPB, FinCEN)",
      lookup: "dim_agency"
    },
    {
      name: "compliance_status",
      displayName: "Compliance Status",
      field: "status",
      dataType: "String",
      description: "Current compliance status (Compliant, Non-Compliant, Under Review)",
      lookup: "dim_compliance_status"
    },
    {
      name: "finding_severity",
      displayName: "Finding Severity",
      field: "severity",
      dataType: "String",
      description: "Severity of audit finding (Critical, Major, Minor)",
      lookup: "dim_severity"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Temporal analysis of compliance activities"
    },
    {
      name: "Regulation Hierarchy",
      levels: ["Regulatory Framework", "Regulation", "Requirement"],
      description: "Regulatory framework breakdown"
    },
    {
      name: "Risk Hierarchy",
      levels: ["Risk Category", "Risk Rating", "Risk Score"],
      description: "Risk classification structure"
    },
    {
      name: "Violation Hierarchy",
      levels: ["Violation Category", "Violation Type", "Violation Subtype"],
      description: "Classification of violations"
    },
    {
      name: "Agency Hierarchy",
      levels: ["Agency Type", "Agency", "Division"],
      description: "Regulatory agency structure"
    }
  ],

  folders: [
    {
      name: "AML/BSA Compliance",
      measures: ["total_sar_filings", "total_ctr_filings", "total_ofac_alerts"],
      description: "Anti-Money Laundering and Bank Secrecy Act metrics",
      icon: "🔍"
    },
    {
      name: "KYC & Due Diligence",
      measures: ["total_kyc_reviews", "avg_kyc_completion_days", "high_risk_customers", "pep_count"],
      description: "Know Your Customer and due diligence metrics",
      icon: "👤"
    },
    {
      name: "Consumer Protection",
      measures: ["consumer_complaints", "avg_complaint_resolution_days", "tila_disclosures_delivered", "efta_error_resolutions"],
      description: "Consumer protection compliance metrics",
      icon: "🛡️"
    },
    {
      name: "Regulatory Violations",
      measures: ["total_reg_violations", "total_fine_amount"],
      description: "Violations and penalties",
      icon: "⚠️"
    },
    {
      name: "Audit & Remediation",
      measures: ["audit_findings", "remediation_completion_rate", "training_completion_rate"],
      description: "Audit findings and remediation tracking",
      icon: "📋"
    },
    {
      name: "Credit Card Compliance",
      measures: ["card_act_compliance_rate"],
      description: "CARD Act compliance metrics",
      icon: "💳"
    }
  ]
};

export default complianceRetailSemanticLayer;
