/**
 * DEPOSITS DOMAIN - SILVER LAYER - TRANSFORMATION CODE (PRODUCTION READY)
 *
 * Complete dbt models for Bronze → Silver deposit account transformations
 * Purpose: Cleanse, standardize account data, apply SCD Type 2, calculate derived metrics
 * Technology: dbt Core 1.7+ / Snowflake SQL
 */

// ============================================================================
// MODEL 1: DEPOSIT ACCOUNT (Master Dimension with SCD Type 2)
// ============================================================================
export const depositAccountTransformation = {
  modelName: "deposit_account",
  sourceLayer: "Bronze",
  targetLayer: "Silver",
  description: "Deposit account master dimension with full history tracking",
  materializationType: "incremental",
  scdType: "Type 2",

  dbtModel: `
{{
  config(
    materialized='incremental',
    unique_key='account_id',
    cluster_by=['account_id', 'effective_start_date'],
    tags=['deposits', 'silver', 'scd2', 'dimension']
  )
}}

WITH source_accounts AS (
  SELECT
    ACCOUNT_ID AS account_id,
    CUSTOMER_ID AS customer_id,
    
    -- Account Classification
    UPPER(TRIM(ACCOUNT_TYPE)) AS account_type,
    UPPER(TRIM(ACCOUNT_SUB_TYPE)) AS account_sub_type,
    UPPER(TRIM(ACCOUNT_STATUS)) AS account_status,
    CASE 
      WHEN ACCOUNT_TYPE = 'CHECKING' THEN 'DDA'
      WHEN ACCOUNT_TYPE = 'SAVINGS' THEN 'SAVINGS'
      WHEN ACCOUNT_TYPE = 'CD' THEN 'TIME_DEPOSIT'
      WHEN ACCOUNT_TYPE = 'MONEY_MARKET' THEN 'MMDA'
      ELSE 'OTHER'
    END AS account_category,
    
    -- Account Details
    ACCOUNT_NUMBER AS account_number_masked,
    BRANCH_CODE,
    PRODUCT_CODE,
    UPPER(TRIM(CURRENCY_CODE)) AS currency_code,
    
    -- Dates
    TRY_TO_DATE(OPEN_DATE) AS open_date,
    TRY_TO_DATE(CLOSE_DATE) AS close_date,
    TRY_TO_DATE(LAST_TRANSACTION_DATE) AS last_transaction_date,
    TRY_TO_DATE(LAST_STATEMENT_DATE) AS last_statement_date,
    
    -- Financial Terms
    TRY_TO_NUMBER(INTEREST_RATE, 10, 4) AS interest_rate,
    UPPER(TRIM(INTEREST_RATE_TYPE)) AS interest_rate_type,
    TRY_TO_NUMBER(MINIMUM_BALANCE, 12, 2) AS minimum_balance_required,
    TRY_TO_NUMBER(OVERDRAFT_LIMIT, 12, 2) AS overdraft_limit,
    
    -- Maturity (for CDs)
    TRY_TO_DATE(MATURITY_DATE) AS maturity_date,
    TRY_TO_NUMBER(TERM_MONTHS) AS term_months,
    UPPER(TRIM(ROLLOVER_INSTRUCTION)) AS rollover_instruction,
    
    -- Flags
    CASE WHEN OVERDRAFT_PROTECTION = 'Y' THEN TRUE ELSE FALSE END AS has_overdraft_protection,
    CASE WHEN ONLINE_BANKING_ENABLED = 'Y' THEN TRUE ELSE FALSE END AS online_banking_enabled,
    CASE WHEN MOBILE_BANKING_ENABLED = 'Y' THEN TRUE ELSE FALSE END AS mobile_banking_enabled,
    CASE WHEN DEBIT_CARD_ISSUED = 'Y' THEN TRUE ELSE FALSE END AS debit_card_issued,
    CASE WHEN CHECKBOOK_ISSUED = 'Y' THEN TRUE ELSE FALSE END AS checkbook_issued,
    
    -- Risk & Compliance
    UPPER(TRIM(RISK_RATING)) AS risk_rating,
    CASE WHEN KYC_COMPLETED = 'Y' THEN TRUE ELSE FALSE END AS kyc_completed,
    TRY_TO_DATE(KYC_COMPLETION_DATE) AS kyc_completion_date,
    TRY_TO_DATE(KYC_REVIEW_DATE) AS kyc_next_review_date,
    
    -- Derived Metrics
    DATEDIFF('day', TRY_TO_DATE(OPEN_DATE), CURRENT_DATE()) AS account_age_days,
    DATEDIFF('month', TRY_TO_DATE(OPEN_DATE), CURRENT_DATE()) AS account_age_months,
    CASE 
      WHEN DATEDIFF('day', TRY_TO_DATE(LAST_TRANSACTION_DATE), CURRENT_DATE()) > 365 THEN TRUE 
      ELSE FALSE 
    END AS is_dormant,
    
    -- Processing
    PRCS_DTE,
    _LOAD_TIMESTAMP,
    _RECORD_HASH
  FROM {{ source('bronze', 'account_master') }}
  WHERE IS_CURRENT = TRUE
    AND ACCOUNT_ID IS NOT NULL
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
),

-- SCD Type 2 Logic
scd_changes AS (
  SELECT
    curr.*,
    CASE
      WHEN prev.account_id IS NULL THEN 'INSERT'
      WHEN (
        curr.account_status != prev.account_status
        OR curr.interest_rate != prev.interest_rate
        OR curr.overdraft_limit != prev.overdraft_limit
        OR curr.risk_rating != prev.risk_rating
      ) THEN 'UPDATE'
      ELSE 'NO_CHANGE'
    END AS scd_action
  FROM source_accounts curr
  LEFT JOIN {{ this }} prev
    ON curr.account_id = prev.account_id
    AND prev.is_current = TRUE
)

SELECT
  {{ dbt_utils.generate_surrogate_key(['account_id', 'PRCS_DTE']) }} AS account_sk,
  account_id,
  customer_id,
  
  -- Classification
  account_type,
  account_sub_type,
  account_category,
  account_status,
  
  -- Details
  account_number_masked,
  BRANCH_CODE AS branch_code,
  PRODUCT_CODE AS product_code,
  currency_code,
  
  -- Dates
  open_date,
  close_date,
  last_transaction_date,
  last_statement_date,
  
  -- Terms
  interest_rate,
  interest_rate_type,
  minimum_balance_required,
  overdraft_limit,
  maturity_date,
  term_months,
  rollover_instruction,
  
  -- Features
  has_overdraft_protection,
  online_banking_enabled,
  mobile_banking_enabled,
  debit_card_issued,
  checkbook_issued,
  
  -- Risk
  risk_rating,
  kyc_completed,
  kyc_completion_date,
  kyc_next_review_date,
  
  -- Derived
  account_age_days,
  account_age_months,
  is_dormant,
  
  -- SCD Type 2
  PRCS_DTE AS effective_start_date,
  CASE WHEN scd_action = 'UPDATE' THEN CURRENT_TIMESTAMP() ELSE NULL END AS effective_end_date,
  CASE WHEN scd_action = 'UPDATE' THEN FALSE ELSE TRUE END AS is_current,
  CASE WHEN account_status = 'CLOSED' THEN close_date ELSE NULL END AS record_end_date,
  
  -- Audit
  'FIS_DEPOSIT_SYSTEM' AS source_system,
  CURRENT_TIMESTAMP() AS created_timestamp,
  CURRENT_TIMESTAMP() AS updated_timestamp
FROM scd_changes
WHERE scd_action IN ('INSERT', 'UPDATE')
  `,

  tests: [
    "unique: account_sk",
    "not_null: account_id",
    "not_null: customer_id",
    "relationships: customer_id in silver.customer_master_golden",
    "accepted_values: account_status in ('ACTIVE', 'INACTIVE', 'CLOSED', 'FROZEN')",
  ],

  dependencies: ["bronze.account_master"],
  outputSchema: "silver",
  outputTable: "deposit_account",
};

// ============================================================================
// MODEL 2: DEPOSIT BALANCE (Daily Snapshots)
// ============================================================================
export const depositBalanceTransformation = {
  modelName: "deposit_balance_daily",
  sourceLayer: "Bronze",
  targetLayer: "Silver",
  description: "Daily balance snapshots with calculated metrics",
  materializationType: "incremental",

  dbtModel: `
{{
  config(
    materialized='incremental',
    unique_key=['account_id', 'balance_date'],
    cluster_by=['balance_date', 'account_id'],
    partition_by={
      "field": "balance_date",
      "data_type": "date",
      "granularity": "month"
    },
    tags=['deposits', 'silver', 'fact', 'daily']
  )
}}

WITH daily_balances AS (
  SELECT
    ACCOUNT_ID AS account_id,
    TRY_TO_DATE(BALANCE_DATE) AS balance_date,
    
    -- Balance Amounts
    TRY_TO_NUMBER(OPENING_BALANCE, 15, 2) AS opening_balance,
    TRY_TO_NUMBER(CLOSING_BALANCE, 15, 2) AS closing_balance,
    TRY_TO_NUMBER(AVAILABLE_BALANCE, 15, 2) AS available_balance,
    TRY_TO_NUMBER(PENDING_BALANCE, 15, 2) AS pending_balance,
    TRY_TO_NUMBER(HOLD_AMOUNT, 15, 2) AS hold_amount,
    
    -- Daily Activity
    TRY_TO_NUMBER(TOTAL_DEPOSITS, 15, 2) AS total_deposits,
    TRY_TO_NUMBER(TOTAL_WITHDRAWALS, 15, 2) AS total_withdrawals,
    TRY_TO_NUMBER(TOTAL_FEES, 15, 2) AS total_fees,
    TRY_TO_NUMBER(INTEREST_ACCRUED, 15, 2) AS interest_accrued,
    TRY_TO_NUMBER(TRANSACTION_COUNT) AS transaction_count,
    
    -- Calculated Fields
    TRY_TO_NUMBER(CLOSING_BALANCE, 15, 2) - TRY_TO_NUMBER(OPENING_BALANCE, 15, 2) AS net_change,
    (TRY_TO_NUMBER(OPENING_BALANCE, 15, 2) + TRY_TO_NUMBER(CLOSING_BALANCE, 15, 2)) / 2 AS average_daily_balance,
    
    -- Data Quality
    CASE 
      WHEN ABS((OPENING_BALANCE + TOTAL_DEPOSITS - TOTAL_WITHDRAWALS - TOTAL_FEES + INTEREST_ACCRUED) - CLOSING_BALANCE) <= 0.01 
      THEN TRUE 
      ELSE FALSE 
    END AS balance_reconciled,
    
    PRCS_DTE,
    _LOAD_TIMESTAMP
  FROM {{ source('bronze', 'account_balance') }}
  WHERE 1=1
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
)

SELECT
  {{ dbt_utils.generate_surrogate_key(['account_id', 'balance_date']) }} AS balance_sk,
  account_id,
  balance_date,
  
  opening_balance,
  closing_balance,
  available_balance,
  pending_balance,
  hold_amount,
  
  total_deposits,
  total_withdrawals,
  total_fees,
  interest_accrued,
  transaction_count,
  
  net_change,
  average_daily_balance,
  balance_reconciled,
  
  -- Audit
  CURRENT_TIMESTAMP() AS created_timestamp,
  CURRENT_TIMESTAMP() AS updated_timestamp
FROM daily_balances
  `,

  dependencies: ["bronze.account_balance"],
  outputSchema: "silver",
  outputTable: "deposit_balance_daily",
};

// ============================================================================
// TRANSFORMATION CATALOG
// ============================================================================
export const depositsSilverTransformationCatalog = {
  domain: "Deposits",
  layer: "Silver",
  transformationTool: "dbt Core 1.7+",

  models: [depositAccountTransformation, depositBalanceTransformation],

  executionOrder: ["deposit_account", "deposit_balance_daily"],

  totalModels: 2,
  estimatedDuration: "10-15 minutes",

  qualityGates: {
    preTransformation: [
      "All account_ids must exist in customer_master",
      "No duplicate account_ids in source",
      "Balance date not in future",
    ],
    postTransformation: [
      "Unique account_sk",
      "All balances reconciled >= 99%",
      "No orphaned accounts (missing customer_id)",
    ],
  },
};

export default depositsSilverTransformationCatalog;
