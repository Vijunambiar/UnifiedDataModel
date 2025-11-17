# Cross-Area Data Sharing Patterns

## Enterprise Banking Data Architecture

---

## 📋 Overview

**Purpose:** Define patterns and standards for sharing data across banking areas while maintaining data governance, lineage, and consistency.

**Scope:**
- Shared (conformed) dimensions
- Cross-area entity linkage
- Master data management (MDM)
- Data governance and ownership
- Integration patterns

---

## 🔄 Shared Entities (Conformed Dimensions)

### 1. Universal Customer Dimension

**Challenge:** Same customer appears across multiple areas (retail, commercial, wealth)

**Solution:** Create universal customer dimension with area-specific views

```typescript
// Gold Layer - Universal Customer
export const universalCustomerDimension = {
  name: 'gold.dim_customer_universal',
  description: 'Master customer dimension shared across all banking areas',
  conformedDimension: true,
  
  schema: {
    customer_key: "BIGINT PRIMARY KEY COMMENT 'Universal customer key'",
    customer_id: "BIGINT UNIQUE COMMENT 'Global customer ID'",
    customer_uuid: "STRING UNIQUE COMMENT 'UUID (RFC 4122)'",
    
    // Core attributes (common across all areas)
    customer_type: "STRING COMMENT 'Individual|Joint|Business|Trust|Estate'",
    customer_name: "STRING COMMENT 'Full name or business name'",
    tax_id_encrypted: "STRING COMMENT 'SSN/EIN (encrypted)'",
    
    // Area participation flags
    is_retail_customer: "BOOLEAN",
    is_commercial_customer: "BOOLEAN",
    is_wealth_customer: "BOOLEAN",
    has_mortgage: "BOOLEAN",
    is_cib_client: "BOOLEAN",
    
    // Relationship metadata
    customer_since_date: "DATE COMMENT 'First relationship date across all areas'",
    primary_banking_area: "STRING COMMENT 'Main area of relationship'",
    total_areas: "INTEGER COMMENT 'Number of areas with active relationship'",
    
    // Master data quality
    mdm_golden_record: "BOOLEAN COMMENT 'True if this is the MDM golden record'",
    source_system_of_record: "STRING",
    data_quality_score: "DECIMAL(5,2)",
    
    // Audit
    created_date: "DATE",
    updated_date: "DATE",
  },
  
  sourceTables: [
    'silver.retail_customer_master_golden',
    'silver.commercial_customer_master_golden',
    'silver.wealth_client_master_golden',
  ],
  
  mdmLogic: {
    matchingAlgorithm: 'Probabilistic matching on name, DOB, SSN/EIN, address',
    survivorshipRules: [
      { attribute: 'customer_name', priority: ['Wealth', 'Commercial', 'Retail'] },
      { attribute: 'tax_id', priority: ['Commercial', 'Retail', 'Wealth'] },
      { attribute: 'address', rule: 'Most recent update' },
    ],
  },
};

// Area-Specific Views
export const retailCustomerView = {
  name: 'gold.dim_retail_customer',
  description: 'Retail-specific customer view with retail attributes',
  baseTable: 'gold.dim_customer_universal',
  
  sql: `
    CREATE VIEW gold.dim_retail_customer AS
    SELECT
      c.*,
      r.fico_score,
      r.annual_income,
      r.employment_status,
      r.customer_segment,
      r.lifecycle_stage
    FROM
      gold.dim_customer_universal c
      JOIN gold.dim_customer_retail_attributes r ON c.customer_key = r.customer_key
    WHERE
      c.is_retail_customer = TRUE
  `,
};

export const commercialCustomerView = {
  name: 'gold.dim_commercial_customer',
  description: 'Commercial-specific customer view',
  baseTable: 'gold.dim_customer_universal',
  
  sql: `
    CREATE VIEW gold.dim_commercial_customer AS
    SELECT
      c.*,
      b.business_type,
      b.naics_code,
      b.annual_revenue,
      b.employee_count,
      b.duns_number
    FROM
      gold.dim_customer_universal c
      JOIN gold.dim_customer_commercial_attributes b ON c.customer_key = b.customer_key
    WHERE
      c.is_commercial_customer = TRUE
  `,
};
```

### 2. Customer Area Linkage Table

**Purpose:** Track which areas each customer participates in and relationship types

```typescript
export const customerAreaLinkage = {
  name: 'gold.customer_area_linkage',
  description: 'Links customers to banking areas with relationship metadata',
  
  schema: {
    linkage_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
    customer_key: "BIGINT COMMENT 'FK to dim_customer_universal'",
    banking_area: "STRING COMMENT 'retail|commercial|wealth|mortgage|corporate'",
    
    relationship_type: "STRING COMMENT 'Primary|Secondary|Cross-sell|Referral'",
    is_primary_area: "BOOLEAN COMMENT 'Primary banking relationship'",
    
    relationship_start_date: "DATE",
    relationship_end_date: "DATE",
    relationship_status: "STRING COMMENT 'Active|Inactive|Dormant|Closed'",
    
    // Financial metrics
    total_products: "INTEGER COMMENT 'Product count in this area'",
    total_accounts: "INTEGER COMMENT 'Account count in this area'",
    total_balance: "DECIMAL(18,2)",
    lifetime_revenue: "DECIMAL(18,2)",
    
    // Engagement
    last_transaction_date: "DATE",
    last_contact_date: "DATE",
    
    // Source
    acquisition_channel: "STRING COMMENT 'Branch|Online|Referral|Cross-sell'",
    originating_area: "STRING COMMENT 'Which area acquired customer'",
    
    // Audit
    created_timestamp: "TIMESTAMP",
    updated_timestamp: "TIMESTAMP",
  },
  
  indexes: [
    { name: 'idx_customer_area', columns: ['customer_key', 'banking_area'] },
    { name: 'idx_primary_area', columns: ['customer_key', 'is_primary_area'] },
  ],
};
```

### 3. Universal Product Dimension

**Challenge:** Products exist across multiple areas (e.g., checking account in retail and commercial)

**Solution:** Universal product catalog with area-specific hierarchies

```typescript
export const universalProductDimension = {
  name: 'gold.dim_product_universal',
  description: 'Master product catalog across all banking areas',
  conformedDimension: true,
  
  schema: {
    product_key: "BIGINT PRIMARY KEY",
    product_id: "STRING UNIQUE",
    product_code: "STRING UNIQUE",
    product_name: "STRING",
    product_description: "STRING",
    
    // Product hierarchy (universal)
    product_area: "STRING COMMENT 'retail|commercial|wealth|mortgage|corporate'",
    product_category: "STRING COMMENT 'Deposits|Loans|Cards|Investments|Services'",
    product_type: "STRING COMMENT 'Checking|Savings|Credit Card|Mortgage'",
    product_subtype: "STRING COMMENT 'Basic Checking|Premium Checking'",
    
    // Characteristics
    is_deposit_product: "BOOLEAN",
    is_lending_product: "BOOLEAN",
    is_investment_product: "BOOLEAN",
    is_service_product: "BOOLEAN",
    
    // Regulatory classification
    call_report_code: "STRING COMMENT 'FFIEC call report classification'",
    basel_risk_weight: "DECIMAL(5,2)",
    
    // Lifecycle
    product_status: "STRING COMMENT 'Active|Discontinued|Sunset'",
    effective_date: "DATE",
    discontinue_date: "DATE",
    
    // Profitability
    standard_fee: "DECIMAL(18,2)",
    standard_rate: "DECIMAL(10,6)",
    target_margin: "DECIMAL(10,6)",
  },
  
  hierarchies: [
    {
      name: 'Product Hierarchy',
      levels: [
        { level: 1, attribute: 'product_area', description: 'Banking Area' },
        { level: 2, attribute: 'product_category', description: 'Category' },
        { level: 3, attribute: 'product_type', description: 'Type' },
        { level: 4, attribute: 'product_subtype', description: 'Subtype' },
      ],
    },
  ],
};
```

### 4. Universal Branch/Location Dimension

```typescript
export const universalBranchDimension = {
  name: 'gold.dim_branch_universal',
  description: 'Branch and location dimension (retail + commercial)',
  conformedDimension: true,
  
  schema: {
    branch_key: "BIGINT PRIMARY KEY",
    branch_id: "STRING UNIQUE",
    branch_code: "STRING UNIQUE COMMENT 'Human-readable branch code'",
    branch_name: "STRING",
    
    // Location
    address_line1: "STRING",
    city: "STRING",
    state: "STRING",
    postal_code: "STRING",
    country_code: "STRING",
    latitude: "DECIMAL(10,6)",
    longitude: "DECIMAL(10,6)",
    
    // Branch characteristics
    branch_type: "STRING COMMENT 'Full Service|Limited Service|Commercial Only|Wealth Center'",
    is_retail_branch: "BOOLEAN",
    is_commercial_branch: "BOOLEAN",
    is_wealth_center: "BOOLEAN",
    
    // Areas served
    serves_retail: "BOOLEAN",
    serves_commercial: "BOOLEAN",
    serves_wealth: "BOOLEAN",
    
    // Operational
    branch_status: "STRING COMMENT 'Open|Closed|Temporarily Closed'",
    open_date: "DATE",
    close_date: "DATE",
    
    // Region hierarchy
    region: "STRING",
    district: "STRING",
    market: "STRING",
  },
};
```

### 5. Universal Date Dimension

```typescript
export const universalDateDimension = {
  name: 'gold.dim_date',
  description: 'Universal date dimension with banking calendar',
  conformedDimension: true,
  
  schema: {
    date_key: "INTEGER PRIMARY KEY COMMENT 'YYYYMMDD format'",
    full_date: "DATE UNIQUE",
    
    // Calendar components
    year: "INTEGER",
    quarter: "INTEGER",
    month: "INTEGER",
    week: "INTEGER",
    day_of_month: "INTEGER",
    day_of_week: "INTEGER",
    day_of_year: "INTEGER",
    
    // Fiscal calendar
    fiscal_year: "INTEGER",
    fiscal_quarter: "INTEGER",
    fiscal_month: "INTEGER",
    fiscal_week: "INTEGER",
    
    // Banking calendar
    is_business_day: "BOOLEAN COMMENT 'Banking business day'",
    is_weekend: "BOOLEAN",
    is_holiday: "BOOLEAN",
    holiday_name: "STRING",
    is_month_end: "BOOLEAN",
    is_quarter_end: "BOOLEAN",
    is_year_end: "BOOLEAN",
    
    // Banking-specific
    business_day_of_month: "INTEGER COMMENT 'Nth business day of month'",
    business_days_remaining_in_month: "INTEGER",
    last_business_day_of_month: "DATE",
    next_business_day: "DATE",
    prior_business_day: "DATE",
    
    // Settlement cycles
    settlement_date_t1: "DATE COMMENT 'T+1 settlement'",
    settlement_date_t2: "DATE COMMENT 'T+2 settlement'",
    settlement_date_t3: "DATE COMMENT 'T+3 settlement'",
  },
  
  dataPopulation: {
    startDate: '2020-01-01',
    endDate: '2030-12-31',
    bankingHolidays: [
      'New Years Day',
      'Martin Luther King Jr Day',
      'Presidents Day',
      'Memorial Day',
      'Independence Day',
      'Labor Day',
      'Thanksgiving',
      'Christmas',
    ],
  },
};
```

---

## 🔗 Cross-Area Integration Patterns

### Pattern 1: Retail → Commercial Transition

**Scenario:** Retail customer starts a small business and needs commercial banking

```typescript
export const retailToCommercialTransition = {
  trigger: 'Customer opens first business account',
  
  dataFlow: [
    {
      step: 1,
      action: 'Create commercial customer record',
      source: 'silver.retail_customer_master_golden',
      target: 'silver.commercial_customer_master_golden',
      mapping: {
        customer_id: 'customer_id (same)',
        first_name: 'owner_first_name',
        last_name: 'owner_last_name',
        ssn: 'owner_ssn',
        address: 'business_mailing_address',
      },
    },
    {
      step: 2,
      action: 'Update universal customer dimension',
      target: 'gold.dim_customer_universal',
      updates: {
        is_commercial_customer: true,
        total_areas: 'total_areas + 1',
      },
    },
    {
      step: 3,
      action: 'Create area linkage',
      target: 'gold.customer_area_linkage',
      data: {
        customer_key: 'universal_customer_key',
        banking_area: 'commercial',
        relationship_type: 'Cross-sell',
        is_primary_area: false,
        acquisition_channel: 'Cross-sell',
        originating_area: 'retail',
      },
    },
  ],
  
  businessRules: [
    'Preserve retail customer relationship (do not close)',
    'Link commercial and retail profiles in CRM',
    'Trigger commercial onboarding workflow',
    'Assign relationship manager (commercial)',
    'Cross-sell commercial products (treasury, merchant services)',
  ],
};
```

### Pattern 2: Retail → Wealth Graduation

**Scenario:** Mass affluent retail customer graduates to wealth management

```typescript
export const retailToWealthGraduation = {
  trigger: 'Customer reaches wealth threshold (e.g., $500K+ investable assets)',
  
  thresholds: {
    totalAssets: 500000,
    annualIncome: 200000,
    liquidAssets: 250000,
  },
  
  dataFlow: [
    {
      step: 1,
      action: 'Create wealth client record',
      source: 'silver.retail_customer_master_golden',
      target: 'silver.wealth_client_master_golden',
      mapping: {
        customer_id: 'customer_id',
        all_demographic_fields: 'copy',
        fico_score: 'credit_score',
      },
    },
    {
      step: 2,
      action: 'Create wealth investment account',
      target: 'silver.wealth_investment_account',
      initialFunding: 'Transfer from retail brokerage account',
    },
    {
      step: 3,
      action: 'Update customer area linkage',
      target: 'gold.customer_area_linkage',
      newLinkage: {
        banking_area: 'wealth',
        relationship_type: 'Graduation',
        is_primary_area: true, // Wealth becomes primary
      },
    },
  ],
  
  businessRules: [
    'Maintain retail deposit accounts (checking, savings)',
    'Transfer brokerage account to wealth management',
    'Assign wealth advisor',
    'Create financial plan',
    'Schedule welcome meeting',
  ],
};
```

### Pattern 3: Household Consolidation

**Scenario:** Multiple retail customers in same household, need consolidated view

```typescript
export const householdConsolidation = {
  name: 'gold.dim_household',
  description: 'Household dimension linking related customers',
  
  schema: {
    household_key: "BIGINT PRIMARY KEY",
    household_id: "BIGINT UNIQUE",
    household_name: "STRING COMMENT 'Primary member last name + household'",
    
    // Household composition
    total_members: "INTEGER",
    adult_members: "INTEGER",
    minor_members: "INTEGER",
    
    // Primary contact
    primary_customer_key: "BIGINT COMMENT 'FK to dim_customer_universal'",
    primary_contact_name: "STRING",
    
    // Household address
    household_address: "STRING",
    household_city: "STRING",
    household_state: "STRING",
    household_postal_code: "STRING",
    
    // Household financials (aggregated)
    total_household_income: "DECIMAL(18,2)",
    total_household_assets: "DECIMAL(18,2)",
    total_household_liabilities: "DECIMAL(18,2)",
    household_net_worth: "DECIMAL(18,2)",
    
    // Household products
    total_accounts: "INTEGER",
    total_products: "INTEGER",
    
    // Household segment
    household_segment: "STRING COMMENT 'Mass|Mass Affluent|Affluent|Private'",
    household_lifecycle_stage: "STRING",
  },
  
  linkageTable: {
    name: 'gold.household_member_linkage',
    schema: {
      household_key: "BIGINT",
      customer_key: "BIGINT",
      relationship_to_primary: "STRING COMMENT 'Self|Spouse|Child|Parent|Other'",
      is_primary_member: "BOOLEAN",
      member_since_date: "DATE",
    },
  },
};
```

---

## 🏛️ Master Data Management (MDM) Strategy

### MDM Governance

**Data Stewardship:**

| Entity | Steward | Backup Steward | Governance Frequency |
|--------|---------|----------------|---------------------|
| Customer | Chief Data Officer | Retail/Commercial Heads | Monthly |
| Product | Product Management | Area Product Leads | Quarterly |
| Branch | Operations | Area Operations Leads | Monthly |
| Household | Retail Banking | Wealth Management | Quarterly |

**Data Quality Rules:**

```typescript
export const mdmDataQualityRules = {
  customer: {
    goldenRecordCriteria: [
      'Must have valid tax ID (SSN/EIN)',
      'Must have valid address',
      'Must have at least one active account',
      'Data quality score >= 90',
    ],
    
    matchingRules: [
      {
        level: 'Exact Match',
        criteria: 'SSN/EIN + DOB + Last Name',
        confidence: 100,
      },
      {
        level: 'High Confidence',
        criteria: 'Fuzzy name match + Address match + Phone match',
        confidence: 95,
      },
      {
        level: 'Medium Confidence',
        criteria: 'Fuzzy name match + Address match',
        confidence: 80,
      },
    ],
    
    survivorshipRules: [
      {
        attribute: 'customer_name',
        rule: 'Most recent non-null value from trusted source',
        trustedSources: ['Wealth', 'Commercial', 'Retail'],
      },
      {
        attribute: 'address',
        rule: 'Most recent update',
      },
      {
        attribute: 'email',
        rule: 'Prefer business email over personal',
      },
    ],
  },
};
```

### MDM Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Gold Layer (Analytics)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        dim_customer_universal (Golden Record)            │   │
│  │  - Single source of truth                                │   │
│  │  - Conformed across all areas                            │   │
│  │  - MDM-enriched                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ MDM Process
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Silver Layer (Golden Records)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Retail       │  │ Commercial   │  │ Wealth       │          │
│  │ Customer     │  │ Customer     │  │ Client       │          │
│  │ Golden       │  │ Golden       │  │ Golden       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Cleansing & Deduplication
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Bronze Layer (Raw Data)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ FIS Core     │  │ Salesforce   │  │ Wealth Mgmt  │          │
│  │ Customer     │  │ CRM          │  │ System       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Cross-Area Analytics Examples

### Enterprise Customer Profitability

```sql
-- Calculate total customer profitability across ALL banking areas
SELECT
  c.customer_key,
  c.customer_name,
  c.customer_type,
  
  -- Area participation
  c.is_retail_customer,
  c.is_commercial_customer,
  c.is_wealth_customer,
  c.total_areas,
  c.primary_banking_area,
  
  -- Revenue by area
  COALESCE(SUM(CASE WHEN f.banking_area = 'retail' THEN f.revenue_amount END), 0) AS retail_revenue,
  COALESCE(SUM(CASE WHEN f.banking_area = 'commercial' THEN f.revenue_amount END), 0) AS commercial_revenue,
  COALESCE(SUM(CASE WHEN f.banking_area = 'wealth' THEN f.revenue_amount END), 0) AS wealth_revenue,
  
  -- Total enterprise metrics
  SUM(f.revenue_amount) AS total_enterprise_revenue,
  SUM(f.cost_amount) AS total_enterprise_cost,
  SUM(f.revenue_amount - f.cost_amount) AS total_enterprise_profit,
  
  -- Cross-sell opportunity score
  CASE
    WHEN c.total_areas = 1 THEN 'High Cross-Sell Opportunity'
    WHEN c.total_areas = 2 THEN 'Medium Cross-Sell Opportunity'
    ELSE 'Saturated'
  END AS cross_sell_opportunity

FROM
  gold.dim_customer_universal c
  LEFT JOIN gold.fact_customer_profitability f ON c.customer_key = f.customer_key
  
GROUP BY
  c.customer_key,
  c.customer_name,
  c.customer_type,
  c.is_retail_customer,
  c.is_commercial_customer,
  c.is_wealth_customer,
  c.total_areas,
  c.primary_banking_area

ORDER BY
  total_enterprise_profit DESC;
```

### Household Total Relationship Value

```sql
-- Aggregate all household members' balances and revenue
SELECT
  h.household_key,
  h.household_name,
  h.total_members,
  h.household_segment,
  
  -- Aggregate balances
  SUM(b.deposit_balance) AS total_household_deposits,
  SUM(b.loan_balance) AS total_household_loans,
  SUM(b.investment_balance) AS total_household_investments,
  
  -- Aggregate revenue
  SUM(r.fee_revenue) AS total_fee_revenue,
  SUM(r.interest_income) AS total_interest_income,
  
  -- Calculate total relationship value
  (SUM(b.deposit_balance) + SUM(b.investment_balance)) AS total_household_assets,
  SUM(r.fee_revenue + r.interest_income) AS total_household_revenue

FROM
  gold.dim_household h
  JOIN gold.household_member_linkage m ON h.household_key = m.household_key
  JOIN gold.fact_customer_balances b ON m.customer_key = b.customer_key
  JOIN gold.fact_customer_revenue r ON m.customer_key = r.customer_key

GROUP BY
  h.household_key,
  h.household_name,
  h.total_members,
  h.household_segment

ORDER BY
  total_household_revenue DESC;
```

---

## ✅ Implementation Checklist

### Phase 1: Conformed Dimensions

- [ ] Create `gold.dim_customer_universal`
- [ ] Create `gold.dim_product_universal`
- [ ] Create `gold.dim_branch_universal`
- [ ] Create `gold.dim_date` (banking calendar)
- [ ] Create `gold.dim_household`

### Phase 2: Linkage Tables

- [ ] Create `gold.customer_area_linkage`
- [ ] Create `gold.household_member_linkage`
- [ ] Create `gold.product_area_mapping`

### Phase 3: MDM Processes

- [ ] Implement customer matching algorithm
- [ ] Implement survivorship rules
- [ ] Create data quality scoring
- [ ] Set up data stewardship workflows

### Phase 4: Integration Patterns

- [ ] Retail → Commercial transition workflow
- [ ] Retail → Wealth graduation workflow
- [ ] Household consolidation process
- [ ] Cross-area referral tracking

### Phase 5: Analytics

- [ ] Enterprise customer profitability reports
- [ ] Household relationship value dashboards
- [ ] Cross-sell opportunity identification
- [ ] Area-to-area migration analytics

---

_Document Version: 1.0_
_Date: 2025-01-08_
_Status: Approved for Phase 0_
