// Customer Domain - FIS-ADS Bronze Layer
// Real Fiserv FIS-ADS source tables mapped to Bronze layer
// Source: FIS_RAW schema (Landing/Raw Layer) → Bronze Layer (Cleansed)
// For FIS source table details, see lib/fis-source-tables.ts

export interface BronzeTableDefinition {
  name: string;
  schema: string;
  source: {
    fisTable: string;
    fisSchema: string;
    refreshFrequency: string;
    sourceDocumentation?: string; // Path to source table documentation
  };
  description: string;
  businessKey: string;
  columns: Array<{
    name: string;
    fisColumnName: string;
    dataType: string;
    nullable: boolean;
    businessMeaning: string;
  }>;
  recordEstimate: string;
  scd2: boolean;
  partitionBy?: string[];
  clusterBy?: string[];
  transformationNotes?: string;
}

// ============================================================================
// CUSTOMER MASTER - FROM TB_CI_OZ6_CUST_ARD
// ============================================================================

export const customerMasterBronze: BronzeTableDefinition = {
  name: "bronze.customer_master",
  schema: "bronze",
  source: {
    fisTable: "TB_CI_OZ6_CUST_ARD",
    fisSchema: "FIS_RAW", // Landing zone raw tables
    refreshFrequency: "Daily",
    sourceDocumentation: "lib/fis-source-tables.ts#TB_CI_OZ6_CUST_ARD",
  },
  description: "Customer master data from FIS - demographics, attributes, identification, status, and relationship officer assignments",
  businessKey: "CID_CUST_CUST_NBR",
  transformationNotes: "1:1 mapping from FIS_RAW.TB_CI_OZ6_CUST_ARD. Column names standardized for consistency. PII fields (TAX_ID, names) remain unencrypted at Bronze layer - encryption deferred to Silver layer. SCD2 implemented to track customer attribute changes over time.",
  columns: [
    {
      name: "CUSTOMER_ID",
      fisColumnName: "CID_CUST_CUST_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Unique customer number",
    },
    {
      name: "ETHNIC_CODE",
      fisColumnName: "CID_CUST_ETHNIC_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Customer ethnicity code",
    },
    {
      name: "ETHNIC_DESC",
      fisColumnName: "CID_CUST_ETHNIC_DESC",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Customer ethnicity description",
    },
    {
      name: "GENDER_CODE",
      fisColumnName: "CID_CUST_TYPE_CDE",
      dataType: "VARCHAR(5)",
      nullable: true,
      businessMeaning: "Gender code (M/F)",
    },
    {
      name: "MARITAL_STATUS_CODE",
      fisColumnName: "CID_CUST_MARITAL_STAT_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Marital status code",
    },
    {
      name: "MARITAL_STATUS_DESC",
      fisColumnName: "CID_CUST_MARITAL_STAT_DESC",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Marital status description",
    },
    {
      name: "EDUCATION_CODE",
      fisColumnName: "CID_CUST_EDUCATION_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Education level code",
    },
    {
      name: "EDUCATION_DESC",
      fisColumnName: "CID_CUST_EDUCATION_DESC",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Education level description",
    },
    {
      name: "INCOME_CODE",
      fisColumnName: "CID_CUST_INCOME_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Income range code",
    },
    {
      name: "INCOME_DESC",
      fisColumnName: "CID_CUST_INCOME_DESC",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Income range description",
    },
    {
      name: "BIRTH_DATE",
      fisColumnName: "CID_CUST_BIRTH_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Customer birth date",
    },
    {
      name: "BUSINESS_INCEPTION_DATE",
      fisColumnName: "CID_CUST_BUS_SINCE_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Business inception date",
    },
    {
      name: "BUSINESS_TYPE_CODE",
      fisColumnName: "CID_CUST_BUS_TYP",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Business type code",
    },
    {
      name: "BUSINESS_TYPE_DESC",
      fisColumnName: "CID_CUST_BUS_TYP_DESC",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Business type description",
    },
    {
      name: "LANGUAGE_PREFERENCE",
      fisColumnName: "CID_CUST_LANG_PREF_DESC",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Preferred language",
    },
    {
      name: "COST_CENTER_NUMBER",
      fisColumnName: "CID_CUST_COST_CENTER_NBR",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Cost center assignment",
    },
    {
      name: "OCCUPATION_CODE",
      fisColumnName: "CID_CUST_OCCUPATION_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Occupation code",
    },
    {
      name: "OCCUPATION_DESC",
      fisColumnName: "CID_CUST_OCCUPATION_DESC",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Occupation description",
    },
    {
      name: "TAX_ID",
      fisColumnName: "CID_CUST_TAX_ID",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "SSN or EIN (encrypted)",
    },
    {
      name: "PRIMARY_OFFICER_NUMBER",
      fisColumnName: "CID_CUST_PRIM_OFF_NBR",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Primary relationship officer ID",
    },
    {
      name: "PRIMARY_OFFICER_NAME",
      fisColumnName: "CID_CUST_PRIM_OFF_NAME",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Primary relationship officer name",
    },
    {
      name: "SECONDARY_OFFICER_NUMBER",
      fisColumnName: "CID_CUST_SEC_OFF_NBR",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Secondary relationship officer ID",
    },
    {
      name: "SECONDARY_OFFICER_NAME",
      fisColumnName: "CID_CUST_SEC_OFF_NAME",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Secondary relationship officer name",
    },
    {
      name: "EMPLOYER_NAME",
      fisColumnName: "CID_CUST_EMPL_SCHOOL",
      dataType: "VARCHAR(150)",
      nullable: true,
      businessMeaning: "Employer or school name",
    },
    {
      name: "CUSTOMER_OPEN_DATE",
      fisColumnName: "CID_CUST_OPEN_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Date customer opened with bank",
    },
    {
      name: "CUSTOMER_CLOSED_DATE",
      fisColumnName: "CID_CUST_CLOSED_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date customer closed",
    },
    {
      name: "CUSTOMER_DEATH_DATE",
      fisColumnName: "CID_CUST_DEATH_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Deceased customer date",
    },
    {
      name: "CUSTOMER_SINCE_DATE",
      fisColumnName: "CID_CUST_SINCE_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Customer since date (tenure)",
    },
    {
      name: "CUSTOMER_STATUS_CODE",
      fisColumnName: "CID_CUST_STATUS_CDE",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "ACTIVE, INACTIVE, CLOSED, DECEASED",
    },
    {
      name: "CREDIT_SCORE",
      fisColumnName: "CID_CUST_MISC_DEMO_6",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Current credit score",
    },
    {
      name: "LAST_MODIFIED_DATE",
      fisColumnName: "CID_CUST_LST_MNT_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Last modification date",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
    {
      name: "PROCESS_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "5-10M records",
  scd2: true,
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["CUSTOMER_ID", "CUSTOMER_STATUS_CODE"],
};

// ============================================================================
// CUSTOMER IDENTIFIERS - FROM TB_CI_OZ4_CUST_ID_ARD
// ============================================================================

export const customerIdentifierBronze: BronzeTableDefinition = {
  name: "bronze.customer_identifiers",
  schema: "bronze",
  source: {
    fisTable: "TB_CI_OZ4_CUST_ID_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
    sourceDocumentation: "lib/fis-source-tables.ts#TB_CI_OZ4_CUST_ID_ARD",
  },
  description: "Customer identification documents - licenses, passports, government IDs with issue and expiration dates",
  businessKey: "CI_DMV21_ID_NUMBER",
  transformationNotes: "1:1 mapping from FIS_RAW.TB_CI_OZ4_CUST_ID_ARD. Sensitive ID numbers remain in raw form - tokenization occurs at Silver layer. Document type standardized across FIS variations. No SCD2 (identification documents are immutable).",
  columns: [
    {
      name: "CUSTOMER_ID",
      fisColumnName: "CID_CUST_CUST_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Reference to customer master",
    },
    {
      name: "IDENTIFICATION_NUMBER",
      fisColumnName: "CI_DMV21_ID_NUMBER",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Document ID number",
    },
    {
      name: "IDENTIFICATION_TYPE",
      fisColumnName: "ID_TYP_NME",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Type of ID (DRIVER_LICENSE, PASSPORT, STATE_ID, etc.)",
    },
    {
      name: "ID_ISSUE_DATE",
      fisColumnName: "ID_ISSUE_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "ID issue date",
    },
    {
      name: "ID_EXPIRATION_DATE",
      fisColumnName: "ID_EXP_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "ID expiration date",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
  ],
  recordEstimate: "10-20M records",
  scd2: false,
};

// ============================================================================
// CUSTOMER NAMES & ADDRESSES - FROM TB_CI_OZ5_CUST_NAAD_ARD_RAW
// ============================================================================

export const customerNameAddressBronze: BronzeTableDefinition = {
  name: "bronze.customer_names_addresses",
  schema: "bronze",
  source: {
    fisTable: "TB_CI_OZ5_CUST_NAAD_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
    sourceDocumentation: "lib/fis-source-tables.ts#TB_CI_OZ5_CUST_NAAD_ARD",
  },
  description: "Customer name and address information - personal and business addresses with multiple address types",
  businessKey: "CID_NAAD_APPL_ID",
  transformationNotes: "1:1 mapping from FIS_RAW.TB_CI_OZ5_CUST_NAAD_ARD. Supports multiple address types (PRIMARY, MAILING, BUSINESS). Name fields preserved as-is - standardization (proper case, accent removal) occurs at Silver layer. Address standardization (ZIP+4, geocoding) deferred to Silver layer.",
  columns: [
    {
      name: "CUSTOMER_ID",
      fisColumnName: "CID_NAAD_APPL_ID",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Customer application ID",
    },
    {
      name: "BANK_NUMBER",
      fisColumnName: "CID_NAAD_BANK_NBR",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Bank number",
    },
    {
      name: "CUSTOMER_TYPE_CODE",
      fisColumnName: "CID_NAAD_CUST_TYPE_CDE",
      dataType: "VARCHAR(5)",
      nullable: false,
      businessMeaning: "I=Individual, C=Corporate, P=Partnership",
    },
    {
      name: "FIRST_NAME",
      fisColumnName: "CID_NAAD_KEY_FIELD_2",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "First name (individuals only)",
    },
    {
      name: "LAST_NAME",
      fisColumnName: "CID_NAAD_SURNAME",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Last name (individuals only)",
    },
    {
      name: "MIDDLE_NAME_1",
      fisColumnName: "CID_NAAD_KEY_FIELD_3",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Middle name 1",
    },
    {
      name: "MIDDLE_NAME_2",
      fisColumnName: "CID_NAAD_KEY_FIELD_4",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Middle name 2",
    },
    {
      name: "CUSTOMER_NAME",
      fisColumnName: "CID_NAAD_NAME_LINE",
      dataType: "VARCHAR(200)",
      nullable: false,
      businessMeaning: "Full customer name",
    },
    {
      name: "ADDRESS_LINE_1",
      fisColumnName: "CID_NAAD_LINE_1",
      dataType: "VARCHAR(150)",
      nullable: true,
      businessMeaning: "Street address line 1",
    },
    {
      name: "CITY",
      fisColumnName: "CID_NAAD_CITY",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "City",
    },
    {
      name: "STATE_CODE",
      fisColumnName: "CID_NAAD_STATE_CDE",
      dataType: "VARCHAR(5)",
      nullable: true,
      businessMeaning: "State code",
    },
    {
      name: "ZIP_CODE_1",
      fisColumnName: "CID_NAAD_ZIP_1",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "ZIP code - 5 digit",
    },
    {
      name: "ZIP_CODE_2",
      fisColumnName: "CID_NAAD_ZIP_2",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "ZIP code - 4 digit extension",
    },
    {
      name: "COUNTRY_CODE",
      fisColumnName: "CID_NAAD_COUNTRY",
      dataType: "VARCHAR(5)",
      nullable: true,
      businessMeaning: "Country code",
    },
    {
      name: "COUNTRY_NAME",
      fisColumnName: "CID_NAAD_COUNTRY_NAME",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Country name",
    },
    {
      name: "FAX_PHONE_NUMBER",
      fisColumnName: "CID_NAAD_FAX_PHONE_NBR",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Fax phone number",
    },
    {
      name: "PRIMARY_PHONE_NUMBER",
      fisColumnName: "CID_NAAD_PRIM_PHONE_NBR",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Primary phone number",
    },
    {
      name: "SECONDARY_PHONE_NUMBER",
      fisColumnName: "CID_NAAD_SEC_PHONE_NBR",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Secondary phone number",
    },
    {
      name: "NAME_LAST_CHANGE_DATE",
      fisColumnName: "CID_NAAD_NAME_LAST_CHG_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date name was last changed",
    },
    {
      name: "EFFECTIVE_DATE",
      fisColumnName: "CID_NAAD_EFF_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Effective date for this record",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
    {
      name: "PROCESS_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "12-20M records",
  scd2: true,
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["CUSTOMER_ID"],
};

// ============================================================================
// CUSTOMER RELATIONSHIPS - FROM TB_CI_OZW_CUST_ACCT_RLT_ARD
// ============================================================================

export const customerRelationshipBronze: BronzeTableDefinition = {
  name: "bronze.customer_account_relationships",
  schema: "bronze",
  source: {
    fisTable: "TB_CI_OZW_CUST_ACCT_RLT_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Daily",
  },
  description: "Customer-to-Account relationships and roles",
  businessKey: "CID_RELA_R_APPL_ID",
  columns: [
    {
      name: "CUSTOMER_ID",
      fisColumnName: "CID_RELA_R_APPL_ID",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Customer ID",
    },
    {
      name: "ACCOUNT_ID",
      fisColumnName: "CID_RELA_APPL_ID",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account ID",
    },
    {
      name: "RELATIONSHIP_TYPE_CODE",
      fisColumnName: "CID_RELA_E2_TO_E1_CDE",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Type of relationship",
    },
    {
      name: "RELATIONSHIP_TYPE_DESC",
      fisColumnName: "CID_RELA_E2_TO_E1_DESC",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Relationship type description",
    },
    {
      name: "RELATIONSHIP_ROLE_CODE",
      fisColumnName: "CID_RELA_E1_TO_E2_CDE",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Role in relationship (PRIMARY, JOINT, AUTHORIZED_USER)",
    },
    {
      name: "RELATIONSHIP_ROLE_DESC",
      fisColumnName: "CID_RELA_E1_TO_E2_DESC",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Role description",
    },
    {
      name: "EFFECTIVE_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Relationship effective date",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
  ],
  recordEstimate: "3-5M records",
  scd2: false,
};

// ============================================================================
// CUSTOMER EMAIL - FROM TB_CI_OZ3_EMAIL_ARD
// ============================================================================

export const customerEmailBronze: BronzeTableDefinition = {
  name: "bronze.customer_email",
  schema: "bronze",
  source: {
    fisTable: "TB_CI_OZ3_EMAIL_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Daily",
  },
  description: "Customer email contact information",
  businessKey: "CID_EMLREL_CUST_NMB",
  columns: [
    {
      name: "CUSTOMER_ID",
      fisColumnName: "CID_EMLREL_CUST_NMB",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Customer number",
    },
    {
      name: "EMAIL_ADDRESS",
      fisColumnName: "CID_EMLREL_ADDR_TXT",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Email address",
    },
    {
      name: "EMAIL_TYPE_CODE",
      fisColumnName: "CID_EMLREL_POC_RSN_CDE",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Email type code (PRIMARY, SECONDARY)",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
    {
      name: "PROCESS_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "10-15M records",
  scd2: false,
};

export const customerBronzeTables = [
  customerMasterBronze,
  customerIdentifierBronze,
  customerNameAddressBronze,
  customerRelationshipBronze,
  customerEmailBronze,
];

export const customerBronzeLayerComplete = {
  tables: customerBronzeTables,
  totalTables: customerBronzeTables.length,
  totalRows: 5000000 + 10000000 + 12000000 + 3000000 + 10000000,
  description: 'Customer domain bronze layer - raw data from FIS-ADS source tables',
};

export default customerBronzeTables;
