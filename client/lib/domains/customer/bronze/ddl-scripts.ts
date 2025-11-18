/**
 * CUSTOMER DOMAIN - BRONZE LAYER - DDL SCRIPTS
 * 
 * CREATE TABLE statements for Bronze layer tables
 * Source: FIS raw data landing zone
 * Schema: FIS_RAW
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
// TB_CI_DZY_C2_CUST_SCD_DIM_RAW - Customer SCD Dimension
// ============================================================================
export const customerSCDBronzeDDL: DDLScript = {
  tableName: "TB_CI_DZY_C2_CUST_SCD_DIM_RAW",
  schema: "FIS_RAW",
  description: "Customer Slowly Changing Dimension from FIS - full customer demographics and attributes",
  dependencies: [],
  estimatedRows: "5.5M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer SCD Dimension
-- Source: FIS Core Banking System
-- Purpose: Raw customer master with SCD Type 2 tracking
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_CI_DZY_C2_CUST_SCD_DIM_RAW (
	DW_CUST_ID NUMBER(11,0),
	BRTH_DTE TIMESTAMP_NTZ(9),
	CUST_CIS_NBR NUMBER(11,0),
	CUST_BASE_NBR VARCHAR(3),
	CUST_OPEN_DTE TIMESTAMP_NTZ(9),
	FRST_NME VARCHAR(20),
	LST_NME VARCHAR(30),
	MID_1_NME VARCHAR(20),
	MID_2_NME VARCHAR(20),
	FRST_MID_NME VARCHAR(30),
	TAX_ID_NBR VARCHAR(9),
	TAX_ID_CDE VARCHAR(1),
	GNDR_CDE VARCHAR(1),
	CUST_SNC_DTE TIMESTAMP_NTZ(9),
	BUS_SNC_DTE TIMESTAMP_NTZ(9),
	CUST_EMAIL_ADDR_TXT VARCHAR(64),
	NME_LNE_TXT VARCHAR(50),
	PRMY_PH_NBR VARCHAR(11),
	SCNDY_PH_NBR VARCHAR(11),
	CUST_BUS_TYP_CDE VARCHAR(3),
	CUST_BUS_TYP_DESC VARCHAR(20),
	REC_TYP_CDE VARCHAR(1),
	CUST_CLOS_DTE TIMESTAMP_NTZ(9),
	CST_CNTR_NBR NUMBER(7,0),
	CEN_TRCT_NBR NUMBER(9,0),
	POS_DW_OU_ID NUMBER(11,0),
	PRN_DW_OU_ID NUMBER(11,0),
	BRNCH_NBR NUMBER(7,0),
	BRNCH_DESC VARCHAR(20),
	PRN_BNK_NBR VARCHAR(3),
	YR_AT_CUR_ADDR_CNT NUMBER(5,0),
	EMPLR_OR_SCHL_NME VARCHAR(40),
	MRTL_STAT_CDE VARCHAR(1),
	MRTL_STAT_DESC VARCHAR(20),
	NET_WRTH_CDE VARCHAR(3),
	NET_WRTH_DESC VARCHAR(20),
	OCCPN_CDE VARCHAR(3),
	OCCPN_DESC VARCHAR(20),
	OWN_RENT_CDE VARCHAR(1),
	OWN_RENT_DESC VARCHAR(20),
	CTZNSHP_CDE VARCHAR(1),
	ETHNC_CDE VARCHAR(10),
	ETHNC_CDE_DESC VARCHAR(255),
	RACE_CDE VARCHAR(10),
	RACE_DESC VARCHAR(255),
	PRMY_OFFCR_NBR NUMBER(5,0),
	PRMY_OFFCR_INITLS_NME VARCHAR(3),
	PRMY_OFFCR_NME VARCHAR(20),
	SCNDY_OFFCR_NBR NUMBER(5,0),
	SCNDY_OFFCR_INITLS_NME VARCHAR(3),
	SCNDY_OFFCR_NME VARCHAR(20),
	CLNT_ID NUMBER(11,0),
	DW_ASP_ID NUMBER(11,0),
	EFF_DTE TIMESTAMP_NTZ(9),
	SOR_EXP_DTE TIMESTAMP_NTZ(9),
	CUR_REC_IND VARCHAR(1),
	DECD_DTE TIMESTAMP_NTZ(9),
	CUST_STAT_CDE VARCHAR(2),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Customer SCD dimension from FIS - raw unmodified data'
CLUSTER BY (CUST_CIS_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_CI_DZU_C2_CUST_CNTC_DIM_RAW - Customer Contact Dimension
// ============================================================================
export const customerContactBronzeDDL: DDLScript = {
  tableName: "TB_CI_DZU_C2_CUST_CNTC_DIM_RAW",
  schema: "FIS_RAW",
  description: "Customer contact information - addresses, phones, emails",
  dependencies: [],
  estimatedRows: "12M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Contact Dimension
-- Source: FIS Core Banking System
-- Purpose: Customer addresses and contact information
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_CI_DZU_C2_CUST_CNTC_DIM_RAW (
	DW_CUST_CNTC_ID NUMBER(11,0),
	CUST_CIS_NBR NUMBER(11,0),
	CUST_BASE_NBR VARCHAR(3),
	ADDR_TYP_CDE VARCHAR(1),
	ADDR_LNE_1_TXT VARCHAR(50),
	ADDR_LNE_2_TXT VARCHAR(50),
	ADDR_LNE_3_TXT VARCHAR(50),
	ADDR_LNE_4_TXT VARCHAR(50),
	ADDR_LNE_5_TXT VARCHAR(50),
	ADDR_LNE_6_TXT VARCHAR(50),
	CTY_NME VARCHAR(40),
	ZIP_4_CDE VARCHAR(4),
	ZIP_5_CDE VARCHAR(5),
	ST_CDE VARCHAR(2),
	LST_CHNG_DTE TIMESTAMP_NTZ(9),
	CLNT_ID NUMBER(11,0),
	PRCS_DTE TIMESTAMP_NTZ(9),
	DW_ASP_ID NUMBER(11,0),
	DW_ULT_CUST_ID NUMBER(11,0),
	NME_LNE_TYP_CDE VARCHAR(10),
	PH_1_FULL_NBR VARCHAR(40),
	PH_1_RLT_RESN_CDE VARCHAR(10),
	PH_2_FULL_NBR VARCHAR(40),
	PH_2_RLT_RESN_CDE VARCHAR(10),
	PH_3_FULL_NBR VARCHAR(40),
	PH_3_RLT_RESN_CDE VARCHAR(10),
	FAX_PH_NBR VARCHAR(40),
	CTRY_CDE VARCHAR(5),
	CTRY_NME VARCHAR(255),
	PRMY_CUST_ADDR_LST_CHG_DTE TIMESTAMP_NTZ(9),
	CUST_PSTL_EFF_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Customer contact information from FIS'
CLUSTER BY (CUST_CIS_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_CI_DZL_CUST_DOC_ID_DIM_RAW - Customer Document ID Dimension
// ============================================================================
export const customerDocumentIDBronzeDDL: DDLScript = {
  tableName: "TB_CI_DZL_CUST_DOC_ID_DIM_RAW",
  schema: "FIS_RAW",
  description: "Customer identification documents - passports, licenses, IDs",
  dependencies: [],
  estimatedRows: "8M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Document ID Dimension
-- Source: FIS Core Banking System
-- Purpose: Customer identification documents
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_CI_DZL_CUST_DOC_ID_DIM_RAW (
	DW_CUST_DOC_ID_ID NUMBER(11,0),
	DW_ULT_CUST_ID NUMBER(11,0),
	CUST_CIS_NBR NUMBER(11,0),
	CUST_BASE_NBR VARCHAR(3),
	DATA_PRSNT_IND VARCHAR(1),
	ID_TYP_NME VARCHAR(30),
	ID_NBR VARCHAR(32),
	ISS_ENT_NME VARCHAR(70),
	ISS_LOCTN_NME VARCHAR(70),
	DOC_ISS_DTE TIMESTAMP_NTZ(9),
	DOC_EXP_DTE TIMESTAMP_NTZ(9),
	LST_MAINT_DTE TIMESTAMP_NTZ(9),
	LST_MAINT_USR_ID VARCHAR(32),
	DW_ASP_ID NUMBER(11,0),
	CLNT_ID NUMBER(11,0),
	PRCS_DTE TIMESTAMP_NTZ(9),
	DOC_SEQ_NBR NUMBER(4,0),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Customer document IDs from FIS'
CLUSTER BY (CUST_CIS_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_CI_OZ3_EMAIL_ARD_RAW - Customer Email ARD
// ============================================================================
export const customerEmailARDBronzeDDL: DDLScript = {
  tableName: "TB_CI_OZ3_EMAIL_ARD_RAW",
  schema: "FIS_RAW",
  description: "Customer email addresses from FIS ARD extract",
  dependencies: [],
  estimatedRows: "6M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Email ARD
-- Source: FIS Core Banking System
-- Purpose: Customer email contact information
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_CI_OZ3_EMAIL_ARD_RAW (
	CID_EMLREL_HOLD_CO_NBR NUMBER(3,0),
	CID_EMLREL_BANK_NBR NUMBER(3,0),
	CID_EMLREL_CUST_NMB VARCHAR(255),
	CID_EMLREL_POC_RLT_ID NUMBER(11,0),
	CID_EMLREL_POC_TYP_CDE VARCHAR(10),
	CID_EMLREL_POC_RSN_CDE VARCHAR(10),
	CID_EMLREL_POC_RLT_EFF_DTE TIMESTAMP_NTZ(9),
	CID_EMLREL_POC_RLT_EXP_DTE TIMESTAMP_NTZ(9),
	CID_EMLREL_POC_ID NUMBER(11,0),
	CID_EMLREL_ADDR_TXT VARCHAR(255),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Customer email from FIS ARD'
CLUSTER BY (CID_EMLREL_CUST_NMB, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_CI_OZ6_CUST_ARD_RAW - Customer ARD
// ============================================================================
export const customerARDBronzeDDL: DDLScript = {
  tableName: "TB_CI_OZ6_CUST_ARD_RAW",
  schema: "FIS_RAW",
  description: "Customer ARD extract with comprehensive customer data",
  dependencies: [],
  estimatedRows: "5.5M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer ARD
-- Source: FIS Core Banking System
-- Purpose: Comprehensive customer master from ARD extract
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_CI_OZ6_CUST_ARD_RAW (
	CID_CUST_BANK_NBR VARCHAR(10),
	CID_CUST_CUST_NBR VARCHAR(255),
	CID_CUST_PROCESS_TME VARCHAR(10),
	CID_CUST_TYPE_CDE VARCHAR(1),
	CID_CUST_STATUS_CDE VARCHAR(1),
	CID_CUST_TAX_CDE VARCHAR(1),
	CID_CUST_TAX_ID VARCHAR(10),
	CID_CUST_BRANCH_NBR NUMBER(7,0),
	CID_CUST_BRANCH_NAME VARCHAR(255),
	CID_CUST_COST_CENTER_NBR NUMBER(7,0),
	CID_CUST_LST_MNT_DTE TIMESTAMP_NTZ(9),
	CID_CUST_SINCE_DTE TIMESTAMP_NTZ(9),
	CID_CUST_OPEN_DTE TIMESTAMP_NTZ(9),
	CID_CUST_CLOSED_DTE TIMESTAMP_NTZ(9),
	CID_CUST_PRIM_OFF_NBR NUMBER(5,0),
	CID_CUST_PRIM_OFF_NAME VARCHAR(255),
	CID_CUST_SEC_OFF_NBR NUMBER(5,0),
	CID_CUST_SEC_OFF_NAME VARCHAR(255),
	CID_CUST_ETHNIC_CDE VARCHAR(1),
	CID_CUST_ETHNIC_DESC VARCHAR(255),
	CID_CUST_MARITAL_STAT_CDE VARCHAR(1),
	CID_CUST_MARITAL_STAT_DESC VARCHAR(255),
	CID_CUST_EDUCATION_CDE VARCHAR(10),
	CID_CUST_EDUCATION_DESC VARCHAR(255),
	CID_CUST_INCOME_CDE VARCHAR(10),
	CID_CUST_INCOME_DESC VARCHAR(255),
	CID_CUST_OCCUPATION_CDE VARCHAR(10),
	CID_CUST_OCCUPATION_DESC VARCHAR(255),
	CID_CUST_BIRTH_DTE TIMESTAMP_NTZ(9),
	CID_CUST_DEATH_DTE TIMESTAMP_NTZ(9),
	CID_CUST_BUS_TYP VARCHAR(10),
	CID_CUST_BUS_TYP_DESC VARCHAR(255),
	CID_CUST_BUS_SINCE_DTE TIMESTAMP_NTZ(9),
	CID_CUST_EMPL_SCHOOL VARCHAR(255),
	CID_CUST_EMPL_DTE TIMESTAMP_NTZ(9),
	CID_CUST_LANG_PREF_CDE VARCHAR(10),
	CID_CUST_LANG_PREF_DESC VARCHAR(255),
	CID_CUST_HOME_EMAIL_ADDR_TXT VARCHAR(255),
	CID_CUST_WORK_EMAIL_ADDR_TXT VARCHAR(255),
	CID_CUST_RACE_CDE VARCHAR(10),
	CID_CUST_RACE_CDE_DESC VARCHAR(255),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Customer ARD from FIS'
CLUSTER BY (CID_CUST_CUST_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_CI_OZW_CUST_ACCT_RLT_ARD_RAW - Customer Account Relationship ARD
// ============================================================================
export const customerAccountRelationshipARDBronzeDDL: DDLScript = {
  tableName: "TB_CI_OZW_CUST_ACCT_RLT_ARD_RAW",
  schema: "FIS_RAW",
  description: "Customer to Account relationships from FIS ARD",
  dependencies: [],
  estimatedRows: "20M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Account Relationship ARD
-- Source: FIS Core Banking System
-- Purpose: Customer to account relationship bridge
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_CI_OZW_CUST_ACCT_RLT_ARD_RAW (
	CID_RELA_BANK_NBR VARCHAR(10),
	CID_RELA_APPL_CDE VARCHAR(10),
	CID_RELA_APPL_ID VARCHAR(255),
	CID_RELA_OWN_TYP VARCHAR(10),
	CID_RELA_EFF_DTE TIMESTAMP_NTZ(9),
	CID_RELA_R_BANK_NBR VARCHAR(10),
	CID_RELA_R_APPL_CDE VARCHAR(10),
	CID_RELA_R_APPL_ID VARCHAR(255),
	CID_RELA_E1_TO_E2_CDE VARCHAR(10),
	CID_RELA_E1_TO_E2_DESC VARCHAR(255),
	CID_RELA_E2_TO_E1_CDE VARCHAR(10),
	CID_RELA_E2_TO_E1_DESC VARCHAR(255),
	CID_RELA_RELATION_TYP VARCHAR(10),
	CID_RELA_EXPIRE_DTE TIMESTAMP_NTZ(9),
	CID_RELA_HOUSEHOLD_NO VARCHAR(255),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Customer to account relationships from FIS ARD'
CLUSTER BY (CID_RELA_R_APPL_ID, CID_RELA_APPL_ID, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_CUST_D_FACT_RAW - Customer Daily Fact
// ============================================================================
export const customerDailyFactBronzeDDL: DDLScript = {
  tableName: "TB_CUST_D_FACT_RAW",
  schema: "FIS_RAW",
  description: "Customer daily fact table",
  dependencies: [],
  estimatedRows: "100M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Daily Fact
-- Source: FIS Core Banking System
-- Purpose: Daily customer fact snapshots
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_CUST_D_FACT_RAW (
	CUST_CIS_NBR NUMBER(11,0),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Customer daily fact from FIS'
CLUSTER BY (CUST_CIS_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_CUST_M_FACT_RAW - Customer Monthly Fact
// ============================================================================
export const customerMonthlyFactBronzeDDL: DDLScript = {
  tableName: "TB_CUST_M_FACT_RAW",
  schema: "FIS_RAW",
  description: "Customer monthly fact table",
  dependencies: [],
  estimatedRows: "20M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Customer Monthly Fact
-- Source: FIS Core Banking System
-- Purpose: Monthly customer fact aggregations
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_CUST_M_FACT_RAW (
	CUST_CIS_NBR NUMBER(11,0),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Customer monthly fact from FIS'
CLUSTER BY (CUST_CIS_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// DDL SCRIPT CATALOG
// ============================================================================
export const customerBronzeDDLCatalog = {
  domain: "Customer Core",
  layer: "Bronze",
  schema: "FIS_RAW",
  sourceSystem: "FIS Core Banking",
  scripts: [
    customerSCDBronzeDDL,
    customerContactBronzeDDL,
    customerDocumentIDBronzeDDL,
    customerEmailARDBronzeDDL,
    customerARDBronzeDDL,
    customerAccountRelationshipARDBronzeDDL,
    customerDailyFactBronzeDDL,
    customerMonthlyFactBronzeDDL
  ],
  totalTables: 8,
  estimatedTotalRows: "177M",
  refreshSchedule: "Daily at 2:00 AM UTC",
  dataRetention: "Raw data retained for 90 days in Bronze layer",
  notes: [
    "All tables use FIS native table names from source system",
    "Schema is FIS_RAW to match landing zone",
    "All PII fields remain UNENCRYPTED in Bronze layer",
    "Encryption applied during Bronze → Silver transformation",
    "ERROR_FLAG and ERROR_MESSAGE columns track data quality issues",
    "SCAN_TIME tracks when data was extracted from FIS"
  ]
};

export default customerBronzeDDLCatalog;
