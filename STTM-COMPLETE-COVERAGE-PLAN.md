# COMPLETE STTM COVERAGE PLAN
## Based on Excel File Analysis

## Executive Summary

**Excel File Analysis:**
- **18 Silver Layer Tables** across 2 schemas (CORE_CUSTOMERS, CORE_DEPOSIT)
- **~468-700 columns** (counting visible rows, user confirmed ~700 total)
- **2 Source Systems**: FIS-ADS and FIS-DDW
- **Expected Coverage**: 100% of all columns mapped

**Current Implementation Gap:**
- ✅ Implemented: 9 tables, ~259 columns
- ❌ Missing: 9 tables, ~441 columns
- **Coverage**: ~37% complete

---

## Detailed Table Inventory from Excel

### CORE_CUSTOMERS Schema (8 Tables, ~230 Columns)

| # | Table Name | Columns | Status | Priority |
|---|------------|---------|--------|----------|
| 1 | **BRG_CUST_TO_ACCT_RELATIONSHIP** | 19 | ✅ Mapping created | P0 |
| 2 | **DIM_CUSTOMER_DEMOGRAPHY** | 20 | ⚠️ Partial (in old code) | P0 |
| 3 | **DIM_CUSTOMER_IDENTIFER** | 32 | ⚠️ Partial (in old code) | P0 |
| 4 | **DIM_CUSTOMER_NAME** | 19 | ❌ Missing | P1 |
| 5 | **DIM_CUSTOMER_ATTRIBUTE** | 84 | ❌ Missing | P1 |
| 6 | **DIM_CUSTOMER_CONTACT** | 18 | ❌ Missing | P1 |
| 7 | **DIM_CUSTOMER_EMAIL** | 14 | ⚠️ Partial (in old code) | P0 |
| 8 | **DIM_CUSTOMER_ADDRESS** | 24 | ❌ Missing | P1 |

**Customer Subtotal**: ~230 columns

### CORE_DEPOSIT Schema (10 Tables, ~470 Columns)

| # | Table Name | Columns | Status | Priority |
|---|------------|---------|--------|----------|
| 9 | **DIM_DEPOSIT** | 72 | ❌ Missing (large table!) | P0 |
| 10 | **DIM_ACCOUNT** | 37 | ⚠️ Partial (in old code) | P0 |
| 11 | **FCT_DEPOSIT_HOLD_TRANSACTION** | 21 | ⚠️ Partial (in old code) | P2 |
| 12 | **FCT_DEPOSIT_MAINTENANCE_TRANSACTION** | 15 | ⚠️ Partial (in old code) | P2 |
| 13 | **FCT_DEPOSIT_CERTIFICATE_TRANSACTION** | 24 | ⚠️ Partial (in old code) | P0 |
| 14 | **FCT_DEPOSIT_DAILY_BALANCE** | 21 | ⚠️ Partial (in old code) | P0 |
| 15 | **FCT_DEPOSIT_STOP_TRANSACTION** | 25 | ⚠️ Partial (in old code) | P2 |
| 16 | **FCT_DEPOSIT_ACCOUNT_TRANSACTION** | 26 | ❌ Missing | P1 |
| 17 | **DIM_ACCOUNT_PACKAGE** | 19 | ❌ Missing | P2 |
| 18 | **DIM_DEBIT_CARD** | 18 | ❌ Missing | P2 |

**Deposit Subtotal**: ~278 columns visible (likely more in full dataset)

---

## Key Differences vs Current Implementation

### Schema Naming
- **Excel**: Uses `CORE_CUSTOMERS` and `CORE_DEPOSIT`
- **Current Code**: Uses generic `silver` schema
- **Action**: Update schema names to match Excel spec

### Table Names
- **Excel**: Specific dimension and fact table names (DIM_*, FCT_*, BRG_*)
- **Current Code**: Generic names like `customer_master_golden`
- **Action**: Rename tables to match Excel naming convention

### Source Systems
- **Excel**: Two sources - FIS-ADS and FIS-DDW (both need mapping)
- **Current Code**: Only FIS-ADS mappings
- **Action**: Add FIS-DDW source mappings

---

## Missing Tables Analysis

### High-Impact Missing Tables (P0)

1. **DIM_DEPOSIT** (72 columns!)
   - Largest deposit table
   - Contains: account details, TD info, rates, officers, user codes, cost center
   - Critical for deposit analytics

2. **DIM_CUSTOMER_ATTRIBUTE** (84 columns!)
   - Largest customer table  
   - Contains: demographics, dates, officers, 20 custom code fields
   - Critical for customer segmentation

### Medium-Impact Missing Tables (P1)

3. **DIM_CUSTOMER_NAME** (19 columns)
   - Name components (first, middle, last, multiple fields)
   
4. **DIM_CUSTOMER_ADDRESS** (24 columns)
   - Address lines, city, state, ZIP, country, address type
   
5. **DIM_CUSTOMER_CONTACT** (18 columns)
   - Phone numbers (primary, secondary, fax)
   
6. **FCT_DEPOSIT_ACCOUNT_TRANSACTION** (26 columns)
   - General account transactions (all types)

### Lower-Impact Missing Tables (P2)

7. **DIM_ACCOUNT_PACKAGE** (19 columns)
   - Account packages, tiers, enrollment

8. **DIM_DEBIT_CARD** (18 columns)
   - Debit card details, expiry, status

---

## Column Type Distribution

### Standard Column Patterns (Repeated across tables)

**System/Audit Columns** (consistent across all tables):
- `INSERT_BY` - User who inserted
- `INSERT_DT` - Insert timestamp  
- `LAST_MODIFIED_BY` - User who modified
- `LAST_MODIFIED_DT` - Modification timestamp

**SCD Type 2 Columns** (for dimension tables):
- `EFFECTIVE_START_DATE` - SCD2 validity start
- `EFFECTIVE_END_DATE` - SCD2 validity end (9999-12-31 for current)
- `RECORD_FLAG` - Active/Inactive (A/I)
- `ROW_HASH` - Change detection hash

**Surrogate & Foreign Keys**:
- `*_SK` - Surrogate keys (auto-generated)
- `*_FK` - Foreign keys (lookup from other dimensions)

**Business Keys**:
- `CUSTOMER_NUMBER`
- `ACCOUNT_NUMBER`
- `ACCOUNT_NUMBER_OPERATIONAL`

---

## Source System Mapping Patterns

### FIS-ADS Source Tables (Primary)

Most common source tables:
- `TB_CI_OZ6_CUST_ARD` - Customer master
- `TB_CI_OZ5_CUST_NAAD_ARD` - Customer names & addresses
- `TB_CI_OZ4_CUST_ID_ARD` - Customer identifiers
- `TB_CI_OZ3_EMAIL_ARD` - Customer emails
- `TB_CI_OZW_CUST_ACCT_RLT_ARD` - Customer-account relationships
- `TB_DP_OZZ_ACCT_ARD` - Deposit account master
- `TB_DP_OZX_BAL_ARD` - Account balances
- `TB_DP_SZ9_DP_ACCT_D_FACT` - Daily account facts
- `DP_OZO_MNY_TXN_ARD` - Money transactions
- `TB_DP_OZU_MAINT_ARD` - Maintenance transactions
- `TB_DP_OZQ_STP_ARD` - Stop payments
- `TB_DP_OZV_HLD_ARD` - Holds
- `TB_DP_OZP_TD_ARD` - Time deposits

### FIS-DDW Source Tables (Secondary)

Alternative data warehouse source:
- `TB_CI_DZY_C2_CUST_SCD_DIM` - Customer SCD dimension
- `TB_CI_DZL_CUST_DOC_ID_DIM` - Customer document IDs
- `TB_DP_DYY_C2_ACCT_SCD_DIM` - Account SCD dimension
- `TB_C2_DYA_ACCT_GRP_SCD_DIM` - Account group SCD
- `TB_C2_DZ0_OFFCR_DIM` - Officer dimension
- `TB_C2_DZY_POS_DIM` - Position/branch dimension
- `TB_DP_DZ0_TXN_DIM` - Transaction dimension
- `TB_DP_DZ9_FIN_TXN_FACT` - Financial transaction fact

---

## Implementation Plan

### Phase 1: Core Customer Tables (P0) - 52 columns

✅ **Already Created:**
1. BRG_CUST_TO_ACCT_RELATIONSHIP - 19 columns

**To Create:**
2. DIM_CUSTOMER_DEMOGRAPHY - 20 columns
3. DIM_CUSTOMER_IDENTIFER - 32 columns (with all ID types)
4. DIM_CUSTOMER_EMAIL - 14 columns

**Estimated Effort**: 2-3 hours

### Phase 2: Core Deposit Tables (P0) - 196 columns

**To Create:**
5. DIM_DEPOSIT - 72 columns (LARGEST TABLE!)
6. DIM_ACCOUNT - 37 columns
7. FCT_DEPOSIT_CERTIFICATE_TRANSACTION - 24 columns
8. FCT_DEPOSIT_DAILY_BALANCE - 21 columns

**Estimated Effort**: 4-5 hours

### Phase 3: Extended Customer Tables (P1) - 145 columns

**To Create:**
9. DIM_CUSTOMER_ATTRIBUTE - 84 columns (20 CUST_CODE fields!)
10. DIM_CUSTOMER_NAME - 19 columns
11. DIM_CUSTOMER_ADDRESS - 24 columns
12. DIM_CUSTOMER_CONTACT - 18 columns

**Estimated Effort**: 3-4 hours

### Phase 4: Extended Deposit Tables (P1) - 26 columns

**To Create:**
13. FCT_DEPOSIT_ACCOUNT_TRANSACTION - 26 columns

**Estimated Effort**: 1 hour

### Phase 5: Supporting Tables (P2) - 98 columns

**To Create:**
14. FCT_DEPOSIT_HOLD_TRANSACTION - 21 columns
15. FCT_DEPOSIT_MAINTENANCE_TRANSACTION - 15 columns
16. FCT_DEPOSIT_STOP_TRANSACTION - 25 columns
17. DIM_ACCOUNT_PACKAGE - 19 columns
18. DIM_DEBIT_CARD - 18 columns

**Estimated Effort**: 2-3 hours

---

## Total Effort Estimate

- **Total Tables**: 18
- **Total Columns**: ~700
- **Development Time**: 12-18 hours
- **Testing & Validation**: 4-6 hours
- **Total Project Time**: ~16-24 hours

---

## Recommended Approach

### Option 1: Auto-Generate from Excel (RECOMMENDED)

1. Parse the Excel file programmatically
2. Generate TypeScript STTM files for all 18 tables
3. Validate mappings against silver layer definitions
4. Update UI to display all tables

**Pros**: Fast, accurate, complete coverage
**Cons**: Requires script development
**Time**: 4-6 hours

### Option 2: Manual Table-by-Table

1. Create STTM files for each table manually
2. Follow Excel specifications exactly
3. Test each table individually

**Pros**: Manual validation at each step
**Cons**: Time-consuming, error-prone
**Time**: 16-24 hours

---

## Next Steps

1. **Confirm Approach**: Choose auto-generation or manual approach
2. **Phase 1 Execution**: Start with P0 tables (DIM_DEPOSIT, DIM_CUSTOMER_ATTRIBUTE)
3. **UI Updates**: Modify STTM view to show correct table/column counts
4. **Validation**: Cross-reference generated mappings with Excel source
5. **Documentation**: Update all STTM documentation with final counts

---

## Success Criteria

✅ All 18 tables have complete STTM TypeScript files  
✅ All ~700 columns mapped (100% coverage)  
✅ Both FIS-ADS and FIS-DDW sources included  
✅ Schema names match Excel (CORE_CUSTOMERS, CORE_DEPOSIT)  
✅ Table names match Excel (DIM_*, FCT_*, BRG_*)  
✅ UI displays correct counts (18 tables, 700 columns)  
✅ All mapping types included (Direct, Derived, System, SCD2)  
