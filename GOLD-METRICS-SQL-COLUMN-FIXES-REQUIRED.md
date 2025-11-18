# Gold Metrics SQL Column Name Fixes Required

## Summary
The Gold layer metrics SQL queries reference column names that don't exist in the Silver layer DDL. All three domain metrics files need corrections.

---

## 1. CUSTOMER DOMAIN FIXES
**File:** `client/lib/domains/customer/gold-metrics.ts`

### Required Replacements:
1. **`PRCS_DTE`** → **`BUSINESS_DATE`** (throughout entire file)
   - Reason: PRCS_DTE column doesn't exist in DIM_CUSTOMER_DEMOGRAPHY DDL
   - Actual column: BUSINESS_DATE

2. **`IS_CURRENT = TRUE`** → **`RECORD_FLAG = 'current'`**
   - Reason: IS_CURRENT column doesn't exist
   - Actual column: RECORD_FLAG with values 'current' or 'history'

3. **`IS_CURRENT = FALSE`** → **`RECORD_FLAG = 'history'`**
   - Same reason as above

4. **Keep `RECORD_STATUS`** (appears to be valid, but verify in actual data)

### Impact:
- Affects ~111 metrics
- Approximately 200+ occurrences to fix

---

## 2. DEPOSITS DOMAIN FIXES
**File:** `client/lib/domains/deposits/gold-metrics.ts`

### Required Replacements:
1. **`PRCS_DTE`** → **`BUSINESS_DATE`** (throughout entire file)
   - Reason: PRCS_DTE column doesn't exist in DIM_ACCOUNT DDL
   - Actual column: BUSINESS_DATE

2. **`IS_ACTIVE = TRUE`** → **`ACCOUNT_STATUS = 'ACTIVE'`**
   - Reason: IS_ACTIVE column doesn't exist
   - Actual column: ACCOUNT_STATUS

### Impact:
- Affects ~60 metrics
- Approximately 150+ occurrences to fix

---

## 3. TRANSACTIONS DOMAIN FIXES
**File:** `client/lib/domains/transactions/gold-metrics.ts`

### Required Replacements:

#### A. Hold Transactions (`FCT_DEPOSIT_HOLD_TRANSACTION`):
**Current (WRONG):**
```sql
SELECT TRANSACTION_DATE, TRANSACTION_ID, 'HOLD' as TXN_TYPE 
FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION
WHERE TRANSACTION_DATE = CURRENT_DATE()
```

**Fixed (CORRECT):**
```sql
SELECT HOLD_START_DATE as TRANSACTION_DATE, TRANSACTION_ID, 'HOLD' as TXN_TYPE 
FROM CORE_DEPOSIT.FCT_DEPOSIT_HOLD_TRANSACTION
WHERE HOLD_START_DATE = CURRENT_DATE()
```

**Reason:** FCT_DEPOSIT_HOLD_TRANSACTION doesn't have TRANSACTION_DATE column, uses HOLD_START_DATE

#### B. Maintenance Transactions (`FCT_DEPOSIT_MAINTENANCE_TRANSACTION`):
**Current (WRONG):**
```sql
SELECT TRANSACTION_DATE, TRANSACTION_ID, 'MAINTENANCE' as TXN_TYPE 
FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION
WHERE TRANSACTION_DATE = CURRENT_DATE()
  AND MAINTENANCE_STATUS = 'COMPLETED'
```

**Fixed (CORRECT):**
```sql
SELECT CHANGE_DATE as TRANSACTION_DATE, TRANSACTION_ID, 'MAINTENANCE' as TXN_TYPE 
FROM CORE_DEPOSIT.FCT_DEPOSIT_MAINTENANCE_TRANSACTION
WHERE CHANGE_DATE = CURRENT_DATE()
```

**Reasons:** 
- TRANSACTION_DATE doesn't exist → use CHANGE_DATE
- MAINTENANCE_STATUS doesn't exist → remove this condition

#### C. Stop Payment Transactions (`FCT_DEPOSIT_STOP_TRANSACTION`):
**Current (WRONG):**
```sql
SELECT TRANSACTION_DATE, STOP_AMOUNT as TRANSACTION_AMOUNT 
FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION
WHERE TRANSACTION_DATE = CURRENT_DATE()
```

**Fixed (CORRECT):**
```sql
SELECT STOP_ENTERED_DATE as TRANSACTION_DATE, STOP_AMOUNT as TRANSACTION_AMOUNT 
FROM CORE_DEPOSIT.FCT_DEPOSIT_STOP_TRANSACTION
WHERE STOP_ENTERED_DATE = CURRENT_DATE()
```

**Reason:** TRANSACTION_DATE doesn't exist → use STOP_ENTERED_DATE

#### D. Keep as-is (CORRECT):
- `FCT_DEPOSIT_ACCOUNT_TRANSACTION` - already uses correct column names
- `FCT_DEPOSIT_CERTIFICATE_TRANSACTION` - already uses correct column names

### Impact:
- Affects ~58 metrics
- Approximately 80+ occurrences to fix

---

## 4. ACTUAL SILVER DDL COLUMN NAMES (Reference)

### Customer Schema (`CORE_CUSTOMERS`):
```sql
-- DIM_CUSTOMER_DEMOGRAPHY
BUSINESS_DATE DATE
RECORD_DATE DATE
RECORD_FLAG VARCHAR -- 'current' or 'history'
EFFECTIVE_START_DATE DATE
EFFECTIVE_END_DATE DATE
```

### Deposits Schema (`CORE_DEPOSIT`):
```sql
-- DIM_ACCOUNT
ACCOUNT_STATUS VARCHAR -- 'ACTIVE', 'CLOSED', etc.
BUSINESS_DATE DATE
RECORD_DATE DATE
RECORD_FLAG VARCHAR -- 'current' or 'history'

-- FCT_DEPOSIT_DAILY_BALANCE
BALANCE_DATE DATE
```

### Transactions Schema (`CORE_DEPOSIT`):
```sql
-- FCT_DEPOSIT_ACCOUNT_TRANSACTION
TRANSACTION_DATE DATE ✓
TRANSACTION_STATUS VARCHAR ✓

-- FCT_DEPOSIT_CERTIFICATE_TRANSACTION  
TRANSACTION_DATE DATE ✓
TRANSACTION_STATUS VARCHAR ✓

-- FCT_DEPOSIT_HOLD_TRANSACTION
HOLD_START_DATE DATE (not TRANSACTION_DATE)
HOLD_RELEASE_DATE DATE
HOLD_STATUS VARCHAR ✓

-- FCT_DEPOSIT_MAINTENANCE_TRANSACTION
CHANGE_DATE DATE (not TRANSACTION_DATE)
-- NO MAINTENANCE_STATUS column

-- FCT_DEPOSIT_STOP_TRANSACTION
STOP_ENTERED_DATE DATE (not TRANSACTION_DATE)
STOP_EXPIRATION_DATE DATE
STOP_STATUS VARCHAR ✓
```

---

## 5. VERIFICATION CHECKLIST

After fixes are applied, verify:

✅ All `PRCS_DTE` replaced with `BUSINESS_DATE`
✅ All `IS_CURRENT` replaced with `RECORD_FLAG`
✅ All `IS_ACTIVE` replaced with `ACCOUNT_STATUS`
✅ Hold transaction metrics use `HOLD_START_DATE`
✅ Maintenance transaction metrics use `CHANGE_DATE`
✅ Stop transaction metrics use `STOP_ENTERED_DATE`
✅ No references to `MAINTENANCE_STATUS` remain
✅ All SQL queries reference only columns that exist in Silver DDL

---

## 6. RECOMMENDED FIX APPROACH

Due to the large number of changes required, I recommend:

1. **Option A:** Use global search/replace in your IDE:
   - Search for each incorrect column name
   - Replace with correct column name
   - Review changes before committing

2. **Option B:** Let me apply fixes one domain at a time using Edit tool:
   - Start with Transactions (smallest file, ~58 metrics)
   - Then Deposits (~60 metrics)
   - Then Customer (~111 metrics)

3. **Option C:** I can create corrected versions of all three files using Write tool
   - Fastest approach
   - Requires re-writing entire files

---

**Total Fixes Required: ~430+ column name corrections across 229 metrics**
