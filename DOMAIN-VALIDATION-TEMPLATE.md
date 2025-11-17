# DOMAIN VALIDATION TEMPLATE & CHECKLIST

**Purpose**: Step-by-step validation process for creating and verifying retail banking domains to ensure completeness, accuracy, and consistency.

---

## PRE-CREATION CHECKLIST

### Step 1: Planning & Requirements
- [ ] Domain name and ID confirmed (kebab-case, e.g., `marketing-retail`)
- [ ] Business requirements documented
- [ ] Key entities identified (7-15 entities)
- [ ] Data sources identified (10-20 sources)
- [ ] Regulatory context documented
- [ ] Use cases defined (6-10 use cases)
- [ ] Stakeholders identified

### Step 2: Metrics Planning
- [ ] Target metrics count determined (300-600)
- [ ] Metrics categories defined (8-12 categories)
- [ ] Sample metrics per category planned (2-5 detailed examples)
- [ ] Metrics structure follows enterprise template

---

## IMPLEMENTATION CHECKLIST

### Step 3: Create Comprehensive File

**File**: `client/lib/retail/{domain}-retail-comprehensive.ts`

**Required exports**:
- [ ] `{domain}RetailBronzeLayer` - with `totalTables` count
- [ ] `{domain}RetailSilverLayer` - with `totalTables` count
- [ ] `{domain}RetailGoldLayer` - with `totalDimensions` and `totalFacts`
- [ ] `{domain}RetailMetricsCatalog` - with `totalMetrics` count
- [ ] `{domain}RetailLogicalERD` (if applicable)
- [ ] `{domain}RetailPhysicalERD` (if applicable)

**Bronze Layer Requirements**:
- [ ] 25-35 realistic tables defined
- [ ] Each table has:
  - [ ] `name` (e.g., `bronze.mktg_campaigns`)
  - [ ] `description` (business purpose)
  - [ ] `sourceSystem` (actual system name)
  - [ ] `loadType` (`BATCH` or `STREAMING`)
  - [ ] `grain` (one row per...)
  - [ ] `schema` object with 10-25 realistic attributes
    - [ ] Includes PRIMARY KEY
    - [ ] Includes foreign key references (FK to...)
    - [ ] Data types specified (STRING, INTEGER, DECIMAL, DATE, TIMESTAMP, BOOLEAN, JSON, ARRAY)
    - [ ] Realistic attribute names (not generic attr1, attr2)

**Silver Layer Requirements**:
- [ ] 20-30 tables defined
- [ ] Split between:
  - [ ] Domain-specific core tables (8-12)
  - [ ] Platform integration tables (12-18)
- [ ] Each table has:
  - [ ] `name` (e.g., `silver.mktg_campaigns_enriched`)
  - [ ] `description`
  - [ ] `transformationType` (CLEANSING, ENRICHMENT, MDM, AGGREGATION, ANALYTICAL)
  - [ ] `scdType` (SCD_TYPE_1 or SCD_TYPE_2)
  - [ ] `key_fields` array (for relationship detection)
  - [ ] **`schema` object with 8-17 realistic columns** ⚠️ CRITICAL
  - [ ] `transformations` array (3-7 transformation steps)

**Gold Layer Requirements**:
- [ ] 25-35 total tables (dimensions + facts)
- [ ] Dimensions (12-20):
  - [ ] Each has `name`, `description`, `scdType`, `attributes` array (8-15 attributes)
- [ ] Facts (8-15):
  - [ ] Each has `name`, `description`, `factType`, `grain`, `measures` array (8-15 measures)
  - [ ] Fact types: TRANSACTION, PERIODIC_SNAPSHOT, ACCUMULATING_SNAPSHOT

**Metrics Catalog Requirements**:
- [ ] Top-level structure:
  - [ ] `description`
  - [ ] `totalMetrics` (e.g., 400)
  - [ ] `categories` array
- [ ] Each category has:
  - [ ] `name`
  - [ ] `description`
  - [ ] `totalMetrics` (category count, e.g., 50)
  - [ ] `metrics` array with 2-5 FULLY DETAILED sample metrics
- [ ] Each sample metric has:
  - [ ] `id` (e.g., MKT-CMP-001)
  - [ ] `name`
  - [ ] `description`
  - [ ] `category`
  - [ ] `subcategory`
  - [ ] `formula`
  - [ ] `businessLogic`
  - [ ] `dataType`
  - [ ] `unit`
  - [ ] `aggregation`
  - [ ] `granularity`
  - [ ] `sourceTables` array
  - [ ] `calculation` object (numerator, denominator, filters)
  - [ ] `businessDefinition`
  - [ ] `benchmarks` (optional)
- [ ] Sum of all category.totalMetrics = top-level totalMetrics

### Step 4: Register in Domain Registry

**File**: `client/lib/domain-registry.ts`

- [ ] Import statements added:
  ```typescript
  import {
    {domain}RetailBronzeLayer,
    {domain}RetailSilverLayer,
    {domain}RetailGoldLayer,
    {domain}RetailMetricsCatalog,
  } from "./retail/{domain}-retail-comprehensive";
  ```

- [ ] Registry entry added:
  ```typescript
  "{domain}-retail": {
    id: "{domain}-retail",
    bronze: {domain}RetailBronzeLayer as any,
    silver: {domain}RetailSilverLayer as any,
    gold: {domain}RetailGoldLayer as any,
    metrics: {
      categories: {domain}RetailMetricsCatalog.categories,
      totalMetrics: {domain}RetailMetricsCatalog.totalMetrics,
    },
  },
  ```

### Step 5: Register in Retail Domains Registry

**File**: `client/lib/retail-domains-registry.ts`

- [ ] Domain entry added to `retailBankingDomains` array with:
  - [ ] `id` (kebab-case)
  - [ ] `name` (Title Case with hyphen)
  - [ ] `description` (2-3 sentences)
  - [ ] `subDomains` array (8-15 sub-domains)
  - [ ] `keyEntities` array (7-15 entities)
  - [ ] `regulatoryContext` array (5-10 regulations)
  - [ ] `priority` (P0, P1, or P2)
  - [ ] `complexity` (High or Very High)
  - [ ] `businessValue` (Critical or High)
  - [ ] `dataSources` array (10-20 sources)
  - [ ] `keyMetricsCount` (matches catalog totalMetrics)
  - [ ] `tablesCount` object:
    - [ ] `bronze` (matches Bronze layer totalTables)
    - [ ] `silver` (matches Silver layer totalTables)
    - [ ] `gold` (matches Gold dimensions + facts)
  - [ ] `useCases` array (6-10 use cases)
  - [ ] `stakeholders` array (5-10 roles)
  - [ ] `icon` (emoji)
  - [ ] `dataQualityTier` (Tier 1 or Tier 2)
  - [ ] `dataFlow` object (upstreamSources, downstreamConsumers, refreshFrequency)

### Step 6: Update DomainDetail.tsx (If Needed)

**File**: `client/pages/DomainDetail.tsx`

- [ ] Import metrics catalog if not already imported
- [ ] Add domain to metrics tab count logic (if using custom catalog structure):
  ```typescript
  : domainId === "{domain}-retail"
    ? {domain}RetailMetricsCatalog.totalMetrics
  ```

---

## VALIDATION CHECKLIST

### Step 7: Data Model Validation

**Run these checks manually or via scripts**:

#### Bronze Layer Validation
- [ ] All tables have `schema` object (not just metadata)
- [ ] Each schema has 10-25 attributes
- [ ] Primary keys identified (ends with `PRIMARY KEY`)
- [ ] Foreign keys identified (contains `FK to`)
- [ ] Data types are realistic (not all STRING)
- [ ] No generic attribute names (attr1, attr2, field1, etc.)
- [ ] `totalTables` count matches actual tables array length

#### Silver Layer Validation ⚠️ **MOST CRITICAL**
- [ ] **ALL tables have `schema` object with columns** (not just transformations)
- [ ] Each schema has 8-17 realistic attributes
- [ ] Each table has `key_fields` array for FK detection
- [ ] Foreign keys reference Bronze or Silver tables
- [ ] `totalTables` count matches actual tables array length
- [ ] No tables with single-attribute schemas

#### Gold Layer Validation
- [ ] Dimensions have 8-15 attributes each
- [ ] Facts have 8-15 measures each
- [ ] `totalDimensions` + `totalFacts` = `totalTables` in registry
- [ ] Fact tables reference dimension keys
- [ ] SCD_TYPE_2 dimensions have effective_date, expiration_date, is_current

#### Metrics Validation
- [ ] `totalMetrics` at top level = sum of all category `totalMetrics`
- [ ] Each category has 2-5 detailed sample metrics
- [ ] Sample metrics have ALL required fields (id, name, formula, etc.)
- [ ] `sourceTables` reference actual Silver/Gold tables
- [ ] Formulas are realistic and calculable

#### Registry Validation
- [ ] `keyMetricsCount` in retail-domains-registry matches `totalMetrics` in catalog
- [ ] `tablesCount.bronze` matches Bronze `totalTables`
- [ ] `tablesCount.silver` matches Silver `totalTables`
- [ ] `tablesCount.gold` matches Gold dimensions + facts
- [ ] Domain is in both `domain-registry.ts` AND `retail-domains-registry.ts`

### Step 8: UI Validation

**Navigate to domain detail page and verify**:

- [ ] **Overview Tab**:
  - [ ] Business Metrics shows correct count (e.g., 400)
  - [ ] Gold Tables shows correct count (e.g., 32)
  - [ ] Data Sources shows correct count (e.g., 17)
  - [ ] Sub-domains shows correct count (e.g., 13)

- [ ] **Metrics Tab**:
  - [ ] Tab label shows correct count: "Metrics (400)"
  - [ ] Table displays all flattened metrics
  - [ ] Export CSV/XLSX works

- [ ] **Data Sources Tab**:
  - [ ] Shows correct number of sources
  - [ ] Source systems are realistic

- [ ] **Data Models Tab**:
  - [ ] **Logical Model**: Shows entities with relationships
  - [ ] **Physical ERD - Bronze**: Shows all Bronze tables with columns
  - [ ] **Physical ERD - Silver**: 
    - [ ] Shows all Silver tables with FULL column lists (not just key_fields)
    - [ ] Shows relationships between Silver tables
    - [ ] Tables have 8-17 columns each (not 1-3)
  - [ ] **Physical ERD - Gold**: Shows dimensions and facts with relationships
  - [ ] Export to Draw.io/DbDiagram works

### Step 9: Relationship Validation

**Check ERD relationships**:

- [ ] Bronze-to-Silver relationships detected
- [ ] Silver-to-Silver relationships detected
- [ ] Silver-to-Gold relationships detected
- [ ] Banking-specific naming patterns recognized (_enriched, _current, _agg, etc.)
- [ ] FK detection works for domain-specific prefixes (mktg_, cust_, loan_, etc.)

### Step 10: Export Validation

**Test all export formats**:

- [ ] CSV export (metrics)
- [ ] XLSX export (metrics)
- [ ] Draw.io export (ERD)
- [ ] DbDiagram export (ERD)
- [ ] SQL DDL export (if implemented)

---

## COMMON ERRORS TO AVOID

### ❌ Error 1: Single-Attribute Tables
**Problem**: Silver tables only have `name`, `description`, `transformationType` without `schema`
**Fix**: Add full `schema` object with 8-17 columns to EVERY Silver table

### ❌ Error 2: Metric Count Mismatch
**Problem**: Overview shows 400 but tab shows 25
**Fix**: Ensure `totalMetrics` is used in tab label, not `metrics.length`

### ❌ Error 3: Missing key_fields
**Problem**: ERD shows no relationships in Silver layer
**Fix**: Add `key_fields` array to every Silver table

### ❌ Error 4: Table Count Mismatch
**Problem**: Registry says 26 tables but file has 18
**Fix**: Count ALL tables in the layer, update `totalTables`

### ❌ Error 5: Missing Domain in Registry
**Problem**: getDomainMetricsCount returns 0
**Fix**: Add domain to `domain-registry.ts` with proper imports and entry

### ❌ Error 6: Generic Attribute Names
**Problem**: Tables have `field1`, `field2`, `attribute_a`
**Fix**: Use realistic banking/business attribute names

### ❌ Error 7: Incomplete Sample Metrics
**Problem**: Metrics missing `formula`, `calculation`, or `sourceTables`
**Fix**: Use enterprise-grade metric template with ALL fields

---

## TESTING SCRIPT

### Quick Validation Commands

```bash
# Count tables in Bronze
grep -c "name: 'bronze\." client/lib/retail/{domain}-retail-comprehensive.ts

# Count tables in Silver
grep -c "name: 'silver\." client/lib/retail/{domain}-retail-comprehensive.ts

# Count dimensions in Gold
grep -c "name: 'gold\.dim_" client/lib/retail/{domain}-retail-comprehensive.ts

# Count facts in Gold
grep -c "name: 'gold\.fact_" client/lib/retail/{domain}-retail-comprehensive.ts

# Verify all Silver tables have schemas
grep -A 30 "name: 'silver\." client/lib/retail/{domain}-retail-comprehensive.ts | grep -c "schema:"

# Check for single-attribute tables
grep -A 20 "name: 'silver\." client/lib/retail/{domain}-retail-comprehensive.ts | grep -A 15 "schema:" | grep -c "^\s*},$"
```

---

## FINAL SIGN-OFF

### Domain: ________________

- [ ] All implementation steps completed
- [ ] All validation checks passed
- [ ] UI displays correct counts and data
- [ ] Exports work correctly
- [ ] No console errors
- [ ] Peer review completed (if applicable)

**Completed by**: ________________  
**Date**: ________________  
**Notes**: ________________

---

## REFERENCE: Enterprise-Grade Metric Template

```typescript
{
  id: 'DOM-CAT-001',
  name: 'Metric Name',
  description: 'Clear business description',
  category: 'Category Name',
  subcategory: 'Subcategory',
  
  formula: "SUM(column_name) / SUM(other_column)",
  businessLogic: 'Explanation of what this measures',
  
  dataType: 'DECIMAL',
  unit: 'percentage | currency | count | ratio',
  aggregation: 'SUM | AVG | COUNT | CALCULATED',
  granularity: 'Daily | Monthly | Quarterly',
  
  sourceTables: [
    'gold.fact_table_name',
    'silver.table_name',
  ],
  
  calculation: {
    numerator: "SUM(revenue)",
    denominator: "SUM(cost)",
    multiplier: 100,
    filters: "status = 'active'",
  },
  
  businessDefinition: 'Detailed business explanation',
  
  benchmarks: {
    industryAverage: '3.5%',
    topQuartile: '5.0%',
    target: '4.5%',
  },
  
  reportingExamples: [
    'Executive Dashboard',
    'Department Report',
  ],
  
  trendAnalysis: {
    alerts: [
      {
        condition: 'value < threshold',
        severity: 'Warning | Critical',
        description: 'Alert description',
      },
    ],
  },
}
```
