/**
 * TRANSACTIONS DOMAIN - SEMANTIC LAYER METRICS
 * 
 * High-level business metrics with semantic definitions for transactions
 * These metrics abstract technical complexity and provide business-friendly views
 */

export interface SemanticMetric {
  metricId: string;
  displayName: string;
  businessDefinition: string;
  technicalDefinition: string;
  category: "Transaction Flow" | "Transaction Quality" | "Transaction Risk" | "Business Efficiency";
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
}

export const transactionsSemanticMetrics: SemanticMetric[] = [
  {
    metricId: "TXN-SEM-001",
    displayName: "Transaction Processing Efficiency",
    businessDefinition:
      "Overall measure of transaction system efficiency considering volume, speed, and success rate",
    technicalDefinition:
      "Composite index: (Completed transactions / Total transactions) * 100 + (1000 / Avg processing time in seconds) normalized to 0-100 scale",
    category: "Business Efficiency",
    subCategory: "System Performance",
    sqlDefinition: `
      WITH efficiency_metrics AS (
        SELECT 
          COUNT(CASE WHEN TRANSACTION_STATUS = 'COMPLETED' THEN 1 END) as completed,
          COUNT(*) as total,
          AVG(DATEDIFF(second, SUBMISSION_TIME, COMPLETION_TIME)) as avg_seconds
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
      )
      SELECT 
        ROUND(
          ((completed / NULLIF(total, 0)) * 50) + 
          (MIN(1000 / NULLIF(avg_seconds, 0), 50))
        , 2) as efficiency_score
      FROM efficiency_metrics
    `,
    calculatedDimensions: ["System Health", "Processing Capacity"],
    businessRules: [
      {
        rule: "Score above 80 indicates excellent efficiency",
        condition: "Target SLA performance",
      },
      {
        rule: "Score below 60 indicates operational issues",
        condition: "Requires investigation",
      },
    ],
    dataType: "Score",
    unit: "index (0-100)",
    targetAudience: ["Chief Technology Officer", "Operations Manager"],
    refreshSchedule: "Daily",
    criticality: "High",
    relatedMetrics: ["TXN-SEM-002"],
  },
  {
    metricId: "TXN-SEM-002",
    displayName: "Transaction Quality Score",
    businessDefinition:
      "Composite measure of transaction health incorporating success rates, fraud incidents, and system errors",
    technicalDefinition:
      "Weighted formula: (1 - Failure Rate) * 0.5 + (1 - Fraud Rate) * 0.3 + (1 - Error Rate) * 0.2, normalized to 0-100",
    category: "Transaction Quality",
    subCategory: "Health Monitoring",
    sqlDefinition: `
      WITH quality_metrics AS (
        SELECT 
          ROUND(COUNT(CASE WHEN TRANSACTION_STATUS = 'COMPLETED' THEN 1 END) / NULLIF(COUNT(*), 0), 3) as success_rate,
          ROUND(COUNT(CASE WHEN IS_SUSPICIOUS = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 3) as fraud_rate,
          ROUND(COUNT(CASE WHEN TRANSACTION_STATUS = 'ERROR' THEN 1 END) / NULLIF(COUNT(*), 0), 3) as error_rate
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
      )
      SELECT 
        ROUND(
          ((1 - success_rate) * 0.5 + (1 - fraud_rate) * 0.3 + (1 - error_rate) * 0.2) * 100
        , 2) as quality_score
      FROM quality_metrics
    `,
    calculatedDimensions: ["Error Rate", "Fraud Rate", "Success Rate"],
    businessRules: [
      {
        rule: "Quality score of 95+ is considered excellent",
        condition: "Minimal errors and fraud",
      },
      {
        rule: "Quality score below 90 requires monitoring",
        condition: "May indicate systemic issues",
      },
    ],
    dataType: "Score",
    unit: "index (0-100)",
    targetAudience: ["Quality Assurance Manager", "Operations"],
    refreshSchedule: "Daily",
    criticality: "High",
    relatedMetrics: ["TXN-SEM-001"],
  },
  {
    metricId: "TXN-SEM-003",
    displayName: "Daily Transaction Throughput",
    businessDefinition:
      "Measure of daily transaction processing capacity expressed as transactions per hour during business hours",
    technicalDefinition: "Total daily transactions / 16 (standard business hours)",
    category: "Transaction Flow",
    subCategory: "Capacity",
    sqlDefinition: `
      SELECT 
        COUNT(DISTINCT TRANSACTION_ID) as daily_transactions,
        ROUND(COUNT(DISTINCT TRANSACTION_ID) / 16.0, 0) as txn_per_hour,
        CURRENT_DATE() as reporting_date
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE = CURRENT_DATE()
        AND TRANSACTION_STATUS = 'COMPLETED'
    `,
    calculatedDimensions: ["Peak Hours", "Capacity Utilization"],
    businessRules: [
      {
        rule: "Transactions spread across business hours",
        condition: "9 AM to 5 PM EST",
      },
    ],
    dataType: "Rate",
    unit: "transactions per hour",
    targetAudience: ["Infrastructure Team", "Operations"],
    refreshSchedule: "Daily",
    criticality: "Medium",
    relatedMetrics: ["TXN-SEM-001"],
  },
  {
    metricId: "TXN-SEM-004",
    displayName: "Fraud Prevention Effectiveness",
    businessDefinition:
      "Percentage of potential fraudulent transactions caught by detection system before posting",
    technicalDefinition: "Flagged and prevented / (Flagged and prevented + Confirmed fraud after posting) * 100",
    category: "Transaction Risk",
    subCategory: "Fraud Prevention",
    sqlDefinition: `
      WITH fraud_detection AS (
        SELECT 
          COUNT(CASE WHEN IS_SUSPICIOUS = TRUE AND TRANSACTION_STATUS = 'FLAGGED' THEN 1 END) as prevented,
          COUNT(CASE WHEN CONFIRMED_FRAUD = TRUE THEN 1 END) as confirmed_fraud
        FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
        WHERE TRANSACTION_DATE >= DATEADD(day, -90, CURRENT_DATE())
      )
      SELECT 
        ROUND((prevented / NULLIF(prevented + confirmed_fraud, 0)) * 100, 2) as prevention_effectiveness_pct
      FROM fraud_detection
    `,
    calculatedDimensions: ["False Positive Rate", "Detection Rate"],
    businessRules: [
      {
        rule: "Target effectiveness of 98%+",
        condition: "Catch fraud before losses occur",
      },
    ],
    dataType: "Rate",
    unit: "percentage",
    targetAudience: ["Chief Risk Officer", "Fraud Analytics"],
    refreshSchedule: "Daily",
    criticality: "High",
    relatedMetrics: ["TXN-SEM-002"],
  },
  {
    metricId: "TXN-SEM-005",
    displayName: "Transaction Settlement Speed",
    businessDefinition: "Average time for transactions to move from submission to final settlement",
    technicalDefinition: "Median time from SUBMISSION_TIME to SETTLEMENT_TIME across all completed transactions",
    category: "Business Efficiency",
    subCategory: "Timing & Delays",
    sqlDefinition: `
      SELECT 
        PERCENTILE_CONT(0.5) WITHIN GROUP (
          ORDER BY DATEDIFF(hour, SUBMISSION_TIME, SETTLEMENT_TIME)
        ) as median_settlement_hours,
        AVG(DATEDIFF(hour, SUBMISSION_TIME, SETTLEMENT_TIME)) as avg_settlement_hours
      FROM CORE_DEPOSIT.FCT_DEPOSIT_CERTIFICATE_TRANSACTION
      WHERE TRANSACTION_DATE >= DATEADD(day, -30, CURRENT_DATE())
        AND TRANSACTION_STATUS = 'COMPLETED'
        AND SETTLEMENT_TIME IS NOT NULL
    `,
    calculatedDimensions: ["Settlement Latency", "Transaction Type"],
    businessRules: [
      {
        rule: "Most transactions should settle within 2 business days",
        condition: "Standard clearing timelines",
      },
    ],
    dataType: "Rate",
    unit: "hours",
    targetAudience: ["Treasury", "Settlement Operations"],
    refreshSchedule: "Daily",
    criticality: "Medium",
    relatedMetrics: ["TXN-SEM-001"],
  },
];

export const transactionsSemanticLayerComplete = {
  metrics: transactionsSemanticMetrics,
  totalMetrics: transactionsSemanticMetrics.length,
  categories: {
    "Transaction Flow": transactionsSemanticMetrics.filter((m) => m.category === "Transaction Flow").length,
    "Transaction Quality": transactionsSemanticMetrics.filter((m) => m.category === "Transaction Quality").length,
    "Transaction Risk": transactionsSemanticMetrics.filter((m) => m.category === "Transaction Risk").length,
    "Business Efficiency": transactionsSemanticMetrics.filter((m) => m.category === "Business Efficiency").length,
  },
  description: "Transactions domain semantic layer with business-friendly metrics and calculated dimensions",
};

export default transactionsSemanticLayerComplete;
