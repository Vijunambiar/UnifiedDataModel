/**
 * TRANSACTIONS DOMAIN - BRONZE LAYER - DDL SCRIPTS
 * 
 * CREATE TABLE statements for Bronze layer tables
 * Source: FIS raw data landing zone
 * Schema: FIS_RAW
 * Refresh: Real-time transaction streams from FIS
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
// TB_DP_DZ0_TXN_DIM_RAW - Transaction Dimension
// ============================================================================
export const transactionDimensionBronzeDDL: DDLScript = {
  tableName: "TB_DP_DZ0_TXN_DIM_RAW",
  schema: "FIS_RAW",
  description: "Transaction dimension with transaction details and classifications",
  dependencies: [],
  estimatedRows: "500M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Transaction Dimension
-- Source: FIS Core Banking System
-- Purpose: Transaction master with classification details
-- Refresh: Real-time
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_DZ0_TXN_DIM_RAW (
	DW_TXN_ID NUMBER(11,0),
	TXN_ID NUMBER(15,0),
	TXN_SEQ_NBR VARCHAR(32),
	TXN_CDE VARCHAR(7),
	TXN_DESC VARCHAR(70),
	APPL_CDE VARCHAR(5),
	ACCT_NBR VARCHAR(32),
	DW_ULT_PROD_SERV_ID NUMBER(11,0),
	DLVRY_CHNL_CDE VARCHAR(10),
	DLVRY_CHNL_TXN_TYP_CDE VARCHAR(10),
	DLVRY_CHNL_TXN_CAT_CDE VARCHAR(10),
	PRCS_GRP_NBR VARCHAR(3),
	DP_TXN_SRC_CDE NUMBER(38,0),
	DP_TXN_CNTL_NBR NUMBER(15,0),
	DP_TXN_SRL_NBR NUMBER(38,0),
	SERV_CHRG_IND VARCHAR(1),
	ORIG_TXN_CDE VARCHAR(10),
	DR_CR_CDE VARCHAR(10),
	TXN_PRPSE_CDE VARCHAR(10),
	TXN_EFF_DTE TIMESTAMP_NTZ(9),
	LIST_PST_IND VARCHAR(1),
	PST_USR_ID VARCHAR(40),
	TXN_TS TIMESTAMP_NTZ(9),
	PRCS_DTE TIMESTAMP_NTZ(9),
	GRP_ID VARCHAR(10),
	ACH_TR_ID VARCHAR(32),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Transaction dimension from FIS'
CLUSTER BY (ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_DZ9_FIN_TXN_FACT_RAW - Financial Transaction Fact
// ============================================================================
export const financialTransactionFactBronzeDDL: DDLScript = {
  tableName: "TB_DP_DZ9_FIN_TXN_FACT_RAW",
  schema: "FIS_RAW",
  description: "Financial transaction fact table with amounts and float details",
  dependencies: [],
  estimatedRows: "750M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Financial Transaction Fact
-- Source: FIS Core Banking System
-- Purpose: Financial transaction fact with monetary amounts
-- Refresh: Real-time
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_DZ9_FIN_TXN_FACT_RAW (
	DW_PROD_SERV_ID NUMBER(11,0),
	DW_DP_RCD_ID NUMBER(11,0),
	CLNT_ID NUMBER(11,0),
	DW_CUST_ID NUMBER(11,0),
	DW_ACCT_POS_ID NUMBER(11,0),
	DW_TXN_POS_ID NUMBER(11,0),
	DW_TXN_ID NUMBER(11,0),
	DW_PRCS_DTE_DAY_TME_ID NUMBER(11,0),
	DW_TXN_EFF_DTE_TOD_ID NUMBER(11,0),
	DW_OFFCR_ID NUMBER(11,0),
	DW_HH_SCD_ID NUMBER(11,0),
	DW_TXN_EFF_DTE_DTM_ID NUMBER(11,0),
	DW_ACCT_GRP_SCD_ID NUMBER(11,0),
	TXN_AMT NUMBER(18,2),
	FLT_DAY_1_AMT NUMBER(18,2),
	FLT_DAY_2_AMT NUMBER(18,2),
	FLT_DAY_3_AMT NUMBER(18,2),
	FLT_DAY_4_AMT NUMBER(18,2),
	FLT_DAY_5_AMT NUMBER(18,2),
	FLT_DAY_6_AMT NUMBER(18,2),
	FLT_DAY_7_AMT NUMBER(18,2),
	FLT_DAY_8_AMT NUMBER(18,2),
	FLT_DAY_9_AMT NUMBER(18,2),
	FLT_DAY_10_AMT NUMBER(18,2),
	FLT_DAY_11_AMT NUMBER(18,2),
	FLT_DAY_12_AMT NUMBER(18,2),
	PRCS_DTE TIMESTAMP_NTZ(9),
	DW_ARGMT_EXTD_ATT_SCD_ID NUMBER(11,0),
	DW_ACCT_GRP_ARGMT_SCD_ID NUMBER(11,0),
	DW_PROD_SERV_ARGMT_SCD_ID NUMBER(11,0),
	DW_IP_EXTD_ATT_SCD_ID NUMBER(11,0),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Financial transaction fact from FIS'
CLUSTER BY (DW_PROD_SERV_ID, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_OZO_MNY_TXN_ARD_RAW - Money Transaction ARD
// ============================================================================
export const moneyTransactionARDBronzeDDL: DDLScript = {
  tableName: "TB_DP_OZO_MNY_TXN_ARD_RAW",
  schema: "FIS_RAW",
  description: "Money transaction ARD extract with comprehensive transaction details",
  dependencies: [],
  estimatedRows: "800M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Money Transaction ARD
-- Source: FIS Core Banking System
-- Purpose: Comprehensive money transaction data from ARD extract
-- Refresh: Real-time
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_OZO_MNY_TXN_ARD_RAW (
	TRN_ODW_TYP VARCHAR(10),
	TRN_BANK_NBR VARCHAR(10),
	TRN_ACCT_NBR VARCHAR(255),
	TRN_TRANS_CDE VARCHAR(10),
	TRN_TRANS_SRCE NUMBER(10,0),
	TRN_TRANS_CNTL NUMBER(18,2),
	TRN_TRANS_AMT NUMBER(18,2),
	TRN_SERIAL_NO_OR_TD_ID NUMBER(11,0),
	TRN_TRANS_TME_SEQ VARCHAR(255),
	TRN_ACCT_TYP NUMBER(10,0),
	TR_DAY_01 NUMBER(10,0),
	TR_DAY_02 NUMBER(10,0),
	TR_DAY_03 NUMBER(10,0),
	TR_DAY_04 NUMBER(10,0),
	TR_DAY_05 NUMBER(10,0),
	TR_DAY_06 NUMBER(10,0),
	TR_DAY_07 NUMBER(10,0),
	TR_DAY_08 NUMBER(10,0),
	TR_DAY_09 NUMBER(10,0),
	TR_DAY_10 NUMBER(10,0),
	TR_DAY_11 NUMBER(10,0),
	TR_DAY_12 NUMBER(10,0),
	TRN_FLOAT_01 NUMBER(10,0),
	TRN_FLOAT_02 NUMBER(10,0),
	TRN_FLOAT_03 NUMBER(10,0),
	TRN_FLOAT_04 NUMBER(10,0),
	TRN_FLOAT_05 NUMBER(10,0),
	TRN_FLOAT_06 NUMBER(10,0),
	TRN_FLOAT_07 NUMBER(10,0),
	TRN_FLOAT_08 NUMBER(10,0),
	TRN_FLOAT_09 NUMBER(10,0),
	TRN_FLOAT_10 NUMBER(10,0),
	TRN_FLOAT_11 NUMBER(10,0),
	TRN_FLOAT_12 NUMBER(10,0),
	TRN_INT_RTE NUMBER(5,3),
	TRN_INTRNL_TRANS_CDE VARCHAR(10),
	TRN_LIST_POST_IND VARCHAR(1),
	TRN_ORIG_TRANS_CDE VARCHAR(10),
	TRN_RET_PLN NUMBER(10,0),
	TRN_RET_TRANS_CDE VARCHAR(10),
	TRN_RET_TRANS_DESC VARCHAR(255),
	TRN_RTE_EFF_DTE TIMESTAMP_NTZ(9),
	TRN_SERV_CHRG_IND VARCHAR(1),
	TRN_TRANS_DESC VARCHAR(255),
	TRN_TRANS_DTE TIMESTAMP_NTZ(9),
	TRN_TRANS_TYP VARCHAR(1),
	TR_USERID VARCHAR(10),
	TR_SRC_FLD_1 VARCHAR(10),
	TR_SRC_FLD_2 VARCHAR(10),
	TR_SRC_FLD_3 VARCHAR(10),
	TR_SRC_FLD_4 VARCHAR(10),
	TR_ENTRY_CLASS_CDE VARCHAR(10),
	TR_COMP_ID VARCHAR(10),
	TR_INDIV_ID VARCHAR(32),
	TR_FTM_GROUP_ID VARCHAR(10),
	TR_ACH_TRACE_ID VARCHAR(32),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Money transaction ARD from FIS'
CLUSTER BY (TRN_ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_OZU_MAINT_ARD_RAW - Maintenance Transaction ARD
// ============================================================================
export const maintenanceTransactionARDBronzeDDL: DDLScript = {
  tableName: "TB_DP_OZU_MAINT_ARD_RAW",
  schema: "FIS_RAW",
  description: "Account maintenance transaction ARD - holds, stops, updates",
  dependencies: [],
  estimatedRows: "100M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Maintenance Transaction ARD
-- Source: FIS Core Banking System
-- Purpose: Account maintenance transactions (holds, stops, updates)
-- Refresh: Real-time
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_OZU_MAINT_ARD_RAW (
	LG_ODW_TYP VARCHAR(10),
	LG_BANK_NBR VARCHAR(10),
	LG_ACCT_NBR VARCHAR(255),
	LG_TD_ID NUMBER(11,0),
	LG_TRANS_CDE VARCHAR(10),
	LG_TRANS_SRCE NUMBER(10,0),
	LG_TRANS_CNTL NUMBER(18,2),
	LG_TRANS_TME NUMBER(10,0),
	LG_TRANS_TME_SEQ VARCHAR(255),
	LG_ACCT_TYP NUMBER(10,0),
	LG_AMT NUMBER(18,2),
	LG_DESC VARCHAR(255),
	LG_HOLD_ID NUMBER(10,0),
	LG_HOLD_TYP NUMBER(10,0),
	LG_STOP_ID NUMBER(10,0),
	LG_STOP_TYP NUMBER(10,0),
	LG_STOP_AMT NUMBER(18,2),
	LG_OLD_KYWRD VARCHAR(255),
	LG_NEW_KYWRD VARCHAR(255),
	LG_KYWRD_DESC VARCHAR(255),
	LG_ENT_DTE TIMESTAMP_NTZ(9),
	LG_EXP_DTE TIMESTAMP_NTZ(9),
	LG_TRANS_DTE TIMESTAMP_NTZ(9),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Maintenance transaction ARD from FIS'
CLUSTER BY (LG_ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_OZQ_STP_ARD_RAW - Stop Payment ARD
// ============================================================================
export const stopPaymentARDBronzeDDL: DDLScript = {
  tableName: "TB_DP_OZQ_STP_ARD_RAW",
  schema: "FIS_RAW",
  description: "Stop payment details from ARD extract",
  dependencies: [],
  estimatedRows: "30M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Stop Payment ARD
-- Source: FIS Core Banking System
-- Purpose: Stop payment transaction details
-- Refresh: Real-time
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_OZQ_STP_ARD_RAW (
	STP_ODW_TYP VARCHAR(10),
	STP_BANK_NBR VARCHAR(10),
	STP_ACCT_NBR VARCHAR(255),
	STP_STOP_ID NUMBER(10,0),
	STP_CHK_ISSUE_DTE TIMESTAMP_NTZ(9),
	STP_DTE_ENTRD TIMESTAMP_NTZ(9),
	STP_DTE_EXP TIMESTAMP_NTZ(9),
	STP_END_SERIAL_NBR NUMBER(11,0),
	STP_PAYEE VARCHAR(255),
	STP_RESN VARCHAR(255),
	STP_SERIAL_NBR NUMBER(11,0),
	STP_STOP_AMT NUMBER(18,2),
	STP_TYP NUMBER(10,0),
	STP_VERBAL_WRITTEN_IND VARCHAR(1),
	STP_WAV_SERV_CHRG VARCHAR(1),
	ST_ENTRY_CLASS_CDE VARCHAR(10),
	ST_COMP_ID VARCHAR(10),
	ST_INDIV_ID VARCHAR(32),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Stop payment ARD from FIS'
CLUSTER BY (STP_ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_OZV_HLD_ARD_RAW - Hold Transaction ARD
// ============================================================================
export const holdTransactionARDBronzeDDL: DDLScript = {
  tableName: "TB_DP_OZV_HLD_ARD_RAW",
  schema: "FIS_RAW",
  description: "Account hold transaction details from ARD extract",
  dependencies: [],
  estimatedRows: "60M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Hold Transaction ARD
-- Source: FIS Core Banking System
-- Purpose: Account hold transaction details
-- Refresh: Real-time
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_OZV_HLD_ARD_RAW (
	HD_ODW_TYP VARCHAR(10),
	HD_BANK_NBR VARCHAR(10),
	HD_ACCT_NBR VARCHAR(255),
	HD_HOLD_ID NUMBER(10,0),
	HD_AMT NUMBER(18,2),
	HD_DEL VARCHAR(1),
	HD_DESC VARCHAR(255),
	HD_DTE_ENTRD TIMESTAMP_NTZ(9),
	HD_DTE_EXP TIMESTAMP_NTZ(9),
	HD_RQST VARCHAR(255),
	HD_TYP NUMBER(10,0),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Hold transaction ARD from FIS'
CLUSTER BY (HD_ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// DDL SCRIPT CATALOG
// ============================================================================
export const transactionsBronzeDDLCatalog = {
  domain: "Transactions",
  layer: "Bronze",
  schema: "FIS_RAW",
  sourceSystem: "FIS Core Banking",
  scripts: [
    transactionDimensionBronzeDDL,
    financialTransactionFactBronzeDDL,
    moneyTransactionARDBronzeDDL,
    maintenanceTransactionARDBronzeDDL,
    stopPaymentARDBronzeDDL,
    holdTransactionARDBronzeDDL
  ],
  totalTables: 6,
  estimatedTotalRows: "2.24B",
  refreshSchedule: "Real-time streaming from FIS",
  dataRetention: "Raw data retained for 90 days in Bronze layer",
  notes: [
    "All tables use FIS native table names from source system",
    "Schema is FIS_RAW to match landing zone",
    "Real-time streaming for transaction tables",
    "Float tracking for up to 12 days on transactions",
    "ERROR_FLAG and ERROR_MESSAGE columns track data quality issues",
    "SCAN_TIME tracks when data was extracted from FIS",
    "ACH_TRACE_ID supports ACH transaction tracking and reconciliation"
  ]
};

export default transactionsBronzeDDLCatalog;
