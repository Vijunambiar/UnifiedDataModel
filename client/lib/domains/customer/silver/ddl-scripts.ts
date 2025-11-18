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
-- SILVER LAYER: Customer Demography
-- Schema: CORE_CUSTOMERS
-- Source: bronze.customer_master
-- Purpose: Customer demographic attributes with SCD Type 2
-- ============================================================================

USE SCHEMA CORE_CUSTOMERS;

CREATE OR REPLACE SEQUENCE SEQ_DIM_CUSTOMER_DEMOGRAPHY START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_CUSTOMER_DEMOGRAPHY (
	CUSTOMER_DEMOGRAPHY_SK NUMBER(38,0) DEFAULT CORE_CUSTOMERS.SEQ_DIM_CUSTOMER_DEMOGRAPHY.NEXTVAL COMMENT 'System-generated number assigned to the customer record',
	CUSTOMER_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key referencing from surrogate key of customer Attribute',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'Number of CUSTOMERSs.',
	ETHNIC_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Identifies the ethnic heritage of the CUSTOMER',
	ETHNIC_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description of the CUSTOMER Ethnic Code',
	GENDER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Identifies the Gender of CUSTOMER for individual',
	MARITAL_STATUS_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Identifies the CUSTOMER''s marital status',
	MARITAL_STATUS_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description of the CUSTOMER Marital Status Code',
	EDUCATION_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Identifies the level of education associated with the CUSTOMER',
	EDUCATION_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description of the CUSTOMER Education Code',
	INCOME_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Identifies the level of income associated with the CUSTOMER',
	INCOME_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description of the CUSTOMER Income Code',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	EFFECTIVE_START_DATE DATE COMMENT 'Indicates date when record got Active',
	EFFECTIVE_END_DATE DATE COMMENT 'Indicates date when record got Inactive',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicates whether record is ''current'' or ''history''',
	INSERT_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline execution',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline Modified',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is last modified'
) COMMENT='The level of data in this dimension table is at CUSTOMER_NUMBER';
`;

export const customerIdentifierSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer Identifier
-- Schema: CORE_CUSTOMERS
-- Source: bronze.customer_identifiers
-- Purpose: Government IDs with encryption and validation (SCD Type 2)
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_DIM_CUSTOMER_IDENTIFER START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_CUSTOMER_IDENTIFER (
	CUSTOMER_IDENTIFER_SK NUMBER(38,0) DEFAULT CORE_CUSTOMERS.SEQ_DIM_CUSTOMER_IDENTIFER.NEXTVAL COMMENT 'System-generated number assigned to the customer record',
	CUSTOMER_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key referencing from surrogate key of customer Attribute',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'System-generated number for CUSTOMER record',
	DRIVING_LICENSE_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Encrypted Driving License Number',
	TAX_IDENTIFICATION_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Encrypted Tax ID Number',
	TAX_IDENTIFICATION_LAST_4 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Last 4 digits of the Tax ID',
	PASSPORT_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Encrypted Passport Number',
	ALIEN_REGISTRATION VARCHAR(16777216) COMMENT 'Alien registration number',
	AMISH_CUST_NO_ID VARCHAR(16777216) COMMENT 'Amish ID Number',
	CERTIFICATE_OF_REGISTRATION_IVU VARCHAR(16777216) COMMENT 'CERTIFICATE OF REGISTRATION -IVU',
	DISABLED_ELDERLY_NO_ID VARCHAR(16777216) COMMENT 'Disabled or Elderly ID',
	FOREIGN_ENTITY_NO_ID VARCHAR(16777216) COMMENT 'Foreign entity Id',
	GOVERNMENT_AGENCY_NO_ID VARCHAR(16777216) COMMENT 'Government Agency Id',
	INCORPORATION_REGISTER VARCHAR(16777216) COMMENT 'Icorporation Id',
	LICENSE VARCHAR(16777216) COMMENT 'License',
	MILITARY_ID VARCHAR(16777216) COMMENT 'Military Id',
	MINOR VARCHAR(16777216) COMMENT 'MINOR Id',
	OTHER_IDENTIFICATION VARCHAR(16777216) COMMENT 'Other Identification id',
	STATE_ID VARCHAR(16777216) COMMENT 'State Id',
	VI_BUS_LICENSE VARCHAR(16777216) COMMENT 'VI Bus License Id',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	EFFECTIVE_START_DATE DATE COMMENT 'Indicates date when record got Active',
	EFFECTIVE_END_DATE DATE COMMENT 'Indicates date when record got Inactive',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicates whether record is ''current'' or ''history''',
	INSERT_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline execution',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline Modified',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is last modified'
) COMMENT='The level of data in this dimension table is at CUSTOMER_NUMBER';
`;

export const customerNameSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer Name
-- Schema: CORE_CUSTOMERS
-- Source: bronze.customer_names_addresses
-- Purpose: Customer name attributes with SCD Type 2
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_CUSTOMER_NAME START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_CUSTOMER_NAME (
	CUSTOMER_SK NUMBER(38,0) DEFAULT CORE_CUSTOMERS.SEQ_CUSTOMER_NAME.NEXTVAL COMMENT 'Surrogate key',
	CUSTOMER_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key referencing from surrogate key of customer Attribute',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'System-generated number to the CUSTOMER record',
	FIRST_NAME VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s first name.',
	LAST_NAME VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s last name.',
	MIDDLE_NAME_1 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s middle name or.',
	MIDDLE_NAME_2 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s middle name or initial.',
	CUSTOMER_NAME VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s middle name or initial.',
	CUSTOMER_TYPE_CODE VARCHAR(16777216) COMMENT 'Identifies the type of CUSTOMER - Individual / Business',
	CUSTOMER_TYPE_DESC VARCHAR(16777216) COMMENT 'Identifies the type of CUSTOMER - Individual / Business',
	EFFECTIVE_START_DATE DATE COMMENT 'Indicates date when record got Active',
	EFFECTIVE_END_DATE DATE COMMENT 'Indicates date when record got Inactive',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicates whether record is ''current'' or ''history''',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	INSERT_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline execution',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline Modified',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is last modified'
) COMMENT='The level of data in this dimension table is at CUSTOMER_NUMBER';
`;

export const customerAddressSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer Address
-- Schema: CORE_CUSTOMERS
-- Source: bronze.customer_names_addresses
-- Purpose: Customer address with USPS standardization and SCD Type 2
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_CUSTOMER_ADDRESS START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_CUSTOMER_ADDRESS (
	CUSTOMER_ADDRESS_SK NUMBER(38,0) DEFAULT CORE_CUSTOMERS.SEQ_CUSTOMER_ADDRESS.NEXTVAL COMMENT 'System generated SK',
	CUSTOMER_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key referencing from surrogate key of customer Attribute',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'A unique identifier assigned to each customer',
	BANK_NUMBER NUMBER(38,0) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Unique Key for each Bank record',
	ADDRESS_LINE_1 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Physical address of the CUSTOMER : Line 1 : House number',
	ADDRESS_LINE_2 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Physical address of the CUSTOMER : Line 2: Street name /no',
	CITY VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'City of residence of the CUSTOMER',
	STATE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'State of residence of the CUSTOMER',
	ZIP_CODE_1 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'ZIP code fo the CUSTOMER address',
	ZIP_CODE_2 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'ZIP code fo the CUSTOMER address',
	COUNTRY_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Identifies the country associated with the address',
	COUNTRY_NAME VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Name of the country associated with the address',
	ADDRESS_TYPE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Address type : Home /Communication etc.',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	EFFECTIVE_START_DATE DATE COMMENT 'Indicates date when record got Active',
	EFFECTIVE_END_DATE DATE COMMENT 'Indicates date when record got Inactive',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicates whether record is ''current'' or ''history''',
	INSERT_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline execution',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline Modified',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is last modified'
) COMMENT='The level of data in this dimension table is at CUSTOMER_NUMBER';
`;

export const customerContactSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer Contact
-- Schema: CORE_CUSTOMERS
-- Source: bronze.customer_names_addresses
-- Purpose: Customer contact phone numbers with SCD Type 2
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_CUSTOMER_CONTACT START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_CUSTOMER_CONTACT (
	CUSTOMER_CONTACT_SK NUMBER(38,0) DEFAULT CORE_CUSTOMERS.SEQ_CUSTOMER_CONTACT.NEXTVAL COMMENT 'Primary key for CUSTOMER contact',
	CUSTOMER_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key referencing from surrogate key of customer Attribute',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'A unique identifier assigned to each customer',
	BANK_NUMBER NUMBER(38,0) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Identifies the financial institution',
	PRIMARY_PHONE_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s primary phone number',
	SECONDARY_PHONE_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s secondary phone number',
	FAX_PHONE_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s fax number',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	EFFECTIVE_START_DATE DATE COMMENT 'Indicates date when record got Active',
	EFFECTIVE_END_DATE DATE COMMENT 'Indicates date when record got Inactive',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicates whether record is Active or Inactive',
	INSERT_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline execution',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline Modified',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is last modified'
) COMMENT='The level of data in this dimension table is at CUSTOMER_NUMBER';
`;

export const customerEmailSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer Email
-- Schema: CORE_CUSTOMERS
-- Source: bronze.customer_email
-- Purpose: Customer email addresses with validation and SCD Type 2
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_CUSTOMER_EMAIL START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_CUSTOMER_EMAIL (
	CUSTOMER_EMAIL_SK NUMBER(38,0) DEFAULT CORE_CUSTOMERS.SEQ_CUSTOMER_EMAIL.NEXTVAL COMMENT 'Primary key for customer contact',
	CUSTOMER_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key referencing from surrogate key of customer Attribute',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'A unique identifier assigned to each customer',
	EMAIL_TYPE_CD VARCHAR(16777216) COMMENT 'Home, primary etc.',
	EMAIL_ADDRESS VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'E-mail address of the customer',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	EFFECTIVE_START_DATE DATE COMMENT 'Indicates date when record got Active',
	EFFECTIVE_END_DATE DATE COMMENT 'Indicates date when record got Inactive',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicates whether record is current or history',
	INSERT_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline execution',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline Modified',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is last modified'
) COMMENT='The level of data in this dimension table is at CUSTOMER_NUMBER X EMAIL_TYPE_CD';
`;

export const customerAttributeSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer Attribute
-- Schema: CORE_CUSTOMERS
-- Source: bronze.customer_master
-- Purpose: Customer attributes, classifications, and business data with SCD Type 2
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_CUSTOMER_ATTRIBUTE START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_CUSTOMER_ATTRIBUTE (
	CUSTOMER_SK NUMBER(38,0) DEFAULT CORE_CUSTOMERS.SEQ_CUSTOMER_ATTRIBUTE.NEXTVAL COMMENT 'Surrogate key',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'System-generated number to the CUSTOMER record',
	BIRTH_DATE DATE WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Date the CUSTOMER was born',
	PRMY_CUST_AGE NUMBER(4,0) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Primary Customer Age',
	BUSINESS_INCEPTION_DATE DATE WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Date the CUSTOMER went into business',
	BUSINESS_TYPE_CODE VARCHAR(16777216) COMMENT 'Identifies the CUSTOMER''s type of business',
	BUSINESS_TYPE_DESC VARCHAR(16777216) COMMENT 'Description of the CUSTOMER Business Type Code',
	PREFFERED_LANGUAGE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Prefferred language of the customer',
	COST_CENTER VARCHAR(16777216) COMMENT 'Cost_center',
	PRMY_CUST_OCCUPATION_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Primary Customer Occupation Code',
	PROFESSION VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Profession of the customer',
	PRMY_CUST_TAX_ID_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Primary Customer Tax Identification Number',
	PRMY_CUST_PRIMARY_OFFICER_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Primary Officer Number',
	PRMY_CUST_PRIMARY_OFFICER_NAME VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Primary Officer Name',
	PRMY_CUST_SECONDARY_OFFICER_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Secondary Officer Number',
	PRMY_CUST_SECONDARY_OFFICER_NAME VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Secondary Officer Name',
	PRMY_CUST_GENDER_CODE VARCHAR(10) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Primary Customer Gender Code',
	EMPLOYER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'EMPLOYER of the CUSTOMER',
	OPEN_DATE DATE COMMENT 'Date the CUSTOMER record was created on the CUSTOMER Information System.',
	CLOSE_DATE DATE COMMENT 'Date the CUSTOMER record on the CUSTOMER Information System was closed.',
	DECEASED_DATE DATE WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Date the CUSTOMER died',
	SINCE_DATE DATE COMMENT 'Date the CUSTOMER began a relationship with the organization.',
	PRMY_CUST_INCOME_CODE VARCHAR(50) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Primary Customer Income Code',
	PRMY_CUST_INCOME_CODE_DESC VARCHAR(256) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Description of the Income Code',
	STATUS_CODE VARCHAR(16777216) COMMENT 'Identifies the status of the CUSTOMER record',
	CURRENT_CREDIT_SCORE NUMBER(38,0) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'CUSTOMER''s current credit score',
	CUST_CODE1 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 1',
	CUST_CODE2 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 2',
	CUST_CODE3 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 3',
	CUST_CODE4 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 4',
	CUST_CODE5 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 5',
	CUST_CODE6 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 6',
	CUST_CODE7 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 7',
	CUST_CODE8 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 8',
	CUST_CODE9 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 9',
	CUST_CODE10 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Customer classification code level 10',
	CUST_CODE11 VARCHAR(16777216) COMMENT 'Customer classification code level 11',
	CUST_CODE12 VARCHAR(16777216) COMMENT 'Customer classification code level 12',
	CUST_CODE13 VARCHAR(16777216) COMMENT 'Customer classification code level 13',
	CUST_CODE14 VARCHAR(16777216) COMMENT 'Customer classification code level 14',
	CUST_CODE15 VARCHAR(16777216) COMMENT 'Customer classification code level 15',
	CUST_CODE16 VARCHAR(16777216) COMMENT 'Customer classification code level 16',
	CUST_CODE17 VARCHAR(16777216) COMMENT 'Customer classification code level 17',
	CUST_CODE18 VARCHAR(16777216) COMMENT 'Customer classification code level 18',
	CUST_CODE19 VARCHAR(16777216) COMMENT 'Customer classification code level 19',
	CUST_CODE20 VARCHAR(16777216) COMMENT 'Customer classification code level 20',
	CUST_CODE1_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 1',
	CUST_CODE2_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 2',
	CUST_CODE3_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 3',
	CUST_CODE4_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 4',
	CUST_CODE5_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 5',
	CUST_CODE6_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 6',
	CUST_CODE7_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 7',
	CUST_CODE8_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 8',
	CUST_CODE9_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 9',
	CUST_CODE10_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description for customer code level 10',
	CUST_CODE11_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 11',
	CUST_CODE12_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 12',
	CUST_CODE13_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 13',
	CUST_CODE14_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 14',
	CUST_CODE15_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 15',
	CUST_CODE16_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 16',
	CUST_CODE17_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 17',
	CUST_CODE18_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 18',
	CUST_CODE19_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 19',
	CUST_CODE20_DESC VARCHAR(16777216) COMMENT 'Description for customer code level 20',
	CUST_CODE_CONCAT VARCHAR(16777216) COMMENT 'Concatenation of all customer codes',
	FOREIGN_IND VARCHAR(16777216) COMMENT 'Indicator flagging whether the customer is foreign (Y/N)',
	EFFECTIVE_START_DATE DATE COMMENT 'Indicates date when record got Active',
	EFFECTIVE_END_DATE DATE COMMENT 'Indicates date when record got Inactive',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicates whether record is ''current'' or ''history''',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	INSERT_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline execution',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline Modified',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is last modified'
) COMMENT='The level of data in this dimension table is at CUSTOMER_NUMBER';
`;

export const customerToAccountRelationshipSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Customer to Account Relationship Bridge
-- Schema: CORE_CUSTOMERS
-- Source: bronze.customer_account_relationships
-- Purpose: Bridge table linking customers to accounts with relationship types
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_BRG_CUST_TO_ACCT_RELATIONSHIP START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE BRG_CUST_TO_ACCT_RELATIONSHIP (
	CUSTOMER_ACCOUNT_SK NUMBER(38,0) DEFAULT CORE_CUSTOMERS.SEQ_BRG_CUST_TO_ACCT_RELATIONSHIP.NEXTVAL COMMENT 'System-generated number assigned to the customer record',
	CUSTOMER_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key referencing from surrogate key of customer Attribute',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key referencing from surrogate key of dim account',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'A unique identifier assigned to each customer.',
	ACCOUNT_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'A unique identifier assigned to each customers account.',
	RELATED_TYPE_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Indicates whether the CUSTOMER is the first (primary) person listed on the product or service',
	RELATED_TYPE_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description of Cust Acct Rltship Role Code, as defined on Relationship Codes',
	RELATED_ROLE_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Identifies the CUSTOMER relationship to an account',
	RELATED_ROLE_DESC VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Description of Cust Acct Rltship Role Code, as defined on Relationship Codes',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	EFFECTIVE_START_DATE DATE COMMENT 'Indicates date when record got Active',
	EFFECTIVE_END_DATE DATE COMMENT 'Indicates date when record got Inactive',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicates whether record is ''current'' or ''history''',
	INSERT_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline execution',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User ID used for the pipeline Modified',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Datetime when record is last modified'
) COMMENT='The level of data in this dimension table is at CUSTOMER_NUMBER X ACCOUNT_NUMBER';
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
      estimatedRows: "5.5M",
      grain: "CUSTOMER_NUMBER"
    },
    {
      name: "DIM_CUSTOMER_IDENTIFER",
      ddl: customerIdentifierSilverDDL,
      scdType: "Type 2",
      estimatedRows: "8M",
      grain: "CUSTOMER_NUMBER"
    },
    {
      name: "DIM_CUSTOMER_NAME",
      ddl: customerNameSilverDDL,
      scdType: "Type 2",
      estimatedRows: "5.5M",
      grain: "CUSTOMER_NUMBER"
    },
    {
      name: "DIM_CUSTOMER_ADDRESS",
      ddl: customerAddressSilverDDL,
      scdType: "Type 2",
      estimatedRows: "6M",
      grain: "CUSTOMER_NUMBER"
    },
    {
      name: "DIM_CUSTOMER_CONTACT",
      ddl: customerContactSilverDDL,
      scdType: "Type 2",
      estimatedRows: "5.5M",
      grain: "CUSTOMER_NUMBER"
    },
    {
      name: "DIM_CUSTOMER_EMAIL",
      ddl: customerEmailSilverDDL,
      scdType: "Type 2",
      estimatedRows: "7M",
      grain: "CUSTOMER_NUMBER X EMAIL_TYPE_CD"
    },
    {
      name: "DIM_CUSTOMER_ATTRIBUTE",
      ddl: customerAttributeSilverDDL,
      scdType: "Type 2",
      estimatedRows: "5.5M",
      grain: "CUSTOMER_NUMBER"
    },
    {
      name: "BRG_CUST_TO_ACCT_RELATIONSHIP",
      ddl: customerToAccountRelationshipSilverDDL,
      scdType: "Type 2",
      estimatedRows: "12M",
      grain: "CUSTOMER_NUMBER X ACCOUNT_NUMBER"
    }
  ]
};

export default customerSilverDDLCatalog;
