/**
 * DEPOSITS DOMAIN - BRONZE LAYER - DDL SCRIPTS
 * 
 * CREATE TABLE statements for Bronze layer tables
 * Source: FIS raw data landing zone
 * Schema: FIS_RAW
 * Refresh: Daily/Real-time batch loads from FIS
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
// FCT_DEPOSIT_DAILY_BALANCE_RAW - Daily Balance Fact
// ============================================================================
export const depositDailyBalanceBronzeDDL: DDLScript = {
  tableName: "FCT_DEPOSIT_DAILY_BALANCE_RAW",
  schema: "FIS_RAW",
  description: "Daily deposit account balance snapshots",
  dependencies: [],
  estimatedRows: "100M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Deposit Daily Balance Fact
-- Source: FIS Core Banking System
-- Purpose: Daily account balance snapshots
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.FCT_DEPOSIT_DAILY_BALANCE_RAW (
	CALENDAR_DATE TIMESTAMP_NTZ(9),
	ACCOUNT_NUMBER VARCHAR(32),
	BALANCE_DATE TIMESTAMP_NTZ(9),
	CURRENT_BALANCE NUMBER(18,2),
	AVAILABLE_BALANCE NUMBER(18,2),
	PREVIOUS_DAY_LEDGER_BALANCE_AMOUNT NUMBER(18,2),
	PREVIOUS_MONTH_LEDGER_BALANCE_AMOUNT NUMBER(18,2),
	AVG_LEDGER_BALANCE_YTD_AMOUNT NUMBER(18,2),
	AVG_LEDGER_BALANCE_MTD_AMOUNT NUMBER(18,2),
	AVAILABLE_BALANCE_AMOUNT NUMBER(18,2),
	INTEREST_PAID_YTD_AMOUNT NUMBER(18,2),
	INTEREST_PAID_MTD_AMOUNT NUMBER(18,2),
	INTEREST_PAID_PREVIOUS_YTD_AMOUNT NUMBER(18,2),
	LEDGER_BALANCE NUMBER(18,2),
	TD_PRINCIPAL_BALANCE NUMBER(18,2),
	BUSINESS_DATE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9)
)
COMMENT = 'Bronze layer: Daily deposit balance snapshots from FIS'
CLUSTER BY (ACCOUNT_NUMBER, CALENDAR_DATE)
;
  `
};

// ============================================================================
// FCT_DEPOSIT_HOLD_TRANSACTION_RAW - Hold Transaction Fact
// ============================================================================
export const depositHoldTransactionBronzeDDL: DDLScript = {
  tableName: "FCT_DEPOSIT_HOLD_TRANSACTION_RAW",
  schema: "FIS_RAW",
  description: "Account hold transactions",
  dependencies: [],
  estimatedRows: "50M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Deposit Hold Transaction Fact
-- Source: FIS Core Banking System
-- Purpose: Account holds and restrictions
-- Refresh: Real-time
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.FCT_DEPOSIT_HOLD_TRANSACTION_RAW (
	ACCT_GRP_NBR VARCHAR(32),
	BANK_NUMBER VARCHAR(3),
	BRANCH_NUMBER NUMBER(7,0),
	HOLD_TRANSACTION_NUMBER NUMBER(5,0),
	HOLD_TRANSACTION_TYPE VARCHAR(10),
	HOLD_TRANSACTION_REASON VARCHAR(20),
	HOLD_AMOUNT NUMBER(18,2),
	HOLD_TRANSACTION_ENTERED_DATE TIMESTAMP_NTZ(9),
	HOLD_TRANSACTION_EXPIRATION_DATE TIMESTAMP_NTZ(9),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9)
)
COMMENT = 'Bronze layer: Account hold transactions from FIS'
CLUSTER BY (ACCT_GRP_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_C2_DYA_ACCT_GRP_SCD_DIM_RAW - Account Group SCD Dimension
// ============================================================================
export const accountGroupSCDBronzeDDL: DDLScript = {
  tableName: "TB_C2_DYA_ACCT_GRP_SCD_DIM_RAW",
  schema: "FIS_RAW",
  description: "Account Group Slowly Changing Dimension",
  dependencies: [],
  estimatedRows: "25M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Account Group SCD Dimension
-- Source: FIS Core Banking System
-- Purpose: Account group attributes with SCD Type 2 tracking
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_C2_DYA_ACCT_GRP_SCD_DIM_RAW (
	DW_ACCT_GRP_SCD_ID NUMBER(11,0),
	DW_ACCT_GRP_ID NUMBER(11,0),
	ACCT_GRP_NBR VARCHAR(32),
	APPL_CDE VARCHAR(5),
	ACCT_TYP_CDE VARCHAR(3),
	TAX_ID_NBR VARCHAR(9),
	TAX_ID_CDE VARCHAR(1),
	ACCT_CUST_SHRT_NME VARCHAR(50),
	PRCS_GRP_NBR VARCHAR(3),
	ACCT_OPEN_DTE TIMESTAMP_NTZ(9),
	ACCT_CLASS_NME VARCHAR(20),
	FRGN_CLASS_CDE VARCHAR(1),
	CTRY_CDE VARCHAR(5),
	ACCT_NAICS_CDE VARCHAR(6),
	ACCT_RISK_RTG_CDE VARCHAR(8),
	CST_CNTR_NBR NUMBER(7,0),
	COMB_STMT_IND VARCHAR(1),
	EMP_TYP_CDE VARCHAR(1),
	ACCT_TRCK_CDE VARCHAR(12),
	ACCT_OPEN_IND VARCHAR(1),
	ACCT_CLOS_DTE TIMESTAMP_NTZ(9),
	ACCT_OFFCR_NME VARCHAR(20),
	ACCT_OFFCR_NBR NUMBER(5,0),
	ACCT_OFFCR_INITLS_NME VARCHAR(3),
	ACCT_BRNCH_NBR NUMBER(7,0),
	ACCT_BRNCH_DESC VARCHAR(70),
	ACCT_SCNDY_OFFCR_INITLS_NME VARCHAR(3),
	ACCT_SCNDY_OFFCR_NME VARCHAR(30),
	ACCT_SCNDY_OFFCR_NBR NUMBER(5,0),
	ACCT_TYP_DESC VARCHAR(43),
	DP_CAT_CDE VARCHAR(1),
	MAX_BAL NUMBER(18,2),
	DP_CAT_DESC VARCHAR(20),
	CLNT_ID NUMBER(11,0),
	DW_ASP_ID NUMBER(11,0),
	CUR_REC_IND VARCHAR(1),
	EFF_DTE TIMESTAMP_NTZ(9),
	SOR_EXP_DTE TIMESTAMP_NTZ(9),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Account group SCD from FIS'
CLUSTER BY (ACCT_GRP_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_DYY_C2_ACCT_SCD_DIM_RAW - Deposit Account SCD Dimension
// ============================================================================
export const depositAccountSCDBronzeDDL: DDLScript = {
  tableName: "TB_DP_DYY_C2_ACCT_SCD_DIM_RAW",
  schema: "FIS_RAW",
  description: "Deposit Account Slowly Changing Dimension with complete account attributes",
  dependencies: [],
  estimatedRows: "30M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Deposit Account SCD Dimension
-- Source: FIS Core Banking System
-- Purpose: Deposit account master with SCD Type 2 tracking
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_DYY_C2_ACCT_SCD_DIM_RAW (
	DW_PROD_SERV_ID NUMBER(11,0),
	ACCT_NBR VARCHAR(32),
	ACCT_GRP_NBR VARCHAR(32),
	APPL_CDE VARCHAR(5),
	ACCT_TYP_CDE VARCHAR(3),
	ACCT_TYP_DESC VARCHAR(43),
	DP_CAT_CDE VARCHAR(1),
	DP_CAT_DESC VARCHAR(20),
	INT_PLN_NBR NUMBER(3,0),
	INT_PLN_DESC VARCHAR(20),
	INT_PLN_RTE NUMBER(9,6),
	TAX_ID_NBR VARCHAR(9),
	TAX_ID_CDE VARCHAR(1),
	ACCT_CUST_SHRT_NME VARCHAR(24),
	PRCS_GRP_NBR VARCHAR(3),
	ACCT_OPEN_DTE TIMESTAMP_NTZ(9),
	ACCT_CLASS_NME VARCHAR(20),
	TME_DP_CLOS_DTE TIMESTAMP_NTZ(9),
	TME_DP_ID_NBR VARCHAR(11),
	TME_DP_ORIG_DTE TIMESTAMP_NTZ(9),
	TME_DP_ORIG_BAL NUMBER(18,2),
	TME_DP_FRST_RNWL_DTE TIMESTAMP_NTZ(9),
	TME_DP_ORIG_INT_RTE NUMBER(9,6),
	TME_DP_FNL_MAT_DTE TIMESTAMP_NTZ(9),
	FRGN_CLASS_CDE VARCHAR(1),
	CTRY_CDE VARCHAR(5),
	ACCT_NAICS_CDE VARCHAR(6),
	CST_CNTR_NBR NUMBER(7,0),
	COMB_STMT_IND VARCHAR(1),
	CLOS_RESN_CDE VARCHAR(1),
	CHRG_NO_CHRG_CDE VARCHAR(1),
	BLKFL_IND VARCHAR(1),
	ACCT_TRCK_CDE VARCHAR(12),
	ANLYS_CYC_CDE VARCHAR(3),
	ACCT_OPEN_IND VARCHAR(1),
	ACCT_CLOS_DTE TIMESTAMP_NTZ(9),
	SERV_CHRG_DESC VARCHAR(20),
	SERV_CHRG_CDE NUMBER(3,0),
	ACCT_STAT_CDE VARCHAR(4),
	CUR_INT_RTE NUMBER(9,6),
	ACCT_BRNCH_NBR NUMBER(7,0),
	CLNT_ID NUMBER(11,0),
	DW_ASP_ID NUMBER(11,0),
	EFF_DTE TIMESTAMP_NTZ(9),
	SOR_EXP_DTE TIMESTAMP_NTZ(9),
	CUR_REC_IND VARCHAR(1),
	DW_ULT_PROD_SERV_ID NUMBER(11,0),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Deposit account SCD from FIS'
CLUSTER BY (ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_OZZ_ACCT_ARD_RAW - Deposit Account ARD
// ============================================================================
export const depositAccountARDBronzeDDL: DDLScript = {
  tableName: "TB_DP_OZZ_ACCT_ARD_RAW",
  schema: "FIS_RAW",
  description: "Deposit Account ARD extract with comprehensive account data",
  dependencies: [],
  estimatedRows: "30M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Deposit Account ARD
-- Source: FIS Core Banking System
-- Purpose: Comprehensive deposit account master from ARD extract
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_OZZ_ACCT_ARD_RAW (
	AC_ODW_TYP VARCHAR(10),
	AC_BANK_NBR VARCHAR(10),
	AC_ACCT_NBR VARCHAR(255),
	AC_ACCT_TYP NUMBER(10,0),
	AC_NAME VARCHAR(255),
	AC_STATUS VARCHAR(10),
	AC_OPEN_DTE TIMESTAMP_NTZ(9),
	AC_CLSE_DTE TIMESTAMP_NTZ(9),
	AC_ACCT_CLOSNG_RESN VARCHAR(255),
	AC_REOPEN_DTE TIMESTAMP_NTZ(9),
	AC_INT_STATED_RTE NUMBER(5,3),
	AC_INT_PLN_CDE VARCHAR(10),
	AC_BRNCH_NBR VARCHAR(32),
	AC_COST_CENTER VARCHAR(32),
	AC_PRIM_OFFCR VARCHAR(32),
	AC_SECD_OFFCR VARCHAR(32),
	AC_THRD_OFFCR VARCHAR(32),
	AC_USER_01 VARCHAR(1),
	AC_USER_02 VARCHAR(1),
	AC_USER_03 VARCHAR(1),
	AC_USER_04 VARCHAR(1),
	AC_USER_05 VARCHAR(1),
	AC_DTE_LST_MNT TIMESTAMP_NTZ(9),
	AC_PROCESS_DTE TIMESTAMP_NTZ(9),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Deposit account ARD from FIS'
CLUSTER BY (AC_ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_OZX_BAL_ARD_RAW - Account Balance ARD
// ============================================================================
export const accountBalanceARDBronzeDDL: DDLScript = {
  tableName: "TB_DP_OZX_BAL_ARD_RAW",
  schema: "FIS_RAW",
  description: "Account balance ARD extract with daily balances and aggregates",
  dependencies: [],
  estimatedRows: "150M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Account Balance ARD
-- Source: FIS Core Banking System
-- Purpose: Daily account balances with MTD/YTD aggregates
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_OZX_BAL_ARD_RAW (
	BL_ODW_TYP VARCHAR(10),
	BL_BANK_NBR VARCHAR(10),
	BL_ACCT_NBR VARCHAR(255),
	BL_CUR_BAL NUMBER(18,2),
	BL_AVL_BAL NUMBER(18,2),
	BL_LGR_BAL NUMBER(18,2),
	BL_COL_BAL_WORK NUMBER(18,2),
	BL_CLSNG_BAL NUMBER(18,2),
	BL_AVG_LGR_BAL_MTD_AMT NUMBER(18,2),
	BL_AVG_LGR_BAL_YTD_AMT NUMBER(18,2),
	BL_INT_PD_YTD NUMBER(18,2),
	BL_INT_PD_MTD_AMT NUMBER(18,2),
	BL_SERV_CHRG_YTD_AMT NUMBER(18,2),
	BL_SERV_CHRG_CDE VARCHAR(10),
	BL_STMT_CYC NUMBER(10,0),
	BL_DTE_LST_STMT TIMESTAMP_NTZ(9),
	BL_NXT_STMT_DTE TIMESTAMP_NTZ(9),
	BL_LST_ANAL_DTE TIMESTAMP_NTZ(9),
	BL_NXT_ANAL_DTE TIMESTAMP_NTZ(9),
	PRCS_YR_MTH_NBR VARCHAR(6),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Account balance ARD from FIS'
CLUSTER BY (BL_ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DP_SZ9_DP_ACCT_D_FACT_RAW - Deposit Account Daily Fact
// ============================================================================
export const depositAccountDailyFactBronzeDDL: DDLScript = {
  tableName: "TB_DP_SZ9_DP_ACCT_D_FACT_RAW",
  schema: "FIS_RAW",
  description: "Deposit account daily fact table",
  dependencies: [],
  estimatedRows: "200M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Deposit Account Daily Fact
-- Source: FIS Core Banking System
-- Purpose: Daily account fact snapshots
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DP_SZ9_DP_ACCT_D_FACT_RAW (
	DW_PROD_SERV_ID NUMBER(11,0),
	DW_CUST_ID NUMBER(11,0),
	CLNT_ID NUMBER(11,0),
	DW_POS_ID NUMBER(11,0),
	DW_DAY_TME_ID NUMBER(11,0),
	DW_OFFCR_ID NUMBER(11,0),
	DW_DP_RCD_ID NUMBER(11,0),
	DW_HH_SCD_ID NUMBER(11,0),
	DW_ACCT_GRP_SCD_ID NUMBER(11,0),
	ACCRD_INT_MTD_AMT NUMBER(25,9),
	AVAIL_BAL_AMT NUMBER(18,2),
	AVG_COL_BAL_MTD_AMT NUMBER(18,2),
	AVG_LGR_BAL_MTD_AMT NUMBER(18,2),
	COL_BAL_AMT NUMBER(18,2),
	CONSEC_DAY_ODN_CNT NUMBER(3,0),
	INT_PD_MTD_AMT NUMBER(18,2),
	INT_PD_YTD_AMT NUMBER(18,2),
	LGR_BAL_AMT NUMBER(18,2),
	WAV_YTD_BAL_AMT NUMBER(18,2),
	PRCS_DTE TIMESTAMP_NTZ(9),
	TOT_FLT_AMT NUMBER(18,2),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Deposit account daily fact from FIS'
CLUSTER BY (DW_PROD_SERV_ID, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_ACCT_PKG_ARD_RAW - Account Package ARD
// ============================================================================
export const accountPackageARDBronzeDDL: DDLScript = {
  tableName: "TB_ACCT_PKG_ARD_RAW",
  schema: "FIS_RAW",
  description: "Account package and tier information",
  dependencies: [],
  estimatedRows: "20M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Account Package ARD
-- Source: FIS Core Banking System
-- Purpose: Account package enrollment and tier information
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_ACCT_PKG_ARD_RAW (
	PKG_DESC VARCHAR(255),
	PKG_ID NUMBER(11,0),
	PKG_NME VARCHAR(40),
	CNSL_ACCT_TYP_CDE VARCHAR(10),
	CNSL_ACCT_TYP_DESC VARCHAR(70),
	ACCT_NBR VARCHAR(32),
	TIER_ID NUMBER(11,0),
	TIER_LVL_NBR VARCHAR(10),
	TIER_NME VARCHAR(40),
	PRCS_DTE TIMESTAMP_NTZ(9),
	VM_ACCT_ENRLMT_ROLE_CDE VARCHAR(10),
	FRCE_IND VARCHAR(1),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Account package ARD from FIS'
CLUSTER BY (ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// TB_DEBIT_CARD_RAW - Debit Card
// ============================================================================
export const debitCardBronzeDDL: DDLScript = {
  tableName: "TB_DEBIT_CARD_RAW",
  schema: "FIS_RAW",
  description: "Debit card information linked to deposit accounts",
  dependencies: [],
  estimatedRows: "40M",
  ddlStatement: `
-- ============================================================================
-- BRONZE LAYER: Debit Card
-- Source: FIS Core Banking System
-- Purpose: Debit card master with account linkage
-- Refresh: Daily at 2:00 AM UTC
-- ============================================================================

CREATE OR REPLACE TABLE FIS_RAW.TB_DEBIT_CARD_RAW (
	EFD_CRD_NBR VARCHAR(32),
	CRD_EXP_DTE TIMESTAMP_NTZ(9),
	CRD_REISS_DTE TIMESTAMP_NTZ(9),
	PRMY_SCNDY_CDE VARCHAR(1),
	ACCT_NBR VARCHAR(32),
	CUST_CIS_NBR NUMBER(11,0),
	CRD_STAT_CDE VARCHAR(1),
	CRD_STAT_DESC VARCHAR(100),
	PRCS_DTE TIMESTAMP_NTZ(9),
	SCAN_TIME TIMESTAMP_NTZ(9),
	ERROR_FLAG VARCHAR(16777216),
	ERROR_MESSAGE VARCHAR(16777216)
)
COMMENT = 'Bronze layer: Debit card from FIS'
CLUSTER BY (ACCT_NBR, PRCS_DTE)
;
  `
};

// ============================================================================
// DDL SCRIPT CATALOG
// ============================================================================
export const depositsBronzeDDLCatalog = {
  domain: "Deposits",
  layer: "Bronze",
  schema: "FIS_RAW",
  sourceSystem: "FIS Core Banking",
  scripts: [
    depositDailyBalanceBronzeDDL,
    depositHoldTransactionBronzeDDL,
    accountGroupSCDBronzeDDL,
    depositAccountSCDBronzeDDL,
    depositAccountARDBronzeDDL,
    accountBalanceARDBronzeDDL,
    depositAccountDailyFactBronzeDDL,
    accountPackageARDBronzeDDL,
    debitCardBronzeDDL
  ],
  totalTables: 9,
  estimatedTotalRows: "645M",
  refreshSchedule: "Daily at 2:00 AM UTC, Real-time for transactions",
  dataRetention: "Raw data retained for 90 days in Bronze layer",
  notes: [
    "All tables use FIS native table names from source system",
    "Schema is FIS_RAW to match landing zone",
    "Fact tables include ERROR_FLAG and ERROR_MESSAGE for data quality tracking",
    "SCAN_TIME tracks when data was extracted from FIS",
    "Balance tables support both daily and aggregated views"
  ]
};

export default depositsBronzeDDLCatalog;
