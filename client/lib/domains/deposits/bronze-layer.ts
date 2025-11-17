// Deposits Domain - FIS-ADS Bronze Layer
// Real Fiserv FIS-ADS source tables mapped to Bronze layer

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
// ACCOUNT MASTER - FROM TB_DP_OZZ_ACCT_ARD
// ============================================================================

export const accountMasterBronze: BronzeTableDefinition = {
  name: "bronze.deposit_account_master",
  schema: "bronze",
  source: {
    fisTable: "TB_DP_OZZ_ACCT_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Daily",
  },
  description: "Deposit account master data - accounts, products, rates, fees",
  businessKey: "AC_ACCT_NBR",
  columns: [
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "AC_ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "BANK_NUMBER",
      fisColumnName: "AC_BANK_NBR",
      dataType: "NUMBER(10)",
      nullable: false,
      businessMeaning: "Bank identifier",
    },
    {
      name: "BRANCH_NUMBER",
      fisColumnName: "AC_BRNCH_NBR",
      dataType: "NUMBER(10)",
      nullable: false,
      businessMeaning: "Branch number where account opened",
    },
    {
      name: "ACCOUNT_TYPE",
      fisColumnName: "AC_ACCT_TYP",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Account type code",
    },
    {
      name: "ACCOUNT_NAME",
      fisColumnName: "AC_NAME",
      dataType: "VARCHAR(100)",
      nullable: false,
      businessMeaning: "Account name/title",
    },
    {
      name: "ACCOUNT_STATUS",
      fisColumnName: "AC_OPEN_IND",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "ACTIVE, INACTIVE, CLOSED, DORMANT",
    },
    {
      name: "ACCOUNT_STATUS_CODE",
      fisColumnName: "AC_STATUS",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Account status code",
    },
    {
      name: "ACCOUNT_OPEN_DATE",
      fisColumnName: "AC_OPEN_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Account open date",
    },
    {
      name: "ACCOUNT_CLOSE_DATE",
      fisColumnName: "AC_CLSE_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Account close date",
    },
    {
      name: "ACCOUNT_CLOSE_REASON",
      fisColumnName: "AC_ACCT_CLOSNG_RESN",
      dataType: "VARCHAR(200)",
      nullable: true,
      businessMeaning: "Reason for closing account",
    },
    {
      name: "ACCOUNT_REOPEN_DATE",
      fisColumnName: "AC_REOPEN_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date account was reopened",
    },
    {
      name: "CURRENT_INTEREST_RATE",
      fisColumnName: "AC_INT_STATED_RTE",
      dataType: "DECIMAL(8,6)",
      nullable: true,
      businessMeaning: "Current interest rate percentage",
    },
    {
      name: "INTEREST_PLAN_CODE",
      fisColumnName: "AC_INT_PLN_CDE",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Interest plan code",
    },
    {
      name: "MONTHLY_FEE_AMOUNT",
      fisColumnName: "AC_MONTHLY_FEE",
      dataType: "DECIMAL(10,2)",
      nullable: true,
      businessMeaning: "Monthly maintenance fee",
    },
    {
      name: "EXCEPTION_PLAN",
      fisColumnName: "AC_EXCP_PLAN",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Exception plan code",
    },
    {
      name: "ELECTRONIC_STATEMENT",
      fisColumnName: "AC_ELECTR_FEED",
      dataType: "VARCHAR(5)",
      nullable: true,
      businessMeaning: "Electronic statement flag",
    },
    {
      name: "COST_CENTER",
      fisColumnName: "AC_COST_CENTER",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Cost center assignment",
    },
    {
      name: "RENEWAL_CODE",
      fisColumnName: "AC_RENEWAL_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Renewal code for time deposits",
    },
    {
      name: "USER_CODE_1",
      fisColumnName: "AC_USER_01",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "User-defined code 1",
    },
    {
      name: "USER_CODE_2",
      fisColumnName: "AC_USER_02",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "User-defined code 2",
    },
    {
      name: "USER_CODE_3",
      fisColumnName: "AC_USER_03",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "User-defined code 3",
    },
    {
      name: "USER_CODE_4",
      fisColumnName: "AC_USER_04",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "User-defined code 4",
    },
    {
      name: "USER_CODE_5",
      fisColumnName: "AC_USER_05",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "User-defined code 5",
    },
    {
      name: "LAST_MODIFIED_DATE",
      fisColumnName: "AC_DTE_LST_MNT",
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
  recordEstimate: "20-50M records",
  scd2: true,
  partitionBy: ["PROCESS_DATE"],
  clusterBy: ["ACCOUNT_NUMBER", "ACCOUNT_STATUS"],
};

// ============================================================================
// ACCOUNT BALANCE - FROM TB_DP_OZX_BAL_ARD
// ============================================================================

export const accountBalanceBronze: BronzeTableDefinition = {
  name: "bronze.account_balance",
  schema: "bronze",
  source: {
    fisTable: "TB_DP_OZX_BAL_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Real-time",
  },
  description: "Daily account balances - current, available, pending amounts",
  businessKey: "BL_ACCT_NBR",
  columns: [
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "BL_ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "BALANCE_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Balance date",
    },
    {
      name: "CURRENT_BALANCE",
      fisColumnName: "BL_CUR_BAL",
      dataType: "DECIMAL(18,2)",
      nullable: false,
      businessMeaning: "Ledger/current balance",
    },
    {
      name: "AVAILABLE_BALANCE",
      fisColumnName: "BL_AVL_BAL",
      dataType: "DECIMAL(18,2)",
      nullable: false,
      businessMeaning: "Available balance for withdrawal/debit",
    },
    {
      name: "PENDING_DEBIT_AMOUNT",
      fisColumnName: "BL_PEND_DEB_AMT",
      dataType: "DECIMAL(18,2)",
      nullable: true,
      businessMeaning: "Pending debit holds and authorizations",
    },
    {
      name: "PENDING_CREDIT_AMOUNT",
      fisColumnName: "BL_PEND_CRD_AMT",
      dataType: "DECIMAL(18,2)",
      nullable: true,
      businessMeaning: "Pending incoming credits",
    },
    {
      name: "SERVICE_CHARGE_CODE",
      fisColumnName: "BL_SERV_CHRG_CDE",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Service charge code",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
  ],
  recordEstimate: "100M+ records/month",
  scd2: false,
  partitionBy: ["BALANCE_DATE"],
  clusterBy: ["ACCOUNT_NUMBER"],
};

// ============================================================================
// DAILY BALANCE FACTS - FROM TB_DP_SZ9_DP_ACCT_D_FACT
// ============================================================================

export const accountDailyBalanceFactBronze: BronzeTableDefinition = {
  name: "bronze.account_daily_balance_fact",
  schema: "bronze",
  source: {
    fisTable: "TB_DP_SZ9_DP_ACCT_D_FACT",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Daily",
  },
  description: "Daily account balance fact table with interest accrual and analytics",
  businessKey: "ACCT_NBR",
  columns: [
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "CALENDAR_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Calendar date",
    },
    {
      name: "BALANCE_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Balance snapshot date",
    },
    {
      name: "CURRENT_BALANCE_AMOUNT",
      fisColumnName: "COL_BAL_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: false,
      businessMeaning: "Current ledger balance",
    },
    {
      name: "AVAILABLE_BALANCE_AMOUNT",
      fisColumnName: "AVAIL_BAL_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: false,
      businessMeaning: "Available balance",
    },
    {
      name: "PREVIOUS_DAY_LEDGER_BALANCE",
      fisColumnName: "PR_DAY_LGR_BAL_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: true,
      businessMeaning: "Prior day ledger balance",
    },
    {
      name: "PREVIOUS_MONTH_LEDGER_BALANCE",
      fisColumnName: "PR_MTH_LGR_BAL_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: true,
      businessMeaning: "Prior month ledger balance",
    },
    {
      name: "AVERAGE_LEDGER_BALANCE_YTD",
      fisColumnName: "AVG_LGR_BAL_YTD_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: true,
      businessMeaning: "Year-to-date average balance",
    },
    {
      name: "AVERAGE_LEDGER_BALANCE_MTD",
      fisColumnName: "AVG_LGR_BAL_MTD_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: true,
      businessMeaning: "Month-to-date average balance",
    },
    {
      name: "LEDGER_BALANCE",
      fisColumnName: "LGR_BAL_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: false,
      businessMeaning: "Ledger balance",
    },
    {
      name: "INTEREST_PAID_YTD",
      fisColumnName: "INT_PD_YTD_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: true,
      businessMeaning: "Interest paid year-to-date",
    },
    {
      name: "INTEREST_PAID_MTD",
      fisColumnName: "INT_PD_MTD_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: true,
      businessMeaning: "Interest paid month-to-date",
    },
    {
      name: "INTEREST_PAID_PRIOR_YTD",
      fisColumnName: "INT_PD_PR_YTD_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: true,
      businessMeaning: "Prior year interest paid",
    },
    {
      name: "TIME_DEPOSIT_PRINCIPAL_BALANCE",
      fisColumnName: "TME_DP_PRIN_BAL_AMT",
      dataType: "DECIMAL(18,6)",
      nullable: true,
      businessMeaning: "Time deposit principal balance",
    },
    {
      name: "REFRESH_TIME",
      fisColumnName: "REFRESH_TIME",
      dataType: "TIMESTAMP_NTZ",
      nullable: false,
      businessMeaning: "FIS refresh timestamp",
    },
  ],
  recordEstimate: "50M+ records",
  scd2: false,
  partitionBy: ["CALENDAR_DATE"],
  clusterBy: ["ACCOUNT_NUMBER"],
};

// ============================================================================
// ACCOUNT MAINTENANCE TRANSACTIONS - FROM TB_DP_OZU_MAINT_ARD
// ============================================================================

export const accountMaintenanceTransactionBronze: BronzeTableDefinition = {
  name: "bronze.account_maintenance_transaction",
  schema: "bronze",
  source: {
    fisTable: "TB_DP_OZU_MAINT_ARD",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Real-time",
  },
  description: "Account maintenance transactions - holds, stops, suspensions",
  businessKey: "LG_TRANS_TME_SEQ",
  columns: [
    {
      name: "TRANSACTION_ID",
      fisColumnName: "LG_TRANS_TME_SEQ",
      dataType: "VARCHAR(30)",
      nullable: false,
      businessMeaning: "Unique transaction sequence ID",
    },
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "LG_ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "TIME_DEPOSIT_ID",
      fisColumnName: "LG_TD_ID",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Time deposit ID if applicable",
    },
    {
      name: "BANK_NUMBER",
      fisColumnName: "LG_BANK_NBR",
      dataType: "NUMBER(10)",
      nullable: false,
      businessMeaning: "Bank number",
    },
    {
      name: "TRANSACTION_CODE",
      fisColumnName: "LG_TRANS_CDE",
      dataType: "VARCHAR(10)",
      nullable: false,
      businessMeaning: "Transaction type code",
    },
    {
      name: "TRANSACTION_AMOUNT",
      fisColumnName: "LG_AMT",
      dataType: "DECIMAL(15,2)",
      nullable: true,
      businessMeaning: "Transaction amount",
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
      fisColumnName: "HD_AMT",
      dataType: "DECIMAL(15,2)",
      nullable: true,
      businessMeaning: "Hold amount",
    },
    {
      name: "HOLD_REASON",
      fisColumnName: "LG_DESC",
      dataType: "VARCHAR(200)",
      nullable: true,
      businessMeaning: "Description of hold or transaction",
    },
    {
      name: "HOLD_EXPIRATION_DATE",
      fisColumnName: "LG_EXP_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Hold expiration date",
    },
    {
      name: "HOLD_ENTERED_DATE",
      fisColumnName: "LG_ENT_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Date hold was entered",
    },
    {
      name: "STOP_PAYMENT_TYPE",
      fisColumnName: "LG_STOP_TYP",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Type of stop payment",
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
      businessMeaning: "Previous keyword value",
    },
    {
      name: "KEYWORD_NEW_VALUE",
      fisColumnName: "LG_NEW_KYWRD",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "New keyword value",
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
  recordEstimate: "50M+ records/month",
  scd2: false,
  partitionBy: ["TRANSACTION_DATE"],
  clusterBy: ["ACCOUNT_NUMBER"],
};

// ============================================================================
// ACCOUNT PACKAGE - FROM TB_ACCT_PKG_ARD_RAW
// ============================================================================

export const accountPackageBronze: BronzeTableDefinition = {
  name: "bronze.account_package",
  schema: "bronze",
  source: {
    fisTable: "TB_ACCT_PKG_ARD_RAW",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Daily",
  },
  description: "Account package enrollment and tier information",
  businessKey: "PKG_ID",
  columns: [
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "PACKAGE_ID",
      fisColumnName: "PKG_ID",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Package ID",
    },
    {
      name: "PACKAGE_NAME",
      fisColumnName: "PKG_NME",
      dataType: "VARCHAR(100)",
      nullable: false,
      businessMeaning: "Package name",
    },
    {
      name: "PACKAGE_DESCRIPTION",
      fisColumnName: "PKG_DESC",
      dataType: "VARCHAR(200)",
      nullable: true,
      businessMeaning: "Package description",
    },
    {
      name: "TIER_ID",
      fisColumnName: "TIER_ID",
      dataType: "VARCHAR(50)",
      nullable: true,
      businessMeaning: "Account tier ID",
    },
    {
      name: "TIER_NAME",
      fisColumnName: "TIER_NME",
      dataType: "VARCHAR(100)",
      nullable: true,
      businessMeaning: "Tier name (Gold, Platinum, etc)",
    },
    {
      name: "ENROLLMENT_ROLE_CODE",
      fisColumnName: "VM_ACCT_ENRLMT_ROLE_CDE",
      dataType: "VARCHAR(20)",
      nullable: true,
      businessMeaning: "Enrollment role",
    },
    {
      name: "FORCED_ENROLLMENT_IND",
      fisColumnName: "FRCE_IND",
      dataType: "VARCHAR(1)",
      nullable: true,
      businessMeaning: "Forced enrollment indicator",
    },
    {
      name: "PROCESS_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "10-20M records",
  scd2: true,
  partitionBy: ["PROCESS_DATE"],
};

// ============================================================================
// DEBIT CARD - FROM TB_DEBIT_CARD_RAW
// ============================================================================

export const debitCardBronze: BronzeTableDefinition = {
  name: "bronze.debit_card",
  schema: "bronze",
  source: {
    fisTable: "TB_DEBIT_CARD_RAW",
    fisSchema: "FIS_CORE",
    refreshFrequency: "Daily",
  },
  description: "Debit card information linked to accounts",
  businessKey: "EFD_CRD_NBR",
  columns: [
    {
      name: "ACCOUNT_NUMBER",
      fisColumnName: "ACCT_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Account number",
    },
    {
      name: "DEBIT_CARD_NUMBER",
      fisColumnName: "EFD_CRD_NBR",
      dataType: "VARCHAR(20)",
      nullable: false,
      businessMeaning: "Debit card number (masked)",
    },
    {
      name: "CARD_ISSUE_DATE",
      fisColumnName: "CRD_REISS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "Card issue/reissue date",
    },
    {
      name: "CARD_EXPIRATION_DATE",
      fisColumnName: "CRD_EXP_DTE",
      dataType: "DATE",
      nullable: true,
      businessMeaning: "Card expiration date",
    },
    {
      name: "CARD_STATUS",
      fisColumnName: "CRD_STAT_DESC",
      dataType: "VARCHAR(50)",
      nullable: false,
      businessMeaning: "Card status (ACTIVE, BLOCKED, EXPIRED)",
    },
    {
      name: "PRIMARY_SECONDARY_CODE",
      fisColumnName: "PRMY_SCNDY_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      businessMeaning: "Primary or secondary card indicator",
    },
    {
      name: "PROCESS_DATE",
      fisColumnName: "PRCS_DTE",
      dataType: "DATE",
      nullable: false,
      businessMeaning: "FIS processing date",
    },
  ],
  recordEstimate: "30-50M records",
  scd2: true,
  partitionBy: ["PROCESS_DATE"],
};

export const depositsBronzeTables = [
  accountMasterBronze,
  accountBalanceBronze,
  accountDailyBalanceFactBronze,
  accountMaintenanceTransactionBronze,
  accountPackageBronze,
  debitCardBronze,
];

export const depositsBronzeLayerComplete = {
  tables: depositsBronzeTables,
  totalTables: depositsBronzeTables.length,
  totalRows: 2000000 + 2000000 + 2000000 + 500000 + 500000 + 1000000,
  description: 'Deposits domain bronze layer - raw data from FIS-ADS source tables',
};

export default depositsBronzeTables;
