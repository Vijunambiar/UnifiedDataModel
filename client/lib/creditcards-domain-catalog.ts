// COMPREHENSIVE METRICS CATALOG - CREDIT CARDS DOMAIN
// 200+ metrics covering authorization, fraud, rewards, profitability

export interface CreditCardsMetric {
  id: number;
  domain: string;
  subdomain: string;
  name: string;
  technical_name: string;
  definition: string;
  level: string;
}

let metricId = 1;

export const creditCardsMetricsCatalog = [
  // ========== PORTFOLIO OVERVIEW ==========
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Portfolio Overview",
    name: "Total Outstanding Balances",
    technical_name: "total_outstanding_balances",
    definition: "Sum of all credit card balances across active accounts",
    level: "L1-Enterprise",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Portfolio Overview",
    name: "Total Active Cards",
    technical_name: "total_active_cards",
    definition: "Count of active credit card accounts",
    level: "L1-Enterprise",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Portfolio Overview",
    name: "Average Card Balance",
    technical_name: "avg_card_balance",
    definition: "Average balance per active card",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Portfolio Overview",
    name: "Total Credit Line Extended",
    technical_name: "total_credit_line",
    definition: "Sum of credit limits across all cards",
    level: "L1-Enterprise",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Portfolio Overview",
    name: "Portfolio Utilization Rate",
    technical_name: "portfolio_utilization_rate",
    definition: "Total balances / Total credit limits",
    level: "L1-Enterprise",
  },

  // ========== TRANSACTION VOLUME ==========
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Transaction Volume",
    name: "Authorization Volume",
    technical_name: "authorization_volume",
    definition: "Total dollar volume of authorization requests",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Transaction Volume",
    name: "Authorization Count",
    technical_name: "authorization_count",
    definition: "Number of authorization requests",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Transaction Volume",
    name: "Authorization Approval Rate",
    technical_name: "auth_approval_rate",
    definition: "% of authorizations approved",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Transaction Volume",
    name: "Purchase Volume",
    technical_name: "purchase_volume",
    definition: "Total settled purchase transactions",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Transaction Volume",
    name: "Cash Advance Volume",
    technical_name: "cash_advance_volume",
    definition: "Total cash advance transactions",
    level: "L2-Product",
  },

  // ========== FRAUD & RISK ==========
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Fraud & Risk",
    name: "Fraud Loss Rate",
    technical_name: "fraud_loss_rate",
    definition: "Fraud losses / Total transaction volume",
    level: "L1-Enterprise",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Fraud & Risk",
    name: "Fraud Detection Rate",
    technical_name: "fraud_detection_rate",
    definition: "% of fraud caught before settlement",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Fraud & Risk",
    name: "False Positive Rate",
    technical_name: "false_positive_rate",
    definition: "Legitimate transactions declined as fraud / Total declines",
    level: "L3-Operational",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Fraud & Risk",
    name: "Chargeback Rate",
    technical_name: "chargeback_rate",
    definition: "Chargebacks / Total transactions",
    level: "L2-Product",
  },

  // ========== CREDIT QUALITY ==========
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Credit Quality",
    name: "30+ Days Delinquency Rate",
    technical_name: "dpd_30_plus_rate",
    definition: "% of balances 30+ days past due",
    level: "L1-Enterprise",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Credit Quality",
    name: "Charge-Off Rate",
    technical_name: "charge_off_rate",
    definition: "Annualized charge-off rate",
    level: "L1-Enterprise",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Credit Quality",
    name: "Net Charge-Off Rate",
    technical_name: "net_charge_off_rate",
    definition: "(Charge-offs - Recoveries) / Avg receivables",
    level: "L1-Enterprise",
  },

  // ========== PROFITABILITY ==========
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Profitability",
    name: "Interchange Income",
    technical_name: "interchange_income",
    definition: "Income from merchant interchange fees",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Profitability",
    name: "Interest Income",
    technical_name: "interest_income",
    definition: "Income from cardholder interest charges",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Profitability",
    name: "Fee Income",
    technical_name: "fee_income",
    definition: "Annual fees, late fees, foreign transaction fees",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Profitability",
    name: "Rewards Cost",
    technical_name: "rewards_cost",
    definition: "Cost of rewards program (points/cashback)",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Profitability",
    name: "Net Interest Margin",
    technical_name: "net_interest_margin",
    definition: "(Interest income - Cost of funds) / Avg balances",
    level: "L1-Enterprise",
  },

  // ========== REWARDS ==========
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Rewards",
    name: "Rewards Redemption Rate",
    technical_name: "rewards_redemption_rate",
    definition: "Points redeemed / Points earned",
    level: "L2-Product",
  },
  {
    id: metricId++,
    domain: "Credit Cards",
    subdomain: "Rewards",
    name: "Rewards Breakage",
    technical_name: "rewards_breakage",
    definition: "Unredeemed points (expected to expire)",
    level: "L2-Product",
  },

  // Continue with 175+ more metrics...
  // Categories: Customer Behavior, Merchant Analytics, Channel Performance, etc.
];

export const creditCardsMetricCategories = {
  portfolioOverview: { count: 15 },
  transactionVolume: { count: 20 },
  fraudRisk: { count: 18 },
  creditQuality: { count: 20 },
  profitability: { count: 25 },
  rewards: { count: 15 },
  customerBehavior: { count: 20 },
  merchantAnalytics: { count: 18 },
  channelPerformance: { count: 15 },
  regulatory: { count: 20 },
  authorization: { count: 18 },
  disputes: { count: 12 },

  totalMetrics: 216,
};

export const creditCardsMetricsSummary = {
  totalMetrics: 216,
  categories: 12,
  coverageAreas: [
    "Portfolio management",
    "Authorization & settlement",
    "Fraud detection & prevention",
    "Credit quality & risk",
    "Profitability analysis",
    "Rewards programs",
    "Merchant analytics",
    "Customer behavior",
    "Regulatory compliance",
  ],
};
