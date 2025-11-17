/**
 * FIS RAW SOURCE TABLES
 * 
 * Fiserv FIS-ADS source system raw tables (FIS_RAW schema)
 * These are the source system tables ingested from FIS before any transformations
 * Maps directly to Bronze Layer tables with 1:1 or column-level mappings
 */

export interface FISSourceTable {
  fisTableName: string;
  fisSchema: string;
  description: string;
  recordEstimate: string;
  refreshFrequency: string;
  domain: "Customer" | "Deposits" | "Transactions" | "Lending" | "Investment";
  bronzeTargets: string[]; // Bronze table(s) this maps to
  businessKey: string;
  columns: Array<{
    name: string;
    dataType: string;
    nullable: boolean;
    description: string;
    bronzeColumnMapping?: string; // Target Bronze column name
  }>;
}

// ============================================================================
// CUSTOMER DOMAIN - SOURCE TABLES
// ============================================================================

export const TB_CI_OZ6_CUST_ARD: FISSourceTable = {
  fisTableName: "TB_CI_OZ6_CUST_ARD",
  fisSchema: "FIS_RAW",
  description: "Customer master data from FIS core identity system - demographics, attributes, identification, preferences, status",
  recordEstimate: "5-10M records",
  refreshFrequency: "Daily (full)",
  domain: "Customer",
  bronzeTargets: ["bronze.customer_master"],
  businessKey: "CID_CUST_CUST_NBR",
  columns: [
    {
      name: "CID_CUST_CUST_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      description: "Unique customer identifier",
      bronzeColumnMapping: "CUSTOMER_ID",
    },
    {
      name: "CID_CUST_ETHNIC_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      description: "Customer ethnicity code",
      bronzeColumnMapping: "ETHNIC_CODE",
    },
    {
      name: "CID_CUST_ETHNIC_DESC",
      dataType: "VARCHAR(255)",
      nullable: true,
      description: "Customer ethnicity description",
      bronzeColumnMapping: "ETHNIC_DESC",
    },
    {
      name: "CID_CUST_STATUS_CDE",
      dataType: "VARCHAR(1)",
      nullable: false,
      description: "Customer status code (A=Active, I=Inactive, C=Closed, D=Deceased)",
      bronzeColumnMapping: "CUSTOMER_STATUS_CODE",
    },
    {
      name: "CID_CUST_OPEN_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "Customer account opening date",
      bronzeColumnMapping: "CUSTOMER_OPEN_DATE",
    },
    {
      name: "CID_CUST_CLOSED_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      description: "Customer account closing date",
      bronzeColumnMapping: "CUSTOMER_CLOSED_DATE",
    },
    {
      name: "CID_CUST_SINCE_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "Customer tenure start date",
      bronzeColumnMapping: "CUSTOMER_SINCE_DATE",
    },
    {
      name: "CID_CUST_LST_MNT_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "Last modification date in source system",
      bronzeColumnMapping: "LAST_MODIFIED_DATE",
    },
    {
      name: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "FIS processing date (technical)",
      bronzeColumnMapping: "PROCESS_DATE",
    },
  ],
};

export const TB_CI_OZ4_CUST_ID_ARD: FISSourceTable = {
  fisTableName: "TB_CI_OZ4_CUST_ID_ARD",
  fisSchema: "FIS_RAW",
  description: "Customer identification documents - licenses, passports, government IDs with verification status",
  recordEstimate: "10-20M records",
  refreshFrequency: "Daily",
  domain: "Customer",
  bronzeTargets: ["bronze.customer_identifiers"],
  businessKey: "CI_DMV21_ID_NUMBER",
  columns: [
    {
      name: "CI_DMV_CUST_BASE_NBR",
      dataType: "VARCHAR(10)",
      nullable: false,
      description: "Customer base number",
      bronzeColumnMapping: "CUSTOMER_ID",
    },
    {
      name: "CI_DMV21_ID_TYPE",
      dataType: "VARCHAR(255)",
      nullable: false,
      description: "ID document type (DRIVER_LICENSE, PASSPORT, STATE_ID, MILITARY_ID)",
      bronzeColumnMapping: "IDENTIFICATION_TYPE",
    },
    {
      name: "CI_DMV21_ID_NUMBER",
      dataType: "VARCHAR(255)",
      nullable: false,
      description: "ID document number",
      bronzeColumnMapping: "IDENTIFICATION_NUMBER",
    },
    {
      name: "CI_DMV21_ISSUE_DATE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      description: "ID issue date",
      bronzeColumnMapping: "ID_ISSUE_DATE",
    },
    {
      name: "CI_DMV21_EXPIRE_DATE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      description: "ID expiration date",
      bronzeColumnMapping: "ID_EXPIRATION_DATE",
    },
  ],
};

export const TB_CI_OZ5_CUST_NAAD_ARD: FISSourceTable = {
  fisTableName: "TB_CI_OZ5_CUST_NAAD_ARD",
  fisSchema: "FIS_RAW",
  description: "Customer names and addresses - personal, business, mailing, and alternate addresses",
  recordEstimate: "15-25M records",
  refreshFrequency: "Daily",
  domain: "Customer",
  bronzeTargets: ["bronze.customer_names_addresses"],
  businessKey: "CID_NAAD_APPL_ID",
  columns: [
    {
      name: "CID_NAAD_APPL_ID",
      dataType: "VARCHAR(255)",
      nullable: false,
      description: "Customer application ID",
      bronzeColumnMapping: "CUSTOMER_ID",
    },
    {
      name: "CID_NAAD_CUST_TYPE_CDE",
      dataType: "VARCHAR(1)",
      nullable: false,
      description: "Customer type (I=Individual, C=Corporate, P=Partnership)",
      bronzeColumnMapping: "CUSTOMER_TYPE_CODE",
    },
    {
      name: "CID_NAAD_FIRST_MID",
      dataType: "VARCHAR(255)",
      nullable: true,
      description: "First and middle name",
      bronzeColumnMapping: "FIRST_NAME",
    },
    {
      name: "CID_NAAD_SURNAME",
      dataType: "VARCHAR(255)",
      nullable: true,
      description: "Last name",
      bronzeColumnMapping: "LAST_NAME",
    },
    {
      name: "CID_NAAD_CITY",
      dataType: "VARCHAR(255)",
      nullable: true,
      description: "Address city",
      bronzeColumnMapping: "CITY",
    },
    {
      name: "CID_NAAD_STATE_CDE",
      dataType: "VARCHAR(10)",
      nullable: true,
      description: "Address state code",
      bronzeColumnMapping: "STATE_CODE",
    },
    {
      name: "CID_NAAD_ZIP_1",
      dataType: "VARCHAR(10)",
      nullable: true,
      description: "ZIP code",
      bronzeColumnMapping: "ZIP_CODE",
    },
    {
      name: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "FIS processing date",
      bronzeColumnMapping: "PROCESS_DATE",
    },
  ],
};

// ============================================================================
// DEPOSITS DOMAIN - SOURCE TABLES
// ============================================================================

export const FCT_DEPOSIT_DAILY_BALANCE_RAW: FISSourceTable = {
  fisTableName: "FCT_DEPOSIT_DAILY_BALANCE_RAW",
  fisSchema: "FIS_RAW",
  description: "Daily deposit account balance facts - ledger balance, available balance, interest accrual, fees",
  recordEstimate: "100M-500M records (daily)",
  refreshFrequency: "Daily",
  domain: "Deposits",
  bronzeTargets: ["bronze.fct_deposit_daily_balance"],
  businessKey: "ACCOUNT_NUMBER",
  columns: [
    {
      name: "ACCOUNT_NUMBER",
      dataType: "VARCHAR(32)",
      nullable: false,
      description: "Unique account identifier",
      bronzeColumnMapping: "ACCOUNT_NUMBER",
    },
    {
      name: "BALANCE_DATE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "Date of balance snapshot",
      bronzeColumnMapping: "BALANCE_DATE",
    },
    {
      name: "CURRENT_BALANCE",
      dataType: "NUMBER(18,2)",
      nullable: false,
      description: "Current available balance",
      bronzeColumnMapping: "CURRENT_BALANCE",
    },
    {
      name: "AVAILABLE_BALANCE",
      dataType: "NUMBER(18,2)",
      nullable: true,
      description: "Available balance (current - holds)",
      bronzeColumnMapping: "AVAILABLE_BALANCE",
    },
    {
      name: "LEDGER_BALANCE",
      dataType: "NUMBER(18,2)",
      nullable: false,
      description: "Ledger balance including pending items",
      bronzeColumnMapping: "LEDGER_BALANCE",
    },
    {
      name: "INTEREST_PAID_YTD_AMOUNT",
      dataType: "NUMBER(18,2)",
      nullable: true,
      description: "Year-to-date interest paid",
      bronzeColumnMapping: "INTEREST_PAID_YTD_AMOUNT",
    },
    {
      name: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "FIS processing date",
      bronzeColumnMapping: "PROCESS_DATE",
    },
  ],
};

export const TB_DP_DYY_C2_ACCT_SCD_DIM_RAW: FISSourceTable = {
  fisTableName: "TB_DP_DYY_C2_ACCT_SCD_DIM_RAW",
  fisSchema: "FIS_RAW",
  description: "Deposit account dimension - account types, products, interest plans, service charges, account status",
  recordEstimate: "20-50M records",
  refreshFrequency: "Daily",
  domain: "Deposits",
  bronzeTargets: ["bronze.dim_account"],
  businessKey: "ACCT_NBR",
  columns: [
    {
      name: "ACCT_NBR",
      dataType: "VARCHAR(32)",
      nullable: false,
      description: "Account number",
      bronzeColumnMapping: "ACCOUNT_NUMBER",
    },
    {
      name: "ACCT_TYP_CDE",
      dataType: "VARCHAR(3)",
      nullable: false,
      description: "Account type code (CHK=Checking, SAV=Savings, MMA=Money Market, TD=Time Deposit)",
      bronzeColumnMapping: "ACCOUNT_TYPE_CODE",
    },
    {
      name: "ACCT_TYP_DESC",
      dataType: "VARCHAR(43)",
      nullable: false,
      description: "Account type description",
      bronzeColumnMapping: "ACCOUNT_TYPE_DESC",
    },
    {
      name: "ACCT_OPEN_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "Account opening date",
      bronzeColumnMapping: "ACCOUNT_OPEN_DATE",
    },
    {
      name: "ACCT_CLOS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: true,
      description: "Account closing date",
      bronzeColumnMapping: "ACCOUNT_CLOSE_DATE",
    },
    {
      name: "ACCT_STAT_CDE",
      dataType: "VARCHAR(4)",
      nullable: false,
      description: "Account status code",
      bronzeColumnMapping: "ACCOUNT_STATUS_CODE",
    },
    {
      name: "INT_PLN_NBR",
      dataType: "NUMBER(3,0)",
      nullable: true,
      description: "Interest plan number",
      bronzeColumnMapping: "INTEREST_PLAN_NUMBER",
    },
    {
      name: "CUR_INT_RTE",
      dataType: "NUMBER(9,6)",
      nullable: true,
      description: "Current interest rate",
      bronzeColumnMapping: "CURRENT_INTEREST_RATE",
    },
    {
      name: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "FIS processing date",
      bronzeColumnMapping: "PROCESS_DATE",
    },
  ],
};

export const TB_DP_OZO_MNY_TXN_ARD_RAW: FISSourceTable = {
  fisTableName: "TB_DP_OZO_MNY_TXN_ARD_RAW",
  fisSchema: "FIS_RAW",
  description: "Deposit account transactions - debits, credits, transfers, ACH, checks, interest, fees",
  recordEstimate: "1B-5B records",
  refreshFrequency: "Daily",
  domain: "Deposits",
  bronzeTargets: ["bronze.fct_deposit_account_transaction"],
  businessKey: "TRN_TRANS_CNTL",
  columns: [
    {
      name: "TRN_ACCT_NBR",
      dataType: "VARCHAR(255)",
      nullable: false,
      description: "Account number",
      bronzeColumnMapping: "ACCOUNT_NUMBER",
    },
    {
      name: "TRN_TRANS_CDE",
      dataType: "VARCHAR(10)",
      nullable: false,
      description: "Transaction code",
      bronzeColumnMapping: "TRANSACTION_CODE",
    },
    {
      name: "TRN_TRANS_DESC",
      dataType: "VARCHAR(255)",
      nullable: true,
      description: "Transaction description",
      bronzeColumnMapping: "TRANSACTION_DESCRIPTION",
    },
    {
      name: "TRN_TRANS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "Transaction date",
      bronzeColumnMapping: "TRANSACTION_DATE",
    },
    {
      name: "TRN_TRANS_AMT",
      dataType: "NUMBER(18,2)",
      nullable: false,
      description: "Transaction amount",
      bronzeColumnMapping: "TRANSACTION_AMOUNT",
    },
    {
      name: "TRN_TRANS_TYP",
      dataType: "VARCHAR(1)",
      nullable: false,
      description: "Transaction type (D=Debit, C=Credit)",
      bronzeColumnMapping: "TRANSACTION_TYPE",
    },
    {
      name: "PRCS_DTE",
      dataType: "TIMESTAMP_NTZ(9)",
      nullable: false,
      description: "FIS processing date",
      bronzeColumnMapping: "PROCESS_DATE",
    },
  ],
};

// ============================================================================
// SOURCE TABLE REGISTRY
// ============================================================================

export const FIS_SOURCE_TABLES: Record<string, FISSourceTable> = {
  TB_CI_OZ6_CUST_ARD,
  TB_CI_OZ4_CUST_ID_ARD,
  TB_CI_OZ5_CUST_NAAD_ARD,
  FCT_DEPOSIT_DAILY_BALANCE_RAW,
  TB_DP_DYY_C2_ACCT_SCD_DIM_RAW,
  TB_DP_OZO_MNY_TXN_ARD_RAW,
};

// ============================================================================
// TRANSFORMATION DOCUMENTATION
// ============================================================================

export interface SourceToBronzeMapping {
  fisTableName: string;
  bronzeTableName: string;
  transformationType: "1:1" | "N:1" | "Aggregation" | "Enrichment";
  description: string;
  transformationLogic?: string;
  dataQualityRules?: string[];
}

export const SOURCE_TO_BRONZE_MAPPINGS: SourceToBronzeMapping[] = [
  {
    fisTableName: "TB_CI_OZ6_CUST_ARD",
    bronzeTableName: "bronze.customer_master",
    transformationType: "1:1",
    description: "Direct mapping from FIS customer master to Bronze. Columns renamed for clarity, sensitive fields marked for encryption at Silver layer.",
    transformationLogic: "SELECT CID_CUST_CUST_NBR as CUSTOMER_ID, CID_CUST_ETHNIC_CDE as ETHNIC_CODE, ... FROM TB_CI_OZ6_CUST_ARD WHERE PRCS_DTE = CURRENT_DATE()",
    dataQualityRules: [
      "CID_CUST_CUST_NBR must not be null (Primary Key)",
      "CID_CUST_OPEN_DTE must be <= PRCS_DTE",
      "If CID_CUST_STATUS_CDE = 'C' or 'D', CID_CUST_CLOSED_DTE must not be null",
    ],
  },
  {
    fisTableName: "TB_CI_OZ4_CUST_ID_ARD",
    bronzeTableName: "bronze.customer_identifiers",
    transformationType: "1:1",
    description: "Customer identification documents mapped directly. Sensitive ID numbers to be tokenized at Silver layer.",
    transformationLogic: "SELECT CI_DMV_CUST_BASE_NBR as CUSTOMER_ID, CI_DMV21_ID_TYPE as IDENTIFICATION_TYPE, CI_DMV21_ID_NUMBER as IDENTIFICATION_NUMBER, ... FROM TB_CI_OZ4_CUST_ID_ARD",
    dataQualityRules: [
      "CI_DMV21_ID_NUMBER must not be null",
      "CI_DMV21_ISSUE_DATE must be <= CI_DMV21_EXPIRE_DATE when both present",
    ],
  },
  {
    fisTableName: "TB_CI_OZ5_CUST_NAAD_ARD",
    bronzeTableName: "bronze.customer_names_addresses",
    transformationType: "1:1",
    description: "Customer names and addresses, including personal and business identities. Address standardization deferred to Silver layer.",
    transformationLogic: "SELECT CID_NAAD_APPL_ID as CUSTOMER_ID, CID_NAAD_FIRST_MID as FIRST_NAME, CID_NAAD_SURNAME as LAST_NAME, CID_NAAD_CITY as CITY, CID_NAAD_STATE_CDE as STATE_CODE FROM TB_CI_OZ5_CUST_NAAD_ARD",
    dataQualityRules: [
      "At least one name field (FIRST_NAME or BUSINESS_NAME) must be populated",
      "ZIP_CODE must match state code (validation at Silver layer)",
    ],
  },
  {
    fisTableName: "FCT_DEPOSIT_DAILY_BALANCE_RAW",
    bronzeTableName: "bronze.fct_deposit_daily_balance",
    transformationType: "1:1",
    description: "Daily deposit balances - fact table, one record per account per day. Partitioned by BALANCE_DATE for performance.",
    dataQualityRules: [
      "CURRENT_BALANCE >= 0 or account is OD",
      "AVAILABLE_BALANCE must be <= LEDGER_BALANCE",
      "BALANCE_DATE must be business day or month-end",
    ],
  },
  {
    fisTableName: "TB_DP_DYY_C2_ACCT_SCD_DIM_RAW",
    bronzeTableName: "bronze.dim_account",
    transformationType: "1:1",
    description: "Deposit account dimension with SCD2 tracking. Implements Slowly Changing Dimension Type 2 for account attribute changes.",
    dataQualityRules: [
      "ACCT_NBR must not be null",
      "ACCT_OPEN_DTE must be <= PRCS_DTE",
      "If ACCT_STAT_CDE = 'CLOSED', ACCT_CLOS_DTE must not be null",
    ],
  },
  {
    fisTableName: "TB_DP_OZO_MNY_TXN_ARD_RAW",
    bronzeTableName: "bronze.fct_deposit_account_transaction",
    transformationType: "1:1",
    description: "Deposit transactions fact table. High-volume transaction data partitioned by TRANSACTION_DATE.",
    dataQualityRules: [
      "TRANSACTION_AMOUNT must be > 0",
      "TRANSACTION_TYPE must be 'D' or 'C'",
      "TRANSACTION_DATE must be <= PRCS_DTE",
    ],
  },
];
