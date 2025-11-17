// Transactions Domain Use Cases
// Key business problems solved by the transactions domain

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

export const transactionsUseCases: UseCase[] = [
  {
    id: "fraud-detection",
    name: "Real-time Fraud Detection",
    description: "Detect fraudulent transactions in real-time using ML models and rule-based systems",
    businessProblem:
      "Fraud losses are $12M annually; current detection catches fraud after customer complaints (lag)",
    solution:
      "Real-time transaction monitoring with ML models + rule engine to block suspicious transactions before completion",
    keyMetrics: [
      "Fraud Detection Rate",
      "False Positive Rate",
      "Fraud Loss Prevention",
      "Customer Complaint Rate",
    ],
    stakeholders: ["Chief Risk Officer", "Fraud Manager", "Customer Service VP"],
    expectedROI: "$8M annually from prevented fraud losses (50% reduction)",
    implementationComplexity: "High",
    timeToValue: "4-5 months",
    dataRequirements: [
      "Transaction history",
      "Customer profile",
      "Device/IP data",
      "Merchant data",
      "Historical fraud labels",
    ],
  },
  {
    id: "channel-analytics",
    name: "Channel Performance Analytics",
    description: "Analyze which channels (Mobile, Online, Branch, ATM) drive adoption and satisfaction",
    businessProblem:
      "Digital migration target is 80% by 2025; cannot identify which channels to invest in",
    solution:
      "Daily channel analytics showing adoption trends, customer satisfaction by channel, migration patterns",
    keyMetrics: [
      "Channel Mix %",
      "Digital Adoption",
      "Channel NPS",
      "Cost Per Transaction by Channel",
    ],
    stakeholders: ["Digital Officer", "Retail Banking Head", "Product Manager"],
    expectedROI: "$6M annually from optimized channel investments",
    implementationComplexity: "Medium",
    timeToValue: "2-3 months",
    dataRequirements: [
      "Transaction data with channel",
      "Customer satisfaction scores",
      "Channel costs",
      "Digital onboarding data",
    ],
  },
  {
    id: "transaction-revenue",
    name: "Transaction Revenue Optimization",
    description: "Optimize transaction fees to maximize revenue without impacting customer satisfaction",
    businessProblem:
      "Transaction fee revenue is static; competitors charging higher fees with better experience",
    solution:
      "Elasticity analysis showing fee impact on transaction volume and churn; optimize by segment",
    keyMetrics: [
      "Transaction Fee Revenue",
      "Fee Waiver Rate",
      "Transaction Count by Fee Level",
      "Customer Churn vs Fee",
    ],
    stakeholders: ["CFO", "Pricing Manager", "Product Manager"],
    expectedROI: "$3.5M annually from optimized pricing",
    implementationComplexity: "Medium",
    timeToValue: "2-3 months",
    dataRequirements: [
      "Transaction fees",
      "Volume history",
      "Customer segment",
      "Competitive intelligence",
    ],
  },
  {
    id: "aml-compliance",
    name: "AML/CFT Compliance & SAR Reporting",
    description:
      "Automated suspicious activity detection and Suspicious Activity Report (SAR) filing",
    businessProblem:
      "Manual SAR review is slow and error-prone; risk of missing high-risk customers; regulatory fines",
    solution:
      "Automated transaction monitoring with SAR filing workflow and audit trail for regulatory compliance",
    keyMetrics: [
      "SAR Filing Rate",
      "Compliance Accuracy %",
      "Detection Lag Time",
      "False Positive Rate",
    ],
    stakeholders: ["Compliance Officer", "Chief Risk Officer", "Legal"],
    expectedROI: "$2M annually from avoided fines and operational efficiency",
    implementationComplexity: "High",
    timeToValue: "4-5 months",
    dataRequirements: [
      "Transaction patterns",
      "Customer KYC data",
      "Sanctions lists",
      "PEP data",
      "OFAC matches",
    ],
  },
  {
    id: "customer-journey",
    name: "Customer Journey & Cross-sell",
    description:
      "Track customer transaction patterns to identify cross-sell opportunities and engagement signals",
    businessProblem:
      "Cross-sell effectiveness is low; missing opportunities when customers show intent (e.g., frequent wire transfers)",
    solution:
      "Transaction pattern analysis to identify high-intent customers for targeted cross-sell campaigns",
    keyMetrics: [
      "Cross-sell Opportunity Rate",
      "Cross-sell Accept Rate",
      "Revenue Uplift",
      "Customer Journey Stage",
    ],
    stakeholders: ["Marketing VP", "Product Manager", "Sales Manager"],
    expectedROI: "$4.2M annually from improved cross-sell targeting",
    implementationComplexity: "High",
    timeToValue: "3-4 months",
    dataRequirements: [
      "Transaction history",
      "Customer profile",
      "Product ownership",
      "Campaign response",
    ],
  },
];

export const transactionsDataQualityPriorities = [
  {
    issue: "Missing transaction timestamps",
    severity: "Critical",
    impact: "Cannot detect fraud patterns; AML compliance failures",
    resolution:
      "Implement timestamp validation in FIS extract; flag missing timestamps for reconciliation",
  },
  {
    issue: "Duplicate transaction records",
    severity: "High",
    impact: "Inflated transaction volume metrics; double-counting revenue",
    resolution: "Implement deduplication logic with transaction ID + amount + timestamp",
  },
  {
    issue: "Delayed PEGA event streaming",
    severity: "High",
    impact: "Fraud detection lag; real-time monitoring not effective",
    resolution: "Monitor PEGA webhook latency; implement fallback to FIS batch",
  },
  {
    issue: "Counterparty name issues",
    severity: "Medium",
    impact: "OFAC screening false negatives",
    resolution: "Standardize counterparty names before OFAC matching",
  },
];
