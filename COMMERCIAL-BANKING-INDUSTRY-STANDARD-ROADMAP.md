# COMMERCIAL BANKING - INDUSTRY STANDARD & PLUG-AND-PLAY ROADMAP

**Objective**: Make Commercial Banking data model truly industry-standard and plug-and-play for all domains  
**Pattern Established**: Customer-Commercial (✅ Complete)  
**Date**: 2025-01-10

---

## 🎯 VISION

Create a **production-ready, enterprise-grade** Commercial Banking data model that:

1. **Plug-and-Play**: Can be deployed immediately with minimal customization
2. **Industry Standard**: Follows banking best practices (Basel III, IFRS 9, GAAP, NACHA, SWIFT)
3. **Complete Specifications**: Every table has full column-level details, data types, constraints
4. **Self-Documenting**: Embedded metadata, business rules, and transformation logic
5. **Reference Implementation**: Serves as template for other banks

---

## 📋 STEP-BY-STEP IMPLEMENTATION PLAN

### ✅ PHASE 1: FOUNDATION (COMPLETE)

**What We Built**:
- **Customer-Commercial** domain with full Bronze/Silver/Gold specifications
- **TableSchemaViewer** component for displaying comprehensive table schemas
- **"Tables" tab** in domain detail page showing all layer specifications
- **FIS ACH Tracker** integration with complete data model

**Files Created**:
```
client/lib/commercial/
  ├── customer-commercial-bronze-layer.ts   ✅ 20 tables with full schemas
  ├── customer-commercial-silver-layer.ts   ✅ 15 tables with transformations
  ├── customer-commercial-gold-layer.ts     ✅ 10 dimensions + 6 facts
  └── fis-ach-tracker-comprehensive.ts      ✅ 5 bronze + 3 silver + 4 dims + 3 facts

client/components/
  └── TableSchemaViewer.tsx                 ✅ Reusable table schema display component
```

**Pattern Established** ✅:
Each layer file contains:
- Full table schemas with column-level detail
- Data types, nullability, defaults
- Primary keys, foreign keys
- Comments/descriptions for every column
- Source systems, grain, SCD types
- Transformations and business rules
- Data quality rules
- Indexes and partitioning strategies

---

### 🔄 PHASE 2: REPLICATE PATTERN TO ALL COMMERCIAL DOMAINS

Apply the Customer-Commercial pattern to remaining domains:

#### Domain 2: **Deposits-Commercial**

**Files to Create**:
```
client/lib/commercial/
  ├── deposits-commercial-bronze-layer.ts    (22 tables)
  ├── deposits-commercial-silver-layer.ts    (16 tables)
  └── deposits-commercial-gold-layer.ts      (12 dims + 8 facts)
```

**Key Tables**:

**Bronze Layer** (22 tables):
1. `bronze.commercial_deposit_accounts` - Account master
2. `bronze.commercial_account_balances` - Daily balances
3. `bronze.commercial_account_transactions` - Transaction details
4. `bronze.commercial_interest_accruals` - Interest calculations
5. `bronze.commercial_fee_assessments` - Fee charges
6. `bronze.commercial_account_holds` - Holds and freezes
7. `bronze.commercial_account_overdrafts` - Overdraft occurrences
8. `bronze.commercial_sweep_agreements` - Sweep account linkage
9. `bronze.commercial_escrow_accounts` - Escrow management
10. `bronze.commercial_trust_accounts` - Trust accounting
11. `bronze.commercial_cash_management_services` - Cash mgmt features
12. `bronze.commercial_check_images` - Check image metadata
13. `bronze.commercial_ach_origination` - ACH origination details
14. `bronze.commercial_wire_transfers` - Wire transfer log
15. `bronze.commercial_lockbox_receipts` - Lockbox processing
16. `bronze.commercial_positive_pay_items` - Positive pay exception items
17. `bronze.commercial_account_analysis_statements` - Account analysis
18. `bronze.commercial_earnings_credit_rates` - ECR details
19. `bronze.commercial_rdc_deposits` - Remote deposit capture
20. `bronze.commercial_controlled_disbursement` - Controlled disbursement
21. `bronze.commercial_zero_balance_accounts` - ZBA relationships
22. `bronze.commercial_concentration_accounts` - Concentration accounts

**Silver Layer** (16 tables):
1. `silver.commercial_deposit_accounts_golden_record` - MDM deposit accounts
2. `silver.commercial_daily_balances_agg` - Daily balance aggregations
3. `silver.commercial_transaction_enriched` - Enriched transactions
4. `silver.commercial_interest_summary` - Interest summaries
5. `silver.commercial_fee_summary` - Fee aggregations
6. `silver.commercial_account_profitability` - Profitability calc
7. `silver.commercial_cash_position_forecast` - Cash forecasting
8. `silver.commercial_treasury_analytics` - Treasury metrics
9. `silver.commercial_fraud_detection_scores` - Fraud scores
10. `silver.commercial_regulatory_reporting_extracts` - Reg reporting
... (6 more)

**Gold Layer** (12 dimensions + 8 facts):

**Dimensions**:
- `gold.dim_deposit_account` (SCD Type 2)
- `gold.dim_account_type` (checking, savings, money market, etc.)
- `gold.dim_treasury_service` (ACH, wire, lockbox, etc.)
- `gold.dim_fee_type` (maintenance, transaction, analysis fees)
- `gold.dim_interest_rate_tier`
- `gold.dim_account_analysis_code`
... (6 more)

**Facts**:
- `gold.fact_deposit_balances` (Daily snapshot)
- `gold.fact_deposit_transactions` (Transaction grain)
- `gold.fact_deposit_profitability` (Monthly snapshot)
- `gold.fact_treasury_service_usage` (Service activity)
- `gold.fact_account_analysis` (Monthly analysis statements)
... (3 more)

---

#### Domain 3: **Loans-Commercial**

**Files to Create**:
```
client/lib/commercial/
  ├── loans-commercial-bronze-layer.ts    (25 tables)
  ├── loans-commercial-silver-layer.ts    (18 tables)
  └── loans-commercial-gold-layer.ts      (14 dims + 10 facts)
```

**Key Tables**:

**Bronze Layer** (25 tables):
1. `bronze.commercial_loan_master` - Loan account master
2. `bronze.commercial_loan_applications` - Application tracking
3. `bronze.commercial_loan_commitments` - Commitment agreements
4. `bronze.commercial_loan_draws` - Draw schedule & disbursements
5. `bronze.commercial_loan_payments` - Payment transactions
6. `bronze.commercial_loan_amortization_schedule` - Amortization
7. `bronze.commercial_loan_interest_accruals` - Interest accrual
8. `bronze.commercial_loan_fees` - Origination & servicing fees
9. `bronze.commercial_loan_collateral` - Collateral assets
10. `bronze.commercial_loan_guarantors` - Personal guarantees
11. `bronze.commercial_loan_covenants` - Financial covenants
12. `bronze.commercial_loan_covenant_compliance` - Covenant testing
13. `bronze.commercial_loan_risk_ratings` - Risk rating history
14. `bronze.commercial_loan_classification` - Regulatory classification
15. `bronze.commercial_loan_impairment` - CECL/IFRS 9 impairment
16. `bronze.commercial_loan_modifications` - Loan modifications
17. `bronze.commercial_loan_participations` - Loan participation details
18. `bronze.commercial_loan_syndications` - Syndicated loan data
19. `bronze.commercial_loan_letters_of_credit` - LC details
20. `bronze.commercial_loan_construction_draws` - Construction loan draws
21. `bronze.commercial_loan_real_estate_appraisals` - CRE appraisals
22. `bronze.commercial_loan_environmental_assessments` - Phase I/II
23. `bronze.commercial_loan_sba_details` - SBA 7(a) and 504 details
24. `bronze.commercial_loan_credit_memos` - Credit approval memos
25. `bronze.commercial_loan_servicing_rights` - MSR details

**Silver Layer** (18 tables):
1. `silver.commercial_loan_golden_record` - MDM loan accounts
2. `silver.commercial_loan_balances_agg` - Daily balance aggregations
3. `silver.commercial_loan_payment_performance` - Payment analytics
4. `silver.commercial_credit_exposure_agg` - Credit exposure rollups
5. `silver.commercial_allowance_for_credit_losses` - CECL/ACL
6. `silver.commercial_collateral_coverage_analysis` - LTV analysis
7. `silver.commercial_covenant_breach_analysis` - Covenant monitoring
8. `silver.commercial_loan_profitability` - Loan-level profitability
9. `silver.commercial_concentration_analysis` - Portfolio concentration
10. `silver.commercial_vintage_analysis` - Cohort analysis
... (8 more)

**Gold Layer** (14 dimensions + 10 facts):

**Dimensions**:
- `gold.dim_loan_account` (SCD Type 2)
- `gold.dim_loan_type` (term, revolving, LOC, construction, etc.)
- `gold.dim_collateral_type` (real estate, equipment, receivables, etc.)
- `gold.dim_loan_purpose` (working capital, acquisition, expansion, etc.)
- `gold.dim_risk_rating` (1-10 scale)
- `gold.dim_regulatory_classification` (pass, watch, substandard, etc.)
- `gold.dim_covenant_type` (debt-to-equity, DSCR, etc.)
... (7 more)

**Facts**:
- `gold.fact_loan_balances` (Daily snapshot)
- `gold.fact_loan_originations` (Transaction grain)
- `gold.fact_loan_payments` (Transaction grain)
- `gold.fact_loan_profitability` (Monthly snapshot)
- `gold.fact_credit_losses` (Monthly CECL calculations)
- `gold.fact_collateral_valuations` (Periodic valuations)
- `gold.fact_covenant_compliance` (Monthly testing)
... (3 more)

---

#### Domain 4: **Payments-Commercial** (Already enhanced with FIS ACH Tracker ✅)

**Status**: Bronze (25), Silver (18), Gold (14 dims + 9 facts)

**Next Steps**:
- Create detailed Bronze/Silver/Gold layer files like Customer-Commercial
- Document all 25 bronze tables with full schemas
- Complete silver transformations
- Finalize gold dimensional model

---

#### Domain 5: **Treasury-Commercial**

**Files to Create**:
```
client/lib/commercial/
  ├── treasury-commercial-bronze-layer.ts    (18 tables)
  ├── treasury-commercial-silver-layer.ts    (14 tables)
  └── treasury-commercial-gold-layer.ts      (10 dims + 7 facts)
```

**Key Tables**:
- FX trading, hedging, derivatives
- Liquidity management
- Interest rate risk management
- Investment portfolios
- Debt issuance

---

#### Domains 6-12: Additional Commercial Banking Domains

Following the same pattern for:
- **Trade Finance** (LC, trade credit, SWIFT messaging)
- **Merchant Services** (card acquiring, POS, settlements)
- **Commercial Cards** (purchasing cards, travel cards, fleet cards)
- **Cash Management** (lockbox, controlled disbursement, fraud detection)
- **Capital Markets** (underwriting, syndications, structured products)
- **Foreign Exchange** (spot, forward, options, hedging)
- **Custody Services** (safekeeping, corporate actions, settlement)

---

## 🏗️ TECHNICAL ARCHITECTURE

### Data Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                    GOLD LAYER                          │
│  Dimensional Model (Kimball Methodology)               │
│  • Star/Snowflake schemas                             │
│  • Type 2 SCDs for history tracking                   │
│  • Conformed dimensions across domains                │
│  • Pre-aggregated facts for performance               │
└──────────────────────────────��──────────────────────────┘
                        ↑
                        │ Dimensional Modeling
                        │
┌─────────────────────────────────────────────────────────┐
│                   SILVER LAYER                         │
│  Cleansed, Conformed, Enriched                        │
│  • Deduplicated golden records (MDM)                  │
│  • Business rule applications                         │
│  • Data quality validations                           │
│  • Third-party enrichments (D&B, Experian)           │
│  • Cross-domain joins and aggregations                │
└─────────────────────────────────────────────────────────┘
                        ↑
                        │ Cleansing, Enrichment
                        │
┌─────────────────────────────────────────────────────────┐
│                   BRONZE LAYER                         │
│  Raw Data Landing Zone (Immutable)                    │
│  • 1:1 copy from source systems                       │
│  • CDC or batch ingestion                             │
│  • No transformations                                  │
│  • Full audit trail                                    │
│  • SCD Type 2 for historical snapshots                │
└─────────────────────────────────────────────────────────┘
                        ↑
                        │ Data Ingestion
                        │
┌─────────────────────────────────────────────────────────┐
│                 SOURCE SYSTEMS                         │
│  • Core Banking (FIS, Jack Henry, Temenos)           │
│  • Loan Origination (nCino, Salesforce)              │
│  • Treasury (Kyriba, Reval)                          │
│  • Payments (FIS ACH Tracker, SWIFT)                 │
│  • CRM (Salesforce Commercial Cloud)                 │
│  • Credit Bureau (D&B, Experian, Equifax)            │
└────────────��────────────────────────────────────────────┘
```

### Schema Pattern for Every Table

```typescript
{
  name: 'layer.schema.table_name',
  description: 'Business purpose of table',
  sourceSystem: 'SYSTEM_NAME',        // Bronze only
  sourceTable: 'SOURCE_TABLE_NAME',   // Bronze only
  loadType: 'CDC|BATCH|STREAMING',    // Bronze only
  
  grain: 'One row per [business entity]',
  primaryKey: ['column1', 'column2'],
  foreignKeys: ['fk_column1', 'fk_column2'],
  
  scdType: 'SCD_TYPE_1|SCD_TYPE_2',   // Silver/Gold
  factType: 'TRANSACTION|PERIODIC_SNAPSHOT|ACCUMULATING_SNAPSHOT', // Gold facts
  dimensionType: 'SCD_TYPE_1|SCD_TYPE_2', // Gold dimensions
  
  transformations: [                   // Silver/Gold
    'Business rule 1',
    'Enrichment logic',
    'Aggregation spec',
  ],
  
  dataQualityRules: [                 // Silver
    'Validation rule 1',
    'Completeness check',
  ],
  
  schema: {
    column_name: "DATA_TYPE CONSTRAINTS COMMENT 'Business definition'",
    // Full column spec for every column
  },
  
  indexes: [                          // Gold
    "CREATE INDEX idx_... ON table(...)",
  ],
  
  partitioning: "PARTITION BY ...",  // Gold
}
```

---

## �� DATA QUALITY & GOVERNANCE

### Naming Conventions

**Tables**:
- Bronze: `bronze.[domain]_[entity]` (e.g., `bronze.commercial_loan_master`)
- Silver: `silver.[domain]_[entity]_[type]` (e.g., `silver.commercial_loan_golden_record`)
- Gold Dims: `gold.dim_[entity]` (e.g., `gold.dim_loan_account`)
- Gold Facts: `gold.fact_[business_process]` (e.g., `gold.fact_loan_originations`)

**Columns**:
- Snake_case: `customer_since_date`
- Prefixes: `is_` (boolean), `pct_` (percentage), `amt_` (amount)
- Suffixes: `_id` (identifiers), `_flag` (boolean), `_date`, `_timestamp`

**Data Types**:
- Use standard SQL types: `BIGINT`, `STRING`, `DECIMAL(18,2)`, `DATE`, `TIMESTAMP`, `BOOLEAN`
- Encrypt PII/PCI: `STRING COMMENT 'Encrypted SSN'`
- Always include precision for decimals: `DECIMAL(18,2)` not `DECIMAL`

### Metadata Standards

Every column must have:
1. **Data Type**: Explicit with precision (DECIMAL(18,2))
2. **Nullability**: NOT NULL or nullable (default)
3. **Comment**: Business definition
4. **Constraints**: PRIMARY KEY, UNIQUE, DEFAULT
5. **Foreign Key Reference**: COMMENT 'FK to dim_customer'

### SCD Type 2 Standard Fields

All Type 2 tables must include:
```sql
effective_start_date TIMESTAMP NOT NULL
effective_end_date TIMESTAMP           -- NULL = current
is_current BOOLEAN NOT NULL DEFAULT TRUE
row_hash STRING                        -- Change detection
created_timestamp TIMESTAMP NOT NULL
updated_timestamp TIMESTAMP NOT NULL
etl_batch_id BIGINT
```

---

## 🎨 UI/UX SPECIFICATIONS

### Tables Tab Display

Each domain's "Tables" tab shows:

1. **Summary Cards**: Bronze/Silver/Gold/Fact counts
2. **Layer Sections**: Expandable sections for each layer
3. **Table Accordions**: Collapsible table details
4. **Column Grid**: Sortable, filterable column list
5. **Metadata Panel**: Grain, source, SCD type, transformations
6. **Index/Partition Specs**: Performance optimization details

**Color Coding**:
- Bronze: Amber/Orange (`bg-amber-50`, `text-amber-600`)
- Silver: Blue (`bg-blue-50`, `text-blue-600`)
- Gold Dims: Yellow (`bg-yellow-50`, `text-yellow-600`)
- Gold Facts: Purple (`bg-purple-50`, `text-purple-600`)

---

## 🚀 ROLLOUT PLAN

### Week 1-2: Deposits-Commercial
- Create bronze-layer.ts (22 tables)
- Create silver-layer.ts (16 tables)
- Create gold-layer.ts (12 dims + 8 facts)
- Test UI rendering
- Document use cases

### Week 3-4: Loans-Commercial
- Create bronze-layer.ts (25 tables)
- Create silver-layer.ts (18 tables)
- Create gold-layer.ts (14 dims + 10 facts)
- Integrate CECL/IFRS 9 models
- Document regulatory requirements

### Week 5-6: Treasury & Trade Finance
- Treasury bronze/silver/gold layers
- Trade Finance bronze/silver/gold layers
- SWIFT message parsing specs
- FX hedging analytics

### Week 7-8: Remaining Domains
- Merchant Services
- Commercial Cards
- Cash Management
- Capital Markets
- Foreign Exchange
- Custody Services

### Week 9-10: Integration & Testing
- Cross-domain conformed dimensions
- End-to-end data lineage
- Performance optimization
- Documentation completion

---

## 📈 SUCCESS METRICS

**Completeness**:
- ✅ 100% of commercial domains have full table specs
- ✅ Every table has complete schema with all columns documented
- ✅ All SCD Type 2 history tracking implemented
- ✅ All dimensional relationships documented

**Usability**:
- ✅ Plug-and-play: Can deploy to new bank in <30 days
- ✅ Self-documenting: No external documentation needed
- ✅ Industry-standard: Aligns with banking best practices
- ✅ Future-proof: Supports regulatory changes (CECL, Basel IV)

**Quality**:
- ✅ 100% data quality rules defined
- ✅ All transformations documented
- ✅ All indexes and partitioning optimized
- ✅ All foreign key relationships defined

---

## 📚 REFERENCE STANDARDS

### Banking Standards
- **Basel III/IV**: Capital adequacy, risk-weighted assets
- **IFRS 9**: Expected credit loss (ECL) model
- **CECL**: Current Expected Credit Losses (US GAAP)
- **Reg CC**: Availability of funds and collection of checks
- **Reg E**: Electronic fund transfers
- **Reg Z**: Truth in Lending Act
- **NACHA**: ACH network rules
- **SWIFT**: ISO 20022 messaging standards
- **ISO 8583**: Card payment messaging

### Data Standards
- **ISO 17442**: Legal Entity Identifier (LEI)
- **ISO 4217**: Currency codes
- **ISO 3166**: Country codes
- **ISO 8601**: Date and time formats
- **NAICS**: Industry classification
- **GLEIF**: Global LEI system

---

## 🎯 NEXT IMMEDIATE ACTIONS

1. ✅ **Customer-Commercial** - COMPLETE (Bronze 20, Silver 15, Gold 10+6)
2. ✅ **FIS ACH Tracker** - COMPLETE (Bronze 5, Silver 3, Gold 4+3)
3. 🔄 **Deposits-Commercial** - START HERE
   - Create `deposits-commercial-bronze-layer.ts` (22 tables)
   - Create `deposits-commercial-silver-layer.ts` (16 tables)
   - Create `deposits-commercial-gold-layer.ts` (12+8)
4. 🔄 **Loans-Commercial** - NEXT
5. 🔄 **Treasury-Commercial** - FOLLOWING

**Deliverable**: Industry-leading Commercial Banking data model that serves as reference implementation for the banking industry.

---

**Document Owner**: Data Architecture Team  
**Last Updated**: 2025-01-10  
**Status**: Phase 1 Complete, Phase 2 In Progress
