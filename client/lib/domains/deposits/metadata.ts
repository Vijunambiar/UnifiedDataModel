// Deposits Domain Metadata & Specifications
// Complete deposits and funding analytics covering accounts, balances, products, and interest

import { depositsBronzeTables, depositsBronzeLayerComplete } from './bronze-layer';
import { depositsSilverTables, depositsSilverLayerComplete } from './silver-layer';
import { depositsGoldLayerComplete } from './gold-layer';
import { depositsGoldTableCatalog } from './gold/ddl-scripts';
import { depositsGoldMetrics as depositsGoldMetricsFromFile } from './gold-metrics';

export interface DomainMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priority: "P0" | "P1" | "P2" | "P3";
  complexity: "Low" | "Medium" | "High" | "Very High";
  businessValue: "Critical" | "High" | "Medium" | "Low";
  keyEntities: string[];
  sourceSystem: string;
  sourceTable: string;
  grain: string;
  refreshSchedule: string;
  refreshFrequency: "Real-time" | "Hourly" | "Daily" | "Weekly";
  owner: {
    name: string;
    email: string;
    team: string;
  };
  sla: {
    uptime: number;
    maxLatencyHours: number;
    rpo: string;
    rto: string;
  };
  governance: {
    dataClassification: "Public" | "Internal" | "Confidential" | "Restricted";
    piiFields: string[];
    regulatoryRequirements: string[];
    accessControl: string;
  };
  metrics: {
    totalMetrics: number;
    goldTables: number;
    silverTables: number;
    bronzeTables: number;
    dataQualityScore: number;
    completionPercentage: number;
  };
}

export const depositsDomainMetadata: DomainMetadata = {
  id: "deposits",
  name: "Deposits & Funding",
  displayName: "Deposits & Funding Domain",
  description:
    "Comprehensive deposits and funding analytics covering retail & commercial deposit accounts, daily balances, interest accrual, product performance, regulatory metrics (LCR, NSFR), and customer deposit behavior across all channels",
  priority: "P0",
  complexity: "High",
  businessValue: "Critical",
  keyEntities: [
    "Account",
    "Balance",
    "Interest",
    "Product",
    "Customer",
    "Channel",
    "Maturity",
  ],
  sourceSystem: "FIS",
  sourceTable: "DEP_ACCOUNTS (daily snapshots)",
  grain: "One row per account per day",
  refreshSchedule: "Daily at 6:30 AM UTC",
  refreshFrequency: "Daily",
  owner: {
    name: "Treasurer / CFO",
    email: "treasury@bank.com",
    team: "Financial Management",
  },
  sla: {
    uptime: 99.95,
    maxLatencyHours: 24,
    rpo: "24 hours",
    rto: "2 hours",
  },
  governance: {
    dataClassification: "Confidential",
    piiFields: ["ACCOUNT_NUMBER", "CUSTOMER_ID", "ACCOUNT_HOLDER_NAME"],
    regulatoryRequirements: [
      "Basel III (LCR, NSFR)",
      "FDIC Reporting",
      "Fed Reserve Reporting",
    ],
    accessControl: "Role-based (Treasury, Risk, Compliance)",
  },
  metrics: {
    totalMetrics: 38,
    goldTables: 4,
    silverTables: 6,
    bronzeTables: 3,
    dataQualityScore: 99,
    completionPercentage: 100,
  },
};

export const depositsGoldMetrics = depositsGoldMetricsFromFile;

export const depositsSubDomains = [
  {
    name: "Deposit Accounts & Balances",
    description: "Daily balance snapshots, account lifecycle, balance trends",
    importance: "Critical",
  },
  {
    name: "Interest Accrual & Pricing",
    description:
      "Interest calculation, rate changes, promotional rates, APY",
    importance: "High",
  },
  {
    name: "Product Performance",
    description: "Savings, Money Market, CDs, NOWs - relative performance",
    importance: "High",
  },
  {
    name: "Regulatory Metrics (LCR/NSFR)",
    description: "Basel III compliance reporting, liquidity coverage ratios",
    importance: "Critical",
  },
  {
    name: "Customer Deposit Behavior",
    description: "Deposit flows, seasonality, customer concentration",
    importance: "High",
  },
  {
    name: "Funding Mix Analysis",
    description: "Core vs brokered deposits, term structure, maturity ladder",
    importance: "Medium",
  },
];

// Re-export layer definitions
export {
  depositsBronzeTables,
  depositsBronzeLayerComplete,
  depositsSilverTables,
  depositsSilverLayerComplete,
  depositsGoldLayerComplete,
};
