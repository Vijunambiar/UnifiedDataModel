# SOURCE SYSTEM ONBOARDING TEMPLATE

Use this template when adding a new source system to the source-to-target mapping framework.

---

## STEP 1: Source System Registration

### Basic Information

**Source System ID**: `[unique-id]` (e.g., `experian-credit-001`)  
**Source System Code**: `[VENDOR-PRODUCT]` (e.g., `EXP-CREDIT`)  
**Source System Name**: `[Full Name]` (e.g., `Experian Credit Bureau`)  
**Vendor**: `[Vendor Name]` (e.g., `Experian`)  
**Product Name**: `[Product/Platform]` (e.g., `Experian Connect`)  
**Version**: `[Version]` (e.g., `v4.2`)

### Classification

**System Type**: Select one

- [ ] CORE_BANKING
- [ ] PAYMENT_PROCESSOR
- [ ] CREDIT_BUREAU
- [ ] FRAUD_DETECTION
- [ ] LOAN_ORIGINATION
- [ ] CARD_PROCESSOR
- [ ] TREASURY
- [ ] CRM
- [ ] AML_COMPLIANCE
- [ ] MARKET_DATA
- [ ] PROPERTY_DATA
- [ ] ACCOUNT_AGGREGATION

**Criticality**: Select one

- [ ] CRITICAL - System downtime impacts core operations
- [ ] HIGH - Important but workarounds available
- [ ] MEDIUM - Nice to have, delays acceptable
- [ ] LOW - Non-essential

### Integration Details

**Integration Type**: Select one

- [ ] CDC (Change Data Capture)
- [ ] BATCH_FILE (Daily/Hourly files)
- [ ] API_REST (REST API)
- [ ] API_SOAP (SOAP API)
- [ ] STREAMING (Kafka, Event Hub)
- [ ] SFTP (File transfer)
- [ ] EVENT_HUB (Azure Event Hub)
- [ ] WEBHOOK (HTTP callbacks)

**Data Format**: Select one or more

- [ ] CSV
- [ ] JSON
- [ ] XML
- [ ] PARQUET
- [ ] AVRO
- [ ] DELIMITED (pipe, tab, etc.)
- [ ] FIXED_WIDTH
- [ ] PROPRIETARY

**Connection Details**:

- Protocol: `[HTTP/HTTPS/SFTP/etc.]`
- Host: `[hostname or IP]`
- Port: `[port number]`
- Endpoint: `[API endpoint or file path]`
- Auth Method: `[OAuth2/API Key/Basic Auth/Certificate]`

### Operational Characteristics

**Refresh Frequency**: `[Real-time/Hourly/Daily/Weekly/On-demand]`  
**Avg Daily Volume**: `[Number of records or file size]`  
**Retention Period**: `[How long to keep data]`

**SLA**:

- Availability: `[e.g., 99.9% uptime]`
- Latency: `[e.g., <500ms]`
- Refresh Cadence: `[e.g., Every 15 minutes]`

### Business Context

**Domains Served**: (list all applicable domains)

- `[domain-id-1]` (e.g., `loans-retail`)
- `[domain-id-2]` (e.g., `credit-cards`)

**Data Types Provided**: (list all data types)

- `[Data Type 1]` (e.g., `Credit Scores`)
- `[Data Type 2]` (e.g., `Trade Lines`)

**Key Entities**: (list main entities)

- `[Entity 1]` (e.g., `Credit Report`)
- `[Entity 2]` (e.g., `Credit Score`)

### Contacts & Support

**Primary Contact**: `[Name/Role]` (e.g., `Risk Manager`)  
**Support Team**: `[Vendor Support]` (e.g., `Experian Support 1-800-XXX-XXXX`)  
**Documentation**: `[URL to docs]` (e.g., `https://docs.experian.com`)  
**Cost**: `[Annual cost or pricing model]` (e.g., `$2-5 per pull`)

---

## STEP 2: Source Schema Documentation

For each source table, file, or API endpoint, document:

### Schema Template

```typescript
{
  schemaName: '[SCHEMA_OR_TABLE_NAME]',
  tableName: '[TABLE_NAME]',           // If database
  fileName: '[FILE_NAME_PATTERN]',     // If file-based
  apiEndpoint: '[API_ENDPOINT]',       // If API
  description: '[Description of what this schema contains]',
  primaryKey: ['[field1]', '[field2]'],
  fields: [
    // Add one entry per field
    {
      sourceFieldName: '[field_name]',
      dataType: '[STRING/INTEGER/DECIMAL/DATE/TIMESTAMP/BOOLEAN/JSON/ARRAY]',
      length: [max_length],              // Optional
      precision: [precision],            // For DECIMAL
      scale: [scale],                    // For DECIMAL
      nullable: [true/false],
      description: '[Business description of field]',
      sampleValues: ['[sample1]', '[sample2]', '[sample3]'],
      validationRules: ['[rule1]', '[rule2]'],
      piiFlag: [true/false],             // Is this PII?
      encryptionRequired: [true/false],  // Must it be encrypted?
    },
  ],
}
```

### Field Documentation Checklist

For each field, ensure you document:

- ✅ Source field name (exact spelling from source)
- ✅ Data type and length/precision
- ✅ Business description (what does it mean?)
- ✅ Sample values (at least 3 real examples)
- ✅ Validation rules (pattern, range, enum values)
- ✅ PII flag (mark sensitive data)
- ✅ Encryption requirements

---

## STEP 3: Field Mapping Documentation

For each field that flows to Bronze/Silver/Gold, document:

### Field Mapping Template

```typescript
{
  // Source
  sourceSystem: '[SOURCE_SYSTEM_CODE]',
  sourceSchema: '[SOURCE_SCHEMA_NAME]',
  sourceField: '[SOURCE_FIELD_NAME]',
  sourceDataType: '[SOURCE_DATA_TYPE]',

  // Target Bronze
  bronzeTable: 'bronze.[table_name]',
  bronzeField: '[bronze_field_name]',
  bronzeDataType: '[BRONZE_DATA_TYPE]',

  // Target Silver (optional)
  silverTable: 'silver.[table_name]',
  silverField: '[silver_field_name]',
  silverDataType: '[SILVER_DATA_TYPE]',

  // Target Gold (optional)
  goldTable: 'gold.[table_name]',
  goldField: '[gold_field_name]',
  goldDataType: '[GOLD_DATA_TYPE]',

  // Transformation
  transformationType: '[SELECT_ONE]',
  // Options: DIRECT_MAPPING, TYPE_CONVERSION, ENCRYPTION, DECRYPTION,
  //          LOOKUP, CONCATENATION, SPLIT, DERIVED, AGGREGATION,
  //          STANDARDIZATION, ENRICHMENT

  transformationLogic: '[Describe transformation in plain English]',

  transformationSQL: `
    -- Bronze transformation SQL
    [SQL for bronze layer]

    -- Silver transformation SQL
    [SQL for silver layer]

    -- Gold transformation SQL
    [SQL for gold layer]
  `,

  businessDefinition: '[Business meaning of this field]',
  dataQualityRules: [
    '[Rule 1]',
    '[Rule 2]',
    '[Rule 3]',
  ],

  sampleTransformation: [
    { sourceValue: '[example1_source]', targetValue: '[example1_target]' },
    { sourceValue: '[example2_source]', targetValue: '[example2_target]' },
  ],
}
```

### Mapping Checklist

For each mapping, ensure:

- ✅ Source and target fields clearly identified
- ✅ Data type conversions documented
- ✅ Transformation logic explained (plain English + SQL)
- ✅ Business definition provided
- ✅ Data quality rules defined
- ✅ Sample transformations shown (before/after examples)

---

## STEP 4: Data Lineage Documentation

Document the end-to-end flow:

### Lineage Template

```typescript
{
  domainId: '[domain-id]',
  entity: '[Entity Name]',

  // Source to Bronze
  sourceSystem: '[SOURCE_SYSTEM_CODE]',
  sourceSchema: '[SOURCE_SCHEMA_NAME]',
  sourceField: '[SOURCE_FIELD_NAME]',
  bronzeTable: 'bronze.[table_name]',
  bronzeField: '[bronze_field_name]',
  bronzeLoadType: '[CDC/BATCH/API/STREAMING]',

  // Bronze to Silver
  silverTable: 'silver.[table_name]',
  silverField: '[silver_field_name]',
  silverTransformation: '[Describe transformation from bronze to silver]',

  // Silver to Gold
  goldTable: 'gold.[table_name]',
  goldField: '[gold_field_name]',
  goldAggregation: '[Describe aggregation/modeling from silver to gold]',

  // Metadata
  dataLineagePath: '[Full path description]',
  // Example: "Experian API → bronze.experian_credit_reports → silver.credit_reports_enriched → gold.fact_credit_scores"

  lastUpdated: '[YYYY-MM-DD]',
  certifiedFlag: [true/false],  // Has this lineage been validated?
}
```

### Lineage Checklist

- ✅ Source system clearly identified
- ✅ Bronze table and transformation documented
- ✅ Silver table and transformation documented
- ✅ Gold table and transformation documented
- ✅ Full lineage path documented (source → bronze → silver → gold)
- ✅ Certification status set

---

## STEP 5: Code Implementation

### Add to `source-to-target-mapping.ts`

1. **Add Source System Entry**:

```typescript
// Add to sourceSystems array
{
  sourceSystemId: '[your-source-id]',
  sourceSystemCode: '[YOUR-CODE]',
  sourceSystemName: '[Full Name]',
  vendor: '[Vendor]',
  productName: '[Product]',
  version: '[Version]',

  systemType: '[TYPE]',
  criticality: '[LEVEL]',

  integrationType: '[TYPE]',
  dataFormat: '[FORMAT]',
  connectionDetails: {
    protocol: '[PROTOCOL]',
    host: '[HOST]',
    port: [PORT],
    endpoint: '[ENDPOINT]',
    authMethod: '[AUTH]',
  },

  refreshFrequency: '[FREQUENCY]',
  avgDailyVolume: '[VOLUME]',
  retentionPeriod: '[PERIOD]',
  sla: {
    availability: '[SLA]',
    latency: '[LATENCY]',
    refreshCadence: '[CADENCE]',
  },

  domains: ['[domain1]', '[domain2]'],
  dataTypes: ['[type1]', '[type2]'],
  keyEntities: ['[entity1]', '[entity2]'],

  primaryContact: '[Contact]',
  supportTeam: '[Support]',
  documentation: '[URL]',
  cost: '[Cost]',

  sourceSchemas: [
    // Your source schema definitions here
  ],
}
```

2. **Add Field Mappings**:

```typescript
// Create new array for your source system
export const [yourSourceSystem]Mappings: FieldMapping[] = [
  // Your field mapping definitions here
];
```

3. **Add Lineage Tracking**:

```typescript
// Create lineage array for your source
export const [yourSourceSystem]Lineage: DataLineage[] = [
  // Your lineage definitions here
];
```

4. **Update Helper Functions**:

```typescript
// Update getMappingsBySourceSystem function
export function getMappingsBySourceSystem(sourceSystemCode: string): FieldMapping[] {
  if (sourceSystemCode === 'FIS-ACH-TRK') return fisACHTrackerMappings;
  if (sourceSystemCode === 'FICO-FRAUD') return ficoFraudMappings;
  if (sourceSystemCode === '[YOUR-CODE]') return [yourSourceSystem]Mappings;  // ADD THIS
  return [];
}

// Update getLineageBySourceSystem to include your lineage
export function getLineageBySourceSystem(sourceSystemCode: string): DataLineage[] {
  const allLineage = [
    ...fisACHLineage,
    ...ficoFraudLineage,
    ...[yourSourceSystem]Lineage,  // ADD THIS
  ];
  return allLineage.filter(l => l.sourceSystem === sourceSystemCode);
}
```

---

## STEP 6: Testing & Validation

### Validation Checklist

Before marking complete, verify:

- ✅ **Source System Registry**
  - [ ] All required fields populated
  - [ ] Connection details accurate
  - [ ] SLA information provided
  - [ ] Domains and data types listed

- ✅ **Source Schemas**
  - [ ] All fields documented
  - [ ] Data types correct
  - [ ] Sample values provided
  - [ ] PII fields identified
  - [ ] Validation rules defined

- ✅ **Field Mappings**
  - [ ] All critical fields mapped
  - [ ] Transformation logic clear
  - [ ] SQL examples provided
  - [ ] Data quality rules defined
  - [ ] Sample transformations shown

- ✅ **Data Lineage**
  - [ ] Full path documented (source → gold)
  - [ ] All layers covered (bronze, silver, gold)
  - [ ] Transformations at each layer explained
  - [ ] Lineage certified

- ✅ **Code Integration**
  - [ ] Added to source systems array
  - [ ] Field mappings array created
  - [ ] Lineage array created
  - [ ] Helper functions updated
  - [ ] TypeScript compiles without errors

- ✅ **Testing**
  - [ ] `getSourceSystemByCode('[YOUR-CODE]')` returns correct system
  - [ ] `getMappingsBySourceSystem('[YOUR-CODE]')` returns mappings
  - [ ] `getLineageBySourceSystem('[YOUR-CODE]')` returns lineage
  - [ ] Sample queries tested

---

## STEP 7: Documentation

Create or update documentation in `SOURCE-TO-TARGET-MAPPING-FRAMEWORK.md`:

1. **Add Source System Section**:
   - Overview of source system
   - Connection details
   - Source schemas
   - Sample records

2. **Add Mapping Examples**:
   - Show 3-5 field mapping examples
   - Include transformation SQL
   - Show before/after samples

3. **Add Lineage Diagram**:
   - Create ASCII art lineage diagram
   - Show full path from source to gold
   - Include transformation notes

4. **Update Summary Tables**:
   - Add to source system inventory
   - Update total counts
   - Add to domain coverage matrix

---

## EXAMPLE: Experian Credit Bureau

Here's a complete example for Experian:

### Source System Entry

```typescript
{
  sourceSystemId: 'experian-credit-001',
  sourceSystemCode: 'EXP-CREDIT',
  sourceSystemName: 'Experian Credit Bureau',
  vendor: 'Experian',
  productName: 'Experian Connect API',
  version: 'v4.2',

  systemType: 'CREDIT_BUREAU',
  criticality: 'CRITICAL',

  integrationType: 'API_REST',
  dataFormat: 'JSON',
  connectionDetails: {
    protocol: 'HTTPS',
    host: 'api.experian.com',
    port: 443,
    endpoint: '/consumerservices/credit-profile/v2',
    authMethod: 'OAuth2 + Client Certificate',
  },

  refreshFrequency: 'On-demand (per credit pull)',
  avgDailyVolume: '30K credit pulls',
  retentionPeriod: '7 years',
  sla: {
    availability: '99.9% uptime',
    latency: '<3s per credit pull',
    refreshCadence: 'Real-time per request',
  },

  domains: ['loans-retail', 'loans-commercial', 'credit-cards', 'risk'],
  dataTypes: [
    'Credit Scores (FICO, VantageScore)',
    'Trade Lines',
    'Payment History',
    'Inquiries',
    'Public Records',
    'Collections',
  ],
  keyEntities: ['Credit Report', 'Credit Score', 'Trade Line', 'Inquiry'],

  primaryContact: 'Risk Manager',
  supportTeam: 'Experian Support (1-888-XXX-XXXX)',
  documentation: 'https://developer.experian.com/credit-profile',
  cost: '$2-5 per credit pull',

  sourceSchemas: [
    {
      schemaName: 'CREDIT_PROFILE_RESPONSE',
      apiEndpoint: '/consumerservices/credit-profile/v2',
      description: 'Full consumer credit report with scores and trade lines',
      primaryKey: ['report_id'],
      fields: [
        {
          sourceFieldName: 'report_id',
          dataType: 'STRING',
          length: 50,
          nullable: false,
          description: 'Experian credit report identifier',
          sampleValues: ['EXP-CR-20250115-001234', 'EXP-CR-20250115-005678'],
          validationRules: ['Pattern: EXP-CR-YYYYMMDD-######'],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: 'consumer_ssn',
          dataType: 'STRING',
          length: 9,
          nullable: false,
          description: 'Consumer Social Security Number',
          sampleValues: ['ENCRYPTED_VALUE'],
          validationRules: ['Numeric', 'Length = 9'],
          piiFlag: true,
          encryptionRequired: true,
        },
        {
          sourceFieldName: 'fico_score_8',
          dataType: 'INTEGER',
          nullable: true,
          description: 'FICO Score 8 (300-850)',
          sampleValues: ['720', '650', '800'],
          validationRules: ['Range: 300-850'],
          piiFlag: false,
          encryptionRequired: false,
        },
        {
          sourceFieldName: 'vantage_score_3',
          dataType: 'INTEGER',
          nullable: true,
          description: 'VantageScore 3.0 (300-850)',
          sampleValues: ['715', '645', '795'],
          validationRules: ['Range: 300-850'],
          piiFlag: false,
          encryptionRequired: false,
        },
        // ... more fields
      ],
    },
  ],
}
```

### Field Mapping Example

```typescript
{
  sourceSystem: 'EXP-CREDIT',
  sourceSchema: 'CREDIT_PROFILE_RESPONSE',
  sourceField: 'fico_score_8',
  sourceDataType: 'INTEGER',

  bronzeTable: 'bronze.experian_credit_reports',
  bronzeField: 'fico_score_8',
  bronzeDataType: 'INTEGER',

  silverTable: 'silver.credit_scores_enriched',
  silverField: 'fico_score',
  silverDataType: 'INTEGER',

  goldTable: 'gold.fact_credit_scores',
  goldField: 'credit_score',
  goldDataType: 'INTEGER',

  transformationType: 'DIRECT_MAPPING',
  transformationLogic: 'Bronze: Direct copy. Silver: Validate range 300-850, use as primary credit score. Gold: Measure for analytics',
  transformationSQL: `
    -- Bronze
    fico_score_8

    -- Silver
    CASE
      WHEN fico_score_8 < 300 THEN NULL
      WHEN fico_score_8 > 850 THEN NULL
      ELSE fico_score_8
    END AS fico_score

    -- Gold
    fico_score AS credit_score
  `,

  businessDefinition: 'FICO Score 8 - industry standard credit score (300-850, higher is better)',
  dataQualityRules: [
    'Range: 300-850',
    'NULL if score unavailable',
    'Must be integer',
  ],

  sampleTransformation: [
    { sourceValue: '720', targetValue: '720' },
    { sourceValue: '650', targetValue: '650' },
    { sourceValue: '999', targetValue: 'NULL (out of range)' },
  ],
}
```

### Lineage Example

```typescript
{
  domainId: 'loans-retail',
  entity: 'Credit Score',

  sourceSystem: 'EXP-CREDIT',
  sourceSchema: 'CREDIT_PROFILE_RESPONSE',
  sourceField: 'fico_score_8',
  bronzeTable: 'bronze.experian_credit_reports',
  bronzeField: 'fico_score_8',
  bronzeLoadType: 'API',

  silverTable: 'silver.credit_scores_enriched',
  silverField: 'fico_score',
  silverTransformation: 'Range validation (300-850), set as primary credit score',

  goldTable: 'gold.fact_credit_scores',
  goldField: 'credit_score',
  goldAggregation: 'Measure for credit score analytics',

  dataLineagePath: 'Experian API → bronze.experian_credit_reports → silver.credit_scores_enriched → gold.fact_credit_scores',
  lastUpdated: '2025-01-15',
  certifiedFlag: true,
}
```

---

## COMPLETION CHECKLIST

Before marking a source system as complete:

- [ ] Source system registered in `sourceSystems[]` array
- [ ] All connection details documented
- [ ] At least 1 source schema documented
- [ ] At least 10 fields documented with full details
- [ ] At least 5 field mappings created (Bronze → Silver → Gold)
- [ ] At least 2 lineage entries documented
- [ ] Helper functions updated to include new source
- [ ] TypeScript compiles without errors
- [ ] Tested programmatic access (getSourceSystemByCode, etc.)
- [ ] Documentation updated in `SOURCE-TO-TARGET-MAPPING-FRAMEWORK.md`
- [ ] Lineage diagram created
- [ ] Peer review completed
- [ ] Certification flag set to `true`

---

**Template Version**: 1.0  
**Last Updated**: 2025-01-15  
**Owner**: Data Architecture Team
