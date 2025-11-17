# SOURCE-TO-TARGET MAPPING - TABLE VIEW

**Status**: ✅ COMPLETE  
**Date**: 2025-01-15  
**Feature**: Comprehensive Tabular View of Source-to-Target Mappings

---

## 🎯 OVERVIEW

Added a new **Mapping Table** view to the Source-to-Target Mapping framework that displays all column-level mappings in a clear, comprehensive tabular format - perfect for developers, analysts, and architects who need a quick reference.

---

## 📊 TABLE STRUCTURE

### Column Groups (11 Total Columns)

#### **Source Columns (3 columns)**

1. **System** - Source system code (e.g., `FIS-ACH-TRK`, `FICO-FRAUD`)
2. **Schema** - Source schema/table/file name
3. **Field** - Source field name + data type

#### **Bronze Layer Columns (2 columns)** 🟡

4. **Table** - Bronze table name (e.g., `bronze.fis_ach_tracker_transactions`)
5. **Column** - Bronze column name + data type

#### **Silver Layer Columns (2 columns)** 🔵

6. **Table** - Silver table name (e.g., `silver.fis_ach_tracker_transactions_cleansed`)
7. **Column** - Silver column name + data type

#### **Gold Layer Columns (2 columns)** 🟢

8. **Table** - Gold table name (e.g., `gold.fact_ach_tracker_transactions`)
9. **Column** - Gold column name + data type

#### **Transformation Columns (2 columns)**

10. **Type** - Transformation type badge (DIRECT_MAPPING, ENCRYPTION, LOOKUP, etc.)
11. **Business Definition** - Description + data quality rules (first 2 rules shown)

---

## 🎨 VISUAL DESIGN

### Header Design

- **Two-row header**:
  - Row 1: Grouped headers (Source | Bronze | Silver | Gold | Transformation)
  - Row 2: Column headers for each field
- **Color Coding**:
  - Source: Grey background
  - Bronze: Amber background (`bg-amber-50`)
  - Silver: Blue background (`bg-blue-50`)
  - Gold: Green background (`bg-green-50`)
  - Transformation: Grey background

### Table Features

- **Alternating row hover**: Highlights row on hover (`hover:bg-slate-50`)
- **Column borders**: Vertical borders between major sections
- **Cell alignment**: Top-aligned for readability
- **Responsive scrolling**: Horizontal scroll for narrow screens
- **Font styling**: Monospace for code elements (tables, columns, data types)

### Color-Coded Cells

- **Bronze cells**: Light amber background (`bg-amber-50/50`)
- **Silver cells**: Light blue background (`bg-blue-50/50`)
- **Gold cells**: Light green background (`bg-green-50/50`)
- **N/A indicators**: Italicized grey text for missing values

---

## 🔍 EXAMPLE TABLE ROW

| Source System | Source Schema       | Source Field                          | Bronze Table                        | Bronze Column                         | Silver Table                                 | Silver Column                         | Gold Table                         | Gold Column                            | Type           | Business Definition                                                                                                                        |
| ------------- | ------------------- | ------------------------------------- | ----------------------------------- | ------------------------------------- | -------------------------------------------- | ------------------------------------- | ---------------------------------- | -------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `FIS-ACH-TRK` | ACH_TRANSACTION_LOG | **tracker_transaction_id**<br/>STRING | bronze.fis_ach_tracker_transactions | **tracker_transaction_id**<br/>STRING | silver.fis_ach_tracker_transactions_cleansed | **tracker_transaction_id**<br/>STRING | gold.fact_ach_tracker_transactions | **tracker_transaction_key**<br/>BIGINT | DIRECT_MAPPING | Unique identifier for ACH transaction in FIS Tracker system<br/>**Rules:**<br/>✓ NOT NULL<br/>✓ UNIQUE per source system<br/>+2 more rules |

---

## 📈 TABLE SUMMARY SECTION

Below the table, a summary panel displays:

### Statistics (4 metrics)

1. **Total Mappings**: Count of displayed mappings
2. **Source Systems**: Number of unique source systems
3. **Transformation Types**: Number of unique transformation types
4. **Export CSV**: Button to download the table as CSV

### Example

```
┌─────────────────┬──────────────────┬────────────────────────┬─────────────┐
│ Total Mappings  │ Source Systems   │ Transformation Types   │ Export CSV  │
│       9         │        3         │          6             │   [Button]  │
└─────────────────┴──────────────────┴────────────────────────┴─────────────┘
```

---

## 🌈 LAYER LEGEND

At the bottom of the table, a visual legend explains each layer:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Layer Legend                                   │
├─────��──────────────────────────────────────────────────────────────────┤
│ ⬜ Source:  Original system data                                       │
│ 🟨 Bronze:  Raw ingestion (minimal transformation)                     │
│ 🟦 Silver:  Cleansed & conformed (SCD Type 2)                         │
│ 🟩 Gold:    Business-ready analytics layer                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔎 SEARCH & FILTER FEATURES

All search and filter capabilities work seamlessly with the table view:

### Global Search

- Searches across:
  - Source field names
  - Bronze/Silver/Gold column names
  - Table names
  - Business definitions
- Real-time filtering as you type

### Filters

1. **Source System Filter**: FIS-ACH-TRK, FICO-FRAUD, EXP-CREDIT, or All
2. **Transformation Type Filter**: DIRECT_MAPPING, ENCRYPTION, LOOKUP, etc., or All
3. **Layer Filter**: Bronze, Silver, Gold, or All Layers

### Results Counter

- "Showing X of Y mappings" displays at the top of the search section

---

## 💾 CSV EXPORT

### Export Format

Clicking "Export CSV" downloads a file with these columns:

```csv
Source System,Source Schema,Source Field,Source Data Type,Bronze Table,Bronze Column,Bronze Data Type,Silver Table,Silver Column,Silver Data Type,Gold Table,Gold Column,Gold Data Type,Transformation Type,Business Definition,Data Quality Rules
"FIS-ACH-TRK","ACH_TRANSACTION_LOG","tracker_transaction_id","STRING","bronze.fis_ach_tracker_transactions","tracker_transaction_id","STRING","silver.fis_ach_tracker_transactions_cleansed","tracker_transaction_id","STRING","gold.fact_ach_tracker_transactions","tracker_transaction_key","BIGINT","DIRECT_MAPPING","Unique identifier for ACH transaction in FIS Tracker system","NOT NULL; UNIQUE per source system; Pattern: FIS-ACH-YYYYMMDD-########; Length <= 50 characters"
```

### CSV Features

- **16 columns** with complete mapping data
- **Quoted values** to handle commas and special characters
- **Data quality rules** concatenated with semicolons
- **Empty strings** for N/A values (Silver/Gold when not populated)
- **Respects filters**: Only exports filtered/searched results

---

## 🎯 USE CASES

### Use Case 1: ETL Developer Quick Reference

**Scenario**: Developer needs to know which Bronze table a source field maps to

**Steps**:

1. Click **Mapping Table** view
2. Search for source field name (e.g., "transaction_amount")
3. Scan the row to see Bronze table and column
4. Note the data type for DDL creation

### Use Case 2: Data Analyst Understanding Transformations

**Scenario**: Analyst needs to know how data changes from Source to Gold

**Steps**:

1. Click **Mapping Table** view
2. Find the field of interest
3. Read across the row: Source → Bronze → Silver → Gold
4. Check Transformation Type column to understand how data changes
5. Read Business Definition for context

### Use Case 3: Architect Creating Documentation

**Scenario**: Architect needs comprehensive mapping documentation for all FIS fields

**Steps**:

1. Click **Mapping Table** view
2. Filter by Source System: "FIS-ACH-TRK"
3. Click **Export CSV** button
4. Open CSV in Excel/Google Sheets
5. Format and include in architecture documentation

### Use Case 4: Data Steward Auditing PII Handling

**Scenario**: Data steward needs to verify all encrypted fields

**Steps**:

1. Click **Mapping Table** view
2. Filter by Transformation Type: "ENCRYPTION"
3. Review all encrypted fields in one view
4. Check Bronze/Silver/Gold to ensure proper handling
5. Export CSV for compliance records

### Use Case 5: Onboarding New Team Member

**Scenario**: New developer needs to understand the full data flow

**Steps**:

1. Click **Mapping Table** view
2. Browse the table to see all mappings at once
3. Understand naming conventions (bronze._, silver._, gold.\*)
4. Note transformation patterns (DIRECT_MAPPING vs ENCRYPTION vs LOOKUP)
5. Export CSV as reference guide

---

## 🔧 IMPLEMENTATION DETAILS

### State Management

```typescript
const [viewMode, setViewMode] = useState<
  "systems" | "mappings" | "lineage" | "schemas" | "table"
>("systems");
```

### View Toggle

```tsx
<Button
  variant={viewMode === "table" ? "default" : "outline"}
  onClick={() => setViewMode("table")}
>
  <TableIcon className="h-4 w-4 mr-2" />
  Mapping Table
</Button>
```

### Table Structure

```tsx
<table className="w-full text-sm">
  <thead className="bg-slate-100 border-b-2 border-slate-300">
    {/* Two-row header with grouped columns */}
  </thead>
  <tbody>
    {filteredMappings.map((mapping, idx) => (
      <tr key={idx} className="border-b hover:bg-slate-50">
        {/* 11 columns with color-coded cells */}
      </tr>
    ))}
  </tbody>
</table>
```

### CSV Export Logic

```typescript
const exportMappings = () => {
  if (viewMode === "table") {
    // Generate CSV with 16 columns
    const csvContent = [headers, ...rows].join("\n");
    // Download as .csv file
  } else {
    // Export as JSON for other views
  }
};
```

---

## 📊 SAMPLE DATA

### FIS ACH Tracker Mappings (5 mappings)

| #   | Source Field            | Bronze Column                     | Silver Column                  | Gold Column             | Type            |
| --- | ----------------------- | --------------------------------- | ------------------------------ | ----------------------- | --------------- |
| 1   | tracker_transaction_id  | tracker_transaction_id            | tracker_transaction_id         | tracker_transaction_key | DIRECT_MAPPING  |
| 2   | transaction_amount      | transaction_amount                | transaction_amount             | transaction_amount      | TYPE_CONVERSION |
| 3   | current_status          | current_status                    | ach_status_code                | ach_status_code         | STANDARDIZATION |
| 4   | return_code             | return_code                       | return_code                    | return_code             | LOOKUP          |
| 5   | receiver_account_number | receiver_account_number_encrypted | receiver_account_number_masked | receiver_account_key    | ENCRYPTION      |

### FICO Fraud Mappings (2 mappings)

| #   | Source Field       | Bronze Column      | Silver Column               | Gold Column | Type           |
| --- | ------------------ | ------------------ | --------------------------- | ----------- | -------------- |
| 1   | fraud_score        | fraud_score        | fraud_score                 | fraud_score | DIRECT_MAPPING |
| 2   | fraud_reason_codes | fraud_reason_codes | fraud_reason_codes_enriched | reason_code | ENRICHMENT     |

### Experian Credit Mappings (2 mappings)

| #   | Source Field            | Bronze Column           | Silver Column          | Gold Column      | Type           |
| --- | ----------------------- | ----------------------- | ---------------------- | ---------------- | -------------- |
| 1   | fico_score_8            | fico_score_8            | fico_score             | credit_score     | DIRECT_MAPPING |
| 2   | credit_utilization_rate | credit_utilization_rate | credit_utilization_pct | utilization_rate | DERIVED        |

---

## 🎨 VISUAL COMPARISON

### Before: Card View

```
┌──────────────────────────────────────────────────────────────┐
│ FIS-ACH-TRK → tracker_transaction_id → Bronze → Silver → Gold│
│                                                               │
│ Transformation Type: DIRECT_MAPPING                          │
│ Business Definition: Unique identifier...                    │
│                                                               │
│ ┌───────────────┬───────────────┬───────────────┐          │
│ │ Bronze Layer  │ Silver Layer  │ Gold Layer    │          │
│ │ bronze.fis... │ silver.fis... │ gold.fact...  │          │
│ └───────────────┴─���─────────────┴───────────────┘          │
│                                                               │
│ Transformation Logic: Bronze: Direct copy...                 │
└──────────────────────────────────────────────────────────────┘
```

### After: Table View

```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┐
│ Source  │ Source  │ Source  │ Bronze  │ Bronze  │ Silver  │ Silver  │  Gold   │  Gold   │Transform │Business │
│ System  │ Schema  │  Field  │  Table  │ Column  │  Table  │ Column  │  Table  │ Column  │   Type   │  Def    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┤
│FIS-ACH  │ACH_LOG  │tracker_ │bronze.  │tracker_ │silver.  │tracker_ │gold.    │tracker_ │DIRECT_   │Unique   │
│-TRK     │         │trans... │fis...   │trans... │fis...   │trans... │fact...  │trans... │MAPPING   │id...    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┤
│FIS-ACH  │ACH_LOG  │trans_   │bronze.  │trans_   │silver.  │trans_   │gold.    │trans_   │TYPE_     │Dollar   │
│-TRK     │         │amount   │fis...   │amount   │fis...   │amount   │fact...  │amount   │CONV      │amount...│
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┘
```

**Benefit**: See 9 mappings at once instead of scrolling through cards!

---

## ✅ FEATURES SUMMARY

### Table View Features

- ✅ **11 columns** covering Source → Bronze → Silver → Gold → Transformation
- ✅ **Color-coded cells** (grey, amber, blue, green)
- ✅ **Data type display** under each field/column name
- ✅ **Business definition** with first 2 data quality rules
- ✅ **N/A indicators** for missing Silver/Gold values
- ✅ **Hover highlights** for easy row scanning
- ✅ **Responsive scrolling** for narrow screens
- ✅ **Monospace fonts** for code elements
- ✅ **Summary statistics** below table
- ✅ **Layer legend** with visual indicators
- ✅ **CSV export** with 16 columns
- ✅ **Search integration** - filters table in real-time
- ✅ **Filter integration** - all filters work seamlessly
- ✅ **No results state** - helpful message when no matches

---

## 🚀 HOW TO ACCESS

### Navigation Path

1. Go to `/domains` page
2. Click **"Data Sources"** main tab
3. Click **"Source-to-Target Mapping"** sub-tab
4. Click **"Mapping Table"** button (TableIcon)

### View Switcher Buttons

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Source     │   Source     │   Mapping    │    Field     │     Data     │
│   Systems    │   Schemas    │    Table     │   Mappings   │   Lineage    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
                                    ↑
                               NEW VIEW!
```

---

## 📈 METRICS

### Table Statistics

- **Total Rows**: 9 (FIS: 5, FICO: 2, Experian: 2)
- **Total Columns**: 11 visible, 16 in CSV export
- **Source Systems**: 3 (FIS-ACH-TRK, FICO-FRAUD, EXP-CREDIT)
- **Transformation Types**: 6 (DIRECT_MAPPING, TYPE_CONVERSION, STANDARDIZATION, LOOKUP, ENCRYPTION, ENRICHMENT, DERIVED)
- **Data Quality Rules**: 50+ across all mappings

### Component Size

- **Lines Added**: ~150 lines for table view
- **Export Function**: Enhanced to support CSV
- **View Modes**: Increased from 4 to 5

---

## 💡 BENEFITS

### For Developers

- **Quick Reference**: See all mappings in one scrollable table
- **Copy-Paste Ready**: Table structure → easy to copy into documentation
- **CSV Export**: Import into Excel for analysis

### For Analysts

- **Comprehensive View**: Understand entire data flow at a glance
- **Search & Filter**: Find specific mappings instantly
- **Business Context**: See definitions and rules inline

### For Architects

- **Documentation**: Export to CSV for architecture docs
- **Pattern Recognition**: Identify transformation patterns across systems
- **Governance**: Audit PII handling and encryption practices

### For Data Stewards

- **Compliance**: Verify data quality rules are applied
- **Lineage Audit**: Trace data from source to gold
- **Change Management**: Track field-level changes

---

## 🔮 FUTURE ENHANCEMENTS

### Phase 2

1. **Column Sorting**: Click headers to sort by any column
2. **Column Filters**: Filter individual columns (e.g., show only ENCRYPTION transformations)
3. **Row Expansion**: Click row to see full transformation SQL
4. **Copy Row**: Copy individual row as formatted text
5. **Excel Export**: Direct export to .xlsx with formatting

### Phase 3

1. **Column Visibility**: Toggle columns on/off
2. **Save Views**: Save custom filter combinations
3. **Bulk Edit**: Edit multiple mappings at once (with approval workflow)
4. **Compare Versions**: See changes over time
5. **Print Layout**: Optimized print view

---

## ✅ COMPLETION CHECKLIST

- ✅ Added "Mapping Table" view mode
- ✅ Created 11-column table structure
- ✅ Implemented color-coded cells (amber/blue/green)
- ✅ Added two-row header with grouped columns
- ✅ Integrated search functionality
- ✅ Integrated all filter types
- ✅ Added summary statistics panel
- ✅ Added layer legend
- ✅ Implemented CSV export (16 columns)
- ✅ Added responsive horizontal scrolling
- ✅ Added no results state
- ✅ Updated export button text dynamically
- ✅ Tested with all 9 existing mappings

---

**Implementation Date**: 2025-01-15  
**Version**: 2.1  
**Status**: ✅ TABLE VIEW COMPLETE  
**Component**: `client/components/SourceToTargetMapping.tsx`
