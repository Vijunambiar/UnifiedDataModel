/**
 * DEPOSITS DOMAIN - SEMANTIC LAYER METRICS
 * 
 * High-level business metrics with semantic definitions for deposits
 * These metrics abstract technical complexity and provide business-friendly views
 */

export interface SemanticMetric {
  metricId: string;
  displayName: string;
  businessDefinition: string;
  technicalDefinition: string;
  category: "Deposit Base" | "Deposit Value" | "Deposit Health" | "Product Performance";
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

export const depositsSemanticMetrics: SemanticMetric[] = [
  {
    metricId: "DEP-SEM-001",
    displayName: "Total Deposit Base",
    businessDefinition: "Total combined balance of all deposit accounts held by the bank",
    technicalDefinition:
      "Sum of CURRENT_BALANCE from FCT_DEPOSIT_DAILY_BALANCE on reporting date for active accounts",
    category: "Deposit Base",
    subCategory: "Total Deposits",
    sqlDefinition: `
      SELECT 
        SUM(CURRENT_BALANCE) as total_deposits,
        COUNT(DISTINCT ACCOUNT_NUMBER) as account_count,
        CURRENT_DATE() as reporting_date
      FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
      WHERE BALANCE_DATE = CURRENT_DATE()
        AND ACCOUNT_STATUS = 'ACTIVE'
    `,
    calculatedDimensions: ["Reporting Date", "Account Status"],
    businessRules: [
      {
        rule: "Only include active accounts",
        condition: "ACCOUNT_STATUS = 'ACTIVE'",
      },
      {
        rule: "Use current business date",
        condition: "BALANCE_DATE = CURRENT_DATE()",
      },
    ],
    dataType: "Amount",
    unit: "USD",
    targetAudience: ["CFO", "Treasurer", "Executive Board"],
    refreshSchedule: "Daily end-of-day",
    criticality: "High",
    relatedMetrics: ["DEP-SEM-002", "DEP-SEM-003"],
  },
  {
    metricId: "DEP-SEM-002",
    displayName: "Deposit Concentration Risk",
    businessDefinition:
      "Percentage of total deposits held in accounts exceeding $1M (identifies concentration risk exposure)",
    technicalDefinition: "Sum of balances > $1M / Total deposits * 100",
    category: "Deposit Health",
    subCategory: "Risk Profile",
    sqlDefinition: `
      WITH concentration_data AS (
        SELECT 
          SUM(CASE WHEN CURRENT_BALANCE > 1000000 THEN CURRENT_BALANCE ELSE 0 END) as high_balance_amount,
          SUM(CURRENT_BALANCE) as total_deposits
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE = CURRENT_DATE()
          AND ACCOUNT_STATUS = 'ACTIVE'
      )
      SELECT 
        ROUND((high_balance_amount / NULLIF(total_deposits, 0)) * 100, 2) as concentration_risk_pct,
        high_balance_amount,
        total_deposits
      FROM concentration_data
    `,
    calculatedDimensions: ["Risk Level", "Large Depositor Count"],
    businessRules: [
      {
        rule: "Large depositors defined as > $1M balance",
        condition: "Regulatory concentration threshold",
      },
    ],
    dataType: "Rate",
    unit: "percentage",
    targetAudience: ["Chief Risk Officer", "Compliance"],
    refreshSchedule: "Daily",
    criticality: "High",
    relatedMetrics: ["DEP-SEM-001"],
  },
  {
    metricId: "DEP-SEM-003",
    displayName: "Deposit Product Diversification",
    businessDefinition: "Index measuring balance of deposit types across Savings, Checking, and CD products",
    technicalDefinition:
      "Calculated using Herfindahl index on product type distribution: 1 - SUM((product_percentage)^2)",
    category: "Product Performance",
    subCategory: "Portfolio Mix",
    sqlDefinition: `
      WITH product_balances AS (
        SELECT 
          ACCOUNT_TYPE,
          SUM(CURRENT_BALANCE) as type_balance,
          SUM(SUM(CURRENT_BALANCE)) OVER () as total_balance
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_ACCOUNT da ON fdb.ACCOUNT_NUMBER = da.ACCOUNT_NUMBER
        WHERE BALANCE_DATE = CURRENT_DATE()
          AND ACCOUNT_STATUS = 'ACTIVE'
        GROUP BY ACCOUNT_TYPE
      )
      SELECT 
        ROUND(1.0 - SUM(POWER(type_balance / NULLIF(total_balance, 0), 2)), 3) as diversification_index,
        COUNT(DISTINCT ACCOUNT_TYPE) as product_types
      FROM product_balances
    `,
    calculatedDimensions: ["Product Type Distribution"],
    businessRules: [
      {
        rule: "Herfindahl index of 0 = perfect concentration, 1 = perfect diversification",
        condition: "Index interpretation scale",
      },
    ],
    dataType: "Index",
    unit: "index (0-1)",
    targetAudience: ["Product Manager", "Treasury"],
    refreshSchedule: "Daily",
    criticality: "Medium",
    relatedMetrics: ["DEP-SEM-001"],
  },
  {
    metricId: "DEP-SEM-004",
    displayName: "Deposit Stability Ratio",
    businessDefinition: "Measure of deposit base stability based on historical volatility and churn patterns",
    technicalDefinition: "1 - (90-day std dev of balances / 90-day average balance)",
    category: "Deposit Health",
    subCategory: "Stability",
    sqlDefinition: `
      WITH balance_volatility AS (
        SELECT 
          STDDEV(CURRENT_BALANCE) as balance_stddev,
          AVG(CURRENT_BALANCE) as balance_avg
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE
        WHERE BALANCE_DATE >= DATEADD(day, -90, CURRENT_DATE())
          AND ACCOUNT_STATUS = 'ACTIVE'
      )
      SELECT 
        ROUND(1.0 - (balance_stddev / NULLIF(balance_avg, 0)), 3) as stability_ratio
      FROM balance_volatility
    `,
    calculatedDimensions: ["Volatility Index"],
    businessRules: [
      {
        rule: "Higher ratio indicates more stable deposit base",
        condition: "Range: 0 (unstable) to 1 (perfectly stable)",
      },
    ],
    dataType: "Score",
    unit: "ratio (0-1)",
    targetAudience: ["Treasury", "Risk Management"],
    refreshSchedule: "Daily",
    criticality: "High",
    relatedMetrics: ["DEP-SEM-001", "DEP-SEM-002"],
  },
  {
    metricId: "DEP-SEM-005",
    displayName: "CD Maturity Ladder Health",
    businessDefinition: "Assessment of CD portfolio maturity distribution across time buckets for liquidity planning",
    technicalDefinition:
      "Percentage of CD balance maturing in each time bucket: 0-30 days, 30-90 days, 90-180 days, 180+ days",
    category: "Product Performance",
    subCategory: "Maturity Profile",
    sqlDefinition: `
      WITH cd_maturities AS (
        SELECT 
          CASE 
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) BETWEEN 0 AND 30 THEN '0-30 Days'
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) BETWEEN 31 AND 90 THEN '31-90 Days'
            WHEN DATEDIFF(day, CURRENT_DATE(), MATURITY_DATE) BETWEEN 91 AND 180 THEN '91-180 Days'
            ELSE '180+ Days'
          END as maturity_bucket,
          CURRENT_BALANCE,
          SUM(CURRENT_BALANCE) OVER () as total_cd_balance
        FROM CORE_DEPOSIT.FCT_DEPOSIT_DAILY_BALANCE fdb
        JOIN CORE_DEPOSIT.DIM_DEPOSIT dd ON fdb.ACCOUNT_NUMBER = dd.ACCOUNT_NUMBER
        WHERE BALANCE_DATE = CURRENT_DATE()
          AND ACCOUNT_TYPE = 'CD'
          AND ACCOUNT_STATUS = 'ACTIVE'
      )
      SELECT 
        maturity_bucket,
        ROUND(SUM(CURRENT_BALANCE), 0) as bucket_balance,
        ROUND((SUM(CURRENT_BALANCE) / NULLIF(MAX(total_cd_balance), 0)) * 100, 2) as percentage
      FROM cd_maturities
      GROUP BY maturity_bucket
    `,
    calculatedDimensions: ["Maturity Bucket", "Reinvestment Risk"],
    businessRules: [
      {
        rule: "Balanced ladder indicates lower reinvestment risk",
        condition: "No single bucket should exceed 40% of total",
      },
    ],
    dataType: "Rate",
    unit: "percentage",
    targetAudience: ["Liability Manager", "Treasury"],
    refreshSchedule: "Daily",
    criticality: "Medium",
    relatedMetrics: ["DEP-SEM-001"],
  },
];

export const depositsSemanticLayerComplete = {
  metrics: depositsSemanticMetrics,
  totalMetrics: depositsSemanticMetrics.length,
  categories: {
    "Deposit Base": depositsSemanticMetrics.filter((m) => m.category === "Deposit Base").length,
    "Deposit Value": depositsSemanticMetrics.filter((m) => m.category === "Deposit Value").length,
    "Deposit Health": depositsSemanticMetrics.filter((m) => m.category === "Deposit Health").length,
    "Product Performance": depositsSemanticMetrics.filter((m) => m.category === "Product Performance").length,
  },
  description: "Deposits domain semantic layer with business-friendly metrics and calculated dimensions",
};

export default depositsSemanticLayerComplete;
