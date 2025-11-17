// Deposits Domain Use Cases
// Key business problems solved by the deposits domain

export interface UseCase {
  id: string;
  name: string;
  description: string;
  businessProblem: string;
  solution: string;
  keyMetrics: string[];
  stakeholders: string[];
  expectedROI: string;
  implementationComplexity: "Low" | "Medium" | "High";
  timeToValue: string;
  dataRequirements: string[];
}

export const depositsUseCases: UseCase[] = [
  {
    id: "deposit-analytics",
    name: "Deposit Analytics & Growth",
    description: "Track deposit growth, customer behavior, and product performance",
    businessProblem: "Cannot identify which products/channels drive deposit growth; budgets allocated based on guesswork",
    solution: "Daily deposit analytics showing flows by product, channel, customer segment, and geography with trend analysis",
    keyMetrics: [
      "Total Deposits",
      "New Deposits",
      "Deposit Growth %",
      "Average Balance",
      "Product Mix",
    ],
    stakeholders: ["Treasurer", "CFO", "Retail Banking Head", "Product Manager"],
    expectedROI: "$8M annually from optimized product mix and pricing",
    implementationComplexity: "Medium",
    timeToValue: "6-8 weeks",
    dataRequirements: [
      "FIS daily account snapshots",
      "Interest rate tables",
      "Product definitions",
      "Channel data",
    ],
  },
  {
    id: "interest-accrual",
    name: "Interest Accrual & Expense Tracking",
    description: "Accurate real-time tracking of interest expense and accrual",
    businessProblem: "Month-end interest accrual reconciliations take 5 days; late reporting delays financial close",
    solution: "Daily real-time interest accrual calculation with automated reconciliation to GL",
    keyMetrics: [
      "Interest Expense",
      "Cost of Funds",
      "Interest Accrual",
      "GL Variance",
    ],
    stakeholders: ["Treasurer", "Controller", "Financial Planning"],
    expectedROI: "$1.2M annually from faster close, reduced manual effort",
    implementationComplexity: "Medium",
    timeToValue: "8-10 weeks",
    dataRequirements: [
      "Daily balance snapshots",
      "Interest rate tables",
      "Product rate schedules",
      "GL account mappings",
    ],
  },
  {
    id: "regulatory-reporting",
    name: "Basel III Regulatory Compliance (LCR/NSFR)",
    description: "Automated calculation of Liquidity Coverage Ratio (LCR) and Net Stable Funding Ratio (NSFR)",
    businessProblem: "Manual LCR/NSFR calculations are error-prone; regulatory reporting deadlines at risk",
    solution: "Automated daily LCR/NSFR calculation with audit trail for regulatory submissions",
    keyMetrics: [
      "LCR Ratio",
      "NSFR Ratio",
      "Regulatory Capital",
      "Liquidity Coverage",
    ],
    stakeholders: ["Compliance Officer", "Chief Risk Officer", "Treasurer"],
    expectedROI: "$2.5M annually from avoided regulatory fines and operational efficiency",
    implementationComplexity: "High",
    timeToValue: "4-5 months",
    dataRequirements: [
      "Deposit composition",
      "Funding term structure",
      "Maturity ladders",
      "Regulatory definitions",
    ],
  },
  {
    id: "customer-concentration",
    name: "Customer Concentration Risk Analysis",
    description: "Monitor concentration risk - identifying too-large deposits from single customers",
    businessProblem: "High concentration risk not visible; loss of major depositors creates liquidity crisis",
    solution: "Daily customer concentration reports with alerts for >5% single-customer deposits",
    keyMetrics: [
      "Top 20 Depositors",
      "Concentration Ratio",
      "Deposit Stability",
      "Replacement Time",
    ],
    stakeholders: ["Chief Risk Officer", "Treasury", "Funding Manager"],
    expectedROI: "$3M annually from improved funding stability and reduced liquidity risk",
    implementationComplexity: "Low",
    timeToValue: "4-6 weeks",
    dataRequirements: [
      "Customer deposit summary",
      "Historical deposit trends",
      "Customer classifications",
    ],
  },
  {
    id: "pricing-optimization",
    name: "Deposit Pricing Optimization",
    description: "Optimize deposit rates to balance growth and profitability",
    businessProblem: "Pricing decisions based on competitors; losing deposits to higher rates elsewhere",
    solution: "Analytics showing optimal rates by product, channel, and customer segment to maximize deposits while maintaining margins",
    keyMetrics: [
      "Cost of Funds",
      "NIM",
      "Deposit Volume",
      "Rate Sensitivity",
    ],
    stakeholders: ["Treasurer", "Product Manager", "Pricing Manager"],
    expectedROI: "$6M annually from improved pricing strategy",
    implementationComplexity: "High",
    timeToValue: "3-4 months",
    dataRequirements: [
      "Competitive rate intelligence",
      "Cost of funds by product",
      "Demand elasticity data",
      "Market conditions",
    ],
  },
];

export const depositsDataQualityPriorities = [
  {
    issue: "Daily balance snapshot timing variance",
    severity: "High",
    impact: "Inaccurate AUM, regulatory reporting errors",
    resolution: "Standardize snapshot time to EOD 5 PM ET across all systems",
  },
  {
    issue: "Missing interest accrual records",
    severity: "High",
    impact: "Incomplete interest expense tracking, GL reconciliation failures",
    resolution: "Add validation that all accounts have interest accrual entries daily",
  },
  {
    issue: "Stale interest rate tables",
    severity: "Medium",
    impact: "Wrong interest calculations, pricing analysis incorrect",
    resolution: "Real-time sync of interest rate changes from FIS to data warehouse",
  },
];
