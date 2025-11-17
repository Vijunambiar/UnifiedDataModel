/**
 * CUSTOMER DOMAIN - SILVER LAYER - DDL SCRIPTS
 * 
 * CREATE TABLE statements for Silver layer (conformed, cleansed, deduplicated)
 * Schema: CORE_CUSTOMERS
 * Source: Bronze layer tables
 * SCD Type: Type 2 with full history
 */

export const customerDemographySilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer Demography (Golden Record)
-- Source: bronze.customer_master + MDM deduplication
-- Purpose: Single source of truth for customer demographics
-- SCD Type: Type 2
-- ============================================================================

CREATE TABLE IF NOT EXISTS CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY (
  -- Surrogate Key
  CUSTOMER_SK BIGINT AUTOINCREMENT PRIMARY KEY,
  
  -- Business Key
  CUSTOMER_NUMBER VARCHAR(20) NOT NULL,
  
  -- Demographics (PII - Encrypted)
  ETHNIC_CODE VARCHAR(10),
  ETHNIC_DESC VARCHAR(50),
  GENDER VARCHAR(5),
  MARITAL_STATUS_CODE VARCHAR(10),
  MARITAL_STATUS_DESC VARCHAR(50),
  EDUCATION_CODE VARCHAR(10),
  EDUCATION_DESC VARCHAR(50),
  INCOME_CODE VARCHAR(10),
  INCOME_DESC VARCHAR(50),
  OCCUPATION_CODE VARCHAR(20),
  OCCUPATION_DESC VARCHAR(100),
  
  -- Customer Status
  RECORD_STATUS VARCHAR(20) NOT NULL,
  CUSTOMER_ACQUISITION_DATE DATE,
  LAST_CONTACT_DATE DATE,
  
  -- SCD Type 2 Columns
  EFFECTIVE_START_DATE TIMESTAMP_NTZ NOT NULL,
  EFFECTIVE_END_DATE TIMESTAMP_NTZ,
  IS_CURRENT BOOLEAN NOT NULL DEFAULT TRUE,
  RECORD_END_DATE DATE,
  
  -- Processing Metadata
  PRCS_DTE DATE NOT NULL,
  BUSINESS_DATE DATE,
  RECORD_DATE DATE,
  
  -- Data Lineage
  SOURCE_SYSTEM VARCHAR(20) DEFAULT 'FIS',
  LOAD_TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  UPDATED_TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  
  -- Constraints
  UNIQUE (CUSTOMER_NUMBER, EFFECTIVE_START_DATE),
  CONSTRAINT chk_record_status CHECK (RECORD_STATUS IN ('ACTIVE', 'INACTIVE', 'DECEASED', 'CLOSED'))
)
COMMENT = 'Silver layer: Customer demographics golden record with SCD Type 2 history'
CLUSTER BY (CUSTOMER_NUMBER, IS_CURRENT);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_silver_cust_current ON CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY(CUSTOMER_NUMBER) WHERE IS_CURRENT = TRUE;
CREATE INDEX IF NOT EXISTS idx_silver_cust_status ON CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY(RECORD_STATUS);
CREATE INDEX IF NOT EXISTS idx_silver_cust_prcs_dte ON CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY(PRCS_DTE);
`;

export const customerIdentifierSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer Identifier (Encrypted)
-- Source: bronze.customer_identifiers
-- Purpose: Government IDs with encryption and validation
-- SCD Type: Type 2
-- ============================================================================

CREATE TABLE IF NOT EXISTS CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER (
  -- Surrogate Key
  IDENTIFIER_SK BIGINT AUTOINCREMENT PRIMARY KEY,
  
  -- Business Keys
  CUSTOMER_NUMBER VARCHAR(20) NOT NULL,
  ID_TYPE VARCHAR(20) NOT NULL,
  
  -- Encrypted ID (PII)
  ID_NUMBER_ENCRYPTED VARCHAR(500) NOT NULL COMMENT 'AES-256 encrypted ID number',
  ID_NUMBER_HASH VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash for lookups',
  
  -- ID Details
  ISSUING_COUNTRY VARCHAR(3),
  ISSUING_STATE VARCHAR(10),
  ISSUE_DATE DATE,
  EXPIRATION_DATE DATE,
  
  -- Verification
  VERIFICATION_STATUS VARCHAR(20),
  VERIFICATION_DATE DATE,
  VERIFIED_BY VARCHAR(50),
  
  -- SCD Type 2
  EFFECTIVE_START_DATE TIMESTAMP_NTZ NOT NULL,
  EFFECTIVE_END_DATE TIMESTAMP_NTZ,
  IS_CURRENT BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Processing Metadata
  PRCS_DTE DATE NOT NULL,
  SOURCE_SYSTEM VARCHAR(20) DEFAULT 'FIS',
  LOAD_TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  
  -- Foreign Key
  FOREIGN KEY (CUSTOMER_NUMBER) REFERENCES CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY(CUSTOMER_NUMBER)
)
COMMENT = 'Silver layer: Customer identifiers with encryption and validation'
CLUSTER BY (CUSTOMER_NUMBER, IS_CURRENT);
`;

export const customerSilverDDLCatalog = {
  domain: "Customer Core",
  layer: "Silver",
  schema: "CORE_CUSTOMERS",
  scripts: [
    {
      name: "DIM_CUSTOMER_DEMOGRAPHY",
      ddl: customerDemographySilverDDL,
      scdType: "Type 2",
      estimatedRows: "5.5M"
    },
    {
      name: "DIM_CUSTOMER_IDENTIFER",
      ddl: customerIdentifierSilverDDL,
      scdType: "Type 2",
      estimatedRows: "8M"
    }
  ]
};

export default customerSilverDDLCatalog;
