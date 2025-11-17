/**
 * CARDS-RETAIL DOMAIN - SEMANTIC LAYER
 * Credit cards, debit cards, prepaid cards, rewards programs
 */

export const cardsRetailSemanticLayer = {
  domainId: "cards-retail",
  domainName: "Cards-Retail",
  
  measures: [
    {
      name: "total_card_balances",
      displayName: "Total Card Balances",
      formula: "SUM(outstanding_balance)",
      description: "Total outstanding balance across all credit cards",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "total_active_cards",
      displayName: "Total Active Cards",
      formula: "COUNT(DISTINCT CASE WHEN card_status = 'ACTIVE' THEN card_id END)",
      description: "Number of active credit and debit cards",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Portfolio"
    },
    {
      name: "new_cards_issued",
      displayName: "New Cards Issued",
      formula: "COUNT(DISTINCT CASE WHEN issue_date >= DATE_TRUNC('month', CURRENT_DATE) THEN card_id END)",
      description: "New cards issued in current period",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Acquisition"
    },
    {
      name: "purchase_volume",
      displayName: "Purchase Volume",
      formula: "SUM(CASE WHEN transaction_type = 'PURCHASE' THEN transaction_amount END)",
      description: "Total dollar volume of card purchases",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Activity"
    },
    {
      name: "purchase_count",
      displayName: "Purchase Count",
      formula: "COUNT(CASE WHEN transaction_type = 'PURCHASE' THEN transaction_id END)",
      description: "Total number of purchase transactions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity"
    },
    {
      name: "avg_transaction_size",
      displayName: "Average Transaction Size",
      formula: "AVG(CASE WHEN transaction_type = 'PURCHASE' THEN transaction_amount END)",
      description: "Average dollar amount per purchase",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Activity"
    },
    {
      name: "cash_advance_volume",
      displayName: "Cash Advance Volume",
      formula: "SUM(CASE WHEN transaction_type = 'CASH_ADVANCE' THEN transaction_amount END)",
      description: "Total dollar volume of cash advances",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Activity"
    },
    {
      name: "balance_transfer_volume",
      displayName: "Balance Transfer Volume",
      formula: "SUM(CASE WHEN transaction_type = 'BALANCE_TRANSFER' THEN transaction_amount END)",
      description: "Total dollar volume of balance transfers",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Activity"
    },
    {
      name: "total_credit_limit",
      displayName: "Total Credit Limit",
      formula: "SUM(credit_limit)",
      description: "Total credit line extended to cardholders",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Portfolio"
    },
    {
      name: "utilization_rate",
      displayName: "Credit Utilization Rate",
      formula: "(SUM(outstanding_balance) / NULLIF(SUM(credit_limit), 0)) * 100",
      description: "Average credit line utilization percentage",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Portfolio"
    },
    {
      name: "interchange_revenue",
      displayName: "Interchange Revenue",
      formula: "SUM(interchange_fee_amount)",
      description: "Total interchange fee revenue earned",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "interest_income",
      displayName: "Interest Income",
      formula: "SUM(interest_charged)",
      description: "Total interest income from revolving balances",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "annual_fee_revenue",
      displayName: "Annual Fee Revenue",
      formula: "SUM(CASE WHEN fee_type = 'ANNUAL_FEE' THEN fee_amount END)",
      description: "Revenue from annual card fees",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "late_fee_revenue",
      displayName: "Late Fee Revenue",
      formula: "SUM(CASE WHEN fee_type = 'LATE_FEE' THEN fee_amount END)",
      description: "Revenue from late payment fees",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "delinquency_rate",
      displayName: "Delinquency Rate",
      formula: "(SUM(CASE WHEN days_past_due >= 30 THEN outstanding_balance END) / NULLIF(SUM(outstanding_balance), 0)) * 100",
      description: "Percentage of balances 30+ days past due",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Quality"
    },
    {
      name: "chargeoff_rate",
      displayName: "Charge-off Rate",
      formula: "(SUM(chargeoff_amount) / NULLIF(AVG(outstanding_balance), 0)) * 100",
      description: "Charge-offs as percentage of average balance",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Credit Quality"
    },
    {
      name: "rewards_expense",
      displayName: "Rewards Expense",
      formula: "SUM(rewards_points_value)",
      description: "Total cost of rewards points earned by cardholders",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Rewards"
    },
    {
      name: "rewards_redemption_rate",
      displayName: "Rewards Redemption Rate",
      formula: "(SUM(redeemed_points) / NULLIF(SUM(earned_points), 0)) * 100",
      description: "Percentage of earned rewards points redeemed",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Rewards"
    },
    {
      name: "payment_rate",
      displayName: "Payment Rate",
      formula: "(SUM(payment_amount) / NULLIF(SUM(beginning_balance + new_purchases), 0)) * 100",
      description: "Percentage of balance paid each month",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Payment Behavior"
    },
    {
      name: "revolver_rate",
      displayName: "Revolver Rate",
      formula: "(COUNT(DISTINCT CASE WHEN revolving_balance > 0 THEN card_id END) / NULLIF(COUNT(DISTINCT card_id), 0)) * 100",
      description: "Percentage of cards carrying a balance month-to-month",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Payment Behavior"
    }
  ],

  attributes: [
    {
      name: "card_type",
      displayName: "Card Type",
      field: "card_type_code",
      dataType: "String",
      description: "Type of card (Credit, Debit, Prepaid, Charge)",
      lookup: "dim_card_type"
    },
    {
      name: "card_brand",
      displayName: "Card Brand",
      field: "card_brand_code",
      dataType: "String",
      description: "Card network brand (Visa, Mastercard, American Express, Discover)",
      lookup: "dim_card_brand"
    },
    {
      name: "card_product",
      displayName: "Card Product",
      field: "product_code",
      dataType: "String",
      description: "Specific card product offering",
      lookup: "dim_card_product"
    },
    {
      name: "rewards_program",
      displayName: "Rewards Program",
      field: "rewards_program_code",
      dataType: "String",
      description: "Associated rewards program",
      lookup: "dim_rewards_program"
    },
    {
      name: "card_status",
      displayName: "Card Status",
      field: "status_code",
      dataType: "String",
      description: "Current card status (Active, Inactive, Closed, Suspended)",
      lookup: "dim_card_status"
    },
    {
      name: "customer_segment",
      displayName: "Customer Segment",
      field: "customer_segment_code",
      dataType: "String",
      description: "Cardholder segment (Mass Market, Affluent, Premium, Business)",
      lookup: "dim_customer_segment"
    },
    {
      name: "credit_tier",
      displayName: "Credit Tier",
      field: "CASE WHEN fico_score >= 740 THEN 'Super Prime' WHEN fico_score >= 670 THEN 'Prime' WHEN fico_score >= 580 THEN 'Near Prime' ELSE 'Subprime' END",
      dataType: "String",
      description: "Cardholder credit quality tier"
    },
    {
      name: "utilization_tier",
      displayName: "Utilization Tier",
      field: "CASE WHEN utilization_pct <= 30 THEN 'Low (0-30%)' WHEN utilization_pct <= 60 THEN 'Medium (30-60%)' WHEN utilization_pct <= 90 THEN 'High (60-90%)' ELSE 'Maxed (90%+)' END",
      dataType: "String",
      description: "Credit utilization grouping"
    },
    {
      name: "delinquency_status",
      displayName: "Delinquency Status",
      field: "CASE WHEN days_past_due = 0 THEN 'Current' WHEN days_past_due <= 30 THEN '1-30 DPD' WHEN days_past_due <= 60 THEN '31-60 DPD' WHEN days_past_due <= 90 THEN '61-90 DPD' ELSE '90+ DPD' END",
      dataType: "String",
      description: "Payment delinquency status"
    },
    {
      name: "spending_category",
      displayName: "Merchant Category",
      field: "mcc_category",
      dataType: "String",
      description: "Merchant category code grouping",
      lookup: "dim_mcc_category"
    }
  ],

  hierarchies: [
    {
      name: "Card Product Hierarchy",
      levels: ["Card Type", "Card Brand", "Card Product"],
      description: "Card product classification"
    },
    {
      name: "Credit Quality Hierarchy",
      levels: ["Credit Tier", "Delinquency Status", "Payment Behavior"],
      description: "Cardholder credit quality and behavior"
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day"],
      description: "Transaction time hierarchy"
    },
    {
      name: "Merchant Category Hierarchy",
      levels: ["MCC Division", "MCC Group", "MCC Category", "MCC Code"],
      description: "Spending category classification"
    },
    {
      name: "Customer Hierarchy",
      levels: ["Customer Segment", "Card Product", "Card Status"],
      description: "Cardholder segmentation"
    }
  ],

  folders: [
    {
      name: "Portfolio Overview",
      measures: ["total_card_balances", "total_active_cards", "total_credit_limit", "utilization_rate"],
      description: "Core portfolio metrics",
      icon: "💳"
    },
    {
      name: "Card Acquisition",
      measures: ["new_cards_issued"],
      description: "New card issuance metrics",
      icon: "📈"
    },
    {
      name: "Transaction Activity",
      measures: ["purchase_volume", "purchase_count", "avg_transaction_size", "cash_advance_volume", "balance_transfer_volume"],
      description: "Card usage and transaction metrics",
      icon: "🛒"
    },
    {
      name: "Revenue",
      measures: ["interchange_revenue", "interest_income", "annual_fee_revenue", "late_fee_revenue"],
      description: "Card revenue streams",
      icon: "💰"
    },
    {
      name: "Credit Quality",
      measures: ["delinquency_rate", "chargeoff_rate", "payment_rate", "revolver_rate"],
      description: "Asset quality and payment behavior",
      icon: "⚠️"
    },
    {
      name: "Rewards Program",
      measures: ["rewards_expense", "rewards_redemption_rate"],
      description: "Rewards program metrics",
      icon: "🎁"
    }
  ]
};

export default cardsRetailSemanticLayer;
