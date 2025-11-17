// Transactions Domain - FIS-ADS Bronze Layer
// Real FIS-ADS payment and transaction tables

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
// MONEY TRANSACTIONS - FROM DP_OZO_MNY_TXN_ARD (used in mapping doc)
// Covers deposit transaction detail including certificates, checks, transfers
// ============================================================================

export const moneyTransactionBronze: BronzeTableDefinition = {
  name: "bronze.money_transaction",
  schema: "bronze",
  source: {
    fisTable: "DP_OZO_MNY_TXN_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Real-time",
  },
  description: "Money/deposit transactions - all transaction types on deposit accounts",
  businessKey: "TRN_TRANS_TME_SEQ",
  columns: [
    {
      name: "TRANSACTION_ID",
      fisColumnName: "TRN_TRANS_TME_SEQ",
      dataType: "VARCHAR(30)",
      nullable: false,
      businessMeaning: "Unique transaction sequence ID",
    },
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "TRN_ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "TIME_DEPOSIT_ID",
      fisColumnName: "TRN_TD_ID",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Time deposit ID if applicable",
    },
    {
      name: "TRANSACTION_DATE",
      fisColumnName: "TRN_TRANS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Transaction date",
    },
    {
      name: "PROCESS_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
    {
      name: "TRANSACTION_CODE",
      fisColumnName: "TRN_TRANS_CDE",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Transaction type code",
    },
    {
      name: "TRANSACTION_AMOUNT",
      fisColumnName: "TRN_TRANS_AMT",
      dataType: "DECIMAL(15,2)",
      nullable: false,
      businessMeaning: "Transaction amount",
    },
    {
      name: "TRANSACTION_TYPE",
      fisColumnName: "TRN_TRANS_TYP",
      dataType: "VARCHAR(5)",
      nullable: false,
      businessMeaning: "Debit or Credit indicator",
    },
    {
      name: "TRANSACTION_DESCRIPTION",
      fisColumnName: "TRN_TRANS_DESC",
      dataType: "VARCHAR(200)",
      nullable: true,
      businessMeaning: "Transaction description",
    },
    {
      name: "TRANSACTION_CONTROL_NUMBER",
      fisColumnName: "TRN_TRANS_CNTL",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Transaction control number for tracking",
    },
    {
      name: "TRANSACTION_STATUS",
      fisColumnName: "TRN_STAT_CDE",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "POSTED, PENDING, REVERSED, FAILED",
    },
    {
      name: "FTM_GROUP_ID",
      fisColumnName: "TR_FTM_GROUP_ID",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "FTM group ID for batch processing",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
  ],
  recordEstimate: "500M+ transactions/month",
  scd2: false,
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_NUMBER", "TRANSACTION_CODE"],
};

// ============================================================================
// MAINTENANCE LOG TRANSACTIONS - FROM TB_DP_OZU_MAINT_ARD
// Covers holds, stops, and account maintenance
// ============================================================================

export const maintenanceLogBronze: BronzeTableDefinition = {
  name: "bronze.maintenance_log_transaction",
  schema: "bronze",
  source: {
    fisTable: "TB_DP_OZU_MAINT_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Real-time",
  },
  description: "Account maintenance transactions - holds, stop payments, suspensions",
  businessKey: "LG_TRANS_TME_SEQ",
  columns: [
    {
      name: "TRANSACTION_ID",
      fisColumnName: "LG_TRANS_TME_SEQ",
      dataType: "VARCHAR(30)",
      nullable: false,
      businessMeaning: "Maintenance transaction sequence ID",
    },
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "LG_ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "TRANSACTION_CODE",
      fisColumnName: "LG_TRANS_CDE",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Transaction type code",
    },
    {
      name: "BANK_NUMBER",
      fisColumnName: "LG_BANK_NBR",
      dataType: "NUMBER(10)",
      nullable: false,
      businessMeaning: "Bank number",
    },
    {
      name: "HOLD_ID",
      fisColumnName: "LG_HOLD_ID",
      dataType: "VARCHAR(30)",
      nullable: true,
      businessMeaning: "Hold ID if hold transaction",
    },
    {
      name: "HOLD_TYPE",
      fisColumnName: "LG_HOLD_TYP",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Type of hold (LEGAL, LEVY, NSF, etc)",
    },
    {
      name: "HOLD_AMOUNT",
      fisColumnName: "LG_AMT",
      dataType: "DECIMAL(15,2)",
      nullable: true,
      businessMeaning: "Hold amount",
    },
    {
      name: "HOLD_DESCRIPTION",
      fisColumnName: "LG_DESC",
      dataType: "VARCHAR(200)",
      nullable: true,
      businessMeaning: "Hold description",
    },
    {
      name: "HOLD_ENTRY_DATE",
      fisColumnName: "LG_ENT_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date hold was entered",
    },
    {
      name: "HOLD_EXPIRATION_DATE",
      fisColumnName: "LG_EXP_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Hold expiration date",
    },
    {
      name: "STOP_PAYMENT_ID",
      fisColumnName: "LG_STOP_ID",
      dataType: "VARCHAR(30)",
      nullable: true,
      businessMeaning: "Stop payment ID if stop transaction",
    },
    {
      name: "STOP_PAYMENT_TYPE",
      fisColumnName: "LG_STOP_TYP",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Stop payment type",
    },
    {
      name: "STOP_AMOUNT",
      fisColumnName: "LG_STOP_AMT",
      dataType: "DECIMAL(15,2)",
      nullable: true,
      businessMeaning: "Stop payment amount",
    },
    {
      name: "KEYWORD_OLD_VALUE",
      fisColumnName: "LG_OLD_KYWRD",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Previous value if update",
    },
    {
      name: "KEYWORD_NEW_VALUE",
      fisColumnName: "LG_NEW_KYWRD",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "New value if update",
    },
    {
      name: "KEYWORD_DESCRIPTION",
      fisColumnName: "LG_KYWRD_DESC",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Keyword description",
    },
    {
      name: "TRANSACTION_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Transaction date",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
  ],
  recordEstimate: "50M+ transactions/month",
  scd2: false,
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_NUMBER", "TRANSACTION_CODE"],
};

// ============================================================================
// STOP PAYMENT DETAILS - FROM TB_DP_OZQ_STP_ARD
// ============================================================================

export const stopPaymentDetailsBronze: BronzeTableDefinition = {
  name: "bronze.stop_payment_details",
  schema: "bronze",
  source: {
    fisTable: "TB_DP_OZQ_STP_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Real-time",
  },
  description: "Stop payment detail information",
  businessKey: "STP_ID",
  columns: [
    {
      name: "STOP_PAYMENT_ID",
      fisColumnName: "STP_ID",
      dataType: "VARCHAR(30)",
      nullable: false,
      businessMeaning: "Stop payment unique ID",
    },
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "STP_ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "STOP_AMOUNT",
      fisColumnName: "STP_AMT",
      dataType: "DECIMAL(15,2)",
      nullable: false,
      businessMeaning: "Stop payment amount",
    },
    {
      name: "CHECK_SERIAL_NUMBER",
      fisColumnName: "STP_SERIAL_NBR",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Check serial number",
    },
    {
      name: "CHECK_END_SERIAL_NUMBER",
      fisColumnName: "STP_END_SERIAL_NBR",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Check range end serial number",
    },
    {
      name: "STOP_ENTERED_DATE",
      fisColumnName: "STP_DTE_ENTRD",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date stop was entered",
    },
    {
      name: "STOP_EXPIRATION_DATE",
      fisColumnName: "STP_DTE_EXP",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Stop expiration date",
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
// HOLD TRANSACTION DETAILS - FROM TB_DP_OZV_HLD_ARD
// ============================================================================

export const holdTransactionDetailsBronze: BronzeTableDefinition = {
  name: "bronze.hold_transaction_details",
  schema: "bronze",
  source: {
    fisTable: "TB_DP_OZV_HLD_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Real-time",
  },
  description: "Account hold transaction details",
  businessKey: "HD_ID",
  columns: [
    {
      name: "HOLD_ID",
      fisColumnName: "HD_ID",
      dataType: "VARCHAR(30)",
      nullable: false,
      businessMeaning: "Unique hold ID",
    },
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "HD_ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "HOLD_AMOUNT",
      fisColumnName: "HD_AMT",
      dataType: "DECIMAL(15,2)",
      nullable: false,
      businessMeaning: "Hold amount",
    },
    {
      name: "HOLD_TYPE",
      fisColumnName: "HD_TYPE",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Hold type code",
    },
    {
      name: "HOLD_REASON",
      fisColumnName: "HD_REASON",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Reason for hold",
    },
    {
      name: "HOLD_ENTERED_DATE",
      fisColumnName: "HD_ENT_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date hold was entered",
    },
    {
      name: "HOLD_EXPIRATION_DATE",
      fisColumnName: "HD_EXP_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Hold expiration date",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
  ],
  recordEstimate: "20-50M records",
  scd2: false,
};

export const transactionsBronzeTables = [
  moneyTransactionBronze,
  maintenanceLogBronze,
  stopPaymentDetailsBronze,
  holdTransactionDetailsBronze,
];

export const transactionsBronzeLayerComplete = {
  tables: transactionsBronzeTables,
  totalTables: transactionsBronzeTables.length,
  totalRows: 10000000 + 5000000 + 1000000 + 2000000,
  description: 'Transactions domain bronze layer - raw data from FIS-ADS source tables',
};

export default transactionsBronzeTables;
