// FIS Data Ingestion Framework
// Direct ingestion from Fiserv core banking system to data warehouse

import { FISSourceTable, getAllFISTables, getFISTablesByDomain } from "./fis-source-schema";

export interface FISIngestionJob {
  jobId: string;
  jobName: string;
  sourceTable: string;
  targetSchema: "bronze" | "silver" | "gold";
  domainId: string;
  schedule: FISSchedule;
  incremental: boolean;
  loadStrategy: "FullLoad" | "CDC" | "TimestampBased";
  description: string;
}

export interface FISSchedule {
  frequency: "Real-time" | "Hourly" | "Daily" | "Weekly";
  time?: string;
}

export interface FISDataMapping {
  sourceTable: string;
  targetTable: string;
  domainId: string;
  columns: ColumnMapping[];
  businessRules: string[];
  dataQualityChecks: string[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  dataType: string;
  transformation?: string;
  businessRule?: string;
}

// ============================================================================
// CUSTOMER DOMAIN - INGESTION JOBS
// ============================================================================

export const customerIngestionJobs: FISIngestionJob[] = [
  {
    jobId: "FIS_CUST_001",
    jobName: "Ingest Customer Master",
    sourceTable: "CUSTOMER",
    targetSchema: "bronze",
    domainId: "customer",
    schedule: { frequency: "Daily", time: "02:00 UTC" },
    incremental: true,
    loadStrategy: "CDC",
    description: "Load customer master data from FIS CUSTOMER table daily",
  },
  {
    jobId: "FIS_CUST_002",
    jobName: "Ingest Customer Contact",
    sourceTable: "CUSTOMER_CONTACT",
    targetSchema: "bronze",
    domainId: "customer",
    schedule: { frequency: "Daily", time: "02:30 UTC" },
    incremental: true,
    loadStrategy: "CDC",
    description: "Load customer contact information daily",
  },
  {
    jobId: "FIS_CUST_003",
    jobName: "Ingest Customer Relationships",
    sourceTable: "CUSTOMER_RELATIONSHIP",
    targetSchema: "bronze",
    domainId: "customer",
    schedule: { frequency: "Daily", time: "03:00 UTC" },
    incremental: true,
    loadStrategy: "CDC",
    description: "Load customer relationship and banker assignments daily",
  },
];

// ============================================================================
// DEPOSITS DOMAIN - INGESTION JOBS
// ============================================================================

export const depositsIngestionJobs: FISIngestionJob[] = [
  {
    jobId: "FIS_DEP_001",
    jobName: "Ingest Account Master",
    sourceTable: "ACCOUNT",
    targetSchema: "bronze",
    domainId: "deposits",
    schedule: { frequency: "Daily", time: "01:00 UTC" },
    incremental: true,
    loadStrategy: "CDC",
    description: "Load account master records from FIS ACCOUNT table",
  },
  {
    jobId: "FIS_DEP_002",
    jobName: "Ingest Account Balances (Real-time)",
    sourceTable: "ACCOUNT_BALANCE",
    targetSchema: "bronze",
    domainId: "deposits",
    schedule: { frequency: "Real-time" },
    incremental: true,
    loadStrategy: "TimestampBased",
    description: "Stream account balance updates in real-time",
  },
  {
    jobId: "FIS_DEP_003",
    jobName: "Ingest Account Transactions",
    sourceTable: "ACCOUNT_TRANSACTION",
    targetSchema: "bronze",
    domainId: "deposits",
    schedule: { frequency: "Real-time" },
    incremental: true,
    loadStrategy: "TimestampBased",
    description: "Stream account transactions in real-time as they post",
  },
  {
    jobId: "FIS_DEP_004",
    jobName: "Ingest Deposit Products",
    sourceTable: "DEPOSIT_PRODUCT",
    targetSchema: "bronze",
    domainId: "deposits",
    schedule: { frequency: "Weekly", time: "04:00 UTC" },
    incremental: false,
    loadStrategy: "FullLoad",
    description: "Load deposit product master data weekly",
  },
];

// ============================================================================
// TRANSACTIONS DOMAIN - INGESTION JOBS
// ============================================================================

export const transactionsIngestionJobs: FISIngestionJob[] = [
  {
    jobId: "FIS_TXN_001",
    jobName: "Ingest Payments (Real-time)",
    sourceTable: "PAYMENT",
    targetSchema: "bronze",
    domainId: "transactions",
    schedule: { frequency: "Real-time" },
    incremental: true,
    loadStrategy: "TimestampBased",
    description: "Stream payment transactions in real-time",
  },
  {
    jobId: "FIS_TXN_002",
    jobName: "Ingest ACH Items",
    sourceTable: "ACH_ITEM",
    targetSchema: "bronze",
    domainId: "transactions",
    schedule: { frequency: "Hourly" },
    incremental: true,
    loadStrategy: "TimestampBased",
    description: "Load ACH items hourly",
  },
  {
    jobId: "FIS_TXN_003",
    jobName: "Ingest Wire Transfers (Real-time)",
    sourceTable: "WIRE_TRANSFER",
    targetSchema: "bronze",
    domainId: "transactions",
    schedule: { frequency: "Real-time" },
    incremental: true,
    loadStrategy: "TimestampBased",
    description: "Stream wire transfers in real-time",
  },
  {
    jobId: "FIS_TXN_004",
    jobName: "Ingest Check Items",
    sourceTable: "CHECK_ITEM",
    targetSchema: "bronze",
    domainId: "transactions",
    schedule: { frequency: "Daily", time: "01:00 UTC" },
    incremental: true,
    loadStrategy: "TimestampBased",
    description: "Load check clearing and status updates daily",
  },
];

// ============================================================================
// DATA QUALITY RULES
// ============================================================================

export const dataQualityRules = {
  customer: {
    CUSTOMER: [
      "CUSTOMER_ID must be non-null",
      "TAX_ID must be valid SSN/EIN format",
      "CUSTOMER_TYPE must be in (INDIVIDUAL, BUSINESS, GOVERNMENT)",
      "CREATED_DATE must be before LAST_MODIFIED_DATE",
      "Row count daily change should not exceed 10%",
    ],
    CUSTOMER_CONTACT: [
      "CUSTOMER_ID must exist in CUSTOMER table",
      "At least one contact method (phone, email, address) must be present",
      "Email if present must be valid format",
      "POSTAL_CODE must match CITY/STATE_PROVINCE_CODE combination",
    ],
    CUSTOMER_RELATIONSHIP: [
      "CUSTOMER_ID must exist in CUSTOMER table",
      "RELATIONSHIP_START_DATE must be before RELATIONSHIP_STATUS change",
      "LIFETIME_VALUE_USD must be non-negative if present",
    ],
  },
  deposits: {
    ACCOUNT: [
      "ACCOUNT_ID must be non-null",
      "CUSTOMER_ID must exist in CUSTOMER table",
      "OPENED_DATE must be valid",
      "ACCOUNT_STATUS must be in (ACTIVE, INACTIVE, CLOSED, DORMANT, SUSPENDED, RESTRICTED)",
      "INTEREST_RATE_PERCENT must be between -0.01 and 15.00 if present",
    ],
    ACCOUNT_BALANCE: [
      "ACCOUNT_ID must exist in ACCOUNT table",
      "CURRENT_BALANCE_AMOUNT must be numeric",
      "AVAILABLE_BALANCE_AMOUNT <= CURRENT_BALANCE_AMOUNT",
      "BALANCE_DATE must not be in future",
      "Daily balance changes should be reasonable (within 500K variance for flagging)",
    ],
    ACCOUNT_TRANSACTION: [
      "ACCOUNT_ID must exist in ACCOUNT table",
      "TRANSACTION_AMOUNT must be positive",
      "POST_DATE must be >= TRANSACTION_DATE",
      "BALANCE_AFTER_TRANSACTION must be numeric",
      "TRANSACTION_STATUS must be in (POSTED, PENDING, REVERSED, FAILED)",
    ],
    DEPOSIT_PRODUCT: [
      "PRODUCT_CODE must be unique and non-null",
      "PRODUCT_TYPE must be in valid list",
      "EFFECTIVE_DATE must be before EXPIRATION_DATE if expiration exists",
      "INTEREST_RATE_PERCENT must be between -0.01 and 15.00 if present",
    ],
  },
  transactions: {
    PAYMENT: [
      "PAYMENT_ID must be non-null",
      "ORIGINATING_ACCOUNT_ID must exist in ACCOUNT table",
      "PAYMENT_METHOD must be in (ACH, WIRE, CHECK, CARD, MOBILE, P2P, BILL_PAY)",
      "PAYMENT_AMOUNT must be positive",
      "PAYMENT_DATE must not be in future",
      "SETTLEMENT_DATE >= PAYMENT_DATE if both present",
    ],
    ACH_ITEM: [
      "ACH_BATCH_ID must reference valid batch",
      "ACCOUNT_ID must exist in ACCOUNT table",
      "TRANSACTION_CODE must be 2-digit numeric",
      "AMOUNT must be positive",
      "RECEIVING_DFI_ID must be valid routing number",
    ],
    WIRE_TRANSFER: [
      "WIRE_ID must be non-null",
      "ORIGINATING_ACCOUNT_ID must exist in ACCOUNT table",
      "WIRE_TYPE must be in (DOMESTIC, INTERNATIONAL, INCOMING)",
      "WIRE_AMOUNT must be positive",
      "BENEFICIARY_BANK_SWIFT must be valid if provided",
    ],
    CHECK_ITEM: [
      "CHECK_ID must be non-null",
      "ACCOUNT_ID must exist in ACCOUNT table",
      "CHECK_AMOUNT must be positive",
      "CLEARED_DATE >= PRESENTED_DATE >= ISSUE_DATE if all present",
      "CHECK_NUMBER should be unique per account",
    ],
  },
};

// ============================================================================
// INGESTION CONFIGURATION FUNCTIONS
// ============================================================================

export function getIngestionJobsByDomain(domainId: string): FISIngestionJob[] {
  const allJobs = [
    ...customerIngestionJobs,
    ...depositsIngestionJobs,
    ...transactionsIngestionJobs,
  ];
  return allJobs.filter((job) => job.domainId === domainId);
}

export function generateDataIngestionRunbook(domainId: string): string {
  const jobs = getIngestionJobsByDomain(domainId);
  const tables = getFISTablesByDomain(domainId);

  let runbook = `# FIS Data Ingestion Runbook - ${domainId.toUpperCase()}\n\n`;
  runbook += `## Source Tables\n`;

  tables.forEach((table) => {
    runbook += `\n### ${table.tableName}\n`;
    runbook += `- **Business Entity**: ${table.businessEntity}\n`;
    runbook += `- **Records**: ${table.recordEstimate}\n`;
    runbook += `- **Refresh**: ${table.refreshFrequency}\n`;
    runbook += `- **Key**: ${table.businessKey}\n`;
    runbook += `- **Description**: ${table.description}\n`;
  });

  runbook += `\n## Ingestion Jobs\n`;
  jobs.forEach((job) => {
    runbook += `\n### ${job.jobName}\n`;
    runbook += `- **Job ID**: ${job.jobId}\n`;
    runbook += `- **Source**: ${job.sourceTable}\n`;
    runbook += `- **Target**: ${job.targetSchema} layer\n`;
    runbook += `- **Schedule**: ${job.schedule.frequency}${job.schedule.time ? ` at ${job.schedule.time}` : ""}\n`;
    runbook += `- **Strategy**: ${job.loadStrategy}\n`;
    runbook += `- **Description**: ${job.description}\n`;
  });

  runbook += `\n## Data Quality Validation\n`;
  runbook += `Implement the following data quality checks in your pipeline:\n`;
  if (dataQualityRules[domainId]) {
    Object.entries(dataQualityRules[domainId]).forEach(([table, rules]) => {
      runbook += `\n### ${table}\n`;
      rules.forEach((rule) => {
        runbook += `- ${rule}\n`;
      });
    });
  }

  return runbook;
}

export function getIngestionSummary() {
  return {
    totalJobs: [
      ...customerIngestionJobs,
      ...depositsIngestionJobs,
      ...transactionsIngestionJobs,
    ].length,
    realTimeJobs: [
      ...customerIngestionJobs,
      ...depositsIngestionJobs,
      ...transactionsIngestionJobs,
    ].filter((j) => j.schedule.frequency === "Real-time").length,
    domains: {
      customer: {
        jobCount: customerIngestionJobs.length,
        jobs: customerIngestionJobs,
      },
      deposits: {
        jobCount: depositsIngestionJobs.length,
        jobs: depositsIngestionJobs,
      },
      transactions: {
        jobCount: transactionsIngestionJobs.length,
        jobs: transactionsIngestionJobs,
      },
    },
  };
}
