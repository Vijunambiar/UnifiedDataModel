/**
 * FRAUD-RETAIL DOMAIN - SEMANTIC LAYER
 * Fraud detection, prevention, investigation, and loss management
 */

export const fraudRetailSemanticLayer = {
  domainId: "fraud-retail",
  domainName: "Fraud Retail",
  
  measures: [
    {
      name: "total_fraud_cases",
      displayName: "Total Fraud Cases",
      formula: "COUNT(DISTINCT case_id)",
      description: "Total number of fraud cases reported",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Cases"
    },
    {
      name: "total_fraud_loss",
      displayName: "Total Fraud Loss",
      formula: "SUM(fraud_amount)",
      description: "Total monetary loss from fraud",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Loss"
    },
    {
      name: "total_recovered_amount",
      displayName: "Total Recovered Amount",
      formula: "SUM(recovered_amount)",
      description: "Total amount recovered from fraud cases",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Recovery"
    },
    {
      name: "net_fraud_loss",
      displayName: "Net Fraud Loss",
      formula: "total_fraud_loss - total_recovered_amount",
      description: "Net loss after recoveries",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Loss"
    },
    {
      name: "fraud_rate",
      displayName: "Fraud Rate",
      formula: "(fraud_transactions / total_transactions) * 100",
      description: "Percentage of transactions that are fraudulent",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Risk"
    },
    {
      name: "avg_fraud_amount",
      displayName: "Average Fraud Amount",
      formula: "AVG(fraud_amount)",
      description: "Average monetary value per fraud case",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Loss"
    },
    {
      name: "total_alerts_generated",
      displayName: "Total Alerts Generated",
      formula: "COUNT(alert_id)",
      description: "Total number of fraud alerts generated",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Detection"
    },
    {
      name: "true_positive_rate",
      displayName: "True Positive Rate",
      formula: "(true_positives / total_alerts_generated) * 100",
      description: "Percentage of alerts that are actual fraud",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Accuracy"
    },
    {
      name: "false_positive_rate",
      displayName: "False Positive Rate",
      formula: "(false_positives / total_alerts_generated) * 100",
      description: "Percentage of alerts that are false alarms",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Accuracy"
    },
    {
      name: "detection_rate",
      displayName: "Detection Rate",
      formula: "(detected_fraud_cases / total_fraud_cases) * 100",
      description: "Percentage of fraud cases successfully detected",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    },
    {
      name: "avg_investigation_time_days",
      displayName: "Average Investigation Time",
      formula: "AVG(DATEDIFF(day, case_open_date, case_close_date))",
      description: "Average time to close a fraud case",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Efficiency"
    },
    {
      name: "recovery_rate",
      displayName: "Recovery Rate",
      formula: "(total_recovered_amount / total_fraud_loss) * 100",
      description: "Percentage of fraud loss recovered",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Recovery"
    },
    {
      name: "disputed_transactions",
      displayName: "Disputed Transactions",
      formula: "COUNT(DISTINCT CASE WHEN is_disputed = 1 THEN transaction_id END)",
      description: "Number of transactions disputed by customers",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Disputes"
    },
    {
      name: "chargeback_count",
      displayName: "Chargeback Count",
      formula: "COUNT(DISTINCT chargeback_id)",
      description: "Total number of chargebacks processed",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Chargebacks"
    },
    {
      name: "chargeback_amount",
      displayName: "Total Chargeback Amount",
      formula: "SUM(chargeback_amount)",
      description: "Total amount of chargebacks",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Chargebacks"
    },
    {
      name: "prevention_savings",
      displayName: "Prevention Savings",
      formula: "SUM(prevented_fraud_amount)",
      description: "Amount of fraud prevented before transaction completion",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Prevention"
    },
    {
      name: "fraud_prevention_rate",
      displayName: "Fraud Prevention Rate",
      formula: "(prevented_fraud_amount / (prevented_fraud_amount + fraud_loss)) * 100",
      description: "Percentage of potential fraud that was prevented",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Prevention"
    }
  ],

  attributes: [
    {
      name: "fraud_type",
      displayName: "Fraud Type",
      field: "fraud_type",
      dataType: "String",
      description: "Type of fraud (Card Not Present, Account Takeover, Identity Theft)",
      lookup: "dim_fraud_type"
    },
    {
      name: "fraud_channel",
      displayName: "Fraud Channel",
      field: "channel_name",
      dataType: "String",
      description: "Channel where fraud occurred (Online, ATM, POS, Branch)",
      lookup: "dim_channel"
    },
    {
      name: "case_status",
      displayName: "Case Status",
      field: "status",
      dataType: "String",
      description: "Status of fraud case (Open, Under Investigation, Closed, Escalated)",
      lookup: "dim_case_status"
    },
    {
      name: "risk_score_range",
      displayName: "Risk Score Range",
      field: "CASE WHEN risk_score < 300 THEN 'Low' WHEN risk_score < 700 THEN 'Medium' ELSE 'High' END",
      dataType: "String",
      description: "Risk score classification"
    },
    {
      name: "alert_type",
      displayName: "Alert Type",
      field: "alert_type",
      dataType: "String",
      description: "Type of fraud alert (Rule-based, ML Model, Manual Review)",
      lookup: "dim_alert_type"
    },
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "segment_name",
      dataType: "String",
      description: "Segment of affected customer",
      lookup: "dim_customer_segment"
    },
    {
      name: "investigation_outcome",
      displayName: "Investigation Outcome",
      field: "outcome",
      dataType: "String",
      description: "Final outcome (Confirmed Fraud, False Positive, Unresolved)",
      lookup: "dim_outcome"
    },
    {
      name: "merchant_category",
      displayName: "Merchant Category",
      field: "mcc_description",
      dataType: "String",
      description: "Merchant category where fraud occurred",
      lookup: "dim_merchant_category"
    },
    {
      name: "geographic_region",
      displayName: "Geographic Region",
      field: "region_name",
      dataType: "String",
      description: "Region where fraud was detected",
      lookup: "dim_geography"
    },
    {
      name: "recovery_method",
      displayName: "Recovery Method",
      field: "recovery_method",
      dataType: "String",
      description: "Method used to recover funds (Insurance, Chargeback, Collection)",
      lookup: "dim_recovery_method"
    }
  ],

  hierarchies: [
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Temporal analysis of fraud patterns"
    },
    {
      name: "Fraud Type Hierarchy",
      levels: ["Fraud Category", "Fraud Type", "Fraud Subtype"],
      description: "Classification of fraud types"
    },
    {
      name: "Channel Hierarchy",
      levels: ["Channel Category", "Channel", "Subchannel"],
      description: "Channels where fraud occurs"
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City"],
      description: "Geographic distribution of fraud"
    },
    {
      name: "Risk Score Hierarchy",
      levels: ["Risk Band", "Risk Range", "Risk Score"],
      description: "Risk scoring breakdown"
    }
  ],

  folders: [
    {
      name: "Fraud Overview",
      measures: ["total_fraud_cases", "total_fraud_loss", "net_fraud_loss", "fraud_rate"],
      description: "High-level fraud metrics and losses",
      icon: "🚨"
    },
    {
      name: "Detection Performance",
      measures: ["total_alerts_generated", "true_positive_rate", "false_positive_rate", "detection_rate"],
      description: "Fraud detection accuracy and performance",
      icon: "🎯"
    },
    {
      name: "Recovery & Resolution",
      measures: ["total_recovered_amount", "recovery_rate", "avg_investigation_time_days"],
      description: "Fraud recovery and case resolution metrics",
      icon: "💰"
    },
    {
      name: "Prevention",
      measures: ["prevention_savings", "fraud_prevention_rate"],
      description: "Fraud prevention effectiveness",
      icon: "🛡️"
    },
    {
      name: "Chargebacks & Disputes",
      measures: ["disputed_transactions", "chargeback_count", "chargeback_amount"],
      description: "Chargeback and dispute metrics",
      icon: "🔄"
    }
  ]
};

export default fraudRetailSemanticLayer;
