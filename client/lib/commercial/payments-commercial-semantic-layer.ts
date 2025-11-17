/**
 * PAYMENTS-COMMERCIAL DOMAIN - SEMANTIC LAYER
 * Commercial payment processing: ACH, wire transfers, RTP, bill pay, and payroll
 */

export const paymentsCommercialSemanticLayer = {
  domainId: "payments-commercial",
  domainName: "Payments Commercial",
  
  measures: [
    {
      name: "total_payment_volume",
      displayName: "Total Payment Volume",
      formula: "SUM(payment_amount)",
      description: "Total dollar value of all commercial payments processed",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Volume"
    },
    {
      name: "total_payment_count",
      displayName: "Total Payment Count",
      formula: "COUNT(payment_id)",
      description: "Total number of payment transactions processed",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Volume"
    },
    {
      name: "avg_payment_amount",
      displayName: "Average Payment Amount",
      formula: "AVG(payment_amount)",
      description: "Average dollar value per payment transaction",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Quality"
    },
    {
      name: "total_ach_volume",
      displayName: "Total ACH Volume",
      formula: "SUM(CASE WHEN payment_type = 'ACH' THEN payment_amount END)",
      description: "Total dollar value of ACH payments",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "ACH"
    },
    {
      name: "total_wire_volume",
      displayName: "Total Wire Volume",
      formula: "SUM(CASE WHEN payment_type = 'WIRE' THEN payment_amount END)",
      description: "Total dollar value of wire transfers",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Wire"
    },
    {
      name: "total_rtp_volume",
      displayName: "Total RTP Volume",
      formula: "SUM(CASE WHEN payment_type = 'RTP' THEN payment_amount END)",
      description: "Total dollar value of Real-Time Payments",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "RTP"
    },
    {
      name: "ach_return_rate",
      displayName: "ACH Return Rate",
      formula: "(ach_returns / total_ach_transactions) * 100",
      description: "Percentage of ACH transactions that were returned",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "wire_success_rate",
      displayName: "Wire Success Rate",
      formula: "(successful_wires / total_wires) * 100",
      description: "Percentage of wire transfers successfully completed",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "total_payment_fee_revenue",
      displayName: "Total Payment Fee Revenue",
      formula: "SUM(fee_amount)",
      description: "Total fee income from payment processing services",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "avg_fee_per_payment",
      displayName: "Average Fee Per Payment",
      formula: "AVG(fee_amount)",
      description: "Average fee charged per payment transaction",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "avg_payment_processing_time_minutes",
      displayName: "Average Processing Time",
      formula: "AVG(DATEDIFF(minute, submission_time, completion_time))",
      description: "Average time to process a payment in minutes",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Performance"
    },
    {
      name: "sla_compliance_rate",
      displayName: "SLA Compliance Rate",
      formula: "(payments_within_sla / total_payments) * 100",
      description: "Percentage of payments processed within SLA",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    },
    {
      name: "total_fraud_alerts",
      displayName: "Total Fraud Alerts",
      formula: "COUNT(CASE WHEN fraud_alert = 1 THEN payment_id END)",
      description: "Number of payments flagged for potential fraud",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Fraud"
    },
    {
      name: "total_fraud_loss",
      displayName: "Total Fraud Loss",
      formula: "SUM(CASE WHEN confirmed_fraud = 1 THEN payment_amount END)",
      description: "Total dollar value of confirmed fraudulent payments",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Fraud"
    },
    {
      name: "same_day_ach_percentage",
      displayName: "Same-Day ACH %",
      formula: "(same_day_ach_count / total_ach_count) * 100",
      description: "Percentage of ACH transactions processed same-day",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "ACH"
    },
    {
      name: "international_wire_percentage",
      displayName: "International Wire %",
      formula: "(international_wire_count / total_wire_count) * 100",
      description: "Percentage of wire transfers that are international",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Wire"
    },
    {
      name: "positive_pay_exception_rate",
      displayName: "Positive Pay Exception Rate",
      formula: "(positive_pay_exceptions / total_checks_presented) * 100",
      description: "Percentage of checks flagged as positive pay exceptions",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Positive Pay"
    },
    {
      name: "avg_approval_time_hours",
      displayName: "Average Approval Time",
      formula: "AVG(DATEDIFF(hour, approval_request_time, approval_complete_time))",
      description: "Average time for payment approval in hours",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Workflow"
    },
    {
      name: "payment_reconciliation_rate",
      displayName: "Payment Reconciliation Rate",
      formula: "(reconciled_payments / total_payments) * 100",
      description: "Percentage of payments successfully reconciled with GL",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "ofac_match_rate",
      displayName: "OFAC Match Rate",
      formula: "(ofac_matches / total_payments_screened) * 100",
      description: "Percentage of payments with OFAC screening matches",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Compliance"
    }
  ],

  attributes: [
    {
      name: "payment_type",
      displayName: "Payment Type",
      field: "payment_type",
      dataType: "String",
      description: "Type of payment (ACH, Wire, RTP, Bill Pay, Payroll)",
      lookup: "dim_payment_type"
    },
    {
      name: "payment_method",
      displayName: "Payment Method",
      field: "payment_method",
      dataType: "String",
      description: "Specific payment method (CCD, CTX, Fedwire, SWIFT, etc.)",
      lookup: "dim_payment_method"
    },
    {
      name: "ach_sec_code",
      displayName: "ACH SEC Code",
      field: "sec_code",
      dataType: "String",
      description: "NACHA Standard Entry Class code",
      lookup: "dim_ach_sec_code"
    },
    {
      name: "payment_status",
      displayName: "Payment Status",
      field: "status",
      dataType: "String",
      description: "Current payment status (Submitted, Processing, Settled, Returned)",
      lookup: "dim_payment_status"
    },
    {
      name: "payment_channel",
      displayName: "Payment Channel",
      field: "channel_name",
      dataType: "String",
      description: "Channel used for payment (Treasury Workstation, Online, Mobile, Batch)",
      lookup: "dim_payment_channel"
    },
    {
      name: "payment_network",
      displayName: "Payment Network",
      field: "network_name",
      dataType: "String",
      description: "Payment network (Fedwire, NACHA, SWIFT, TCH RTP)",
      lookup: "dim_payment_network"
    },
    {
      name: "return_reason",
      displayName: "Return Reason",
      field: "return_reason_code",
      dataType: "String",
      description: "ACH R-code or wire return reason",
      lookup: "dim_return_reason"
    },
    {
      name: "payment_purpose",
      displayName: "Payment Purpose",
      field: "purpose",
      dataType: "String",
      description: "Purpose of payment (Payroll, Vendor, Tax, Benefit)",
      lookup: "dim_payment_purpose"
    },
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "segment_name",
      dataType: "String",
      description: "Commercial customer segment",
      lookup: "dim_customer_segment"
    },
    {
      name: "fraud_alert_type",
      displayName: "Fraud Alert Type",
      field: "alert_type",
      dataType: "String",
      description: "Type of fraud alert if flagged",
      lookup: "dim_fraud_alert_type"
    },
    {
      name: "same_day_flag",
      displayName: "Same-Day Processing",
      field: "CASE WHEN same_day_ach = 1 THEN 'Yes' ELSE 'No' END",
      dataType: "String",
      description: "Whether ACH was processed same-day"
    },
    {
      name: "international_flag",
      displayName: "International",
      field: "CASE WHEN is_international = 1 THEN 'Yes' ELSE 'No' END",
      dataType: "String",
      description: "Whether wire transfer is international"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Temporal analysis of payment transactions"
    },
    {
      name: "Payment Type Hierarchy",
      levels: ["Payment Category", "Payment Type", "Payment Method", "Payment Subtype"],
      description: "Payment type classification from category to specific method"
    },
    {
      name: "Payment Network Hierarchy",
      levels: ["Network Category", "Network", "Protocol Version"],
      description: "Payment network and protocol breakdown"
    },
    {
      name: "Customer Hierarchy",
      levels: ["Segment", "Industry", "Customer"],
      description: "Commercial customer segmentation"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City"],
      description: "Geographic distribution of payments"
    },
    {
      name: "Product Hierarchy",
      levels: ["Product Line", "Product", "Fee Schedule"],
      description: "Payment product and pricing structure"
    }
  ],

  folders: [
    {
      name: "Payment Volume",
      measures: ["total_payment_volume", "total_payment_count", "avg_payment_amount"],
      description: "Overall payment processing volume and value",
      icon: "💰"
    },
    {
      name: "Payment Channels",
      measures: ["total_ach_volume", "total_wire_volume", "total_rtp_volume"],
      description: "Payment volume by type (ACH, Wire, RTP)",
      icon: "🔄"
    },
    {
      name: "Payment Quality",
      measures: ["ach_return_rate", "wire_success_rate", "payment_reconciliation_rate", "sla_compliance_rate"],
      description: "Payment quality and success metrics",
      icon: "⭐"
    },
    {
      name: "Payment Revenue",
      measures: ["total_payment_fee_revenue", "avg_fee_per_payment"],
      description: "Payment fee revenue metrics",
      icon: "💵"
    },
    {
      name: "Payment Performance",
      measures: ["avg_payment_processing_time_minutes", "sla_compliance_rate", "avg_approval_time_hours"],
      description: "Payment processing speed and efficiency",
      icon: "⚡"
    },
    {
      name: "Payment Fraud",
      measures: ["total_fraud_alerts", "total_fraud_loss"],
      description: "Payment fraud detection and losses",
      icon: "🚨"
    },
    {
      name: "ACH Metrics",
      measures: ["total_ach_volume", "ach_return_rate", "same_day_ach_percentage"],
      description: "ACH-specific metrics",
      icon: "🏦"
    },
    {
      name: "Wire Metrics",
      measures: ["total_wire_volume", "wire_success_rate", "international_wire_percentage"],
      description: "Wire transfer metrics",
      icon: "🌐"
    },
    {
      name: "Compliance",
      measures: ["ofac_match_rate", "positive_pay_exception_rate"],
      description: "Compliance and risk metrics",
      icon: "🛡️"
    }
  ]
};

export default paymentsCommercialSemanticLayer;
