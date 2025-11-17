// Customer Domain Metadata & Specifications
// Complete 360° customer view covering demographics, relationships, KYC/CDD, and lifecycle

import { customerBronzeTables, customerBronzeLayerComplete } from '../bronze-layer';
import { customerSilverTables, customerSilverLayerComplete } from '../silver-layer';
import { customerGoldDimensions, customerGoldFacts, customerGoldLayerComplete } from '../gold-layer';
import { customerMetricsCatalog, customerMetricsComplete } from '../metrics-comprehensive';
import { customerGoldMetrics as customerGoldMetricsNew } from '../gold-metrics';

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

export const customerDomainMetadata: DomainMetadata = {
  id: "customer",
  name: "Customer-Core",
  displayName: "Customer Core Domain",
  description:
    "Unified customer 360° domain covering retail customer lifecycle, demographics, segments, KYC/CDD compliance, relationship management, and customer preferences across all channels and products",
  priority: "P0",
  complexity: "Very High",
  businessValue: "Critical",
  keyEntities: [
    "Customer",
    "Relationship",
    "Demographics",
    "KYC/CDD",
    "Preferences",
    "Segments",
    "Profile",
    "Consent",
  ],
  sourceSystem: "FIS",
  sourceTable: "CUST_MASTER",
  grain: "One row per customer",
  refreshSchedule: "Daily at 6:00 AM UTC",
  refreshFrequency: "Daily",
  owner: {
    name: "Data Analytics Lead",
    email: "analytics@bank.com",
    team: "Enterprise Data",
  },
  sla: {
    uptime: 99.9,
    maxLatencyHours: 24,
    rpo: "24 hours",
    rto: "1 hour",
  },
  governance: {
    dataClassification: "Confidential",
    piiFields: [
      "CUSTOMER_NAME",
      "EMAIL",
      "PHONE",
      "SSN",
      "DOB",
      "ADDRESS",
    ],
    regulatoryRequirements: [
      "GDPR",
      "CCPA",
      "KYC/AML",
      "Data Privacy",
    ],
    accessControl: "Role-based access control (RBAC)",
  },
  metrics: {
    totalMetrics: 42,
    goldTables: 5,
    silverTables: 8,
    bronzeTables: 3,
    dataQualityScore: 98,
    completionPercentage: 100,
  },
};

export const customerGoldMetrics = customerGoldMetricsNew;

export const customerSubDomains = [
  {
    name: "Customer 360",
    description: "Unified view of customer across all channels",
    importance: "Critical",
  },
  {
    name: "Customer Demographics",
    description: "Age, location, income, family composition",
    importance: "High",
  },
  {
    name: "Customer Lifecycle",
    description: "Onboarding, activation, growth, retention, attrition",
    importance: "High",
  },
  {
    name: "Customer Segmentation",
    description: "RFM analysis, behavioral segmentation, targeting",
    importance: "High",
  },
  {
    name: "KYC/CDD Compliance",
    description: "Know Your Customer & Customer Due Diligence",
    importance: "Critical",
  },
  {
    name: "Customer Preferences",
    description: "Communication preferences, product interests, channels",
    importance: "Medium",
  },
  {
    name: "Customer Relationships",
    description: "Multi-generational family relationships, household",
    importance: "Medium",
  },
  {
    name: "Customer Consent",
    description: "GDPR/Privacy consent tracking, marketing opt-ins",
    importance: "High",
  },
];

// Re-export layer definitions
export {
  customerBronzeTables,
  customerBronzeLayerComplete,
  customerSilverTables,
  customerSilverLayerComplete,
  customerGoldDimensions,
  customerGoldFacts,
  customerGoldLayerComplete,
  customerMetricsCatalog,
  customerMetricsComplete,
};
