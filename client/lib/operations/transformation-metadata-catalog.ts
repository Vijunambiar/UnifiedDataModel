/**
 * TRANSFORMATION METADATA CATALOG
 * 
 * Complete data lineage and transformation metadata
 * Enables data governance, impact analysis, and compliance tracking
 * 
 * Features:
 * - Column-level lineage from source through Silver layer
 * - Transformation documentation and business rules
 * - Data governance and classification
 * - Regulatory compliance and PII tracking
 * - Impact analysis and change management
 * - Audit and audit trail
 */

export interface DataElement {
  elementId: string;
  elementName: string;
  description: string;
  dataType: string;
  nullable: boolean;
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  piiLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  businessOwner: string;
  technicalOwner: string;
  lastModified: Date;
  version: number;
}

export interface TransformationStep {
  transformationId: string;
  transformationName: string;
  description: string;
  transformationType:
    | "EXTRACT"
    | "CLEANSE"
    | "ENRICH"
    | "AGGREGATE"
    | "ENCRYPT"
    | "DEDUPLICATE"
    | "VALIDATE";
  sourceElements: string[];
  targetElements: string[];
  transformationLogic: string;
  businessRules: string[];
  errorHandling: string;
  estimatedDuration: string;
  implementedBy: string;
  implementationDate: Date;
  version: number;
}

export interface ColumnLineage {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  transformationId?: string;
  transformationLogic?: string;
  intermediaryTransformations?: Array<{
    step: number;
    table: string;
    logic: string;
  }>;
  dataType: {
    source: string;
    target: string;
  };
  businessMeaning: string;
  governanceNotes: string;
}

export interface DataAsset {
  assetId: string;
  assetName: string;
  assetType: "TABLE" | "VIEW" | "DATASET";
  schema: string;
  description: string;
  owner: string;
  createdDate: Date;
  lastModifiedDate: Date;
  rowCount?: number;
  sizeBytes?: number;
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  piiPresent: boolean;
  piiElements: string[];
  sourceAssets: string[];
  downstreamAssets: string[];
  encryptionRequired: boolean;
  encryptionMethods: string[];
  sla?: {
    availability: number;
    rto: number;
    rpo: number;
  };
  tags: string[];
  metadata: Record<string, unknown>;
}

// ============================================================================
// CUSTOMER DOMAIN - METADATA CATALOG
// ============================================================================

export const customerDomainMetadata = {
  domain: "Customer",
  description: "Customer master data, identity, and relationship information",
  owner: "Customer Data Governance Team",
  lastUpdated: new Date(),

  sourceDataAssets: [
    {
      assetId: "BRONZE_CUST_MASTER",
      assetName: "bronze.customer_master",
      assetType: "TABLE",
      schema: "bronze",
      description: "Customer master from FIS - raw, unencrypted",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "RESTRICTED",
      piiPresent: true,
      piiElements: ["TAX_ID", "BIRTH_DATE", "EMAIL", "PHONE"],
      sourceAssets: ["FIS_RAW.TB_CI_OZ6_CUST_ARD"],
      downstreamAssets: [
        "SILVER_CUST_ENCRYPTED",
        "SILVER_CUST_MDM_DEDUP",
        "SILVER_CUST_MASTER_GOLDEN",
      ],
      encryptionRequired: true,
      encryptionMethods: ["AES_256", "HASHING"],
      tags: ["customer", "identity", "pii-high"],
      metadata: {
        refreshFrequency: "DAILY",
        volumeRecords: "5-10M",
        schema: "FIS_CORE",
      },
    },
    {
      assetId: "BRONZE_CUST_NAMES_ADDR",
      assetName: "bronze.customer_names_addresses",
      assetType: "TABLE",
      schema: "bronze",
      description: "Customer names and addresses - raw, standardization needed",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "RESTRICTED",
      piiPresent: true,
      piiElements: ["FIRST_NAME", "LAST_NAME", "ADDRESS"],
      sourceAssets: ["FIS_RAW.TB_CI_OZ5_CUST_NAAD_ARD"],
      downstreamAssets: ["SILVER_CUST_NAMES_STD"],
      encryptionRequired: true,
      encryptionMethods: ["TOKENIZATION"],
      tags: ["customer", "address", "pii-high"],
      metadata: {
        refreshFrequency: "DAILY",
        volumeRecords: "12-20M",
      },
    },
    {
      assetId: "BRONZE_CUST_ID",
      assetName: "bronze.customer_identifiers",
      assetType: "TABLE",
      schema: "bronze",
      description: "Customer identification documents - raw, tokenization needed",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "RESTRICTED",
      piiPresent: true,
      piiElements: ["IDENTIFICATION_NUMBER"],
      sourceAssets: ["FIS_RAW.TB_CI_OZ4_CUST_ID_ARD"],
      downstreamAssets: ["SILVER_CUST_ID_TOKENIZED"],
      encryptionRequired: true,
      encryptionMethods: ["TOKENIZATION"],
      tags: ["customer", "kyc", "pii-high"],
      metadata: {
        refreshFrequency: "DAILY",
        volumeRecords: "10-20M",
      },
    },
    {
      assetId: "BRONZE_CUST_EMAIL",
      assetName: "bronze.customer_email",
      assetType: "TABLE",
      schema: "bronze",
      description: "Customer email contacts - validation required",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "RESTRICTED",
      piiPresent: true,
      piiElements: ["EMAIL_ADDRESS"],
      sourceAssets: ["FIS_RAW.TB_CI_OZ3_EMAIL_ARD"],
      downstreamAssets: ["SILVER_CUST_EMAIL_VALIDATED"],
      encryptionRequired: true,
      encryptionMethods: ["TOKENIZATION"],
      tags: ["customer", "contact", "pii-high"],
      metadata: {
        refreshFrequency: "DAILY",
        volumeRecords: "10-15M",
      },
    },
  ],

  silverDataAssets: [
    {
      assetId: "SILVER_CUST_MASTER_GOLDEN",
      assetName: "silver.customer_master_golden",
      assetType: "TABLE",
      schema: "silver",
      description: "Golden customer record with MDM deduplication and SCD2",
      owner: "Customer Data Governance Team",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "RESTRICTED",
      piiPresent: true,
      piiElements: [
        "first_name_cleansed",
        "last_name_cleansed",
        "date_of_birth",
        "email_primary",
        "phone_mobile",
      ],
      sourceAssets: [
        "SILVER_CUST_ENCRYPTED",
        "SILVER_CUST_NAMES_STD",
        "SILVER_CUST_ID_TOKENIZED",
        "SILVER_CUST_EMAIL_VALIDATED",
      ],
      downstreamAssets: ["GOLD_CUSTOMER", "SEMANTIC_CUSTOMER"],
      encryptionRequired: true,
      encryptionMethods: ["AES_256", "TOKENIZATION"],
      sla: {
        availability: 99.9,
        rto: 240,
        rpo: 60,
      },
      tags: ["customer", "mdm", "golden-record", "scd2"],
      metadata: {
        refreshFrequency: "DAILY",
        scd2Type: "Type 2",
        businessKey: "customer_id",
        dedupMethod: "MDM matching on SSN_HASH + name + DOB + address",
      },
    },
  ],

  columnLineage: [
    {
      sourceTable: "FIS_RAW.TB_CI_OZ6_CUST_ARD",
      sourceColumn: "CID_CUST_CUST_NBR",
      targetTable: "silver.customer_master_golden",
      targetColumn: "customer_id",
      transformationLogic: "1:1 mapping, TRIM whitespace",
      businessMeaning: "Unique customer identifier",
      governanceNotes: "Natural key, must be unique per effective_date",
      dataType: {
        source: "VARCHAR(255)",
        target: "VARCHAR(20)",
      },
    },
    {
      sourceTable: "FIS_RAW.TB_CI_OZ6_CUST_ARD",
      sourceColumn: "CID_CUST_TAX_ID",
      targetTable: "silver.customer_master_golden",
      targetColumn: "ssn_hash",
      transformationId: "CUST_PII_ENC",
      transformationLogic: "SHA256(TAX_ID) for secure matching",
      businessMeaning: "PII encryption: irreversible hash of SSN/EIN",
      governanceNotes: "Cannot be reversed, used only for matching records",
      dataType: {
        source: "VARCHAR(20)",
        target: "STRING (64-char hash)",
      },
    },
    {
      sourceTable: "FIS_RAW.TB_CI_OZ5_CUST_NAAD_ARD",
      sourceColumn: "CID_NAAD_SURNAME",
      targetTable: "silver.customer_master_golden",
      targetColumn: "last_name_cleansed",
      transformationId: "CUST_NAME_STD",
      transformationLogic: "INITCAP(TRIM(UNACCENT())), remove special chars",
      businessMeaning: "Standardized last name",
      governanceNotes: "PII field, encrypted with AES-256",
      dataType: {
        source: "VARCHAR(100)",
        target: "VARCHAR(100) encrypted",
      },
      intermediaryTransformations: [
        { step: 1, table: "bronze.customer_names_addresses", logic: "TRIM whitespace" },
        { step: 2, table: "bronze.customer_names_addresses", logic: "UNACCENT remove accents" },
        { step: 3, table: "silver.customer_names_standardized", logic: "INITCAP proper case" },
      ],
    },
    {
      sourceTable: "FIS_RAW.TB_CI_OZ4_CUST_ID_ARD",
      sourceColumn: "CI_DMV21_ID_NUMBER",
      targetTable: "silver.customer_master_golden",
      targetColumn: "primary_id_number_tokenized",
      transformationId: "CUST_ID_TOK",
      transformationLogic: "External tokenization service replaces raw ID with token",
      businessMeaning: "PII: tokenized government ID number",
      governanceNotes: "Never expose raw ID numbers, use tokens only. Maintain secure token vault.",
      dataType: {
        source: "VARCHAR(255)",
        target: "STRING (tokenized)",
      },
    },
    {
      sourceTable: "FIS_RAW.TB_CI_OZ3_EMAIL_ARD",
      sourceColumn: "CID_EMLREL_ADDR_TXT",
      targetTable: "silver.customer_master_golden",
      targetColumn: "email_primary",
      transformationId: "CUST_EMAIL_VAL",
      transformationLogic: "RFC 5322 validation, deduplication, tokenization",
      businessMeaning: "Primary verified email address",
      governanceNotes: "PII field, tokenized. Must be valid RFC format.",
      dataType: {
        source: "VARCHAR(255)",
        target: "VARCHAR(255) tokenized",
      },
    },
  ],

  dataGovernance: {
    classification: "RESTRICTED",
    piiClassification: "HIGH",
    complianceFrameworks: ["GDPR", "CCPA", "SOX", "HIPAA"],
    dataRetention: {
      goldRecords: "7 years",
      transactionHistory: "3 years",
      deletionProcedure: "Cryptographic erasure + secure deletion",
    },
    accessControl: {
      requiredRole: "ANALYST_CUSTOMER_DATA",
      approvalRequired: true,
      auditLogging: "All access logged",
    },
    encryptionPolicy: {
      atRest: "AES-256 in Snowflake",
      inTransit: "TLS 1.3",
      keyManagement: "AWS KMS with rotation",
    },
  },
};

// ============================================================================
// DEPOSITS DOMAIN - METADATA CATALOG
// ============================================================================

export const depositsDomainMetadata = {
  domain: "Deposits",
  description: "Deposit accounts, balances, and transaction data",
  owner: "Deposit Data Governance Team",
  lastUpdated: new Date(),

  sourceDataAssets: [
    {
      assetId: "BRONZE_DEP_ACCT_MASTER",
      assetName: "bronze.deposit_account_master",
      assetType: "TABLE",
      schema: "bronze",
      description: "Deposit account master - types, rates, fees",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: false,
      piiElements: [],
      sourceAssets: ["FIS_CORE.TB_DP_OZZ_ACCT_ARD"],
      downstreamAssets: ["SILVER_DEP_ACCT_MASTER_GOLDEN"],
      encryptionRequired: false,
      encryptionMethods: [],
      tags: ["deposit", "accounts", "rates"],
      metadata: {
        refreshFrequency: "DAILY",
        volumeRecords: "20-30M",
      },
    },
    {
      assetId: "BRONZE_DEP_BALANCES",
      assetName: "bronze.deposit_account_balances_daily",
      assetType: "TABLE",
      schema: "bronze",
      description: "Daily account balance snapshots",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: false,
      piiElements: [],
      sourceAssets: ["FIS_CORE (internal ledger)"],
      downstreamAssets: ["SILVER_DEP_BALANCES_DAILY"],
      encryptionRequired: false,
      encryptionMethods: [],
      tags: ["deposit", "balances", "daily"],
      metadata: {
        refreshFrequency: "DAILY",
        volumeRecords: "20-30M daily",
      },
    },
    {
      assetId: "BRONZE_MONEY_TXN",
      assetName: "bronze.money_transaction",
      assetType: "TABLE",
      schema: "bronze",
      description: "Deposit transaction detail - all transaction types",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: false,
      piiElements: [],
      sourceAssets: ["FIS_CORE.DP_OZO_MNY_TXN_ARD"],
      downstreamAssets: ["SILVER_DEP_TRANSACTIONS_ENRICHED"],
      encryptionRequired: false,
      encryptionMethods: [],
      tags: ["deposit", "transactions", "real-time"],
      metadata: {
        refreshFrequency: "REAL_TIME",
        volumeRecords: "500M+ per month",
      },
    },
  ],

  silverDataAssets: [
    {
      assetId: "SILVER_DEP_ACCT_MASTER_GOLDEN",
      assetName: "silver.deposit_account_master_golden",
      assetType: "TABLE",
      schema: "silver",
      description: "Golden deposit account record with SCD2 history",
      owner: "Deposit Data Governance Team",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: false,
      piiElements: [],
      sourceAssets: ["SILVER_DEP_ACCT_NORMALIZED"],
      downstreamAssets: ["GOLD_DEPOSIT_ACCOUNTS"],
      encryptionRequired: false,
      encryptionMethods: [],
      sla: {
        availability: 99.95,
        rto: 120,
        rpo: 60,
      },
      tags: ["deposit", "golden-record", "scd2"],
      metadata: {
        refreshFrequency: "DAILY",
        scd2Type: "Type 2",
        businessKey: "account_id",
      },
    },
    {
      assetId: "SILVER_DEP_BALANCES_DAILY",
      assetName: "silver.deposit_account_daily_balances",
      assetType: "TABLE",
      schema: "silver",
      description: "Daily balance snapshots with validation",
      owner: "Deposit Data Governance Team",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: false,
      piiElements: [],
      sourceAssets: ["BRONZE_DEP_BALANCES"],
      downstreamAssets: ["GOLD_DEPOSIT_ANALYTICS"],
      encryptionRequired: false,
      encryptionMethods: [],
      tags: ["deposit", "balances", "validated"],
      metadata: {
        refreshFrequency: "DAILY",
        partitionBy: "balance_date",
        volumeRecords: "20-30M daily",
      },
    },
    {
      assetId: "SILVER_DEP_TXN_DETAIL",
      assetName: "silver.deposit_transaction_detail",
      assetType: "TABLE",
      schema: "silver",
      description: "Standardized and categorized transaction detail",
      owner: "Deposit Data Governance Team",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: false,
      piiElements: [],
      sourceAssets: ["BRONZE_MONEY_TXN"],
      downstreamAssets: ["GOLD_DEPOSIT_TRANSACTIONS"],
      encryptionRequired: false,
      encryptionMethods: [],
      sla: {
        availability: 99.99,
        rto: 15,
        rpo: 0,
      },
      tags: ["deposit", "transactions", "enriched"],
      metadata: {
        refreshFrequency: "REAL_TIME",
        partitionBy: "transaction_date",
        volumeRecords: "500M+ per month",
      },
    },
  ],

  columnLineage: [
    {
      sourceTable: "FIS_CORE.TB_DP_OZZ_ACCT_ARD",
      sourceColumn: "AC_ACCT_NBR",
      targetTable: "silver.deposit_account_master_golden",
      targetColumn: "account_id",
      transformationLogic: "1:1 mapping, TRIM, validate format",
      businessMeaning: "Unique account identifier",
      governanceNotes: "Natural key, must be unique",
      dataType: {
        source: "VARCHAR(20)",
        target: "VARCHAR(20)",
      },
    },
    {
      sourceTable: "FIS_CORE.TB_DP_OZZ_ACCT_ARD",
      sourceColumn: "AC_INT_STATED_RTE",
      targetTable: "silver.deposit_account_master_golden",
      targetColumn: "interest_rate_current",
      transformationId: "DEP_ACCT_NORM",
      transformationLogic: "Validate 0-10%, round to 6 decimals",
      businessMeaning: "Current annual interest rate percentage",
      governanceNotes: "Used for yield calculations, validated range",
      dataType: {
        source: "DECIMAL(8,6)",
        target: "DECIMAL(10,6)",
      },
    },
    {
      sourceTable: "FIS_CORE.DP_OZO_MNY_TXN_ARD",
      sourceColumn: "TRN_TRANS_AMT",
      targetTable: "silver.deposit_transaction_detail",
      targetColumn: "transaction_amount",
      transformationLogic: "1:1 mapping, ensure positive, validate format",
      businessMeaning: "Transaction amount in USD",
      governanceNotes: "Must be positive DECIMAL(18,2)",
      dataType: {
        source: "DECIMAL(15,2)",
        target: "DECIMAL(18,2)",
      },
    },
  ],

  dataGovernance: {
    classification: "INTERNAL",
    complianceFrameworks: ["SOX", "FDIC", "Fed Compliance"],
    dataRetention: {
      currentRecords: "Indefinite",
      historicalRecords: "7 years (SCD2)",
      deletionProcedure: "Archive to cold storage",
    },
    accessControl: {
      requiredRole: "ANALYST_DEPOSIT_DATA",
      approvalRequired: false,
      auditLogging: "Standard audit logs",
    },
  },
};

// ============================================================================
// TRANSACTIONS DOMAIN - METADATA CATALOG
// ============================================================================

export const transactionsDomainMetadata = {
  domain: "Transactions",
  description: "Payment and transaction data with compliance screening",
  owner: "Transaction Data Governance Team",
  lastUpdated: new Date(),

  sourceDataAssets: [
    {
      assetId: "BRONZE_MONEY_TXN",
      assetName: "bronze.money_transaction",
      assetType: "TABLE",
      schema: "bronze",
      description: "Deposit transaction detail",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: false,
      piiElements: [],
      sourceAssets: ["FIS_CORE.DP_OZO_MNY_TXN_ARD"],
      downstreamAssets: ["SILVER_TRX_CONSOLIDATED"],
      encryptionRequired: false,
      encryptionMethods: [],
      tags: ["transaction", "deposit"],
      metadata: {
        refreshFrequency: "REAL_TIME",
        volumeRecords: "500M+ per month",
      },
    },
    {
      assetId: "BRONZE_ACH_TXN",
      assetName: "bronze.ach_transaction",
      assetType: "TABLE",
      schema: "bronze",
      description: "ACH transaction detail with originator/receiver info",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: true,
      piiElements: ["COUNTERPARTY_NAME"],
      sourceAssets: ["NACHA (ACH Network)"],
      downstreamAssets: ["SILVER_TRX_ENRICHED_COUNTERPARTY"],
      encryptionRequired: true,
      encryptionMethods: ["TOKENIZATION"],
      tags: ["transaction", "ach", "compliance"],
      metadata: {
        refreshFrequency: "REAL_TIME",
        volumeRecords: "100-200M per month",
      },
    },
    {
      assetId: "BRONZE_WIRE_TXN",
      assetName: "bronze.wire_transfer_transaction",
      assetType: "TABLE",
      schema: "bronze",
      description: "Wire transfer detail with SWIFT data",
      owner: "Data Engineering",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: true,
      piiElements: ["BENEFICIARY_NAME"],
      sourceAssets: ["SWIFT (Wire Network)"],
      downstreamAssets: ["SILVER_TRX_ENRICHED_COUNTERPARTY"],
      encryptionRequired: true,
      encryptionMethods: ["TOKENIZATION"],
      tags: ["transaction", "wire", "compliance"],
      metadata: {
        refreshFrequency: "REAL_TIME",
        volumeRecords: "50-100M per month",
      },
    },
  ],

  silverDataAssets: [
    {
      assetId: "SILVER_TRX_DETAIL_ENRICHED",
      assetName: "silver.transaction_detail_enriched",
      assetType: "TABLE",
      schema: "silver",
      description: "Complete transaction detail with compliance data",
      owner: "Transaction Data Governance Team",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: true,
      piiElements: ["counterparty_name", "counterparty_account"],
      sourceAssets: [
        "SILVER_TRX_COMPLIANCE_SCREENED",
        "SILVER_TRX_FRAUD_SCORED",
      ],
      downstreamAssets: [
        "GOLD_TRANSACTIONS",
        "SEMANTIC_TRANSACTION_ANALYSIS",
      ],
      encryptionRequired: true,
      encryptionMethods: ["TOKENIZATION"],
      sla: {
        availability: 99.99,
        rto: 15,
        rpo: 0,
      },
      tags: ["transaction", "enriched", "compliance", "fraud-scored"],
      metadata: {
        refreshFrequency: "REAL_TIME",
        partitionBy: "transaction_date",
        volumeRecords: "500M+ per month",
        complianceControls: ["OFAC", "AML", "CTR", "SAR"],
      },
    },
    {
      assetId: "SILVER_TRX_DAILY_AGGREGATES",
      assetName: "silver.transaction_daily_aggregates",
      assetType: "TABLE",
      schema: "silver",
      description: "Daily transaction aggregates by type and account",
      owner: "Transaction Data Governance Team",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: false,
      piiElements: [],
      sourceAssets: ["SILVER_TRX_DETAIL_ENRICHED"],
      downstreamAssets: ["SEMANTIC_TRANSACTION_TRENDS"],
      encryptionRequired: false,
      encryptionMethods: [],
      tags: ["transaction", "aggregates", "analytics"],
      metadata: {
        refreshFrequency: "DAILY",
        partitionBy: "transaction_date",
      },
    },
    {
      assetId: "SILVER_TRX_COUNTERPARTY_SUMMARY",
      assetName: "silver.transaction_counterparty_summary",
      assetType: "TABLE",
      schema: "silver",
      description: "Monthly counterparty relationship summaries",
      owner: "Transaction Data Governance Team",
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      classification: "INTERNAL",
      piiPresent: true,
      piiElements: ["counterparty_name"],
      sourceAssets: ["SILVER_TRX_DETAIL_ENRICHED"],
      downstreamAssets: ["SEMANTIC_COUNTERPARTY_ANALYSIS"],
      encryptionRequired: true,
      encryptionMethods: ["TOKENIZATION"],
      tags: ["transaction", "counterparty", "compliance"],
      metadata: {
        refreshFrequency: "DAILY",
        grain: "Month",
      },
    },
  ],

  columnLineage: [
    {
      sourceTable: "bronze.money_transaction",
      sourceColumn: "TRN_TRANS_AMT",
      targetTable: "silver.transaction_detail_enriched",
      targetColumn: "transaction_amount",
      transformationLogic: "1:1 mapping, validate positive, DECIMAL(18,2) format",
      businessMeaning: "Transaction amount",
      governanceNotes: "Critical for fraud detection and compliance",
      dataType: {
        source: "DECIMAL(15,2)",
        target: "DECIMAL(18,2)",
      },
    },
    {
      sourceTable: "bronze.ach_transaction",
      sourceColumn: "ACH_RECEIVING_ACCOUNT_NAME",
      targetTable: "silver.transaction_detail_enriched",
      targetColumn: "counterparty_name",
      transformationId: "TRX_CPTY",
      transformationLogic: "Tokenize via external tokenization service",
      businessMeaning: "PII: counterparty name (tokenized)",
      governanceNotes: "Never expose raw counterparty names. Tokenized for matching.",
      dataType: {
        source: "VARCHAR(255)",
        target: "STRING (tokenized)",
      },
    },
  ],

  dataGovernance: {
    classification: "INTERNAL",
    complianceFrameworks: ["OFAC", "AML", "CTR", "SAR", "BSA", "SOX"],
    regulatoryReporting: {
      ctcReporting: "Transactions >= $10,000",
      sarReporting: "Suspicious Activity Reports",
      ofacReporting: "OFAC match alerts",
    },
    dataRetention: {
      detailRecords: "7 years",
      aggregates: "10 years",
      deletionProcedure: "Regulatory archive",
    },
    accessControl: {
      requiredRole: "ANALYST_TRANSACTION_DATA",
      approvalRequired: true,
      auditLogging: "Comprehensive audit trail",
      recordAccess: "Logged and monitored",
    },
  },
};

// ============================================================================
// INTEGRATED METADATA REGISTRY
// ============================================================================

export const transformationMetadataRegistry = {
  domains: [customerDomainMetadata, depositsDomainMetadata, transactionsDomainMetadata],

  crossDomainLineage: [
    {
      description: "Customer to Deposits: Link via customer_id",
      sourceAsset: "silver.customer_master_golden",
      targetAsset: "silver.deposit_account_master_golden",
      joinCondition: "customer_id (primary owner)",
    },
    {
      description: "Deposits to Transactions: Link via account_id",
      sourceAsset: "silver.deposit_account_master_golden",
      targetAsset: "silver.transaction_detail_enriched",
      joinCondition: "account_id",
    },
    {
      description: "Customer to Transactions: Transitive via account",
      sourceAsset: "silver.customer_master_golden",
      targetAsset: "silver.transaction_detail_enriched",
      joinCondition: "customer_id -> account_id -> transaction_id",
    },
  ],

  complianceMapping: {
    gdpr: ["piiPresent = TRUE", "encryptionRequired = TRUE"],
    ccpa: ["classification = RESTRICTED", "accessControl.auditLogging = TRUE"],
    sox: ["sla.availability >= 99.95"],
    hipaa: ["encryptionMethods includes AES-256"],
  },

  impactAnalysis: {
    description: "Data lineage for change impact assessment",
    usage: "Track downstream impact of schema changes, encryption changes, or business rule updates",
    method:
      "Follow downstreamAssets through all domain metadata to identify all affected tables",
  },

  auditCapability: {
    lineageTracking: "Column-level source-to-target transformation tracking",
    encryptionAudit: "All PII encryption methods documented and enforced",
    governanceEnforcement: "Compliance frameworks linked to data assets",
    accessAudit: "All access to sensitive data logged and monitored",
  },

  totalDataAssets: 13,
  totalColumnLineages: 25,
  totalDomainsManaged: 3,
  piiDataAssets: 11,
  encryptedDataAssets: 9,
};

export default transformationMetadataRegistry;
