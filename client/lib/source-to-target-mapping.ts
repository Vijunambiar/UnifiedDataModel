/**
 * SOURCE-TO-TARGET MAPPING FRAMEWORK
 *
 * Comprehensive source-to-target mapping with detailed assets for different data sources
 * Includes source system codes, column mappings, transformations, and data lineage
 *
 * Key Features:
 * - Source system registry with vendor codes and identifiers
 * - Column-level source-to-target mappings
 * - Transformation logic documentation
 * - Data lineage tracking (Source → Bronze → Silver → Gold)
 * - Source file/API specifications
 * - ETL metadata and CDC tracking
 */

// ============================================================================
// SOURCE SYSTEM REGISTRY
// ============================================================================

export type SourceSystemType =
  | "CORE_BANKING"
  | "PAYMENT_PROCESSOR"
  | "CREDIT_BUREAU"
  | "FRAUD_DETECTION"
  | "LOAN_ORIGINATION"
  | "CARD_PROCESSOR"
  | "TREASURY"
  | "CRM"
  | "AML_COMPLIANCE"
  | "MARKET_DATA"
  | "PROPERTY_DATA"
  | "ACCOUNT_AGGREGATION";

export type IntegrationType =
  | "CDC"
  | "BATCH_FILE"
  | "API_REST"
  | "API_SOAP"
  | "STREAMING"
  | "SFTP"
  | "EVENT_HUB"
  | "WEBHOOK";

export type DataFormat =
  | "CSV"
  | "JSON"
  | "XML"
  | "PARQUET"
  | "AVRO"
  | "DELIMITED"
  | "FIXED_WIDTH"
  | "PROPRIETARY";

export interface SourceSystem {
  // System Identification
  sourceSystemId: string;
  sourceSystemCode: string; // e.g., 'FIS-ACH', 'FICO-FRAUD-01'
  sourceSystemName: string;
  vendor: string;
  productName: string;
  version: string;

  // Classification
  systemType: SourceSystemType;
  criticality: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

  // Integration Details
  integrationType: IntegrationType;
  dataFormat: DataFormat;
  connectionDetails: {
    protocol?: string;
    host?: string;
    port?: number;
    endpoint?: string;
    authMethod?: string;
  };

  // Data Characteristics
  refreshFrequency: string;
  avgDailyVolume: string;
  retentionPeriod: string;
  sla: {
    availability: string;
    latency: string;
    refreshCadence: string;
  };

  // Business Context
  domains: string[];
  dataTypes: string[];
  keyEntities: string[];

  // Operational
  primaryContact: string;
  supportTeam: string;
  documentation: string;
  cost: string;

  // Technical Metadata
  sourceSchemas?: SourceSchema[];
  fieldMappings?: FieldMapping[];
}

export interface SourceSchema {
  schemaName: string;
  tableName?: string;
  fileName?: string;
  apiEndpoint?: string;
  description: string;
  primaryKey: string[];
  fields: SourceField[];
}

export interface SourceField {
  sourceFieldName: string;
  dataType: string;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  description: string;
  sampleValues?: string[];
  validationRules?: string[];
  piiFlag: boolean;
  encryptionRequired: boolean;
}

// ============================================================================
// SOURCE SYSTEM CATALOG
// ============================================================================

export const sourceSystems: SourceSystem[] = [
  // -------------------------------------------------------------------------
  // FIS - ACH TRACKER
  // -------------------------------------------------------------------------
  {
    sourceSystemId: "fis-ach-tracker-001",
    sourceSystemCode: "FIS-ACH-TRK",
    sourceSystemName: "FIS Corporate ACH Tracker",
    vendor: "FIS (Fidelity Information Services)",
    productName: "Corporate ACH Tracker",
    version: "10.5",

    systemType: "PAYMENT_PROCESSOR",
    criticality: "CRITICAL",

    integrationType: "STREAMING",
    dataFormat: "JSON",
    connectionDetails: {
      protocol: "HTTPS",
      host: "ach-tracker-api.fis.com",
      port: 443,
      endpoint: "/api/v2/transactions",
      authMethod: "OAuth2 + API Key",
    },

    refreshFrequency: "Real-time streaming + Daily reconciliation batch",
    avgDailyVolume: "500K-5M ACH transactions",
    retentionPeriod: "7 years",
    sla: {
      availability: "99.9% uptime",
      latency: "<500ms for streaming, <2s for API calls",
      refreshCadence: "Real-time event streaming",
    },

    domains: ["payments-commercial", "treasury", "cash-management"],
    dataTypes: [
      "ACH Transaction Tracking",
      "Exception Events (Returns, NOCs)",
      "Batch File Metadata",
      "Settlement Status",
      "Return Codes (R01-R99)",
      "NOC Codes (C01-C13)",
      "Reconciliation Data",
    ],
    keyEntities: [
      "ACH Transactions",
      "Exceptions",
      "Batches",
      "Return Codes",
      "NOC Codes",
    ],

    primaryContact: "Treasury Operations Manager",
    supportTeam: "FIS ACH Support (1-800-XXX-XXXX)",
    documentation: "https://docs.fis.com/ach-tracker/v10.5",
    cost: "$200K+ annually (volume-based pricing)",

    sourceSchemas: [
      {
        schemaName: "ACH_TRANSACTION_LOG",
        apiEndpoint: "/api/v2/transactions",
        description: "Real-time ACH transaction lifecycle events",
        primaryKey: ["tracker_transaction_id"],
        fields: [
          {
            sourceFieldName: "tracker_transaction_id",
            dataType: "STRING",
            length: 50,
            nullable: false,
            description: "FIS ACH Tracker unique transaction identifier",
            sampleValues: [
              "FIS-ACH-20250115-00001234",
              "FIS-ACH-20250115-00005678",
            ],
            validationRules: ["Pattern: FIS-ACH-YYYYMMDD-########"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "core_ach_id",
            dataType: "STRING",
            length: 50,
            nullable: true,
            description: "Link to core banking ACH transaction ID",
            sampleValues: ["ACH-2025011500123456", "ACH-2025011500234567"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "trace_number",
            dataType: "STRING",
            length: 15,
            nullable: false,
            description: "ACH trace number (ODFI + Sequence)",
            sampleValues: ["091000019123456", "121000248234567"],
            validationRules: ["Length = 15", "First 8 digits = ODFI routing"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "company_id",
            dataType: "STRING",
            length: 10,
            nullable: false,
            description: "Company ID (originator identification)",
            sampleValues: ["1234567890", "9876543210"],
            validationRules: ["Numeric", "Length = 10"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "transaction_type",
            dataType: "STRING",
            length: 10,
            nullable: false,
            description: "ACH transaction type",
            sampleValues: ["CREDIT", "DEBIT"],
            validationRules: ["ENUM: CREDIT, DEBIT"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "sec_code",
            dataType: "STRING",
            length: 3,
            nullable: false,
            description: "Standard Entry Class code",
            sampleValues: ["CCD", "PPD", "CTP", "CTX", "WEB", "TEL"],
            validationRules: [
              "ENUM: CCD, CTP, CTX, PPD, WEB, TEL, ARC, BOC, POP, RCK",
            ],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "transaction_amount",
            dataType: "DECIMAL",
            precision: 18,
            scale: 2,
            nullable: false,
            description: "Transaction amount in USD",
            sampleValues: ["1500.00", "25000.50"],
            validationRules: ["> 0", "<= 99999999999999.99"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "effective_entry_date",
            dataType: "DATE",
            nullable: false,
            description: "ACH effective date (settlement date)",
            sampleValues: ["2025-01-15", "2025-01-16"],
            validationRules: ["Format: YYYY-MM-DD", "Business day"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "originator_account_number",
            dataType: "STRING",
            length: 17,
            nullable: false,
            description: "Originator bank account number",
            sampleValues: ["ENCRYPTED_VALUE"],
            validationRules: [],
            piiFlag: true,
            encryptionRequired: true,
          },
          {
            sourceFieldName: "originator_routing_number",
            dataType: "STRING",
            length: 9,
            nullable: false,
            description: "Originator bank routing number (ABA)",
            sampleValues: ["091000019", "121000248"],
            validationRules: [
              "Numeric",
              "Length = 9",
              "Valid ABA routing number",
            ],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "receiver_name",
            dataType: "STRING",
            length: 100,
            nullable: false,
            description: "ACH receiver name",
            sampleValues: ["ACME CORP", "JOHN DOE"],
            validationRules: [],
            piiFlag: true,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "receiver_account_number",
            dataType: "STRING",
            length: 17,
            nullable: false,
            description: "Receiver bank account number",
            sampleValues: ["ENCRYPTED_VALUE"],
            validationRules: [],
            piiFlag: true,
            encryptionRequired: true,
          },
          {
            sourceFieldName: "receiver_routing_number",
            dataType: "STRING",
            length: 9,
            nullable: false,
            description: "Receiver bank routing number (ABA)",
            sampleValues: ["026009593", "111000025"],
            validationRules: [
              "Numeric",
              "Length = 9",
              "Valid ABA routing number",
            ],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "current_status",
            dataType: "STRING",
            length: 20,
            nullable: false,
            description: "Current transaction status in FIS Tracker",
            sampleValues: [
              "SUBMITTED",
              "VALIDATED",
              "BATCHED",
              "TRANSMITTED",
              "SETTLED",
              "RETURNED",
            ],
            validationRules: [
              "ENUM: SUBMITTED, VALIDATED, BATCHED, TRANSMITTED, SETTLED, RETURNED, REVERSED, REJECTED",
            ],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "status_timestamp",
            dataType: "TIMESTAMP",
            nullable: false,
            description: "Timestamp of current status",
            sampleValues: ["2025-01-15T08:30:15Z", "2025-01-15T09:45:22Z"],
            validationRules: ["ISO 8601 format", "UTC timezone"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "same_day_ach_flag",
            dataType: "BOOLEAN",
            nullable: false,
            description: "Indicator if transaction is same-day ACH",
            sampleValues: ["true", "false"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "return_code",
            dataType: "STRING",
            length: 3,
            nullable: true,
            description: "ACH return reason code (R01-R99)",
            sampleValues: ["R01", "R03", "R10", "R29"],
            validationRules: ["Pattern: R[0-9]{2}", "Valid NACHA return code"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "return_description",
            dataType: "STRING",
            length: 255,
            nullable: true,
            description: "Description of return reason",
            sampleValues: [
              "Insufficient Funds",
              "No Account/Unable to Locate",
              "Customer Advises Not Authorized",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "noc_flag",
            dataType: "BOOLEAN",
            nullable: false,
            description: "Notification of Change received flag",
            sampleValues: ["true", "false"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "noc_code",
            dataType: "STRING",
            length: 3,
            nullable: true,
            description: "NOC code (C01-C13)",
            sampleValues: ["C01", "C02", "C03"],
            validationRules: ["Pattern: C[0-9]{2}", "Valid NACHA NOC code"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "noc_corrected_value",
            dataType: "STRING",
            length: 100,
            nullable: true,
            description: "Corrected value from NOC (routing or account)",
            sampleValues: ["ENCRYPTED_VALUE"],
            validationRules: [],
            piiFlag: true,
            encryptionRequired: true,
          },
          {
            sourceFieldName: "settlement_status",
            dataType: "STRING",
            length: 20,
            nullable: false,
            description: "Settlement status",
            sampleValues: ["PENDING", "SETTLED", "FAILED"],
            validationRules: ["ENUM: PENDING, SETTLED, FAILED"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "settlement_date",
            dataType: "DATE",
            nullable: true,
            description: "Actual settlement date",
            sampleValues: ["2025-01-15", "2025-01-16"],
            validationRules: ["Format: YYYY-MM-DD"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "reconciliation_status",
            dataType: "STRING",
            length: 20,
            nullable: false,
            description: "Reconciliation status with core banking",
            sampleValues: ["MATCHED", "UNMATCHED", "EXCEPTION"],
            validationRules: ["ENUM: MATCHED, UNMATCHED, EXCEPTION, PENDING"],
            piiFlag: false,
            encryptionRequired: false,
          },
        ],
      },
      {
        schemaName: "ACH_RETURN_CODE_MASTER",
        fileName: "ach_return_codes_reference.csv",
        description: "NACHA ACH return code master data (R01-R99)",
        primaryKey: ["return_code"],
        fields: [
          {
            sourceFieldName: "return_code",
            dataType: "STRING",
            length: 3,
            nullable: false,
            description: "NACHA return code",
            sampleValues: ["R01", "R02", "R03", "R04", "R10", "R29"],
            validationRules: ["Pattern: R[0-9]{2}"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "return_description",
            dataType: "STRING",
            length: 255,
            nullable: false,
            description: "Official NACHA description of return reason",
            sampleValues: [
              "Insufficient Funds",
              "Account Closed",
              "No Account/Unable to Locate",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "retry_allowed_flag",
            dataType: "BOOLEAN",
            nullable: false,
            description: "Indicates if retry is allowed per NACHA rules",
            sampleValues: ["true", "false"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "correctable_flag",
            dataType: "BOOLEAN",
            nullable: false,
            description: "Indicates if issue can be corrected",
            sampleValues: ["true", "false"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "unauthorized_flag",
            dataType: "BOOLEAN",
            nullable: false,
            description: "Indicates unauthorized entry return",
            sampleValues: ["true", "false"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "time_frame",
            dataType: "STRING",
            length: 50,
            nullable: true,
            description: "NACHA time frame for return",
            sampleValues: [
              "2 banking days",
              "60 calendar days",
              "Within 2 banking days of settlement date",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
        ],
      },
      {
        schemaName: "ACH_NOC_CODE_MASTER",
        fileName: "ach_noc_codes_reference.csv",
        description:
          "NACHA NOC (Notification of Change) code master data (C01-C13)",
        primaryKey: ["noc_code"],
        fields: [
          {
            sourceFieldName: "noc_code",
            dataType: "STRING",
            length: 3,
            nullable: false,
            description: "NACHA NOC code",
            sampleValues: ["C01", "C02", "C03", "C04", "C05", "C06", "C07"],
            validationRules: ["Pattern: C[0-9]{2}"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "noc_description",
            dataType: "STRING",
            length: 255,
            nullable: false,
            description: "Official NACHA description of NOC",
            sampleValues: [
              "Incorrect Account Number",
              "Incorrect Routing Number",
              "Incorrect Routing and Account Number",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "corrected_field",
            dataType: "STRING",
            length: 50,
            nullable: false,
            description: "Field that needs correction",
            sampleValues: [
              "ACCOUNT_NUMBER",
              "ROUTING_NUMBER",
              "BOTH",
              "TRANSACTION_CODE",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "auto_apply_flag",
            dataType: "BOOLEAN",
            nullable: false,
            description: "Indicates if NOC can be auto-applied",
            sampleValues: ["true", "false"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "mandatory_flag",
            dataType: "BOOLEAN",
            nullable: false,
            description: "Indicates if correction is mandatory per NACHA",
            sampleValues: ["true", "false"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // FICO - FRAUD DETECTION
  // -------------------------------------------------------------------------
  {
    sourceSystemId: "fico-falcon-fraud-001",
    sourceSystemCode: "FICO-FRAUD",
    sourceSystemName: "FICO Falcon Fraud Platform",
    vendor: "FICO (Fair Isaac Corporation)",
    productName: "Falcon Fraud Manager",
    version: "8.7",

    systemType: "FRAUD_DETECTION",
    criticality: "CRITICAL",

    integrationType: "API_REST",
    dataFormat: "JSON",
    connectionDetails: {
      protocol: "HTTPS",
      host: "falcon-api.fico.com",
      port: 443,
      endpoint: "/api/v3/fraud-scores",
      authMethod: "OAuth2 + TLS Client Certificate",
    },

    refreshFrequency:
      "Real-time scoring (transactional) + Daily batch analytics",
    avgDailyVolume: "5M transactions scored",
    retentionPeriod: "7 years (compliance requirement)",
    sla: {
      availability: "99.99% uptime",
      latency: "<200ms for scoring, <500ms for alerts",
      refreshCadence: "Real-time per transaction",
    },

    domains: [
      "fraud-retail",
      "cards-retail",
      "payments-retail",
      "digital-retail",
    ],
    dataTypes: [
      "Fraud Scores",
      "Fraud Alerts",
      "Device Intelligence",
      "Behavioral Analytics",
      "Consortium Data",
      "Fraud Patterns",
      "Rule Engine Results",
      "Model Predictions",
    ],
    keyEntities: ["Fraud Scores", "Alerts", "Cases", "Devices", "Patterns"],

    primaryContact: "Fraud Operations Manager",
    supportTeam: "FICO Fraud Support (1-888-XXX-XXXX)",
    documentation: "https://docs.fico.com/falcon/v8.7",
    cost: "$1.5M+ annually (transaction volume-based)",

    sourceSchemas: [
      {
        schemaName: "FRAUD_SCORE_RESPONSE",
        apiEndpoint: "/api/v3/fraud-scores",
        description: "Real-time fraud scoring response for transactions",
        primaryKey: ["transaction_id", "score_timestamp"],
        fields: [
          {
            sourceFieldName: "transaction_id",
            dataType: "STRING",
            length: 50,
            nullable: false,
            description: "Unique transaction identifier from requesting system",
            sampleValues: ["TXN-20250115-001234", "TXN-20250115-005678"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "fico_score_id",
            dataType: "STRING",
            length: 50,
            nullable: false,
            description: "FICO Falcon unique scoring event ID",
            sampleValues: [
              "FICO-SCR-2025011508301234",
              "FICO-SCR-2025011509451234",
            ],
            validationRules: ["Pattern: FICO-SCR-YYYYMMDDHHMMSSSS"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "fraud_score",
            dataType: "INTEGER",
            nullable: false,
            description: "FICO fraud score (0-999, higher = riskier)",
            sampleValues: ["125", "850", "999"],
            validationRules: ["Range: 0-999"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "fraud_risk_level",
            dataType: "STRING",
            length: 20,
            nullable: false,
            description: "Risk level categorization",
            sampleValues: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            validationRules: ["ENUM: LOW, MEDIUM, HIGH, CRITICAL"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "fraud_reason_codes",
            dataType: "ARRAY<STRING>",
            nullable: false,
            description: "Array of FICO reason codes contributing to score",
            sampleValues: ['["RC001","RC042","RC123"]', '["RC002"]'],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "model_version",
            dataType: "STRING",
            length: 20,
            nullable: false,
            description: "FICO model version used for scoring",
            sampleValues: ["FALCON-8.7-US-RETAIL", "FALCON-8.7-US-CARD"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "device_id",
            dataType: "STRING",
            length: 100,
            nullable: true,
            description: "Device fingerprint ID",
            sampleValues: ["DEV-ABC123XYZ789", "DEV-987ZYX321CBA"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "device_risk_score",
            dataType: "INTEGER",
            nullable: true,
            description: "Device-specific risk score (0-999)",
            sampleValues: ["50", "750"],
            validationRules: ["Range: 0-999"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "geolocation_risk_score",
            dataType: "INTEGER",
            nullable: true,
            description: "Geographic location risk score (0-999)",
            sampleValues: ["100", "800"],
            validationRules: ["Range: 0-999"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "behavioral_risk_score",
            dataType: "INTEGER",
            nullable: true,
            description: "Behavioral pattern risk score (0-999)",
            sampleValues: ["200", "900"],
            validationRules: ["Range: 0-999"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "consortium_data_flag",
            dataType: "BOOLEAN",
            nullable: false,
            description: "Indicates if consortium data was used",
            sampleValues: ["true", "false"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "recommended_action",
            dataType: "STRING",
            length: 20,
            nullable: false,
            description: "FICO recommended action",
            sampleValues: ["APPROVE", "REVIEW", "DECLINE", "CHALLENGE"],
            validationRules: [
              "ENUM: APPROVE, REVIEW, DECLINE, CHALLENGE, STEP_UP_AUTH",
            ],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "score_timestamp",
            dataType: "TIMESTAMP",
            nullable: false,
            description: "Timestamp when score was generated (UTC)",
            sampleValues: [
              "2025-01-15T08:30:15.123Z",
              "2025-01-15T09:45:22.456Z",
            ],
            validationRules: ["ISO 8601 format", "UTC timezone"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "response_time_ms",
            dataType: "INTEGER",
            nullable: false,
            description: "FICO API response time in milliseconds",
            sampleValues: ["45", "120", "185"],
            validationRules: ["> 0"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "fraud_indicators",
            dataType: "JSON",
            nullable: true,
            description: "Detailed fraud indicators and contributing factors",
            sampleValues: [
              '{"velocity_check":"FAIL","amount_deviation":"HIGH","time_pattern":"SUSPICIOUS"}',
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
        ],
      },
      {
        schemaName: "FRAUD_ALERT",
        apiEndpoint: "/api/v3/fraud-alerts",
        description: "Fraud alerts generated by FICO Falcon rules engine",
        primaryKey: ["alert_id"],
        fields: [
          {
            sourceFieldName: "alert_id",
            dataType: "STRING",
            length: 50,
            nullable: false,
            description: "Unique FICO alert identifier",
            sampleValues: [
              "FICO-ALT-2025011508301234",
              "FICO-ALT-2025011509451234",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "transaction_id",
            dataType: "STRING",
            length: 50,
            nullable: false,
            description: "Related transaction identifier",
            sampleValues: ["TXN-20250115-001234"],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "alert_type",
            dataType: "STRING",
            length: 50,
            nullable: false,
            description: "Type of fraud alert",
            sampleValues: [
              "HIGH_RISK_SCORE",
              "VELOCITY_EXCEEDED",
              "DEVICE_CHANGE",
              "LOCATION_MISMATCH",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "alert_severity",
            dataType: "STRING",
            length: 20,
            nullable: false,
            description: "Alert severity level",
            sampleValues: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            validationRules: ["ENUM: LOW, MEDIUM, HIGH, CRITICAL"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "triggered_rules",
            dataType: "ARRAY<STRING>",
            nullable: false,
            description: "Array of FICO rule IDs that triggered the alert",
            sampleValues: ['["RULE_001","RULE_042"]', '["RULE_123"]'],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "alert_timestamp",
            dataType: "TIMESTAMP",
            nullable: false,
            description: "When alert was generated (UTC)",
            sampleValues: ["2025-01-15T08:30:15Z"],
            validationRules: ["ISO 8601 format"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "customer_id",
            dataType: "STRING",
            length: 50,
            nullable: true,
            description: "Customer identifier",
            sampleValues: ["CUST-123456"],
            validationRules: [],
            piiFlag: true,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "account_id",
            dataType: "STRING",
            length: 50,
            nullable: true,
            description: "Account identifier",
            sampleValues: ["ACCT-987654"],
            validationRules: [],
            piiFlag: true,
            encryptionRequired: false,
          },
        ],
      },
      {
        schemaName: "FRAUD_REASON_CODE_MASTER",
        fileName: "fico_fraud_reason_codes.csv",
        description: "FICO Falcon fraud reason code master data",
        primaryKey: ["reason_code"],
        fields: [
          {
            sourceFieldName: "reason_code",
            dataType: "STRING",
            length: 10,
            nullable: false,
            description: "FICO fraud reason code",
            sampleValues: ["RC001", "RC002", "RC042", "RC123"],
            validationRules: ["Pattern: RC[0-9]{3}"],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "reason_description",
            dataType: "STRING",
            length: 255,
            nullable: false,
            description: "Description of fraud reason",
            sampleValues: [
              "High velocity of transactions",
              "Device fingerprint mismatch",
              "Geolocation anomaly",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "reason_category",
            dataType: "STRING",
            length: 50,
            nullable: false,
            description: "Category of fraud reason",
            sampleValues: [
              "VELOCITY",
              "DEVICE",
              "LOCATION",
              "BEHAVIORAL",
              "AMOUNT",
              "TIME_PATTERN",
            ],
            validationRules: [],
            piiFlag: false,
            encryptionRequired: false,
          },
          {
            sourceFieldName: "severity_weight",
            dataType: "DECIMAL",
            precision: 5,
            scale: 2,
            nullable: false,
            description: "Weight of this reason in overall score calculation",
            sampleValues: ["0.25", "0.75", "1.00"],
            validationRules: ["Range: 0-1"],
            piiFlag: false,
            encryptionRequired: false,
          },
        ],
      },
    ],
  },

  // Additional source systems can be added following the same pattern...
];

// Import expanded source systems
import {
  expandedSourceSystems,
  coreBankingCustomerMappings,
  coreBankingAccountMappings,
  coreBankingTransactionMappings,
  expandedLineage,
} from "./source-to-target-mapping-expanded";

// Combine all source systems
export const allSourceSystems: SourceSystem[] = [
  ...sourceSystems,
  ...expandedSourceSystems,
];

// ============================================================================
// FIELD MAPPING FRAMEWORK
// ============================================================================

export interface FieldMapping {
  // Source
  sourceSystem: string;
  sourceSchema: string;
  sourceField: string;
  sourceDataType: string;

  // Target Bronze
  bronzeTable: string;
  bronzeField: string;
  bronzeDataType: string;

  // Target Silver
  silverTable?: string;
  silverField?: string;
  silverDataType?: string;

  // Target Gold
  goldTable?: string;
  goldField?: string;
  goldDataType?: string;

  // Transformation
  transformationType:
    | "DIRECT_MAPPING"
    | "TYPE_CONVERSION"
    | "ENCRYPTION"
    | "DECRYPTION"
    | "LOOKUP"
    | "CONCATENATION"
    | "SPLIT"
    | "DERIVED"
    | "AGGREGATION"
    | "STANDARDIZATION"
    | "ENRICHMENT";

  transformationLogic: string;
  transformationSQL?: string;

  // Metadata
  businessDefinition: string;
  dataQualityRules: string[];
  sampleTransformation?: {
    sourceValue: string;
    targetValue: string;
  }[];
}

// ============================================================================
// FIS ACH TRACKER - SOURCE TO TARGET MAPPINGS
// ============================================================================

export const fisACHTrackerMappings: FieldMapping[] = [
  {
    sourceSystem: "FIS-ACH-TRK",
    sourceSchema: "ACH_TRANSACTION_LOG",
    sourceField: "tracker_transaction_id",
    sourceDataType: "STRING",

    bronzeTable: "bronze.fis_ach_tracker_transactions",
    bronzeField: "tracker_transaction_id",
    bronzeDataType: "STRING",

    silverTable: "silver.fis_ach_tracker_transactions_cleansed",
    silverField: "tracker_transaction_id",
    silverDataType: "STRING",

    goldTable: "gold.fact_ach_tracker_transactions",
    goldField: "tracker_transaction_key",
    goldDataType: "BIGINT",

    transformationType: "DIRECT_MAPPING",
    transformationLogic:
      "Bronze: Direct copy from source. Silver: Direct copy with deduplication. Gold: Surrogate key lookup",
    transformationSQL: `
      -- Bronze
      tracker_transaction_id = SOURCE.tracker_transaction_id
      
      -- Silver (with deduplication)
      SELECT DISTINCT tracker_transaction_id 
      FROM bronze.fis_ach_tracker_transactions
      WHERE record_hash NOT IN (SELECT record_hash FROM silver.fis_ach_tracker_transactions_cleansed)
      
      -- Gold (surrogate key)
      SELECT 
        SHA2(tracker_transaction_id, 256) AS tracker_transaction_key,
        tracker_transaction_id
      FROM silver.fis_ach_tracker_transactions_cleansed
    `,

    businessDefinition:
      "Unique identifier for ACH transaction in FIS Tracker system",
    dataQualityRules: [
      "NOT NULL",
      "UNIQUE per source system",
      "Pattern: FIS-ACH-YYYYMMDD-########",
      "Length <= 50 characters",
    ],

    sampleTransformation: [
      {
        sourceValue: "FIS-ACH-20250115-00001234",
        targetValue: "FIS-ACH-20250115-00001234",
      },
      {
        sourceValue: "FIS-ACH-20250115-00005678",
        targetValue: "FIS-ACH-20250115-00005678",
      },
    ],
  },

  {
    sourceSystem: "FIS-ACH-TRK",
    sourceSchema: "ACH_TRANSACTION_LOG",
    sourceField: "transaction_amount",
    sourceDataType: "DECIMAL",

    bronzeTable: "bronze.fis_ach_tracker_transactions",
    bronzeField: "transaction_amount",
    bronzeDataType: "DECIMAL(18,2)",

    silverTable: "silver.fis_ach_tracker_transactions_cleansed",
    silverField: "transaction_amount",
    silverDataType: "DECIMAL(18,2)",

    goldTable: "gold.fact_ach_tracker_transactions",
    goldField: "transaction_amount",
    goldDataType: "DECIMAL(18,2)",

    transformationType: "TYPE_CONVERSION",
    transformationLogic:
      "Bronze: Cast to DECIMAL(18,2). Silver: Validate > 0, cleanse nulls. Gold: Aggregate-ready measure",
    transformationSQL: `
      -- Bronze
      CAST(SOURCE.transaction_amount AS DECIMAL(18,2)) AS transaction_amount
      
      -- Silver (with validation)
      CASE 
        WHEN transaction_amount IS NULL THEN 0.00
        WHEN transaction_amount < 0 THEN ABS(transaction_amount)
        ELSE transaction_amount
      END AS transaction_amount
      
      -- Gold (measure)
      SUM(transaction_amount) AS total_transaction_amount
    `,

    businessDefinition: "Dollar amount of ACH transaction",
    dataQualityRules: [
      "NOT NULL",
      "MUST be > 0",
      "Precision: 18 digits, 2 decimal places",
      "Max value: 99,999,999,999,999.99",
      "Currency: USD only",
    ],

    sampleTransformation: [
      { sourceValue: "1500.00", targetValue: "1500.00" },
      { sourceValue: "25000.50", targetValue: "25000.50" },
    ],
  },

  {
    sourceSystem: "FIS-ACH-TRK",
    sourceSchema: "ACH_TRANSACTION_LOG",
    sourceField: "current_status",
    sourceDataType: "STRING",

    bronzeTable: "bronze.fis_ach_tracker_transactions",
    bronzeField: "current_status",
    bronzeDataType: "STRING",

    silverTable: "silver.fis_ach_tracker_transactions_cleansed",
    silverField: "ach_status_code",
    silverDataType: "STRING",

    goldTable: "gold.dim_ach_status",
    goldField: "ach_status_code",
    goldDataType: "STRING",

    transformationType: "STANDARDIZATION",
    transformationLogic:
      "Bronze: Direct copy. Silver: Standardize to uppercase, trim spaces. Gold: Dimension lookup",
    transformationSQL: `
      -- Bronze
      current_status
      
      -- Silver (standardization)
      UPPER(TRIM(current_status)) AS ach_status_code
      
      -- Gold (dimension)
      SELECT 
        ROW_NUMBER() OVER (ORDER BY ach_status_code) AS ach_status_key,
        ach_status_code,
        CASE ach_status_code
          WHEN 'SUBMITTED' THEN 'Transaction Submitted'
          WHEN 'VALIDATED' THEN 'Validation Passed'
          WHEN 'BATCHED' THEN 'Added to Batch File'
          WHEN 'TRANSMITTED' THEN 'Sent to Fed/Network'
          WHEN 'SETTLED' THEN 'Successfully Settled'
          WHEN 'RETURNED' THEN 'Returned by RDFI'
          WHEN 'REVERSED' THEN 'Transaction Reversed'
        END AS status_description
      FROM (SELECT DISTINCT ach_status_code FROM silver.fis_ach_tracker_transactions_cleansed)
    `,

    businessDefinition:
      "Current lifecycle status of ACH transaction in FIS Tracker",
    dataQualityRules: [
      "NOT NULL",
      "Valid values: SUBMITTED, VALIDATED, BATCHED, TRANSMITTED, SETTLED, RETURNED, REVERSED, REJECTED",
      "Uppercase only",
      "No leading/trailing spaces",
    ],

    sampleTransformation: [
      { sourceValue: "SUBMITTED", targetValue: "SUBMITTED" },
      { sourceValue: "settled", targetValue: "SETTLED" },
      { sourceValue: " RETURNED ", targetValue: "RETURNED" },
    ],
  },

  {
    sourceSystem: "FIS-ACH-TRK",
    sourceSchema: "ACH_TRANSACTION_LOG",
    sourceField: "return_code",
    sourceDataType: "STRING",

    bronzeTable: "bronze.fis_ach_tracker_transactions",
    bronzeField: "return_code",
    bronzeDataType: "STRING",

    silverTable: "silver.fis_ach_tracker_transactions_cleansed",
    silverField: "return_code",
    silverDataType: "STRING",

    goldTable: "gold.dim_ach_return_code",
    goldField: "return_code",
    goldDataType: "STRING",

    transformationType: "LOOKUP",
    transformationLogic:
      "Bronze: Direct copy. Silver: Validate against master list. Gold: Join to return code dimension",
    transformationSQL: `
      -- Bronze
      return_code
      
      -- Silver (validation with lookup)
      SELECT 
        t.return_code,
        rc.return_description,
        rc.retry_allowed_flag,
        rc.correctable_flag
      FROM bronze.fis_ach_tracker_transactions t
      LEFT JOIN bronze.fis_ach_tracker_return_codes rc
        ON t.return_code = rc.return_code
      
      -- Gold (dimension)
      INSERT INTO gold.dim_ach_return_code
      SELECT 
        ROW_NUMBER() OVER (ORDER BY return_code) AS return_code_key,
        return_code,
        return_description,
        retry_allowed_flag,
        correctable_flag,
        unauthorized_flag,
        time_frame,
        CURRENT_TIMESTAMP AS dimension_created_timestamp
      FROM bronze.fis_ach_tracker_return_codes
    `,

    businessDefinition:
      "NACHA standard return reason code (R01-R99) indicating why ACH transaction was returned",
    dataQualityRules: [
      "NULL allowed (only populated if transaction returned)",
      "Pattern: R[0-9]{2}",
      "Valid NACHA return codes only",
      "Must exist in return code master table",
    ],

    sampleTransformation: [
      { sourceValue: "R01", targetValue: "R01 - Insufficient Funds" },
      { sourceValue: "R03", targetValue: "R03 - No Account/Unable to Locate" },
      {
        sourceValue: "R10",
        targetValue: "R10 - Customer Advises Not Authorized",
      },
    ],
  },

  {
    sourceSystem: "FIS-ACH-TRK",
    sourceSchema: "ACH_TRANSACTION_LOG",
    sourceField: "receiver_account_number",
    sourceDataType: "STRING",

    bronzeTable: "bronze.fis_ach_tracker_transactions",
    bronzeField: "receiver_account_number_encrypted",
    bronzeDataType: "STRING",

    silverTable: "silver.fis_ach_tracker_transactions_cleansed",
    silverField: "receiver_account_number_masked",
    silverDataType: "STRING",

    goldTable: "gold.fact_ach_tracker_transactions",
    goldField: "receiver_account_key",
    goldDataType: "BIGINT",

    transformationType: "ENCRYPTION",
    transformationLogic:
      "Bronze: AES-256 encryption. Silver: Mask (show last 4). Gold: Surrogate key only",
    transformationSQL: `
      -- Bronze (encryption)
      AES_ENCRYPT(SOURCE.receiver_account_number, SECRET_KEY) AS receiver_account_number_encrypted
      
      -- Silver (masking)
      CONCAT('****', RIGHT(AES_DECRYPT(receiver_account_number_encrypted, SECRET_KEY), 4)) AS receiver_account_number_masked
      
      -- Gold (tokenization)
      SHA2(AES_DECRYPT(receiver_account_number_encrypted, SECRET_KEY), 256) AS receiver_account_key
    `,

    businessDefinition:
      "Receiver bank account number (PII - must be encrypted at rest)",
    dataQualityRules: [
      "NOT NULL",
      "Encrypted at rest (AES-256)",
      "Masked in Silver layer (show last 4 digits only)",
      "Tokenized in Gold layer (surrogate key only)",
      "PII flag: TRUE",
      "Max length: 17 characters",
    ],

    sampleTransformation: [
      {
        sourceValue: "1234567890123",
        targetValue: "****3123 (masked) | 8a7f3d... (key)",
      },
      {
        sourceValue: "9876543210987",
        targetValue: "****0987 (masked) | 2e9c4b... (key)",
      },
    ],
  },
];

// ============================================================================
// FICO FRAUD - SOURCE TO TARGET MAPPINGS
// ============================================================================

export const ficoFraudMappings: FieldMapping[] = [
  {
    sourceSystem: "FICO-FRAUD",
    sourceSchema: "FRAUD_SCORE_RESPONSE",
    sourceField: "fraud_score",
    sourceDataType: "INTEGER",

    bronzeTable: "bronze.fico_fraud_scores",
    bronzeField: "fraud_score",
    bronzeDataType: "INTEGER",

    silverTable: "silver.fraud_scores_enriched",
    silverField: "fraud_score",
    silverDataType: "INTEGER",

    goldTable: "gold.fact_fraud_scores",
    goldField: "fraud_score",
    goldDataType: "INTEGER",

    transformationType: "DIRECT_MAPPING",
    transformationLogic:
      "Bronze: Direct copy. Silver: Validate range 0-999. Gold: Measure for analytics",
    transformationSQL: `
      -- Bronze
      fraud_score
      
      -- Silver (validation)
      CASE 
        WHEN fraud_score < 0 THEN 0
        WHEN fraud_score > 999 THEN 999
        ELSE fraud_score
      END AS fraud_score
      
      -- Gold (analytics)
      SELECT 
        fraud_score,
        CASE 
          WHEN fraud_score < 200 THEN 'LOW'
          WHEN fraud_score < 500 THEN 'MEDIUM'
          WHEN fraud_score < 800 THEN 'HIGH'
          ELSE 'CRITICAL'
        END AS fraud_risk_band
      FROM silver.fraud_scores_enriched
    `,

    businessDefinition:
      "FICO Falcon fraud score (0-999, higher score = higher risk)",
    dataQualityRules: [
      "NOT NULL",
      "Range: 0-999",
      "Integer only",
      "Higher score = higher fraud risk",
    ],

    sampleTransformation: [
      { sourceValue: "125", targetValue: "125 (LOW)" },
      { sourceValue: "650", targetValue: "650 (HIGH)" },
      { sourceValue: "950", targetValue: "950 (CRITICAL)" },
    ],
  },

  {
    sourceSystem: "FICO-FRAUD",
    sourceSchema: "FRAUD_SCORE_RESPONSE",
    sourceField: "fraud_reason_codes",
    sourceDataType: "ARRAY<STRING>",

    bronzeTable: "bronze.fico_fraud_scores",
    bronzeField: "fraud_reason_codes",
    bronzeDataType: "JSON",

    silverTable: "silver.fraud_scores_enriched",
    silverField: "fraud_reason_codes_enriched",
    silverDataType: "JSON",

    goldTable: "gold.bridge_fraud_score_reason",
    goldField: "reason_code",
    goldDataType: "STRING",

    transformationType: "ENRICHMENT",
    transformationLogic:
      "Bronze: Store as JSON. Silver: Explode array and join to master. Gold: Bridge table for many-to-many",
    transformationSQL: `
      -- Bronze
      TO_JSON(SOURCE.fraud_reason_codes) AS fraud_reason_codes
      
      -- Silver (enrichment)
      SELECT 
        fs.fico_score_id,
        EXPLODE(FROM_JSON(fs.fraud_reason_codes, 'ARRAY<STRING>')) AS reason_code,
        rc.reason_description,
        rc.reason_category,
        rc.severity_weight
      FROM bronze.fico_fraud_scores fs
      LATERAL VIEW EXPLODE(fraud_reason_codes) AS reason_code
      LEFT JOIN bronze.fico_fraud_reason_code_master rc
        ON reason_code = rc.reason_code
      
      -- Gold (bridge table)
      INSERT INTO gold.bridge_fraud_score_reason
      SELECT 
        fs.fraud_score_key,
        rc.reason_code_key,
        rc.severity_weight
      FROM silver.fraud_scores_enriched fs
      JOIN gold.dim_fraud_reason_code rc
        ON fs.reason_code = rc.reason_code
    `,

    businessDefinition:
      "Array of FICO reason codes explaining why fraud score was elevated",
    dataQualityRules: [
      "Can be empty array (no reasons)",
      "Each reason code must exist in master table",
      "Deduplicate reason codes",
      "Sort by severity_weight DESC",
    ],

    sampleTransformation: [
      {
        sourceValue: '["RC001","RC042"]',
        targetValue:
          "RC001: High velocity (0.75), RC042: Device mismatch (0.50)",
      },
      {
        sourceValue: '["RC123"]',
        targetValue: "RC123: Geolocation anomaly (1.00)",
      },
    ],
  },
];

// ============================================================================
// DATA LINEAGE TRACKING
// ============================================================================

export interface DataLineage {
  domainId: string;
  entity: string;

  // Source to Bronze
  sourceSystem: string;
  sourceSchema: string;
  sourceField: string;
  bronzeTable: string;
  bronzeField: string;
  bronzeLoadType: string;

  // Bronze to Silver
  silverTable?: string;
  silverField?: string;
  silverTransformation: string;

  // Silver to Gold
  goldTable?: string;
  goldField?: string;
  goldAggregation?: string;

  // Metadata
  dataLineagePath: string;
  lastUpdated: string;
  certifiedFlag: boolean;
}

export const fisACHLineage: DataLineage[] = [
  {
    domainId: "payments-commercial",
    entity: "ACH Transaction",

    sourceSystem: "FIS-ACH-TRK",
    sourceSchema: "ACH_TRANSACTION_LOG",
    sourceField: "tracker_transaction_id",
    bronzeTable: "bronze.fis_ach_tracker_transactions",
    bronzeField: "tracker_transaction_id",
    bronzeLoadType: "STREAMING",

    silverTable: "silver.fis_ach_tracker_transactions_cleansed",
    silverField: "tracker_transaction_id",
    silverTransformation:
      "Deduplication on record_hash, SCD Type 2 for history",

    goldTable: "gold.fact_ach_tracker_transactions",
    goldField: "tracker_transaction_key",
    goldAggregation: "Surrogate key generation via SHA-256 hash",

    dataLineagePath:
      "FIS ACH Tracker API → bronze.fis_ach_tracker_transactions → silver.fis_ach_tracker_transactions_cleansed → gold.fact_ach_tracker_transactions",
    lastUpdated: "2025-01-15",
    certifiedFlag: true,
  },
  {
    domainId: "payments-commercial",
    entity: "ACH Return Code",

    sourceSystem: "FIS-ACH-TRK",
    sourceSchema: "ACH_RETURN_CODE_MASTER",
    sourceField: "return_code",
    bronzeTable: "bronze.fis_ach_tracker_return_codes",
    bronzeField: "return_code",
    bronzeLoadType: "BATCH",

    silverTable: "silver.ach_return_codes_master",
    silverField: "return_code",
    silverTransformation: "Direct copy with deduplication",

    goldTable: "gold.dim_ach_return_code",
    goldField: "return_code",
    goldAggregation: "Dimension table with SCD Type 1",

    dataLineagePath:
      "FIS Reference File → bronze.fis_ach_tracker_return_codes → silver.ach_return_codes_master → gold.dim_ach_return_code",
    lastUpdated: "2025-01-15",
    certifiedFlag: true,
  },
];

export const ficoFraudLineage: DataLineage[] = [
  {
    domainId: "fraud-retail",
    entity: "Fraud Score",

    sourceSystem: "FICO-FRAUD",
    sourceSchema: "FRAUD_SCORE_RESPONSE",
    sourceField: "fraud_score",
    bronzeTable: "bronze.fico_fraud_scores",
    bronzeField: "fraud_score",
    bronzeLoadType: "API",

    silverTable: "silver.fraud_scores_enriched",
    silverField: "fraud_score",
    silverTransformation:
      "Range validation (0-999), join to reason code master",

    goldTable: "gold.fact_fraud_scores",
    goldField: "fraud_score",
    goldAggregation: "Measure with risk band calculation",

    dataLineagePath:
      "FICO Falcon API → bronze.fico_fraud_scores → silver.fraud_scores_enriched → gold.fact_fraud_scores",
    lastUpdated: "2025-01-15",
    certifiedFlag: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getSourceSystemByCode(code: string): SourceSystem | undefined {
  return sourceSystems.find((s) => s.sourceSystemCode === code);
}

export function getMappingsBySourceSystem(
  sourceSystemCode: string,
): FieldMapping[] {
  if (sourceSystemCode === "FIS-ACH-TRK") return fisACHTrackerMappings;
  if (sourceSystemCode === "FICO-FRAUD") return ficoFraudMappings;
  return [];
}

export function getLineageByDomain(domainId: string): DataLineage[] {
  const allLineage = [...fisACHLineage, ...ficoFraudLineage];
  return allLineage.filter((l) => l.domainId === domainId);
}

export function getLineageBySourceSystem(
  sourceSystemCode: string,
): DataLineage[] {
  const allLineage = [...fisACHLineage, ...ficoFraudLineage];
  return allLineage.filter((l) => l.sourceSystem === sourceSystemCode);
}

// ============================================================================
// CONSOLIDATED EXPORTS
// ============================================================================

// All field mappings combined
export const allFieldMappings: FieldMapping[] = [
  ...fisACHTrackerMappings,
  ...ficoFraudMappings,
  ...coreBankingCustomerMappings,
  ...coreBankingAccountMappings,
  ...coreBankingTransactionMappings,
];

// All data lineage combined
export const allDataLineage: DataLineage[] = [
  ...fisACHLineage,
  ...ficoFraudLineage,
  ...expandedLineage,
];

// ============================================================================
// EXPORT
// ============================================================================

export const sourceToTargetFramework = {
  sourceSystems: allSourceSystems,
  fieldMappings: allFieldMappings,
  dataLineage: allDataLineage,
  // Legacy exports for backward compatibility
  fisACHTrackerMappings,
  ficoFraudMappings,
  fisACHLineage,
  ficoFraudLineage,
  // Utility functions
  getSourceSystemByCode,
  getMappingsBySourceSystem,
  getLineageByDomain,
  getLineageBySourceSystem,
};
