// Transactions Domain - FIS Bronze Layer (FIS_RAW schema)
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
// TB_DP_DZ0_TXN_DIM_RAW - Transaction Dimension
// ============================================================================

export const transactionDimensionBronze: BronzeTableDefinition = {
  name: "TB_DP_DZ0_TXN_DIM_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_DZ0_TXN_DIM",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Real-time",
  },
  description: "Transaction dimension with transaction details and classifications",
  businessKey: "TXN_ID",
  columns: [
    {
      name: "DW_TXN_ID",
      fisColumnName: "DW_TXN_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Transaction ID",
    },
    {
      name: "TXN_ID",
      fisColumnName: "TXN_ID",
      dataType: "NUMBER(15,0)",
      nullable: false,
      businessMeaning: "Transaction ID",
    },
    {
      name: "ACCT_NBR",
      fisColumnName: "ACCT_NBR",
      dataType: "VARCHAR(32)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "TXN_CDE",
      fisColumnName: "TXN_CDE",
      dataType: "VARCHAR(7)",
      nullable: false,
      businessMeaning: "Transaction code",
    },
    {
      name: "TXN_DESC",
      fisColumnName: "TXN_DESC",
      dataType: "VARCHAR(70)",
      nullable: true,
      businessMeaning: "Transaction description",
    },
    {
      name: "TXN_EFF_DTE",
      fisColumnName: "TXN_EFF_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Transaction effective date",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "500M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["ACCT_NBR", "PRCS_DTE"],
};

// ============================================================================
// TB_DP_DZ9_FIN_TXN_FACT_RAW - Financial Transaction Fact
// ============================================================================

export const financialTransactionFactBronze: BronzeTableDefinition = {
  name: "TB_DP_DZ9_FIN_TXN_FACT_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_DZ9_FIN_TXN_FACT",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Real-time",
  },
  description: "Financial transaction fact table",
  businessKey: "DW_TXN_ID",
  columns: [
    {
      name: "DW_PROD_SERV_ID",
      fisColumnName: "DW_PROD_SERV_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Product service ID",
    },
    {
      name: "DW_TXN_ID",
      fisColumnName: "DW_TXN_ID",
      dataType: "NUMBER(11,0)",
      nullable: false,
      businessMeaning: "Transaction ID",
    },
    {
      name: "TXN_AMT",
      fisColumnName: "TXN_AMT",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Transaction amount",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "750M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["DW_PROD_SERV_ID", "PRCS_DTE"],
};

// ============================================================================
// TB_DP_OZO_MNY_TXN_ARD_RAW - Money Transaction ARD
// ============================================================================

export const moneyTransactionARDBronze: BronzeTableDefinition = {
  name: "TB_DP_OZO_MNY_TXN_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_OZO_MNY_TXN_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Real-time",
  },
  description: "Money transaction ARD extract",
  businessKey: "TRN_TRANS_TME_SEQ",
  columns: [
    {
      name: "TRN_ACCT_NBR",
      fisColumnName: "TRN_ACCT_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "TRN_TRANS_CDE",
      fisColumnName: "TRN_TRANS_CDE",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Transaction code",
    },
    {
      name: "TRN_TRANS_AMT",
      fisColumnName: "TRN_TRANS_AMT",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Transaction amount",
    },
    {
      name: "TRN_TRANS_DTE",
      fisColumnName: "TRN_TRANS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "Transaction date",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "800M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
  clusterBy: ["TRN_ACCT_NBR", "PRCS_DTE"],
};

// ============================================================================
// TB_DP_OZU_MAINT_ARD_RAW - Maintenance Transaction ARD
// ============================================================================

export const maintenanceTransactionARDBronze: BronzeTableDefinition = {
  name: "TB_DP_OZU_MAINT_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_OZU_MAINT_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Real-time",
  },
  description: "Account maintenance transaction ARD",
  businessKey: "LG_TRANS_TME_SEQ",
  columns: [
    {
      name: "LG_ACCT_NBR",
      fisColumnName: "LG_ACCT_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "LG_TRANS_CDE",
      fisColumnName: "LG_TRANS_CDE",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Transaction code",
    },
    {
      name: "LG_AMT",
      fisColumnName: "LG_AMT",
      dataType: "NUMBER(18,2)",
      nullable: true,
      businessMeaning: "Amount",
    },
    {
      name: "LG_HOLD_ID",
      fisColumnName: "LG_HOLD_ID",
      dataType: "NUMBER(10,0)",
      nullable: true,
      businessMeaning: "Hold ID",
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
  clusterBy: ["LG_ACCT_NBR", "PRCS_DTE"],
};

// ============================================================================
// TB_DP_OZQ_STP_ARD_RAW - Stop Payment ARD
// ============================================================================

export const stopPaymentARDBronze: BronzeTableDefinition = {
  name: "TB_DP_OZQ_STP_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_OZQ_STP_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Real-time",
  },
  description: "Stop payment details from ARD extract",
  businessKey: "STP_STOP_ID",
  columns: [
    {
      name: "STP_ACCT_NBR",
      fisColumnName: "STP_ACCT_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "STP_STOP_ID",
      fisColumnName: "STP_STOP_ID",
      dataType: "NUMBER(10,0)",
      nullable: false,
      businessMeaning: "Stop payment ID",
    },
    {
      name: "STP_STOP_AMT",
      fisColumnName: "STP_STOP_AMT",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Stop payment amount",
    },
    {
      name: "STP_DTE_ENTRD",
      fisColumnName: "STP_DTE_ENTRD",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      businessMeaning: "Date entered",
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
};

// ============================================================================
// TB_DP_OZV_HLD_ARD_RAW - Hold Transaction ARD
// ============================================================================

export const holdTransactionARDBronze: BronzeTableDefinition = {
  name: "TB_DP_OZV_HLD_ARD_RAW",
  schema: "FIS_RAW",
  source: {
    fisTable: "TB_DP_OZV_HLD_ARD",
    fisSchema: "FIS_RAW",
    refreshFrequency: "Real-time",
  },
  description: "Account hold transaction details from ARD extract",
  businessKey: "HD_HOLD_ID",
  columns: [
    {
      name: "HD_ACCT_NBR",
      fisColumnName: "HD_ACCT_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "HD_HOLD_ID",
      fisColumnName: "HD_HOLD_ID",
      dataType: "NUMBER(10,0)",
      nullable: false,
      businessMeaning: "Hold ID",
    },
    {
      name: "HD_AMT",
      fisColumnName: "HD_AMT",
      dataType: "NUMBER(18,2)",
      nullable: false,
      businessMeaning: "Hold amount",
    },
    {
      name: "HD_DTE_ENTRD",
      fisColumnName: "HD_DTE_ENTRD",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      businessMeaning: "Date entered",
    },
    {
      name: "PRCS_DTE",
      fisColumnName: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "60M records",
  scd2: false,
  partitionBy: ["PRCS_DTE"],
};

export const transactionsBronzeTables = [
  transactionDimensionBronze,
  financialTransactionFactBronze,
  moneyTransactionARDBronze,
  maintenanceTransactionARDBronze,
  stopPaymentARDBronze,
  holdTransactionARDBronze,
];

export const transactionsBronzeLayerComplete = {
  tables: transactionsBronzeTables,
  totalTables: transactionsBronzeTables.length,
  totalRows: 2240000000,
  description: 'Transactions domain bronze layer - FIS_RAW schema with native FIS table names',
  schema: 'FIS_RAW',
};

export default transactionsBronzeTables;
