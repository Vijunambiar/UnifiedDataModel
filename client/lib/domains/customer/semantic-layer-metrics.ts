/**
 * CUSTOMER DOMAIN - SEMANTIC LAYER METRICS
 * 
 * High-level business metrics with semantic definitions
 * These metrics abstract technical complexity and provide business-friendly views
 * Includes calculated dimensions, derived metrics, and business rule applications
 */

export interface SemanticMetric {
  metricId: string;
  displayName: string;
  businessDefinition: string;
  technicalDefinition: string;
  category: "Customer Base" | "Customer Value" | "Customer Health" | "Product Usage" | "Channel Mix";
  subCategory: string;
  sqlDefinition: string;
  calculatedDimensions: string[];
  businessRules: {
    rule: string;
    condition: string;
  }[];
  dataType: "Count" | "Amount" | "Rate" | "Score" | "Index";
  unit: string;
  targetAudience: string[];
  refreshSchedule: string;
  criticality: "High" | "Medium" | "Low";
  relatedMetrics: string[];
  benchmarks?: {
    industry: string;
    benchmark: number;
    year: number;
  };
}

// ============================================================================
// SEMANTIC LAYER METRICS
// ============================================================================
export const customerSemanticMetrics: SemanticMetric[] = [
  // ============================================================================
  // CUSTOMER BASE METRICS
  // ============================================================================
  {
    metricId: "CUST-SEM-001",
    displayName: "Customer Base Size",
    businessDefinition: "The total number of unique customers who have an active relationship with the bank",
    technicalDefinition:
      "Distinct count of CUSTOMER_NUMBER in DIM_CUSTOMER_DEMOGRAPHY where IS_CURRENT = TRUE and RECORD_STATUS = 'ACTIVE'",
    category: "Customer Base",
    subCategory: "Customer Population",
    sqlDefinition: `
      WITH active_customers AS (
        SELECT COUNT(DISTINCT CUSTOMER_NUMBER) as customer_count
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE IS_CURRENT = TRUE
          AND RECORD_STATUS = 'ACTIVE'
          AND PRCS_DTE = CURRENT_DATE()
      )
      SELECT 
        customer_count,
        'Active' as status,
        CURRENT_DATE() as reporting_date
      FROM active_customers
    `,
    calculatedDimensions: ["Business Date", "Customer Status"],
    businessRules: [
      {
        rule: "Only count customers with active relationship status",
        condition: "RECORD_STATUS = 'ACTIVE'",
      },
      {
        rule: "Include only current customer records (SCD Type 2)",
        condition: "IS_CURRENT = TRUE",
      },
    ],
    dataType: "Count",
    unit: "customers",
    targetAudience: ["Executive Leadership", "CFO", "Risk Management"],
    refreshSchedule: "Daily end-of-day",
    criticality: "High",
    relatedMetrics: ["CUST-SEM-002", "CUST-SEM-003"],
    benchmarks: {
      industry: "Large US Banks",
      benchmark: 5500000,
      year: 2024,
    },
  },
  {
    metricId: "CUST-SEM-002",
    displayName: "Customer Acquisition Rate",
    businessDefinition: "Monthly rate of new customer acquisition expressed as percentage of current customer base",
    technicalDefinition:
      "(New customers in month / Previous month active customers) * 100. Calculated using dim_customer acquisition dates.",
    category: "Customer Base",
    subCategory: "Growth",
    sqlDefinition: `
      WITH monthly_metrics AS (
        SELECT 
          DATE_TRUNC('month', CURRENT_DATE()) as month_start,
          COUNT(DISTINCT CASE 
            WHEN MONTH(CUSTOMER_ACQUISITION_DATE) = MONTH(CURRENT_DATE())
              AND YEAR(CUSTOMER_ACQUISITION_DATE) = YEAR(CURRENT_DATE())
            THEN CUSTOMER_NUMBER 
          END) as new_customers,
          COUNT(DISTINCT CUSTOMER_NUMBER) as total_active_customers
        FROM CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY
        WHERE IS_CURRENT = TRUE
          AND RECORD_STATUS = 'ACTIVE'
      )
      SELECT 
        ROUND((new_customers / NULLIF(total_active_customers - new_customers, 0)) * 100, 2) as acquisition_rate_pct,
        new_customers,
        'Monthly' as period
      FROM monthly_metrics
    `,
    calculatedDimensions: ["Period", "Acquisition Channel"],
    businessRules: [
      {
        rule: "Use acquisition date from customer attribute table",
        condition: "CUSTOMER_ACQUISITION_DATE is source of truth",
      },
      {
        rule: "Exclude churned customers from denominator",
        condition: "RECORD_STATUS = 'ACTIVE'",
      },
    ],
    dataType: "Rate",
    unit: "percentage",
    targetAudience: ["Head of Retail Banking", "Product Management"],
    refreshSchedule: "Monthly on 1st day",
    criticality: "Medium",
    relatedMetrics: ["CUST-SEM-001", "CUST-SEM-004"],
  },
  {
    metricId: "CUST-SEM-003",
    displayName: "Customer Churn Status",
    businessDefinition:
      "Classification of customers by their churn risk status based on recent activity patterns and historical behavior",
    technicalDefinition:
      "Segmentation based on days since last deposit activity (Active: <30 days, At Risk: 30-90 days, Churned: >180 days)",
    category: "Customer Base",
    subCategory: "Health",
    sqlDefinition: `
      SELECT 
        CUSTOMER_NUMBER,
        CASE 
          WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 30 THEN 'Active'
          WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 90 THEN 'At Risk'
          WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 180 THEN 'Inactive'
          ELSE 'Churned'
        END as churn_status,
        DP_DAYS_SINCE_LAST_DEPOSIT,
        CASE 
          WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 30 THEN 1
          WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 90 THEN 0.7
          WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 180 THEN 0.3
          ELSE 0
        END as retention_score
      FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
      WHERE PRCS_DTE = CURRENT_DATE()
        AND RECORD_STATUS = 'ACTIVE'
    `,
    calculatedDimensions: ["Churn Risk Segment", "Days Since Activity", "Retention Score"],
    businessRules: [
      {
        rule: "Active customers have deposit activity in last 30 days",
        condition: "DP_DAYS_SINCE_LAST_DEPOSIT <= 30",
      },
      {
        rule: "At-risk customers show declining engagement",
        condition: "30 < DP_DAYS_SINCE_LAST_DEPOSIT <= 90",
      },
      {
        rule: "Churned status when no activity for 6+ months",
        condition: "DP_DAYS_SINCE_LAST_DEPOSIT > 180",
      },
    ],
    dataType: "Score",
    unit: "segmentation",
    targetAudience: ["Retention Manager", "Campaign Marketing"],
    refreshSchedule: "Daily",
    criticality: "High",
    relatedMetrics: ["CUST-SEM-001"],
  },

  // ============================================================================
  // CUSTOMER VALUE METRICS
  // ============================================================================
  {
    metricId: "CUST-SEM-004",
    displayName: "Customer Economic Value",
    businessDefinition:
      "Total economic value contributed by a customer through deposits, account fees, and relationship depth. Stratified into value tiers for portfolio management.",
    technicalDefinition: "Composite of (Total Deposit Balance * 0.6 + Account Count * 50000 * 0.3 + Transaction Volume * 0.1)",
    category: "Customer Value",
    subCategory: "Wallet Share",
    sqlDefinition: `
      WITH customer_value_calc AS (
        SELECT 
          CUSTOMER_NUMBER,
          ACC_CURRENT_LEDGER_BALANCE,
          ACC_TOTAL_ACCOUNTS,
          DP_TRANSACTION_COUNT_12M,
          (ACC_CURRENT_LEDGER_BALANCE * 0.6 + 
           ACC_TOTAL_ACCOUNTS * 50000 * 0.3 + 
           COALESCE(DP_TRANSACTION_COUNT_12M, 0) * 100 * 0.1) as economic_value,
          CASE 
            WHEN (ACC_CURRENT_LEDGER_BALANCE * 0.6 + ACC_TOTAL_ACCOUNTS * 50000 * 0.3 + COALESCE(DP_TRANSACTION_COUNT_12M, 0) * 100 * 0.1) > 1000000 THEN 'Tier 1 (VIP)'
            WHEN (ACC_CURRENT_LEDGER_BALANCE * 0.6 + ACC_TOTAL_ACCOUNTS * 50000 * 0.3 + COALESCE(DP_TRANSACTION_COUNT_12M, 0) * 100 * 0.1) > 250000 THEN 'Tier 2 (Premium)'
            WHEN (ACC_CURRENT_LEDGER_BALANCE * 0.6 + ACC_TOTAL_ACCOUNTS * 50000 * 0.3 + COALESCE(DP_TRANSACTION_COUNT_12M, 0) * 100 * 0.1) > 50000 THEN 'Tier 3 (Standard)'
            ELSE 'Tier 4 (Entry)'
          END as value_tier
        FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
        WHERE PRCS_DTE = CURRENT_DATE()
          AND RECORD_STATUS = 'ACTIVE'
      )
      SELECT 
        CUSTOMER_NUMBER,
        ROUND(economic_value, 2) as total_economic_value,
        value_tier,
        ACC_CURRENT_LEDGER_BALANCE,
        ACC_TOTAL_ACCOUNTS
      FROM customer_value_calc
      ORDER BY economic_value DESC
    `,
    calculatedDimensions: ["Value Tier", "Deposit Concentration", "Product Diversification"],
    businessRules: [
      {
        rule: "Deposits weighted at 60% of value calculation",
        condition: "Reflects primary revenue source",
      },
      {
        rule: "Account relationships weighted at 30%",
        condition: "Indicates customer entrenchment",
      },
      {
        rule: "Transaction volume weighted at 10%",
        condition: "Indicates engagement and channel usage",
      },
    ],
    dataType: "Amount",
    unit: "USD",
    targetAudience: ["Relationship Managers", "Credit Risk", "Portfolio Management"],
    refreshSchedule: "Daily",
    criticality: "High",
    relatedMetrics: ["CUST-SEM-005", "CUST-SEM-006"],
    benchmarks: {
      industry: "Large US Banks",
      benchmark: 450000,
      year: 2024,
    },
  },
  {
    metricId: "CUST-SEM-005",
    displayName: "Product Wallet Penetration",
    businessDefinition:
      "Percentage of addressable product opportunities that a customer is consuming. Calculated across Deposits, Credit, and Investment products.",
    technicalDefinition:
      "Count of product categories customer participates in / 3 (Deposits, Credit, Investments) * 100",
    category: "Customer Value",
    subCategory: "Cross-sell Opportunity",
    sqlDefinition: `
      WITH product_participation AS (
        SELECT 
          CUSTOMER_NUMBER,
          (CASE WHEN ACC_TOTAL_ACCOUNTS > 0 THEN 1 ELSE 0 END +
           CASE WHEN ACC_CD_ACC_CNT > 0 THEN 1 ELSE 0 END +
           CASE WHEN DP_TO_INVESTMENT_CONVERSION_PCT > 0 THEN 1 ELSE 0 END) as products_held,
          CASE 
            WHEN ACC_SAVINGS_ACC_CNT > 0 OR ACC_CHECKING_ACC_CNT > 0 THEN 1
            ELSE 0
          END as has_deposits,
          CASE 
            WHEN ACC_CD_ACC_CNT > 0 OR DP_HIGH_YIELD_SAVINGS_CNT > 0 THEN 1
            ELSE 0
          END as has_investments,
          CASE 
            WHEN DP_TO_INVESTMENT_CONVERSION_PCT > 0 THEN 1
            ELSE 0
          END as has_other_products
        FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
        WHERE PRCS_DTE = CURRENT_DATE()
          AND RECORD_STATUS = 'ACTIVE'
      )
      SELECT 
        CUSTOMER_NUMBER,
        ROUND((products_held / 3.0) * 100, 2) as wallet_penetration_pct,
        products_held,
        CASE 
          WHEN (products_held / 3.0) >= 0.66 THEN 'High'
          WHEN (products_held / 3.0) >= 0.33 THEN 'Medium'
          ELSE 'Low'
        END as penetration_level
      FROM product_participation
    `,
    calculatedDimensions: ["Product Category", "Penetration Level"],
    businessRules: [
      {
        rule: "Count only active product relationships",
        condition: "Account count > 0 for that product category",
      },
      {
        rule: "Consider cross-sell opportunities",
        condition: "Products not yet held are targets for growth",
      },
    ],
    dataType: "Rate",
    unit: "percentage",
    targetAudience: ["Product Manager", "Sales Management"],
    refreshSchedule: "Daily",
    criticality: "Medium",
    relatedMetrics: ["CUST-SEM-004"],
  },

  // ============================================================================
  // CUSTOMER HEALTH METRICS
  // ============================================================================
  {
    metricId: "CUST-SEM-006",
    displayName: "Customer Health Score",
    businessDefinition:
      "Composite index (0-100) measuring overall customer relationship health. Combines activity, balance trends, product engagement, and risk factors.",
    technicalDefinition:
      "Weighted composite: (Activity Score * 0.35 + Balance Growth * 0.25 + Engagement * 0.25 + Risk Adjustment * 0.15) * 100",
    category: "Customer Health",
    subCategory: "Relationship Vitality",
    sqlDefinition: `
      WITH health_components AS (
        SELECT 
          CUSTOMER_NUMBER,
          CASE 
            WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 30 THEN 100
            WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 60 THEN 75
            WHEN DP_DAYS_SINCE_LAST_DEPOSIT <= 90 THEN 50
            ELSE 25
          END as activity_score,
          CASE 
            WHEN DP_BALANCE_CHANGE_LAST_90D_PCT > 0 THEN 100
            WHEN DP_BALANCE_CHANGE_LAST_90D_PCT > -5 THEN 75
            WHEN DP_BALANCE_CHANGE_LAST_90D_PCT > -15 THEN 50
            ELSE 25
          END as balance_growth_score,
          (ACC_TOTAL_ACCOUNTS / NULLIF((ACC_SAVINGS_ACC_CNT + ACC_CHECKING_ACC_CNT + ACC_CD_ACC_CNT), 0)) * 100 as engagement_score,
          CASE 
            WHEN DP_CONFIRMED_FRAUD_INCIDENTS_12M = 0 AND DP_OVERDRAFT_FEES_12M = 0 THEN 100
            WHEN DP_CONFIRMED_FRAUD_INCIDENTS_12M = 0 THEN 75
            ELSE 50
          END as risk_adjustment
        FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
        WHERE PRCS_DTE = CURRENT_DATE()
          AND RECORD_STATUS = 'ACTIVE'
      )
      SELECT 
        CUSTOMER_NUMBER,
        ROUND((
          activity_score * 0.35 + 
          balance_growth_score * 0.25 + 
          COALESCE(engagement_score, 0) * 0.25 + 
          risk_adjustment * 0.15
        ), 0) as health_score,
        CASE 
          WHEN (activity_score * 0.35 + balance_growth_score * 0.25 + COALESCE(engagement_score, 0) * 0.25 + risk_adjustment * 0.15) >= 80 THEN 'Excellent'
          WHEN (activity_score * 0.35 + balance_growth_score * 0.25 + COALESCE(engagement_score, 0) * 0.25 + risk_adjustment * 0.15) >= 60 THEN 'Good'
          WHEN (activity_score * 0.35 + balance_growth_score * 0.25 + COALESCE(engagement_score, 0) * 0.25 + risk_adjustment * 0.15) >= 40 THEN 'Fair'
          ELSE 'At Risk'
        END as health_status
      FROM health_components
    `,
    calculatedDimensions: ["Health Status", "Activity Score", "Balance Trend", "Risk Score"],
    businessRules: [
      {
        rule: "Activity is most important (35%)",
        condition: "Recent transaction patterns indicate engagement",
      },
      {
        rule: "Balance growth indicates confidence (25%)",
        condition: "Positive or stable balance trends",
      },
      {
        rule: "Risk adjustment protects against fraud (15%)",
        condition: "Penalize confirmed fraud or excessive fees",
      },
    ],
    dataType: "Score",
    unit: "index (0-100)",
    targetAudience: ["Relationship Manager", "Risk Officer"],
    refreshSchedule: "Daily",
    criticality: "High",
    relatedMetrics: ["CUST-SEM-003", "CUST-SEM-004"],
  },

  // ============================================================================
  // CHANNEL & PRODUCT USAGE
  // ============================================================================
  {
    metricId: "CUST-SEM-007",
    displayName: "Digital Banking Adoption Rate",
    businessDefinition: "Percentage of customers actively using digital banking channels for deposits and withdrawals",
    technicalDefinition: "Count(customers with digital transactions) / Total active customers * 100",
    category: "Product Usage",
    subCategory: "Channel Mix",
    sqlDefinition: `
      WITH digital_users AS (
        SELECT 
          COUNT(DISTINCT CASE 
            WHEN DP_PREFERRED_CHANNEL = 'DIGITAL' OR DP_HIGH_VALUE_CHANNEL = 'DIGITAL'
            THEN CUSTOMER_NUMBER 
          END) as digital_active_count,
          COUNT(DISTINCT CUSTOMER_NUMBER) as total_active_count
        FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
        WHERE PRCS_DTE = CURRENT_DATE()
          AND RECORD_STATUS = 'ACTIVE'
      )
      SELECT 
        ROUND((digital_active_count / NULLIF(total_active_count, 0)) * 100, 2) as digital_adoption_rate_pct,
        digital_active_count,
        total_active_count
      FROM digital_users
    `,
    calculatedDimensions: ["Channel", "Adoption Segment"],
    businessRules: [
      {
        rule: "Count as digital user if preferred or high-value channel is digital",
        condition: "DP_PREFERRED_CHANNEL = 'DIGITAL' OR DP_HIGH_VALUE_CHANNEL = 'DIGITAL'",
      },
    ],
    dataType: "Rate",
    unit: "percentage",
    targetAudience: ["Digital Banking Head", "Operations"],
    refreshSchedule: "Daily",
    criticality: "Medium",
    relatedMetrics: ["CUST-SEM-008"],
  },
  {
    metricId: "CUST-SEM-008",
    displayName: "Branch Channel Dependency",
    businessDefinition: "Percentage of customer transactions conducted through physical branch locations",
    technicalDefinition: "Branch transactions / Total transactions * 100",
    category: "Product Usage",
    subCategory: "Channel Mix",
    sqlDefinition: `
      SELECT 
        CUSTOMER_NUMBER,
        ROUND(DP_BRANCH_TO_DIGITAL_RATIO / (DP_BRANCH_TO_DIGITAL_RATIO + 1) * 100, 2) as branch_dependency_pct,
        CASE 
          WHEN DP_BRANCH_TO_DIGITAL_RATIO > 1.0 THEN 'Branch Heavy'
          WHEN DP_BRANCH_TO_DIGITAL_RATIO BETWEEN 0.5 AND 1.0 THEN 'Balanced'
          ELSE 'Digital Heavy'
        END as channel_preference
      FROM ANALYTICS.CUSTOMER_DEPOSIT_AGGR
      WHERE PRCS_DTE = CURRENT_DATE()
        AND RECORD_STATUS = 'ACTIVE'
        AND DP_BRANCH_TO_DIGITAL_RATIO IS NOT NULL
    `,
    calculatedDimensions: ["Channel Preference"],
    businessRules: [
      {
        rule: "Branch dependency indicates operational cost",
        condition: "Plan for digital migration accordingly",
      },
    ],
    dataType: "Rate",
    unit: "percentage",
    targetAudience: ["Operations Manager", "Retail Banking"],
    refreshSchedule: "Daily",
    criticality: "Low",
    relatedMetrics: ["CUST-SEM-007"],
  },
];

export const customerSemanticLayerComplete = {
  metrics: customerSemanticMetrics,
  totalMetrics: customerSemanticMetrics.length,
  categories: {
    "Customer Base": customerSemanticMetrics.filter((m) => m.category === "Customer Base").length,
    "Customer Value": customerSemanticMetrics.filter((m) => m.category === "Customer Value").length,
    "Customer Health": customerSemanticMetrics.filter((m) => m.category === "Customer Health").length,
    "Product Usage": customerSemanticMetrics.filter((m) => m.category === "Product Usage").length,
    "Channel Mix": customerSemanticMetrics.filter((m) => m.category === "Channel Mix").length,
  },
  description:
    "Customer domain semantic layer with business-friendly metrics, calculated dimensions, and applied business rules",
};

export default customerSemanticLayerComplete;
