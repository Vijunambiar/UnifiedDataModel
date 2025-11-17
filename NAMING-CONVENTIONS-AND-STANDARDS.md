# Banking Data Model Naming Conventions & Standards

## Version 1.0 | Enterprise Grade | Banking Industry Aligned

---

## 📋 Table of Contents

1. [Naming Conventions](#naming-conventions)
2. [Data Layer Standards](#data-layer-standards)
3. [Schema Standards](#schema-standards)
4. [Relationship Standards](#relationship-standards)
5. [Documentation Standards](#documentation-standards)

---

## 🏷️ Naming Conventions

### Area Naming

**Format:** `{area-name}` (lowercase, hyphen-separated)

**Valid Areas:**
- `retail` - Retail Banking
- `commercial` - Commercial Banking
- `wealth` - Wealth Management
- `mortgage` - Mortgage Banking
- `corporate` - Corporate & Investment Banking
- `operations` - Operations & Technology
- `risk-compliance` - Risk & Compliance
- `open-banking` - Open Banking/Finance

### Domain Naming

**Format:** `{primary-function}-{area}` or `{function}-{area}-{specialization}`

**Examples:**
- ✅ `customer-retail` (retail customer domain)
- ✅ `deposits-retail` (retail deposits)
- ✅ `loans-commercial` (commercial lending)
- ✅ `investment-wealth` (wealth investments)
- ✅ `origination-mortgage` (mortgage origination)
- ✅ `trading-corporate` (corporate trading)

**Rules:**
1. Always suffix with area name (except cross-area domains)
2. Use singular nouns (e.g., `customer`, not `customers`)
3. Use industry-standard terms
4. Maximum 3 components (e.g., `credit-cards-retail`)

### File Naming

**Comprehensive Domain Files:**
```
{domain-name}-comprehensive.ts
```

**Examples:**
- `customer-retail-comprehensive.ts`
- `deposits-retail-comprehensive.ts`
- `loans-commercial-comprehensive.ts`
- `investment-wealth-comprehensive.ts`

**Open Banking Files:**
```
openbanking-{service}-comprehensive.ts
```

**Examples:**
- `openbanking-accounts-comprehensive.ts`
- `openbanking-payments-comprehensive.ts`
- `openbanking-consent-comprehensive.ts`

---

## 🗄️ Data Layer Standards

### Bronze Layer (Raw/Landing)

**Purpose:** Raw data from source systems, minimal transformation

**Table Naming:**
```
bronze.{area}_{domain}_{entity}
```

**Examples:**
- `bronze.retail_customer_master`
- `bronze.retail_account_transactions`
- `bronze.commercial_loan_applications`
- `bronze.wealth_portfolio_positions`

**Standards:**
1. **Partitioning:** Always partition by date or high-cardinality key
2. **Retention:** 7 years minimum (regulatory requirement)
3. **Audit Columns:** `source_system`, `load_timestamp`, `source_file_name`
4. **Primary Key:** Always include `{entity}_id` + `source_system`
5. **Data Types:** Preserve source data types (no conversion)

**Required Columns (Every Bronze Table):**
```typescript
{
  source_system: "STRING",           // e.g., 'FIS_CORE', 'TEMENOS_T24'
  source_record_id: "STRING",        // Original system ID
  load_timestamp: "TIMESTAMP",       // ETL load time
  source_file_name: "STRING",        // Source file/batch ID
  cdc_operation: "STRING",           // INSERT/UPDATE/DELETE
  record_hash: "STRING"              // MD5/SHA-256 of record
}
```

### Silver Layer (Curated/Golden)

**Purpose:** Cleansed, standardized, deduplicated data with SCD2 history

**Table Naming:**
```
silver.{area}_{domain}_{entity}_golden
silver.{area}_{domain}_{entity}_history
```

**Examples:**
- `silver.retail_customer_master_golden`
- `silver.retail_customer_master_history`
- `silver.commercial_relationship_master_golden`

**Standards:**
1. **Deduplication:** One golden record per business key
2. **SCD Type 2:** Track all historical changes
3. **Data Quality:** 95%+ completeness, 99%+ accuracy
4. **Master Data:** Link to MDM golden records
5. **Surrogate Keys:** Use auto-incrementing `{entity}_sk`

**Required Columns (Every Silver Table):**
```typescript
{
  {entity}_sk: "BIGINT",             // Surrogate key (auto-increment)
  {entity}_id: "BIGINT",             // Business natural key
  {entity}_uuid: "STRING",           // Global unique ID (UUID v4)
  effective_date: "DATE",            // SCD2 start date
  expiration_date: "DATE",           // SCD2 end date (9999-12-31 = current)
  is_current: "BOOLEAN",             // Current record flag
  record_version: "INTEGER",         // Version number
  data_quality_score: "DECIMAL",     // 0-100 quality score
  source_system_of_record: "STRING", // Authoritative source
  created_timestamp: "TIMESTAMP",
  updated_timestamp: "TIMESTAMP",
  created_by: "STRING",
  updated_by: "STRING"
}
```

### Gold Layer (Analytics/Dimensional)

**Purpose:** Dimensional models optimized for analytics and BI

**Dimension Naming:**
```
gold.dim_{entity}
gold.dim_{entity}_scd2
```

**Fact Naming:**
```
gold.fact_{process}_{entity}
gold.fact_{metric_category}
```

**Examples:**
- `gold.dim_retail_customer`
- `gold.dim_product_scd2`
- `gold.fact_account_transactions`
- `gold.fact_daily_balances`
- `gold.fact_loan_originations`

**Dimension Standards:**
1. **Type:** SCD Type 1 (default) or SCD Type 2 (suffix `_scd2`)
2. **Surrogate Key:** `{entity}_key` (BIGINT, auto-increment)
3. **Natural Key:** `{entity}_id` or `{entity}_code`
4. **Grain:** One row per unique business entity
5. **Attributes:** 20-100 descriptive attributes
6. **Conformed:** Shared dimensions across areas

**Fact Standards:**
1. **Grain:** Clearly defined (e.g., "one row per transaction")
2. **Foreign Keys:** Link to ALL relevant dimensions
3. **Measures:** Numeric, additive metrics
4. **Degenerate Dimensions:** Transaction numbers, order IDs
5. **Dates:** Multiple date keys (transaction date, posting date, etc.)

**Required Dimension Columns:**
```typescript
{
  {entity}_key: "BIGINT",            // Surrogate key (DW key)
  {entity}_id: "BIGINT",             // Natural business key
  {entity}_code: "STRING",           // Human-readable code
  {entity}_name: "STRING",           // Display name
  {entity}_description: "STRING",    // Full description
  effective_date: "DATE",            // SCD2 only
  expiration_date: "DATE",           // SCD2 only
  is_current: "BOOLEAN",             // SCD2 only
  created_date: "DATE",
  updated_date: "DATE",
  row_created_timestamp: "TIMESTAMP",
  row_updated_timestamp: "TIMESTAMP"
}
```

**Required Fact Columns:**
```typescript
{
  {fact}_key: "BIGINT",              // Fact surrogate key
  {dimension1}_key: "BIGINT",        // FK to dimension 1
  {dimension2}_key: "BIGINT",        // FK to dimension 2
  // ... all dimension FKs
  
  transaction_date_key: "INTEGER",   // Date dimension FK (YYYYMMDD)
  posting_date_key: "INTEGER",       // Date dimension FK
  effective_date_key: "INTEGER",     // Date dimension FK
  
  // Degenerate dimensions
  transaction_id: "STRING",
  batch_id: "STRING",
  
  // Measures (additive)
  transaction_amount: "DECIMAL(18,2)",
  transaction_quantity: "DECIMAL(12,2)",
  fee_amount: "DECIMAL(18,2)",
  
  // Audit
  created_timestamp: "TIMESTAMP",
  source_system: "STRING"
}
```

---

## 📐 Schema Standards

### Data Types

**Banking-Specific Standards:**

| Data Type | Usage | Format | Example |
|-----------|-------|--------|---------|
| **Money** | Currency amounts | `DECIMAL(18,2)` | 1234567.89 |
| **Percentage** | Rates, ratios | `DECIMAL(10,6)` | 0.045000 (4.5%) |
| **Account Numbers** | Account IDs | `STRING(20)` | ACT-0012345678 |
| **Routing Numbers** | ABA routing | `STRING(9)` | 021000021 |
| **IBAN** | International accounts | `STRING(34)` | GB82WEST12345698765432 |
| **SWIFT/BIC** | Bank codes | `STRING(11)` | DEUTDEFF |
| **SSN** | Customer ID (encrypted) | `STRING(256)` | encrypted_hash |
| **EIN** | Business ID | `STRING(10)` | 12-3456789 |
| **Credit Score** | FICO, etc. | `INTEGER` | 720 |
| **Currency Code** | ISO 4217 | `STRING(3)` | USD, EUR, GBP |
| **Country Code** | ISO 3166-1 | `STRING(2)` | US, GB, DE |

### Key Standards

**Primary Key Naming:**
```
{table_name}_id
{table_name}_sk (silver/gold surrogate key)
{table_name}_key (gold dimension/fact key)
```

**Foreign Key Naming:**
```
{referenced_table}_id
{referenced_table}_key
```

**Composite Key Naming:**
```
{entity1}_id + {entity2}_id + effective_date
```

**Examples:**
- `customer_id` (PK in customer tables)
- `account_id` (PK in account tables)
- `customer_key` (surrogate key in `dim_customer`)
- `account_key` (FK in fact tables referencing `dim_account`)

### Index Standards

**Bronze Layer:**
- Primary key index (clustered)
- Partition key index
- Source system index

**Silver Layer:**
- Surrogate key (clustered)
- Natural key (unique)
- Business key combinations
- Effective/expiration date (SCD2)

**Gold Layer:**
- Dimension surrogate key (clustered)
- Fact composite key (all dimension FKs)
- Date key indexes

---

## 🔗 Relationship Standards

### Cardinality Standards

**One-to-One (1:1):**
- Customer ↔ Customer Profile (extended attributes)
- Account ↔ Account Terms (product terms)

**One-to-Many (1:M):**
- Customer → Accounts
- Account → Transactions
- Customer → Loans
- Household → Customers

**Many-to-Many (M:M):**
- Customer ↔ Product (via junction table)
- Account ↔ Owner (joint accounts)
- Customer ↔ Branch (via customer-branch-affinity)

**Implementation:**
```typescript
// 1:M Example
{
  parent_table: "customer",
  parent_key: "customer_id",
  child_table: "account",
  child_foreign_key: "customer_id",
  relationship_type: "1:M",
  referential_integrity: "CASCADE",  // or RESTRICT, SET NULL
  description: "One customer can have many accounts"
}

// M:M Example
{
  table1: "customer",
  table1_key: "customer_id",
  junction_table: "customer_product",
  table2: "product",
  table2_key: "product_id",
  relationship_type: "M:M",
  description: "Customers can have multiple products, products have multiple customers"
}
```

### Cross-Area Relationships

**Shared Entities (Conformed Dimensions):**

1. **Customer** (shared across retail, commercial, wealth)
   - `gold.dim_customer_universal` (master customer dimension)
   - Area-specific views: `dim_retail_customer`, `dim_commercial_customer`

2. **Product** (shared across all areas)
   - `gold.dim_product_master`
   - Area hierarchies: `product_area`, `product_category`, `product_type`

3. **Branch/Location** (shared across retail, commercial)
   - `gold.dim_branch`

4. **Date** (universal)
   - `gold.dim_date` (fiscal calendar, holidays, business days)

**Linkage Tables:**
```
gold.customer_area_linkage
- customer_key (FK to dim_customer_universal)
- banking_area (retail/commercial/wealth)
- relationship_type
- primary_area (boolean)
- effective_date, expiration_date
```

---

## 📝 Documentation Standards

### Domain Documentation

**Required Sections (Every Domain):**

1. **Executive Summary**
   - Domain purpose
   - Business owner
   - Key stakeholders
   - Regulatory requirements

2. **Business Context**
   - Industry alignment
   - Revenue impact
   - Customer segments
   - Key processes

3. **Data Architecture**
   - Source systems
   - Data lineage
   - Refresh frequency
   - Data volume

4. **Layer Details**
   - Bronze: table list, schemas, partitioning
   - Silver: golden records, SCD2 logic, deduplication
   - Gold: dimensions, facts, metrics

5. **ERD Suite**
   - Logical ERD
   - Physical ERD - Bronze
   - Physical ERD - Silver
   - Physical ERD - Gold

6. **Metric Catalog**
   - All metrics (300-600 per domain)
   - Formulas, business rules
   - Aggregation logic
   - Reporting examples

7. **Data Quality**
   - Completeness metrics
   - Accuracy metrics
   - Consistency rules
   - Validation logic

8. **Integration**
   - Upstream dependencies
   - Downstream consumers
   - API contracts
   - SLA commitments

### Code Documentation

**TypeScript Standards:**

```typescript
/**
 * Domain: Customer Retail
 * Area: Retail Banking
 * Owner: Retail Banking Data Architecture
 * Last Updated: 2025-01-08
 * 
 * Purpose: Comprehensive data model for retail banking customers,
 * including individual consumers, households, and mass affluent segments.
 * 
 * Scope:
 * - Customer master data (demographics, contact, preferences)
 * - Household relationships
 * - Customer lifecycle events
 * - Segmentation and scoring
 * 
 * Regulatory: GLBA, FCRA, CCPA, GDPR
 * 
 * Data Sources:
 * - Core Banking System (FIS, Temenos)
 * - CRM (Salesforce)
 * - Credit Bureaus (Equifax, Experian, TransUnion)
 * - Marketing Automation (Adobe)
 */

export const customerRetailBronzeLayer = {
  description: "Raw retail customer data from source systems",
  sourceSystem: "FIS_CORE",
  refreshFrequency: "Real-time CDC + Daily batch",
  dataVolume: "50M customers, 200GB",
  retention: "7 years",
  
  tables: [
    {
      name: "bronze.retail_customer_master",
      description: "Core customer demographic and identification data",
      grain: "One row per customer per source system",
      primaryKey: ["customer_id", "source_system"],
      partitioning: {
        type: "HASH",
        column: "customer_id",
        buckets: 100
      },
      clusteringKeys: ["customer_since_date"],
      estimatedRows: 50000000,
      avgRowSize: 4096,
      
      schema: {
        // Primary Keys
        customer_id: "BIGINT PRIMARY KEY COMMENT 'Unique customer identifier'",
        source_system: "STRING PRIMARY KEY COMMENT 'Source system name'",
        
        // Natural Keys
        ssn_encrypted: "STRING COMMENT 'Encrypted SSN (AES-256)'",
        tax_id: "STRING COMMENT 'Tax identification number'",
        customer_uuid: "STRING COMMENT 'Global UUID for customer'",
        
        // Demographics
        first_name: "STRING COMMENT 'Legal first name'",
        middle_name: "STRING COMMENT 'Middle name or initial'",
        last_name: "STRING COMMENT 'Legal last name'",
        suffix: "STRING COMMENT 'Name suffix (Jr, Sr, III)'",
        date_of_birth: "DATE COMMENT 'Date of birth'",
        age: "INTEGER COMMENT 'Current age in years'",
        gender: "STRING COMMENT 'M/F/X/U (Unknown)'",
        marital_status: "STRING COMMENT 'S/M/D/W (Single/Married/Divorced/Widowed)'",
        
        // Contact Information
        email_primary: "STRING COMMENT 'Primary email address'",
        email_secondary: "STRING COMMENT 'Secondary email address'",
        phone_mobile: "STRING COMMENT 'Mobile phone (E.164 format)'",
        phone_home: "STRING COMMENT 'Home phone'",
        phone_work: "STRING COMMENT 'Work phone'",
        
        // Address (Current)
        address_line1: "STRING COMMENT 'Street address'",
        address_line2: "STRING COMMENT 'Apartment, suite, etc.'",
        city: "STRING COMMENT 'City name'",
        state: "STRING COMMENT 'State/province code (2-char)'",
        postal_code: "STRING COMMENT 'ZIP/postal code'",
        country_code: "STRING COMMENT 'ISO 3166-1 alpha-2'",
        
        // Financial Profile
        fico_score: "INTEGER COMMENT 'FICO credit score (300-850)'",
        vantage_score: "INTEGER COMMENT 'VantageScore (300-850)'",
        credit_bureau: "STRING COMMENT 'Credit bureau source'",
        credit_score_date: "DATE COMMENT 'Date of credit pull'",
        annual_income: "DECIMAL(18,2) COMMENT 'Annual income (USD)'",
        employment_status: "STRING COMMENT 'Employed/Unemployed/Retired/Student'",
        employer_name: "STRING COMMENT 'Current employer'",
        occupation: "STRING COMMENT 'Job title/occupation'",
        
        // Customer Lifecycle
        customer_since_date: "DATE COMMENT 'First account open date'",
        customer_status: "STRING COMMENT 'Active/Inactive/Closed/Dormant'",
        customer_type: "STRING COMMENT 'Individual/Joint/Trust/Estate'",
        customer_segment: "STRING COMMENT 'Mass/Mass Affluent/Affluent/Private'",
        lifecycle_stage: "STRING COMMENT 'Acquisition/Growth/Retention/Attrition'",
        
        // Risk & Compliance
        kyc_status: "STRING COMMENT 'KYC verification status'",
        kyc_completion_date: "DATE COMMENT 'Date KYC completed'",
        aml_risk_rating: "STRING COMMENT 'Low/Medium/High/Prohibited'",
        ofac_check_date: "DATE COMMENT 'Last OFAC screening date'",
        pep_flag: "BOOLEAN COMMENT 'Politically Exposed Person flag'",
        sanctions_flag: "BOOLEAN COMMENT 'Sanctions list match flag'",
        
        // Preferences
        paperless_flag: "BOOLEAN COMMENT 'Paperless statement preference'",
        marketing_opt_in: "BOOLEAN COMMENT 'Marketing consent'",
        email_opt_in: "BOOLEAN COMMENT 'Email marketing consent'",
        sms_opt_in: "BOOLEAN COMMENT 'SMS marketing consent'",
        preferred_language: "STRING COMMENT 'ISO 639-1 language code'",
        preferred_contact_method: "STRING COMMENT 'Email/Phone/Mail'",
        
        // Household
        household_id: "BIGINT COMMENT 'Household identifier'",
        household_role: "STRING COMMENT 'Head/Spouse/Dependent'",
        
        // Audit Trail (Required for ALL bronze tables)
        source_record_id: "STRING COMMENT 'Original source system record ID'",
        source_file_name: "STRING COMMENT 'Source file/batch identifier'",
        load_timestamp: "TIMESTAMP COMMENT 'ETL load timestamp (UTC)'",
        cdc_operation: "STRING COMMENT 'INSERT/UPDATE/DELETE'",
        record_hash: "STRING COMMENT 'MD5 hash of entire record'",
        created_timestamp: "TIMESTAMP COMMENT 'Source system create timestamp'",
        updated_timestamp: "TIMESTAMP COMMENT 'Source system update timestamp'"
      },
      
      // Column metadata
      columns: [
        {
          name: "customer_id",
          isPrimaryKey: true,
          isForeignKey: false,
          isNullable: false,
          dataType: "BIGINT",
          description: "Unique customer identifier",
          sampleValues: ["1001", "1002", "1003"],
          businessRules: ["Must be unique", "Auto-generated sequence"],
          dataQualityRules: ["NOT NULL", "UNIQUE", "NUMERIC"]
        },
        // ... (all other columns with full metadata)
      ],
      
      indexes: [
        { name: "idx_pk_customer", type: "CLUSTERED", columns: ["customer_id", "source_system"] },
        { name: "idx_ssn", type: "UNIQUE", columns: ["ssn_encrypted"] },
        { name: "idx_email", type: "NONCLUSTERED", columns: ["email_primary"] },
        { name: "idx_household", type: "NONCLUSTERED", columns: ["household_id"] },
        { name: "idx_since_date", type: "NONCLUSTERED", columns: ["customer_since_date"] }
      ],
      
      constraints: [
        {
          type: "PRIMARY KEY",
          columns: ["customer_id", "source_system"]
        },
        {
          type: "UNIQUE",
          columns: ["ssn_encrypted"],
          name: "uq_customer_ssn"
        },
        {
          type: "CHECK",
          expression: "fico_score BETWEEN 300 AND 850",
          name: "chk_fico_range"
        },
        {
          type: "CHECK",
          expression: "age >= 18",
          name: "chk_legal_age"
        }
      ]
    }
  ],
  
  totalTables: 18,
  estimatedSize: "200GB"
};
```

---

## ✅ Validation Standards

### Automated Validation

**Every domain MUST pass:**

1. **Schema Validation**
   - All required columns present
   - Data types match standards
   - Primary keys defined
   - Foreign keys mapped

2. **Naming Validation**
   - Follow naming conventions
   - No reserved words
   - Consistent casing

3. **Relationship Validation**
   - All FKs reference valid PKs
   - Cardinality documented
   - Referential integrity defined

4. **Documentation Validation**
   - All required sections present
   - Metric formulas valid SQL
   - ERDs generated successfully

5. **Data Quality Validation**
   - Completeness targets met
   - Accuracy metrics defined
   - Validation rules documented

### Manual Review Checklist

- [ ] Domain accurately reflects banking industry practices
- [ ] Regulatory requirements addressed
- [ ] Cross-area relationships identified
- [ ] Business stakeholder sign-off
- [ ] Technical review completed
- [ ] Data quality metrics baseline established
- [ ] Performance testing completed
- [ ] Documentation peer-reviewed

---

## 📊 Grading Standards

### Domain Completeness Grading

**Grade A (95-100%)**
- All bronze/silver/gold layers complete
- All ERDs (4 total) generated
- 300+ metrics documented
- Full attribute catalog
- Cross-domain relationships mapped
- Industry-accurate naming
- Stakeholder approved

**Grade B (85-94%)**
- Bronze/silver complete, gold partial
- 3 ERDs generated
- 200+ metrics documented
- Partial attribute catalog

**Grade C (75-84%)**
- Bronze/silver partial
- 2 ERDs generated
- 100+ metrics documented

**Grade D (<75%)**
- Incomplete implementation

**Target:** 100% Grade A across all 87 domains

---

_Standards Version: 1.0_
_Date: 2025-01-08_
_Status: Approved for Phase 0_
