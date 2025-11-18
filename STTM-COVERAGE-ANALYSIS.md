# STTM Coverage Analysis Summary

## Executive Summary

**User Expectation:** 700 columns across 19 tables  
**Current Implementation:** ~259 columns across 9 tables  
**Gap:** ~441 columns | 10 tables

## Current Silver Layer Tables

### Customer Domain (3 tables, 87 columns)

1. **customer_master_golden** - 63 columns
   - Surrogate key, natural keys, identity, demographics, contact info, address, identification, business/employment, relationship management, status, SCD2, data quality, audit
   
2. **customer_relationships** - 14 columns  
   - Customer-to-customer and customer-to-account relationships
   
3. **customer_contact_history** - 10 columns
   - Longitudinal history of contact information changes

### Deposits Domain (3 tables, 82 columns)

1. **deposit_account_master_golden** - 40 columns
   - Account master data with SCD Type 2
   
2. **deposit_account_daily_balances** - 22 columns
   - Daily balance snapshots
   
3. **deposit_transaction_detail** - 20 columns
   - Standardized deposit transaction detail

### Transactions Domain (3 tables, 90 columns)

1. **transaction_detail_enriched** - 58 columns
   - Complete transaction detail with enrichment, categorization, compliance
   
2. **transaction_daily_aggregates** - 18 columns
   - Daily transaction aggregates by type
   
3. **transaction_counterparty_summary** - 14 columns
   - Monthly counterparty aggregates

## Current STTM Mapping Coverage

### Customer Domain STTM
- **Total Mappings:** ~93 (includes direct + derived + system + SCD2)
- **Coverage:** 107% (exceeds column count due to mapping multiple sources to single target)
- **Mapping Types:**
  - Direct: ~50 mappings
  - Derived: ~12 mappings
  - System: ~7 mappings
  - SCD2: ~5 mappings

### Deposits Domain STTM
- **Total Mappings:** ~82
- **Coverage:** 100%
- **Mapping Types:**
  - Direct: ~52 mappings
  - Derived: ~10 mappings
  - System: ~4 mappings
  - SCD2: ~3 mappings
  - Transactions: ~1 mapping

### Transactions Domain STTM
- **Total Mappings:** ~84
- **Coverage:** 93%
- **Mapping Types:**
  - Direct: ~45 mappings
  - Derived: ~10 mappings
  - System: ~3 mappings
  - Compliance: ~7 mappings
  - Fraud: ~3 mappings
  - Balance: ~3 mappings
  - Aggregations: ~3 mappings

## Gap Analysis

### Potential Reasons for Discrepancy

1. **Simplified Silver Layer Definitions**
   - The current silver-layer.ts files may be simplified/example versions
   - Full production schemas may have significantly more columns

2. **Missing Tables**
   - Expected 19 tables, currently have 9 tables
   - 10 tables missing:
     - Additional bridge tables?
     - Historical/archive tables?
     - Reference/lookup tables?
     - Additional transaction fact tables?

3. **Bronze Layer vs Silver Layer**
   - Bronze layer may have more granular column mappings
   - 1:1 mappings from FIS source tables
   - Silver layer consolidates/derives columns

4. **External STTM File**
   - User referenced "STTM file shared earlier"
   - This external file may contain comprehensive column inventory
   - Current code may be subset for demonstration

## Recommended Actions

1. **Obtain Original STTM File**
   - Get the Excel/CSV file with 700 columns × 19 tables
   - Use as source of truth for complete mapping

2. **Audit FIS Source Tables**
   - Review all FIS-ADS source tables
   - Count all source columns
   - Ensure every source column has target mapping

3. **Expand Silver Layer Definitions**
   - Add missing 10 tables to silver layer
   - Add missing ~441 columns across all tables
   - Ensure all bronze → silver transformations documented

4. **Generate Complete STTM Mappings**
   - Create STTM mapping for every column in every table
   - Include all mapping types: Direct, Derived, System, SCD2, Compliance
   - Achieve 100% coverage (700/700 columns mapped)

## Current STTM Mapping Files

- `client/lib/domains/customer/sttm-mapping-complete.ts` - 93 mappings
- `client/lib/domains/deposits/sttm-mapping-complete.ts` - 82 mappings  
- `client/lib/domains/transactions/sttm-mapping-complete.ts` - 84 mappings

## Next Steps

To achieve 100% STTM coverage of 700 columns across 19 tables:

1. **Identify Missing Tables** - Determine which 10 tables are not yet defined
2. **Expand Column Definitions** - Add missing columns to existing tables  
3. **Create Missing Mappings** - Generate STTM entries for all 441 missing columns
4. **Update Lazy Loader** - Ensure all tables/mappings accessible via UI
5. **Validate Against Source** - Cross-reference with original STTM file
