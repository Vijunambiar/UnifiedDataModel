/**
 * TRANSACTIONS DOMAIN - SILVER LAYER - DDL SCRIPTS
 * 
 * CREATE TABLE statements for Silver layer (conformed, cleansed, enriched)
 * Schema: CORE_DEPOSIT
 * Source: Bronze layer tables
 * SCD Type: Type 1 for transaction facts
 * 
 * This domain contains 5 deposit-related transaction fact tables:
 * 1. FCT_DEPOSIT_ACCOUNT_TRANSACTION
 * 2. FCT_DEPOSIT_CERTIFICATE_TRANSACTION
 * 3. FCT_DEPOSIT_HOLD_TRANSACTION
 * 4. FCT_DEPOSIT_MAINTENANCE_TRANSACTION
 * 5. FCT_DEPOSIT_STOP_TRANSACTION
 */

export const depositAccountTransactionDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Account Transaction
-- Schema: CORE_DEPOSIT
-- Source: bronze.money_transaction (DP_OZO_MNY_TXN_ARD_RAW)
-- Purpose: Deposit account transaction fact table
-- Grain: One row per account and transaction ID
-- ============================================================================

USE SCHEMA CORE_DEPOSIT;

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_ACCOUNT_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_ACCOUNT_TRANSACTION (
	DEPOSIT_ACCOUNT_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_ACCOUNT_TRANSACTION.NEXTVAL COMMENT 'Surrogate key uniquely identifying each deposit account transaction',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key linking to DIM_ACCOUNT',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'Account number for transaction',
	TRANSACTION_ID VARCHAR(100) COMMENT 'Unique transaction identifier',
	TRANSACTION_DATE DATE COMMENT 'Transaction date',
	TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'Transaction amount',
	TRANSACTION_CODE VARCHAR(50) COMMENT 'Transaction type code',
	TRANSACTION_DESCRIPTION VARCHAR(500) COMMENT 'Transaction description',
	DEBIT_CREDIT_INDICATOR VARCHAR(5) COMMENT 'D=Debit, C=Credit',
	POSTED_DATE DATE COMMENT 'Date transaction was posted',
	VALUE_DATE DATE COMMENT 'Value date for interest calculation',
	BALANCE_AFTER NUMBER(18,6) COMMENT 'Balance after transaction',
	TRANSACTION_STATUS VARCHAR(50) COMMENT 'Status: POSTED, PENDING, REVERSED',
	REVERSAL_FLAG BOOLEAN COMMENT 'Flag indicating if this is a reversal',
	SOURCE_SYSTEM VARCHAR(50) COMMENT 'Source system: FIS-ADS',
	BUSINESS_DATE DATE COMMENT 'Business date when record was created',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Timestamp when record was inserted',
	INSERT_BY VARCHAR(100) COMMENT 'User or system that inserted the record',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Timestamp of last modification',
	LAST_MODIFIED_BY VARCHAR(100) COMMENT 'User or system that last modified the record'
) COMMENT='Deposit account transaction fact table - grain: ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositCertificateTransactionDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Certificate Transaction
-- Schema: CORE_DEPOSIT
-- Source: bronze.certificate_transaction (TB_DP_OZP_TD_ARD_RAW)
-- Purpose: Certificate of deposit (CD) transaction fact table
-- Grain: One row per account and transaction ID
-- ============================================================================

USE SCHEMA CORE_DEPOSIT;

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_CERTIFICATE_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_CERTIFICATE_TRANSACTION (
	DEPOSIT_CERTIFICATE_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_CERTIFICATE_TRANSACTION.NEXTVAL COMMENT 'Surrogate key for CD transaction',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key to DIM_ACCOUNT',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'Certificate of deposit account number',
	TRANSACTION_ID VARCHAR(100) COMMENT 'Certificate transaction identifier',
	TRANSACTION_DATE DATE COMMENT 'Certificate transaction date',
	TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'Certificate transaction amount',
	TRANSACTION_TYPE VARCHAR(50) COMMENT 'Transaction type: OPEN, RENEW, CLOSE, INTEREST',
	MATURITY_DATE DATE COMMENT 'CD maturity date',
	INTEREST_RATE NUMBER(8,4) COMMENT 'Interest rate on CD',
	TERM_MONTHS NUMBER(5,0) COMMENT 'Term in months',
	PENALTY_AMOUNT NUMBER(18,6) COMMENT 'Early withdrawal penalty if applicable',
	ROLLOVER_FLAG BOOLEAN COMMENT 'Whether CD was rolled over',
	SOURCE_SYSTEM VARCHAR(50) COMMENT 'Source system: FIS-ADS',
	BUSINESS_DATE DATE COMMENT 'Business date',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Insert timestamp',
	INSERT_BY VARCHAR(100) COMMENT 'Insert user/system',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Last modified timestamp',
	LAST_MODIFIED_BY VARCHAR(100) COMMENT 'Last modified by'
) COMMENT='Certificate of deposit transaction fact table - grain: ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositHoldTransactionDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Hold Transaction
-- Schema: CORE_DEPOSIT
-- Source: bronze.hold_transaction (TB_DP_OZV_HLD_ARD)
-- Purpose: Hold transactions on deposit accounts
-- Grain: One row per account and transaction ID
-- ============================================================================

USE SCHEMA CORE_DEPOSIT;

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_HOLD_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_HOLD_TRANSACTION (
	DEPOSIT_HOLD_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_HOLD_TRANSACTION.NEXTVAL COMMENT 'Surrogate key for hold transaction',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key to DIM_ACCOUNT',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'Account number with hold',
	TRANSACTION_ID VARCHAR(100) COMMENT 'Hold transaction sequence ID',
	HOLD_AMOUNT NUMBER(18,6) COMMENT 'Amount of hold placed',
	HOLD_TYPE VARCHAR(100) COMMENT 'Type of hold (LEGAL, LEVY, NSF, CHECK)',
	HOLD_REASON VARCHAR(500) COMMENT 'Reason for hold',
	HOLD_START_DATE DATE COMMENT 'Date hold was placed',
	HOLD_EXPIRATION_DATE DATE COMMENT 'Date hold expires',
	HOLD_RELEASE_DATE DATE COMMENT 'Date hold was released',
	HOLD_STATUS VARCHAR(50) COMMENT 'Status: ACTIVE, RELEASED, EXPIRED',
	SOURCE_SYSTEM VARCHAR(50) COMMENT 'Source system: FIS-ADS',
	BUSINESS_DATE DATE COMMENT 'Business date',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Insert timestamp',
	INSERT_BY VARCHAR(100) COMMENT 'Insert user/system',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Last modified timestamp',
	LAST_MODIFIED_BY VARCHAR(100) COMMENT 'Last modified by'
) COMMENT='Deposit hold transaction fact table - grain: ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositMaintenanceTransactionDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Maintenance Transaction
-- Schema: CORE_DEPOSIT
-- Source: bronze.maintenance_log_transaction (TB_DP_OZU_MAINT_ARD)
-- Purpose: Maintenance transaction history for deposit accounts
-- Grain: One row per account and transaction ID
-- ============================================================================

USE SCHEMA CORE_DEPOSIT;

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_MAINTENANCE_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_MAINTENANCE_TRANSACTION (
	DEPOSIT_MAINTENANCE_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_MAINTENANCE_TRANSACTION.NEXTVAL COMMENT 'Surrogate key for maintenance transaction',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key to DIM_ACCOUNT',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'Account number',
	TRANSACTION_ID VARCHAR(100) COMMENT 'Maintenance transaction sequence ID',
	MAINTENANCE_TRANSACTION_CODE VARCHAR(100) COMMENT 'Maintenance transaction code',
	MAINTENANCE_TYPE VARCHAR(100) COMMENT 'Type: RATE_CHANGE, FEE_WAIVER, LIMIT_CHANGE, etc.',
	KEYWORD_FIELD VARCHAR(100) COMMENT 'Field being maintained',
	KEYWORD_OLD_VALUE VARCHAR(100) COMMENT 'Old value before maintenance',
	KEYWORD_NEW_VALUE VARCHAR(100) COMMENT 'New value after maintenance',
	CHANGE_DATE DATE COMMENT 'Date of maintenance change',
	CHANGED_BY VARCHAR(100) COMMENT 'User who made the change',
	SOURCE_SYSTEM VARCHAR(50) COMMENT 'Source system: FIS-ADS',
	BUSINESS_DATE DATE COMMENT 'Business date',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Insert timestamp',
	INSERT_BY VARCHAR(100) COMMENT 'Insert user/system',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Last modified timestamp',
	LAST_MODIFIED_BY VARCHAR(100) COMMENT 'Last modified by'
) COMMENT='Deposit maintenance transaction fact table - grain: ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositStopTransactionDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Stop Payment Transaction
-- Schema: CORE_DEPOSIT
-- Source: bronze.stop_transaction (TB_DP_OZQ_STP_ARD)
-- Purpose: Stop payment transactions on deposit accounts
-- Grain: One row per account and transaction ID
-- ============================================================================

USE SCHEMA CORE_DEPOSIT;

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_STOP_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_STOP_TRANSACTION (
	DEPOSIT_STOP_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_STOP_TRANSACTION.NEXTVAL COMMENT 'Surrogate key for stop payment transaction',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key to DIM_ACCOUNT',
	ACCOUNT_NUMBER VARCHAR(16777216) COMMENT 'Account number with stop payment',
	STOP_PAYMENT_I_D VARCHAR(100) COMMENT 'Stop payment unique identifier',
	TRANSACTION_ID VARCHAR(100) COMMENT 'Stop payment transaction ID',
	TRANSACTION_AMOUNT NUMBER(38,0) COMMENT 'Stop payment amount',
	STOP_TYPE VARCHAR(100) COMMENT 'Type of stop payment: SINGLE_CHECK, RANGE, ACH',
	CHECK_NUMBER_START VARCHAR(50) COMMENT 'Starting check number for stop',
	CHECK_NUMBER_END VARCHAR(50) COMMENT 'Ending check number for range',
	STOP_ENTERED_DATE DATE COMMENT 'Date stop payment was entered',
	STOP_EXPIRATION_DATE DATE COMMENT 'Stop payment expiration date',
	STOP_RELEASE_DATE DATE COMMENT 'Date stop was released',
	STOP_STATUS VARCHAR(50) COMMENT 'Status: ACTIVE, EXPIRED, PAID, CANCELLED',
	PAYEE_NAME VARCHAR(200) COMMENT 'Payee name for stop payment',
	STOP_REASON VARCHAR(500) COMMENT 'Reason for stop payment',
	FEE_AMOUNT NUMBER(18,6) COMMENT 'Fee charged for stop payment',
	SOURCE_SYSTEM VARCHAR(50) COMMENT 'Source system: FIS-ADS',
	BUSINESS_DATE DATE COMMENT 'Business date',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Insert timestamp',
	INSERT_BY VARCHAR(100) COMMENT 'Insert user/system',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Last modified timestamp',
	LAST_MODIFIED_BY VARCHAR(100) COMMENT 'Last modified by'
) COMMENT='Deposit stop payment transaction fact table - grain: ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const transactionsSilverDDLCatalog = {
  domain: "Transactions",
  layer: "Silver",
  schema: "CORE_DEPOSIT",
  description: "5 deposit-related transaction fact tables",
  scripts: [
    {
      name: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
      ddl: depositAccountTransactionDDL,
      scdType: "Type 1",
      estimatedRows: "500M",
      grain: "ACCOUNT_NUMBER X TRANSACTION_ID",
      description: "Deposit account transaction detail"
    },
    {
      name: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
      ddl: depositCertificateTransactionDDL,
      scdType: "Type 1",
      estimatedRows: "50M",
      grain: "ACCOUNT_NUMBER X TRANSACTION_ID",
      description: "Certificate of deposit transaction detail"
    },
    {
      name: "FCT_DEPOSIT_HOLD_TRANSACTION",
      ddl: depositHoldTransactionDDL,
      scdType: "Type 1",
      estimatedRows: "20M",
      grain: "ACCOUNT_NUMBER X TRANSACTION_ID",
      description: "Hold transactions on deposit accounts"
    },
    {
      name: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
      ddl: depositMaintenanceTransactionDDL,
      scdType: "Type 1",
      estimatedRows: "30M",
      grain: "ACCOUNT_NUMBER X TRANSACTION_ID",
      description: "Maintenance transaction history"
    },
    {
      name: "FCT_DEPOSIT_STOP_TRANSACTION",
      ddl: depositStopTransactionDDL,
      scdType: "Type 1",
      estimatedRows: "15M",
      grain: "ACCOUNT_NUMBER X TRANSACTION_ID",
      description: "Stop payment transactions"
    }
  ]
};

export default transactionsSilverDDLCatalog;
