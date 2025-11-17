// Snowflake DDL Generators
// Generates CREATE TABLE and schema DDL for Bronze, Silver, and Gold layers

export interface DDLScript {
  layerName: string;
  ddlStatements: string[];
}

export function generateBronzeDDL(domain: string): DDLScript {
  const ddlStatements = [
    `-- Bronze Layer DDL for ${domain} domain
-- Raw landing zone with minimal transformation

CREATE SCHEMA IF NOT EXISTS STAGING_DB.${domain.toUpperCase()}_STAGING
  COMMENT = 'Bronze layer: Raw data from FIS for ${domain} domain';

CREATE TABLE IF NOT EXISTS STAGING_DB.${domain.toUpperCase()}_STAGING.RAW_${domain.toUpperCase()} (
  -- Source columns (example for customer domain)
  CUSTOMER_ID VARCHAR NOT NULL,
  CUSTOMER_NAME VARCHAR,
  DOB DATE,
  CUST_TYPE VARCHAR,
  EMAIL VARCHAR,
  PHONE VARCHAR,
  COUNTRY VARCHAR,
  CUST_CREATION_DATE TIMESTAMP_NTZ,
  ANNUAL_INCOME NUMERIC(15,2),
  
  -- Audit columns
  _LOAD_ID VARCHAR NOT NULL COMMENT 'Unique load identifier',
  _LOAD_TIMESTAMP TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP() COMMENT 'When record was loaded',
  _SOURCE_SYSTEM VARCHAR NOT NULL DEFAULT 'FIS' COMMENT 'Source system name',
  _DOMAIN VARCHAR NOT NULL DEFAULT '${domain.toUpperCase()}' COMMENT 'Data domain',
  
  PRIMARY KEY (_LOAD_ID, CUSTOMER_ID)
)
COMMENT = 'Raw customer data from FIS - no transformation applied'
DATA_RETENTION_TIME_IN_DAYS = 30;

-- Error table for failed records
CREATE TABLE IF NOT EXISTS STAGING_DB.${domain.toUpperCase()}_STAGING.${domain.toUpperCase()}_LOAD_ERROR (
  LOAD_ID VARCHAR,
  SOURCE_ROW_NUMBER INT,
  ERROR_MESSAGE VARCHAR,
  ERROR_TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  RAW_DATA VARIANT
)
COMMENT = 'Failed records from ${domain} extraction';
    `,
  ];

  return {
    layerName: "Bronze",
    ddlStatements,
  };
}

export function generateSilverDDL(domain: string): DDLScript {
  const ddlStatements = [
    `-- Silver Layer DDL for ${domain} domain
-- Cleaned, validated, and standardized data

CREATE SCHEMA IF NOT EXISTS TRANSFORMATION_DB.${domain.toUpperCase()}_TRANSFORMED
  COMMENT = 'Silver layer: Cleaned and validated data for ${domain} domain';

CREATE TABLE IF NOT EXISTS TRANSFORMATION_DB.${domain.toUpperCase()}_TRANSFORMED.${domain.toUpperCase()}_CLEANED (
  -- Cleaned and standardized columns
  customer_id VARCHAR NOT NULL,
  customer_name VARCHAR NOT NULL,
  date_of_birth DATE,
  customer_type VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  country_code CHAR(2),
  created_at TIMESTAMP_NTZ NOT NULL,
  annual_income NUMERIC(15,2),
  
  -- Data quality flags
  data_quality_score NUMERIC(3,2),
  completeness_pct NUMERIC(5,2),
  
  -- Audit columns
  source_load_id VARCHAR,
  cleaned_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  
  PRIMARY KEY (customer_id)
)
COMMENT = 'Cleaned customer data - standardized types and formats'
DATA_RETENTION_TIME_IN_DAYS = 90;

-- Slowly Changing Dimension Type 2 support
CREATE TABLE IF NOT EXISTS TRANSFORMATION_DB.${domain.toUpperCase()}_TRANSFORMED.${domain.toUpperCase()}_SCD2_TRACKING (
  customer_id VARCHAR,
  valid_from TIMESTAMP_NTZ,
  valid_to TIMESTAMP_NTZ,
  is_current BOOLEAN,
  change_reason VARCHAR,
  changed_columns ARRAY
)
COMMENT = 'SCD Type 2 tracking for customer dimension changes';
    `,
  ];

  return {
    layerName: "Silver",
    ddlStatements,
  };
}

export function generateGoldDDL(domain: string): DDLScript {
  const ddlStatements = [
    `-- Gold Layer DDL for ${domain} domain
-- Business-ready aggregated and dimensional data

CREATE SCHEMA IF NOT EXISTS ANALYTICS_DB.${domain.toUpperCase()}_ANALYTICS
  COMMENT = 'Gold layer: Analytics-ready data for ${domain} domain';

-- Dimension table
CREATE TABLE IF NOT EXISTS ANALYTICS_DB.${domain.toUpperCase()}_ANALYTICS.DIM_${domain.toUpperCase()} (
  customer_key INT PRIMARY KEY COMMENT 'Surrogate key',
  customer_id VARCHAR NOT NULL COMMENT 'Natural key from source',
  customer_name VARCHAR NOT NULL,
  date_of_birth DATE,
  customer_type VARCHAR,
  country_code CHAR(2),
  
  -- Calculated fields
  age INT,
  segment VARCHAR COMMENT 'RFM or behavioral segment',
  clv_usd NUMERIC(15,2) COMMENT 'Customer Lifetime Value',
  risk_score NUMERIC(3,2),
  
  -- SCD Type 2
  valid_from TIMESTAMP_NTZ,
  valid_to TIMESTAMP_NTZ,
  is_current BOOLEAN,
  
  -- Metadata
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  
  CONSTRAINT dim_customer_natural_key UNIQUE (customer_id)
)
COMMENT = 'Customer dimension - SCD Type 2 support'
CLUSTER BY (segment, country_code);

-- Fact table (example for daily facts)
CREATE TABLE IF NOT EXISTS ANALYTICS_DB.${domain.toUpperCase()}_ANALYTICS.FCT_${domain.toUpperCase()}_DAILY (
  fact_key INT PRIMARY KEY COMMENT 'Surrogate key',
  date_key INT NOT NULL COMMENT 'Reference to dim_date',
  customer_key INT NOT NULL COMMENT 'Reference to dim_customer',
  
  -- Measures
  transaction_count INT DEFAULT 0,
  transaction_amount NUMERIC(15,2) DEFAULT 0.00,
  average_transaction_size NUMERIC(15,2),
  
  -- Metadata
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  
  CONSTRAINT fct_daily_date_fk FOREIGN KEY (date_key) REFERENCES ANALYTICS_DB.DIM_DATE(date_key),
  CONSTRAINT fct_daily_customer_fk FOREIGN KEY (customer_key) REFERENCES ANALYTICS_DB.${domain.toUpperCase()}_ANALYTICS.DIM_${domain.toUpperCase()}(customer_key)
)
COMMENT = 'Daily facts for ${domain} domain'
PARTITION BY (date_key)
CLUSTER BY (customer_key);

-- Aggregation table for Power BI performance
CREATE TABLE IF NOT EXISTS ANALYTICS_DB.${domain.toUpperCase()}_ANALYTICS.AGG_${domain.toUpperCase()}_MONTHLY (
  year_month VARCHAR NOT NULL COMMENT 'YYYY-MM format',
  segment VARCHAR NOT NULL,
  customer_count INT,
  total_amount NUMERIC(15,2),
  average_transaction_size NUMERIC(15,2),
  transaction_count INT,
  churn_rate NUMERIC(5,2),
  
  PRIMARY KEY (year_month, segment)
)
COMMENT = 'Pre-aggregated monthly metrics for ${domain} - optimized for Power BI';

-- Metadata lineage table
CREATE TABLE IF NOT EXISTS METADATA_DB.DOCUMENTATION.COLUMN_LINEAGE_${domain.toUpperCase()} (
  domain VARCHAR,
  source_system VARCHAR,
  source_table VARCHAR,
  source_column VARCHAR,
  bronze_column VARCHAR,
  silver_column VARCHAR,
  gold_table VARCHAR,
  gold_column VARCHAR,
  transformation_rule VARCHAR,
  data_type VARCHAR,
  nullable BOOLEAN,
  business_meaning VARCHAR,
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
)
COMMENT = 'Column-level lineage for ${domain} domain';
    `,
  ];

  return {
    layerName: "Gold",
    ddlStatements,
  };
}

export function generateMetadataTablesDDL(): DDLScript {
  const ddlStatements = [
    `-- Metadata Tables (Shared across all domains)

CREATE SCHEMA IF NOT EXISTS METADATA_DB.DOCUMENTATION;
CREATE SCHEMA IF NOT EXISTS METADATA_DB.GOVERNANCE;

-- Data quality results
CREATE TABLE IF NOT EXISTS METADATA_DB.DOCUMENTATION.DATA_QUALITY_RESULTS (
  check_id VARCHAR PRIMARY KEY,
  domain VARCHAR,
  table_name VARCHAR,
  check_type VARCHAR COMMENT 'unique, not_null, referential_integrity, freshness, anomaly',
  check_name VARCHAR,
  check_status VARCHAR COMMENT 'PASS, FAIL, WARNING',
  rows_checked INT,
  rows_failed INT,
  failure_rate NUMERIC(5,2),
  check_timestamp TIMESTAMP_NTZ,
  details VARIANT
)
COMMENT = 'Data quality test results tracking';

-- Load audit log
CREATE TABLE IF NOT EXISTS METADATA_DB.DOCUMENTATION.LOAD_AUDIT_LOG (
  load_id VARCHAR PRIMARY KEY,
  domain VARCHAR,
  load_type VARCHAR COMMENT 'Extract, Transform, Refresh',
  source_system VARCHAR,
  target_database VARCHAR,
  target_schema VARCHAR,
  target_table VARCHAR,
  record_count_loaded INT,
  record_count_failed INT,
  load_start_time TIMESTAMP_NTZ,
  load_end_time TIMESTAMP_NTZ,
  load_duration_seconds INT,
  status VARCHAR COMMENT 'SUCCESS, FAILURE, PARTIAL',
  error_message VARCHAR,
  run_by VARCHAR
)
COMMENT = 'ETL load audit trail for compliance and troubleshooting';

-- Semantic definitions
CREATE TABLE IF NOT EXISTS METADATA_DB.DOCUMENTATION.SEMANTIC_DEFINITIONS (
  term_name VARCHAR PRIMARY KEY,
  term_definition VARCHAR,
  business_meaning VARCHAR,
  technical_definition VARCHAR,
  source_table VARCHAR,
  source_column VARCHAR,
  related_terms ARRAY,
  owner VARCHAR,
  last_updated TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
)
COMMENT = 'Business glossary and semantic layer definitions';

-- Transformation rules
CREATE TABLE IF NOT EXISTS METADATA_DB.GOVERNANCE.TRANSFORMATION_RULES (
  rule_id VARCHAR PRIMARY KEY,
  domain VARCHAR,
  source_column VARCHAR,
  target_column VARCHAR,
  transformation_sql VARCHAR,
  rule_type VARCHAR COMMENT 'mapping, calculation, validation, masking',
  priority INT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
)
COMMENT = 'Documented transformation business logic for governance';
    `,
  ];

  return {
    layerName: "Metadata",
    ddlStatements,
  };
}

export function exportDDLAsSQL(ddl: DDLScript): string {
  return ddl.ddlStatements.join("\n\n");
}

export function generateCompleteDDL(domain: string): string {
  const bronze = generateBronzeDDL(domain);
  const silver = generateSilverDDL(domain);
  const gold = generateGoldDDL(domain);
  const metadata = generateMetadataTablesDDL();

  return [
    bronze.ddlStatements.join("\n\n"),
    silver.ddlStatements.join("\n\n"),
    gold.ddlStatements.join("\n\n"),
    metadata.ddlStatements.join("\n\n"),
  ].join("\n\n");
}
