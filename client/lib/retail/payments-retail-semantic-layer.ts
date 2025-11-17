/**
 * PAYMENTS-RETAIL DOMAIN - SEMANTIC LAYER
 * P2P, Bill Pay, Mobile Payments, ACH, Wire Transfers
 */

export const paymentsRetailSemanticLayer = {
  domainId: "payments-retail",
  domainName: "Payments-Retail",
  
  measures: [
    {
      name: "total_payment_volume",
      displayName: "Total Payment Volume",
      formula: "SUM(payment_amount)",
      description: "Total dollar volume of all retail payments",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Volume"
    },
    {
      name: "total_payment_count",
      displayName: "Total Payment Count",
      formula: "COUNT(payment_id)",
      description: "Total number of payment transactions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Volume"
    },
    {
      name: "avg_payment_amount",
      displayName: "Average Payment Amount",
      formula: "AVG(payment_amount)",
      description: "Average dollar amount per payment",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Volume"
    },
    {
      name: "p2p_volume",
      displayName: "P2P Payment Volume",
      formula: "SUM(CASE WHEN payment_type = 'P2P' THEN payment_amount END)",
      description: "Peer-to-peer payment volume",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "By Type"
    },
    {
      name: "bill_pay_volume",
      displayName: "Bill Pay Volume",
      formula: "SUM(CASE WHEN payment_type = 'BILL_PAY' THEN payment_amount END)",
      description: "Online bill payment volume",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "By Type"
    },
    {
      name: "mobile_payment_volume",
      displayName: "Mobile Payment Volume",
      formula: "SUM(CASE WHEN channel = 'MOBILE' THEN payment_amount END)",
      description: "Payments initiated via mobile app",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "By Channel"
    },
    {
      name: "ach_volume",
      displayName: "ACH Payment Volume",
      formula: "SUM(CASE WHEN payment_type = 'ACH' THEN payment_amount END)",
      description: "ACH transfer volume",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "By Type"
    },
    {
      name: "wire_transfer_volume",
      displayName: "Wire Transfer Volume",
      formula: "SUM(CASE WHEN payment_type = 'WIRE' THEN payment_amount END)",
      description: "Wire transfer volume",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "By Type"
    },
    {
      name: "payment_success_rate",
      displayName: "Payment Success Rate",
      formula: "(COUNT(CASE WHEN status = 'COMPLETED' THEN payment_id END) / NULLIF(COUNT(payment_id), 0)) * 100",
      description: "Percentage of successful payments",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "payment_failure_count",
      displayName: "Failed Payments",
      formula: "COUNT(CASE WHEN status = 'FAILED' THEN payment_id END)",
      description: "Number of failed payment attempts",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Quality"
    },
    {
      name: "payment_return_rate",
      displayName: "Payment Return Rate",
      formula: "(COUNT(CASE WHEN status = 'RETURNED' THEN payment_id END) / NULLIF(COUNT(payment_id), 0)) * 100",
      description: "Percentage of payments returned",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Quality"
    },
    {
      name: "payment_fee_revenue",
      displayName: "Payment Fee Revenue",
      formula: "SUM(fee_amount)",
      description: "Total fee revenue from payment services",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "avg_payment_processing_time",
      displayName: "Avg Payment Processing Time",
      formula: "AVG(DATEDIFF(second, initiated_timestamp, completed_timestamp))",
      description: "Average time to process payment in seconds",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0",
      category: "Performance"
    },
    {
      name: "same_day_payment_pct",
      displayName: "Same-Day Payment %",
      formula: "(COUNT(CASE WHEN CAST(initiated_timestamp AS DATE) = CAST(completed_timestamp AS DATE) THEN payment_id END) / NULLIF(COUNT(payment_id), 0)) * 100",
      description: "Percentage of payments completed same day",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Performance"
    },
    {
      name: "recurring_payment_volume",
      displayName: "Recurring Payment Volume",
      formula: "SUM(CASE WHEN is_recurring = TRUE THEN payment_amount END)",
      description: "Volume of recurring/scheduled payments",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "By Type"
    },
    {
      name: "active_payment_users",
      displayName: "Active Payment Users",
      formula: "COUNT(DISTINCT customer_id)",
      description: "Number of unique customers making payments",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Adoption"
    },
    {
      name: "payments_per_user",
      displayName: "Payments Per User",
      formula: "COUNT(payment_id) / NULLIF(COUNT(DISTINCT customer_id), 0)",
      description: "Average number of payments per active user",
      dataType: "Decimal",
      aggregation: "CALCULATED",
      format: "#,##0.00",
      category: "Adoption"
    },
    {
      name: "fraud_rate",
      displayName: "Payment Fraud Rate",
      formula: "(SUM(CASE WHEN is_fraudulent = TRUE THEN payment_amount END) / NULLIF(SUM(payment_amount), 0)) * 100",
      description: "Fraudulent payments as percentage of volume",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Fraud"
    }
  ],

  attributes: [
    {
      name: "payment_type",
      displayName: "Payment Type",
      field: "payment_type_code",
      dataType: "String",
      description: "Type of payment (P2P, Bill Pay, ACH, Wire, Check, ATM)",
      lookup: "dim_payment_type"
    },
    {
      name: "payment_channel",
      displayName: "Payment Channel",
      field: "channel_code",
      dataType: "String",
      description: "Channel used for payment (Mobile, Online, Branch, ATM, Phone)",
      lookup: "dim_channel"
    },
    {
      name: "payment_status",
      displayName: "Payment Status",
      field: "status_code",
      dataType: "String",
      description: "Current status (Pending, Completed, Failed, Returned, Cancelled)",
      lookup: "dim_payment_status"
    },
    {
      name: "payment_direction",
      displayName: "Payment Direction",
      field: "direction_code",
      dataType: "String",
      description: "Direction of payment (Outbound, Inbound)",
      lookup: "dim_payment_direction"
    },
    {
      name: "payment_speed",
      displayName: "Payment Speed",
      field: "speed_code",
      dataType: "String",
      description: "Processing speed tier (Real-Time, Same-Day, Next-Day, Standard)",
      lookup: "dim_payment_speed"
    },
    {
      name: "payee_type",
      displayName: "Payee Type",
      field: "payee_type_code",
      dataType: "String",
      description: "Type of payment recipient (Person, Business, Utility, Government)",
      lookup: "dim_payee_type"
    },
    {
      name: "amount_tier",
      displayName: "Amount Tier",
      field: "CASE WHEN payment_amount < 50 THEN '<$50' WHEN payment_amount < 500 THEN '$50-$500' WHEN payment_amount < 5000 THEN '$500-$5K' ELSE '$5K+' END",
      dataType: "String",
      description: "Payment amount grouping"
    },
    {
      name: "is_recurring",
      displayName: "Recurring Payment",
      field: "is_recurring",
      dataType: "Boolean",
      description: "Whether payment is recurring/scheduled"
    },
    {
      name: "risk_level",
      displayName: "Risk Level",
      field: "risk_score_tier",
      dataType: "String",
      description: "Fraud risk level (Low, Medium, High)",
      lookup: "dim_risk_level"
    },
    {
      name: "day_of_week",
      displayName: "Day of Week",
      field: "DAYNAME(initiated_timestamp)",
      dataType: "String",
      description: "Day of week payment was initiated"
    }
  ],

  hierarchies: [
    {
      name: "Payment Type Hierarchy",
      levels: ["Payment Category", "Payment Type", "Payment Subtype"],
      description: "Payment classification hierarchy"
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Temporal analysis with hourly granularity"
    },
    {
      name: "Channel Hierarchy",
      levels: ["Channel Type", "Channel Category", "Specific Channel"],
      description: "Payment channel classification"
    },
    {
      name: "Amount Hierarchy",
      levels: ["Amount Range", "Amount Tier", "Exact Amount"],
      description: "Payment amount grouping"
    },
    {
      name: "Geography Hierarchy",
      levels: ["Country", "Region", "State", "City"],
      description: "Geographic location of payment origination"
    }
  ],

  folders: [
    {
      name: "Payment Volume",
      measures: ["total_payment_volume", "total_payment_count", "avg_payment_amount"],
      description: "Overall payment volume metrics",
      icon: "💸"
    },
    {
      name: "Payment Types",
      measures: ["p2p_volume", "bill_pay_volume", "ach_volume", "wire_transfer_volume", "recurring_payment_volume"],
      description: "Volume by payment type",
      icon: "🔀"
    },
    {
      name: "Digital Channels",
      measures: ["mobile_payment_volume", "payments_per_user"],
      description: "Digital channel payment metrics",
      icon: "📱"
    },
    {
      name: "Payment Quality",
      measures: ["payment_success_rate", "payment_failure_count", "payment_return_rate"],
      description: "Payment processing quality metrics",
      icon: "✅"
    },
    {
      name: "Payment Performance",
      measures: ["avg_payment_processing_time", "same_day_payment_pct"],
      description: "Processing speed and performance",
      icon: "⚡"
    },
    {
      name: "Revenue & Adoption",
      measures: ["payment_fee_revenue", "active_payment_users"],
      description: "Payment revenue and user adoption",
      icon: "💰"
    },
    {
      name: "Fraud & Risk",
      measures: ["fraud_rate"],
      description: "Payment fraud and risk metrics",
      icon: "🔒"
    }
  ]
};

export default paymentsRetailSemanticLayer;
