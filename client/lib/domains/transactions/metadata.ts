// Transactions Domain Metadata & Specifications
// Complete transaction analytics covering all payment types, channels, fraud, and customer journeys

import { transactionsBronzeTables, transactionsBronzeLayerComplete } from './bronze-layer';
import { transactionsSilverTables, transactionsSilverLayerComplete } from './silver-layer';
import { transactionsGoldLayerComplete } from './gold-layer';
import { transactionsGoldTableCatalog } from './gold/ddl-scripts';
import { transactionsGoldMetrics as transactionsGoldMetricsFromFile } from './gold-metrics';

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

export const transactionsDomainMetadata: DomainMetadata = {
  id: "transactions",
  name: "Transactions & Payments",
  displayName: "Transactions & Payments Domain",
  description:
    "Comprehensive transaction and payment analytics covering all payment types (ACH, Wire, RTP, Debit, ATM, POS), channels (Mobile, Online, Branch, ATM), fraud detection, customer journeys, revenue analytics, and regulatory compliance across retail and commercial customers",
  priority: "P0",
  complexity: "Very High",
  businessValue: "Critical",
  keyEntities: [
    "Transaction",
    "Channel",
    "Payment Type",
    "Customer",
    "Account",
    "Amount",
    "Status",
    "Counterparty",
  ],
  sourceSystem: "FIS (batch) + PEGA (real-time events)",
  sourceTable: "TXN_HISTORY (daily batch) + event stream",
  grain: "One row per transaction",
  refreshSchedule: "Real-time (PEGA) + Daily batch reconcile (FIS 6:00 AM UTC)",
  refreshFrequency: "Real-time",
  owner: {
    name: "Head of Payments & Operations",
    email: "payments@bank.com",
    team: "Payment Operations",
  },
  sla: {
    uptime: 99.99,
    maxLatencyHours: 1,
    rpo: "Real-time",
    rto: "15 minutes",
  },
  governance: {
    dataClassification: "Restricted",
    piiFields: [
      "CUSTOMER_ID",
      "COUNTERPARTY_NAME",
      "ACCOUNT_NUMBER",
      "COUNTERPARTY_ACCOUNT",
      "AMOUNT",
    ],
    regulatoryRequirements: [
      "AML/CFT Reporting",
      "Transaction Monitoring",
      "SAR Filing",
      "OFAC Compliance",
      "Transaction Reporting",
    ],
    accessControl: "Restricted - compliance and fraud team only",
  },
  metrics: {
    totalMetrics: 52,
    goldTables: 6,
    silverTables: 9,
    bronzeTables: 4,
    dataQualityScore: 97,
    completionPercentage: 95,
  },
};

export const transactionsGoldMetrics = transactionsGoldMetricsFromFile;

export const transactionsSubDomains = [
  {
    name: "Transaction Processing & Clearing",
    description: "ACH, Wire, RTP, same-day clearing, settlement",
    importance: "Critical",
  },
  {
    name: "Channel Analytics",
    description: "Mobile, Online, Branch, ATM - channel-specific metrics",
    importance: "High",
  },
  {
    name: "Fraud Detection & Prevention",
    description: "Real-time fraud alerts, suspicious pattern detection",
    importance: "Critical",
  },
  {
    name: "Customer Journey & Behavior",
    description: "Transaction sequence, cross-sell opportunities, abandonment",
    importance: "High",
  },
  {
    name: "Revenue & Fee Analytics",
    description: "Transaction fee income, fee waiver analysis, pricing elasticity",
    importance: "High",
  },
  {
    name: "Regulatory Compliance",
    description: "AML/CFT, SAR filing, OFAC screening, transaction monitoring",
    importance: "Critical",
  },
  {
    name: "Bill Pay & Transfers",
    description: "P2P payments, bill pay, transfer analytics",
    importance: "Medium",
  },
  {
    name: "International Payments",
    description: "Wire, SWIFT, FX, international transaction monitoring",
    importance: "Medium",
  },
];

// Gold Table Dimension and Fact exports for UI display
// Note: For UI purposes, aggregates are exported as "facts" since they're fact-like tables
export const transactionsGoldDimensions = transactionsGoldTableCatalog.dimensions;
export const transactionsGoldFacts = [...(transactionsGoldTableCatalog.facts || []), ...(transactionsGoldTableCatalog.aggregates || [])];
export const transactionsGoldAggregates = transactionsGoldTableCatalog.aggregates;

// Re-export layer definitions
export {
  transactionsBronzeTables,
  transactionsBronzeLayerComplete,
  transactionsSilverTables,
  transactionsSilverLayerComplete,
  transactionsGoldLayerComplete,
  transactionsGoldTableCatalog,
};
