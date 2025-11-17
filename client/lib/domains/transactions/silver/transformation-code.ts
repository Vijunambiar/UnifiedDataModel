/**
 * TRANSACTIONS DOMAIN - SILVER LAYER - TRANSFORMATION CODE (PRODUCTION READY)
 *
 * Complete dbt models for Bronze → Silver transaction transformations
 * Purpose: Cleanse, classify, deduplicate transactions, calculate running balances
 * Technology: dbt Core 1.7+ / Snowflake SQL
 */

// ============================================================================
// MODEL: TRANSACTION FACT (Cleansed & Classified)
// ============================================================================
export const transactionFactTransformation = {
  modelName: "transaction_fact",
  sourceLayer: "Bronze",
  targetLayer: "Silver",
  description:
    "Cleansed transaction fact table with classification and running balances",
  materializationType: "incremental",

  dbtModel: `
{{
  config(
    materialized='incremental',
    unique_key='transaction_id',
    cluster_by=['transaction_date', 'account_id'],
    partition_by={
      "field": "transaction_date",
      "data_type": "date",
      "granularity": "month"
    },
    tags=['transactions', 'silver', 'fact', 'real_time']
  )
}}

WITH source_transactions AS (
  SELECT
    TRANSACTION_ID AS transaction_id,
    ACCOUNT_ID AS account_id,
    
    -- Transaction Classification
    UPPER(TRIM(TRANSACTION_TYPE)) AS transaction_type,
    UPPER(TRIM(TRANSACTION_CODE)) AS transaction_code,
    UPPER(TRIM(TRANSACTION_CATEGORY)) AS transaction_category,
    CASE 
      WHEN TRANSACTION_TYPE IN ('DEPOSIT', 'INTEREST', 'REFUND') THEN 'CREDIT'
      WHEN TRANSACTION_TYPE IN ('WITHDRAWAL', 'FEE', 'PAYMENT') THEN 'DEBIT'
      ELSE 'OTHER'
    END AS debit_credit_indicator,
    
    -- Amounts
    TRY_TO_NUMBER(TRANSACTION_AMOUNT, 15, 2) AS transaction_amount,
    CASE 
      WHEN TRANSACTION_TYPE IN ('DEPOSIT', 'INTEREST', 'REFUND') 
      THEN TRY_TO_NUMBER(TRANSACTION_AMOUNT, 15, 2)
      ELSE 0
    END AS credit_amount,
    CASE 
      WHEN TRANSACTION_TYPE IN ('WITHDRAWAL', 'FEE', 'PAYMENT') 
      THEN TRY_TO_NUMBER(TRANSACTION_AMOUNT, 15, 2)
      ELSE 0
    END AS debit_amount,
    
    -- Dates & Times
    TRY_TO_TIMESTAMP(TRANSACTION_TIMESTAMP) AS transaction_timestamp,
    TRY_TO_DATE(TRANSACTION_DATE) AS transaction_date,
    TRY_TO_DATE(POST_DATE) AS post_date,
    TRY_TO_DATE(VALUE_DATE) AS value_date,
    
    -- Transaction Details
    DESCRIPTION AS transaction_description,
    UPPER(TRIM(CHANNEL)) AS transaction_channel,
    UPPER(TRIM(LOCATION)) AS transaction_location,
    MERCHANT_NAME AS merchant_name,
    MERCHANT_CATEGORY_CODE AS mcc_code,
    
    -- Related Entities
    REFERENCE_NUMBER AS reference_number,
    CHECK_NUMBER AS check_number,
    TRANSFER_ACCOUNT_ID AS transfer_to_account_id,
    
    -- Status & Flags
    UPPER(TRIM(TRANSACTION_STATUS)) AS transaction_status,
    CASE WHEN REVERSAL_FLAG = 'Y' THEN TRUE ELSE FALSE END AS is_reversal,
    CASE WHEN DISPUTE_FLAG = 'Y' THEN TRUE ELSE FALSE END AS is_disputed,
    REVERSED_TRANSACTION_ID AS reversed_transaction_id,
    
    -- Fraud Detection
    TRY_TO_NUMBER(FRAUD_SCORE, 5, 2) AS fraud_score,
    UPPER(TRIM(FRAUD_STATUS)) AS fraud_status,
    
    -- Processing
    PRCS_DTE,
    _LOAD_TIMESTAMP,
    _RECORD_HASH
  FROM {{ source('bronze', 'account_transaction') }}
  WHERE TRANSACTION_ID IS NOT NULL
    AND ACCOUNT_ID IS NOT NULL
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
),

-- Deduplication (remove duplicate transactions)
deduped_transactions AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY transaction_id 
      ORDER BY _LOAD_TIMESTAMP DESC
    ) AS rn
  FROM source_transactions
),

-- Calculate running balance
transactions_with_balance AS (
  SELECT
    t.*,
    SUM(credit_amount - debit_amount) OVER (
      PARTITION BY account_id 
      ORDER BY transaction_timestamp, transaction_id
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_balance,
    
    -- Lag/Lead for transaction patterns
    LAG(transaction_timestamp) OVER (
      PARTITION BY account_id 
      ORDER BY transaction_timestamp
    ) AS previous_transaction_timestamp,
    LEAD(transaction_timestamp) OVER (
      PARTITION BY account_id 
      ORDER BY transaction_timestamp
    ) AS next_transaction_timestamp,
    
    -- Time between transactions
    DATEDIFF('minute', 
      LAG(transaction_timestamp) OVER (PARTITION BY account_id ORDER BY transaction_timestamp),
      transaction_timestamp
    ) AS minutes_since_last_transaction
  FROM deduped_transactions
  WHERE rn = 1
),

-- Merchant categorization
categorized_transactions AS (
  SELECT
    t.*,
    CASE 
      WHEN mcc_code BETWEEN '5411' AND '5499' THEN 'GROCERY'
      WHEN mcc_code BETWEEN '5812' AND '5814' THEN 'RESTAURANT'
      WHEN mcc_code BETWEEN '5541' AND '5599' THEN 'GAS_STATION'
      WHEN mcc_code BETWEEN '4111' AND '4789' THEN 'TRANSPORTATION'
      WHEN mcc_code BETWEEN '5311' AND '5399' THEN 'RETAIL'
      WHEN mcc_code BETWEEN '6010' AND '6099' THEN 'FINANCIAL_SERVICES'
      WHEN mcc_code BETWEEN '7011' AND '7999' THEN 'SERVICES'
      WHEN mcc_code BETWEEN '4511' AND '4582' THEN 'TRAVEL'
      ELSE 'OTHER'
    END AS merchant_category,
    
    -- Transaction risk flags
    CASE 
      WHEN transaction_amount > 10000 THEN TRUE 
      ELSE FALSE 
    END AS is_large_transaction,
    CASE 
      WHEN transaction_channel = 'ATM' AND transaction_location NOT LIKE '%US%' THEN TRUE 
      ELSE FALSE 
    END AS is_international_atm,
    CASE 
      WHEN minutes_since_last_transaction < 2 AND transaction_amount > 100 THEN TRUE 
      ELSE FALSE 
    END AS is_rapid_transaction
  FROM transactions_with_balance
)

SELECT
  {{ dbt_utils.generate_surrogate_key(['transaction_id']) }} AS transaction_sk,
  transaction_id,
  account_id,
  
  -- Classification
  transaction_type,
  transaction_code,
  transaction_category,
  debit_credit_indicator,
  merchant_category,
  
  -- Amounts
  transaction_amount,
  credit_amount,
  debit_amount,
  running_balance,
  
  -- Dates
  transaction_timestamp,
  transaction_date,
  post_date,
  value_date,
  
  -- Details
  transaction_description,
  transaction_channel,
  transaction_location,
  merchant_name,
  mcc_code,
  
  -- References
  reference_number,
  check_number,
  transfer_to_account_id,
  
  -- Status
  transaction_status,
  is_reversal,
  is_disputed,
  reversed_transaction_id,
  
  -- Fraud
  fraud_score,
  fraud_status,
  
  -- Derived Flags
  is_large_transaction,
  is_international_atm,
  is_rapid_transaction,
  
  -- Transaction Patterns
  minutes_since_last_transaction,
  
  -- Audit
  'FIS_TRANSACTION_SYSTEM' AS source_system,
  CURRENT_TIMESTAMP() AS created_timestamp,
  CURRENT_TIMESTAMP() AS updated_timestamp
FROM categorized_transactions
  `,

  tests: [
    "unique: transaction_id",
    "not_null: transaction_id",
    "not_null: account_id",
    "relationships: account_id in silver.deposit_account",
    "dbt_expectations.expect_column_values_to_not_be_null: transaction_amount",
    "dbt_utils.expression_is_true: transaction_amount != 0 OR transaction_type = 'FEE'",
  ],

  dependencies: ["bronze.account_transaction"],
  outputSchema: "silver",
  outputTable: "transaction_fact",
};

// ============================================================================
// TRANSFORMATION CATALOG
// ============================================================================
export const transactionsSilverTransformationCatalog = {
  domain: "Transactions",
  layer: "Silver",
  transformationTool: "dbt Core 1.7+",
  refreshFrequency: "Hourly (near real-time)",

  models: [transactionFactTransformation],

  totalModels: 1,
  estimatedDuration: "5-10 minutes per run",

  businessLogic: {
    deduplication: "Remove duplicate transaction_ids keeping most recent",
    categorization: "MCC-based merchant categorization",
    runningBalance: "Calculate running balance using window functions",
    fraudDetection: "Flag large, international, and rapid transactions",
  },

  qualityGates: {
    preTransformation: [
      "No null transaction_ids",
      "Transaction amounts are non-zero (except fees)",
      "Transaction dates not in future",
    ],
    postTransformation: [
      "Unique transaction_ids",
      "All accounts exist in deposit_account",
      "Total debits approximately equal total credits (daily)",
    ],
  },
};

export default transactionsSilverTransformationCatalog;
