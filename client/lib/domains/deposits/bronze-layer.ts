// Deposits Domain - FIS Bronze Layer (FIS_RAW schema)
// Direct 1:1 mapping from FIS source system tables

export interface BronzeTableDefinition {
  name: string;
  schema: string;
  source: {
    fisTable: string;
    fisSchema: string;
    refreshFrequency: string;
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
}

// ============================================================================
// FCT_DEPOSIT_DAILY_BALANCE_RAW - Daily Balance Fact
// ============================================================================

export const depositDailyBalanceBronze: BronzeTableDefinition = {
  name: "FCT_DEPOSIT_DAILY_BALANCE_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "FCT_DEPOSIT_DAILY_BALANCE",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Daily deposit account balance snapshots",
  businessKey: "ACCOUNT_NUMBER",
  columns: [
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "ACCOUNT_NUMBER",
      dataType: "VARCHAR(32)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "CALENDAR_DATE",
      fisColumnName: "CALENDAR_DATE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Calendar date",
    },
    {
      name: "CURRENT_BALANCE",
      fisColumnName: "CURRENT_BALANCE",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Current balance",
    },
    {
      name: "AVAILABLE_BALANCE",
      fisColumnName: "AVAILABLE_BALANCE",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Available balance",
    },
    {
      name: "LEDGER_BALANCE",
      fisColumnName: "LEDGER_BALANCE",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Ledger balance",
    },
  ],
  recordEstimate: "100M records",
  scd2: false,
  partitionBy: ["CALENDAR_DATE"],
  clusterBy: ["ACCOUNT_NUMBER", "CALENDAR_DATE"],
};

// ============================================================================
// TB_C2_DYA_ACCT_GRP_SCD_DIM_RAW - Account Group SCD Dimension
// ============================================================================

export const accountGroupSCDBronze: BronzeTableDefinition = {
  name: "TB_C2_DYA_ACCT_GRP_SCD_DIM_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_C2_DYA_ACCT_GRP_SCD_DIM",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Account Group Slowly Changing Dimension",
  businessKey: "ACCT_GRP_NBR",
  columns: [
    {
      name: "DW_ACCT_GRP_SCD_ID",
      fisColumnName: "DW_ACCT_GRP_SCD_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Account group SCD ID",
    },
    {
      name: "ACCT_GRP_NBR",
      fisColumnName: "ACCT_GRP_NBR",
      dataType: "VARCHAR(32)",
      nullable: false,
      businessMeaning: "Account group number",
    },
    {
      name: "ACCT_TYP_CDE",
      fisColumnName: "ACCT_TYP_CDE",
      dataType: "VARCHAR(3)",
      nullable: false,
      businessMeaning: "Account type code",
    },
    {
      name: "ACCT_OPEN_DTE",
      fisColumnName: "ACCT_OPEN_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Account open date",
    },
    {
      name: "EFF_DTE",
      fisColumnName: "EFF_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "SCD effective date",
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
  ],
  recordEstimate: "25M records",
  scd2: true,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["ACCT_GRP_NBR"],
};

// ============================================================================
// TB_DP_DYY_C2_ACCT_SCD_DIM_RAW - Deposit Account SCD Dimension
// ============================================================================

export const depositAccountSCDBronze: BronzeTableDefinition = {
  name: "TB_DP_DYY_C2_ACCT_SCD_DIM_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_DYY_C2_ACCT_SCD_DIM",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Deposit Account Slowly Changing Dimension",
  businessKey: "ACCT_NBR",
  columns: [
    {
      name: "DW_PROD_SERV_ID",
      fisColumnName: "DW_PROD_SERV_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Product service ID",
    },
    {
      name: "ACCT_NBR",
      fisColumnName: "ACCT_NBR",
      dataType: "VARCHAR(32)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "ACCT_TYP_CDE",
      fisColumnName: "ACCT_TYP_CDE",
      dataType: "VARCHAR(3)",
      nullable: false,
      businessMeaning: "Account type code",
    },
    {
      name: "ACCT_OPEN_DTE",
      fisColumnName: "ACCT_OPEN_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Account open date",
    },
    {
      name: "INT_PLN_RTE",
      fisColumnName: "INT_PLN_RTE",
      dataType: "NUMBER(9,6)",
      nullable: true,
      businessMeaning: "Interest plan rate",
    },
    {
      name: "EFF_DTE",
      fisColumnName: "EFF_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "SCD effective date",
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
  ],
  recordEstimate: "30M records",
  scd2: true,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["ACCT_NBR"],
};

// ============================================================================
// TB_DP_OZZ_ACCT_ARD_RAW - Deposit Account ARD
// ============================================================================

export const depositAccountARDBronze: BronzeTableDefinition = {
  name: "TB_DP_OZZ_ACCT_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_OZZ_ACCT_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Deposit Account ARD extract",
  businessKey: "AC_ACCT_NBR",
  columns: [
    {
      name: "AC_ACCT_NBR",
      fisColumnName: "AC_ACCT_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "AC_BANK_NBR",
      fisColumnName: "AC_BANK_NBR",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Bank number",
    },
    {
      name: "AC_STATUS",
      fisColumnName: "AC_STATUS",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Account status",
    },
    {
      name: "AC_OPEN_DTE",
      fisColumnName: "AC_OPEN_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Account open date",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "30M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["AC_ACCT_NBR"],
};

// ============================================================================
// TB_DP_OZX_BAL_ARD_RAW - Account Balance ARD
// ============================================================================

export const accountBalanceARDBronze: BronzeTableDefinition = {
  name: "TB_DP_OZX_BAL_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_OZX_BAL_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Account balance ARD extract",
  businessKey: "BL_ACCT_NBR",
  columns: [
    {
      name: "BL_ACCT_NBR",
      fisColumnName: "BL_ACCT_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "BL_CUR_BAL",
      fisColumnName: "BL_CUR_BAL",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Current balance",
    },
    {
      name: "BL_AVL_BAL",
      fisColumnName: "BL_AVL_BAL",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Available balance",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "150M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["BL_ACCT_NBR"],
};

// ============================================================================
// TB_DP_SZ9_DP_ACCT_D_FACT_RAW - Deposit Account Daily Fact
// ============================================================================

export const depositAccountDailyFactBronze: BronzeTableDefinition = {
  name: "TB_DP_SZ9_DP_ACCT_D_FACT_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_SZ9_DP_ACCT_D_FACT",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Deposit account daily fact table",
  businessKey: "DW_PROD_SERV_ID",
  columns: [
    {
      name: "DW_PROD_SERV_ID",
      fisColumnName: "DW_PROD_SERV_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Product service ID",
    },
    {
      name: "AVAIL_BAL_AMT",
      fisColumnName: "AVAIL_BAL_AMT",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Available balance",
    },
    {
      name: "LGR_BAL_AMT",
      fisColumnName: "LGR_BAL_AMT",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Ledger balance",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "200M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["DW_PROD_SERV_ID"],
};

// ============================================================================
// TB_ACCT_PKG_ARD_RAW - Account Package ARD
// ============================================================================

export const accountPackageARDBronze: BronzeTableDefinition = {
  name: "TB_ACCT_PKG_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_ACCT_PKG_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Account package and tier information",
  businessKey: "PKG_ID",
  columns: [
    {
      name: "PKG_ID",
      fisColumnName: "PKG_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Package ID",
    },
    {
      name: "ACCT_NBR",
      fisColumnName: "ACCT_NBR",
      dataType: "VARCHAR(32)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "PKG_NME",
      fisColumnName: "PKG_NME",
      dataType: "VARCHAR(40)",
      nullable: false,
      businessMeaning: "Package name",
    },
    {
      name: "TIER_NME",
      fisColumnName: "TIER_NME",
      dataType: "VARCHAR(40)",
      nullable: true,
      businessMeaning: "Tier name",
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
  scd2: true,
  partitionBy: ["PRCS_DTE"],
};

// ============================================================================
// TB_DEBIT_CARD_RAW - Debit Card
// ============================================================================

export const debitCardBronze: BronzeTableDefinition = {
  name: "TB_DEBIT_CARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DEBIT_CARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Daily",
  },
  description: "Debit card information linked to deposit accounts",
  businessKey: "EFD_CRD_NBR",
  columns: [
    {
      name: "EFD_CRD_NBR",
      fisColumnName: "EFD_CRD_NBR",
      dataType: "VARCHAR(32)",
      nullable: false,
      businessMeaning: "Debit card number",
    },
    {
      name: "ACCT_NBR",
      fisColumnName: "ACCT_NBR",
      dataType: "VARCHAR(32)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "CRD_STAT_DESC",
      fisColumnName: "CRD_STAT_DESC",
      dataType: "VARCHAR(100)",
      nullable: false,
      businessMeaning: "Card status description",
    },
    {
      name: "CRD_EXP_DTE",
      fisColumnName: "CRD_EXP_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      businessMeaning: "Card expiration date",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "40M records",
  scd2: true,
  partitionBy: ["PRCS_DTE"],
};

export const depositsBronzeTables = [
  depositDailyBalanceBronze,
  accountGroupSCDBronze,
  depositAccountSCDBronze,
  depositAccountARDBronze,
  accountBalanceARDBronze,
  depositAccountDailyFactBronze,
  accountPackageARDBronze,
  debitCardBronze,
];

export const depositsBronzeLayerComplete = {
  tables: depositsBronzeTables,
  totalTables: depositsBronzeTables.length,
  totalRows: 645000000,
  description: 'Deposits domain bronze layer - FIS_RAW schema with native FIS table names',
  schema: 'FIS_RAW',
};

export default depositsBronzeTables;
