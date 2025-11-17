# Import Path Fixes - Domain Reorganization

## Issue
After reorganizing the Customer domain into layer-first structure (bronze/, silver/, gold/, shared/), the application failed to load with:
```
TypeError: Failed to fetch dynamically imported module
```

## Root Cause
Files were moved to new folders but import paths in lazy-loader.ts, registry.ts, and components were not updated.

---

## Files Fixed

### 1. `client/lib/domains/lazy-loader.ts` ✅

**Updated 9 import paths for Customer domain:**

| Function | Old Path | New Path |
|----------|----------|----------|
| loadDomainMetadata | `./customer/metadata` | `./customer/shared/metadata` |
| loadDomainGoldMetrics | `./customer/metadata` | `./customer/gold/metrics-catalog` |
| loadDomainSubDomains | `./customer/metadata` | `./customer/shared/metadata` |
| loadDomainUseCases | `./customer/use-cases` | `./customer/shared/use-cases` |
| loadDomainGlossary | `./customer/glossary` | `./customer/shared/glossary` |
| loadDomainSTTM | `./customer/sttm-mapping` | `./customer/silver/sttm-mapping` |
| loadDomainBronzeTables | `./customer/metadata` | `./customer/shared/metadata` |
| loadDomainSilverTables | `./customer/metadata` | `./customer/shared/metadata` |
| loadDomainGoldTables | `./customer/metadata` | `./customer/shared/metadata` |

**Status:** All customer domain imports now point to correct folders

---

### 2. `client/lib/domains/registry.ts` ✅

**Updated 2 import statements:**

```typescript
// BEFORE
import { customerSubDomains } from "./customer/metadata";
import { customerUseCases } from "./customer/use-cases";
import { customerGoldMetrics } from "./customer/gold-metrics";

// AFTER
import { customerSubDomains } from "./customer/shared/metadata";
import { customerUseCases } from "./customer/shared/use-cases";
import { customerGoldMetrics } from "./customer/gold/metrics-catalog";
```

**Status:** Registry now loads from correct new structure

---

### 3. `client/pages/PlatformBlueprintDomainOverview.tsx` ✅

**Updated ERD import:**

```typescript
// BEFORE
import { customerERDComplete } from "@/lib/domains/customer/erd-relationships";

// AFTER
import { customerERDComplete } from "@/lib/domains/customer/shared/erd-relationships";
```

**Status:** Component can now load ERD definitions

---

## New Folder Structure (Reminder)

```
client/lib/domains/customer/
├── bronze/          ← NEW
├── silver/          ← NEW
├── gold/            ← NEW
│   └── metrics-catalog.ts (was gold-metrics.ts)
├── shared/          ← NEW
│   ├── metadata.ts (moved from root)
│   ��── glossary.ts (moved from root)
│   ├── use-cases.ts (moved from root)
│   └── erd-relationships.ts (moved from root)
└── [old files preserved]
```

---

## Impact

✅ **Fixed**: Dynamic module loading errors  
✅ **Fixed**: PlatformBlueprintDomainOverview component  
✅ **Fixed**: Lazy loading for all Customer domain artifacts  
✅ **Preserved**: Deposits and Transactions still use old paths (not yet reorganized)  

---

## Next Steps

When applying this structure to Deposits and Transactions domains:

1. **Create the folders**: bronze/, silver/, gold/, shared/
2. **Move the files**: As done for Customer
3. **Update lazy-loader.ts**: Change import paths for those domains
4. **Update registry.ts**: Change import paths
5. **Test**: Verify no module loading errors

---

## Testing Checklist

- [x] Customer domain loads without errors
- [x] Metadata loads correctly
- [x] Gold metrics display
- [x] ERD diagrams render
- [x] STTM mappings accessible
- [x] Use cases and glossary load
- [ ] Deposits domain (not yet reorganized)
- [ ] Transactions domain (not yet reorganized)

---

**Status**: ✅ All import errors resolved  
**Date**: 2024  
**Files Modified**: 3 (lazy-loader.ts, registry.ts, PlatformBlueprintDomainOverview.tsx)
