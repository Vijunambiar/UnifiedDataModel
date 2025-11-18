/**
 * CUSTOMER DOMAIN - SILVER LAYER COMPREHENSIVE DDL
 * 
 * Purpose: Cleansed, conformed, and deduplicated customer data
 * Source: Bronze Layer (FIS raw tables)
 * Layer: Silver (Conformed)
 * Grain: One current row per customer, with SCD2 history
 * Refresh: Daily
 * 
 * Transformations Applied:
 * - PII encryption (SSN, names, contact info)
 * - Name standardization (proper case, accent removal, trimming)
 * - Address standardization (USPS validation, ZIP+4)
 * - Phone/Email validation and verification
 * - Deduplication using matching rules
 * - Survivorship rule application
 * - Data type conversion and validation
 * - Null value handling and defaults
 * - Referential integrity enforcement
 */

export interface SilverColumnDefinition {
  name: string;
  dataType: string;
  nullable: boolean;
  businessMeaning: string;
  sourceMapping: {
    bronzeTable: string;
    bronzeColumn: string;
    transformation?: string;
  };
  piiClassification?: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  encryptionMethod?: "AES_256" | "TOKENIZATION" | "HASHING" | "NONE";
  validation?: {
    dataType?: string;
    pattern?: string;
    allowedValues?: string[];
    minValue?: number;
    maxValue?: number;
  };
}

export interface SilverTableDefinition {
  name: string;
  schema: string;
  description: string;
  businessKey: string;
  surrogatePrimaryKey: string;
  sourceTables: string[];
  scdType: "Type 1" | "Type 2";
  grain: string;
  partitionBy?: string[];
  clusterBy?: string[];
  columns: SilverColumnDefinition[];
  deduplicationLogic?: {
    matchingKeys: string[];
    survivorshipRules: Array<{
      attribute: string;
      rule: string;
      sourcePriority?: string[];
    }>;
    confidenceScoreCalculation?: string;
  };
  dataQualityRules?: Array<{
    ruleName: string;
    ruleDescription: string;
    severity: "ERROR" | "WARNING" | "INFO";
    expression: string;
  }>;
}

// ============================================================================
// TABLE 1: CUSTOMER MASTER GOLDEN RECORD
// ============================================================================

export const customerMasterSilver: SilverTableDefinition = {
  name: "CORE_CUSTOMERS.DIM_CUSTOMER_ATTRIBUTE",
  schema: "CORE_CUSTOMERS",
  description: "Golden customer record with deduplication, standardization, and SCD Type 2 history",
  businessKey: "customer_id",
  surrogatePrimaryKey: "customer_sk",
  sourceTables: [
    "bronze.customer_master",
    "bronze.customer_names_addresses",
    "bronze.customer_identifiers",
  ],
  scdType: "Type 2",
  grain: "One row per unique customer per effective date",
  partitionBy: ["effective_date"],
  clusterBy: ["customer_id", "is_current"],
  
  deduplicationLogic: {
    matchingKeys: ["ssn_hash", "full_name_cleansed", "date_of_birth", "address_line1_std"],
    survivorshipRules: [
      {
        attribute: "full_name_cleansed",
        rule: "Most recent non-null from highest priority source",
        sourcePriority: ["FIS_CORE", "CUSTOMER_PROFILE", "THIRD_PARTY"],
      },
      {
        attribute: "email_primary",
        rule: "Most recently verified email address",
      },
      {
        attribute: "phone_mobile",
        rule: "Most recently verified mobile number",
      },
      {
        attribute: "address_line1_std",
        rule: "Most recent USPS-verified address",
      },
      {
        attribute: "date_of_birth",
        rule: "Most recent non-null value",
      },
    ],
    confidenceScoreCalculation: "Based on match quality, data freshness, and source reliability",
  },

  dataQualityRules: [
    {
      ruleName: "Null Check - Customer ID",
      ruleDescription: "Customer ID must not be null",
      severity: "ERROR",
      expression: "customer_id IS NOT NULL",
    },
    {
      ruleName: "Uniqueness - Customer ID",
      ruleDescription: "Customer ID must be unique per effective date",
      severity: "ERROR",
      expression: "COUNT(DISTINCT customer_id) = COUNT(*) WHERE is_current = TRUE",
    },
    {
      ruleName: "Date Validation - Birth Date",
      ruleDescription: "Birth date must be before today and after 1900-01-01",
      severity: "WARNING",
      expression: "date_of_birth < CURRENT_DATE() AND date_of_birth >= '1900-01-01'",
    },
    {
      ruleName: "Date Validation - Customer Since Date",
      ruleDescription: "Customer since date must be <= today",
      severity: "ERROR",
      expression: "customer_since_date <= CURRENT_DATE()",
    },
    {
      ruleName: "Email Format Validation",
      ruleDescription: "Email must match valid email pattern if populated",
      severity: "WARNING",
      expression: "email_primary IS NULL OR email_primary REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'",
    },
    {
      ruleName: "Phone Format Validation",
      ruleDescription: "Phone must be in E.164 format if populated",
      severity: "WARNING",
      expression: "phone_mobile IS NULL OR phone_mobile REGEXP '^\\+[1-9]\\d{1,14}$'",
    },
    {
      ruleName: "Status Code Validation",
      ruleDescription: "Customer status must be one of allowed values",
      severity: "ERROR",
      expression: "customer_status IN ('ACTIVE', 'INACTIVE', 'CLOSED', 'DECEASED')",
    },
  ],

  columns: [
    // ========== SURROGATE KEY ==========
    {
      name: "customer_sk",
      dataType: "BIGINT",
      nullable: false,
      businessMeaning: "Surrogate key for dimension table joins",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Auto-generated sequence",
      },
    },

    // ========== NATURAL KEYS ==========
    {
      name: "customer_id",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Unique customer identifier from core banking system",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "CUSTOMER_ID",
        transformation: "1:1 mapping, trim whitespace",
      },
    },

    {
      name: "customer_uuid",
      dataType: "STRING",
      nullable: true,
      businessMeaning: "Global unique identifier (UUID v4) for distributed systems",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Generated using UUID_STRING() function",
      },
    },

    {
      name: "ssn_hash",
      dataType: "STRING",
      nullable: true,
      businessMeaning: "SHA-256 hash of SSN/EIN for matching without exposing PII",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "TAX_ID",
        transformation: "SHA256(TAX_ID) - cannot be reversed",
      },
      piiClassification: "HIGH",
      encryptionMethod: "HASHING",
    },

    // ========== IDENTITY & DEMOGRAPHICS ==========
    {
      name: "first_name_cleansed",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "First name standardized to proper case",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "FIRST_NAME",
        transformation: "INITCAP(TRIM()), remove accents via UNACCENT()",
      },
      piiClassification: "HIGH",
      encryptionMethod: "AES_256",
    },

    {
      name: "middle_name_cleansed",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Middle name standardized to proper case",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "MIDDLE_NAME_1",
        transformation: "INITCAP(TRIM()), remove accents",
      },
      piiClassification: "HIGH",
      encryptionMethod: "AES_256",
    },

    {
      name: "last_name_cleansed",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Last name standardized to proper case",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "LAST_NAME",
        transformation: "INITCAP(TRIM()), remove accents",
      },
      piiClassification: "HIGH",
      encryptionMethod: "AES_256",
    },

    {
      name: "full_name_cleansed",
      dataType: "VARCHAR(200)",
      nullable: false,
      businessMeaning: "Complete legal name in standardized format",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "CUSTOMER_NAME",
        transformation: "CONCAT_WS(' ', first_name_cleansed, middle_name_cleansed, last_name_cleansed)",
      },
      piiClassification: "HIGH",
      encryptionMethod: "AES_256",
    },

    {
      name: "preferred_name",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Nickname or preferred name for communication",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "CUSTOMER_NAME",
        transformation: "Extracted from customer profile if different from legal name",
      },
      piiClassification: "MEDIUM",
      encryptionMethod: "TOKENIZATION",
    },

    {
      name: "date_of_birth",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Birth date for age calculations and validation",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "BIRTH_DATE",
        transformation: "1:1 mapping, validate format YYYY-MM-DD",
      },
      piiClassification: "HIGH",
      encryptionMethod: "AES_256",
      validation: {
        dataType: "DATE",
        minValue: -36525,
        maxValue: -7300,
      },
    },

    {
      name: "age_years",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Current age in years calculated from DOB",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "DATEDIFF(year, date_of_birth, CURRENT_DATE())",
      },
    },

    {
      name: "age_group",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Age segmentation: 18-25, 26-35, 36-45, 46-55, 56-65, 66+",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CASE WHEN age_years < 26 THEN '18-25' WHEN age_years < 36 THEN '26-35' ...",
      },
    },

    {
      name: "gender",
      dataType: "VARCHAR(5)",
      nullable: true,
      businessMeaning: "Gender identity: M, F, X (Other), U (Unknown)",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "GENDER_CODE",
        transformation: "Map to standard values: M/F/X/U",
      },
      validation: {
        allowedValues: ["M", "F", "X", "U"],
      },
    },

    {
      name: "marital_status",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Marital status: Single, Married, Divorced, Widowed",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "MARITAL_STATUS_DESC",
        transformation: "Standardize to consistent values",
      },
    },

    // ========== CONTACT INFORMATION ==========
    {
      name: "email_primary",
      dataType: "VARCHAR(255)",
      nullable: true,
      businessMeaning: "Primary email address (verified)",
      sourceMapping: {
        bronzeTable: "bronze.customer_email",
        bronzeColumn: "EMAIL_ADDRESS",
        transformation: "LOWER(TRIM()), validate format, select primary email",
      },
      piiClassification: "HIGH",
      encryptionMethod: "TOKENIZATION",
      validation: {
        pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$",
      },
    },

    {
      name: "email_primary_verified",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Flag indicating if primary email has been verified",
      sourceMapping: {
        bronzeTable: "bronze.customer_email",
        bronzeColumn: "EMAIL_TYPE_CODE",
        transformation: "TRUE if marked as verified in source",
      },
    },

    {
      name: "email_primary_verification_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date when primary email was last verified",
      sourceMapping: {
        bronzeTable: "bronze.customer_email",
        bronzeColumn: "N/A",
        transformation: "Tracked from email verification system",
      },
    },

    {
      name: "phone_mobile",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Mobile phone number in E.164 format (+1-XXX-XXX-XXXX)",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "PRIMARY_PHONE_NUMBER",
        transformation: "Convert to E.164 format, remove non-digits, validate",
      },
      piiClassification: "HIGH",
      encryptionMethod: "TOKENIZATION",
      validation: {
        pattern: "^\\+[1-9]\\d{1,14}$",
      },
    },

    {
      name: "phone_mobile_verified",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Flag indicating if mobile phone has been verified",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "PRIMARY_PHONE_NUMBER",
        transformation: "TRUE if passed SMS verification",
      },
    },

    {
      name: "phone_mobile_verification_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date when mobile phone was last verified",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Tracked from phone verification system",
      },
    },

    {
      name: "phone_home",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Home phone number (optional)",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "SECONDARY_PHONE_NUMBER",
        transformation: "Convert to E.164 format if present",
      },
      piiClassification: "MEDIUM",
      encryptionMethod: "TOKENIZATION",
    },

    // ========== ADDRESS INFORMATION ==========
    {
      name: "address_line1_std",
      dataType: "VARCHAR(150)",
      nullable: true,
      businessMeaning: "Primary street address (USPS standardized)",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "ADDRESS_LINE_1",
        transformation: "USPS address normalization, capitalize, remove extra spaces",
      },
      piiClassification: "MEDIUM",
      encryptionMethod: "TOKENIZATION",
    },

    {
      name: "address_line2_std",
      dataType: "VARCHAR(150)",
      nullable: true,
      businessMeaning: "Secondary address information (apt, suite, etc.)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Extract unit/suite numbers from address line 1",
      },
      piiClassification: "MEDIUM",
      encryptionMethod: "TOKENIZATION",
    },

    {
      name: "city_std",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "City (USPS standardized)",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "CITY",
        transformation: "USPS city normalization, proper case",
      },
      piiClassification: "LOW",
      encryptionMethod: "NONE",
    },

    {
      name: "county",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "County name derived from ZIP code",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Lookup via ZIP code to county mapping table",
      },
    },

    {
      name: "state_code",
      dataType: "VARCHAR(5)",
      nullable: true,
      businessMeaning: "State code (2-character USPS code)",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "STATE_CODE",
        transformation: "Uppercase 2-char code (e.g., CA, NY)",
      },
      validation: {
        pattern: "^[A-Z]{2}$",
      },
    },

    {
      name: "postal_code_std",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "ZIP code in ZIP+4 format (ZZZZZ-ZZZZ)",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "ZIP_CODE_1",
        transformation: "Combine ZIP_CODE_1 and ZIP_CODE_2 with hyphen",
      },
      validation: {
        pattern: "^\\d{5}(-\\d{4})?$",
      },
    },

    {
      name: "country_code",
      dataType: "VARCHAR(5)",
      nullable: true,
      businessMeaning: "Country code (ISO 3166-1 alpha-2)",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "COUNTRY_CODE",
        transformation: "Map to ISO 3166-1 alpha-2 format",
      },
      validation: {
        pattern: "^[A-Z]{2}$",
      },
    },

    {
      name: "address_verified",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Flag indicating if address has been USPS verified",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Result of USPS address validation service",
      },
    },

    {
      name: "address_verification_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date when address was last USPS verified",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Tracked from address verification system",
      },
    },

    // ========== IDENTIFICATION ==========
    {
      name: "primary_id_type",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Type of primary identification (DRIVER_LICENSE, PASSPORT, STATE_ID)",
      sourceMapping: {
        bronzeTable: "bronze.customer_identifiers",
        bronzeColumn: "IDENTIFICATION_TYPE",
        transformation: "Standardize ID type descriptions",
      },
    },

    {
      name: "primary_id_number_tokenized",
      dataType: "STRING",
      nullable: true,
      businessMeaning: "Tokenized primary identification number",
      sourceMapping: {
        bronzeTable: "bronze.customer_identifiers",
        bronzeColumn: "IDENTIFICATION_NUMBER",
        transformation: "Replace with token via tokenization service",
      },
      piiClassification: "HIGH",
      encryptionMethod: "TOKENIZATION",
    },

    {
      name: "primary_id_expiration_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Expiration date of primary identification",
      sourceMapping: {
        bronzeTable: "bronze.customer_identifiers",
        bronzeColumn: "ID_EXPIRATION_DATE",
        transformation: "1:1 mapping, validate format",
      },
    },

    // ========== BUSINESS/EMPLOYMENT ==========
    {
      name: "customer_type",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Individual, Corporation, Partnership, Trust, etc.",
      sourceMapping: {
        bronzeTable: "bronze.customer_names_addresses",
        bronzeColumn: "CUSTOMER_TYPE_CODE",
        transformation: "Map to standardized customer type",
      },
    },

    {
      name: "occupation_code",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Occupation/Industry code",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "OCCUPATION_CODE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "occupation_description",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Description of occupation/industry",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "OCCUPATION_DESC",
        transformation: "1:1 mapping, trim whitespace",
      },
    },

    {
      name: "employer_name",
      dataType: "VARCHAR(150)",
      nullable: true,
      businessMeaning: "Employer or school name",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "EMPLOYER_NAME",
        transformation: "Standardize capitalization, trim",
      },
      piiClassification: "LOW",
    },

    {
      name: "business_inception_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date business was established (for corporate customers)",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "BUSINESS_INCEPTION_DATE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "business_type",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Type of business",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "BUSINESS_TYPE_DESC",
        transformation: "1:1 mapping, capitalize",
      },
    },

    // ========== RELATIONSHIP MANAGEMENT ==========
    {
      name: "primary_relationship_officer_id",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Primary relationship manager employee ID",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "PRIMARY_OFFICER_NUMBER",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "primary_relationship_officer_name",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Primary relationship manager name",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "PRIMARY_OFFICER_NAME",
        transformation: "INITCAP(TRIM())",
      },
    },

    {
      name: "cost_center_number",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Cost center for P&L attribution",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "COST_CENTER_NUMBER",
        transformation: "1:1 mapping",
      },
    },

    // ========== STATUS & TENURE ==========
    {
      name: "customer_status",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Current status: ACTIVE, INACTIVE, CLOSED, DECEASED",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "CUSTOMER_STATUS_CODE",
        transformation: "Map code to status description",
      },
      validation: {
        allowedValues: ["ACTIVE", "INACTIVE", "CLOSED", "DECEASED"],
      },
    },

    {
      name: "customer_since_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Customer tenure start date",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "CUSTOMER_SINCE_DATE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "customer_open_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date customer opened with bank",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "CUSTOMER_OPEN_DATE",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "customer_close_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date customer closed account",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "CUSTOMER_CLOSED_DATE",
        transformation: "1:1 mapping (only populated if closed)",
      },
    },

    {
      name: "customer_tenure_days",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Number of days customer has been with bank",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "DATEDIFF(day, customer_since_date, COALESCE(customer_close_date, CURRENT_DATE()))",
      },
    },

    // ========== DEMOGRAPHICS & ATTRIBUTES ==========
    {
      name: "education_level",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Education level: High School, Bachelor's, Master's, etc.",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "EDUCATION_DESC",
        transformation: "Standardize descriptions",
      },
    },

    {
      name: "income_range",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Income bracket: 0-50K, 50K-100K, 100K-250K, 250K+",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "INCOME_DESC",
        transformation: "Standardize income ranges",
      },
    },

    {
      name: "ethnicity",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Ethnicity/Race for regulatory reporting",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "ETHNIC_DESC",
        transformation: "1:1 mapping",
      },
    },

    {
      name: "language_preference",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Preferred language for communications",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "LANGUAGE_PREFERENCE",
        transformation: "Standard language codes (EN, ES, etc.)",
      },
    },

    // ========== SCD TYPE 2 TRACKING ==========
    {
      name: "effective_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date this record version became effective",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "LAST_MODIFIED_DATE",
        transformation: "Set to source last modified date on first insert, updated on change",
      },
    },

    {
      name: "expiration_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date this record version expired (9999-12-31 for current)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Set to 9999-12-31 for current records, updated to yesterday when superseded",
      },
    },

    {
      name: "is_current",
      dataType: "BOOLEAN",
      nullable: false,
      businessMeaning: "Flag indicating if this is the current version",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "TRUE if expiration_date = 9999-12-31, FALSE otherwise",
      },
    },

    {
      name: "changed_attributes",
      dataType: "STRING",
      nullable: true,
      businessMeaning: "Comma-separated list of attributes that changed",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Captured by comparing with previous version",
      },
    },

    {
      name: "source_system_row_hash",
      dataType: "STRING",
      nullable: true,
      businessMeaning: "MD5 hash of source row for change detection",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "N/A",
        transformation: "MD5(CONCAT_WS('|', customer_id, full_name, date_of_birth, ...))",
      },
    },

    // ========== DATA QUALITY & LINEAGE ==========
    {
      name: "data_quality_score",
      dataType: "DECIMAL(5, 2)",
      nullable: true,
      businessMeaning: "Data quality score (0-100) based on completeness and validity",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Calculated as: (non_null_fields / total_fields) * completeness_weight + validity_checks * validity_weight",
      },
    },

    {
      name: "data_quality_issues",
      dataType: "STRING",
      nullable: true,
      businessMeaning: "Concatenated list of data quality issues found",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Captured during quality check stage",
      },
    },

    {
      name: "source_record_count",
      dataType: "INTEGER",
      nullable: true,
      businessMeaning: "Number of source records merged into this golden record",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "COUNT(*) of matched records during deduplication",
      },
    },

    {
      name: "deduplication_confidence_score",
      dataType: "DECIMAL(5, 2)",
      nullable: true,
      businessMeaning: "Confidence score of deduplication match (0-100)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Based on matching algorithm and data quality",
      },
    },

    // ========== AUDIT & LINEAGE ==========
    {
      name: "created_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Timestamp when record was created in silver layer",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP() on insert",
      },
    },

    {
      name: "updated_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Timestamp when record was last updated",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP() on update",
      },
    },

    {
      name: "source_system",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Source system name (FIS, SALESFORCE_CRM, etc.)",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "N/A",
        transformation: "'FIS' as primary source",
      },
    },

    {
      name: "load_id",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "ETL batch load ID for traceability",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Passed from ETL orchestration framework",
      },
    },
  ],
};

// ============================================================================
// TABLE 2: CUSTOMER RELATIONSHIPS
// ============================================================================

export const customerRelationshipSilver: SilverTableDefinition = {
  name: "CORE_CUSTOMERS.BRG_CUST_TO_ACCT_RELATIONSHIP",
  schema: "CORE_CUSTOMERS",
  description: "Customer-to-Customer and Customer-to-Account relationships with SCD Type 2",
  businessKey: "customer_id",
  surrogatePrimaryKey: "relationship_sk",
  sourceTables: [
    "bronze.customer_account_relationships",
    "bronze.customer_master",
  ],
  scdType: "Type 2",
  grain: "One row per relationship per effective date",
  partitionBy: ["effective_date"],
  clusterBy: ["customer_id", "related_customer_id"],

  columns: [
    {
      name: "relationship_sk",
      dataType: "BIGINT",
      nullable: false,
      businessMeaning: "Surrogate key for relationship",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Auto-generated sequence",
      },
    },
    {
      name: "customer_id",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Primary customer ID",
      sourceMapping: {
        bronzeTable: "bronze.customer_master",
        bronzeColumn: "CUSTOMER_ID",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "related_customer_id",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Related customer ID (for multi-party relationships)",
      sourceMapping: {
        bronzeTable: "bronze.customer_account_relationships",
        bronzeColumn: "CUSTOMER_ID",
        transformation: "1:1 mapping when multi-party",
      },
    },
    {
      name: "account_id",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Account ID in the relationship",
      sourceMapping: {
        bronzeTable: "bronze.customer_account_relationships",
        bronzeColumn: "ACCOUNT_ID",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "relationship_type",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Type of relationship: OWNER, JOINT_OWNER, AUTHORIZED_USER, BENEFICIARY",
      sourceMapping: {
        bronzeTable: "bronze.customer_account_relationships",
        bronzeColumn: "RELATIONSHIP_TYPE_DESC",
        transformation: "Standardize relationship type codes",
      },
    },
    {
      name: "relationship_role",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Role within relationship: PRIMARY, SECONDARY, AUTHORIZED",
      sourceMapping: {
        bronzeTable: "bronze.customer_account_relationships",
        bronzeColumn: "RELATIONSHIP_ROLE_DESC",
        transformation: "Standardize role descriptions",
      },
    },
    {
      name: "relationship_start_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date relationship began",
      sourceMapping: {
        bronzeTable: "bronze.customer_account_relationships",
        bronzeColumn: "EFFECTIVE_DATE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "relationship_end_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date relationship ended (NULL if current)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Populated when relationship is terminated",
      },
    },
    {
      name: "is_active_relationship",
      dataType: "BOOLEAN",
      nullable: false,
      businessMeaning: "Whether relationship is currently active",
      sourceMapping: {
        bronzeTable: "bronze.customer_account_relationships",
        bronzeColumn: "N/A",
        transformation: "TRUE if no end date",
      },
    },
    {
      name: "effective_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date this record version became effective",
      sourceMapping: {
        bronzeTable: "bronze.customer_account_relationships",
        bronzeColumn: "EFFECTIVE_DATE",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "expiration_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date this record version expired (9999-12-31 for current)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Set to 9999-12-31 for current",
      },
    },
    {
      name: "is_current",
      dataType: "BOOLEAN",
      nullable: false,
      businessMeaning: "Flag for current record",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "TRUE if expiration_date = 9999-12-31",
      },
    },
    {
      name: "created_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Record creation timestamp",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP()",
      },
    },
    {
      name: "updated_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Record update timestamp",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP()",
      },
    },
  ],
};

// ============================================================================
// TABLE 3: CUSTOMER CONTACT HISTORY
// ============================================================================

export const customerContactHistorySilver: SilverTableDefinition = {
  name: "CORE_CUSTOMERS.DIM_CUSTOMER_EMAIL",
  schema: "CORE_CUSTOMERS",
  description: "Customer email addresses with validation and SCD Type 2",
  businessKey: "customer_id",
  surrogatePrimaryKey: "contact_history_sk",
  sourceTables: [
    "bronze.customer_email",
    "bronze.customer_names_addresses",
  ],
  scdType: "Type 2",
  grain: "One row per contact change per customer",
  partitionBy: ["change_date"],
  clusterBy: ["customer_id", "change_type"],

  columns: [
    {
      name: "contact_history_sk",
      dataType: "BIGINT",
      nullable: false,
      businessMeaning: "Surrogate key",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Auto-generated",
      },
    },
    {
      name: "customer_id",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Customer identifier",
      sourceMapping: {
        bronzeTable: "bronze.customer_email",
        bronzeColumn: "CUSTOMER_ID",
        transformation: "1:1 mapping",
      },
    },
    {
      name: "contact_type",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Type of contact: EMAIL, PHONE, ADDRESS",
      sourceMapping: {
        bronzeTable: "bronze.customer_email",
        bronzeColumn: "EMAIL_TYPE_CODE",
        transformation: "Map to standardized contact type",
      },
    },
    {
      name: "contact_value_old",
      dataType: "VARCHAR(500)",
      nullable: true,
      businessMeaning: "Previous contact value (before change)",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Captured from previous record version",
      },
      piiClassification: "HIGH",
      encryptionMethod: "TOKENIZATION",
    },
    {
      name: "contact_value_new",
      dataType: "VARCHAR(500)",
      nullable: false,
      businessMeaning: "New contact value (after change)",
      sourceMapping: {
        bronzeTable: "bronze.customer_email",
        bronzeColumn: "EMAIL_ADDRESS",
        transformation: "Current contact value",
      },
      piiClassification: "HIGH",
      encryptionMethod: "TOKENIZATION",
    },
    {
      name: "change_type",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Type of change: ADD, MODIFY, REMOVE",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Determined by comparing old vs new",
      },
    },
    {
      name: "change_date",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date when contact information changed",
      sourceMapping: {
        bronzeTable: "bronze.customer_email",
        bronzeColumn: "REFRESH_TIME",
        transformation: "Extracted date from refresh timestamp",
      },
    },
    {
      name: "is_verified",
      dataType: "BOOLEAN",
      nullable: true,
      businessMeaning: "Whether contact has been verified",
      sourceMapping: {
        bronzeTable: "bronze.customer_email",
        bronzeColumn: "EMAIL_TYPE_CODE",
        transformation: "TRUE if marked as verified",
      },
    },
    {
      name: "verification_date",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date when contact was verified",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "Tracked from verification system",
      },
    },
    {
      name: "created_timestamp",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "Record creation timestamp",
      sourceMapping: {
        bronzeTable: "N/A",
        bronzeColumn: "N/A",
        transformation: "CURRENT_TIMESTAMP()",
      },
    },
  ],
};

// Additional Silver Tables
export const customerDemographySilver: SilverTableDefinition = {
  name: "CORE_CUSTOMERS.DIM_CUSTOMER_DEMOGRAPHY",
  schema: "CORE_CUSTOMERS",
  description: "Customer demographic attributes with SCD Type 2",
  businessKey: "customer_number",
  surrogatePrimaryKey: "customer_demography_sk",
  sourceTables: ["bronze.customer_master"],
  scdType: "Type 2",
  grain: "One row per customer per effective date",
  partitionBy: ["effective_start_date"],
  clusterBy: ["customer_number", "is_current"],
  columns: [
    { name: "customer_demography_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "System-generated number assigned to the customer record", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "Auto-generated" } },
    { name: "customer_number_fk", dataType: "NUMBER(38,0)", nullable: true, businessMeaning: "Foreign key referencing from surrogate key of customer Attribute", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "Lookup to DIM_CUSTOMER_ATTRIBUTE" } },
    { name: "customer_number", dataType: "VARCHAR(16777216)", nullable: false, businessMeaning: "Number of CUSTOMERSs", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "CUSTOMER_NUMBER" } },
    { name: "ethnic_code", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Identifies the ethnic heritage of the CUSTOMER", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "ETHNIC_CODE" }, piiClassification: "MEDIUM" },
    { name: "ethnic_desc", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Description of the CUSTOMER Ethnic Code", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "ETHNIC_DESC" }, piiClassification: "MEDIUM" },
    { name: "gender", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Identifies the Gender of CUSTOMER for individual", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "GENDER" }, piiClassification: "MEDIUM" },
    { name: "marital_status_code", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Identifies the CUSTOMER's marital status", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "MARITAL_STATUS_CODE" }, piiClassification: "MEDIUM" },
    { name: "marital_status_desc", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Description of the CUSTOMER Marital Status Code", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "MARITAL_STATUS_DESC" }, piiClassification: "MEDIUM" },
    { name: "education_code", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Identifies the level of education associated with the CUSTOMER", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "EDUCATION_CODE" }, piiClassification: "MEDIUM" },
    { name: "education_desc", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Description of the CUSTOMER Education Code", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "EDUCATION_DESC" }, piiClassification: "MEDIUM" },
    { name: "income_code", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Identifies the level of income associated with the CUSTOMER", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "INCOME_CODE" }, piiClassification: "MEDIUM" },
    { name: "income_desc", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Description of the CUSTOMER Income Code", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "INCOME_DESC" }, piiClassification: "MEDIUM" },
    { name: "business_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was created in business", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "BUSINESS_DATE" } },
    { name: "record_date", dataType: "DATE", nullable: true, businessMeaning: "Date when the record was Extracted", sourceMapping: { bronzeTable: "bronze.customer_master", bronzeColumn: "RECORD_DATE" } },
    { name: "row_hash", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Hash value of Business Columns", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "MD5 hash" } },
    { name: "effective_start_date", dataType: "DATE", nullable: true, businessMeaning: "Indicates date when record got Active", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "effective_end_date", dataType: "DATE", nullable: true, businessMeaning: "Indicates date when record got Inactive", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "record_flag", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "Indicates whether record is 'current' or 'history'", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "SCD Type 2 logic" } },
    { name: "insert_by", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "User ID used for the pipeline execution", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "insert_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Datetime when record is inserted", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "last_modified_by", dataType: "VARCHAR(16777216)", nullable: true, businessMeaning: "User ID used for the pipeline Modified", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
    { name: "last_modified_dt", dataType: "TIMESTAMP_NTZ(9)", nullable: true, businessMeaning: "Datetime when record is last modified", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A", transformation: "System generated" } },
  ],
};

export const customerIdentifierSilver: SilverTableDefinition = {
  name: "CORE_CUSTOMERS.DIM_CUSTOMER_IDENTIFER",
  schema: "CORE_CUSTOMERS",
  description: "Customer government identifiers with encryption",
  businessKey: "customer_number",
  surrogatePrimaryKey: "customer_identifer_sk",
  sourceTables: ["bronze.customer_identifiers"],
  scdType: "Type 2",
  grain: "One row per customer identifier",
  columns: [
    { name: "customer_identifer_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "customer_number", dataType: "VARCHAR", nullable: false, businessMeaning: "Customer identifier", sourceMapping: { bronzeTable: "bronze.customer_identifiers", bronzeColumn: "CUSTOMER_NUMBER" } },
    { name: "tax_identification_number", dataType: "VARCHAR", nullable: true, businessMeaning: "Encrypted Tax ID", sourceMapping: { bronzeTable: "bronze.customer_identifiers", bronzeColumn: "TAX_ID" }, piiClassification: "HIGH", encryptionMethod: "AES_256" },
    { name: "driving_license_number", dataType: "VARCHAR", nullable: true, businessMeaning: "Encrypted DL", sourceMapping: { bronzeTable: "bronze.customer_identifiers", bronzeColumn: "DRIVING_LICENSE" }, piiClassification: "HIGH", encryptionMethod: "AES_256" },
  ],
};

export const customerNameSilver: SilverTableDefinition = {
  name: "CORE_CUSTOMERS.DIM_CUSTOMER_NAME",
  schema: "CORE_CUSTOMERS",
  description: "Customer name components",
  businessKey: "customer_number",
  surrogatePrimaryKey: "customer_sk",
  sourceTables: ["bronze.customer_names_addresses"],
  scdType: "Type 2",
  grain: "One row per customer",
  columns: [
    { name: "customer_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "customer_number", dataType: "VARCHAR", nullable: false, businessMeaning: "Customer identifier", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "CUSTOMER_NUMBER" } },
    { name: "first_name", dataType: "VARCHAR", nullable: true, businessMeaning: "First name", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "FIRST_NAME" }, piiClassification: "HIGH" },
    { name: "last_name", dataType: "VARCHAR", nullable: true, businessMeaning: "Last name", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "LAST_NAME" }, piiClassification: "HIGH" },
  ],
};

export const customerAddressSilver: SilverTableDefinition = {
  name: "CORE_CUSTOMERS.DIM_CUSTOMER_ADDRESS",
  schema: "CORE_CUSTOMERS",
  description: "Customer address with USPS standardization",
  businessKey: "customer_number",
  surrogatePrimaryKey: "customer_address_sk",
  sourceTables: ["bronze.customer_names_addresses"],
  scdType: "Type 2",
  grain: "One row per customer address",
  columns: [
    { name: "customer_address_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "customer_number", dataType: "VARCHAR", nullable: false, businessMeaning: "Customer identifier", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "CUSTOMER_NUMBER" } },
    { name: "address_line_1", dataType: "VARCHAR", nullable: true, businessMeaning: "Address line 1", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "ADDRESS_LINE_1" }, piiClassification: "MEDIUM" },
    { name: "city", dataType: "VARCHAR", nullable: true, businessMeaning: "City", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "CITY" } },
    { name: "state", dataType: "VARCHAR", nullable: true, businessMeaning: "State", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "STATE" } },
  ],
};

export const customerContactSilver: SilverTableDefinition = {
  name: "CORE_CUSTOMERS.DIM_CUSTOMER_CONTACT",
  schema: "CORE_CUSTOMERS",
  description: "Customer phone contact information",
  businessKey: "customer_number",
  surrogatePrimaryKey: "customer_contact_sk",
  sourceTables: ["bronze.customer_names_addresses"],
  scdType: "Type 2",
  grain: "One row per customer",
  columns: [
    { name: "customer_contact_sk", dataType: "NUMBER(38,0)", nullable: false, businessMeaning: "Surrogate key", sourceMapping: { bronzeTable: "N/A", bronzeColumn: "N/A" } },
    { name: "customer_number", dataType: "VARCHAR", nullable: false, businessMeaning: "Customer identifier", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "CUSTOMER_NUMBER" } },
    { name: "primary_phone_number", dataType: "VARCHAR", nullable: true, businessMeaning: "Primary phone", sourceMapping: { bronzeTable: "bronze.customer_names_addresses", bronzeColumn: "PRIMARY_PHONE_NUMBER" }, piiClassification: "HIGH" },
  ],
};

export const customerSilverTables = [
  customerMasterSilver,
  customerRelationshipSilver,
  customerContactHistorySilver,
  customerDemographySilver,
  customerIdentifierSilver,
  customerNameSilver,
  customerAddressSilver,
  customerContactSilver,
];

export const customerSilverLayerComplete = {
  tables: customerSilverTables,
  totalTables: customerSilverTables.length,
  description:
    "Customer domain silver layer - cleansed, conformed, and deduplicated data from FIS bronze layer",
  layerPurpose:
    "Golden customer records with PII encryption, and SCD Type 2 history tracking",
};

export default customerSilverTables;
