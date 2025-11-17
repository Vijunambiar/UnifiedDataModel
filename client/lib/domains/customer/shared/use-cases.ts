// Customer Domain Use Cases
// Key business problems solved by the customer domain

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

export const customerUseCases: UseCase[] = [
  {
    id: "customer-360",
    name: "Customer 360 View",
    description:
      "Complete unified view of customer across all touchpoints, products, and channels",
    businessProblem:
      "Fragmented customer data across legacy systems prevents holistic understanding of customer relationships and value",
    solution:
      "Integrate customer data from FIS core, PEGA, Adobe, Salesforce to create a single source of truth for customer information",
    keyMetrics: [
      "Total Customers",
      "Customer CLV",
      "Product Penetration",
      "Channel Usage",
    ],
    stakeholders: ["Retail Banking Head", "Digital Officer", "CRM Manager"],
    expectedROI: "$2.5M annually from better cross-sell and retention",
    implementationComplexity: "High",
    timeToValue: "3-4 months",
    dataRequirements: [
      "FIS customer master",
      "Product ownership",
      "Account balances",
      "Transaction history",
      "Marketing interactions",
    ],
  },
  {
    id: "customer-segmentation",
    name: "Advanced Customer Segmentation",
    description:
      "RFM-based segmentation enabling targeted marketing and personalized offerings",
    businessProblem:
      "One-size-fits-all marketing campaigns have 3% conversion rate; need dynamic segmentation",
    solution:
      "Build RFM, behavioral, and predictive segmentation to enable micro-targeting and personalization",
    keyMetrics: [
      "Segment Distribution",
      "Segment-wise CLV",
      "Campaign Conversion %",
      "Segment Churn Rate",
    ],
    stakeholders: ["Marketing VP", "Product Manager", "Risk Officer"],
    expectedROI: "$4M annually from improved campaign ROI (15% to 25% conversion)",
    implementationComplexity: "Medium",
    timeToValue: "2 months",
    dataRequirements: [
      "Customer transactions",
      "Product history",
      "Campaign responses",
      "Customer demographics",
    ],
  },
  {
    id: "kyc-cdd-compliance",
    name: "KYC/CDD Compliance & Risk",
    description:
      "Automated KYC/CDD processes with risk scoring and regulatory reporting",
    businessProblem:
      "Manual KYC review processes are slow, error-prone, and create regulatory risk",
    solution:
      "Automate KYC validation, CDD assessment, and generate regulatory compliance reports",
    keyMetrics: [
      "KYC Completion %",
      "High-Risk Customer Count",
      "Compliance Report Accuracy",
      "SAR Filing Rate",
    ],
    stakeholders: ["Compliance Officer", "Risk Manager", "Legal"],
    expectedROI: "$1.5M annually from reduced regulatory fines and operational efficiency",
    implementationComplexity: "High",
    timeToValue: "4-5 months",
    dataRequirements: [
      "Customer identity documents",
      "Transaction patterns",
      "Sanctions list",
      "PEP data",
      "Customer risk assessments",
    ],
  },
  {
    id: "churn-prediction",
    name: "Customer Churn Prediction",
    description:
      "Predictive models to identify at-risk customers for proactive retention",
    businessProblem:
      "Customer attrition is 15% annually; reactive responses are too late",
    solution:
      "Build ML models using transaction, engagement, and demographics to predict churn 90 days in advance",
    keyMetrics: [
      "Churn Rate",
      "At-Risk Customer Count",
      "Retention Intervention Success Rate",
      "CLV Retained",
    ],
    stakeholders: ["Retail Banking Head", "Customer Service VP", "Analytics"],
    expectedROI: "$3.2M annually from improved retention (5% reduction in churn)",
    implementationComplexity: "High",
    timeToValue: "3 months",
    dataRequirements: [
      "Transaction history",
      "Channel engagement",
      "Product ownership",
      "Customer satisfaction scores",
    ],
  },
  {
    id: "cross-sell-upsell",
    name: "Cross-sell & Upsell Opportunity",
    description:
      "Identify and recommend products to customers based on profile and behavior",
    businessProblem:
      "Average customer owns 1.8 products; competitors cross-sell at 3.2 products per customer",
    solution:
      "Build propensity models to recommend next-best products for each customer segment",
    keyMetrics: [
      "Products Per Customer",
      "Cross-sell Rate",
      "Upsell Revenue",
      "Recommendation Acceptance %",
    ],
    stakeholders: ["Product Manager", "Marketing VP", "Sales Manager"],
    expectedROI: "$5.8M annually from increased product penetration",
    implementationComplexity: "Medium",
    timeToValue: "6-8 weeks",
    dataRequirements: [
      "Customer product portfolio",
      "Transaction data",
      "Demographics",
      "Customer profitability",
    ],
  },
];

export const customerDataQualityPriorities = [
  {
    issue: "Duplicate customer records",
    severity: "High",
    impact:
      "Skewed metrics, incorrect CLV, poor customer experience from duplicate communications",
    resolution: "Implement entity resolution with fuzzy matching on name + DOB + phone",
  },
  {
    issue: "Missing KYC data",
    severity: "Critical",
    impact: "Regulatory non-compliance, fines, reputational damage",
    resolution: "Daily ETL validation, data quality scores, escalation workflows",
  },
  {
    issue: "Stale customer demographics",
    severity: "Medium",
    impact: "Inaccurate segmentation, wrong customer communications",
    resolution: "Quarterly refresh from FIS, annual verification campaigns",
  },
  {
    issue: "PII data exposure",
    severity: "Critical",
    impact: "GDPR/CCPA violations, customer trust loss, legal liability",
    resolution: "Row-level security, tokenization, encryption, audit logging",
  },
];
