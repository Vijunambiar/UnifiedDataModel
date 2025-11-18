/**
 * TRANSACTIONS DOMAIN - SILVER LAYER - DDL SCRIPTS
 * 
 * CREATE TABLE statements for Silver layer (conformed, cleansed, enriched)
 * Schema: CORE_TRANSACTIONS
 * Source: Bronze layer tables
 * SCD Type: Type 1 for transaction facts
 */

export const transactionDetailSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Transaction Detail Enriched
-- Schema: CORE_TRANSACTIONS
-- Source: bronze.money_transaction
-- Purpose: Complete transaction detail with enrichment and categorization
-- ============================================================================

USE SCHEMA CORE_TRANSACTIONS;

CREATE OR REPLACE SEQUENCE SEQ_FCT_TRANSACTION_DETAIL START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_TRANSACTION_DETAIL (
	TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_TRANSACTIONS.SEQ_FCT_TRANSACTION_DETAIL.NEXTVAL COMMENT 'Surrogate key for transaction',
	TRANSACTION_ID VARCHAR(100) COMMENT 'Unique transaction identifier',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key to account dimension',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'Account number on which transaction occurred',
	CUSTOMER_NUMBER VARCHAR(100) COMMENT 'Customer number associated with the account',
	BANK_NUMBER NUMBER(38,0) COMMENT 'Bank identifier',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'Branch identifier',
	TRANSACTION_DATE DATE COMMENT 'Date transaction was posted',
	TRANSACTION_TIME TIMESTAMP_NTZ(9) COMMENT 'Timestamp of transaction execution',
	TRANSACTION_CODE VARCHAR(10) COMMENT 'Transaction type code',
	TRANSACTION_TYPE VARCHAR(50) COMMENT 'Standard transaction type: DEPOSIT, WITHDRAWAL, TRANSFER, etc.',
	TRANSACTION_CATEGORY VARCHAR(50) COMMENT 'Business category: CHECK, ACH, ATM, WIRE, INTEREST, FEE',
	TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'Transaction amount (positive value)',
	DEBIT_CREDIT_INDICATOR VARCHAR(5) COMMENT 'D=Debit, C=Credit',
	TRANSACTION_DESCRIPTION VARCHAR(500) COMMENT 'Description of transaction',
	TRANSACTION_DESCRIPTION_LONG VARCHAR(1000) COMMENT 'Extended transaction description',
	TRANSACTION_STATUS VARCHAR(50) COMMENT 'Status: POSTED, PENDING, REVERSED, FAILED',
	TRANSACTION_CONTROL_NUMBER VARCHAR(100) COMMENT 'Control number for tracking',
	REVERSAL_FLAG BOOLEAN COMMENT 'Flag indicating if this is a reversal',
	ORIGINAL_TRANSACTION_DATE DATE COMMENT 'Date of original transaction if reversal',
	ORIGINAL_TRANSACTION_CODE VARCHAR(50) COMMENT 'Code of original transaction if reversal',
	TRANSACTION_SOURCE_CODE VARCHAR(50) COMMENT 'Source: ATM, ONLINE, BRANCH, MOBILE',
	TRANSACTION_CHANNEL VARCHAR(50) COMMENT 'Channel: RETAIL, COMMERCIAL, DIGITAL',
	BALANCE_AFTER_TRANSACTION NUMBER(18,6) COMMENT 'Running balance after transaction',
	CURRENCY_CODE VARCHAR(5) COMMENT 'Currency code (USD, EUR, etc.)',
	EXCHANGE_RATE NUMBER(18,6) COMMENT 'Exchange rate if foreign currency',
	FMT_GROUP_ID VARCHAR(50) COMMENT 'Financial management tracking group ID',
	ACH_TRACE_ID VARCHAR(50) COMMENT 'ACH trace identifier',
	WIRE_REFERENCE_NUMBER VARCHAR(100) COMMENT 'Wire transfer reference number',
	CHECK_NUMBER VARCHAR(50) COMMENT 'Check number if check transaction',
	COUNTERPARTY_NAME VARCHAR(200) COMMENT 'Name of counterparty',
	COUNTERPARTY_ACCOUNT VARCHAR(100) COMMENT 'Counterparty account number',
	COUNTERPARTY_BANK_CODE VARCHAR(50) COMMENT 'Counterparty bank routing number',
	SETTLEMENT_DATE DATE COMMENT 'Date transaction settled',
	VALUE_DATE DATE COMMENT 'Value date for interest calculation',
	POSTING_DATE DATE COMMENT 'Date transaction posted to account',
	AUTHORIZATION_CODE VARCHAR(100) COMMENT 'Authorization code from payment processor',
	MERCHANT_ID VARCHAR(100) COMMENT 'Merchant identifier for card transactions',
	MERCHANT_CATEGORY_CODE VARCHAR(10) COMMENT 'MCC code for merchant categorization',
	ATM_ID VARCHAR(50) COMMENT 'ATM identifier if ATM transaction',
	LOCATION_CITY VARCHAR(100) COMMENT 'City where transaction occurred',
	LOCATION_STATE VARCHAR(50) COMMENT 'State where transaction occurred',
	LOCATION_COUNTRY VARCHAR(50) COMMENT 'Country where transaction occurred',
	FRAUD_SCORE NUMBER(5,2) COMMENT 'Fraud risk score (0-100)',
	FRAUD_FLAG BOOLEAN COMMENT 'Flag indicating potential fraud',
	AML_SCREENING_STATUS VARCHAR(50) COMMENT 'AML screening status',
	COMPLIANCE_HOLD_FLAG BOOLEAN COMMENT 'Flag if transaction is on compliance hold',
	FEE_AMOUNT NUMBER(18,6) COMMENT 'Fee amount charged for transaction',
	FEE_DESCRIPTION VARCHAR(200) COMMENT 'Description of fee',
	INTEREST_AMOUNT NUMBER(18,6) COMMENT 'Interest amount if applicable',
	TAX_AMOUNT NUMBER(18,6) COMMENT 'Tax amount withheld',
	BUSINESS_DATE DATE COMMENT 'Business date when record was created',
	RECORD_DATE DATE COMMENT 'Date when record was extracted',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Timestamp when record was inserted',
	INSERT_BY VARCHAR(100) COMMENT 'User or system that inserted the record',
	LAST_MODIFIED_DT TIMESTAMP_NTZ(9) COMMENT 'Timestamp of last modification',
	LAST_MODIFIED_BY VARCHAR(100) COMMENT 'User or system that last modified the record'
) COMMENT='The level of data in this fact table is at TRANSACTION_ID';
`;

export const achTransactionSilverDDL = `
-- ============================================================================
-- SILVER LAYER: ACH Transaction Detail
-- Schema: CORE_TRANSACTIONS
-- Source: bronze.ach_transaction
-- Purpose: ACH transaction detail with NACHA compliance data
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_ACH_TRANSACTION START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_ACH_TRANSACTION (
	ACH_TRANSACTION_SK NUMBER(38,0) DEFAULT CORE_TRANSACTIONS.SEQ_FCT_ACH_TRANSACTION.NEXTVAL COMMENT 'Surrogate key for ACH transaction',
	TRANSACTION_ID VARCHAR(100) COMMENT 'Unique transaction identifier',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key to account dimension',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'Account number',
	BANK_NUMBER NUMBER(38,0) COMMENT 'Bank identifier',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'Branch identifier',
	TRANSACTION_DATE DATE COMMENT 'Transaction date',
	SETTLEMENT_DATE DATE COMMENT 'Settlement date',
	ACH_BATCH_ID VARCHAR(100) COMMENT 'ACH batch identifier',
	ACH_TRACE_NUMBER VARCHAR(50) COMMENT 'ACH trace number (15 digits)',
	ACH_COMPANY_ID VARCHAR(50) COMMENT 'Company ID (originator)',
	ACH_COMPANY_NAME VARCHAR(200) COMMENT 'Company name',
	ACH_ENTRY_CLASS_CODE VARCHAR(5) COMMENT 'SEC code: PPD, CCD, WEB, TEL, etc.',
	ACH_ENTRY_DESCRIPTION VARCHAR(50) COMMENT 'Entry description',
	ACH_TRANSACTION_CODE VARCHAR(5) COMMENT 'Transaction code (22, 27, 32, 37, etc.)',
	ACH_AMOUNT NUMBER(18,6) COMMENT 'ACH transaction amount',
	DEBIT_CREDIT_INDICATOR VARCHAR(5) COMMENT 'D=Debit, C=Credit',
	RECEIVING_DFI_ID VARCHAR(50) COMMENT 'Receiving depository financial institution ID',
	ORIGINATING_DFI_ID VARCHAR(50) COMMENT 'Originating DFI ID',
	INDIVIDUAL_ID VARCHAR(100) COMMENT 'Individual identifier',
	INDIVIDUAL_NAME VARCHAR(200) COMMENT 'Individual or company name',
	DISCRETIONARY_DATA VARCHAR(200) COMMENT 'Discretionary data field',
	ADDENDA_RECORD_INDICATOR BOOLEAN COMMENT 'Flag indicating addenda records present',
	ADDENDA_DATA VARCHAR(1000) COMMENT 'Addenda record data',
	RETURN_REASON_CODE VARCHAR(5) COMMENT 'ACH return reason code',
	RETURN_REASON_DESC VARCHAR(200) COMMENT 'Return reason description',
	NOC_CHANGE_CODE VARCHAR(5) COMMENT 'Notification of change code',
	TRANSACTION_STATUS VARCHAR(50) COMMENT 'Status: PENDING, SETTLED, RETURNED, REJECTED',
	REVERSAL_FLAG BOOLEAN COMMENT 'Flag if this is a reversal',
	RISK_SCORE NUMBER(5,2) COMMENT 'Risk score for fraud detection',
	OFAC_SCREENING_STATUS VARCHAR(50) COMMENT 'OFAC screening result',
	BUSINESS_DATE DATE COMMENT 'Business date',
	RECORD_DATE DATE COMMENT 'Record extraction date',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Insert timestamp',
	INSERT_BY VARCHAR(100) COMMENT 'Insert user/system'
) COMMENT='The level of data in this fact table is at TRANSACTION_ID X ACH_TRACE_NUMBER';
`;

export const wireTransferSilverDDL = `
-- ============================================================================
-- SILVER LAYER: Wire Transfer Transaction
-- Schema: CORE_TRANSACTIONS
-- Source: bronze.wire_transfer_transaction
-- Purpose: Wire transfer detail with SWIFT/Fedwire compliance
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_WIRE_TRANSFER START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_WIRE_TRANSFER (
	WIRE_TRANSFER_SK NUMBER(38,0) DEFAULT CORE_TRANSACTIONS.SEQ_FCT_WIRE_TRANSFER.NEXTVAL COMMENT 'Surrogate key for wire transfer',
	TRANSACTION_ID VARCHAR(100) COMMENT 'Unique transaction identifier',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key to account dimension',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'Account number',
	BANK_NUMBER NUMBER(38,0) COMMENT 'Bank identifier',
	BRANCH_NUMBER NUMBER(38,0) COMMENT 'Branch identifier',
	TRANSACTION_DATE DATE COMMENT 'Transaction date',
	VALUE_DATE DATE COMMENT 'Value date',
	SETTLEMENT_DATE DATE COMMENT 'Settlement date',
	WIRE_TYPE VARCHAR(50) COMMENT 'DOMESTIC, INTERNATIONAL, FEDWIRE, SWIFT',
	WIRE_DIRECTION VARCHAR(10) COMMENT 'INCOMING, OUTGOING',
	WIRE_REFERENCE_NUMBER VARCHAR(100) COMMENT 'Wire reference/IMAD/OMAD',
	WIRE_AMOUNT NUMBER(18,6) COMMENT 'Wire transfer amount',
	WIRE_CURRENCY VARCHAR(5) COMMENT 'Currency code',
	EXCHANGE_RATE NUMBER(18,6) COMMENT 'Exchange rate if FX involved',
	DEBIT_CREDIT_INDICATOR VARCHAR(5) COMMENT 'D=Debit, C=Credit',
	ORIGINATOR_NAME VARCHAR(200) COMMENT 'Originator name',
	ORIGINATOR_ACCOUNT VARCHAR(100) COMMENT 'Originator account number',
	ORIGINATOR_ADDRESS VARCHAR(500) COMMENT 'Originator address',
	ORIGINATOR_BANK_NAME VARCHAR(200) COMMENT 'Originating bank name',
	ORIGINATOR_BANK_SWIFT VARCHAR(50) COMMENT 'Originating bank SWIFT/BIC',
	ORIGINATOR_BANK_ABA VARCHAR(50) COMMENT 'Originating bank ABA routing',
	BENEFICIARY_NAME VARCHAR(200) COMMENT 'Beneficiary name',
	BENEFICIARY_ACCOUNT VARCHAR(100) COMMENT 'Beneficiary account number',
	BENEFICIARY_ADDRESS VARCHAR(500) COMMENT 'Beneficiary address',
	BENEFICIARY_BANK_NAME VARCHAR(200) COMMENT 'Beneficiary bank name',
	BENEFICIARY_BANK_SWIFT VARCHAR(50) COMMENT 'Beneficiary bank SWIFT/BIC',
	BENEFICIARY_BANK_ABA VARCHAR(50) COMMENT 'Beneficiary bank ABA routing',
	INTERMEDIARY_BANK_NAME VARCHAR(200) COMMENT 'Intermediary bank name',
	INTERMEDIARY_BANK_SWIFT VARCHAR(50) COMMENT 'Intermediary bank SWIFT/BIC',
	PAYMENT_DETAILS VARCHAR(1000) COMMENT 'Payment details/instructions',
	SPECIAL_INSTRUCTIONS VARCHAR(1000) COMMENT 'Special handling instructions',
	FEES_OUR_SHA_BEN VARCHAR(10) COMMENT 'Fee arrangement: OUR, SHA, BEN',
	FEE_AMOUNT NUMBER(18,6) COMMENT 'Wire transfer fee',
	TRANSACTION_STATUS VARCHAR(50) COMMENT 'Status: PENDING, SENT, RECEIVED, FAILED, RECALLED',
	FEDWIRE_TAG_2000 VARCHAR(100) COMMENT 'Fedwire tag 2000',
	SWIFT_MT_MESSAGE_TYPE VARCHAR(10) COMMENT 'SWIFT MT message type (MT103, MT202, etc.)',
	OFAC_SCREENING_STATUS VARCHAR(50) COMMENT 'OFAC screening result',
	SANCTIONS_SCREENING_STATUS VARCHAR(50) COMMENT 'Sanctions screening result',
	AML_RISK_SCORE NUMBER(5,2) COMMENT 'AML risk score',
	COMPLIANCE_HOLD_FLAG BOOLEAN COMMENT 'Compliance hold indicator',
	BUSINESS_DATE DATE COMMENT 'Business date',
	RECORD_DATE DATE COMMENT 'Record extraction date',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Insert timestamp',
	INSERT_BY VARCHAR(100) COMMENT 'Insert user/system'
) COMMENT='The level of data in this fact table is at TRANSACTION_ID X WIRE_REFERENCE_NUMBER';
`;

export const transactionAggregationDailySilverDDL = `
-- ============================================================================
-- SILVER LAYER: Transaction Daily Aggregation
-- Schema: CORE_TRANSACTIONS
-- Source: silver.fct_transaction_detail
-- Purpose: Daily transaction summaries by account and type
-- ============================================================================

CREATE OR REPLACE SEQUENCE SEQ_FCT_TRANSACTION_DAILY_AGG START WITH 1 INCREMENT BY 1 ORDER;

CREATE OR REPLACE TABLE FCT_TRANSACTION_DAILY_AGGREGATION (
	DAILY_AGG_SK NUMBER(38,0) DEFAULT CORE_TRANSACTIONS.SEQ_FCT_TRANSACTION_DAILY_AGG.NEXTVAL COMMENT 'Surrogate key',
	ACCOUNT_NUMBER_FK NUMBER(38,0) COMMENT 'Foreign key to account dimension',
	ACCOUNT_NUMBER VARCHAR(100) COMMENT 'Account number',
	TRANSACTION_DATE DATE COMMENT 'Transaction date',
	TRANSACTION_CATEGORY VARCHAR(50) COMMENT 'Transaction category',
	TRANSACTION_TYPE VARCHAR(50) COMMENT 'Transaction type',
	TRANSACTION_CHANNEL VARCHAR(50) COMMENT 'Transaction channel',
	TOTAL_DEBIT_COUNT NUMBER(10,0) COMMENT 'Count of debit transactions',
	TOTAL_CREDIT_COUNT NUMBER(10,0) COMMENT 'Count of credit transactions',
	TOTAL_TRANSACTION_COUNT NUMBER(10,0) COMMENT 'Total transaction count',
	TOTAL_DEBIT_AMOUNT NUMBER(18,6) COMMENT 'Sum of debit amounts',
	TOTAL_CREDIT_AMOUNT NUMBER(18,6) COMMENT 'Sum of credit amounts',
	NET_TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'Net amount (credits - debits)',
	AVG_TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'Average transaction amount',
	MIN_TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'Minimum transaction amount',
	MAX_TRANSACTION_AMOUNT NUMBER(18,6) COMMENT 'Maximum transaction amount',
	TOTAL_FEE_AMOUNT NUMBER(18,6) COMMENT 'Total fees charged',
	REVERSAL_COUNT NUMBER(10,0) COMMENT 'Count of reversals',
	REVERSAL_AMOUNT NUMBER(18,6) COMMENT 'Total reversal amount',
	BUSINESS_DATE DATE COMMENT 'Business date',
	RECORD_DATE DATE COMMENT 'Record extraction date',
	INSERT_DT TIMESTAMP_NTZ(9) COMMENT 'Insert timestamp',
	INSERT_BY VARCHAR(100) COMMENT 'Insert user/system'
) COMMENT='The level of data in this fact table is at ACCOUNT_NUMBER X TRANSACTION_DATE X TRANSACTION_CATEGORY X TRANSACTION_TYPE';
`;

export const transactionsSilverDDLCatalog = {
  domain: "Transactions",
  layer: "Silver",
  schema: "CORE_TRANSACTIONS",
  scripts: [
    {
      name: "FCT_TRANSACTION_DETAIL",
      ddl: transactionDetailSilverDDL,
      scdType: "Type 1",
      estimatedRows: "1B",
      grain: "TRANSACTION_ID"
    },
    {
      name: "FCT_ACH_TRANSACTION",
      ddl: achTransactionSilverDDL,
      scdType: "Type 1",
      estimatedRows: "200M",
      grain: "TRANSACTION_ID X ACH_TRACE_NUMBER"
    },
    {
      name: "FCT_WIRE_TRANSFER",
      ddl: wireTransferSilverDDL,
      scdType: "Type 1",
      estimatedRows: "50M",
      grain: "TRANSACTION_ID X WIRE_REFERENCE_NUMBER"
    },
    {
      name: "FCT_TRANSACTION_DAILY_AGGREGATION",
      ddl: transactionAggregationDailySilverDDL,
      scdType: "Type 1",
      estimatedRows: "500M",
      grain: "ACCOUNT_NUMBER X TRANSACTION_DATE X TRANSACTION_CATEGORY X TRANSACTION_TYPE"
    }
  ]
};

export default transactionsSilverDDLCatalog;
