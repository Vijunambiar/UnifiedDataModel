/**
 * CUSTOMER DOMAIN - BRONZE LAYER - DDL SCRIPTS
 * 
 * CREATE TABLE statements for Bronze layer tables
 * Source: FIS raw data landing zone
 * Schema: bronze / SNOWFLAKE_CURATED
 * Refresh: Daily batch loads from FIS
 */

export interface DDLScript {
  tableName: string;
  schema: string;
  ddlStatement: string;
  description: string;
  dependencies: string[];
  estimatedRows: string;
}

// ============================================================================
// CUSTOMER MASTER BRONZE TABLE
// ============================================================================
export const customerMasterBronzeDDL: DDLScript = {
  tableName: "bronze.customer_master",
  schema: "bronze",
  description: "Raw customer master data from FIS TB_CI_OZ6_CUST_ARD",
  dependencies: ["FIS_RAW.TB_CI_OZ6_CUST_ARD"],
  estimatedRows: "5.5M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Master
-- Source: FIS_RAW.TB_CI_OZ6_CUST_ARD
-- Purpose: Raw landing zone for customer demographics and attributes
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE TABLE IF NOT EXISTS bronze.customer_master (
  -- Business Keys
  CUSTOMER_ID VARCHAR(20) NOT NULL COMMENT 'Unique customer identifier from FIS',
  
  -- Demographics
  ETHNIC_CODE VARCHAR(10) COMMENT 'Customer ethnicity code',
  ETHNIC_DESC VARCHAR(50) COMMENT 'Customer ethnicity description',
  GENDER_CODE VARCHAR(5) COMMENT 'Gender code (M/F/X)',
  MARITAL_STATUS_CODE VARCHAR(10) COMMENT 'Marital status code',
  MARITAL_STATUS_DESC VARCHAR(50) COMMENT 'Marital status description',
  EDUCATION_CODE VARCHAR(10) COMMENT 'Education level code',
  EDUCATION_DESC VARCHAR(50) COMMENT 'Education level description',
  INCOME_CODE VARCHAR(10) COMMENT 'Income range code',
  INCOME_DESC VARCHAR(50) COMMENT 'Income range description',
  OCCUPATION_CODE VARCHAR(20) COMMENT 'Occupation classification code',
  OCCUPATION_DESC VARCHAR(100) COMMENT 'Occupation description',
  
  -- Status and Dates
  CUSTOMER_STATUS VARCHAR(20) NOT NULL COMMENT 'ACTIVE, INACTIVE, DECEASED, CLOSED',
  CUSTOMER_SINCE_DATE DATE COMMENT 'Date customer relationship established',
  LAST_CONTACT_DATE DATE COMMENT 'Last meaningful customer interaction',
  
  -- Audit Columns (Bronze Layer Standard)
  _LOAD_ID VARCHAR(50) NOT NULL COMMENT 'Unique identifier for the load batch',
  _LOAD_TIMESTAMP TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP() COMMENT 'When record was loaded',
  _SOURCE_SYSTEM VARCHAR(20) NOT NULL DEFAULT 'FIS' COMMENT 'Source system name',
  _SOURCE_TABLE VARCHAR(100) NOT NULL DEFAULT 'TB_CI_OZ6_CUST_ARD' COMMENT 'Source table name',
  _SOURCE_FILE VARCHAR(500) COMMENT 'Source file path if applicable',
  _RECORD_HASH VARCHAR(64) COMMENT 'MD5 hash of source record for change detection',
  _IS_DELETED BOOLEAN DEFAULT FALSE COMMENT 'Soft delete flag',
  
  -- Processing Metadata
  PRCS_DTE DATE NOT NULL COMMENT 'FIS processing date',
  EFFECTIVE_START_DATE TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP() COMMENT 'When this version became effective',
  EFFECTIVE_END_DATE TIMESTAMP_NTZ COMMENT 'When this version was superseded',
  IS_CURRENT BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Is this the current version?',
  
  -- Constraints
  PRIMARY KEY (CUSTOMER_ID, PRCS_DTE),
  CONSTRAINT chk_customer_status CHECK (CUSTOMER_STATUS IN ('ACTIVE', 'INACTIVE', 'DECEASED', 'CLOSED'))
)
COMMENT = 'Bronze layer: Raw customer master data from FIS - 1:1 mapping with minimal transformation'
CLUSTER BY (CUSTOMER_ID, PRCS_DTE)
;

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_bronze_customer_load_id ON bronze.customer_master(_LOAD_ID);
CREATE INDEX IF NOT EXISTS idx_bronze_customer_status ON bronze.customer_master(CUSTOMER_STATUS) WHERE IS_CURRENT = TRUE;
CREATE INDEX IF NOT EXISTS idx_bronze_customer_prcs_dte ON bronze.customer_master(PRCS_DTE);
  `
};

// ============================================================================
// CUSTOMER IDENTIFIERS BRONZE TABLE
// ============================================================================
export const customerIdentifiersBronzeDDL: DDLScript = {
  tableName: "bronze.customer_identifiers",
  schema: "bronze",
  description: "Raw customer identification documents from FIS TB_CI_OZ4_CUST_ID_ARD",
  dependencies: ["FIS_RAW.TB_CI_OZ4_CUST_ID_ARD"],
  estimatedRows: "8M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Identifiers
-- Source: FIS_RAW.TB_CI_OZ4_CUST_ID_ARD
-- Purpose: Government-issued IDs and identification documents
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE TABLE IF NOT EXISTS bronze.customer_identifiers (
  -- Business Keys
  CUSTOMER_ID VARCHAR(20) NOT NULL COMMENT 'Reference to customer master',
  ID_TYPE VARCHAR(20) NOT NULL COMMENT 'Type of identification (SSN, PASSPORT, DRIVERS_LICENSE)',
  ID_NUMBER VARCHAR(100) NOT NULL COMMENT 'Identification number - UNENCRYPTED in Bronze',
  
  -- ID Details
  ISSUING_COUNTRY VARCHAR(3) COMMENT 'ISO country code of issuing authority',
  ISSUING_STATE VARCHAR(10) COMMENT 'State/province code if applicable',
  ISSUE_DATE DATE COMMENT 'Date ID was issued',
  EXPIRATION_DATE DATE COMMENT 'Date ID expires',
  
  -- Verification
  VERIFICATION_STATUS VARCHAR(20) COMMENT 'VERIFIED, PENDING, EXPIRED, INVALID',
  VERIFICATION_DATE DATE COMMENT 'Date verification was performed',
  VERIFIED_BY VARCHAR(50) COMMENT 'User or system that verified',
  
  -- Audit Columns
  _LOAD_ID VARCHAR(50) NOT NULL,
  _LOAD_TIMESTAMP TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  _SOURCE_SYSTEM VARCHAR(20) NOT NULL DEFAULT 'FIS',
  _SOURCE_TABLE VARCHAR(100) NOT NULL DEFAULT 'TB_CI_OZ4_CUST_ID_ARD',
  _RECORD_HASH VARCHAR(64),
  _IS_DELETED BOOLEAN DEFAULT FALSE,
  
  -- Processing Metadata
  PRCS_DTE DATE NOT NULL,
  EFFECTIVE_START_DATE TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  EFFECTIVE_END_DATE TIMESTAMP_NTZ,
  IS_CURRENT BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Constraints
  PRIMARY KEY (CUSTOMER_ID, ID_TYPE, PRCS_DTE),
  CONSTRAINT chk_id_type CHECK (ID_TYPE IN ('SSN', 'PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'TAXPAYER_ID'))
)
COMMENT = 'Bronze layer: Customer identification documents - UNENCRYPTED, encryption applied in Silver layer'
CLUSTER BY (CUSTOMER_ID, PRCS_DTE)
;

CREATE INDEX IF NOT EXISTS idx_bronze_custid_load ON bronze.customer_identifiers(_LOAD_ID);
CREATE INDEX IF NOT EXISTS idx_bronze_custid_verification ON bronze.customer_identifiers(VERIFICATION_STATUS) WHERE IS_CURRENT = TRUE;
  `
};

// ============================================================================
// CUSTOMER NAMES AND ADDRESSES BRONZE TABLE
// ============================================================================
export const customerNamesAddressesBronzeDDL: DDLScript = {
  tableName: "bronze.customer_names_addresses",
  schema: "bronze",
  description: "Raw customer names and addresses from FIS TB_CI_OZ5_CUST_NAAD_ARD",
  dependencies: ["FIS_RAW.TB_CI_OZ5_CUST_NAAD_ARD"],
  estimatedRows: "12M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Names and Addresses
-- Source: FIS_RAW.TB_CI_OZ5_CUST_NAAD_ARD
-- Purpose: Customer legal names and physical/mailing addresses
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE TABLE IF NOT EXISTS bronze.customer_names_addresses (
  -- Business Keys
  CUSTOMER_ID VARCHAR(20) NOT NULL COMMENT 'Reference to customer master',
  NAME_ADDRESS_ID VARCHAR(30) NOT NULL COMMENT 'Unique ID for this name/address record',
  
  -- Name Information
  NAME_TYPE VARCHAR(20) COMMENT 'LEGAL, PREFERRED, DBA, PREVIOUS',
  FULL_NAME VARCHAR(200) COMMENT 'Complete name - UNENCRYPTED in Bronze',
  FIRST_NAME VARCHAR(100) COMMENT 'Given name',
  MIDDLE_NAME VARCHAR(100) COMMENT 'Middle name or initial',
  LAST_NAME VARCHAR(100) COMMENT 'Surname/family name',
  SUFFIX VARCHAR(20) COMMENT 'Jr., Sr., III, etc.',
  
  -- Address Information
  ADDRESS_TYPE VARCHAR(20) COMMENT 'PRIMARY, MAILING, WORK, PREVIOUS',
  ADDRESS_LINE1 VARCHAR(200) COMMENT 'Street address line 1',
  ADDRESS_LINE2 VARCHAR(200) COMMENT 'Street address line 2',
  CITY VARCHAR(100) COMMENT 'City name',
  STATE_PROVINCE VARCHAR(50) COMMENT 'State or province',
  POSTAL_CODE VARCHAR(20) COMMENT 'ZIP or postal code',
  COUNTRY_CODE VARCHAR(3) COMMENT 'ISO country code',
  
  -- Contact Information
  PRIMARY_PHONE VARCHAR(50) COMMENT 'Primary phone number',
  SECONDARY_PHONE VARCHAR(50) COMMENT 'Secondary phone number',
  EMAIL_ADDRESS VARCHAR(200) COMMENT 'Email address',
  
  -- Validation Flags
  ADDRESS_VALIDATED BOOLEAN COMMENT 'Has address been USPS validated?',
  EMAIL_VERIFIED BOOLEAN COMMENT 'Has email been verified?',
  PHONE_VERIFIED BOOLEAN COMMENT 'Has phone been verified?',
  
  -- Audit Columns
  _LOAD_ID VARCHAR(50) NOT NULL,
  _LOAD_TIMESTAMP TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  _SOURCE_SYSTEM VARCHAR(20) NOT NULL DEFAULT 'FIS',
  _SOURCE_TABLE VARCHAR(100) NOT NULL DEFAULT 'TB_CI_OZ5_CUST_NAAD_ARD',
  _RECORD_HASH VARCHAR(64),
  _IS_DELETED BOOLEAN DEFAULT FALSE,
  
  -- Processing Metadata
  PRCS_DTE DATE NOT NULL,
  EFFECTIVE_START_DATE TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  EFFECTIVE_END_DATE TIMESTAMP_NTZ,
  IS_CURRENT BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Constraints
  PRIMARY KEY (NAME_ADDRESS_ID, PRCS_DTE)
)
COMMENT = 'Bronze layer: Customer names and addresses - UNENCRYPTED, standardization and encryption in Silver layer'
CLUSTER BY (CUSTOMER_ID, PRCS_DTE)
;

CREATE INDEX IF NOT EXISTS idx_bronze_naad_customer ON bronze.customer_names_addresses(CUSTOMER_ID) WHERE IS_CURRENT = TRUE;
CREATE INDEX IF NOT EXISTS idx_bronze_naad_type ON bronze.customer_names_addresses(NAME_TYPE, ADDRESS_TYPE);
  `
};

// ============================================================================
// CUSTOMER EMAIL BRONZE TABLE
// ============================================================================
export const customerEmailBronzeDDL: DDLScript = {
  tableName: "bronze.customer_email",
  schema: "bronze",
  description: "Raw customer email addresses from FIS TB_CI_OZ3_EMAIL_ARD",
  dependencies: ["FIS_RAW.TB_CI_OZ3_EMAIL_ARD"],
  estimatedRows: "6M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Email
-- Source: FIS_RAW.TB_CI_OZ3_EMAIL_ARD
-- Purpose: Customer email addresses and preferences
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE TABLE IF NOT EXISTS bronze.customer_email (
  -- Business Keys
  CUSTOMER_ID VARCHAR(20) NOT NULL,
  EMAIL_ID VARCHAR(30) NOT NULL,
  
  -- Email Details
  EMAIL_ADDRESS VARCHAR(200) NOT NULL COMMENT 'Email address - UNENCRYPTED in Bronze',
  EMAIL_TYPE VARCHAR(20) COMMENT 'PRIMARY, SECONDARY, WORK, ALERTS',
  EMAIL_STATUS VARCHAR(20) COMMENT 'ACTIVE, BOUNCED, UNSUBSCRIBED, INVALID',
  
  -- Verification
  IS_VERIFIED BOOLEAN DEFAULT FALSE,
  VERIFICATION_DATE TIMESTAMP_NTZ COMMENT 'When email was verified',
  LAST_BOUNCE_DATE TIMESTAMP_NTZ COMMENT 'Most recent bounce',
  BOUNCE_COUNT INTEGER DEFAULT 0,
  
  -- Preferences
  OPT_IN_MARKETING BOOLEAN DEFAULT FALSE,
  OPT_IN_STATEMENTS BOOLEAN DEFAULT FALSE,
  OPT_IN_ALERTS BOOLEAN DEFAULT TRUE,
  
  -- Audit Columns
  _LOAD_ID VARCHAR(50) NOT NULL,
  _LOAD_TIMESTAMP TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  _SOURCE_SYSTEM VARCHAR(20) NOT NULL DEFAULT 'FIS',
  _SOURCE_TABLE VARCHAR(100) NOT NULL DEFAULT 'TB_CI_OZ3_EMAIL_ARD',
  _RECORD_HASH VARCHAR(64),
  _IS_DELETED BOOLEAN DEFAULT FALSE,
  
  -- Processing Metadata
  PRCS_DTE DATE NOT NULL,
  EFFECTIVE_START_DATE TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  EFFECTIVE_END_DATE TIMESTAMP_NTZ,
  IS_CURRENT BOOLEAN NOT NULL DEFAULT TRUE,
  
  PRIMARY KEY (EMAIL_ID, PRCS_DTE)
)
COMMENT = 'Bronze layer: Customer email addresses and preferences'
CLUSTER BY (CUSTOMER_ID, PRCS_DTE)
;

CREATE INDEX IF NOT EXISTS idx_bronze_email_customer ON bronze.customer_email(CUSTOMER_ID) WHERE IS_CURRENT = TRUE;
  `
};

// ============================================================================
// CUSTOMER TO ACCOUNT RELATIONSHIP BRONZE TABLE
// ============================================================================
export const customerAccountRelationshipBronzeDDL: DDLScript = {
  tableName: "bronze.customer_account_relationship",
  schema: "bronze",
  description: "Raw customer-to-account relationships from FIS TB_CI_OZW_CUST_ACCT_RLT_ARD",
  dependencies: ["FIS_RAW.TB_CI_OZW_CUST_ACCT_RLT_ARD"],
  estimatedRows: "20M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer to Account Relationship
-- Source: FIS_RAW.TB_CI_OZW_CUST_ACCT_RLT_ARD
-- Purpose: Bridge table linking customers to their accounts
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE TABLE IF NOT EXISTS bronze.customer_account_relationship (
  -- Business Keys
  CUSTOMER_ID VARCHAR(20) NOT NULL,
  ACCOUNT_NUMBER VARCHAR(20) NOT NULL,
  RELATIONSHIP_ID VARCHAR(30) NOT NULL,
  
  -- Relationship Details
  RELATIONSHIP_TYPE VARCHAR(30) NOT NULL COMMENT 'PRIMARY_OWNER, JOINT_OWNER, AUTHORIZED_SIGNER, BENEFICIARY',
  RELATIONSHIP_START_DATE DATE NOT NULL,
  RELATIONSHIP_END_DATE DATE,
  RELATIONSHIP_STATUS VARCHAR(20) COMMENT 'ACTIVE, TERMINATED, SUSPENDED',
  
  -- Authority Levels
  TRANSACTION_AUTHORITY BOOLEAN DEFAULT FALSE,
  INQUIRY_AUTHORITY BOOLEAN DEFAULT TRUE,
  SIGNATORY_AUTHORITY BOOLEAN DEFAULT FALSE,
  
  -- Ownership Percentage (for joint accounts)
  OWNERSHIP_PERCENTAGE DECIMAL(5,2) COMMENT 'Percentage ownership (0-100)',
  
  -- Audit Columns
  _LOAD_ID VARCHAR(50) NOT NULL,
  _LOAD_TIMESTAMP TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  _SOURCE_SYSTEM VARCHAR(20) NOT NULL DEFAULT 'FIS',
  _SOURCE_TABLE VARCHAR(100) NOT NULL DEFAULT 'TB_CI_OZW_CUST_ACCT_RLT_ARD',
  _RECORD_HASH VARCHAR(64),
  _IS_DELETED BOOLEAN DEFAULT FALSE,
  
  -- Processing Metadata
  PRCS_DTE DATE NOT NULL,
  EFFECTIVE_START_DATE TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  EFFECTIVE_END_DATE TIMESTAMP_NTZ,
  IS_CURRENT BOOLEAN NOT NULL DEFAULT TRUE,
  
  PRIMARY KEY (RELATIONSHIP_ID, PRCS_DTE),
  CONSTRAINT chk_relationship_type CHECK (RELATIONSHIP_TYPE IN ('PRIMARY_OWNER', 'JOINT_OWNER', 'AUTHORIZED_SIGNER', 'BENEFICIARY', 'CUSTODIAN'))
)
COMMENT = 'Bronze layer: Customer to account relationships'
CLUSTER BY (CUSTOMER_ID, ACCOUNT_NUMBER, PRCS_DTE)
;

CREATE INDEX IF NOT EXISTS idx_bronze_rel_customer ON bronze.customer_account_relationship(CUSTOMER_ID) WHERE IS_CURRENT = TRUE;
CREATE INDEX IF NOT EXISTS idx_bronze_rel_account ON bronze.customer_account_relationship(ACCOUNT_NUMBER) WHERE IS_CURRENT = TRUE;
  `
};

// ============================================================================
// DDL SCRIPT CATALOG
// ============================================================================
export const customerBronzeDDLCatalog = {
  domain: "Customer Core",
  layer: "Bronze",
  schema: "bronze / SNOWFLAKE_CURATED",
  sourceSystem: "FIS",
  scripts: [
    customerMasterBronzeDDL,
    customerIdentifiersBronzeDDL,
    customerNamesAddressesBronzeDDL,
    customerEmailBronzeDDL,
    customerAccountRelationshipBronzeDDL
  ],
  totalTables: 5,
  estimatedTotalRows: "51.5M",
  refreshSchedule: "Daily at 2:00 AM UTC",
  dataRetention: "Raw data retained for 90 days in Bronze layer",
  notes: [
    "All PII fields remain UNENCRYPTED in Bronze layer",
    "Encryption applied during Bronze → Silver transformation",
    "SCD Type 2 tracking enabled via PRCS_DTE and IS_CURRENT flags",
    "All tables include standard audit columns (_LOAD_ID, _LOAD_TIMESTAMP, etc.)",
    "Hash-based change detection using _RECORD_HASH column"
  ]
};

export default customerBronzeDDLCatalog;
