# SOURCE-TO-TARGET MAPPING FRAMEWORK

**Status**: ✅ COMPLETE  
**Date**: 2025-01-15  
**Version**: 1.0

---

## 📋 OVERVIEW

This document describes the comprehensive Source-to-Target mapping framework implemented to strengthen data lineage tracking across different data sources including FIS, FICO, and other vendor systems.

### Purpose

- **Detailed Source System Registry**: Catalog all source systems with vendor codes, API specifications, and file formats
- **Column-Level Mappings**: Document field-by-field transformations from source to bronze/silver/gold layers
- **Data Lineage Tracking**: Trace data flow from original source systems through all layers
- **Transformation Logic**: Capture business rules and ETL logic for each field
- **Source Code Definitions**: Maintain standard codes and identifiers for each data source

### Key Benefits

1. **End-to-End Visibility**: Complete lineage from source system APIs/files to gold layer analytics
2. **Operational Excellence**: Standardized approach to onboarding new data sources
3. **Compliance & Audit**: Full traceability for regulatory requirements (SOX, GDPR, CCPA)
4. **Data Quality**: Validation rules and transformation logic at every layer
5. **Developer Productivity**: Reusable templates and patterns for ETL development

---

## 📂 FILE STRUCTURE

### Primary Implementation

**File**: `client/lib/source-to-target-mapping.ts`

This TypeScript module contains:

1. **Source System Registry** (`sourceSystems[]`)
   - 30+ internal and external source systems
   - Vendor details, connection specs, SLAs
   - Integration types (API, CDC, Batch, Streaming)
   - Data formats (JSON, XML, CSV, Parquet, Avro)

2. **Source Schemas** (`SourceSchema[]`)
   - Table/file/API endpoint definitions
   - Field-level metadata (data types, lengths, validation rules)
   - PII flags and encryption requirements
   - Sample values and patterns

3. **Field Mappings** (`FieldMapping[]`)
   - Column-level source-to-target mappings
   - Transformation types and logic
   - SQL transformation examples
   - Business definitions and data quality rules

4. **Data Lineage** (`DataLineage[]`)
   - Source → Bronze → Silver → Gold paths
   - Transformation summaries at each layer
   - Certification status

5. **Helper Functions**
   - `getSourceSystemByCode()` - Lookup source system metadata
   - `getMappingsBySourceSystem()` - Get all field mappings for a source
   - `getLineageByDomain()` - Trace lineage for specific domain
   - `getLineageBySourceSystem()` - Trace all flows from a source

---

## 🏗️ SOURCE SYSTEM REGISTRY

### FIS - ACH Tracker

**Source System**: `FIS-ACH-TRK` (FIS Corporate ACH Tracker)

#### System Details

- **Vendor**: FIS (Fidelity Information Services)
- **Product**: Corporate ACH Tracker v10.5
- **Type**: Payment Processor (Real-time ACH monitoring)
- **Criticality**: CRITICAL
- **Integration**: Real-time streaming + Daily batch reconciliation
- **Format**: JSON (API) + CSV (batch files)
- **SLA**: 99.9% uptime, <500ms latency
- **Cost**: $200K+ annually (volume-based)

#### Domains Served

- `payments-commercial`
- `treasury`
- `cash-management`

#### Data Types Provided

- ACH Transaction Tracking (real-time lifecycle)
- Exception Events (Returns, NOCs, Reversals)
- Batch File Metadata
- Settlement Status
- Return Code Analysis (R01-R99)
- NOC Management (C01-C13)
- Reconciliation Data

#### Connection Details

- **Protocol**: HTTPS
- **Host**: `ach-tracker-api.fis.com`
- **Port**: 443
- **Endpoint**: `/api/v2/transactions`
- **Auth**: OAuth2 + API Key

#### Source Schemas

##### 1. ACH_TRANSACTION_LOG (Streaming API)

Primary source for real-time ACH transaction lifecycle tracking.

**Key Fields**:

- `tracker_transaction_id` (STRING) - FIS unique ID (e.g., `FIS-ACH-20250115-00001234`)
- `core_ach_id` (STRING) - Link to core banking ACH ID
- `trace_number` (STRING, 15) - ACH trace number (ODFI + Sequence)
- `company_id` (STRING, 10) - Originator company ID
- `transaction_type` (STRING) - CREDIT | DEBIT
- `sec_code` (STRING, 3) - CCD | PPD | CTX | WEB | TEL
- `transaction_amount` (DECIMAL 18,2) - Amount in USD
- `effective_entry_date` (DATE) - ACH settlement date
- `originator_account_number` (STRING, 17, **PII, ENCRYPTED**)
- `originator_routing_number` (STRING, 9) - ABA routing number
- `receiver_name` (STRING, 100, **PII**)
- `receiver_account_number` (STRING, 17, **PII, ENCRYPTED**)
- `receiver_routing_number` (STRING, 9) - ABA routing number
- `current_status` (STRING) - SUBMITTED | VALIDATED | BATCHED | TRANSMITTED | SETTLED | RETURNED | REVERSED
- `status_timestamp` (TIMESTAMP) - Status update time (UTC)
- `same_day_ach_flag` (BOOLEAN) - Same-day ACH indicator
- `return_code` (STRING, 3) - R01-R99 NACHA return code
- `return_description` (STRING, 255)
- `noc_flag` (BOOLEAN) - NOC received indicator
- `noc_code` (STRING, 3) - C01-C13 NACHA NOC code
- `noc_corrected_value` (STRING, 100, **PII, ENCRYPTED**)
- `settlement_status` (STRING) - PENDING | SETTLED | FAILED
- `settlement_date` (DATE)
- `reconciliation_status` (STRING) - MATCHED | UNMATCHED | EXCEPTION

**Sample Record**:

```json
{
  "tracker_transaction_id": "FIS-ACH-20250115-00001234",
  "core_ach_id": "ACH-2025011500123456",
  "trace_number": "091000019123456",
  "company_id": "1234567890",
  "transaction_type": "CREDIT",
  "sec_code": "CCD",
  "transaction_amount": 1500.0,
  "effective_entry_date": "2025-01-15",
  "originator_routing_number": "091000019",
  "receiver_routing_number": "026009593",
  "current_status": "SETTLED",
  "status_timestamp": "2025-01-15T10:30:15Z",
  "same_day_ach_flag": false,
  "settlement_status": "SETTLED",
  "settlement_date": "2025-01-15",
  "reconciliation_status": "MATCHED"
}
```

##### 2. ACH_RETURN_CODE_MASTER (Daily Batch)

NACHA return code reference data (R01-R99).

**Key Fields**:

- `return_code` (STRING, 3) - R01, R02, R03, etc.
- `return_description` (STRING, 255) - Official NACHA description
- `retry_allowed_flag` (BOOLEAN) - Can transaction be retried?
- `correctable_flag` (BOOLEAN) - Is issue correctable?
- `unauthorized_flag` (BOOLEAN) - Unauthorized entry indicator
- `time_frame` (STRING, 50) - NACHA time frame for return

**Sample Records**:
| return_code | return_description | retry_allowed | correctable | unauthorized |
|-------------|-------------------|---------------|-------------|--------------|
| R01 | Insufficient Funds | TRUE | FALSE | FALSE |
| R02 | Account Closed | FALSE | FALSE | FALSE |
| R03 | No Account/Unable to Locate | FALSE | FALSE | FALSE |
| R10 | Customer Advises Not Authorized | FALSE | FALSE | TRUE |
| R29 | Corporate Customer Advises Not Authorized | FALSE | FALSE | TRUE |

##### 3. ACH_NOC_CODE_MASTER (Daily Batch)

NACHA NOC (Notification of Change) code reference data (C01-C13).

**Key Fields**:

- `noc_code` (STRING, 3) - C01, C02, C03, etc.
- `noc_description` (STRING, 255) - Official NACHA description
- `corrected_field` (STRING, 50) - ACCOUNT_NUMBER | ROUTING_NUMBER | BOTH | TRANSACTION_CODE
- `auto_apply_flag` (BOOLEAN) - Can be auto-applied to future transactions?
- `mandatory_flag` (BOOLEAN) - Must be applied per NACHA rules?

**Sample Records**:
| noc_code | noc_description | corrected_field | auto_apply | mandatory |
|----------|----------------|-----------------|------------|-----------|
| C01 | Incorrect Account Number | ACCOUNT_NUMBER | TRUE | TRUE |
| C02 | Incorrect Routing Number | ROUTING_NUMBER | TRUE | TRUE |
| C03 | Incorrect Routing & Account Number | BOTH | TRUE | TRUE |
| C05 | Incorrect Transaction Code | TRANSACTION_CODE | FALSE | FALSE |

---

### FICO - Fraud Detection

**Source System**: `FICO-FRAUD` (FICO Falcon Fraud Platform)

#### System Details

- **Vendor**: FICO (Fair Isaac Corporation)
- **Product**: Falcon Fraud Manager v8.7
- **Type**: Fraud Detection & Prevention
- **Criticality**: CRITICAL
- **Integration**: Real-time API (per transaction scoring)
- **Format**: JSON (REST API)
- **SLA**: 99.99% uptime, <200ms scoring latency
- **Cost**: $1.5M+ annually (transaction volume-based)

#### Domains Served

- `fraud-retail`
- `cards-retail`
- `payments-retail`
- `digital-retail`

#### Data Types Provided

- Fraud Scores (0-999 risk scale)
- Fraud Alerts & Cases
- Device Intelligence (fingerprints, IP)
- Behavioral Analytics
- Consortium Data (cross-bank fraud patterns)
- Fraud Reason Codes
- Rule Engine Results
- Model Predictions

#### Connection Details

- **Protocol**: HTTPS
- **Host**: `falcon-api.fico.com`
- **Port**: 443
- **Endpoint**: `/api/v3/fraud-scores`
- **Auth**: OAuth2 + TLS Client Certificate

#### Source Schemas

##### 1. FRAUD_SCORE_RESPONSE (Real-time API)

Real-time fraud scoring response for each transaction.

**Key Fields**:

- `transaction_id` (STRING, 50) - Transaction ID from requesting system
- `fico_score_id` (STRING, 50) - FICO unique scoring event ID (e.g., `FICO-SCR-2025011508301234`)
- `fraud_score` (INTEGER, 0-999) - FICO fraud score (higher = riskier)
- `fraud_risk_level` (STRING) - LOW | MEDIUM | HIGH | CRITICAL
- `fraud_reason_codes` (ARRAY<STRING>) - Array of FICO reason codes (e.g., `["RC001","RC042"]`)
- `model_version` (STRING, 20) - FICO model used (e.g., `FALCON-8.7-US-RETAIL`)
- `device_id` (STRING, 100) - Device fingerprint ID
- `device_risk_score` (INTEGER, 0-999) - Device-specific risk
- `geolocation_risk_score` (INTEGER, 0-999) - Geographic location risk
- `behavioral_risk_score` (INTEGER, 0-999) - Behavioral pattern risk
- `consortium_data_flag` (BOOLEAN) - Was consortium data used?
- `recommended_action` (STRING) - APPROVE | REVIEW | DECLINE | CHALLENGE | STEP_UP_AUTH
- `score_timestamp` (TIMESTAMP) - When score was generated (UTC)
- `response_time_ms` (INTEGER) - FICO API response time
- `fraud_indicators` (JSON) - Detailed fraud indicators

**Sample Record**:

```json
{
  "transaction_id": "TXN-20250115-001234",
  "fico_score_id": "FICO-SCR-2025011508301234",
  "fraud_score": 850,
  "fraud_risk_level": "HIGH",
  "fraud_reason_codes": ["RC001", "RC042", "RC123"],
  "model_version": "FALCON-8.7-US-RETAIL",
  "device_id": "DEV-ABC123XYZ789",
  "device_risk_score": 750,
  "geolocation_risk_score": 800,
  "behavioral_risk_score": 900,
  "consortium_data_flag": true,
  "recommended_action": "REVIEW",
  "score_timestamp": "2025-01-15T08:30:15.123Z",
  "response_time_ms": 125,
  "fraud_indicators": {
    "velocity_check": "FAIL",
    "amount_deviation": "HIGH",
    "time_pattern": "SUSPICIOUS"
  }
}
```

##### 2. FRAUD_ALERT (Event Stream)

Fraud alerts generated by FICO rules engine.

**Key Fields**:

- `alert_id` (STRING, 50) - Unique FICO alert ID
- `transaction_id` (STRING, 50) - Related transaction
- `alert_type` (STRING, 50) - HIGH_RISK_SCORE | VELOCITY_EXCEEDED | DEVICE_CHANGE | LOCATION_MISMATCH
- `alert_severity` (STRING) - LOW | MEDIUM | HIGH | CRITICAL
- `triggered_rules` (ARRAY<STRING>) - Array of FICO rule IDs
- `alert_timestamp` (TIMESTAMP) - When alert was generated
- `customer_id` (STRING, 50, **PII**)
- `account_id` (STRING, 50, **PII**)

##### 3. FRAUD_REASON_CODE_MASTER (Daily Batch)

FICO fraud reason code master data.

**Key Fields**:

- `reason_code` (STRING, 10) - RC001, RC002, RC042, etc.
- `reason_description` (STRING, 255) - Description of fraud reason
- `reason_category` (STRING, 50) - VELOCITY | DEVICE | LOCATION | BEHAVIORAL | AMOUNT | TIME_PATTERN
- `severity_weight` (DECIMAL 5,2) - Weight in score calculation (0-1)

**Sample Records**:
| reason_code | reason_description | reason_category | severity_weight |
|-------------|-------------------|-----------------|-----------------|
| RC001 | High velocity of transactions | VELOCITY | 0.75 |
| RC002 | Amount significantly above average | AMOUNT | 0.50 |
| RC042 | Device fingerprint mismatch | DEVICE | 0.50 |
| RC123 | Geolocation anomaly detected | LOCATION | 1.00 |

---

## 🗺️ FIELD-LEVEL MAPPINGS

### FIS ACH Tracker - Sample Mappings

#### Example 1: tracker_transaction_id

**Source �� Bronze → Silver → Gold**

| Layer      | Field Name                | Data Type | Transformation                 |
| ---------- | ------------------------- | --------- | ------------------------------ |
| **Source** | `tracker_transaction_id`  | STRING    | Direct from FIS API            |
| **Bronze** | `tracker_transaction_id`  | STRING    | Direct copy, no transformation |
| **Silver** | `tracker_transaction_id`  | STRING    | Deduplication on record_hash   |
| **Gold**   | `tracker_transaction_key` | BIGINT    | SHA-256 hash → surrogate key   |

**Transformation Logic**:

```sql
-- Bronze
INSERT INTO bronze.fis_ach_tracker_transactions
SELECT tracker_transaction_id FROM fis_api_response;

-- Silver (deduplication)
INSERT INTO silver.fis_ach_tracker_transactions_cleansed
SELECT DISTINCT tracker_transaction_id
FROM bronze.fis_ach_tracker_transactions
WHERE record_hash NOT IN (
  SELECT record_hash FROM silver.fis_ach_tracker_transactions_cleansed
);

-- Gold (surrogate key)
INSERT INTO gold.fact_ach_tracker_transactions
SELECT
  ABS(CONV(SUBSTRING(SHA2(tracker_transaction_id, 256), 1, 15), 16, 10)) AS tracker_transaction_key,
  tracker_transaction_id
FROM silver.fis_ach_tracker_transactions_cleansed;
```

**Business Definition**: Unique identifier for ACH transaction in FIS Tracker system

**Data Quality Rules**:

- NOT NULL
- UNIQUE per source system
- Pattern: `FIS-ACH-YYYYMMDD-########`
- Length <= 50 characters

---

#### Example 2: transaction_amount

**Source → Bronze → Silver → Gold**

| Layer      | Field Name           | Data Type     | Transformation              |
| ---------- | -------------------- | ------------- | --------------------------- |
| **Source** | `transaction_amount` | DECIMAL       | Raw amount from FIS         |
| **Bronze** | `transaction_amount` | DECIMAL(18,2) | Cast to DECIMAL(18,2)       |
| **Silver** | `transaction_amount` | DECIMAL(18,2) | Validate > 0, cleanse nulls |
| **Gold**   | `transaction_amount` | DECIMAL(18,2) | Aggregate-ready measure     |

**Transformation Logic**:

```sql
-- Bronze
INSERT INTO bronze.fis_ach_tracker_transactions (transaction_amount)
SELECT CAST(SOURCE.transaction_amount AS DECIMAL(18,2))
FROM fis_api_response;

-- Silver (validation & cleansing)
INSERT INTO silver.fis_ach_tracker_transactions_cleansed (transaction_amount)
SELECT
  CASE
    WHEN transaction_amount IS NULL THEN 0.00
    WHEN transaction_amount < 0 THEN ABS(transaction_amount)
    ELSE transaction_amount
  END AS transaction_amount
FROM bronze.fis_ach_tracker_transactions;

-- Gold (aggregation)
SELECT
  SUM(transaction_amount) AS total_transaction_amount,
  AVG(transaction_amount) AS avg_transaction_amount,
  COUNT(*) AS transaction_count
FROM silver.fis_ach_tracker_transactions_cleansed
GROUP BY effective_entry_date;
```

**Business Definition**: Dollar amount of ACH transaction

**Data Quality Rules**:

- NOT NULL
- MUST be > 0
- Precision: 18 digits, 2 decimal places
- Max value: 99,999,999,999,999.99
- Currency: USD only

---

#### Example 3: current_status

**Source → Bronze → Silver → Gold**

| Layer      | Field Name              | Data Type | Transformation                 |
| ---------- | ----------------------- | --------- | ------------------------------ |
| **Source** | `current_status`        | STRING    | Raw status from FIS            |
| **Bronze** | `current_status`        | STRING    | Direct copy                    |
| **Silver** | `ach_status_code`       | STRING    | Standardize to uppercase, trim |
| **Gold**   | `ach_status_code` (dim) | STRING    | Dimension lookup               |

**Transformation Logic**:

```sql
-- Bronze
INSERT INTO bronze.fis_ach_tracker_transactions (current_status)
SELECT current_status FROM fis_api_response;

-- Silver (standardization)
INSERT INTO silver.fis_ach_tracker_transactions_cleansed (ach_status_code)
SELECT UPPER(TRIM(current_status)) AS ach_status_code
FROM bronze.fis_ach_tracker_transactions;

-- Gold (dimension)
INSERT INTO gold.dim_ach_status
SELECT
  ROW_NUMBER() OVER (ORDER BY ach_status_code) AS ach_status_key,
  ach_status_code,
  CASE ach_status_code
    WHEN 'SUBMITTED' THEN 'Transaction Submitted to FIS Tracker'
    WHEN 'VALIDATED' THEN 'Validation Passed - Ready for Batching'
    WHEN 'BATCHED' THEN 'Added to ACH Batch File'
    WHEN 'TRANSMITTED' THEN 'Sent to Federal Reserve / ACH Network'
    WHEN 'SETTLED' THEN 'Successfully Settled at RDFI'
    WHEN 'RETURNED' THEN 'Returned by Receiving Bank'
    WHEN 'REVERSED' THEN 'Transaction Reversed (Reversal Entry)'
  END AS status_description,
  CASE ach_status_code
    WHEN 'SETTLED' THEN 'SUCCESS'
    WHEN 'RETURNED' THEN 'FAILED'
    WHEN 'REVERSED' THEN 'FAILED'
    ELSE 'IN_PROGRESS'
  END AS status_category
FROM (SELECT DISTINCT ach_status_code FROM silver.fis_ach_tracker_transactions_cleansed);
```

**Business Definition**: Current lifecycle status of ACH transaction in FIS Tracker

**Data Quality Rules**:

- NOT NULL
- Valid values: SUBMITTED, VALIDATED, BATCHED, TRANSMITTED, SETTLED, RETURNED, REVERSED, REJECTED
- Uppercase only
- No leading/trailing spaces

---

#### Example 4: return_code (with Lookup)

**Source → Bronze → Silver → Gold**

| Layer      | Field Name          | Data Type | Transformation                |
| ---------- | ------------------- | --------- | ----------------------------- |
| **Source** | `return_code`       | STRING    | R01, R03, R10, etc.           |
| **Bronze** | `return_code`       | STRING    | Direct copy                   |
| **Silver** | `return_code`       | STRING    | Validate against master list  |
| **Gold**   | `return_code` (dim) | STRING    | Join to return code dimension |

**Transformation Logic**:

```sql
-- Bronze
INSERT INTO bronze.fis_ach_tracker_transactions (return_code)
SELECT return_code FROM fis_api_response;

-- Silver (validation with lookup)
INSERT INTO silver.fis_ach_tracker_transactions_cleansed
  (return_code, return_description, retry_allowed_flag, correctable_flag)
SELECT
  t.return_code,
  rc.return_description,
  rc.retry_allowed_flag,
  rc.correctable_flag
FROM bronze.fis_ach_tracker_transactions t
LEFT JOIN bronze.fis_ach_tracker_return_codes rc
  ON t.return_code = rc.return_code;

-- Gold (dimension)
INSERT INTO gold.dim_ach_return_code
SELECT
  ROW_NUMBER() OVER (ORDER BY return_code) AS return_code_key,
  return_code,
  return_description,
  retry_allowed_flag,
  correctable_flag,
  unauthorized_flag,
  time_frame,
  CURRENT_TIMESTAMP AS dimension_created_timestamp
FROM bronze.fis_ach_tracker_return_codes;
```

**Business Definition**: NACHA standard return reason code (R01-R99) indicating why ACH transaction was returned

**Data Quality Rules**:

- NULL allowed (only populated if transaction returned)
- Pattern: `R[0-9]{2}`
- Valid NACHA return codes only
- Must exist in return code master table

---

#### Example 5: receiver_account_number (PII Encryption)

**Source → Bronze → Silver → Gold**

| Layer      | Field Name                          | Data Type | Transformation               |
| ---------- | ----------------------------------- | --------- | ---------------------------- |
| **Source** | `receiver_account_number`           | STRING    | Plain text account number    |
| **Bronze** | `receiver_account_number_encrypted` | STRING    | AES-256 encryption           |
| **Silver** | `receiver_account_number_masked`    | STRING    | Mask (show last 4)           |
| **Gold**   | `receiver_account_key`              | BIGINT    | Tokenized surrogate key only |

**Transformation Logic**:

```sql
-- Bronze (encryption)
INSERT INTO bronze.fis_ach_tracker_transactions (receiver_account_number_encrypted)
SELECT AES_ENCRYPT(SOURCE.receiver_account_number, SECRET_KEY)
FROM fis_api_response;

-- Silver (masking for analytics)
INSERT INTO silver.fis_ach_tracker_transactions_cleansed (receiver_account_number_masked)
SELECT CONCAT('****', RIGHT(AES_DECRYPT(receiver_account_number_encrypted, SECRET_KEY), 4))
FROM bronze.fis_ach_tracker_transactions;

-- Gold (tokenization - no PII)
INSERT INTO gold.fact_ach_tracker_transactions (receiver_account_key)
SELECT ABS(CONV(SUBSTRING(SHA2(AES_DECRYPT(receiver_account_number_encrypted, SECRET_KEY), 256), 1, 15), 16, 10))
FROM bronze.fis_ach_tracker_transactions;
```

**Business Definition**: Receiver bank account number (PII - must be encrypted at rest)

**Data Quality Rules**:

- NOT NULL
- Encrypted at rest (AES-256) in Bronze
- Masked in Silver layer (show last 4 digits only)
- Tokenized in Gold layer (surrogate key only, no PII)
- PII flag: TRUE
- Max length: 17 characters

---

### FICO Fraud - Sample Mappings

#### Example 1: fraud_score

**Source → Bronze → Silver → Gold**

| Layer      | Field Name    | Data Type | Transformation       |
| ---------- | ------------- | --------- | -------------------- |
| **Source** | `fraud_score` | INTEGER   | 0-999 from FICO API  |
| **Bronze** | `fraud_score` | INTEGER   | Direct copy          |
| **Silver** | `fraud_score` | INTEGER   | Validate range 0-999 |
| **Gold**   | `fraud_score` | INTEGER   | Measure + risk band  |

**Transformation Logic**:

```sql
-- Bronze
INSERT INTO bronze.fico_fraud_scores (fraud_score)
SELECT fraud_score FROM fico_api_response;

-- Silver (validation)
INSERT INTO silver.fraud_scores_enriched (fraud_score, fraud_risk_band)
SELECT
  CASE
    WHEN fraud_score < 0 THEN 0
    WHEN fraud_score > 999 THEN 999
    ELSE fraud_score
  END AS fraud_score,
  CASE
    WHEN fraud_score < 200 THEN 'LOW'
    WHEN fraud_score < 500 THEN 'MEDIUM'
    WHEN fraud_score < 800 THEN 'HIGH'
    ELSE 'CRITICAL'
  END AS fraud_risk_band
FROM bronze.fico_fraud_scores;

-- Gold (analytics)
SELECT
  fraud_score,
  fraud_risk_band,
  COUNT(*) AS transaction_count,
  SUM(transaction_amount) AS total_amount_at_risk
FROM silver.fraud_scores_enriched
GROUP BY fraud_score, fraud_risk_band;
```

**Business Definition**: FICO Falcon fraud score (0-999, higher score = higher fraud risk)

**Data Quality Rules**:

- NOT NULL
- Range: 0-999
- Integer only
- Higher score = higher fraud risk
- Risk bands: LOW (<200), MEDIUM (200-499), HIGH (500-799), CRITICAL (800+)

---

#### Example 2: fraud_reason_codes (Array Enrichment)

**Source → Bronze → Silver → Gold**

| Layer      | Field Name                    | Data Type     | Transformation              |
| ---------- | ----------------------------- | ------------- | --------------------------- |
| **Source** | `fraud_reason_codes`          | ARRAY<STRING> | ["RC001","RC042"]           |
| **Bronze** | `fraud_reason_codes`          | JSON          | Store as JSON array         |
| **Silver** | `fraud_reason_codes_enriched` | JSON          | Explode + join to master    |
| **Gold**   | `reason_code` (bridge)        | STRING        | Bridge table (many-to-many) |

**Transformation Logic**:

```sql
-- Bronze
INSERT INTO bronze.fico_fraud_scores (fraud_reason_codes)
SELECT TO_JSON(SOURCE.fraud_reason_codes) FROM fico_api_response;

-- Silver (enrichment via explode + join)
INSERT INTO silver.fraud_scores_enriched
  (fico_score_id, reason_code, reason_description, reason_category, severity_weight)
SELECT
  fs.fico_score_id,
  rc_exploded.reason_code,
  rc.reason_description,
  rc.reason_category,
  rc.severity_weight
FROM bronze.fico_fraud_scores fs
LATERAL VIEW EXPLODE(FROM_JSON(fs.fraud_reason_codes, 'ARRAY<STRING>')) rc_exploded AS reason_code
LEFT JOIN bronze.fico_fraud_reason_code_master rc
  ON rc_exploded.reason_code = rc.reason_code;

-- Gold (bridge table for many-to-many)
INSERT INTO gold.bridge_fraud_score_reason (fraud_score_key, reason_code_key, severity_weight)
SELECT
  fs.fraud_score_key,
  rc.reason_code_key,
  rc.severity_weight
FROM silver.fraud_scores_enriched fs
JOIN gold.dim_fraud_reason_code rc
  ON fs.reason_code = rc.reason_code;
```

**Business Definition**: Array of FICO reason codes explaining why fraud score was elevated

**Data Quality Rules**:

- Can be empty array (no reasons triggered)
- Each reason code must exist in master table
- Deduplicate reason codes within same score
- Sort by severity_weight DESC

---

## 📊 DATA LINEAGE EXAMPLES

### FIS ACH Tracker - Complete Lineage

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FIS ACH TRACKER LINEAGE                        │
└─────────────────��───────────────────────────────────────────────────┘

SOURCE SYSTEM: FIS Corporate ACH Tracker API (Real-time Streaming)
       │
       │ Integration: HTTPS REST API + Event Streaming
       │ Format: JSON
       │ Frequency: Real-time (event-driven)
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BRONZE LAYER: bronze.fis_ach_tracker_transactions                  │
│   - Direct ingestion from FIS API                                   │
│   - No transformations (raw data preservation)                      │
│   - PII encrypted (AES-256)                                         │
│   - Audit trail: load_timestamp, cdc_operation, record_hash         │
└─────────────────────────────────────────────────────────────────────┘
       │
       │ Transformation: Deduplication, SCD Type 2, Data Quality
       ▼
┌─────────────────��───────────────────────────────────────────────────┐
│ SILVER LAYER: silver.fis_ach_tracker_transactions_cleansed         │
│   - Deduplication on record_hash                                    │
│   - SCD Type 2 for historical tracking                              │
│   - Join to return code master (lookup enrichment)                  │
│   - Join to NOC code master (lookup enrichment)                     │
│   - Data quality validations applied                                │
│   - PII masked (show last 4 digits)                                 │
└─────────────────────────────────────────────────────────────────────┘
       │
       │ Transformation: Dimensional modeling, Aggregation
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ GOLD LAYER: Dimensional Model                                       │
│                                                                      │
│ DIMENSIONS:                                                          │
│   - gold.dim_ach_status (8 statuses)                                │
│   - gold.dim_ach_return_code (R01-R99, ~70 codes)                   │
│   - gold.dim_noc_code (C01-C13, 13 codes)                           │
│   - gold.dim_exception_type (RETURN|NOC|REVERSAL|REJECT)            │
│                                                                      │
│ FACTS:                                                               │
│   - gold.fact_ach_tracker_transactions (transaction grain)          │
│   - gold.fact_ach_exceptions (exception event grain)                │
│   - gold.fact_ach_batch_performance (batch grain)                   │
│                                                                      │
│ MEASURES:                                                            │
│   - transaction_amount, business_days_to_settle,                    │
│     processing_time_minutes, exception_count, sla_met_flag          │
└─────────────────────────────────────────────────────────────────────┘

CERTIFICATION: ✅ Lineage Certified (2025-01-15)
DATA STEWARD: Treasury Operations Manager
```

---

### FICO Fraud - Complete Lineage

```
┌────────────────────────��────────────────────────────────────────────┐
│                      FICO FALCON FRAUD LINEAGE                      │
└─────────────────────────────────────────────────────────────────────┘

SOURCE SYSTEM: FICO Falcon Fraud Manager API (Real-time Scoring)
       │
       │ Integration: HTTPS REST API (OAuth2 + TLS)
       │ Format: JSON
       │ Frequency: Real-time per transaction
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BRONZE LAYER: bronze.fico_fraud_scores                             │
│   - Direct API response storage                                     │
│   - fraud_score, fraud_risk_level, fraud_reason_codes (JSON array)  │
│   - Device, geo, behavioral sub-scores                              │
│   - Model version tracking                                          │
│   - Response time metrics                                           │
└─────���───────────────────────────────────────────────────────────────┘
       │
       │ Transformation: Validation, Enrichment, Reason Code Explosion
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ SILVER LAYER: silver.fraud_scores_enriched                         │
│   - Range validation (0-999)                                        │
│   - Risk band calculation (LOW|MEDIUM|HIGH|CRITICAL)                │
│   - Explode fraud_reason_codes array                                │
│   - Join to reason code master (descriptions, categories, weights)  │
│   - Calculate composite risk scores                                 │
└─────────────────────────────────────────────────────────────────────┘
       │
       │ Transformation: Dimensional modeling, Aggregation
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ GOLD LAYER: Dimensional Model                                       │
│                                                                      │
│ DIMENSIONS:                                                          │
│   - gold.dim_fraud_risk_level (LOW|MEDIUM|HIGH|CRITICAL)            │
│   - gold.dim_fraud_reason_code (RC001-RC999)                        │
│   - gold.dim_fraud_model_version (model tracking)                   │
│   - gold.dim_device (device fingerprints)                           │
│                                                                      │
│ FACTS:                                                               │
│   - gold.fact_fraud_scores (transaction grain)                      │
│   - gold.fact_fraud_alerts (alert grain)                            │
│                                                                      │
│ BRIDGE TABLES:                                                       │
│   - gold.bridge_fraud_score_reason (many-to-many)                   │
│                                                                      │
│ MEASURES:                                                            │
│   - fraud_score, device_risk_score, geo_risk_score,                 │
│     behavioral_risk_score, response_time_ms                         │
└─────────────────────────────────────────────────────────────────────┘

CERTIFICATION: ✅ Lineage Certified (2025-01-15)
DATA STEWARD: Fraud Operations Manager
```

---

## 🛠️ USAGE EXAMPLES

### 1. Get Source System Details

```typescript
import { getSourceSystemByCode } from "./lib/source-to-target-mapping";

// Get FIS ACH Tracker details
const fisSystem = getSourceSystemByCode("FIS-ACH-TRK");
console.log(fisSystem.vendor); // "FIS (Fidelity Information Services)"
console.log(fisSystem.connectionDetails.endpoint); // "/api/v2/transactions"
console.log(fisSystem.sla.latency); // "<500ms for streaming"

// Get FICO Fraud details
const ficoSystem = getSourceSystemByCode("FICO-FRAUD");
console.log(ficoSystem.productName); // "Falcon Fraud Manager"
console.log(ficoSystem.cost); // "$1.5M+ annually"
```

### 2. Get Field Mappings for Source System

```typescript
import { getMappingsBySourceSystem } from "./lib/source-to-target-mapping";

// Get all FIS ACH Tracker field mappings
const fisMapping = getMappingsBySourceSystem("FIS-ACH-TRK");
fisMapping.forEach((mapping) => {
  console.log(
    `${mapping.sourceField} → ${mapping.bronzeField} → ${mapping.silverField} → ${mapping.goldField}`,
  );
  console.log(`Transformation: ${mapping.transformationType}`);
  console.log(`Logic: ${mapping.transformationLogic}`);
});

// Get FICO Fraud field mappings
const ficoMappings = getMappingsBySourceSystem("FICO-FRAUD");
```

### 3. Trace Data Lineage

```typescript
import {
  getLineageByDomain,
  getLineageBySourceSystem,
} from "./lib/source-to-target-mapping";

// Get lineage for payments-commercial domain
const paymentsLineage = getLineageByDomain("payments-commercial");
paymentsLineage.forEach((lineage) => {
  console.log(`Entity: ${lineage.entity}`);
  console.log(`Path: ${lineage.dataLineagePath}`);
  console.log(`Certified: ${lineage.certifiedFlag ? "Yes" : "No"}`);
});

// Get all lineage flows from FIS ACH Tracker
const fisLineage = getLineageBySourceSystem("FIS-ACH-TRK");
fisLineage.forEach((lineage) => {
  console.log(`${lineage.sourceSchema}.${lineage.sourceField}`);
  console.log(`  → ${lineage.bronzeTable}.${lineage.bronzeField}`);
  console.log(`  → ${lineage.silverTable}.${lineage.silverField}`);
  console.log(`  → ${lineage.goldTable}.${lineage.goldField}`);
});
```

---

## 📋 NEXT STEPS

### Phase 1: Additional Source Systems (Next 2-4 weeks)

Add detailed source-to-target mappings for:

1. **Experian Credit Bureau**
   - Credit reports, scores, trade lines
   - Source codes: EXP-CREDIT-001
2. **TransUnion Credit Bureau**
   - Credit reports, risk analytics
   - Source codes: TU-CREDIT-001
3. **Equifax Credit Bureau**
   - Consumer and commercial credit data
   - Source codes: EFX-CREDIT-001
4. **Core Banking Platform (Finacle/Temenos)**
   - Customer master, account master, transactions
   - Source codes: FINACLE-CORE, T24-CORE
5. **Salesforce CRM**
   - Customer profiles, sales opportunities, service cases
   - Source codes: SFDC-CRM
6. **Card Processor (TSYS/FIS)**
   - Card authorizations, transactions, rewards
   - Source codes: TSYS-CARD, FIS-CARD

### Phase 2: Enhanced Lineage Tracking (Next 4-6 weeks)

1. **Automated Lineage Extraction**
   - Parse ETL scripts to auto-generate lineage
   - Extract column-level transformations from SQL
   - Build lineage graph database

2. **Impact Analysis**
   - Upstream impact: "If source field changes, what breaks?"
   - Downstream impact: "Which dashboards use this field?"
   - Dependency mapping

3. **Data Quality Scorecard**
   - Track data quality metrics per source system
   - Monitor SLA compliance (latency, availability)
   - Alert on lineage breaks

### Phase 3: Self-Service Lineage Portal (Next 6-8 weeks)

1. **Interactive Lineage Viewer**
   - Visual graph of source-to-target flows
   - Drill-down from domain → table → column
   - Search by field name across all layers

2. **Transformation Logic Browser**
   - View SQL transformations inline
   - Test transformations with sample data
   - Export transformation logic as documentation

3. **Data Dictionary Integration**
   - Link to business glossary
   - Show data owners and stewards
   - Display data quality rules

---

## ✅ COMPLETION CHECKLIST

- ✅ Source system registry created (30+ systems)
- ✅ FIS ACH Tracker fully documented (3 schemas, 25+ fields)
- ✅ FICO Fraud fully documented (3 schemas, 20+ fields)
- ✅ Column-level field mappings (Bronze → Silver → Gold)
- ✅ Transformation logic documented (SQL examples)
- ✅ Data lineage tracking (source to gold)
- ✅ PII/encryption handling documented
- ✅ Data quality rules defined
- ✅ Sample data and transformations provided
- ✅ Helper functions for programmatic access
- ⬜ Additional source systems (Experian, TransUnion, etc.) - PENDING
- ⬜ Automated lineage extraction - PENDING
- ⬜ Self-service lineage portal - PENDING

---

**Document Owner**: Data Architecture Team  
**Last Updated**: 2025-01-15  
**Version**: 1.0  
**Status**: COMPLETE (Phase 1)
