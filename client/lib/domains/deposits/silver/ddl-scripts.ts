/**
 * DEPOSITS DOMAIN - SILVER LAYER - DDL SCRIPTS
 * 
 * CREATE TABLE statements for Silver layer (conformed, cleansed, standardized)
 * Schema: CORE_DEPOSIT
 * Source: Bronze layer tables
 * SCD Type: Type 2 for dimensions, Type 1 for facts
 */

export const depositAccountSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Account Dimension
-- Schema: CORE_DEPOSIT
-- Source: bronze.deposit_account_master
-- Purpose: Account level attributes with SCD Type 2
-- ============================================================================

USE SCHEMA CORE_DEPOSIT;

CREATE OR REPLACE SEQUENCE SEQ_DIM_ACCOUNT START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_ACCOUNT (
	ACCOUNT_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_DIM_ACCOUNT.NEXTVAL COMMENT 'Surrogate key for the account dimension',
	ACCOUNT_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Unique identifier for the account',
	ACCOUNT_TYPE_CODE VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='MODERATE') COMMENT 'Code representing the type of account',
	ACCOUNT_APPLICATION_CODE VARCHAR(16777216) COMMENT 'Code indicating the application that originated the account',
	ACCOUNT_STATUS VARCHAR(16777216) COMMENT 'Code indicating the status of the account',
	ACCOUNT_NUMBER_OPERATIONAL VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Operational account number used internally',
	ACCOUNT_NUMBER_LAST4 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Last four digits of the account number',
	ACCOUNT_NUMBER_OPERATIONAL_LAST4 VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Last four digits of the operational account number',
	COST_CENTER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Cost center associated with the account',
	OPERATIONAL_ACCOUNT_COST_CENTER VARCHAR(16777216) COMMENT 'Cost center for operational account',
	BANK_NUMBER NUMBER(38,0) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Bank identifier where the account resides',
	ACCOUNT_TYPE_DESCRIPTION VARCHAR(16777216) COMMENT 'Description of the account type',
	ACCOUNT_OPEN_DATE DATE COMMENT 'Date when the account was opened',
	SECONDARY_OFFICER_NUMBER VARCHAR(16777216) COMMENT 'Employee number of the secondary officer managing the account',
	SECONDARY_OFFICER_NAME VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Name of the secondary officer managing the account',
	DORMANT_INACTIVE_INDICATOR VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Indicator if the account is dormant or inactive',
	ACCOUNT_CLOSED_DATE DATE COMMENT 'Date when the account was closed',
	ACCOUNT_CLOSED_MONTH VARCHAR(16777216) COMMENT 'Month when the account was closed',
	CLOSED_REASON_CODE VARCHAR(16777216) COMMENT 'Code indicating reason for account closure',
	CLOSED_REASON_DESC VARCHAR(16777216) COMMENT 'Description of account closure reason',
	OFFICER_NUMBER VARCHAR(16777216) COMMENT 'Employee number of the primary officer managing the account',
	OFFICER_NAME VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Name of the primary officer managing the account',
	INITIAL_FUNDING_AMOUNT NUMBER(18,2) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Initial amount deposited to fund the account',
	BRANCH_NUMBER VARCHAR(16777216) WITH TAG (OFG_SF_SECURE_DB.PII_TAGS.PII_INFO='CRITICAL') COMMENT 'Branch identifier number where the account was opened',
	BRANCH_DESCRIPTION VARCHAR(16777216) COMMENT 'Description about the branch where the account was opened',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value used for change detection',
	RECORD_DATE DATE COMMENT 'Date when the record was created',
	EFFECTIVE_START_DATE DATE COMMENT 'Start date of the record validity',
	EFFECTIVE_END_DATE DATE COMMENT 'End date of the record validity',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicator of current record status (e.g., Active, Inactive)',
	BUSINESS_DATE DATE COMMENT 'Business date the data corresponds to',
	INSERT_BY VARCHAR(16777216) COMMENT 'User who inserted the record',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Timestamp when the record was inserted',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User who last modified the record',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Timestamp of last record modification'
) COMMENT='The level of data in this dimension table is at ACCOUNT_NUMBER';
`;

export const depositAccountPackageSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Account Package Dimension
-- Schema: CORE_DEPOSIT
-- Source: bronze.account_package
-- Purpose: Account package and tier information with SCD Type 2
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_DIM_ACCOUNT_PACKAGE START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_ACCOUNT_PACKAGE (
	ACCOUNT_PACKAGE_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_DIM_ACCOUNT_PACKAGE.NEXTVAL COMMENT 'Surrogate key for the account dimension',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key linking to DIM_ACCOUNT (ACCOUNT_SK)',
	ACCOUNT_NUMBER VARCHAR(16777216) COMMENT 'Unique account number associated with the package',
	ACCOUNT_PACKAGE_ID VARCHAR(16777216) COMMENT 'Unique identifier for the account package',
	ACCOUNT_PACKAGE_NAME VARCHAR(16777216) COMMENT 'Name of the account package',
	ACCOUNT_PACKAGE_DESCRIPTION VARCHAR(16777216) COMMENT 'Detailed description of the account package',
	ACCOUNT_TIER_ID VARCHAR(16777216) COMMENT 'Identifier for the account tier',
	ACCOUNT_TIER_NAME VARCHAR(16777216) COMMENT 'Name of the account tier',
	ACCOUNT_ENROLLMENT_ROLE_CODE VARCHAR(16777216) COMMENT 'Role code for enrollment (e.g., Primary, Secondary)',
	ACCOUNT_ENROLLMENT_FORCED_IND VARCHAR(16777216) COMMENT 'Indicates if enrollment is mandatory (Y/N)',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of business columns used for change tracking',
	BUSINESS_DATE DATE COMMENT 'Business date associated with the data record',
	RECORD_DATE DATE COMMENT 'Date when the record was extracted from source system',
	EFFECTIVE_START_DATE DATE COMMENT 'Start date indicating when the record became valid',
	EFFECTIVE_END_DATE DATE COMMENT 'End date indicating when the record expired',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Record status flag (e.g., Active, Inactive)',
	INSERT_BY VARCHAR(16777216) COMMENT 'User who inserted the record',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Timestamp of record insertion',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'User who last modified the record',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Timestamp of last modification'
) COMMENT='The level of data in this dimension table is at ACCOUNT_NUMBER X ACCOUNT_ENROLLMENT_ROLE_CODE';
`;

export const depositDebitCardSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Debit Card Dimension
-- Schema: CORE_DEPOSIT
-- Source: bronze.debit_card
-- Purpose: Debit card information linked to deposit accounts
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_DIM_DEBIT_CARD START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_DEBIT_CARD (
	DEBIT_CARD_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_DIM_DEBIT_CARD.NEXTVAL COMMENT 'Surrogate key for the debit card.',
	ACCOUNT_NUMBER VARCHAR(16777216) COMMENT 'Foreign key referencing the associated deposit account.',
	CUSTOMER_NUMBER VARCHAR(16777216) COMMENT 'Optional foreign key referencing the customer.',
	DEBIT_CARD_NUMBER VARCHAR(16777216) COMMENT 'Masked or tokenized debit card number.',
	ISSUE_DATE TIMESTAMP_NTZ(9) COMMENT 'Date the debit card was issued.',
	EXPIRY_DATE TIMESTAMP_NTZ(9) COMMENT 'Date when the debit card expires.',
	CARD_STATUS VARCHAR(16777216) COMMENT 'Current status of the card (e.g., Active, Blocked, Expired).',
	IS_PRIMARY_CARD VARCHAR(16777216) COMMENT 'Indicates whether this is the primary debit card for the account.',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	EFFECTIVE_START_DATE DATE COMMENT 'Start date of this record for SCD tracking.',
	EFFECTIVE_END_DATE DATE COMMENT 'End date of this record for SCD tracking.',
	RECORD_FLAG VARCHAR(16777216) COMMENT 'Indicator of current record status (e.g., Active, Inactive)',
	INSERT_BY VARCHAR(16777216) COMMENT 'The identifier of the user or system that inserted the record.',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was initially inserted into the database.',
	LAST_MODIFIED_BY VARCHAR(16777216) COMMENT 'The identifier of the user or system that last modified the record.',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was last modified.'
) COMMENT='The level of data in this dimension table is at ACCOUNT_NUMBER X CUSTOMER_NUMBER X DEBIT_CARD_NUMBER';
`;

export const depositDimensionSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Dimension (Main)
-- Schema: CORE_DEPOSIT
-- Source: bronze.deposit_account_master, bronze.time_deposit
-- Purpose: Complete deposit account attributes with SCD Type 2
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_DIM_DEPOSIT START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE DIM_DEPOSIT (
	ACCOUNT_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_DIM_DEPOSIT.NEXTVAL COMMENT 'A surrogate key uniquely identifying each deposit account in the dimension table.',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'A foreign key linking to the dim_account dimension table points to account_sk.',
	ACCOUNT_NUMBER VARCHAR(16777216) COMMENT 'A unique identifier assigned to each customer''s deposit account.',
	BANK_NUMBER NUMBER(38,0) COMMENT 'A surrogate key uniquely identifying each bank in the dimension table.',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'A surrogate key uniquely identifying each branch in the dimension table.',
	BRANCH_NAME VARCHAR(16777216) COMMENT 'Name of the branch',
	ACCOUNT_NUMBER_OPERATIONAL VARCHAR(16777216) COMMENT 'A unique identifier assigned to each customer''s deposit account.',
	ACCOUNT_TYPE VARCHAR(10) COMMENT 'The type of deposit account, such as savings, checking, or fixed deposit.',
	ACCOUNT_DESCRIPTION VARCHAR(16777216) COMMENT 'Description of the Account',
	ACCOUNT_TYPE_CODE VARCHAR(50) COMMENT 'A code representing the type of deposit account.',
	ACCOUNT_CATEGORY_DESCRIPTION VARCHAR(16777216) COMMENT 'Category description of the Account',
	ACCOUNT_NAME VARCHAR(100) COMMENT 'The name associated with the deposit account.',
	CURRENT_INTEREST_RATE NUMBER(18,6) COMMENT 'The current interest rate applied to the deposit account.',
	ACCOUNT_STATUS VARCHAR(100) COMMENT 'The current status of the deposit account, such as active, closed, or dormant.',
	ACCOUNT_SHORT_NAME VARCHAR(100) COMMENT 'A short or abbreviated name for the deposit account.',
	ACCOUNT_OPEN_DATE DATE COMMENT 'The date on which the deposit account was opened.',
	ACCOUNT_STATUS_CODE VARCHAR(20) COMMENT 'A code representing the status of the deposit account.',
	ACCOUNT_CLOSE_DATE DATE COMMENT 'The date on which the deposit account was closed, if applicable.',
	ACCOUNT_CLOSED_REASON VARCHAR(500) COMMENT 'The reason for closing the deposit account.',
	ACCOUNT_RENEWAL_CODE VARCHAR(20) COMMENT 'A code representing the renewal status of the deposit account.',
	ACCOUNT_REOPEN_DATE DATE COMMENT 'The date on which the deposit account was reopened, if applicable.',
	TIME_DEPOSIT_ID VARCHAR(50) COMMENT 'The Time Deposit account number , if applicable.',
	ACCOUNT_OPEN_INDICATOR NUMBER(38,0) COMMENT 'Account Open indicator  1- open ,0- closed , if applicable.',
	ACCOUNT_TD_OPEN_DATE DATE COMMENT 'The date on which the term deposit account was opened.',
	ACCOUNT_TD_CLOSED_DATE DATE COMMENT 'The date on which the term deposit account was closed, if applicable.',
	ACCOUNT_TD_ORIGINAL_BALANCE NUMBER(18,6) COMMENT 'The original balance of the term deposit account at the time of opening.',
	ACCOUNT_TD_ORIGINAL_INTEREST_RATE NUMBER(18,6) COMMENT 'The original interest rate applied to the term deposit account.',
	ACCOUNT_TD_STATUS_CODE VARCHAR(20) COMMENT 'A code representing the status of the term deposit account.',
	ACCOUNT_TD_LAST_MATURITY_DATE DATE COMMENT 'The last maturity date of the term deposit account.',
	ACCOUNT_TD_NEXT_MATURITY_DATE DATE COMMENT 'The next maturity date of the term deposit account.',
	ACCOUNT_TD_FIRST_RENEWAL_DATE DATE COMMENT 'The date of the first renewal of the term deposit account.',
	ACCOUNT_OFFICER_NUMBER VARCHAR(16777216) COMMENT 'Unique identifier or employee number of the primary account officer.',
	ACCOUNT_OFFICER_NAME VARCHAR(16777216) COMMENT 'Full name of the primary account officer responsible for the account.',
	SECONDARY_OFFICER_NUMBER VARCHAR(16777216) COMMENT 'Unique identifier of the secondary or backup account officer, if assigned.',
	SECONDARY_OFFICER_NAME VARCHAR(16777216) COMMENT 'Full name of the secondary account officer supporting the account.',
	ACCOUNT_LAST_STATEMENT_BALANCE NUMBER(18,6) COMMENT 'Ending balance of the account in the most recent statement cycle.',
	LAST_STATEMENT_DATE DATE COMMENT 'Date when the last account statement was generated or issued.',
	PREVIOUS_STATEMENT_BALANCE NUMBER(18,6) COMMENT 'Ending balance from the statement prior to the last one.',
	NEXT_STATEMENT_DATE DATE COMMENT 'Scheduled date for the next statement to be generated.',
	ACCOUNT_ELECTRONIC_STATEMENT VARCHAR(16777216) COMMENT 'Indicator (e.g., Yes/No or Boolean) showing whether the account receives e-statements.',
	ACCOUNT_USER_DEFINED_CODE1 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE2 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE3 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE4 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE5 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE6 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE7 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE8 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE9 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	ACCOUNT_USER_DEFINED_CODE10 VARCHAR(100) COMMENT 'A user-defined code for custom categorization or identification.',
	INTEREST_PLAN_CODE VARCHAR(100) COMMENT 'A code representing the interest plan applied to the deposit account.',
	INTEREST_PAYMENT_TYPE VARCHAR(100) COMMENT 'The type of interest payment, such as monthly, quarterly, or annually.',
	EXCEPTION_PLAN VARCHAR(100) COMMENT 'A plan or code representing any exceptions applied to the deposit account.',
	SERVICE_CHARGE_CODE VARCHAR(100) COMMENT 'A code representing the service charges applicable to the deposit account.',
	DEPOSIT_CATEGORY VARCHAR(100) COMMENT 'The category of the deposit, such as retail, corporate, or government.',
	DEPOSIT_CATEGORY_DESCRIPTION VARCHAR(100) COMMENT 'A description of the deposit category.',
	COST_CENTER VARCHAR(100) COMMENT 'The cost center associated with the deposit account for accounting purposes.',
	ACCOUNT_CURRENT_INTEREST_RATE NUMBER(18,6) COMMENT 'The current interest rate applied to the deposit account.',
	TD_ORIGINAL_BALANCE NUMBER(18,6) COMMENT 'The original balance of the term deposit account at the time of opening.',
	TD_ORIGINAL_INTEREST_RATE NUMBER(18,6) COMMENT 'The original interest rate applied to the term deposit account.',
	TD_MATURITY_DATE DATE COMMENT 'The maturity date of the term deposit account.',
	TD_MATURITY_TERM_COUNT NUMBER(18,6) COMMENT 'The number of terms until the maturity of the term deposit account.',
	EFFECTIVE_START_DATE DATE COMMENT 'The date on which the current terms and conditions of the deposit account became effective.',
	EFFECTIVE_END_DATE DATE COMMENT 'The date on which the current terms and conditions of the deposit account will end.',
	RECORD_FLAG VARCHAR(20) COMMENT 'A flag indicating the status of the record, such as active or inactive.',
	RECORD_DATE DATE COMMENT 'Date when the record was Extracted',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business.',
	ROW_HASH VARCHAR(16777216) COMMENT 'Hash value of Business Columns.',
	INSERT_BY VARCHAR(100) COMMENT 'The identifier of the user or system that inserted the record.',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was initially inserted into the database.',
	LAST_MODIFIED_BY VARCHAR(100) COMMENT 'The identifier of the user or system that last modified the record.',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was last modified.'
);
`;

export const depositAccountTransactionFactDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Account Transaction Fact
-- Schema: CORE_DEPOSIT
-- Source: bronze.money_transaction
-- Purpose: Transactional fact table for deposit account transactions
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_ACCOUNT_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_ACCOUNT_TRANSACTION (
	DEPOSIT_ACCOUNT_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_ACCOUNT_TRANSACTION.NEXTVAL COMMENT 'A surrogate key uniquely identifying each deposit account transaction in the fact table.',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'A foreign key linking to the dim_account dimension table points to account_sk.',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'A unique identifier assigned to each customer''s deposit account.',
	BANK_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the bank dimension table.',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the branch dimension table.',
	TRANSACTION_DATE DATE COMMENT 'The date on which the transaction occurred.',
	TRANSACTION_ENTRY_SRC_CODE VARCHAR(100) COMMENT 'A code representing the source of the transaction, such as ATH or BANK.',
	TRANSACTION_ID VARCHAR(100) COMMENT 'The datetime sequence on which the transaction occurred.',
	TRANSACTION_CODE VARCHAR(50) COMMENT 'A code representing the type of transaction, such as deposit, withdrawal, or transfer.',
	TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'The amount of money involved in the transaction.',
	DEBIT_CREDIT_INDICATOR VARCHAR(50) COMMENT 'An indicator specifying whether the transaction is a debit or credit.',
	TRANSACTION_DESCRIPTION VARCHAR(500) COMMENT 'A description of the transaction.',
	TRANSACTION_DESCRIPTION_LONG VARCHAR(500) COMMENT 'A details long description of the transaction.',
	TRANSACTION_CONTROL_NUMBER NUMBER(38,0) COMMENT 'A unique control number assigned to the transaction for tracking purposes.',
	REVERSAL_FLAG BOOLEAN COMMENT 'A flag indicating whether the transaction is a reversal of a previous transaction.',
	TRANSACTION_STATUS VARCHAR(50) COMMENT 'The current status of the transaction, such as pending, completed, or failed.',
	TRANSACTION_SOURCE_CODE VARCHAR(50) COMMENT 'A code representing the source of the transaction, such as ATM, online banking, or in-branch.',
	ORIGINAL_TRANSACTION_DATE DATE COMMENT 'The date of the original transaction, if the current transaction is a reversal or correction.',
	ORIGINAL_TRANSACTION_CODE VARCHAR(50) COMMENT 'The code of the original transaction, if the current transaction is a reversal or correction.',
	F_M_T_GROUP_ID VARCHAR(50) COMMENT 'A group identifier for financial management tracking.',
	A_C_H_TRACE_ID VARCHAR(50) COMMENT 'A unique identifier for tracing Automated Clearing House (ACH) transactions.',
	RECORD_DATE DATE COMMENT 'The date on which the record was created or last updated.',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was initially inserted into the database.',
	INSERT_BY VARCHAR(100) COMMENT 'The identifier of the user or system that inserted the record.'
) COMMENT='The level of data in this fact table is at ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositCertificateTransactionFactDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Certificate Transaction Fact
-- Schema: CORE_DEPOSIT
-- Source: bronze.certificate_transaction
-- Purpose: Certificate of deposit (CD) transaction fact table
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_CERTIFICATE_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_CERTIFICATE_TRANSACTION (
	DEPOSIT_CERTIFICATE_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_CERTIFICATE_TRANSACTION.NEXTVAL COMMENT 'A surrogate key uniquely identifying each deposit certificate transaction in the fact table.',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'A foreign key linking to the dim_account dimension table points to account_sk.',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'A foreign key linking to the account dimension table.',
	BANK_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the bank dimension table.',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the branch dimension table.',
	CALENDAR_DATE DATE COMMENT 'A foreign key linking to the date dimension table.',
	TRANSACTION_DATE DATE COMMENT 'The date on which the transaction occurred.',
	TRANSACTION_ID VARCHAR(100) COMMENT 'The datetime sequence on which the transaction occurred.',
	TRANSACTION_CODE VARCHAR(50) COMMENT 'A code representing the type of transaction, such as deposit, withdrawal, or transfer.',
	TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'The amount of money involved in the transaction.',
	DEBIT_CREDIT_INDICATOR VARCHAR(50) COMMENT 'An indicator specifying whether the transaction is a debit or credit.',
	TRANSACTION_DESCRIPTION VARCHAR(500) COMMENT 'A description of the transaction.',
	TRANSACTION_CONTROL_NUMBER NUMBER(38,0) COMMENT 'A unique control number assigned to the transaction for tracking purposes.',
	REVERSAL_FLAG BOOLEAN COMMENT 'A flag indicating whether the transaction is a reversal of a previous transaction.',
	TRANSACTION_STATUS VARCHAR(50) COMMENT 'The current status of the transaction, such as pending, completed, or failed.',
	C_D_PRINCIPAL_BALANCE NUMBER(18,6) COMMENT 'The principal balance of the deposit certificate account.',
	ACCOUNT_AVAILABLE_BALANCE NUMBER(18,6) COMMENT 'The balance of the deposit certificate account that is available for transactions.',
	ORIGINAL_TRANSACTION_DATE DATE COMMENT 'The date of the original transaction, if the current transaction is a reversal or correction.',
	F_T_M_GROUP_ID VARCHAR(50) COMMENT 'A group identifier for financial tracking and management.',
	RECORD_DATE DATE COMMENT 'The date on which the record was created or last updated.',
	BUSINESS_DATE DATE COMMENT 'The date on which the record was created or last updated.',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was initially inserted into the database.',
	INSERT_BY VARCHAR(100) COMMENT 'The identifier of the user or system that inserted the record.'
) COMMENT='The level of data in this fact table is at ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositDailyBalanceFactDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Daily Balance Fact
-- Schema: CORE_DEPOSIT
-- Source: bronze.deposit_account_balances_daily
-- Purpose: Daily balance snapshots for all deposit accounts
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_DAILY_BALANCE START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_DAILY_BALANCE (
	DEPOSIT_DAILY_BALANCE_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_DAILY_BALANCE.NEXTVAL COMMENT 'A surrogate key uniquely identifying each account in the dimension table.',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'A foreign key linking to the dim_account dimension table points to account_sk.',
	ACCOUNT_NUMBER VARCHAR(16777216) COMMENT 'A foreign key linking to the customer dimension table.',
	CALENDAR_DATE DATE COMMENT 'A surrogate key uniquely identifying each date in the dimension table.',
	BALANCE_DATE DATE COMMENT 'The date for which the balance information is recorded.',
	CURRENT_BALANCE NUMBER(18,6) COMMENT 'The current balance of the deposit account on the specified date.',
	AVAILABLE_BALANCE NUMBER(18,6) COMMENT 'The balance of the deposit account that is available for transactions on the specified date.',
	PREVIOUS_DAY_LEDGER_BALANCE_AMOUNT NUMBER(18,6) COMMENT 'The account''s ledger balance at the end of the previous business day.',
	PREVIOUS_MONTH_LEDGER_BALANCE_AMOUNT NUMBER(18,6) COMMENT 'The ledger balance recorded at the end of the previous calendar month.',
	AVG_LEDGER_BALANCE_YTD_AMOUNT NUMBER(18,6) COMMENT 'Year-to-date average of the account''s daily ledger balances.',
	AVG_LEDGER_BALANCE_MTD_AMOUNT NUMBER(18,6) COMMENT 'Month-to-date average of the account''s daily ledger balances.',
	AVAILABLE_BALANCE_AMOUNT NUMBER(18,6) COMMENT 'The current balance available for withdrawal or use, including cleared funds.',
	INTEREST_PAID_YTD_AMOUNT NUMBER(18,6) COMMENT 'Total interest paid on the account from the beginning of the current year to date.',
	INTEREST_PAID_MTD_AMOUNT NUMBER(18,6) COMMENT 'Total interest paid on the account from the beginning of the current month to date.',
	INTEREST_PAID_PREVIOUS_YTD_AMOUNT NUMBER(18,6) COMMENT 'Total interest paid on the account during the previous full calendar year.',
	LEDGER_BALANCE NUMBER(18,6) COMMENT 'The balance of the deposit account as per the bank''s ledger on the specified date.',
	TD_PRINCIPAL_BALANCE NUMBER(18,6) COMMENT 'The principal balance of the term deposit account on the specified date.',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business.',
	RECORD_DATE DATE COMMENT 'The date on which the record was created or last updated.',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was initially inserted into the database.',
	INSERT_BY VARCHAR(100) COMMENT 'The identifier of the user or system that inserted the record.'
) COMMENT='The level of data in this fact table is at ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositHoldTransactionFactDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Hold Transaction Fact
-- Schema: CORE_DEPOSIT
-- Source: bronze.hold_transaction
-- Purpose: Hold transactions on deposit accounts
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_HOLD_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_HOLD_TRANSACTION (
	DEPOSIT_HOLD_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_HOLD_TRANSACTION.NEXTVAL COMMENT 'System-generated number assigned to the customer record',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'A foreign key linking to the dim_account dimension table points to account_sk.',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'A unique identifier assigned to each customer''s deposit account.',
	BANK_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the bank dimension table.',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the branch dimension table.',
	CALENDAR_DATE DATE COMMENT 'A foreign key linking to the date dimension table.',
	HOLD_NUMBER NUMBER(38,0) COMMENT 'A unique identifier assigned to each hold transaction.',
	HOLD_TYPE VARCHAR(100) COMMENT 'The type of hold placed on the deposit account, such as legal hold or administrative hold.',
	HOLD_REASON VARCHAR(100) COMMENT 'The reason for placing the hold on the deposit account.',
	TRANSACTION_DATE DATE COMMENT 'The date on which the hold transaction occurred.',
	TRANSACTION_ID VARCHAR(100) COMMENT 'The datetime sequence on which the hold transaction occurred.',
	TRANSACTION_CODE VARCHAR(100) COMMENT 'A code representing the type of transaction related to the hold.',
	TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'The amount of money held in the deposit account.',
	HOLD_AMOUNT NUMBER(18,6) COMMENT 'The total amount of money held in the deposit account, including all holds.',
	HOLD_TRANSACTION_ENTERED_DATE DATE COMMENT 'The date on which the hold was entered into the system.',
	HOLD_TRANSACTION_EXPIRATION_DATE DATE COMMENT 'The date on which the hold is set to expire.',
	RECORD_DATE DATE COMMENT 'The date on which the record was created or last updated.',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was initially inserted into the database.',
	INSERT_BY VARCHAR(100) COMMENT 'The identifier of the user or system that inserted the record.'
) COMMENT='The level of data in this fact table is at ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositMaintenanceTransactionFactDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Maintenance Transaction Fact
-- Schema: CORE_DEPOSIT
-- Source: bronze.maintenance_log_transaction
-- Purpose: Maintenance transaction history for deposit accounts
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_MAINTENANCE_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_MAINTENANCE_TRANSACTION (
	DEPOSIT_MAINTENANCE_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_MAINTENANCE_TRANSACTION.NEXTVAL COMMENT 'A surrogate key uniquely identifying each deposit maintenance transaction in the fact table.',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'A foreign key linking to the dim_account dimension table points to account_sk.',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'A foreign key linking to the account dimension table.',
	BANK_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the bank dimension table.',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the branch dimension table.',
	CALENDAR_DATE DATE COMMENT 'A foreign key linking to the date dimension table.',
	TRANSACTION_DATE DATE COMMENT 'The date on which the maintenance transaction occurred.',
	TRANSACTION_ID VARCHAR(100) COMMENT 'The datetime sequence on which the maintenance transaction occurred.',
	MAINTENANCE_TRANSACTION_CODE VARCHAR(100) COMMENT 'A code representing the type of maintenance transaction performed.',
	MAINTENANCE_DESCRIPTION_CODE VARCHAR(100) COMMENT 'A code describing the maintenance transaction.',
	KEYWORD_NEW_VALUE VARCHAR(100) COMMENT 'The new value of the keyword or attribute after the maintenance transaction.',
	KEYWORD_OLD_VALUE VARCHAR(100) COMMENT 'The old value of the keyword or attribute before the maintenance transaction.',
	RECORD_DATE DATE COMMENT 'The date on which the record was created or last updated.',
	BUSINESS_DATE DATE COMMENT 'The date on which the record was created or last updated.',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was initially inserted into the database.',
	INSERT_BY VARCHAR(100) COMMENT 'The identifier of the user or system that inserted the record.'
) COMMENT='The level of data in this fact table is at ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositStopTransactionFactDDL = `
-- ============================================================================
-- SILVER LAYER: Deposit Stop Transaction Fact
-- Schema: CORE_DEPOSIT
-- Source: bronze.stop_transaction
-- Purpose: Stop payment transactions on deposit accounts
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_DEPOSIT_STOP_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_DEPOSIT_STOP_TRANSACTION (
	DEPOSIT_STOP_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_DEPOSIT.SEQ_FCT_DEPOSIT_STOP_TRANSACTION.NEXTVAL COMMENT 'System-generated number assigned to the customer record',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'A foreign key linking to the dim_account dimension table points to account_sk.',
	CALENDAR_DATE DATE COMMENT 'A foreign key linking to the date dimension table.',
	BANK_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the bank dimension table.',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'A foreign key linking to the branch dimension table.',
	ACCOUNT_NUMBER VARCHAR(16777216) COMMENT 'A unique identifier assigned to each customer''s deposit account.',
	STOP_PAYMENT_I_D VARCHAR(100) COMMENT 'A unique identifier for the stop payment instruction.',
	TRANSACTION_DATE DATE COMMENT 'The date on which the stop transaction occurred.',
	TRANSACTION_ID VARCHAR(100) COMMENT 'The datetime sequence on which the transaction occurred.',
	TRANSACTION_CODE VARCHAR(100) COMMENT 'A code representing the type of transaction related to the stop payment.',
	TRANSACTION_AMOUNT NUMBER(38,0) COMMENT 'The amount of money involved in the stop transaction.',
	STOP_TYPE VARCHAR(100) COMMENT 'The type of stop payment, such as check stop or ACH stop.',
	STOP_REASON VARCHAR(100) COMMENT 'The reason for placing the stop payment.',
	STOP_ENTERED_DATE DATE COMMENT 'The date on which the stop payment was entered into the system.',
	STOP_EXPIRATION_DATE DATE COMMENT 'The date on which the stop payment is set to expire.',
	SERIAL_NUMBER NUMBER(38,0) COMMENT 'The serial number of the check or transaction being stopped.',
	END_SERIAL_NUMBER NUMBER(38,0) COMMENT 'The ending serial number if a range of checks or transactions is being stopped.',
	A_C_H_COMPANY_ID VARCHAR(100) COMMENT 'The company identifier for ACH transactions.',
	A_C_H_ENTRY_CLASS VARCHAR(100) COMMENT 'The entry class code for ACH transactions.',
	A_C_H_INDIVIDUAL_ID VARCHAR(100) COMMENT 'The individual identifier for ACH transactions.',
	TRANSACTION_TME_SEQ VARCHAR(100) COMMENT 'The datetime sequence on which the stop transaction occurred.',
	RECORD_DATE DATE COMMENT 'The date on which the record was created or last updated.',
	BUSINESS_DATE DATE COMMENT 'Date when the record was created in business',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'The date and time when the record was initially inserted into the database.',
	INSERT_BY VARCHAR(100) COMMENT 'The identifier of the user or system that inserted the record.'
) COMMENT='The level of data in this fact table is at ACCOUNT_NUMBER X TRANSACTION_ID';
`;

export const depositsSilverDDLCatalog = {
  domain: "Deposits",
  layer: "Silver",
  schema: "CORE_DEPOSIT",
  scripts: [
    {
      name: "DIM_ACCOUNT",
      ddl: depositAccountSilverDDL,
      scdType: "Type 2",
      estimatedRows: "8M",
      grain: "ACCOUNT_NUMBER"
    },
    {
      name: "DIM_ACCOUNT_PACKAGE",
      ddl: depositAccountPackageSilverDDL,
      scdType: "Type 2",
      estimatedRows: "10M",
      grain: "ACCOUNT_NUMBER X ACCOUNT_ENROLLMENT_ROLE_CODE"
    },
    {
      name: "DIM_DEBIT_CARD",
      ddl: depositDebitCardSilverDDL,
      scdType: "Type 2",
      estimatedRows: "6M",
      grain: "ACCOUNT_NUMBER X CUSTOMER_NUMBER X DEBIT_CARD_NUMBER"
    },
    {
      name: "DIM_DEPOSIT",
      ddl: depositDimensionSilverDDL,
      scdType: "Type 2",
      estimatedRows: "8M",
      grain: "ACCOUNT_NUMBER"
    },
    {
      name: "FCT_DEPOSIT_DAILY_BALANCE",
      ddl: depositDailyBalanceFactDDL,
      scdType: "Type 1",
      estimatedRows: "100M",
      grain: "ACCOUNT_NUMBER X BALANCE_DATE"
    }
  ]
};

export default depositsSilverDDLCatalog;
