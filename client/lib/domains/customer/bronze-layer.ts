// Customer Domain - FIS Bronze Layer (FIS_RAW schema)
// Direct 1:1 mapping from FIS source system tables

export interface BronzeTableDefinition {
  name: string;
  schema: string;
  source: {
    fisTable: string;
    fisSchema: string;
    refreshFrequency: string;
    sourceDocumentation?: string;
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
// TB_CI_DZY_C2_CUST_SCD_DIM_RAW - Customer SCD Dimension
// ============================================================================

export const customerSCDBronze: BronzeTableDefinition = {
  name: "TB_CI_DZY_C2_CUST_SCD_DIM_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_CI_DZY_C2_CUST_SCD_DIM",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
    sourceDocumentation: "FIS Core Banking - Customer SCD Dimension",
  },
  description: "Customer Slowly Changing Dimension - comprehensive customer demographics and attributes",
  businessKey: "CUST_CIS_NBR",
  transformationNotes: "1:1 mapping from FIS. SCD2 tracking enabled. PII fields remain unencrypted - encryption applied at Silver layer.",
  columns: [
    {
      name: "DW_CUST_ID",
      fisColumnName: "DW_CUST_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Data warehouse customer ID",
    },
    {
      name: "CUST_CIS_NBR",
      fisColumnName: "CUST_CIS_NBR",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Customer CIS number - business key",
    },
    {
      name: "BRTH_DTE",
      fisColumnName: "BRTH_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      businessMeaning: "Customer birth date",
    },
    {
      name: "FRST_NME",
      fisColumnName: "FRST_NME",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "First name",
    },
    {
      name: "LST_NME",
      fisColumnName: "LST_NME",
      dataType: "VARCHAR(30)",
      nullable: true,
      businessMeaning: "Last name",
    },
    {
      name: "TAX_ID_NBR",
      fisColumnName: "TAX_ID_NBR",
      dataType: "VARCHAR(9)",
      nullable: true,
      businessMeaning: "Tax ID / SSN",
    },
    {
      name: "GNDR_CDE",
      fisColumnName: "GNDR_CDE",
      dataType: "VARCHAR(1)",
      nullable: true,
      businessMeaning: "Gender code",
    },
    {
      name: "ETHNC_CDE",
      fisColumnName: "ETHNC_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Ethnicity code",
    },
    {
      name: "RACE_CDE",
      fisColumnName: "RACE_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Race code",
    },
    {
      name: "CUST_EMAIL_ADDR_TXT",
      fisColumnName: "CUST_EMAIL_ADDR_TXT",
      dataType: "VARCHAR(64)",
      nullable: true,
      businessMeaning: "Customer email address",
    },
    {
      name: "PRMY_PH_NBR",
      fisColumnName: "PRMY_PH_NBR",
      dataType: "VARCHAR(11)",
      nullable: true,
      businessMeaning: "Primary phone number",
    },
    {
      name: "CUST_OPEN_DTE",
      fisColumnName: "CUST_OPEN_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Customer open date",
    },
    {
      name: "CUST_STAT_CDE",
      fisColumnName: "CUST_STAT_CDE",
      dataType: "VARCHAR(2)",
      nullable: false,
      businessMeaning: "Customer status code",
    },
    {
      name: "PRMY_OFFCR_NBR",
      fisColumnName: "PRMY_OFFCR_NBR",
      dataType: "NUMBER(5,0)",
      nullable: true,
      businessMeaning: "Primary officer number",
    },
    {
      name: "PRMY_OFFCR_NME",
      fisColumnName: "PRMY_OFFCR_NME",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Primary officer name",
    },
    {
      name: "EFF_DTE",
      fisColumnName: "EFF_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "SCD effective date",
    },
    {
      name: "SOR_EXP_DTE",
      fisColumnName: "SOR_EXP_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      businessMeaning: "SCD expiration date",
    },
    {
      name: "CUR_REC_IND",
      fisColumnName: "CUR_REC_IND",
      dataType: "VARCHAR(1)",
      nullable: false,
      businessMeaning: "Current record indicator",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
    {
      name: "SCAN_TIME",
      fisColumnName: "SCAN_TIME",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS scan timestamp",
    },
  ],
  recordEstimate: "5-10M records",
  scd2: true,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["CUST_CIS_NBR", "PRCS_DTE"],
};

// ============================================================================
// TB_CI_DZU_C2_CUST_CNTC_DIM_RAW - Customer Contact Dimension
// ============================================================================

export const customerContactBronze: BronzeTableDefinition = {
  name: "TB_CI_DZU_C2_CUST_CNTC_DIM_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_CI_DZU_C2_CUST_CNTC_DIM",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Customer contact information - addresses, phones, emails",
  businessKey: "DW_CUST_CNTC_ID",
  columns: [
    {
      name: "DW_CUST_CNTC_ID",
      fisColumnName: "DW_CUST_CNTC_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Contact ID",
    },
    {
      name: "CUST_CIS_NBR",
      fisColumnName: "CUST_CIS_NBR",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Customer CIS number",
    },
    {
      name: "ADDR_LNE_1_TXT",
      fisColumnName: "ADDR_LNE_1_TXT",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Address line 1",
    },
    {
      name: "CTY_NME",
      fisColumnName: "CTY_NME",
      dataType: "VARCHAR(40)",
      nullable: true,
      businessMeaning: "City name",
    },
    {
      name: "ST_CDE",
      fisColumnName: "ST_CDE",
      dataType: "VARCHAR(2)",
      nullable: true,
      businessMeaning: "State code",
    },
    {
      name: "ZIP_5_CDE",
      fisColumnName: "ZIP_5_CDE",
      dataType: "VARCHAR(5)",
      nullable: true,
      businessMeaning: "ZIP code - 5 digit",
    },
    {
      name: "PH_1_FULL_NBR",
      fisColumnName: "PH_1_FULL_NBR",
      dataType: "VARCHAR(40)",
      nullable: true,
      businessMeaning: "Primary phone number",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "12-20M records",
  scd2: true,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["CUST_CIS_NBR"],
};

// ============================================================================
// TB_CI_OZ6_CUST_ARD_RAW - Customer ARD
// ============================================================================

export const customerARDBronze: BronzeTableDefinition = {
  name: "TB_CI_OZ6_CUST_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_CI_OZ6_CUST_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Customer ARD extract with comprehensive customer data",
  businessKey: "CID_CUST_CUST_NBR",
  columns: [
    {
      name: "CID_CUST_CUST_NBR",
      fisColumnName: "CID_CUST_CUST_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Customer number",
    },
    {
      name: "CID_CUST_BANK_NBR",
      fisColumnName: "CID_CUST_BANK_NBR",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Bank number",
    },
    {
      name: "CID_CUST_STATUS_CDE",
      fisColumnName: "CID_CUST_STATUS_CDE",
      dataType: "VARCHAR(1)",
      nullable: false,
      businessMeaning: "Customer status code",
    },
    {
      name: "CID_CUST_SINCE_DTE",
      fisColumnName: "CID_CUST_SINCE_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Customer since date",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "5-10M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
};

// ============================================================================
// TB_CI_OZW_CUST_ACCT_RLT_ARD_RAW - Customer Account Relationship ARD
// ============================================================================

export const customerAccountRelationshipARDBronze: BronzeTableDefinition = {
  name: "TB_CI_OZW_CUST_ACCT_RLT_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_CI_OZW_CUST_ACCT_RLT_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Customer-to-Account relationships from FIS ARD",
  businessKey: "CID_RELA_R_APPL_ID",
  columns: [
    {
      name: "CID_RELA_R_APPL_ID",
      fisColumnName: "CID_RELA_R_APPL_ID",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Customer ID",
    },
    {
      name: "CID_RELA_APPL_ID",
      fisColumnName: "CID_RELA_APPL_ID",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Account ID",
    },
    {
      name: "CID_RELA_E2_TO_E1_CDE",
      fisColumnName: "CID_RELA_E2_TO_E1_CDE",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Relationship type code",
    },
    {
      name: "CID_RELA_EFF_DTE",
      fisColumnName: "CID_RELA_EFF_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Relationship effective date",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "20M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
};

// ============================================================================
// TB_CI_OZ3_EMAIL_ARD_RAW - Customer Email ARD
// ============================================================================

export const customerEmailARDBronze: BronzeTableDefinition = {
  name: "TB_CI_OZ3_EMAIL_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_CI_OZ3_EMAIL_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Customer email addresses from FIS ARD extract",
  businessKey: "CID_EMLREL_CUST_NMB",
  columns: [
    {
      name: "CID_EMLREL_CUST_NMB",
      fisColumnName: "CID_EMLREL_CUST_NMB",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Customer number",
    },
    {
      name: "CID_EMLREL_ADDR_TXT",
      fisColumnName: "CID_EMLREL_ADDR_TXT",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Email address",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "6M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
};

// ============================================================================
// TB_CUST_D_FACT_RAW - Customer Daily Fact
// ============================================================================

export const customerDailyFactBronze: BronzeTableDefinition = {
  name: "TB_CUST_D_FACT_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_CUST_D_FACT",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Customer daily fact table",
  businessKey: "CUST_CIS_NBR",
  columns: [
    {
      name: "CUST_CIS_NBR",
      fisColumnName: "CUST_CIS_NBR",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Customer CIS number",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "100M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["CUST_CIS_NBR"],
};

// ============================================================================
// TB_CUST_M_FACT_RAW - Customer Monthly Fact
// ============================================================================

export const customerMonthlyFactBronze: BronzeTableDefinition = {
  name: "TB_CUST_M_FACT_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_CUST_M_FACT",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Customer monthly fact table",
  businessKey: "CUST_CIS_NBR",
  columns: [
    {
      name: "CUST_CIS_NBR",
      fisColumnName: "CUST_CIS_NBR",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Customer CIS number",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "20M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["CUST_CIS_NBR"],
};

export const customerBronzeTables = [
  customerSCDBronze,
  customerContactBronze,
  customerARDBronze,
  customerAccountRelationshipARDBronze,
  customerEmailARDBronze,
  customerDailyFactBronze,
  customerMonthlyFactBronze,
];

export const customerBronzeLayerComplete = {
  tables: customerBronzeTables,
  totalTables: customerBronzeTables.length,
  totalRows: 177000000,
  description: 'Customer domain bronze layer - FIS_RAW schema with native FIS table names',
  schema: 'FIS_RAW',
};

export default customerBronzeTables;
