/**
 * CREDIT BUREAU SOURCE SYSTEMS
 *
 * Detailed source-to-target mappings for credit bureaus:
 * - Experian
 * - TransUnion
 * - Equifax
 *
 * Used for: Credit underwriting, risk assessment, fraud prevention
 */

import type {
  SourceSystem,
  FieldMapping,
  DataLineage,
} from "./source-to-target-mapping";

// ============================================================================
// EXPERIAN CREDIT BUREAU
// ============================================================================

export const experianCreditSource: SourceSystem = {
  sourceSystemId: "experian-credit-001",
  sourceSystemCode: "EXP-CREDIT",
  sourceSystemName: "Experian Credit Bureau",
  vendor: "Experian",
  productName: "Experian Connect API",
  version: "v4.2",

  systemType: "CREDIT_BUREAU",
  criticality: "CRITICAL",

  integrationType: "API_REST",
  dataFormat: "JSON",
  connectionDetails: {
    protocol: "HTTPS",
    host: "api.experian.com",
    port: 443,
    endpoint: "/consumerservices/credit-profile/v2",
    authMethod: "OAuth2 + Client Certificate",
  },

  refreshFrequency: "On-demand (per credit pull request)",
  avgDailyVolume: "30K credit pulls",
  retentionPeriod: "7 years (FCRA compliance)",
  sla: {
    availability: "99.9% uptime",
    latency: "<3s per credit pull",
    refreshCadence: "Real-time per request",
  },

  domains: [
    "loans-retail",
    "loans-commercial",
    "credit-cards",
    "cards-retail",
    "risk",
  ],
  dataTypes: [
    "Credit Scores (FICO, VantageScore)",
    "Trade Lines (accounts, payment history)",
    "Inquiries (hard pulls)",
    "Public Records (bankruptcies, liens, judgments)",
    "Collections",
    "Credit Utilization",
    "Account Aging",
  ],
  keyEntities: [
    "Credit Report",
    "Credit Score",
    "Trade Line",
    "Inquiry",
    "Public Record",
  ],

  primaryContact: "Risk Manager",
  supportTeam: "Experian Support (1-888-397-3742)",
  documentation: "https://developer.experian.com/credit-profile",
  cost: "$2-5 per credit pull (volume discounts available)",

  sourceSchemas: [
    {
      schemaName: "CREDIT_PROFILE_RESPONSE",
      apiEndpoint: "/consumerservices/credit-profile/v2",
      description:
        "Full consumer credit report with scores, trade lines, inquiries, and public records",
      primaryKey: ["report_id"],
      fields: [
        {
          sourceFieldName: "report_id",
          dataType: "STRING",
          length: 50,
          nullable: false,
          description: "Experian unique credit report identifier",
          sampleValues: ["EXP-CR-20250115-001234", "EXP-CR-20250115-005678"],
          validationRules: ["Pattern: EXP-CR-YYYYMMDD-######"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "consumer_ssn",
          dataType: "STRING",
          length: 9,
          nullable: false,
          description: "Consumer Social Security Number",
          sampleValues: ["ENCRYPTED_VALUE"],
          validationRules: ["Numeric", "Length = 9", "Valid SSN format"],
          piiFlag: true,
          encryptionRequired: true,
        },
        {
          sourceFieldName: "first_name",
          dataType: "STRING",
          length: 50,
          nullable: false,
          description: "Consumer first name",
          sampleValues: ["John", "Jane", "Robert"],
          validationRules: [],
          piiFlag: true,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "last_name",
          dataType: "STRING",
          length: 50,
          nullable: false,
          description: "Consumer last name",
          sampleValues: ["Smith", "Doe", "Johnson"],
          validationRules: [],
          piiFlag: true,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "date_of_birth",
          dataType: "DATE",
          nullable: false,
          description: "Consumer date of birth",
          sampleValues: ["1985-05-15", "1990-08-22", "1978-12-10"],
          validationRules: ["Format: YYYY-MM-DD", "Must be >= 18 years old"],
          piiFlag: true,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "fico_score_8",
          dataType: "INTEGER",
          nullable: true,
          description: "FICO Score 8 (most widely used)",
          sampleValues: ["720", "650", "800"],
          validationRules: ["Range: 300-850"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "fico_score_9",
          dataType: "INTEGER",
          nullable: true,
          description:
            "FICO Score 9 (newer version, less penalty for medical collections)",
          sampleValues: ["725", "655", "805"],
          validationRules: ["Range: 300-850"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "vantage_score_3",
          dataType: "INTEGER",
          nullable: true,
          description: "VantageScore 3.0 (tri-bureau model)",
          sampleValues: ["715", "645", "795"],
          validationRules: ["Range: 300-850"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "score_date",
          dataType: "DATE",
          nullable: false,
          description: "Date credit score was generated",
          sampleValues: ["2025-01-15", "2025-01-14"],
          validationRules: ["Format: YYYY-MM-DD", "Cannot be future date"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "total_trade_lines",
          dataType: "INTEGER",
          nullable: false,
          description: "Total number of credit accounts (open + closed)",
          sampleValues: ["12", "25", "8"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "open_trade_lines",
          dataType: "INTEGER",
          nullable: false,
          description: "Number of currently open credit accounts",
          sampleValues: ["8", "15", "5"],
          validationRules: [">= 0", "<= total_trade_lines"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "total_revolving_balance",
          dataType: "DECIMAL",
          precision: 18,
          scale: 2,
          nullable: false,
          description:
            "Total outstanding balance on all revolving accounts (credit cards)",
          sampleValues: ["5000.00", "12500.75", "850.25"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "total_revolving_credit_limit",
          dataType: "DECIMAL",
          precision: 18,
          scale: 2,
          nullable: false,
          description: "Total credit limit across all revolving accounts",
          sampleValues: ["25000.00", "50000.00", "10000.00"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "credit_utilization_rate",
          dataType: "DECIMAL",
          precision: 5,
          scale: 2,
          nullable: true,
          description: "Credit utilization percentage (balance / limit * 100)",
          sampleValues: ["20.00", "45.50", "8.50"],
          validationRules: ["Range: 0-100"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "oldest_trade_line_date",
          dataType: "DATE",
          nullable: true,
          description: "Date of oldest credit account opened",
          sampleValues: ["2005-03-15", "2010-07-22", "1998-11-05"],
          validationRules: ["Format: YYYY-MM-DD", "Cannot be future date"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "most_recent_inquiry_date",
          dataType: "DATE",
          nullable: true,
          description: "Date of most recent hard inquiry (credit pull)",
          sampleValues: ["2025-01-10", "2024-12-15", "2024-11-20"],
          validationRules: ["Format: YYYY-MM-DD", "Cannot be future date"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "total_inquiries_last_12_months",
          dataType: "INTEGER",
          nullable: false,
          description: "Number of hard inquiries in past 12 months",
          sampleValues: ["1", "3", "0"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "derogatory_marks",
          dataType: "INTEGER",
          nullable: false,
          description:
            "Number of derogatory marks (late payments, collections, bankruptcies)",
          sampleValues: ["0", "2", "1"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "public_records_count",
          dataType: "INTEGER",
          nullable: false,
          description:
            "Number of public records (bankruptcies, liens, judgments)",
          sampleValues: ["0", "1", "0"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "collections_count",
          dataType: "INTEGER",
          nullable: false,
          description: "Number of accounts in collections",
          sampleValues: ["0", "2", "1"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "total_collection_amount",
          dataType: "DECIMAL",
          precision: 18,
          scale: 2,
          nullable: false,
          description: "Total amount in collections",
          sampleValues: ["0.00", "1500.00", "850.50"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "bankruptcy_flag",
          dataType: "BOOLEAN",
          nullable: false,
          description: "Indicates if consumer has bankruptcy on record",
          sampleValues: ["false", "true"],
          validationRules: [],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "bankruptcy_date",
          dataType: "DATE",
          nullable: true,
          description: "Most recent bankruptcy filing date",
          sampleValues: ["2018-06-15", "2020-09-22"],
          validationRules: ["Format: YYYY-MM-DD"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "bankruptcy_type",
          dataType: "STRING",
          length: 20,
          nullable: true,
          description: "Type of bankruptcy",
          sampleValues: ["CHAPTER_7", "CHAPTER_13", "CHAPTER_11"],
          validationRules: ["ENUM: CHAPTER_7, CHAPTER_13, CHAPTER_11"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "report_generated_timestamp",
          dataType: "TIMESTAMP",
          nullable: false,
          description: "Timestamp when Experian generated the report",
          sampleValues: ["2025-01-15T10:30:15Z", "2025-01-15T11:45:22Z"],
          validationRules: ["ISO 8601 format", "UTC timezone"],
          piiFlag: false,
          encryptionRequired: false,
        },
      ],
    },
    {
      schemaName: "TRADE_LINE_DETAIL",
      apiEndpoint: "/consumerservices/credit-profile/v2/tradelines",
      description:
        "Detailed trade line (account) information including payment history",
      primaryKey: ["trade_line_id"],
      fields: [
        {
          sourceFieldName: "trade_line_id",
          dataType: "STRING",
          length: 50,
          nullable: false,
          description: "Unique trade line identifier",
          sampleValues: ["TL-001234", "TL-005678"],
          validationRules: [],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "report_id",
          dataType: "STRING",
          length: 50,
          nullable: false,
          description: "Foreign key to credit report",
          sampleValues: ["EXP-CR-20250115-001234"],
          validationRules: [],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "creditor_name",
          dataType: "STRING",
          length: 100,
          nullable: false,
          description: "Name of creditor (bank, lender)",
          sampleValues: ["CHASE BANK", "CAPITAL ONE", "WELLS FARGO"],
          validationRules: [],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "account_type",
          dataType: "STRING",
          length: 50,
          nullable: false,
          description: "Type of credit account",
          sampleValues: ["REVOLVING", "INSTALLMENT", "MORTGAGE", "AUTO_LOAN"],
          validationRules: [
            "ENUM: REVOLVING, INSTALLMENT, MORTGAGE, AUTO_LOAN, STUDENT_LOAN, OTHER",
          ],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "account_status",
          dataType: "STRING",
          length: 20,
          nullable: false,
          description: "Current status of account",
          sampleValues: ["OPEN", "CLOSED", "CHARGED_OFF", "COLLECTIONS"],
          validationRules: [
            "ENUM: OPEN, CLOSED, CHARGED_OFF, COLLECTIONS, PAID",
          ],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "opened_date",
          dataType: "DATE",
          nullable: false,
          description: "Date account was opened",
          sampleValues: ["2018-05-15", "2020-08-22"],
          validationRules: ["Format: YYYY-MM-DD"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "closed_date",
          dataType: "DATE",
          nullable: true,
          description: "Date account was closed (if applicable)",
          sampleValues: ["2023-12-31", "2024-06-15"],
          validationRules: ["Format: YYYY-MM-DD"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "credit_limit",
          dataType: "DECIMAL",
          precision: 18,
          scale: 2,
          nullable: true,
          description: "Credit limit (for revolving accounts)",
          sampleValues: ["10000.00", "25000.00", "5000.00"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "current_balance",
          dataType: "DECIMAL",
          precision: 18,
          scale: 2,
          nullable: false,
          description: "Current outstanding balance",
          sampleValues: ["2500.00", "15000.50", "0.00"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "monthly_payment",
          dataType: "DECIMAL",
          precision: 18,
          scale: 2,
          nullable: true,
          description: "Minimum or scheduled monthly payment",
          sampleValues: ["50.00", "350.00", "1200.00"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "payment_status",
          dataType: "STRING",
          length: 20,
          nullable: false,
          description: "Current payment status",
          sampleValues: [
            "CURRENT",
            "LATE_30_DAYS",
            "LATE_60_DAYS",
            "LATE_90_DAYS",
            "CHARGED_OFF",
          ],
          validationRules: [
            "ENUM: CURRENT, LATE_30_DAYS, LATE_60_DAYS, LATE_90_DAYS, LATE_120_DAYS, CHARGED_OFF",
          ],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "times_30_days_late",
          dataType: "INTEGER",
          nullable: false,
          description: "Number of times payment was 30+ days late (lifetime)",
          sampleValues: ["0", "1", "3"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "times_60_days_late",
          dataType: "INTEGER",
          nullable: false,
          description: "Number of times payment was 60+ days late (lifetime)",
          sampleValues: ["0", "1", "2"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "times_90_days_late",
          dataType: "INTEGER",
          nullable: false,
          description: "Number of times payment was 90+ days late (lifetime)",
          sampleValues: ["0", "0", "1"],
          validationRules: [">= 0"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "last_payment_date",
          dataType: "DATE",
          nullable: true,
          description: "Date of most recent payment received",
          sampleValues: ["2025-01-05", "2024-12-28"],
          validationRules: ["Format: YYYY-MM-DD"],
          piiFlag: false,
          encryptionRequired: false,
        },
      ],
    },
  ],
};

// ============================================================================
// TRANSUNION CREDIT BUREAU
// ============================================================================

export const transUnionCreditSource: SourceSystem = {
  sourceSystemId: "transunion-credit-001",
  sourceSystemCode: "TU-CREDIT",
  sourceSystemName: "TransUnion Credit Bureau",
  vendor: "TransUnion",
  productName: "TrueVision API",
  version: "v3.5",

  systemType: "CREDIT_BUREAU",
  criticality: "CRITICAL",

  integrationType: "API_REST",
  dataFormat: "XML",
  connectionDetails: {
    protocol: "HTTPS",
    host: "api.transunion.com",
    port: 443,
    endpoint: "/truevision/v3.5/creditreport",
    authMethod: "OAuth2 + API Key",
  },

  refreshFrequency: "On-demand (per credit pull request)",
  avgDailyVolume: "25K credit pulls",
  retentionPeriod: "7 years (FCRA compliance)",
  sla: {
    availability: "99.9% uptime",
    latency: "<3s per credit pull",
    refreshCadence: "Real-time per request",
  },

  domains: [
    "loans-retail",
    "loans-commercial",
    "credit-cards",
    "cards-retail",
    "risk",
  ],
  dataTypes: [
    "Credit Reports",
    "Risk Scores (VantageScore, TransUnion CreditVision)",
    "Fraud Detection",
    "Identity Verification",
    "Trade Line Data",
    "Attribute Data",
  ],
  keyEntities: ["Credit Report", "Credit Score", "Trade Line", "Fraud Score"],

  primaryContact: "Risk Manager",
  supportTeam: "TransUnion Support (1-800-888-4213)",
  documentation: "https://developer.transunion.com/truevision",
  cost: "$2-5 per credit pull",

  sourceSchemas: [
    {
      schemaName: "CREDIT_REPORT_RESPONSE",
      apiEndpoint: "/truevision/v3.5/creditreport",
      description: "TransUnion credit report with TrueVision risk analytics",
      primaryKey: ["file_number"],
      fields: [
        {
          sourceFieldName: "file_number",
          dataType: "STRING",
          length: 50,
          nullable: false,
          description: "TransUnion file number (unique report ID)",
          sampleValues: ["TU-CR-20250115-001234", "TU-CR-20250115-005678"],
          validationRules: [],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "vantage_score_3",
          dataType: "INTEGER",
          nullable: true,
          description: "VantageScore 3.0 (300-850)",
          sampleValues: ["710", "640", "790"],
          validationRules: ["Range: 300-850"],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "creditvision_score",
          dataType: "INTEGER",
          nullable: true,
          description:
            "TransUnion CreditVision risk score (trended data model)",
          sampleValues: ["725", "655", "805"],
          validationRules: ["Range: 300-850"],
          piiFlag: false,
          encryptionRequired: false,
        },
        // Similar fields to Experian...
      ],
    },
  ],
};

// ============================================================================
// EQUIFAX CREDIT BUREAU
// ============================================================================

export const equifaxCreditSource: SourceSystem = {
  sourceSystemId: "equifax-credit-001",
  sourceSystemCode: "EFX-CREDIT",
  sourceSystemName: "Equifax Credit Bureau",
  vendor: "Equifax",
  productName: "Equifax Credit Profile API",
  version: "v2.8",

  systemType: "CREDIT_BUREAU",
  criticality: "CRITICAL",

  integrationType: "API_REST",
  dataFormat: "JSON",
  connectionDetails: {
    protocol: "HTTPS",
    host: "api.equifax.com",
    port: 443,
    endpoint: "/business/credit-profile/v2",
    authMethod: "OAuth2",
  },

  refreshFrequency: "On-demand (per credit pull request)",
  avgDailyVolume: "20K credit pulls",
  retentionPeriod: "7 years (FCRA compliance)",
  sla: {
    availability: "99.9% uptime",
    latency: "<3s per credit pull",
    refreshCadence: "Real-time per request",
  },

  domains: [
    "loans-retail",
    "loans-commercial",
    "credit-cards",
    "cards-retail",
    "risk",
  ],
  dataTypes: [
    "Consumer Credit Reports",
    "Commercial Credit Data",
    "ID Verification",
    "Fraud Scores",
    "Bankruptcy Data",
  ],
  keyEntities: [
    "Credit Report",
    "Credit Score",
    "Trade Line",
    "Commercial Credit",
  ],

  primaryContact: "Risk Manager",
  supportTeam: "Equifax Support (1-866-349-5191)",
  documentation: "https://developer.equifax.com/credit-profile",
  cost: "$2-5 per credit pull",

  sourceSchemas: [
    {
      schemaName: "CREDIT_PROFILE_RESPONSE",
      apiEndpoint: "/business/credit-profile/v2",
      description: "Equifax consumer and commercial credit profile",
      primaryKey: ["report_id"],
      fields: [
        {
          sourceFieldName: "report_id",
          dataType: "STRING",
          length: 50,
          nullable: false,
          description: "Equifax report identifier",
          sampleValues: ["EFX-CR-20250115-001234"],
          validationRules: [],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: "beacon_score",
          dataType: "INTEGER",
          nullable: true,
          description: "Equifax Beacon Score (FICO equivalent)",
          sampleValues: ["715", "645", "800"],
          validationRules: ["Range: 300-850"],
          piiFlag: false,
          encryptionRequired: false,
        },
        // Similar fields...
      ],
    },
  ],
};

// ============================================================================
// FIELD MAPPINGS - EXPERIAN
// ============================================================================

export const experianFieldMappings: FieldMapping[] = [
  {
    sourceSystem: "EXP-CREDIT",
    sourceSchema: "CREDIT_PROFILE_RESPONSE",
    sourceField: "fico_score_8",
    sourceDataType: "INTEGER",

    bronzeTable: "bronze.experian_credit_reports",
    bronzeField: "fico_score_8",
    bronzeDataType: "INTEGER",

    silverTable: "silver.credit_scores_enriched",
    silverField: "fico_score",
    silverDataType: "INTEGER",

    goldTable: "gold.fact_credit_scores",
    goldField: "credit_score",
    goldDataType: "INTEGER",

    transformationType: "DIRECT_MAPPING",
    transformationLogic:
      "Bronze: Direct copy. Silver: Validate range 300-850, use as primary credit score. Gold: Measure for credit analytics",
    transformationSQL: `
      -- Bronze
      fico_score_8
      
      -- Silver (validation)
      CASE 
        WHEN fico_score_8 < 300 THEN NULL
        WHEN fico_score_8 > 850 THEN NULL
        ELSE fico_score_8
      END AS fico_score
      
      -- Gold
      fico_score AS credit_score
    `,

    businessDefinition:
      "FICO Score 8 - Industry standard credit score (300-850, higher is better)",
    dataQualityRules: [
      "Range: 300-850",
      "NULL if score unavailable",
      "Must be integer",
      "Score bands: Poor (<580), Fair (580-669), Good (670-739), Very Good (740-799), Exceptional (800+)",
    ],

    sampleTransformation: [
      { sourceValue: "720", targetValue: "720 (Very Good)" },
      { sourceValue: "650", targetValue: "650 (Fair)" },
      { sourceValue: "800", targetValue: "800 (Exceptional)" },
    ],
  },

  {
    sourceSystem: "EXP-CREDIT",
    sourceSchema: "CREDIT_PROFILE_RESPONSE",
    sourceField: "credit_utilization_rate",
    sourceDataType: "DECIMAL",

    bronzeTable: "bronze.experian_credit_reports",
    bronzeField: "credit_utilization_rate",
    bronzeDataType: "DECIMAL(5,2)",

    silverTable: "silver.credit_scores_enriched",
    silverField: "credit_utilization_pct",
    silverDataType: "DECIMAL(5,2)",

    goldTable: "gold.fact_credit_scores",
    goldField: "utilization_rate",
    goldDataType: "DECIMAL(5,2)",

    transformationType: "DERIVED",
    transformationLogic:
      "Bronze: Direct or calculate from balance/limit. Silver: Validate 0-100, flag high utilization (>30%). Gold: Measure + risk band",
    transformationSQL: `
      -- Bronze (calculate if not provided)
      COALESCE(
        credit_utilization_rate,
        CASE 
          WHEN total_revolving_credit_limit > 0 
          THEN (total_revolving_balance / total_revolving_credit_limit * 100)
          ELSE NULL
        END
      ) AS credit_utilization_rate
      
      -- Silver
      CASE 
        WHEN credit_utilization_rate < 0 THEN 0
        WHEN credit_utilization_rate > 100 THEN 100
        ELSE credit_utilization_rate
      END AS credit_utilization_pct,
      CASE 
        WHEN credit_utilization_rate > 30 THEN 'HIGH'
        WHEN credit_utilization_rate > 10 THEN 'MODERATE'
        ELSE 'LOW'
      END AS utilization_risk_band
      
      -- Gold
      AVG(credit_utilization_pct) AS avg_utilization_rate
    `,

    businessDefinition:
      "Credit utilization rate - Percentage of available credit being used (balance / limit * 100). Lower is better for credit score.",
    dataQualityRules: [
      "Range: 0-100",
      "NULL if no revolving accounts",
      "Ideal: <10%, Good: <30%, High: >30%",
      "Major factor in credit score calculation (~30% of FICO score)",
    ],

    sampleTransformation: [
      { sourceValue: "20.00", targetValue: "20.00 (MODERATE)" },
      { sourceValue: "45.50", targetValue: "45.50 (HIGH)" },
      { sourceValue: "8.50", targetValue: "8.50 (LOW)" },
    ],
  },
];

// ============================================================================
// DATA LINEAGE - EXPERIAN
// ============================================================================

export const experianLineage: DataLineage[] = [
  {
    domainId: "loans-retail",
    entity: "Credit Score",

    sourceSystem: "EXP-CREDIT",
    sourceSchema: "CREDIT_PROFILE_RESPONSE",
    sourceField: "fico_score_8",
    bronzeTable: "bronze.experian_credit_reports",
    bronzeField: "fico_score_8",
    bronzeLoadType: "API",

    silverTable: "silver.credit_scores_enriched",
    silverField: "fico_score",
    silverTransformation:
      "Range validation (300-850), set as primary credit score, join to customer master",

    goldTable: "gold.fact_credit_scores",
    goldField: "credit_score",
    goldAggregation:
      "Measure for credit score analytics, join to customer and loan dimensions",

    dataLineagePath:
      "Experian Connect API → bronze.experian_credit_reports → silver.credit_scores_enriched → gold.fact_credit_scores",
    lastUpdated: "2025-01-15",
    certifiedFlag: true,
  },
  {
    domainId: "loans-retail",
    entity: "Credit Utilization",

    sourceSystem: "EXP-CREDIT",
    sourceSchema: "CREDIT_PROFILE_RESPONSE",
    sourceField: "credit_utilization_rate",
    bronzeTable: "bronze.experian_credit_reports",
    bronzeField: "credit_utilization_rate",
    bronzeLoadType: "API",

    silverTable: "silver.credit_scores_enriched",
    silverField: "credit_utilization_pct",
    silverTransformation:
      "Derive from balance/limit if not provided, validate 0-100, calculate risk band",

    goldTable: "gold.fact_credit_scores",
    goldField: "utilization_rate",
    goldAggregation:
      "Average utilization rate by customer segment, vintage, score band",

    dataLineagePath:
      "Experian Connect API → bronze.experian_credit_reports → silver.credit_scores_enriched → gold.fact_credit_scores",
    lastUpdated: "2025-01-15",
    certifiedFlag: true,
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

export const creditBureauSources = [
  experianCreditSource,
  transUnionCreditSource,
  equifaxCreditSource,
];

export const creditBureauMappings = [
  ...experianFieldMappings,
  // TransUnion and Equifax mappings would be added here
];

export const creditBureauLineage = [
  ...experianLineage,
  // TransUnion and Equifax lineage would be added here
];
