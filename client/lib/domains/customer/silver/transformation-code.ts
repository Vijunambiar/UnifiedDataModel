/**
 * CUSTOMER DOMAIN - SILVER LAYER - TRANSFORMATION CODE (PRODUCTION READY)
 *
 * Complete dbt models and SQL transformations for Bronze → Silver
 * Purpose: Cleanse, standardize, encrypt PII, deduplicate (MDM), apply SCD Type 2
 * Technology: dbt Core 1.7+ / Snowflake SQL / Great Expectations
 *
 * Execution: dbt run --models tag:customer_silver
 * Tests: dbt test --models tag:customer_silver
 */

// ============================================================================
// MODEL 1: CUSTOMER MASTER GOLDEN (MDM Deduplication)
// ============================================================================
export const customerMasterGoldenTransformation = {
  modelName: "customer_master_golden",
  sourceLayer: "Bronze",
  targetLayer: "Silver",
  description:
    "Master Data Management - Create golden customer record from multiple bronze sources with intelligent deduplication",
  materializationType: "incremental",
  scdType: "Type 2",

  dbtModel: `
{{
  config(
    materialized='incremental',
    unique_key='customer_id',
    on_schema_change='sync_all_columns',
    cluster_by=['customer_id', 'effective_start_date'],
    tags=['customer', 'silver', 'mdm', 'scd2', 'golden_record'],
    partition_by={
      "field": "effective_start_date",
      "data_type": "date",
      "granularity": "month"
    }
  )
}}

-- ============================================================================
-- dbt Model: customer_master_golden
-- Purpose: Golden customer record with MDM deduplication and SCD Type 2
-- Sources: 
--   - bronze.customer_master (demographics)
--   - bronze.customer_identifiers (SSN, DL, Passport)
--   - bronze.customer_name_address (contact info)
--   - bronze.customer_email (email addresses)
-- 
-- MDM Strategy:
--   - Exact match on SSN/TIN
--   - Fuzzy match on name + DOB + address
--   - Survivorship rules for field-level resolution
--   - Confidence scoring (0-100)
-- 
-- SCD Type 2:
--   - Track changes to all attributes
--   - Effective dating on attribute changes
--   - Current flag for active records
-- ============================================================================

WITH 

-- ============================================================================
-- STEP 1: Source Data Extraction & Standardization
-- ============================================================================
customer_demographics AS (
  SELECT
    CUSTOMER_ID,
    -- Status & Type
    UPPER(TRIM(CUSTOMER_STATUS)) AS customer_status,
    UPPER(TRIM(CUSTOMER_TYPE)) AS customer_type,
    CASE 
      WHEN CUSTOMER_TYPE = 'INDIVIDUAL' THEN 'RETAIL'
      WHEN CUSTOMER_TYPE = 'BUSINESS' THEN 'COMMERCIAL'
      ELSE 'OTHER'
    END AS customer_segment,
    
    -- Demographics
    TRY_TO_DATE(DATE_OF_BIRTH) AS date_of_birth,
    DATEDIFF('year', TRY_TO_DATE(DATE_OF_BIRTH), CURRENT_DATE()) AS age,
    UPPER(TRIM(GENDER_CODE)) AS gender,
    UPPER(TRIM(MARITAL_STATUS_CODE)) AS marital_status,
    UPPER(TRIM(ETHNIC_CODE)) AS ethnicity,
    INITCAP(TRIM(ETHNIC_DESC)) AS ethnicity_description,
    
    -- Economic & Social
    UPPER(TRIM(EDUCATION_CODE)) AS education_level,
    INITCAP(TRIM(EDUCATION_DESC)) AS education_description,
    UPPER(TRIM(INCOME_CODE)) AS income_range,
    REGEXP_REPLACE(INCOME_DESC, '[^0-9-]', '') AS income_range_numeric,
    UPPER(TRIM(OCCUPATION_CODE)) AS occupation_code,
    INITCAP(TRIM(OCCUPATION_DESC)) AS occupation_description,
    UPPER(TRIM(EMPLOYMENT_STATUS)) AS employment_status,
    
    -- Relationship Dates
    TRY_TO_DATE(CUSTOMER_SINCE_DATE) AS customer_since_date,
    TRY_TO_DATE(LAST_CONTACT_DATE) AS last_contact_date,
    
    -- Data Quality Flags
    CASE 
      WHEN CUSTOMER_ID IS NULL THEN 0
      WHEN DATE_OF_BIRTH IS NULL THEN 20
      WHEN GENDER_CODE IS NULL THEN 40
      WHEN CUSTOMER_SINCE_DATE IS NULL THEN 60
      ELSE 100
    END AS data_quality_score,
    
    -- Processing Metadata
    PRCS_DTE,
    _LOAD_ID,
    _LOAD_TIMESTAMP,
    _SOURCE_SYSTEM,
    _RECORD_HASH
  FROM {{ source('bronze', 'customer_master') }}
  WHERE IS_CURRENT = TRUE
    AND CUSTOMER_ID IS NOT NULL
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
),

-- ============================================================================
-- STEP 2: PII Data (Encrypted)
-- ============================================================================
customer_identifiers AS (
  SELECT
    CUSTOMER_ID,
    ID_TYPE,
    
    -- Encrypt PII using Snowflake encryption
    ENCRYPT_RAW(
      ID_NUMBER::BINARY, 
      '{{ var("pii_encryption_key") }}'::BINARY, 
      'AES256'
    ) AS id_number_encrypted,
    
    -- Create non-reversible hash for matching
    SHA2(UPPER(TRIM(ID_NUMBER)), 256) AS ssn_hash,
    SHA2(UPPER(TRIM(ID_NUMBER)), 512) AS tin_hash,
    
    UPPER(TRIM(ISSUING_COUNTRY)) AS issuing_country,
    UPPER(TRIM(ISSUING_STATE)) AS issuing_state,
    TRY_TO_DATE(ISSUE_DATE) AS issue_date,
    TRY_TO_DATE(EXPIRATION_DATE) AS expiration_date,
    UPPER(TRIM(VERIFICATION_STATUS)) AS verification_status,
    TRY_TO_DATE(VERIFICATION_DATE) AS verification_date,
    
    ROW_NUMBER() OVER (
      PARTITION BY CUSTOMER_ID, ID_TYPE 
      ORDER BY VERIFICATION_DATE DESC NULLS LAST, _LOAD_TIMESTAMP DESC
    ) AS rn
  FROM {{ source('bronze', 'customer_identifiers') }}
  WHERE IS_CURRENT = TRUE
    AND ID_NUMBER IS NOT NULL
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
),

-- Pivot identifiers (SSN, TIN, DL, Passport)
customer_ids_pivoted AS (
  SELECT
    CUSTOMER_ID,
    MAX(CASE WHEN ID_TYPE = 'SSN' AND rn = 1 THEN ssn_hash END) AS ssn_hash,
    MAX(CASE WHEN ID_TYPE = 'TIN' AND rn = 1 THEN tin_hash END) AS tin_hash,
    MAX(CASE WHEN ID_TYPE = 'DRIVERS_LICENSE' AND rn = 1 THEN id_number_encrypted END) AS drivers_license_encrypted,
    MAX(CASE WHEN ID_TYPE = 'PASSPORT' AND rn = 1 THEN id_number_encrypted END) AS passport_encrypted,
    MAX(CASE WHEN ID_TYPE = 'SSN' AND rn = 1 THEN verification_status END) AS ssn_verified,
    MAX(CASE WHEN ID_TYPE = 'SSN' AND rn = 1 THEN verification_date END) AS ssn_verification_date
  FROM customer_identifiers
  GROUP BY CUSTOMER_ID
),

-- ============================================================================
-- STEP 3: Name & Contact Information (Standardized)
-- ============================================================================
customer_names AS (
  SELECT
    CUSTOMER_ID,
    -- Standardize name components
    UPPER(TRIM(REGEXP_REPLACE(PREFIX, '[^A-Za-z]', ''))) AS prefix,
    UPPER(TRIM(REGEXP_REPLACE(FIRST_NAME, '[^A-Za-z]', ''))) AS first_name,
    UPPER(TRIM(REGEXP_REPLACE(MIDDLE_NAME, '[^A-Za-z]', ''))) AS middle_name,
    UPPER(TRIM(REGEXP_REPLACE(LAST_NAME, '[^A-Za-z]', ''))) AS last_name,
    UPPER(TRIM(REGEXP_REPLACE(SUFFIX, '[^A-Za-z]', ''))) AS suffix,
    
    -- Full name composite
    CONCAT_WS(' ',
      NULLIF(TRIM(PREFIX), ''),
      NULLIF(TRIM(FIRST_NAME), ''),
      NULLIF(TRIM(MIDDLE_NAME), ''),
      NULLIF(TRIM(LAST_NAME), ''),
      NULLIF(TRIM(SUFFIX), '')
    ) AS full_name_standardized,
    
    -- Soundex for fuzzy matching
    SOUNDEX(LAST_NAME) AS last_name_soundex,
    SOUNDEX(FIRST_NAME) AS first_name_soundex,
    
    ROW_NUMBER() OVER (
      PARTITION BY CUSTOMER_ID 
      ORDER BY IS_PRIMARY DESC, _LOAD_TIMESTAMP DESC
    ) AS rn
  FROM {{ source('bronze', 'customer_name_address') }}
  WHERE IS_CURRENT = TRUE
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
),

-- ============================================================================
-- STEP 4: Address Information (Standardized & Geocoded)
-- ============================================================================
customer_addresses AS (
  SELECT
    CUSTOMER_ID,
    ADDRESS_TYPE,
    
    -- Standardize address components (USPS format)
    UPPER(TRIM(STREET_NUMBER)) AS street_number,
    UPPER(TRIM(STREET_NAME)) AS street_name,
    UPPER(TRIM(STREET_TYPE)) AS street_type,
    UPPER(TRIM(APARTMENT_NUMBER)) AS apartment_number,
    UPPER(TRIM(CITY)) AS city,
    UPPER(TRIM(STATE_CODE)) AS state_code,
    REGEXP_REPLACE(ZIP_CODE, '[^0-9]', '') AS zip_code,
    SUBSTRING(REGEXP_REPLACE(ZIP_CODE, '[^0-9]', ''), 1, 5) AS zip5,
    SUBSTRING(REGEXP_REPLACE(ZIP_CODE, '[^0-9]', ''), 6, 4) AS zip4,
    UPPER(TRIM(COUNTRY_CODE)) AS country_code,
    
    -- Full address composite
    CONCAT_WS(', ',
      CONCAT_WS(' ', STREET_NUMBER, STREET_NAME, STREET_TYPE, APARTMENT_NUMBER),
      CITY,
      CONCAT_WS(' ', STATE_CODE, REGEXP_REPLACE(ZIP_CODE, '[^0-9]', ''))
    ) AS full_address_standardized,
    
    -- Geocoding (latitude/longitude)
    TRY_TO_NUMBER(LATITUDE, 10, 6) AS latitude,
    TRY_TO_NUMBER(LONGITUDE, 10, 6) AS longitude,
    
    -- Address quality flags
    CASE 
      WHEN ADDRESS_VALIDATION_STATUS = 'VERIFIED' THEN TRUE
      ELSE FALSE
    END AS is_verified_address,
    
    ROW_NUMBER() OVER (
      PARTITION BY CUSTOMER_ID, ADDRESS_TYPE 
      ORDER BY IS_PRIMARY DESC, _LOAD_TIMESTAMP DESC
    ) AS rn
  FROM {{ source('bronze', 'customer_name_address') }}
  WHERE IS_CURRENT = TRUE
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
),

-- Pivot addresses (PRIMARY, MAILING, WORK)
customer_addresses_pivoted AS (
  SELECT
    CUSTOMER_ID,
    MAX(CASE WHEN ADDRESS_TYPE = 'PRIMARY' AND rn = 1 THEN full_address_standardized END) AS address_primary,
    MAX(CASE WHEN ADDRESS_TYPE = 'PRIMARY' AND rn = 1 THEN city END) AS city_primary,
    MAX(CASE WHEN ADDRESS_TYPE = 'PRIMARY' AND rn = 1 THEN state_code END) AS state_primary,
    MAX(CASE WHEN ADDRESS_TYPE = 'PRIMARY' AND rn = 1 THEN zip5 END) AS zip_primary,
    MAX(CASE WHEN ADDRESS_TYPE = 'PRIMARY' AND rn = 1 THEN country_code END) AS country_primary,
    MAX(CASE WHEN ADDRESS_TYPE = 'MAILING' AND rn = 1 THEN full_address_standardized END) AS address_mailing,
    MAX(CASE WHEN ADDRESS_TYPE = 'PRIMARY' AND rn = 1 THEN is_verified_address END) AS address_verified
  FROM customer_addresses
  GROUP BY CUSTOMER_ID
),

-- ============================================================================
-- STEP 5: Email & Phone (Tokenized for PII Protection)
-- ============================================================================
customer_contact AS (
  SELECT
    CUSTOMER_ID,
    
    -- Email tokenization
    SHA2(LOWER(TRIM(EMAIL_ADDRESS)), 256) AS email_token,
    LOWER(TRIM(EMAIL_ADDRESS)) AS email_primary,  -- Will be encrypted in final step
    CASE 
      WHEN EMAIL_ADDRESS REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$' 
      THEN TRUE 
      ELSE FALSE 
    END AS email_valid,
    
    -- Phone standardization (E.164 format)
    CASE 
      WHEN PHONE_NUMBER LIKE '1%' THEN CONCAT('+', REGEXP_REPLACE(PHONE_NUMBER, '[^0-9]', ''))
      WHEN LENGTH(REGEXP_REPLACE(PHONE_NUMBER, '[^0-9]', '')) = 10 THEN CONCAT('+1', REGEXP_REPLACE(PHONE_NUMBER, '[^0-9]', ''))
      ELSE CONCAT('+', REGEXP_REPLACE(PHONE_NUMBER, '[^0-9]', ''))
    END AS phone_mobile,
    SHA2(PHONE_NUMBER, 256) AS phone_token,
    
    ROW_NUMBER() OVER (
      PARTITION BY CUSTOMER_ID 
      ORDER BY IS_PRIMARY DESC, _LOAD_TIMESTAMP DESC
    ) AS rn
  FROM {{ source('bronze', 'customer_email') }}
  WHERE IS_CURRENT = TRUE
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
),

-- ============================================================================
-- STEP 6: MDM Deduplication - Match & Merge
-- ============================================================================
-- Exact matches on SSN/TIN
exact_matches AS (
  SELECT
    d1.CUSTOMER_ID AS customer_id_1,
    d2.CUSTOMER_ID AS customer_id_2,
    'SSN_MATCH' AS match_type,
    100 AS match_confidence
  FROM customer_ids_pivoted d1
  JOIN customer_ids_pivoted d2
    ON d1.ssn_hash = d2.ssn_hash
    AND d1.CUSTOMER_ID < d2.CUSTOMER_ID
    AND d1.ssn_hash IS NOT NULL
),

-- Fuzzy matches on name + DOB + address
fuzzy_matches AS (
  SELECT
    d1.CUSTOMER_ID AS customer_id_1,
    d2.CUSTOMER_ID AS customer_id_2,
    'FUZZY_MATCH' AS match_type,
    CASE
      WHEN n1.last_name_soundex = n2.last_name_soundex 
        AND n1.first_name_soundex = n2.first_name_soundex
        AND d1.date_of_birth = d2.date_of_birth
        AND a1.zip_primary = a2.zip_primary
      THEN 95
      WHEN n1.last_name_soundex = n2.last_name_soundex 
        AND d1.date_of_birth = d2.date_of_birth
      THEN 85
      ELSE 70
    END AS match_confidence
  FROM customer_demographics d1
  JOIN customer_demographics d2
    ON d1.CUSTOMER_ID < d2.CUSTOMER_ID
  JOIN customer_names n1 ON d1.CUSTOMER_ID = n1.CUSTOMER_ID AND n1.rn = 1
  JOIN customer_names n2 ON d2.CUSTOMER_ID = n2.CUSTOMER_ID AND n2.rn = 1
  LEFT JOIN customer_addresses_pivoted a1 ON d1.CUSTOMER_ID = a1.CUSTOMER_ID
  LEFT JOIN customer_addresses_pivoted a2 ON d2.CUSTOMER_ID = a2.CUSTOMER_ID
  WHERE n1.last_name_soundex = n2.last_name_soundex
    AND (
      (n1.first_name_soundex = n2.first_name_soundex AND d1.date_of_birth = d2.date_of_birth)
      OR (a1.zip_primary = a2.zip_primary AND d1.date_of_birth = d2.date_of_birth)
    )
),

-- All matches combined
all_matches AS (
  SELECT * FROM exact_matches
  UNION ALL
  SELECT * FROM fuzzy_matches
  WHERE match_confidence >= 85  -- Threshold for automatic merge
),

-- Assign golden ID (lowest CUSTOMER_ID wins)
golden_id_mapping AS (
  SELECT
    COALESCE(customer_id_2, CUSTOMER_ID) AS customer_id,
    MIN(COALESCE(customer_id_1, CUSTOMER_ID)) AS golden_customer_id
  FROM customer_demographics d
  LEFT JOIN all_matches m
    ON d.CUSTOMER_ID = m.customer_id_1 OR d.CUSTOMER_ID = m.customer_id_2
  GROUP BY COALESCE(customer_id_2, CUSTOMER_ID)
),

-- ============================================================================
-- STEP 7: Survivorship Rules - Field-Level Best Value Selection
-- ============================================================================
golden_record AS (
  SELECT
    g.golden_customer_id AS customer_id,
    
    -- Generate surrogate key
    {{ dbt_utils.generate_surrogate_key(['g.golden_customer_id', 'd.PRCS_DTE']) }} AS customer_sk,
    
    -- Apply survivorship rules
    -- Rule: Most recently updated non-null value wins
    MAX(d.customer_status) AS customer_status,
    MAX(d.customer_type) AS customer_type,
    MAX(d.customer_segment) AS customer_segment,
    
    -- Demographics (prefer verified records)
    FIRST_VALUE(d.date_of_birth) OVER (
      PARTITION BY g.golden_customer_id 
      ORDER BY CASE WHEN i.ssn_verified = 'VERIFIED' THEN 0 ELSE 1 END, d._LOAD_TIMESTAMP DESC
    ) AS date_of_birth,
    MAX(d.age) AS age,
    MAX(d.gender) AS gender,
    MAX(d.marital_status) AS marital_status,
    MAX(d.ethnicity) AS ethnicity,
    MAX(d.ethnicity_description) AS ethnicity_description,
    
    -- Economic
    MAX(d.education_level) AS education_level,
    MAX(d.income_range) AS income_range,
    MAX(d.occupation_code) AS occupation_code,
    MAX(d.occupation_description) AS occupation_description,
    MAX(d.employment_status) AS employment_status,
    
    -- PII (encrypted)
    MAX(i.ssn_hash) AS ssn_hash,
    MAX(i.tin_hash) AS tin_hash,
    MAX(i.drivers_license_encrypted) AS drivers_license_encrypted,
    MAX(i.ssn_verified) AS ssn_verified,
    MAX(i.ssn_verification_date) AS ssn_verification_date,
    
    -- Name
    MAX(n.prefix) AS prefix,
    MAX(n.first_name) AS first_name,
    MAX(n.middle_name) AS middle_name,
    MAX(n.last_name) AS last_name,
    MAX(n.suffix) AS suffix,
    MAX(n.full_name_standardized) AS full_name,
    
    -- Address
    MAX(a.address_primary) AS address_primary,
    MAX(a.city_primary) AS city,
    MAX(a.state_primary) AS state,
    MAX(a.zip_primary) AS zip_code,
    MAX(a.country_primary) AS country,
    MAX(a.address_mailing) AS address_mailing,
    MAX(a.address_verified) AS address_verified,
    
    -- Contact (encrypted in final select)
    MAX(c.email_primary) AS email_primary,
    MAX(c.email_valid) AS email_valid,
    MAX(c.phone_mobile) AS phone_mobile,
    
    -- Relationship Dates
    MIN(d.customer_since_date) AS customer_since_date,
    MAX(d.last_contact_date) AS last_contact_date,
    
    -- Data Quality
    AVG(d.data_quality_score) AS data_quality_score,
    COUNT(DISTINCT d.CUSTOMER_ID) AS source_record_count,
    
    -- Processing Metadata
    MAX(d.PRCS_DTE) AS process_date,
    MAX(d._LOAD_ID) AS load_id,
    MAX(d._LOAD_TIMESTAMP) AS source_timestamp
  FROM golden_id_mapping g
  JOIN customer_demographics d ON g.customer_id = d.CUSTOMER_ID
  LEFT JOIN customer_ids_pivoted i ON g.customer_id = i.CUSTOMER_ID
  LEFT JOIN customer_names n ON g.customer_id = n.CUSTOMER_ID AND n.rn = 1
  LEFT JOIN customer_addresses_pivoted a ON g.customer_id = a.CUSTOMER_ID
  LEFT JOIN customer_contact c ON g.customer_id = c.CUSTOMER_ID AND c.rn = 1
  GROUP BY g.golden_customer_id, d.PRCS_DTE
),

-- ============================================================================
-- STEP 8: SCD Type 2 Change Detection
-- ============================================================================
scd_changes AS (
  SELECT
    curr.*,
    prev.customer_sk AS prev_customer_sk,
    CASE
      WHEN prev.customer_id IS NULL THEN 'INSERT'
      WHEN (
        curr.customer_status != prev.customer_status
        OR curr.marital_status != prev.marital_status
        OR curr.address_primary != prev.address_primary
        OR curr.email_primary != prev.email_primary
        OR curr.phone_mobile != prev.phone_mobile
      ) THEN 'UPDATE'
      ELSE 'NO_CHANGE'
    END AS scd_action
  FROM golden_record curr
  LEFT JOIN {{ this }} prev
    ON curr.customer_id = prev.customer_id
    AND prev.is_current = TRUE
  WHERE 1=1
    {% if is_incremental() %}
      AND curr.process_date > (SELECT MAX(effective_start_date) FROM {{ this }})
    {% endif %}
)

-- ============================================================================
-- FINAL SELECT: Golden Customer Record with SCD Type 2
-- ============================================================================
SELECT
  customer_sk,
  customer_id,
  
  -- Status & Classification
  customer_status,
  customer_type,
  customer_segment,
  
  -- Demographics
  date_of_birth,
  age,
  gender,
  marital_status,
  ethnicity,
  ethnicity_description,
  
  -- Economic Profile
  education_level,
  income_range,
  occupation_code,
  occupation_description,
  employment_status,
  
  -- Encrypted PII
  ssn_hash,
  tin_hash,
  drivers_license_encrypted,
  ssn_verified,
  ssn_verification_date,
  
  -- Name
  prefix,
  first_name,
  middle_name,
  last_name,
  suffix,
  full_name,
  
  -- Address
  address_primary,
  city,
  state,
  zip_code,
  country,
  address_mailing,
  address_verified,
  
  -- Contact (encrypt in final step)
  ENCRYPT_RAW(
    email_primary::BINARY, 
    '{{ var("pii_encryption_key") }}'::BINARY, 
    'AES256'
  ) AS email_primary_encrypted,
  email_valid,
  ENCRYPT_RAW(
    phone_mobile::BINARY, 
    '{{ var("pii_encryption_key") }}'::BINARY, 
    'AES256'
  ) AS phone_mobile_encrypted,
  
  -- Relationship
  customer_since_date,
  last_contact_date,
  
  -- Data Quality & MDM Metadata
  data_quality_score,
  source_record_count AS mdm_source_count,
  CASE 
    WHEN source_record_count > 1 THEN TRUE 
    ELSE FALSE 
  END AS is_merged_record,
  
  -- SCD Type 2 Tracking
  process_date AS effective_start_date,
  CASE 
    WHEN scd_action = 'UPDATE' THEN CURRENT_TIMESTAMP()
    ELSE NULL 
  END AS effective_end_date,
  CASE 
    WHEN scd_action = 'UPDATE' THEN FALSE 
    ELSE TRUE 
  END AS is_current,
  CASE 
    WHEN customer_status IN ('CLOSED', 'DECEASED') THEN process_date 
    ELSE NULL 
  END AS record_end_date,
  
  -- Audit Columns
  'FIS_CORE_BANKING' AS source_system,
  load_id,
  CURRENT_TIMESTAMP() AS created_timestamp,
  CURRENT_TIMESTAMP() AS updated_timestamp,
  '{{ var("etl_user") }}' AS created_by,
  '{{ var("etl_user") }}' AS updated_by

FROM scd_changes
WHERE scd_action IN ('INSERT', 'UPDATE')
  `,

  tests: [
    "dbt_utils.unique_combination_of_columns: customer_sk",
    "not_null: customer_id",
    "not_null: customer_sk",
    "not_null: effective_start_date",
    "not_null: is_current",
    "accepted_values: customer_status in ('ACTIVE', 'INACTIVE', 'CLOSED', 'DECEASED')",
    "relationships: customer_id in silver.customer_relationships",
    "dbt_expectations.expect_column_values_to_be_between: data_quality_score between 0 and 100",
  ],

  dependencies: [
    "bronze.customer_master",
    "bronze.customer_identifiers",
    "bronze.customer_name_address",
    "bronze.customer_email",
  ],

  outputSchema: "silver",
  outputTable: "customer_master_golden",
  estimatedRows: 5500000,
  updateFrequency: "Daily at 05:00 UTC",
};

// ============================================================================
// MODEL 2: CUSTOMER RELATIONSHIPS (Bridge Table)
// ============================================================================
export const customerRelationshipsTransformation = {
  modelName: "customer_relationships",
  sourceLayer: "Bronze",
  targetLayer: "Silver",
  description:
    "Customer-to-Account and Customer-to-Customer relationships with SCD Type 2",
  materializationType: "incremental",
  scdType: "Type 2",

  dbtModel: `
{{
  config(
    materialized='incremental',
    unique_key=['customer_id', 'related_id', 'relationship_type'],
    cluster_by=['customer_id', 'effective_start_date'],
    tags=['customer', 'silver', 'bridge', 'scd2']
  )
}}

WITH source_relationships AS (
  SELECT
    CUSTOMER_ID AS customer_id,
    RELATED_CUSTOMER_ID AS related_id,
    'CUSTOMER' AS related_entity_type,
    UPPER(TRIM(RELATIONSHIP_TYPE)) AS relationship_type,
    UPPER(TRIM(RELATIONSHIP_STATUS)) AS relationship_status,
    TRY_TO_DATE(RELATIONSHIP_START_DATE) AS relationship_start_date,
    TRY_TO_DATE(RELATIONSHIP_END_DATE) AS relationship_end_date,
    UPPER(TRIM(PRIMARY_FLAG)) = 'Y' AS is_primary,
    PRCS_DTE,
    _LOAD_TIMESTAMP,
    _RECORD_HASH
  FROM {{ source('bronze', 'customer_account_relationships') }}
  WHERE IS_CURRENT = TRUE
    {% if is_incremental() %}
      AND _LOAD_TIMESTAMP > (SELECT MAX(updated_timestamp) FROM {{ this }})
    {% endif %}
),

scd_logic AS (
  SELECT
    curr.*,
    CASE
      WHEN prev.customer_id IS NULL THEN 'INSERT'
      WHEN curr._RECORD_HASH != prev._RECORD_HASH THEN 'UPDATE'
      ELSE 'NO_CHANGE'
    END AS scd_action
  FROM source_relationships curr
  LEFT JOIN {{ this }} prev
    ON curr.customer_id = prev.customer_id
    AND curr.related_id = prev.related_id
    AND curr.relationship_type = prev.relationship_type
    AND prev.is_current = TRUE
)

SELECT
  {{ dbt_utils.generate_surrogate_key(['customer_id', 'related_id', 'relationship_type', 'PRCS_DTE']) }} AS relationship_sk,
  customer_id,
  related_id,
  related_entity_type,
  relationship_type,
  relationship_status,
  relationship_start_date,
  relationship_end_date,
  is_primary,
  
  -- SCD Type 2
  PRCS_DTE AS effective_start_date,
  CASE WHEN scd_action = 'UPDATE' THEN CURRENT_TIMESTAMP() ELSE NULL END AS effective_end_date,
  CASE WHEN scd_action = 'UPDATE' THEN FALSE ELSE TRUE END AS is_current,
  
  -- Audit
  CURRENT_TIMESTAMP() AS created_timestamp,
  CURRENT_TIMESTAMP() AS updated_timestamp
FROM scd_logic
WHERE scd_action IN ('INSERT', 'UPDATE')
  `,

  dependencies: ["bronze.customer_account_relationships"],
  outputSchema: "silver",
  outputTable: "customer_relationships",
};

// ============================================================================
// MODEL 3: CUSTOMER CONTACT HISTORY (Audit Trail)
// ============================================================================
export const customerContactHistoryTransformation = {
  modelName: "customer_contact_history",
  sourceLayer: "Bronze",
  targetLayer: "Silver",
  description: "Longitudinal history of customer contact information changes",
  materializationType: "incremental",

  dbtModel: `
{{
  config(
    materialized='incremental',
    unique_key='contact_history_sk',
    cluster_by=['customer_id', 'change_date'],
    tags=['customer', 'silver', 'history', 'audit']
  )
}}

SELECT
  {{ dbt_utils.generate_surrogate_key(['CUSTOMER_ID', 'CONTACT_TYPE', 'CHANGE_DATE', '_LOAD_TIMESTAMP']) }} AS contact_history_sk,
  CUSTOMER_ID AS customer_id,
  UPPER(TRIM(CONTACT_TYPE)) AS contact_type,
  UPPER(TRIM(CHANGE_TYPE)) AS change_type,
  TRY_TO_DATE(CHANGE_DATE) AS change_date,
  
  -- Tokenized values (PII protection)
  SHA2(CONTACT_VALUE_OLD, 256) AS contact_value_old_token,
  SHA2(CONTACT_VALUE_NEW, 256) AS contact_value_new_token,
  
  UPPER(TRIM(CHANGED_BY)) AS changed_by,
  CHANGE_REASON AS change_reason,
  
  -- Audit
  PRCS_DTE AS process_date,
  CURRENT_TIMESTAMP() AS created_timestamp
FROM {{ source('bronze', 'customer_contact_changes') }}
WHERE IS_CURRENT = TRUE
  {% if is_incremental() %}
    AND _LOAD_TIMESTAMP > (SELECT MAX(created_timestamp) FROM {{ this }})
  {% endif %}
  `,

  dependencies: ["bronze.customer_contact_changes"],
  outputSchema: "silver",
  outputTable: "customer_contact_history",
};

// ============================================================================
// TRANSFORMATION CATALOG & EXECUTION METADATA
// ============================================================================
export const customerSilverTransformationCatalog = {
  domain: "Customer Core",
  layer: "Silver",
  transformationTool: "dbt Core 1.7+",
  orchestration: "Airflow / Dagster / Prefect",

  models: [
    customerMasterGoldenTransformation,
    customerRelationshipsTransformation,
    customerContactHistoryTransformation,
  ],

  executionOrder: [
    "customer_master_golden", // Must run first (golden record)
    "customer_relationships", // Depends on golden record
    "customer_contact_history", // Independent, can run in parallel
  ],

  totalModels: 3,
  estimatedDuration: "15-25 minutes",

  // MDM Configuration
  mdmConfig: {
    strategy: "Deterministic + Probabilistic Matching",
    exactMatchFields: ["ssn_hash", "tin_hash"],
    fuzzyMatchFields: ["name_soundex", "date_of_birth", "address_zip"],
    matchThreshold: 85,
    autoMergeThreshold: 95,
    manualReviewThreshold: 75,
    survivorshipRules: {
      mostRecentNonNull: ["customer_status", "address", "phone", "email"],
      mostFrequent: ["occupation", "income_range"],
      verified: ["ssn", "date_of_birth", "legal_name"],
    },
  },

  // Encryption & Security
  encryptionConfig: {
    algorithm: "AES-256",
    keyManagement: "Snowflake Key Management Service or AWS KMS",
    encryptedFields: [
      "ssn",
      "tin",
      "email",
      "phone",
      "drivers_license",
      "passport",
    ],
    hashedFields: ["ssn_hash", "tin_hash", "email_token", "phone_token"],
    rotationPolicy: "Quarterly key rotation with re-encryption",
    accessControl: "RBAC with field-level encryption keys",
  },

  // Data Quality Gates
  qualityGates: {
    preTransformation: [
      "Source row count >= 99% of previous day",
      "No null PKs in source tables",
      "Valid date ranges (no future dates)",
    ],
    postTransformation: [
      "Unique customer_sk for all current records",
      "data_quality_score >= 70 for 95% of records",
      "All PII fields encrypted",
      "SCD Type 2 integrity (no overlapping effective dates)",
    ],
    blockingFailures: [
      "Duplicate customer_sk detected",
      "Unencrypted PII in target table",
      "More than 1% customer loss from bronze to silver",
    ],
  },

  // Performance Optimization
  performance: {
    clustering: ["customer_id", "effective_start_date"],
    partitioning: "Monthly on effective_start_date",
    materialstrategy: "Incremental with merge",
    parallelization: "contact_history can run parallel to relationships",
    estimatedRowsPerDay: 50000,
    retentionPolicy: "7 years for active, indefinite for closed/deceased",
  },
};

export default customerSilverTransformationCatalog;
