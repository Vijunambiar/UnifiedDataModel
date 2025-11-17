# Banking Domain Data Model Template

## Instructions for Creating New Domain Models

### Quality Standards (Target: Grade A)

- **Bronze Layer:** 15-25 tables minimum
- **Silver Layer:** 10-20 tables minimum  
- **Gold Layer:** 8-15 dimensions + 5-10 facts minimum
- **Metrics:** 300-600 per domain
- **Attributes:** Full documentation for ALL columns
- **Relationships:** Complete PK/FK mapping
- **Completeness:** 95-100%

### File Location

Create new domain files at:
```
client/lib/{area}/{domain-name}-comprehensive.ts
```

Examples:
- `client/lib/retail/customer-retail-comprehensive.ts`
- `client/lib/commercial/loans-commercial-comprehensive.ts`
- `client/lib/wealth/investment-wealth-comprehensive.ts`

### Template Structure

Every comprehensive domain file must include these sections in order:

1. **Domain Metadata** - Business context and ownership
2. **Bronze Layer** - Raw data tables (15-25 tables)
3. **Silver Layer** - Golden records with SCD2 (10-20 tables)
4. **Gold Layer** - Dimensional model (8-15 dims, 5-10 facts)
5. **Metrics Catalog** - 300-600 metrics organized by category
6. **ERD Metadata** - Logical and physical ERD definitions
7. **Cross-Domain Relationships** - Links to other domains
8. **Data Quality Rules** - Validation and monitoring rules
9. **Domain Export** - Integration with domain registry

---

## Section 1: Domain Metadata

```typescript
export const customerRetailMetadata = {
  id: 'customer-retail',
  name: 'Customer Retail',
  area: 'retail',
  description: 'Comprehensive retail customer domain covering individual consumers, households, demographics, financial profiles, preferences, and lifecycle management.',
  
  businessOwner: 'Retail Banking - Head of Customer Experience',
  technicalOwner: 'Data Architecture - Retail Domain Team',
  
  industryAlignment: {
    standardsBody: 'BIAN (Banking Industry Architecture Network)',
    domainMapping: 'Party Management',
    complianceStandards: ['GLBA', 'FCRA', 'CCPA', 'GDPR', 'ECOA'],
  },
  
  businessContext: {
    revenueImpact: 'High',
    customerSegments: ['Mass Market', 'Mass Affluent', 'Affluent'],
    keyProcesses: ['Customer Onboarding', 'KYC', 'Relationship Management', 'Cross-Sell'],
    strategicImportance: 'Critical',
  },
  
  dataArchitecture: {
    sourceSystems: [
      { name: 'FIS Core Banking', vendor: 'FIS', type: 'Core Banking' },
      { name: 'Salesforce CRM', vendor: 'Salesforce', type: 'CRM' },
      { name: 'Credit Bureau', vendor: 'Equifax/Experian/TransUnion', type: 'External' },
    ],
    refreshFrequency: 'Real-time CDC + Daily batch',
    dataVolume: {
      rowCount: '50M customers',
      storageSize: '200GB',
      growthRate: '15% annually',
    },
    dataLineage: 'Source Systems → Bronze → Silver (MDM) → Gold (Analytics)',
  },
  
  regulatoryRequirements: [
    {
      regulation: 'GLBA',
      requirement: 'Customer privacy and data security',
      dataElements: ['ssn', 'account_numbers', 'financial_info'],
      retentionPeriod: '7 years post relationship',
    },
    {
      regulation: 'FCRA',
      requirement: 'Accurate credit reporting',
      dataElements: ['credit_scores', 'credit_history'],
      retentionPeriod: '7 years',
    },
  ],
  
  keyMetrics: {
    totalMetrics: 500,
    categories: ['Acquisition', 'Retention', 'Engagement', 'Profitability', 'Risk', 'Satisfaction'],
  },
  
  version: '1.0',
  lastUpdated: '2025-01-08',
  status: 'PRODUCTION',
};
```

---

## Section 2: Bronze Layer

### Standards
- **Purpose:** Raw data with minimal transformation
- **Naming:** `bronze.{area}_{domain}_{entity}`
- **Retention:** 7 years minimum
- **Audit Columns:** Required on ALL tables

### Required Audit Columns (Every Bronze Table)

```typescript
schema: {
  // ... business columns ...
  
  // AUDIT TRAIL (REQUIRED)
  source_system: "STRING COMMENT 'Source system identifier'",
  source_record_id: "STRING COMMENT 'Original source record ID'",
  source_file_name: "STRING COMMENT 'Source file/batch ID'",
  load_timestamp: "TIMESTAMP COMMENT 'ETL load time (UTC)'",
  cdc_operation: "STRING COMMENT 'INSERT|UPDATE|DELETE'",
  record_hash: "STRING COMMENT 'MD5/SHA-256 of full record'",
  created_timestamp: "TIMESTAMP COMMENT 'Source system creation time'",
  updated_timestamp: "TIMESTAMP COMMENT 'Source system last update time'",
}
```

### Table Template

```typescript
export const customerRetailBronzeLayer = {
  description: 'Raw retail customer data from source systems',
  layer: 'BRONZE',
  sourceSystem: 'FIS_CORE',
  refreshFrequency: 'Real-time CDC',
  dataVolume: '50M rows, 200GB',
  retention: '7 years',
  
  tables: [
    {
      name: 'bronze.retail_customer_master',
      description: 'Core customer demographic and identification data',
      sourceSystem: 'FIS_CORE',
      sourceTable: 'CUSTOMER_MASTER',
      loadType: 'CDC',
      
      grain: 'One row per customer per source system',
      primaryKey: ['customer_id', 'source_system'],
      
      partitioning: {
        type: 'HASH',
        column: 'customer_id',
        buckets: 100,
      },
      
      clusteringKeys: ['customer_since_date'],
      
      estimatedRows: 50000000,
      avgRowSize: 4096,
      estimatedSize: '200GB',
      
      schema: {
        // PRIMARY KEYS
        customer_id: "BIGINT PRIMARY KEY COMMENT 'Unique customer identifier'",
        source_system: "STRING PRIMARY KEY COMMENT 'Source system name'",
        
        // NATURAL KEYS
        ssn_encrypted: "STRING COMMENT 'Encrypted SSN (AES-256)'",
        customer_uuid: "STRING COMMENT 'Global UUID (RFC 4122)'",
        
        // DEMOGRAPHICS
        first_name: "STRING COMMENT 'Legal first name'",
        last_name: "STRING COMMENT 'Legal last name'",
        date_of_birth: "DATE COMMENT 'Date of birth'",
        
        // ... 50-80 more attributes ...
        
        // AUDIT TRAIL (REQUIRED)
        source_record_id: "STRING COMMENT 'Original source record ID'",
        source_file_name: "STRING COMMENT 'Source file/batch ID'",
        load_timestamp: "TIMESTAMP COMMENT 'ETL load time (UTC)'",
        cdc_operation: "STRING COMMENT 'INSERT|UPDATE|DELETE'",
        record_hash: "STRING COMMENT 'MD5 hash of record'",
        created_timestamp: "TIMESTAMP COMMENT 'Source creation time'",
        updated_timestamp: "TIMESTAMP COMMENT 'Source update time'",
      },
      
      columns: [
        {
          name: 'customer_id',
          isPrimaryKey: true,
          isForeignKey: false,
          isNullable: false,
          dataType: 'BIGINT',
          description: 'Unique customer identifier',
          sampleValues: ['1001', '1002', '1003'],
          businessRules: ['Must be unique', 'Auto-generated sequence'],
          dataQualityRules: ['NOT NULL', 'UNIQUE', 'NUMERIC'],
        },
        // ... all other columns with full metadata ...
      ],
      
      indexes: [
        { name: 'idx_pk_customer', type: 'CLUSTERED', columns: ['customer_id', 'source_system'] },
        { name: 'idx_ssn', type: 'UNIQUE', columns: ['ssn_encrypted'] },
      ],
      
      constraints: [
        { type: 'PRIMARY KEY', columns: ['customer_id', 'source_system'] },
        { type: 'CHECK', expression: 'fico_score BETWEEN 300 AND 850', name: 'chk_fico_range' },
      ],
    },
    // ... 14-24 more bronze tables ...
  ],
  
  totalTables: 18,
  estimatedSize: '500GB',
};
```

---

## Section 3: Silver Layer

### Standards
- **Purpose:** Cleansed, deduplicated golden records with SCD2 history
- **Naming:** `silver.{area}_{domain}_{entity}_golden`
- **Data Quality:** 95%+ completeness, 99%+ accuracy
- **SCD Type 2:** Track all historical changes

### Required SCD2 Columns (Every Silver Table)

```typescript
schema: {
  // ... business columns ...
  
  // SCD TYPE 2 (REQUIRED)
  effective_date: "DATE COMMENT 'SCD2 effective start date'",
  expiration_date: "DATE DEFAULT '9999-12-31' COMMENT 'SCD2 end date'",
  is_current: "BOOLEAN DEFAULT TRUE COMMENT 'Current record flag'",
  record_version: "INTEGER COMMENT 'Version number'",
  
  // DATA QUALITY (REQUIRED)
  data_quality_score: "DECIMAL(5,2) COMMENT 'Overall quality score 0-100'",
  completeness_score: "DECIMAL(5,2) COMMENT 'Completeness percentage'",
  accuracy_score: "DECIMAL(5,2) COMMENT 'Accuracy percentage'",
  source_system_of_record: "STRING COMMENT 'Authoritative source'",
  
  // AUDIT (REQUIRED)
  created_timestamp: "TIMESTAMP COMMENT 'Record creation time'",
  updated_timestamp: "TIMESTAMP COMMENT 'Last update time'",
  created_by: "STRING COMMENT 'User/process that created'",
  updated_by: "STRING COMMENT 'User/process that updated'",
}
```

### Table Template

```typescript
export const customerRetailSilverLayer = {
  description: 'Curated retail customer data with MDM and SCD2 history',
  layer: 'SILVER',
  refreshFrequency: 'Hourly',
  dataQuality: {
    completeness: '95%+',
    accuracy: '99%+',
    consistency: '98%+',
  },
  
  tables: [
    {
      name: 'silver.retail_customer_master_golden',
      description: 'Golden customer record with MDM',
      grain: 'One current row per unique customer',
      scdType: 'Type 2',
      
      primaryKey: ['customer_sk'],
      naturalKey: ['customer_id'],
      
      sourceTables: [
        'bronze.retail_customer_master',
        'bronze.retail_customer_profile',
      ],
      
      schema: {
        // SURROGATE KEY
        customer_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Surrogate key'",
        
        // NATURAL KEYS
        customer_id: "BIGINT COMMENT 'Business natural key'",
        customer_uuid: "STRING COMMENT 'Global UUID'",
        
        // CLEANSED ATTRIBUTES
        first_name_cleansed: "STRING COMMENT 'Cleansed first name'",
        last_name_cleansed: "STRING COMMENT 'Cleansed last name'",
        
        // ... all cleansed attributes ...
        
        // SCD TYPE 2 (REQUIRED)
        effective_date: "DATE COMMENT 'SCD2 start date'",
        expiration_date: "DATE DEFAULT '9999-12-31' COMMENT 'SCD2 end date'",
        is_current: "BOOLEAN DEFAULT TRUE COMMENT 'Current record'",
        record_version: "INTEGER COMMENT 'Version number'",
        
        // DATA QUALITY (REQUIRED)
        data_quality_score: "DECIMAL(5,2) COMMENT 'Quality score 0-100'",
        source_system_of_record: "STRING COMMENT 'Authoritative source'",
        
        // AUDIT (REQUIRED)
        created_timestamp: "TIMESTAMP COMMENT 'Creation time'",
        updated_timestamp: "TIMESTAMP COMMENT 'Update time'",
        created_by: "STRING COMMENT 'Created by'",
        updated_by: "STRING COMMENT 'Updated by'",
      },
    },
    // ... 9-19 more silver tables ...
  ],
  
  totalTables: 15,
};
```

---

## Section 4: Gold Layer

### Dimensional Model Standards
- **Approach:** Kimball Dimensional Modeling (Star Schema)
- **Dimensions:** 8-15 per domain
- **Facts:** 5-10 per domain
- **Naming:** `gold.dim_{entity}` and `gold.fact_{process}`

### Dimension Template

```typescript
export const customerRetailGoldLayer = {
  description: 'Analytics-ready dimensional model',
  layer: 'GOLD',
  modelingApproach: 'Kimball Star Schema',
  
  dimensions: [
    {
      name: 'gold.dim_retail_customer',
      description: 'Retail customer dimension',
      type: 'SCD Type 1',
      grain: 'One row per unique customer',
      conformedDimension: true,
      
      primaryKey: 'customer_key',
      naturalKey: 'customer_id',
      
      schema: {
        // SURROGATE KEY
        customer_key: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Dimension key'",
        
        // NATURAL KEYS
        customer_id: "BIGINT COMMENT 'Business ID'",
        customer_code: "STRING COMMENT 'Human-readable code'",
        
        // DESCRIPTIVE ATTRIBUTES (20-100)
        customer_name: "STRING COMMENT 'Full name'",
        
        // ... 20-100 descriptive attributes ...
        
        // AUDIT
        created_date: "DATE COMMENT 'Creation date'",
        row_created_timestamp: "TIMESTAMP COMMENT 'Row insert time'",
      },
      
      hierarchies: [
        {
          name: 'Customer Segment Hierarchy',
          levels: [
            { level: 1, attribute: 'segment_tier1', description: 'Top level segment' },
            { level: 2, attribute: 'segment_tier2', description: 'Sub-segment' },
            { level: 3, attribute: 'segment_tier3', description: 'Micro-segment' },
          ],
        },
      ],
    },
    // ... 7-14 more dimensions ...
  ],
  
  facts: [
    {
      name: 'gold.fact_customer_events',
      description: 'Customer lifecycle events',
      factType: 'Transaction',
      grain: 'One row per customer event',
      
      schema: {
        // FACT KEY
        customer_event_key: "BIGINT PRIMARY KEY COMMENT 'Fact key'",
        
        // DIMENSION FKs
        customer_key: "BIGINT COMMENT 'FK to dim_retail_customer'",
        event_date_key: "INTEGER COMMENT 'FK to dim_date'",
        
        // DEGENERATE DIMENSIONS
        event_id: "STRING COMMENT 'Event identifier'",
        
        // ADDITIVE MEASURES
        event_count: "BIGINT COMMENT 'Count of events'",
        event_value: "DECIMAL(18,2) COMMENT 'Event value'",
        
        // AUDIT
        created_timestamp: "TIMESTAMP COMMENT 'Load timestamp'",
      },
      
      measures: [
        {
          name: 'event_count',
          dataType: 'BIGINT',
          aggregationType: 'SUM',
          description: 'Count of customer events',
        },
      ],
    },
    // ... 4-9 more facts ...
  ],
  
  totalDimensions: 12,
  totalFacts: 8,
};
```

---

## Section 5: Metrics Catalog

### Standards
- **Total Metrics:** 300-600 per domain
- **Categories:** 5-10 categories
- **Format:** Complete metric definition with SQL

### Metric Template

```typescript
export const customerRetailMetricsCatalog = {
  description: 'Comprehensive retail customer metrics',
  totalMetrics: 500,
  
  categories: [
    {
      name: 'Acquisition Metrics',
      description: 'New customer acquisition and onboarding',
      totalMetrics: 80,
      
      metrics: [
        {
          id: 'CRM-001',
          name: 'New Customer Acquisitions',
          description: 'Number of new retail customers acquired in period',
          
          category: 'Acquisition',
          subcategory: 'Volume',
          
          formula: "COUNT(DISTINCT customer_id WHERE customer_since_date >= period_start)",
          businessLogic: 'Count of customers who opened their first account in the period',
          
          dataType: 'INTEGER',
          unit: 'count',
          aggregation: 'SUM',
          granularity: 'Daily',
          
          sourceTables: [
            'gold.fact_customer_events',
            'gold.dim_retail_customer',
          ],
          
          calculation: {
            numerator: "COUNT(DISTINCT customer_id)",
            filters: "customer_since_date BETWEEN period_start AND period_end",
          },
          
          benchmarks: {
            industryAverage: '50,000/month',
            topQuartile: '75,000/month',
            target: '60,000/month',
          },
          
          sqlExample: `
            SELECT
              d.calendar_month,
              COUNT(DISTINCT c.customer_id) AS new_customers
            FROM
              gold.fact_customer_events f
              JOIN gold.dim_retail_customer c ON f.customer_key = c.customer_key
              JOIN gold.dim_date d ON f.event_date_key = d.date_key
            WHERE
              c.customer_since_date >= d.calendar_month_start
              AND c.customer_since_date <= d.calendar_month_end
            GROUP BY
              d.calendar_month
          `,
          
          version: '1.0',
          lastUpdated: '2025-01-08',
        },
        // ... 79 more acquisition metrics ...
      ],
    },
    {
      name: 'Retention Metrics',
      totalMetrics: 90,
      metrics: [
        // ... 90 retention metrics ...
      ],
    },
    // ... 4-8 more categories ...
  ],
};
```

### Metric Categories (Required)

Every domain should include these metric categories:
1. **Volume Metrics** - Counts, totals
2. **Revenue Metrics** - Fees, income, profitability
3. **Risk Metrics** - Credit risk, operational risk
4. **Efficiency Metrics** - Cost ratios, productivity
5. **Quality Metrics** - Accuracy, completeness, timeliness
6. **Customer Metrics** - Satisfaction, engagement, retention

---

## Section 6: Data Quality Rules

```typescript
export const customerRetailDataQualityRules = {
  completeness: {
    target: 95,
    criticalFields: [
      {
        table: 'bronze.retail_customer_master',
        column: 'customer_id',
        requiredCompleteness: 100,
      },
    ],
  },
  
  accuracy: {
    target: 99,
    validations: [
      {
        rule: 'Valid FICO Score Range',
        validationSQL: "SELECT COUNT(*) FROM bronze.retail_customer_master WHERE fico_score NOT BETWEEN 300 AND 850",
      },
    ],
  },
  
  consistency: {
    target: 98,
    rules: [
      {
        rule: 'Customer Age Consistency',
        validationSQL: "SELECT COUNT(*) FROM bronze.retail_customer_master WHERE DATEDIFF(YEAR, date_of_birth, CURRENT_DATE) != age",
      },
    ],
  },
};
```

---

## Banking Data Type Standards

### Money & Financial

```typescript
// Currency amounts
transaction_amount: "DECIMAL(18,2) COMMENT 'Amount in base currency'"
balance_amount: "DECIMAL(18,2) COMMENT 'Account balance'"
currency_code: "STRING COMMENT 'ISO 4217 currency code (USD, EUR, GBP)'"

// Interest rates & percentages
interest_rate: "DECIMAL(10,6) COMMENT 'Annual percentage rate (decimal)'"
apr: "DECIMAL(10,6) COMMENT 'Annual percentage rate'"

// Account identifiers
account_number: "STRING(20) COMMENT 'Account number'"
routing_number: "STRING(9) COMMENT 'ABA routing number'"
iban: "STRING(34) COMMENT 'International bank account number'"
swift_bic: "STRING(11) COMMENT 'SWIFT/BIC code'"
```

### Customer Identifiers

```typescript
// Personal identifiers
ssn_encrypted: "STRING(256) COMMENT 'Encrypted SSN (AES-256)'"
tax_id: "STRING(20) COMMENT 'Tax identification number'"
driver_license: "STRING(20) COMMENT 'Driver license number'"

// Business identifiers
ein: "STRING(10) COMMENT 'Employer Identification Number'"
duns_number: "STRING(9) COMMENT 'D&B DUNS number'"
lei: "STRING(20) COMMENT 'Legal Entity Identifier'"
```

### Scores & Ratings

```typescript
fico_score: "INTEGER COMMENT 'FICO credit score (300-850)'"
vantage_score: "INTEGER COMMENT 'VantageScore (300-850)'"
risk_rating: "STRING COMMENT 'Risk rating (AAA, AA, A, BBB, etc.)'"
internal_rating: "INTEGER COMMENT 'Internal risk rating (1-10)'"
```

---

## Cross-Domain Relationship Patterns

### Shared Customer Across Areas

```typescript
// Customer appears in retail, commercial, and wealth
export const customerRetailCrossDomainRelationships = {
  relationships: [
    {
      sourceDomain: 'customer-retail',
      sourceEntity: 'customer',
      targetDomain: 'customer-commercial',
      targetArea: 'commercial',
      targetEntity: 'business_customer',
      relationshipType: '1:M',
      linkageTable: 'gold.customer_area_linkage',
      description: 'Retail customer may also be a business owner with commercial accounts',
    },
    {
      sourceDomain: 'customer-retail',
      sourceEntity: 'customer',
      targetDomain: 'investment-wealth',
      targetArea: 'wealth',
      targetEntity: 'wealth_client',
      relationshipType: '1:1',
      description: 'Mass affluent retail customer graduates to wealth management',
    },
  ],
};
```

---

## Validation Checklist

Before submitting a new domain, validate:

- [ ] All bronze tables (15-25) have complete schemas
- [ ] All bronze tables include required audit columns
- [ ] All silver tables (10-20) have SCD2 fields
- [ ] All silver tables include data quality scores
- [ ] All gold dimensions (8-15) are defined
- [ ] All gold facts (5-10) are defined
- [ ] Metrics catalog has 300-600 metrics
- [ ] All metrics have SQL examples
- [ ] All tables have PK/FK relationships mapped
- [ ] Cross-domain relationships identified
- [ ] Data quality rules defined (completeness, accuracy, consistency)
- [ ] Industry terminology and standards followed
- [ ] Regulatory requirements documented
- [ ] Business stakeholders identified
- [ ] Source systems documented

---

## Example: Complete Minimal Domain

See `client/lib/retail/customer-retail-comprehensive.ts` for a complete example of a Grade A domain implementation.

---

_Template Version: 1.0_
_Date: 2025-01-08_
_Status: Approved for Phase 0_
